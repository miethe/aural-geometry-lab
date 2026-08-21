#!/usr/bin/env python3
"""Stamp the machine-derived mathematical-correctness verdict onto a critique JSON file.

design/mockups/score-one.sh runs scripts/check-figures.mjs for a plated screen and then calls this
to write the result back into design/mockups/critique/<screen>.json: it overwrites every variant's
rejectAxes["mathematical correctness"] with the machine verdict and records provenance under a
top-level "mathVerdict" key. This is what makes the axis independent of what the model saw -- it no
longer depends on a raster reading, so two runs cannot disagree.

The variant "verdict" field is deliberately left untouched: a variant the model rejected only on the
(now vacated) math axis is NOT silently flipped to accept; the human reads mathVerdict for the truth
of that axis. The write is idempotent -- running it twice over the same file produces byte-identical
output -- because it reloads and re-emits in a single canonical form (indent=2, ensure_ascii=False,
trailing newline, insertion order preserved).

Usage: stamp-math-verdict.py <critique.json> <checker-json-file>
where <checker-json-file> is the `node scripts/check-figures.mjs --screen <id> --json` output.
"""
import json
import sys


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: stamp-math-verdict.py <critique.json> <checker-json-file>", file=sys.stderr)
        return 2

    critique_path, checker_path = sys.argv[1], sys.argv[2]
    with open(checker_path, encoding="utf-8") as handle:
        checker = json.load(handle)

    if not checker.get("plated"):
        # Not a plated screen: keep the by-eye path, stamp nothing.
        return 0

    verdict = checker["mathematicalCorrectness"]
    with open(critique_path, encoding="utf-8") as handle:
        critique = json.load(handle)

    for variant in critique.get("variants", {}).values():
        reject_axes = variant.setdefault("rejectAxes", {})
        reject_axes["mathematical correctness"] = verdict

    critique["mathVerdict"] = {
        "source": "scripts/check-figures.mjs",
        "screen": checker.get("screen"),
        "verdict": verdict,
        "basis": checker.get("basis", []),
        # Scope, stated so the stamp cannot be read as more than it is. The checker reads the
        # figure SVG on disk; it never opens the rendered PNG. If compositing did not happen -- no
        # rsvg-convert, a composite failure that run-one.sh swallowed, or an image rendered before
        # the plate existed -- this verdict is still "pass" while the reviewed raster contains no
        # correct figure at all. Whether the plate actually landed in the image is the model's
        # plate-integrity report, and that report is NOT currently a gate.
        "attests": (
            "The kernel-generated figure SVG named above is mathematically faithful to "
            "src/operators/euclidean.ts: its data-onsets/data-gaps/data-notation re-derive from "
            "euclideanRhythm/cyclicGapLengths, its drawn steps are a bijection over 0..steps-1, and "
            "every marker sits at its step's angle on its ring."
        ),
        "doesNotAttest": (
            "That the figure was actually composited into the reviewed PNG, or that it is "
            "uncovered and correctly placed there. Read the variants' plate-integrity defects for "
            "that; it is not machine-checked."
        ),
    }

    with open(critique_path, "w", encoding="utf-8") as handle:
        json.dump(critique, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
