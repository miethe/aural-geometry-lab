# Prioritized MVP Backlog

> **Wave-1 authority note (2026-08-18):** `program/backlog.json` is the current backlog authority and now contains Wave-1 items through AGL-171.


Status values: **Done**, **Started**, **Ready**, **Research-gated**, **Planned**. The machine-readable source is `program/backlog.json`.

## Epic E0 — Program foundation

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-001 | P0 | Done | Program charter and MVP boundaries | Mission, users, in/out scope, gates, and exit criteria approved |
| AGL-002 | P0 | Done | Exact rational musical time | Normalized arithmetic and drift-free loop fixtures pass |
| AGL-003 | P0 | Done | Canonical event/pattern model | Interval query, event budgets, and looping behavior tested |
| AGL-004 | P0 | Done | Typed/versioned operator catalog | Initial definitions and port families compile |
| AGL-005 | P0 | Done | Seed and stable-ID utilities | Deterministic fixtures pass |
| AGL-006 | P0 | Done | Mathematical operator kernels | Euclidean, Risset, Tonnetz, fractal, CA, Lorenz implemented |
| AGL-007 | P0 | Done | Runnable browser foundation | Shell and labs build as static browser app |
| AGL-008 | P0 | Done | Initial invariant test harness | Fourteen tests pass from clean build |

## Epic E1 — Project and command model

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-010 | P0 | Ready | Full project schema and JSON Schema | Validate every project entity and preserve diagnostic paths |
| AGL-011 | P0 | Ready | Schema migration framework | Sequential, deterministic migrations with source preservation |
| AGL-012 | P0 | Ready | Project command bus | Atomic commands, inverse operations, undo/redo, transaction grouping |
| AGL-013 | P0 | Ready | IndexedDB repository | Autosave, recovery, list/open/duplicate/delete, storage diagnostics |
| AGL-014 | P0 | Planned | Asset store | Hash-addressed local samples with size/type/license metadata |
| AGL-015 | P1 | Planned | Portable project package | Manifest, JSON, assets, warnings, integrity hashes |

## Epic E2 — Graph compiler and evaluator

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-020 | P0 | Ready | Executable operator interface | Pure execution contract plus provenance formatter and budgets |
| AGL-021 | P0 | Ready | Port type checker | Invalid edges rejected before runtime with actionable messages |
| AGL-022 | P0 | Ready | Graph compiler | Topological plan, missing version detection, forbidden-cycle detection |
| AGL-023 | P0 | Ready | Worker evaluator | Cancellation, progress, deadline, structured errors |
| AGL-024 | P0 | Ready | Deterministic cache | Content-addressed keys and cache invalidation fixtures |
| AGL-025 | P0 | Ready | Evaluation budget service | Events, recursion, iteration, time, geometry, and memory limits |
| AGL-026 | P1 | Planned | Explicit state/delay operators | Bounded feedback semantics without zero-delay cycles |
| AGL-027 | P1 | Planned | Graph freeze-to-clip | Materialize a bounded interval with lineage and source reference |

## Epic E3 — Studio experience

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-030 | P0 | Ready | Production app scaffold | React/Vite build, routes, error boundaries, state seams, CI |
| AGL-031 | P0 | Ready | Transport | Play/pause/stop/seek/loop, tempo/meter, exact position display |
| AGL-032 | P0 | Ready | Timeline and clips | Trigger/note/control lanes, selection, zoom, generated/frozen distinction |
| AGL-033 | P0 | Ready | Tracks and mixer | Mute/solo/gain/pan/voice selection and safe master path |
| AGL-034 | P0 | Ready | Typed visual graph | Node/edge editing, validation, keyboard path, minimap optional |
| AGL-035 | P0 | Ready | Mathematical inspector | Equation, plain explanation, live values, mapping stages, bypass |
| AGL-036 | P0 | Ready | Linked selection | Event/node/geometry/provenance cross-highlighting |
| AGL-037 | P1 | Planned | Guided experiment player | Step, claim, manipulation, observation, explanation, reset |
| AGL-038 | P1 | Planned | Preset browser | Tags, lineage, thumbnails, compatibility and research status |

