# [2026-08-18] Aural Geometry Lab — DR-03 Research Integration Packet

**Research-integration posture:** retain native Web Audio as the reference backend; keep rational musical time and project semantics entirely above the audio layer; move expensive graph/render-plan work into a worker; use the main thread only as the Web Audio control-plane boundary; use AudioWorklet only where rendering-thread execution materially improves bounded DSP or dense-event handling; and make offline rendering consume the same immutable render-plan semantics.

**The most important architecture constraint is not a particular timer value.** It is that JavaScript wake timing must never define musical time. Events carry absolute audio times derived from canonical rational time, and the scheduler merely gets those events into Web Audio early enough.

**The most important determinism constraint is similarly semantic rather than PCM-level.** AGL can guarantee identical canonical project → render-plan derivation; it should not promise bit-identical native-Web-Audio PCM across browser engines because Web Audio intentionally leaves some DSP/resampling choices implementation-dependent. citeturn18search1turn14search0

**Critical evidence boundary:** the materials accessible to this integration pass contain the DR-03 charter and AGL program artifacts, but not the completed report body, benchmark harness source, or raw benchmark outputs. The research register dated August 13 still marks DR-03 as `chartered`, despite the current prompt stating that the report is complete. fileciteturn0file3 Consequently, architecture conclusions grounded in standards and implementation support can be accepted now, but **empirical scheduler thresholds, dense-event caps, and cross-engine audio tolerances must not be represented as measured DR-03 results until those artifacts are attached**. This packet deliberately labels provisional numbers rather than manufacturing missing measurements.

## Decisions and Evidence

**Executive Decision Summary**

| Decision | Classification | Basis and consequence |
|---|---|---|
| Native Web Audio remains the reference real-time backend and semantic baseline. | **ADOPT** | It minimizes dependency semantics and matches existing AGL-040/041 direction. `AudioContext` is the Web Audio control/render graph boundary, while scheduled times are expressed against `currentTime`. citeturn18search1 fileciteturn0file0 |
| Canonical rational musical time remains above the audio backend; RenderPlan contains immutable floating-point seconds plus provenance. | **ADOPT** | This preserves AGL-002/003 mathematical correctness and prevents a browser library's transport model from becoming project semantics. fileciteturn0file0 |
| Real-time and offline paths consume the same semantic RenderPlan and versioned VoiceDefinitions. | **ADOPT** | This is already the stated AGL-041 contract and is the correct equivalence boundary; PCM equality across engines is too strong. fileciteturn0file0 citeturn14search0 |
| Heavy graph evaluation and future-plan expansion run in a dedicated Worker; native Web Audio graph creation/scheduling remains on the Window/main-thread control plane. | **ADOPT** | `AudioContext`, `OfflineAudioContext`, and `AudioWorkletNode` are exposed on `Window`, not general workers. citeturn14search0 AGL already has AGL-023 Worker Evaluator. fileciteturn0file0 |
| JavaScript scheduler wakes periodically but schedules against absolute AudioContext times. | **ADOPT** | Web Audio scheduled time—not callback execution time—is the timing authority. `AudioBufferSourceNode.start(when)` treats past times as immediate; `currentTime` is the Web Audio scheduling clock. citeturn18search1 |
| Start with a **25 ms wake / 100 ms horizon** as a benchmark candidate, not a frozen product law. | **ADOPT WITH CONDITIONS** | 25 ms is consistent with Sprint-0's 24–30 ms design; Tone's documented default look-ahead is 100 ms. Neither proves cross-browser optimality. citeturn15search2 |
| Make scheduler horizon adaptive to measured wake jitter, while bounding how far stale events can be pre-scheduled. | **ADOPT** | This directly trades scheduling robustness against edit/cancellation staleness and can be expressed using observed jitter rather than browser-name heuristics. |
| Use generation IDs plus an atomic future cutover for edits, seeks, tempo changes, loop changes, and regeneration. | **ADOPT** | Once audio has been emitted it cannot be cancelled; future native source/automation operations can be stopped/cancelled only within their API limits. Generation invalidation gives one backend-independent semantic. citeturn15search5turn18search1 |
| AudioWorklet owns custom DSP and high-density/sample-frame dispatch, **not** project state, operator graphs, undo, tempo semantics, or arbitrary JSON processing. | **ADOPT** | `AudioWorkletProcessor` executes on the rendering side and communicates through `MessagePort`; keeping domain semantics elsewhere bounds rendering-path work. citeturn12view3turn14search0 |
| `MessagePort` with versioned batched messages is the portable worklet protocol baseline; SharedArrayBuffer is an optional measured optimization. | **ADOPT** | SAB messaging requires cross-origin isolation and therefore has deployment/security-policy consequences. citeturn13search5 |
| Never pool one-shot `OscillatorNode`/`AudioBufferSourceNode` instances. Cache assets and long-lived buses instead. | **ADOPT** | Scheduled source instances are one-shot; an `AudioBuffer` can be reused. citeturn11search5turn11search12 |
| Introduce a density escalation path: native individual nodes → worklet/polyphonic voice → deterministic aggregation/shedding/rejection. | **ADOPT WITH CONDITIONS** | The architecture is necessary for Risset stress cases, but **transition rates and source-count caps remain empirically unresolved** and partly depend on DR-01's psychoacoustic semantics. fileciteturn0file1turn0file3 |
| Do not make `OfflineAudioContext.suspend()` part of the reference export algorithm. | **ADOPT** | It is not Baseline, and current MDN and current Web Audio 1.1 text disagree on quantization direction; deterministic export should preconstruct the graph instead. citeturn15search0turn12view0 |
| Promise semantic determinism, not cross-browser bit-identical WAV PCM. | **ADOPT** | Browser DSP/resampling/rounding differences are explicitly possible. citeturn14search0 |
| Tone.js may exist only behind an adapter and may not own canonical Transport/time/project semantics. | **ADOPT WITH CONDITIONS** | Tone provides useful instruments, samplers, effects and scheduling helpers, but also defines its own Transport/time abstractions and default look-ahead. citeturn15search1turn15search2 |
| Do not put Tone.js on the MVP critical path. | **DEFER** | AGL-046 is correctly P1/planned; native baseline must establish conformance first. fileciteturn0file0 |
| Faust/WASM should initially be a precompiled-DSP proof, not an in-browser compiler dependency. | **DEFER** | FaustWasm supports worklet and offline DSP and precompiled modules; shipping the compiler adds size/toolchain/licensing complexity without an established MVP need. citeturn13search1turn13search4 |
| Web MIDI is optional note/control I/O, not a core browser capability or clock-synchronization substrate. | **ADOPT WITH CONDITIONS** | Web MIDI remains Limited Availability, secure-context and permission gated. Timing timestamps are useful, but do not establish physical device/audio clock synchronization. citeturn17search1turn18search0 |
| No MVP guarantee for continuous exact playback through background throttling, laptop sleep, or browser/system interruption. | **ADOPT** | These are host/browser policy conditions outside Web Audio's deterministic scheduling contract. Recovery must be explicit rather than pretending transport continuity. |
| M2 scheduler/event-density thresholds remain blocked until the actual DR-03 benchmark artifacts are available. | **REQUIRES CROSS-RUN RECONCILIATION** | AGL-043 and M2 explicitly require accepted scheduler benchmarks; those measurements are not present here. fileciteturn0file0turn0file2 |

**Evidence → Decision Matrix**

| Finding / evidence | Evidence strength | Engineering implication | Recommended decision | Confidence | Source(s) |
|---|---|---|---|---|---|
| Web Audio scheduling times use `BaseAudioContext.currentTime`; while running, it advances with rendered audio blocks. | Normative specification | Musical events must carry absolute audio times; timer callbacks must not define musical placement. | Absolute-time scheduler | Very high | citeturn18search1 |
| `AudioContext`, `OfflineAudioContext`, and `AudioWorkletNode` are Window-exposed; AudioWorkletProcessor executes in the rendering environment. | Normative specification | Worker prepares plans; main thread owns Web Audio graph/control calls; worklet owns bounded DSP. | Three-boundary architecture | Very high | citeturn14search0turn12view3 |
| Web Audio's default render quantum is 128 frames; Web Audio 1.1 allows configurable render-size semantics and exposes quantum size. | Normative current spec, implementation adoption varies | Do not write worklet DSP that assumes array length is forever 128. | Query/process actual block length | High | citeturn12view2turn18search1 |
| Context nodes share the context sample rate; a context has one sample-rate time base. | Normative specification | Treat sample rate as part of backend capability epoch; regenerate sample-index mappings when context is recreated. | Persist time, not runtime frame numbers | Very high | citeturn12view1 |
| `outputLatency` is an **estimate**, varies with platform/hardware, and is not the same thing as scheduler lateness. | Current MDN + spec | Diagnostics must expose processing/output estimates separately from scheduling jitter. | Separate latency metrics | High | citeturn17search0turn18search1 |
| AudioWorklet uses `MessagePort` for node↔processor communication. | Normative specification | A versioned batched protocol can be portable without SAB. | MessagePort baseline | Very high | citeturn12view3 |
| SAB cross-context transfer is available with cross-origin isolation. | Platform documentation | Using SAB changes hosting headers and third-party integration constraints. | Optimization only | High | citeturn13search5 |
| AudioBufferSource nodes are one-shot while underlying buffers are reusable. | Platform documentation aligned with spec | Source-node pools are semantically wrong; asset pools are appropriate. | Fresh scheduled sources | Very high | citeturn11search5turn11search12 |
| `cancelAndHoldAtTime()` remains non-Baseline. | Current MDN | Core edit semantics cannot depend on it. | Use portable cancellation + explicit hold/set semantics | High | citeturn15search5 |
| `OfflineAudioContext.startRendering()` provides fixed-length non-real-time rendering. | Normative/platform evidence | Offline export can consume fully prepared plans without timer scheduling. | Prebuild then render | Very high | citeturn12view1turn5search16 |
| MDN says offline suspend rounds **down**; Web Audio 1.1 text available to this pass says **up**. | Conflicting documentation/spec | Depending on suspend quantization creates avoidable cross-browser ambiguity. | Reject suspend-based reference renderer | Very high decision confidence | citeturn15search0turn12view0 |
| Web Audio implementations can differ in DSP/resampling/rounding decisions. | Normative/informative spec evidence | Cross-engine waveform bit identity is not a valid product guarantee. | Semantic + metric tolerances | Very high | citeturn14search0 |
| Tone Transport callbacks themselves are JavaScript callbacks; Tone passes a Web Audio time for sample-accurate scheduling and defaults to 0.1 s look-ahead. | Official project documentation | Tone does not eliminate scheduling architecture; adopting its Transport would duplicate AGL's canonical time model. | Adapter only | High | citeturn15search1turn15search2 |
| Tone's repository is MIT and actively maintained; current dev package observed at 15.5.33 during this pass. | Official repository, mutable branch | Pin and review a specific release rather than architecture against `dev`. | P1 dependency only | High | citeturn15search3turn15search6 |
| FaustWasm can create Web Audio nodes, worklet processors and offline processors, including from precompiled WASM. | Official repository | Faust can fit behind VoiceDefinition/EffectDefinition without becoming project semantics. | Proof via precompiled DSP | High | citeturn13search1 |
| Faust libraries carry LGPL terms with an explicit generated-code exception in inspected library material; overall compiler/runtime dependency licensing is multi-component. | Primary repository | AGL-136 must review exact consumed components rather than label all Faust under one license. | Legal/dependency gate | High | citeturn13search4 |
| Web MIDI uses high-resolution event/output timestamps and `MIDIOutput.send()` accepts navigation-origin performance timestamps. | Normative specification | MIDI ↔ audio timestamps can be mapped using a paired `getOutputTimestamp()` clock observation. | Best-effort timestamp adapter | High | citeturn18search0turn18search1 |
| Web MIDI is secure-context, permission/Permissions-Policy gated and remains non-Baseline. | Current MDN | MIDI cannot be required for core lab operation. | Optional progressive enhancement | Very high | citeturn17search1 |
| Output-device selection through `setSinkId()` remains limited/experimental. | Current MDN | Do not make selectable output device a core portability contract. | Feature-detect only | High | citeturn17search2 |
| AGL already has exact rational time, canonical event model, worker evaluator, RenderPlan, Worklet, offline-render, Tone/Faust/MIDI and browser-harness backlog seams. | Program artifact | DR-03 should harden existing boundaries rather than invent parallel abstractions. | Modify existing backlog | Very high | fileciteturn0file0 |
| M2 explicitly exits on accepted scheduler benchmark and real-time/offline agreement. | Program artifact | Missing benchmark numbers are an architecture gate, not editorial cleanup. | Keep benchmark gate blocking | Very high | fileciteturn0file2 |

