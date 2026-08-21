#!/usr/bin/env bash
# AGL-149 critique leg — scores one screen's three variants against the docs/15 S6 rubric.
# RoutingRecord: codex / gpt-5.6-terra / effort=high / codex-executor / task_class=code_review /
# requires_write=true. Scoring is delegated; SYNTHESIS AND VERDICT ARE NOT (MUST-stay-primary).
#
# For a screen with a figure-plates.json plate the central mathematics is kernel-generated and
# composited, not drawn by the model, so the "mathematical correctness" reject axis is decided by a
# deterministic zero-model check (scripts/check-figures.mjs) rather than by eye. The model is asked
# only whether the composited plate is present, uncovered and correctly placed, and the axis is
# stamped from the machine verdict after it writes. Two byte-identical figures cannot yield opposite
# verdicts, which is the instability this replaces.
#
# Usage: score-one.sh <SCREEN_ID> <slug>
set -uo pipefail
SID="$1"; SLUG="$2"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/design/mockups/critique/$SID.json"
LOG="$ROOT/design/mockups/critique/$SID.log"
PLATES="$ROOT/design/mockups/figure-plates.json"

# Is this screen plated? Read figure-plates.json exactly as composite-figure.sh does.
PLATED=$(python3 -c 'import json,sys; print("1" if sys.argv[1] in json.load(open(sys.argv[2]))["plates"] else "")' "$SID" "$PLATES") || exit 2

# For a plated screen, decide the math axis with the zero-model checker BEFORE anything else. A
# broken or stale figure must never be stamped "pass" nor scored around, so a checker failure aborts
# the whole run. The JSON is kept for the post-scoring stamp.
CHECK_JSON=""
if [ -n "$PLATED" ]; then
  CHECK_JSON="$(mktemp -t aglcheck).json"
  trap 'rm -f "$CHECK_JSON"' EXIT
  if ! node "$ROOT/scripts/check-figures.mjs" --screen "$SID" --json >"$CHECK_JSON" 2>>"$LOG"; then
    echo "ABORT $SID: figure-plate math check FAILED — refusing to score a broken figure." >&2
    cat "$CHECK_JSON" >&2 2>/dev/null || true
    exit 1
  fi
fi

# Stamp the machine math verdict onto the critique. Idempotent, model-free — safe to run on the
# already-scored (skip) path, which is what makes the axis stable across re-runs.
#
# A non-plated screen is a SUCCESSFUL no-op, so this returns 0 rather than the status of the test.
# Written as `[ -n "$PLATED" ] && python3 ...` it returned 1 for the 14 screens with no plate, and
# both call sites below treat a non-zero return as a stamping failure -- which turned every
# non-plated screen's `SKIP`/`OK` into exit 2. The by-eye path's prompt was unchanged; its exit
# status was not.
stamp_math() {
  [ -n "$PLATED" ] || return 0
  python3 "$ROOT/scripts/stamp-math-verdict.py" "$OUT" "$CHECK_JSON"
}

if [ -s "$OUT" ]; then
  stamp_math || exit 2
  echo "SKIP $SID"; exit 0
fi

# The mathematical-correctness instruction differs by whether the figure is composited (kernel-true,
# verified, must not be read off the raster) or drawn by the model (must be checked by eye).
#
# The reject-axis instruction has to move with it. Left generic it said "judge the three REJECT axes
# ... mathematical correctness", contradicting the plated bullet's "do NOT score mathematical
# correctness" a few lines later and leaving the model told to decide the axis it is forbidden to
# decide. The axis is overwritten either way, so this could not change a verdict -- but a
# self-contradictory prompt is not "does not ask", which is the acceptance criterion.
if [ -n "$PLATED" ]; then
  read -r -d '' REJECT_SENTENCE <<'SENTENCE'
Then judge only TWO reject axes as pass or fail: generated/frozen semantics, and accessibility.
Do NOT judge "mathematical correctness" — it is machine-derived for this screen (see below). Emit it
in the JSON as the literal string "machine-derived"; whatever you write there is discarded and
replaced with the zero-model verdict. Per S6, ANY zero on a reject axis rejects the mockup
regardless of aesthetics.
SENTENCE
else
  read -r -d '' REJECT_SENTENCE <<'SENTENCE'
Then judge the three REJECT axes as pass or fail: mathematical correctness, generated/frozen
semantics, accessibility. Per S6, ANY zero on a reject axis rejects the mockup regardless of
aesthetics.
SENTENCE
fi

