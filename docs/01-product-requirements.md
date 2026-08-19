# MVP Product Requirements

## 1. Product definition

Aural Geometry Lab is a local-first browser application for composing and learning through mathematical music systems. Labs are curated entry points into a shared studio rather than disconnected mini-apps. A user may begin with a guided lab, open its underlying graph, modify operators, mix it with another lab, and export the result.

## 2. Core user journeys

### Journey A — guided discovery

1. Open the Infinite Staircase preset.
2. Start audio through a user gesture.
3. Observe tempo layers moving through logarithmic tempo space.
4. Toggle the anchor pulse and compare illusion strength.
5. Open the inspector to see the layer equation and crossfade state.
6. Save the state as a project or share/export it.

### Journey B — compose without code

1. Create three Euclidean rings.
2. Set steps, pulses, rotations, instruments, and velocities.
3. Drag a ring or rotate its phase directly in the visualization.
4. Route its trigger pattern through another operator.
5. Preview, arrange, and export MIDI/WAV.

### Journey C — inspect provenance

1. Select a generated event in the timeline or visualization.
2. See source seed, mathematical state, operator version, input events, parameters, quantization, and constraint decisions.
3. Step backward and forward through transformations.
4. Bypass a transformation and hear an A/B comparison.

### Journey D — build from a mathematical object

1. Add a Lorenz attractor.
2. Map normalized axes to pitch degree, pan, and filter control.
3. Apply smoothing, sampling, scale quantization, and range constraints.
4. View the trajectory and corresponding event selections.
5. Freeze the result to a deterministic clip for editing/export.

## 3. Functional requirements

### FR-01 Project lifecycle — P0

- Create, rename, duplicate, autosave, and delete local projects.
- Persist project data in IndexedDB with periodic JSON recovery snapshots.
- Import/export the versioned `agl.project` JSON format.
- Preserve unknown future-safe metadata where practical.
- Migrate older schema versions through explicit, tested migration functions.
- Show dirty/saved status and recovery options after interrupted sessions.

### FR-02 Transport and musical time — P0

- Play, pause, stop, seek, loop, count in, and set tempo/meter.
- Represent canonical positions and durations as rational beats.
- Convert beats to seconds using a versioned tempo map only at rendering/scheduling boundaries.
- Support at least constant tempo and piecewise-linear or piecewise-constant tempo segments in MVP.
- Provide a global emergency stop.

### FR-03 Tracks, clips, and mixer — P0

- Support trigger, note, control, and audio-preview track kinds.
- Create clips from finite/frozen pattern regions.
- Mute, solo, gain, pan, instrument selection, and basic sends.
- Display generated events and selected provenance.
- Prevent clipping through sensible gain staging and final safety dynamics.

### FR-04 Typed operator graph — P0

- Create, connect, configure, bypass, duplicate, and delete nodes.
- Reject incompatible port connections before evaluation.
- Compile acyclic regions in topological order.
- Represent allowed feedback only through explicit bounded/delayed operators; arbitrary zero-delay feedback is prohibited.
- Surface validation errors at node, edge, and graph levels.
- Version every operator definition and parameter schema.

### FR-05 Evaluation runtime — P0

- Query event patterns over bounded beat intervals.
- Run computationally expensive operators in workers.
- Enforce event count, recursion depth, iteration, wall-clock, and memory budgets.
- Support cancellation when parameters, transport, or viewport change.
- Cache pure deterministic outputs using operator version, normalized parameters, input hashes, interval, and seed.
- Emit provenance and diagnostics with output.

### FR-06 Audio engine — P0

- Provide a reference browser audio backend.
- Schedule events ahead of the audio clock using a bounded look-ahead queue.
- Move custom real-time DSP to AudioWorklet where needed.
- Support oscillators, a sampler, envelopes, filters, panning, and master dynamics.
- Support offline rendering through the same abstract render plan.
- Feature-detect MIDI and degrade cleanly when unavailable.

### FR-07 Visualization canvas — P0

