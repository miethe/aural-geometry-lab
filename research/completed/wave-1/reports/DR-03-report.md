# Browser Audio Scheduling, Latency, and Rendering Architecture

**2026-08-18**  
**Research charter:** DR-03, chartered 2026-08-13  
**Program:** Aural Geometry Lab  
**Decision status:** Architecture recommended; empirical M2 hardware/browser gate remains open

## Executive decision and program impact

**TL;DR**

Aural Geometry Lab should keep **native Web Audio as the reference backend**, preserve rational beat time entirely above the audio layer, and feed every backend the same immutable, seconds-based `RenderPlan`. Native scheduled nodes are the default for ordinary note densities; an **AudioWorklet event/voice engine is the escape hatch for dense Risset material, custom DSP, and timing that must survive main-thread stalls**. Graph compilation and render-plan generation belong in a `DedicatedWorker`; `AudioContext` lifecycle and native node scheduling remain on the main/control thread. This follows the Web Audio control/render-thread split rather than trying to make JavaScript timers themselves real-time. citeturn0search1turn2search0turn21search15

The scheduler should start at **25 ms wake / 100 ms look-ahead**, then adapt the horizon from measured wake jitter up to a **250 ms ceiling**. The 25/100 pattern is a long-established Web Audio look-ahead design, but those numbers are engineering starting points, not browser guarantees. citeturn3search9

Cancellation should be **generation-based**. Every committed plan revision gets a generation ID. Native generations have their own gain bus plus retained references to future one-shot sources; worklet queues reject obsolete generations. This gives explicit semantics for edits, seeks, loops, emergency stop, and already-scheduled events without pretending that a scheduled `start()` can be “unscheduled” generically. `AudioBufferSourceNode` instances are one-shot, while their `AudioBuffer`s are reusable; scheduled sources can be stopped, including before their scheduled start. citeturn2search1turn2search4

For offline rendering, use the **same plan and voice semantic contract**. `OfflineAudioContext` should be the reference/conformance backend, but there is an important architecture gap: the standard API does not provide a portable abortable `startRendering()` operation, and checkpoint-style offline `suspend()` is still not Baseline across browsers. Therefore a requirement for *true compute cancellation plus reliable progress* cannot honestly be satisfied by `OfflineAudioContext` alone. citeturn13search0turn13search13

Tone.js should remain an **optional voice/service adapter, never the canonical transport or time model**. Faust/WASM should be introduced only for AGL-owned advanced DSP or dense synth engines, preferably as **build-time-precompiled WASM**, not by shipping the Faust compiler to every client. Tone's current development package identifies itself as MIT-licensed and depends on `standardized-audio-context`; FaustWasm explicitly supports AudioWorklet, Web Audio nodes, precompiled modules, and offline processing. citeturn18search5turn19view0turn18search0

Web MIDI should be **optional note/control I/O only for MVP**: note on/off, CC, sustain, pitch bend as needed, and timestamped output. Do not implement MIDI Clock synchronization, SysEx, MTC, or claim DAW-grade external synchronization. Web MIDI is secure-context-only and remains non-Baseline; Safari's WebKit master implementation bug is still open in the evidence reviewed. citeturn0search0turn22search5turn23search0

This is directly aligned with the program dependency structure. DR-03 is recorded as an immediate blocker for AGL-043, AGL-044, AGL-046, AGL-047, AGL-048, and AGL-134. fileciteturn0file3 The backlog already has the native reference backend started, the render plan and voice registry ready, scheduler hardening research-gated, and the AudioWorklet/offline/Tone/Faust/MIDI tasks downstream of this decision. fileciteturn0file0 M2 explicitly requires an accepted scheduler benchmark and offline/real-time plan agreement. fileciteturn0file2 The Infinite Staircase is P0 and explicitly references DR-03, so the dense-event strategy is not an optional optimization. fileciteturn0file1

**Critical evidence boundary:** I can design and source-check the architecture and have produced a runnable benchmark harness, but this execution environment does **not** expose physical macOS/Windows machines running Safari/Chrome/Firefox with controllable audio devices or acoustic loopback. I therefore do **not** invent “empirical” latency numbers. The raw cross-browser timing-result deliverable remains pending execution of the supplied harness on the required machines. The architecture below is deliberately parameterized so those measurements tune thresholds rather than force an architectural rewrite.

## Platform capability and browser matrix

Web Audio's strongest timing guarantee is not that JavaScript timers fire accurately; it is that audio rendering is performed separately from the control/UI path and that audio operations can be scheduled against the audio context's time coordinate. Web Audio 1.0 defines the conventional render quantum as 128 sample frames. The Web Audio 1.1 draft introduces more flexible render-quantum concepts, so worklet code should always use the actual buffer length presented to `process()` rather than hard-code 128. citeturn0search1turn2search0

At 48 kHz, 128 frames are approximately **2.667 ms**; at 44.1 kHz, approximately **2.902 ms**. Those are graph-render block durations, not end-to-end audible latency. `baseLatency` describes latency from the graph destination into the host audio subsystem, while `outputLatency` estimates the path from the browser/host output buffering toward the actual output device; the latter varies with platform and hardware. `latencyHint` is a request and may be ignored. citeturn21search4turn21search2

`outputLatency` reached MDN's cross-browser Baseline in 2025, so it is useful telemetry on current releases, but it remains an estimate rather than a measured acoustic round-trip. AGL should expose the two latency values independently and may show their sum as a clearly labeled **reported output-path estimate**, never as “measured latency.” citeturn21search2turn21search4

