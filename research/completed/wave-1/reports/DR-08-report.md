2026-08-18

# General Sonification Mapping, Musical Constraint, Explainability, and Evaluation Framework

## Executive synthesis and program fit

**TL;DR**

Aural Geometry Lab should adopt one explicit, typed, versioned, bypassable pipeline for every lab:

`Source → Sample → Normalize → Smooth → Transform → Quantize/Threshold → Constrain → Target`

The central architectural decision is to treat **sampling, normalization, smoothing, quantization, stochastic variation, and musical shaping as authored transformations—not implementation details**. Each transformation needs measurement/unit contracts, temporal semantics, deterministic behavior, and provenance. This is consistent with the foundational definition of sonification as using nonspeech audio to convey information through relationships in data and acoustic parameters, while avoiding the historically common problem of publishing mappings whose design rationale and evaluation are underspecified. citeturn1search17turn3search2

The pipeline should distinguish **pointwise, causal-stateful, bounded-lookahead, and whole-window/frozen operations in the type system**. A live control graph must not silently use future information. A frozen operation must carry the exact source-window identity and fitted statistics used to derive its output. Running normalization is therefore not interchangeable with frozen normalization even when the formulas look similar.

Musical constraints should be an explicit post-mapping optimization layer. Scale/chord restriction, register, voice leading, rhythmic grids, playability, density, and polyphony can legitimately modify the mapping, but every modification should report what changed, why, and by how much. Constraint programming has a substantial history in computational composition, while voice-leading research gives a principled basis for treating movement between pitch configurations as an optimizable distance rather than hiding it in voicing code. citeturn12search13turn12search15turn13search4

Finally, AGL should **not define a single scalar “sonification quality” score**. Information discrimination, mapping comprehension, task performance, musical usefulness, aesthetics, workload, accessibility, and reproducibility are different constructs and need different experiments. Sonification reviews repeatedly show that mapping choices and evaluation methods vary considerably, and recent systematic work likewise separates performance, intuitiveness, and motivational/aesthetic outcomes rather than assuming they are interchangeable. citeturn3search2turn11search0

**Program consequence.** DR-08 is correctly classified as an immediate cross-cutting blocker. The research register has DR-02, DR-04, DR-05, DR-06, DR-07, and DR-09 downstream of it, and explicitly identifies DR-08 as unblocking the inspector, visualization/accessibility work, Euclidean probability, CA and chaos mapping, and Penrose traversal. fileciteturn0file3 All seven labs list DR-08 among their research dependencies. fileciteturn0file1

The current backlog already contains almost all required integration seams: an executable operator interface, port type checker, compiler, mathematical inspector, linked provenance selection, visualization projection contract, accessibility descriptions, control-signal pipeline, live/frozen chaos modes, invariant tests, and seeded Euclidean variation. fileciteturn0file0 The recommendation is therefore **not to build a separate sonification subsystem**. DR-08 should refine those shared runtime contracts before the individual labs hard-code mapping policy.

Given the program-plan assumption of only two product engineers, one product/UX FTE, fractional research/audio support, and fractional QA/accessibility support, the MVP should favor a relatively small, strongly specified operator vocabulary over dozens of specialized mappings. fileciteturn0file2

**Primary architectural recommendation:** accept DR-08 with the framework below as the normative mapping contract for every lab.

## Terminology, purpose, and domain ontology

The foundational ICAD formulation treats sonification as nonspeech audio used to convey information and, more specifically, as transformations that preserve relationships of interest between data and perceived acoustic dimensions. citeturn1search17turn1search19 That definition is broad enough for AGL, but the product should identify *which kind* of sonification is being performed because the implied fidelity claim is radically different across paradigms.

**Recommended purpose and paradigm vocabulary**

| Concept | AGL definition | Appropriate fidelity claim |
|---|---|---|
| **Audification** | Direct or near-direct presentation of a numerical time series as an audio waveform, usually after time/amplitude scaling. | Waveform/time-domain relations are being preserved subject to resampling/filtering. |
| **Parameter-mapping sonification** | Source dimensions are transformed into sound-synthesis or musical parameters. | Only explicitly identified data-to-audio relations are claimed. |
| **Model-based sonification** | Data parameterize a dynamic model whose behavior is excited/interacted with to make structure audible. | Model response is informative; individual notes need not correspond one-to-one with data points. |
| **Earcon** | Learned abstract auditory symbol or motif representing an event/category/state. | Categorical meaning, not quantitative resemblance. |
| **Auditory icon** | Sound whose relation to meaning is based on an ecological or source-event analogy. | Categorical/ecological correspondence. |
| **Musically informed data mapping** | Parameter mapping followed by explicit compositional constraints or transformations. | Data relations plus explicitly disclosed musical alteration. |
| **Perceptual illusion** | Parameters are controlled primarily to induce a perceptual phenomenon such as continuous ascent. | Fidelity concerns the construction and perceptual effect, not literal numerical readout. |

Parameter mapping and model-based sonification are meaningfully different: parameter mapping typically preprocesses data and sends values to sound parameters, whereas model-based approaches embed the data in a dynamic model whose response is sounded, often through an interaction or excitation process. citeturn1search16turn1search13 Earcons are abstract auditory messages that can be organized into families of learned motives, whereas Gaver's auditory-icon approach deliberately emphasizes relationships to everyday sound-producing events and ecological information. citeturn10search1turn10search14

The vocabulary should *not* pretend these categories are exhaustive or mutually exclusive. A 2026 systematic review of movement sonification, for example, found value in separately classifying sound-generation types and triggering/coupling mechanisms such as continuous, event, trajectory, and error-related sonification. citeturn11search0turn11search2 AGL should follow that principle and independently record paradigm, purpose, and trigger.

Every mapping preset should therefore declare:

```ts
interface MappingIntent {
  primaryPurpose:
    | "analysis"
    | "monitoring"
    | "teaching"
    | "composition"
    | "perceptual-illusion"
    | "accessibility";

  secondaryPurposes: MappingIntent["primaryPurpose"][];

  paradigm:
    | "audification"
    | "parameter-mapping"
    | "model-based"
    | "earcon"
    | "auditory-icon"
    | "musically-informed";

  trigger:
    | "continuous"
    | "event"
    | "trajectory"
    | "error"
    | "user-gesture";

  fidelityPriority:
    | "quantitative"
    | "ordinal"
    | "categorical"
    | "relational"
    | "topological"
    | "structural"
    | "aesthetic";
}
```

That declaration resolves one of the charter's most important ambiguities: **“faithful” does not mean the same thing for all mathematical objects.** A Lorenz-coordinate mapping may try to preserve numerical ordering; a Tonnetz walk may need to preserve adjacency and harmonic transformation identity; a cellular automaton may preserve binary cell states or instead summarize density; a Risset construction may primarily preserve the mathematical relations that produce an auditory illusion.

**Recommended cross-lab interpretation**

| Lab | Primary purpose | Paradigm | Source relationship that should survive |
|---|---|---|---|
| Infinite Staircase | Illusion + teaching | Parameter mapping / musically informed | Relative phase, rate, layer relationships, reset/wrap construction |
| Euclidean Rings | Teaching + composition | Event mapping | Exact onset membership, cyclic position, rotation; accents/probability explicitly downstream |
| Tonnetz Walk | Teaching + composition | Topological/harmonic mapping | Node identity, adjacency, transformation/path identity before voicing |
| Fractal Motif | Composition + teaching | Recursive event mapping | Ancestry, recursion depth, transformation identity, event lineage |
| Cellular Automaton | Analysis + teaching + composition | Discrete/event or aggregate parameter mapping | Exact cell state when claimed; otherwise explicitly named aggregate such as density |
| Chaos Attractor | Analysis + teaching + composition | Continuous parameter mapping | Trajectory ordering, selected coordinates/derived quantities, temporal behavior |
| Penrose Sequencer | Teaching + composition | Geometry/path/event mapping | Exact geometric attributes, adjacency, traversal order before musical shaping |

