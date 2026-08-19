# MVP Delivery Roadmap

> **Wave-1 authority note (2026-08-18):** Machine-readable milestone status in `program/program-plan.json` is authoritative; M0.75 is complete and M1 is started.


## 1. Planning model

This roadmap is sequence- and evidence-based. Calendar dates depend on confirmed staffing. The provisional capacity assumption is two product engineers, one product/UX owner, and part-time audio/computational-music research and QA support.

A realistic private MVP under that staffing is likely a multi-month effort. The program should not compress research, audio validation, accessibility, or mathematical correctness merely to satisfy a cosmetic demo date.

## 2. Workstreams

| Workstream | Scope |
|---|---|
| Product/UX | Studio interaction model, guided experiments, accessibility, user testing |
| Domain/runtime | Exact time, patterns, graph evaluator, constraints, provenance |
| Audio | Scheduling, voices/sampler, AudioWorklet, offline render, MIDI |
| Visualization | Shared projection model, 2D/3D canvases, linked selection |
| Laboratories | Seven lab implementations, presets, evidence, acceptance tests |
| Quality/research | Deep Research, fixtures, listening studies, performance/browser matrix |

## 3. Milestones

### M0 — Program start and executable foundation — complete

Delivered:

- chartered product and architecture;
- exact rational/event/pattern kernel;
- deterministic mathematical operators;
- runnable browser shell;
- two audio/visual vertical slices;
- four computational previews;
- research-gated Penrose placeholder;
- automated invariant tests;
- research charters and prioritized backlog.

Exit evidence:

- build succeeds;
- fourteen tests pass;
- package and documentation are handoff-ready.

### M1 — Production project/runtime spine

Outcomes:

- production studio scaffold;
- canonical project store, commands, undo/redo;
- complete schema validation and migrations;
- IndexedDB persistence/recovery;
- typed graph compiler and worker evaluator;
- execution budgets, cancellation, diagnostics, cache;
- baseline timeline and inspector.

Exit criteria:

- a project can round-trip deterministically;
- graph connections are type checked;
- a generated event can be traced to provenance;
- malformed/imported projects fail safely.

### M2 — Audio/render spine and rhythm-lab alpha

Outcomes:

- render-plan API;
- real-time scheduler with instrumentation;
- sampler and core synth voices;
- AudioWorklet proof and offline renderer;
- Infinite Staircase and Euclidean Rings migrated from previews into shared project/graph architecture;
- DR-01, DR-02, DR-03, and initial DR-08 decisions integrated.

Exit criteria:

- supported benchmark runs without unacceptable late scheduling;
- offline and real-time event plans agree;
- both rhythm labs satisfy mathematical acceptance suites;
- listening protocol identifies a convincing Infinite Staircase preset.

### M3 — Harmonic and recursive composition alpha

Outcomes:

- Tonnetz Walk complete;
- Fractal Motif complete;
- MIDI export;
- minimum MusicXML pipeline;
- freeze-to-clip workflow;
- cross-lab graph example: Euclidean → Tonnetz → Fractal.

Exit criteria:

- path/chord/voicing provenance agrees;
- recursive event budgets cannot be bypassed;
- exported fixtures open correctly in independent applications.

### M4 — Emergent systems alpha

Outcomes:

- Cellular Automaton Orchestra complete;
- Chaos Attractor complete;
- control-signal sampling/interpolation model;
- worker performance and cancellation hardening;
- guided comparison of determinism, pseudo-randomness, and chaos.

Exit criteria:

- known CA and numerical-integration fixtures pass;
- control mappings are bounded and visible;
- cross-lab modulation example works without audio-thread dependence on graph evaluation.

### M5 — Aperiodic geometry and full studio beta

Outcomes:

- DR-09 accepted;
- Penrose Sequencer exact geometry and traversal complete;
- visual operator graph and mature timeline/mixer;
- project packaging and offline WAV export;
- at least three cross-lab example projects;
- onboarding/guided experiment pass.

Exit criteria:

- Penrose geometry invariants and golden patches pass;
- full project package reopens without lost state/assets;
- all seven labs meet functional acceptance.

### M6 — Private MVP hardening and release gate

Outcomes:

- cross-browser matrix;
- accessibility audit/remediation;
- performance budgets and stress fixtures;
- recovery/failure-mode testing;
- dependency/license review;
- research claim/evidence review;
- representative user studies;
- release documentation.

Exit criteria:

- program-charter MVP exit criteria satisfied;
- no unresolved critical defects;
- high risks have accepted mitigation/exception;
- build is reproducible from lockfile and CI.

## 4. Research integration gates

| Gate | Needed by | Decision unlocked |
|---|---|---|
| DR-03 browser audio | M2 | Scheduler/audio backend architecture and browser budget |
| DR-08 mapping/evaluation | M2 initial, M6 final | Shared mapping vocabulary, explanations, study design |
| DR-01 Risset | M2 | Default envelopes/layers/comparison protocol |
| DR-02 Euclidean | M2 | Algorithm conventions and responsible presets |
| DR-04 Tonnetz | M3 | Coordinate convention, transformations, voice-leading model |
| DR-05 fractal | M3 | Grammar and meaningful self-similarity measures |
| DR-06 cellular automata | M4 | Mapping modes and optional 2D scope |
| DR-07 chaos | M4 | Integrators, normalization, smoothing, claims |
| DR-09 Penrose | M5 | Exact tiling algorithm and validation corpus |
| DR-10 audio import | Post-MVP | Whether/how arbitrary audio enters the product |

## 5. Staffing options

### Lean

- 1 senior product engineer
- 0.5 product/UX
- fractional researcher/audio specialist

Result: viable for continued prototyping, but the full MVP sequence becomes long and has concentration risk.

### Recommended

- 1 technical lead/product engineer
- 1 frontend/visualization engineer
- 1 audio/runtime engineer
- 0.5 product/UX
- 0.25–0.5 computational-music researcher
- fractional QA/accessibility

Result: workstreams can progress in parallel without sacrificing architectural coherence.

### Accelerated

Add a dedicated research engineer and QA automation engineer. Do not add many generalist engineers before M1 contracts stabilize; parallelism before the domain/runtime spine exists would increase rewrite risk.

## 6. Definition of done for any backlog item

- behavior and boundaries are documented;
- tests cover happy path, edges, and relevant invariants;
- diagnostics and failure states are usable;
- accessibility implications are addressed;
- provenance and deterministic behavior are preserved;
- performance is measured against the item's budget;
- user-facing claims link to accepted evidence;
- no unreviewed dependency/license is introduced.
