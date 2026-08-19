# Technical Source Notes

**Reviewed:** 2026-08-13

This file records starting points for implementation. It is not a substitute for the dedicated Deep Research charters.

## Browser audio and scheduling

- Web Audio API overview and current browser documentation:  
  https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- `AudioContext`:  
  https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
- `AudioWorklet`:  
  https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
- `OfflineAudioContext`:  
  https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
- Web Audio best practices, including user-gesture/autoplay behavior:  
  https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- Web MIDI API availability/security context:  
  https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
- W3C Web MIDI specification:  
  https://www.w3.org/TR/webmidi/

## Candidate framework/runtime components

- Tone.js:  
  https://tonejs.github.io/
- Vite guide:  
  https://vite.dev/guide/
- React:  
  https://react.dev/
- React Flow / XYFlow:  
  https://reactflow.dev/
- Three.js:  
  https://threejs.org/docs/

These are candidate adapters/UI tools, not canonical data-model dependencies.

## DSP

- Faust documentation:  
  https://faustdoc.grame.fr/
- Faust WebAssembly/Web Audio deployment references:  
  https://faustdoc.grame.fr/manual/deploying/

## Interchange

- MusicXML 4.0:  
  https://www.w3.org/2021/06/musicxml40/
- Standard MIDI File specification references should be selected and validated during the export workstream; implementation should include independent consumer tests.

## Mathematical/computational music starting points

- Jean-Claude Risset / Shepard–Risset pitch and rhythm literature.
- Godfried Toussaint and Bjorklund-style Euclidean rhythm literature.
- Dmitri Tymoczko and related geometric models of harmony/voice leading.
- IRCAM/OpenMusic literature and computer-aided composition systems.
- Cellular automata and sonification research.
- Numerical dynamical systems/sonification literature.
- Exact Penrose tiling construction, matching-rule, inflation/deflation, and cut-and-project references.

The research charters require primary sources, explicit convention selection, reproducible fixtures, and careful separation between historical attribution, mathematical fact, musical analogy, and perceptual evidence.

## M0.5 UI/native architecture anchors — reviewed 2026-08-14

- React state ownership: https://react.dev/learn/managing-state
- React Flow accessibility: https://reactflow.dev/learn/advanced-use/accessibility
- SwiftUI Canvas: https://developer.apple.com/documentation/swiftui/canvas
- SwiftUI document APIs / FileDocument: https://developer.apple.com/documentation/swiftui/filedocument
- SwiftUI NavigationSplitView: https://developer.apple.com/documentation/swiftui/navigationsplitview
- SwiftUI inspector: https://developer.apple.com/documentation/swiftui/view/inspector(isPresented:content:)
- Apple split-view HIG: https://developer.apple.com/design/human-interface-guidelines/split-views
- Apple Pencil HIG: https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble
- Apple audio and music overview: https://developer.apple.com/documentation/technologyoverviews/audio-and-music
- AVAudioEngine: https://developer.apple.com/documentation/avfaudio/avaudioengine
- AVAudioEngine offline processing: https://developer.apple.com/documentation/avfaudio/performing-offline-audio-processing
