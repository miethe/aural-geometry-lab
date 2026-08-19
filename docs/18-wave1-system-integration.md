# Aural Geometry Lab — Wave 1 System-Wide Integration

**Architecture baseline:** v0.3.0  
**Integration date:** 2026-08-18  
**Status:** Accepted architecture baseline for M1 implementation and swarm handoff  
**Research integrated:** DR-01, DR-03, DR-08, DR-09, DR-11, DR-12, DR-14, DR-15, including each completed report and its Research Integration Packet

## TL;DR

Wave 1 resolves AGL into a single coherent product architecture rather than eight adjacent research recommendations.

The integrated system is **contract-first, browser-first, and native-ready**. Exact project and musical semantics remain platform neutral. TypeScript is the executable browser reference during stabilization; Swift implements only bounded native capabilities against the same schemas and fixtures. A shared Rust or Swift/Wasm core is deferred until measured evidence proves a material problem.

The runtime is split into a canonical semantic project, typed operator graph, deterministic worker evaluator, immutable backend-neutral audio plan, and replaceable web/native adapters. Exact rational musical time remains above audio; analytic or tempo mapping resolves into ideal seconds; each backend quantizes those times once into sample frames.

The UI is one studio with three workspace projections—**Explore, Compose, and Inspect**—over the same project, selection, command bus, transport, and undo history. Generated output is never silently edited in place. Users explicitly edit the generator, add a downstream exception/operator, fork it, or materialize a bounded result.

The shared sonification model is an explicit, versioned pipeline. Penrose geometry uses exact pentagrid/Q(phi) topology. Risset uses exact logarithmic rate and phase closure, with optional cinematic or perceptual additions represented as separate graph stages.

## 1. Integration objective

The research runs were intentionally independent. That produced valuable breadth, but also predictable overlap and disagreement around:

- where exact time ends and audio time begins;
- whether an audio render plan is rational-time or seconds-based;
- how generated, frozen, edited, and stale material are represented;
- whether Risset gain should be linear-partition or power normalized;
- whether an iPad document package and a browser-downloadable project are one physical format;
- whether the native application should share implementation or only semantics;
- which UI states belong in the project, undo history, session, or derived runtime;
- how cancellation, caching, audio cutover, and async freshness relate;
- how mathematical data becomes musical output without hiding representational changes.

This integration resolves those overlaps as one constraint system. The decision authority order is:

1. mathematical or standards-level invariants;
2. accepted AGL ADRs and cross-run contracts;
3. language-neutral schemas and golden fixtures;
4. implementation behavior;
5. UI presentation and product defaults.

A report recommendation does not become architecture merely because it is detailed. Conflicts are resolved explicitly below and recorded in `program/wave1-decision-register.json`.

## 2. Source disposition

The repository now contains immutable copies and hashes of all Wave 1 evidence under:

```text
research/completed/wave-1/
├── evidence-manifest.json
├── reports/
└── integration-packets/
```

The original research reports remain the evidence record. The Integration Packets remain high-value domain distillations. This document and the accepted ADRs are the cross-domain implementation authority.

## 3. Principal reconciliations

### 3.1 Exact time versus audio time

The reports agree that AGL musical structure must use exact rational time, but DR-01 establishes that generic Risset event times contain logarithms and are not rational. DR-03 requires an immutable seconds-based Web Audio scheduling boundary. DR-12 proposes native sample-time scheduling and retains rational source semantics.

The integrated rule is:

```text
Exact project / musical / source-domain semantics
                    │
                    ▼
        deterministic temporal resolution
        tempo maps + analytic mappings
                    │
                    ▼
     backend-neutral ResolvedAudioPlan
           ideal times in seconds
        source-time/provenance retained
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
Web Audio schedule       Native AV schedule
AudioContext seconds     integer sample frames
```

Rational beats remain canonical project values. Audio plan events use ideal seconds because every supported backend can consume them. Events retain a temporal-origin record showing the exact beat, source phase, or analytic mapping that produced the seconds value. Backends never repeatedly add rounded inter-event durations.

