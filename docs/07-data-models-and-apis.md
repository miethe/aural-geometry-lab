# Data Models and APIs

> **Wave-1 authority note (2026-08-18):** Project v2, mapping, semantic commands, materialization, and `ResolvedAudioPlan` contracts in source/schemas and ADRs 0007–0011 supersede conflicting prototypes here.


## 1. Design rules

- Canonical project data is serializable and versioned.
- Big integers/rationals cross JSON boundaries as decimal strings.
- Runtime objects may use classes, but worker/project contracts use plain records.
- IDs are stable within deterministic generation and globally unique for authored entities.
- Operator parameters are normalized before hashing/evaluation.
- Units and interpolation are explicit.

## 2. Canonical rational JSON

```ts
interface RationalJson {
  numerator: string;
  denominator: string;
}
```

Validation:

- both strings are base-10 integers;
- denominator is nonzero;
- persisted values should be normalized to positive denominator and greatest-common-divisor form.

## 3. Canonical events

```ts
interface TimedEventJson {
  id: string;
  start: RationalJson;
  duration: RationalJson;
  velocity: number;          // [0, 1]
  tags: string[];
  provenanceNodeId: string;
}

interface TriggerEventJson extends TimedEventJson {
  kind: "trigger";
  voice: string;
}

interface NoteEventJson extends TimedEventJson {
  kind: "note";
  pitch: {
    midi: number;
    cents: number;
    spelling?: string;
  };
  voice: string;
}
```

Pitch-class identity, spelling, tuning offset, and final voiced register must not be collapsed into one ambiguous number when a lab depends on the distinction.

## 4. Project model

The existing `AuralGeometryProjectV1` is a minimal foundation. The target MVP schema adds explicit views, assets, tempo map, clips, operator definitions, and provenance roots.

```ts
interface AuralGeometryProjectV2 {
  schema: "agl.project";
  schemaVersion: 2;
  id: string;
  name: string;
  timestamps: {
    createdAt: string;
    modifiedAt: string;
  };
  seed: string;
  tempoMap: TempoMapJson;
  tracks: TrackJson[];
  clips: ClipJson[];
  graph: OperatorGraphJson;
  assets: AssetReferenceJson[];
  views: ViewStateJson;
  activeLab?: LabInstanceJson;
  provenanceRoots?: string[];
  extensions?: Record<string, unknown>;
}
```

`extensions` is data-only and namespaced. Unknown required features must block editable opening rather than being ignored.

## 5. Tempo map

```ts
type TempoSegmentJson =
  | {
      kind: "constant";
      startBeat: RationalJson;
      bpm: number;
    }
  | {
      kind: "linear-bpm";
      startBeat: RationalJson;
      endBeat: RationalJson;
      startBpm: number;
      endBpm: number;
    };

interface TempoMapJson {
  version: 1;
  meter: MeterChangeJson[];
  tempo: TempoSegmentJson[];
}
```

Linear BPM and linear seconds-per-beat are mathematically different. The schema must name the selected interpolation model, and conversion must be tested at boundaries.

## 6. Operator definition and executable contract

```ts
interface OperatorDefinitionV1 {
  type: string;
  version: number;
  name: string;
  category: string;
  deterministic: boolean;
  inputs: OperatorPortDefinition[];
  outputs: OperatorPortDefinition[];
  parameters: OperatorParameterDefinition[];
  budgets: OperatorBudgetProfile;
  documentationId: string;
}

interface OperatorExecutor<TInputs, TParameters, TOutputs> {
  evaluate(request: OperatorEvaluationRequest<TInputs, TParameters>):
    Promise<OperatorEvaluationResult<TOutputs>>;
}
```

### Evaluation request

```ts
interface OperatorEvaluationRequest<TInputs, TParameters> {
  nodeId: string;
  operatorType: string;
  operatorVersion: number;
  inputs: TInputs;
  parameters: TParameters;
  interval: BeatIntervalJson;
  seed: string;
  budget: EvaluationBudget;
  traceLevel: "none" | "summary" | "full";
}
```

### Evaluation result

