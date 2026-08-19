# MVP Laboratory Specifications

## 1. Shared laboratory contract

Every lab is a curated configuration of the shared studio. It must provide:

- a clear phenomenon or mathematical concept;
- an immediately playable default preset;
- direct manipulation of the primary mathematical object;
- synchronized sound and visualization;
- visible mapping pipeline;
- at least three presets;
- at least one guided experiment;
- deterministic project state and provenance;
- exportable canonical events or a documented reason the output is audio/control only;
- a research evidence record and acceptance suite.

A lab may hide advanced studio panels initially, but it cannot create a separate incompatible data model.

---

## 2. Infinite Staircase

### Purpose

Demonstrate and compose with Risset-style continuously accelerating or decelerating rhythmic illusions, including controlled anchors and optional pitch coupling.

### User controls

- source trigger pattern or preset pulse;
- base tempo;
- acceleration/deceleration direction;
- adjacent-layer ratio, default 2:1;
- layer count;
- cycle duration;
- crossfade envelope and width;
- pulse/subdivision retention policy;
- optional metric-coupling pattern, including 3:2 exploration;
- optional fixed anchor pulse;
- optional Shepard/Risset pitch layer;
- per-layer mute/solo and visual emphasis.

### Visualization

- horizontal time or phase;
- vertical logarithmic tempo axis;
- layer trajectories wrapped by tempo equivalence;
- loudness envelope per layer;
- currently dominant perceptual band;
- explicit boundary/relabel view in step mode;
- comparison views with crossfade, anchor, or subdivision shedding disabled.

### Mathematical requirements

For ratio \(r\), layer \(k\), cycle phase \(p\), and base tempo \(b\):

\[
T_k(p)=b r^{k+p}
\]

At one completed cycle:

\[
T_k(p+1)=T_{k+1}(p)
\]

The implementation must test this closure under layer relabeling within numerical tolerance at the seconds/render boundary while preserving exact phase semantics in the model.

### MVP acceptance

- 3–15 layers render without runaway event scheduling.
- Acceleration and deceleration modes work.
- The relabeling invariant passes automated tests.
- At least one preset produces a convincing illusion in the defined listening protocol.
- Toggle comparisons expose why the reset is hidden.
- Scheduler diagnostics show no unacceptable late-event rate under benchmark load.
- No proprietary soundtrack stems are bundled or required.

### Research gates

DR-01, DR-03, DR-08.

---

## 3. Euclidean Rings

### Purpose

Create cyclic rhythms by distributing \(k\) onsets as evenly as possible over \(n\) steps, then combine, rotate, hear, and inspect multiple rings.

### User controls

- 1–8 rings;
- steps, pulses, and rotation per ring;
- ring phase and playback subdivision;
- voice/sample, velocity, probability, accent pattern, and mute/solo;
- global tempo and swing applied after exact pattern generation;
- lock rings while editing others;
- optional complement and inverse views.

### Visualization

- concentric step rings with active pulses;
- draggable phase/rotation handle;
- cyclic gap lengths;
- composite hit timeline;
- least-common-multiple cycle length and alignment markers;
- optional necklace/canonical-rotation equivalence display.

### Mathematical requirements

- Output contains exactly \(k\) onsets for valid \(0 \le k \le n\).
- Cyclic gaps differ by no more than one step when even distribution permits.
- Rotation changes phase but not the multiset of cyclic gaps.
- Edge cases \(k=0\), \(k=n\), \(n=1\), and negative/large rotations are defined.

### MVP acceptance

- Exact results for a published/validated corpus of \((n,k)\) pairs.
- Up to eight rings play and export deterministically.
- LCM visualization remains bounded and summarizes very large cycles.
- Presets explain, rather than overclaim, relationships to known rhythmic practices.
- MIDI export retains step positions and accents.

### Research gates

DR-02, DR-08.

---

## 4. Tonnetz Walk

### Purpose

Make harmonic relationships spatially manipulable and generate chord progressions through graph paths and parsimonious voice leading.

### User controls

- Tonnetz coordinate convention and tuning system;
- origin pitch class/register;
- manual vertex/chord selection;
- path drawing, random walk, constrained walk, or target path;
- triad quality and allowed chord families;
- P/L/R or selected neo-Riemannian transformations when validated;
- voice-leading range, common-tone preference, and leap penalty;
- duration/rhythm source;
- inversion and octave-placement policy.

### Visualization

- tiled pitch/chord lattice;
- selected path and transformation labels;
- common tones and moved voices;
- optional pitch-class and voiced-chord layers;
- distance/cost annotation.

### Mathematical requirements

- Coordinate-to-pitch mapping is explicit and tested.
- Enharmonic spelling is separated from pitch-class identity.
- Graph distance and musical voice-leading distance are not conflated.
- Voicing optimization has deterministic tie breaking.

### MVP acceptance

- User can draw a path and hear a stable progression.
- At least major/minor triads and one validated transformation family are supported.
- Selected chord, voiced notes, and transformation provenance agree.
- MIDI and minimum MusicXML export pass fixtures.
- Alternate Tonnetz conventions are documented rather than silently mixed.

### Research gates

DR-04, DR-08.

---

## 5. Fractal Motif

### Purpose

Generate nested musical structure by recursively replacing or embedding transformed versions of a seed motif.

### User controls

- seed motif from drawn steps, played MIDI, or preset;
- recursion depth;
- temporal scale per generation;
- pitch transform per generation;
- velocity/duration scaling;
- replacement versus overlay grammar;
- branch selection/probability with deterministic seed;
- minimum duration and maximum event budget;
- freeze selected generation to an editable clip.