The version-1 sample-frame rule for nonnegative ideal times is:

\[
F_R(t)=\left\lfloor Rt+\frac12\right\rfloor
\]

where `R` is sample rate. The quantization-version identifier is part of plan and execution provenance.

### 3.2 One render authority, not competing plans

The term “render plan” was used at different abstraction levels across reports. The integrated system uses:

- **EvaluationResult** — domain outputs in mathematical, graph, pattern, control-signal, geometry, and provenance forms.
- **ResolvedAudioPlan** — immutable backend-neutral audio semantics in ideal seconds.
- **BackendSchedule** — transient browser/native scheduling representation in context times or sample frames.

Only the first two are stable cross-platform contracts. Backend schedules are never persisted into `project.json`.

Real-time and offline rendering consume the same ResolvedAudioPlan and voice definitions. This requires exact agreement in event identity, ordering, ideal time, target parameters, approximations, and source lineage. It does **not** require byte-identical PCM across different browser engines or implementation-sensitive system effects.

### 3.3 Risset normalization conflict

The DR-01 Integration Packet recommended a power-domain raised-cosine default but explicitly lacked access to the completed report. The completed report recommends a raised-cosine **linear partition**, half-width `B=2`, and derives a useful phase-independent sum and nominal-power property for that construction.

The integrated decision is:

- envelope domain and normalization are explicit versioned semantics;
- the canonical MVP preset uses raised-cosine linear partition with `B=2`;
- an equal-power/L2 mode remains an explicit comparison condition;
- neither is described as “constant perceived loudness”;
- `20 s`, `120 BPM`, and `B=2` are engineering defaults supported by construction analysis, not universal psychoacoustic optima;
- final P0 preset acceptance still requires the listening harness.

### 3.4 Project package conflict

A native package is naturally a directory in Files/iCloud. A web user normally receives one downloadable archive. These are not the same physical container.

The integrated system defines one **logical package**:

```text
manifest.json
project.json
assets/<content-hash>.<extension>
preview/*                       # optional and non-authoritative
research-receipts/*             # optional
```

It permits two physical profiles:

- `agl.native-directory-package.v1`
- `agl.portable-archive.v1`

Both must expose the same logical member set and semantic package hash. Archive metadata, compression, file timestamps, and previews do not affect semantic identity.

### 3.5 Material state conflict

“Live Generated,” “Snapshot,” “Edited,” and “Stale” were initially presented as one state set. That mixes origin/editability with source relationship.

The canonical model separates:

```text
MaterialKind
  UserAuthored
  LiveGenerated
  Snapshot
  EditedDerivative

SourceStatus — derived, not authoritative persisted truth
  NotApplicable
  Current
  Changed
  Missing
  Detached
```

A snapshot becomes `SOURCE CHANGED` when the semantic dependency digest of its source recipe differs from the digest in its materialization receipt. Unrelated layout, naming, or track edits do not stale it.

### 3.6 Shared implementation conflict

The native and cross-platform reports converge on a selective strategy:

- shared contracts now;
- duplicate only bounded behavior needed for native proof;
- shared implementation only after evidence.

TypeScript remains the executable browser reference, but accepted fixtures and specifications outrank it. Swift consumes the same wire models and conformance cases. JavaScriptCore is a pinned XCTest/debug oracle only. Rust and Swift/Wasm remain future candidates for coarse-grained exact or compute-heavy kernels.

