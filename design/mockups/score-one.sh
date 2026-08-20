#!/usr/bin/env bash
# AGL-149 critique leg — scores one screen's three variants against the docs/15 S6 rubric.
# RoutingRecord: codex / gpt-5.6-terra / effort=high / codex-executor / task_class=code_review /
# requires_write=true. Scoring is delegated; SYNTHESIS AND VERDICT ARE NOT (MUST-stay-primary).
# Usage: score-one.sh <SCREEN_ID> <slug>
set -uo pipefail
SID="$1"; SLUG="$2"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/design/mockups/critique/$SID.json"
LOG="$ROOT/design/mockups/critique/$SID.log"
[ -s "$OUT" ] && { echo "SKIP $SID"; exit 0; }
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

Then judge the three REJECT axes as pass or fail: mathematical correctness, generated/frozen
semantics, accessibility. Per S6, ANY zero on a reject axis rejects the mockup regardless of
aesthetics.

Be specific and hostile about these in particular:
 - MATHEMATICAL CORRECTNESS. Check the rendered values against the mathematics they claim. If a
   ring is labelled E(k,n), compute the Bjorklund/Euclidean onset positions and check the filled
   steps actually match. If a Tonnetz lattice is shown, check the adjacency is really fifths and
   thirds and that vertex labels are not duplicated incoherently. If a tempo axis claims to be
   logarithmic, check the spacing. Report the exact discrepancy, with the values.
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
if [ -s "$OUT" ]; then echo "OK   $SID"; else echo "FAIL $SID (see $LOG)"; fi
