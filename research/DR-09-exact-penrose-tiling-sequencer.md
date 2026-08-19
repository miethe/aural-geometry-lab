# Deep Research Charter DR-09

## Exact Penrose Tiling Generation, Adjacency, Traversal, and Musical Sequencing

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** Immediate / long-lead mathematical blocker  
**Primary decisions unlocked:** exact finite tiling algorithm, tile representation, stable IDs, clipping, adjacency graph, traversal, mapping, and geometric validation

## Research role

Act as a computational geometer, aperiodic-tiling mathematician, exact/numerical-geometry engineer, graph-algorithms specialist, generative-art researcher, sonification designer, and property-test architect.

## Objective

Select and specify a mathematically valid, deterministic Penrose tiling implementation suitable for an interactive browser sequencer. Compare inflation/deflation using rhombs or Robinson triangles, kite/dart representations, pentagrid/de Bruijn methods, and cut-and-project approaches. Define exact or robust numeric geometry, finite patch generation, matching rules, clipping, tile identity, edge adjacency, traversal strategies, and musical mappings. Supply independent fixtures and invariants so a decorative quasiperiodic pattern cannot be mistaken for a valid Penrose tiling.

## Context

Sprint 0 intentionally contains only a research-gated conceptual diagram and explicitly does not claim that it is a Penrose tiling. MVP completion requires a verified finite patch and adjacency graph. The lab must demonstrate aperiodic order and inflation/self-similarity without overclaiming finite visual evidence as a proof of global nonperiodicity.

## Decisions required

1. Primary construction algorithm and tile representation.
2. Internal numeric representation: exact algebraic coordinates, symbolic vertices, high-precision numeric, or controlled Float64.
3. Seed/configuration and finite-patch semantics.
4. Inflation depth and viewport/clipping strategy.
5. Tile/vertex/edge canonicalization and stable IDs.
6. Matching-rule validation.
7. Shared-edge adjacency graph construction.
8. Traversal strategies and bounded event semantics.
9. Geometric-to-musical mapping presets.
10. Golden reference properties/counts and tolerance policy.
11. Visualization/educational explanation.
12. Performance budgets and worker/caching strategy.

## Research questions

### Mathematical representations

Compare at minimum:

- thick/thin Penrose rhombs;
- kite/dart tiles;
- Robinson triangles as an inflation-friendly internal representation;
- de Bruijn pentagrid construction;
- cut-and-project methods from higher-dimensional lattices.

For each:

- correctness and proof/reference basis;
- ability to generate arbitrary finite regions;
- matching-rule visibility;
- deterministic IDs and adjacency;
- numerical robustness;
- implementation complexity;
- interactive incremental refinement;
- pedagogical value.

### Exact/numeric geometry

- Can coordinates be represented in an algebraic number field involving the golden ratio and roots of unity, or should the implementation use symbolic construction histories plus tolerant rendering coordinates?
- How should nearly equal vertices be canonicalized without merging distinct geometry?
- Which predicates need exactness: orientation, edge equality, point-in-region, overlap?
- Can integer/lattice coordinates be retained for pentagrid or cut-and-project constructions?
- What tolerance is defensible for rendered Float64 geometry, and how is it derived from scale/depth?

### Finite patches and clipping

- What exactly is a “seed” or configuration for each method?
- Should the lab generate by inflation depth and then clip, or directly enumerate tiles intersecting a viewport?
- How are partial tiles represented?
- Can clipping introduce false adjacency or break matching-rule explanations?
- How can the user zoom/refine without regenerating unrelated stable tile IDs?

### Validation

Required invariants include:

- tile shape/edge-length classes;
- orientation and positive area;
- no interior overlap beyond tolerance;
- no unintended gaps inside the asserted covered patch;
- matching-rule compliance where represented;
- symmetric adjacency;
- shared edge endpoints/length agreement;
- deterministic regeneration;
- count/ratio trends and inflation relations against independent references;
- local vertex configurations where documented.

Determine which properties are exact for finite depth/patch and which are asymptotic.

### Traversal and graph algorithms

Investigate:

- tile adjacency walks;
- vertex/edge walks;
- radial or angular sweeps;
- inflation-tree traversal;
- orientation/type grouping;
- user-drawn geometric paths projected to tiles;
- shortest/random/self-avoiding walks;
- coverage approximations such as Hamiltonian-like paths, carefully labeled.

Define deterministic tie breaking, termination, repeat policy, and event budgets.

### Musical mapping

Candidate tile/graph features:

- thick/thin or kite/dart type;
- orientation modulo tile symmetry;
- distance/angle from origin;
- inflation generation/ancestry;
- local vertex degree/configuration;
- adjacency edge type;
- traversal turn angle;
- accepted window/strip indices in a cut-and-project model.

Assess which mappings reveal aperiodic structure, which merely decorate it, and how downstream quantization/constraints are exposed under DR-08.

### Pedagogy and claims

- How should the lab explain nonperiodicity, quasiperiodic order, local matching rules, and inflation?
- Which claims can a finite patch demonstrate versus illustrate?
- How should exact tiles, clipped tiles, matching-rule arrows, and adjacency be displayed?
- Which comparisons with periodic tilings make the distinction understandable?

## Scope

### In scope

- one production-quality exact/robust Penrose construction;
- finite interactive patches;
- stable tile IDs and adjacency;
- validated traversal and event generation;
- mathematical/educational visualization;
- cross-lab graph/geometry outputs.

### Out of scope

- generalized aperiodic tiling engine for all substitution tilings;
- formal proof assistant integration;
- claiming finite generated samples prove global theorems;
- arbitrary user-authored matching rules;
- 3D quasicrystals in MVP.

## Source requirements

Prioritize:

- Roger Penrose/de Bruijn and other primary mathematical sources;
- peer-reviewed tiling/computational-geometry literature;
- authoritative books/monographs;
- independently maintained exact implementations only for cross-validation;
- papers specifying algorithms, coordinate systems, counts, and matching rules.

Image search/blog implementations are not sufficient evidence of correctness. Trace every golden property to a reliable source or independent derivation.

## Method

1. Create a comparison matrix of construction methods.
2. Implement at least two small independent reference prototypes or validate one against an independent implementation.
3. Select internal symbolic/exact and rendering representations.
4. Generate patches over multiple depths/configurations.
5. Build automated geometry predicates/invariants and independent golden fixtures.
6. Define stable IDs from construction history or exact canonical coordinates.
7. Construct and validate adjacency.
8. Benchmark generation, clipping, picking, and traversal.
9. Prototype musical mappings and compare with periodic control tilings.
10. Design educational views and precise claim language.

## Required deliverables

1. Mathematical/construction-method comparison.
2. Recommended algorithm and rationale.
3. Exact equations/pseudocode and data structures.
4. Numeric robustness/tolerance policy.
5. Stable tile/vertex/edge ID scheme.
6. Finite patch, clipping, and incremental refinement semantics.
7. Matching-rule and adjacency algorithms.
8. Machine-readable golden patches and source-grounded properties.
9. Property/invariant test suite specification.
10. Traversal algorithm catalog with complexity/bounds.
11. Musical mapping presets and periodic-control comparisons.
12. Visualization/guided-experiment specification.
13. Performance budgets and worker/cache plan.
14. ADR and operator/project-schema proposals.
15. Explicit list of claims the finite lab can and cannot establish.

## Acceptance criteria

- At least one construction is independently validated and selected.
- Generated patches pass overlap, shape, matching, adjacency, and determinism tests across defined depth/configuration ranges.
- Numeric tolerance is derived and scale-aware, not arbitrary.
- IDs remain stable under deterministic regeneration and viewport operations as specified.
- Clipping cannot create false adjacency.
- Traversals are bounded, deterministic under seed/tie rules, and accurately labeled.
- Mapping presets preserve a visible link to real tile/graph features.
- User-facing content distinguishes demonstration/illustration from proof.
- Engineering can implement AGL-120 through AGL-123 without unresolved geometry choices.

## Handoff

Replace the conceptual placeholder with the accepted geometry operator, adjacency graph, traversal adapters, presets, golden fixtures, ADR, and lab acceptance suite. Update cross-lab graph/geometry port contracts and DR-08 mappings.