The current release evidence on 2026-08-18 identifies Chrome 151 as the stable desktop line following its July 29 promotion, and Safari 26.6 as Apple's July 27 current Safari release. Mozilla's developer index retrieved during this research still labels Firefox 153 “Stable” and Firefox 154 “Beta” even though 154's documented ship date is August 18; therefore the benchmark should record the **actual installed Firefox build** rather than encode an assumption that the release-channel transition has completed everywhere. citeturn16search6turn17search5turn17search0turn15search17

| Capability | Chromium desktop | Firefox desktop | Safari macOS | AGL policy |
|---|---|---|---|---|
| Core Web Audio | Required/Tier A | Required/Tier A | Required/Tier A | Reference backend |
| `AudioWorklet` | Required/Tier A | Required/Tier A | Required/Tier A | HTTPS/secure-context production deployment |
| `OfflineAudioContext` | Required/Tier A | Required/Tier A | Required/Tier A | Reference offline backend |
| `baseLatency` | Required telemetry | Required telemetry | Required telemetry | Record every run |
| `outputLatency` | Current-browser telemetry | Current-browser telemetry | Current-browser telemetry | Feature-detect; record when present |
| Offline suspend checkpoints | Do not depend on | Do not depend on | Do not depend on | Non-portable optimization only |
| Output-device selection | Feature-detect | Feature-detect | Feature-detect | Not Tier-A requirement |
| Web MIDI | Optional supported path | Optional supported path | Treat as unavailable | Never block core product |
| Shared-memory queue | Optional with isolation | Optional with isolation | Optional with isolation | Not MVP prerequisite |

AudioWorklet itself is broadly available on current browsers, but defining custom processors depends on `BaseAudioContext.audioWorklet`, which is secure-context gated. citeturn21search15 `AudioContext.setSinkId()` is also secure-context-sensitive and remains a feature that should be detected rather than assumed; output-device selection is therefore convenience functionality, not an audio-engine prerequisite. citeturn1search1turn13search8

Web MIDI is a different support tier. The API is secure-context-only and still marked Limited Availability. The specification makes MIDI a powerful feature with permission controls, and Chrome has required explicit MIDI permission for ordinary MIDI as well as SysEx since Chrome 124. WebKit's master Web MIDI implementation issue remains `NEW`, with the latest visible request in 2025, so Safari 26.6 should be considered **MIDI-unavailable** for AGL's supported matrix unless an empirical feature probe proves otherwise. citeturn0search0turn4search12turn22search5turn23search0

Autoplay must be handled as an application state, not a browser quirk. Chrome can leave a context created before user activation suspended; Firefox defaults to blocking autoplay media with sound; Safari exposes user/site autoplay policy controls. AGL therefore needs one explicit **Enable Audio** interaction that creates or resumes the production context and verifies `state === "running"` before the transport is considered armed. citeturn0search7turn21search0turn1search0

`AudioContext.state` must be treated as more than `running/suspended/closed`: current documentation also describes `interrupted`, caused by events outside the application's control, with the exact interruption behavior varying by browser. This should feed the transport state machine rather than being silently retried forever. citeturn13search6

**Sample-rate and device changes require a fixed-context interpretation.** If no sample rate is requested, a newly created context uses the default output device's rate. When its sample rate differs from the selected output device, the specification requires resampling; it also warns that resampling can materially affect latency. The context's `sampleRate` is therefore an invariant for that context, not something AGL should expect to mutate when a user changes headphones or interfaces. citeturn13search12

That leads to these operational rules:

| Condition | Required behavior |
|---|---|
| Output device changes | Refresh sink/device diagnostics, `baseLatency`/`outputLatency`, and report the change; do not rewrite plan seconds |
| Device rate differs | Let browser resample; optionally offer “restart audio engine at device rate” as an explicit action |
| Bluetooth selected | Display measured/reported latency as degraded if appropriate; never promise low-latency performance |
| Tab backgrounded | Continue only from already queued audio; assume control-thread wakeups can become unreliable |
| Laptop sleeps | Treat wake as a transport discontinuity; do not emit a catch-up burst |
| Context `interrupted`/`suspended` | Pause logical transport, invalidate pending generation, re-prime after successful resume |
| Heavy system load | Grow scheduler horizon within bounds, prefer worklet queues, then shed/reject workload rather than silently play late |

Shared memory should not be the default worklet protocol. Browsers restrict practical `SharedArrayBuffer` use to cross-origin-isolated documents; common deployment requires COOP `same-origin` plus COEP `require-corp` or `credentialless`, and that changes how third-party resources, popups, and embeds behave. Batched transferable `ArrayBuffer`s over `MessagePort` should be the baseline; add SAB only if benchmarking demonstrates that message batching is itself the limiting factor. citeturn13search2turn13search9turn13search20

## Reference runtime architecture and scheduler

The target architecture is:

```text
Canonical project / rational beat domain
                |
                v
      Graph compiler + evaluator
          DedicatedWorker
                |
       immutable RenderPlan
        times = seconds only
                |
                v
+---------------- Main / control thread ----------------+
| AudioContext lifecycle / autoplay / devices          |
| transport-to-context epoch mapping                    |
| native node graph creation                            |
| look-ahead scheduler                                  |
| generation buses / cancellation                       |
| MIDI permission + lightweight event adapter           |
+--------------------+-------------------+--------------+
                     |                   |
           native scheduled nodes        | batched events
                     |                   v
                     |        +------------------------+
                     |        | AudioWorkletProcessor  |
                     |        | dense voices / DSP     |
                     |        | generation event queue |
                     |        | metering / safety      |
                     |        +------------------------+
                     |                   |
                     +-------- mixer ----+
                                 |
                           destination

Same RenderPlan
      |
      +--> OfflineAudioContext reference backend
      |
      +--> optional AGL block/WASM deterministic backend
```

