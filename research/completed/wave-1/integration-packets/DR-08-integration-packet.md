# Aural Geometry Lab — Sonification Research Integration Packet

**Current date:** 2026-08-18  
**Research run:** DR-08 — General Sonification Mapping, Musical Constraint, Explainability, and Evaluation Framework  
**Integration target:** AGL Wave 1 architecture, ADRs, schemas, operator contracts, UX, conformance tests, evaluation harness, and backlog

**TL;DR**

DR-08 should become a **shared runtime contract**, not a collection of lab-specific mapping recipes. AGL needs one typed, versioned, serializable pipeline with explicit causality, windowing, randomness, constraint effects, units, and provenance.  
The most consequential architectural boundary is that **live/causal mappings and whole-window/frozen mappings are different semantics**, not configuration details. Future samples must never silently alter already-produced live outputs.  
Musical shaping must be downstream, deterministic, bypassable where possible, and explain exactly how it altered the raw mapping. Random variation must likewise be an explicit seeded operator rather than being hidden inside generators or constraints.  
The literature supports useful tendencies, but **does not support a universal ranking of pitch, loudness, duration, timbre, or spatial position**. Perceptual performance depends on task, listener, context, training, hardware, and simultaneous mappings. citeturn1search0turn13search4turn7search13turn11search2  
The existing AGL plan is unusually well aligned with this direction, but DR-08 requires hardening AGL-004/010/020–024/027/035/041/050/053/112/132/133 and adding a shared mapping/provenance fixture pack before M1/M2 architecture freezes. fileciteturn0file0

**Evidence labels used below:** **Established evidence** = directly supported by standards or controlled/peer-reviewed research; **Strong inference** = synthesis that follows from multiple sources but was not itself directly tested; **Engineering recommendation** = proposed AGL policy; **Speculative** = worthwhile hypothesis requiring validation.

## Decision and Evidence Register

**Executive Decision Summary**

| Decision | Disposition | Basis and implementation consequence |
|---|---|---|
| Make `Source → Sample → Normalize → Smooth → Transform → Quantize/Threshold → Constrain → Target` the canonical mapping pipeline. | **ADOPT** | **Engineering recommendation, high confidence.** It turns the authorship choices DR-08 identifies into explicit operators. Declarative sonification systems demonstrate that mappings can be represented compositionally rather than hidden in rendering code, while established sonification definitions emphasize deliberate transformation of data relationships into acoustic relationships. citeturn13search5turn10search0 |
| Treat every mapping stage as versioned, serializable, testable, and bypassable, with runtime safety/budget enforcement outside the bypassable musical chain. | **ADOPT** | **Strong inference.** This is necessary for reproducibility, provenance, project migration, A/B inspection, and cross-lab reuse. It extends the existing versioned operator catalog, executable interface, deterministic cache, and evaluation-budget architecture rather than replacing them. fileciteturn0file0 |
| Separate **sonification technique** from **product purpose**. | **ADOPT** | **Established evidence + recommendation.** Parameter mapping, audification, model-based sonification, earcons, and auditory icons describe different representational techniques; “analytical,” “pedagogical,” “compositional,” and “illusion” should be separate AGL purpose labels. Sonification itself is broader than musical composition. citeturn13search5turn6search9turn6search0turn6search3 |
| Do **not** treat “musical data mapping” as a sixth scientifically distinct sonification paradigm. | **ADOPT WITH CONDITIONS** | **Strong inference.** In AGL it is better modeled as parameter mapping plus a compositional purpose and optional musical constraints. This avoids suggesting that musicality changes the epistemic status of the underlying mapping. citeturn13search5turn1search0 |
| Add source-dimension metadata for value type, unit, measurement scale, topology, domain, and missing-value semantics. | **ADOPT** | **Engineering recommendation, high confidence.** Transformation validity depends on what a value means, not merely its numeric representation. The classic nominal/ordinal/interval/ratio taxonomy remains useful as a validation guardrail, although later measurement-theory work cautions against treating it as a complete ontology. citeturn0search2turn0search9 |
| Make `causal`, `frozenWindow`, and `acausal` explicit execution semantics, enforced by the type/compiler/runtime boundary. | **ADOPT** | **Critical.** A causal live mapping may depend only on the source history available at that instant. Whole-window min/max, percentile, centered filters, and similar future-dependent operations must not masquerade as live processing. This is already anticipated by AGL-113's causal-live/frozen distinction. fileciteturn0file0 |
| Prefer fixed domain bounds when scientifically meaningful; allow frozen-window and robust statistics only with recorded window/statistic semantics. | **ADOPT WITH CONDITIONS** | **Engineering recommendation.** Fixed bounds are stable under insertion of unrelated future samples and support cross-run comparison. Robust estimators such as MAD resist outliers, but that does not make them semantically correct for every source, and MAD can degenerate on sparse/discrete signals. citeturn12search0 |
| Never silently coerce missing, `NaN`, or infinite values to zero. | **ADOPT** | **Engineering recommendation, high confidence.** Missingness and numeric zero carry different information. AGL should expose explicit `gap`, `drop`, `holdLast`, or `error` behavior, with `holdLast` available only where statefulness is intentionally declared. |
| Smoothing and interpolation must be explicit operators; no implicit “make it sound nicer” filtering. | **ADOPT** | **Strong inference.** Smoothing can add latency and remove structure, while auditory-display work shows that details such as data density and trend reversals materially affect task performance. citeturn7search6 |
| Quantization, thresholding, hysteresis, and stochastic event generation are distinct operators with distinct provenance. | **ADOPT** | **Engineering recommendation.** A threshold is deterministic classification; hysteresis adds state; quantization discretizes a target domain; probability introduces randomness. Combining them would make “why did this note happen?” substantially harder to answer. |
| Random variation must be seeded and keyed independently of source generation. | **ADOPT** | **Engineering recommendation, critical for reproducibility.** AGL already has seed/stable-ID utilities, and AGL-074 explicitly requires seeded variation to remain separate from Euclidean generation. fileciteturn0file0 |
| Implement musical constraints as a deterministic downstream constraint engine with explicit hard/soft priority and conflict provenance. | **ADOPT** | **Engineering recommendation.** Scale/chord quantization, register, voice leading, rhythmic grids, polyphony, and similar operations can change the represented data. Their effects must therefore be attributable rather than silently folded into mapping operators. |
| Make `faithful`, `musical`, `pedagogical`, and `experimental` **preset bundles**, not alternate execution semantics. | **ADOPT** | **Strong inference.** A preset should resolve into an ordinary explicit graph. Otherwise “musical mode” becomes an opaque branch that defeats serialization, cache identity, migration, and explanation. |
| Preserve both raw mapped values and final constrained values in event explanations. | **ADOPT** | **Critical.** A selected event must reveal whether its final note differed from what the data mapping initially produced. This directly serves AGL-035 and the M1 event-provenance exit criterion. fileciteturn0file0turn0file2 |
| Require logical real-time/offline equivalence at the mapping/render-plan boundary, but not bit-identical audio waveforms. | **ADOPT WITH CONDITIONS** | **Engineering recommendation.** The same graph, frozen inputs, state policy, seed, and render interval should generate the same event identities and target parameters. DSP/scheduling tolerances must be reconciled with DR-03; AGL-041 already requires one canonical render plan to serve both paths. fileciteturn0file0turn0file3 |
| Do not prescribe one universal “best” auditory dimension. | **REJECT** any architecture based on such a ranking | Pitch is widely used, but mappings interact with task, conceptual polarity, musical experience, other simultaneous dimensions, and listener/access conditions. Pitch and loudness can perceptually distort one another. Studies also disagree by task on whether pitch, temporal encodings, or spatial audio are most effective. citeturn1search0turn13search4turn7search13turn1search11turn11search2 |
| Require equivalent non-audio/non-motion representations for information carried through pitch, loudness, timbre, pan/spatial position, or animation. | **ADOPT** | **Established accessibility principle + recommendation.** WCAG requires that information not depend solely on sensory characteristics and requires keyboard accessibility and motion-related accommodations. A multimodal data model is more robust than attempting to nominate a universally accessible sound channel. citeturn0search10turn11academia46 |
| Separate information fidelity, comprehension, task performance, musical utility, preference, cognitive load, accessibility, and technical reproducibility in evaluation. | **ADOPT** | **Established methodological need.** Sonification evaluation has historically lacked standardized comparison; preference is not a measurement of decoding accuracy, and auditory-display studies routinely measure different dependent variables. citeturn5search2turn7search0turn5search12 |
| Freeze a cross-lab mapping benchmark corpus before individual lab sonification profiles stabilize. | **ADOPT** | **Engineering recommendation, high leverage.** Every one of the seven labs lists DR-08 as relevant, and DR-02/04/05/06/07/09 depend on DR-08 in the research register. A shared fixture corpus prevents each run from inventing incompatible interpretation semantics. fileciteturn0file1turn0file3 |
| Universal pitch registers, smoothing constants, robust-normalization percentiles, event-density ceilings, gain targets, and “pleasantness” defaults. | **DEFER / REQUIRES CROSS-RUN RECONCILIATION** | The general literature does not justify universal values. Audio/gain and scheduling need DR-03; chaos sampling/smoothing needs DR-07; voicing and harmony need DR-04; illusion-specific parameters need DR-01. fileciteturn0file3 |

**Evidence → Decision Matrix**

| Finding / evidence | Evidence strength | Engineering implication | Recommended decision | Confidence | Source(s) |
|---|---|---|---|---|---|
| Sonification transforms data relationships into acoustic/perceived relationships to support communication or interpretation. | Established | Mappings themselves are representational artifacts and need explicit definitions. | Store mapping semantics as first-class project data. | High | ICAD Sonification Report. citeturn13search5 |
| Parameter mappings in the literature are highly heterogeneous; pitch is the most frequently used mapped parameter, while rigorous evaluation is much less common than mapping proposals. | Established systematic review | Prevalence is not evidence of optimality; no auditory channel should be privileged by architecture. | Support a common target ontology and evidence metadata rather than hard-coded recipes. | High | Dubus & Bresin review of 179 publications/495 mappings. citeturn1search0turn1search4 |
| Pitch and loudness changes can interact perceptually and distort represented data relations. | Established controlled experiments | Simultaneous quantitative mappings need conflict warnings/evaluation rather than assuming perceptual independence. | Validator warning for concurrent precision-critical pitch+loudness encoding. | High | Neuhoff, Kramer & Wayand. citeturn13search4 |
| Preferred polarity and scaling depend on both the represented concept and sound dimension. | Established controlled experiments | “Higher sound = more data” cannot be a global rule. | Mapping presets declare polarity explicitly; educational UI states it. | High | Walker 2002/2007. citeturn7search13turn7search1 |
| Musical training can affect pitch interpretation and directional judgments. | Established controlled research | A pitch-centric design risks systematic user-group differences. | Offer legends/training and equivalent exact-value representation. | Medium-high | Neuhoff, Knight & Wayand. citeturn1search14 |
| Practice with feedback can improve auditory-graph point estimation. | Established experiment | Learnability should be measured separately from first-use intuitiveness. | Evaluation harness includes pre/post or learning-curve measures. | Medium-high | Walker & Nees. citeturn7search0 |
| Data density/trend reversals affect auditory-graph performance. | Established research | Sampling/event-density choices are not neutral preprocessing. | Record sampling operator and density diagnostics in provenance. | Medium-high | Nees. citeturn7search6 |
| One BLV-oriented study found pitch intuitive while temporal/count encodings could be more accurate for some elementary data-level tasks. | Established but limited/generalization uncertain | Intuitiveness and accuracy must be represented as different evidence fields. | Preset evidence schema separates `preference`, `accuracy`, and `learnability`. | Medium | Wang, Jung & Kim. citeturn1search11 |
| A 2026 controlled study found spatial azimuth superior to pitch for sign/exact-value tasks, similar on trend, while pitch performed better on value comparison. | Established, single study/context | Channel effectiveness is task-specific; spatial sound is not simply “better.” | Permit task-oriented presets; never advertise a universal ranking. | Medium | Liu et al., 2026. citeturn11search2 |
| Timbre correspondence can be much less consensual than some pitch/duration correspondences in a specific network-sonification study. | Established but narrow context | Instrument/timbre identity is safer as categorical or learned coding than universal quantitative semantics. | No generic numeric `data → timbre` default. | Medium-low | 2026 AVI study. citeturn11search0 |
| Equal physical/digital amplitude across frequencies does not imply equal perceived loudness. | Established psychoacoustics standard | Mapping a quantitative variable directly to linear gain is not a perceptually linear loudness scale. | Call target `gain`/`level`, not “perceived loudness,” unless calibrated. | High | ISO 226:2023 equal-loudness contours. citeturn8search0 |
| Frequency can affect perceived duration; duration discrimination also varies with expertise and stimulus duration. | Established experiment | Pitch and duration are not perfectly independent channels. | Interaction warnings and user testing for dual quantitative mappings. | Medium | Jeon & Fricke. citeturn8search13 |
| Hearing loss can reduce spectral resolution. | Established psychoacoustics/hearing research | Fine timbral or spectral distinctions cannot serve as the only carrier of critical state. | Offer explicit text/visual/other-modal equivalent. | High | Dreisbach et al. citeturn7search14 |
| WCAG requires information/relationships and instructions not to rely only on sensory characteristics; keyboard and motion requirements also apply. | Authoritative standard | Accessible representation must exist at the semantic model level, not as a later caption patch. | One shared semantic description for visual graph, ordered list, inspector, and alternatives. | High | WCAG 2.2. citeturn0search10 |
| Safe-listening risk depends on actual sound level and exposure duration; WHO gives examples such as 80 dB for 40 h/week and 90 dB for 4 h/week. | Authoritative health guidance | Browser `gain`, dBFS, or LUFS alone cannot establish listener SPL or safe exposure. | Keep limiting/emergency-stop controls, but never label an internal gain value “hearing-safe.” | High | WHO. citeturn13search1turn13search3 |
| Robust estimators such as MAD provide substantially greater resistance to outliers than ordinary spread estimates. | Established statistical theory | Robust normalization should be available where outliers would otherwise dominate, but semantics must remain explicit. | Add frozen robust-center/scale operator; do not make it universal default. | High | Rousseeuw. citeturn12search0 |
| Sonification evaluation needs explicit standardized tasks/comparisons. | Established methodological literature | “Users liked it” cannot close a fidelity requirement. | Evaluation harness has independent outcome families. | High | SonEX. citeturn5search2 |
| Sample-size justification should follow the inferential goal, minimally important effect/precision, and chosen statistical test rather than a ritual fixed `N`. | Established statistical guidance | AGL studies need analysis plans, not one universal participant count. | Require predeclared primary endpoint and power/precision rationale. | High | Lakens; G*Power methodology. citeturn9search2turn9search0 |
| AGL already has rational time, events, versioned operators, seeds, graph/compiler/evaluator/cache, provenance-oriented inspector, render plan, accessibility, and invariant-test work on the backlog. | Current project state | DR-08 should extend existing contracts rather than introduce a second sonification runtime. | Integrate into E1/E2/E3/E4/E5/E13 artifacts. | High | Current backlog/program plan. fileciteturn0file0turn0file2 |

**Sonification terminology and purpose taxonomy**

AGL should serialize two orthogonal fields:

```ts
type SonificationTechnique =
  | "parameterMapping"
  | "audification"
  | "modelBased"
  | "earcon"
  | "auditoryIcon"
  | "hybrid";

type SonificationPurpose =
  | "analytic"
  | "pedagogical"
  | "compositional"
  | "perceptualIllusion";

interface PurposeDescriptor {
  primary: SonificationPurpose;
  secondary?: SonificationPurpose[];
}
```

