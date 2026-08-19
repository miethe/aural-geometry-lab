# Validation Strategy

## 1. Objective

Prove that Aural Geometry Lab is mathematically correct within its declared models, deterministic at the canonical-event layer, bounded under hostile/accidental inputs, musically usable, perceptually honest, accessible, and operationally stable in supported browsers.

No single test category is sufficient. A system may produce correct equations but bad music, pleasing sound but false explanations, or stable visuals while dropping audio events.

## 2. Test pyramid

### Layer 1 — Pure unit tests

- rational arithmetic and normalization;
- deterministic random streams and stable IDs;
- operator edge cases;
- schema validation/migration functions;
- coordinate conversions;
- numerical integration steps;
- mapping/normalization/smoothing primitives.

### Layer 2 — Property and invariant tests

Generate many valid inputs and test laws rather than only examples.

Examples:

- `a + b = b + a` and exact round-trips for rational operations where defined;
- pattern loop translation preserves event-relative structure;
- Euclidean output has exactly `pulses` active steps;
- rotation preserves cyclic-gap multiset;
- Risset phase plus one cycle equals adjacent-layer relabeling;
- applying a reversible pitch reflection twice returns the original motif;
- CA fixed rule/seed reproduces state exactly;
- Penrose shared-edge adjacency is symmetric;
- graph evaluation order does not affect pure output.

### Layer 3 — Golden fixtures

Versioned, human-reviewed outputs for:

- project migrations;
- each lab preset's canonical events;
- selected Tonnetz paths/voicings;
- known CA generations;
- Lorenz trajectories at fixed parameters/integration settings;
- Penrose finite patches and tile counts/properties;
- MIDI/MusicXML exports.

Golden changes require an explicit explanation and operator/project version decision.

### Layer 4 — Integration tests

- graph compile/evaluate/cancel/cache;
- project save/reopen/migrate;
- render plan from canonical events;
- real-time/offline plan agreement;
- sample asset packaging and recovery;
- linked selection among timeline, graph, geometry, and provenance.

### Layer 5 — Browser/end-to-end tests

For each supported browser:

1. open a bundled project;
2. start audio after gesture;
3. change parameters while playing;
4. stop globally;
5. save and reopen;
6. export at least JSON and one media/event format;
7. verify no uncaught errors, stuck audio, or lost state.

### Layer 6 — Performance and soak tests

- long-duration exact transport simulation;
- dense pattern query near budget;
- repeated parameter changes and cancellation;
- worker crash/restart;
- audio scheduler under UI/visualization load;
- offline render cancellation;
- large but permitted imported project;
- memory growth across repeated project/lab changes.

### Layer 7 — Research and user validation

- controlled listening studies for perceptual claims;
- comprehension studies for mathematical explanations;
- composer/educator usability sessions;
- accessibility testing with keyboard-only and assistive technology;
- comparison of direct manipulation versus graph/inspector workflows.

## 3. Determinism tiers

| Tier | Guarantee |
|---|---|
| D0 | No guarantee; prohibited for canonical operators unless explicitly labeled external/live input |
| D1 | Canonical event/geometry output repeats for same versions, seed, inputs, interval |
| D2 | Offline rendered samples repeat within a documented numeric/backend tolerance |
| D3 | Bit-identical artifact output on the same locked platform/toolchain |

MVP operators target D1. Exporters should target D3 where feasible. Real-time browser output is not promised bit-identical across browsers.

## 4. Mathematical acceptance by lab

### Infinite Staircase

- tempo-layer closure/relabeling invariant;
- gain envelopes finite, bounded, and normalized by declared policy;
- scheduler caps at high instantaneous tempo;
- controlled listening: perceived direction and reset-detection measures.

### Euclidean Rings

- onset count, balanced gap, rotation, complement/edge cases;
- independent reference corpus;
- bounded LCM/composite-cycle behavior.

### Tonnetz Walk

- coordinate/pitch fixtures;
- transformation identities where claimed;
- deterministic voicing-cost and tie break;
- spelling versus pitch-class separation.

### Fractal Motif

- grammar expansion fixtures;
- stable ancestry and IDs;
- growth forecast never understates beyond declared bound;
- hard termination/cancellation.

### Cellular Automaton

- known rule-generation fixtures;
- boundary-condition fixtures;
- state/mapping separation;
- deterministic lineage.

### Chaos Attractor

- RK/integrator step fixtures;
- finite-state guards;
- trajectory tolerance against a high-precision reference;
- normalization/smoothing causality in live mode.

### Penrose

- tile shapes/matching rules;
- overlap/gap tolerance;
- stable IDs and deterministic regeneration;
- adjacency symmetry and clipping correctness;
- independent golden patch/reference comparison.

## 5. Audio scheduler metrics

Instrument the engine to record:

- intended versus scheduled start time;
- late event count and lateness distribution;
- queue horizon;
- scheduler wake interval;
- active source count;
- dropped/capped events;
- AudioContext state changes;
- worker/evaluation completion relative to render deadline.

Thresholds must be set by DR-03 and empirical testing rather than guessed. Tests should run under ordinary, CPU-constrained, and visualization-heavy profiles.

## 6. Perceptual-study template

Each perceptual claim requires:

- preregistered or at minimum frozen hypothesis and analysis plan;
- stimulus generation from a versioned project/seed;
- equipment/environment guidance;
- randomization and counterbalancing where appropriate;
- baseline/control conditions;
- outcome measure and exclusion criteria;
- anonymized result package;
- explicit statement of population and limitations.

For Infinite Staircase, candidate measures include perceived acceleration direction, reset detection, confidence, and parameter preference. The study must distinguish “users enjoy it” from “the intended illusion is robust.”

## 7. Accessibility validation

- keyboard path for every command and direct-manipulation alternative;
- screen-reader labels/state announcements;
- focus order and modal containment;
- reduced-motion operation;
- high zoom/reflow;
- color-independent state;
- non-pitch-only alternatives for information conveyed by pitch;
- non-stereo-only alternatives for information conveyed by pan;
- visual timing alternative for audio-only events.

## 8. Current evidence

The suite currently passes **85 automated tests** (`tests/core.test.mjs` + `tests/fr01.test.mjs`),
alongside 11 Swift conformance tests and 12 schema fixtures. The fourteen tests listed below were
the Sprint-0/M0 baseline and are retained as the origin of the invariant set, not as current scope:

1. exact rational arithmetic;
2. looped pattern timing;
3. Euclidean gap balance;
4. Risset layer relabeling;
5. bounded/deterministic fractal generation;
6. known Rule 90 behavior;
7. deterministic finite Lorenz integration;
8. Tonnetz axis/triad behavior;
9. malformed project diagnostics;
10. negative rational floor/modulo behavior;
11. deterministic seeded randomness and stable IDs;
12. Euclidean edge cases and rotations;
13. operator registry version/duplicate enforcement;
14. pattern event-budget enforcement.

This is foundation evidence only. It does not yet constitute browser, perceptual, accessibility, export, or full MVP validation.