## Epic E4 — Audio and rendering

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-040 | P0 | Started | Native Web Audio reference backend | Current preview expanded behind render-plan interface |
| AGL-041 | P0 | Ready | Audio render plan | Same canonical plan drives real-time and offline paths |
| AGL-042 | P0 | Ready | Instrument voice registry | Oscillator, noise/percussion, sampler, envelopes, filters |
| AGL-043 | P0 | Research-gated | Scheduler hardening | Integrate DR-03, benchmark late events and rescheduling |
| AGL-044 | P0 | Ready | AudioWorklet bridge | Message protocol, generation IDs, teardown, fallback |
| AGL-045 | P0 | Ready | Offline WAV render | Render selected range/project, cancellation, progress, manifest |
| AGL-046 | P1 | Planned | Optional Tone.js adapter | Contract tests prove semantic equivalence for supported plans |
| AGL-047 | P1 | Planned | Faust/WASM DSP proof | One advanced effect with reproducible native/offline behavior |
| AGL-048 | P1 | Planned | Web MIDI adapter | Feature detection, permission UX, clock/latency documentation |
| AGL-049 | P0 | Ready | Gain and emergency-stop safety | Conservative defaults, master dynamics, grouped teardown tests |

## Epic E5 — Visualization platform

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-050 | P0 | Ready | Projection contract | Operators emit testable primitives and semantic descriptions |
| AGL-051 | P0 | Ready | Shared 2D canvas | Zoom/pan/pick/export, high-DPI, bounded render workload |
| AGL-052 | P1 | Planned | 3D canvas adapter | Used only by Chaos/Penrose or justified views, reduced-motion mode |
| AGL-053 | P0 | Ready | Accessible mathematical descriptions | Text state for selected geometry and transformations |
| AGL-054 | P1 | Planned | Visual snapshot/video export | Deterministic frames and attribution/metadata |

## Epic E6 — Infinite Staircase

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-060 | P0 | Started | Migrate preview to canonical graph | Source pattern and Risset operator are project nodes |
| AGL-061 | P0 | Research-gated | Psychoacoustic parameter profile | DR-01 accepted defaults and comparison presets |
| AGL-062 | P0 | Ready | Log-tempo visualization | Layer, gain, phase, relabel, dominant-band states linked to audio |
| AGL-063 | P0 | Ready | Source-pattern/subdivision engine | Retention/shedding rules deterministic and visible |
| AGL-064 | P1 | Planned | Shepard pitch coupling | Independent toggle, bounded gain/pitch, documented interaction |
| AGL-065 | P0 | Ready | Listening-test fixture | Blind reset detection and perceived acceleration protocol |

## Epic E7 — Euclidean Rings

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-070 | P0 | Started | Multi-ring canonical sequencer | 1–8 rings, exact patterns, deterministic playback/export |
| AGL-071 | P0 | Research-gated | Algorithm/preset evidence | DR-02 accepted conventions and labels |
| AGL-072 | P0 | Ready | Direct ring manipulation | Drag rotation/phase with keyboard equivalent |
| AGL-073 | P0 | Ready | Composite cycle analysis | Gaps, alignments, bounded LCM summary |
| AGL-074 | P1 | Planned | Accents/probability layer | Seeded probability separated from Euclidean generation |

## Epic E8 — Tonnetz Walk

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-080 | P1 | Started | Coordinate/triad computational preview | Existing kernel becomes versioned operator |
| AGL-081 | P1 | Research-gated | Tonnetz convention and transformations | DR-04 selects exact model and terminology |
| AGL-082 | P1 | Ready | Interactive path editor | Draw/edit path, select chords, stable graph IDs |
| AGL-083 | P1 | Ready | Deterministic voicing optimizer | Cost model, constraints, tie-breaking, provenance |
| AGL-084 | P1 | Planned | MIDI/MusicXML harmony export | Independent consumer fixtures pass |

