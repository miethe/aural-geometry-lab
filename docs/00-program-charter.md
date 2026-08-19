# Aural Geometry Lab — MVP Program Charter

**Charter version:** 1.0  
**Initiated:** 2026-08-13  
**Program state:** Active / Sprint 0 foundation complete  
**Working product name:** Aural Geometry Lab

## 1. Mission

Create an approachable but technically serious browser studio in which mathematical structures can generate, transform, organize, visualize, constrain, and explain music—and musical structures can be inspected as mathematical objects.

The product must sit between a fixed educational exhibit and a professional algorithmic-composition environment. It should provide immediate, playable experiments while preserving enough rigor, determinism, interoperability, and extensibility to support education, composition, research, and performance.

## 2. Product thesis

Existing systems tend to optimize for one of four modes:

1. approachable but isolated educational experiments;
2. powerful but code-centric live coding;
3. general visual audio programming with a steep engineering interface;
4. symbolic composition without a unified geometry-first interaction model.

Aural Geometry Lab differentiates through a synchronized experience:

- hear the system;
- see the mathematical object;
- manipulate it directly;
- inspect the exact mapping;
- trace the provenance of every event;
- combine operators into reusable musical systems.

## 3. MVP objective

Deliver a private-beta-quality web application containing:

- a project workspace with transport, tracks, mixer, and saved state;
- a typed visual operator graph;
- synchronized 2D/3D visualization and mathematical inspector;
- deterministic event generation and browser audio rendering;
- seven curated labs with presets and explanations;
- JSON project import/export, MIDI export, and offline WAV rendering;
- minimum viable MusicXML export for note-based labs;
- keyboard-accessible controls, motion controls, and nonvisual descriptions;
- automated mathematical, audio-scheduling, schema, performance, and end-to-end tests.

## 4. MVP laboratories

| Priority | Laboratory | MVP outcome |
|---|---|---|
| P0 | Infinite Staircase | Perceptually convincing accelerating/decelerating Risset rhythm with visible logarithmic tempo space and controlled comparisons |
| P0 | Euclidean Rings | Multi-ring cyclic sequencer with exact distribution, rotation, phase, LCM cycle, presets, and export |
| P1 | Tonnetz Walk | Interactive harmonic lattice, chord/path generation, parsimonious voice leading, and synchronized playback |
| P1 | Fractal Motif | Bounded recursive motif engine with transformation grammar and recursion-tree visualization |
| P1 | Cellular Automaton Orchestra | Reproducible 1D automata sonification plus one validated 2D mode or equivalent richer mapping |
| P1 | Chaos Attractor | Numerically stable dynamical-system integration with visible trajectories and musically constrained mappings |
| P1 | Penrose Sequencer | Mathematically valid finite Penrose patch, adjacency graph, traversal strategies, and aperiodic sequencing |

## 5. Success measures

### User outcome measures

- A first-time user can open a preset, hear a valid result, and identify the mathematical rule within three minutes.
- A musically experienced user can create and export a novel result without writing code.
- A user can click any generated note/trigger and see a comprehensible provenance chain.
- A project reopened from JSON reproduces the same event stream and parameter state.
- Every lab includes at least one guided experiment that demonstrates a meaningful mathematical or perceptual claim.

### Technical measures

- No cumulative beat drift in exact event generation.
- Repeatable output for identical project version, seed, and operator versions.
- Audio scheduling avoids audible transport instability on the supported browser matrix under the defined test load.
- Operator evaluation is cancellable and bounded by event, time, recursion, and memory budgets.
- Project migrations are deterministic and preserve source files.
- The global stop action silences all scheduled app audio promptly.

### Quality measures

- All mathematical operators have invariant/property tests.
- All labs have deterministic golden fixtures and end-to-end smoke tests.
- No research-gated claim is presented as validated before the acceptance evidence is recorded.
- Accessibility target: WCAG 2.2 AA for applicable web UI, with documented exceptions for inherently visual/aural experiments and equivalent descriptive alternatives.