These recommendations fit the current manifest: the two rhythm-oriented labs are already runnable vertical slices; Tonnetz, fractal, CA, and chaos are computational previews; Penrose remains research-gated. fileciteturn0file1 Penrose's DR-08 work should consequently define traversal/mapping contracts but defer claims about the exact geometry itself to DR-09.

**Source ontology.** Stevens' nominal/ordinal/interval/ratio taxonomy remains historically influential, but modern measurement-theory criticism makes it unwise to encode those four labels as a complete theory of permissible computation. citeturn2search3turn2search1 AGL especially needs circular, spatial, and relational/topological values that do not fit neatly into that quartet.

The runtime should therefore separate **storage type, semantic measurement model, and units**.

| Source semantic | Examples in AGL | Typical valid interpretations |
|---|---|---|
| Boolean | CA cell active, Euclidean onset | Binary/categorical |
| Count | active-cell count, recursion child count | Ratio when true zero is meaningful |
| Ordinal | recursion level, ranked path score | Ordered but spacing need not be meaningful |
| Interval scalar | coordinate under an arbitrary origin | Differences meaningful; ratios may not be |
| Ratio scalar | elapsed duration, physical frequency, positive rate | Ratios can have substantive meaning |
| Circular | tile orientation, phase, pitch class | Periodic; no privileged linear seam |
| Categorical | CA rule label, instrument, graph node type | Identity/equality only unless additional structure is declared |
| Vector/position | Lorenz `(x,y,z)`, geometry coordinate | Components plus coordinate-system semantics |
| Probability | accent/event probability | Bounded `[0,1]` |
| Time/duration | simulation seconds, event duration | Clock and units mandatory |
| Musical time | beat/bar position | Rational beat coordinate preferred |
| Graph/topology | vertex, edge, adjacency, transformation | Relational structure rather than scalar magnitude |
| Event | transition, collision, generation, activation | Identity + timestamp/index + payload |
| Path parameter | arc length, traversal position | Depends on chosen parameterization |

The existing exact-rational musical-time foundation is particularly valuable here: beat-domain sampling and rhythmic quantization should preserve rational positions until rendering rather than silently convert them to floating-point seconds. fileciteturn0file0

A proposed common value envelope is:

```ts
type Measurement =
  | "nominal"
  | "ordinal"
  | "interval"
  | "ratio"
  | "circular"
  | "topological";

interface DimensionSpec {
  id: string;
  label: string;

  valueKind:
    | "scalar"
    | "integer"
    | "boolean"
    | "category"
    | "angle"
    | "vector"
    | "position"
    | "duration"
    | "rate"
    | "count"
    | "probability"
    | "event"
    | "graph-node"
    | "graph-edge"
    | "path-position";

  measurement: Measurement;

  // Serialized canonical unit identifier, e.g. "1", "s", "Hz",
  // "rad", "beat", "cell", "generation".
  unit: string;

  domain?: {
    min?: number;
    max?: number;
    period?: number;
    categories?: string[];
  };

  missingPolicy:
    | "drop"
    | "gap"
    | "hold-last"
    | "interpolate"
    | "default"
    | "explicit-missing";
}
```

**Semantic-transform rule:** measurement metadata should constrain *what the software is allowed to claim*, not prohibit creative mathematics. For example, a user may deliberately apply a nonlinear transform to an interval-scale coordinate. The graph can permit it, but the operator should advertise that interval/ratio semantics were not preserved. That is preferable to either falsely labeling the operation semantically neutral or paternalistically prohibiting experimental mappings.

Every transform should therefore advertise invariants such as:

```text
preservesEquality
preservesOrder
preservesIntervals
preservesRatios
preservesCircularity
preservesTopology
```

The graph validator can then say, for example, **“This transform is legal but destroys the quantitative invariant required by the preset's fidelity claim.”**

**Invalid and discontinuous values need deterministic semantics.** Recommended defaults are:

| Condition | Default |
|---|---|
| `NaN`, `+Inf`, `-Inf` | Drop/gap with diagnostic; never silently coerce |
| Missing event value | Explicit gap unless operator declares another policy |
| Constant normalization range | Output configurable midpoint; set `degenerateRange=true` |
| Outside fixed bounds | Clamp by default and record original value + clipping diagnostic |
| Unknown category | Map to explicit `unknown`; never implicit hash/random assignment |
| Circular seam | Wrap modulo period; do not naïvely min/max across the seam |
| Source discontinuity | Preserve unless a named smoothing/interpolation stage changes it |
| Interpolation over missing data | Illegal unless explicitly enabled and provenance reports it |

This is critical because smoothing away a discontinuity or silently replacing a nonfinite value is itself an interpretation of the mathematical object.

## Canonical mapping pipeline and operator contracts

The charter's pipeline is the right abstraction and should become normative:

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

Two refinements are important.

First, this is a **canonical explanatory order, not a restriction that each stage occurs exactly once**. Operations generally do not commute. A lab may legitimately transform before smoothing or perform two transforms. Repetition is allowed, but every stage must appear explicitly in the serialized graph.

Second, “raw” needs precise vocabulary:

```text
source-raw        = original mathematical value
mapped-continuous = output after transform
mapped-raw        = quantized/thresholded event or target candidate, pre-constraint
shaped            = post-constraint target
rendered          = audio-backend realization
```

The user-facing **Raw ↔ Musical** comparison should normally compare `mapped-raw` against `shaped`. That isolates the effect of musical constraint rather than conflating musical shaping with normalization and source extraction.

**Sampling operators**

| Operator | Clock/domain | Main use | Temporal semantics |
|---|---|---|---|
| `event.sample` | Source events | Euclidean pulses, CA transitions, graph transitions | Point/event-driven |
| `sequence.step` | Integer index | Integer sequences, generations | Pointwise |
| `time.fixedRate` | Seconds | Continuous dynamics | Causal or frozen |
| `beat.fixedStep` | Rational beats | Musical control sampling | Causal |
| `path.nodeTraversal` | Graph traversal | Tonnetz/Penrose paths | Event-driven |
| `path.arcLength` | Geometric distance | Curves/geometric sweeps | Frozen or causal when path generated incrementally |
| `space.sweep` | Spatial coordinate | Geometry scanning | Usually frozen |
| `gesture.sample` | Input timestamps | Interactive exploration | Causal |
| `adaptive.errorBound` | Source/path | Curvature/change-driven refinement | Primarily frozen; causal variant possible |

For conventional band-limited signals, sampling frequency and anti-alias filtering are governed by standard sampling-theorem considerations; Shannon's 1949 treatment is foundational here. citeturn9search10 Mathematical trajectories and geometry are frequently *not* known to be band-limited, however, so the product should avoid a false “Nyquist safe” badge simply because a numerical sampling rate exists.

Instead, the sampler should expose:

```ts
interface SamplingDiagnostics {
  sampleCount: number;
  droppedCount: number;
  coalescedCount: number;
  sourceSpan: number;
  maxObservedDelta?: number;
  maxInterpolationError?: number;
  aliasRisk: "unknown" | "low-by-declared-bandlimit" | "detected";
}
```

For frozen trajectories and geometry, adaptive sampling should be driven by an explicit approximation/error criterion. For live signals without a declared bandwidth, AGL should simply label alias risk as unknown and allow an explicit low-pass stage.

Crucially, basic auditory gap-detection thresholds should **not** be turned into a global sonification event-rate limit. Controlled studies can demonstrate gap detection on the order of milliseconds under specific laboratory stimuli, but those thresholds concern detection under simplified conditions, not comprehension of multiple simultaneous semantic streams. citeturn9search7turn9search12 Informational masking and divided-channel monitoring impose additional costs. citeturn9search18 Event density therefore belongs to a configurable musical/HCI budget rather than a supposed universal psychoacoustic ceiling.

**Normalization and scaling**

