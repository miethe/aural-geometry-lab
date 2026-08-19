# Aural Geometry Lab — DR-12 Research Integration Packet

**Integration date:** 2026-08-18  
**Research basis:** DR-12 — Native iPad Audio, Document, MIDI, Pencil, and Adaptive-UI Architecture  
**Decision posture:** Architecture-ready with defined proof-of-architecture gates; not implementation-authorized until the package/conflict, render-plan, and process-wide audio ownership decisions are closed.

## Evidence labels

| Label | Meaning |
|---|---|
| **Established evidence** | Directly supported by released platform documentation, official specifications, measured program artifacts, or an already accepted AGL contract. |
| **Strong inference** | Follows directly from multiple established facts but is not itself explicitly guaranteed by a platform specification. |
| **Engineering recommendation** | A design choice proposed to satisfy AGL requirements; must be validated by tests or proof-of-architecture work. |
| **Speculative possibility** | Plausible future direction without enough evidence to affect the current architecture. |

The AGL backlog already defines exact rational musical time, deterministic event and operator semantics, stable IDs and seeds, a command bus, a canonical render-plan objective, projection contracts, and cross-platform invariant testing. DR-12 should strengthen those seams rather than introduce an independent native product model.

---

# 1. Executive Decision Summary

| # | Decision | Classification | Why |
|---:|---|---|---|
| 1 | Treat the native iPad application as a **ports-and-adapters implementation of canonical AGL semantics**, not a second product core. | **ADOPT** | This is the highest-leverage and most consequential DR-12 conclusion. Project, event, operator, render-plan, command, provenance, and projection semantics remain platform-independent; SwiftUI, AVFoundation, Core MIDI, and Metal remain replaceable adapters. |
| 2 | Share schemas, fixtures, stable-ID rules, operator versions, command contracts, and semantic test vectors with TypeScript; initially reimplement execution in Swift rather than embedding JavaScript. | **ADOPT** | JavaScript in a native real-time audio path would create an unsafe and difficult timing boundary. A third-language shared core would be premature given the current two-engineer capacity assumption. |
| 3 | Use a versioned logical `.agl.project` package containing `manifest.json`, canonical `project.json`, hash-addressed assets, and discardable previews. | **ADOPT WITH CONDITIONS** | The logical structure aligns with AGL-014 and AGL-015. The **physical container**, however, is not yet resolved for browser interoperability: an iPad document package is a directory, whereas ordinary browser download/upload workflows usually require an archive. That must be resolved before the format freezes. |
| 4 | Use `DocumentGroup` and value-type `FileDocument` as the initial iPadOS 26 document shell. | **ADOPT WITH CONDITIONS** | Apple documents Files browsing, multiwindow support, binding-driven document updates, package UTIs, and directory `FileWrapper` serialization. The condition is a destructive iCloud/File Provider conflict POA; fallback to `UIDocument` if conflict preservation cannot be made trustworthy.  |
| 5 | Make `AGLDocument` a persistence snapshot only; make `ProjectStore` and `CommandDispatcher` the authoritative editing session. | **ADOPT** | This prevents SwiftUI bindings, audio objects, selection, or scene state from becoming project semantics. It also provides one path for gestures, keyboard commands, accessibility actions, MIDI mappings, scripting, and undo. |
| 6 | Route every semantic edit through the command bus and adapt `UndoManager` to command inverses and grouped transactions. | **ADOPT** | A five-second drag must be one semantic undo, not hundreds of sample-level changes. This is consistent with AGL-012’s existing atomic-command and transaction requirements. |
| 7 | Support multiple independent project windows, but enforce a single in-process writer for one file identity. | **ADOPT WITH CONDITIONS** | This avoids same-process split-brain state. The unresolved condition is whether auxiliary windows share one selection model or use scene-local selection with an optional “follow selection” relationship. |
| 8 | Add a **process-wide `AudioDeviceCoordinator` and MIDI endpoint coordinator** above per-project sessions. | **ADOPT WITH CONDITIONS** | DR-12’s module diagram does not fully account for `AVAudioSession` being process-global while multiple document windows may exist. The MVP should permit one audible project at a time unless a process-wide multi-session mixer is explicitly implemented and tested. |
| 9 | Preserve exact rational time above the audio layer, then derive a deterministic backend schedule in seconds and finally sample frames. | **REQUIRES CROSS-RUN RECONCILIATION** | DR-03 describes a seconds-only render plan, while DR-12’s `NativeRenderPlan` retains rational range and tempo-map information. The integrated architecture needs one authority and derived projections, not two competing render plans. |
| 10 | Version the seconds-to-sample rounding rule and convert absolute event times rather than accumulating rounded deltas. | **ADOPT WITH CONDITIONS** | A versioned rule is required for deterministic cross-platform sample indices. DR-03 proposes nearest-frame half-up rounding; DR-12 requires one canonical rule but does not independently choose it. |
| 11 | Use `AVAudioEngine` as the native graph, with scheduled player/AU events and preallocated real-time queues. | **ADOPT** | `AVAudioEngine` publicly supports real-time graph operation and client-driven manual rendering. `AVAudioTime` represents host and sample time, making it the appropriate native clock bridge.  |
| 12 | Keep graph evaluation, JSON, allocation, actor hops, logging, and blocking synchronization out of render callbacks. | **ADOPT** | This is a hard real-time contract, not a performance preference. The audio callback may consume bounded preallocated events; it must not evaluate AGL graphs. |
| 13 | Use one engine graph factory and one resolved audio plan for both real-time and offline rendering, but instantiate a separate engine for manual export. | **ADOPT** | Switching the live device engine into manual mode would disconnect it from hardware and entangle export with playback. A separate engine preserves session continuity and makes offline equivalence testable.  |
| 14 | Use generation-based cancellation and explicit state transitions for edits, seeks, loops, interruption recovery, route changes, and panic. | **ADOPT** | Scheduled events cannot be treated as if they were generic cancellable tasks. A generation boundary provides deterministic stale-event suppression across native and web backends. |
| 15 | Use Core MIDI’s UMP/`MIDIEventList` APIs internally; preserve MIDI 2 resolution and down-convert only at an explicit MIDI 1 boundary. | **ADOPT** | Apple’s protocol-aware APIs and the MIDI 2 specification support MIDI 1 and MIDI 2 in UMP form. Legacy byte-oriented APIs are deprecated.  |
| 16 | Keep Standard MIDI File export as the interoperable default; defer MIDI-CI and UMP-oriented file export. | **ADOPT / DEFER** | UMP transport is valuable now. MIDI-CI and newer file forms add complexity without being required for the current composition/export scope. |
| 17 | Make `CanvasProjection` framework-independent; use SwiftUI `Canvas` for bounded 2D labs and Metal for measured dense workloads. | **ADOPT** | Renderer choice must not alter mathematical, selection, hit-test, provenance, export, or accessibility semantics. RealityKit is optional for genuine 3D views, not an AGL-wide canvas. |
| 18 | Adapt layouts by available dimensions, not orientation or device name, and preserve all project/session state during resizing. | **ADOPT** | iPadOS 26 supports freely resizable windows and a visible menu-bar interaction model. Layout changes must be non-destructive.  |
| 19 | Treat Apple Pencil hover, squeeze, pressure, roll, and haptics as progressive enhancement only. | **ADOPT** | Hardware and user preferences vary; squeeze may be assigned to a system action. No essential operation may depend on an advanced Pencil capability.  |
| 20 | Reject production dependencies on 2027-cycle beta document APIs, a general RealityKit canvas, byte-level conflict merging, pointer-only commands, or full iPhone studio parity in the first native milestone. | **REJECT / DEFER** | These choices either undermine portability, lack released API stability, or exceed current product capacity. Apple currently labels the new document reader/writer APIs beta.  |

---

# 2. Evidence → Decision Matrix

| Finding / evidence | Evidence strength | Engineering implication | Recommended decision | Confidence | Source(s) |
|---|---|---|---|---:|---|
| AGL already has exact time, canonical events, deterministic seeds, typed operators, graph/runtime work, render-plan intent, projection intent, and invariant testing. | Established program authority | Native should consume and conform to these contracts rather than redefine them. | One semantic core, multiple platform adapters. | Very high | |
| Program capacity is two product engineers, one product/UX FTE, and fractional specialist support. | Established program assumption | Duplicating semantics or creating a third-language core now would materially threaten the web and native milestones. | Share artifacts and behavior; defer shared executable core. | High | |
| `DocumentGroup` supplies iOS document browsing and multiwindow integration. | Established platform documentation | AGL can participate directly in Files/iCloud document workflows. | Use `DocumentGroup` as the initial scene shell. | High |  |
| `FileDocument` supports directory `FileWrapper` packages and can rewrite changed package members; it is `Sendable` and serialization must not be MainActor-bound. | Established platform documentation | Package reads/writes need a pure, off-main serializer and immutable asset wrappers. | Adopt `FileDocument`, isolate package I/O in `AGLPackageReader/Writer`. | High |  |
| Current Apple documentation presents newer document reader/writer APIs as beta while older `DocumentGroup` initializers are deprecated. | Established but awkward platform state | Removing warnings by adopting beta APIs would be riskier than keeping released APIs behind an adapter. | Ship on the released path; quarantine migration. | High |  |
| SwiftUI’s `FileDocument` abstraction does not expose the same explicit conflict/version surface as `UIDocument`. | Strong inference from API surface and DR-12 review | Conflict recovery cannot be accepted based on architectural reasoning alone. | Run destructive iCloud/File Provider POA; fallback to `UIDocument`. | High | |
| A native package is a directory, but browser portability of that physical representation is not established in DR-12. | Architecture review finding | A single logical package may need native-directory and portable-archive profiles. | Block physical format freeze pending web/native round-trip POA. | High | DR-12 package recommendation plus AGL-015 portability requirement. |
| SwiftUI tracks value-document edits through the document binding and writes the document when needed. | Established platform documentation | Project changes must eventually commit a canonical snapshot back to the document binding. | `ProjectStore` owns editing; document binding receives committed snapshots. | High |  |
| AGL-012 requires atomic commands, inverses, grouped undo, and redo. | Established program authority | Native controls must not mutate project fields directly. | `UndoManager` adapts to the command bus. | Very high | |
| `AVAudioEngine` supports real-time graphs and manual rendering. | Established platform documentation | One graph factory can build live and export engines. | Separate live and manual engines, same descriptors and resolved plan. | High |  |
| `AVAudioTime` represents host time and audio sample time. | Established platform documentation | It is the appropriate bridge between transport epochs and the hardware timeline. | Schedule by sample/host time, never UI or concurrency timers. | High |  |
| `AVAudioEngine` permits runtime graph changes only with limitations. | Established platform documentation | Arbitrary attach/detach/reconnect during playback risks graph breakage. | Live parameter changes are allowed; structural changes use controlled rebuilds. | High |  |
| DR-12 proposes a 100–250 ms scheduling horizon, while DR-03 proposes a 25 ms wake, 100 ms initial horizon, and 250 ms ceiling. | Engineering recommendations, not measurements | Constants must remain telemetry-driven and backend-specific. | Adopt the adaptive policy; benchmark and version constants. | Medium-high | |
| No native hardware timing measurements were produced by DR-12. | Established absence of evidence | “Low latency” and safe voice/event limits cannot be product claims yet. | Treat all thresholds as acceptance hypotheses until device tests run. | Very high | |
| The same canonical plan is required for real-time and offline rendering. | Established program authority | Export cannot contain a separate event model or alternate graph evaluator. | One semantic plan; derived backend schedules only. | Very high | |
| Apple documents interruption, route-change, and media-reset lifecycle responsibilities. | Established platform documentation | Audio lifecycle must be an explicit state machine with engine reconstruction and no catch-up burst. | Adopt the DR-12 state machine; user action after media reset. | High |  |
| Core MIDI’s event-list APIs use UMP, schedule future timestamps, and invoke receive callbacks on a high-priority thread. | Established platform documentation | MIDI callbacks require bounded nonblocking ingress queues; output can use timestamp scheduling. | Use UMP internally and `MIDISendEventList`. | High |  |
| MIDI 2 extends MIDI 1 and prioritizes translation compatibility while adding resolution and per-note expression. | Established official specification | Native canonical MIDI events must not collapse MIDI 2 values to 7-bit fields. | Preserve source resolution and explicitly quantize only for MIDI 1 destinations. | High |  |
| Apple’s accessibility guidance requires more than one way to convey information and alternatives to gestures. | Established HIG guidance | Canvas semantics, keyboard operation, non-color cues, and gesture alternatives are architecture requirements. | Make accessibility part of `CanvasProjection` and command conformance. | High |  |
| Apple Pencil advanced actions depend on hardware and system/user preference. | Established platform documentation | Squeeze, hover, and roll cannot be mandatory or authoritative project inputs by themselves. | Capability-gated accelerators with touch/keyboard equivalents. | High |  |
| `BGContinuedProcessingTask` is user-started, foreground-originating work that may continue in the background and can be cancelled or terminated. | Established platform documentation | Export must stream safely, report progress, support cancellation, and leave no corrupt destination. | Use it for explicit long exports, not daemon work. | High |  |
| App privacy declarations include third-party SDK behavior; on-device-only processing is not considered collection; a privacy policy URL is required. | Established App Store policy | Dependency minimization and privacy-manifest auditing are release gates. | Local-first default; no analytics or microphone permission in native MVP. | High |  |
| Dense CA and chaos rendering differ substantially from bounded rings and vector paths. | Strong inference from lab semantics | A single rendering framework would either overcomplicate simple labs or underperform dense ones. | Canvas by default; Metal by measured workload; RealityKit optional. | High | |
| Multiwindow documents coexist with a process-global audio session and shared MIDI endpoint environment. | Strong architecture inference | Per-document ownership cannot extend directly to device/session resources. | Add app-level coordinators and choose an audible-session policy. | High | DR-12 multiwindow/audio recommendations; Apple audio-session model.  |

---

# 3. Architecture Consequences

## 3.1 Revised public-API architecture

DR-12’s original architecture is directionally correct but needs two additions:

1. a distinction between the **logical package** and its physical native/web container profiles;
2. process-wide coordinators for audio-session, MIDI-endpoint, and same-file ownership.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                    CANONICAL AGL SEMANTIC AUTHORITY                        │
│                                                                            │
│ Project JSON Schema • package manifest schema • exact RationalTime         │
│ stable IDs/seeds • operator catalog/versions • command schemas/inverses    │
│ graph compile/evaluate semantics • provenance • evaluation budgets         │
│ SemanticRenderPlan • projection primitives • accessibility descriptions   │
│ canonical serialization • shared golden fixtures                          │
└─────────────────────────────────┬──────────────────────────────────────────┘
                                  │ generated models + shared fixtures
                                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                       NATIVE AGL SEMANTIC CORE                             │
│                                                                            │
│ AGLDocumentAdapter ──► ProjectStore ──► CommandDispatcher                  │
│          │                   │                    │                         │
│          │                   ├── SelectionModel(s)                          │
│          │                   ├── GraphEvaluatorAdapter                      │
│          │                   ├── InspectorProjection                        │
│          │                   └── CanvasProjection                           │
│          │                                      │                          │
│          └── PackageReader/Writer                  ├── SwiftUI Canvas       │
│                                                    ├── Metal renderer       │
│ SemanticRenderPlan ─► ResolvedAudioPlan ─► NativeSchedule                  │
│                                  │                                         │
│                                  ├── AVAudioEngine session backend          │
│                                  └── ExportService/manual engine            │
└─────────────────────────────────┬──────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     PROCESS-WIDE PLATFORM SERVICES                         │
│                                                                            │
│ OpenDocumentRegistry     AudioDeviceCoordinator / AVAudioSession           │
│ BackgroundTaskManager    MIDIEndpointCoordinator / Core MIDI               │
│ App capability policy    route/interruption/media-reset controller         │
│ privacy/diagnostics      thermal/memory/power policy                       │
└─────────────────────────────────┬──────────────────────────────────────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
       Files / iCloud       audio hardware       USB/BLE/network MIDI

Physical project-container profiles — decision pending POA:

  Logical AGL package
        ├── Native directory package: UTType.package + FileWrapper
        └── Portable archive profile: browser-safe container, if required

