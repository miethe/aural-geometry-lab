# AGL-149 mock-up review index

Visual direction studies for review, not implementation authority. The existing S01–S07 tranche and its individual critiques are in [the campaign](../../design/mockups/README.md) and [tranche-one report](../reports/agl-149-mockup-critique-2026-08-20.md). The S08–S16 images were generated with native GPT image generation from the corresponding checked-in prompts and inspected individually at original resolution. A = instrument, B = laboratory, C = spatial. All links below are PNGs. Screen descriptions and requirements are in [mock-up spec §4](../15-mockup-generation-spec.md#4-canonical-screen-set); variants and rubric are in §§5–6. These images are proposals, not evidence of implemented functionality or verified mathematics.

## Existing tranche

| Screen and specification | Images | Critique |
|---|---|---|
| S01 — Project Library | [A](../../design/mockups/images/S01-project-library--A-instrument.png) · [B](../../design/mockups/images/S01-project-library--B-laboratory.png) · [C](../../design/mockups/images/S01-project-library--C-spatial.png) | [Individual critique](../../design/mockups/critique/S01.json) |
| S02 — Infinite Staircase Explore | [A](../../design/mockups/images/S02-risset-explore--A-instrument.png) · [B](../../design/mockups/images/S02-risset-explore--B-laboratory.png) · [C](../../design/mockups/images/S02-risset-explore--C-spatial.png) | [Individual critique](../../design/mockups/critique/S02.json) |
| S03 — Infinite Staircase Inspect | [A](../../design/mockups/images/S03-risset-inspect--A-instrument.png) · [B](../../design/mockups/images/S03-risset-inspect--B-laboratory.png) · [C](../../design/mockups/images/S03-risset-inspect--C-spatial.png) | [Individual critique](../../design/mockups/critique/S03.json) |
| S04 — Euclidean Rings Compose | [A](../../design/mockups/images/S04-euclidean-compose--A-instrument.png) · [B](../../design/mockups/images/S04-euclidean-compose--B-laboratory.png) · [C](../../design/mockups/images/S04-euclidean-compose--C-spatial.png) | [Individual critique](../../design/mockups/critique/S04.json) |
| S05 — Full Studio Compose | [A](../../design/mockups/images/S05-studio-compose--A-instrument.png) · [B](../../design/mockups/images/S05-studio-compose--B-laboratory.png) · [C](../../design/mockups/images/S05-studio-compose--C-spatial.png) | [Individual critique](../../design/mockups/critique/S05.json) |
| S06 — Operator Graph Focus | [A](../../design/mockups/images/S06-graph-focus--A-instrument.png) · [B](../../design/mockups/images/S06-graph-focus--B-laboratory.png) · [C](../../design/mockups/images/S06-graph-focus--C-spatial.png) | [Individual critique](../../design/mockups/critique/S06.json) |
| S07 — Timeline Focus | [A](../../design/mockups/images/S07-timeline-focus--A-instrument.png) · [B](../../design/mockups/images/S07-timeline-focus--B-laboratory.png) · [C](../../design/mockups/images/S07-timeline-focus--C-spatial.png) | [Individual critique](../../design/mockups/critique/S07.json) |

## New tranche: individual visual inspection

All images show the named screen in §4 of the specification. Primary text is generally readable at original size; no severe text collisions were observed beyond the crowded areas called out below. Layout, semantic states, and generated values require further review. The raster alone does not demonstrate keyboard access, focus behavior, responsive interactions, token accuracy, or valid mathematical output. No rubric score is asserted without a full state-by-state evaluation.

| Screen | Interpretation and image | Inspection finding |
|---|---|---|
| S08 — Tonnetz Walk | [A](../../design/mockups/images/S08-tonnetz--A-instrument.png) | Readable panels; C major → A minor is labelled L instead of relative; voice-leading values need validation. |
| S08 — Tonnetz Walk | [B](../../design/mockups/images/S08-tonnetz--B-laboratory.png) | Readable; C → Am labelled L and Am → F labelled P, inconsistent with the depicted chords. |
| S08 — Tonnetz Walk | [C](../../design/mockups/images/S08-tonnetz--C-spatial.png) | Readable; F → C and C → G labelled P/L although those are not the shown P/L transformations. |
| S09 — Fractal Motif | [A](../../design/mockups/images/S09-fractal--A-instrument.png) | Deepest note labels are crowded; displayed pitch sequence needs verification against the selected fifth rule. |
| S09 — Fractal Motif | [B](../../design/mockups/images/S09-fractal--B-laboratory.png) | Readable ancestry and predictor; decorative rhomb geometry competes with nested timeline, reducing canvas focus. |
| S09 — Fractal Motif | [C](../../design/mockups/images/S09-fractal--C-spatial.png) | Readable tree; 256 projected events is unexplained by the visible binary tree at depth 3. |
| S10 — Cellular Automaton Orchestra | [A](../../design/mockups/images/S10-cellular--A-instrument.png) | Grid and labels readable; neighborhood drawing does not clearly encode the stated 110; grid evolution unverified. |
| S10 — Cellular Automaton Orchestra | [B](../../design/mockups/images/S10-cellular--B-laboratory.png) | Readable rule panel; dense grid cannot establish that the displayed evolution and density were computed. |
| S10 — Cellular Automaton Orchestra | [C](../../design/mockups/images/S10-cellular--C-spatial.png) | Readable panels; illustrated neighborhood appears 101 while labelled 111; grid evolution unverified. |
| S11 — Chaos Attractor | [A](../../design/mockups/images/S11-chaos--A-instrument.png) | Readable warning; trajectory and numerical stability claims are unverified generated data. |
| S11 — Chaos Attractor | [B](../../design/mockups/images/S11-chaos--B-laboratory.png) | Readable but dense; divergence graph and numeric assertions are illustrative and unverified. |
| S11 — Chaos Attractor | [C](../../design/mockups/images/S11-chaos--C-spatial.png) | Readable; graph and numeric stability claims are unverified, and small pipeline labels are compact. |
| S12 — Penrose Research-Gated | [A](../../design/mockups/images/S12-penrose-gate--A-instrument.png) | Gate and illustrative warning readable; named artifacts are invented placeholders, not verified files. |
| S12 — Penrose Research-Gated | [B](../../design/mockups/images/S12-penrose-gate--B-laboratory.png) | Gate and illustrative warning readable; “construction accepted” and named artifacts require contract reconciliation. |
| S12 — Penrose Research-Gated | [C](../../design/mockups/images/S12-penrose-gate--C-spatial.png) | Warning readable; certificate and artifact names are invented and need contract reconciliation. |
| S13 — Export | [A](../../design/mockups/images/S13-export--A-instrument.png) | All formats visible; manifest text is small and warnings/format capabilities need contract verification. |
| S13 — Export | [B](../../design/mockups/images/S13-export--B-laboratory.png) | Readable; 1/8 note shown as 0.500 s at 120 BPM is inconsistent; manifest is small. |
| S13 — Export | [C](../../design/mockups/images/S13-export--C-spatial.png) | Readable at full size; warning and manifest text are small and generated format claims require verification. |
| S14 — iPad Landscape Studio | [A](../../design/mockups/images/S14-ipad-landscape--A-instrument.png) | Readable, but desktop-like density and small targets undermine the touch adaptation; no explicit Pencil interaction. |
| S14 — iPad Landscape Studio | [B](../../design/mockups/images/S14-ipad-landscape--B-laboratory.png) | Labels readable; graph and timeline crowd the canvas and touch targets; Pencil behavior not specified. |
| S14 — iPad Landscape Studio | [C](../../design/mockups/images/S14-ipad-landscape--C-spatial.png) | Readable; 1/16 note shown as 0.500 s at 120 BPM is inconsistent; Pencil behavior not specified. |
| S15 — iPad Portrait Explore | [A](../../design/mockups/images/S15-ipad-portrait--A-instrument.png) | Readable at full size; persistent inspector and graph crowd the canvas rather than a compact inspector sheet. |
| S15 — iPad Portrait Explore | [B](../../design/mockups/images/S15-ipad-portrait--B-laboratory.png) | Readable but dense; persistent inspector and graph contradict the canvas-first sheet direction; duration shown as 0.500 s for half a beat at 120 BPM is inconsistent. |
| S15 — iPad Portrait Explore | [C](../../design/mockups/images/S15-ipad-portrait--C-spatial.png) | Readable; graph and inspector remain open together, crowding the canvas-first portrait layout. |
| S16 — iPhone Companion | [A](../../design/mockups/images/S16-iphone-companion--A-instrument.png) | Legible at full size; very tall composition and twelve simultaneous parameters do not demonstrate a compact phone viewport. |
| S16 — iPhone Companion | [B](../../design/mockups/images/S16-iphone-companion--B-laboratory.png) | Legible at full size; very tall, dense composition and 1/8 note shown as 0.500 s at 120 BPM are problematic. |
| S16 — iPhone Companion | [C](../../design/mockups/images/S16-iphone-companion--C-spatial.png) | Legible at full size; unusually tall composition does not establish a usable phone viewport or sheet behavior. |

## Cross-screen review

The material legend consistently proposes solid, dotted, hatched and dashed treatments, but the other v0.3 semantic axes are not consistently distinguishable without color. Tone and layout are suitable for direction selection; generated math, claims, artifact names and exact values must be replaced or verified against the kernels and contracts. Portrait and phone compositions need viewport-specific interaction studies. Per §8, component mapping, token deviations, behavior, accessibility annotations, validated content and responsive rules remain open; none of these rasters is implementation-authoritative. The existing S01–S07 critiques predate this tranche and are not a fresh inspection of those images.
