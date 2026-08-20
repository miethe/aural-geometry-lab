#!/usr/bin/env bash
# AGL-149 campaign runner. Renders every prompt lacking an image, N legs at a time.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
N="${1:-6}"
i=0
for p in "$ROOT"/design/mockups/prompts/*.txt; do
  n="$(basename "$p" .txt)"
  [ -s "$ROOT/design/mockups/images/$n.png" ] && continue
  "$ROOT/design/mockups/run-one.sh" "$p" &
  i=$((i+1))
  if [ $((i % N)) -eq 0 ]; then wait; fi
done
wait
echo "CAMPAIGN COMPLETE: $(find "$ROOT/design/mockups/images" -name '*.png' | wc -l) images"