**Platform capability posture**

| Capability | Chromium desktop | Firefox desktop | Safari desktop | AGL contract |
|---|---|---|---|---|
| Core Web Audio | Core-supported | Core-supported | Core-supported | Required |
| AudioWorklet | Supported on current desktop generation | Supported on current desktop generation | Supported on current desktop generation | Required for Tier-A core; graceful failure required |
| OfflineAudioContext/startRendering | Core-supported | Core-supported | Core-supported | Required |
| `baseLatency` | Feature-detect/report | Feature-detect/report | Feature-detect/report | Diagnostic, never semantic |
| `outputLatency` | Current-generation support | Current-generation support | Current-generation support; MDN now marks feature Baseline 2025 | Diagnostic estimate only citeturn17search0 |
| `setSinkId()` | Available in Chromium lineage | Not portable | Not portable | Optional only citeturn17search2 |
| `cancelAndHoldAtTime()` | Do not assume | Do not assume | Do not assume | Not core due non-Baseline status citeturn15search5 |
| Offline `suspend()` semantics/support | Do not depend on | Do not depend on | Do not depend on | Excluded from reference algorithm citeturn15search0 |
| Web MIDI | Supported in Chromium family | Supported in current Firefox desktop | Current compatibility data does not provide a portable Safari path | Optional only; Safari-degraded UX citeturn17search1turn7view0 |
| SharedArrayBuffer worklet queue | Possible when deployment is cross-origin isolated | Same architectural constraint | Same architectural constraint | Disabled baseline; opt-in optimization citeturn13search5 |

The supported-browser policy should therefore be **capability-tested, not browser-name-coded**. CI/results should record exact browser build, OS build, hardware, device, context sample rate, power state, and relevant capabilities. The Web Audio specification itself leaves important latency/resource limits implementation-defined, so a compatibility table cannot replace empirical measurement. citeturn17search5

## Architecture and Formal Contracts

**Architecture Consequences**

| Affected subsystem | Exact consequence | Contract change? | Dependencies | Cost of doing later | Recommendation |
|---|---|---:|---|---|---|
| Canonical project model | Browser timing, latency, output-device IDs, scheduler horizons and active generation IDs are **runtime state**, not canonical project content. Persist only intentional render/voice settings. | Public schema clarification | AGL-010/011 | High if runtime fields leak into project files | Freeze distinction before schema freeze. |
| Rational musical-time model | All iteration/loop/tempo calculations remain rational until RenderPlan conversion. Backends must never generate successive beats by repeatedly adding float durations. | Public semantic contract | AGL-002/003 | Very high | Hard invariant. |
| Event/pattern model | Every renderable event needs stable identity and enough provenance to trace it back to generated/frozen source material. | Public/internal | AGL-003/005/027/032 | High | Extend RenderPlan identity, not core event semantics unnecessarily. |
| Typed operator graph | Graph evaluation produces bounded immutable plan fragments and is cancellable by generation/request ID. | Internal runtime | AGL-020–025 | Medium | Use AGL-023 rather than audio-thread evaluation. |
| RenderPlan | Needs schema version, plan ID/hash, project revision/hash, transport mapping revision, voice version, start/duration seconds, automation, late policy, cancellation group, provenance ref and approximation records. | **Public internal boundary** | AGL-041 | **Critical** | Freeze before audio backend proliferation. |
| Main-thread runtime | Owns user activation, `AudioContext`, graph/node construction, native-source scheduling, transport/backend bridge, context lifecycle. Heavy graph evaluation prohibited. | Internal architecture | AGL-030/031/040 | High | Make an explicit performance boundary. |
| Worker runtime | Owns operator evaluation, interval expansion, rational→seconds mapping, render-plan fragmentation and cancellation. Does not own audible transport clock. | Internal contract | AGL-023/041 | Medium | Adopt. |
| AudioWorklet | Owns custom DSP, dense voice mixing, exact frame dispatch, bounded queue state and smoothing. No React, project model, graph compiler or unbounded object allocation. | Internal protocol | AGL-044 | High | Freeze versioned protocol. |
| Scheduler | Absolute-time look-ahead scheduling with measured adaptive horizon; timer only causes queue servicing. | Core internal contract | AGL-043 | Critical | Freeze semantics before Transport. |
| Cancellation | New project state creates a new render generation; scheduled future state from superseded generation is stopped, cancelled, gated or ignored from a defined switch time. | Core internal behavior | AGL-012/031/041/044 | Critical | Make generation semantics explicit. |
| Voice registry | Distinguish native one-shot voices, persistent worklet/poly voices and effects. Voice definitions declare seek/resume/late/tail capabilities. | Internal/public plugin-like contract | AGL-042 | High | Add capabilities now. |
| Source pooling | Cache `AudioBuffer`, decoded assets, shared effect nodes and immutable waveform resources; don't reuse one-shot scheduled source objects. | Internal | AGL-042 | Low | Implement directly. |
| Gain safety | Safety limiter/master path is distinct from mathematically meaningful Risset normalization. Approximation/shedding must be visible in provenance. | User-visible semantic | AGL-049 + DR-01 | High | Do not let safety DSP silently redefine lab math. |
| Offline renderer | Same plan/voices; fixed export sample rate; explicit range and effect-tail policy; graph fully prepared before rendering. | Core backend | AGL-045 | Critical | Freeze with AGL-041. |
| Determinism | Exact project/plan determinism; numeric/audio conformance uses feature metrics/tolerances rather than cross-engine PCM hash. | Product claim/test contract | AGL-045/133/134 | Very high | Adopt before golden fixtures. |
| MIDI | Separate Web MIDI runtime adapter from AGL-130 MIDI-file exporter. Web MIDI capability is ephemeral and non-required. | Public UX/runtime | AGL-048/130 | Medium | Keep these explicitly separate. |
| Project persistence | Persist voice/backend IDs/versions, asset hashes, seeds and intentional render settings; do not persist transient hardware latency as canonical state. | Public project schema | AGL-010/015 | High | Add provenance fields before package freeze. |
| Provenance | Offline manifest must record backend/browser/version, sample rate, plan hash, voice versions, project hash, seed/assets and approximations. | Export contract | AGL-045 | Medium | Required for reproducibility. |
| Undo/redo | Audio scheduling operations themselves are **derived effects**, not undoable project commands. Undo produces another project revision/render generation. | Command architecture | AGL-012 | Very high | Hard contract. |
| Generated vs frozen | Scheduler treats both as resolved RenderPlan events; distinction persists in provenance/source representation, not playback timing. | Public semantic | AGL-027/032 | High | Preserve lineage through RenderPlan. |
| Swift/native/shared core | Rational/project/render-plan semantics should be portable; Web Audio scheduling/worklet details should not enter the canonical model. | Cross-platform contract | No corresponding report visible | Very high | Cross-run reconciliation required. |

A useful concrete topology is:

```text
Canonical Project / Rational Beat Time
              |
              v
      Typed Operator Graph
              |
      [Dedicated Worker]
 compile / evaluate / interval query
 rational beat -> seconds mapping
 deterministic IDs / provenance
              |
              v
     Immutable RenderPlan<N>
              |
      +-------+--------+
      |                |
      v                v
Real-time adapter    Offline adapter
      |                |
 [Window/main]      [Window/main]
 AudioContext       OfflineAudioContext
 native nodes       same voice registry
 scheduler          startRendering()
      |
      +----------------------------+
      |                            |
 sparse/native             dense/custom DSP
 AudioScheduledSource      AudioWorkletNode
 Nodes/AudioParams                |
                             [render thread]
                          bounded event queue
                          synth/effect/mixer DSP
```

This split follows the platform's actual exposure model: native contexts/nodes are Window-side, while the worklet processor is the rendering-thread extension. citeturn14search0turn12view3

**Proposed ADRs**

### ADR-RI03-A: Canonical RenderPlan Is the Audio Backend Boundary

**Context**

AGL already has exact rational musical time and a canonical event/pattern model, while AGL-041 calls for one plan driving real-time and offline rendering. fileciteturn0file0 Browser APIs schedule in floating-point context seconds. citeturn18search1

**Decision**

All canonical mathematical/project semantics remain upstream. A versioned immutable RenderPlan is the only scheduling input to audio backends. It contains resolved seconds and backend-independent event/control semantics, plus provenance. It must not contain Tone Transport objects, live AudioNodes, browser device IDs, or mutable project references.

**Alternatives considered**

Let Tone.js Transport own time; let each backend evaluate operators directly; put rational beat arithmetic into AudioWorklet.

**Consequences**

One deterministic compilation path; real-time/offline comparison is meaningful; native/Swift/WASM backends remain replaceable.

**Risks**

Plan size and fragment invalidation require bounded design.

**Evidence**

AGL-002/003/041; Web Audio scheduling clock. fileciteturn0file0 citeturn18search1

**Confidence:** Very high.

### ADR-RI03-B: Worker/Main/AudioWorklet Responsibility Split

**Context**

Web Audio graph APIs are Window-exposed, while high-cost operator evaluation threatens scheduler wake quality.

**Decision**

Worker evaluates mathematical graph and prepares plans. Main thread owns AudioContext and native scheduling. AudioWorklet owns only bounded real-time DSP/high-density dispatch.

**Alternatives considered**

Everything on main thread; all sequencing in AudioWorklet; Worker directly operating Web Audio nodes.

**Consequences**

UI/graph computation cannot directly execute on the rendering path; scheduler control-plane work remains measurable.

**Risks**

Main thread is still needed for native node creation, so pathological UI blocking can still cause missed scheduling unless enough horizon exists.

**Evidence**

Web Audio exposure/thread model. citeturn14search0turn12view3

**Confidence:** Very high.

### ADR-RI03-C: Absolute-Time Look-Ahead Scheduler With Adaptive Horizon

**Context**

JavaScript callback timing is not precise enough to represent event timing; Web Audio provides scheduled start/automation times. Tone independently uses the same schedule-ahead pattern and defaults to 100 ms look-ahead. citeturn15search1turn15search2

**Decision**

Scheduler wakes periodically, reads `AudioContext.currentTime`, and schedules immutable plan events whose absolute times fall before a rolling horizon. Initial benchmark configuration: 25 ms wake, 100 ms horizon. Production horizon adapts from observed wake lateness and is bounded to limit stale pre-scheduling.

**Alternatives considered**

`setTimeout` exactly at event time; schedule entire song at play; run every event in AudioWorklet.

**Consequences**

Timing is robust against modest timer jitter; edit semantics require explicit cancellation.

**Risks**

No number is yet empirically validated from the unavailable DR-03 benchmark artifact.

**Evidence**

