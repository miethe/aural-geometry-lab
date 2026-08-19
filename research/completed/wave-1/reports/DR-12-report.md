2026-08-18

# DR-12 — Native iPad Audio, Document, MIDI, Pencil, and Adaptive-UI Architecture

**Program:** Aural Geometry Lab  
**Research baseline:** iPadOS 26, released APIs only for the shipping architecture; iPadOS 27 / 2027-cycle APIs treated as beta or provisional  
**Recommendation:** **Proceed with a native SwiftUI client, but keep the native shell thin around AGL’s canonical project, evaluator, render-plan, and visualization contracts.** Use `DocumentGroup<FileDocument>` with an `.agl.project` package for the first production architecture; use `AVAudioEngine` with a sample-time-based scheduling layer and a separate manual-rendering engine for export; use modern Core MIDI UMP APIs; use SwiftUI `Canvas` as the default 2D renderer and Metal selectively for dense dynamic labs; treat Pencil features as capability-gated accelerators rather than required interaction.

### TL;DR

AGL’s existing architecture is unusually well prepared for a native client: the command bus, exact time model, canonical render plan, visualization projection contract, deterministic seeds, package work, and conformance tests already define most of the boundary that should remain platform-independent. fileciteturn0file0 The native app should therefore **share semantics, schemas, fixtures, and test vectors with TypeScript, not UI/runtime implementation code**.

For iPadOS 26, the cleanest document model is a **SwiftUI `DocumentGroup` + value-type `FileDocument` whose on-disk representation is a versioned document package**. Apple explicitly supports packages from `FileDocument`, moves serialization off the main actor, and gives `DocumentGroup` Files browsing and multiwindow behavior. citeturn15search0turn15search2 The important qualification is conflict handling: SwiftUI intentionally abstracts file coordination and does not expose the rich conflict-version interface of `UIDocument`. If DR-12's proof-of-architecture shows that AGL needs explicit Pages-style cloud-conflict resolution, replace only `AGLDocument` with a stable `UIDocument` adapter; do **not** redesign the project core. citeturn15search1

For audio, the canonical `NativeRenderPlan` should map exact musical times once into an engine sample timeline. Audio events must be scheduled against `AVAudioTime` / AU sample times, never `Timer`, `DispatchQueue.asyncAfter`, or Swift concurrency clocks. `AVAudioEngine` remains the correct public high-level graph; `AVAudioUnitSampler` is appropriate for sample voices, custom `AVAudioSourceNode`/AU code for deterministic synthesis, and built-in audio units for effects. A second identically constructed engine in manual rendering mode should consume the **same plan** for offline export. citeturn18search0turn18search1turn18search2turn18search12

As of August 18, 2026, **do not build the shipping architecture on the new SwiftUI `Document`, `DocumentReader`, `DocumentWriter`, direct-document-URL, or related 2027 APIs**. Apple introduced them at WWDC26 for the 2027 releases, and the current documentation labels the relevant protocols beta; iPadOS 27 itself remains in beta. citeturn16search0turn16search2turn16search9

## Architectural decision and API baseline

Aural Geometry Lab's backlog already establishes the right separation of concerns for native work. The command bus is intended to provide atomic commands with inverse operations and grouped undo; one canonical render plan is intended to drive real-time and offline audio; visualization is already conceived as a projection contract; accessibility requires semantic descriptions; and the portable-project effort calls for manifests, assets, integrity hashes, and round-trip tests. fileciteturn0file0 The seven current labs range from relatively simple 2D rhythm geometry to dense CA/chaos rendering and Penrose geometry, so a single graphics technology would be an artificial constraint. fileciteturn0file1

The program plan also argues against a native fork of the product core: capacity is two product engineers plus one product/UX FTE, while the web milestones still require the runtime, audio/render spine, all seven labs, accessibility, and hardening. A duplicated semantic engine would create a permanent tax that this staffing model cannot absorb. fileciteturn0file2 DR-03 already owns browser audio scheduling and DR-08 owns general sonification semantics; DR-12 should consume those semantic contracts rather than redefine them natively. fileciteturn0file3

### Released versus provisional API boundary

| Area | Ship on iPadOS 26 | Status / recommendation |
|---|---|---|
| Documents | `DocumentGroup`, `FileDocument`, `FileWrapper`, `UTType`, package UTIs | **Released; primary choice.** `DocumentGroup` supplies the iOS document browser and multiwindow integration; `FileDocument` can serialize a directory package. citeturn15search0turn15search2 |
| Reference documents | `ReferenceFileDocument` | **Released on 26, but strategically avoid.** Current 2027 SDK documentation marks it deprecated in favor of the new beta document model. citeturn15search3 |
| Explicit document coordination | `UIDocument`, `UIDocumentViewController`, `NSFileVersion` | **Released; fallback** when explicit conflict/version management proves necessary. Apple documents `UIDocument` as coordinating asynchronous document loading/saving and change tracking. citeturn15search1 |
| New SwiftUI documents | `Document`, `ReadableDocument`, `WritableDocument`, `DocumentReader`, `DocumentWriter`, new direct-URL workflows | **Beta / 2027 cycle. Do not ship DR-12 on them.** citeturn16search0turn16search2turn15search4 |
| Audio engine | Existing `AVAudioEngine` graph APIs, `AVAudioPlayerNode`, `AVAudioUnitSampler`, `AVAudioSourceNode`, manual rendering | **Released.** Some newly renamed/reworked overloads now visible in Xcode 27 documentation are beta; use the iPadOS-26-available forms behind native adapters. citeturn18search0turn18search1turn18search10turn18search12 |
| Audio session | Existing interruption notification, route-change handling, `setActive`, playback/play-and-record categories | **Released.** The newer activation/deactivation-context and resumption-recommendation APIs currently shown in documentation are beta; do not require them. citeturn19search0turn19search3 |
| Core MIDI | `MIDIEventList`, UMP, `MIDIInputPortCreateWithProtocol`, `MIDISendEventList`, protocol-aware virtual endpoints | **Released and preferred.** Byte-oriented `MIDIPacketList` APIs are now deprecated. citeturn17search0turn17search7turn17search8turn17search11 |
| iPad adaptive UI | Resizable windows, menu bar, `NavigationSplitView`, SwiftUI commands, inspector patterns | **Released in iPadOS 26.** Apple specifically advises adapting to window dimensions and preserving state through resizing. citeturn21search3turn21search13 |
| Pencil Pro | squeeze, double-tap, hover pose, roll, Pencil haptics | **Released since iPadOS 18; hardware dependent.** Capability gate every enhancement. citeturn20search0turn20search2 |
| Long exports | `BGContinuedProcessingTask` with default CPU/network resources | **Released in iOS/iPadOS 26.** Appropriate to a user-started long export. citeturn16search5turn16search7 |
| Background GPU continuation | `BGContinuedProcessingTaskRequest.Resources.gpu` | **Currently documented as beta.** Do not make native export depend on it. citeturn16search12 |

The resulting public-API architecture should look like this:

```text
                           AURAL GEOMETRY LAB SEMANTIC CONTRACT
                 ┌────────────────────────────────────────────────┐
                 │ JSON Schema • exact rational time • stable IDs │
                 │ operator semantics • seeds • budgets • fixtures│
                 │ canonical RenderPlan • projection primitives    │
                 └───────────────────┬────────────────────────────┘
                                     │
                        shared behavior + fixtures
                                     │
              ┌──────────────────────▼───────────────────────┐
              │                Native AGL Core                │
              │                                               │
Files/iCloud ─► AGLDocument ─► ProjectStore / CommandDispatcher
 DocumentGroup│       │                    │                   │
 FileDocument │       │             SelectionModel            │
 FileWrapper  │       │                    │                   │
              │       └────► GraphEvaluatorAdapter             │
              │                        │                       │
              │                 NativeRenderPlan               │
              │                  /           \                 │
              │                 /             \                │
              │      AVAudioEngineBackend    ExportService     │
              │              │               │                 │
              │        AVAudioSession     manual AVAudioEngine │
              │              │                                 │
              │         audio hardware                          │
              │                                                │
              │        MIDIRouter ─────────────► Core MIDI UMP  │
              │                                                │
              │ CanvasProjection ─► Canvas / MTKView / Reality │
              │ InspectorProjection ─► SwiftUI inspector       │
              └──────────────────────┬─────────────────────────┘
                                     │
                         ConformanceTestHarness
                                     │
                 ┌───────────────────┴────────────────────┐
                 │ Swift result == TypeScript goldens     │
                 │ project • events • plans • projections │
                 └────────────────────────────────────────┘

         [iPadOS 27 beta migration seam]
        new SwiftUI Document/Reader/Writer
                    ↓
              AGLDocument only
        — no semantic-core redesign —
```