### Visualization

- recursion tree with branch/event counts;
- nested timeline/zoom view;
- color-independent generation labels;
- transformation path for a selected event;
- self-similarity comparison at selected scales.

### Mathematical requirements

- Grammar and traversal order are explicit.
- Generated IDs are stable under identical input and seed.
- Event-count growth is forecast before evaluation.
- Recursion terminates by depth, duration threshold, event budget, or cancellation.

### MVP acceptance

- At least replacement and overlay modes.
- At least three deterministic transform grammars.
- Event-budget prediction and hard enforcement.
- Provenance identifies the full ancestry of a selected note.
- Freeze/export produces stable notes without retaining an infinite generator.

### Research gates

DR-05, DR-08.

---

## 6. Cellular Automaton Orchestra

### Purpose

Map locally updated discrete systems to reproducible musical structure while making the distinction between the automaton and its sonification mapping explicit.

### User controls

- elementary 1D rule, width, boundary condition, seed row, generations;
- optional validated 2D mode selected after research;
- scan direction and time mapping;
- cell state, neighborhood, age, births/deaths, or density as mapping sources;
- scale, pitch range, instrument/row assignment, rhythm grid, smoothing;
- mutation/noise only through a visible seeded operator.

### Visualization

- automaton grid with generation cursor;
- neighborhood/rule step explanation;
- selected cell lineage;
- mapping overlay showing which state becomes which event;
- aggregate density/entropy plots where methodologically appropriate.

### Mathematical requirements

- Rule update and boundary semantics are tested against known fixtures.
- Automaton state is independent of playback mapping.
- Fixed seed and rule reproduce identical grids.
- Large grids/generations are worker-evaluated and bounded.

### MVP acceptance

- All 256 elementary rules are representable.
- At least four canonical presets with accurate labels.
- One musically usable mapping beyond simple “live cell equals note.”
- Step mode explains a cell update.
- Exported events retain generation/cell provenance.

### Research gates

DR-06, DR-08.

---

## 7. Chaos Attractor

### Purpose

Turn deterministic nonlinear dynamical systems into stable, inspectable control and event sources without misrepresenting chaos as randomness.

### User controls

- system preset, with Lorenz required for MVP;
- system parameters and initial conditions;
- integration method, time step, warm-up/discard interval, and sample stride;
- axis-to-parameter mappings;
- normalization window/method;
- smoothing, hysteresis, quantization, and event threshold;
- scale/range and spatialization constraints;
- reseed/reset and trajectory freeze.

### Visualization

- trajectory in 2D and optional 3D;
- current sample and mapped musical value;
- side-by-side nearby initial conditions;
- normalized axis plots;
- numerical warning when parameters/integration become unstable.

### Mathematical requirements

- Integration method and parameters are recorded.
- Non-finite values stop evaluation with diagnostics.
- Normalization does not use unbounded future knowledge in real-time mode unless explicitly operating on a precomputed frozen trajectory.
- Nearby-trajectory comparison uses identical rendering/mapping settings.

### MVP acceptance

- Lorenz integration passes deterministic fixtures and finite-value checks.
- At least three musically constrained mapping presets.
- Live and frozen trajectory modes are clearly differentiated.
- Playback does not produce uncontrolled pitch, gain, or event density.
- Provenance includes system state and mapping stages.

### Research gates

DR-07, DR-08.

---

## 8. Penrose Sequencer

### Purpose

Generate music from a mathematically valid aperiodic Penrose tiling by mapping tile geometry, orientation, adjacency, and traversal to events and structure.

### User controls

- validated tiling construction method/preset;
- seed/configuration, inflation depth, viewport/clip boundary;
- kite/dart or rhomb representation, subject to selected implementation;
- tile/vertex/edge event source;
- traversal strategy: radial, graph walk, Hamiltonian approximation where appropriate, orientation sweep, or user-drawn path;
- tile type/orientation/distance/adjacency mappings;
- quantization and musical constraints.

### Visualization

- exact finite tiling patch with tile IDs;
- matching-rule/edge annotations in educational mode;
- adjacency graph overlay;
- traversal order and current event;
- scale/inflation relationship.

### Mathematical requirements

- No gaps or overlaps beyond documented numeric tolerance.
- Tile shapes and matching rules follow the selected formal construction.
- Shared edges produce symmetric adjacency.
- Stable tile IDs survive deterministic regeneration.
- Clipping does not create false adjacency.

### MVP acceptance

- Research selects and documents one exact algorithm.
- Golden patches match independent reference properties/counts.
- Geometry invariants pass for multiple depths and seeds/configurations.
- At least three traversal/mapping presets yield bounded event streams.
- The UI never labels an illustrative star/rhomb pattern as a Penrose tiling.

### Research gates

DR-09, DR-08. This lab remains blocked from “complete” status until both are accepted.

---

## 9. Cross-lab composition

MVP labs must interoperate through canonical ports:

- Euclidean Rings can provide rhythm to Tonnetz Walk.
- Fractal Motif can recursively transform a Tonnetz chord path.
- Cellular/Chaos outputs can modulate velocity, filter, pan, or operator parameters.
- Infinite Staircase can tempo-scale a trigger pattern supplied by another lab.
- Penrose traversal can emit graph paths, triggers, or note/control sequences.

At least three cross-lab example projects are required before MVP release. They must expose the underlying graph and remain understandable, not merely impressive.
