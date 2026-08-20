#!/usr/bin/env bash
# AGL-149 mockup render leg. Usage: run-one.sh <prompt-file>
# RoutingRecord: chosen_plugin_id=codex, model=gpt-5.6-terra, effort=high,
# agent_type_id=codex-executor, task_class=image_generation, requires_write=true.
set -uo pipefail
P="$1"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NAME="$(basename "$P" .txt)"
OUT="$ROOT/design/mockups/images/$NAME.png"
LOG="$ROOT/design/mockups/images/$NAME.log"
[ -s "$OUT" ] && { echo "SKIP $NAME (exists)"; exit 0; }
PROMPT="$(cat "$P")
Use your image generation tool. Save the single resulting PNG to exactly this absolute path,
overwriting anything there: $OUT
Do not resize or crop it afterwards. Do not write any other file. Do not modify the repository."
cd "$ROOT/design/mockups/images"
timeout 900 codex exec --sandbox workspace-write --model gpt-5.6-terra "$PROMPT" </dev/null >"$LOG" 2>&1
if [ ! -s "$OUT" ]; then echo "FAIL $NAME (see $LOG)"; exit 0; fi

# Composite the kernel-generated figure into the reserved plate, if this screen has one. The
# image model was told to leave that region empty; the mathematics is generated from
# src/operators/*.ts and asserted against those kernels in tests/figures.test.mjs, so a figure
# that contradicts its own labels can no longer be produced. No-ops for screens with no plate.
SID="${NAME%%-*}"
if ! "$ROOT/design/mockups/composite-figure.sh" "$SID" "$OUT" >>"$LOG" 2>&1; then
  echo "FAIL $NAME (render OK, composite failed - see $LOG)"; exit 0
fi
echo "OK   $NAME  $(du -h "$OUT" | cut -f1)"
