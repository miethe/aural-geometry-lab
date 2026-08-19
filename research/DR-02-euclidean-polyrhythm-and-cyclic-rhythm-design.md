# Deep Research Charter DR-02

## Euclidean Polyrhythm and Cyclic Rhythm Design

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** MVP lab hardening  
**Primary decisions unlocked:** Euclidean operator convention, cyclic analysis, presets, terminology, and validation corpus

## Research role

Act as an algorithms researcher, computational musicologist, rhythm theorist, ethnomusicology-aware evidence reviewer, interactive-sequencer designer, and test engineer.

## Objective

Specify a rigorous and musically useful Euclidean Rings laboratory based on evenly distributing \(k\) onsets over \(n\) cyclic steps. Resolve algorithmic conventions, rotation/canonicalization behavior, relationship to maximally even rhythms, composite-cycle analysis, responsible use of culturally named presets, and exact acceptance fixtures.

## Context

Sprint 0 implements a Bjorklund-style distribution and cyclic-gap analysis. The production lab will support up to eight rings, direct rotation, LCM/composite-cycle visualization, instruments/accents, MIDI export, and cross-lab use as a trigger source.

The product must avoid implying that a simple algorithm “invented,” fully explains, or uniquely generates culturally situated rhythms merely because one rotation matches a binary onset pattern.

## Decisions required

1. Canonical definition of `steps`, `pulses`, rotation, and output orientation.
2. Reference algorithm and equivalence to alternative constructions.
3. Edge-case semantics and canonical rotation/necklace identity.
4. Whether complements, inverses, and “maximally even” terminology are included.
5. Composite-cycle/LCM representation without eager explosion.
6. Accent/probability relationship to the core deterministic rhythm.
7. Preset selection and labeling policy.
8. MIDI/export quantization behavior.
9. Mathematical and reference-corpus acceptance tests.

## Research questions

### Algorithms and equivalence

- What is the exact relationship among Euclid's algorithm, Bjorklund's timing-distribution algorithm, Toussaint's Euclidean rhythms, and maximally even sets?
- Under which \((n,k)\) pairs or conventions do common implementations differ only by rotation, and when do they differ materially?
- Which algorithm is simplest to explain step-by-step while remaining efficient and correct?
- How should the orientation/indexing of the first onset be standardized?
- How should `k=0`, `k=n`, `n=1`, `k>n`, and negative rotations behave?

### Cyclic structure

- How should cyclic gaps be defined and canonicalized?
- How can two patterns be compared modulo rotation or reflection?
- Should the product expose necklace/bracelet equivalence, and is that educationally useful in MVP?
- Which distance/similarity metrics between cyclic patterns are well founded and computationally tractable?
- How should the combined period of rings with different step subdivisions be represented exactly?
- When LCM becomes extremely large, which summaries preserve useful alignment information?

### Musical mappings

- How should ring steps map to rational beats when ring lengths differ?
- What is the clean separation between pattern generation, swing, probability, accents, and humanization?
- Which controls remain deterministic, and how is seeded variation represented?
- How can users route Euclidean triggers into pitches, chords, or control signals without hiding the adapter stage?

### Cultural/historical claims

- Which frequently cited rhythm correspondences are documented in reliable musicological sources?
- Does a binary onset match omit accents, microtiming, phrasing, timbre, meter, or social context that must be acknowledged?
- Which presets can be labeled descriptively by \(E(k,n)\) rather than culturally?
- Where culturally named examples are used, what context, source, and caveat are required?

### UX and pedagogy

- Is a concentric-ring view the strongest primary representation?
- How should cyclic gaps, rotations, composite alignments, and equivalence classes be displayed?
- What direct manipulation produces predictable results for mouse, touch, and keyboard users?
- Which guided experiments best demonstrate evenness, rotation, and polyrhythmic alignment?

## Scope

### In scope

- binary cyclic onset distributions;
- rotations/reflections/complements where justified;
- multiple exact rings and composite cycles;
- accents/probability as downstream stages;
- presets and responsible contextualization;
- MIDI-ready event generation.

### Out of scope

- claiming a binary grid fully models any musical tradition;
- unquantized expressive performance modeling;
- exhaustive ethnomusicological survey;
- generalized constraint-based rhythm generation beyond interfaces needed for future expansion.

## Source requirements

Prioritize:

- original Bjorklund algorithm documentation/paper;
- Toussaint's primary publications and subsequent peer-reviewed critique/extension;
- mathematical literature on maximally even sets and cyclic groups;
- credible musicological sources for named examples;
- independent algorithm implementations only as cross-checks, not authority.

Record algorithm conventions precisely because many sources differ by rotation, indexing, and terminology.

## Method

1. Formalize rhythms as subsets/binary necklaces of \(\mathbb{Z}_n\).
2. Compare candidate algorithms over a complete bounded corpus, such as all \(1 \le n \le 64\), \(0 \le k \le n\).
3. Normalize outputs modulo rotation and identify genuine differences.
4. Create independent expected fixtures for representative and edge cases.
5. Design rational-beat mapping for mixed ring lengths.
6. Benchmark LCM/composite analysis and propose bounded summaries.
7. Review named presets through musicological sources and write labeling guidance.
8. Prototype guided experiments and direct-manipulation behavior.

## Required deliverables

1. Formal definitions and terminology glossary.
2. Recommended reference algorithm with pseudocode and complexity.
3. Complete edge-case and rotation convention.
4. Machine-readable validation corpus.
5. Equivalence/comparison utilities specification.
6. Composite-cycle/LCM model and visualization recommendation.
7. Accent/probability/humanization separation architecture.
8. Preset catalog with evidence, contextual notes, confidence, and descriptive fallbacks.
9. Three or more guided-experiment specifications.
10. MIDI/event mapping rules.
11. Operator contract and version recommendation for `rhythm.euclidean`.
12. ADR proposal and automated acceptance tests.

## Acceptance criteria

- All conventions are explicit enough that two independent implementations produce equivalent canonical results.
- A bounded exhaustive corpus demonstrates onset-count and balanced-gap properties.
- Rotation and canonicalization behavior is tested.
- Composite cycles are exact without requiring eager expansion.
- Cultural labels are evidence-based and caveated; unsupported correspondences are omitted or labeled hypotheses.
- Probability/accent features do not contaminate the deterministic Euclidean operator.
- Engineering can implement rings, direct manipulation, visualization, and export without unresolved algorithmic choices.

## Handoff

Update `AGL-071` through `AGL-074`, the `rhythm.euclidean` definition, preset catalog, fixture suite, and DR-08 mapping taxonomy.