The distinction matters. **Audification** treats data samples or a transformed data waveform as audio samples; **parameter-mapping sonification** maps data attributes to sound parameters; **model-based sonification** makes data configure a dynamic acoustic model that is then excited or interacted with; **earcons** are learned abstract musical/nonverbal motifs; **auditory icons** use recognizable real-world sounds by analogy. citeturn6academia46turn6search9turn6search0turn6search3

For AGL, most cross-lab work belongs to `parameterMapping`; the Infinite Staircase includes a `perceptualIllusion` purpose; learned UI/status sounds would be `earcon`, not mathematical sonification; raw trajectory-to-waveform experiments could use `audification`; and model-based sonification should remain available but is not needed as the MVP's common mapping mechanism. This assignment is an **engineering classification**, not a claim that the mathematical labs intrinsically belong to one sonification school.

**User-Facing Scientific Claims**

**Safe to state directly**

- “Sonification uses nonspeech audio to communicate information; in data sonification, relationships in data are transformed into relationships that can be perceived acoustically.” citeturn13search5
- “Pitch is widely used in sonification, but no auditory dimension is universally best for all data or tasks.” citeturn1search0turn11search2
- “Pitch and loudness can interact perceptually, so using them simultaneously for precise independent quantities can distort judgments.” citeturn13search4
- “How people interpret a sound-to-data mapping can depend on the represented concept, the direction of the mapping, and listener experience.” citeturn7search13turn7search1turn1search14
- “Sampling, normalization, smoothing, quantization, and musical constraints are representational choices; changing them can change what features are easy to hear.” This is a **strong synthesis**, consistent with controlled auditory-display findings on density, trend reversal, and perceptual interaction. citeturn7search6turn13search4
- “A digital gain setting alone cannot tell you the sound-pressure level at a listener's ears.” WHO safe-listening guidance is expressed in actual exposure level and duration, not software gain. citeturn13search1turn13search3

**Safe only with qualification**

- “Pitch is intuitive.” **Required qualification:** “Pitch has been judged intuitive in some sonification studies and tasks, but accuracy and preferred polarity vary by task and user group.” citeturn1search11turn7search13
- “Temporal encoding is more accurate than pitch.” **Required qualification:** “Some elementary tasks in one study favored tapping count or sound duration; this is not a general channel ranking.” citeturn1search11
- “Spatial audio improves quantitative sonification.” **Required qualification:** “A 2026 controlled study found advantages for azimuth in sign and exact-value tasks, while pitch retained an advantage for value comparisons; results are task- and hardware-dependent.” citeturn11search2
- “Robust normalization is better than min/max.” **Required qualification:** “Robust statistics are more resistant to outliers, but may alter the intended domain meaning and can be degenerate for low-variation/discrete data.” citeturn12search0
- “Musical constraints make a sonification better.” **Required qualification:** “They can improve compositional utility or preference, but may reduce data fidelity; AGL evaluates those outcomes independently.” Sonification evaluation literature does not justify substituting preference for representational accuracy. citeturn5search2
- “Loudness represents magnitude.” **Required qualification:** “Sound level can be ordered, but perceived loudness is frequency-dependent and interactions with pitch can bias judgments.” citeturn8search0turn13search4

**Do not claim**

AGL should not state that high pitch universally means “more,” that one auditory variable is universally most accurate, that musical quantization preserves mathematical fidelity, that preferred sound proves accurate information communication, that stereo pan is equally interpretable or accessible for all listeners/equipment, that a browser limiter guarantees hearing-safe listening, that randomized events are properties of the mathematical source, that frozen whole-window normalization is causal, or that an ML-learned mapping is inherently interpretable. The controlled literature specifically shows mapping- and task-dependent polarity/performance and perceptual interactions, while actual safe exposure cannot be inferred from internal digital gain alone. citeturn7search13turn13search4turn11search2turn13search1

## Architecture and ADR Packet

**Architecture Consequences**

| Affected subsystem | Exact architectural implication | Contract change? | Dependencies / late-migration cost | Recommendation |
|---|---|---|---|---|
| Canonical project model | Persist the full compiled mapping graph or graph references, operator versions, parameters, purpose, profile provenance, causality/window metadata, and random seed references. | **Public project schema** | AGL-010/011. Retrofitting later requires migrations from projects whose mapping semantics may no longer be reconstructable. | **Implement before M1 schema freeze.** fileciteturn0file0turn0file2 |
| Rational musical-time model | Beat-domain sampling and rhythmic quantization operate on exact rational positions. Conversion to floating seconds occurs only at the render/scheduler boundary. | Existing public core contract extended | AGL-002/031/041. Late float-based mapping would create drift/rounding compatibility liabilities. | Preserve rational values through mapping wherever the domain is musical time. fileciteturn0file0 |
| Event/pattern model | Generated events need stable lineage/trace keys; frozen events need lineage plus the graph/window/seed that produced them. `rawMappedTarget` and `finalTarget` need not both live directly on every event but must be obtainable through provenance. | Public/internal | AGL-003/027/032. High migration cost once saved clips lack lineage. | Extend before freeze-to-clip ships. fileciteturn0file0 |
| Typed operator graph | Add semantic type metadata: dimensions, units, topology, statefulness, causality/window dependency, and target compatibility. | **Core public graph contract** | AGL-004/020/021/022. Very high late cost: every lab otherwise invents private adapters. | Treat as DR-08's central architectural change. fileciteturn0file0 |
| Control signals | A `ControlSignal<T>` carries timestamps/index domain plus `DimensionSpec`; source values must not become anonymous `number[]`. | Core internal/public port types | AGL-112 currently sits in Chaos E11 although DR-08 is cross-lab. Late change ripples through every mapping. | Promote shared control-signal contract into runtime spine. fileciteturn0file0 |
| Graph compiler | Reject invalid unit/scale operations, forbidden future-dependent operators in causal plans, undeclared state cycles, incompatible targets, and absent operator versions. | Internal compiler behavior with user-visible diagnostics | AGL-021/022/026. | Add static semantic validation where decidable. |
| Worker/runtime evaluation | Stateless operations remain pure; stateful operators expose explicit state initialization/reset/checkpoint behavior. Evaluator must support deterministic replay from a known state. | Internal runtime contract | AGL-023/026. Retrofitting state semantics later can break seek/render equivalence. | Implement before continuous mapping is productionized. |
| Deterministic cache | Cache identity incorporates the **resolved graph**, operator versions/parameters, source/input hash, window/statistics artifact, seed/keying scheme, and execution semantics. | Internal but compatibility-sensitive | AGL-024. Omitting window or state semantics risks false cache hits. | Include semantics, not just node parameter JSON, in key derivation. fileciteturn0file0 |
| Render plan | Audio backend receives resolved logical events/control automation and trace keys. Audio backend must not independently normalize, quantize, or impose musical mappings. | **Core render-plan contract** | AGL-041/042/045; DR-03. High late cost if WebAudio and offline renderers diverge. | Make mapping a pre-render concern. fileciteturn0file0 |
| Real-time audio | Only causal mappings or references to deliberately frozen statistics are allowed. Stateful mappings define startup/seek/loop behavior. | Runtime contract | DR-03 and AGL-031/041/043. | Compiler/runtime hard error for undeclared future dependency. |
| Offline rendering | May evaluate frozen/whole-window operators because the interval is known, but the window must be explicit and persisted in provenance. | Runtime behavior | AGL-045. | Offline must not silently “improve” a causal live mapping by changing normalization semantics. |
| Realtime/offline equivalence | For the same semantic mode and source state, event IDs, rational times, discrete decisions, and final logical target parameters must agree. Audio samples may differ within backend-defined tolerances. | Cross-backend contract | DR-03. | Put logical equivalence in DR-08; waveform tolerance in DR-03. fileciteturn0file3 |
| MIDI | Export the final selected/constrained event representation and emit loss/quantization warnings; do not re-run sonification inside the exporter. | Exporter contract | AGL-130. | Mapping provenance should identify where data shaping occurred before export. fileciteturn0file0 |
| MusicXML | Same principle: notation conversion may incur representational loss, but must not become a hidden extra musical-constraint stage. | Exporter contract | AGL-131; exact notation policies outside DR-08. | Record export-only loss separately from sonification constraints. fileciteturn0file0 |
| Project persistence | `NaN`/±∞ are not persisted as ordinary JSON numeric values; samples containing them use explicit tagged missing/nonfinite status or are rejected by policy. | Public schema | AGL-010/011. | Canonical tagged representation; never depend on host JSON quirks. |
| Provenance | Event explanation is an execution trace over stage transitions, including state/window/seed/constraint effects, not a prose string generated ad hoc. | **Core public semantic model** | AGL-020/035/036/050. High migration cost if IDs/lineage are absent. | Add a structured `MappingTrace`. fileciteturn0file0 |
| Inspector UX | “Why this note?” displays raw source, each operation, causal/frozen status, random decision, constraint deltas, and final target. | Hard UX contract | AGL-035/036. | Must derive from provenance rather than reverse-engineering audio. |
| Visualization projection | Raw and shaped mappings can be projected simultaneously; sample positions/windows/clipping are visible. Accessible semantic description uses the same data. | Internal projection contract + accessible public semantics | AGL-050/053. | Extend projection primitives with stage and lineage references. fileciteturn0file0 |
| Command/undo architecture | Mapping edits, bypass, profile application, freeze, seed changes, and constraint edits are commands. Runtime state/provenance is derived, not independently undoable state. | Command contract | AGL-012/027. | Applying a preset should be one atomic transaction expanding to explicit parameter changes. |
| Generated vs frozen material | Generated material references live graph semantics; frozen material contains materialized events plus immutable generation lineage. Re-running generation must be explicit. | Project/event contract | AGL-027/032. | Do not silently update frozen clips when source graph changes. fileciteturn0file0 |
| WebAssembly/shared core / Swift | Any duplicated implementations need semantic conformance fixtures for scalar operations and discrete decisions; using one shared core greatly reduces edge-condition divergence. | Cross-platform contract | Depends on native-client architecture not supplied by DR-08. | **Requires cross-run reconciliation.** |
| Accessibility | The semantic data behind an auditory encoding must also support ordered text/table/visual or other equivalent representations. | Product-wide hard contract | AGL-053/132. | Accessibility must consume the same dimension/provenance model, not infer from rendered sound. fileciteturn0file0turn0search10 |

A crucial boundary follows: **musical constraints are not the same thing as runtime safety constraints**. A user may bypass scale quantization, voice-leading, rhythmic snapping, or register shaping in a “raw mapping” comparison. They may not bypass event budgets, invalid-frequency rejection, backend representability, master safety behavior, or emergency-stop enforcement. AGL-025 and AGL-049 already provide the architectural homes for those non-musical boundaries. fileciteturn0file0

**Proposed ADRs**

**ADR-MAP-PIPE: Canonical Typed Sonification Mapping Pipeline**

**Context.** All seven laboratories require DR-08, while the present backlog already separates operator catalog, execution, type checking, graph compilation, worker evaluation, control signals, visualization, and rendering. Without one mapping model, labs are likely to encode normalization and musical shaping inside private operators. fileciteturn0file0turn0file1

**Decision.** AGL represents mathematical-to-auditory mapping as:

```text
Source
  → Sample
  → Normalize
  → Smooth
  → Transform
  → Quantize/Threshold
  → Constrain
  → Target
```

Each intermediate stage is represented by typed, versioned operators. A stage may contain zero, one, or multiple operators. “Bypassed” remains explicit configuration rather than deleting the stage from provenance.

**Alternatives considered.** Per-lab mapping code; one monolithic `Sonify` operator; audio-backend mappings; implicit profile logic.

**Consequences.** Larger graph/schema vocabulary but uniform provenance, tests, preset composition, and raw-vs-shaped comparison.

**Risks.** Excessive graph verbosity. Mitigation: UX can collapse canonical stage groups while retaining underlying operators.

**Evidence.** Declarative auditory-display systems demonstrate compositional encoding models; sonification literature demonstrates broad variation in mappings, making hidden defaults risky. citeturn10search0turn1search0

**Confidence.** **High — engineering recommendation.**

**ADR-CAUSAL: Causal and Frozen-Window Operations Are Distinct Semantics**

**Context.** Normalization, filtering, statistics, and adaptive processing can depend on future samples when used over an entire interval. AGL explicitly intends both live and frozen trajectory modes. fileciteturn0file0

**Decision.** Every operator whose output can depend on temporal context declares one of:

```ts
type TemporalSemantics =
  | { kind: "causal" }
  | { kind: "frozenWindow"; window: IntervalRef; statisticsRef?: Id }
  | { kind: "acausal"; window: IntervalRef };
```

A causal execution plan cannot contain `frozenWindow`/`acausal` operations unless their required result has already been materialized into an immutable artifact available before playback.

**Alternatives considered.** One `live: boolean`; infer semantics from operator type; allow live preview to use whatever samples happen to be buffered.

**Consequences.** Realtime behavior becomes prefix-stable and explainable; explicit frozen analyses require more metadata.

**Risks.** Some pleasing live normalizers become harder to provide. They must instead use explicitly causal running estimators.

**Evidence.** This is principally a determinism/semantics requirement rather than a psychoacoustic finding; it directly operationalizes AGL-113. fileciteturn0file0

**Confidence.** **Very high — architecture-critical.**

**ADR-DIM: Dimension, Unit, Measurement-Scale, and Topology Metadata**

**Context.** A scalar could be Celsius temperature, count, rank, angle, probability, graph distance, or arbitrary normalized control. Those values do not admit the same transformations.

**Decision.**

```ts
interface DimensionSpec {
  id: string;
  label: string;
  valueType:
    | "real" | "integer" | "boolean" | "category"
    | "vector2" | "vector3" | "entityRef";
  measurementScale: "nominal" | "ordinal" | "interval" | "ratio";
  topology:
    | { kind: "linear" }
    | { kind: "circular"; period: number; origin: number }
    | { kind: "categorical" }
    | { kind: "spatial"; dimensions: 2 | 3 }
    | { kind: "graph" };
  unit: UnitId | null;
  domain: DomainSpec;
  missingPolicy: MissingPolicy;
}
```

Measurement scale is a **validation hint/contract**, not a philosophical claim that Stevens' typology exhausts all valid measurement structures. Circular, spatial, and graph structure live separately in `topology`. The received scale taxonomy is historically influential but also incomplete/contested as a full theory of measurement. citeturn0search2turn0search9

**Alternatives considered.** Raw doubles with labels; unit metadata only; scale metadata only.

**Consequences.** Enables static validation and better inspector explanations, at the cost of schema verbosity.

**Risks.** Users may overinterpret scale labels. UI should describe specific allowed/unsafe transformations rather than teach them as immutable natural laws.

**Confidence.** **High.**

**ADR-RANDOM: Randomness Is Explicit, Seeded, and Keyed**

**Context.** Probabilistic accents, stochastic grammars, numerical uncertainty, and deterministic mathematical dynamics are conceptually different.

**Decision.** Any deliberate random decision occurs in a random/stochastic operator and is keyed from project seed + stable semantic identity, rather than depending solely on mutable PRNG iteration order:

```text
u = PRF(seed, operatorStableId, sourceStableId, decisionKind, version)
emit ⇔ u < p
```

The exact PRF/seed utility is the existing AGL seed subsystem's responsibility; DR-08 does not invent a second algorithm.

**Alternatives considered.** Global sequential PRNG; `Math.random()`; randomness embedded inside generators/constraints.