This split mirrors Web Audio's control-thread/render-thread design. An AudioWorklet processor executes synchronously with audio rendering, while its `MessagePort` is the asynchronous control channel. Therefore the processor should contain only bounded audio/control work; project graph traversal, React state, JSON parsing, provenance generation, layout, canvas work, and arbitrary allocation do not belong there. citeturn2search0turn21search15

The existing AGL worker-evaluator direction is exactly right: AGL-023 already specifies cancellation, progress, deadlines, and structured errors for worker evaluation. fileciteturn0file0 Graph evaluation, mathematical pattern expansion, tempo-map application, event-budget calculation, Risset rate prediction, sample manifest preparation, and construction of future render-plan chunks should happen there. The main thread should receive immutable, already-bounded plan data and perform only the Web Audio control calls that require the context/graph.

**Do not move the native scheduler to a Worker and call that solved.** A worker may wake more independently than a busy UI event loop, but it cannot make a blocked main thread execute native Web Audio control operations. A worker-posted message still has to be processed by the main thread before native nodes are created/scheduled. The real solution to severe main-thread interference is to schedule sufficiently early or put the event interpretation/voice generation behind an AudioWorklet boundary.

The recommended scheduler starts with:

```text
wake interval W       = 25 ms
minimum horizon       = 100 ms
maximum horizon       = 250 ms
render quantum Q      = actual process block length / sampleRate

observedGapP99        = p99(actual scheduler wake-to-wake interval), rolling 10 s

horizon =
  clamp(
    100 ms,
    250 ms,
    max(
      4 * W,
      observedGapP99 + 2 * Q + 10 ms
    )
  )
```

A 25 ms timer and roughly 100 ms look-ahead are the canonical published Web Audio scheduler example because the inaccurate JavaScript clock is used only to *feed* events into the accurate audio clock; the exact constants are not standardized. citeturn3search9 AGL's adaptation adds a measured safety margin rather than assuming the 25 ms wake is punctual.

The scheduler cursor is monotonically advancing in **AudioContext seconds**, not beats:

```ts
while (nextEvent.timeSec < audioContext.currentTime + horizonSec) {
  backend.schedule(nextEvent);
  nextEvent = plan.next();
}
```

The beat-to-seconds conversion is complete before this boundary. That preserves the program's exact rational-time invariant and makes native, Tone, worklet, MIDI-output, and offline adapters replaceable.

For ordinary events, use native scheduled Web Audio whenever possible. Starting an `AudioBufferSourceNode`, `OscillatorNode`, or automation at a future audio time allows the rendering system—not a `setTimeout()` callback at onset—to determine when audio actually begins. One-shot buffer sources should be constructed per playback while decoded `AudioBuffer`s are cached and reused. citeturn2search1

The adaptive scheduler should monitor four independent failure signals:

| Signal | Meaning | Adaptation |
|---|---|---|
| Wake gap approaches horizon | Main/control thread losing scheduling margin | Increase horizon |
| Main long task | UI/GPU/JS contention | Increase horizon; warn benchmark |
| Projected source-start rate high | Native-node churn risk | Route voice to worklet |
| Worklet queue lead falls below two quanta | Rendering queue starvation risk | Push larger batches / reduce control traffic |

The worklet should receive **batches**, not one `postMessage()` per note. Recommended normal queue lead is **100–250 ms**, matching the scheduler's bounded horizon. Message handling copies or parses batches into a preallocated local event ring; no JSON, dynamic object graph, promise, network, DOM, graph evaluation, or console logging occurs from the audio loop.

For live edits, the important distinction is **scheduling horizon versus audible commit horizon**. AGL can safely schedule native events 100–250 ms ahead while still making an edit audible in, for example, 40–100 ms: old sources live under an old generation gain bus and become inaudible at the commit frame even if their individual nodes were already created.

Recommended transport semantics:

| Operation | Semantic rule |
|---|---|
| Parameter edit | New plan generation; commit at a near-future effective audio time |
| Tempo-map edit | Re-render future seconds from the worker; generation switch |
| Seek | Invalidate all future events; fade old generation; re-prime cursor at destination |
| Loop boundary | Schedule each loop iteration as ordinary absolute-time events; iteration participates in stable event ID |
| Loop edit | New generation beginning at chosen commit boundary |
| Stop | Ramp master/generation gain down, clear worklet queues, stop retained native sources |
| Resume after interruption | Never catch up elapsed events; rebase transport epoch and prime a new generation |
| Emergency stop | Master gain to silence immediately or over the shortest click-safe ramp; clear every generation |

The recommended default for sleep/wake and long background interruptions is **pause-on-interruption**, not wall-clock continuation. A mathematical sequencer that suddenly emits every missed note is technically “catching up” but musically and operationally wrong.

Late events need explicit type-specific semantics:

| Event class | Proposed late policy |
|---|---|
| Rhythmic trigger/note-on, ≤10 ms late | Schedule immediately; record lateness |
| Strict rhythmic trigger, >10 ms late | Drop; never silently shift rhythm |
| Sustained sample that supports seek offset | Start immediately at corresponding sample offset |
| Note-off / safety release | Execute immediately |
| Continuous control | Coalesce to newest value, discard superseded late updates |
| Transport/edit generation | Never replay stale operation; latest generation wins |

The 10 ms value is a **provisional product threshold**, not a browser capability claim. DR-03's empirical run should tune it, but the policy distinction must exist before benchmarking.

## Contracts, cancellation, voices, and density budgets

The core contract should make backend replacement obvious:

```ts
type Seconds = number;
type GenerationId = number;

interface RenderPlan {
  readonly schema: "agl.audio.render-plan";
  readonly schemaVersion: 1;

  readonly planId: string;
  readonly generation: GenerationId;
  readonly projectHash: string;
  readonly range: {
    readonly startSec: Seconds;
    readonly endSec: Seconds;
  };

  readonly events: readonly RenderEvent[];
  readonly voiceDefinitions: readonly VoiceDefinitionRef[];
  readonly assetRefs: readonly AssetRef[];

  readonly approximations: readonly ApproximationRecord[];
}

interface RenderEvent {
  readonly id: string;
  readonly trackId: string;
  readonly voiceId: string;

  readonly timeSec: Seconds;
  readonly durationSec?: Seconds;

  readonly type: "note" | "trigger" | "control";
  readonly priority: "critical" | "normal" | "shed-first";
  readonly latePolicy:
    | "strict-drop"
    | "immediate"
    | "sample-catch-up"
    | "coalesce";

  readonly params: Readonly<Record<string, number>>;
}

interface RealtimeBackend {
  prepare(plan: RenderPlan): Promise<void>;

  commit(
    plan: RenderPlan,
    effectiveAtSec: Seconds
  ): Promise<void>;

  cancelGeneration(
    generation: GenerationId,
    effectiveAtSec: Seconds
  ): void;

  stopAll(effectiveAtSec: Seconds): void;

  diagnostics(): AudioBackendDiagnostics;
}
```

There is deliberately **no beat fraction, tempo ownership, Tone time expression, or transport object** in this interface. Provenance can be joined through stable event IDs above the audio boundary.

The backend converts seconds to frames exactly once for worklet/offline kernels:

```ts
function secondsToFrame(timeSec: number, sampleRate: number): number {
  if (!Number.isFinite(timeSec) || timeSec < 0) {
    throw new RangeError("timeSec must be finite and non-negative");
  }
  return Math.floor(timeSec * sampleRate + 0.5);
}
```

The rounding policy must be versioned because changing it changes edge behavior at half-sample boundaries.

For AudioWorklet traffic, use a small command envelope plus transferable packed data:

```ts
type WorkletCommand =
  | {
      type: "SET_GENERATION";
      generation: number;
      effectiveFrame: number;
    }
  | {
      type: "EVENT_BATCH";
      generation: number;
      sequence: number;
      recordCount: number;
      records: ArrayBuffer;
    }
  | {
      type: "CANCEL_FROM";
      generation: number;
      frame: number;
    }
  | {
      type: "CLEAR";
      generation?: number;
    };
```

An event record should be fixed-stride and numeric: target frame, event opcode, voice slot/key, event ID hash/sequence, and a bounded number of parameters. `ArrayBuffer` ownership is transferred into the worklet. The processor copies or indexes this into preallocated ring/voice structures and returns only aggregated telemetry at low frequency.

A SharedArrayBuffer SPSC ring can later implement the same logical protocol without changing the public backend contract. Because shared-memory deployment requires cross-origin isolation, it should be an optimization selected after MessagePort batching has been measured. citeturn13search9turn13search20

Cancellation is then well defined:

**Native one-shot sources.** Keep references until `ended`. For a canceled generation, call `stop(effectiveAt)` where useful and silence the entire generation bus at the effective frame. `stop()` can supersede a previously scheduled stop while the source has not ended, and calling stop before the scheduled start prevents normal playback. citeturn2search4

**Native automation.** Cancel future scheduled automation from the commit point, then re-seed the parameter's value/curve from the new plan. Do not expect cancellation to undo samples already rendered.

**AudioWorklet.** `SET_GENERATION` switches the active generation at an exact frame. Queued records from older generations are ignored without needing to mutate every event individually.

**Sampler continuity.** Samples already audible can follow one of two voice-definition policies: `preserveActiveVoice` lets the tail finish while future triggers are invalidated; `replaceAtGeneration` fades it with the old generation. This must be declared per voice rather than guessed by the scheduler.

**Emergency stop.** It bypasses ordinary edit semantics: global safety gain goes to zero, worklet queues clear, retained sources stop, and transport becomes explicitly stopped.

For source architecture, **pool reusable data and persistent routing, not one-shot source nodes**. `AudioBufferSourceNode`s are designed to be cheaply created for individual playback and cannot be reused after playing; their `AudioBuffer`s can be reused. citeturn2search1 Cache decoded samples by content hash, keep persistent per-track gain/pan/effect buses, and use a persistent AudioWorklet node for a dense/polyphonic voice.

A practical voice registry therefore looks like:

```ts
interface VoiceDefinition {
  readonly id: string;
  readonly version: string;
  readonly capabilities: {
    nativeRealtime: boolean;
    workletRealtime: boolean;
    offlineWebAudio: boolean;
    deterministicBlockRenderer: boolean;
  };

  readonly limits: {
    maxPolyphony: number;
    maxTriggerRatePerSec: number;
  };

  createNativeVoice?: NativeVoiceFactory;
  workletProgram?: WorkletVoiceDescriptor;
  offlineKernel?: OfflineKernelDescriptor;
}
```

The following are **provisional M2 guardrails**, not claimed browser maxima:

| Budget | Soft threshold | Hard product cap | Required response |
|---|---:|---:|---|
| Native source starts | 128/s sustained | 256/s sustained | Switch voice to worklet before hard cap |
| Live native source references | 64 active | 128 active | Voice stealing/worklet/reject |
| Worklet trigger stream | 1,024/s | 2,048/s | Aggregate or reject mathematical parameters |
| Internal worklet polyphony | 64 voices | 128 voices | Deterministic voice stealing |
| Scheduler look-ahead | 100 ms | 250 ms | Warn/degrade rather than grow indefinitely |
| Future plan materialization | 2× active horizon | 1 s realtime window | Generate incrementally, not whole infinite sequence |
| Worklet telemetry | 4 Hz normal | 10 Hz debug | Never message per rendered sample/event |

These limits are intentionally conservative. Their value is that the Infinite Staircase has a deterministic answer **before** a user's parameter choice allocates tens of thousands of native nodes. M2 benchmarking should move the soft thresholds up or down while retaining the hard-cap machinery.

