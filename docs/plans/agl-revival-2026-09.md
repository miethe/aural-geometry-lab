# Aural Geometry Lab revival — September 2026

Extend the running native-DOM studio in reviewable slices while its seven routes remain usable. Move toward the production studio incrementally; do not start a parallel shell before a lab capability can move with it.

## Milestone 1 — Explain Euclidean alignment

**State:** the Euclidean lab reports how often ring onsets coincide during the full composite cycle.

**Acceptance:** cycle length remains the least common multiple; shared global steps and pairwise ring alignments are counted exactly; the analysis refuses malformed inputs and cycles above its explicit bound; all seven routes remain reachable. **Backlog:** AGL-073.

## Milestone 2 — Manipulate ring phase directly

**State:** users can rotate a ring from its visualization with pointer and keyboard input, with the existing controls and audio staying synchronized.

**Acceptance:** phase changes preserve pulse count and cyclic gaps; every action has a non-drag keyboard path; ring audio stops cleanly on route changes. **Backlog:** AGL-072, AGL-051.

## Milestone 3 — Grow the studio around proven labs

**State:** start the production shell as an incremental home for working lab capabilities, with a first playable concept preview in Penrose only while it is explicitly labeled as not tile-derived.

**Acceptance:** production routes can coexist during development; lab behavior is moved only with its tests and a working route; Penrose never presents the conceptual scaffold as an exact tiling. **Backlog:** AGL-030, AGL-124, AGL-144.

## Probe notes

The local toolchain has Node 24.14.0 and the locked TypeScript 5.8.3, which can build and test the repo. Node 20.19.3 is correctly refused by the build. The source catalog exposes seven hash routes; six labs instantiate audio players and Penrose does not. A browser is unavailable in this sandbox, so route delivery can be checked over HTTP but actual rendering and sound still need a browser-side listening pass.
