# Deep Research Charter DR-06

## Cellular Automata Sonification and Emergent Musical Structure

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** MVP lab hardening  
**Primary decisions unlocked:** automaton scope, update/boundary semantics, musically meaningful mappings, 2D extension, entropy/complexity claims, and reference fixtures

## Research role

Act as a cellular-automata researcher, complex-systems specialist, sonification researcher, algorithmic composer, numerical/software test engineer, and interaction designer.

## Objective

Specify a Cellular Automaton Orchestra laboratory that faithfully separates automaton evolution from sonification. Establish exact 1D elementary cellular automaton semantics, select whether one 2D or richer mode belongs in MVP, identify mappings that reveal structure rather than merely turning live cells into notes, and provide deterministic fixtures, bounded execution rules, visualization, and user-facing explanations.

## Context

Sprint 0 implements elementary one-dimensional binary cellular automata and maps active cells to notes. This is a useful computational preview but too shallow for the complete lab. MVP should support all elementary rules, step-by-step neighborhood inspection, cell lineage, multiple mapping strategies, and either one validated 2D mode or a comparably meaningful extension.

## Decisions required

1. Exact elementary-CA state, indexing, update, seed, and boundary conventions.
2. Which canonical rules/presets to include and how to label behavior classes.
3. Which state-derived features become first-class mapping sources.
4. Whether a 2D mode is in scope and, if so, which one.
5. Temporal scanning and rational-beat mapping.
6. Event-density and grid/generation budgets.
7. Complexity/entropy measurements that are defensible and useful.
8. Cell lineage/provenance representation.
9. Step-explanation interaction.
10. Acceptance fixtures and guided experiments.

## Research questions

### Formal model

- What exact convention maps an elementary rule number to its eight neighborhood outputs?
- Which boundary conditions should be supported: fixed-zero, fixed-one, wraparound, reflective, or infinite sparse?
- How should even-width seeds and center placement be defined?
- Are updates synchronous only in MVP?
- What stable IDs can identify cells across deterministic regeneration?

### Rule behavior and terminology

- How should Wolfram-style classes or other behavior classifications be presented, including known limitations and subjectivity?
- Which rules have robust, pedagogically useful behaviors: periodicity, nested structures, apparent randomness, moving structures, universal computation?
- Which claims require caution because finite grids/boundaries alter behavior?
- What is the right distinction among deterministic complexity, chaos, pseudo-random appearance, and computational universality?

### Sonification mappings

Investigate mappings based on:

- cell state;
- births/deaths or transitions;
- neighborhood code;
- run length;
- cell age/persistence;
- local/global density;
- moving fronts/particles;
- row or column summaries;
- spatial symmetry;
- detected periodicity;
- entropy or compression-based proxies where justified.

For each mapping, assess whether it helps the listener perceive automaton structure, produces musically useful material, remains bounded, and is explainable.

### 2D/richer mode

- Would Conway's Game of Life, another Life-like rule, cyclic cellular automata, totalistic rules, or multi-state one-dimensional systems add the most value?
- Which choice offers clear local-rule pedagogy and musically distinctive structure without exploding implementation scope?
- How should viewport, infinite plane assumptions, sparse storage, and termination be defined?
- Is a validated richer one-dimensional mode preferable for MVP?

### Temporal model

- Does each generation map to a beat, measure, step, or controllable rational duration?
- Do cells within a generation sound simultaneously, by scan order, or through feature extraction?
- How can different scans be explicit mapping operators rather than hidden lab behavior?
- How does the system prevent dense rows from producing unsafe event bursts?

### Visualization and interaction

- How can a selected cell show its three-cell neighborhood and rule-table lookup?
- How can cell lineage be traced backward/forward?
- Which aggregate plots are valid and understandable?
- How should animation proceed under reduced motion?
- What direct manipulation of seed rows is useful and deterministic?

## Scope

### In scope

- all 256 elementary binary rules;
- explicit boundary/seed semantics;
- state-derived feature extraction;
- one richer mode only if justified;
- deterministic, bounded sonification;
- grid/lineage visualization and exportable events.

### Out of scope

- arbitrary user-written rules/code;
- claiming visual complexity equals musical quality;
- exhaustive study of cellular automata;
- simulating unbounded universes without finite query semantics;
- presenting deterministic systems as genuinely random.

## Source requirements

Prioritize:

- primary/formal CA literature;
- peer-reviewed complex-systems and CA classification studies;
- peer-reviewed sonification and algorithmic-composition research;
- independent reference implementations only for fixture cross-checking;
- accessibility/HCI research for grid inspection where relevant.

Treat popular descriptions of “chaos” or “randomness” as low authority unless tied to formal definitions.

## Method

1. Formalize the elementary CA conventions.
2. Cross-check all 256 rules against an independent reference for bounded fixtures.
3. Implement candidate feature extractors separately from event mappings.
4. Generate a standard corpus across seeds, boundaries, rules, and generation counts.
5. Evaluate mapping outputs for event density, repeatability, perceptual differentiation, and musical controllability.
6. Compare candidate richer modes through a scoped prototype matrix.
7. Design step and lineage interactions.
8. Define performance budgets and worker strategy.
9. Produce guided experiments that distinguish deterministic emergence from randomness.

## Required deliverables

1. Formal update/boundary/seed specification.
2. Rule-number truth table and machine-readable fixtures.
3. Canonical preset catalog with accurate claims/limitations.
4. Feature-extraction taxonomy and recommended MVP set.
5. Sonification mapping comparison with bounded parameter profiles.
6. Recommendation for or against a 2D/richer MVP mode.
7. Temporal/scan operator definitions.
8. Cell lineage and stable-ID model.
9. Visualization/step-inspector specification.
10. Event/grid/performance budgets.
11. Guided experiments and acceptance tests.
12. ADR and operator-contract proposals.

## Acceptance criteria

- Elementary rules reproduce independent fixtures under every supported boundary mode.
- Automaton evolution and musical mapping are independently versioned/testable.
- At least one mapping exposes temporal/spatial structure beyond live-cell density.
- Any 2D/richer mode has a strong product rationale and exact bounded semantics.
- Complexity/randomness claims are technically qualified.
- Large computations are cancellable and cannot flood the audio engine.
- A selected event can trace to generation, cell/feature, neighborhood, rule result, and mapping.
- Engineering can complete AGL-101 through AGL-104 without unresolved model choices.

## Handoff

Update the CA operator(s), feature and scan adapter operators, lab presets, provenance schema, worker budgets, visualization, and DR-08 mapping library.