```ts
interface OperatorEvaluationResult<TOutputs> {
  outputs: TOutputs;
  provenance: ProvenanceGraphFragment;
  diagnostics: Diagnostic[];
  metrics: {
    durationMs: number;
    outputEvents: number;
    outputPrimitives: number;
    cacheable: boolean;
  };
}
```

## 7. Port compatibility

MVP compatibility is exact by default. Explicit adapter operators perform conversions:

```text
pattern.trigger ──TriggerToNote──> pattern.note
math.sequence   ──SampleSequence──> signal.control
signal.control  ──Threshold───────> pattern.trigger
math.graph      ──TraverseGraph───> math.sequence / pattern.trigger
```

Implicit conversions would make provenance and user understanding unreliable.

## 8. Graph API

```ts
interface GraphCompiler {
  compile(graph: OperatorGraphJson, registry: OperatorRegistry): CompileResult;
}

interface CompileResult {
  plan?: EvaluationPlan;
  diagnostics: Diagnostic[];
}

interface EvaluationService {
  query<T extends TimedEventJson>(
    output: GraphOutputReference,
    interval: BeatIntervalJson,
    options: QueryOptions,
  ): Promise<PatternQueryResult<T>>;
  cancel(requestId: string): void;
}
```

The UI never directly invokes operator implementation functions. It asks the evaluation service for an output over an interval.

## 9. Control-signal model

```ts
interface SampledControlSignal {
  kind: "sampled";
  domain: "beats" | "seconds";
  start: RationalJson | number;
  sampleInterval: RationalJson | number;
  values: Float32Array;
  interpolation: "step" | "linear" | "cubic";
  units: string;
  bounds?: { minimum: number; maximum: number };
}
```

A mapping pipeline is represented as ordered operators, not opaque per-lab code:

```text
Source → Sample → Normalize → Smooth → Quantize/Threshold → Constrain → Target
```

## 10. Provenance graph

```ts
interface ProvenanceNodeJson {
  id: string;
  operatorType: string;
  operatorVersion: number;
  nodeId: string;
  inputProvenanceIds: string[];
  parametersHash: string;
  summary: string;
  state?: unknown;
  decisions?: ConstraintDecisionJson[];
}
```

Large mathematical state may be stored as a referenced trace artifact rather than embedded repeatedly.

## 11. Render-plan API

```ts
interface RenderEvent {
  id: string;
  startSeconds: number;
  durationSeconds: number;
  voiceId: string;
  pitchHz?: number;
  velocity: number;
  pan?: number;
  generation: number;
}

interface AudioBackend {
  start(): Promise<void>;
  schedule(plan: AudioRenderPlan, window: RenderWindow): ScheduleReceipt;
  stop(scope?: StopScope): void;
  renderOffline(plan: AudioRenderPlan, options: OfflineRenderOptions): Promise<AudioArtifact>;
}
```

The plan is immutable. Edits create a new generation so stale events can be identified and cancelled.

## 12. Lab definition API

```ts
interface LabDefinition {
  id: string;
  version: number;
  name: string;
  concept: string;
  graphTemplate: OperatorGraphJson;
  presets: LabPreset[];
  guidedExperiments: GuidedExperiment[];
  projectionIds: string[];
  requiredResearchEvidence: string[];
  acceptanceSuiteId: string;
}
```

Lab state is project state plus a view/guidance layer. It does not bypass the graph or render APIs.

## 13. Diagnostics

```ts
interface Diagnostic {
  code: string;
  severity: "info" | "warning" | "error" | "fatal";
  message: string;
  path?: string;
  nodeId?: string;
  eventId?: string;
  recovery?: RecoveryAction[];
}
```

Codes are stable and documented. User messages avoid raw stack traces, while a diagnostic panel retains technical details.

## 14. Versioning policy

- Project schema increments when serialized semantics change.
- Operator version increments when output semantics can change for identical input.
- UI-only changes do not increment operator versions.
- Presets have independent versions and identify required operator versions.
- Export-profile version captures quantization/approximation policy.
- Research evidence revisions do not alter output unless they change implementation/defaults; those changes require operator/preset version decisions.