| Operator | Causal? | Outlier behavior | Explainability | Recommended role |
|---|---:|---|---|---|
| Fixed known bounds | Yes, pointwise | Predictable clipping | Excellent | Preferred when mathematical domain is known |
| User bounds | Yes, pointwise | Predictable clipping | Excellent | Interactive authored mapping |
| Frozen min/max | No | Very sensitive | Excellent | Short clean bounded windows |
| Frozen percentile | No | Robust to extreme tails | Good | General exploratory data |
| Frozen median/MAD | No | Strongly robust | Good | Outlier-heavy approximately centered data |
| Running statistics | Yes, stateful | Depends on history | Moderate | Live unknown-range sources |
| Sliding-window stats | Yes, stateful | Local/adaptive | Moderate | Nonstationary streams |
| Z-score | Frozen or running | SD sensitive to extremes | Good | Standardized deviations |
| Log | Pointwise | Requires positive-domain policy | Excellent | Ratio data spanning orders of magnitude |
| Signed log | Pointwise | Explicit nonlinear reinterpretation | Good | Signed wide-range values |
| Power | Pointwise | Parameter dependent | Excellent | Redistributing output resolution |
| Sigmoid | Pointwise | Compresses extremes | Excellent | Bounded presentation of unbounded data |
| Circular wrap | Pointwise | Correct seam behavior | Excellent | Angles/phases |
| Category lookup | Pointwise | N/A | Excellent | Nominal data |

Median/MAD-based estimators have strong robustness properties against extreme contamination compared with ordinary mean/standard-deviation or min/max approaches, making them good candidates for an explicitly *robust* frozen profile. citeturn2search13 They should not be sold as universally superior: a robust normalization can intentionally suppress rare mathematical extremes that are precisely what an analysis user wants to hear.

Reference formulas should be part of the operator definition rather than hidden in implementation.

For fixed linear normalization:

\[
u = \operatorname{clamp}\left(\frac{x-L}{U-L}, 0, 1\right)
\]

For a rate-independent one-pole/EMA smoother:

\[
\alpha = 1-e^{-\Delta t/\tau}
\]

\[
y_t = y_{t-1} + \alpha(x_t-y_{t-1})
\]

Using a time constant `τ` in seconds or beats as the public parameter is preferable to exposing an opaque fixed `α`, because it remains interpretable when sampling rate changes.

For circular normalization:

\[
u =
\frac{\operatorname{mod}(\theta-\theta_0,P)}{P}
\]

where `P` is the declared period. For computations where seam continuity matters, exposing `sin(θ)` and `cos(θ)` as explicit derived dimensions is often preferable to treating phase as a linear scalar.

**Smoothing/interpolation vocabulary**

| Operator | Suitable for | Causality |
|---|---|---|
| Sample-and-hold | Discrete/control events | Causal |
| Linear interpolation | Continuous scalar/vector data | Requires next point; bounded lookahead in streaming |
| Monotone cubic interpolation | Frozen continuous trajectories where overshoot is undesirable | Whole-window/local lookahead |
| One-pole/EMA | Live control | Causal-stateful |
| Causal moving average | Live noisy control | Causal-stateful |
| Centered moving average | Frozen analysis | Whole-window/lookahead |
| Median filter | Spike suppression | Causal or centered, depending configuration |
| Slew limiter | Explicit rate limiting | Causal-stateful |
| Savitzky-like/local polynomial smoothing | Frozen analysis | Whole-window/lookahead |

Hysteresis should **not** be classified as smoothing. It changes state-transition logic and belongs with thresholding.

Categorical, graph-node, and topological identities cannot pass through scalar smoothing without an explicit representation-changing transform.

**Temporal semantics must be a first-class type**

```ts
type TemporalSemantics =
  | { kind: "pointwise" }
  | {
      kind: "causal-stateful";
      reset: "transport-start" | "clip-start" | "manual" | "never";
    }
  | {
      kind: "bounded-lookahead";
      seconds: number;
    }
  | {
      kind: "whole-window";
      windowRef: string;
    };
```

Compile rules:

| Context | Pointwise | Causal-stateful | Bounded lookahead | Whole-window |
|---|---:|---:|---:|---:|
| Frozen clip/offline | ✓ | ✓ | ✓ | ✓ |
| Live, zero declared latency | ✓ | ✓ | ✗ | ✗ |
| Live with explicit latency | ✓ | ✓ | ✓ up to declared latency | ✗ |
| Precomputed frozen asset used during playback | ✓ | ✓ | ✓ | ✓, because fitting already occurred |

This directly formalizes the existing backlog requirement that chaos support distinct causal-live and labeled frozen trajectory modes. fileciteturn0file0

A frozen normalizer should serialize something equivalent to:

```json
{
  "kind": "whole-window",
  "windowRef": "window:lorenz:abc123",
  "sourceHash": "sha256:…",
  "clockDomain": "seconds",
  "start": 0,
  "end": 30,
  "fittedState": {
    "method": "percentile",
    "lowerPercentile": 0.02,
    "upperPercentile": 0.98,
    "lowerValue": -17.42,
    "upperValue": 18.03
  }
}
```

Changing the source or window invalidates that fit. It must **not** silently recompute while continuing to present the sonification as the same mapping.

A causal running normalizer, conversely, records its reset rule and state version. The initial warm-up interval should be visible because early values and later values can map differently even when source values are identical.

**Quantization and threshold operators**

The shared registry should minimally include:

`scalar.bin`, `pitch.chromatic`, `pitch.scale`, `pitch.chord`, `rhythm.grid`, `threshold.single`, `threshold.hysteresis`, `threshold.deadband`, and `probability.gate`.

Every discrete quantizer requires an explicit tie rule, such as:

```text
nearest → tieLower
nearest → tieUpper
nearest → tieToEvenIndex
floor
ceil
```

Musical-time quantization should operate on exact rational beat values where possible, aligning with the existing exact-time runtime. fileciteturn0file0

Hysteresis should represent separate activation/deactivation thresholds:

```text
inactive → active when x >= onThreshold
active   → inactive when x <= offThreshold
```

with `offThreshold < onThreshold` validated.

**Typed operator contract**

```ts
type PipelineStage =
  | "sample"
  | "normalize"
  | "smooth"
  | "transform"
  | "quantize-threshold"
  | "constrain"
  | "target";

interface SemanticInvariant {
  preservesEquality?: boolean;
  preservesOrder?: boolean;
  preservesIntervals?: boolean;
  preservesRatios?: boolean;
  preservesCircularity?: boolean;
  preservesTopology?: boolean;
}

interface OperatorDefinition<
  Params extends object,
  Input,
  Output
> {
  typeId: string;
  version: string;
  stage: PipelineStage;

  input: DimensionSpec;
  output: DimensionSpec;

  temporal: TemporalSemantics;
  deterministic: boolean;

  params: Params;

  bypassable: true;

  invariants: SemanticInvariant;

  validation: {
    finiteRequired?: boolean;
    permittedMeasurements?: Measurement[];
    permittedUnits?: string[];
  };
}

interface StageTrace<T> {
  operatorInstanceId: string;
  operatorTypeId: string;
  operatorVersion: string;

  bypassed: boolean;
  temporal: TemporalSemantics;

  input: {
    value: unknown;
    unit: string;
  };

  output: {
    value: T;
    unit: string;
  };

  paramsHash: string;

  stateBeforeHash?: string;
  stateAfterHash?: string;

  diagnostics: Diagnostic[];
}

interface OperatorResult<T> {
  value: T;
  trace: StageTrace<T>;
}
```

This should refine AGL-020's executable operator interface and AGL-021's type checker rather than creating parallel DR-08-only abstractions. fileciteturn0file0

## Auditory mapping, musical constraints, randomness, and accessibility

There is no empirically defensible universal table saying “variable X should always map to sound Y.” Walker's magnitude-estimation studies found that preferred polarity and scaling relationships depend on both conceptual source dimension and auditory dimension. citeturn3search0turn3search15 Training also matters: controlled auditory-graph work found performance improvements after practice with feedback. citeturn3search10