Web Audio timing model; Tone scheduling practice. citeturn18search1turn15search2

**Confidence:** High architecture / medium numeric default.

### ADR-RI03-D: Generation-Based Rescheduling and Cancellation

**Context**

Scheduled sounds can be stopped, future AudioParam events can be cancelled, but emitted samples cannot be withdrawn. Some convenient cancellation methods remain non-Baseline. citeturn15search5turn18search1

**Decision**

Every render-plan revision has a monotonic `generationId`. Edits/seek/tempo changes create a new generation and a future `switchTime`/`switchFrame`. Backend invalidates superseded future events at or after that boundary. Native handles are stopped/cancelled; worklets reject stale-generation queue entries. Already-emitted audio is immutable history.

**Alternatives considered**

Mutate scheduled events in place; destroy/recreate the entire AudioContext.

**Consequences**

Semantics are backend-independent and testable.

**Risks**

Sustaining/reverb tails require explicit tail policy.

**Confidence:** Very high.

### ADR-RI03-E: MessagePort Is the Portable Worklet Control Protocol

**Context**

AudioWorklet exposes MessagePort communication; SharedArrayBuffer requires a cross-origin-isolated deployment context. citeturn12view3turn13search5

**Decision**

Versioned batched MessagePort messages are baseline. The processor maintains preallocated bounded queue/voice state. SAB is permitted only as a capability-negotiated optimization proven necessary by benchmark data.

**Alternatives considered**

SAB mandatory; one `postMessage` per note; arbitrary JSON object graph.

**Consequences**

Default hosting remains simpler and protocol remains portable.

**Risks**

MessagePort overhead could become the bottleneck at extreme event densities.

**Confidence:** High; density threshold requires measurement.

### ADR-RI03-F: Native Source Nodes Are Disposable; Assets and Buses Are Reusable

**Context**

Scheduled source nodes are one-shot; AudioBuffers are reusable. citeturn11search5turn11search12

**Decision**

Create new native oscillator/buffer-source instances per activation. Cache decoded buffers, PeriodicWave-like immutable resources, shared buses/effects, and optionally fully resettable wrapper objects. Dense polyphony migrates to a persistent worklet voice rather than a source-node object pool.

**Consequences**

Simpler lifecycle and fewer illegal reuse paths.

**Confidence:** Very high.

### ADR-RI03-G: Semantic Offline Determinism, Not Cross-Engine PCM Identity

**Context**

Web Audio explicitly permits implementation-level DSP/resampling/rounding differences. citeturn14search0

**Decision**

Determinism tiers:

`D0` project/operator evaluation exact;  
`D1` RenderPlan canonical serialization/hash exact;  
`D2` backend event/sample-index conformance exact within specified discretization;  
`D3` audio waveform tested by feature/tolerance metrics;  
cross-engine PCM byte identity is not promised.

**Alternatives considered**

Use WAV hashes as universal goldens.

**Consequences**

Tests detect real semantic divergence without failing on harmless engine DSP differences.

**Confidence:** Very high.

### ADR-RI03-H: Preconstructed Offline Render Graph

**Context**

Offline suspend is not universally available and its current documentation/specification disagree on quantum rounding. citeturn15search0turn12view0

**Decision**

Reference offline rendering constructs its complete graph/automation before `startRendering()`. Dynamic graph mutation via offline `suspend()` is excluded from required equivalence.

**Confidence:** Very high.

### ADR-RI03-I: Tone.js Is a Replaceable Service Adapter

**Context**

Tone offers instruments, samplers, effects, a global Transport, time notation and scheduling utilities; its abstractions overlap AGL's canonical time/transport domain. citeturn15search1

**Decision**

Tone may implement selected `VoiceFactory`/effect services or convenience loaders. AGL never persists Tone time expressions, Tone Transport positions, Tone object types, or Tone-specific identifiers in canonical project state.

**Consequences**

Tone can be removed without project migration.

**Risks**

Instrument behavior may not exactly match native reference voices; contract tests required.

**Confidence:** Very high on boundary; medium on whether Tone should ultimately be adopted.

### ADR-RI03-J: Faust Is Build-Time/Precompiled DSP First

**Context**

Faust can compile DSP to WASM, drive Web Audio/AudioWorklet and render offline; precompiled WASM avoids embedding the compiler. citeturn13search1

**Decision**

Initial proof uses one precompiled advanced DSP component behind AGL voice/effect contracts. Runtime DSP compilation is out of MVP.

**Consequences**

Potential web/native DSP reuse without runtime compiler burden.

**Risks**

Generated/runtime/library licenses and toolchain reproducibility need AGL-136 review. citeturn13search4

**Confidence:** High.

### ADR-RI03-K: Web MIDI Is Optional Note/Control I/O

**Context**

Web MIDI is non-Baseline, secure-context and permission gated, though its timestamps provide a useful high-resolution timing coordinate. citeturn17search1turn18search0

**Decision**

MVP-capable adapter scope is note on/off, CC, pitch bend and optional timestamped output. System Exclusive is off. MIDI clock synchronization/MTC-style transport authority is not part of MVP. Web MIDI absence never disables core composition/playback.

**Confidence:** High.

### ADR-RI03-L: Foreground Timing SLA With Explicit Interruption Recovery

**Context**

Web Audio standards define audio context clocks and rendering behavior, not a professional continuity guarantee across laptop sleep, browser suspension and arbitrary host/device transitions.

**Decision**

AGL's measurable real-time timing SLA applies to a running foreground application on a declared supported configuration. Background/sleep/context interruption is a state transition: invalidate the scheduling epoch, re-anchor transport on recovery, and visibly report the discontinuity.

**Confidence:** High as a product engineering policy; cross-browser recovery details require empirical validation.

**Mathematical / Behavioral Contracts**

**Canonical beat-to-seconds conversion**

Let canonical beat position be rational \(b\), and tempo map define positive BPM \(T(b)\). For a constant-tempo segment beginning at beat \(b_0\) and second \(s_0\),

\[
s(b)=s_0+\frac{60(b-b_0)}{T}
\]

where rational arithmetic is retained for \(b-b_0\) until the final floating conversion.

For a piecewise-constant tempo map:

\[
s(b)=\sum_i \frac{60\,\Delta b_i}{T_i}
\]

over fully traversed segments plus the partial final segment.

**Invariant:** loop iteration \(k\) is evaluated from canonical absolute beat:

\[
b_k=b_{\text{loopStart}}+kL_b+\delta_b
\]

then converted to seconds. **Forbidden implementation:**

\[
s_{k+1}=s_k+L_s
\]

when `L_s` is merely a previously rounded float. This prevents cumulative scheduling drift.

**Render-plan identity**

A render event SHALL be uniquely addressable by:

\[
K=(\text{planGeneration},\text{stableEventId},\text{voiceInstanceRole})
\]

and tie ordering SHALL use an explicit deterministic order, e.g.:

\[
(startSeconds,\ priority,\ stableEventId)
\]

rather than JavaScript object insertion accident.

A minimal implementation-facing contract:

```ts
type Seconds = number;
type GenerationId = bigint | number;

interface AudioRenderPlan {
  schemaVersion: number;
  planId: string;
  planHash: string;
  generationId: GenerationId;

  projectRevisionId: string;
  projectHash: string;
  transportMapRevision: string;

  range: {
    startSeconds: Seconds;
    endSeconds: Seconds;
  };

  events: readonly RenderEvent[];
  approximations: readonly ApproximationRecord[];
}

interface RenderEvent {
  eventId: string;             // stable within canonical lineage
  sourceRef: string;           // generated/frozen/provenance reference
  voiceId: string;
  voiceVersion: string;

  startSeconds: Seconds;
  durationSeconds?: Seconds;
  sourceOffsetSeconds?: Seconds;

  parameters: Readonly<Record<string, number>>;
  automation: readonly AutomationSegment[];

  cancellationGroup: string;
  latePolicy: LatePolicy;
}

type LatePolicy =
  | "drop"
  | "start-at-offset"
  | "immediate-state"
  | "coalesce"
  | "voice-defined";

interface AutomationSegment {
  parameterId: string;
  kind: "set" | "linear" | "exponential" | "target";
  startSeconds: Seconds;
  endSeconds?: Seconds;
  value: number;
  endValue?: number;
  timeConstantSeconds?: number;
}

interface ApproximationRecord {
  kind: string;
  reason: string;
  originalCount?: number;
  renderedCount?: number;
  policyVersion: string;
}
```

**Render-plan invariants**

\[
0 \le startSeconds < \infty
\]

\[
durationSeconds \ge 0
\]

and every numeric field SHALL be finite; NaN and infinities are schema/runtime errors.

RenderPlan is immutable once published.

Changing a project revision SHALL produce a distinct generation even if only a small audio region changes.

Identical canonical inputs, operator versions, seeds, assets, tempo map and requested range SHALL produce identical canonical RenderPlan serialization/hash.

**Scheduler servicing**

At wake \(i\):

\[
n_i = AudioContext.currentTime
\]

Let \(H_i\) be look-ahead horizon and \(S_i\) the first unscheduled time. Schedule events satisfying:

\[
S_i \le t_e < n_i + H_i
\]

and advance `scheduledThrough` only after successful registration of all relevant events.

The wake callback time is **not** copied into event start time.

**Provisional adaptive horizon**

Initial:

\[
W_0 = 25\text{ ms}
\]

\[
H_0 = 100\text{ ms}
\]

Candidate adaptive rule:

\[
H =
\operatorname{clamp}
\left(
H_{\min},
H_{\max},
\max(3W,\ J_{99.9}+W+2Q)
\right)
\]

where:

- \(W\) = wake interval,
- \(J_{99.9}\) = rolling 99.9th percentile positive wake lateness,
- \(Q=q/F_s\) = render quantum duration,
- provisional \(H_{\min}=75\) ms,
- provisional \(H_{\max}=200\) ms.

These bounds are **engineering candidates, not recovered empirical DR-03 results**. Tone's documented 100 ms look-ahead supports that order of magnitude but does not prove AGL's optimum. citeturn15search2

**Quantum values**

With default \(q=128\) frames: citeturn12view2

At 48 kHz:

\[
Q=\frac{128}{48000}=0.0026666667s
\]

= **2.6667 ms**.

At 44.1 kHz:

\[
Q=\frac{128}{44100}=0.0029024943s
\]

= **2.9025 ms**.

These are mathematical conversions of the default quantum, not complete system latency.

**Seconds-to-worklet-frame discretization**

For custom DSP event dispatch, define:

\[
f=\operatorname{round}(tF_s)
\]

using one documented deterministic tie rule.

Then:

\[
\left|\frac{f}{F_s}-t\right|\le \frac{1}{2F_s}
\]

giving maximum nearest-frame discretization error of:

- **10.4167 μs at 48 kHz**
- **11.3379 μs at 44.1 kHz**

Do not persist these frame numbers in canonical projects because a different render sample rate produces a different frame mapping.

**Generation state machine**

```text
PREPARING(Gn)
    |
    | complete
    v
READY(Gn)
    |
    | COMMIT switchTime=T
    v
ACTIVE(Gn, T)
    |
    +-- edit --> PREPARING(Gn+1)
                     |
                     v
                READY(Gn+1)
                     |
             atomic switch at T'
                     v
                ACTIVE(Gn+1)
```

