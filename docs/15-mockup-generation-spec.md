# Mockup Generation Specification

**Purpose:** canonical brief for successive visual mockups, Figma exploration, or image-generation runs  
**Depends on:** `docs/13-ui-ux-final-design-spec.md`, `design/tokens.json`, `design/screens.json`

## 1. Generation strategy

Generate the product in layers rather than asking for an entire application at once.

### Sequence

1. **Shell exploration** — desktop studio with generic lab content.
2. **Shell convergence** — select one layout and lock navigation, transport, inspector, timeline, graph drawer.
3. **Design-system states** — controls, node anatomy, clips, tokens, menus, tooltips, errors.
4. **Flagship lab** — Infinite Staircase.
5. **Second flagship** — Euclidean Rings.
6. **Remaining lab canvases** — one at a time.
7. **Responsive set** — laptop, iPad landscape/portrait, iPhone companion.
8. **Accessibility/reduced-motion set**.
9. **Final composite studio screens** with realistic project data.

Do not allow later lab mockups to silently redesign the application shell.

## 2. Master visual prompt

Use this as the stable visual brief; append the specific screen brief afterward.

> Design a high-fidelity production interface for **Aural Geometry Lab**, a mathematical music studio that lets users hear, see, manipulate, and explain mathematical structures as music. The product should feel like a serious creative instrument crossed with a scientific visualization environment: precise, calm, luminous, tactile, and deeply interactive—not a generic analytics dashboard, not a game, and not a sci-fi HUD. Use the supplied design tokens and layout specification. The default studio is dark neutral with restrained high-contrast semantic accents. Mathematical geometry and musical time should dominate the canvas. Controls should be compact, professional, and legible. Use progressive disclosure: a novice can play immediately while an expert can open the timeline, typed operator graph, and mathematical inspector. Make selected entities visibly linked across canvas, graph, timeline, and inspector. Generated material, frozen clips, provenance, research-gated content, and evaluation states must each have distinct visual treatments that do not rely on color alone. Avoid decorative equations, fake waveforms, meaningless neon grids, excessive glassmorphism, giant cards, marketing-page spacing, and arbitrary gradients. The interface must look implementable in React and adaptable to SwiftUI on iPad.

## 3. Required fidelity rules

Every mockup must:

- use real labels from the screen manifest;
- show coherent musical/mathematical values;
- preserve the same transport and primary navigation locations within a platform class;
- show a believable selection state;
- show enough content to judge density;
- avoid placeholder lorem ipsum;
- avoid impossible graph connections;
- use operator port shapes/types consistently;
- distinguish generated/frozen/manual material;
- include visible accessibility-friendly labels for icon-only controls in annotation versions;
- avoid fabricating an exact Penrose tiling unless generated from validated geometry.

## 4. Canonical screen set

### S01 — Project Library

Show:

- product name;
- recent projects;
- new blank project;
- guided labs;
- small previews with lab type, modified date, tempo, and deterministic seed indicator;
- local-first status.

Goal: inviting but still an instrument, not a content streaming app.

### S02 — Infinite Staircase Explore

Primary canvas shows logarithmic tempo bands circulating through a wrapped tempo space. A simple beat pattern appears as layered pulse lanes. Controls expose direction, cycle duration, layers, ratio, and comparison toggles. The guide asks “Can a rhythm keep accelerating without becoming infinitely fast?” Inspector is collapsed by default.

### S03 — Infinite Staircase Inspect

Same project, with mathematical inspector open. Show source → sampling → normalization → mapping → shaping → constraints. Select one layer/event and display formula, current phase, gain, provenance, and A/B reset-hiding comparison.

### S04 — Euclidean Rings Compose

Large concentric rhythm rings, 3–5 tracks, compact timeline, instrument labels, step/pulse/rotation controls, LCM/composite-cycle indicator, direct drag affordance, selected ring linked to a graph node.

### S05 — Full Studio Compose

Generic project combining Euclidean trigger source → transformation → synth plus Tonnetz chord track. Show timeline, mixer, inspector, and collapsed graph drawer. This is the canonical “what the product is” screen.

### S06 — Operator Graph Focus

Graph fills the center. Nodes use typed port shapes and semantic categories. Show invalid-connection preview, one provenance path, minimap/overview, search/add-node control, and selected node inspector.

### S07 — Timeline Focus

Show generated regions, frozen clips, manual clip, automation lane, rational-grid/tupplet marker, selected event provenance chip, and clear freeze/edit behavior.

### S08 — Tonnetz Walk

Harmonic lattice with a drawn progression path, selected chord, common-tone highlights, voice-leading panel, timeline output, transformation labels.

### S09 — Fractal Motif

Split canvas between nested timeline and recursion tree. Selected note exposes ancestry from generation 0 through current leaf. Show event-budget prediction before increasing depth.