**Consequences.** Inserting unrelated events need not perturb existing decisions; traces can explain stochastic outcomes; frozen/realtime runs remain reproducible.

**Risks.** Requires stable identity discipline. AGL-005 already supplies the seed/stable-ID foundation, and AGL-074 explicitly requires variation separate from Euclidean generation. fileciteturn0file0

**Confidence.** **Very high.**

**ADR-CONSTRAINT: Deterministic Musical Constraint Resolution**

**Context.** Register, scale/chord membership, voice leading, rhythmic grid, polyphony, articulation, and density constraints can conflict and modify the raw data mapping.

**Decision.** Constraints have:

```ts
interface MusicalConstraint {
  id: StableId;
  version: SemVer;
  kind: ConstraintKind;
  hardness: "hard" | "soft";
  priority: number;          // lower number = earlier / stronger
  relaxable: boolean;
  costModel?: CostModelRef;
  params: JsonValue;
}
```

Resolution is deterministic:

1. Enumerate/calculate candidate target states using a versioned strategy.
2. Remove states violating non-relaxable hard constraints.
3. If no candidate remains, apply declared `unsatisfiedPolicy = "drop" | "error" | "relax"`.
4. `relax` may relax only explicitly `relaxable` hard constraints, in deterministic weakest-first order.
5. Rank feasible states lexicographically by ordered soft-priority cost vector.
6. Break residual ties by aggregate cost, distance from the raw target, canonical target ordering, then stable ID.
7. Emit a `ConstraintDecision` for every alteration, rejection, or relaxation.

Exact musical cost definitions—for example Tonnetz voicing distance—remain DR-04 dependencies.

**Alternatives considered.** Imperative constraint order; whichever plugin runs last wins; randomized tie breaking.

**Consequences.** Reproducible and inspectable output; some optimizers need a formal canonical candidate order.

**Risks.** Cost-model choices can embed aesthetic bias.

**Evidence.** This is an architecture recommendation required by AGL's deterministic voicing and provenance goals; it is not a psychoacoustic law. AGL-083 already calls for explicit cost, constraints, tie breaking, and provenance. fileciteturn0file0

**Confidence.** **High for framework; medium for lab-specific cost functions.**

**ADR-PROV: Event-Level Mapping Trace and Explainability Contract**

**Context.** AGL's inspector, linked selection, recursion ancestry, CA lineage, and M1 exit criteria all depend on traceable generation. fileciteturn0file0turn0file2

**Decision.** The minimum answer to “Why did this note happen?” is structured:

```ts
interface MappingTrace {
  traceId: StableId;
  projectRevision: RevisionId;
  purpose: PurposeDescriptor;

  source: {
    sourceNodeId: StableId;
    sourceEntityId?: StableId;
    sourceDimensionId: string;
    sourceIndex?: bigint;
    sourceTime?: RationalTime | Seconds;
    value: TraceValue;
  };

  stages: StageTrace[];

  randomness?: {
    seedRef: Id;
    key: string;
    probability?: number;
    sampledUnitValue?: number;
    outcome: string;
  }[];

  constraints: ConstraintDecision[];

  finalTarget: TargetTrace;

  reproducibility: {
    graphHash: Hash;
    inputHash: Hash;
    engineSemanticVersion: string;
    frozenArtifactHash?: Hash;
  };
}

interface StageTrace {
  operatorId: StableId;
  operatorType: string;
  operatorVersion: string;
  paramsHash: Hash;
  bypassed: boolean;
  temporalSemantics: TemporalSemantics;
  input: TraceValue;
  output: TraceValue;
  flags?: ("clipped" | "missing" | "nonfinite" |
           "quantized" | "interpolated" | "relaxed")[];
  windowRef?: Id;
  stateDigest?: Hash;
}
```

Dense streams need not persist every intermediate sample indefinitely. AGL may use **deterministic replay + immutable graph/input/version artifacts + state checkpoints**, while frozen material retains sufficient lineage to reproduce its generation.

**Alternatives considered.** Human-readable string only; backend debug log; store every intermediate forever.

**Consequences.** Excellent inspector/accessibility support but potentially substantial storage/runtime instrumentation.

**Risks.** Replay becomes impossible if old operator versions are removed. Operator-version compatibility therefore becomes part of project retention policy.

**Confidence.** **Very high for semantic contract; medium for storage strategy.**

**ADR-EQUIV: Logical Realtime/Offline Mapping Equivalence**

**Context.** The program already requires one canonical audio render plan and M2 offline/realtime plan agreement. fileciteturn0file0turn0file2

**Decision.** For identical source artifact, graph, interval, seed, temporal semantics, initial/checkpoint state, and engine semantic version:

```text
RealtimeLogicalPlan ≡ OfflineLogicalPlan
```

where equivalence requires exact event identity/order, exact rational musical timestamps, exact categorical/discrete decisions, and numerically conformant scalar targets. It does **not** require waveform bit identity across WebAudio/native/DSP backends.

**Alternatives considered.** Separate offline pipeline optimized for quality; waveform equality requirement; “approximately same music” tests.

**Consequences.** Mapping discrepancies are caught before DSP ambiguity.

**Risks.** Floating transcendental implementations may differ enough near thresholds to flip decisions; see cross-platform dependency below.

**Evidence.** Primarily an AGL reproducibility requirement; waveform scheduling/tolerance waits for DR-03. fileciteturn0file3

**Confidence.** **High.**

**ADR-ACCESS: Semantic Equivalence Across Sensory Representations**

**Context.** Critical information may be encoded via pitch, gain, timbre, stereo position, geometry, or animation. User capabilities and equipment vary, and WCAG prohibits relying solely on sensory characteristics in instructions/information. citeturn0search10

**Decision.** Every information-bearing mapping target exposes an equivalent semantic value and description independent of the audio renderer. Inspector/list/table/visual/haptic-capable clients consume that same semantic representation. No scientific state is defined solely as “the thing you hear over there” or “the moving blue object.”

**Alternatives considered.** Caption audio after implementation; assume visual view is sufficient; prescribe one alternate auditory dimension.

**Consequences.** Accessibility is structurally aligned with provenance and visualization.

**Risks.** “Equivalent” does not mean perceptually identical; task efficacy still needs evaluation with the relevant population. Multimodal accessibility work supports complementary modalities rather than assuming one universal replacement. citeturn11academia46turn11search10

**Confidence.** **High.**

**ADR-PROFILE: Mapping Profiles Expand to Explicit Graph Configuration**

**Context.** DR-08 asks for faithful, musical, pedagogical, and experimental profiles.

**Decision.** Profiles are immutable/versioned presets that expand into ordinary operators/parameters and retain a `presetLineage` reference. They do not select a hidden execution branch.

**Alternatives considered.** Runtime `mode = musical`; profile-specific codepaths.

**Consequences.** Applying a profile can be diffed, undone, migrated, explained, and edited.

**Risks.** Profile evolution requires versioning; users may diverge from a preset after editing.

**Confidence.** **High.**

**ADR-EVAL: Independent Sonification Evaluation Outcome Families**

**Context.** Auditory-display studies use materially different outcomes—recognition, estimation accuracy, learning, task time, preference—and these should not be conflated. Evaluation standardization has been an explicit issue in sonification research. citeturn5search2

**Decision.** AGL stores evaluation evidence under independent dimensions:

```text
discrimination
mappingComprehension
taskPerformance
musicalUtility
aestheticPreference
cognitiveLoad
accessibility
technicalReproducibility
```

A preset cannot acquire a `faithful` evidence status solely from preference or a `preferred` status solely from estimation accuracy.

**Alternatives considered.** Single usability score; single “validated” Boolean.

**Consequences.** More nuanced evidence metadata and better scientific copy.

**Risks.** Harder to summarize in simple marketing language; that is preferable to false certainty.

**Confidence.** **High.**

## Formal Contracts, Defaults, and UX Semantics

**Mathematical / Behavioral Contracts**

**Causality**

For input history \(x\) and operator \(F\), causal behavior is:

\[
x(s)=x'(s)\;\forall s\le t
\quad\Longrightarrow\quad
F[x](t)=F[x'](t).
\]

Therefore appending future source values must never alter already-defined outputs of a causal mapping. This property should be directly property-tested.

A frozen operation has an immutable declared window

\[
W=[t_0,t_1)
\]

and all window-dependent parameters—including bounds, quantiles, means, or filter state—must identify `W` or an artifact hash computed from it.

**Fixed min/max normalization**

For \(H>L\):

\[
u=\frac{x-L}{H-L}.
\]

Out-of-range behavior is separate from normalization:

```ts
type OutOfRangePolicy =
  | "preserve"
  | "clipAndFlag"
  | "error";
```

For bounded auditory targets, DR-08 recommends `clipAndFlag`; the original pre-clipped value remains available in provenance. `H = L` is a configuration/data-degeneracy error unless the user explicitly chooses a constant-output fallback.

**Frozen min/max**

\[
L=\min_{t\in W}x(t),\qquad H=\max_{t\in W}x(t).
\]

Its semantics depend on the complete `W`; changing or extending `W` is allowed to change earlier normalized values. It must therefore not be represented as causal live normalization.

**Frozen percentile normalization**

For selected tail probability \(p\):

\[
L=Q_p(x_W),\qquad H=Q_{1-p}(x_W)
\]

followed by fixed normalization. The quantile definition/interpolation algorithm is part of the operator version. DR-08 provides **no evidence-based universal value of \(p\)**.

**Z-score**

\[
z=\frac{x-\mu}{\sigma},\qquad \sigma>0.
\]

Frozen \(\mu,\sigma\) imply frozen-window semantics. A running mean/variance implementation can be causal, but it is a **different operator whose meaning changes with observation history** and requires an explicit warm-up policy.

**Robust center/scale**

A frozen MAD option is:

\[
m=\operatorname{median}(x_W)
\]

\[
MAD=\operatorname{median}(|x_i-m|)
\]

\[
s=1.4826\,MAD
\]

\[
r=\frac{x-m}{s}.
\]

The \(1.4826\) factor provides the conventional normal-consistency scaling; MAD has strong resistance to outliers, but an operator must handle `MAD == 0` explicitly rather than divide by zero. citeturn12search0

**Log transform**

For ordinary logarithmic mapping:

\[
y=\log_b(x),\quad x>0,\quad b>0,\quad b\ne1.
\]

A domain containing zero/negative values is rejected unless the graph explicitly selects a different transform such as signed-log. The runtime must not silently add an epsilon, because doing so changes the mathematical mapping.

**Power transform**

\[
y=x^\gamma
\]

is permitted only where the real-valued domain is valid for the selected \(\gamma\), or where domain restrictions are made explicit.

**Sigmoid**

A canonical logistic operator may use:

\[
u(x)=\frac{1}{1+\exp[-k(x-x_0)]},
\qquad k\ne 0.
\]

`k` and `x0` are explicit. The UI must not imply that sigmoid output preserves metric differences.

**Circular normalization**

For period \(P>0\) and origin \(o\):

\[
u=\frac{\operatorname{mod}^{+}(x-o,P)}{P},
\quad u\in[0,1)
\]

where \(\operatorname{mod}^{+}\) is nonnegative modulo. This is the canonical operation for angles/phases and must not use ordinary linear min/max across a wrap boundary.

**Categorical lookup**

For nominal data:

\[
f:C\to T.
\]

No numeric ordering is inferred from enum ordinal/index. A category can map to instrument identity, earcon, articulation, or other target through an explicit lookup.

**Ordinal guard**

AGL may permit monotone transforms for ordinal values but should warn against interpreting numerical category spacing as meaningful interval size. The measurement-scale framework is useful as a representation constraint but is not a complete theory of all scientifically valid transformations. citeturn0search2turn0search9

**Exponential moving average**

For possibly irregular causal sample interval \(\Delta t_n\):

\[
\alpha_n=1-e^{-\Delta t_n/\tau},
\qquad \tau>0
\]

\[
y_n=y_{n-1}+\alpha_n(x_n-y_{n-1}).
\]

Initialization is mandatory metadata:

```ts
type InitialState =
  | { kind: "firstSample" }
  | { kind: "constant"; value: number }
  | { kind: "checkpoint"; ref: Id };
```

A centered moving average is **acausal**. A trailing moving average is causal. They may not share one ambiguous `movingAverage` semantic version.

**Interpolation**

For consecutive continuous-valued observations \((t_0,x_0),(t_1,x_1)\):

\[
x(t)=x_0+\frac{t-t_0}{t_1-t_0}(x_1-x_0),
\qquad t_0\le t\le t_1.
\]

Discrete/categorical values default to hold/step semantics only when sampling explicitly selects that behavior. AGL should not linearly interpolate category IDs, graph nodes, Boolean CA states, or note identities.

**Pitch target**

An equal-tempered semitone-coordinate representation can use:

\[
f(m)=440\cdot 2^{(m-69)/12}.
\]

Thus MIDI-style semitone coordinate \(69\rightarrow440\) Hz, \(81\rightarrow880\) Hz, and \(57\rightarrow220\) Hz. This is a target conversion formula, not evidence that equal temperament is the correct musical constraint for every lab.

**Gain conversion**

For an amplitude-level control expressed in dB:

\[
g=10^{dB/20}.
\]

Hence \(-6.020599913\) dB maps to amplitude gain \(0.5\). The target should be called `gainDb` or `amplitudeGain`, **not perceptual loudness**: equal-loudness research shows loudness depends on frequency and listening conditions. citeturn8search0

**Nearest quantization**

Given a finite ordered target set \(S\):

\[
Q(x)=\arg\min_{q\in S}d(x,q).
\]

Tie breaking is mandatory and deterministic. Recommended base contract:

```text
tieBreak = lower
```

unless the target domain specifies another canonical ordering. Quantization must retain `before`, `after`, and displacement in provenance.

Rhythmic quantization acts on exact rational musical times:

\[
Q_g(t)=\operatorname*{arg\,min}_{k\in\mathbb Z}|t-kg|
\]

with exact rational comparisons and the declared tie-break rule.

**Threshold**

```text
state = x >= T
```

for a memoryless threshold.

**Hysteresis**

For \(T_{off}<T_{on}\):

```text
if state == false and x >= T_on: state = true
if state == true  and x <= T_off: state = false
otherwise: preserve state
```

Equality behavior is deliberately specified to prevent cross-platform edge discrepancies.

**Probability gate**

\[
p\in[0,1],
\qquad emit \iff U(key)<p.
\]

`p=0` never emits; `p=1` always emits. Inputs outside \([0,1]\) are validation errors rather than silently clamped values. The key derives from stable source/operator identity and the existing AGL seed system. fileciteturn0file0

**Missing and non-finite state machine**

Recommended common representation:

```ts
type SampleValue<T> =
  | { kind: "value"; value: T }
  | { kind: "missing"; reason?: string }
  | { kind: "nonFinite"; value: "nan" | "positiveInfinity" | "negativeInfinity" };
```

Policies:

```ts
type MissingPolicy =
  | "gap"       // produce no value/event for this observation
  | "drop"      // omit from a batch/statistic, explicitly flagged
  | "holdLast"  // stateful, causal; requires previous valid value
  | "error";
```

`0` remains a normal numeric value and must never be conflated with `missing`.

**Source sampling contracts**

```ts
type SamplingModel =
  | { kind: "eventDriven" }
  | { kind: "fixedRate"; interval: TimeQuantity }
  | { kind: "pathIndex"; step: PositiveInteger }
  | { kind: "arcLength"; spacing: LengthQuantity }
  | { kind: "spatialSweep"; axisOrPath: GeometryRef; spacing: LengthQuantity }
  | { kind: "gestureDriven"; gestureRef: Id }
  | { kind: "adaptive"; criterion: CriterionSpec; tolerance: number };
```

An adaptive sampler is itself information-transforming: its criterion, tolerance, emitted sample positions, and causal/acausal status belong in provenance. Event-density diagnostics should be computed separately from the sampler so a warning does not silently delete data.

**Time-basis invariant**

A sample clock always states its basis:

```ts
type TimeBasis =
  | { kind: "musical"; unit: "beat"; position: Rational }
  | { kind: "physical"; unit: "second"; position: number }
  | { kind: "sourceIndex"; index: bigint }
  | { kind: "generation"; generation: bigint }
  | { kind: "path"; coordinate: number };
```

Tempo conversion is explicit. A source-indexed CA generation or graph traversal does not become “seconds” merely because audio playback later schedules it.

**State/seek invariant**

For any stateful causal operator, seeking to time \(t\) must use one of:

```text
reset-and-replay from deterministic origin
checkpoint ≤ t + deterministic replay
explicitly declared continuous state across seek
```

A seek must not inherit accidental worker/audio-thread state. Given the same declared state policy, seeking to \(t\) and continuous evaluation to \(t\) must converge to the same logical state.

**Constraint invariant**

Given identical raw target, constraint set, candidate universe/context, versions, and stable IDs:

```text
resolve(raw, constraints, context) = identical result
```

No constraint may consult wall-clock time, unordered hash-map iteration, or unseeded randomness.

For an idempotent static constraint set:

\[
C(C(x))=C(x)
\]

should hold. Operators for which this is intentionally false must explicitly declare temporal/state semantics.

**Profile invariant**

```text
resolveProfile(profileVersion) -> explicit OperatorGraphDelta
```

After expansion, execution does not read the profile's friendly name. The expanded configuration defines behavior.

**Auditory-dimension evidence matrix**

| Target dimension | Appropriate use | Evidence / limitations | AGL policy |
|---|---|---|---|
| Pitch/frequency | Strong for ordered relationships, relative contour, comparison, and many analytic mappings | Very common; polarity/task interpretation varies; musical training matters; simultaneous loudness changes can bias it. citeturn1search0turn7search13turn1search14turn13search4 | Good quantitative candidate, **not universal exact-value default**. Always offer exact semantic value in inspector. |
| Gain / sound level | Coarse order/emphasis; possibly secondary quantitative channel | Perceived loudness is nonlinear/frequency-dependent; pitch/loudness interact. citeturn8search0turn13search4 | Avoid precision-critical independent pairing with pitch unless evaluated. Never equate dBFS with hearing-safe SPL. |
| Duration | Ordered/quantitative temporal mapping, categorical short/long contrasts | Can produce accurate judgments in some tasks; perceived duration can be influenced by frequency and expertise. citeturn1search11turn8search13 | Valid alternative/redundant encoding; no universal just-noticeable step baked into product. |
| Onset rate/density/tempo | Counts, activity, rate, intensity of discrete process | Density and trend complexity can affect interpretation; excessive density creates practical/perceptual limits. citeturn7search6 | Explicit density operator/diagnostic. Numeric maximum awaits DR-03/lab evaluation. |
| Timbre / brightness | Category/stream identity; cautious ordinal brightness mapping | Timbre is multidimensional and affected by spectral resolution; cross-modal correspondence is less consistent in some contexts. citeturn7search14turn11search0 | Prefer categorical identity or evaluated one-dimensional descriptors; no universal numeric timbre axis. |
| Roughness | Salience/urgency/error-like concepts in some displays | Empirical associations exist for stress/error/danger-like concepts, but they do not establish a universal quantitative scale. citeturn4view2 | Experimental or task-specific target; do not default for generic scalar magnitude. |
| Articulation | Category, boundary, emphasis, grouping | Much stronger basis in musical shaping than general-purpose quantitative estimation evidence. | Treat primarily as categorical/compositional unless lab validation says otherwise. |
| Stereo/spatial azimuth | Spatial relation, sign, separate stream, some quantitative tasks | A 2026 study found exact/sign advantages over pitch in its task but a pitch advantage for comparisons; hardware/listener dependence remains. citeturn11search2 | Never sole encoding; provide mono/text/visual fallback. |
| Harmony/chord identity | Categorical/relational/topological relationships; compositional shaping | Musical relation does not establish quantitative perceptual metric fidelity. | Strong Tonnetz candidate subject to DR-04; do not advertise distance accuracy without validation. |
| Instrument identity | Categories, source streams, earcon families | Learned symbolic sound families are a standard auditory-interface concept. citeturn6search0 | Good categorical target; legend/training required where identity is arbitrary. |

**Recommended Defaults**

The most important result here is that DR-08 supports **many semantic defaults but very few universal perceptual numeric defaults**.

| Parameter | Default | Valid/recommended range | Rationale | Evidence strength | User-facing? |
|---|---|---|---|---|---|
| Pipeline stage bypass | `false` for explicitly inserted operator | Boolean | Inserted nodes should execute unless intentionally bypassed. | Engineering | Yes |
| Hidden mapping stages | **Forbidden** | — | Reproducibility/provenance contract. | Strong inference | No |
| Live normalization when source has authoritative bounds | `fixedBounds` | Domain-specific | Stable meaning and prefix invariance. | Engineering, high | Yes |
| Live normalization with unknown bounds | **No universal default** | Must explicitly select running estimator, user bounds, or freeze analysis | Automatic range adaptation changes scale over time. | High | Yes |
| Offline/frozen unknown-domain normalization | **No universal default** | min/max, percentile, robust options | Outlier behavior and semantic goals differ. | High | Yes |
| Percentile tail `p` | **No justified default** | \(0 \le p < 0.5\) mathematically, practical range task-specific | False precision otherwise. | High | Yes |
| Robust scale | `1.4826 × MAD` when the user selects normal-consistent MAD | — | Standard robust normal-consistency convention. citeturn12search0 | Established | Inspectable |
| `MAD == 0` | diagnostic/error or explicit fallback | — | Avoid undefined division and hidden policy. | Engineering | Yes |
| Out-of-range to bounded target | `clipAndFlag` | — | Keeps renderer legal while retaining fidelity warning/raw value. | Engineering | Yes |
| Missing data | `gap` | `gap/drop/holdLast/error` | Avoid inventing a numeric observation. | Engineering | Yes |
| Non-finite numeric | diagnostic; no ordinary target output | explicit error/drop policies | `NaN`/∞ must not leak into target or persistence. | Engineering | Yes |
| Faithful-profile smoothing | `off` | τ/window lab-specific | Smoothing changes temporal structure. | Strong inference | Yes |
| EMA τ | **No universal default** | \(>0\) | Depends on source rate/task/music. | High | Yes |
| Transform in faithful profile | identity/linear where dimension permits | domain-specific | Least additional shaping. | Engineering | Yes |
| Circular mapping | modulo period from source metadata | \(P>0\) | Correct wrap topology. | Mathematical | Inspectable |
| Quantization in faithful profile | `off` | — | Quantization intentionally discards resolution. | Engineering | Yes |
| Quantizer tie break | `lower` | configurable by target/domain | Cross-platform determinism. | Engineering | Usually advanced |
| Threshold | `off` | threshold domain-specific | No reason to binarize by default. | Engineering | Yes |
| Hysteresis | `off` unless threshold chatter is an explicit problem | \(T_{off}<T_{on}\) | Introduces memory. | Engineering | Yes |
| Hysteresis gap | **No universal default** | data/task-specific | Depends on noise/dynamics. | High | Yes |
| Stochastic variation | `off` | — | Prevent random structure being attributed to source. | High | Yes |
| Probability when a gate is enabled | explicit `p`; `p=1` means no stochastic suppression | \(0\le p\le1\) | Clear boundary behavior. | Mathematical | Yes |
| Seed | project/operator stable seed infrastructure | AGL seed type | Existing determinism utility should be reused. fileciteturn0file0 | Project contract | Advanced |
| Discrete/category interpolation | hold/step only when selected | — | Linear category interpolation is meaningless. | Strong inference | Inspectable |
| Continuous interpolation | explicit `linear` or `hold`; **no universal hidden default** | — | Source semantics differ. | High | Yes |
| Musical constraints in faithful profile | off except non-bypassable representability/safety | — | Preserve raw mapped relation. | Engineering | Yes |
| Scale/chord quantization | **No global default** | lab/profile-specific | Aesthetic/theoretical decision. | High | Yes |
| Playable register | **No global numeric default** | voice/instrument-specific | Instrument and lab context differ. | High | Yes |
| Universal pitch range | **No research-supported default** | listener/instrument/task dependent | Avoid invented C3–C6-style convention masquerading as science. | High | Yes |
| Stereo pan range | renderer-defined normalized domain; center if unused | usually backend-specific | No evidence for universal quantitative precision. | Medium | Yes |
| Universal gain/LUFS target | **Not set by DR-08** | resolve with DR-03/AGL-049 | Internal level does not guarantee listener SPL. citeturn13search1 | High | Yes |
| Event-density ceiling | **Not set by DR-08** | scheduler/task/lab-specific | Perceptual and computational limits are context-dependent. | High | Yes |
| Default profile | **No program-wide default** | lab declares initial profile | P0 rhythm illusion and exploratory math labs have different objectives. | Engineering | Yes |
| Profile execution | expand to explicit graph | — | Prevent hidden mode semantics. | High | Mostly internal |
| Causal/frozen mode | **Must be explicit; no inference** | causal/frozen/acausal | Core reproducibility requirement. | Very high | Yes |

**UX / Visualization Implications**

**User goal: understand what is being mapped.** The inspector must show the source dimension name, actual source value and unit, target dimension, mapping polarity, formula/operator, source/domain bounds, and final value. A pitch trajectory labeled only “mapped to Y axis” is insufficient. Mapping interpretation is demonstrably affected by polarity/concept pairing, so the UI should never rely on assumed intuitive direction. citeturn7search13turn7search1

**Hard contract:** the visual graph and accessible ordered-list representation are two projections of the **same operator graph**. Reordering or editing one updates the same underlying project commands. This follows both AGL's typed visual graph/accessibility architecture and WCAG requirements around meaningful structure and keyboard operation. fileciteturn0file0turn0search10

A compact accessible list could read:

```text
Source: Lorenz x coordinate [dimensionless]
1. Sample every 1/32 beat — causal
2. Normalize using fixed bounds [-20, 20]
3. Smooth: bypassed
4. Linear transform to pitch [48, 84 semitones]
5. Quantize: C major — enabled
6. Register constraint: [48, 84]
Target: Note pitch
```

**User goal: distinguish live truth from retrospective/frozen analysis.** Every whole-window calculation receives an unmistakable `Frozen window` badge plus its actual interval. A normalized trace that was computed using the entire selected range must not visually masquerade as a value the system “knew” at playback time.

**Hard contract:** an operation's causality/window status is textual/semantic, not color alone.

**User goal: answer “Why this note?”** Selecting an event must cross-highlight:

```text
source entity/value
→ sample location
→ normalized value
→ smoothed value
→ transformed raw target
→ quantization/threshold decision
→ each constraint modification
→ random decision, if any
→ final note/control/audio target
```

This directly extends the existing mathematical inspector and linked-selection backlog rather than creating a separate science panel. fileciteturn0file0

A plain-language explanation template should be generated from the structured trace:

> At beat 12 3/8, source dimension `density` was 0.62. Fixed bounds 0–1 kept it at 0.62. Smoothing was bypassed. Linear pitch mapping produced 72.32 semitones. C-major quantization changed that to 72. Register constraints made no further change. The final note was C5. No randomness was used.

An advanced expansion exposes formulas, exact versions, hashes, bounds, state/window metadata, and constraint costs.

**User goal: know when musicality altered fidelity.** The UI needs a raw-vs-shaped diff rather than merely a “Musical” toggle:

```text
Raw pitch:     72.32
Quantized:     72.00   Δ = -0.32 semitone
Voice-leading: 67.00   Δ from raw = -5.32 semitones
Reason:        Soft preference for minimum voice motion
```

The user must be able to audition **Raw** and **Shaped** under the same source interval, transport position, and random seed. Musical usefulness and data fidelity are different evaluation outcomes, so a pleasing constrained rendering is not evidence that the raw information relationship was preserved. citeturn5search2

**User goal: distinguish mathematical structure from randomness.** Stochastic operators need a recognizable `Random variation` node/badge. Probability, seed identity, and outcome are visible in Inspect. The source visualization must not animate stochastic accents as though they were CA cells, Euclidean hits, Lorenz dynamics, or Penrose geometry.

**User goal: see clipping and unsupported samples.** Any clip, dropped/missing sample, invalid log-domain value, nonfinite source, degenerate normalization range, constraint relaxation, or event-density suppression receives a visible diagnostic attached to the relevant stage.

**User goal: understand sampling.** The visualization should optionally draw sample points/ticks over a continuous curve or traversal path, indicate interpolation segments, and show the declared sampling clock. Adaptive sampling should display nonuniform sample locations rather than rendering a uniformly sampled line that hides the adaptation.

**Explore / Compose / Inspect**

| Workspace intent | Required semantics |
|---|---|
| **Explore** | Favor direct source-to-sound visibility, sampling marks, mapping legends, stage bypass, causal/frozen comparison, and matched A/B. Avoid introducing musical shaping without explicit acknowledgement. |
| **Compose** | Make scale/chord/register/rhythm/polyphony/voice-leading constraints convenient, allow freeze/materialize and editing, but preserve the ability to inspect raw mapping and constraint deltas. |
| **Inspect** | Expose exact values, units, formulas, versions, state/window, seed/random draw, constraint decisions, source lineage, and reproducibility hashes. |

These are **views/workflows, not different semantic runtimes**.

**Accessibility matrix**

| Information primarily encoded by | Required equivalent/supplementary representation | Important caveat |
|---|---|---|
| Pitch | Exact numeric/text value, labeled trend/plot or table, optional duration/spatial/redundant sound mapping | Musical experience and task influence pitch decoding. citeturn1search14turn7search13 |
| Loudness/gain | Numeric/text value, visual magnitude, optional temporal/redundant encoding | Frequency affects perceived loudness and listener hardware controls SPL. citeturn8search0turn13search1 |
| Timbre/brightness | Semantic label and numeric source value; visual/text category; alternate event identity | Spectral-resolution differences can reduce discriminability. citeturn7search14 |
| Stereo/spatial position | Numeric/text position, visual coordinate, mono-compatible alternative, optional pitch/time redundant cue | Spatial performance is task/equipment dependent. citeturn11search2 |
| Duration/rhythm | Text/table timestamps/durations, visual sequence; optional non-temporal alternative | Duration itself can interact with frequency/context. citeturn8search13 |
| Animated motion | Static state/trajectory, textual change description, reduced-motion presentation | WCAG includes motion/animation considerations. citeturn0search10 |
| Color/geometry | Text labels, structure relationships, non-color visual marks, auditory/tactile-capable semantic projection | AGL already has accessible mathematical-description work. fileciteturn0file0 |

No single “accessible sonification channel” should be treated as universally equivalent. Recent multimodal accessibility work instead supports exposing shared underlying data through complementary modalities, and the research literature cautions that accessibility studies can confound speech and sonification effects. citeturn11academia46turn11search9

## Verification and Evaluation Pack

**Test Oracle and Fixture Pack**

The shared fixture corpus should be **independent of individual lab mathematics** wherever possible. A Lorenz solver bug must not make the normalization fixture fail; DR-07 should separately provide the accepted Lorenz trajectory fixture. Likewise DR-02 owns exact Euclidean-convention fixtures, while DR-08 owns how already-produced discrete events are sampled/mapped.

### Unit invariants

| Test | Input | Expected | Tolerance | Why / basis |
|---|---|---|---|---|
| Fixed normalization | `x=[0,5,10], L=0,H=10` | `[0,0.5,1]` | Exact where binary representable | Canonical formula |
| Degenerate normalization | `L=10,H=10` | Structured validation error | Exact | Prevent division-by-zero/hidden constant |
| Out-of-range clip | `x=-5,L=0,H=10` | normalized `-0.5`; bounded-target policy returns `0` **plus `clipped` flag** | Exact | Preserve raw information while enforcing bounded target |
| Circular normalize | `o=0,P=360`, `[-90,0,90,360,450]` | `[0.75,0,0.25,0,0.25]` | ≤1e-15 | Correct wrap behavior |
| Circular periodicity | `x` vs `x+kP` | equal | Numerical tolerance | Topological invariant |
| MAD | `[1,2,3,4,100]` | median `3`, raw MAD `1`, scaled MAD `1.4826` | ≤1e-12 | Known robust fixture; normal-consistency scaling. citeturn12search0 |
| Robust z-values | Same fixture | approximately `[-1.348981519,-0.674490759,0,0.674490759,65.425603669]` | ≤1e-9 | Detects incorrect centering/scaling |
| EMA half-response | `Δt=τ ln2`, previous `y=0`, `x=1` | `α=0.5`, next `y=0.5` | ≤1e-12 | Confirms time-constant implementation |
| EMA next sample | same `Δt`, `x=1`, previous `.5` | `.75` | ≤1e-12 | State recurrence |
| Logistic midpoint | `x=x0` | `0.5` | Exact/≤1e-15 | Canonical transform |
| Equal-tempered frequency | `m=[57,69,81]` | `[220,440,880] Hz` | ≤1e-12 relative | Target conversion |
| dB gain | `-6.020599913279624 dB` | `0.5` | ≤1e-12 | Gain conversion |
| Quantize tie | `S=[0,2,4], x=1` | `0` under `lower` | Exact | Tie determinism |
| Quantize second tie | `S=[0,2,4],x=3` | `2` | Exact | Same |
| Quantizer identity | `x∈S` | `Q(x)=x` | Exact | Idempotence basis |
| Hysteresis | `Ton=.7,Toff=.3`, inputs `[.2,.8,.6,.2,.4,.8]` from false | `[F,T,T,F,F,T]` | Exact | State boundary |
| Probability zero | any key, `p=0` | never emit | Exact | Boundary |
| Probability one | any key, `p=1` | always emit | Exact | Boundary |
| Missing ≠ zero | `[0,missing]` | first produces value `0`; second follows missing policy | Exact | Semantic correctness |
| Nonfinite | `NaN,+∞,-∞` | no normal scalar target; diagnostic/policy invoked | Exact | Runtime/persistence safety |
| Bypass | any deterministic operator | output=input and trace says `bypassed=true` | Exact | Acceptance criterion |
| Rational grid | `t=5/12`, grid `1/4` | nearest is `1/2`; exact rational arithmetic | Exact | Protect musical-time model |
| Frozen window identity | window `[0,4)` | provenance contains same window/hash in repeated execution | Exact | Reproducibility |

The robust statistics fixture is deliberately useful: adding `100` makes ordinary min/max allocate nearly the entire normalized range to the outlier, whereas median/MAD retains a scale based on central observations. This demonstrates **outlier resistance**, not a claim that robust mapping is perceptually or scientifically superior. citeturn12search0

### Property-based tests

The following should become AGL-133 families:

- For all finite \(x_1\le x_2\) and \(H>L\), fixed linear normalization is monotone: \(N(x_1)\le N(x_2)\).
- `denormalize(normalize(x)) ≈ x` for finite in-range values where no clipping occurs.
- \(C_P(x+kP)=C_P(x)\) for integer \(k\) in circular normalization.
- `Q(Q(x)) == Q(x)` for a static quantizer.
- A bypassed operator is identity for values **and** still represented in the trace.
- Hysteresis cannot change state while \(T_{off}<x<T_{on}\).
- Same graph/input/seed/stable IDs produce identical random decisions.
- Inserting an unrelated event with a different stable ID does not change keyed stochastic outcomes for preexisting events.
- Fixed known-bound normalization of one sample does not depend on any other sample.
- No future suffix changes past outputs of a `causal` plan.
- Every target event's trace terminates at that exact stable event/parameter.
- Serialization → load → compile preserves resolved operator type/version/params and logical output.
- Every persisted nonfinite condition uses its tagged representation; the project JSON contains no nonstandard JSON `NaN`/`Infinity`.
- Constraint resolution is deterministic under permutation of container/hash insertion order.
- Static constraint resolution is idempotent where the constraint declaration says it is idempotent.
- Dimensional type checking rejects invalid categorical arithmetic and incompatible units unless an explicit conversion operator intervenes.

### Metamorphic tests

**Future-extension test.**

```text
A = evaluateCausal(source[0:N])
B = evaluateCausal(source[0:N+K])
assert B[0:N] == A
```

This should be a **hard oracle** for live causal mappings.

The inverse is deliberately *not* required for frozen min/max/quantile mapping: extending a frozen window may change normalized historical outputs. The system passes only if that difference is accompanied by frozen semantics, not if it accidentally happens to remain equal.

**Unit-conversion equivalence.** Converting both source values and fixed bounds through an exact unit conversion must yield the same normalized `u`.

**Seed isolation.** Changing the variation seed may change stochastic-stage outcomes but must not alter upstream source, sample, normalization, smoothing, or deterministic transformed values.

**Profile expansion.** Executing a named profile and executing its serialized expanded graph must produce identical logical traces.

**Raw-vs-shaped.** Bypassing all musical shaping stages must reproduce the recorded pre-constraint raw mapping, while runtime representability/safety remains active.

**Seek equivalence.**

```text
continuousState(t) == seekUsingCheckpointAndReplay(t)
```

for the same state policy.

**Sample refinement.** For a constant source, refining a fixed-rate sampler produces exactly the same interpolated constant target. For a mathematically linear source under linear interpolation, common sample times must agree within numeric tolerance.

**Golden fixtures**

The DR-08 corpus should contain at minimum:

| Fixture | Contents | Properties exercised |
|---|---|---|
| `linear-ramp-v1` | Exact source `0,1,…,10` with known domain `[0,10]` | fixed bounds, affine transform, monotonicity |
| `single-outlier-v1` | `[0,1,2,3,1000]` | min/max sensitivity vs robust operators |
| `mad-outlier-v1` | `[1,2,3,4,100]` | exact median/MAD fixture |
| `circular-degrees-v1` | `[-90,0,90,360,450]°, period=360°` | angle wrapping |
| `missing-nonfinite-v1` | `[0, missing, NaN, 1, +∞, 2]` | missing/nonfinite policy |
| `step-hysteresis-v1` | boundary-crossing sequence | threshold/state behavior |
| `continuous-linear-v1` | analytic \(x(t)=2t+1\) | fixed-rate sampling/interpolation |
| `category-v1` | stable categories `{A,B,C}` in permuted dictionary order | nominal lookup, no enum-index semantics |
| `simple-path-v1` | four-node path with stable IDs and unequal geometric edge lengths | path-index vs arc-length sampling |
| `unit-circle-v1` | angles/coordinates at wrap boundary | circular/spatial dimensions |
| `constraint-collision-v1` | deliberately incompatible register/chord candidates | relaxation/error provenance |
| `random-key-v1` | stable IDs with expected draws from **AGL-005's accepted PRF** | reproducible keyed variation |
| `synthetic-density-v1` | `[0,.25,.5,.75,1]` by generation index | discrete generation→control mapping without coupling to a CA rule |
| `frozen-window-v1` | same values under two differently sized windows | frozen semantics/window hash |
| `causal-prefix-v1` | prefix plus extreme future suffix | prefix invariance |
| `raw-shaped-v1` | known continuous pitches crossing scale bins | quantization/constraint delta trace |

The PRNG golden vector cannot be responsibly fabricated by DR-08: it must bind to AGL-005's existing implementation. fileciteturn0file0

Lab research then layers its own source fixture on top:

```text
DR-01 → accepted Risset-layer source/state fixture
DR-02 → exact Euclidean convention fixture
DR-04 → Tonnetz path/voicing fixture
DR-05 → recursion/ancestry fixture
DR-06 → CA rule/generation fixture
DR-07 → numerical trajectory fixture
DR-09 → exact Penrose geometry/path fixture
```

The research register establishes those runs as consumers/dependents of DR-08. fileciteturn0file3

### Cross-platform conformance tests

**Exact equality required**

- stable IDs;
- integer/category/Boolean results;
- operator versions;
- rational musical times;
- threshold/hysteresis state;
- quantized target identities;
- constraint winner;
- stochastic outcome from accepted keyed PRF;
- graph hashes and project canonical semantic representation.

**Numerical tolerance allowed**

For ordinary IEEE-754 binary64 scalar transforms where separate language implementations are unavoidable:

```text
abs(a - b) <= 1e-12 * max(1, abs(a), abs(b))
```

is a reasonable **initial engineering oracle**, not a psychoacoustic threshold. For `exp`, `log`, and `pow`, conformance should additionally be tested around boundary values.

However, an important problem remains: a \(10^{-12}\)-small discrepancy can still select a different quantization bin or cross a threshold. Therefore **discrete decisions must not be specified merely as “floats within tolerance.”** AGL should either:

1. execute decision-critical mapping in one shared core, potentially WASM; or
2. define canonical comparison/rounding semantics before a discrete branch.

That choice requires reconciliation with the Swift/native/shared-core architecture.

**Audio waveform equality is outside DR-08.** The render-plan/event layer should be exact/conformant; DR-03 should specify allowable backend scheduler/DSP deviations. fileciteturn0file3

### Performance tests

DR-08 does **not** support invented universal numeric throughput or event-density thresholds. It does support complexity/boundedness requirements:

- fixed linear normalization: \(O(1)\) state and \(O(n)\) over \(n\) samples;
- Welford-style running mean/variance: \(O(1)\) retained statistical state;
- EMA: \(O(1)\) retained state;
- trailing fixed-sample window: \(O(W)\) retained data or equivalent bounded structure;
- frozen full-window quantile/MAD: bounded by declared worker/evaluation budget;
- provenance collection must obey configurable retention budgets;
- cancellation must function through mapping computations;
- user-selected event provenance should be replayable without rendering the entire project audio.

Concrete latency, scheduler load, control rate, automation density, and worker thresholds should be supplied by AGL-025 and DR-03, not fabricated by DR-08. AGL-025 already owns events, recursion, iterations, time, geometry, and memory budgeting; AGL-043/134 are explicitly DR-03-gated. fileciteturn0file0turn0file3

### Perceptual and user-study library

AGL should not have a monolithic “sonification usability test.”

| Module | Primary dependent measure | Example task | What it is allowed to conclude |
|---|---|---|---|
| Discrimination | accuracy, \(d'\), RT | Which of two source states is larger/different? | Perceptual discriminability for tested mapping/task |
| Recognition | confusion matrix, accuracy | Identify state/category without visual aid | Decodability |
| Quantitative estimation | absolute/relative error | Estimate source value from sound | Mapping precision |
| Trend/structure | accuracy, RT | Rising/falling, anomaly, recurrence, cluster | Task-specific structural communication |
| Mapping comprehension | reconstruction accuracy/explanation score | Predict output or select correct mapping after instruction | Learnability/mental model |
| Learning | slope over trials, retention | Repeat estimation after feedback | Training effects; practice is known to improve auditory graph estimation. citeturn7search0 |
| Musical utility | editing time, edits retained, task completion, composer ratings | Turn generated passage into usable material | Compositional usefulness, **not fidelity** |
| Preference | pairwise choice/rating | Which sonification is preferred? | Preference only |
| Cognitive load | NASA-TLX/subscales plus performance | Complete analytic/composition task | Subjective workload, not accuracy by itself. citeturn5search12 |
| Accessibility | same task outcomes with intended user populations | Perform task using available modality combinations | Accessibility of tested workflow/population |
| Reproducibility | automated hashes/conformance | Re-run graph on backend/platform | Technical stability, no user study |

Where feasible, use **within-subject counterbalanced designs** for mapping comparisons to reduce between-person variance. Training and presentation order must be separated from mapping effects because practice changes auditory-display performance. citeturn7search0

For accessibility studies, recruit people who actually use the relevant accessibility modality rather than treating blindfolded sighted participants or muted normal-hearing participants as substitutes. Recent BLV sonification studies demonstrate that results can vary across modality and task, reinforcing the need for target-user evaluation. citeturn1search11turn11search2

Power analysis should be tied to the smallest effect worth acting on. As **illustrative planning numbers**, a two-sided paired comparison at \(\alpha=.05\) and 80% power requires approximately:

```text
standardized paired effect dz = 0.50 → N ≈ 34
dz = 0.40 → N ≈ 52
dz = 0.30 → N ≈ 90
```

These are calculated planning examples, **not mandated sample sizes**. AGL should specify the primary endpoint and smallest effect of interest first, consistent with modern sample-size justification guidance and power-analysis methodology. citeturn9search2turn9search0

Small \(N\approx12–20\) pilots are reasonable as an **engineering recommendation for feasibility, instrumentation, variance estimation, and protocol debugging**, but should not be presented as confirmatory validation merely because a p-value crosses a threshold.

Most importantly:

\[
\text{Preference} \not\Rightarrow \text{Information fidelity}
\]

\[
\text{Information fidelity} \not\Rightarrow \text{Musical usefulness}
\]

\[
\text{First-use accuracy} \not\Rightarrow \text{Learnability}
\]

\[
\text{Sighted/hearing-normal performance} \not\Rightarrow \text{Accessibility}.
\]

That separation is consistent with the heterogeneous evaluation goals in auditory-display research and the explicit need for more systematic sonification evaluation. citeturn5search2turn7search0

## Delivery, Dependencies, and Open-Risk Register

**Implementation Recommendations**

| Timing | Item | Impact | Complexity | Primary dependency |
|---|---|---:|---:|---|
| **Before MVP architecture freezes** | Extend core port/value schema with `DimensionSpec`, topology, unit, missing semantics, and clock basis. | Critical | L | AGL-004/010/020 |
| **Before MVP architecture freezes** | Adopt causal/frozen/acausal operator semantics and compiler validation. | Critical | M | AGL-020/022/023 |
| **Before MVP architecture freezes** | Define mapping operator serialization/versioning contract. | Critical | M | AGL-010/011/020 |
| **Before MVP architecture freezes** | Define structured `MappingTrace` and stable event trace key. | Critical | L | AGL-003/020/035 |
| **Before MVP architecture freezes** | Make state initialization/reset/checkpoint semantics part of stateful operator contract. | Critical | L | AGL-023/026/031 |
| **Before MVP architecture freezes** | Define constraint engine protocol and deterministic conflict ordering. | High | L | shared runtime; DR-04 supplies Tonnetz-specific costs |
| **Before MVP architecture freezes** | Bind stochastic decisions to existing seed/stable-ID utilities. | Critical | M | AGL-005 |
| **Before MVP architecture freezes** | Define logical realtime/offline conformance at render-plan boundary. | Critical | M | AGL-041 + DR-03 |
| **Before MVP architecture freezes** | Establish cross-lab DR-08 fixture/conformance corpus. | High | M | AGL-133 |
| **Before MVP architecture freezes** | Make profiles serialized graph deltas, not mode-specific code paths. | High | S–M | AGL-038/012 |
| **Before affected lab ships** | Integrate raw-vs-shaped and “Why this note?” inspector UX. | High | L | AGL-035/036 |
| **Before affected lab ships** | Add sampling/window/interpolation visualization. | High | M | AGL-050/051 |
| **Before affected lab ships** | Add accessible ordered pipeline representation and equivalent semantic values. | Critical | M–L | AGL-053/132 |
| **Before affected lab ships** | Add mapping/channel interaction warnings where presets rely on multiple precision-critical auditory dimensions. | Medium | M | evaluation/evidence registry |
| **Before affected lab ships** | Validate each lab's auditory defaults rather than inheriting a universal pitch/timbre recipe. | High | M–L | DR-01/02/04/05/06/07/09 |
| **Before affected lab ships** | Add export loss/provenance diagnostics for MIDI and MusicXML. | Medium | M | AGL-130/131 |
| **Can safely happen after MVP** | More sophisticated causal robust quantile/median estimators, unless DR-07 makes them essential. | Medium | L | DR-07 |
| **Can safely happen after MVP** | Rich spatial audio beyond simple position/mono fallback. | Low–Medium | L–XL | separate spatial-audio work |
| **Can safely happen after MVP** | Haptic mappings beyond semantic data hooks. | Medium | L | platform/accessibility research |
| **Can safely happen after MVP** | Large-scale provenance analytics/trace compression beyond bounded replay/checkpoints. | Medium | L | production telemetry/storage findings |
| **Research-only / experimental** | Learned/ML mappings. | Low for MVP | XL | new research run |
| **Research-only / experimental** | Automatic aesthetic optimization across mapping/constraint choices. | Low | XL | validated musical-utility objective |
| **Research-only / experimental** | User-adaptive channel selection from perceptual calibration. | Medium future | XL | accessibility/perceptual validation |

The “research-only” classification for ML is not a claim that ML sonification cannot work. It reflects the DR-08 charter's explicit MVP exclusion and the much harder requirements it would introduce for model provenance, training-data lineage, determinism, explainability, and migration.

**Backlog Deltas**

**MODIFY — AGL-004: Typed and versioned operator catalog**

Rationale: existing port families need semantic dimension metadata rather than just structural types. fileciteturn0file0

Acceptance criteria:

```text
- DimensionSpec supports value type, measurement scale, topology, unit, domain.
- Stateful/windowed operators declare TemporalSemantics.
- Operator type/version determines exact mathematical semantics.
- Target capabilities declare accepted units/ranges/value types.
```

Dependencies: AGL-002/003 existing core.  
Milestone: **M1**.

**MODIFY — AGL-010: Full project schema and JSON Schema**

Rationale: mapping semantics become compatibility-critical persisted state.

Acceptance criteria:

```text
- Mapping graph/operator versions/params serialize.
- Source dimensions and units serialize.
- causal/frozen/acausal semantics serialize.
- frozen window/statistics artifacts serialize by immutable ref/hash.
- seed refs and preset lineage serialize.
- nonfinite values never appear as invalid JSON numbers.
- path-specific validation errors identify invalid mapping semantics.
```

Dependencies: revised AGL-004/020 contract.  
Milestone: **M1**.

**MODIFY — AGL-011: Schema migration framework**

Rationale: mapping operator semantics will evolve.

Acceptance criteria:

```text
- No migration silently changes operator mathematical meaning.
- Semantic changes create a new operator version or explicit migration.
- Golden old-project fixtures preserve resolved logical output.
```

Dependencies: AGL-010.  
Milestone: **M1**.

**MODIFY — AGL-012: Project command bus**

Acceptance criteria:

```text
- profile application is one atomic command/transaction;
- bypass/unbypass is undoable;
- seed changes are undoable;
- freeze-to-clip is atomic;
- runtime state and trace caches are invalidated/derived, not stored as
  independently editable project state.
```

Milestone: **M1**.

**MODIFY — AGL-020: Executable operator interface**

The existing item already mentions a pure execution contract, provenance formatter, and budgets; DR-08 should make those semantics concrete. fileciteturn0file0

Acceptance criteria:

```text
Operator contract includes:
- deterministic/stateful declaration
- temporal semantics
- state init/reset/checkpoint
- typed DimensionSpec I/O
- bypass behavior
- structured diagnostics
- structured StageTrace formatter
- complexity/budget declaration where applicable
```

Milestone: **M1**.

**MODIFY — AGL-021: Port type checker**

Acceptance criteria:

```text
- incompatible unit/value/topology mappings rejected;
- categorical arithmetic rejected unless explicit operator supports it;
- circular data cannot pass through an implicitly linear normalize node;
- target-domain mismatches rejected before evaluation.
```

Milestone: **M1**.

**MODIFY — AGL-022: Graph compiler**

Acceptance criteria:

```text
- causal graph rejects future-dependent operator without frozen artifact;
- undeclared state dependencies fail compile;
- operator version absence fails safely;
- compiled plan carries temporal semantics and trace IDs;
- profile name does not alter execution after expansion.
```

Milestone: **M1**.

**MODIFY — AGL-023: Worker evaluator**

Acceptance criteria:

```text
- deterministic reset/replay and checkpoint semantics;
- causal-prefix invariant passes;
- cancellation works through frozen statistic calculations;
- state never leaks between independent evaluation generations.
```

Milestone: **M1**.

**MODIFY — AGL-024: Deterministic evaluation cache**

Acceptance criteria:

```text
cache key includes semantic graph hash + source/input hash + operator versions
+ frozen-window/stat artifact + seed/keying semantics + relevant initial state.
```

Changing a friendly preset label without changing the expanded graph must **not** unnecessarily change semantic output identity; changing an effective profile parameter must. Milestone: **M1**.

**ADD — Cross-lab mapping operator pack**

Title: `Sampling, normalization, smoothing, transform, quantization, threshold/hysteresis, and constraint operator pack`

Rationale: these should not be privately implemented in Chaos/CA/Penrose labs.

Acceptance criteria:

```text
- fixed/user/frozen bounds;
- min/max, z-score, MAD robust operator;
- linear/log/power/sigmoid/circular/category operators;
- EMA/trailing/centered smoothing with correct causality;
- fixed/event/path sampling;
- nearest quantization;
- threshold/hysteresis;
- seeded probability gate;
- deterministic constraint protocol;
- all support bypass + provenance + fixtures.
```

Dependencies: AGL-004/020–023.  
Milestone: **M1**, before M2 lab hardening.

**ADD — Mapping provenance trace/replay service**

Rationale: AGL-035 cannot reliably answer “why” from final audio alone.

Acceptance criteria:

```text
- selected final event resolves to source and every mapping stage;
- records raw/final targets and constraint changes;
- records randomness key/outcome;
- supports deterministic on-demand replay from preserved versions/state;
- trace survives freeze-to-clip through lineage summary.
```

Dependencies: AGL-003/020/023/027.  
Milestone: **M1**.

**MODIFY — AGL-027: Graph freeze-to-clip**

Acceptance criteria:

```text
- frozen events do not regenerate when graph changes;
- clip records source graph hash, generation interval/window, seed,
  operator versions, and lineage;
- source reference remains navigable;
- explicit "regenerate" is a new command.
```

Milestone: **M2/M3 as scheduled dependency permits**.

**MODIFY — AGL-035: Mathematical inspector**

Acceptance criteria:

```text
- exact formula/value/unit at every stage;
- live causal vs frozen-window label;
- sampling model/window;
- bypass controls;
- raw vs shaped diff;
- "Why this note?" trace;
- random outcome/seed visibility;
- constraint conflicts/relaxations.
```

DR-08 is explicitly registered as unblocking AGL-035. fileciteturn0file3  
Milestone: **M1/M2**.

**MODIFY — AGL-038: Preset browser**

Acceptance criteria:

```text
- profile purpose: faithful/musical/pedagogical/experimental;
- evidence status broken out by fidelity/task/preference/accessibility;
- exact version and lineage;
- applying preset expands to inspectable graph.
```

Milestone: **M2+**.

**MODIFY — AGL-041: Audio render plan**

Acceptance criteria:

```text
- plan contains final logical events/automation plus trace IDs;
- audio backend performs no hidden data normalization or musical quantization;
- realtime/offline plan conformance fixture passes;
- waveform-level tolerance delegated to DR-03.
```

Milestone: **M2**.

**MODIFY — AGL-050: Visualization projection contract**

Acceptance criteria:

```text
- projectable sample points/windows/interpolation;
- raw and final target representations;
- stage and provenance references;
- semantic descriptions independent of visuals.
```

DR-08 explicitly unblocks this backlog item. fileciteturn0file3  
Milestone: **M1/M2**.

**MODIFY — AGL-053: Accessible mathematical descriptions**

Acceptance criteria:

```text
- mapping graph has keyboard-operable ordered-list representation;
- source value/unit and final target available as semantic text;
- pitch/gain/pan/timbre/motion information not available only through that
  sensory attribute;
- constraint and frozen-window state represented semantically.
```

Dependencies: AGL-050 + mapping provenance.  
Milestone: **M1/M2**.

**SPLIT / REHOME — AGL-112: Control-signal pipeline**

Current AGL-112 sits under the Chaos lab and says sample/normalize/smooth/quantize/constrain stages are visible, although those semantics are cross-cutting. fileciteturn0file0

Recommended split:

```text
A. Shared control-signal and mapping pipeline core — E2/runtime, M1
B. Chaos-attractor mapping profile and UI integration — E11, M4
```

The shared core should not wait until M4.

**MODIFY — AGL-074: Accent and probability layer**

Acceptance criteria:

```text
- Euclidean structure computed first and remains deterministic;
- variation is separate explicit keyed-random operator;
- same seed/IDs reproduce outcomes;
- insertion of unrelated ring/event does not perturb existing outcomes where
  stable IDs are preserved;
- inspector distinguishes source hit from probabilistic suppression/accent.
```

Milestone: **M2**. fileciteturn0file0

**MODIFY — AGL-101 / AGL-111 / AGL-123**

Rationale: CA, Chaos, and Penrose currently depend directly on DR-08 for sonification/mapping. They should depend on the **shared mapping-core implementation artifact** plus their lab research, never private copies. fileciteturn0file0turn0file3

Acceptance criterion: lab profile contains no private normalization/smoothing/random/constraint implementation where a shared operator exists.

Milestones: **M4/M5**.

**MODIFY — AGL-130 / AGL-131**

Acceptance criteria:

```text
- export starts from final logical event model;
- exporter does not introduce hidden sonification constraints;
- exporter-specific quantization/notation loss receives independent warning;
- source/provenance IDs preserved where format/metadata strategy permits.
```

Milestone: **M3**.

**MODIFY — AGL-132: Accessibility baseline**

Add auditory-display-specific acceptance:

```text
- no information-bearing pitch/gain/pan/timbre/motion state lacks a semantic
  non-equipment-dependent representation;
- mono playback does not erase a critical distinction without warning/alternative;
- reduced-motion mode preserves mathematical state.
```

Milestone: **M1–M6 gate**. WCAG supports sensory-independent semantics and keyboard/motion accommodation. citeturn0search10

**MODIFY — AGL-133: Property and invariant test suite**

Add all causal-prefix, circular periodicity, keyed-randomness, quantizer idempotence, profile-expansion, constraint determinism, frozen-window, and cross-platform mapping fixtures from this packet.

Milestone: **M1**.

**ADD — DR-08 evaluation harness**

Acceptance criteria:

```text
- reusable discrimination/estimation/trend/comprehension modules;
- preference collected separately;
- NASA-TLX-compatible workload module;
- accessibility modality recording;
- randomized/counterbalanced condition assignment;
- export of trial definition, seed, stimulus hash, mapping graph hash;
- power/sample-size rationale field;
- reproducible analysis fixture.
```

Dependencies: mapping-core + audio/render plan.  
Milestone: initial **M2**, representative-user gate **M6**. SonEX and workload/sample-size literature support separating and formalizing these outcomes. citeturn5search2turn5search12turn9search2

**ADD — Cross-lab DR-08 golden corpus**

Acceptance criteria: corpus listed above executes in browser/shared core and every future native implementation; fixture schema/version/hash checked in CI.

Dependencies: AGL-133.  
Milestone: **M1**.

**BLOCK — Lab-level “scientifically optimal” mapping defaults**

Block any backlog acceptance language asserting optimal/intuitive/accurate auditory mappings until the responsible lab research and, where necessary, AGL user evaluation supplies task-specific evidence. The literature does not support a universal channel ranking. citeturn1search0turn11search2

**UNBLOCK — AGL-035 / AGL-050 / AGL-053**

Once ADR-MAP-PIPE, ADR-DIM, ADR-CAUSAL, and ADR-PROV plus the core schema are accepted, these DR-08-gated UX/projection items have sufficient shared semantics to proceed. The research register presently marks DR-08 as their blocker. fileciteturn0file3

**Cross-Research Dependencies**

**DR-03 — Browser audio scheduling, latency, and rendering**

**This report concludes:** logical mappings and constraint decisions should be identical between realtime and offline execution for identical declared semantics.

**Must be reconciled with:** DR-03 scheduler lookahead, automation/control rate, WebAudio/AudioWorklet behavior, backend latency, offline render behavior, headroom, and waveform tolerance. fileciteturn0file3

**Why:** DR-08 can define the logical event/control contract but cannot determine how densely target automation can be scheduled or what audible/backend deviation is acceptable.

**Question the integration pass must answer:** What is the exact boundary between deterministic mapping output and scheduler/DSP approximation, and what conformance tolerance applies beyond that boundary?

**DR-01 — Risset psychoacoustics / Infinite Staircase**

**This report concludes:** `perceptualIllusion` is a purpose, not a license for hidden mapping logic; gain/pitch shaping still needs explicit operators.

**Must be reconciled with:** Risset-specific psychoacoustic gain envelopes, layer spacing, reset detectability, and optional Shepard coupling.

**Why:** the illusion deliberately optimizes perception rather than literal one-to-one data fidelity.

**Question:** Which transformations are mathematically defining the illusion, which are presentation constraints, and which can legitimately be bypassed in a “raw” comparison without ceasing to be the same phenomenon?

**DR-02 — Euclidean rhythm**

**This report concludes:** random accent/probability variation is downstream and keyed, never part of the Euclidean sequence itself.

**Must be reconciled with:** accepted Euclidean convention, rotation, ring identity, accent semantics, cyclic sampling.

**Why:** DR-02 defines the discrete mathematical source; DR-08 defines how optional variation affects it.

**Question:** What exact stable ID survives rotation/phase editing so stochastic accents remain reproducible in the intended semantic frame?

**DR-04 — Tonnetz/harmonic geometry**

**This report concludes:** harmony/voice leading belongs in explicit deterministic constraints with cost/provenance.

**Must be reconciled with:** Tonnetz model, chord equivalence, voicing/register rules, cost function, transformation vocabulary.

**Why:** DR-08 specifies the optimizer protocol but cannot define what harmonic distance or “best voice leading” means for the selected Tonnetz convention.

**Question:** Which constraints are hard mathematical validity constraints, which are user musical constraints, and what deterministic cost/tie-break order is accepted?

**DR-05 — fractal/recursive composition**

**This report concludes:** ancestry and sample/generation indexing are first-class source/provenance dimensions.

**Must be reconciled with:** exact recursive grammar semantics and growth/budget behavior.

**Why:** generation depth/path may drive mapping, but DR-05 owns what those values mean.

**Question:** Are depth/path values ordinal, metric, categorical lineage, or multiple dimensions, and when does budget truncation itself need visible provenance?

**DR-06 — cellular automata**

**This report concludes:** CA generation/cell state/density can enter the common pipeline without private sonification code.

**Must be reconciled with:** DR-06's selected state summaries/traversals and richer-mode scope.

**Why:** `cell state`, `row density`, neighborhood transition, spatial location, and temporal generation have different measurement/topology semantics.

**Question:** Which CA dimensions are source truth versus derived summary operators, and which auditory mappings have task-specific evidence?

**DR-07 — chaotic dynamics**

**This report concludes:** sampling, normalization, smoothing, causal/frozen windowing, and target mapping are separate explicit stages.

**Must be reconciled with:** numerical integrator, solver timestep, trajectory sampling, warm-up/transient handling, accepted source bounds, and chaos-specific smoothing.

**Why:** solver sampling and sonification sampling are not necessarily the same clock. A future-dependent normalization can also make a live attractor sonification scientifically misleading.

**Question:** Where is the numerical integration boundary, what source trajectory is considered canonical, and which live normalization/smoothing defaults are justified?

**DR-09 — Penrose**

**This report concludes:** traversal/path index, arc-length/spatial sweep, tile orientation, category, and geometry coordinate mappings are distinct source dimensions/sampling modes.

**Must be reconciled with:** exact tiling, adjacency, clipping, traversal semantics, and stable tile IDs.

**Why:** mapping cannot compensate for an ambiguous geometry/traversal definition.

**Question:** Which traversal properties survive patch clipping and what stable identities permit reproducible mapping/provenance?

**Native/Swift/shared-core architecture — unresolved external dependency**

**This report concludes:** discrete mapping outcomes must be platform-conformant even where floating intermediate calculations allow tolerance.

**Must be reconciled with:** whether Swift duplicates algorithms, calls a shared C/Rust/WASM core, or otherwise guarantees equivalent semantics.

**Why:** tiny floating differences near thresholds/quantization boundaries can change notes rather than merely change a number slightly.

**Question:** Does AGL choose one semantic mapping core across platforms, or define canonical numerical rounding/comparison semantics for every implementation?

**Command/undo architecture**

**This report concludes:** presets, mapping edits, random seed edits, and freeze operations are ordinary project commands; runtime state is derived.

**Must be reconciled with:** command transaction/revision semantics beyond the brief AGL-012 backlog definition.

**Why:** a multi-node profile application or freeze must not leave half-applied graph/provenance state.

**Question:** What project revision identifier anchors generated trace replay, and how are asynchronous evaluation results rejected when an undo changes the graph revision?

**MIDI/MusicXML**

**This report concludes:** exporters consume final events and report export loss separately.

**Must be reconciled with:** exact PPQ/tick rounding, tempo/meter representation, MusicXML subset, microtonal representation, and notation quantization decisions.

**Why:** exporter loss should not be confused with DR-08's musical constraint stage.

**Question:** Which representational changes occur before versus during export, and how are both exposed to the user?

**Contradictions, Weak Evidence, and Open Questions**

**Most common is not best.** Pitch is the most commonly reported mapping dimension in the systematic literature, but prevalence is a design-history statistic—not an effectiveness ranking. citeturn1search0

**“Pitch is intuitive” has conflicting task evidence.** One BLV-oriented study rated pitch highly for intuitiveness while temporal/count encodings had accuracy advantages for some tasks; a 2026 spatial-audio study found azimuth superior to pitch for sign/exact-value tasks yet pitch better for value comparison. Those results are not contradictory once task is treated as a variable, but they directly contradict a product-level claim that one channel is universally superior. citeturn1search11turn11search2

**Auditory dimensions are not perceptually orthogonal controls.** Pitch/loudness interaction is experimentally demonstrated, and frequency can influence perceived duration. An architecture that exposes independent sliders is mathematically convenient but does not imply independent perceptual decoding. citeturn13search4turn8search13

**Cross-modal polarity is contextual.** “Higher pitch = more” may feel natural for many quantities, but Walker's studies show correspondence and slope depend on the conceptual data dimension. AGL must store the chosen polarity instead of calling it natural. citeturn7search13turn7search1

**The Stevens scale taxonomy is useful but not sufficient.** Nominal/ordinal/interval/ratio metadata is a practical guardrail, but treating it as a complete mathematical ontology would overstate a historically debated framework. Circularity, spatial geometry, graph topology, probability, and compositional structure require separate metadata. citeturn0search2turn0search9

**Robust normalization solves only an outlier problem.** MAD/percentile methods do not determine the correct semantic range, and a robustly normalized value can still be misleading if users interpret it against an absolute domain. Sparse/discrete sources can also produce `MAD=0`. citeturn12search0

**Running normalization changes what the same value means over time.** It is causal but not stationary. A source value of `3.0` can map to different sound values depending on previous history. Whether that is acceptable is a product/scientific decision, not merely an implementation optimization.

**Frozen normalization is reproducible only relative to its window.** It is not globally stable: extending the window or adding an outlier can change historical output. The UI must therefore expose the window itself.

**No general smoothing time constant emerges from the literature.** Smoothing can reduce chatter/noise but also delay or erase mathematically meaningful transitions. DR-07 or lab-specific testing must determine chaos defaults.

**No universal event-density limit is scientifically defensible here.** High density can impair task performance and the scheduler has practical limits, but DR-08 does not yield a single events/second number applicable to percussion, pitch glissandi, CA cells, and trajectory controls. citeturn7search6

**Timbre is not one scalar dimension.** “Brightness” can be manipulated directionally, but timbre also encodes multidimensional spectral/temporal properties and listener hearing differences. Treating a synthesizer's arbitrary `timbre=0.7` as a perceptual ratio scale would be false precision. Spectral discrimination can also be reduced with hearing loss. citeturn7search14

**Spatial audio evidence is promising but narrow.** A recent task-specific result does not justify making pan/spatial position the generic high-precision channel, especially given headphones, speaker placement, mono playback, and hearing differences. citeturn11search2

**Musical constraints have no general fidelity guarantee.** Scale quantization or voice leading can make output more playable while materially moving values. Whether that trade is acceptable is purpose-dependent.

**Preference is methodologically orthogonal to fidelity.** A pleasing result can be hard to decode; an accurate auditory graph can be aesthetically unpleasant. The research cannot support collapsing these into a single “quality” metric. citeturn5search2

**Digital audio safety remains a hard boundary of what DR-08 can claim.** WHO exposure guidance applies to physical sound level over time. AGL does not know actual ear-level SPL merely from digital gain, so a “safe dB” default inside the synth would be scientifically invalid without calibrated device information. citeturn13search1turn13search3

**Cross-platform numeric branch behavior remains unresolved.** Generic float tolerances are inadequate around exact threshold/quantization boundaries. This is an architectural question, not something the psychoacoustic literature answers.

**Provenance retention strategy remains unresolved.** Full per-sample traces maximize explanation but can be enormous; deterministic replay reduces storage but requires preserving executable operator versions/state/checkpoints. The architecture must choose a retention policy before long-lived project compatibility is promised.

**Adaptive sampling can double-encode change.** If high-curvature portions receive more samples and sample onsets themselves are audible, curvature can affect both mapped value and event density. That may be desired, but must be declared rather than assumed to be a neutral optimization.

**“Faithful” itself needs bounded semantics.** It should mean approximately “minimum optional shaping relative to the declared mapping,” not “objectively faithful to the mathematics.” Choosing pitch rather than duration is already an authored representational choice.

**Research Follow-Ups**

| Question | Why evidence is insufficient | Decision blocked | Best method | Priority |
|---|---|---|---|---|
| What control rates, automation density, smoothing interactions, and backend tolerances preserve DR-08 logical semantics in browser realtime/offline rendering? | General sonification literature cannot set WebAudio implementation limits. | AGL-041/043/044 and Chaos continuous mapping | DR-03 benchmarks + conformance fixtures on supported browsers/devices | **Critical** |
| What mapping-channel defaults work for AGL's actual analysis/pedagogy tasks and target users, including BLV and hearing-diverse users? | Existing studies differ by tasks, mappings, listeners, and hardware. citeturn1search11turn11search2 | Evidence-backed default presets / educational claims | Within-subject task studies using DR-08 harness; stratify relevant accessibility groups | **High** |
| What deterministic voice-leading/constraint cost model should Tonnetz presets use? | DR-08 specifies resolution protocol but not harmonic semantics. | AGL-083 and Tonnetz musical profile | DR-04 theory synthesis + composer task pilot | **High** |
| Which source normalization/smoothing defaults preserve meaningful Lorenz structure while supporting usable control? | General smoothing/default statistics cannot distinguish solver artifacts from meaningful chaotic variation. | AGL-111/112/113 | DR-07 numeric experiment + mapping task pilot | **High** |
| Can one shared semantic core serve browser/WASM and Swift/native, or must duplicate implementations be standardized? | Float tolerances alone do not guarantee identical branching. | Native project compatibility and exact cross-platform reproducibility | Prototype representative operator pack in both architectures; differential/property testing | **High if native is Wave 1** |
| What provenance retention strategy gives acceptable storage/performance while guaranteeing selected-event explanation? | Research does not determine project size, replay cost, or version-retention burden. | Final project/provenance persistence contract | Implement full trace vs checkpoint/replay prototypes against cross-lab stress fixtures | **Medium, before persistence freeze** |
| Is a causal robust live estimator needed for MVP? | Frozen MAD is well specified; robust online quantiles/medians introduce additional semantics/complexity. | Only a “robust live” feature | First determine whether DR-07/CA presets require it; then compare candidate algorithms on deterministic fixtures | **Medium; defer unless required** |

No further research is warranted for whether randomness should be explicit, whether causality should be distinguishable from frozen whole-window processing, whether operator versions belong in provenance, or whether preference should be kept separate from fidelity. Those are already sufficiently supported as architecture decisions.

**Integration Checklist**

- [ ] Architecture specification: canonical sonification/control pipeline
- [ ] Architecture specification: causal/frozen/acausal execution semantics
- [ ] ADR: typed mapping pipeline
- [ ] ADR: source-dimension/unit/topology model
- [ ] ADR: causal and frozen-window policy
- [ ] ADR: deterministic randomness
- [ ] ADR: deterministic musical constraint model
- [ ] ADR: mapping provenance/explanation
- [ ] ADR: realtime/offline logical equivalence
- [ ] ADR: multimodal accessibility semantics
- [ ] ADR: preset/profile expansion
- [ ] ADR: evaluation evidence taxonomy
- [ ] Project JSON Schema and migrations
- [ ] Core port/control-signal types
- [ ] Executable operator interface
- [ ] Operator registry definitions
- [ ] Graph compiler validation rules
- [ ] Worker state/reset/checkpoint contract
- [ ] Deterministic cache-key specification
- [ ] Event/pattern lineage contract
- [ ] Freeze-to-clip generated/frozen semantics
- [ ] Render-plan contract
- [ ] Inspector / “Why this note?” UX specification
- [ ] Raw-vs-shaped comparison UX
- [ ] Sampling/window visualization specification
- [ ] Accessible ordered mapping representation
- [ ] Accessibility alternatives matrix/design-system rule
- [ ] MIDI/MusicXML export-loss provenance
- [ ] Property/metamorphic test suite
- [ ] Cross-platform conformance suite
- [ ] DR-08 golden fixture corpus
- [ ] Perceptual/evaluation research harness
- [ ] Research evidence registry with outcome-type tags
- [ ] Preset evidence/status schema
- [ ] Backlog and milestone dependency graph
- [ ] All seven lab specifications
- [ ] Swift/native conformance suite if native remains in Wave 1
- [ ] User-facing scientific/educational copy review

# Integration Payload

**DR-08 architectural thesis:** AGL must treat sonification as an explicit authored transformation system, not an audio-rendering convenience. Canonical path = `Source → Sample → Normalize → Smooth → Transform → Quantize/Threshold → Constrain → Target`; stages may contain multiple operators; all effective operators are typed/versioned/serializable/testable; bypass is explicit and traceable; musical stages can be bypassed but runtime representability/budget/master-safety cannot. Sonification means nonspeech audio conveying information/data relationships; broad literature shows heterogeneous mappings, so prevalence of pitch does not establish optimality. citeturn13search5turn1search0

**Technique/purpose separation:** serialize `technique ∈ {parameterMapping,audification,modelBased,earcon,auditoryIcon,hybrid}` independently from `primaryPurpose ∈ {analytic,pedagogical,compositional,perceptualIllusion}` + secondary purposes. Most AGL mappings = parameter mapping. “Musical data mapping” should be compositional-purpose parameter mapping/constraints, not a separate scientific paradigm. Audification = direct data-to-waveform/sample strategy; model-based = data configures dynamic acoustic model; earcons = learned abstract motifs; auditory icons = analogous everyday sounds. citeturn6academia46turn6search9turn6search0turn6search3

**Core type contract:** add `DimensionSpec{valueType,measurementScale,topology,unit,domain,missingPolicy}`. Recommended `measurementScale={nominal,ordinal,interval,ratio}` and separate `topology={linear,circular(period,origin),categorical,spatial,graph}`. Use Stevens scales as validation metadata, not complete ontology; measurement-scale theory is historically useful but contested/incomplete. citeturn0search2turn0search9 `ControlSignal` also carries explicit clock basis `{rational beat, seconds, sourceIndex, generation, path}`. Never reduce source dimensions to anonymous floats early.

**Temporal semantics ADR:** every context-dependent operator declares `causal | frozenWindow(windowRef,statisticsRef?) | acausal(windowRef)`. Formal causal invariant: if inputs \(x,x'\) agree for all \(s≤t\), outputs at \(t\) must agree. Future extension cannot alter causal prefix. Whole-window min/max, percentile, centered filters = frozen/acausal and illegal in causal live plan unless their result is pre-materialized as immutable artifact. Running estimators may be causal but have different semantics. AGL-113 already anticipates “live causal/frozen labeled.” fileciteturn0file0

**Sampling:** explicit models = event-driven, fixed-rate, path-index, arc-length, spatial sweep, gesture-driven, adaptive. Sampling positions/clock/interpolation/criterion belong in provenance. Adaptive sampling is not neutral if emitted onset density is audible; it may double-encode curvature/change. Event-density detection is diagnostic/control policy, not hidden deletion. Musical-time sampling/quantization uses AGL exact rationals through mapping; float seconds appear only at render/scheduling boundary. AGL-002 is already complete. fileciteturn0file0

**Normalization formulas:** fixed \(u=(x-L)/(H-L),H>L\); degenerate `H=L` = diagnostic/error unless explicit fallback. Bounded target default `outOfRange=clipAndFlag`, retaining unclipped trace. Frozen minmax uses \(L=min_W x,H=max_W x\) and window identity. Percentile uses \(L=Q_p,H=Q_{1-p}\), quantile algorithm/version explicit; **no universal p default**. Z-score \(z=(x-\mu)/σ,σ>0\); frozen stats imply frozen semantics; running statistics are separate causal operator/warm-up policy. Robust frozen mapping: median \(m\), `MAD=median(|x-m|)`, normal-consistent \(s=1.4826*MAD\), \(r=(x-m)/s\); `MAD=0` explicit failure/fallback. MAD has strong outlier robustness but robust normalization is not universally semantically superior. citeturn12search0 Log requires positive domain unless explicit signed-log; never silently epsilon-shift. Sigmoid \(1/(1+e^{-k(x-x0)})\). Circular \(u=mod^+(x-o,P)/P\). Category mapping is explicit lookup; never infer category order from enum integer.

**Smoothing/interpolation:** no hidden smoothing. Faithful preset default smoothing=off. EMA \(α_n=1-e^{-Δt_n/τ}\), \(y_n=y_{n-1}+α_n(x_n-y_{n-1})\), `τ>0`, initialization explicit `{firstSample,constant,checkpoint}`. Trailing average causal; centered average acausal. Continuous linear interpolation formula explicit; category/Boolean/entity identity not linearly interpolated. No universal `τ`, window size, or interpolation default beyond source-type validation. Density/reversal research shows preprocessing/complexity affects performance, so these stages are representational. citeturn7search6

**Transform/targets:** equal-tempered semitone target conversion \(f=440·2^{(m-69)/12}\); fixtures `m57=220Hz,m69=440Hz,m81=880Hz`. Gain conversion \(g=10^{dB/20}\); `-6.020599913…dB→0.5`. Call it gain/level, not perceptual loudness: equal-loudness contours are frequency dependent. citeturn8search0 No universal pitch/register/global gain default from DR-08.

**Quantization:** \(Q(x)=argmin_{q∈S}d(x,q)\), canonical tie rule recommended `lower`; retains before/after/delta. Rhythmic quantization performs exact rational comparison. Faithful preset default quantize=off. Threshold memoryless `x>=T`. Hysteresis requires `Toff<Ton`; transitions false→true at `x>=Ton`, true→false at `x<=Toff`, deadband preserves state. Fixture `Ton=.7,Toff=.3,[.2,.8,.6,.2,.4,.8]→[F,T,T,F,F,T]`.

**Randomness ADR:** randomness is explicit and downstream from deterministic source. Use existing AGL-005 seed/stable-ID mechanism; conceptually `u=PRF(seed,operatorStableId,sourceStableId,decisionKind,version)`, emit iff `u<p`, `0≤p≤1`; `p=0` never, `p=1` always. Prefer keyed/counter-like decisions so insertion of unrelated stable-ID events does not cascade PRNG sequence changes. Measurement noise, probabilistic gate, and stochastic grammar must have distinct operator/provenance kinds. AGL-074 already says seeded variation separate from Euclidean generation. fileciteturn0file0

**Constraint ADR:** constraints downstream from raw target; fields `{id,version,kind,hardness,priority,relaxable,costModel,params}`. Deterministic resolution: satisfy non-relaxable hard constraints; if infeasible use explicit `drop|error|relax`; relax only declared relaxable constraints weakest-first; rank feasible states lexicographically by ordered soft-priority costs, then aggregate cost, displacement from raw, canonical target ordering, stable ID. Every alteration/rejection/relaxation yields `ConstraintDecision{before,after,cost,reason}`. Static constraint sets should be idempotent. Musical cost semantics remain DR-04/lab dependent. AGL-083 already demands explicit deterministic voicing cost/tie-break/provenance. fileciteturn0file0

**Profiles ADR:** `faithful|musical|pedagogical|experimental` = versioned presets that resolve to ordinary graph deltas; not runtime modes. Execution does not read profile friendly name after expansion. Applying preset should be atomic undoable command and retain lineage. Faithful semantics = minimum optional shaping relative to declared mapping, **not objective mathematical truth**. No global initial profile; labs declare their own.

**Missing/nonfinite:** use tagged samples `value|missing|nonFinite`; policies `gap|drop|holdLast|error`; recommended missing default=`gap`; `holdLast` explicitly causal/stateful; zero remains zero; `NaN/±∞` never silently become zero and never persisted as illegal/nonportable JSON numbers.

**State/transport:** stateful operator declares initialization, reset, seek, loop, checkpoint semantics. Deterministic seek = reset/replay from origin or checkpoint≤t+replay unless explicitly continuous state. No accidental worker/audio state inheritance. Required property: `continuousState(t)==seekReplayState(t)` under same policy.

**Provenance ADR:** structured `MappingTrace` minimum = trace/project revision; source node/entity/dimension/index/time/value; every stage operator ID/type/version/params hash/bypass/temporal semantics/input/output/flags/window/state digest; random seed/key/p/outcome; constraint decisions; final target; graph/input/frozen-artifact hashes + engine semantic version. “Why this note?” must answer raw→sample→normalize→smooth→transform→quantize/threshold→constraints/randomness→final. Dense controls may use deterministic replay/checkpoints instead of storing every sample, but project/version retention must guarantee explanation. Frozen clips retain materialized events plus immutable generation lineage and do not silently regenerate when graph changes.

**Realtime/offline ADR:** same source artifact + graph + interval + seed + temporal semantics + initial/checkpoint state + semantic engine version ⇒ same logical event IDs/order, exact rational musical times, discrete choices, and conformant scalar target parameters. Do **not** demand cross-backend bit-identical audio. DR-03 owns scheduler/DSP/waveform tolerance. AGL-041 already defines one canonical plan for realtime/offline and M2 requires agreement. fileciteturn0file0turn0file2turn0file3 Audio backend may not privately normalize/quantize/remap data.

**Perceptual evidence:** pitch is common but not universal best. Pitch+loudness interact and can distort represented relations. Mapping polarity/scaling varies with conceptual data dimension; musical training affects pitch interpretation. Data density/trend reversals affect auditory graph performance. One BLV study found pitch intuitive but duration/tapping count more accurate on some elementary tasks; 2026 spatial study found azimuth better for sign/exact-value, comparable trend, pitch better for comparison. Therefore store evidence by task/outcome and reject universal auditory hierarchy. citeturn1search0turn13search4turn7search13turn1search14turn7search6turn1search11turn11search2 Timbre/brightness is multidimensional/hearing dependent; fine spectral distinctions should not be sole critical carrier. citeturn7search14

**Auditory defaults:** pitch useful for ordinal/relative quantitative contour but no universal register/range; gain useful for salience/coarse order but not calibrated loudness; duration valid quantitative/redundant channel but frequency can bias duration perception; tempo/onset density valid rate/activity channel but no universal max; timbre/instrument identity safest categorical unless a specific scalar descriptor is evaluated; roughness is task-specific; articulation mainly compositional/categorical; spatial position promising/task-dependent and must have mono/text/visual alternative; harmony relational/compositional but not generic quantitative metric. citeturn8search13turn11search2turn4view2

**Safety:** WHO safe-listening examples use physical exposure, e.g. 80 dB average up to ~40 h/week and 90 dB ~4 h/week; WHO-ITU adult mode uses 80 dB/40 h and children's mode 75 dB/40 h. Internal browser gain/dBFS does not reveal ear SPL, so DR-08 cannot define a “hearing-safe gain” value. Keep AGL-049 conservative master path/emergency stop; calibration/dose features require separate device-level capability. citeturn13search1turn13search3

**Accessibility ADR:** semantic value must exist independently of renderer; no critical info solely pitch/gain/timbre/pan/motion/color. Visual graph and accessible ordered list = same graph model. Pitch→text/numeric/trend alternative; gain→numeric/visual magnitude; timbre→semantic category; pan→numeric/text/visual + mono fallback; motion→static trajectory/state + reduced motion. WCAG 2.2 supports non-sensory-dependent information/relationships, keyboard use, and motion accommodation. Multimodal accessibility research supports complementary representations rather than one universal alternate channel. citeturn0search10turn11academia46

**UX hard contracts:** visible source value/unit; formula/bounds/polarity; causal/frozen/acausal badge + window; sampling ticks/model; clipping/missing/nonfinite diagnostics; random operator/seed/outcome; constraint before/after/delta; synchronized raw-vs-shaped A/B using identical source/transport/seed; “Why this note?” trace; accessible ordered pipeline; no semantics represented only by color/animation. Explore/Compose/Inspect are views, not runtimes. Compose may emphasize constraints/freeze; Explore emphasizes direct mapping/bypass/comparison; Inspect exposes formulas/state/version/hashes.

**Evaluation ADR:** independent evidence dimensions = discrimination/recognition, mapping comprehension/learnability, task performance, musical utility/editability, aesthetic preference, cognitive load, accessibility, reproducibility/technical stability. `preference ≠ fidelity`; `fidelity ≠ musical utility`; first-use accuracy ≠ learnability. SonEX identifies evaluation/comparison as a longstanding sonification issue. citeturn5search2 Include point estimation/trend/structure tasks, pre/post training, composition/editing metrics, separate preference ratings, NASA-TLX-style workload, target-user accessibility evaluation, automated reproducibility. citeturn7search0turn5search12 Power based on SESOI/endpoint rather than rule-of-thumb N; illustrative paired two-sided α=.05, power=.80: `dz=.5→N≈34`, `.4→≈52`, `.3→≈90`. citeturn9search2turn9search0

**Golden oracle minimum:** normalization `[0,5,10]→[0,.5,1]`; circular `[-90,0,90,360,450]°→[.75,0,.25,0,.25]`; MAD `[1,2,3,4,100]→median=3, MAD=1, scaled=1.4826`, robust scores approximately `[-1.348981519,-.674490759,0,.674490759,65.425603669]`; EMA with `Δt=τ ln2` gives `α=.5`, `0→.5→.75` for repeated `x=1`; pitch `57/69/81→220/440/880Hz`; `-6.020599913dB→gain .5`; quantizer `S=[0,2,4],1→0,3→2` lower tie; hysteresis fixture above; `p=0/1` exact boundaries; rational `5/12` to quarter grid→`1/2`; missing ≠ zero. Property tests: causal prefix invariant, circular periodicity, quantizer idempotence, stable keyed randomness under unrelated insertion, profile expansion equivalence, state seek equivalence, constraint deterministic/idempotent behavior, serialization roundtrip, unit guards, frozen-window identity.

**Cross-platform oracle:** exact = IDs, integers/categories/Booleans, rational times, threshold state, quantized identities, constraint winner, seeded stochastic outcome, semantic hashes. Scalar separate implementations initial tolerance recommendation `abs(a-b) ≤ 1e-12·max(1,|a|,|b|)`; this is engineering tolerance, not perceptual evidence. Float tolerance is insufficient at branch boundaries: use shared semantic core or canonical rounding/comparison before thresholds/quantization. Resolve with Swift/native/WASM architecture. Audio waveform tolerance belongs DR-03.

**Performance:** do not invent events/sec or provenance latency limits from DR-08. Require bounded complexity/state: fixed norm/EMA/running moments O(1) state; window algorithms bounded by declared W/budget; worker cancellation; provenance retention bounded; event/recursion/time/memory budgets via AGL-025; control/scheduler thresholds via DR-03. fileciteturn0file0turn0file3

**Architecture deltas:** public project schema must serialize dimensions, mapping operators/versions, temporal semantics, frozen artifacts/windows, seeds, profile lineage; graph compiler validates causal and type/unit/topology rules; worker supports deterministic state replay/checkpoint; cache key includes effective graph+versions+input+window/stat artifact+seed/state semantics; render plan receives final logical targets+trace keys only; generated clips reference graph, frozen clips materialize events+lineage; exporters operate on final events and separately report export loss; command bus makes preset/bypass/seed/freeze atomic undoable actions. Existing AGL foundations: rational time AGL-002 done; events AGL-003 done; typed catalog AGL-004 done; seeds AGL-005 done; schema AGL-010 ready; command bus AGL-012 ready; executable operator AGL-020 ready; type checker/compiler/evaluator/cache AGL-021–024 ready; freeze AGL-027 planned; inspector AGL-035 ready; render plan AGL-041 ready; projection/accessibility AGL-050/053 ready; tests AGL-133 ready. fileciteturn0file0

**Backlog critical path:** MODIFY AGL-004/010/011/012/020/021/022/023/024 before M1; ADD shared mapping operator pack + MappingTrace/replay + DR-08 golden corpus before M1; SPLIT/REHOME AGL-112 from Chaos-specific E11 into shared runtime core plus Chaos integration; MODIFY AGL-027/035/038/041/050/053/074/101/111/123/130/131/132/133; add evaluation harness M2→M6. DR-08 is an immediate blocker and formally unblocks AGL-035/050/053/074/101/111/123; DR-02/04/05/06/07/09 depend on DR-08. fileciteturn0file3 All seven labs list DR-08. fileciteturn0file1 Program milestones place deterministic project/provenance at M1, realtime/offline agreement at M2, CA/Chaos bounded control pipeline at M4, seven labs at M5, accessibility/performance/user validation at M6. fileciteturn0file2

**ADR candidates to reconcile centrally:** `ADR-MAP-PIPE Canonical Typed Mapping Pipeline`; `ADR-CAUSAL Causal/Frozen/Acausal Semantics`; `ADR-DIM Dimension/Unit/Scale/Topology`; `ADR-RANDOM Explicit Keyed Randomness`; `ADR-CONSTRAINT Deterministic Musical Constraint Resolution`; `ADR-PROV Mapping Trace/Why-This-Note`; `ADR-EQUIV Logical Realtime/Offline Equivalence`; `ADR-ACCESS Semantic Multimodal Equivalence`; `ADR-PROFILE Profiles Expand to Explicit Graph`; `ADR-EVAL Independent Evaluation Outcome Families`.

**Cross-run blocking questions:** DR-03 owns control-rate/scheduling/DSP/headroom/waveform tolerances; DR-01 owns Risset illusion parameters and what raw comparison means; DR-02 owns Euclidean source/rotation identity; DR-04 owns Tonnetz/harmony/voice-leading cost semantics; DR-05 owns recursion source/lineage semantics; DR-06 owns CA state/summary/traversal meanings; DR-07 owns integrator trajectory boundary, canonical sampling, chaos-specific windows/smoothing; DR-09 owns Penrose geometry/traversal/stable IDs; native architecture must resolve shared-core vs duplicate numeric implementation; command architecture must resolve revision/state invalidation; MIDI/MusicXML work must separate export quantization from sonification constraints. fileciteturn0file3

**Explicit unresolved/weak areas:** no universal auditory-channel ranking; no universal pitch register; no universal gain, smoothing τ, percentile cutoff, hysteresis gap, or event-density ceiling; pitch/loudness/duration dimensions interact perceptually; spatial results task/hardware dependent; timbre is multidimensional; robust normalization gives outlier resistance but not semantic truth; running normalization is causal yet history-dependent; frozen normalization reproducible only relative to window; musical constraints lack generic fidelity guarantee; full provenance vs replay/checkpoints remains an implementation trade; adaptive sampling may unintentionally encode change twice; `faithful` can only mean faithfulness relative to an explicitly declared mapping, not a uniquely correct musical representation. citeturn13search4turn8search13turn11search2turn12search0

**ML roadmap:** post-MVP experimental only. Any future learned mapping needs immutable model artifact/hash/version, training-data/procedure provenance where applicable, deterministic inference contract, declared input/output dimensions, fallback behavior, evaluation by the same independent fidelity/preference/accessibility dimensions, and an explicit explanation that model behavior is learned rather than mathematical necessity. It should not replace transparent deterministic profiles until it demonstrates a product advantage under the appropriate evaluation endpoint.

**Central integration acceptance gate:** architecture is ready only when every lab can construct its mappings using shared source/control/event types and shared DR-08 operators; causal and frozen processing cannot be confused; mappings round-trip through project persistence without semantic reinterpretation; state/seed/window behavior is deterministic; raw and constrained outputs are attributable; selected events answer “why”; realtime/offline logical plans conform; accessibility representations consume the same semantic model; all cross-lab golden/property/metamorphic fixtures pass; and no lab contains opaque private normalization/smoothing/randomness/constraint code that duplicates the shared framework.

#AGL #Sonification #AuditoryDisplay #Psychoacoustics #Reproducibility #Accessibility #SoftwareArchitecture

**Rough conversation token estimate:** ~60k–75k tokens.