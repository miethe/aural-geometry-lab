# DR-12 — Native iPad Audio, Document, MIDI, Pencil, and Adaptive-UI Architecture

**Current date:** 2026-08-14  
**Program:** Aural Geometry Lab

## Mission

Determine the most robust public-API architecture for an eventual first-class native iPad Aural Geometry Lab client while preserving project semantics with the web application.

This run must be current to iOS/iPadOS 26-era APIs and explicitly separate stable/released APIs from beta or provisional APIs.

## Questions

1. What SwiftUI scene/document architecture best fits local-first `.agl.project` files or document packages?
2. How should `FileDocument`, document packages, autosave, undo, multiwindow behavior, iCloud Drive/Files integration, and conflict handling be structured?
3. What is the recommended AVAudioEngine architecture for low-latency event scheduling, sampler/synthesis, effects, interruption handling, route changes, Bluetooth, and background behavior?
4. How should offline/manual rendering map to the same canonical render plan?
5. What Core MIDI APIs and MIDI 1.0/2.0 considerations matter for an iPad composition app?
6. Which SwiftUI Canvas, Metal/MetalKit, RealityKit, or other public graphics APIs are appropriate for each AGL lab?
7. How should NavigationSplitView, inspector, sheets/drawers, keyboard shortcuts, pointer, drag/drop, and full keyboard access adapt the studio?
8. Which Apple Pencil features are reliable and appropriate for direct manipulation, including hover/squeeze/barrel behavior on supported hardware?
9. What are the audio-session, lifecycle, thermal, memory, and battery constraints for long-running generative audio?
10. What minimum iPad hardware/OS support should be targeted?
11. What accessibility requirements apply to custom-drawn canvases and complex editing surfaces?
12. What can be shared behaviorally versus technically with the TypeScript web core?

## Required prototype architecture

Specify modules/interfaces for:

```text
AGLDocument
ProjectStore / CommandDispatcher
SelectionModel
GraphEvaluatorAdapter
NativeRenderPlan
AVAudioEngineBackend
MIDIRouter
CanvasProjection
InspectorProjection
ExportService
ConformanceTestHarness
```

## Required outputs

1. Public-API architecture diagram.
2. SwiftUI scene/document skeleton pseudocode.
3. AVAudioEngine graph and scheduling strategy.
4. Audio-session/interruption/route-change state machine.
5. Core MIDI strategy.
6. Per-lab rendering API recommendation.
7. iPad landscape/portrait/multitasking layout recommendations.
8. iPhone companion scope recommendation.
9. Performance/latency benchmark plan on representative hardware.
10. App Store/privacy/background-mode implications.
11. Risks and OS-version caveats.
12. ADR proposal and native proof-of-architecture acceptance suite.

## Evidence requirements

Prefer Apple Developer Documentation, WWDC sessions, platform HIG, official MIDI/audio specifications, and primary measurements. Use forum reports only to identify risks and label them accordingly.

