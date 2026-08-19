# Deep Research Charter DR-04

## Tonnetz and Harmonic Geometry for Interactive Composition

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** MVP lab hardening  
**Primary decisions unlocked:** Tonnetz convention, chord/transform model, path semantics, voicing optimizer, notation, and explanatory claims

## Research role

Act as a music theorist specializing in harmonic geometry and neo-Riemannian theory, computational musicologist, graph-algorithms engineer, tuning/notation specialist, interaction designer, and implementation/test architect.

## Objective

Select a precise, teachable, and computationally useful harmonic-space model for Tonnetz Walk. Separate historical Tonnetz variants, pitch-class lattices, chord graphs, neo-Riemannian transformations, and voice-leading geometry so the product does not combine incompatible ideas under one picture. Deliver exact coordinate/graph semantics, deterministic voicing rules, fixtures, and guided explanations.

## Context

Sprint 0 uses lattice axes of perfect fifth and major third and can generate major/minor triads. The MVP must allow users to draw paths, transform chords, hear parsimonious voice leading, inspect common tones/moved voices, and export MIDI/MusicXML.

## Decisions required

1. Primary Tonnetz definition and coordinate convention.
2. Pitch-class versus pitch/register representation.
3. Enharmonic spelling and tuning assumptions.
4. Chord types included in MVP.
5. Valid transformation family, such as P/L/R, and exact semantics.
6. Path/node/edge model and distance measures.
7. Voicing optimization objective, constraints, and tie breaking.
8. Visualization topology, boundaries/repetition, and labels.
9. Export spelling/inversion policy.
10. User-facing claims linking geometry to harmonic/voice-leading relationships.

## Research questions

### Historical and theoretical models

- How have Euler, Oettingen, Riemann, and modern theorists defined Tonnetz-like structures?
- Which axes/intervals and dual interpretations are common?
- How do neo-Riemannian chord transformations relate to, but differ from, a pitch-class lattice?
- What does a finite screen patch represent when the underlying structure is periodic/infinite?
- When is a toroidal quotient appropriate, and what information does it hide?

### Harmony and transformations

- What are exact P, L, and R operations for major/minor triads under the selected convention?
- Which identities/group relations can be tested?
- Should MVP include only consonant triads or selected seventh chords/other sonorities?
- How are common tones and semitone/whole-tone voice movements represented?
- Which graph edge types should be visible and independently toggleable?

### Voice-leading geometry

- What is the distinction among graph distance, pitch-class distance, sum of semitone motion, maximum voice motion, and Tymoczko-style geometric spaces?
- Which cost function yields musically useful deterministic voicings under register/range constraints?
- How should voice crossing, doubling, inversion, common-tone retention, and leap penalties be handled?
- How can the UI explain that identical pitch-class chords can have different voiced distances?

### Tuning and spelling

- Is 12-tone equal temperament the only MVP tuning or should the model preserve a tuning abstraction?
- How should F-sharp/G-flat and contextual spelling be chosen?
- What minimum MusicXML metadata is needed to preserve chord spelling and voice assignments?
- Which limitations should be surfaced when export approximates microtonal/tuning states?

### Interaction

- Should users select pitch vertices, chord triangles, transformation edges, or all three through modes?
- How can a path remain readable when the lattice repeats equivalent classes?
- What path generators are valuable: manual, random walk, target chord, shortest graph path, minimum voice-leading path?
- How should rhythmic input be supplied from another lab/operator?

## Scope

### In scope

- one primary 12-TET Tonnetz/chord model;
- major/minor triads and validated transformations;
- deterministic voicing in bounded registers;
- manual and algorithmic paths;
- MIDI/MusicXML-ready output;
- educational comparison of graph and voice-leading distances.

### Out of scope

- exhaustive transformational theory;
- full common-practice harmony engine;
- automatic functional-harmonic analysis;
- arbitrary tuning systems in MVP, though architecture should not preclude them;
- claims that spatial proximity universally equals perceived harmonic closeness.

## Source requirements

Prioritize:

- primary historical/theoretical sources where accessible;
- peer-reviewed modern Tonnetz/neo-Riemannian/voice-leading literature;
- authoritative books/papers by leading harmonic-geometry scholars;
- official MusicXML documentation for export;
- open implementations only as validation aids.

Record the exact convention behind every diagram and formula.

## Method

1. Build a comparison matrix of candidate Tonnetz conventions.
2. Select a primary model using explanatory value, mathematical coherence, and implementation utility.
3. Formalize coordinate→pitch, chord, transform, and path functions.
4. Define a separate voicing optimizer over actual pitches/registers.
5. Build independent fixtures for transformations, paths, and voicings.
6. Prototype 2D interaction and linked voice-leading display.
7. Test comprehension with musically trained and untrained users where feasible.
8. Map output to MIDI and a documented MusicXML subset.

## Required deliverables

1. Historical/theoretical taxonomy with no conflation.
2. Recommended MVP convention and rationale.
3. Exact coordinate, chord, and transform equations/pseudocode.
4. Graph schema and stable-ID strategy.
5. Voicing optimization specification with objective/constraints/tie breaking.
6. Enharmonic spelling and export policy.
7. Machine-readable chord/path/voicing fixtures.
8. Visualization and interaction specification.
9. At least three presets and guided experiments.
10. Claim/evidence language and limitations.
11. Operator contracts for Tonnetz, traversal, and voicing stages.
12. ADR proposal and acceptance tests.

## Acceptance criteria

- The selected convention is explicit, sourced, and internally consistent.
- Pitch-class lattice, chord transformations, and voiced-note optimization are separate layers.
- Major/minor transformations and identities pass fixtures.
- Voicing output is deterministic and constraint-aware.
- MIDI/MusicXML decisions preserve or explicitly approximate spelling/register.
- User-facing explanations do not equate all geometric distance with perceptual similarity.
- Engineering can implement AGL-081 through AGL-084 without unresolved theory choices.

## Handoff

Update the Tonnetz operator version, graph/path data types, voicing constraint operator, lab presets/guide, export fixtures, and DR-08 mapping guidance.