The right AGL abstraction is therefore **evidence-informed defaults plus explicit calibration**, not a universal perceptual code.

### Auditory evidence matrix expressed as implementation policy

| Auditory dimension | Evidence type | Best AGL role | Important confounds | Proposed MVP operating default* | Required alternative |
|---|---|---|---|---|---|
| Pitch/frequency | Ordering, discrimination, learned estimation | Ordinal/quantitative trend, position-like values | Timbre/loudness interaction; polarity depends on source concept | MIDI 48–84 as default musical range; adjustable | Numeric/text + visual position; optional rate/duration encoding |
| Loudness/gain | Ordering, coarse magnitude | Emphasis, confidence, secondary scalar | Playback volume, hearing, pitch interaction | Keep mapped range moderate; renderer-level headroom and limiter | Numeric/text + size/weight/pulse encoding |
| Duration | Ordering, coarse magnitude | Event magnitude, interval/category | Baseline-duration dependence | Roughly 80 ms–2 s for primary semantic events | Timeline length + exact value |
| Onset density/rate | Ordering, pattern/trend | Activity/density | Masking and stream interaction | Start around 0.5–8 semantic events/s/stream; warn rather than hard-fail above configured budget | Count/rate text + event timeline |
| Tempo | Ordering | Global state or one high-level variable | Entrainment and rhythm structure | Roughly 60–180 BPM for musical presets | BPM/value + animation-independent timeline |
| Brightness | Ordinal under controlled synthesis | Secondary scalar | Timbre multidimensionality; pitch coupling | Synth-specific normalized range, not generic “brightness units” | Text/shape + pulse/duration alternative |
| Roughness | Coarse ordinal | Tension/activity/alerting | Strong dependence on spectrum and register | Few coarse bins; synth-specific | Explicit level/text + another redundant cue |
| Articulation | Categorical/coarse ordinal | State/category | Alters apparent onset and timbre | Small named vocabulary | Label/symbol |
| Pan | Left-right ordering | Secondary spatial/category cue | Mono playback, speakers/headphones | Keep important positions away from ambiguous fine differences; mono test mandatory | L/C/R or azimuth label + visual/text position |
| Spatial azimuth | Localization | Geometry/spatial cue | HRTF, spectrum, equipment, front/back error | Secondary unless calibrated | Coordinate/diagram/text |
| Harmony/chord | Relational/categorical | Tonnetz/topological relation, musical context | Culture/training/style | No universal scalar mapping | Pitch-class/chord label + graph state |
| Instrument identity | Categorical | Source/category separation | Timbre discrimination varies by hearing/device | Curated, perceptually distinct set | Instrument/category label |

\*These are **AGL engineering starting points, not universal psychoacoustic thresholds or “safe ranges.”** They should be benchmarked and altered when lab-specific evidence supports better values.

Pitch and loudness should not be treated as perfectly independent channels. Neuhoff and colleagues found interaction/asymmetry between changing pitch and loudness, and more recent psychoacoustic work continues to show coupling between pitch and spectral/timbral dimensions. citeturn0search2turn0search5 This argues strongly against a design pattern such as “x→pitch and y→brightness, therefore users can independently read x and y.”

Duration judgments are also not uniform across durations; experimental work finds duration-discrimination performance depends on the reference duration, with particularly short durations generally harder. citeturn7search12 Temporal-envelope changes themselves require sizable changes under some stimulus conditions to become reliably discriminable. citeturn7search7

“Timbre” should never appear in the schema as a single universal quantitative axis. Classic multidimensional-scaling studies identify multiple dimensions involving spectral distribution, attack/transient structure, and related characteristics. citeturn8search5turn8search11 Cochlear-implant research is especially important for AGL accessibility: normal-hearing listeners can exploit spectral and temporal timbral information, whereas cochlear-implant listeners in the cited study relied substantially more on temporal-envelope information because spectral cues were degraded. citeturn8search13 Thus a controlled `spectralCentroid` or `brightness` target can be quantitative within one synthesizer, while `instrumentIdentity` should remain categorical.

Roughness/dissonance likewise depends on spectral spacing and critical-band interactions rather than functioning as a culturally and acoustically context-free scalar. citeturn8search0 Use it as a deliberately designed coarse channel rather than a precision numerical ruler.

Spatial mappings require similar restraint. Free-field localization accuracy varies strongly with direction, and front/back confusions occur; stimulus bandwidth also matters, with broadband signals supporting better localization than impoverished pure tones. citeturn8search3turn8search15 Headphones can support fine localization under appropriately designed reproduction systems, but this does not make generic browser pan an equipment-independent quantitative display. citeturn8search9

### Musical constraints

Musical shaping should be represented as a collection of explicit constraints:

```ts
type MusicalConstraint =
  | RangeConstraint
  | ScaleConstraint
  | ChordConstraint
  | VoiceLeadingConstraint
  | RhythmicGridConstraint
  | PolyphonyConstraint
  | DensityConstraint
  | PlayabilityConstraint
  | ArticulationConstraint
  | GainSafetyConstraint;
```

Each constraint needs:

```ts
interface ConstraintBase {
  id: string;
  version: string;

  mode: "hard" | "soft";

  scope:
    | "event"
    | "voice"
    | "chord"
    | "window"
    | "track";

  priority: number;

  temporal: TemporalSemantics;

  bypassable: true;
}
```

Constraint-based approaches have long been used to make musical rules declarative rather than burying them in procedural generators. citeturn12search13turn12search15 For harmony specifically, voice-leading can be treated geometrically as movement between chord configurations; Tymoczko's work explicitly represents mappings between chords as paths and examines short paths between structurally related chords. citeturn13search4 AGL does not need to adopt one theory of tonal optimality, but this supports making a voice-leading distance/cost function explicit.

**Recommended conflict resolution order**

```text
target validity
    ↓
audio/safety invariants
    ↓
explicit hard user locks
    ↓
ordered hard profile constraints
    ↓
minimum soft-distortion solution
    ↓
canonical deterministic tie-break
```

Safety and target validity cannot be sacrificed to musical preferences. Hard user locks should cause an infeasibility diagnostic rather than silently moving a locked note. Soft constraints then operate on a declared cost vector.

A useful cross-target distortion representation is:

```ts
interface MappingDistortion {
  eventDropped: boolean;
  eventAdded: boolean;
  categoryChanged: boolean;

  onsetDeltaBeats?: Rational;
  onsetDeltaMs?: number;

  pitchDeltaCents?: number;
  durationLogRatio?: number;
  gainDeltaDb?: number;

  normalizedSourceError?: number;
}
```

Do **not** immediately collapse this vector into one universal “fidelity percentage.” A 50-cent pitch shift and a 1/16-beat timing shift are incommensurable unless a particular preset declares weights.

For deterministic constraints, candidate ordering should be canonical:

```text
constraint violation tuple
→ soft cost
→ absolute displacement
→ canonical target ID/value
```

There should be no hidden RNG used to break constraint ties.

For whole-sequence voice leading, a frozen preset may legitimately optimize over the entire clip. A live preset cannot use the same optimizer unless it declares lookahead/latency; it needs a causal or bounded-lookahead approximation. The inspector must present those as different temporal semantics even if both carry the label “voice leading.”

**Every musical modification produces a constraint record:**

```json
{
  "constraint": "pitch.scale",
  "version": "1.0.0",
  "mode": "hard",
  "priority": 300,
  "input": 73.42,
  "candidates": [72, 74],
  "chosen": 74,
  "deltaCents": 58,
  "reason": "nearest allowed pitch in D dorian",
  "tieBreak": "not-used"
}
```

That record is the difference between **musical authorship that is explainable** and a supposedly mathematical system quietly “making it sound better.”

### Randomness

Randomness deserves an equally explicit boundary because AGL's educational and mathematical goals make accidental attribution especially dangerous.

