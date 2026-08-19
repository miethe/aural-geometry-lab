# Deep Research Charter DR-07

## Chaotic Dynamics Sonification, Numerical Stability, and Musical Mapping

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** MVP lab hardening  
**Primary decisions unlocked:** supported dynamical systems, integrators, normalization/smoothing, causal live mode, divergence demonstrations, and safe musical mappings

## Research role

Act as a nonlinear-dynamics researcher, numerical-analysis engineer, sonification specialist, algorithmic composer, scientific-visualization designer, and validation architect.

## Objective

Specify a Chaos Attractor laboratory that accurately distinguishes deterministic chaos from randomness, integrates selected systems stably, records all numerical choices, converts trajectories into bounded musical control/events through visible stages, and supports both causal live operation and reproducible frozen trajectories.

## Context

Sprint 0 implements the Lorenz system with fourth-order Runge–Kutta and maps samples to notes. The complete lab needs evidence-based system presets, numerical diagnostics, normalization/smoothing/quantization operators, nearby-initial-condition comparison, meaningful mappings, and browser performance limits.

## Decisions required

1. Which systems belong in MVP: Lorenz required; Rössler/logistic or others optional.
2. Integrator(s), step-size semantics, and error/stability posture.
3. Initial conditions, warm-up/transient discard, sampling stride, and freeze behavior.
4. Causal real-time normalization versus precomputed frozen normalization.
5. Smoothing, threshold, hysteresis, and event-generation semantics.
6. Axis/derived-feature mapping recommendations.
7. Numerical and musical safety bounds.
8. Nearby-initial-condition/divergence visualization and claims.
9. Determinism/tolerance fixtures across JavaScript engines.
10. User-facing terminology and guided experiments.

## Research questions

### Dynamical systems

- Which parameter regions of the Lorenz system yield the intended bounded attractor behavior versus fixed points, transients, or numerical divergence?
- Which additional system, if any, adds conceptually distinct value without turning the lab into a catalog?
- What terminology distinguishes attractor, trajectory, phase space, sensitivity to initial conditions, bifurcation, and chaos?
- Which properties can the product demonstrate visually/audibly without claiming formal proof of chaos from a short trajectory?

### Numerical integration

- Is fixed-step RK4 sufficient for MVP, or is an adaptive integrator needed for some modes?
- What step sizes and parameter ranges remain stable under Float64 JavaScript arithmetic?
- How should state/time be represented and serialized?
- What tolerance should golden fixtures use across engines?
- How should non-finite states, excessive magnitude, or integration error be detected and reported?
- Can reference trajectories be generated in a higher-precision environment for validation?

### Sampling and normalization

- How does integration step differ from musical sample stride?
- Which normalization strategies are valid for live causal streams: fixed theoretical/empirical bounds, running min/max, robust running statistics, sigmoid transforms?
- When can frozen trajectories use whole-window normalization, and how must that be labeled?
- How do smoothing and hysteresis affect the musical result and the scientific interpretation?
- How should outliers and boundary clipping be visualized?

### Sonification

Candidate sources:

- x/y/z coordinates;
- radius/angle;
- speed or acceleration;
- lobe transitions;
- crossings of Poincaré-like sections;
- local curvature;
- divergence between nearby trajectories.

Candidate targets:

- scale degree/register;
- rhythm/event trigger;
- velocity;
- pan/spatial position;
- timbre/filter;
- articulation/duration;
- harmonic selection.

For each pair, assess perceptual interpretability, musical usefulness, event/gain safety, and whether dimensional relationships are preserved.

### Perception and pedagogy

- Can listeners distinguish system parameter changes or lobe transitions through selected mappings?
- What guided experiment best demonstrates sensitivity to initial conditions without implying nondeterminism?
- How should the UI compare two nearly identical trajectories over time?
- How can users freeze and replay exactly the same trajectory?

## Scope

### In scope

- Lorenz system and at most a small number of justified additions;
- fixed or adaptive numerical integration;
- deterministic frozen trajectories;
- causal live mapping;
- visible mapping pipeline and safety constraints;
- 2D/3D scientific visualization.

### Out of scope

- formal chaos classification for arbitrary equations;
- arbitrary user-defined differential equations/code;
- claiming raw attractor coordinates are inherently musical;
- scientific simulation accuracy beyond the declared educational/compositional model;
- high-order spatial audio.

## Source requirements

Use:

- primary papers/texts on selected dynamical systems;
- authoritative numerical-analysis references;
- peer-reviewed sonification/scientific-auditory-display studies;
- browser/ECMAScript numeric documentation where relevant;
- independent high-precision reference tools for fixtures.

Popular attractor visualizations may inspire UI but cannot establish numerical or scientific claims.

## Method

1. Define exact equations, parameters, initial conditions, and units.
2. Generate high-precision/reference trajectories.
3. Compare candidate integrators and steps over the supported parameter domain.
4. Establish finite/stability/tolerance tests.
5. Prototype causal and frozen normalization pipelines.
6. Evaluate candidate features/mappings using repeatability, boundedness, information preservation, and musician feedback.
7. Build nearby-initial-condition comparison stimuli.
8. Define worker/performance budgets and cancellation.
9. Translate findings into operator contracts, presets, warnings, and guided experiments.

## Required deliverables

1. Exact equations and terminology glossary.
2. Supported system/parameter profile and rejected ranges.
3. Integrator recommendation, pseudocode, and error/tolerance policy.
4. High-precision reference trajectories and machine-readable fixtures.
5. Live/frozen sampling and normalization architecture.
6. Feature/mapping matrix with recommended presets.
7. Numerical diagnostic/error UX.
8. Nearby-initial-condition experiment and visualization specification.
9. Event/gain/performance budgets.
10. Operator contracts for integration, sampling, normalization, smoothing, thresholding, and mapping.
11. ADR proposal and acceptance tests.
12. Claim/evidence and limitation language.

## Acceptance criteria

- Supported parameter/step combinations remain finite and within defined reference tolerances.
- All numerical choices are serialized and visible.
- Live mapping is causal; frozen whole-window processing is clearly labeled.
- The product explicitly distinguishes deterministic chaos from randomness.
- At least three mapping presets are bounded, reproducible, and musically usable.
- Nearby-initial-condition comparisons use identical mapping/render settings.
- Engineering can complete AGL-111 through AGL-114 without unresolved numerical choices.

## Handoff

Update `dynamics.lorenz` and mapping operators, trajectory project schema, numerical fixtures, visualization, worker budgets, guided experiments, and DR-08 mapping taxonomy.