This is deliberately **ports-and-adapters architecture**: public Apple frameworks stop at narrow native interfaces, while AGL's canonical state has no knowledge of SwiftUI, AVFoundation, Metal, or Core MIDI.

## Document, project-state, undo, and multiwindow architecture

### Recommended `.agl.project` representation

Use a **document package**, not a monolithic JSON file, while retaining one canonical JSON semantic payload. `FileDocument.fileWrapper(configuration:)` explicitly supports returning a directory `FileWrapper`, and Apple notes that a package makes it possible to rewrite only changed constituent files. Serialization/deserialization must not be isolated to `MainActor`; current `FileDocument` is `Sendable`, and Apple explicitly warns that SwiftUI invokes the protocol across different isolation domains. citeturn15search0

A recommended package is:

```text
My Composition.agl.project/
├── manifest.json
├── project.json
├── assets/
│   ├── sha256-<hash>.<ext>
│   └── ...
└── preview/
    └── thumbnail.png        # optional, derived and discardable
```

`manifest.json` should contain only package-level facts: package format version, canonical schema version, project semantic ID, save-generation UUID, content hashes, asset metadata, and compatibility requirements. `project.json` remains the canonical cross-platform project. The `assets/` layout directly matches AGL-014's planned hash-addressed asset store and AGL-015's planned portable package with integrity hashes. fileciteturn0file0

Do **not** persist viewport, inspector openness, current hover position, keyboard focus, selection, audio-device route, or current `AVAudioEngine` state into `project.json`. Those are scene/session state. `SelectionModel` in particular should remain transient; that preserves the existing linked-selection semantics without polluting portable project identity. AGL-036 already treats event, node, geometry, and provenance selection as a linked UI concept rather than project content. fileciteturn0file0

### Why `FileDocument`, despite AGL being a complex editor

The key is to make `AGLDocument` a **persistence snapshot**, not the entire observable application model.

```swift
struct AGLDocument: FileDocument, Sendable {
    var project: ProjectSnapshot
    var manifest: PackageManifest

    // serialization only
}
```

The active editor owns a reference-type `ProjectStore`. Every edit passes through `CommandDispatcher`; the dispatcher produces a new canonical project snapshot and commits that snapshot back into the document binding. This means SwiftUI sees the document change and can autosave it, while AGL maintains exactly one command path for gestures, keyboard commands, MIDI mappings, accessibility actions, scripts, and undo.

This is preferable to letting random SwiftUI bindings mutate project fields directly. AGL-012 already requires atomic commands, inverse operations, grouped transactions, and undo/redo; native code should reuse that semantic rule. fileciteturn0file0

### Autosave and undo

`DocumentGroup` tracks value-document edits through the document binding and writes the document when appropriate; Apple's SwiftUI document sample also notes automatic undo support for a `FileDocument`. citeturn15search2turn15search8 For AGL, however, the platform undo manager should be an **adapter to the AGL command bus**, not an independent history mechanism:

```text
Pencil drag / keyboard / inspector edit
                 │
                 ▼
         CommandDispatcher
                 │
         one semantic command
         or transaction group
           ┌─────┴─────┐
           ▼           ▼
      ProjectStore  inverse command
           │           │
           │           └── register with UndoManager
           ▼
   document Binding updated
           │
           ▼
      SwiftUI autosave
```

A drag that generates 173 pointer samples therefore remains **one undo operation**, not 173. The command bus begins a transaction at gesture-down, previews transient state if needed, and commits one semantic operation at gesture-up. Undo triggered by the iPad menu bar, Command-Z, accessibility action, or system UI all dispatch the same inverse command.

Avoid a second periodic autosave timer. A timer creates unnecessary package writes and races the system document lifecycle. Use SwiftUI's dirty-document mechanism for normal editing; create a separate recovery journal only if the crash-recovery prototype demonstrates a need beyond system autosave.

### SwiftUI scene skeleton

The iPadOS-26 implementation should intentionally use the released document APIs even if an Xcode 27 SDK emits deprecation guidance toward the 2027 document model. `DocumentGroup` gives iOS/iPadOS a filesystem document browser and multiwindow behavior; Apple also specifically warns that the `fileURL` exposed to the editor is for identity/display use, not an invitation to read or mutate document contents behind SwiftUI's back. citeturn15search2

```swift
import SwiftUI
import UniformTypeIdentifiers

extension UTType {
    static let aglProject = UTType(
        exportedAs: "com.auralgeometrylab.project",
        conformingTo: .package
    )
}

struct AGLDocument: FileDocument, Sendable {
    static let readableContentTypes: [UTType] = [.aglProject]

    var manifest: PackageManifest
    var project: ProjectSnapshot

    init() {
        manifest = .newProject()
        project = .empty()
    }

    init(configuration: ReadConfiguration) throws {
        let package = try AGLPackageReader.read(configuration.file)
        manifest = package.manifest
        project = try ProjectMigrator.loadAndMigrate(package.project)
    }

    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        try AGLPackageWriter.makePackage(
            manifest: manifest,
            project: project,
            priorWrapper: configuration.existingFile
        )
    }
}

@main
struct AGLNativeApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: AGLDocument()) { configuration in
            StudioDocumentRoot(
                document: configuration.$document,
                documentURL: configuration.fileURL
            )
        }
        .commands {
            AGLStudioCommands()
        }
    }
}

struct StudioDocumentRoot: View {
    @Binding var document: AGLDocument
    let documentURL: URL?

    @Environment(\.undoManager) private var undoManager

    @State private var projectStore: ProjectStore
    @State private var selection = SelectionModel()

    // Pseudocode: actual initialization should install a MainActor
    // document-commit adapter after the binding is available.

    var body: some View {
        StudioAdaptiveLayout(
            project: projectStore,
            selection: selection
        )
        .task {
            projectStore.installDocumentCommitter { snapshot in
                document.project = snapshot
            }
            projectStore.undoManager = undoManager
        }
    }
}
```

The precise `existingFile` accessor differs with SDK-generation APIs and should be hidden inside `AGLPackageWriter`; the important contract is that the package writer is pure, off-main, and capable of retaining/reusing unchanged asset wrappers. Apple's package model is explicitly designed for that style of incremental write. citeturn15search0

### Multiwindow model

Support **multiple independent projects in independent windows** from day one. That is the natural `DocumentGroup` model, and iPadOS 26's general windowing system makes arbitrary resizing and floating windows normal rather than exceptional. citeturn15search2turn21search3

For the **same package opened twice**, use a conservative phase-one policy: **single writer per file identity inside one process**. Maintain an app-level `OpenDocumentRegistry`; if the same open document is requested again, share the existing logical session where the scene API permits it, or make the second presentation read-only rather than creating two independent mutable `ProjectStore`s. This is an AGL policy, not an Apple API requirement, and it prevents avoidable in-process split-brain state.

Auxiliary AGL windows—such as a full-screen visualization or performance monitor—should not be separate `FileDocument` instances. They should reference a `ProjectSessionID` and subscribe to the same `ProjectStore`/`SelectionModel`.

### iCloud Drive, Files, and conflict handling

Using `DocumentGroup` keeps the project in the user's Files/document ecosystem rather than hiding it in an application database. Apple documents `DocumentGroup` as providing an iOS document browser over filesystem locations, and its document frameworks coordinate file access when used through their intended APIs. citeturn15search2

There is one material caveat. `UIDocument` exposes mature document-state/conflict behavior and can participate explicitly in version handling, while SwiftUI's `FileDocument` intentionally presents a higher-level snapshot abstraction. Apple explicitly tells `DocumentGroup` users not to access document contents or metadata through `configuration.fileURL`, because doing so can interfere with SwiftUI's management. citeturn15search1turn15search2

Therefore:

**Phase-one conflict policy:** never invent byte-level package merging. Every save generation gets a UUID and content hashes. If an external divergent version reaches AGL, preserve both versions first. Automatic merge is permitted only at the **canonical project-object level**, where both versions share a known ancestor and every merged object can be identified by AGL's stable IDs.

**Proof-of-architecture gate:** deliberately create iCloud/File Provider conflicts—two devices offline, edit both, reconnect; move/rename during edit; same project through two windows; provider eviction/re-download. If `DocumentGroup<FileDocument>` does not provide enough reliable signal to present a safe recovery workflow, change `AGLDocument` to a `UIDocument`-based persistence adapter. `UIDocument` is a released public API specifically designed around coordinated document loading, saving, automatic save tracking, and document-centric iPad apps. citeturn15search1