## 4. Integrated system architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         STUDIO EXPERIENCE                           │
│ Explore │ Compose │ Inspect                                        │
│ Browser │ Canvas │ Timeline │ Graph │ Inspector │ Mixer │ Guide     │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ semantic intents / immutable views
┌───────────────────────────────▼─────────────────────────────────────┐
│                 COMMAND + SESSION COORDINATION                      │
│ ProjectStore │ CommandDispatcher │ Undo/Redo │ Preview sessions     │
│ Selection/Focus/Hover │ Workspace/session state │ Transport intent   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ validated canonical transactions
┌───────────────────────────────▼─────────────────────────────────────┐
│                    CANONICAL PROJECT MODEL                          │
│ Project schema v2 │ exact rational time │ graph │ tracks/materials  │
│ assets │ lineage │ operator versions │ seeds │ evidence metadata    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ compile / semantic dependency digest
┌───────────────────────────────▼─────────────────────────────────────┐
│                 TYPED OPERATOR + MAPPING RUNTIME                    │
│ ports/dimensions │ temporal semantics │ constraints │ identity      │
│ graph compiler │ budgets │ deterministic cache │ provenance         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ cancellable immutable requests
┌───────────────────────────────▼─────────────────────────────────────┐
│                    WORKER EVALUATION PLANE                          │
│ exact/discrete kernels │ numerical profiles │ geometry │ patterns   │
│ preview/committed channels │ generation/hash acceptance             │
└───────────────┬───────────────────────────┬──────────────────────────┘
                │                           │
                ▼                           ▼
       VisualizationProjection       ResolvedAudioPlan
                │                           │
        Canvas/SVG/WebGL/Metal       realtime + offline adapters
```

### 4.1 State strata

AGL presents one editor but does not use one undifferentiated store.

| State stratum | Examples | Project persisted | Global undo |
|---|---|---:|---:|
| Authoritative project | nodes, edges, tracks, materials, parameters, assets | Yes | Yes |
| Presentation metadata | graph layout, authored canvas annotations | Selected fields | Yes when authored |
| Studio session | workspace, open panels, camera, focus, selection | No | No |
| Interaction preview | drag delta, scrub value, connection candidate | No | No |
| Temporary override | future A/B candidate | No | Local only; deferred |
| Derived state | events, geometry, provenance index, plan, cache | No | No |
| Runtime state | playhead, audio context, active generation, route | No | No |
| Durable lineage | materialization/migration receipts | Yes | Produced by commands |

### 4.2 Digest vocabulary

The integrated architecture distinguishes:

- `sourceDigest` — hash of bytes originally opened;
- `semanticProjectDigest` — canonical semantic state, excluding nonsemantic session/layout data;
- `dependencyDigest` — transitive result-affecting closure for one operator/material/output;
- `semanticEnvironmentDigest` — operator/catalog/profile versions needed to interpret a request;
- `artifactDigest` — content hash of a materialized payload or asset;
- `renderPlanDigest` — canonical audio-plan serialization;
- `executionReceiptDigest` — backend and environment receipt.

Using one “project hash” for all of these would cause false invalidation and weak provenance.

## 5. Canonical project and package model

Project schema v2 must include:

- project identity and timestamps;
- compatibility/version profile;
- deterministic generation context;
- exact tempo map and meter values;
- tracks and routes;
- typed/versioned operator graph;
- materials and lineage;
- asset references;
- lab/preset state that is genuinely authored;
- optional presentation metadata whose semantic-digest treatment is explicit.

It must exclude:

- live selection/focus/hover;
- transport position and audio-engine state;
- browser or native device identifiers;
- current scheduler horizon;
- backend implementation names as project meaning;
- worker generations and caches;
- current source-status labels, which are derived.

### 5.1 Exact wire values

Every arbitrary-size rational is:

```json
{
  "numerator": "-123456789012345678901234567890",
  "denominator": "960"
}
```

The canonical value has a positive denominator, coprime components, and zero as `0/1`.

### 5.2 Deterministic generation

Projects and provenance record:

- PRNG algorithm ID and version;
- seed encoding version;
- seed value;
- stream identity;
- stable-ID algorithm version;
- operator semantic version.

“Same seed” without this context is not a reproducibility contract.

### 5.3 Migration

Migration is deterministic and sequential. Opening a migrated project creates a new project epoch and active undo baseline. Source bytes/hash are retained. Migration receipts record entity continuation, split, merge, and retirement. Active undo need not survive application/schema boundaries; lineage must.

## 6. Operator, signal, and sonification contract

### 6.1 Operator metadata

Each operator declares:

- type and semantic version;
- conformance class: `exact`, `profileNumeric`, or `renderOnly`;
- typed input and output ports;
- `DimensionSpec` and units;
- temporal semantics;
- deterministic inputs and seed requirements;
- budget dimensions;
- generated identity capability;
- parameter specifications;
- invariant-preservation metadata;
- provenance/trace schema.

### 6.2 Port and dimension model

A scalar `number` is insufficient. Port values identify:

- storage/value kind;
- unit;
- measurement semantics: nominal, ordinal, interval, ratio, circular, topological;
- domain and period;
- missing/nonfinite policy;
- clock/time domain where relevant.

Graph validation may permit a creative transform while warning that it destroys an invariant required by a preset’s fidelity claim.

### 6.3 Mapping pipeline

The canonical explanatory order is:

```text
Source
  ↓