```ts
type RandomnessKind =
  | "event-gate"
  | "variation"
  | "stochastic-model"
  | "measurement-noise-simulation";
```

Each stochastic operator should carry:

```ts
interface RandomnessSpec {
  kind: RandomnessKind;
  algorithm: string;
  seed: string;
  streamId: string;
  distribution: string;
}
```

A deterministic source followed by `probability.gate(p=.7)` remains a deterministic mathematical source plus stochastic presentation. It must not become “a probabilistic Euclidean rhythm” in the provenance model. This directly matches the existing AGL-074 acceptance intent that seeded variation remain separate from Euclidean generation. fileciteturn0file0

Recommended seed derivation is from:

```text
project seed
+ stable operator instance ID
+ stable source/event ID
+ named random stream
```

rather than one global sequence consumed in execution order. Otherwise inserting an unrelated random operator upstream can alter every subsequent result.

A selected probabilistic event should be explainable as:

> The mathematical source produced an onset here. The variation stage used probability 0.65. Random stream `accent-A`, draw 47, produced 0.31, so the onset was retained.

That wording prevents users from attributing the random decision to the mathematical generator.

### Profiles

| Profile | Fidelity stance | Normalization | Smoothing | Musical constraints | Randomness |
|---|---|---|---|---|---|
| **Faithful** | Preserve declared mathematical relation | Known/fixed bounds preferred | None/minimal | Only validity/safety unless inherently discrete | Off |
| **Musical** | Preserve broad structure while optimizing listenability/editability | Fixed or robust frozen | Moderate | Register, scale/chord, grid, voice leading, density permitted | Optional seeded |
| **Pedagogical** | Maximize comprehensibility and traceability | Simple fixed monotonic maps | Minimal | Small/simple vocabulary | Off by default |
| **Experimental** | Creative exploration; reduced fidelity claims | Any explicit operator | Any | Aggressive/novel constraints allowed | Explicit seeded variation allowed |

The pedagogical preset should also favor fewer simultaneous auditory dimensions, slower/repeatable examples, fixed anchors/reference tones, and visible/textual values. Walker's training research supports explicitly treating mapping learning as part of successful use rather than assuming an arbitrary mapping is immediately intuitive. citeturn3search10

### Accessibility policy

WCAG requires that color not be the sole visual means of conveying information, provides mechanisms/alternatives for audio content, and recognizes the need to suppress or control motion that may trigger vestibular problems. citeturn5search2turn5search14turn5search0turn5search13 AGL should extend that principle to dynamically generated sonification: every semantically important encoding needs another accessible projection of the same underlying value.

| Primary encoding | Required equivalent or redundant representations |
|---|---|
| Pitch | Exact numeric/text value; labeled vertical or ordered position; optional rate/duration sonification mode |
| Loudness | Numeric/text level; shape/size/weight or pulse representation |
| Pan/spatial position | L/C/R or angle text; spatial diagram; mono-compatible categorical mode |
| Brightness/timbre | Named level/category; shape/pattern; temporal or pitch alternative |
| Roughness | Named coarse level; symbol/text; redundant pulse/articulation mode |
| Rhythm/density | Event list/grid; count/rate numeric summary |
| Harmony | Chord/pitch-class text; graph/Tonnetz state; constituent pitch list |
| Instrument identity | Explicit category label |
| Animation/motion | Static trajectory; step-through state; table/list; `prefers-reduced-motion` mode |
| Visual operator graph | Ordered keyboard/screen-reader-accessible stage list representing the identical graph |
| Audio-only event sequence | Synchronized semantic event table/transcript |

The alternatives must not be “visual only.” Semantic text and structured tables can be consumed through assistive technology, including screen readers and compatible braille interfaces. Conversely, a blind user who relies on sonification should not lose information because the only secondary code is color.

The timbre evidence above gives a concrete reason to provide alternative channels for spectral brightness. citeturn8search13 Likewise, a study comparing visually impaired and sighted listeners found broad commonality but also differences in preferred data-to-sound relationships, cautioning against deriving all accessibility presets solely from sighted participants. citeturn3search19

For audio level, WHO emphasizes that hearing risk depends on both sound level and exposure duration; its safe-listening guidance uses examples such as substantially lower permissible exposure as level rises, and WHO/ITU standards incorporate listening-dose concepts. citeturn4search1turn4search3 A browser application, however, knows digital amplitude but normally does **not** know the resulting acoustic SPL at a particular user's ears. That means AGL must not label a dBFS value as “safe dB SPL.”

Instead:

```text
conservative initial master level
+ user volume control
+ limiter/clip protection
+ emergency stop
+ no unexpected high-level autoplay
+ listening-level guidance
+ optional calibration workflow
```

should be the safety model. This fits the already planned AGL-049 gain/emergency-stop safety path. fileciteturn0file0

## Provenance and explanation

The minimum standard should be simple:

> **For any selectable musical event or control state, AGL must be able to answer “Why did this happen?” from the mathematical source through every transformation to the final target.**

The current backlog already anticipates this in AGL-035's mathematical inspector, AGL-036's linked selection, AGL-050's semantic visualization projection, and AGL-053's accessible descriptions. fileciteturn0file0 DR-08 should define the shared trace those features consume.

A recommended event trace is:

```ts
interface EventTrace {
  traceId: string;

  projectHash: string;
  graphHash: string;
  eventStableId: string;

  source: {
    objectId: string;
    dimensionId: string;

    value: unknown;
    unit: string;

    sourceIndex?: number;
    sourceTime?: number;
    sourceBeat?: Rational;

    generation?: number;
    graphNodeId?: string;
    geometryId?: string;
  };

  sample: {
    operatorInstanceId: string;
    method: string;
    clockDomain: "seconds" | "beats" | "index" | "path" | "event";
    sampledValue: unknown;
    sourceSpan?: [number, number];
  };

  stages: StageTrace<unknown>[];

  randomness: Array<{
    operatorInstanceId: string;
    algorithm: string;
    streamId: string;
    drawIndex: number;
    drawValue: number;
    probability?: number;
    outcome: unknown;
  }>;

  constraints: Array<{
    constraintId: string;
    version: string;
    mode: "hard" | "soft";
    priority: number;

    before: unknown;
    after: unknown;

    distortion: MappingDistortion;
    reason: string;
    tieBreak?: string;
  }>;

  target: {
    type: string;
    voiceId?: string;

    onsetBeat?: Rational;
    durationBeat?: Rational;

    pitch?: number;
    frequencyHz?: number;
    gain?: number;
    pan?: number;

    instrumentId?: string;
  };
}
```

**Four explanation levels should be generated from the same trace:**

| Level | Intended user | Example |
|---|---|---|
| Plain-language summary | New learner | “A high Lorenz x-value produced a high note; the scale constraint moved it slightly to D.” |
| Ordered stage explanation | General user | Source 12.7 → normalized .63 → smoothed .59 → mapped 73.4 → quantized 74 |
| Exact technical trace | Researcher/developer | Formula, bounds, state, candidate set, constraint cost, RNG decision |
| Machine representation | Tests/export | Serialized JSON trace |

No level should be maintained as separately authored explanatory text when it can be derived from the canonical trace. Otherwise UI prose and executable behavior will drift.

A realistic technical explanation might read:

> Event `E-4f8a` originated from `lorenz.x = 12.70` at simulation time 8.400 s. The fixed-rate sampler sampled at 20 Hz. Fixed bounds `[-20, 20]` normalized the value to `0.8175`. A causal one-pole smoother with `τ = 0.150 s` produced `0.7931`. The pitch transform mapped that value to MIDI `76.55`. D-Dorian scale quantization selected MIDI `77` using nearest-distance/tie-lower policy. The playable-register constraint made no further change. Final target: F5, onset beat `21/8`, duration `1/8`.

For a changed event:

> The raw mapping requested MIDI `91`. The playable-register constraint allowed `48…84`; it selected `84`, changing the candidate by `−700 cents`. This event is therefore flagged as constraint-altered.