That fallback should change **zero** APIs below the persistence boundary.

## Native modules, audio engine, rendering, and MIDI

### Required module contracts

A workable first interface set is:

```swift
// Persistence boundary. No UI, engine, or MIDI objects.
struct AGLDocument: FileDocument, Sendable {
    var manifest: PackageManifest
    var project: ProjectSnapshot
}

// Canonical mutable session, MainActor because UI observes it.
@MainActor
@Observable
final class ProjectStore {
    private(set) var snapshot: ProjectSnapshot
    var undoManager: UndoManager?

    func dispatch(_ command: ProjectCommand) throws
    func dispatch(_ transaction: ProjectTransaction) throws
}

// The only semantic edit API.
protocol CommandDispatcher: AnyObject {
    @MainActor
    func dispatch(_ command: ProjectCommand) throws
    @MainActor
    func beginTransaction(_ id: TransactionID)
    @MainActor
    func commitTransaction(_ id: TransactionID) throws
    @MainActor
    func cancelTransaction(_ id: TransactionID)
}

// Ephemeral UI state; never serialized into project.json.
@MainActor
@Observable
final class SelectionModel {
    var primary: SemanticID?
    var members: Set<SemanticID>
    var provenanceFocus: ProvenancePath?
}

// Native entry point for the canonical graph semantics.
protocol GraphEvaluatorAdapter: Sendable {
    func evaluate(
        snapshot: ProjectSnapshot,
        interval: RationalInterval,
        budget: EvaluationBudget,
        cancellation: EvaluationCancellation
    ) async throws -> EvaluationResult
}

// Immutable output of evaluation/compilation.
struct NativeRenderPlan: Sendable, Codable {
    let schemaVersion: Int
    let projectRevision: RevisionID
    let range: RationalInterval
    let tempoMap: TempoMap
    let tracks: [RenderTrack]
    let resources: [ResourceDescriptor]
    let seedContext: SeedContext
}

// AVFoundation implementation only; doesn't understand graph nodes.
protocol AudioBackend: Sendable {
    func prepare(_ plan: NativeRenderPlan) async throws
    func play(from: RationalTime) async throws
    func pause() async
    func stop() async
    func seek(to: RationalTime) async throws
}

final class AVAudioEngineBackend: AudioBackend {
    // Dedicated serialized control plane.
    // Render callbacks communicate through bounded RT-safe queues.
}

// Core MIDI boundary.
protocol MIDIRouter: Sendable {
    func destinations() async -> [MIDIDevice]
    func connect(_ endpoint: MIDIEndpointID) async throws
    func send(_ events: [CanonicalMIDIEvent]) async throws
    var inputEvents: AsyncStream<CanonicalMIDIEvent> { get }
}

// Framework-independent renderable/semantic projection.
protocol CanvasProjection: Sendable {
    func project(
        evaluation: EvaluationResult,
        viewport: CanvasViewport,
        selection: SelectionSnapshot
    ) -> CanvasFrame
}

protocol InspectorProjection: Sendable {
    func project(
        project: ProjectSnapshot,
        evaluation: EvaluationResult?,
        selection: SelectionSnapshot
    ) -> InspectorModel
}

protocol ExportService: Sendable {
    func renderAudio(_ request: AudioExportRequest) async throws -> ExportArtifact
    func exportMIDI(_ request: MIDIExportRequest) async throws -> ExportArtifact
    func packageProject(_ request: PackageExportRequest) async throws -> ExportArtifact
}

protocol ConformanceTestHarness {
    func compareProjectRoundTrip(_ fixture: Fixture) throws
    func compareEvaluation(_ fixture: Fixture) async throws
    func compareRenderPlan(_ fixture: Fixture) async throws
    func compareProjection(_ fixture: Fixture) async throws
}
```

This aligns directly with AGL-022/023's graph compiler/evaluator, AGL-041's canonical render plan, AGL-050's visualization projection, AGL-012's command bus, AGL-045's offline rendering, and AGL-133's invariant suite. fileciteturn0file0

### AVAudioEngine graph

`AVAudioEngine` remains a public, supported graph of attached audio nodes and supports both device-connected real-time operation and client-driven manual rendering. `AVAudioUnitSampler` is Apple's public Sampler wrapper and accepts sound banks, individual audio files, EXS24 instruments, and other documented formats. citeturn18search0turn18search1

AGL should use a topology roughly like this:

```text
                     TRACK N
     ┌────────────────────────────────────────────┐
     │                                            │
RenderPlan event queue                            │
     │                                            │
     ├──► Sampler voice ─┐                        │
     ├──► Synth source ──┼──► TrackMixer          │
     ├──► Noise/perc ────┘       │                │
     │                           ▼                │
     │                       filter/EQ            │
     │                           │                │
     │                      insert effects         │
     │                           │                │
     └───────────────────────────▼────────────────┘
                             Track Bus
                                 │
                     ┌───────────┴────────────┐
                     ▼                        ▼
                 other tracks             sends
                     │                        │
                     └────────────┬───────────┘
                                  ▼
                            Master Mixer
                                  │
                       safety dynamics/limiter
                                  │
                                  ▼
                          AVAudioOutputNode
                                  │
                             hardware route
```

Use `AVAudioUnitSampler` where Apple's sampler semantics are sufficient. Use an `AVAudioSourceNode` or a deliberately small custom audio unit where AGL requires deterministic oscillator/noise behavior that must match offline generation. Keep built-in EQ/delay/reverb/dynamics behind AGL effect descriptors instead of leaking `AVAudioUnit` types into `NativeRenderPlan`. `AVAudioEngine` exposes custom source nodes and real-time/non-real-time audio units as supported parts of its audio-engine architecture. citeturn18search9turn18search16

Avoid structural graph mutation while transport is running whenever possible. Parameter changes and mixer gains are normal live operations; adding/removing/reconnecting arbitrary nodes should occur through a controlled graph-rebuild path because Apple documents limitations around run-time connect/disconnect operations. citeturn18search0

### Sample-accurate scheduling strategy

The render plan retains **exact rational musical time** as the semantic source of truth. At the native backend boundary, one `TransportClock` converts that time through the tempo map into integer sample positions for the engine's current render rate.

```text
exact RationalTime
      │
      ▼
TempoMap.integrate()
      │
      ▼
continuous seconds
      │
      ▼
round according to one canonical rule
      │
      ▼
absolute sample frame
      │
      ├──► AVAudioPlayerNode / audio-unit scheduled event
      └──► custom source-node RT event queue
```

`AVAudioTime` explicitly represents both host time and audio sample time, making it the correct public clock bridge. The stable `AVAudioPlayerNode` scheduling API accepts an `AVAudioTime` at which a buffer begins. citeturn18search2turn18search10

Use two scheduling layers:

**Control/scheduler plane:** a serialized backend task keeps a rolling horizon of plan events scheduled ahead of playback. Start benchmarking around **100–250 ms of look-ahead**, but make this dynamically tunable; that figure is a DR-12 starting point, not an Apple guarantee. The scheduler performs allocations, plan traversal, buffer lookup, and conversion outside the render callback.

**Real-time plane:** custom synthesis/render callbacks consume preallocated event structures carrying absolute or block-relative sample offsets. They do not allocate, take blocking locks, log, dispatch onto actors, perform JSON work, or evaluate AGL graphs. Swift concurrency is useful for the control plane, but it is **not** the real-time audio scheduler.

For notes routed into an audio unit, use that unit's scheduled-event interface rather than firing "start note now" operations from a timer. For `AVAudioPlayerNode` samples, schedule the buffer at the absolute audio time. For AGL-written source nodes, consume events at their exact sample offset inside the block.

A transport seek or edit invalidates all events after a `generationID`. The backend schedules only events matching the latest generation; a hard stop calls player stop/reset as appropriate, then reconstructs scheduling from the new transport anchor. Apple notes that stopping an `AVAudioPlayerNode` clears scheduled events and resets its node sample time. citeturn18search17

### Real-time and offline must consume the same plan

Do **not** put export logic in the graph evaluator and do not maintain a second "offline event representation." AGL-041 already requires one canonical plan for both paths. fileciteturn0file0

`ExportService` should instantiate a **separate** engine from the same `EngineGraphFactory`:

```text
                        NativeRenderPlan
                         /            \
                        /              \
               REAL-TIME BACKEND     EXPORT BACKEND
               AVAudioEngine #1      AVAudioEngine #2
               device rendering      manual/offline mode
                      │                    │
                 speaker/USB          renderOffline()
                                           │
                                      PCM chunks
                                           │
                                      WAV/CAF writer
```