Sample
  ↓
Normalize
  ↓
Smooth
  ↓
Transform
  ↓
Quantize / Threshold
  ↓
Constrain
  ↓
Target
```

Stages may repeat and may be reordered when explicitly represented. “Raw ↔ Musical” normally compares mapped-preconstraint output with shaped-postconstraint output.

Every trace shows:

- input value and unit;
- operator/version/parameters;
- temporal/window/state semantics;
- random decision, if any;
- output value;
- constraint delta and reason;
- diagnostics;
- final target.

### 6.4 Causality

Temporal semantics are:

- `pointwise`;
- `causal-stateful` with reset policy;
- `bounded-lookahead` with declared latency;
- `whole-window` with immutable window/fitted-state reference.

A zero-latency live graph cannot contain future-dependent operators. Offline rendering may use whole-window operations only when the window and fitted state are explicit. Offline rendering never silently substitutes a “better” normalization for the live semantics.

### 6.5 Constraints and randomness

Randomness is never hidden in a deterministic generator or constraint. It is a seeded operator with stable stream identity. Hard and soft constraints have explicit priorities and conflict outcomes. Constraint modifications are traceable and bypassable where mathematically safe.

## 7. Commands, undo, and asynchronous derivation

### 7.1 Gesture lifecycle

```text
Idle
  └── begin ──► Previewing
                  ├── preview* ──► Previewing
                  ├── cancel ────► Idle
                  └── commit ────► Validate ──► Commit | Conflict | No-op
