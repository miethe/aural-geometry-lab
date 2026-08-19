# Native Apple Stretch Architecture

**Status:** stretch goal; architecture prepared, implementation not on the web MVP critical path  
**Primary target:** iPad  
**Secondary target:** iPhone companion/explore experience  
**As of:** 2026-08-14

## 1. Recommendation

Build the MVP as a web-first studio, but deliberately preserve the option for a **real native iPad application**, not merely a wrapped website.

The iPad is unusually well matched to Aural Geometry Lab because the product is based on direct manipulation of rings, paths, graphs, curves, and geometric structures. Pencil, touch, pointer, keyboard, multiwindow documents, and a large canvas can make the native version more compelling than the desktop web application for exploration and performance.

Do **not** require iOS parity for MVP. Instead, establish portable project/command contracts now and schedule a native proof-of-architecture after the web runtime and two flagship labs are stable.

## 2. Platform product posture

### Web / desktop — canonical authoring product

Owns full functionality:

- complete timeline and mixer;
- full operator graph;
- all labs;
- advanced export;
- diagnostics and benchmarks;
- broad keyboard/mouse workflow.

### iPad — eventual first-class creative client

Target substantial authoring parity where the interaction is natural:

- lab exploration and composition;
- direct geometry manipulation;
- timeline editing;
- inspector/provenance;
- selected graph editing;
- Pencil path input;
- MIDI input/output where available;
- local document packages;
- offline audio rendering.

The iPad UI should be native and adaptive rather than a pixel copy of desktop.

### iPhone — companion, not miniature DAW

Target:

- open/play projects;
- browse labs and guided experiments;
- modify high-value parameters;
- inspect math/provenance;
- record a simple path or parameter gesture;
- use as a remote/controller later;
- export/share existing projects.

Do not target full graph/timeline parity on iPhone in the initial native branch.

## 3. Why native rather than a permanent wrapper

A web build remains useful on iPad, and a wrapper could be a distribution shortcut, but a native client can eventually exploit platform conventions directly:

- document-based workflows;
- native split views and inspectors;
- Apple Pencil hover/squeeze/tool interactions;
- high-quality keyboard and pointer behavior;
- AVAudioEngine and Core MIDI;
- manual/offline audio rendering;
- native drag/drop and file provider integration;
- haptics and performance characteristics tailored to Apple silicon.

Therefore the architecture should preserve both options while avoiding a premature second implementation.

## 4. Native technology mapping

### Application structure

Recommended:

- SwiftUI application shell;
- `DocumentGroup` / `FileDocument`-style document workflow for `.aglproject` files or packages;
- `NavigationSplitView` for library/studio hierarchy where appropriate;
- SwiftUI `inspector` for the contextual mathematical inspector;
- native toolbar/commands/undo integration;
- Files/iCloud-compatible document storage rather than a separate cloud database for the first native release.

The portable project JSON remains authoritative. A document package may additionally contain assets, previews, and rendered audio.

### 2D visualization

Use SwiftUI `Canvas` for moderate-density dynamic drawing:

- Euclidean rings;
- Tonnetz lattice;
- recursion trees;
- cellular automata at normal teaching scales;
- mapping curves;
- lightweight timeline overlays.

Canvas should remain a projection of canonical state and provide a synchronized semantic element list for accessibility.

### Dense/3D visualization

Escalate to Metal/MetalKit only where profiling justifies it:

- dense attractor trajectories;
- large tiling patches;
- GPU-heavy animated geometry;
- future spatial/3D laboratories.

Do not make Metal the default 2D UI technology.

### Audio

Recommended native reference path:

```text
Canonical project / graph
        ↓
Native render-plan adapter
        ↓
AVAudioEngine
  ├─ AVAudioPlayerNode / sampler voices
  ├─ mixers / effects
  ├─ MIDI-driven units where appropriate
  └─ output
```

Use AVAudioEngine manual rendering for offline export where it can preserve the same render-plan semantics as real time.

The native backend must not redefine musical time or operator meaning. It consumes the same canonical event/control plan.

### MIDI

Use Core MIDI for device communication. The project should continue to treat MIDI as an optional I/O adapter rather than project semantics.

### Apple Pencil

Pencil is a first-class precision input, not a required input.

Candidate interactions:

- draw/edit Tonnetz paths;
- draw mapping curves;
- sketch automation;
- select/traverse geometry;
- scrub recursion branches;
- annotate guided experiments later;
- hover preview before committing a point;
- Pencil Pro squeeze to reveal a compact tool palette if validated by user testing.

Every Pencil action requires touch, pointer, and keyboard alternatives where relevant.

## 5. iPad layout model

### Regular-width landscape