Risset should use a predictive route:

```text
projected rate <= native threshold
    -> native reference sources

projected rate > native threshold
    -> dense AudioWorklet voice

projected rate > worklet hard cap
    -> deterministic pulse aggregation / shedding if mathematically allowed
       otherwise reject parameter set with diagnostics
```

The shedding policy must be part of the Risset/operator definition and visible to the user; it cannot be random runtime load shedding because that would make the mathematics and resulting sound non-reproducible.

For gain safety, preserve mathematical layer ratios but apply one common scale before the master path. For sources normalized to sample peak ≤1:

```text
G = sum(abs(maximum_layer_gain_i))

safetyScale = min(1, 0.5 / G)

effectiveGain_i = originalGain_i * safetyScale
```

That gives a conservative pre-master sample-peak bound of 0.5, or about −6.02 dBFS, when the declared source bounds are valid. It intentionally uses the worst-case linear sum rather than RMS assumptions. Sample assets whose peaks are not normalized must contribute their measured peak to the bound.

This policy fits AGL-049's stated requirement for conservative defaults, master dynamics, and grouped teardown. fileciteturn0file0 A master dynamics/safety stage can remain as a final guard, but mathematical gain normalization should happen before it so a limiter is not routinely masking an overloaded Risset construction.

## Offline rendering, determinism, and diagnostics

The same `RenderPlan` should drive both realtime and offline. The plan says *what* occurs and at which second; the backend decides *how* to realize a voice.

`OfflineAudioContext` renders into an `AudioBuffer` rather than an output device and is the right native-Web-Audio semantic reference. citeturn13search13 It can use the same scheduled source times and automation as the native realtime backend, which makes it ideal for conformance fixtures.

There are, however, three different meanings of “deterministic,” and AGL should not conflate them:

| Level | Required guarantee |
|---|---|
| Plan determinism | Same project/seed/range ⇒ identical serialized render-plan hash |
| Semantic audio determinism | Same events begin/end at the same quantized frames and use identical voice parameters |
| PCM determinism | Exact floating-point sample bytes are identical |

**Plan determinism is mandatory. Semantic audio determinism is mandatory within explicit tolerances. Cross-browser PCM identity is not a supported contract.**

Different Web Audio implementations may use different native DSP internals, and browser/device processing details are outside AGL's canonical project model. Web Audio also distinguishes real-time load constraints from offline rendering; offline processing is not constrained by real-time callback deadlines in the same way. citeturn2search0

Recommended M2 comparison policy:

| Fixture type | Cross-backend tolerance |
|---|---|
| One-sample click / buffer start | onset ±1 sample |
| Stop/duration boundary | ±1 sample |
| Static gain on known PCM | max-absolute error ≤ `2e-6` initially |
| Simple oscillator | event timing exact to ±1 sample; compare frequency/RMS/spectrum rather than hashes |
| Biquad/filter fixture | magnitude response within 0.25 dB at test frequencies |
| Envelope | breakpoint timing ±1 sample; amplitude tolerance `1e-4` |
| Compressor / implementation-sensitive dynamics | envelope/RMS/peak feature tolerances, not sample equality |
| AGL-owned WASM/kernel DSP | same build should target much tighter numeric agreement; hash exactness only after demonstrated empirically |

Those numbers are **proposed test thresholds** and should be calibrated with the first cross-engine corpus. They are deliberately more strict for trivial operations than for implementation-sensitive DSP.

For WAV export, encode PCM in AGL-owned code after rendering rather than relying on browser-specific media encoding. The export should have a sidecar manifest or embedded application metadata containing at least:

```json
{
  "schema": "agl.audio.render-manifest",
  "schemaVersion": 1,
  "projectHash": "...",
  "renderPlanHash": "...",
  "projectSchemaVersion": 1,
  "seed": "...",
  "rangeSec": [0.0, 120.0],
  "sampleRate": 48000,
  "channels": 2,
  "pcmFormat": "float32-or-pcm24",
  "backend": {
    "id": "native-offline",
    "version": "..."
  },
  "voiceRegistryHash": "...",
  "assetHashes": ["..."],
  "browser": {
    "engine": "...",
    "version": "..."
  },
  "approximations": [],
  "densityShedding": [],
  "gainSafetyScale": 1.0
}
```

The manifest is more important to scientific reproducibility than pretending a WAV from Safari and a WAV from Chromium must share a byte hash.

Live-only sources should never enter a portable offline plan. `MediaElement`/live media-stream style sources are not an appropriate basis for this architecture; AGL's included scope—decoded samples, oscillators, percussion/noise, envelopes, filters, and AGL-defined DSP—can all have explicit offline equivalents.

**Offline progress and cancellation require a deliberate decision.** Standard `OfflineAudioContext.startRendering()` gives AGL a promise for completion, but not a portable abort handle. `OfflineAudioContext.suspend(time)` can provide rendering checkpoints where implemented, yet MDN still marks it Limited Availability. citeturn13search0turn13search13

Accordingly, I recommend two levels:

**Reference offline backend:** `OfflineAudioContext`. User cancellation immediately invalidates the job and prevents result commitment/export; the browser may continue computation internally. UI shows indeterminate progress unless checkpoint support is feature-detected.

**Deterministic block backend:** required later if AGL-045's “cancellation” means *actually stop consuming compute now*. AGL-owned oscillator/sampler/DSP kernels run in bounded blocks in a Worker or WASM engine, allowing genuine `AbortSignal`, exact block progress, state snapshots, and deterministic resource limits.

Given a two-engineer program, I would **not block M2 on implementing the second backend unless true compute cancellation is explicitly non-negotiable**. I would instead phrase the M2 contract as “user-visible cancellation with no canceled artifact committed,” while recording the continued-compute limitation.