- Provide synchronized 2D visualization for every lab.
- Provide 3D rendering only where it conveys information unavailable in 2D.
- Link selection and hover states among timeline, graph, inspector, and geometry.
- Support zoom, pan, reset, reduced motion, and export to image/video where feasible.
- Distinguish exact geometry from explanatory/illustrative diagrams.

### FR-08 Mathematical inspector — P0

- Show a plain-language description and mathematical definition.
- Show live input/output values and units.
- Show mapping, normalization, smoothing, quantization, and constraints as separate stages.
- Provide step mode for discrete algorithms.
- Provide A/B bypass and preset comparisons.
- Explain why a selected event exists.

### FR-09 Presets and guided experiments — P0

- Include at least three curated presets per lab.
- Include at least one guided experiment per lab with a claim, manipulation, observation, and explanation.
- Mark presets as educational, compositional, perceptual, or benchmark.
- Preserve preset lineage when saved as a user project.

### FR-10 Export/interchange — P1

- Export standard MIDI from note/trigger tracks.
- Render WAV offline with project/seed metadata in an adjacent manifest.
- Export minimum viable MusicXML for quantized note clips.
- Export operator graph and provenance in native JSON.
- Report unsupported features and approximations before export.

### FR-11 Sharing — P1

- Generate a compact project package containing JSON, referenced local samples where legally permitted, and a manifest.
- Offer a read-only standalone rendering mode for shared projects.
- Defer hosted URLs/accounts to post-MVP unless trivial hosting is selected later.

### FR-12 Accessibility — P0

- All controls keyboard reachable and visibly focused.
- Semantic labels and text equivalents for visual state.
- Reduced-motion mode that preserves mathematical information.
- Non-audio pulse/beat indication and optional visual metronome.
- Caption/explanation track for guided experiments.
- Do not communicate state solely through color, pitch, or stereo location.

## 4. Nonfunctional requirements

### NFR-01 Determinism

Identical project schema version, operator versions, seed, parameters, and query interval must yield identical canonical event output. Real-time audio waveform phase may vary unless rendered offline with deterministic initialization; this distinction must be documented.

### NFR-02 Responsiveness

- Parameter changes affecting inexpensive operators should appear visually within one animation frame under ordinary load.
- Heavy recomputation must show pending/cancelled/error state without blocking input.
- The audio callback path must never wait on UI rendering or mathematical graph evaluation.

### NFR-03 Safety and bounds

- Default master output begins conservatively.
- Every recursive/generative operator has a visible budget.
- Imported project files are treated as data, never executable code.
- Sample decoding and file size are bounded.

### NFR-04 Compatibility

- Primary support: current desktop Chromium and Firefox; Safari support determined by the browser validation matrix.
- MIDI is optional and feature-detected.
- Projects remain portable even when a browser cannot render a particular optional feature.

### NFR-05 Local-first privacy

- No account or network service is required for core composition.
- Analytics are opt-in and exclude audio/project contents unless explicitly consented.
- Research-study exports use a separate informed-consent flow.

### NFR-06 Maintainability

- Domain and operator packages have no dependency on the UI framework.
- Public data contracts are versioned.
- Operators include fixtures, invariants, performance budgets, and documentation.
- Dependency upgrades are separated from project-format changes.

## 5. MVP information architecture

```text
Home / Project Library
  ├─ New project
  ├─ Continue recent project
  └─ Guided laboratories

Studio
  ├─ Transport + global status
  ├─ Timeline / tracks / mixer
  ├─ Mathematical canvas
  ├─ Operator graph
  ├─ Inspector / provenance
  └─ Lab guide / experiments

Export
  ├─ Project JSON/package
  ├─ MIDI
  ├─ WAV
  ├─ MusicXML
  └─ Visual snapshot
```

## 6. Release exclusions

The following do not block MVP acceptance:

- cloud collaboration;
- social feed or marketplace;
- VST/AU hosting;
- arbitrary audio source separation;
- mobile editor parity;
- AI-generated composition assistant;
- external plugin execution;
- notation engraving competitive with a dedicated notation application.