This is preferable to putting the live engine into manual mode, because Apple documents that manual rendering disconnects the engine from audio devices and makes the application responsible for driving rendering. `enableManualRenderingMode` chooses a PCM format and maximum block size; `renderOffline` then produces requested frames. citeturn18search0turn18search12turn18search6

The offline backend should:

1. Compile the exact same plan and resource hashes used by real-time playback.
2. Choose an explicit export sample rate/format rather than inheriting an arbitrary current Bluetooth/device route.
3. Build the same voice/effect graph.
4. Schedule all events in sample space.
5. Render fixed-size blocks until the plan end plus declared effect tail.
6. Stream blocks directly to the file writer rather than accumulating the complete project in RAM.
7. Support cooperative cancellation between blocks.
8. Emit an export manifest containing project revision, plan version, seed context, sample rate, channel layout, asset hashes, and app version.

For AGL-owned deterministic synths, real-time and offline output for the same sample rate should be **sample identical**. For Apple effects or future third-party audio units, use a numerical/audio tolerance rather than requiring bit identity.

### Audio session state machine

A composition app that only produces sound should default to the `playback` category and default mode. Apple's playback guidance supports background playback when the audio background capability is enabled. Do not move to `playAndRecord` until AGL genuinely adds audio input; that changes routing semantics unnecessarily. citeturn4search4turn19search3

```text
                  ┌─────────────┐
                  │    IDLE     │
                  │ session off │
                  └──────┬──────┘
                         │ Play
                         ▼
                 ┌───────────────┐
                 │  ACTIVATING   │
                 │ configure +   │
                 │ setActive     │
                 └───────┬───────┘
                         │ success
                         ▼
           ┌──────────────────────────┐
           │         RUNNING          │
           │ engine + scheduler live  │
           └────┬─────────┬───────────┘
                │         │
     interruption began   │ route change
                │         │
                ▼         ▼
        ┌────────────┐  ┌──────────────┐
        │INTERRUPTED │  │ RECONFIGURING│
        │ remember   │  │ query actual │
        │ intent     │  │ rate/buffer  │
        └─────┬──────┘  └──────┬───────┘
              │ interruption    │ rebuilt
              │ ended           │
              ▼                 │
       recommendation /         │
       iPadOS26 shouldResume    │
         ┌────┴────┐            │
         │         │            │
       resume    remain         │
         │       paused         │
         └────┬────┘            │
              └──────────┬──────┘
                         ▼
                       RUNNING

 mediaServicesWereReset
          │
          ▼
 ┌──────────────────┐
 │ HARD RESET       │
 │ discard engine   │
 │ recreate session │
 │ recreate nodes   │
 └────────┬─────────┘
          │
          ▼
 PAUSED / wait for explicit user playback
```

On iPadOS 26, interruption handling should use the released `AVAudioSession.interruptionNotification` flow and the interruption's resume option. Current documentation shows newer resumption-context APIs, but those are beta in the 2027 SDK and should sit behind a future adapter. citeturn19search0turn19search3

On a media-services reset, destroy and recreate the audio objects and restore the session category/options. Apple explicitly says **not** to automatically restart playback after such a reset; wait for user action. citeturn19search1

After every route transition, reacquire the actual device sample rate, buffer duration, route latency, and channel configuration before rebuilding the transport anchor. Preferred I/O settings are requests rather than guarantees; the final hardware values are what the scheduler must use.

### Bluetooth and low latency

For normal music playback, Bluetooth A2DP is the appropriate Bluetooth output profile; Apple describes it as stereo, output-only, higher-bandwidth music playback, and the `playback` category automatically makes such routes available. citeturn19search4

Do **not** promise low-latency direct manipulation over Bluetooth. Treat Bluetooth/AirPlay as **high/variable-latency routes** and increase the scheduling horizon accordingly. AGL can still achieve internally sample-accurate sequencing—the output device simply presents it later. For real-time finger/Pencil performance, the recommended route is built-in speakers or a wired/class-compliant USB audio interface.

If future AGL audio input requires Bluetooth, use the specific `allowBluetoothHFP` option rather than the old generic `allowBluetooth`, which current SDK documentation marks deprecated. HFP is an input-capable route and is distinct from the higher-bandwidth A2DP playback route. citeturn19search5turn19search10

### Core MIDI strategy

Core MIDI's modern API model is UMP (`MIDIEventList`), and Apple's MIDI 2 sample states that UMP can carry MIDI 1 and MIDI 2 semantics while Core MIDI performs protocol conversion for destinations where necessary. citeturn17search9 MIDI.org likewise defines MIDI 2.0 as an extension of, not a replacement for, MIDI 1.0, with higher-resolution channel-voice data and additional per-note expression. citeturn17search6

Use this stack:

```text
USB / BLE / Network / Virtual MIDI
              │
              ▼
   Core MIDI MIDIEventList / UMP
              │
   high-priority callback
              │
              ▼
 preallocated bounded ingress queue
              │
              ▼
          MIDIRouter
       normalize semantics
              │
       ┌──────┴─────────┐
       ▼                ▼
performance input   MIDI mapping
/render events      → ProjectCommand
       │
       ▼
 NativeRenderPlan / transport

Native MIDI output
       │
       ▼
CanonicalMIDIEvent
       │
UMP encode for endpoint protocol
       │
MIDISendEventList + future timestamp
       │
external destination
```

Create input ports with `MIDIInputPortCreateWithProtocol`, not the deprecated byte-oriented input-port API. The receive block runs on a Core MIDI high-priority thread, so it must perform bounded, nonblocking work and hand packets off immediately. citeturn17search7turn17search14

Use `MIDISendEventList` for output; Apple explicitly states that future packet timestamps are scheduled for future delivery and that the system performs necessary MIDI merging. citeturn17search0 For AGL-created virtual endpoints, use protocol-aware endpoint creation and persist the same Core MIDI unique ID between launches so other applications can retain stable references. citeturn17search8

Internally, **do not reduce MIDI 2 input to 7-bit MIDI 1 values**. A canonical event should preserve:

```text
group
channel
message semantic
note / note ID where available
32-bit controller/value resolution where supplied
timestamp
source endpoint
provenance
```

Down-convert only at an output boundary that requires MIDI 1, with explicit quantization. That matches AGL's existing philosophy of exact internal semantics followed by explicit compatibility conversion.

For file export, keep the current AGL-130 **conventional Standard MIDI File** path as the interoperability default. fileciteturn0file0 MIDI.org now includes UMP-oriented file specifications in the MIDI 2 family, but they should be an additive future export format, not a replacement for ubiquitous MIDI 1-compatible files. citeturn17search6

MIDI-CI is valuable for future profile/property discovery but is not an MVP requirement. MIDI.org defines it as a bidirectional mechanism for negotiating extended capabilities. citeturn17search6 The native MVP should prioritize UMP transport, endpoint hot-plugging, accurate timestamps, learn/mapping, virtual ports, and graceful MIDI-1 down-conversion.

## Graphics, adaptive studio UI, Pencil, and accessibility

### Rendering API by lab

SwiftUI `Canvas` should be AGL's default rendering technology for 2D labs. Apple describes `Canvas` as its immediate-mode drawing surface and specifically notes its usefulness for very large numbers of dynamic shapes. `MTKView` is the standard MetalKit view when the workload needs explicit GPU rendering. citeturn21search12turn21search8

The important design decision is that **`CanvasProjection` does not return SwiftUI `Path`s, Metal buffers, or RealityKit entities as its semantic contract**. It returns AGL primitives plus hit-testing/accessibility data, and a renderer translates those primitives.

| Lab | Primary native renderer | Escalation path | Rationale |
|---|---|---|---|
| **Infinite Staircase** | SwiftUI `Canvas` + display-timed updates | Metal only for dense spectrographic/particle additions | Log-tempo bands, phase, gains, labels, and layer state are bounded 2D geometry. AGL-062 is fundamentally a linked 2D visualization. fileciteturn0file0 |
| **Euclidean Rings** | **SwiftUI `Canvas`** | None expected | Circles, sectors, steps, playhead, rotation and phase are ideal immediate-mode vector geometry; direct manipulation remains easy to hit-test semantically. fileciteturn0file0 |
| **Tonnetz Walk** | **SwiftUI `Canvas`** | Metal for extremely large/animated lattices | 2D lattice, triangles, labels, and editable paths do not justify a GPU-specific model at normal scale. fileciteturn0file1 |
| **Fractal Motif** | Canvas for normal bounded recursion | **Metal** when projected primitive counts exceed a measured threshold | AGL explicitly requires bounded recursion; Canvas keeps ordinary cases simple, while Metal gives an escape hatch for large animated trees. fileciteturn0file0 |
| **Cellular Automaton** | **Metal/MetalKit** for dense/animated grids | Canvas accessibility/static fallback | Large grids and generation stepping map naturally to GPU buffers/textures; avoiding thousands of SwiftUI elements is important. `MTKView` is Apple's purpose-built Metal presentation view. citeturn21search8 |
| **Chaos Attractor** | **Metal** for live high-density trajectories | Canvas for frozen/downsampled 2D; RealityKit for optional 3D | The live attractor is the strongest continuous point/line-stream workload. RealityKit should be optional rather than becoming an AGL-wide dependency. fileciteturn0file1 |
| **Penrose Sequencer** | **SwiftUI `Canvas`** for finite patch editing | Metal only above benchmarked patch complexity | Selection, adjacency, labels, and traversal are 2D vector geometry. AGL's current scope explicitly requires a finite, deterministic patch. fileciteturn0file0 |