Cross-platform conformance:

  Swift semantic output == TypeScript semantic output
  project • migrations • commands • events • plans • projections • exports
```

## 3.2 Consequence matrix

| Affected subsystem | Exact architectural implication | Public/internal contract? | Dependencies | Migration impact if delayed | Recommendation |
|---|---|---|---|---|---|
| Canonical project model | Platform-only UI, route, engine, and selection state must never enter `project.json`. | **Public project contract** | AGL-010 | High: later removal would require migrations and could break semantic hashes. | Freeze exclusions before schema v1. |
| Project persistence | Define a logical package independent of physical directory/archive representation. | **Public interchange contract** | AGL-010, AGL-014, AGL-015 | Critical: changing physical assumptions after external files exist is expensive. | Split logical package schema from container profiles now. |
| Package manifest | Include package version, project schema version, project semantic ID, save generation, member hashes, asset metadata, and compatibility requirements only. | Public | AGL-014/015 | High | Specify and JSON-Schema validate. |
| Asset store | Assets are immutable and hash-addressed; autosave reuses unchanged package members. | Public package semantics | AGL-014 | High I/O and compatibility cost if deferred. | Adopt before native package POA. |
| Document shell | `AGLDocument` serializes/deserializes snapshots but owns no UI, audio, MIDI, selection, or undo logic. | Internal native API; public behavior | AGL-010/015 | Medium if adapter boundary is clean; high if views mutate it directly. | Enforce by module dependency rules. |
| Command architecture | All semantic mutation uses commands and grouped transactions. | Cross-platform behavioral contract | AGL-012 | Critical: retrofitting undo consistency across views is costly. | Freeze command schemas before native editing. |
| Undo/redo | `UndoManager` calls command inverses; it does not hold an independent semantic history. | Internal adapter over public commands | AGL-012 | High | Implement once in `ProjectStore`. |
| Scene/session state | Selection, viewport, panel sizes, focus, hover, active route, and current transport UI are scene/session state. | Internal scene-state contract | AGL-036 | Medium | Persist separately through scene restoration where useful. |
| Multiwindow | Distinct projects have isolated stores, undo, selection, evaluation, and render generations. | User-visible behavior | Document POA | High data-integrity risk | Test from first native scaffold. |
| Same-file open | One in-process writer per file identity; second scene shares or opens read-only. | Internal policy with user-visible UX | OpenDocumentRegistry | High | Adopt for MVP. |
| Auxiliary windows | Reference `ProjectSessionID`; do not instantiate another document/store. | Internal | Multiwindow shell | Medium | Adopt. |
| Audio resource ownership | `AVAudioSession`, route state, and media-reset handling belong to a process-wide coordinator. | Internal foundational contract | Native POA | Critical if multiple windows each assume ownership. | Add before first audio window. |
| Audible multiwindow policy | Decide whether only one project may sound at a time or whether sessions mix under one engine host. | User-visible | Audio coordinator, UX | High | Recommend one active audible session for MVP. |
| Rational time | Exact musical time remains canonical above all platform audio APIs. | Public semantic contract | AGL-002/003/041 | Critical | Preserve. |
| Render plan | Separate semantic plan authority from derived seconds/sample schedules without creating a second event model. | Public cross-platform contract | AGL-041, DR-03 reconciliation | Critical | Resolve before AGL-041 freezes. |
| Sample mapping | One versioned absolute-time-to-frame rule; no cumulative delta rounding. | Public behavioral contract | AGL-002/041 | Critical for deterministic fixtures | Adopt after rounding ADR approval. |
| Realtime audio | Scheduler/control plane may allocate; render plane consumes preallocated bounded events only. | Internal hard contract | AGL-043 | Critical | Enforce through code ownership and tests. |
| Plan revisions | Edits, seeks, and loop changes create monotonic generation IDs and an effective commit time/frame. | Cross-backend contract | AGL-031/041/043/044 | Critical | Standardize with DR-03. |
| Voice registry | Every voice/effect declares real-time support, manual-render support, determinism class, tail behavior, and supported formats. | Public registry/internal capabilities | AGL-042 | High if added after voices proliferate | Extend registry now. |
| Offline rendering | A separate manual engine uses the same graph descriptors and resolved plan; PCM streams to file. | Public export behavior | AGL-041/042/045 | High | Adopt. |
| Export tails | Render range must define effect/instrument tail policy. | Public export contract | AGL-041/045 | High | **Missing in DR-12; add before export schema freezes.** |
| Audio lifecycle | Explicit activation/interruption/reconfiguration/reset state machine. | Internal, testable behavior | AVAudioSession adapter | High | Adopt. |
| Background audio | Continue only audible, user-requested playback; stop visual animation. | App capability/user behavior | Audio coordinator | App Review and battery risk | Adopt. |
| Background export | Use continuous processing only for user-started export; partial output is transactional. | Internal service and release policy | ExportService | Medium-high | Adopt. |
| MIDI | Normalize UMP into canonical events without resolution loss; high-priority callback only enqueues. | Public event schema if serialized; internal transport | AGL-130 and new native MIDI work | High if 7-bit assumptions leak inward | Adopt before MIDI mappings. |
| MIDI mapping | Distinguish ephemeral performance events from commands that mutate the project. | Cross-platform behavioral contract | Command bus, transport | High | Specify two explicit paths. |
| Geometry | `CanvasProjection` emits framework-neutral primitives, semantic hit regions, accessibility projection, and renderer hints. | Public projection contract | AGL-050 | Critical for web/native parity | Add fields before projection v1. |
| Renderers | Canvas/Metal/RealityKit contain no lab mathematics or stable-ID generation. | Internal enforcement | AGL-050/051/052 | High | Module boundary and parity tests. |
| Linked selection | Stable semantic IDs connect graph, timeline, inspector, geometry, and provenance. | Cross-platform behavior | AGL-036/050 | High | Preserve. |
| Selection ownership | One linked selection within a studio scene; auxiliary scenes may need local selection or explicit “follow” mode. | Internal UX contract | DR-11 reconciliation | Medium | Do not force a single global selection object across all windows. |
| Adaptive UI | Layout responds to available dimensions; resizing does not reconstruct project/session models. | User-visible hard contract | Native shell, DR-11 | High UX regression risk | Adopt. |
| Commands | Menus, keyboard shortcuts, accessibility actions, touch, and Pencil dispatch the same semantic commands. | User-visible/cross-platform behavior | AGL-012, AGL-132 | High | Adopt. |
| Pencil | Advanced features produce the same command types as other modalities. | Internal input adapter | Native UI | Low migration if kept isolated | Adopt. |
| Accessibility | Canvas summary, inspectable selection, actions, adjustable values, semantic grouping, and non-color states are projection outputs. | Public accessibility contract | AGL-053/132 | High if retrofitted | Adopt before lab UI implementations. |
| Performance budgets | Budgets derive from measured workload/capability tiers, not device-name branches. | Internal policy, diagnostics-visible | AGL-025, native benchmark | Medium-high | Adopt. |
| Thermal response | Degrade presentation and speculative work before audio semantics. | Internal hard invariant | Audio/visual runtime | High correctness risk | Adopt. |
| Cross-platform sharing | Swift and TS consume identical schemas and goldens; implementation code remains separate initially. | Program architecture | AGL-133/135 | Medium | Adopt; measure maintenance before reconsidering. |
| API lifecycle | All Apple APIs are isolated behind adapters; beta APIs cannot leak into semantic contracts. | Internal architecture | Native scaffold | Medium | Adopt. |

---

# 4. Proposed ADRs

## ADR-DR12-001: Native Clients Are Platform Adapters over Canonical AGL Semantics

**Context**

AGL already defines platform-neutral project, time, event, graph, provenance, render-plan, and visualization concepts. A separate native semantic model would create incompatibility, duplicate migrations, and a permanent cross-platform tax that the current staffing model cannot absorb. 
**Decision**

The native client shall implement a ports-and-adapters architecture:

- canonical schemas, command contracts, stable-ID rules, operator definitions, fixtures, and semantic hashes are shared artifacts;
- Swift implements native adapters and semantic kernels against those contracts;
- SwiftUI, AVFoundation, Core MIDI, Metal, Files, and BackgroundTasks do not appear in canonical project or graph schemas;
- no platform adapter may introduce native-only project semantics.

**Alternatives considered**

- Embed TypeScript/JavaScript in the native application.
- Move all semantics immediately to Rust, C++, or C.
- Maintain independent native and web product models.
- Host the web app inside a native shell.

**Consequences**

- Two implementations must pass one conformance suite.
- Native can use first-class platform audio and UI APIs.
- Semantic changes require coordinated fixtures rather than hand-maintained transforms.
- A common executable core remains a future optimization, not a prerequisite.

**Risks**

- Dual implementation drift.
- Generated Swift/TS models may diverge if schema generation is not deterministic.
- Some floating-point kernels may require tolerance rather than byte equality.

**Evidence**

DR-12’s strongest conclusion and the existing AGL backlog.

**Confidence**

**Very high.**

---

## ADR-DR12-002: Canonical Logical Project Package with Versioned Physical Container Profiles

**Context**

DR-12 recommends a native document package containing a manifest, canonical project JSON, assets, and optional preview. Apple’s `FileDocument` supports directory packages. However, the report does not establish that a browser can create and ingest that same physical directory package through broadly supported web workflows. 

**Decision**

Freeze a **logical package contract** before freezing a physical container:

```text
agl.logical-package.v1
  manifest.json
  project.json
  assets/<content-hash>.<extension>
  preview/*  # derived, optional, non-authoritative
```

Prototype and select one or both physical profiles:

```text
agl.native-directory-package.v1
agl.portable-archive.v1
```

Both profiles must produce the same logical member set and semantic package hash. Physical archive metadata, directory timestamps, compression, and preview bytes are excluded from project semantic identity.

**Alternatives considered**

- One monolithic JSON document.
- Native directory package only.
- ZIP archive only.
- Separate unrelated native and web formats.

**Consequences**

- Web/native portability is preserved without pretending directories and downloaded archives are identical.
- Native Files behavior may use a package while web export may use an archive.
- The extension and UTI policy must make each physical profile unambiguous.
- Package import/export becomes a first-class adapter.

**Risks**

- Two physical profiles increase testing.
- Files providers may handle package directories differently.
- User expectations around “one file” must be considered.
- Archive extraction must be bounded and hostile-input-safe.

**Evidence**

Apple package support; AGL’s portable package and asset-store backlog requirements. 

**Confidence**

**High** for the logical package; **medium** for the final physical-profile choice.

**Status**

**Blocked pending physical-container POA.**

---

## ADR-DR12-003: Persistence Snapshots, Command-Owned Editing, and Platform Undo Adaptation

**Context**

`FileDocument` works as a value snapshot, while AGL requires atomic commands, inverse operations, grouped transactions, and deterministic undo/redo.

**Decision**

- `AGLDocument` is immutable persistence input/output.
- `ProjectStore` owns the active canonical snapshot.
- `CommandDispatcher` is the sole semantic mutation API.
- `UndoManager` registers command inverses and redispatches them.
- Gesture previews are transient; one gesture commits one semantic transaction.
- SwiftUI autosave observes committed document snapshots.
- No periodic autosave timer is added unless a crash-recovery POA demonstrates a distinct need.

**Alternatives considered**

- Direct SwiftUI bindings into project fields.
- Independent platform undo history.
- Recording every pointer sample as a command.
- Periodic timer-driven saves.

**Consequences**

- Touch, Pencil, keyboard, MIDI mapping, accessibility, and scripts share one behavior.
- Undo is deterministic and cross-platform-testable.
- Project snapshots may require copy-on-write or persistent data structures for efficiency.

**Risks**

- A naive implementation may copy large project graphs.
- Preview state and committed state can drift if transaction cancellation is poorly implemented.

**Evidence**

AGL-012 and DR-12 document architecture. 
**Confidence**

**Very high.**

---

## ADR-DR12-004: Three-Level Render Authority and Versioned Sample Quantization

**Context**

DR-03 specifies an immutable seconds-based audio render plan. DR-12 retains rational time and tempo-map information in `NativeRenderPlan` and converts it to sample frames at the backend. AGL must avoid having multiple independent event models.

**Decision**

Adopt three derived levels with one semantic authority:

```text
SemanticRenderPlan
  exact rational musical times
  tempo map identity/version
  event/voice/resource/provenance semantics

ResolvedAudioPlan
  deterministic seconds
  generation ID
  canonical conversion version
  same event IDs and ordering

NativeSchedule
  actual sample rate
  absolute sample frames
  route/engine epoch
  transient and non-serialized
```

`ResolvedAudioPlan` and `NativeSchedule` are deterministic projections of `SemanticRenderPlan`, not independently editable models.

Adopt a versioned seconds-to-frame rule after DR-03 reconciliation. Proposed v1 for nonnegative relative times:

\[
F_R(t)=\left\lfloor R\,t+\frac12\right\rfloor
\]

using exact rational arithmetic whenever `t` is exact.

**Alternatives considered**

- Seconds-only canonical persistence.
- Rational time directly inside render callbacks.
- Platform-specific event plans.
- Accumulating rounded frame deltas.

**Consequences**

- Exact musical semantics remain portable.
- Web can consume deterministic seconds.
- Native can schedule exact sample indices.
- Real-time and offline paths can compare plan and schedule hashes separately.

**Risks**

- Duplicated derived fields could become inconsistent.
- Tempo-ramp integration remains underspecified.
- Tie ordering for simultaneous events must be frozen separately.

**Evidence**

DR-03 and DR-12. 
**Confidence**

**High** in the layered model; **medium-high** in the proposed rounding rule until formally reconciled.

**Status**

**Requires cross-run reconciliation before AGL-041 freezes.**

---

## ADR-DR12-005: Native Real-Time and Offline Audio Use One Graph Factory and Separate Engines

**Context**

AGL requires real-time/offline plan equivalence. `AVAudioEngine` supports both hardware-connected real-time rendering and manual rendering, but manual mode disconnects the engine from devices. 

**Decision**

- `EngineGraphFactory` creates an engine graph from AGL voice/effect descriptors.
- `AVAudioEngineBackend` owns the live device engine.
- `NativeOfflineRenderer` owns a separate manual-rendering engine.
- Both consume the same `ResolvedAudioPlan`.
- AGL-owned deterministic synthesis is sample-identical between native real-time capture and native manual rendering at the same format, seed, and implementation version.
- Apple and third-party effects use declared numerical/audio tolerances.
- Export streams PCM blocks to a transactional destination and never buffers the whole artifact in memory.

**Alternatives considered**

- Put the live engine into manual mode for export.
- Export directly from the graph evaluator.
- Maintain a separate offline event representation.
- Record live output in real time.

**Consequences**

- Playback can continue while export is prepared, subject to thermal/resource policy.
- Manual-render compatibility becomes a voice/effect registry capability.
- Export tail behavior must be explicit.

**Risks**

- Some audio units may not support offline/manual rendering consistently.
- Built-in effect output may vary across OS revisions.
- Parallel live/export engines can create thermal pressure.

**Evidence**

Apple AVAudioEngine manual-rendering contract and DR-12. 

**Confidence**

**High**, conditional on the selected voice/effect capability matrix.

---

## ADR-DR12-006: Process-Wide Audio and MIDI Coordination with One Active Audible Project for MVP

**Context**

Documents and windows are scene-scoped, but `AVAudioSession`, hardware routes, media reset, and the system MIDI graph are process-wide. DR-12 does not fully resolve this ownership mismatch.

**Decision**

Introduce:

```text
AudioDeviceCoordinator
MIDIEndpointCoordinator
OpenDocumentRegistry
```

For MVP:

- only one project session is the **active audible session**;
- activating playback in another window performs an explicit, click-safe handoff;
- offline export remains independent;
- MIDI endpoint connections are process-owned and routed to an explicitly focused or configured project;
- no window may independently reconfigure `AVAudioSession`.

A future multi-project mix mode may replace the single-active policy behind the same session APIs.

**Alternatives considered**

- One independent `AVAudioEngine` and session controller per document window.
- One global engine with simultaneous project buses from day one.
- Prevent multiple document windows.

**Consequences**

- Route and interruption handling remain coherent.
- Multiwindow editing remains supported.
- The MVP avoids an accidental multi-DAW mixer problem.
- UI must clearly identify the audible project.

**Risks**

- Users may expect two windows to play simultaneously.
- MIDI focus can be ambiguous.
- Handoff semantics need clear transport state.

**Evidence**

Strong inference from Apple’s process-level audio-session model and DR-12’s multiwindow requirement. 

**Confidence**

**Medium-high.**

---

## ADR-DR12-007: Core MIDI UMP Is the Native Transport Authority

**Context**

Core MIDI’s modern event-list APIs use UMP and can represent MIDI 1 and MIDI 2. Legacy byte-list APIs are deprecated. MIDI callbacks run on a high-priority Core MIDI thread. 

**Decision**

- Core MIDI ingress and egress use `MIDIEventList`.
- The callback copies bounded records into a preallocated queue and returns.
- `MIDIRouter` normalizes records into `CanonicalMIDIEvent`.
- MIDI 2 resolution, group, per-note identity, endpoint, and timestamp are preserved.
- Down-conversion occurs only for a MIDI 1 output/export boundary and records quantization.
- Performance MIDI events and project-mutating MIDI mappings are separate paths.
- Standard MIDI File remains the default file export.

**Alternatives considered**

- Internally normalize everything to MIDI 1 bytes.
- Use deprecated packet-list APIs.
- Make external MIDI own AGL transport.
- Require MIDI-CI for MVP.

**Consequences**

- MIDI 1 and 2 devices share one internal model.
- MIDI mapping and output are timestamp-testable.
- The canonical event schema must support higher resolution without leaking Core MIDI types.

**Risks**

- Correct MIDI 2→1 scaling must follow the official specification.
- Endpoint hot-plug and network/BLE behavior vary.
- Background MIDI expectations require explicit product policy.

**Evidence**

Apple Core MIDI documentation and official MIDI specifications. 

**Confidence**

**High.**

---

## ADR-DR12-008: Semantic Projection Is Independent of Canvas, Metal, and RealityKit

**Context**

AGL’s labs span bounded vector geometry, dense grids, high-rate trajectories, and optional 3D views. Renderer choice must not alter lab mathematics.

**Decision**

`CanvasProjection` returns:

```text
world bounds
semantic primitives
stable primitive IDs
semantic hit regions
selection/provenance relationships
accessibility projection
export geometry
renderer hint
projection diagnostics/budgets
```

Renderers may tessellate, batch, rasterize, decimate for display, or animate, but may not:

- evaluate lab mathematics;
- generate stable semantic IDs;
- change selection topology;
- change exported geometry;
- invent accessibility meaning.

**Alternatives considered**

- One SwiftUI view per primitive.
- Metal for every lab.
- RealityKit for every lab.
- Renderer-specific projections.

**Consequences**

- Canvas/Metal parity becomes testable semantically.
- Dense rendering can evolve without changing lab logic.
- Accessibility is available even when pixels are GPU-rendered.

**Risks**

- Projection payloads may become large.
- Display decimation and exact export geometry need separate fields.
- Hit-test acceleration structures must preserve semantic results.

**Evidence**

DR-12 rendering recommendations and AGL-050/053. 
**Confidence**

**Very high.**

---

## ADR-DR12-009: Adaptive Studio Layout Changes Presentation, Not Semantic State or Permissions

**Context**

iPad windows are freely resizable. DR-11 also warns against turning Explore, Compose, and Inspect into hard permission modes.

**Decision**

- Layout is selected by available dimensions and content fit, not orientation.
- Resize never recreates `ProjectStore`, command history, transport, selection, evaluator, or render plan.
- Explore/Compose/Inspect alter emphasis and panel arrangement, not what the project is semantically allowed to do.
- Menus and shortcuts dispatch semantic commands through focused routing.
- Pointer, touch, keyboard, accessibility, and Pencil expose equivalent essential operations.

**Alternatives considered**

- Fixed landscape workstation.
- Separate compact project model.
- Hard beginner/expert applications.
- Gesture-only expert commands.

**Consequences**

- One session survives arbitrary iPad window changes.
- The interface can support external displays and floating windows.
- Commands remain discoverable through the iPad menu bar.

**Risks**

- Panel thresholds require real content-fit testing.
- Compact layouts can still become overly modal.
- Focus routing across auxiliary windows requires care.

**Evidence**

Apple iPadOS menu/adaptivity guidance and DR-11. 

**Confidence**

**High.**

---

## ADR-DR12-010: Accessibility Is a Projection and Command Contract

**Context**

Custom canvases do not become accessible merely because surrounding SwiftUI controls are accessible. Apple’s HIG requires multiple methods of conveying information, alternatives to gestures, Full Keyboard Access compatibility, and reduced-motion behavior. 

**Decision**

Every lab shall provide:

- a concise canvas summary;
- an inspectable selected semantic object;
- semantic navigation among meaningful groups;
- adjustable values and explicit actions;
- keyboard equivalents for essential manipulation;
- non-color state cues;
- reduced-motion representations that retain mathematical state;
- an aggregated accessibility tree, not one element per visual primitive.

**Alternatives considered**

- Per-pixel/per-cell accessibility nodes.
- A separate simplified accessibility application.
- Text summaries only.
- Color-only state encoding.

**Consequences**

- Accessibility conformance is reusable across web and native.
- Projection schemas must include semantic descriptions.
- Lab acceptance cannot be limited to visual screenshots.

**Risks**

- Aggregation may hide detail if navigation groups are poorly designed.
- VoiceOver interactions for dense graphs require representative-user testing.

**Evidence**

Apple HIG and DR-12’s U-P tests.

**Confidence**

**High.**

---

## ADR-DR12-011: Released iPadOS 26 APIs Are the Shipping Baseline; Beta APIs Are Quarantined

**Context**

The current SDK surface contains released-but-deprecated document initializers and beta replacements. Similar API churn appears around audio and background GPU resources.

**Decision**

- Deployment target: iPadOS 26.0.
- Shipping code uses released iPadOS 26 API forms.
- Apple-framework usage is isolated behind adapters.
- Warnings caused by future deprecation do not justify beta adoption.
- 2027-cycle document APIs and background GPU access remain experimental branches until final release and migration conformance.

**Alternatives considered**

- Ship on current beta APIs.
- Target older iPadOS versions.
- Let Apple API types leak into semantic modules.

**Consequences**

- Smaller support/QA matrix.
- Future migration should affect adapters only.
- Release engineering must compile against pinned SDK/build combinations.

**Risks**

- Deprecated released APIs may receive less future attention.
- Store submission requirements may evolve before release.

**Evidence**

Current Apple documentation. 

**Confidence**

**High for the present release; inherently time-limited.**

---

## ADR-DR12-012: Background Execution Is Explicitly User-Requested and Transactional

**Context**

AGL has two legitimate background cases: audible playback and a user-started long export. Continuous background tasks can be cancelled or terminated by the system.

**Decision**

- Audio background capability is used only for audible user-requested playback.
- Background playback stops all display-driven rendering and nonessential analysis.
- Long exports use `BGContinuedProcessingTask`.
- Export progress is externally visible.
- Destination writes use a temporary artifact plus atomic commit.
- Cancellation or termination leaves no artifact presented as complete.
- Silent evaluation, cache warming, or general daemon behavior may not use the audio background mode.

**Alternatives considered**

- Keep silent audio active to retain execution.
- Use discretionary `BGProcessingTask` for interactive export.
- Buffer the full export in memory and write at the end.

**Consequences**

- App Store posture is defensible.
- Export must support resumability or safe restart if termination is common.
- Thermal policy can defer export without altering project semantics.

**Risks**

- The system may terminate continuous processing.
- Progress and cleanup paths become part of correctness.

**Evidence**

Apple BackgroundTasks documentation and DR-12. 

**Confidence**

**High.**

---

# 5. Mathematical / Behavioral Contracts

## 5.1 Semantic authority and derived artifacts

The following relationship is normative:

```text
ProjectSnapshot
  ──deterministic compile/evaluate──► SemanticRenderPlan
  ──tempo resolution────────────────► ResolvedAudioPlan
  ──sample-rate/epoch resolution────► NativeSchedule
```

For a fixed:

```text
project semantic hash
operator versions
seed context
evaluation interval
evaluation budgets
tempo-map version
plan conversion version
```

the resulting `SemanticRenderPlan` and `ResolvedAudioPlan` must be deterministic.

`NativeSchedule` may differ by actual sample rate and route epoch, but its event ordering and correspondence to the resolved plan must remain deterministic.

## 5.2 Exact musical time to seconds

Let musical position be \(b\), measured in exact rational beats. Let the tempo map be \(\tau(b)\) beats per minute.

The continuous time between beat positions \(b_0\) and \(b_1\) is:

\[
T(b_0,b_1)=\int_{b_0}^{b_1}\frac{60}{\tau(b)}\,db
\]

For a piecewise-constant tempo map:

\[
T(b_0,b_1)
=\sum_i \Delta b_i\frac{60}{\mathrm{BPM}_i}
\]

where each \(\Delta b_i\) is an exact rational beat interval.

**Invariants**

1. Musical time remains exact until tempo integration.
2. Every event is resolved from its **absolute** musical position relative to a declared render epoch.
3. No implementation may accumulate rounded event-to-event frame deltas.
4. Evaluating or scheduling a subinterval must produce the same absolute event times as evaluating the containing interval and cropping.
5. Tempo-ramp integration method and tolerance must be versioned. DR-12 does not settle the ramp/interpolation model.

## 5.3 Seconds to sample frames

**Proposed contract pending ADR-DR12-004 acceptance**

For nonnegative exact relative time \(t=p/q\) seconds and integer sample rate \(R\):

\[
F_R(t)
=\left\lfloor \frac{pR}{q}+\frac12 \right\rfloor
=\left\lfloor\frac{2pR+q}{2q}\right\rfloor
\]

This is `nearestHalfUp-v1`.

**Invariants**

- Same exact time and sample rate produce the same integer frame on Swift and TypeScript.
- The rounding version is part of plan/schedule provenance.
- A route sample-rate change recomputes the transient native schedule; it does not alter project time or the resolved seconds plan.
- Start and end frames are resolved independently from absolute times:

\[
D_\mathrm{frames}=\max(0,F_R(t_\mathrm{end})-F_R(t_\mathrm{start}))
\]

No implicit “minimum one frame” correction is permitted unless the voice contract explicitly defines one and records it as an approximation.

## 5.4 Render-plan equivalence

For a project fixture \(P\):

\[
\mathrm{SemanticPlan}_{Swift}(P)
\equiv
\mathrm{SemanticPlan}_{TS}(P)
\]

where equivalence requires:

- identical event IDs;
- identical rational times;
- identical voice/resource references;
- identical parameters after canonical numeric encoding;
- identical stable ordering;
- identical seed and provenance references;
- identical approximation/diagnostic records.

For one platform and sample rate:

\[
\mathrm{NativeSchedule}_{RT}
=
\mathrm{NativeSchedule}_{Offline}
\]

at the event/control trace level.

**PCM equivalence**

- AGL-owned deterministic DSP, same binary implementation, format, seed, and graph: exact sample equality is required between native real-time capture and native manual render.
- Apple or third-party AU processing: semantic/event equality is exact; PCM comparison uses an effect-specific tolerance established by measurement.
- Cross-platform web/native PCM identity is **not** implied merely by plan equality.

## 5.5 Event ordering

DR-12 requires deterministic order but does not freeze simultaneous-event tie resolution. AGL-041 must establish one stable key.

Recommended order:

```text
(
  absoluteFrameOrCanonicalTime,
  eventPhasePriority,
  trackStableOrder,
  voiceStableOrder,
  eventStableID
)
```

`eventPhasePriority` must explicitly order safety release, control state, note-off, note-on, and ordinary control events. This proposal is an engineering recommendation, not established research.

## 5.6 Generation and commit semantics

Each committed playback plan has a monotonic session-local `generationID`.

For a transition from generation \(G_0\) to \(G_1\) at commit frame \(C\):

1. No new \(G_0\) onset may become audible at or after \(C\).
2. \(G_1\) events before \(C\) are not replayed as catch-up events.
3. Continuous controls at \(C\) are reconstructed from \(G_1\)’s effective state.
4. Existing \(G_0\) voices may:
   - stop at \(C\);
   - enter an explicit release;
   - crossfade into \(G_1\);
   only according to a declared voice/transition policy.
5. Panic invalidates every generation and clears pending queues.
6. Interruption recovery creates a new transport epoch and generation.
7. A seek never replays stale scheduled operations from the old position.

`generationID` is session state and is not part of `project.json`.

## 5.7 Command and undo invariants

For canonical state \(S\), command \(C\), and inverse \(C^{-1}\):

\[
C^{-1}(C(S)) \equiv S
\]

where equivalence is canonical semantic equality, including stable IDs and ordering.

A transaction \(T=[C_1,\ldots,C_n]\) has one inverse:

\[
T^{-1}=[C_n^{-1},\ldots,C_1^{-1}]
\]

**Required behavior**

- Gesture-down begins a transaction.
- Intermediate samples may alter transient preview state.
- Gesture-up commits one canonical transaction.
- Gesture cancellation restores the pre-gesture semantic hash.
- Undo returns exactly to the pretransaction semantic hash.
- Redo returns exactly to the committed posttransaction semantic hash.
- Autosave sees committed snapshots only.

## 5.8 Document/package invariants

A package is valid only if:

1. `manifest.json` and `project.json` validate against known schemas.
2. Every authoritative member listed in the manifest exists.
3. Every member content hash matches.
4. Unknown required compatibility features produce a non-destructive open failure.
5. Missing optional preview content does not invalidate the project.
6. Caches and previews are excluded from semantic identity.
7. Opening a corrupt or future project never overwrites the source.
8. Divergent cloud versions are preserved before any attempted merge.
9. Byte-level package merge is forbidden.
10. Automatic object-level merge requires:
    - a known common ancestor;
    - stable IDs;
    - deterministic conflict rules;
    - a complete merge receipt;
    - no silent deletion or overwrite.

## 5.9 Project state versus session state

The following are **not project semantics**:

```text
current selection
hover target
keyboard focus
panel visibility or dimensions
canvas viewport
window dimensions
current output route
requested/actual I/O buffer
AVAudioEngine state
MIDI endpoint connection
generation ID
audio-session activation
temporary export progress
```

They may be restored through scene or application state but must not affect canonical project hashes.

## 5.10 Audio real-time boundary

Inside any render callback or source-node audio block, code must not:

- allocate unbounded memory;
- parse JSON;
- invoke the graph evaluator;
- acquire a blocking mutex;
- wait on an actor;
- dispatch to the main queue;
- access Files/iCloud;
- enumerate MIDI devices;
- log per event;
- perform network access;
- mutate `ProjectStore`.

The callback may:

- read immutable voice state;
- consume a bounded lock-free or real-time-safe queue;
- update preallocated voice state;
- emit aggregate counters through a bounded telemetry path.

## 5.11 Audio lifecycle state machine

```text
IDLE
  └─ user Play ─► ACTIVATING

ACTIVATING
  ├─ success ─► RUNNING
  └─ failure ─► PAUSED_WITH_ERROR

RUNNING
  ├─ user Pause/Stop ─► PAUSED
  ├─ interruption began ─► INTERRUPTED
  ├─ route change ─► RECONFIGURING
  ├─ media services reset ─► HARD_RESET
  └─ panic ─► PANICKED

INTERRUPTED
  ├─ ended + resumable + prior intent was playing ─► ACTIVATING
  └─ otherwise ─► PAUSED

RECONFIGURING
  ├─ query actual route/format
  ├─ rebuild anchor/schedule
  ├─ create new generation
  ├─ success + valid prior intent ─► RUNNING
  └─ otherwise ─► PAUSED_WITH_ERROR

HARD_RESET
  ├─ discard engine/nodes/session-dependent objects
  ├─ recreate clean objects
  └─ PAUSED  # never automatic playback

PANICKED
  ├─ output silent
  ├─ pending queues empty
  └─ explicit reset ─► PAUSED
```

Apple’s interruption and route documentation supports explicit state preservation and reactivation, and requires recreation of orphaned audio objects after media reset. 

## 5.12 MIDI contracts

`CanonicalMIDIEvent` must preserve, when supplied:

```text
group
channel
message semantic
note number
note identifier
source resolution
controller/property identity
value
timestamp
source endpoint identity
protocol received
provenance
```

**Invariants**

- MIDI 2 values are never silently truncated to MIDI 1 resolution.
- MIDI 2→1 conversion follows the official MIDI scaling rules, not ad hoc bit truncation.
- Every lossy conversion emits a quantization/conversion record.
- The Core MIDI receive callback only performs bounded copying/enqueueing.
- Future output timestamps are derived from the same transport epoch used by audio.
- Endpoint hot-plug cannot mutate project state.
- MIDI Learn creates an explicit command/mapping; ordinary performance input remains ephemeral unless recording is armed.

## 5.13 Projection and renderer equivalence

For evaluation \(E\), viewport \(V\), and selection \(S\):

\[
\mathrm{Project}_{Canvas}(E,V,S)
\equiv_\mathrm{semantic}
\mathrm{Project}_{Metal}(E,V,S)
\]

Semantic equivalence requires:

- identical primitive semantic IDs;
- identical hit-target semantic IDs;
- identical selection relationships;
- identical provenance relationships;
- identical accessibility IDs and descriptions;
- identical export geometry;
- identical object ordering where ordering carries meaning.

Raster pixels, antialiasing, tessellation, and animation interpolation need not match.

Display decimation is allowed only if:

- the exact semantic source remains available;
- hit testing remains correct for presented objects;
- the UI discloses aggregation where it affects interpretation;
- export uses non-decimated canonical geometry unless explicitly requested.

## 5.14 Adaptive UI invariant

For any window-size transition:

```text
project semantic hash before == project semantic hash after
undo stack before == undo stack after
transport logical position preserved
selection preserved unless object becomes invalid
canvas world viewport preserved or deterministically reframed
active render generation not reset solely because of resize
```

## 5.15 Accessibility invariant

Every essential semantic operation must have at least one non-gesture path and one assistive-technology-compatible path.

No state may be represented by color alone. Apple explicitly recommends multiple indicators and alternatives to gestures. 

## 5.16 Thermal and memory invariants

A thermal or Low Power response may change:

```text
visual frame rate
visual primitive density
speculative evaluator prefetch
nonessential analysis overlays
cache construction
thumbnail generation
export concurrency
```

It may not silently change:

```text
notes
event times
rhythm
seed
operator semantics
project state
frozen content
exported composition
canonical render-plan hash
```

If audio correctness can no longer be maintained, the backend performs a controlled pause with a visible diagnostic rather than silently degrading the composition.

---

# 6. Test Oracle and Fixture Pack

## 6.1 Unit invariants

| Test ID | Input | Expected behavior/output | Tolerance | Why it matters | Research source |
|---|---|---|---|---|---|
| DOC-U01 | Minimal logical package | Valid manifest and project produce one canonical `ProjectSnapshot`. | Exact | Establishes package authority. | DR-12 package model. |
| DOC-U02 | Package with viewport, selection, route, or engine state added to `project.json` | Schema rejects or migration removes prohibited platform/session fields. | Exact | Prevents native-only semantics. | |
| DOC-U03 | One changed project parameter, unchanged large assets | Writer reuses unchanged asset members and hashes. | Exact member identity | Prevents autosave I/O amplification. | Apple package behavior.  |
| CMD-U01 | State \(S\), command \(C\), inverse \(C^{-1}\) | `hash(C⁻¹(C(S))) == hash(S)`. | Exact | Core undo correctness. | AGL-012. |
| CMD-U02 | 500 gesture samples in one transaction | One committed command and one undo registration. | Exact count | Prevents unusable undo histories. | DR-12 D-P05. |
| TIME-U01 | Rational beat and piecewise-constant tempo map | Exact rational seconds before frame conversion. | Exact rational | Prevents musical drift. | AGL exact-time contract. |
| TIME-U02 | Exact seconds \(p/q\), sample rate \(R\) | `floor((2pR+q)/(2q))` under proposed v1. | Exact integer | Cross-language sample determinism. | DR-03/DR-12 reconciliation. |
| TIME-U03 | Same absolute event computed from two interval queries | Same resolved seconds and frame. | Exact | Seek/cache/chunk invariance. | DR-12 plan requirements; DR-01 query invariance. |
| PLAN-U01 | Same project/revision/seed | Identical canonical plan serialization and hash. | Exact | Determinism and provenance. | AGL-041/133. |
| PLAN-U02 | New plan generation at commit frame \(C\) | No old-generation onset at or after \(C\). | Exact event trace | Prevents stale playback after edits. | DR-03 generation model. |
| PLAN-U03 | Interruption duration spanning many events | No catch-up burst. New epoch starts from preserved logical position. | Exact trace | Musical correctness after interruption. | DR-03/DR-12. |
| AUDIO-U01 | Real-time callback under instrumentation | No allocations, blocking waits, JSON, graph evaluation, or main-actor calls. | Zero violations | Hard RT boundary. | DR-12. |
| AUDIO-U02 | Panic from each audio state | Output reaches silence, queues clear, backend remains restartable. | Click-safe ramp defined by safety ADR | Safety. | AGL-049 / A-P12. |
| MIDI-U01 | MIDI 2 event with high-resolution value | Canonical event retains source value and resolution. | Exact | Prevents accidental MIDI 1 collapse. | Official MIDI 2 semantics.  |
| MIDI-U02 | MIDI 2 event sent to MIDI 1 endpoint | Official conversion applied; quantization record attached. | Per specification | Interoperability without hidden loss. | MIDI.org UMP spec.  |
| PROJ-U01 | Same `CanvasFrame` rendered by Canvas and Metal | Same semantic IDs, hit targets, accessibility IDs, and export geometry. | Exact IDs; geometry tolerance separately declared | Prevents renderer fork. | DR-12 U-P09. |
| A11Y-U01 | Generated/frozen, valid/invalid, selected/unselected states | Each state differs through label/icon/pattern/role in addition to color. | Manual + snapshot oracle | Accessibility hard contract. | Apple HIG.  |
| THERM-U01 | Thermal policy transition | Project and plan semantic hashes unchanged. | Exact | Ensures thermal response cannot alter composition. | DR-12 thermal policy. |

## 6.2 Property-based tests

| Property | Generated input | Oracle |
|---|---|---|
| Rational arithmetic closure | Random normalized fractions and long beat positions | No drift; canonical normalization; identical Swift/TS vectors. |
| Time-query invariance | Random containing interval \([a,c]\) and subinterval \([b,c]\) | Cropped containing result equals direct subinterval result. |
| Time chunk invariance | Random partitions \(a<b<c\) | Concatenated chunk plans equal whole-interval plan after stable merge. |
| Command invertibility | Random valid projects and commands | Applying command then inverse restores exact semantic hash. |
| Transaction associativity under declared grouping | Independent command sequences | Grouped and sequential application yield the same final project when commands are declared commutative/independent. |
| Stable-ID determinism | Random graph/project creation sequences with fixed seed | Swift and TS emit byte-identical IDs. |
| Migration idempotence | Historical fixtures and repeated migration | `migrate(migrate(x)) == migrate(x)` at target version. |
| Package round trip | Random bounded projects/assets | Decode/encode preserves project semantic hash and asset hashes. |
| Generation suppression | Random old/new generations and commit frames | No stale onset after commit; newest control state wins. |
| Sample-rate scaling | Random exact times; rates \(R\), \(2R\) | Frames at \(2R\) equal exactly \(2F_R\) where no half-rounding ambiguity exists; ambiguous cases follow versioned rounding. |
| MIDI resolution preservation | Random MIDI 1 and MIDI 2 channel voice values | UMP normalize/encode round trips at original protocol resolution. |
| Projection determinism | Random valid evaluations/viewports | Same input produces same semantic projection hash. |
| Thermal semantic invariance | Random projects and degradation levels | Project/plan hashes remain unchanged. |
| Selection non-persistence | Random selections and project saves | Project/package semantic bytes remain unchanged. |

## 6.3 Metamorphic tests

| Transformation | Expected invariant |
|---|---|
| Resize window from wide → narrow → wide | Project, undo, transport, selection, and plan generation remain intact. |
| Switch Canvas renderer to Metal | Semantic projection, export geometry, selection IDs, and accessibility descriptions remain equivalent. |
| Change output route/sample rate | Musical-time plan remains identical; only transient sample schedule and diagnostics change. |
| Move or rename package in Files | Project semantic identity remains unchanged. |
| Add/remove optional preview thumbnail | Project semantic hash remains unchanged. |
| Enable/disable Pencil hover or squeeze capability | All project operations remain available; resulting command for the same operation is identical. |
| Run real-time versus offline | Same resolved plan hash and event/control sample indices. |
| Open/save native then web, or web then native | Same canonical project and logical package member hashes. |
| Toggle reduced motion | Mathematical state and selection remain inspectable; only presentation motion changes. |
| Enter serious thermal state | Visual/evaluator fidelity may reduce; audio/event semantics remain unchanged. |
| Disconnect MIDI endpoint | Project remains valid and usable; no implicit command or deletion occurs. |
| Background and foreground during audible playback | No catch-up burst, duplicate event, stale generation, or semantic discontinuity. |
| Cancel export at arbitrary block | No final destination is committed; temporary state is cleaned or resumably journaled. |

## 6.4 Golden fixtures

### TIME-G01 — Constant tempo, 120 BPM, 48 kHz

At 120 BPM:

\[
1\text{ beat}=0.5\text{ seconds}
\]

| Beat position | Exact seconds | Expected frame |
|---:|---:|---:|
| \(0\) | \(0\) | 0 |
| \(1/3\) | \(1/6\) | 8,000 |
| \(1\) | \(1/2\) | 24,000 |
| \(4\) | \(2\) | 96,000 |

### TIME-G02 — Constant tempo, 120 BPM, 44.1 kHz

| Beat position | Exact seconds | Expected frame |
|---:|---:|---:|
| \(0\) | \(0\) | 0 |
| \(1/3\) | \(1/6\) | 7,350 |
| \(1\) | \(1/2\) | 22,050 |
| \(4\) | \(2\) | 88,200 |

### TIME-G03 — Piecewise tempo map, 48 kHz

```text
beats [0,4): 120 BPM
beats [4,8): 60 BPM
```

| Beat position | Exact seconds | Expected frame |
|---:|---:|---:|
| 0 | 0 | 0 |
| 4 | 2 | 96,000 |
| 6 | 4 | 192,000 |
| 8 | 6 | 288,000 |

### TIME-G04 — Half-sample rounding

At 48 kHz:

\[
t=\frac{1}{96{,}000}\text{ seconds}
\]

is exactly half a sample. Under proposed `nearestHalfUp-v1`:

```text
expected frame = 1
```

This fixture must be rejected or changed if AGL chooses nearest-even or another rule; it therefore guards the conversion-version decision.

### TIME-G05 — Long position, no accumulation

At 120 BPM, 40,000 beats equals 20,000 seconds.

At 48 kHz:

```text
expected frame = 960,000,000
```

The result must be computed from absolute time and must not depend on how the interval was chunked.

### DOC-G01 — Minimal project package

```text
manifest.json
project.json
```

Expected:

- valid logical package;
- no asset directory required;
- no preview required;
- project semantic hash stable after native/web round trips.

### DOC-G02 — Asset package

```text
manifest.json
project.json
assets/sha256-<A>.wav
assets/sha256-<B>.json
preview/thumbnail.png
```

Mutation:

```text
change one project parameter only
```

Expected:

- project/member hash changes;
- asset A and B content and hashes unchanged;
- preview may change without affecting project semantic hash.

### CMD-G01 — Euclidean ring drag

Input:

- five-second phase drag;
- 500 raw positions;
- snapped final phase of \(3/16\).

Expected:

- one `SetRingPhase` transaction;
- one undo registration;
- undo restores exact predrag hash;
- redo restores exact postdrag hash.

### PLAN-G01 — P0 rhythm plan

One fixture containing:

- exact rational events;
- simultaneous events;
- tempo change;
- loop boundary;
- control event;
- generated and frozen content;
- stable provenance IDs.

Expected:

- Swift and TS canonical plan equality;
- deterministic tie ordering;
- native 48 kHz and 44.1 kHz schedules with known frame vectors;
- real-time/offline event equality.

### MIDI-G01 — Mixed MIDI 1/MIDI 2 UMP

Include:

- MIDI 1 note on/off;
- MIDI 1 CC;
- MIDI 2 high-resolution CC;
- per-note MIDI 2 expression;
- group/channel distinctions;
- future timestamps.

Expected:

- exact UMP normalization;
- preserved source resolution;
- explicit MIDI 1 down-conversion records;
- stable ordering and endpoint provenance.

### PROJ-G01 — Euclidean semantic projection

Expected:

- ring, step, active onset, playhead, selection, and provenance IDs;
- exact hit regions;
- one aggregated VoiceOver ring group with step navigation;
- Canvas/Metal semantic parity.

## 6.5 Cross-platform conformance tests

| Test | Required comparison | Required result |
|---|---|---|
| CP-01 Project parse | Same package in Swift and TS | Equivalent canonical project model and diagnostics. |
| CP-02 Migration | Every historical schema fixture | Same target model and semantic hash. |
| CP-03 Commands | Shared command sequence | Same intermediate and final hashes; same errors. |
| CP-04 Graph compile | Shared valid/invalid graphs | Same topological order, cycle/type errors, and budgets. |
| CP-05 Evaluation | Shared intervals and seeds | Same canonical events and provenance. |
| CP-06 Resolved plan | Same project/range | Same seconds, order, generations, resources, and plan hash. |
| CP-07 Sample schedule | Same resolved plan and sample rate | Same integer sample indices. |
| CP-08 Projection | Same evaluation/viewport/selection | Same semantic projection and export geometry. |
| CP-09 MIDI file export | Same project/range | Byte-identical SMF or documented deterministic metadata exclusions. |
| CP-10 Package round trip | Web → native → web and native → web → native | Same logical package member hashes and project semantics. |
| CP-11 Corruption | Same malformed packages | Equivalent error categories and source preservation. |
| CP-12 Accessibility content | Same selected semantic object | Same mathematical description content; platform-specific tree allowed. |

## 6.6 Performance tests

### Required telemetry

```text
device tier and identifier
OS build
application build
audio route
actual sample rate
actual I/O buffer duration
reported output latency where available
render-plan and native-schedule hashes
voice count
event density
graph/evaluator load
projection primitive count
renderer
window configuration
foreground/background state
thermal state
Low Power Mode
memory footprint
battery/energy trace
scheduler misses/duplicates/stale events
export real-time factor
```

### Device tiers

| Tier | Representative purpose |
|---|---|
| **Floor** | Oldest supported iPadOS 26 hardware class; memory/CPU/GPU constraint testing. |
| **Installed-base Apple silicon** | Common M1-class performance reference. |
| **Current mainstream** | Contemporary Air-class performance. |
| **Current high end** | Pro-class maximum density and high-refresh/external-display testing. |
| **Compact** | Mini-class thermal density and compact layout. |

The support floor remains every iPad that the final app’s chosen iPadOS 26 deployment target actually supports at release time; exact marketed models must be reverified during release qualification.

### Workload ladders

```text
simultaneous voices: 1, 8, 32, 64, 128
scheduled events/s: 10, 100, 500, 1,000+
Euclidean rings: 1, 4, 8
increasing CA dimensions
increasing fractal primitive counts
increasing chaos trajectory point rates
live evaluator + autosave + Pencil input
resize + inspector animation + playback
foreground, background, locked screen
built-in, wired/USB, Bluetooth/AirPlay where available
```

### Required acceptance gates

| Area | Gate |
|---|---|
| Internal onset accuracy | Expected versus captured pre-output onset differs by no more than one sample. |
| Nominal floor-device playback | Zero missed, duplicated, or stale semantic events in the accepted nominal workload. |
| Synthetic scheduler | One million deterministic queue events produce zero loss, duplication, or reordering. This tests scheduling infrastructure, not one million simultaneous voices. |
| UI contention | Resizing, Canvas/Metal rendering, autosave, and inspector work do not cause semantic audio misses at nominal load. |
| Real-time/offline parity | Every event/control sample index agrees. |
| AGL-owned DSP | Native real-time capture and native offline output are sample-identical at equal format. |
| Platform effects | Pass effect-specific tolerance and semantic trace requirements. |
| Route changes | No stale generation; logical transport position preserved or explicitly paused. |
| Interruption | No catch-up burst. |
| Background playback | Thirty-minute user-requested playback remains semantically continuous. |
| Export | Progress, cancellation, bounded memory, transactional destination, and no corrupt final artifact. |
| Thermal | Serious-state visual/evaluator degradation engages before audio semantic degradation. |
| Memory | No monotonic cache/voice/resource growth during a 30-minute soak. |
| Emergency stop | Silence and queue invalidation from every state; backend restartable. |
| Package save | Parameter-only edit does not rewrite or reencode unchanged large assets. |
| Resize | State-preservation invariants pass through narrow, medium, wide, portrait, floating, and external-display configurations. |

No end-to-end “low latency” number should become a release claim until physical loopback measurements exist.

## 6.7 Perceptual and user-validation studies

DR-12 does not require psychoacoustic experiments, but it does require user studies for high-risk interaction and recovery semantics.

| Study | Participants / conditions | Task | Measures |
|---|---|---|---|
| Conflict recovery comprehension | Users familiar and unfamiliar with Files/iCloud | Resolve two divergent project versions without losing work | Correct recovery, time, confidence, mistaken overwrite rate |
| Modality equivalence | Touch-only, keyboard/Full Keyboard Access, VoiceOver, pointer, Pencil-capable hardware | Complete P0 Euclidean and Infinite Staircase tasks | Completion, errors, assistance, time, inaccessible operations |
| Resize continuity | Users working while window repeatedly resizes | Continue edit/play/inspect task | State-loss incidents, orientation confusion, task disruption |
| Route-latency comprehension | Built-in, wired, Bluetooth | Perform direct manipulation and interpret route warning | Perceived responsiveness, warning comprehension, route choice |
| Dense-canvas accessibility | VoiceOver and low-vision users | Navigate CA/chaos summaries and selected state | Task success, navigation count, tree overload, comprehension |
| Panic discoverability | Mixed users | Silence unexpected output immediately | Time-to-panic, failure rate, post-panic recovery |
| Generated/frozen recognition | Cross-run DR-11 integration | Identify editable/generated/frozen material and predict regeneration | Accuracy and confidence |

---

# 7. Recommended Defaults

| Parameter | Default | Valid/recommended range | Rationale | Evidence strength | User-facing? |
|---|---|---|---|---|---:|
| Native deployment target | iPadOS 26.0 | 26.x shipping baseline | Reduces compatibility matrix and uses the intended window/background environment. | Engineering recommendation grounded in DR-12 | No |
| API stability policy | Released APIs only | Beta only in isolated experiments | Prevents shipping architecture from depending on provisional 2027 APIs. | Strong | No |
| Document scene | `DocumentGroup<FileDocument>` | `UIDocument` fallback if conflict POA fails | Native Files and multiwindow integration. | Strong | Indirect |
| Logical project form | Package | Manifest + project + assets + optional preview | Supports assets and incremental saves. | Strong | Yes |
| Physical package profile | **Not yet justified** | Native directory, portable archive, or both | Web/native physical compatibility remains unresolved. | Insufficient | Yes |
| `project.json` authority | Canonical semantic project | One per package | Preserves one cross-platform project representation. | Strong | No |
| Preview | Optional, derived, discardable | None or bounded thumbnail set | Must not affect semantic identity. | Engineering recommendation | No |
| Asset identity | SHA-256 content addressing | Immutable assets | Aligns with AGL-014/015. | Existing program direction | No |
| Autosave | SwiftUI/document dirty-state lifecycle | No periodic timer | Avoids duplicate write authority and package races. | Strong | Indirect |
| Crash journal | Off | Enable only after POA evidence | DR-12 does not show system autosave is insufficient. | Insufficient for default-on | Indirect |
| Same-file multiwindow | Single writer | Shared session or read-only secondary | Avoids in-process divergence. | Engineering recommendation | Yes |
| Audible-project policy | One active project | Future process-wide multi-session mixer | Simplest safe global audio-session policy. | Strong inference | Yes |
| Audio session category | `.playback` | Change only when actual input is added | Output-centric composition app. | Strong | No |
| Audio session mode | `.default` | Voice/input-specific modes only when needed | Avoids unnecessary routing semantics. | Strong | No |
| Mix-with-other-audio policy | **Not justified** | Interrupt, mix, duck—product decision | DR-12 does not decide whether AGL should coexist with other media. | Insufficient | Yes |
| Requested sample rate | Do not force | Use actual activated route rate | Route owns final format. | Strong | Diagnostics |
| Requested I/O buffer | **No universal default justified** | Benchmark per route/device | Requests are not guarantees. | Insufficient | Advanced diagnostics |
| Frame rounding | Proposed nearest-half-up v1 | Versioned alternatives only through migration | Deterministic cross-platform mapping. | Cross-run recommendation | No |
| Scheduler control wake | 25 ms provisional | Adaptive | DR-03 starting point, not platform guarantee. | Engineering hypothesis | No |
| Initial scheduling horizon | 100 ms provisional | Adaptive up to 250 ms initial ceiling | Reconciles DR-03 and DR-12 starting points. | Engineering hypothesis | Advanced diagnostics |
| Bluetooth policy | High/variable-latency route | Do not advertise low-latency control | Sequencing can remain internally exact while output arrives later. | Strong | Yes |
| Live graph mutation | Parameter changes only | Structural changes through controlled rebuild | Avoids runtime graph hazards. | Strong | No |
| AGL deterministic synthesis | Custom source/AU where required | Sampler where semantics are sufficient | Enables native RT/offline identity. | Engineering recommendation | No |
| Offline engine | Separate manual engine | Same graph factory and resolved plan | Protects live device engine. | Strong | No |
| Offline block size | **Not justified** | Benchmark and cap memory | DR-12 does not establish a universal value. | Insufficient | No |
| Export tail | **Not justified** | Explicit fixed, silence-detected, or descriptor-defined policy | Missing contract. | Insufficient | Yes |
| Long export background API | `BGContinuedProcessingTask` | User-initiated only | Matches platform model. | Strong | Yes |
| Background playback | Enabled only while audible and user-requested | Stop visuals; retain bounded audio/MIDI work | App Review, battery, and correctness. | Strong | Yes |
| MIDI internal transport | UMP/`MIDIEventList` | Endpoint protocol negotiated | Preserves MIDI 1 and 2. | Strong | No |
| MIDI file export | Standard MIDI File | UMP/MIDI Clip file later | Broad interoperability. | Strong recommendation | Yes |
| MIDI-CI | Off for MVP | Future capability negotiation | Not needed for core scope. | Strong recommendation | Yes |
| Default 2D renderer | SwiftUI `Canvas` | Metal after measured threshold | Simplest semantic 2D path. | Strong | No |
| CA renderer | Metal/MetalKit | Canvas static/accessible fallback | Dense grid workload. | Strong inference | No |
| Chaos renderer | Metal for live dense trajectory | Canvas frozen; optional RealityKit 3D | Continuous dense geometry. | Strong inference | Yes |
| RealityKit | Off by default | Optional genuine 3D view | Avoids unnecessary scene machinery. | Strong recommendation | Yes |
| Layout switching | Content-fit dimensions | No orientation-only branches | iPad windowing is continuously resizable. | Strong | No |
| Numeric layout thresholds | **Not justified** | Establish through UX prototype/content fit | Report provides layouts, not breakpoints. | Insufficient | No |
| Pencil hover | Preview only | Capability-gated | Cannot be required for discovery. | Strong | Yes |
| Pencil squeeze | Contextual discrete action | Respect user preference; may be unavailable | System preference can own the gesture. | Strong | Yes |
| Pencil barrel roll | Expressive stroke orientation only | Never generic parameter control | Appropriate to expressive drawing, not arbitrary knobs. | Strong | Yes |
| Accessibility tree | Aggregated semantic groups | Detail through focus/actions/rotors | Avoids unusable primitive-per-node trees. | Strong recommendation | Yes |
| Reduced motion | On when system setting requests it | Preserve exact mathematical state | HIG requirement. | Strong | Yes |
| Thermal degradation | Presentation and speculative work first | Controlled pause at critical failure | Never alter composition semantics. | Strong recommendation | Yes |
| Analytics/accounts | None in native MVP | Add only with explicit product decision and disclosure | Maximizes local-first privacy posture. | Engineering recommendation | Yes |
| Microphone permission | Not requested | Add only with actual input/recording scope | Avoids unnecessary capability and privacy surface. | Strong | Yes |
| iPhone scope | Companion/read/performance controls only | Full studio deferred | Capacity and screen-density constraint. | Engineering recommendation | Yes |

---

# 8. UX / Visualization Implications

## 8.1 Hard UX contracts

The following are architecture contracts rather than visual preferences:

1. **Resizing is non-destructive.**
2. **No essential operation is hover-only, pointer-only, Pencil-only, drag-only, or color-only.**
3. **Every visual selection resolves to a stable semantic ID.**
4. **Generated, frozen, edited derivative, stale, valid, and invalid states require semantic labels and non-color cues.**
5. **Canvas and Metal must expose the same semantic interaction targets.**
6. **A renderer may simplify display density but may not silently change mathematical output.**
7. **Menus and keyboard shortcuts invoke the same command bus as touch.**
8. **A long drag is one semantic operation unless the tool is explicitly a sequence recorder.**
9. **Audio route and latency class must be visible when relevant to direct manipulation.**
10. **Panic must remain immediately discoverable in every layout.**
11. **Explore, Compose, and Inspect change emphasis, not project permissions.** DR-11 explicitly warns against hard semantic modes that make valid editing unexpectedly unavailable.
12. **Generated and frozen content must not be visually indistinguishable.**

## 8.2 Adaptive studio layouts

### Wide

```text
┌────────────────┬─────────────────────────────────┬────────────────┐
│ Project/lab    │                                 │ Inspector      │
│ browser        │          Main canvas            │ Parameters     │
│                │                                 │ Math           │
│ Presets        │                                 │ Provenance     │
│                ├─────────────────────────────────┤ Diagnostics    │
│                │ Transport / timeline / mixer    │                │
└────────────────┴─────────────────────────────────┴────────────────┘
```

### Medium

```text
┌───────────────┬──────────────────────────────────────────────────┐
│ Collapsible   │                                                  │
│ sidebar       │                  Main canvas                     │
│               │                                                  │
├───────────────┴──────────────────────────────────────────────────┤
│ Transport / expandable timeline             [Inspector toggle]  │
└──────────────────────────────────────────────────────────────────┘
```

### Narrow, portrait, or small floating window

```text
┌──────────────────────────────────────────────────────────────────┐
│ Title / transport / panic / contextual tool                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         Main canvas                              │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Selected-object summary / primary value                          │
└──────────────────────────────────────────────────────────────────┘

Sidebar: on-demand
Inspector: resizable sheet/drawer
Timeline: expandable bottom surface
```

The threshold between these layouts must be based on whether the required canvas, touch targets, and inspector content fit—not fixed portrait/landscape labels.

## 8.3 Semantic command surface

```text
Project
  New
  Open
  Save a Copy
  Package Diagnostics
  Export

Edit
  Undo
  Redo
  Cut
  Copy
  Paste
  Duplicate
  Delete

Transport
  Play/Pause
  Stop
  Seek
  Loop
  Panic

Selection
  Select All
  Clear
  Next
  Previous
  Follow Provenance

View
  Toggle Browser
  Toggle Inspector
  Toggle Timeline
  Reset View
  Fit Selection
  Reduced Detail

Lab
  Lab-specific semantic commands

MIDI
  Devices
  Learn
  Mapping
  Panic
```

The menu bar should remain complete even when commands are currently disabled, consistent with Apple’s iPadOS menu-bar guidance. 

## 8.4 Per-lab rendering and interaction implications

| Lab | User goal | Required visible information | Interaction behavior | Mathematical/scientific meaning | Misleading representation to avoid | Accessibility |
|---|---|---|---|---|---|---|
| Infinite Staircase | Observe and manipulate layered tempo progression | Logical layers, log-tempo coordinate, gain, source phase, dominant/active bands, transport position | Canvas selection, scrub, layer inspect; Pencil hover optional | Layer relabeling and continuous progression | Implying the visually strongest layer is necessarily perceived tempo | Summarized layer groups, adjustable phase/rate, non-motion state |
| Euclidean Rings | Create and compare cyclic onset patterns | \(k,n\), rotation, onset sectors, playhead, ring alignment | Direct ring rotation, step toggle, keyboard nudge, haptic snap | Exact cyclic distribution and phase | Freehand-looking sectors that imply inexact placement | Ring group summaries, step navigation, exact values |
| Tonnetz Walk | Edit harmonic/topological paths | Lattice coordinates, triads, path order, selected relation | Trace path, select vertex/triad, keyboard next/previous | Adjacency and harmonic transformation | Perspective/3D effects that distort adjacency | Semantic path sequence and relation labels |
| Fractal Motif | Draw/edit seed and inspect ancestry | Seed motif, recursion depth, branch ancestry, budget forecast | Pencil drawing optional; exact numeric/keyboard editing remains | Recursive derivation and event lineage | Treating display decimation as loss of actual branches | Hierarchical ancestry navigation and bounded summaries |
| Cellular Automaton | Inspect generations and sonification links | Rule, boundary, generation, selected cell, local neighborhood, density | Metal grid selection/edit; static semantic fallback | Discrete cell evolution | One accessibility element per cell in a huge grid; interpolated states | Generation summaries, row/cell navigation on demand |
| Chaos Attractor | Explore trajectory and initial-condition sensitivity | Parameters, current state, time mode, selected point, mapping stages | Metal trajectory; numeric input and precise scrub | Numerical trajectory and live/frozen semantics | Smoothing or downsampling presented as original trajectory | Frozen summary, selected point values, reduced-motion trace |
| Penrose Sequencer | Inspect finite patch, adjacency, and traversal | Tile IDs/types, adjacency, clipping boundary, path order | Canvas select/edit/traverse; keyboard path operations | Exact finite aperiodic geometry after DR-09 acceptance | Decorative pseudo-Penrose geometry; hidden clipped adjacency | Tile/path groups and explicit adjacency descriptions |

## 8.5 Pencil mapping policy

| Feature | Allowed | Prohibited |
|---|---|---|
| Contact | Direct manipulation equivalent to touch | Hidden semantic state accessible only by Pencil |
| Pressure | Optional accent, velocity, brush width | Sole path to an exact value |
| Hover | Preview target, insertion point, candidate vertex, tool footprint | Required discovery or invocation |
| Double tap | Preferred tool switch or configured discrete action | Overriding the user’s preferred system behavior without consent |
| Squeeze | Contextual palette or discrete mode/tool action | Required command; continuous parameter modulation |
| Roll | Expressive stroke orientation | Tempo, ring phase, rotation, generic knob control |
| Haptics | Snap, alignment, path completion, discrete confirmation | Continuous high-frequency feedback that drains battery or obscures meaning |

## 8.6 Accessibility projection pattern

A custom canvas should expose roughly:

```text
Canvas summary
  “Euclidean sequencer with 4 rings; ring 2 selected; playback at beat 3.”

Semantic groups
  Ring 1
  Ring 2
  Ring 3
  Ring 4

Selected object
  label
  mathematical value
  generated/frozen status
  provenance summary

Actions
  Select
  Inspect
  Audition
  Move next/previous
  Rotate/increment/decrement
  Freeze or reveal generator
  Delete where valid
```

It should not expose thousands of low-level drawing primitives unless the user explicitly enters a detail-navigation mode.

---

# 9. User-Facing Scientific Claims

DR-12 is primarily platform and engineering research. It supports only a limited set of “scientific” claims; most safe copy is technical and should remain bounded.

## Safe to state directly

- “AGL preserves exact musical-time semantics above each platform’s audio backend.”
- “Native real-time playback and native offline export use the same canonical plan.”
- “MIDI 2 extends MIDI 1 with higher-resolution channel messages and additional per-note expression while prioritizing compatibility.” 
- “Advanced Apple Pencil interactions depend on supported Pencil and iPad hardware.”
- “AGL project files are designed to remain portable across native and web implementations through shared schemas and conformance fixtures.”
- “AGL’s visual renderers consume the same semantic geometry and selection model.”

These are safe only after the associated conformance tests pass in the shipping build.

## Safe only with qualification

| Claim | Required qualification |
|---|---|
| “Sample accurate” | Say **internally sample-indexed** or **sample-accurate within the native engine graph under tested conditions**. Do not imply zero end-to-end hardware latency. |
| “Low latency” | Name the tested device, OS, route, sample rate, and workload. Built-in/wired and Bluetooth results must be separated. |
| “Real-time and offline are identical” | Event and plan semantics are identical. PCM is sample-identical only for AGL-owned deterministic DSP at the same format; platform effects use tolerance-based equivalence. |
| “Works with iCloud Drive” | Files/document integration is supported; conflict behavior is subject to the accepted conflict POA. |
| “Export continues in the background” | A user-started export may continue through a continuous background task, but the system can cancel or terminate it.  |
| “Supports every iPad on iPadOS 26” | Functional support is intended; density and performance budgets adapt by measured capability. |
| “MIDI 1 and MIDI 2 compatible” | State the supported message families, conversion behavior, and endpoint matrix. |
| “Accessible canvas” | Only after VoiceOver, Full Keyboard Access, reduced-motion, non-color, and representative-user tests pass. |
| “No data collected” | Only after auditing AGL code, every SDK, privacy manifests, network MIDI, and release configuration. |
| “Pencil optimized” | All essential functionality remains available without Pencil Pro features. |

## Do not claim

- “Bluetooth provides low-latency performance.”
- “Native output is more accurate than the web version” without measured task-specific evidence.
- “Every Apple Audio Unit produces bit-identical real-time and offline audio.”
- “iCloud automatically merges AGL projects without conflict.”
- “The `.agl.project` directory package is already universally browser portable.”
- “Background exports are guaranteed to finish.”
- “MIDI 2 automatically improves sound quality.”
- “Apple Pencil roll provides more precise control of arbitrary parameters.”
- “Metal rendering is mathematically more accurate than Canvas.”
- “All iPadOS 26 devices can sustain the same project density.”
- “No thermal or battery impact.”
- “The native app has complete App Store privacy compliance” before final dependency and configuration review.
- “Full iPhone studio support” in the first native milestone.
- “Realtime/offline equivalence” if the selected sampler/effect does not pass manual-render capability tests.

---

# 10. Implementation Recommendations

## 10.1 Must happen before MVP architecture freezes

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Freeze the canonical semantic boundary between project, command, graph, render plan, projection, and platform adapters. | Critical | L | AGL-010/012/041/050 |
| Resolve `SemanticRenderPlan` → `ResolvedAudioPlan` → `NativeSchedule` semantics with DR-03. | Critical | L | DR-03, AGL-041 |
| Version the tempo-integration and seconds-to-frame conversion rules. | Critical | M | AGL-002/041 |
| Define the logical package schema and run native-directory versus portable-archive interoperability POA. | Critical | M | AGL-010/014/015 |
| Run the destructive `FileDocument` iCloud/File Provider conflict POA. | Critical | M | Native document scaffold |
| Define `UIDocument` fallback acceptance and keep lower APIs persistence-neutral. | High | S | Conflict POA |
| Extend the command schema to support transaction begin/preview/commit/cancel semantics. | Critical | M | AGL-012 |
| Decide process-wide audio ownership and one-active-audible-project MVP policy. | Critical | M | Native shell |
| Decide process-wide MIDI endpoint ownership and project routing/focus. | High | M | MIDIRouter |
| Freeze voice/effect capability metadata: RT, offline, deterministic class, tail, format, latency. | Critical | M | AGL-042 |
| Define export tail semantics. | High | M | AGL-041/045 |
| Add canonical semantic hashes and shared Swift/TS fixture loading to CI. | Critical | L | AGL-133 |
| Extend `CanvasProjection` with hit regions, accessibility projection, exact export geometry, and renderer hints. | High | M | AGL-050 |
| Freeze project-state versus scene-state exclusions. | Critical | S | AGL-010 |
| Establish released-API adapter boundaries and forbid beta API imports outside experimental targets. | High | S | Native scaffold |
| Define transactional export destination and cancellation semantics. | High | M | AGL-045 |
| Decide audio-session mix/duck/interruption policy with other apps. | High | S | Product/UX |

## 10.2 Must happen before the affected lab ships

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Execute floor-device native scheduler and loopback benchmarks. | Critical | L | AGL-043/native backend |
| Pass route, interruption, media-reset, background, and panic state tests. | Critical | M | AudioDeviceCoordinator |
| Pass real-time/offline event equality for every voice used by the lab. | Critical | M | AGL-042/045 |
| Establish Canvas/Metal escalation thresholds from measured primitive and frame budgets. | High | M | AGL-025/050 |
| Pass touch, keyboard, Full Keyboard Access, VoiceOver, pointer, and non-advanced-Pencil operation for each P0 lab. | Critical | L | AGL-132 |
| Implement renderer semantic parity fixtures. | High | M | AGL-050/051/052 |
| Define lab-specific accessibility aggregation and navigation. | High | M | AGL-053 |
| Validate generated/frozen distinctions with DR-11 UX semantics. | High | M | AGL-027/032/036 |
| Validate causal/live versus frozen operators with DR-08. | Critical for applicable labs | M | DR-08 |
| Verify MIDI message subset and endpoint behavior for any MIDI-enabled lab. | High | M | MIDIRouter/AGL-130 |
| Run thermal soak with evaluator, renderer, autosave, and audio concurrently. | High | L | AGL-025/native performance |
| Prove no renderer code contains lab mathematics or stable-ID generation. | High | S | Code architecture review |
| Verify conflict-safe save/reopen for projects containing each lab’s assets. | High | M | Package adapter |

## 10.3 Can safely happen after MVP

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Full iPhone studio authoring parity. | Medium | XL | Mature adaptive iPad architecture |
| iPhone companion transport/performance controller. | Medium | L | Stable native semantic modules |
| Automatic object-level cloud merge. | Medium-high | XL | Common ancestor and command/merge semantics |
| Common Rust/C/C++ executable core. | Medium | XL | Measured dual-implementation maintenance cost |
| RealityKit 3D chaos mode. | Low-medium | L | Accepted 2D projection and performance budget |
| MIDI-CI profiles/property exchange. | Medium | L | Mature UMP routing |
| UMP-oriented MIDI file export. | Low-medium | M | Stable MIDI 2 interchange demand |
| Multi-project simultaneous audio mixing. | Medium | XL | Process-wide engine host and UX |
| Automatic export resume after background termination. | Medium | L | Durable export checkpoint format |
| Migration to 2027 SwiftUI document APIs. | Medium | L | Final OS release and conformance POA |
| Advanced external-display performance workspace. | Medium | L | Stable adaptive shell |
| Custom third-party AU hosting. | Medium-high | XL | Sandboxing, state persistence, offline capability model |

## 10.4 Research-only / experimental

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Background GPU export/visual rendering | Low for MVP | L | Final non-beta entitlement and App Review posture |
| Barrel-roll-driven expressive motif brushes | Low | M | Fractal Motif UX study |
| Per-user Pencil pressure calibration | Low | M | Representative hardware/user study |
| Automatic latency compensation for direct touch over Bluetooth | Medium | XL | Physical loopback study; likely cannot remove perceived route delay |
| Collaborative real-time project editing | High future | XL | Merge/CRDT architecture |
| Cross-platform bit-identical PCM for all synthesis/effects | Low practical value | XL | Shared DSP implementation and floating-point constraints |
| Learned adaptive renderer budgeting | Low | L | Large device telemetry corpus |
| Arbitrary MIDI-CI property exchange editor | Low | XL | Product demand |

---

# 11. Backlog Deltas

| Change | Item | Rationale | Suggested acceptance criteria | Dependencies | Affected milestone |
|---|---|---|---|---|---|
| **ADD** | `NEW-DR12-001 — Native iPad semantic-shell proof of architecture` | Retire foundational architecture risks before a full lab implementation. | Document open/save; command undo; shared plan; Canvas projection; minimal AVAudioEngine backend; Swift/TS goldens. | AGL-010/012/041/050 | M1→M2 gate |
| **BLOCK** | Native production epic pending DR-12 POA | Architecture is not safe until package/conflict, plan, and audio ownership gates pass. | D-P01, D-P09, A-P01, A-P05, U-P01, U-P03 pass or have approved exceptions. | NEW-DR12-001 | M1/M2 |
| **MODIFY** | `AGL-010 — Full project schema and JSON Schema` | Explicitly exclude platform/session state and define logical package references. | Schema rejects native route, engine, window, selection, and transient generation fields; package references validate. | None beyond existing | M1 |
| **MODIFY** | `AGL-011 — Schema migration framework` | Swift and TS migrations must be semantically identical. | Every historical golden produces same target hash and diagnostics on both platforms. | AGL-010 | M1 |
| **MODIFY** | `AGL-012 — Project command bus` | Add native gesture transaction and UndoManager adaptation requirements. | Begin/preview/commit/cancel; one drag=one undo; inverse hash tests; all modalities dispatch same commands. | AGL-010 | M1 |
| **SPLIT** | `AGL-015 — Portable project package` | Separate logical package semantics from physical native/web containers. | Child A: logical package schema; Child B: native directory adapter; Child C: portable archive adapter and cross-profile round trip. | AGL-011/014 | M1/M5 |
| **ADD** | `NEW-DR12-002 — iCloud and File Provider destructive conflict POA` | `FileDocument` conflict UX is the largest persistence risk. | Offline dual-device divergence, reconnect, rename/move, eviction/redownload, same-file double-open; preserve both versions; automatic `UIDocument` fallback trigger. | Native document scaffold | M1 |
| **ADD** | `NEW-DR12-003 — OpenDocumentRegistry and same-file writer policy` | Prevent in-process split-brain state. | Distinct projects isolated; same file shares session or opens read-only; auxiliary windows reference session ID. | NEW-DR12-001 | M1 |
| **MODIFY** | `AGL-041 — Audio render plan` | Reconcile rational semantic plan, seconds plan, native sample schedule, conversion version, and generation semantics. | One authority; deterministic derived hashes; no independent offline model; frame-rounding goldens pass. | DR-03 integration | M2 |
| **ADD** | `NEW-DR12-004 — Process-wide AudioDeviceCoordinator` | `AVAudioSession` and route lifecycle cannot be document-owned. | One active audible session; click-safe handoff; route/interruption/reset state machine; no per-window session reconfiguration. | AGL-031/041 | M2 |
| **ADD** | `NEW-DR12-005 — AVAudioEngineBackend and EngineGraphFactory` | Implement native real-time adapter without graph semantics in callbacks. | Sample-time scheduling; bounded RT queues; graph rebuild path; diagnostics; nominal floor-device run. | AGL-041/042/043 | M2 |
| **MODIFY** | `AGL-042 — Instrument voice registry` | Native/offline capability and determinism metadata are required. | Every voice declares RT support, manual-render support, format, tail, latency, determinism class, and fallback. | AGL-041 | M2 |
| **MODIFY** | `AGL-043 — Scheduler hardening` | Add native benchmark profile and cross-run adaptive horizon policy. | Native and browser telemetry; no fixed constants presented as guarantees; zero nominal semantic misses. | DR-03, NEW-DR12-005 | M2 |
| **MODIFY** | `AGL-045 — Offline WAV render` | Add separate native manual engine, transactional output, tail policy, and background export. | Same resolved plan; bounded blocks; cancellation; no corrupt final; native RT/offline parity. | AGL-041/042 | M2/M5 |
| **MODIFY** | `AGL-049 — Gain and emergency-stop safety` | Panic must cross every native session/engine/generation state. | Immediate or shortest click-safe silence; queues clear; backend restartable; menu/keyboard/touch access. | NEW-DR12-004/005 | M2 |
| **ADD** | `NEW-DR12-006 — Native MIDIRouter and MIDI endpoint coordinator` | Core MIDI UMP is distinct from Web MIDI but shares canonical semantics. | MIDI 1/2 ingress, high-priority queue, timestamped output, hot plug, virtual ID, explicit down-conversion. | AGL-031/130 | M3 |
| **MODIFY** | `AGL-050 — Visualization projection contract` | Add renderer-independent hit, accessibility, export, and budget semantics. | `CanvasFrame` carries primitives, semantic hit regions, accessibility projection, renderer hint, exact export geometry. | AGL-020 | M1/M2 |
| **MODIFY** | `AGL-051 — Shared 2D canvas` | Native Canvas becomes one adapter, not the projection authority. | High-DPI, pan/zoom/pick, semantic parity, no lab math in renderer. | AGL-050 | M2 |
| **MODIFY** | `AGL-052 — 3D canvas adapter` | RealityKit remains optional and must not become the default. | Optional chaos 3D only after 2D semantics and reduced-motion fallback pass. | AGL-050 | M4/post-MVP |
| **MODIFY** | `AGL-053 — Accessible mathematical descriptions` | Make descriptions and actions native projection outputs. | Canvas summary, selected object, actions, adjustable values, aggregation, VoiceOver parity. | AGL-050 | M2–M5 |
| **ADD** | `NEW-DR12-007 — Adaptive iPad studio shell` | Dimension-responsive layout and menus are core iPad behavior. | Wide/medium/narrow; state-preserving resize; menu commands through focused routing; panic visible. | AGL-030/012 | M2 |
| **MODIFY** | `AGL-132 — Accessibility baseline` | Add native Full Keyboard Access, Pencil fallback, custom-canvas, and renderer-parity requirements. | U-P01 through U-P09; P0 labs fully operable without advanced Pencil. | NEW-DR12-007 | M2/M6 |
| **MODIFY** | `AGL-133 — Property and invariant test suite` | Include Swift/TS package, command, plan, schedule, and projection goldens. | CI executes both harnesses from one fixture corpus. | AGL-010/041/050 | M1–M6 |
| **ADD** | `NEW-DR12-008 — Native device, route, thermal, and energy benchmark harness` | No native empirical performance results exist yet. | Floor/M1/mainstream/high-end/compact tiers; route matrix; workload ladders; exported telemetry. | NEW-DR12-005/007 | M2/M6 |
| **MODIFY** | `AGL-135 — End-to-end lab smoke suite` | Add native Files, resize, route, background, MIDI, and accessibility flows. | Open/play/change/save/reopen/export on native and web; semantic round trip; no state leakage. | Native POA | M6 |
| **ADD** | `NEW-DR12-009 — Native App Store, privacy, and background-mode gate` | App capabilities and privacy declarations must match actual behavior and SDKs. | Privacy manifest audit; Required Reason APIs; privacy policy; no unused mic/local-network capability; background justification. | AGL-136 | M6 |
| **BLOCK** | Adoption of 2027 SwiftUI document APIs or beta GPU background resources | Prevent provisional APIs from becoming architectural dependencies. | Unblocked only after final OS release, adapter-only migration, and full conformance rerun. | Future platform review | Post-MVP |
| **ADD** | `NEW-DR12-010 — iPhone companion scope` | Preserve compile-time adaptability without delaying iPad studio. | Read/play/mix/control/MIDI subset; explicitly excludes graph and dense-lab authoring. | Mature native core | Post-MVP |

---

# 12. Cross-Research Dependencies

## 12.1 DR-03 — Browser Audio Scheduling, Latency, and Rendering

**This report concludes:**  
Native exact rational time should convert through the tempo map into an absolute sample timeline; a rolling 100–250 ms scheduling horizon is a starting point; real-time and offline use the same plan.

**Must be reconciled with:**  
DR-03’s seconds-based immutable render plan, 25 ms scheduler wake, 100 ms initial horizon, 250 ms ceiling, generation buses, late-event policies, and proposed frame-rounding function.

**Why:**  
Without reconciliation, web and native can both claim to consume “the canonical render plan” while using different time authorities and commit semantics.

**Question the integration pass must answer:**  
Is AGL-041:

1. an exact rational semantic plan;
2. a seconds plan;
3. a plan containing both exact and derived time;
4. or a semantic plan with one formally derived backend schedule?

**Recommended answer:**  
Use `SemanticRenderPlan` as authority, `ResolvedAudioPlan` as deterministic seconds projection, and `NativeSchedule` as sample-rate-specific projection. Adopt one shared generation/commit contract and versioned rounding rule.

---

## 12.2 DR-08 — Sonification Mapping and Temporal Semantics

**This report concludes:**  
Native evaluators and renderers must preserve canonical behavior and provenance; thermal/background scheduling should evaluate only the bounded horizon needed for playback.

**Must be reconciled with:**  
DR-08’s distinction among pointwise, causal-stateful, bounded-lookahead, and whole-window/frozen operators, plus its prohibition on future-dependent processing masquerading as causal live behavior. 
**Why:**  
A native scheduler cannot safely request an arbitrary rolling future horizon if an operator’s semantic mode requires a frozen whole window, nor can background playback silently substitute a causal approximation.

**Question the integration pass must answer:**  
What evaluator contract accompanies each operator temporal mode when producing a live native plan?

**Required outcome:**  
Every render-plan segment records:

```text
temporal mode
required past state
required lookahead
frozen source-window identity where applicable
fit/statistics identity
causal latency
```

---

## 12.3 DR-11 — Professional Music-Tool UX and Progressive Disclosure

**This report concludes:**  
Native layout adapts by window dimensions; menus, inspector, sidebar, and sheets form the studio shell.

**Must be reconciled with:**  
DR-11’s Explore/Compose/Inspect workspace semantics, generated/frozen material states, touch-target requirements, panel persistence, and warning against hard mode permissions.

**Why:**  
The native shell could otherwise recreate a separate mode model or visually obscure generated-versus-frozen semantics.

**Question the integration pass must answer:**  
Which panels move or collapse in each workspace and size tier while all valid semantic commands remain available?

---

## 12.4 DR-01 — Infinite Staircase and Dense Event Scheduling

**This report concludes:**  
The native scheduler should support deterministic event scheduling, sample-time conversion, and adaptive workload budgets.

**Must be reconciled with:**  
DR-01’s provisional 32 events/s warning, 128 events/s/operator hard ceiling, exact event/chunk invariance, and P0 Infinite Staircase workload.

**Why:**  
DR-12’s 1,000+ events/s backend stress ladder is not the same as DR-01’s semantic per-operator budget. One is a transport stress test; the other is an operator policy.

**Question the integration pass must answer:**  
Which budgets are semantic/operator limits, which are backend capability limits, and which merely trigger renderer/audio routing strategies?

---

## 12.5 DR-06, DR-07, and DR-09 — CA, Chaos, and Penrose

**This report concludes:**  
CA and live chaos are initial Metal candidates; Penrose remains a Canvas-based finite vector patch unless measured complexity requires Metal.

**Must be reconciled with:**  
The accepted CA grid dimensions and update rates, chaos integration/trajectory requirements, and exact Penrose patch/adjacency semantics from their specialist reports.

**Why:**  
Renderer thresholds cannot be chosen without the accepted mathematical workload and required visual fidelity.

**Question the integration pass must answer:**  
What is the maximum semantic primitive/update load for each accepted lab fixture, and what display aggregation is mathematically honest?

**Current status:**  
Those specialist conclusions are not sufficiently present in this packet to freeze thresholds.

---

## 12.6 AGL-010/014/015 — Web/Native Project Portability

**This report concludes:**  
A native `.agl.project` should be a document package.

**Must be reconciled with:**  
The web application’s actual import/export capabilities and the portable-package physical format.

**Why:**  
A native directory package and a downloaded browser archive are not automatically the same physical artifact.

**Question the integration pass must answer:**  
Does AGL expose:

- one archive format everywhere;
- a native directory package plus portable archive;
- or a browser File System Access directory profile with archive fallback?

This is a **critical architecture question**, not a UX implementation detail.

---

## 12.7 DR-10 — Future Audio Input

**This report concludes:**  
Use `.playback` and do not request microphone access for the native MVP.

**Must be reconciled with:**  
Future audio import, live recording, transcription, or input-monitoring scope.

**Why:**  
Moving to `playAndRecord` changes routing, Bluetooth profile behavior, permissions, latency, and interruption semantics.

**Question the integration pass must answer:**  
Will future audio-input functionality be integrated into the main composition target or isolated behind an optional recording mode/capability?

---

## 12.8 Cross-Platform Export Cancellation

**This report concludes:**  
Native manual export can stream, report progress, and respond to cancellation, including continued background processing.

**Must be reconciled with:**  
DR-03’s finding that portable web offline rendering cannot always truly abort compute even when the user cancels the artifact.

**Why:**  
A shared `ExportService` contract cannot promise backend behavior that the web platform cannot deliver.

**Question the integration pass must answer:**  
Does cancellation mean:

```text
A. compute stops promptly;
B. result is abandoned and never committed;
C. both, where supported?
```

**Recommended answer:**  
The cross-platform guarantee is **no cancelled artifact is committed**. `computeAbortSupported` is a backend capability.

---

# 13. Contradictions, Weak Evidence, and Open Questions

| Issue | Adversarial assessment | Required resolution |
|---|---|---|
| Released-but-deprecated `DocumentGroup` initializer versus beta replacement | Apple’s current API surface is internally awkward. DR-12 is reasonable to prefer released APIs, but compilation and submission behavior must be tested with the exact Xcode/SDK used for release. | Pin SDK policy and adapter tests; do not adopt beta merely to remove warnings. |
| Native package versus browser package | DR-12 assumes cross-platform round-trip but does not demonstrate a browser-safe physical directory package. | Logical/physical package POA before format freeze. |
| `FileDocument` cloud conflict observability | The report correctly flags risk but provides no empirical result. | Destructive two-device/File Provider POA. |
| Incremental package writes | `FileDocument` supports package member reuse, but actual Files/iCloud provider behavior with large assets is unmeasured. | Measure write amplification and provider synchronization. |
| Same package opened twice | Single-writer policy is a recommendation, not provided automatically by SwiftUI. | Implement and test OpenDocumentRegistry. |
| Shared `SelectionModel` across auxiliary windows | Sharing one model may cause selection fights between windows. The report’s recommendation is too absolute. | Use scene-local selection with optional linked/follow behavior unless UX testing supports global selection. |
| Multiwindow audio | DR-12 does not specify how multiple projects share a process-global audio session. | Adopt AudioDeviceCoordinator and one-active-project MVP policy or explicitly build a multi-session mixer. |
| Multiwindow MIDI | Endpoint connections and mappings can be app-global while commands are document-specific. | Define focus/routing ownership and recording-arm semantics. |
| Render-plan time authority | DR-03 says seconds-only; DR-12 includes rational time and tempo map. | Freeze the three-level plan model or another singular authority. |
| Tempo-ramp integration | Neither retrieved DR-12 material nor the current AGL artifacts define exact ramp interpolation/integration. | AGL-041 must specify ramp families, equations, and numerical tolerances. |
| Sample rounding | DR-03 proposes half-up; DR-12 only requires a canonical rule. | Accept and version one rule before goldens. |
| Simultaneous event ordering | Stable ordering is required but tie priorities are not defined. | Add event-phase ordering to render-plan v1. |
| Scheduler horizon | 100–250 ms is an engineering starting point, not a native guarantee. Increasing lookahead does not reduce physical Bluetooth delay. | Benchmark per route; keep horizon diagnostic and adaptive. |
| “One million events, zero misses” | Useful as a data-structure stress test but meaningless if interpreted as a real-time musical workload. | Define timeline span, batch sizes, voice activation, and whether the test exercises queueing or rendered audio. |
| Event-density budgets | DR-01’s 128 events/s/operator ceiling and DR-12’s 1,000+ events/s backend stress are different layers. | Name semantic, scheduler, voice, and renderer budgets separately. |
| Native AGL-owned PCM identity | Plausible between two paths using the same implementation and format. It does not establish web/native bit identity. | Scope exact PCM tests correctly. |
| Apple effect determinism | “Tolerance” is correct but no actual tolerances are supplied. | Measure and register per-effect tolerances or exclude the effect from conformance-critical presets. |
| Manual-render support | Not every future AU or sampler path is guaranteed to support manual rendering equivalently. | Voice/effect capability registry and fallback policy. |
| Export tail behavior | Missing from DR-12’s contract. Reverb, delay, and release tails change output duration. | Define explicit fixed/silence/descriptor tail policies. |
| Export background guarantee | Continuous background work can be terminated. | Transactional output plus restart/checkpoint policy. |
| Audio mixing with other apps | `.playback` is recommended, but mix/duck/interruption policy remains unspecified. | Product/UX decision and audio-session option tests. |
| Bluetooth labeling | “High/variable latency” is appropriate; a simple warning may still be too vague. | Measure route class and present route-specific diagnostics without promising exactness where unavailable. |
| Route change resume | The report says preserve canonical location, but unplug behavior may appropriately pause. | Define route-reason-specific UX and transport intent rules. |
| Background MIDI | The report says keep MIDI the user expects active, but platform/App Review and endpoint behavior are not demonstrated. | Explicit background MIDI product scope and device tests. |
| Canvas performance | Apple describes Canvas as suitable for many dynamic shapes, but no AGL primitive threshold is established. | Measure per lab and device tier. |
| Metal semantic separation | Architecturally correct but easy to violate through GPU-side simulation. | Prohibit authoritative lab state generation in renderer shaders unless a future ADR explicitly promotes a verified compute backend. |
| Accessibility tree size | “Aggregate” is correct but does not specify grouping or navigation depth. | Lab-specific VoiceOver prototypes and user validation. |
| Full Keyboard Access | Required, but exact focus and shortcut maps are not specified. | DR-11/native UX integration and command fixture. |
| Layout breakpoints | Wide/medium/narrow layouts are described without numeric thresholds. | Content-fit prototype rather than invented breakpoints. |
| All iPadOS 26 hardware | Functional intent is reasonable, but actual supported device list and acceptable budgets can change. | Reverify at release and benchmark the true floor. |
| iPhone companion | Sensible product recommendation, but no user demand evidence is presented. | Keep out of MVP commitment; validate after iPad POA. |
| No-analytics privacy posture | Strong default but does not automatically mean “Data Not Collected”; network MIDI or future crash reporting may change the declaration. | Final dependency/configuration audit. |
| Native-versus-web maintenance | The report argues against a shared executable core, but no maintenance-cost trigger is defined. | Record cross-language defect/fixture burden and define a future escalation threshold. |
| Automatic cloud merge | Stable IDs help but are not sufficient. Commands may conflict semantically even when object IDs differ. | Separate future merge ADR; no implied support now. |

The largest uncertainties are therefore not whether SwiftUI, AVAudioEngine, Core MIDI, Canvas, or Metal are viable. They are:

1. physical package portability;
2. safe cloud conflict behavior;
3. process-global audio/MIDI ownership in a multiwindow app;
4. one exact render-plan/time conversion contract;
5. measured performance and AU capability on real devices.

---

# 14. Research Follow-Ups

Only the following follow-ups are likely to change an engineering or product decision materially.

| Priority | Question | Why current evidence is insufficient | Decision it blocks | Best likely method |
|---:|---|---|---|---|
| **P0** | Can a logical `.agl.project` use one physical container across browser and native workflows, or are native-directory and portable-archive profiles required? | DR-12 assumes round-trip but does not demonstrate browser directory-package creation/import. | Public project format and AGL-015 freeze | Build web/native fixtures; test Safari/Chromium Files upload/download, File System Access where available, Files app, AirDrop, iCloud, ZIP/archive handling. |
| **P0** | Does `DocumentGroup<FileDocument>` expose enough information for trustworthy divergent-version recovery? | No destructive conflict measurements exist. | FileDocument versus UIDocument adapter | Two physical iPads, offline edits, iCloud/File Provider conflict, rename/move, eviction/redownload, source preservation review. |
| **P0** | What owns audio and MIDI resources across multiple document windows? | DR-12 does not resolve process-global session versus scene-local engines. | Native session architecture | Implement one-active-session and global-mixer spikes; test interruption, route handoff, MIDI focus, background behavior. |
| **P0** | What native scheduler, voice, event, and graphics budgets pass on the true floor device? | All thresholds are hypotheses. | M2 acceptance and minimum hardware support | Physical device benchmark harness with loopback, thermal soak, workload ladders, exact build metadata. |
| **P0** | Which selected samplers/effects support deterministic manual rendering, and with what tolerance? | `AVAudioEngine` supports manual mode generally, but voice/effect behavior is not measured. | Voice registry and export support | Capability matrix across built-in sampler, AGL source node, every selected effect, multiple sample rates/block sizes. |
| **P1** | What accessibility aggregation model works for dense CA, chaos, graph, and Penrose surfaces? | “Do not expose every primitive” is directionally correct but not a usable interaction design. | AGL-053/132 acceptance | VoiceOver/Full Keyboard Access prototypes plus representative-user task testing. |
| **P1** | How reliably does continued background export finish, cancel, or terminate under real device conditions? | Platform documentation permits termination. | Export checkpoint/resume scope | Long CPU export tests under backgrounding, Low Power Mode, thermal pressure, storage pressure, and cancellation. |
| **P1** | Which MIDI 1/2 endpoint types and messages are reliable on supported iPads? | Official APIs define capability, not AGL’s device matrix. | Native MIDI support statement | USB/BLE/network/virtual matrix, hot plug, timestamp loopback, MIDI 1/2 conversion fixtures. |
| **P2** | Should AGL migrate to the 2027 document APIs after final release? | APIs are currently beta and may change. | Future adapter migration only | Repeat package/conflict/conformance suite on final OS/SDK; no broad research before release. |
| **P2** | Is a shared Rust/C core economically justified? | No measured dual-implementation maintenance burden exists. | Future implementation strategy | Track semantic-drift defects, fixture maintenance time, build complexity, and performance gaps through two milestones. |

No additional broad research on “native versus web” is needed before these focused POAs. The architecture direction is already sufficiently clear.

---

# 15. Integration Checklist

- [ ] Update the AGL architecture specification with the semantic-core/native-adapter boundary.
- [ ] Add ADR-DR12-001 through ADR-DR12-012 to the architecture decision register with proposed/blocked status.
- [ ] Update the project schema to exclude scene, selection, route, engine, and generation state.
- [ ] Split the logical package contract from physical container profiles.
- [ ] Add the native-directory versus portable-archive POA.
- [ ] Add the `FileDocument`/iCloud conflict POA and `UIDocument` fallback gate.
- [ ] Update the command contract with preview and transaction semantics.
- [ ] Update the render-plan contract with semantic, seconds, and sample-schedule derivation.
- [ ] Freeze a versioned seconds-to-frame rounding rule.
- [ ] Add simultaneous-event ordering and export-tail semantics.
- [ ] Extend the voice registry with real-time/offline/determinism/tail capabilities.
- [ ] Add `AudioDeviceCoordinator`, `MIDIEndpointCoordinator`, and `OpenDocumentRegistry`.
- [ ] Add native audio-session and generation state machines.
- [ ] Add UMP-native MIDI event and explicit down-conversion schemas.
- [ ] Extend `CanvasProjection` with hit, accessibility, export, and renderer-hint fields.
- [ ] Update the native UI/UX specification with dimension-based adaptive layouts.
- [ ] Reconcile Explore/Compose/Inspect and generated/frozen semantics with DR-11.
- [ ] Reconcile causal/live/frozen evaluator requirements with DR-08.
- [ ] Reconcile scheduler horizons, late policy, and plan units with DR-03.
- [ ] Add shared Swift/TypeScript conformance fixtures.
- [ ] Add exact rational/sample-index goldens.
- [ ] Add native package, audio, MIDI, renderer, accessibility, and performance suites.
- [ ] Update AGL-010, 011, 012, 015, 041, 042, 043, 045, 049, 050–053, 132, 133, and 135.
- [ ] Add the native App Store/privacy/background-mode release gate.
- [ ] Record DR-12 as completed in the AGL research evidence registry without creating another research run.
- [ ] Add user-facing claim constraints for sample accuracy, Bluetooth latency, offline equivalence, iCloud conflicts, and privacy.

# Integration Payload

**AUTHORITY / SCOPE:** DR-12 supports proceeding with a native SwiftUI iPad client, but only as a platform adapter over AGL’s canonical project, exact-time, event, graph, command, provenance, render-plan, and projection semantics. Existing AGL authority already includes exact rational time, deterministic events/seeds/operators, planned project schema/migrations/command bus, one real-time/offline render-plan objective, visualization projection, accessibility descriptions, and cross-platform invariant testing. Native code must not create platform-only project semantics.

**PRIMARY DECISIONS:**  
`ADOPT`: ports-and-adapters native shell; `AGLDocument` persistence snapshot; `ProjectStore`/`CommandDispatcher` editing authority; `UndoManager` inverse-command adapter; multiple independent project windows; same-file single writer; AVAudioEngine graph; separate manual export engine; generation-based cancellation; explicit audio lifecycle; Core MIDI UMP; framework-independent CanvasProjection; Canvas default/Metal dense/RealityKit optional; dimension-based adaptive UI; Pencil progressive enhancement; projection-level accessibility; released iPadOS 26 API baseline; local-first privacy.  
`ADOPT WITH CONDITIONS`: `DocumentGroup<FileDocument>` pending destructive iCloud/File Provider conflict POA; document package pending browser/native physical-container POA; one-active-audible-project policy pending process-wide audio spike; scheduler constants pending device measurements; all-iPadOS-26 functional support pending floor-device budgets.  
`REQUIRES CROSS-RUN`: exact authority and fields of AGL-041 render plan; seconds/sample rounding; scheduler horizon/late policy; live/frozen evaluator horizon.  
`DEFER`: full iPhone parity, shared Rust/C core, object-level cloud merge, MIDI-CI, UMP file export, RealityKit 3D, simultaneous multi-project audio, 2027 document APIs.  
`REJECT`: beta API production dependency; native-only project fields; JavaScript in RT callback path; timer-based event scheduling; byte-level package merge; RealityKit as general canvas; pointer/Pencil/hover-only operations; automatic catch-up after interruption; hidden MIDI 2 truncation; renderer-owned lab mathematics.

**DOCUMENT CONTRACT:** Logical package v1:

```text
manifest.json
project.json
assets/<sha256>.<ext>
preview/* optional/derived
```

Manifest contains package format, canonical schema version, project semantic ID, save-generation UUID, authoritative member hashes, asset metadata, and compatibility requirements. `project.json` is the sole canonical project. Exclude viewport, panel state, hover, focus, selection, route, engine state, MIDI endpoints, generation ID, and export progress. Assets immutable/hash-addressed. Preview/caches non-authoritative. Corrupt/future package never overwritten. Divergent versions preserved before merge. Byte merge forbidden. Automatic object merge requires common ancestor, stable IDs, deterministic conflict policy, and merge receipt. Apple supports directory `FileWrapper` packages and off-main `FileDocument` serialization; the unresolved issue is physical web portability. 

**PHYSICAL PACKAGE BLOCKER:** Native `UTType.package` implies directory semantics; ordinary browser workflows may require an archive. Freeze `agl.logical-package.v1`; prototype `agl.native-directory-package.v1` and `agl.portable-archive.v1`; require web→native→web and native→web→native semantic/member-hash equivalence. Do not claim one physical `.agl.project` format until demonstrated.

**COMMAND/UNDO CONTRACT:** Every semantic mutation is a versioned command. Gesture transaction: down→begin; samples→transient preview; up→one commit; cancel→predrag state. `inverse(apply(command,S)) == S` by canonical semantic hash. Transaction inverse reverses command inverses. SwiftUI document binding receives committed snapshots; no periodic save timer unless crash POA demonstrates need.

**MULTIWINDOW CONTRACT:** Distinct files: isolated stores, undo, evaluation, generation, selection, and saves. Same file: one in-process writer through `OpenDocumentRegistry`; secondary scene shares logical session or read-only. Auxiliary views reference `ProjectSessionID`, not separate documents. DR-12’s shared `SelectionModel` across auxiliary windows is too strong; prefer scene-local linked selection with optional follow mode. Add process-level `AudioDeviceCoordinator` and `MIDIEndpointCoordinator`.

**AUDIO OWNERSHIP:** `AVAudioSession`/route/interruption/media-reset are process-wide. MVP recommendation: one active audible project. Starting playback elsewhere performs explicit click-safe handoff. Offline export independent. Future global multi-session mixer may replace policy behind same project APIs. No document/window directly reconfigures AVAudioSession.

**RENDER AUTHORITY RECONCILIATION:** Use one semantic authority with deterministic projections:

```text
SemanticRenderPlan:
  exact rational times
  tempo-map identity/version
  events/voices/resources/provenance
  budgets/approximations

ResolvedAudioPlan:
  deterministic seconds
  same event IDs/order
  generation/effective time
  conversion version

NativeSchedule:
  actual sample rate
  absolute sample frames
  route/engine epoch
  transient
```

This reconciles DR-03 seconds-based backend requirements with DR-12 exact-time/sample scheduling. Real-time and offline consume the same `ResolvedAudioPlan`; no alternate offline event model. 
**TIME EQUATIONS:** For tempo \(\tau(b)\) BPM, \(T(b_0,b_1)=\int_{b_0}^{b_1}60/\tau(b)\,db\). Piecewise constant: \(\sum_i \Delta b_i 60/\mathrm{BPM}_i\). Resolve absolute times; never accumulate rounded deltas. Proposed nonnegative frame conversion `nearestHalfUp-v1`: \(F_R(p/q)=\lfloor(2pR+q)/(2q)\rfloor\). Version rule in provenance. Tempo-ramp family/integrator remains unresolved. Simultaneous-event tie ordering remains unresolved; recommended key `(time, phasePriority, trackOrder, voiceOrder, stableID)`.

**NUMERIC GOLDENS:** 120 BPM: beat=0.5 s. At 48 kHz: beat \(1/3→8000\), beat \(1→24000\), beat \(4→96000\). At 44.1 kHz: \(1/3→7350\), \(1→22050\), \(4→88200\). Tempo step 0–4 beats at 120 BPM, 4–8 at 60 BPM, 48 kHz: beat 4→96,000; beat 6→192,000; beat 8→288,000. Half-sample \(1/96000\) s at 48 kHz→frame 1 under proposed half-up v1. 40,000 beats at 120 BPM→20,000 s→960,000,000 frames at 48 kHz.

**GENERATION CONTRACT:** Monotonic session-local generation. At commit frame C: no old-generation onset at/after C; no new-generation catch-up before C; controls reconstructed at C; old active voices follow explicit stop/release/crossfade policy; seek/loop/edit creates new generation; interruption reanchors with no catch-up; panic invalidates all generations. Generation not persisted.

**AVAudioENGINE:** Per-track event queues feed sampler/custom synth/noise/percussion→track mixer→descriptor-defined inserts→track bus/sends→master safety dynamics/limiter→output. Use `AVAudioUnitSampler` where semantics suffice; `AVAudioSourceNode`/small custom AU for deterministic AGL synthesis. Keep AVAudioUnit classes out of render-plan schema. Parameter/gain changes may be live; structural attach/detach/reconnect uses controlled graph rebuild. AVAudioEngine supports real-time and manual rendering; AVAudioTime bridges host/sample clocks. 

**REAL-TIME RULES:** Scheduler/control plane serialized and alloc-capable; initial hypothesis 25 ms wake, 100 ms horizon, adaptive ceiling 250 ms, all benchmark-gated. Render callback consumes bounded preallocated events only; no graph evaluation, JSON, allocation, blocking locks, actors, logging, Files, MIDI enumeration, network, or main queue. Scheduled events use AVAudioTime/AU sample time, never Timer/asyncAfter/Swift clocks.

**OFFLINE:** Separate AVAudioEngine from same EngineGraphFactory; manual render; stream PCM blocks transactionally. Same resolved plan and native schedule semantics as RT. AGL-owned native DSP same binary/format/seed must be sample-identical RT capture vs manual render. Platform/third-party effects require measured tolerances. Registry must declare `realtimeSupported`, `manualRenderSupported`, format, latency, tail, determinism class, fallback. Export-tail policy absent from DR-12 and must be added. Cross-platform cancellation guarantee: cancelled output is never committed; prompt compute abort is capability-specific.

**AUDIO STATE:** IDLE→ACTIVATING→RUNNING. RUNNING→INTERRUPTED remembers intent; resume only if appropriate. RUNNING→RECONFIGURING on route change; query actual sample rate/buffer/latency/channels, rebuild anchor/schedule, new generation. Media reset→discard/recreate engine/nodes/session-dependent state→PAUSED awaiting explicit user playback. No catch-up burst. `.playback`/`.default` until actual input scope. Mix/duck/interrupt policy with other apps remains open. Bluetooth/AirPlay high/variable latency; internal sample sequencing may remain exact but touch-to-output latency remains route-dependent. Built-in/wired/USB recommended for direct performance. Apple interruption/reset/route guidance supports explicit lifecycle handling. 

**MIDI:** Core MIDI `MIDIEventList`/UMP ingress→high-priority callback→preallocated bounded queue→MIDIRouter→(ephemeral performance event OR explicit ProjectCommand mapping). Output canonical event→endpoint protocol encode→`MIDISendEventList` future timestamp. Preserve group, channel, semantic message, note/noteID, 32-bit/source resolution, timestamp, endpoint, protocol, provenance. Never silently reduce to 7-bit. MIDI 2→1 uses official scaling and emits quantization record. Stable virtual endpoint IDs. SMF default export; MIDI-CI/UMP file later. Apple documents UMP/event lists, high-priority callbacks, future scheduling, and legacy API deprecation. 

**GRAPHICS:** `CanvasProjection` outputs world bounds, semantic primitives/IDs, semantic hit regions, selection/provenance, accessibility projection, exact export geometry, renderer hint, diagnostics. Renderers contain no lab math/stable-ID generation. Infinite Staircase Canvas; Euclidean Canvas; Tonnetz Canvas; Fractal Canvas→Metal at measured threshold; CA Metal with static/accessible Canvas fallback; Chaos Metal live/Canvas frozen/RealityKit optional 3D; Penrose Canvas finite patch→Metal only after measured complexity. Canvas/Metal parity is semantic, not pixel identity.

**ADAPTIVE UI:** Branch on available dimensions/content fit, never orientation. Wide: sidebar+canvas+inspector+timeline. Medium: collapsible sidebar+canvas+bottom timeline+on-demand inspector. Narrow: transport/context toolbar+canvas+selected summary; panels as sheets/drawers. Resize preserves project hash, undo, transport, selection, zoom, evaluator, generation. Commands routed through active ProjectStore: Project/Edit/Transport/Selection/View/Lab/MIDI. Menu remains discoverable. Pointer adds affordances only. Drag/drop carries semantic IDs/portable payloads.

**PENCIL:** Progressive enhancement. Contact=direct manipulation; pressure optional accent/brush; hover preview only; double tap respects preference; squeeze discrete contextual action and may not be delivered; roll expressive stroke orientation only, never tempo/phase/rotation/generic knob; haptics snap/alignment/path completion. Every operation has touch/keyboard/pointer/inspector equivalent. Apple documents preferences, hover pose, squeeze, roll, and haptics. 

**ACCESSIBILITY:** Projection-level contract: canvas summary, selected object, semantic groups, actions/adjustable values, keyboard navigation, Full Keyboard Access, non-color states, reduced motion, no huge primitive-per-element tree. Essential operations: select, move, increment/decrement, connect, delete, rotate/phase, zoom/pan, provenance inspect, play/audition. Generated/frozen/selected/active/valid states use label+icon/pattern/role, not color alone. Apple requires alternate interaction methods and information beyond a single sensory/color channel. 

**THERMAL/MEMORY:** Nominal full visuals. Fair reduce invisible canvas/speculative prefetch. Serious cap visual FPS/density, pause nonessential analysis, reduce Metal detail, preserve audio. Critical stop/defer export, release recreatable caches, controlled pause if audio cannot remain correct. Never alter notes, timing, rhythm, seeds, project, frozen material, or export semantics. Memory warning discards projection/waveform/image/stale evaluation/unused decode/GPU caches, not canonical project or minimal plan horizon.

**BACKGROUND/PRIVACY:** Audible user-requested playback may use audio background mode; stop display-driven visuals, retain bounded transport/evaluator/MIDI/audio only. User-started long export uses `BGContinuedProcessingTask`, progress, cancellation, temporary output, atomic commit; system termination remains possible. Do not abuse silent audio or discretionary background processing. Local-first native MVP: no analytics/accounts by default, no microphone request, minimal third-party SDKs, privacy manifest/Required Reason audit, privacy policy URL, App Store declarations based on final code/SDK behavior. On-device-only processing is not App Store “collection,” but all transmitted data and third-party SDK behavior must be reviewed. 

**TEST GATES:** D-P01 web/native logical package round trip; D-P02 identical migration; D-P03 package incrementality; D-P04 autosave; D-P05 one drag/one undo; D-P06 independent windows; D-P07 same-file single writer; D-P08 Files lifecycle; D-P09 iCloud divergence preservation or UIDocument fallback; D-P10 corruption non-overwrite. A-P01 Swift/TS plan equivalence; A-P02 rational/sample goldens; A-P03 one-million queue stress zero loss/dup/reorder; A-P04 AGL DSP native RT/offline PCM identity; A-P05 event sample-index equality; A-P06 interruption; A-P07 route change; A-P08 media reset; A-P09 30-min background playback; A-P10 background export cancellation; A-P11 thermal; A-P12 panic. M-P01 MIDI1; M-P02 MIDI2 resolution/per-note; M-P03 future timestamp; M-P04 callback safety; M-P05 hot plug; M-P06 virtual ID; M-P07 SMF parity. U-P01 resize torture; U-P02 keyboard-only P0 labs; U-P03 VoiceOver; U-P04 non-color; U-P05 reduced motion; U-P06 Pencil fallback; U-P07 squeeze preference; U-P08 no essential barrel-roll control; U-P09 renderer semantic parity. 
**PERFORMANCE MATRIX:** Floor oldest supported iPadOS26 class; M1-class installed base; current mainstream; current Pro; compact/mini. Routes built-in/wired/USB/Bluetooth. Loads voices 1/8/32/64/128; events/s 10/100/500/1000+; rings 1/4/8; increasing CA/fractal/chaos; evaluator+autosave+Pencil+resize. Gate: ≤1 sample internal onset error; zero semantic misses/duplicates/stale events at accepted floor nominal load; no monotonic resource growth; semantic parity under UI load; thermal degradation before audio corruption. Do not publish low-latency or safe-density numbers until physical measurements exist.

**CRITICAL OPEN ISSUES:** physical package profile; FileDocument conflict observability; process-wide audio/MIDI ownership; render-plan exact-vs-seconds boundary; frame rounding; simultaneous-event ordering; tempo ramps; export tails; selected AU offline capability/tolerance; audio mix-with-other-app policy; scene-local versus global selection; MIDI background scope; layout breakpoints; accessibility aggregation; actual floor-device budgets; cross-language maintenance trigger.

**ADR CANDIDATES:** ADR-DR12-001 native adapters; 002 logical package/physical profiles; 003 command-owned editing; 004 three-level render/time quantization; 005 shared graph factory/separate engines; 006 process-wide audio/MIDI and one-active-project; 007 UMP MIDI; 008 semantic projection; 009 adaptive presentation; 010 accessibility contract; 011 released API baseline; 012 user-requested transactional background work.

**BACKLOG:** Modify AGL-010/011/012; split AGL-015; modify AGL-041/042/043/045/049/050/051/052/053/132/133/135; add native semantic POA, package/container POA, conflict POA, OpenDocumentRegistry, AudioDeviceCoordinator, AVAudioEngineBackend, MIDIRouter, adaptive iPad shell, native benchmark harness, App Store/privacy gate; block 2027 beta APIs and native production until POA acceptance. AGL milestones remain M1 project/runtime spine, M2 audio/render and P0 rhythm labs, M3 MIDI/harmonic labs, M4 CA/Chaos, M5 Penrose/package/export, M6 accessibility/performance/release.

**FINAL INTEGRATION POSTURE:** Accept DR-12’s core architecture. Do **not** freeze the native physical package, AGL-041 time representation, cloud conflict UX, or multiwindow audio ownership solely from the research prose. Those four decisions require focused POA/reconciliation. Everything beneath those boundaries should proceed now: canonical schemas/fixtures, command-driven editing, platform adapters, UMP MIDI model, semantic projection, accessibility contract, released-API quarantine, and native conformance harness.

#AuralGeometryLab #NativeArchitecture #SwiftUI #AVAudioEngine #CoreMIDI #DeterministicAudio #CrossPlatformConformance

**Approximate conversation token usage:** ~160,000–190,000 tokens.