```text
┌────────────────────────────────────────────────────────────────────┐
│ Document title · transport · tempo · mode · undo/redo · inspector │
├───────────────┬───────────────────────────────────┬────────────────┤
│ Project/Labs  │ Main mathematical canvas          │ Inspector      │
│ sidebar       │                                   │ context        │
│               │                                   │                │
├───────────────┴───────────────────────────────────┴────────────────┤
│ Timeline / compact mixer / graph drawer                           │
└────────────────────────────────────────────────────────────────────┘
```

The inspector can overlay or collapse based on available width. Timeline and graph should be mutually expandable drawers rather than forcing four simultaneous dense panes.

### Portrait

- sidebar becomes transient;
- canvas remains primary;
- inspector uses native sheet/overlay behavior;
- timeline is a bottom drawer;
- graph switches to dedicated focus mode;
- transport remains persistent.

### Multitasking / narrow iPad windows

Use the same compact-reduction semantics as web:

- maintain project and selection state;
- show one primary work surface;
- move inspector into a sheet;
- disable no semantic feature merely because its surface is hidden;
- allow a clear “Open Graph Full Screen” action.

## 6. iPhone layout model

Navigation stack:

```text
Library
  → Project
      → Lab/Canvas
      → Parameters
      → Timeline summary
      → Inspector
      → Export
```

The project screen keeps transport at the bottom and uses cards/sheets for controls. Complex graph editing is read-only or limited to enabling/bypassing/configuring existing nodes in the first iPhone release.

## 7. Cross-platform core strategy

Three viable paths remain open.

### Option A — behavioral reimplementation

- TypeScript core remains canonical reference.
- Swift implements equivalent domain/operator code.
- Golden fixtures enforce conformance.

Pros: native code and tooling.  
Cons: duplicate algorithm implementation and long-term drift risk.

### Option B — shared systems core

Move the most stable mathematical/domain kernel to Rust or another portable systems language and expose:

- WASM to web;
- native library/FFI to Swift.

Pros: strongest single-source semantics and performance.  
Cons: migration cost, FFI complexity, debugging/tooling overhead.

### Option C — embedded JavaScript reference core

Native UI/audio call a JavaScriptCore-hosted version of the TypeScript-compiled engine.

Pros: fastest semantic reuse.  
Cons: awkward bridging, runtime boundary complexity, less-native diagnostics/performance behavior.

## 8. Recommended decision sequence

Do not migrate the current TypeScript kernel yet.

1. Stabilize project schema, command model, render-plan API, and operator versions.
2. Build shared JSON golden fixtures.
3. Implement two flagship labs fully on web.
4. Run DR-15 and benchmark representative operators.
5. Build a small Swift native spike that decodes projects and reproduces fixture outputs.
6. Decide whether behavioral duplication is acceptable.
7. Move to a shared systems core only if conformance maintenance or performance evidence justifies it.

This avoids converting an evolving domain model into a cross-language FFI prematurely.

## 9. Native proof-of-architecture scope

A valuable first native spike should do only this:

1. Open an `.agl.project` JSON document.
2. Render Euclidean Rings in SwiftUI Canvas.
3. Play the rings through AVAudioEngine.
4. Modify pulses/steps/rotation through native controls and direct touch.
5. Save/reopen without semantic change.
6. Run the shared Euclidean golden fixtures.
7. Show the inspector for a selected onset.
8. Accept an optional external MIDI clock/note input if trivial.

If that spike is clean, the native path is credible.

## 10. Native-specific risks

- duplicating exact rational arithmetic across languages;
- divergent operator versions;
- audio scheduling differences between Web Audio and AVAudioEngine;
- undo integration between document system and high-frequency gestures;
- adaptive SwiftUI layouts producing unexpected behavior at unusual iPad window sizes;
- accessibility mismatch between drawn canvases and semantic models;
- overusing custom graphics where native controls would be better;
- premature Metal complexity;
- trying to force desktop graph density onto iPhone.

## 11. Required conformance gates before native beta

- project decode/encode round trip;
- rational representation preservation;
- deterministic fixture outputs for implemented operators;
- stable IDs and provenance;
- command replay equivalence;
- generated/frozen semantics;
- render-plan event timing equivalence within defined platform tolerance;
- MIDI export fixture agreement;
- shared lab preset versions;
- accessibility coverage for all canvas-selectable entities.

## 12. Current Apple API evidence

The architecture is intentionally based on public platform capabilities rather than private frameworks:

- SwiftUI provides `Canvas` for immediate-mode 2D graphics.
- SwiftUI document APIs support document-based apps and document packages.
- `NavigationSplitView` and inspectors provide adaptive multi-column/editor scaffolding.
- AVAudioEngine provides a graph-based real-time audio engine and supports offline/manual rendering workflows.
- Core MIDI provides MIDI device communication.
- Apple Pencil and iPad pointer/drag systems expose direct-manipulation capabilities suited to the lab canvases.

The dedicated DR-12 run should validate current OS-version behavior, latency, interruption handling, document semantics, and the exact minimum deployment target before implementation.