RealityKit is therefore **not** the general AGL canvas. It is a good optional adapter for a genuine 3D chaos view or later 3D comparison mode; using it for Euclidean rings, Tonnetz, Penrose, or general graph editing would add scene/entity machinery without semantic benefit.

`CanvasFrame` should include semantic hit regions independently of its visual primitives:

```swift
struct CanvasFrame: Sendable {
    let worldBounds: RectD
    let primitives: [CanvasPrimitive]
    let hitRegions: [SemanticHitRegion]
    let accessibility: AccessibilityProjection
    let rendererHint: RendererHint
}
```

That makes the web/native parity test about **geometry and semantics**, not pixels.

### Adaptive iPad studio

iPadOS 26 materially changes the assumption that "landscape iPad" means one fixed desktop-sized rectangle. Apple says multitasking apps participate in a new freely resizable windowing system and explicitly recommends dimension-responsive, non-destructive layout changes. citeturn21search3 SwiftUI's standard structures—including `NavigationSplitView`, inspectors, sheets, and commands—also inherit the iOS/iPadOS 26 design behavior, and the SwiftUI `Commands` API now contributes to the iPad menu bar. citeturn21search1turn21search13

Therefore **never branch core layout on device orientation**. Branch on available space.

```text
WIDE WINDOW
┌────────────┬────────────────────────────────┬───────────────┐
│ Lab /      │                                │ Inspector     │
│ project    │          main canvas           │ parameters    │
│ sidebar    │                                │ math/prov.    │
│            ├────────────────────────────────┤               │
│            │ transport / timeline / mixer   │               │
└────────────┴────────────────────────────────┴───────────────┘

MEDIUM WINDOW
┌────────────┬───────────────────────────────────────────────┐
│ collapsible│                                               │
│ sidebar    │                main canvas                    │
│            │                                               │
├────────────┴───────────────────────────────────────────────┤
│ timeline / transport                         [Inspector ↗] │
└────────────────────────────────────────────────────────────┘

NARROW / PORTRAIT / SMALL FLOATING WINDOW
┌────────────────────────────────────────────────────────────┐
│ transport / title / contextual tools                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                     main canvas                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ selected-object summary                                   │
└────────────────────────────────────────────────────────────┘
 sidebar = on-demand
 inspector = resizable sheet / drawer
 timeline = expandable bottom surface
```

Recommended behavior:

**Wide:** `NavigationSplitView` sidebar + content, with a trailing inspector and persistent timeline/mixer.

**Medium:** collapsible sidebar, content-first canvas, inspector toggled from toolbar/menu and allowed to overlay/reflow.

**Narrow:** one primary work surface. Sidebar becomes on-demand navigation; inspector becomes a detented sheet; timeline becomes a bottom presentation. Selection and scroll/zoom positions survive every transition.

Do not destroy or recreate the lab model merely because a window crosses a size-class threshold. Apple explicitly calls for non-destructive adaptation when windows resize. citeturn21search3

### Keyboard, pointer, drag/drop, and menu system

On iPadOS 26, the menu bar is part of normal iPad interaction even without a hardware keyboard, and Apple says app commands should remain discoverable there even when currently unavailable. citeturn21search6 AGL should therefore define commands at the semantic-command level:

```text
Project
  New/Open/Save a Copy/Export
Edit
  Undo/Redo/Cut/Copy/Paste/Duplicate/Delete
Transport
  Play/Pause/Stop/Loop/Seek
Selection
  Select All/Clear/Next/Previous
View
  Toggle Sidebar/Inspector/Timeline/Reset View
Lab
  lab-specific semantic commands
MIDI
  Devices/Learn/Panic
```

`FocusedValues` or an equivalent scene routing layer should send those commands to the active `ProjectStore`; do not put command implementation into view structs.

Pointer interaction should add hover affordances, precision cursors, resize feedback, and context menus but **not create pointer-only operations**. Drag/drop should carry AGL semantic identifiers or portable payloads rather than references to view objects.

### Apple Pencil policy

Apple Pencil support should be **progressive enhancement**:

| Feature | Recommended AGL use |
|---|---|
| Contact location | First-class direct manipulation everywhere touch is supported. |
| Pressure | Optional accent/velocity or brush-width input; never the only way to set a value. |
| Altitude/azimuth | Useful for expressive motif drawing or tool preview; optional. |
| Hover | Preview selection, insertion location, ring/vertex highlighting, tooltip/tool footprint. Never required to discover or invoke an operation. |
| Double tap | Respect the user's preferred tool-switch action. |
| Squeeze | Discrete contextual palette/tool operation only, respecting the global preferred action. |
| Barrel roll | **Only expressive stroke/tool orientation**, not a generic knob for rotation, tempo, phase, etc. |
| Haptic feedback | Snap-to-grid, path completion, alignment, and discrete semantic confirmation. |

Apple explicitly recommends treating squeeze as a discrete gesture, respecting the system squeeze preference, and notes that when a system shortcut owns squeeze the application may receive no squeeze event. citeturn20search0turn20search2 Apple also explicitly recommends barrel roll for expressive strokes rather than controlling UI elements, and notes that the initial roll value may be estimated and refined later. citeturn20search2

That leads to specific lab behavior:

**Euclidean Rings:** Pencil contact rotates rings or toggles steps; hover previews the target step; haptic snap at integer phase positions. Do **not** map barrel roll to ring rotation.

**Tonnetz:** Pencil contact traces/edits harmonic paths; hover prelights candidate vertices/triads.

**Fractal Motif:** strongest Pencil feature set. Pressure may control optional accent; azimuth/roll can alter the visual stroke if an expressive drawing tool exists. If motif input requires high-fidelity touch samples, host a small UIKit canvas beneath SwiftUI rather than forcing all low-level Pencil data through general SwiftUI gestures.

**CA/Penrose:** contact edits/selects cells/tiles; hover identifies candidates.

**Chaos:** Pencil can scrub or set an initial condition in a 2D projection, but precision keyboard/numeric controls remain available.

Apple's feedback APIs include canvas-specific haptics for snapping/path completion, including `UICanvasFeedbackGenerator`, while SwiftUI exposes corresponding sensory-feedback mechanisms. citeturn20search2turn20search4

### Accessibility contract for every custom canvas

A custom-drawn canvas is **not accessibility-exempt**. Apple's HIG requires keyboard operability, VoiceOver description, alternatives to gesture-only interaction, non-color-only distinctions, and support for technologies including Full Keyboard Access and Switch Control. citeturn21search5turn21search7 SwiftUI provides synthetic accessibility representations specifically so a custom-rendered view can expose controls that do not physically exist as SwiftUI subviews. citeturn21search0

Each `CanvasProjection` must therefore emit **two synchronized products**:

```text
visual primitives
      +
semantic accessibility projection
```

For example:

```swift
struct AccessibilityProjection: Sendable {
    let summary: String
    let focusedItem: AccessibleSemanticItem?
    let visibleItems: [AccessibleSemanticItem]
    let rotors: [AccessibleRotorModel]
    let availableActions: [AccessibleAction]
}
```

Do **not** create one accessibility element per rendered primitive in a 100,000-cell CA or 200,000-point attractor. Accessibility granularity should represent meaningful musical/mathematical objects:

- Euclidean Rings: ring as adjustable element; currently focused step separately navigable.
- Tonnetz: visible harmonic vertices/path steps and current chord.
- Fractal: motif elements and ancestry nodes.
- CA: focused cell plus row/region/generation summaries, with navigation actions to traverse interesting cells.
- Chaos: parameters, current sample, extrema/trajectory summary—not every point.
- Penrose: selected tile, neighbors, traversal index and musical mapping.

