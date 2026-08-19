# Deep Research Charter DR-08

## General Sonification Mapping, Musical Constraint, Explainability, and Evaluation Framework

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** Immediate / cross-cutting MVP blocker  
**Primary decisions unlocked:** shared mapping pipeline, operator vocabulary, perceptual dimensions, musical constraints, provenance explanations, accessibility alternatives, and evaluation protocols across all labs

## Research role

Act as a sonification researcher, psychoacoustician, auditory-display designer, computational musician, data-visualization researcher, HCI/accessibility specialist, experimental-methods lead, and software architect.

## Objective

Create the cross-lab framework that turns mathematical values and structures into music in a way that is explicit, bounded, reproducible, perceptually interpretable, and musically useful. Define a composable mapping pipeline and evaluation method so each lab does not invent opaque normalization, smoothing, quantization, and constraints independently.

## Context

A mathematical object does not uniquely imply a musical result. A Lorenz coordinate, CA density, graph path, recursion depth, tile orientation, or integer sequence must pass through choices about sampling, range, scaling, smoothing, thresholding, quantization, voice assignment, and musical constraints. Those choices are the central authorship layer of Aural Geometry Lab and must be first-class operators with provenance.

## Decisions required

1. Canonical mapping pipeline and terminology.
2. Shared mathematical/control/event types and units.
3. Sampling models for discrete structures, paths, geometry, and continuous dynamics.
4. Normalization operators and causal versus whole-window semantics.
5. Smoothing/interpolation/filtering operators.
6. Quantization, threshold, hysteresis, probability, and constraint boundaries.
7. Mapping recommendations between mathematical and auditory dimensions.
8. Musical constraint framework and conflict-resolution provenance.
9. Evaluation taxonomy: information communication, musical utility, learnability, and aesthetic preference.
10. Accessible alternatives for pitch-, timbre-, pan-, and animation-coded information.
11. Explanation/provenance representation.
12. Cross-lab preset/benchmark corpus.

## Research questions

### Sonification purpose

- How do parameter-mapping sonification, audification, model-based sonification, earcons, and musical data mapping differ?
- Which paradigm applies to each Aural Geometry lab or operator?
- When is the objective to communicate mathematical structure, create music, teach a concept, or produce a perceptual illusion—and how should these goals be labeled?
- How should the product handle trade-offs between faithful data mapping and musical constraints?

### Source-domain modeling

- How should discrete sequences, graphs, geometric coordinates, events, and continuous trajectories expose dimensions and units?
- Which source values are ordinal, interval, ratio, categorical, circular, spatial, or topological?
- How does source measurement scale constrain valid transformations?
- How should missing, non-finite, out-of-range, or discontinuous values behave?

### Sampling

- Event-driven versus fixed-rate sampling?
- Path traversal versus spatial sweep versus user gesture?
- Beat-domain versus second-domain sampling?
- Adaptive sampling based on curvature/change?
- How should aliasing or excessive event density be detected?
- How should sampling itself appear in provenance and visualization?

### Normalization and scaling

Compare:

- fixed known bounds;
- user-defined bounds;
- min/max over frozen window;
- robust percentile/median-MAD methods;
- z-score/running statistics;
- logarithmic/exponential/power/sigmoid mappings;
- circular normalization for angles;
- categorical lookup.

Which methods are causal, stable under outliers, explainable, and suitable for each source type?

### Auditory dimensions

For pitch, loudness, duration, onset density, tempo, timbre/brightness, roughness, articulation, stereo/spatial position, harmony, and instrument identity:

- what perceptual resolution/order is supported;
- what confounds or nonlinearities exist;
- which dimensions are appropriate for quantitative versus categorical data;
- how simultaneous mappings interact;
- what safe ranges are required;
- what alternatives exist for hearing or equipment differences.

### Musical shaping and constraints

- How should scale/chord quantization, playable register, voice leading, rhythmic grid, polyphony, articulation, and event-density limits be represented?
- When constraints alter data fidelity, how is the decision disclosed?
- How are competing constraints prioritized and tie-broken deterministically?
- Should “faithful,” “musical,” and “exploratory” mapping profiles be distinct presets?
- How can a user bypass each stage and compare raw versus shaped output?