if [ -n "$PLATED" ]; then
  read -r -d '' MATH_BULLET <<'BULLET'
 - COMPOSITED FIGURE PLATE. The central mathematical figure on this screen is NOT drawn by the
   image model: it is generated from the operator kernels (src/operators/*.ts via
   src/design/figures.ts) and composited into a reserved panel after rendering. Its onset
   positions, gaps and E(k,n) notation have ALREADY been verified by a deterministic zero-model
   check (scripts/check-figures.mjs) against those kernels. Do NOT read the mathematics off the
   raster and do NOT score "mathematical correctness" — that axis is machine-derived and will be
   overwritten. Report ONLY whether the composited plate is PRESENT, fully UNCOVERED (nothing has
   been drawn on top of it), and correctly PLACED within its reserved panel. If the panel is empty,
   partly occluded, or the figure spills outside it, say so exactly.
BULLET
else
  read -r -d '' MATH_BULLET <<'BULLET'
 - MATHEMATICAL CORRECTNESS. Check the rendered values against the mathematics they claim. If a
   ring is labelled E(k,n), compute the Bjorklund/Euclidean onset positions and check the filled
   steps actually match. If a Tonnetz lattice is shown, check the adjacency is really fifths and
   thirds and that vertex labels are not duplicated incoherently. If a tempo axis claims to be
   logarithmic, check the spacing. Report the exact discrepancy, with the values.
BULLET
fi

read -r -d '' P <<PROMPT
You are scoring generated UI mockups for the Aural Geometry Lab project. Work ONLY from what is
actually visible in the images. Do not infer, do not be generous, and do not reward intent.

Read these three images (use your image-viewing tool on each):
  $ROOT/design/mockups/images/$SID-$SLUG--A-instrument.png
  $ROOT/design/mockups/images/$SID-$SLUG--B-laboratory.png
  $ROOT/design/mockups/images/$SID-$SLUG--C-spatial.png

Read the brief each was generated from:
  $ROOT/design/mockups/prompts/$SID-$SLUG--A-instrument.txt
and the contracts they must satisfy:
  $ROOT/design/tokens.json      (v0.3.0 palette, layout, and the semanticStates block)
  $ROOT/design/screens.json     (this screen's requiredStates, if any)
  $ROOT/design/components.json  (the canonical component inventory)
  $ROOT/docs/15-mockup-generation-spec.md  (S3 fidelity rules, S6 rubric, S8 handoff gate)

For EACH of the three variants score 0-3 on all fifteen S6 rubric axes:
immediate playability, mathematical legibility, musical legibility, professional-tool credibility,
linked-selection clarity, density management, novice-to-expert progression, generated/frozen
distinction, provenance discoverability, error/budget visibility, accessibility cues, responsive
plausibility, implementation plausibility, visual restraint, consistency with design tokens.

$REJECT_SENTENCE

Be specific and hostile about these in particular:
$MATH_BULLET
 - NON-COLOR-ONLY ENCODING. Every semanticStates axis must be distinguishable without hue. Say
   which encoding is used (shape, texture, glyph, line style) or state that hue is load-bearing.
 - REQUIRED STATES. If screens.json lists requiredStates for $SID, say for each whether it is
   visibly present, and where.
 - TEXT DEFECTS. Report misspellings, garbled labels, and nonsense strings verbatim.
 - S8 HANDOFF GATE. Say which of the S8 conditions each variant fails.

Write ONLY a JSON file to $OUT and nothing else. Do not modify any other file. Shape:
{"screen":"$SID","variants":{"A-instrument":{"scores":{"<axis>":0-3,...},
"rejectAxes":{"mathematical correctness":"pass|fail","generated/frozen semantics":"pass|fail",
"accessibility":"pass|fail"},"verdict":"accept|accept-with-fixes|reject","requiredStates":
{"<state>":"present|absent|partial - where"},"defects":["..."],"strengths":["..."]},
"B-laboratory":{...},"C-spatial":{...}},
"screenNotes":"what all three get right or wrong in common",
"recommendedVariant":"A-instrument|B-laboratory|C-spatial","recommendationReason":"..."}
PROMPT
cd "$ROOT"
timeout 1200 codex exec --sandbox workspace-write --model gpt-5.6-terra "$P" </dev/null >"$LOG" 2>&1
if [ -s "$OUT" ]; then
  stamp_math || { echo "FAIL $SID (math stamp failed)"; exit 2; }
  echo "OK   $SID"
else
  # Exit non-zero. `set -e` is deliberately not in force here, so a codex timeout or refusal leaves
  # no critique JSON and the script would otherwise fall off the end and return 0 -- reporting a
  # critique that never happened as a successful command to run-all.sh and to CI.
  echo "FAIL $SID (see $LOG)"; exit 1
fi