AGL-053 already calls for synchronized accessible mathematical descriptions, and AGL-132 requires keyboard, focus, semantics, reduced motion, and non-color cues. The native client should make those **projection-level conformance requirements**, not late UI polish. fileciteturn0file0

Every semantic operation on a canvas needs a keyboard/accessibility twin: select, move, increment/decrement, connect, delete, rotate/phase, zoom, pan, inspect provenance, play/audition. Full Keyboard Access must be tested with the system feature enabled, and Apple advises applications not to override system-defined accessibility keyboard shortcuts. citeturn21search5

## Lifecycle, hardware, benchmarks, companion scope, and distribution

### Minimum OS and hardware

Set the first native deployment target to **iPadOS 26.0**.

Do not create a separate native compatibility layer for iPadOS 18/19 simply to widen the install base. DR-12 specifically benefits from the iPadOS 26 windowing/menu-bar environment and from `BGContinuedProcessingTask`, while targeting one OS generation dramatically reduces lifecycle/layout QA. Apple's 2025 SwiftUI and iPad sessions identify the new windowing/menu-bar behavior as iPadOS 26 functionality. citeturn21search3turn21search13

At the hardware level, the **functional support floor should be every iPad that Apple supports on iPadOS 26**, with adaptive graph/visualization budgets rather than artificially excluding older compatible hardware. The benchmark fleet should deliberately span the performance range rather than testing only Apple silicon flagships.

As of August 2026, Apple has shipped iPad Pro with **M5** and iPad Air with **M4**, making them appropriate current upper/midrange reference devices. citeturn14search0turn13search1

Recommended physical test matrix:

| Tier | Representative device | Purpose |
|---|---|---|
| Floor | iPad 8th generation / A12-class iPadOS-26 floor | Memory pressure, old CPU/GPU, worst-case evaluator + visualization + audio concurrency |
| Older pro | M1 iPad Air or M1 iPad Pro | First Apple-silicon performance baseline and common installed-base device |
| Current mainstream | **iPad Air M4** | 2026 mainstream high-performance reference; Apple released this generation March 2026. citeturn13search1 |
| Current high end | **iPad Pro M5** | Maximum-track/render-density reference and 120 Hz/external-display work. Apple released the M5 iPad Pro in October 2025. citeturn14search0 |
| Compact | Current iPad mini class | Small-window/compact UI and thermal-density testing |

Advanced Pencil behavior is separately capability-gated; it must never define the minimum AGL hardware.

### Performance and latency benchmark plan

The benchmark harness should measure **render semantics, scheduler precision, actual end-to-end route latency, graphics load, memory, and energy as different quantities**. Combining them into one vague "latency" number will hide problems.

#### Audio timing probes

For every run, record:

```text
device identifier
OS build
audio route
actual sample rate
actual IO buffer duration
output latency if available
render-plan hash
voice count
event density
CPU/thermal state
foreground/background/window configuration
```

`AVAudioTime` provides the engine sample/host-time correspondence, while audio-session settings can change with the active route, so measurements must use the actual post-activation configuration rather than the requested buffer setting. citeturn18search2turn19search3

Use three complementary probes:

**Internal event accuracy:** deterministic impulse/click fixtures whose expected sample positions are known exactly. Capture the engine's pre-output mix and compare each onset to the canonical expected sample index.

**External end-to-end latency:** route the iPad through a class-compliant USB interface with a physical output→input loopback and measure touch/MIDI stimulus to captured output. This measures device/interface latency that an engine tap cannot.

**Stress continuity:** render a distinctive click/code sequence for 30–60 minutes under load and automatically detect missing, duplicated, or shifted events.

Proposed POA acceptance targets—not Apple guarantees—should be:

| Metric | Acceptance |
|---|---|
| Offline custom-synth event placement | **0-sample deviation** from canonical sample indices |
| Real-time internally scheduled deterministic events | No missed/duplicated events; sample placement correct within the backend's explicitly documented render semantics |
| Scheduler starvation | 0 late-event incidents in ≥1,000,000-event deterministic stress fixture |
| Audible discontinuities | 0 detected glitches in 30-minute nominal-load test on every support tier |
| UI interaction while playing | No audio failures during sustained Pencil/pointer manipulation, window resize, inspector animation, document autosave |
| Offline parity | Deterministic AGL-owned DSP sample-identical at equal format; built-in AU paths within a predefined numerical/audio tolerance |
| Route changes | Transport resumes at the correct canonical musical location with no stale-generation events |
| Background playback | Continuous user-initiated playback remains musically correct through foreground/background transitions |
| Export | Cancellable, progress-reporting, bounded-memory rendering; no full-output buffering |
| Thermal | At serious thermal state, visual/evaluation degradation occurs before audio correctness degrades |

These gates matter more than an arbitrary single number such as "10 ms latency."

Run event-density ladders, for example:

```text
1, 8, 32, 64, 128 simultaneous voices
10, 100, 500, 1,000+ scheduled events/second
1 / 4 / 8 Euclidean rings
increasing CA dimensions
increasing fractal primitive count
increasing chaos point rate
live evaluator + autosave + Pencil interaction
```

Use the results to define budgets in the existing AGL evaluation-budget service rather than hard-coding device-name checks. AGL-025 already provides the right conceptual home for event, recursion, time, geometry, and memory bounds. fileciteturn0file0

### Thermal, battery, and memory behavior

`ProcessInfo` publishes thermal states from nominal through critical; Apple explicitly advises reducing CPU/GPU/I/O activity as thermal pressure rises, and exposes Low Power Mode state changes for applications to reduce activity. citeturn12search4turn12search5turn12search6 UIKit also delivers memory warnings when the system is under memory pressure. citeturn12search1

AGL's degradation ladder should therefore be:

```text
NOMINAL
  full visual cadence
  normal evaluator prefetch
  normal analysis overlays

FAIR
  reduce invisible/background canvas work
  reduce speculative evaluator prefetch
  avoid unnecessary thumbnail/cache generation

SERIOUS
  cap visualization FPS/density
  pause nonessential analysis
  reduce Metal trajectory/grid detail
  extend precomputed audio-plan horizon
  defer cache indexing
  preserve audio semantics

CRITICAL
  stop/defer offline export and other heavy work
  minimize visualization
  release recreatable caches/buffers
  if audio cannot be sustained safely:
      controlled pause + explicit user message
```

Never react to thermal pressure by silently changing the composition's notes, rhythm, seed, or exported semantics. Reduce **presentation and speculative computation first**.

On memory warning, discard waveform/image caches, stale evaluation results, projection caches, unused sample decodes, and non-visible GPU resources. Do not discard the current canonical project or the minimal plan horizon required for uninterrupted playback.

When playback stops, explicitly stop or pause the underlying engine instead of leaving hardware active; Apple notes that merely stopping player nodes does not stop the engine/hardware and recommends stopping the engine when audio is no longer needed to minimize power use. citeturn18search17

### Background behavior

There are two distinct legitimate background cases:

**The user is listening to AGL.** Enable the Audio background mode and keep the engine alive while audible, user-requested generative playback continues. Apple's media guidance supports continuing playback after the application is backgrounded or the device locks when the appropriate audio capability is configured. citeturn4search4

**The user started a long WAV/export operation.** Use iPadOS 26's released `BGContinuedProcessingTask`. Apple specifically describes it as a user-initiated task that starts in the foreground and can continue CPU/network-intensive work for minutes or more after the person backgrounds the application. citeturn16search5

Do **not** abuse the audio background mode merely to keep an export, evaluator, cache, or silent generator alive. Do not use `BGProcessingTask` for interactive exports either: Apple documents that it is discretionary, runs while the device is idle, can be interrupted, and can be terminated when the person starts using the device. citeturn16search1

When audible background playback continues, stop all display-driven Canvas/Metal animation. Run only transport, the bounded evaluator horizon needed to feed it, MIDI that the user expects to remain active, and audio.

### iPhone companion recommendation

Build the architecture so the application target can compile on iPhone, but **do not make full iPhone studio parity a first native milestone**.

Recommended companion scope:

**Include:** project browser/open, playback/transport, current-lab visualization in a read-oriented mode, mixer/mute/solo/gain, quick parameter controls, MIDI device/control surface, favorites/presets, simple export/status, and perhaps performance-oriented Euclidean/transport controls.

**Exclude initially:** full graph authoring, dense inspector + graph + timeline editing, arbitrary Penrose construction, large CA editing, complex Tonnetz path editing, and multi-pane mathematical analysis.