For a dropped event:

> The mathematical source generated the event. The density constraint allowed at most eight events in this voice during the configured one-second window. This was the ninth event and was dropped according to policy `drop-lowest-priority`; source generation itself was not changed.

This distinction is essential for education, debugging, and scientific reproducibility.

**Retain versus recompute.** Storing every floating-point intermediate sample indefinitely would be wasteful, while recomputing everything can produce misleading history after configuration changes. Recommended policy:

| Information | Retain |
|---|---|
| Source/project/operator versions and hashes | Always |
| Operator parameters | Always |
| Whole-window fitted normalization statistics | Always |
| Whole-window source/window hash | Always |
| Random seed/stream/draw identity for emitted decisions | Always |
| Discrete event constraint decisions | Always |
| Final event targets | Always for materialized/frozen outputs |
| Pure pointwise intermediate values | May recompute if source/config hashes match |
| High-rate continuous intermediate samples | Recompute from immutable source/config where practical |
| Stateful causal operators | Keep checkpoints/state hashes sufficient to replay deterministically |
| Diagnostics such as clipping/drop counts | Retain with render/evaluation artifact |

A frozen normalization fit is part of the authored mapping and therefore cannot simply be recomputed against new data. A running causal filter is likewise defined partly by its state/history, so reproducibility requires either complete replay from a known reset or state checkpoints.

The visual graph and accessible stage list should be **two projections of one graph model**:

```text
[Visual graph]
Lorenz.x → Sample → Fixed Bounds → EMA → Pitch → Dorian → Register → Synth
                    ↑                         ↑
                inspector                constraint delta

[Accessible ordered projection]
1. Source: Lorenz x
2. Fixed-rate sampler
3. Fixed-bounds normalization
4. Causal exponential smoothing
5. Pitch transform
6. D-Dorian quantizer
7. Register constraint
8. Synth target
```

Selecting either representation should select the same operator/event IDs. That directly supports AGL-036's requirement that event, node, geometry, and provenance selection cross-highlight. fileciteturn0file0

## Benchmark corpus and evaluation

The sonification literature gives AGL a good reason to invest disproportionately in evaluation infrastructure. The systematic review by Dubus and Bresin cataloged hundreds of data-to-sound mappings across 179 publications and found mapping evaluation to be comparatively uncommon; pitch was the most frequently used parameter, but the field showed substantial diversity in how dimensions were mapped. citeturn3search2turn3search8 AGL can materially improve on that norm by shipping every mapping operator with objective fixtures and every empirical claim with an explicitly named evaluation construct.

### Cross-lab benchmark corpus

The core corpus should first be mathematically synthetic because that makes failures interpretable.

| Fixture | Purpose | Expected property |
|---|---|---|
| Constant scalar | Degenerate ranges/state | No divide-by-zero; stable output |
| Linear ramp up/down | Order preservation | Monotonic mapping unless explicit transform changes it |
| Sine | Periodic control | Known frequency/amplitude |
| Two-frequency signal | Sampling/filter behavior | Known components |
| Step | Discontinuity | No smoothing unless requested |
| Impulse/outlier | Robustness | Robust/fixed/minmax operators visibly differ |
| Heavy-tailed distribution | Robust normalization | Known percentile behavior |
| Bimodal distribution | Distribution shape | No accidental assumption of unimodality |
| Missing/NaN/Inf sequence | Failure policy | Deterministic gaps/diagnostics |
| Circular `350°→10°` | Circular semantics | No false 340° discontinuity |
| Chirp/increasing curvature | Adaptive sampling | More samples where configured error requires |
| Categorical sequence | Type checking | No scalar transform without explicit representation |
| Sparse/burst event train | Density policies | Deterministic drops/coalescing |
| Small graph/path | Topology | Adjacency/order exactly preserved |
| Rational beat fixture | Musical-time pipeline | Exact beat values survive until render boundary |

Each fixture should contain:

```text
source values
dimension/measurement/unit declaration
clock domain
known invariants
golden stage outputs for normative operators
expected diagnostics
expected constraint modifications
expected provenance trace
expected accessible description
determinism hash
```

Then add lab-specific fixtures:

| Lab | Benchmark |
|---|---|
| Infinite Staircase | Exact source pattern plus phase/rate/control-layer fixture |
| Euclidean Rings | Known `(k,n,rotation)` patterns and multi-ring alignment |
| Tonnetz | Small reference path containing repetition and known adjacency |
| Fractal Motif | Fixed seed through bounded depths with known ancestry |
| CA | Small exact rule/seed fixtures owned jointly with DR-06 |
| Chaos | Fixed accepted trajectory/integrator fixture owned jointly with DR-07 |
| Penrose | Exact finite patch/path fixtures only after DR-09 accepts geometry |

That division avoids DR-08 prematurely deciding research questions assigned to the specialist runs while still imposing common interfaces.

### Objective transformation metrics

There should be no single “information loss” measure. Store a metric vector:

```text
range utilization
clipping fraction
missing/drop fraction
event retention
event addition/merge count
rank inversions
normalized reconstruction error where meaningful
quantization-bin error
pitch displacement in cents
timing displacement in rational beats and milliseconds
duration ratio
gain change in dB
category-change count
constraint modification fraction
median/p95 constraint displacement
causal latency
lookahead
event count
execution time
memory use
determinism checksum
```

Rank inversion is meaningful only where an ordering was supposed to survive. Reconstruction error is meaningful only where inverse quantitative reconstruction makes sense. “Chord pleasantness” is not an information-loss metric.

### Reusable study modules

The empirical harness should separate the following constructs.

| Module | Research question | Primary measures |
|---|---|---|
| **Discrimination / recognition** | Can listeners distinguish source states? | Accuracy, d′/psychometric threshold, confusion matrix |
| **Mapping comprehension** | Do listeners understand what sound means? | Mapping-direction prediction, value/state identification, time-to-criterion, retention |
| **Task performance** | Does sound help accomplish a real task? | Task accuracy, error, completion time |
| **Musical utility / editability** | Can a musician effectively work with the result? | Edit count, completion time, constraint bypass/edit operations, structured utility ratings |
| **Aesthetic preference** | Which result is liked/preferred? | Pairwise choice, ranking/rating, qualitative comments |
| **Cognitive workload** | How demanding is the mapping/task? | A workload measure such as NASA-TLX plus performance |
| **Accessibility equivalence** | Can alternative channels support the intended information/task? | Same task metrics across relevant modality/configuration cohorts |
| **Reproducibility / stability** | Does identical input/configuration produce the same semantics? | Hash/equality/tolerance checks across reruns/backends/browsers |

PAMPAS provides a relevant example of evaluating multidimensional sonification psychophysically using perceptual discrimination/difference-limen methods rather than judging a mapping simply by preference. citeturn6search12

The separation between discrimination and comprehension is crucial. A listener can hear that two sounds differ while having no idea which represents the larger source value. Likewise, a listener may fully understand the mapping but find differences too subtle for efficient discrimination.

Training should be standardized and measured rather than treated as contamination. Walker's auditory-graph work demonstrates that practice and feedback can improve estimation performance, so the relevant product question often becomes **how quickly a mapping can be learned and how well learning transfers**, not merely zero-training accuracy. citeturn3search10

Task tests should use source-relevant tasks such as:

```text
Which trajectory has the larger current value?
Where did the discontinuity occur?
Which CA generation has higher density?
Are these graph paths adjacent or disconnected?
Which pattern is accelerating?
Did the sequence wrap/reset?
Which of two events has greater source magnitude?
```

A sonification can succeed on trend detection while failing at exact point estimation. Astronomy sonification testing, for example, has shown task performance varying substantially with signal strength rather than reducing performance to a single “sonification works/doesn't work” conclusion. citeturn6search5