Diagnostics should be first-class rather than a hidden dev console. Browser-provided latency metrics are only part of the picture. citeturn21search2turn21search4

| Metric | User diagnostics | Developer diagnostics |
|---|---|---|
| Context state | Yes | Yes + transition history |
| Sample rate | Yes | Yes |
| `baseLatency` | Yes | Time series |
| `outputLatency` | Yes when available | Time series |
| Estimated base + output | Yes, labeled estimate | Yes |
| Scheduler horizon | Advanced | Yes |
| Wake jitter p50/p95/p99/max | Advanced | Yes |
| Scheduled-late count/rate | Yes when nonzero | Per event |
| Dropped/coalesced events | Yes when nonzero | By policy/reason |
| Worklet queue lead | Advanced | Frames + milliseconds |
| Worklet stale-generation drops | No | Yes |
| Native active source count | Advanced | Yes |
| Source teardown latency | No | Yes |
| Main-thread long tasks | Advanced | Timeline |
| Generation ID | No | Yes |
| Plan/render hash | Export diagnostics | Yes |
| Gain safety scale | Yes if <1 | Yes |
| Density route | “Native” / “Dense engine” | Full reason |
| Context interruption | Yes | Timestamp/history |
| Device/sink transition | Yes | Before/after metrics |
| MIDI permission/device status | Yes | Timestamp mappings |
| Offline render ratio | Advanced | Yes |

Chrome exposes additional renderer diagnostics such as callback interval and render capacity in its DevTools WebAudio panel; those are useful during Chromium investigations but should not become portable AGL API requirements. citeturn14search9

For true end-to-end latency testing, the harness needs an **external or loopback mode**. An AudioWorklet detector can establish the frame where a scheduled event actually appears inside the Web Audio graph; it cannot by itself prove when a Bluetooth transducer emitted that sample. Acoustic/physical latency therefore needs a wired audio loopback, virtual loopback device, or external capture reference. Browser `outputLatency` remains supplementary telemetry rather than the ground truth. citeturn21search2

## Tone, Faust, and MIDI posture

**Tone.js: adopt only behind a replaceable adapter.**

Tone provides substantial convenience: musical instruments, synth/effect components, automation abstractions, and a global transport/scheduling model. It is fundamentally layered on Web Audio and lets an application provide its own AudioContext via `Tone.setContext()`. citeturn18search5

That makes it useful as a **voice implementation library**, but its global transport is the wrong canonical abstraction for AGL. AGL already has exact rational musical time, deterministic graph evaluation, stable IDs, and a backend-neutral render plan. Letting Tone own tempo, position, loop state, or time strings would create two authorities for musical time.

The boundary should therefore be:

```text
Allowed:
RenderPlan -> ToneVoiceAdapter -> Tone instrument/effect -> AGL mixer

Not allowed:
Project -> Tone.Transport
Tone.Transport -> canonical event generation
Tone time strings -> persistence
Tone loop/tempo state -> project semantics
```

A Tone voice receives seconds and voice parameters exactly like a native voice. Contract tests must prove event timing, duration, gain, cancellation, and offline behavior match supported semantics.

The current Tone development `package.json` retrieved during this research reports version 15.5.36, an MIT license, and runtime dependencies on `standardized-audio-context` and `tslib`. That is evidence of an actively evolving dependency surface, not a reason to pin the development branch. Production should pin a published stable release and its lockfile. citeturn19view0

Bundle posture should be **lazy and optional**. AGL's P0 native oscillator/sampler voices must not depend on Tone; `import()` a Tone adapter only for voices/features that need it. This gives the reference backend zero Tone dependency and makes bundle cost directly measurable in CI rather than architectural.

**Decision: AGL-046 remains P1 and optional. Do not use Tone to implement AGL-041, AGL-043, or canonical transport.** This is consistent with the backlog already describing it as an “Optional Tone.js adapter.” fileciteturn0file0

**Faust/WASM: adopt selectively for AGL-owned DSP, not as the foundational scheduler.**

Faust is a DSP language/compiler capable of targeting WebAssembly. FaustWasm can turn compiled DSP into Web Audio nodes, explicitly supports AudioWorklet operation and offline processing, and supports loading precompiled WASM modules without shipping the full compiler into the browser. citeturn18search0turn18search1

That is attractive for:

- dense Risset/pulse synthesizers after the native reference is proven;
- advanced effects whose hand-written JS DSP would be maintenance-heavy;
- reusable DSP that needs both realtime and deterministic block/offline implementations;
- mathematically specified DSP where the Faust source becomes a concise auditable artifact.

It is **not** required for ordinary oscillator/sample scheduling, transport, render plans, graph evaluation, or basic Web Audio voice registration.

The deployment posture should be:

```text
.dsp source
   |
pinned Faust toolchain in build/CI
   |
generated WASM + metadata
   |
content hash / compiler-version manifest
   |
browser runtime
```

Do not dynamically compile arbitrary Faust source in the user browser for MVP. FaustWasm's own documentation notes that precompiled modules avoid bundling the compiler and yield lighter/faster-loading applications. citeturn18search0

Licensing needs explicit AGL-136 review. Faust's compiler distribution is LGPL-family licensed in the reviewed source, while standard Faust library files include an explicit exception allowing resulting compiled code to be distributed under another chosen license. That is encouraging but not a substitute for reviewing the exact compiler, runtime, libraries, and generated artifacts pinned by AGL. citeturn12view0turn18search2

**Decision: AGL-047 should prove one advanced effect or dense voice using precompiled Faust/WASM; it should not replace the native reference backend.**

**Web MIDI: notes and controls only.**