### S10 — Cellular Automaton Orchestra

Automaton grid with generation cursor, mapping overlay, selected cell neighborhood/rule explanation, density plot, and musical output strip.

### S11 — Chaos Attractor

2D/3D trajectory, current sample marker, nearby trajectory comparison, axis mapping chips, normalization/smoothing pipeline, stability warning state example.

### S12 — Penrose Research-Gated

A high-quality blocked-state screen explaining why exact tiling validation is pending. It may show abstract rhomb motifs labeled “illustrative geometry,” but must not claim the diagram is a valid Penrose tiling.

### S13 — Export

Export sheet/panel with Project Package, MIDI, WAV, MusicXML, visual snapshot. Show approximations/warnings before export and deterministic metadata manifest.

### S14 — iPad Landscape Studio

Native-feeling adaptation: project/lab sidebar, large canvas, contextual inspector, bottom timeline drawer, persistent transport, Pencil-aware direct manipulation. Do not simply shrink desktop chrome.

### S15 — iPad Portrait Explore

Canvas-first. Sidebar hidden, inspector sheet, bottom transport/timeline drawer, large touch targets while preserving professional density.

### S16 — iPhone Companion

Project playback plus one lab canvas, parameter cards, compact inspector, no full graph. Show bottom transport and a sheet for parameter editing.

## 5. Variant generation prompts

For each canonical screen, generate three deliberate variants:

### Variant A — Instrument

Optimize for professional creative-tool density and speed. Compact controls, minimal decoration, high information density.

### Variant B — Laboratory

Optimize for mathematical explanation and visualization while preserving composition capability. Inspector and annotations are somewhat more prominent.

### Variant C — Spatial/Tactile

Optimize for direct manipulation, larger geometric controls, and iPad transferability. Reduce chrome and let the canvas dominate.

Then synthesize—not average—the strongest decisions.

## 6. Critique rubric

Score each mockup 0–3 on:

- immediate playability;
- mathematical legibility;
- musical legibility;
- professional-tool credibility;
- linked-selection clarity;
- density management;
- novice-to-expert progression;
- generated/frozen distinction;
- provenance discoverability;
- error/budget visibility;
- accessibility cues;
- responsive plausibility;
- implementation plausibility;
- visual restraint;
- consistency with design tokens.

Any score of 0 on mathematical correctness, generated/frozen semantics, or accessibility rejects the mockup regardless of aesthetics.

For a screen with a `design/mockups/figure-plates.json` entry the mathematical-correctness reject
axis is **machine-derived, not scored by the model**. Its central figure is generated from the
operator kernels and composited into a reserved panel (§S3, `composite-figure.sh`), so all three
variants carry the byte-identical figure and any per-variant disagreement on the mathematics is by
construction a reading error. `scripts/check-figures.mjs` decides the axis against the SVG's own
`data-*` attributes and the compiled `src/operators/euclidean.ts` — it re-derives
`data-onsets`/`data-gaps`/`data-notation` from `euclideanRhythm`/`cyclicGapLengths`, requires the
drawn `data-step` values to be a bijection over `0..steps-1`, and recomputes every onset marker's
angle from its ring — and `score-one.sh` stamps that verdict onto the critique after scoring. `npm
run verify` runs the same check; a stale committed figure fails it, and so does a `dist/` older than
the sources the check reads through. The model is asked only whether the composited plate is
present, uncovered and correctly placed; it does not read the mathematics off the raster, and for a
plated screen it is not asked to judge the mathematical-correctness reject axis at all. Screens with
no plate keep the by-eye check above unchanged.

The stamp is scoped, and says so in its own `attests`/`doesNotAttest` fields: it establishes that
the figure **SVG** is kernel-faithful, **not** that the figure reached the reviewed PNG. Compositing
is not gated — `run-one.sh` swallows a composite failure with `exit 0` — so an uncomposited render
can still carry a `pass` on this axis. Treat the model's plate-integrity defects as the only signal
about that until composition itself is gated.

## 7. Annotation pass

After a visual direction is selected, produce annotated mockups showing:

- panel dimensions;
- spacing tokens;
- component names;
- interaction hotspots;
- hover/focus/selected states;
- keyboard shortcuts;
- direct-manipulation writeback target;
- responsive behavior;
- animation intent;
- semantic/accessibility counterpart for canvas elements.

## 8. Handoff from mockups to implementation

A mockup becomes implementation-authoritative only when:

- its screen ID exists in `design/screens.json`;
- all visible components map to the component manifest or create an explicit new component entry;
- deviations from design tokens are recorded;
- interaction behavior is described, not inferred from pixels;
- content/math values are valid;
- it has an accessibility annotation;
- responsive behavior has at least one paired mockup or written rule.

