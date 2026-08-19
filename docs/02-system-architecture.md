# System Architecture

> **Wave-1 authority note (2026-08-18):** The integrated architecture in `18-wave1-system-integration.md` and ADRs 0006–0018 supersedes conflicting earlier render-plan, material-state, package, and native-core language.


## 1. Architectural goals

The architecture must preserve musical exactness and mathematical explainability while supporting responsive browser interaction and reliable audio. It separates four concerns that are often entangled in music software:

1. **canonical mathematical/music state**;
2. **evaluation and provenance**;
3. **real-time/offline rendering**;
4. **visual interaction**.

## 2. Target logical architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Studio application                                                   │
│ Project library · Timeline · Mixer · Graph · Canvas · Inspector      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ commands / projections
┌───────────────────────────────▼──────────────────────────────────────┐
│ Application state and project service                               │
│ Transactions · Undo/redo · Autosave · Migration · Selection         │
└───────────────┬───────────────────────────────┬──────────────────────┘
                │                               │
┌───────────────▼────────────────┐  ┌───────────▼──────────────────────┐
│ Graph compiler/evaluator      │  │ Visualization projection layer   │
│ Typed ports · topo plan       │  │ 2D/3D geometry · picking · links │
│ cache · budgets · workers     │  │ labels · reduced-motion views    │
└───────────────┬────────────────┘  └──────────────────────────────────┘
                │ Pattern/Event/Signal + Provenance
┌───────────────▼──────────────────────────────────────────────────────┐
│ Canonical domain kernel                                             │
│ Rational time · Events · Patterns · Operators · Constraints · Seed │
└───────────────┬──────────────────────────────────────────────────────┘
                │ render plan
┌───────────────▼──────────────────────────────────────────────────────┐
│ Audio/render backends                                               │
│ Real-time Web Audio · AudioWorklet DSP · Offline render · MIDI      │
└──────────────────────────────────────────────────────────────────────┘
```

## 3. Proposed production repository

The current Sprint-0 repository is intentionally small. The production conversion should retain history while splitting packages as boundaries become real:

```text
apps/
  studio/                 Production web application
  research-harness/       Controlled listening tests and benchmarks
packages/
  core/                   Rational, events, patterns, tempo maps
  project/                Schema, migrations, persistence, packaging
  operators/              Pure mathematical/operator implementations
  graph-runtime/          Type checking, compilation, cache, workers
  audio/                  Render-plan API and browser implementations
  visualization/          Shared 2D/3D projections and interaction
  labs/                   Lab definitions, presets, guided experiments
  export/                 MIDI, WAV, MusicXML, image/video
  testing/                Fixtures, generators, invariant utilities
