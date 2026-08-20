#!/usr/bin/env bash
# AGL-149 follow-up. Composite a KERNEL-GENERATED figure into a rendered mockup's reserved plate.
#
# Usage: composite-figure.sh <screen-id> <image.png>
#
# Why this exists: every one of the 20 rejected tranche-1 mockups failed the `mathematical
# correctness` reject axis, because a generative image model cannot render mathematically
# constrained content. So the model is asked to leave the canvas region EMPTY (see
# figure-plates.json `reserveAs`, injected into the prompt by build-prompts.py), and the real
# figure -- whose onsets and adjacencies come straight out of src/operators/*.ts and are asserted
# against those kernels in tests/figures.test.mjs -- is composited in here.
#
# Exits 0 and does nothing when the screen has no plate, so run-one.sh can call it unconditionally.
# Any real failure is a non-zero exit: a silently un-composited image would reintroduce exactly the
# defect this whole path exists to remove.
set -uo pipefail

SID="${1:-}"
IMG="${2:-}"
[ -n "$SID" ] && [ -n "$IMG" ] || { echo "usage: composite-figure.sh <screen-id> <image.png>" >&2; exit 2; }

HERE="$(cd "$(dirname "$0")" && pwd)"
PLATES="$HERE/figure-plates.json"
[ -s "$PLATES" ] || { echo "composite: missing $PLATES" >&2; exit 2; }

# No plate for this screen -> nothing to do. This is the common case (14 of 16 screens).
HAS=$(python3 -c 'import json,sys; print("1" if sys.argv[1] in json.load(open(sys.argv[2]))["plates"] else "")' "$SID" "$PLATES") || exit 2
[ -n "$HAS" ] || { echo "composite: no plate for $SID (nothing to do)"; exit 0; }

[ -s "$IMG" ] || { echo "composite: render missing or empty: $IMG" >&2; exit 1; }

FIG_REL=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[2]))["plates"][sys.argv[1]]["figure"])' "$SID" "$PLATES") || exit 2
FIG="$HERE/$FIG_REL"
if [ ! -s "$FIG" ]; then
  echo "composite: figure SVG not built: $FIG" >&2
  echo "composite: run \`npm run figures\` first -- the figure is generated from the operator kernels, never drawn." >&2
  exit 1
fi

command -v magick >/dev/null || { echo "composite: ImageMagick (magick) not found; cannot composite" >&2; exit 1; }

# Rendered images vary in pixel size, so the plate is fractional and is resolved against the
# ACTUAL image geometry here rather than against the nominal 1600x900 in the prompt.
DIMS=$(magick identify -format '%w %h' "$IMG" 2>/dev/null) || { echo "composite: cannot read $IMG" >&2; exit 1; }
IW=${DIMS% *}; IH=${DIMS#* }

read -r PX PY PW PH < <(python3 -c '
import json, sys
r = json.load(open(sys.argv[2]))["plates"][sys.argv[1]]["rect"]
iw, ih = int(sys.argv[3]), int(sys.argv[4])
print(round(r["x"]*iw), round(r["y"]*ih), round(r["w"]*iw), round(r["h"]*ih))
' "$SID" "$PLATES" "$IW" "$IH") || exit 2

[ "$PW" -gt 0 ] && [ "$PH" -gt 0 ] || { echo "composite: degenerate plate ${PW}x${PH} for $SID" >&2; exit 1; }

TMP="$(mktemp -t aglfig).png"
trap 'rm -f "$TMP"' EXIT

# Rasterise the figure at the plate's exact pixel size, preserving transparency so the reserved
# panel's own background and border survive underneath.
#
# rsvg-convert, not `magick`, and deliberately: ImageMagick decodes SVG with its own internal
# renderer (`-list format` reports SVG via libxml, not via its declared rsvg delegate), and that
# renderer supports neither the CSS <style> block nor the unstyled <text> this figure uses -- it
# fails outright with "unable to read font ''". Installing librsvg does not redirect it. Since the
# whole point of this path is that the figure is CORRECT, silently accepting an approximate
# rasteriser would defeat it, so a missing rsvg-convert is a hard failure rather than a fallback.
command -v rsvg-convert >/dev/null || {
  echo "composite: rsvg-convert not found (brew install librsvg)" >&2
  echo "composite: refusing to fall back to ImageMagick's internal SVG renderer -- it drops the" >&2
  echo "           figure's CSS and text, which is exactly the correctness this path exists for." >&2
  exit 1
}
rsvg-convert --width "$PW" --height "$PH" --keep-aspect-ratio --background-color=none \
  --output "$TMP" "$FIG" \
  || { echo "composite: failed to rasterise $FIG" >&2; exit 1; }

magick "$IMG" "$TMP" -geometry "+${PX}+${PY}" -composite "$IMG" \
  || { echo "composite: failed to composite into $IMG" >&2; exit 1; }

echo "composite: $SID <- $FIG_REL at ${PW}x${PH}+${PX}+${PY} (image ${IW}x${IH})"