**Aesthetics must be isolated from fidelity.** Research on sonification aesthetics treats aesthetic experience as a substantive design concern in its own right, not as a proxy for correctness. citeturn6search7 The 2026 systematic movement-sonification review similarly evaluates outcomes such as performance, intuitiveness, and motivational response separately. citeturn11search0

Thus these are both legitimate outcomes:

```text
Mapping A:
high source-recognition accuracy
low aesthetic preference

Mapping B:
lower source-recognition accuracy
high musical preference
```

The study must not average them into one score that makes B appear “more faithful.”

The musical-utility module should also be task-based. For example:

> “Create a 30-second version you would use as an editable musical sketch while preserving the recognizable density changes.”

Measure edit time, number/type of edits, how often users bypass or alter constraints, and whether the resulting source-related structure survives. Subjective “sounds musical” ratings can accompany those measures but should not replace them.

For cognitive load, NASA-TLX is an established multidimensional subjective workload family, although interpretation of one overall summed score has itself been questioned in some application domains. citeturn12search0turn12search5 AGL should therefore retain subscales rather than rely exclusively on one opaque workload number.

### Experimental design

Recommended reusable design:

```text
consent / equipment check
        ↓
hearing/accessibility configuration
        ↓
standardized mapping tutorial
        ↓
training trials with feedback
        ↓
criterion check
        ↓
randomized/counterbalanced experimental trials
        ↓
task-performance measures
        ↓
workload
        ↓
preference collected separately
        ↓
mapping-comprehension check
        ↓
qualitative interview / think-aloud where appropriate
```

For comparisons among several mappings, use within-subject designs where carryover can be controlled because listener-to-listener perceptual variance is substantial. Randomize/counterbalance order and separate training trials from scored trials.

For remote auditory pilots, record at minimum:

```text
headphone / speakers
mono / stereo
browser / OS
self-reported hearing status
hearing aid / cochlear implant where voluntarily relevant
quiet-environment confirmation
volume/calibration procedure
```

Critical spatial, timbral, and fine-discrimination studies should preferentially run under calibrated or at least more controlled listening conditions. Research comparing auditory experiments outside formal sound booths suggests remote/less-controlled testing can be viable for some tasks, but equivalence depends on the auditory task being measured. citeturn6search8

**Power guidance.** A human pilot of approximately **12–20 participants** is appropriate for discovering floor/ceiling effects, instructions problems, equipment failures, and grossly ineffective mappings, but should not be treated as confirmatory efficacy evidence. For a simple two-sided paired comparison, normal power calculations give approximately:

| Standardized paired effect | Approx. N for 80% power, α=.05 |
|---:|---:|
| `dz = 0.50` | 34 |
| `dz = 0.40` | 52 |
| `dz = 0.30` | 90 |

These are planning approximations, not universal sample sizes. Once pilot data reveal binary accuracy rates, repeated trials, participant variance, item variance, and ceiling/floor behavior, the confirmatory analysis should be powered by simulation for the actual mixed-effects or psychometric model. Add recruitment margin for exclusions/dropout rather than powering on the exact minimum.

Accessibility studies need particular caution: a tiny convenience sample of sighted participants using simulations cannot justify a claim about blind users, nor can normal-hearing participants justify claims about cochlear-implant users. The relevant populations should participate when a claim specifically concerns them; studies showing both similarities and differences between participant populations reinforce this point. citeturn3search19turn8search13

### Research harness

No human pilot was performed as part of this desk-research run. The appropriate handoff is a reusable harness with a declarative experiment schema:

```ts
interface StudyProtocol {
  id: string;
  version: string;

  construct:
    | "discrimination"
    | "comprehension"
    | "task-performance"
    | "musical-utility"
    | "preference"
    | "workload"
    | "accessibility"
    | "reproducibility";

  hypotheses: Hypothesis[];
  stimuli: StimulusRef[];

  training: {
    trials: number;
    feedback: boolean;
    criterion?: number;
  };

  design: {
    withinSubject: boolean;
    randomizationSeed: string;
    counterbalancing: string;
  };

  measures: MeasureSpec[];

  participantConfig: {
    collectAudioEquipment: boolean;
    collectAccessibilityConfig: boolean;
  };

  analysisPlanRef: string;
}
```

Stimuli should point directly to the serialized mapping graph and its content hash. This makes “the stimulus” reproducible as computation rather than merely as an exported audio file.

## ADRs, acceptance tests, and implementation handoff

The following architectural decisions should be accepted as the DR-08 handoff.

| Proposed ADR | Decision |
|---|---|
| **Explicit typed mapping pipeline** | All sampling, normalization, smoothing, transform, quantization/threshold, constraint, and target operations are graph-visible/versioned operators. No lab-private implicit mapping stages. |
| **Temporal semantics in types** | Every operator declares pointwise, causal-stateful, bounded-lookahead, or whole-window behavior. |
| **Dimensions and units are first-class** | Ports carry semantic measurement model, unit, domain, and missing-value rules. |
| **Semantic validity is separate from syntactic computability** | Creative transformations may be allowed while the validator reports which invariants/fidelity claims they destroy. |
| **Musical shaping is an auditable constraint layer** | Constraints expose priority, hardness, candidate decision, distortion, and reason. |
| **Randomness is explicit and seeded** | No implicit stochastic decisions inside deterministic source/mapping operators. |
| **Provenance is executable state** | Event explanations are generated from the same trace used by tests and inspector UI. |
| **Evaluation constructs remain separate** | Preference, fidelity, task performance, comprehension, workload, and accessibility cannot be substituted for one another. |

The following acceptance suite should be considered the minimum DR-08 conformance gate.

| Acceptance test | Expected result |
|---|---|
| Serialize → deserialize every shared operator | Semantically and deterministically identical |
| Bypass every stage | Exact defined identity behavior; trace says `bypassed=true` |
| Fixed-bound endpoints | Exact expected normalized endpoints |
| Constant normalization range | No division error; explicit degenerate diagnostic |
| Outlier benchmark | Min/max and robust methods differ in expected deterministic manner |
| Circular `359°→0°` fixture | No artificial near-full-circle discontinuity |
| Category → numeric-only transform | Compiler rejects without explicit representation/lookup |
| `NaN`/infinite values | Declared deterministic missing policy + diagnostic |
| Centered smoother in zero-latency live graph | Compiler rejects |
| Whole-window normalizer in live source | Compiler rejects unless source is pre-frozen |
| Frozen source window edited | Stored fit invalidated rather than silently reused/recomputed |
| Running normalizer reset | Deterministically reproduces same sequence from same reset |
| Probability gate same seed/input | Identical decisions |
| Unseeded stochastic operator | Validation failure |
| Source event + stochastic drop | Trace distinguishes source generation from variation |
| Musical constraint modifies target | Before/after and distortion reported |
| Competing constraints | Deterministic priority and tie resolution |
| Infeasible hard user lock | Explicit infeasibility; no silent movement |
| Raw-versus-shaped comparison | Exact pre/post-constraint difference |
| Selected event explanation | Traverses source, all transforms, random decisions, constraints, final target |
| Mono playback | No information exists only in stereo position |
| Pitch-alternative mode | Primary pitch-coded information remains inspectable |
| Timbre-alternative mode | Primary timbre-coded information remains inspectable |
| Reduced-motion mode | Semantic state remains available without required animation |
| Graph keyboard/screen-reader projection | Same operator ordering and selection IDs as visual graph |
| Seven-lab conformance | No private opaque normalize/smooth/quantize/constrain implementation |

This extends the program's existing invariant-test direction rather than replacing it; AGL-133 already calls for generated laws covering time, operators, graph, and geometry. fileciteturn0file0

**Recommended shared registry for the MVP**

A small registry is enough:

```text
Sampling
  event.sample
  sequence.step
  time.fixedRate
  beat.fixedStep
  path.nodeTraversal
  path.arcLength
  adaptive.errorBound

Normalization
  normalize.fixedBounds
  normalize.frozenMinMax
  normalize.frozenPercentile
  normalize.frozenMedianMad
  normalize.runningStats
  normalize.circular
  normalize.categoryLookup

Smoothing
  smooth.hold
  smooth.linear
  smooth.onePole
  smooth.movingAverage
  smooth.median
  smooth.slew

Transform
  transform.affine
  transform.invert
  transform.log
  transform.signedLog
  transform.power
  transform.sigmoid
  transform.abs
  transform.difference
  transform.derivative
  transform.norm
  transform.circularComponents

Quantize / threshold
  quantize.scalarBins
  quantize.pitchScale
  quantize.pitchChord
  quantize.rhythmicGrid
  threshold.single
  threshold.hysteresis
  threshold.deadband
  probability.gate

Constraints
  constrain.range
  constrain.scale
  constrain.chord
  constrain.voiceLeading
  constrain.rhythmicGrid
  constrain.polyphony
  constrain.eventDensity
  constrain.playability
  constrain.articulation
  constrain.gainSafety

Targets
  target.note
  target.trigger
  target.control
  target.instrument
  target.pan
  target.spatial
```

The exact registry can grow, but private lab versions of these functions should not.

**Core port changes**

Recommended shared families:

```ts
DimensionedValue<T>
ControlSignal<T>
EventStream<E>
CategoricalValue
CircularValue
GeometryStream<G>
GraphPath
MusicalEventCandidate
ConstrainedMusicalEvent
ProvenanceRef
```

`ControlSignal<T>` should minimally carry:

```ts
interface ControlSignal<T> {
  dimension: DimensionSpec;
  clockDomain: "seconds" | "beats" | "index";

  temporal: TemporalSemantics;

  interpolation:
    | "none"
    | "hold"
    | "linear";

  values: ReadonlyArray<TimedValue<T>> | StreamRef;
}
```

This should land before the port checker/compiler becomes difficult to evolve. The present backlog has AGL-020, AGL-021, and AGL-022 ready, making DR-08's timing particularly important. fileciteturn0file0

**Inspector UX**

AGL-035 should expose four synchronized views:

```text
Pipeline
Source → Sample → Normalize → Smooth → Transform → Quantize → Constrain → Target

State
raw source | normalized | smoothed | mapped raw | shaped | rendered

Explanation
plain language | stage table | exact formula/state | JSON

Comparison
raw mapping A/B shaped output
```

Each stateful or frozen operator gets an unmistakable badge:

```text
POINTWISE
LIVE · CAUSAL
LIVE · 120 ms LOOKAHEAD
FROZEN · WHOLE WINDOW
```

Do not hide that state in a tooltip. “Running percentile” and “frozen percentile” may use similar statistics while communicating different mathematical facts.

Constraint visualization should summarize:

```text
Events unchanged:         82%
Events altered:           16%
Events suppressed:         2%

Median pitch displacement: 34 cents
P95 pitch displacement:   182 cents

Median timing displacement: 0 beats
P95 timing displacement:   1/32 beat
```

Then selection reveals the per-event explanation.

This is a direct implementation of the backlog's requirement that the mathematical inspector expose equations, explanations, live values, stages, and bypass state. fileciteturn0file0

**Lab-specific adoption**

| Lab/backlog area | DR-08 handoff |
|---|---|
| Infinite Staircase | Declare illusion/teaching purpose; expose all control mappings and perceptual shaping explicitly |
| Euclidean | Base Euclidean onset stream remains deterministic; AGL-074 uses shared seeded `probability.gate` and accent operators |
| Tonnetz | Graph/path semantics flow into harmony before explicit register/voicing constraints |
| Fractal | Preserve recursion ancestry/source IDs through every mapping and constraint |
| CA | DR-06 chooses mappings; DR-08 supplies typed discrete/aggregate source dimensions, shared mapping operators, evaluation protocol |
| Chaos | AGL-112 becomes the exemplar shared control pipeline; AGL-113 uses formal live/frozen temporal semantics |
| Penrose | DR-09 owns geometry correctness; AGL-123 consumes typed geometry/path attributes and shared mapping operators |

The backlog explicitly describes AGL-112 as a visible `sample, normalize, smooth, quantize, constrain` pipeline, making the Chaos lab an excellent reference implementation of the cross-lab system rather than a one-off feature. fileciteturn0file0

The visualization side should consume the same semantic values and provenance. AGL-050's projection contract and AGL-053's accessible mathematical descriptions are already listed among DR-08's unblocked items. fileciteturn0file0turn0file3

**Default preset corpus**

Every benchmark should render at least these four variants:

```text
faithful
musical
pedagogical
experimental
```

and each artifact should carry:

```json
{
  "presetId": "agl.faithful.v1",
  "purpose": "analysis",
  "evidenceStatus": "engineering-default",
  "graphHash": "sha256:…",
  "sourceHash": "sha256:…",
  "randomness": "none",
  "temporalMode": "frozen",
  "constraintSummary": {
    "changedEvents": 0,
    "droppedEvents": 0
  }
}
```

The `evidenceStatus` field is worth standardizing:

```text
engineering-default
literature-informed
pilot-supported
controlled-study-supported
lab-specific-validated
experimental
```

That prevents a literature-informed heuristic from acquiring the visual authority of a validated result merely because it ships as a preset.

**Open research and ML roadmap**

Arbitrary learned source-to-audio mappings should remain post-MVP, matching the charter's scope. When introduced, a learned mapping should still behave like a first-class operator rather than a provenance escape hatch.

Minimum learned-operator contract:

```text
model identifier/version/hash
training-data provenance
input feature schema
output schema
normalization embedded or externally visible
deterministic inference mode where possible
random seed when stochastic
uncertainty/confidence where meaningful
output constraints
fallback behavior
model card / intended purpose
evaluation evidence
```

The most promising post-MVP directions are not necessarily black-box “AI turns mathematics into music.” More defensible candidates are:

**Per-user perceptual calibration:** estimate a listener's usable pitch, timbre, spatial, and temporal discrimination and configure otherwise explicit mapping operators.

**Preference-conditioned musical shaping:** learn weights for transparent soft constraints while preserving the raw mapping and reporting learned decisions.

**Adaptive channel allocation:** select among redundant perceptual channels based on device/accessibility configuration.

**Learned inverse/comprehension models:** measure whether source states can be recovered from sonified outputs, using decoding performance as one research instrument rather than claiming the decoder defines human perception.

**Differentiable or learned constraint costs:** retain explicit allowed candidates and provenance while learning the cost function from examples.

Any learned mapping that improves aesthetic preference but degrades state recognition should be reported exactly that way. Aesthetics, discrimination, and task utility remain separate evaluation dimensions.

**Final DR-08 decision**

The framework should be accepted around five non-negotiable invariants:

> **Nothing mathematically meaningful is normalized, smoothed, quantized, randomized, or musicalized invisibly.**

> **Nothing that depends on future data can present itself as a causal live transformation.**

> **No musical constraint may alter a mapped event without leaving a machine-readable and human-readable account of that alteration.**

> **No auditory channel carrying important information may be the sole available representation of that information.**

> **No preference result may be presented as evidence of information fidelity, and no information-fidelity result may be presented as evidence of musical quality.**

Those invariants align directly with AGL's architectural direction: typed/versioned operators, deterministic evaluation, explicit provenance, mathematical inspection, accessible semantic projections, linked selection, and property/invariant testing are all already represented in the program backlog. fileciteturn0file0 They also address the program-plan milestones requiring event provenance, a bounded control pipeline, accessibility gates, representative-user validation, and reproducible builds. fileciteturn0file2

The resulting system is deliberately not a theory of which mathematics “should sound like” which music. It is a **framework for making that authorship explicit, bounded, inspectable, comparable, testable, and reproducible**. That is the appropriate cross-lab contract for Aural Geometry Lab.

Approximate conversation tokens used, including research/tool context: ~125,000–135,000.

#Sonification #Psychoacoustics #AuditoryDisplay #ComputationalMusic #HCI #Accessibility #DataProvenance #AuralGeometryLab