The Web MIDI specification defines message timestamps in the DOM high-resolution-time coordinate. Incoming `MIDIMessageEvent.timeStamp` describes when the system received the MIDI message; scheduled `MIDIOutput.send()` accepts a future `DOMHighResTimeStamp`, and `clear()` removes queued output data. citeturn0search0turn22search16

Where `AudioContext.getOutputTimestamp()` is available, AGL can map performance-clock timestamps and audio-context time through a sampled clock pair. Conceptually:

```ts
const ts = audioContext.getOutputTimestamp();

const midiPerfMs = midiEvent.timeStamp;

const mappedAudioTime =
  ts.contextTime +
  (midiPerfMs - ts.performanceTime) / 1000;
```

For live local synthesis, a MIDI event that maps to the past is played immediately rather than intentionally adding the scheduler's ordinary 100 ms look-ahead. Its timestamp remains useful for measuring input/event-loop lateness.

For scheduled MIDI output, invert the mapping:

```ts
const ts = audioContext.getOutputTimestamp();

const performanceTargetMs =
  ts.performanceTime +
  (desiredAudioTimeSec - ts.contextTime) * 1000;

midiOutput.send(bytes, performanceTargetMs);
```

That aligns the web-side clocks; it does **not** eliminate USB/MIDI-device latency or the external synthesizer's own audio latency.

MVP scope:

| MIDI feature | Decision |
|---|---|
| Note on/off input | Yes |
| Note on/off output | Yes |
| CC input/output | Yes |
| Sustain pedal | Yes |
| Pitch bend | Yes if required by a voice |
| Channel pressure/aftertouch | Optional |
| Device hotplug | Yes, diagnostic/rebind |
| SysEx | No |
| MIDI Clock follower | No |
| MIDI Clock master | No |
| MTC | No |
| DAW-grade synchronization claim | No |

Request permission only from an explicit **Enable MIDI** action and request `sysex: false`. Chrome's modern permission model prompts for ordinary MIDI access, and Web MIDI's powerful-feature model allows permission denial. citeturn4search12turn0search0

Fallback is simple: the entire application works without MIDI. Safari gets the same audio product with MIDI controls disabled and an explanatory capability message; mouse, keyboard, touch, sequencer, and exported MIDI files remain independent features. Web MIDI's lack of universal browser availability is therefore not a reason to lower the Safari audio support tier. citeturn22search5turn23search0

## Benchmark harness, acceptance gates, and ADR handoff

A dependency-free benchmark harness has been created for DR-03:

**[Download the DR-03 browser-audio benchmark harness](sandbox:/mnt/data/agl-dr03-browser-audio-harness.zip)**

The bundle contains:

```text
agl-dr03-browser-audio-harness/
├── README.md
├── index.html
├── profiles.json
└── src/
    ├── main.js
    ├── render-probe-processor.js
    ├── event-synth-processor.js
    └── worker.js
```

The JavaScript files were syntax-validated with Node 22.16.0 and the profile JSON was parsed successfully. This is a source-level self-test only; it is **not** a browser timing measurement.

It records the required core telemetry: scheduler wake jitter; intended and scheduling-call times; native render-thread onset frames using an AudioWorklet tap; worklet event timing; context state/sample rate/base/output latency; output timestamp snapshots; long tasks where available; source count and teardown; offline render duration and PCM SHA-256; visibility/state/device transitions; user agent/platform; and cross-origin-isolation state.

The supplied profiles include steady 4, 16, 32, and 128 events/s, a 512-event/s burst stress case, a provisional 256-event/s Risset case, generation-flip/scrubbing stress, and a ten-minute soak. Those high-density fixtures are stress inputs, not claims that those values are universally safe.

Minimal run:

```bash
unzip agl-dr03-browser-audio-harness.zip
cd agl-dr03-browser-audio-harness
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Localhost is appropriate for development; production/cross-device deployment should be HTTPS because AudioWorklet and Web MIDI functionality is secure-context-sensitive. citeturn21search15turn22search5

Each benchmark record must supplement browser-readable data with exact machine model, CPU/RAM, OS build, browser build, output device, wired/USB/Bluetooth path, nominal sample rate, AC/battery state, low-power mode, and relevant throttling configuration. That is the only defensible way to turn “Chrome latency” or “Safari scheduler behavior” into reproducible engineering evidence.

**Raw benchmark-result status as of this report:**

| Target | Raw measurements |
|---|---|
| macOS Chromium | Not executed in this environment |
| macOS Firefox | Not executed in this environment |
| macOS Safari | Not executed in this environment |
| Windows Chromium | Not executed in this environment |
| Windows Firefox | Not executed in this environment |
| Bluetooth/device-change matrix | Not executed |
| Physical/virtual loopback acoustic latency | Not executed |

Therefore this report makes **no empirical claim** such as “Safari is X ms slower” or “Chrome safely handles Y nodes.” The supplied thresholds are acceptance hypotheses to be measured. This distinction matters because both `baseLatency` and `outputLatency` depend on browser/platform/hardware and the latter is explicitly an estimate. citeturn21search4turn21search2

Recommended run matrix at M2:

| Platform | Browser line | Outputs |
|---|---|---|
| macOS current supported release | Chrome current stable | built-in/wired, Bluetooth, USB if available |
| macOS same machine | Firefox current stable | same |
| macOS same machine | Safari current | same |
| Windows current supported release | Chrome current stable | wired/built-in, Bluetooth |
| Windows same machine | Firefox current stable | same |
| Low-power reference | all applicable | low-power/battery mode |
| Heavy-load profile | all applicable | same device, canvas/3D + worker load |

Run one warm-up followed by at least five recorded trials for short profiles and a 10–30 minute soak. Current browser versions change rapidly enough that the result key must be the exact build, not merely “Chromium.”

The following are the proposed **M2 pass/fail gates**:

| Area | Proposed acceptance gate |
|---|---|
| Steady native, 4–32 events/s | zero late note-on scheduling failures in 10-minute foreground run |
| Synthetic native onset | absolute render-frame error ≤1 sample |
| Worklet event fixture | zero late worklet frames at 256 triggers/s for 10 minutes on Tier-A reference machines |
| Adaptive scheduler | p99 scheduler wake gap remains `< horizon − 2Q`; horizon adapts after deterioration rather than crossing 250 ms |
| Heavy UI/canvas | worklet audio fixture has zero late rendered events despite induced main-thread long tasks |
| Worker graph load | worker stress produces no additional worklet late events |
| Live edit | zero stale-generation events rendered after `effectiveFrame + Q` |
| Edit responsiveness | plan-commit-to-audible-transition p95 ≤100 ms in foreground |
| Seek | no event from old generation after seek commit; no missed first intended new-generation event |
| Loop | no duplicate/missing event at loop boundary across 10,000 logical loop boundaries in deterministic unit fixture |
| Native source lifecycle | active source references return to steady-state baseline after tails; no monotonic growth during 30-minute soak |
| Emergency stop | generation queues clear and output safety gain reaches silence within defined click-safe ramp |
| Density protection | parameters exceeding hard event/voice cap are deterministically aggregated or rejected before uncontrolled allocation |
| Offline timing | click/start/stop boundaries agree with plan within ±1 sample |
| Offline plan parity | realtime and offline adapters consume identical plan hash |
| Offline simple render | complete faster than real time on each designated reference machine; record ratio rather than assume |
| Context interruption | no catch-up burst after background/sleep/device interruption |
| Resume | new generation is primed only after context reports usable state |
| MIDI handler overhead | event receipt-to-audio scheduling-call p95 ≤5 ms foreground, excluding hardware/output latency |
| MIDI unavailable/denied | product remains fully usable with no repeating permission prompt |
| Diagnostics | every failed threshold has enough exported telemetry to identify browser/build/device/profile |

`Q` in those gates is the actual render quantum duration presented by the engine, not a hard-coded 128-frame assumption.

For low-power/throttled testing, an architecture can still pass while refusing an unsafe workload. The correct degradation sequence is:

```text
increase look-ahead within 250 ms
        ->