The native semantic modules remain identical; only `CanvasProjection` viewport policy and `InspectorProjection` presentation change. This gives AGL a useful pocket controller rather than spending scarce program capacity recreating an iPad workstation in a phone-sized window. The current program already carries seven labs plus substantial web and quality work, so this constraint is consistent with the staffing and milestone plan. fileciteturn0file2

### App Store and privacy implications

A local-first implementation with no analytics/accounts/server synchronization has a strong privacy posture. Apple defines App Store "collection" around transmitting data off-device for access beyond the immediate service request, and notes that data processed only on-device isn't considered collected for the privacy label. The final declaration must nevertheless cover every third-party SDK as well as AGL's own behavior. citeturn13search2turn13search0

A privacy-policy URL is required for iOS applications in App Store Connect even when the app reports that it does not collect data. citeturn13search0turn13search4

Also maintain a privacy manifest and audit any covered "required reason" APIs. Apple has required accepted reasons for covered APIs in App Store submissions since May 2024, including usage introduced indirectly by SDKs. citeturn12search3turn12search14

For the native MVP:

- Prefer Apple frameworks and minimal third-party dependencies.
- Don't request microphone access unless AGL actually adds recording/input functionality.
- Keep user samples/project files local unless the user explicitly places them in a synced Files location or exports them.
- Treat MIDI/network discovery as a release-test item for privacy prompts and local-network behavior rather than assuming all endpoint types behave identically.
- Declare the Audio background mode only because AGL genuinely plays user-requested continuous audio.
- Use the continuous-processing background mechanism for user-started export, not as a general daemon.
- Avoid the currently beta background-GPU entitlement; CPU audio export does not need it. citeturn16search5turn16search12

## ADR, risks, and proof-of-architecture acceptance suite

### ADR proposal

**ADR title:** Native iPad platform shell over canonical AGL semantics  
**Status:** **Proposed for acceptance after DR-12 POA**  
**Target:** iPadOS 26.0+ using released public APIs

**Context.** AGL already defines exact musical time, deterministic kernels, a typed graph compiler/evaluator, a command bus, canonical render-plan intent, project-package intent, visualization projection, and cross-platform accessibility/test requirements. fileciteturn0file0 A second independent native product model would undermine those invariants and exceed the program's current staffing model. fileciteturn0file2

**Decision.**

1. `.agl.project` is a versioned `UTType.package` read/written through `FileDocument`; `DocumentGroup` is the iPadOS-26 scene/document shell.
2. `AGLDocument` is a persistence snapshot only. `ProjectStore`/`CommandDispatcher` own the editing session.
3. All semantic edits traverse `CommandDispatcher`; platform `UndoManager` adapts to command inverses.
4. One canonical project and render-plan schema spans web and native.
5. Swift reimplements runtime adapters against canonical fixtures rather than embedding the browser UI/runtime.
6. `AVAudioEngineBackend` converts canonical musical time to an absolute sample timeline and owns only device/render concerns.
7. Real-time and offline output use separate, identically constructed `AVAudioEngine` graphs consuming the same plan.
8. Core MIDI uses UMP/event-list APIs internally and supports MIDI 1 through Core MIDI conversion/down-conversion boundaries.
9. SwiftUI `Canvas` is the standard 2D renderer; Metal is the high-density renderer; RealityKit is optional 3D only.
10. `NavigationSplitView`, inspector, commands, sheets, and size-responsive layout form the iPad UI.
11. Pencil is an optional precision modality, never the sole path.
12. Every custom canvas carries a synchronized semantic accessibility projection.
13. iPadOS-27/2027 document/audio API replacements remain behind adapters until released and separately accepted.

### What is shared with TypeScript

The correct answer to "behaviorally versus technically" is deliberately asymmetric.

| Asset/behavior | Share? | Mechanism |
|---|---:|---|
| Project JSON Schema | **Yes, technical artifact** | One checked-in schema; generated/validated Swift and TS representations |
| Package manifest schema | **Yes** | Same JSON contract |
| Exact rational-time rules | **Yes, behavioral** | Language-specific implementations + golden/property tests |
| Canonical event model | **Yes, behavioral/schema** | Common serialized fixtures |
| Stable-ID and seed rules | **Yes, behavioral** | Cross-language vectors must produce byte-identical IDs/seeds |
| Operator definitions and versions | **Yes** | Catalog data/schema plus matching implementations |
| Operator kernel source code | **Not initially** | Native Swift implementation validated against TS fixtures |
| Graph compile semantics | **Yes, behavioral** | Same errors, ordering, cycle rules, budgets |
| Render-plan schema | **Yes, technical artifact + behavioral** | Same serialized plan fixtures |
| Audio backend | **No** | Web Audio/AudioWorklet versus AVAudioEngine |
| Core MIDI/Web MIDI implementation | **No** | Same canonical MIDI event semantics only |
| Visualization projection schema | **Yes** | Same primitive IDs, coordinates, semantic descriptions |
| Actual renderer | **No** | DOM/Canvas/WebGL versus SwiftUI/Metal |
| Selection semantics | **Yes, behavioral** | Same stable IDs and linked-selection rules |
| Project commands | **Yes, behavioral/schema** | Same command names, arguments, invariants, inverses |
| UI component code | **No** | Native SwiftUI designed for iPad |
| Accessibility descriptions | **Yes, content semantics** | Same mathematical descriptions; platform-specific accessibility tree |
| Golden fixtures | **Yes, literally** | Same repository artifacts consumed by both harnesses |

This is the highest-leverage approach for the current codebase. AGL-002/003/005/006 already establish deterministic time/events/seeds/kernels; AGL-010/011/012 will establish schema, migration, and command behavior; AGL-041 and AGL-050 establish audio and visual projection contracts. fileciteturn0file0

Technically embedding TypeScript/JavaScript into the native real-time audio path would defeat the purpose of a first-class native client and create a difficult real-time boundary. Moving all existing logic to a third language merely to share executable code would also be premature given current program capacity. Reconsider a common C/Rust-style core only if conformance maintenance later demonstrates that two semantic implementations are materially expensive.

### Highest risks and OS caveats

| Risk | Severity | Mitigation / gate |
|---|---:|---|
| `FileDocument` conflict abstraction is insufficient for AGL's desired iCloud conflict UI | **High** | Run destructive conflict POA early. If failed, swap persistence adapter to stable `UIDocument`; preserve all lower layers. citeturn15search1turn15search2 |
| Xcode 27 deprecates APIs that remain the released iPadOS-26 path | Medium | Compile with explicit availability policy; isolate document/audio API calls in adapters. Do not migrate to beta merely to remove warnings. citeturn16search0turn18search0 |
| New SwiftUI document system is attractive but beta | **High if adopted prematurely** | No production dependency until iPadOS 27 is released and DR-12 follow-up passes migration tests. citeturn16search2turn16search9 |
| Sample-accurate real-time synthesis differs from web semantics | **High** | Canonical sample-index fixtures; same seed/time conversion; source-node/AU scheduling rather than wall-clock callbacks. |
| Built-in AU output differs bitwise between real-time/offline or OS revisions | Medium | Distinguish semantic/event equivalence from bit identity; tolerance tests for platform DSP. |
| Bluetooth is perceived as "slow AGL" | High UX | Surface route; never market Bluetooth as low-latency; benchmark wired/built-in separately. A2DP is explicitly the music-oriented Bluetooth output path. citeturn19search4 |
| Dense Canvas workload steals time from audio | High | Projection budgets; Metal escalation; audio gets priority; stop visual updates in background. |
| Metal renderer becomes second semantic implementation | High | Metal consumes `CanvasProjection`; no lab math inside renderer. |
| Large accessibility tree becomes unusable | High | Semantic aggregation/rotors/focus instead of one element per primitive. SwiftUI supports synthetic accessibility representations. citeturn21search0 |
| Pencil Pro feature becomes implicit requirement | Medium | Every squeeze/hover/roll action has touch/keyboard equivalent; honor preferences. citeturn20search0turn20search2 |
| Long generative sessions overheat older iPads | High | Thermal-aware visual/evaluator degradation, bounded graph budgets, floor-device stress testing. citeturn12search4turn12search5 |
| Background mode used too broadly | Medium/App Review | Audio mode only for audible playback; continuous task for user-started exports. citeturn4search4turn16search5 |
| Two independently editable windows open the same project | High data integrity | Single-writer registry for same package during MVP; test same-document window behavior. |
| Package assets cause excessive autosave I/O | Medium | Hash-addressed immutable assets; incremental package wrappers; caches outside document. `FileDocument` packages can limit changed-file writes. citeturn15search0 |

### Native proof-of-architecture acceptance suite

The POA should be small enough to build before a full native lab, but rigorous enough that passing it actually retires the architectural risks.