At switch time \(T'\):

\[
\forall e \in G_n,\ t_e \ge T'
\Rightarrow e\text{ must not produce new output}
\]

Audio emitted before \(T'\) is not reversible.

Tail behavior for voices active before \(T'\) must be one of:

`allow-tail`, `release`, `mute-at-switch`, `reinstantiate`, chosen by voice contract.

**Seek contract**

Seek from transport position \(a\) to \(b\):

1. increment generation;
2. invalidate pending future events;
3. establish a new AudioContext↔transport anchor;
4. reconstruct voices active at \(b\) according to voice seek semantics;
5. resume scheduling from \(b\).

A seekable sample crossing \(b\) may use:

\[
offset = b - eventStart
\]

whereas a non-seekable percussive trigger may be intentionally absent. This is a **voice-semantic decision and must not be guessed by the scheduler**.

**Late-event contract**

Define lateness:

\[
L=n-t_e
\]

where \(n\) is scheduler observation of current audio time.

If \(L \le 0\), schedule normally.

If \(L>0\), `latePolicy` controls behavior:

| Policy | Semantics |
|---|---|
| `drop` | Event produces no onset; diagnostic counter increments. |
| `start-at-offset` | If still active, start immediately with source/state offset \(L\); otherwise drop. |
| `immediate-state` | Apply state-changing operation immediately; appropriate for releases/safety/control state. |
| `coalesce` | Combine multiple missed impulses according to a versioned voice/lab rule. |
| `voice-defined` | Delegate to deterministic VoiceDefinition logic. |

**No universal millisecond late-grace value is justified by the evidence available here.** AGL should not silently encode one in Scheduler.

**Worklet protocol**

Logical protocol version:

```ts
interface WorkletEnvelope<T> {
  protocolVersion: number;
  audioEpoch: number;
  generationId: number;
  sequence: number;
  type: WorkletMessageType;
  payload: T;
}

type WorkletMessageType =
  | "configure"
  | "event-batch"
  | "prepare-generation"
  | "commit-generation"
  | "cancel-generation"
  | "parameter-batch"
  | "flush"
  | "panic"
  | "stats-request";
```

Required processor→control responses:

```ts
type WorkletResponseType =
  | "ready"
  | "ack"
  | "stats"
  | "queue-overflow"
  | "protocol-error"
  | "processor-error";
```

`event-batch` SHALL be bounded and should use compact typed buffers/transferables rather than one object-message per event at high density.

Processor invariants:

- bounded queue capacity;
- no queue growth in `process()`;
- stale `generationId` cannot trigger new output after committed switch frame;
- unknown protocol version/opcode fails closed;
- queue overflow is observable;
- `panic` reaches silence through a bounded safety transition;
- processor code uses actual buffer length/render-quantum information rather than permanently assuming 128 frames because current Web Audio 1.1 permits render-size evolution. citeturn14search0turn18search1

**Offline render contract**

For requested range \([a,b)\), sample rate \(F_s\), and declared tail \(\tau\):

\[
N=\left\lceil (b-a+\tau)F_s\right\rceil
\]

The `OfflineAudioContext` SHALL contain exactly \(N\) output frames.

A 2.5 s, no-tail, 48 kHz fixture therefore contains:

\[
2.5\times48000=120000
\]

frames.

The plan is shifted so requested range start maps to offline time 0; events crossing \(a\) follow the same voice seek/resume semantics used by real-time seek.

**Offline manifest minimum**

```json
{
  "manifestSchema": 1,
  "projectHash": "...",
  "projectRevisionId": "...",
  "renderPlanHash": "...",
  "renderPlanSchema": 1,
  "seed": "...",
  "range": {
    "projectStartSeconds": 0,
    "projectEndSeconds": 10,
    "tailSeconds": 0
  },
  "audio": {
    "sampleRate": 48000,
    "channels": 2,
    "frameCount": 480000
  },
  "backend": {
    "id": "agl.web-audio.native",
    "version": "...",
    "browserEngine": "...",
    "browserBuild": "..."
  },
  "voices": [
    {
      "id": "...",
      "version": "..."
    }
  ],
  "assets": [
    {
      "hash": "...",
      "mediaType": "audio/wav"
    }
  ],
  "approximations": []
}
```

Store this as canonical sidecar metadata or inside AGL's export package; embedding optional WAV metadata may be additive, but the reproducibility record should not depend on arbitrary media players preserving custom RIFF chunks.

**Determinism levels**

| Level | Required property |
|---|---|
| Project | Same valid project bytes/migration target → same canonical state. |
| Evaluation | Same operator versions/seed/range → same events/provenance. |
| RenderPlan | Canonical serialization and plan hash exact. |
| Backend timing | Same event seconds and same sample rate → defined frame mapping. |
| Same-backend audio | Compare using strict fixture-specific tolerance; bit-exact only where implementation truly guarantees it. |
| Cross-engine audio | Compare onset, duration, RMS/peak, spectral/other defined features; **never globally require PCM hash equality**. |

## Verification, Defaults, and Product Semantics

**Test Oracle and Fixture Pack**

### Unit invariants

| Fixture/input | Expected result | Tolerance | Why | Evidence |
|---|---|---|---|---|
| 120 BPM, beat 0 | 0 s | Exact rational→double fixture | Origin | AGL exact-time model fileciteturn0file0 |
| 120 BPM, beat 1/3 | 1/6 s | Final IEEE-754 conversion only | Rational subdivision | Same |
| 120 BPM, beats 0,1/3,2/3,1 @48k | frame targets 0, 8000, 16000, 24000 | Exact with specified frame rule because values are integral | Tests rational→seconds→frame | Derived mathematically |
| 120 BPM beats [0,4), then 60 BPM; beat 4 | 2.0 s | Exact fixture | Tempo-boundary integration | Canonical contract |
| Same map, beat 5 | 3.0 s | Exact fixture | Post-change mapping | Canonical contract |
| 3-beat loop @120 BPM, loop iteration 1000 boundary | 1500.0 s from absolute computation | No cumulative iteration error | Detect float recurrence drift | AGL-002 purpose fileciteturn0file0 |
| `q=128`, `Fs=48000` | 2.6666667 ms | calculator precision | Quantum math | Web Audio default quantum citeturn12view2 |
| `q=128`, `Fs=44100` | 2.9024943 ms | calculator precision | Same | Same |
| Offline duration 1s @48k | 48,000 frames | Exact | Output-length contract | Web Audio offline frame model citeturn12view1 |
| Offline duration 2.5s @48k | 120,000 frames | Exact | Noninteger-second fixture | Same |
| Worklet event `t=1.25`, 48k | frame 60,000 | Exact | Dispatch mapping | Derived |
| NaN/Inf parameter | Plan rejected | Exact | No undefined DSP state | Engineering invariant |
| Same event IDs/times inserted in shuffled source order | Canonically sorted plan identical | Exact hash | Determinism | Engineering contract |

### Property-based tests

Generate arbitrary rational beat positions, valid piecewise tempo maps and loop indexes and verify:

\[
beat_1 < beat_2 \Rightarrow seconds(beat_1) < seconds(beat_2)
\]

for strictly positive tempo.

For any legal event time \(t\):

\[
|frame(t)/F_s-t|\le0.5/F_s
\]

under nearest-frame discretization.

For any two plan-generation requests with identical canonical inputs:

\[
hash(plan_A)=hash(plan_B)
\]

independent of worker chunk size, job order or UI timing.

For any committed generation transition \(G_i\rightarrow G_{i+1}\) at frame \(F\), no stale \(G_i\) onset with target frame \(\ge F\) may reach worklet voice dispatch.

For any scheduler wake sequence that services every event before deadline, changing wake timing or horizon partitioning must not change the eventual scheduled event times.

For all scheduler queue capacities:

\[
queueSize \le configuredCapacity
\]

with overflow producing deterministic error/degradation telemetry, never unbounded allocation.

### Metamorphic tests

**Time translation:** add \(\Delta\) seconds to every event and context anchor. Output onset positions shift by \(\Delta\); relative intervals remain identical.

**Batch partition:** send one worklet event batch of 1,000 events versus ten batches of 100 with identical sequence order. Dispatch sequence and rendered output are equivalent.

**Worker partition:** evaluate interval `[0,16)` in one request versus `[0,8)` + `[8,16)` and merge under canonical boundary rules. RenderPlan canonical result must match.

**Scheduler horizon:** render/schedule an otherwise non-late plan using 75, 100 and 150 ms horizons. Audible event timing must be identical; only scheduling telemetry differs.

**Real-time/offline semantic projection:** same RenderPlan and sample rate must resolve identical voice IDs, parameter trajectories, source offsets and event target times even when actual native DSP samples differ.

**Backend substitution:** native reference voice vs Tone adapter claiming semantic equivalence must pass the voice's published contract. Failure makes the Tone implementation unsupported rather than changing the reference semantics.

### Golden fixtures

**Golden: `constant-tempo-thirds`**

```text
tempo = 120 BPM
beats = [0, 1/3, 2/3, 1]
seconds = [0, 1/6, 1/3, 1/2]
Fs = 48000
frames = [0, 8000, 16000, 24000]
```

**Golden: `tempo-step`**

```text
tempo:
  [0, 4): 120 BPM
  [4, ∞): 60 BPM

beat 3 = 1.5 s
beat 4 = 2.0 s
beat 5 = 3.0 s
beat 6 = 4.0 s
```

**Golden: `generation-cutover`**

```text
G1:
  E1 @ 0.750 s
  E2 @ 1.000 s
  E3 @ 1.250 s

G2 commits at 0.900 s:
  E4 @ 1.000 s

Expected:
  E1 may have sounded from G1.
  E2 and E3 must not begin from G1.
  E4 begins from G2.
```

**Golden: `late-seekable-sample`**

```text
event:
  intendedStart = 1.000 s
  duration = 0.500 s
scheduler observes now = 1.200 s
policy = start-at-offset

Expected:
  immediate source start
  source offset = 0.200 s
  remaining nominal duration = 0.300 s
  lateEventCount += 1
```

**Golden: `late-trigger-drop`**

Same timing, `latePolicy="drop"` → zero onset and `droppedLateEventCount += 1`.

**Golden: `midi-clock-map`**

Given `getOutputTimestamp()` pair:

```text
contextTime = 10.000 s
performanceTime = 50000.0 ms
MIDI event timestamp = 50012.5 ms
```

map:

\[
t_{audio}=10.000+\frac{50012.5-50000}{1000}=10.0125s
\]

This proves the clock-coordinate transformation, **not physical MIDI input latency compensation**. Web MIDI and Web Audio define the two relevant timestamp coordinate systems. citeturn18search0turn18search1

### Cross-platform conformance tests

The supported matrix should execute at minimum on the configurations already demanded by DR-03: current Chromium, Firefox and Safari on macOS, plus Chromium and Firefox on Windows where available. The harness must record exact builds rather than relying on “current.” This aligns AGL-134 and M2. fileciteturn0file0turn0file2

For each browser/hardware tuple test:

| Conformance area | Oracle |
|---|---|
| AudioContext lifecycle | explicit user activation can reach running state; state transitions recorded |
| Context capabilities | sampleRate/baseLatency/outputLatency/quantum capability recorded, never assumed |
| Native scheduled onset | onset timing distribution measured against intended schedule |
| Worker plan generation | identical plan hash |
| Generation cancellation | zero stale future onsets |
| Worklet dispatch | target-frame ordering + queue overflow correctness |
| Offline frame count | exact |
| Offline semantic plan | exact plan hash |
| Audio comparison | fixture-specific metrics, not universal PCM hash |
| Device/context interruption | observable recovery state, no silent transport deception |
| Web MIDI | feature detection + permission + timestamp mapping; graceful unavailable state |

### Performance tests

Use the charter's eight profiles unchanged because they cover the correct failure modes: steady 4–32 events/s; burst density; Risset near cap; live scrubbing; heavy canvas/3D; worker recomputation; 10–30-minute soak; and low-power/CPU-throttled behavior.

Collect per run:

```text
browser / engine / exact build
OS / exact build
hardware / CPU / memory
power mode
output device / wired-Bluetooth-other
sampleRate
baseLatency
outputLatency
render quantum if discoverable
AudioContext state history

scheduler:
  wakeCount
  wakeLateness p50/p95/p99/p99.9/max
  current horizon
  queue depth
  scheduled events
  late events
  dropped late events
  coalesced events
  cancellations
  stale-generation suppressions

voice:
  active voices
  peak active voices
  created native sources
  teardown count/duration
  worklet queue occupancy
  worklet queue-overflow count

offline:
  frames rendered
  wall duration
  renderSpeed = renderedSeconds / wallSeconds
  planHash
  output feature hashes/metrics
```

There is no standards basis for pretending browser-reported `baseLatency`/`outputLatency` are physical end-to-end measurements. `outputLatency` is explicitly an estimate. citeturn17search0

**M2 thresholds that can be frozen now**

These are semantic/functional rather than missing empirical numbers:

- **Zero stale-generation future onsets** after a committed cutover.
- **Zero unbounded worklet queue growth.**
- **Zero NaN/Inf output in golden fixtures.**
- **Exact RenderPlan hash agreement** between real-time/offline front ends for the same requested plan.
- **Exact output frame count** for offline fixtures.
- **Exact plan-level event identity/order.**
- **No dependency on OfflineAudioContext.suspend().**
- **No core dependency on Web MIDI, `setSinkId()`, SAB, Tone.js or Faust.**
- **All unsupported capabilities degrade explicitly rather than causing transport failure.**

**M2 thresholds that may not honestly be frozen from accessible evidence**

- maximum acceptable scheduler p99/p99.9 lateness;
- percentage of permissible late events under heavy UI load;
- maximum individual source count;
- worklet transition event rate;
- maximum Risset layer/event density;
- MessagePort batch rate/capacity;
- cross-engine RMS/spectral tolerance;
- acceptable Bluetooth latency;
- background-tab continuation threshold.

Those require the missing DR-03 empirical results.

**Recommended Defaults**

| Parameter | Default | Valid/recommended range | Rationale | Evidence strength | User-facing? |
|---|---:|---|---|---|---:|
| Live AudioContext count | 1 reused context | 1 unless a tested exception exists | MDN recommends reuse; avoids resource ambiguity. citeturn17search3 | Strong | No |
| Context creation | Lazy, user-initiated | N/A | Autoplay/user activation behavior requires explicit start/resume handling. Tone documents the same browser requirement. citeturn15search1 | Strong | Indirectly |
| `latencyHint` | `"interactive"` request | `"interactive"`; feature/behavior measured | Matches interactive application intent; hint is not guaranteed. citeturn14search0turn17search5 | Strong semantic / variable implementation | No |
| Scheduler wake | **25 ms provisional** | benchmark ~15–30 ms | Matches Sprint-0 design; not empirically closed here | Medium-low | No |
| Initial horizon | **100 ms provisional** | benchmark/adapt approximately 75–200 ms | Tone uses 100 ms; balances ahead scheduling vs staleness. citeturn15search2 | Medium | No |
| Horizon adaptation statistic | rolling p99.9 positive wake lateness | p99–p99.99 testable | Protect against tail jitter rather than mean behavior | Recommendation | No |
| Audio quantum assumption | **None in algorithm** | use actual buffers/capabilities | Current default is 128 but Web Audio 1.1 allows render-size evolution. citeturn14search0 | Very strong | No |
| Native source pooling | Off | N/A | Sources are one-shot. citeturn11search5turn11search12 | Very strong | No |
| Asset buffer caching | On | resource-budgeted | Buffers reusable | Strong | No |
| Worklet transport | MessagePort | SAB only after benchmark | Portable standard path; SAB imposes isolation. citeturn12view3turn13search5 | Very strong | No |
| Tone backend | Disabled/reference off | opt-in supported adapter | Preserve native reference | Strong recommendation | Possibly advanced |
| Faust runtime compiler | Off | Post-MVP experimental | Precompiled WASM is sufficient for proof. citeturn13search1 | Strong | No |
| Web MIDI | Off until user connects/enables | optional | Permission-sensitive/non-Baseline. citeturn17search1 | Very strong | Yes |
| MIDI SysEx | Off | No MVP enablement | Broader permissions/security and no MVP requirement | Strong | Advanced only |
| MIDI clock sync | Off | Experimental only | Timestamp API does not prove external clock synchronization | Strong recommendation | Yes |
| Output device | System default | feature-detect selector | `setSinkId()` nonportable. citeturn17search2 | Strong | Yes |
| Offline graph mutation by suspend | Off | N/A reference backend | Support/rounding ambiguity. citeturn15search0turn12view0 | Very strong | No |
| Offline sample rate | **No universal research-supported default** | supported explicit profile | 44.1 vs 48 kHz is a product/export decision, not settled by DR-03 evidence | N/A | Yes |
| Risset individual-source cap | **No justified default yet** | benchmark-derived | Specs cannot establish CPU/event-density cap | Missing empirical evidence | Potentially |
| Worklet queue capacity | **No justified default yet** | benchmark-derived | Depends on batch/event representation and target devices | Missing empirical evidence | No |
| Global late grace | **None** | voice-specific policy | Different event semantics require different recovery | Strong recommendation | No |
| Effect tail duration | **No global default** | VoiceDefinition declares | Reverb/delay/IIR tails are effect-specific | Strong | Export UI may show |

**UX / Visualization Implications**

**Playback readiness is a hard contract.** The Play control must expose at least `ready`, `starting audio`, `running`, and `audio unavailable/interrupted` outcomes. A click that only changes a triangle to a pause icon while `AudioContext` remains suspended is misleading. Browser audio startup is user-activation sensitive. citeturn15search1

**Latency UI must decompose rather than summarize.** Inspect/Diagnostics should show:

```text
Sample rate
Context state
Reported processing/base latency
Reported output latency estimate
Scheduler wake jitter
Current scheduling horizon
Late/drop/coalesce counts
Active / peak voices
Worklet queue status
Browser/backend identifier
Output device description where available
```

Never label `baseLatency + outputLatency` as measured “ear latency.” `outputLatency` is explicitly estimated and device/platform dependent. citeturn17search0

**Explore mode:** hide most engineering telemetry by default. A compact warning is appropriate only when audio is degraded: “Playback timing degraded,” “MIDI unavailable in this browser,” or “Audio resumed after system interruption.”

**Compose mode:** edits must feel causally consistent. An edit commits project state immediately, but audible replacement begins at the scheduler's declared future generation cutover. AGL should not visually move an already-sounding onset backward in time. Undo creates another deterministic revision/cutover rather than trying to reverse already emitted sound.

**Inspect mode:** make the model observable. Display canonical beat, resolved seconds, backend generation, intended start, scheduled time, actual/observed lateness where measurable, voice ID/version, and approximation/shedding state.

**Generated vs frozen is a UX hard contract.** Both may render identically, but Inspect/Timeline must preserve whether an event remains generative or is materialized/frozen; this is already an explicit AGL timeline requirement. fileciteturn0file0 Playback optimization must never erase that distinction from provenance.

**Dense Risset degradation must be visible.** If events are aggregated, layers shed, or parameters rejected for the hardware budget, the UI must say so. A safety/performance approximation must not masquerade as the mathematically requested pattern. The precise shedding policy depends on DR-01 and AGL-063. fileciteturn0file0turn0file1

**Background/sleep recovery:** on detectable interruption, show an explicit discontinuity status and re-anchor playback. Do not visually animate the timeline as though uninterrupted sample-accurate output continued through laptop sleep.

**Web MIDI permission UX:** do not ask for MIDI permission on page load. Present an explicit “Connect MIDI” action; distinguish unsupported browser, permission denied, no device, disconnected device, and connected device. Web MIDI permission is user-agent controlled and may also be prevented by Permissions Policy. citeturn17search1

**Accessibility hard contracts:**

- timing/degradation state cannot be represented by color alone;
- every diagnostic warning has text;
- MIDI and audio capability controls remain keyboard operable;
- visual metering is not the only indication of clipping/degradation;
- animations reflecting high-rate patterns respect reduced-motion settings while audio semantics remain intact;
- Inspect mode exposes a text description of any performance adaptation relevant to the mathematical output.

These align with AGL-132/053 rather than creating a parallel accessibility system. fileciteturn0file0

**User-Facing Scientific Claims**

**Safe to state directly**

“AGL represents musical timing canonically before converting it to audio seconds.” This is an AGL architectural fact once ADR-RI03-A is accepted. fileciteturn0file0

“Web Audio events can be scheduled against the AudioContext's audio timeline rather than relying on a JavaScript timer firing at the exact audible moment.” citeturn18search1

“AudioWorklet allows custom audio processing to run in the Web Audio rendering environment and communicate with the application through message ports.” citeturn12view3

“OfflineAudioContext renders a specified audio graph into a fixed-length AudioBuffer rather than playing it in real time.” citeturn12view1

“Browser-reported output latency is an estimate and depends on platform and output hardware.” citeturn17search0

“Web MIDI access requires browser support, a secure context, and permission.” citeturn17search1

**Safe only with qualification**

**“Sample-accurate scheduling.”** Qualification: Web Audio's audio-timeline scheduling can be sample/frame precise for supported operations; this does **not** mean JavaScript callback execution or physical speaker output has zero timing error/latency. citeturn18search1

**“Deterministic rendering.”** Qualification: AGL guarantees deterministic canonical computation and RenderPlan generation; native Web Audio PCM may vary slightly across engines because implementations can differ in DSP/resampling/rounding choices. citeturn14search0

**“Low latency.”** Qualification: AGL requests/configures an interactive audio path and measures available diagnostics; actual latency is browser, OS, hardware and output-device dependent. citeturn17search0turn17search5

**“Real-time/offline equivalent.”** Qualification: they share the same semantic RenderPlan/voice definitions and should agree within defined voice/timing tolerances; this is not necessarily byte-for-byte waveform equivalence.

**“MIDI-aligned.”** Qualification: Web MIDI and Web Audio expose timestamps that can be related in software, but external device latency and clock synchronization are not automatically eliminated. citeturn18search0turn18search1

**Do not claim**

AGL should not state that **100 ms is the optimal browser scheduling horizon**. It is a credible initial configuration, not an established optimum. citeturn15search2

Do not state that `outputLatency` is measured end-to-end acoustic latency. citeturn17search0

Do not state that background-tab or laptop-sleep playback remains exact.

Do not state that native real-time and offline outputs are bit-identical across Chromium, Firefox and Safari. citeturn14search0

Do not state that Tone.js provides inherently better timing than native Web Audio. Tone itself relies on native Web Audio scheduling. citeturn15search1

Do not state that Faust is necessarily faster than a hand-written AudioWorklet; that requires workload-specific measurement.

Do not state that Web MIDI is universally supported or that MIDI clock can be trusted as AGL's canonical transport clock. citeturn17search1turn18search0

Do not state a safe Risset source/event cap until the DR-03 measurements are reconciled with DR-01's perceptual/signal design.

## Delivery and Backlog

**Implementation Recommendations**

### Must happen before MVP architecture freezes

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Freeze RenderPlan v1 semantic contract and hash/canonicalization rules | Critical | M | AGL-003/041 |
| Freeze worker/main/worklet ownership boundary | Critical | M | AGL-023/040/044 |
| Implement generation-based cancellation/cutover semantics | Critical | L | AGL-012/031/041/043/044 |
| Define VoiceDefinition capabilities: seek, late, tail, density backend | Critical | M | AGL-042 |
| Define offline semantic-equivalence and determinism levels | Critical | M | AGL-041/045/133 |
| Define runtime/project-state separation for audio capabilities | Critical | S | AGL-010 |
| Implement cross-browser benchmark result schema and attach raw DR-03 results | Critical | M | AGL-043/134 |
| Establish supported-browser capability tiers | High | S | AGL-134 |
| Make production HTTPS a deployment requirement because core AudioWorklet and optional MIDI require secure contexts | High | S | app hosting | citeturn14search0turn17search1 |
| Preserve dependency independence: Tone/Faust cannot enter canonical schemas | Critical | S | AGL-041/046/047 |

### Must happen before the affected lab ships

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Benchmark sparse→worklet density crossover | Critical for Infinite Staircase | L | DR-03 raw data + AGL-134 |
| Reconcile Risset gain normalization and event shedding | Critical | M | DR-01 + AGL-061/063 |
| Validate heavy-canvas interference against scheduler | High | M | AGL-051/052/134 |
| Test live scrubbing/generation cancellation under burst load | High | M | AGL-043/044 |
| Add visible approximation/degradation provenance | High | M | AGL-035/036/063 |
| Cross-engine offline comparison fixtures for every shipped voice | High | L | AGL-042/045 |
| Explicit browser MIDI unavailable/denied/disconnected UX where lab uses MIDI | Medium | M | AGL-048/132 |

Infinite Staircase is P0 and explicitly depends on DR-03 as well as DR-01/08, making density closure a lab shipment gate rather than generic optimization. fileciteturn0file1

### Can safely happen after MVP

| Item | Impact | Complexity | Dependency |
|---|---|---:|---|
| Tone.js instrument/effect adapter expansion | Medium | M/L | AGL-046 |
| Additional selectable output-device UX | Low/Medium | M | browser support |
| SAB worklet queue optimization | Medium | L | evidence of MessagePort bottleneck |
| Multi-backend comparative audio renderer | Medium | L | stable RenderPlan |
| Rich latency calibration tools | Medium | M | diagnostics |
| MIDI output synchronization refinement | Medium | M/L | AGL-048 |

### Research-only / experimental

| Item | Impact | Complexity | Dependency |
|---|---|---:|---|
| Runtime Faust compiler | Low MVP / possibly high future | XL | AGL-047/136 |
| Browser MIDI clock transport slave/master | Low MVP | XL | device study |
| Shared-memory sequencer | Unknown | L | measured MessagePort limit |
| Exact browser-independent DSP renderer | Potentially high future | XL | shared-core/native architecture |
| Background/sleep continuous-performance mode | Low MVP | XL | browser/OS matrix |

**Backlog Deltas**

The existing E4 seams are unusually well aligned with the resulting architecture; most changes should harden them rather than create a competing epic. fileciteturn0file0

**MODIFY — AGL-041 Audio render plan**

Rationale: current acceptance says one canonical plan drives both paths but does not define generation, identity, capabilities or determinism.

Suggested acceptance criteria:

- immutable/versioned schema;
- stable event IDs and deterministic tie order;
- generation ID;
- project/plan hash and provenance;
- voice ID/version;
- explicit late/cancellation-group semantics;
- canonical serialization fixture;
- real-time/offline consume identical plan hash.

Dependencies: AGL-003/005/040.  
Milestone: **M2**.

**MODIFY — AGL-042 Instrument voice registry**

Add `seekPolicy`, `latePolicy`, `tailPolicy`, `backendKinds`, concurrency/density capability, source lifecycle, parameter schema and deterministic voice-version identity.

Acceptance: each built-in oscillator/noise/percussion/sampler fixture declares and passes these behaviors.

Milestone: **M2**.

**MODIFY — AGL-043 Scheduler hardening**

Rationale: acceptance currently refers generically to “DR-03 thresholds.”

Acceptance should require:

```text
absolute-time scheduling
wake/horizon telemetry
adaptive-horizon implementation
late-policy handling
generation cutover
no stale onset after commit
long-run soak
heavy UI profile
recorded raw measurements
browser/hardware metadata
```

The empirical numerical gates must be populated from the actual DR-03 dataset, not this packet.

Milestone: **M2**.

**MODIFY — AGL-044 AudioWorklet bridge**

Acceptance:

- versioned MessagePort protocol;
- bounded event queue;
- event batching;
- generation prepare/commit/cancel;
- panic/flush;
- stale-generation rejection;
- queue-overflow diagnostics;
- processor error handling;
- actual quantum-length handling;
- SAB not required.

Milestone: **M2**.

**MODIFY — AGL-045 Offline WAV render**

Acceptance:

- preconstructed render graph;
- no required offline `suspend()`;
- exact output frame count;
- defined selection/cross-boundary voice semantics;
- effect-tail policy;
- canonical render manifest;
- plan hash recorded;
- cross-engine conformance metrics;
- explicit approximation records.

Milestone: **M2/M5**.

**MODIFY — AGL-046 Optional Tone.js adapter**

Acceptance:

- canonical project contains zero Tone-native timing/object types;
- Tone Transport is not authoritative;
- exact reviewed package version pinned;
- license/notices complete;
- bundle delta measured;
- reference voice contract tests pass;
- removing Tone does not require project migration.

Milestone: post-M2 / P1.

**MODIFY — AGL-047 Faust and WASM DSP proof**

Acceptance:

- precompiled DSP artifact;
- compiler absent from production runtime unless separately approved;
- same Voice/Effect contract;
- real-time Worklet and offline fixture;
- source/compiler flags/WASM hash in provenance;
- exact component license review through AGL-136.

Milestone: P1/post-M2.

**SPLIT — AGL-048 Web MIDI adapter**

Split conceptually into:

`Web MIDI note/control input and optional output` — P1 candidate;

`MIDI clock/transport synchronization` — research/experimental, post-MVP.

Input/output acceptance: capability detection, explicit permission UX, note/CC/pitch handling, timestamp diagnostics, Safari/unavailable fallback, disconnect handling.

Milestone: M3 or later, not M2-critical.

**MODIFY — AGL-049 Gain and emergency-stop safety**

Require panic across both native scheduled sources and worklet voices, including generation invalidation, queue flush, master safety envelope, teardown metrics and no indefinite ringing.

Do not conflate safety limiter behavior with Risset mathematical gain normalization.

Milestone: **M2**.

**MODIFY — AGL-031 Transport**

Add an explicit backend interruption/recovery state and transport↔audio anchor abstraction. Seek/tempo/loop edits must produce new plan generations, not mutate the audio clock.

Milestone: **M2**.

**MODIFY — AGL-012 Project command bus**

Document that audio scheduling/cancellation is a derived side effect. Undo/redo changes project state, then regenerates audio; scheduling handles never enter undo history.

Milestone: **M1**, before M2 integration.

**MODIFY — AGL-010 Project schema**

Explicitly exclude ephemeral:

```text
AudioContext state
currentTime
baseLatency/outputLatency
hardware device ID
scheduler wake state
generation ID
worklet queue occupancy
```

from canonical project persistence.

Persist intentional voice/render configuration and version/provenance references only.

Milestone: **M1**.

**MODIFY — AGL-134 Cross-browser audio harness**

Acceptance should include raw machine-readable records; exact browser build; device/sample-rate/power metadata; scheduler jitter distributions; late-event classifications; worklet queue telemetry; offline metrics; background/sleep/context-state trials; 10–30 minute soak; and reproducible fixture IDs.

Milestone: **M2**.

**ADD — Audio runtime capability and diagnostics service**

Rationale: browser feature detection/telemetry should not be scattered through Transport, MIDI and Worklet code.

Suggested acceptance:

```ts
interface AudioCapabilities {
  audioContext: boolean;
  audioWorklet: boolean;
  offlineAudio: boolean;
  outputLatency: boolean;
  outputDeviceSelection: boolean;
  webMidi: boolean;
  sharedArrayBufferFastPath: boolean;
  crossOriginIsolated: boolean;
}
```

plus runtime measurement snapshot.

Milestone: **M2**.

**ADD — Render reproducibility manifest schema**

Could live under AGL-045 rather than become a separate backlog item if capacity is constrained.

Acceptance: project/plan/backend/voice/asset hashes, browser/build, sample rate, frame count, seed and approximations round-trip.

Milestone: **M2**.

**BLOCK — Numeric scheduler acceptance gate**

Block final AGL-043 threshold signoff until raw completed DR-03 benchmark results are registered.

Milestone: **M2**.

**BLOCK — Infinite Staircase hard event-density cap**

Until DR-03 measured source/worklet capacity and DR-01 defines perceptually/mathematically acceptable normalization/shedding.

Milestone: **M2**.

**MODIFY — DR-03 research-register record**

The August 13 register still states `chartered`. Once central integration validates the actual report/harness/results, update status and evidence/artifact references. fileciteturn0file3

## Reconciliation and Risk

**Cross-Research Dependencies**

**This report concludes:** dense Risset patterns need native-node → worklet → deterministic approximation escalation.

**Must be reconciled with:** DR-01 Risset Rhythm Psychoacoustics and Infinite-Staircase Design.

**Why:** DR-03 can establish CPU/scheduling limits but cannot decide which layers/pulses may be removed or how their gains should be normalized without altering the mathematical/perceptual experiment. DR-01 specifically gates AGL-061/063/065. fileciteturn0file3

**Question the integration pass must answer:** What is the exact deterministic shedding/aggregation order, and what audible/mathematical claim remains valid after it activates?

**This report concludes:** safety limiting is a backend safety feature, not the lab's normalization law.

**Must be reconciled with:** DR-01 and DR-08.

**Why:** automatic limiting can change amplitude relationships that may themselves encode the phenomenon.

**Question:** Which signal normalization occurs mathematically before rendering, which is user mix gain, and which is emergency output protection?

**This report concludes:** RenderPlan is the canonical audio-backend boundary.

**Must be reconciled with:** shared/native/Swift architecture, if such a Wave-1 architectural report exists elsewhere.

**Why:** canonical schemas must not contain JavaScript/Web Audio-specific values that make a native client incompatible.

**Question:** Which RenderPlan and VoiceDefinition fields can be implemented identically in TypeScript, Swift and a future shared WASM core?

**This report concludes:** edits/undo produce new render generations.

**Must be reconciled with:** AGL-012 command/undo semantics and AGL-032 generated-vs-frozen content.

**Why:** audible history cannot be undone; project history can.

**Question:** What is the exact UI contract when an undo is committed while an older generation has already emitted audio?

**This report concludes:** control automation is ultimately rendered into absolute audio time.

**Must be reconciled with:** DR-08 and AGL-112 control-signal pipeline.

**Why:** those runs determine smoothing, quantization, causality and semantic mappings; DR-03 only determines transport/execution machinery.

**Question:** At what stage does a control signal become a RenderPlan automation curve versus an audio-rate worklet input?

**This report concludes:** Web MIDI is event/control I/O, not canonical transport clock.

**Must be reconciled with:** AGL-031 Transport, AGL-130 MIDI file exporter, and any future external-sync design.

**Why:** live MIDI timestamps and exported MIDI tempo/ticks are distinct domains.

**Question:** How are recorded live messages quantized/committed into exact rational project time without confusing arrival timestamp with canonical beat position?

**This report concludes:** offline determinism is semantic/metric, not universally PCM-exact.

**Must be reconciled with:** any native export/shared-DSP architecture.

**Why:** adopting common custom DSP later could permit a stronger deterministic tier than native browser nodes.

**Question:** Which voices require browser-native implementation and which should migrate into a shared deterministic DSP core?

**This report concludes:** background/sleep interruptions do not preserve the foreground timing SLA.

**Must be reconciled with:** product/UX session semantics.

**Why:** Compose may expect transport to pause, continue logically, or jump to current wall-clock phase.

**Question:** After a suspended laptop wakes, does AGL resume from the last audible beat, advance to wall-clock-derived position, or stay paused? **Recommendation: remain/re-enter interrupted-paused state unless a future external-sync mode explicitly dictates otherwise.**

**Contradictions, Weak Evidence, and Open Questions**

**The largest contradiction is procedural:** the prompt says DR-03 is complete, while the supplied research register dated August 13 says `chartered`, and the report/results themselves are not accessible here. fileciteturn0file3 This prevents verification of the acceptance criterion requiring empirical measurements. It should be treated as an evidence-registry defect, not papered over.

**Offline suspend rounding is directly contradictory.** Current MDN says the requested time rounds **down** to the nearest quantum; the Web Audio 1.1 material retrieved in this pass specifies rounding **up**. citeturn15search0turn12view0 The safest architectural answer is not to choose one: reference offline rendering must not depend on that operation.

**A 128-frame render quantum is not a safe forever-constant.** It is the current default and longstanding Web Audio behavior, but Web Audio 1.1 explicitly contains `renderSizeHint`/`renderQuantumSize` machinery. citeturn14search0turn12view2 Worklet algorithms must use actual block lengths.

**The 25/100 ms scheduler settings have weaker evidence than they may appear to.** Tone's 100 ms default proves a practical implementation uses that value, not that it is optimal for AGL; Sprint-0's 24–30 ms timer demonstrates design intent, not measured performance. citeturn15search2

**No specification can supply AGL's dense-event limit.** Maximum source count, safe event rate, MessagePort throughput, source teardown cost and UI-load interference are implementation/hardware properties. Any exact number without the benchmark dataset would be fabricated.

**Browser support does not imply performance equivalence.** AudioWorklet support across major desktop browsers says the API exists; it does not establish equal scheduling jitter, callback buffer topology or DSP capacity.

**`baseLatency` and `outputLatency` are not complete end-to-end latency measurements.** In particular, the spec warns against deriving reliable output latency simply from `currentTime - getOutputTimestamp().contextTime`, and MDN labels `outputLatency` an estimate. citeturn18search1turn17search0

**Device changes are under-specified as an AGL product experience.** `setSinkId()` is not portable enough to make explicit sink selection the baseline. citeturn17search2 The architecture needs an `audioEpoch` so context recreation/device transition cannot leave old frame calculations or scheduled handles alive.

**Bluetooth cannot be reduced to one latency budget.** Hardware, codec, OS buffering and browser path matter; the correct product behavior is measured/reportable latency and degraded-interactivity messaging, not a fixed Bluetooth constant.

**Tone's adoption cost is still incomplete.** The official repo shows an active project and a mutable dev package around v15.5.x; this pass does not contain a production bundle-size measurement or AGL tree-shaking result. citeturn15search3turn15search6 A build spike, not desk research, should close that question.

**Faust licensing cannot responsibly be represented by one badge.** The inspected Faust library source uses LGPL terms plus a generated-code exception, while AGL might consume compiler, runtime, JS/WASM glue and library code differently. citeturn13search4 AGL-136 should inventory exact artifacts.

**“Realtime/offline equivalence” remains ambiguous unless defined at several levels.** Plan equality, sample timing, DSP parameter trajectory, waveform feature similarity and bit identity are different assertions. ADR-RI03-G resolves that ambiguity.

**No evidence here justifies one global late-event strategy.** Dropping a late percussion hit, catching up a sample at offset, applying a note-off immediately and coalescing a high-rate mathematical pulse represent different semantics. The voice must participate.

**No evidence here establishes worklet/SAB crossover density.** SAB should therefore not be architecture-mandatory.

**No evidence here supports MIDI clock synchronization for MVP.** The APIs expose timestamps, but external clocks/devices add an unsolved synchronization/control problem. citeturn18search0

**Open product question:** when a browser/system interruption occurs, whether logical transport advances during silence is not answered by Web Audio research. This packet recommends `interrupted-paused`, but product/transport semantics must ratify it.

**Open DSP question:** which native nodes are acceptable in a “deterministic” offline voice if their cross-engine algorithms differ? The voice registry needs determinism classifications such as `semantic`, `metric`, `shared-dsp`.

**Research Follow-Ups**

| Question | Why current evidence is insufficient | Decision blocked | Best method | Priority |
|---|---|---|---|---|
| What are actual wake-jitter/late-event distributions for 25 ms/100 ms and adaptive variants across the declared browser/hardware matrix? | Raw DR-03 measurements are absent | AGL-043 numeric gate | Recover/run versioned harness on exact target machines | **Critical** |
| At what event/voice density should native sources transition to a worklet voice? | Specs provide no performance threshold | Infinite Staircase hard cap | Sweep density/concurrency under all eight profiles; identify knee and headroom | **Critical** |
| What Risset aggregation/shedding operation preserves accepted lab behavior? | Audio performance alone cannot answer psychoacoustic semantics | AGL-060/063 ship | Joint DR-01 + DR-03 controlled render/listening comparison | **Critical** |
| What cross-engine numeric/audio tolerances distinguish harmless implementation variance from regressions for each built-in voice? | Universal PCM equality is invalid, but useful metric thresholds are not yet calibrated | Offline conformance gate | Render fixed corpus in current Chromium/Firefox/Safari; derive fixture-specific distributions | **High** |
| What is the reliable recovery sequence after context suspension, laptop sleep and output-device transition on supported targets? | Host/browser behavior is empirical | support policy + Transport interruption UX | scripted/manual fault-injection matrix | **High** |
| Does MessagePort batching remain below budget at the Risset validated maximum? | Throughput depends on message shape/event rate | whether SAB is needed | A/B benchmark MessagePort batch sizes; only then test SAB | **Medium** |
| If MIDI output is promised, what is actual audio↔external-MIDI alignment with representative devices? | API clock mapping does not include device latency | quality claim for MIDI output | hardware loopback or audio/MIDI timestamp capture | **Medium** |
| Does Tone materially reduce implementation cost without unacceptable bundle/semantic cost for selected voices? | Documentation cannot measure AGL integration | AGL-046 adoption | implement one adapter, measure bundle and contract-test it | **Low/Medium** |
| Does Faust provide maintainability/performance benefit for an actual target DSP? | Language/tool capabilities don't prove AGL benefit | AGL-047 adoption | one precompiled real DSP implementation against handwritten Worklet | **Low/Medium** |

No additional research is required merely to decide that native Web Audio remains the reference or that canonical rational time stays dependency-independent; those are already sufficiently supported.

**Integration Checklist**

- [ ] Architecture specification: add Worker/Main/AudioWorklet responsibility boundary.
- [ ] Architecture specification: add foreground timing SLA and interruption semantics.
- [ ] ADR set: accept/reconcile ADR-RI03-A through ADR-RI03-L.
- [ ] Project schema: distinguish persistent render intent from ephemeral audio-runtime capability.
- [ ] RenderPlan contract: versioning, generation IDs, provenance, hashes, late/cancellation semantics.
- [ ] Voice registry: seek/late/tail/density/determinism capabilities.
- [ ] Scheduler specification: absolute-time algorithm, adaptive horizon, generation cutover.
- [ ] Worklet protocol: bounded batched MessagePort contract and diagnostics.
- [ ] Offline-render specification: frame-length rule, tail policy, deterministic manifest.
- [ ] Test suite: unit/property/metamorphic tests above.
- [ ] Golden fixtures: constant-tempo thirds, tempo step, generation cutover, late-event and MIDI clock-map fixtures.
- [ ] Cross-browser harness: machine-readable raw artifact and exact environment capture.
- [ ] Diagnostics specification: separate scheduling, processing and reported output latency.
- [ ] UX specification: audio readiness, interruption, MIDI permission and degradation states.
- [ ] Accessibility specification: textual/non-color performance/degradation diagnostics.
- [ ] Dependency policy: Tone adapter-only; Faust precompiled proof-only.
- [ ] License review: exact Tone/Faust/runtime artifacts.
- [ ] Infinite Staircase specification: benchmark-derived density cap and DR-01-approved shedding semantics.
- [ ] Research evidence registry: update DR-03 from `chartered` after report/results are attached and validated.
- [ ] Backlog: apply AGL-010/012/031/041–049/134 deltas.
- [ ] M2 exit criteria: distinguish semantic hard gates from empirically populated performance gates.
- [ ] Future Swift/native conformance suite: consume the same canonical RenderPlan fixtures if/when that architecture enters scope.

# Integration Payload

**DR-03 integration state:** accept architecture-level conclusions; **do not freeze empirical latency/event-density thresholds yet** because the accessible conversation contains the DR-03 charter and AGL context files but not completed report body/raw benchmark results/harness source. Research register dated 2026-08-13 still says DR-03 `chartered`; prompt says completed, creating an evidence-registry mismatch that central Wave-1 integration must resolve. DR-03 is an immediate blocker unblocking AGL-043/044/046/047/048/134. fileciteturn0file3 M2 exits on “scheduler benchmark accepted” and “offline/real-time plan agreement.” fileciteturn0file2

**Core architecture:** canonical project + exact rational musical time → typed operator graph → dedicated Worker evaluates bounded interval and converts rational beat positions to immutable floating-point seconds → versioned/hashable RenderPlan → separate real-time/offline adapters. AGL already has AGL-002 exact rational time, AGL-003 canonical events, AGL-023 worker evaluator, AGL-040 native backend and AGL-041 common RenderPlan. fileciteturn0file0 Web Audio schedules against `BaseAudioContext.currentTime`; `AudioContext`/`OfflineAudioContext`/`AudioWorkletNode` are Window-exposed, while AudioWorkletProcessor is the rendering-thread extension. citeturn18search1turn14search0turn12view3 Therefore: Worker does graph/evaluation/plan prep; main thread does user activation/AudioContext/native node creation/scheduling/control bridge; AudioWorklet does bounded custom DSP/high-density voice dispatch only. No project graph, React, undo, canonical tempo semantics or unbounded parsing/allocation in Worklet.

**Canonical-time invariant:** scheduler timers never define musical time. Event time is absolute: for constant tempo \(T\), \(s=s_0+60(b-b_0)/T\); piecewise tempo sums each segment. Loop iteration \(k\) computes canonical absolute beat \(b_k=b_0+kL+\delta\) then converts once to seconds; forbidden: repeated float `nextTime += period`. Same project/operator versions/seed/assets/tempo/range → exact same canonical RenderPlan hash.

**RenderPlan v1 minimum:** `schemaVersion`, `planId/hash`, `generationId`, `projectRevisionId/hash`, `transportMapRevision`, range, stable `eventId`, provenance/source ref, `voiceId/version`, `startSeconds`, optional duration/source offset, immutable parameters/automation, cancellation group, `latePolicy`, approximations. No Tone objects, AudioNodes, browser device IDs or runtime latency in canonical plan/project.

**Real-time scheduler:** absolute-time look-ahead. Wake at interval \(W\); read `ctx.currentTime=n`; schedule all unscheduled events `<n+H`. Initial **provisional** benchmark config `W=25 ms`, `H=100 ms`; 25 ms reflects Sprint-0's 24–30 ms timer and 100 ms matches Tone's documented default look-ahead, but neither is a DR-03 empirical optimum. citeturn15search2 Candidate adaptive rule \(H=clamp(75ms,200ms,max(3W,J_{99.9}+W+2Q))\); bounds remain provisional pending raw measurements. Scheduler diagnostics must expose W/H/wake jitter p50/p95/p99/p99.9/max, queue depth, scheduled/late/dropped/coalesced/cancelled/stale-suppressed counts.

**Web Audio timing facts:** current spec default render quantum 128 frames, but Web Audio 1.1 permits render-size evolution and exposes render quantum information; Worklet code must process actual block length rather than permanently hard-code 128. citeturn12view2turn14search0 At 48 kHz, 128 frames = 2.6666667 ms; at 44.1 kHz = 2.9024943 ms. Context sample rate is one backend capability value; canonical projects persist seconds/beats, not context frame indices. citeturn12view1 Custom Worklet target frame `f=round(t*Fs)` with one explicit tie rule yields max timing discretization \(0.5/F_s\): 10.4167 µs @48k, 11.3379 µs @44.1k.

**Cancellation/edit semantics:** every project/render revision creates monotonic generation G. New generation is prepared then atomically committed at future switch time/frame T. For old G, no new onset with target `>=T` may produce output. Native future source handles stop/cancel where APIs permit; Worklet discards stale generation entries; already-emitted samples cannot be undone. AudioParam `cancelAndHoldAtTime` is non-Baseline, so core semantics cannot require it. citeturn15search5 Tail policy per voice: allow-tail/release/mute/reinstantiate. Undo/redo acts on project state then generates another render generation; audio scheduling handles are derived effects and never command-history state.

**Late events:** no universal grace threshold. Compute lateness \(L=now-intended\). Each VoiceDefinition/event declares deterministic policy: `drop` for missed impulse where burst catch-up is wrong; `start-at-offset` for seekable continuing source; `immediate-state` for note-off/safety/state correction; `coalesce` for explicitly aggregatable dense pulses; `voice-defined` otherwise. Late behavior must be diagnosed/provenanced if it changes output.

**Voice lifecycle:** never pool one-shot native `AudioBufferSourceNode`/`OscillatorNode` instances; cache/reuse AudioBuffers/assets, immutable waveform resources, long-lived buses/effects and safely resettable wrappers. AudioBuffer source instances are one-shot while buffers are reusable. citeturn11search5turn11search12 Density architecture: sparse/moderate = individual native nodes; dense/high-concurrency = persistent AudioWorklet/poly voice; beyond validated cap = deterministic lab-defined aggregation/shedding/rejection with visible approximation provenance. **No numeric crossover/cap can be inferred from spec; requires DR-03 raw benchmark.** Risset shedding/gain semantics also require DR-01, because DR-03 performance results cannot determine perceptually/mathematically legitimate removal/normalization. Infinite Staircase is P0 and references DR-01/03/08. fileciteturn0file1

**AudioWorklet protocol:** MessagePort baseline because it is standard node↔processor channel. citeturn12view3 Versioned envelopes with `protocolVersion,audioEpoch,generationId,sequence,type,payload`; messages `configure,event-batch,prepare-generation,commit-generation,cancel-generation,parameter-batch,flush,panic,stats-request`; responses `ready,ack,stats,queue-overflow,protocol-error,processor-error`. Events batched using compact transferable/typed representations at density. Worklet queues/preallocated voice pools bounded; unknown protocol fails closed; overflow observable; stale generation cannot trigger; no unbounded allocation in `process()`. SharedArrayBuffer is **not baseline**; SAB cross-context use carries cross-origin-isolation requirements, so enable only if MessagePort measurements show a material bottleneck. citeturn13search5

**Offline:** same semantic RenderPlan and VoiceDefinitions. Fully construct graph/automation before `startRendering`; do **not** rely on OfflineAudioContext.suspend. MDN currently says suspend time rounds down and marks API limited availability, while retrieved Web Audio 1.1 text says rounded up—an actionable standards/documentation contradiction. citeturn15search0turn12view0 Requested `[a,b)` with tail τ and sample rate Fs uses `frames=ceil((b-a+τ)*Fs)`. 1 s @48k = 48,000 frames; 2.5 s @48k = 120,000. Selection-start crossing voices reuse seek semantics. Export manifest: project hash/revision, RenderPlan hash/schema, seed, requested range/tail, sample rate/channels/frame count, backend/version/browser build, voice versions, asset hashes, approximation records.

**Determinism policy:** D0 project/evaluation exact; D1 RenderPlan canonical bytes/hash exact; D2 target-time/frame mapping exact under declared sample-rate mapping; D3 audio uses fixture-specific numeric/signal tolerances. Do **not** promise cross-browser PCM hash equality because Web Audio allows observable differences from DSP architecture/resampling/rounding. citeturn14search0 Cross-engine tests compare onset/duration/peak/RMS/spectral or voice-specific metrics. Exact tolerance thresholds must be calibrated on the actual corpus; not available from the missing DR-03 measurements.

**Latency/diagnostics:** `baseLatency`/`outputLatency` are runtime diagnostics, not project semantics. `outputLatency` is explicitly an estimate that varies with platform/hardware. citeturn17search0 Do not label it true end-to-end/ear latency; do not infer output latency from `currentTime - getOutputTimestamp.contextTime`, which the spec warns is unreliable for that purpose. citeturn18search1 Expose sample rate, context state, reported base/output latency, scheduler jitter/horizon, late/drop/coalesce counters, active/peak voices, native source creation/teardown, Worklet queue occupancy/overflow, generation/stale suppressions, backend/browser build. No browser-portable standard underrun counter should be assumed.

**Browser policy:** core requires current desktop Chromium/Firefox/Safari on macOS and Chromium/Firefox Windows where tested; exact builds recorded per benchmark. Capability detection overrides browser-name assumptions. Production deployment HTTPS because AudioWorklet custom processor path is secure-context constrained and Web MIDI requires secure context. citeturn14search0turn17search1 `setSinkId()` remains limited/experimental and cannot be a core output-routing contract. citeturn17search2 Foreground running-context configuration receives timing SLA; background tab, system sleep and browser/OS interruption trigger explicit `interrupted` application state, generation invalidation/re-anchor and user-visible recovery rather than a claim of uninterrupted exact timing.

**Tone.js:** optional adapter only, P1 as current AGL-046 already states. Tone provides Transport, synths, effects, sampler/time abstractions and uses native Web Audio; its own docs explicitly pass AudioContext event time into JavaScript callbacks and use 0.1 s lookAhead. citeturn15search1turn15search2 Never let Tone Transport/time expressions become canonical project semantics. May implement selected VoiceFactory/effect/loading services after native reference conformance. Current inspected `dev` package was 15.5.33 and repo active; pin exact reviewed production version rather than mutable branch. citeturn15search3turn15search6 Bundle delta still needs an implementation measurement; license review via AGL-136.

**Faust/WASM:** defer to AGL-047 proof. FaustWasm supports WebAudio/AudioWorklet and offline processors and supports precompiled WASM, avoiding runtime compiler inclusion. citeturn13search1 MVP posture: build-time precompiled DSP only, behind same Voice/Effect contract, no canonical semantics, record compiler/options/WASM hash. License review must enumerate consumed compiler/runtime/library components; inspected Faust library material is LGPL-2.1-or-later-style with explicit generated-code exception, not justification to label every Faust artifact identically. citeturn13search4

**Web MIDI:** optional feature. Web MIDI is Limited Availability, secure-context/permission/Permissions-Policy gated. citeturn17search1 Scope: note on/off, CC, pitch bend, optional timestamped output; SysEx off; no MIDI clock transport authority for MVP. MIDI event/output timestamp is `DOMHighResTimeStamp`; output timestamps use navigation/performance-time origin. citeturn18search0 Map timestamp coordinates using paired `getOutputTimestamp`: \(c_m≈c_0+(p_m-p_0)/1000\). This is clock-coordinate mapping, **not external-device latency compensation or proof of clock synchronization**. For target audio context time c, inverse mapping can derive best-effort performance timestamp for MIDI output using spec's `getOutputTimestamp()` relation. citeturn18search1 AGL-130 MIDI-file export remains independent from live Web MIDI.

**Hard M2 functional thresholds now:** zero stale future onset after committed generation switch; bounded Worklet queue/no unbounded growth; exact RenderPlan hashes for equivalent semantic input; exact offline frame count; exact plan event ordering/identity; finite PCM in fixtures; no reference dependency on OfflineAudioContext.suspend/SAB/Tone/Faust/Web MIDI/setSinkId; explicit graceful capability degradation. **Empirical M2 thresholds still unresolved:** wake-jitter p99/p99.9, acceptable late-event rate, source count, Risset event density, worklet crossover, MessagePort capacity, cross-engine audio-metric tolerances, Bluetooth/background behavior. Raw DR-03 artifact is required before those become architecture facts.

**Core golden fixtures:** constant 120 BPM thirds `beats=[0,1/3,2/3,1] → seconds=[0,1/6,1/3,1/2] → frames@48k=[0,8000,16000,24000]`; tempo-step `120 BPM [0,4), 60 BPM thereafter → beat3=1.5s, beat4=2s, beat5=3s`; 3-beat loop @120 BPM iteration-1000 boundary =1500 s by absolute evaluation; generation-cutover fixture suppresses all old-G onsets after T; late-seekable sample catches up by source offset; late impulse drops; offline 2.5s@48k=120000 frames; MIDI mapping fixture `(contextTime=10s,performanceTime=50000ms,event=50012.5ms)→10.0125s`.

**ADR candidates:** RI03-A RenderPlan backend boundary; B Worker/Main/Worklet split; C absolute-time adaptive look-ahead scheduler; D generation cancellation; E MessagePort baseline/SAB optional; F disposable native sources; G semantic-not-PCM determinism; H preconstructed offline graph/no suspend; I Tone replaceable adapter; J precompiled Faust proof; K optional Web MIDI note/control; L foreground timing SLA/interruption recovery.

**Backlog changes:** MODIFY AGL-010 to exclude runtime audio capability state from project; MODIFY AGL-012 to define scheduling as derived effect; MODIFY AGL-031 interruption/audio-anchor/generation semantics; MODIFY AGL-041 detailed RenderPlan; MODIFY AGL-042 voice capabilities; MODIFY AGL-043 scheduler algorithm+raw numeric gates; MODIFY AGL-044 protocol/bounded queue; MODIFY AGL-045 manifest/determinism/no offline suspend; MODIFY AGL-046 strict Tone boundary/pin/bundle test; MODIFY AGL-047 precompiled Faust/license proof; SPLIT AGL-048 basic MIDI I/O vs post-MVP clock sync; MODIFY AGL-049 native+worklet panic; MODIFY AGL-134 full reproducible raw browser harness; ADD runtime AudioCapabilities/diagnostics service; ADD or fold in render reproducibility manifest; BLOCK numeric AGL-043 acceptance and Infinite Staircase hard density cap until DR-03 benchmark artifacts + DR-01 reconciliation; MODIFY research registry status/evidence once complete artifacts are accepted. Existing E4 structure supports these changes. fileciteturn0file0

**Cross-run reconciliation:** DR-01 owns Risset perceptual/default/shedding/normalization legitimacy; DR-08 owns general sonification/control mapping/explainability; AGL-012/032 own undo/generated-vs-frozen semantics; future shared/native/Swift architecture must ratify RenderPlan/VoiceDefinition portability; Web MIDI timing must stay distinct from MIDI-file export; DR-10 may build later on DR-03 but is post-MVP. Research register encodes DR-03 as prerequisite for DR-10 and multiple E4 items. fileciteturn0file3

**Highest-priority unresolved evidence:** recover completed DR-03 harness source/raw results; calibrate scheduler W/H/adaptive thresholds on exact supported machines; measure native-node→worklet density crossover; reconcile Risset degradation with DR-01; calibrate cross-engine fixture-specific audio tolerances; run interruption/device/sleep matrix. Do not substitute documentation for any of these empirical gates.

#WebAudio #AudioWorklet #RealtimeAudio #OfflineRendering #DeterministicSystems #WebMIDI #ToneJS #Faust #DSP #AuralGeometryLab #Architecture #DR03

**Rough conversation token estimate:** ~145k tokens including research/tool material and this integration packet.