```

Preview affects effective UI/audio through a preview channel, not the project or global history. Returning to the exact canonical start value is a no-op with no revision or redo invalidation.

### 7.2 Command envelope

Commands carry:

- command and transaction IDs;
- logical action/edit-session ID;
- actor and origin;
- project epoch;
- schema/payload version;
- canonical target and write sets;
- fine-grained preconditions;
- payload;
- lineage.

Global revision remains useful ordering/dirty metadata, but nonoverlapping edits can still commit when their field/input preconditions remain valid. The core validates and derives the inverse from pre-state.

### 7.3 Coalescing

Commands coalesce only within the same explicit edit session and compatible target/write set. Time proximity alone is never sufficient. A merged value edit preserves the first before-state and final after-state.

### 7.4 Selection and focus

Selection, primary selection, focus, hover, related highlight, range anchor/head, and orphaned generated references remain separate. Focus does not automatically select multi-selectable or expensive entities. Related provenance is highlighted, not added to selection.

A generated identity that disappears becomes an orphan/ghost. It never retargets to the nearest event or tile. It may reactivate only if the exact identity returns and the user’s selection-intent epoch has not changed.

### 7.5 Async acceptance

Every derived request carries:

```text
projectEpoch
scopeId
channel = committed | preview | override
requestId
generation
inputDigest
semanticEnvironmentDigest
budgetProfile
```

A result becomes current only if all acceptance dimensions match the current request and its integrity validates. Cancellation saves resources; it does not establish freshness. A stale deterministic result may enter an appropriate cache but may not publish itself as current.

## 8. Generated material and materialization

Generated output is a projection, not implicitly authored data.

When the user tries to edit it, the semantic choices are:

1. edit the generator globally;
2. add a downstream transformation or sparse exception;
3. fork the generator and redirect selected consumers/ranges;
4. materialize a bounded result;
5. cancel.

Sparse exceptions require stable or successor-mapped generated identity. Ephemeral output cannot safely support targeted persistent exceptions.

### 8.1 Materialization

Materialization is two phase:

1. **Prepare:** evaluate an exact half-open range against a captured source dependency digest; create a bounded payload and content hash.
2. **Commit:** validate that the relevant dependency digest is unchanged; create the snapshot/material and immutable receipt in one transaction.

The receipt contains:

- source recipe or immutable source-subgraph snapshot;
- exact range;
- source dependency digest;
- semantic environment/profile versions;
- artifact digest and asset reference;
- seed/stream context;
- lineage.

A source change never silently rewrites the payload. Re-materialization creates an explicit successor.

## 9. Audio architecture

### 9.1 Web

- Native Web Audio is the reference backend.
- Worker: graph evaluation and plan expansion.
- Main/control thread: AudioContext lifecycle, graph creation, look-ahead queue servicing.
- AudioWorklet: custom DSP, dense voice mixing, exact-frame dispatch, bounded queue and smoothing.
- MessagePort batched messages are baseline; SharedArrayBuffer is an optional capability-negotiated optimization.
- One-shot source nodes are disposable; decoded buffers and buses are reusable.

Initial benchmark profile:

```text
wake interval      25 ms
minimum horizon   100 ms
maximum horizon   250 ms provisional
```

The horizon grows from measured wake jitter, but does not grow without bound because excessive pre-scheduling harms edit/cancellation responsiveness.

### 9.2 Live plan activation

Committed graph revisions compile into candidate plans. During playback, runtime may track:

- last valid plan;
- candidate plan;
- armed plan;
- active plan;
- error/muted affected scope.

Static-invalid graph edits do not commit. Runtime failure does not silently claim the old audio represents the new graph. Exact cutover/crossfade and tail policies are part of the audio contract and tests.

### 9.3 Offline

Offline rendering uses the same plan and voice definitions. The browser reference preconstructs the graph before `startRendering`; it does not depend on nonportable offline suspend checkpoints. Native uses a separate manual-rendering AVAudioEngine rather than putting the live device engine into offline mode.

Exports record backend, build, sample rate, plan hash, voice versions, assets, approximations, and safety scaling. Browser/native PCM identity is not promised; AGL-owned deterministic DSP may establish stronger same-build guarantees.

### 9.4 Native

A process-wide coordinator owns AVAudioSession, route/interruption/media-reset state, and MIDI endpoints. MVP permits one audible project session at a time. Multiple project windows remain semantically independent.

Core MIDI uses UMP internally. iPhone remains a companion/player/controller surface; iPad is the only native authoring target under the stretch milestone.

## 10. UX architecture

### 10.1 One shell, three workspaces

**Explore** foregrounds the mathematical object, immediate sound, macro controls, guided comparison, and concise explanation.

**Compose** foregrounds timeline, tracks, clips/materials, mixer, routing, reusable presets, and bounded export.

**Inspect** foregrounds typed graph, exact parameters, equations, causality, provenance, diagnostics, validation status, and raw-versus-shaped comparison.

Workspace changes never alter capability, project identity, command semantics, selection, transport, or history.

### 10.2 Shared component semantics

Every editable parameter has one `ParameterSpec` that drives pointer, touch, Pencil, keyboard, numeric entry, accessibility actions, reset, units, clamp/wrap/reject behavior, and coarse/fine adjustment. A generic slider is not used for cyclic, rational, vector, topological, or stochastic parameters without explicit adaptation.

Graph connection preview uses the executable type checker. Invalid connections do not enter normal canonical state. Auto-layout is explicit, local, previewable, and undoable.

### 10.3 Accessibility

- no essential drag-only operation;
- no color-only state;
- keyboard and semantic focus on all major surfaces;
- reduced-motion representation;
- ordered text/table equivalent for geometry, graph, mapping, and audio meanings;
- screen-reader announcements derived from the same semantic model;
- accessible exact-value and explanation path for every sonified variable.

Touch target sizes are product targets requiring device calibration, not scientific thresholds.

## 11. Laboratory integration

### 11.1 Infinite Staircase

Canonical `rhythm.risset@1` uses 2:1 tempo-octave equivalence. Generalized ratios are labeled barberpole-tempo behavior.

Core semantics:

\[
q(t)=q_0+d\frac{t-t_0}{T}
\]

\[
\nu_k(t)=\nu_{ref}r^{k+q(t)}
\]

\[
\nu_k(t+T)=\nu_{k+d}(t)
\]

Source phase is analytic and unwrapped; wrapping is presentation-only. Event identities depend on operator/version, source event, conceptual layer, and source-cycle ordinal—not renderer slots or scheduler chunks.

Canonical MVP construction defaults:

- ratio `2`;
- cycle `20 s`;
- center `120 BPM`;
- raised-cosine linear partition;
- half-width `B=2`;
- fixed synthetic pulse;
- anchor, subdivision shedding, 3:2 ambiguity, and pitch coupling off.

Optional stages remain independent graph nodes. The product never claims an exact reconstruction of proprietary soundtrack implementation details.

### 11.2 Euclidean Rings

Wave 1 did not include DR-02, so existing Euclidean semantics remain provisional where conventions differ. DR-08 applies immediately: probability, accent, scale, and musicality remain explicit downstream stages rather than hidden inside distribution.

### 11.3 Tonnetz, Fractal, CA, and Chaos

Their current computational previews remain valid foundations. The shared mapping, provenance, generated identity, temporal-semantics, and numerical-profile contracts now govern their production migration. DR-04 through DR-07 remain lab-specific gates.

### 11.4 Penrose Sequencer

Production geometry is a certified regular de Bruijn pentagrid emitting P3 rhombs. Topological decisions use exact integer and Q(phi) arithmetic. Float coordinates are render projections only.

Canonical identity:

- tile: normalized pair of grid-line addresses;
- vertex: canonical five-integer tuple;
- edge: sorted canonical endpoint IDs;
- entity reference: producer node + geometry configuration hash + local ID.

A patch is a query into one infinite configured tiling. It returns canonical full tiles, completeness/halo status, and explicit truncation. Clipped polygons are visualization fragments and cannot create topology.

The mathematical construction is accepted, but lab completion remains blocked until the repository contains and reproduces:

- default-phase regularity certificate;
- golden fixture bytes;
- pentagrid and cut-and-project prototype/oracle implementations;
- legal vertex-star corpus;
- matching-decoration corpus;
- deterministic traversal fixtures.

## 12. Cross-platform and native strategy

### 12.1 Normative shared assets

The following are language neutral:

- JSON schemas and migration fixtures;
- exact rational wire format;
- PRNG/stable-ID vectors;
- operator metadata and golden outputs;
- command/interaction model fixtures;
- project/package corpus;
- render-plan fixtures;
- Penrose exact fixtures;
- numerical profiles and checkpoint tolerances;
- benchmark manifests.

### 12.2 Implementation posture

- TypeScript reference remains required through M1–M2 stabilization.
- Swift grows only through accepted native capabilities and shared fixtures.
- JavaScriptCore runs the pinned TypeScript reference in tests/debug only.
- Optional systems kernels are pure, coarse-grained request/result services.
- Host runtimes retain graph orchestration, commands, caches, scheduling, and project mutation.
- No domain core executes in the audio callback.

### 12.3 Shared-core trigger

A shared kernel bakeoff begins only after semantic readiness and a material problem, such as repeated accepted-workload budget breaches or sustained duplicated-semantics maintenance cost. The current research proposes governance thresholds but they remain provisional until FR-08.

## 13. Evidence and product claims

Every educational or marketing claim belongs to one of:

- **Direct:** theorem, standard, primary evidence, or validated AGL result.
- **Qualified:** supported only with explicit scope or caveat.
- **Experimental:** product hypothesis under study.
- **Prohibited:** unsupported, misleading, or contradicted.

Examples:

- Direct: a regular pentagrid can generate a Penrose rhomb tiling under the accepted construction.
- Qualified: a Risset construction can create an apparent continuous acceleration; exact perceived strength varies.
- Experimental: a 3:2 metric overlay strengthens the Infinite Staircase illusion.
- Prohibited: a finite rendered patch proves global aperiodicity; the Troy soundtrack used a specific unverified layer count/envelope; a browser gain value guarantees hearing safety.

## 14. Accepted, deferred, and blocked work

### Accepted before M1 freeze

- schema v2 wire and migration baseline;
- logical package contract;
- command/preview/undo model;
- semantic dependency digests;
- typed operator and mapping contracts;
- generated identity and material model;
- derivation acceptance barrier;
- audio-plan boundary;
- cross-platform fixture formats;
- workspace/selection/parameter semantics.

### Deferred

- production A/B override sessions;
- arbitrary Penrose phase editing;
- production shared Rust or Swift/Wasm core;
- production JavaScriptCore runtime;
- full iPhone authoring studio;
- generic imported-audio time stretching/source separation;
- MIDI Clock/MTC/SysEx as core synchronization;
- claims of browser/native bit-identical PCM.

### Empirically blocked

- final scheduler/event-density/device support thresholds;
- final Risset “convincing” preset claims;
- Penrose completion until missing artifacts are reproduced;
- shared-core adoption;
- native FileDocument conflict policy and physical-container selection;
- final cross-platform floating-point numerical profile.

## 15. Implementation sequence

### Integration Gate 0 — completed in this package

- research evidence checked in and hashed;
- cross-run decisions recorded;
- accepted ADR set created;
- foundational TypeScript contracts implemented;
- Swift conformance contract expanded;
- backlog and research status updated;
- verification expanded.

### Gate 1 — semantic spine

1. Project schema v2 and migration from prototype v1.
2. Canonical serialization/digest service.
3. Command dispatcher, transactions, inverses, preview sessions, and model tests.
4. Typed operator/mapping/parameter contract.
5. Generated identity, materialization receipts, and source-status derivation.
6. Worker derivation protocol and deterministic cache identities.

### Gate 2 — audio spine

1. ResolvedAudioPlan v1.
2. Worker plan compiler.
3. native Web Audio scheduler with generation cutover.
4. worklet protocol and dense voice proof.
5. offline render conformance.
6. scheduler/browser benchmark execution.

### Gate 3 — P0 labs

1. Migrate Infinite Staircase to analytic Risset events and accepted optional-stage graph.
2. Run automated Risset fixtures.
3. Complete Euclidean production profile after DR-02.
4. Run P0 UX and listening acceptance.

### Gate 4 — shared studio

1. React shell using one project/command/session architecture.
2. Explore/Compose/Inspect layouts.
3. typed graph and timeline.
4. inspector/provenance/raw-versus-shaped views.
5. accessibility from semantic projections.

### Gate 5 — remaining labs and native proof

- integrate DR-04–07, DR-13, DR-16;
- complete Penrose artifact recovery and exact implementation;
- execute bounded iPad Euclidean proof only after the project/package/audio contracts are stable.

## 16. Remaining system-level questions

1. Which BigInt implementation is accepted for Swift exact arithmetic?
2. Does the native physical project format use only a package directory, only an archive, or both profiles?
3. Does `FileDocument` pass destructive cloud conflict tests, or is `UIDocument` required?
4. What is the final floating-point profile for Lorenz and other long numerical runs?
5. What scheduler and density limits pass the declared browser/device benchmark matrix?
6. What is the exact live graph plan-activation/tail policy for each voice class?
7. Which missing DR-09 artifacts can be recovered directly versus regenerated independently?
8. What participant/equivalence analysis closes Infinite Staircase P0 acceptance?

These are explicit gates. They are not hidden ambiguity delegated to implementation agents.

## 17. Swarm handoff rule

Implementation agents should receive the raw research for provenance, but implement against:

1. accepted ADRs;
2. current schemas/contracts;
3. golden fixtures and tests;
4. backlog acceptance criteria;
5. this integration report.

Any change to public schema, mathematical meaning, deterministic output, cross-platform contract, materialization/undo semantics, evidence claim, or audio-plan boundary must return to architecture review rather than being locally improvised.