## 6. Primary users

1. **Curious explorer** — wants immediate visual and auditory intuition without notation or code expertise.
2. **Music learner/educator** — wants guided, accurate demonstrations and shareable experiments.
3. **Composer/producer** — wants usable MIDI/audio output, reproducible generative structures, and musical constraints.
4. **Creative coder/researcher** — wants explicit mappings, seeds, versioned operators, benchmarks, and extensibility.
5. **Performer** — wants reliable transport, MIDI control, presets, and safe real-time parameter manipulation.

The MVP prioritizes the first four. Live-performance hardening is a near-term post-MVP objective rather than a launch promise.

## 7. Scope boundaries

### In scope

- Event/MIDI-first mathematical composition.
- Synthesized voices and bundled/licensed one-shot samples.
- Curated operators and mappings.
- Browser-local projects.
- Optional, feature-detected MIDI input/output.
- Offline audio rendering.
- Shareable project files and deterministic examples.

### Explicitly post-MVP

- Arbitrary commercial-track ingestion and transformation.
- General stem separation, polyphonic transcription, or high-quality elastic audio.
- Collaborative cloud editing and identity management.
- Third-party executable plugin marketplace.
- Full DAW replacement features such as multitrack recording, comping, mastering, and unrestricted plugin hosting.
- Mobile-first authoring.
- Guaranteed stage-performance reliability.

## 8. Program principles

1. **Mathematical truth before visual spectacle.** Research-gated geometry is labeled and withheld until valid.
2. **Musical usefulness before novelty.** Raw equations require quantization, smoothing, constraints, and intentional mappings.
3. **Exact musical time; approximate physical time only at the boundary.**
4. **Determinism by default.** Randomness is seeded and visible.
5. **Every transformation is inspectable.** Provenance is part of the data model.
6. **Bound everything.** Recursion, graph traversal, event density, audio gain, and computation have explicit limits.
7. **Progressive disclosure.** Presets and direct manipulation first; equations and patch graph available when desired.
8. **Framework independence at the domain layer.** UI/audio libraries remain replaceable adapters.
9. **No fake completion.** A conceptual visualization is never labeled as the mathematical object it only resembles.

## 9. Governance and decision rights

| Decision | Accountable role | Required consultation |
|---|---|---|
| Product scope and priority | Product lead | Music/education research, engineering, UX |
| Mathematical validity | Computational-music research lead | Domain specialist for the relevant lab |
| Architecture and data contracts | Technical lead | Audio engineer, frontend lead, QA |
| Psychoacoustic claims | Research lead | External evidence or controlled study owner |
| Accessibility acceptance | UX/accessibility owner | QA and representative users |
| Dependency and licensing adoption | Technical/product leads | Legal/open-source review |
| MVP release | Product lead | Technical, research, QA, accessibility sign-off |

## 10. Assumptions for planning

- Initial implementation team: two product engineers, one design/product owner, and part-time computational-music/audio research support.
- Browser desktop is the primary authoring target.
- The product can ship as a local-first application without a required backend.
- Research may change lab defaults and mapping choices but should not invalidate the shared event/pattern architecture.
- Exact calendar commitments require staffing confirmation and are intentionally separated from the sequence-based roadmap.

## 11. Exit criteria for MVP

The MVP is complete only when:

- all seven lab acceptance suites pass;
- P0/P1 platform capabilities are implemented;
- DR-01 through DR-09 have either completed acceptance evidence or an explicitly approved reduced scope;
- deterministic project round-trip and migration tests pass;
- supported-browser audio/performance tests pass;
- export fixtures validate in at least one independent MIDI, WAV, and MusicXML consumer;
- critical/high risks have an accepted mitigation or release exception;
- user testing demonstrates the core hear–see–manipulate–explain loop.
