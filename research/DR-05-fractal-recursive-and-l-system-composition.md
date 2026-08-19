# Deep Research Charter DR-05

## Fractal, Recursive, and L-System Composition

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** MVP lab hardening  
**Primary decisions unlocked:** recursion grammar, self-similarity claims, transform library, growth forecasting, visualization, and event/provenance limits

## Research role

Act as a formal-languages researcher, fractal-geometry specialist, algorithmic-composition scholar, generative-music engineer, complexity analyst, interaction designer, and test architect.

## Objective

Define a Fractal Motif laboratory that generates musically useful nested structures while using “fractal,” “recursive,” “self-similar,” “substitution,” and “L-system” accurately. Select one or more bounded grammar models, specify transformations and termination, predict growth, preserve event ancestry, and determine which mathematical properties the product can legitimately demonstrate.

## Context

Sprint 0 recursively embeds transformed seed motifs under depth and event limits. MVP should support seed motif authoring, replacement and overlay grammars, generation-specific pitch/time/velocity transforms, recursion-tree visualization, and freeze-to-clip.

## Decisions required

1. Primary grammar model(s) for MVP.
2. Accurate terminology and threshold for calling an output fractal/self-similar.
3. Replacement versus overlay semantics.
4. Time/pitch/duration/velocity transform composition order.
5. Branching/probability semantics and seed behavior.
6. Growth forecast and hard termination rules.
7. Stable event ancestry/ID strategy.
8. Visualization and scale-comparison methods.
9. Presets/guided experiments.
10. Operator boundaries between grammar expansion and musical mapping.

## Research questions

### Definitions

- What distinguishes recursion, iteration, substitution systems, deterministic/stochastic L-systems, iterated function systems, and mathematical fractals?
- Which forms of musical self-similarity are exact, statistical, affine, or merely metaphorical?
- What measurements can compare motifs across temporal/pitch scales without overstating fractal dimension?
- When should the UI use “recursive motif” rather than “fractal”?

### Grammar models

- What symbol/event representation best supports music: symbols later mapped to notes, direct note-event replacement, or hierarchical temporal objects?
- How should context-free versus context-sensitive rules be scoped?
- How do replacement and overlay affect duration/cycle length?
- How should transformations compose across generations?
- Can rule selection be stochastic while remaining deterministic under a project seed?
- How are rests, chords, ties, articulation, and control events represented?

### Complexity and bounds

- How can event growth be computed or safely upper-bounded before expansion?
- Which grammars permit closed-form growth through production matrices?
- What termination conditions are meaningful: depth, minimum duration, maximum events, maximum branches, time window, or convergence?
- How can interval-query evaluation avoid expanding irrelevant branches?
- How should cancellation and partial previews work?

### Musical utility

- Which transform families yield coherent results: transposition, inversion, retrograde, temporal scale, rotation, register constraint, velocity decay?
- How can harmony/rhythm constraints operate downstream without destroying visible ancestry?
- What controls make recursion understandable rather than a combinatorial parameter wall?
- How should users freeze a branch/generation while retaining lineage?

### Visualization and pedagogy

- Which combination of recursion tree, nested timeline, and zoomable motif view best reveals structure?
- Can the lab show exact similarity by overlaying normalized generations?
- What guided experiment distinguishes exact recursive substitution from “random complexity”?
- How should event-budget growth be visualized before execution?

## Scope

### In scope

- deterministic and seeded-stochastic bounded grammars;
- replacement and overlay patterns;
- exact time/pitch transformations;
- ancestry/provenance;
- complexity forecasting and interval queries;
- musically constrained output.

### Out of scope

- arbitrary user code or Turing-complete grammar execution;
- claiming every recursive melody is a mathematical fractal;
- exhaustive generative grammar literature;
- unbounded real-time recursion.

## Source requirements

Use:

- primary sources on L-systems/formal grammars/fractals;
- peer-reviewed algorithmic-composition literature;
- reliable complexity/branching-process references;
- documented computer-music systems as implementation precedents;
- user studies or HCI literature where available.

Examples from copyrighted compositions should be analyzed at an abstract level and not reproduced beyond legally permissible excerpts.

## Method

1. Define candidate grammar/data models.
2. Implement small independent reference expanders.
3. Compare expressiveness, predictability, interval-query suitability, and pedagogy.
4. Derive growth formulas/upper bounds.
5. Create deterministic fixtures and adversarial grammars.
6. Prototype recursion-tree/nested-timeline views.
7. Test transform ordering and ancestry stability.
8. Evaluate presets with musicians/learners where feasible.

## Required deliverables

1. Terminology and claim guide.
2. Comparison and recommendation for grammar model(s).
3. Formal expansion semantics and transform order.
4. Growth forecast/termination algorithms.
5. Interval-query and caching strategy.
6. Stable ancestry/ID/provenance model.
7. Machine-readable grammar and expected-event fixtures.
8. Transform library recommendation.
9. Visualization/interaction specification.
10. Three or more presets and guided experiments.
11. Operator contracts and parameter schemas.
12. ADR proposal and acceptance tests.

## Acceptance criteria

- The product can distinguish recursion from defensible fractal/self-similarity claims.
- Grammar expansion is deterministic, bounded, cancellable, and forecastable.
- Identical inputs preserve stable ancestry/IDs.
- Transform composition order is exact and tested.
- Interval queries do not require unnecessary whole-project expansion for the selected model.
- Presets produce musically usable material under declared constraints.
- Engineering can implement AGL-091 through AGL-094 without unresolved formal semantics.

## Handoff

Update the `structure.fractal-motif` operator version, grammar data types, forecast service, provenance graph, lab visualization, guided experiments, and test generators.