### Randomness and variation

- Which variation operators are seeded and clearly separate from deterministic source structure?
- How should probability at event generation differ from stochastic grammar or measurement noise?
- How can the interface avoid users attributing randomness to the underlying mathematical system?

### Explainability and provenance

- What minimum information lets a user answer “Why did this note happen?”
- How should provenance scale from plain language to exact formula/state?
- Which intermediate values must be retained versus recomputed?
- How can a mapping pipeline be both a visual graph and an accessible ordered list?

### Evaluation

Develop separate measures for:

1. recognition/discrimination of source state;
2. comprehension of mapping;
3. task performance using sound;
4. musical usefulness/editability;
5. aesthetic preference;
6. cognitive load;
7. accessibility and sensory alternatives;
8. reproducibility and technical stability.

How should studies avoid treating preference as proof of information fidelity or vice versa?

## Scope

### In scope

- mapping discrete/continuous mathematical structures to event/control/audio parameters;
- normalization, smoothing, quantization, constraints, provenance;
- perceptual and usability evaluation;
- cross-lab operator taxonomy;
- accessibility equivalents.

### Out of scope

- a universal theory of musical meaning;
- prescribing one “correct” aesthetic mapping;
- clinical auditory display validation;
- arbitrary machine-learning mappings in MVP;
- full spatial-audio research.

## Source requirements

Prioritize:

- International Community for Auditory Display and peer-reviewed sonification literature;
- psychoacoustics/auditory perception primary research and authoritative texts;
- HCI/data-visualization mapping literature;
- accessibility standards/research;
- algorithmic-composition and music-theory sources for constraints;
- controlled studies rather than anecdotal mapping recipes.

Record whether evidence concerns detection, ordering, quantitative estimation, preference, or musical composition; do not transfer conclusions between them without justification.

## Method

1. Build a source-dimension and auditory-dimension ontology.
2. Define the canonical mapping pipeline and typed operator contracts.
3. Create reference implementations for sampling, normalization, smoothing, quantization, threshold/hysteresis, and constraints.
4. Assemble cross-lab benchmark sources with known properties.
5. Generate mapping variants and measure objective bounds/information loss.
6. Design user/perceptual evaluation modules reusable by other research runs.
7. Conduct pilot evaluations or deliver a runnable research harness with power/sample-size guidance.
8. Define provenance/explanation templates and accessible alternatives.
9. Produce default profiles and “raw versus musical” comparisons.

## Required deliverables

1. Sonification/mapping terminology and purpose taxonomy.
2. Source and target dimension ontology with units/measurement scales.
3. Canonical pipeline:
   `Source → Sample → Normalize → Smooth → Transform → Quantize/Threshold → Constrain → Target`.
4. Typed operator contracts and parameter schemas for each stage.
5. Causality and frozen-window policy.
6. Musical constraint model and deterministic conflict resolution.
7. Auditory-dimension evidence matrix and safe/default ranges.
8. Provenance/explanation data model and plain-language templates.
9. Accessibility alternatives matrix.
10. Cross-lab benchmark corpus and fixtures.
11. Reusable evaluation/study protocol library.
12. Preset profiles: faithful, musical, pedagogical, experimental.
13. ADR proposals and acceptance tests.
14. Open research/ML-mapping roadmap.

## Acceptance criteria

- Every recommended mapping stage is explicit, serializable, testable, and bypassable.
- Causal live and whole-window frozen operations cannot be confused.
- Units/measurement scales constrain valid mapping choices.
- Musical constraints report how they altered the raw mapping.
- Auditory recommendations distinguish evidence for perception, task performance, and preference.
- Accessibility alternatives exist for information encoded through pitch, loudness, pan, timbre, or motion.
- A selected event can explain source value, each transformation, constraint decision, and final target.
- All seven labs can adopt the framework without private opaque mapping code.

## Handoff

Update core port types, control-signal and provenance models, operator registry, inspector UX, validation framework, all lab charters/backlogs, and the research harness application.