```

A monorepo is useful only after package APIs are enforced. Sprint 0 remains a single package to avoid premature tooling complexity.

## 4. Technology posture

### Studio UI

- React for production component/state composition.
- Vite for development and static bundling.
- A typed node-editor library such as React Flow for the operator graph, subject to keyboard/accessibility validation.
- Canvas/SVG for dense 2D sequencer and mathematical projections.
- Three.js only for justified 3D views.

### Domain and graph runtime

- TypeScript with strict checking.
- Pure functions/classes for deterministic operators.
- Web Workers for graph evaluation that can exceed an interactive-frame budget.
- Structured-clone-friendly data transfer; avoid shipping class instances across worker boundaries.

### Audio

- Native Web Audio as the reference engine and portability floor.
- A higher-level Tone.js adapter may accelerate scheduling/instrument work, but must not own canonical project semantics.
- AudioWorklet for custom DSP or controls requiring execution on the rendering thread.
- Faust-to-WebAssembly for advanced, tested DSP modules after the reference implementation is stable.
- OfflineAudioContext or an equivalent backend for deterministic non-real-time rendering.

### Persistence and interchange

- IndexedDB for local projects and sample blobs.
- JSON project format with schema versioning and explicit migration.
- MIDI for event interchange.
- WAV for rendered audio.
- MusicXML for basic quantized notation interchange.
- Optional Web MIDI behind capability detection and secure-context checks.

## 5. Canonical time model

### Rule

All authoring, pattern, clip, and provenance positions use exact rational beats:

```ts
interface BeatPosition {
  numerator: bigint;
  denominator: bigint;
}
```

Tempo maps translate beat positions to floating-point seconds only when creating a render plan. This prevents repeated operations such as thirds, tuplets, cyclic rotations, and long loops from accumulating floating-point timing drift.

### Tempo-map contract

```ts
interface TempoMap {
  beatToSeconds(beat: Rational): number;
  secondsToBeat(seconds: number): RationalApproximation;
  segmentAt(beat: Rational): TempoSegment;
}
```

MVP segments should support constant tempo and one explicitly selected transition model. All conversions must define boundary behavior exactly.

## 6. Event, pattern, and signal model

### Events

Canonical note and trigger events carry:

- stable event ID;
- exact start/duration;
- velocity and voice;
- pitch where applicable;
- tags;
- ordered provenance steps.

### Patterns

A pattern is queried over an interval rather than eagerly expanded:

```ts
interface Pattern<T extends TimedEvent> {
  id: string;
  cycle?: Rational;
  query(interval: BeatInterval, context: EvaluationContext): readonly T[];
}
```

This supports finite clips, loops, and potentially unbounded generators while allowing the engine to apply event budgets.

### Control signals

MVP control signals require two representations:

1. sampled, bounded points for editing/visualization;
2. render-time interpolation instructions for audio parameters.

The system must record sampling rate, interpolation, normalization, and smoothing because each materially changes the sonification.

## 7. Typed operator model

Each operator has:

- globally unique type name;
- integer implementation version;
- typed input/output ports;
- declarative parameter schema;
- deterministic/non-deterministic declaration;
- execution budget profile;
- documentation and provenance formatter;
- migrations for parameter-schema changes.

Core port families:

```text
pattern.trigger
pattern.note
signal.control
signal.audio
math.sequence
math.graph
math.geometry
constraints
visualization
```

A future operator SDK can add refinements, but MVP should avoid a type system so complex that graph authoring becomes inaccessible.

## 8. Graph compilation and evaluation

### Compilation pipeline

1. Validate schema and operator versions.
2. Resolve operator definitions.
3. Type-check connections.
4. Detect forbidden cycles.
5. Identify explicit delay/state boundaries.
6. Topologically order each acyclic region.
7. Calculate cache keys and execution budgets.
8. Produce evaluation and render plans.

### Cache key

```text
hash(
  operatorType,
  operatorVersion,
  normalizedParameters,
  inputContentHashes,
  queryInterval,
  projectSeed,
  evaluationProfileVersion
)
```

### Budgets

Every evaluation context includes:

- maximum output events;
- maximum recursion depth;
- maximum iterations/steps;
- maximum geometry primitives;
- wall-clock deadline;
- cancellation signal;
- optional memory estimate.

Exceeding a budget returns a typed diagnostic, not a browser hang or silent truncation.

## 9. Provenance architecture

Provenance is not an audit log bolted onto the UI. It is generated as part of operator evaluation.

```ts
interface ProvenanceStep {
  operatorType: string;
  operatorVersion: number;
  summary: string;
  inputEventIds: readonly string[];
  parameters: Readonly<Record<string, unknown>>;
  mathematicalState?: unknown;
  decisions?: readonly ConstraintDecision[];
}
```

Large projects should deduplicate shared provenance nodes into a directed acyclic provenance graph. Event records can reference provenance-node IDs rather than copying entire chains.

## 10. Audio architecture

### Render-plan boundary

The graph evaluator emits a stable render plan:

```ts
interface AudioRenderPlan {
  startBeat: Rational;
  endBeat: Rational;
  tempoMapVersion: number;
  events: readonly RenderEvent[];
  automation: readonly AutomationLane[];
  voices: readonly VoiceDefinition[];
}
```

The real-time backend schedules a rolling window. The offline backend consumes the same plan without UI timing constraints.

### Scheduling rules

- UI timers prepare queues; the Web Audio clock determines sound time.
- A bounded look-ahead horizon is adaptive within tested limits.
- AudioWorklet receives compact parameter/event messages when custom rendering-thread work is necessary.
- No mathematical graph traversal or DOM work occurs in the audio-rendering path.
- Rescheduling uses generation IDs so stale schedules can be ignored/stopped.

### Gain safety

- Conservative voice defaults.
- Per-track and master gain controls.
- Normalization policy for stacked/generated layers.
- Master compressor/limiter as a safety mechanism, not a substitute for correct gain staging.
- Emergency stop tracked by source group.

## 11. Visualization architecture

Each mathematical operator can expose one or more projection descriptors rather than rendering UI directly:

```ts
interface VisualizationProjection<TState = unknown> {
  kind: string;
  bounds: Bounds;
  primitives: readonly VisualPrimitive[];
  selectionLinks: readonly SelectionLink[];
  explanatoryState: TState;
}
```

Benefits:

- the same operator can power lab-specific and graph-inspector views;
- tests can validate geometry independent of pixels;
- accessible textual descriptions can derive from the same state;
- exact and illustrative projections can be labeled distinctly.

## 12. Project persistence and migration

### Project package

```text
project.agl/
  project.json
  assets/
  renders/          optional previews
  manifest.json
  licenses.json     when samples/assets are embedded
```

### Migration policy

- Never mutate imported source bytes in place.
- Validate before migration.
- Apply one deterministic migration per schema increment.
- Record source schema, target schema, migration IDs, and warnings.
- Permit read-only opening when a required operator is unavailable.

## 13. Security model

- Projects are declarative data.
- No `eval`, arbitrary JavaScript, dynamic module URLs, or executable plugins in MVP.
- Enforce file-size, decode-time, event, and geometry limits.
- Sanitize user-visible labels and imported metadata.
- Use a strict Content Security Policy in hosted builds.
- Request MIDI access only after explicit user intent.
- Do not upload local projects/audio by default.

## 14. Observability

Local diagnostic panel:

- audio context state and sample rate;
- scheduler horizon and late-event count;
- graph evaluation durations/cache hits;
- event/primitive counts against budgets;
- worker errors/cancellations;
- project migration warnings.

Telemetry, if later enabled, should report coarse performance/error metrics only and remain opt-in.

## 15. Architecture evolution from the current code

| Current foundation | Production MVP evolution |
|---|---|
| Native DOM UI | React studio shell and synchronized panels |
| Pure operator functions | Worker-backed typed graph evaluator |
| Static operator metadata | Executable operator contracts, migrations, docs |
| Native oscillator previews | Render-plan API, sampler, AudioWorklet, offline backend |
| In-memory lab state | Project transactions, undo/redo, IndexedDB, recovery |
| Simple canvas/SVG views | Projection model, selection links, optional Three.js |
| Partial project validator | Full schema validation, migrations, package importer |
| Node built-in tests | Unit/property/golden/E2E/browser performance suites |

The current mathematical kernel should be extracted rather than rewritten unless research exposes a correctness issue.