route dense voice through AudioWorklet
        ->
deterministically reduce/aggregate workload if voice semantics allow
        ->
reject parameter set and expose diagnostic

never:
silently play arbitrarily late events
```

The architecture decisions translate to the ADR/backlog handoff as follows:

| ADR proposal | Decision | Engineering consequence |
|---|---|---|
| Native reference audio backend | **Accept** | AGL-040 remains authoritative baseline |
| Immutable seconds-based render plan | **Accept** | AGL-041 drives realtime + offline; rational time remains upstream |
| Registry-based voice implementations | **Accept** | AGL-042 exposes native/worklet/offline capabilities |
| Adaptive native look-ahead scheduler | **Accept, constants benchmark-gated** | AGL-043 starts 25/100, bounded at 250 ms |
| Dense AudioWorklet event/voice engine | **Accept** | AGL-044 owns dense timing and custom DSP boundary |
| Generation-based cancellation | **Accept** | Shared by transport, scheduler, worklet, edit, seek, emergency stop |
| `OfflineAudioContext` reference renderer | **Accept** | AGL-045 uses same plan semantics |
| Portable true offline abort | **Defer or revise requirement** | Native offline render can abandon result, not portably abort compute |
| Tone.js canonical transport | **Reject** | Tone never owns project/time semantics |
| Optional Tone voice adapter | **Accept as P1** | AGL-046 lazy-loads and contract-tests |
| Faust as foundational engine | **Reject** | Keep native baseline |
| Precompiled Faust/WASM advanced DSP | **Accept as proof** | AGL-047 pins compiler/runtime/library hashes |
| Web MIDI note/control adapter | **Accept optional** | AGL-048; no SysEx/clock/MTC in MVP |
| Safari MIDI requirement | **Reject** | Safari remains audio Tier A with MIDI unavailable |
| SharedArrayBuffer baseline | **Reject for MVP** | MessagePort batches first; SAB only after evidence |
| Conservative Risset gain bound | **Accept** | AGL-049 applies common safety scale and emergency mute |
| Cross-browser benchmark harness | **Accept; measurements pending** | AGL-134 executes supplied fixture in CI/manual hardware lab |

This handoff preserves the backlog's intended dependency graph: the audio render plan remains central, scheduler hardening gets measurable gates, AudioWorklet has a narrow explicit role, Tone/Faust stay replaceable, and the cross-browser harness becomes evidence rather than a one-time research exercise. fileciteturn0file0turn0file2turn0file3

The single largest remaining M2 risk is **not uncertainty about the architecture**. It is failure to execute the hardware/browser matrix and replace provisional density/latency thresholds with measured ones. The specifications establish the correct separation of clocks, threads, contexts, and capabilities; they intentionally do not promise that a given laptop, Bluetooth stack, browser build, or UI workload will deliver a specific millisecond result. citeturn0search1turn2search0turn21search2

**Recommended architectural baseline:** native Web Audio + immutable RenderPlan + worker evaluation + adaptive main-thread look-ahead + generation buses + AudioWorklet dense/DSP path + OfflineAudioContext reference renderer. That design satisfies the program's most important invariant: **UI and mathematical graph work can be delayed without placing that work on the audio rendering path, while canonical project/time semantics remain independent of every replaceable audio dependency.**

**Research status:** architecture decision ready; empirical M2 acceptance remains benchmark-gated.

#WebAudio #AudioWorklet #OfflineAudio #BrowserAudio #RealTimeAudio #DSP #WebMIDI #ToneJS #Faust #AuralGeometryLab #DR03

**Approx. conversation tokens:** ~130k