## Epic E9 — Fractal Motif

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-090 | P1 | Started | Bounded recursion preview | Existing kernel retained and generalized |
| AGL-091 | P1 | Research-gated | Grammar/model selection | DR-05 accepted operators and claims |
| AGL-092 | P1 | Ready | Seed motif editor | Draw/play/import bounded note motif |
| AGL-093 | P1 | Ready | Recursion tree and ancestry | Select any note and trace exact generation path |
| AGL-094 | P1 | Ready | Growth forecast and freeze | Predict limit, prevent runaway, materialize selected depth |

## Epic E10 — Cellular Automaton Orchestra

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-100 | P1 | Started | Elementary CA preview | All rules/boundaries/seeds under canonical model |
| AGL-101 | P1 | Research-gated | Sonification and 2D scope | DR-06 selects musically meaningful mappings |
| AGL-102 | P1 | Ready | Rule-step inspector | Neighborhood bits and resulting cell state explained |
| AGL-103 | P1 | Ready | Cell lineage and event provenance | Grid selection links to generated event and history |
| AGL-104 | P1 | Planned | Validated richer mode | One accepted 2D or alternative extension with bounded worker execution |

## Epic E11 — Chaos Attractor

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-110 | P1 | Started | Lorenz RK4 preview | Existing implementation becomes parameterized operator |
| AGL-111 | P1 | Research-gated | Numerical/mapping profile | DR-07 selects integrators, windows, smoothing, claims |
| AGL-112 | P1 | Ready | Control-signal pipeline | Sample → normalize → smooth → quantize → constrain visible |
| AGL-113 | P1 | Ready | Live/frozen trajectory modes | No future-window leakage in live mode |
| AGL-114 | P1 | Planned | Nearby-initial-condition comparison | Synchronized state and divergence explanation |

## Epic E12 — Penrose Sequencer

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-120 | P1 | Research-gated | Exact tiling implementation selection | DR-09 accepted with reference fixtures |
| AGL-121 | P1 | Research-gated | Deterministic finite patch generator | No gaps/overlaps, stable IDs, documented clipping |
| AGL-122 | P1 | Research-gated | Adjacency graph | Symmetric shared-edge adjacency and no false clipped edges |
| AGL-123 | P1 | Planned | Traversal/mapping engine | At least three bounded deterministic traversal presets |
| AGL-124 | P1 | Started | Honest research-gated UI | Current placeholder explicitly avoids false tiling claim |

## Epic E13 — Export, accessibility, quality, release

| ID | Priority | Status | Item | Acceptance summary |
|---|---:|---|---|---|
| AGL-130 | P1 | Ready | MIDI exporter | Tempo/meter, notes/triggers, deterministic quantization warnings |
| AGL-131 | P1 | Ready | MusicXML subset exporter | Documented supported subset and validator fixtures |
| AGL-132 | P0 | Ready | Accessibility baseline | Keyboard, focus, semantics, reduced motion, non-color cues |
| AGL-133 | P0 | Ready | Property/invariant test suite | Generators and laws for time/operators/geometry |
| AGL-134 | P0 | Ready | Cross-browser audio harness | Real-time and offline probes across support matrix |
| AGL-135 | P0 | Ready | End-to-end lab smoke suite | Open preset, play, change, save, reopen, export |
| AGL-136 | P0 | Planned | Dependency/license review | Lockfile, notices, sample rights, AGPL boundary review |
| AGL-137 | P0 | Planned | Private-beta release gate | Charter exit criteria and risk exceptions signed |

## Critical path

1. AGL-010–013 project spine.
2. AGL-020–025 graph/evaluation spine.
3. AGL-031–036 studio surfaces.
4. AGL-041–045 audio/render spine, dependent on DR-03.
5. P0 rhythm labs and initial DR-08 mapping conventions.
6. P1 labs in dependency order: Tonnetz/Fractal, CA/Chaos, Penrose.
7. Export/accessibility/browser hardening and release evidence.

## M0.5 pre-handoff additions — 2026-08-14

The machine-readable backlog now includes `AGL-140` through `AGL-151` covering the final UI/UX contract, cross-surface interaction semantics, design manifests, Swift portable-contract spike, React production shell, cross-platform fixtures, native iPad/iPhone stretch work, canonical mockups, accessibility hardening, and guided-experiment curriculum.

The authoritative status/dependencies remain in `program/backlog.json`.