#### Document and project conformance

**D-P01 — Cross-platform package golden.** Web-created `.agl.project` opens on iPad; save it; web reopens it; canonical `project.json`, stable IDs, exact rationals, assets, and semantic hashes remain equivalent.

**D-P02 — Migration.** Open every historical golden schema version and confirm the Swift migration produces exactly the same target semantic model as TypeScript. This directly extends AGL-011's deterministic migration requirement. fileciteturn0file0

**D-P03 — Package incrementality.** Change one parameter in a project with several large assets. Verify asset payloads do not get unnecessarily regenerated/re-encoded.

**D-P04 — Autosave.** Execute a command, background the app, terminate normally, reopen, and verify the committed project revision.

**D-P05 — Undo transaction.** Perform a 5-second Pencil drag with hundreds of raw samples. One Command-Z returns exactly to the pre-drag canonical project hash; redo restores the post-drag hash.

**D-P06 — Multiwindow.** Open two different projects, independently edit/play/save both, and verify no `ProjectStore`, selection, undo, render-plan, or MIDI leakage.

**D-P07 — Same-file double open.** Exercise the selected single-writer policy. No independent divergent in-process stores are permitted.

**D-P08 — Files lifecycle.** Rename, move between Files locations, close/reopen, and recover from a temporarily unavailable provider without direct `fileURL` content access.

**D-P09 — iCloud conflict.** Edit the same package offline on two devices, reconnect, and demonstrate deterministic preservation/recovery. **Failure to provide a trustworthy UX is the automatic trigger for a `UIDocument` persistence spike.**

**D-P10 — Corruption.** Remove an asset, alter a hash, truncate `project.json`, and use an unknown future schema. Every case must fail safely with path-specific diagnostics and never overwrite the source package.

#### Audio and render-plan conformance

**A-P01 — Canonical plan.** The same project fixture produces semantically identical TypeScript and Swift render plans after canonical serialization.

**A-P02 — Exact times.** Difficult rational subdivisions, long loops, tempo changes, and very large timeline positions map to expected integer sample locations without cumulative drift.

**A-P03 — Real-time scheduling.** One million deterministic impulse/note events under synthetic load produce zero scheduler misses/duplicates.

**A-P04 — Offline equality.** AGL-owned oscillator/noise/envelope paths produce sample-identical output for identical format/plan/seed; platform effect paths meet declared tolerances.

**A-P05 — Real-time/offline event equality.** Extract onset/control traces from both and compare every canonical event's sample index.

**A-P06 — Interruption.** Incoming system interruption stops the expected state, preserves transport intent, and resumes only when appropriate through the released iPadOS-26 interruption path. citeturn19search0

**A-P07 — Route change.** Built-in→USB→Bluetooth→built-in transitions do not replay stale events; rate/buffer/clock anchors are refreshed.

**A-P08 — Media server reset.** Trigger Apple's developer "Reset Media Services" path. All audio objects reconstruct cleanly and playback remains stopped until the person asks to resume, matching Apple's documented requirement. citeturn19search1

**A-P09 — Background audio.** Thirty minutes of generative playback with the screen locked/backgrounded has no semantic discontinuity.

**A-P10 — Export backgrounding.** Start a long WAV export, background the app, continue using `BGContinuedProcessingTask`, expose progress, cancel it, and leave no corrupt destination. citeturn16search5

**A-P11 — Thermal stress.** Run evaluator + dense lab + audio until serious thermal state or test timeout. Visual/evaluator degradation engages before any audio semantic degradation.

**A-P12 — Emergency stop.** From every engine/session state, panic immediately silences voices, clears pending generation events, and leaves the backend restartable. This extends AGL-049's emergency-stop requirement. fileciteturn0file0

#### MIDI conformance

**M-P01 — MIDI 1 endpoint.** Receive/send note, CC, pitch bend, program, channel pressure, transport/system-real-time cases through UMP APIs and verify down-conversion behavior.

**M-P02 — MIDI 2 endpoint.** Preserve higher-resolution channel values and per-note semantic data through `MIDIRouter`.

**M-P03 — Timestamp scheduling.** Future Core MIDI timestamps arrive in the intended order/timing without main-thread scheduling. Core MIDI explicitly schedules future-timestamped `MIDIEventList`s. citeturn17search0

**M-P04 — High-priority callback safety.** Synthetic MIDI flood must not allocate unbounded memory, block the callback, or mutate UI/project state directly. Apple documents the receive block as high-priority. citeturn17search14

**M-P05 — Hot plug.** Attach/remove USB and BLE endpoints repeatedly during playback.

**M-P06 — Virtual endpoint identity.** Stable virtual endpoint IDs survive relaunch, as recommended by Apple's protocol-aware virtual-source API. citeturn17search8

**M-P07 — MIDI export.** Native and web Standard MIDI File exporters match tempo/meter/note fixtures and quantization warnings required by AGL-130. fileciteturn0file0

#### UI, Pencil, and accessibility conformance

**U-P01 — Resize torture test.** Continuously resize through narrow, medium, wide, floating, portrait, landscape, and external-display windows while playing. Selection, transport, zoom, inspector values, undo stack, and document state do not reset. This implements Apple's non-destructive resizing guidance for iPadOS 26. citeturn21search3

**U-P02 — Keyboard-only lab.** Every P0 lab operation required for Euclidean Rings and Infinite Staircase can be completed with a hardware keyboard and Full Keyboard Access.

**U-P03 — VoiceOver.** Every lab has a meaningful canvas summary, inspectable selected object, relevant adjustable/actions, and no unusably gigantic accessibility tree.

**U-P04 — Non-color semantics.** Generated/frozen, selected/unselected, active/inactive, valid/invalid states remain distinguishable without color. Apple's HIG explicitly requires information not rely on color alone. citeturn21search7

**U-P05 — Reduced motion.** Animations/trajectory transitions respect reduced-motion behavior while keeping the mathematical state observable.

**U-P06 — Pencil fallback.** On hardware without hover/squeeze/roll, every operation remains available through touch, keyboard, pointer, or inspector.

**U-P07 — Squeeze preference.** Squeeze honors `preferredPencilSqueezeAction`; no operation depends on receiving a squeeze when the system owns that gesture. citeturn20search0turn20search2

**U-P08 — Barrel roll semantics.** Automated/manual review confirms no essential control uses barrel roll; expressive stroke tools may. This follows Apple's explicit interaction guidance. citeturn20search2

**U-P09 — Renderer parity.** Canvas and Metal implementations for a shared projection fixture produce identical semantic hit targets, selection IDs, accessibility IDs, and exported geometry even when raster pixels differ.

### Acceptance decision

**Accept ADR and begin native implementation when:**

- all document tests except optional automatic cloud merge pass;
- explicit iCloud conflict preservation has a trustworthy result, **or the persistence adapter has been changed to `UIDocument` and passes the same tests**;
- real-time and offline render-plan conformance is demonstrated;
- no scheduler misses occur at the accepted floor-device nominal workload;
- route/interruption/media-reset/background tests pass;
- MIDI 1 and MIDI 2/UMP transport tests pass;
- the two P0 labs are completely operable with touch, keyboard, VoiceOver, and without advanced Pencil hardware;
- resize behavior is non-destructive across iPadOS 26 window sizes;
- TypeScript/Swift goldens are integrated into CI as a release gate.

**Reject or revise the architecture if** native project state starts acquiring platform-only semantics; real-time audio requires graph evaluation in a render callback; the native backend needs a different event model than AGL-041; Metal implementations start containing lab mathematics; or project package interoperability requires hand-maintained native/web transforms. Those would indicate the native client is becoming a fork rather than a first-class implementation of AGL.

The strongest conclusion of DR-12 is therefore not merely "SwiftUI + AVAudioEngine." It is that **AGL's canonical semantic boundaries should become the product architecture, with SwiftUI/AVFoundation/Core MIDI/Metal treated as replaceable platform adapters**. The existing backlog already points in exactly that direction; the native work should reinforce it rather than introduce a second architecture. fileciteturn0file0

**ADR recommendation: ACCEPT, conditional on the FileDocument/iCloud conflict proof.** Use released iPadOS-26 APIs for the shipping baseline and keep the 2027 `Document` API as an intentionally isolated future migration opportunity, not a current dependency. Apple describes the new document APIs as part of the 2027 releases and currently marks them beta. citeturn16search0turn16search2turn16search9

#AuralGeometryLab #iPadOS26 #SwiftUI #AVAudioEngine #CoreMIDI #ApplePencil #Metal #Accessibility #NativeArchitecture #DR12

*Rough conversation token estimate: ~39k tokens.*