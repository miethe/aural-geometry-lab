# Deep Research Charter DR-01

## Risset Rhythm Psychoacoustics and Infinite-Staircase Design

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** Immediate / MVP blocker  
**Primary decisions unlocked:** Infinite Staircase operator semantics, default parameters, comparison presets, listening-test acceptance, and product claims

## Research role

Act as a psychoacoustics researcher, computational-music theorist, rhythm-perception specialist, digital-signal-processing engineer, film-music analyst, experimental-design lead, and implementation architect.

## Objective

Produce a source-grounded, implementation-ready dossier for a browser laboratory that creates and explains an apparently endless rhythmic acceleration or deceleration. Establish what is mathematically necessary, what is perceptually supported, which implementation parameters are robust, and which public claims about Ludwig Göransson's “Troy” can be made without presenting an unofficial reconstruction as an authoritative account of the original production session.

## Context

The lab will layer tempo-scaled copies of a trigger pattern, crossfade them as they traverse a tempo-equivalence interval, and optionally add subdivision shedding, metric ambiguity, anchor pulses, and Shepard/Risset pitch motion. Sprint 0 already implements a raised-cosine layer envelope and tests closure under layer relabeling. This research must determine how the production operator should generalize and which presets are supported by evidence.

Do not use, distribute, or derive assets from copyrighted soundtrack stems. Synthetic stimuli and user-authored inputs are sufficient.

## Decisions required

1. Exact mathematical definition and terminology for the MVP operator.
2. Supported tempo ratios, layer-index conventions, phase wrapping, and direction semantics.
3. Crossfade/envelope families and normalization policy.
4. Recommended layer counts, tempo bands, cycle lengths, and pulse-density limits.
5. Whether and how subdivision shedding should be a separate operator/stage.
6. Whether 3:2 metric ambiguity materially strengthens the illusion and how to implement it honestly.
7. How a fixed anchor pulse changes perception and how it should be used as a control condition.
8. Whether a pitch-based Shepard/Risset layer is in MVP scope and how to prevent it from confounding rhythm claims.
9. Perceptual acceptance protocol and thresholds for a “convincing” preset.
10. Exact wording for educational/product claims and uncertainty.

## Research questions

### Historical and definitional

- What did Shepard, Risset, and subsequent researchers formally define for circular pitch and rhythm/tempo illusions?
- Which terms are standard: Risset rhythm, Shepard–Risset rhythm, accelerating rhythm paradox, endless tempo illusion, or others?
- Which variants continuously change event rate versus crossfade pre-rendered loops, and are they perceptually equivalent?
- How is tempo-octave or logarithmic tempo equivalence described in primary literature?

### Mathematical construction

- For layer ratio \(r\), what conditions make phase wrapping equivalent to layer relabeling?
- How should amplitude envelopes be defined in linear gain versus power/loudness terms?
- Should adjacent-layer gains sum to one, equal power, constant RMS, or another normalization?
- How should the system behave at extreme instantaneous rates where individual pulses fuse into texture?
- How do source-pattern periodicity, accents, and phase alignment expose or hide reset points?
- What aliasing/event-density constraints are needed for browser scheduling and audio rendering?

### Psychoacoustics

- What evidence exists that listeners perceive continuous rhythmic acceleration/deceleration?
- How do layer count, cycle duration, starting tempo, spectral separation, timbre, and gain envelope affect strength?
- Are there known individual differences, training effects, or equipment/environment effects?
- Does a stable pulse/reference weaken the effect, and can it serve as an experimental control?
- What outcomes best measure the effect: direction judgment, reset detection, continuous rating, confidence, or matched tempo?
- How should the study distinguish perceived acceleration from increasing loudness, pitch, brightness, or event density?

### “Troy” analysis boundary

- Inventory authoritative information from the composer, score, production team, official release materials, or academically credible analysis.
- Separately inventory public reconstructions/analyses and label inference explicitly.
- Which audible techniques can be described as observations or plausible hypotheses rather than confirmed production facts?
- How can the lab include a “cinematic metric-ambiguity” preset without claiming to reproduce proprietary source material exactly?

### Product and pedagogy

- What visual model best communicates local acceleration plus global closure?
- Should the primary visualization be a cylinder/torus, wrapped log-tempo strip, Penrose-stair analogy, or multiple linked views?
- Which controls are appropriate in Explore mode versus Inspect/Compose mode?
- What sequence of toggles best teaches the illusion: single layer, stacked layers, crossfade, wrap, subdivision changes, anchor, pitch coupling?

## Scope

### In scope

- rhythmic Risset/Shepard-like illusions;
- event-based and loop-based implementations;
- synthetic timbres/pulses;
- perceptual parameter studies;
- metric ambiguity and subdivision transformation;
- browser-ready reference algorithms;
- educational visualization and claim wording.

### Out of scope

- reproducing or distributing the soundtrack recording;
- a full analysis of the film score;
- arbitrary-source audio time stretching beyond requirements needed to compare implementations;
- proving a universal perceptual effect across all listeners.

## Source requirements

Prioritize:

1. original/primary papers by Shepard, Risset, and direct successors;
2. peer-reviewed psychoacoustics and music-perception studies;
3. official composer/production statements or score materials where legally accessible;
4. standards and official Web Audio documentation for implementation constraints;
5. reputable computational-music texts.

Public videos/blogs may identify hypotheses or implementation ideas but cannot establish production facts or psychoacoustic efficacy by themselves.

For every claim, record source, date, claim type, method, population/stimulus where applicable, and confidence.

## Method

1. Build a formal taxonomy of construction variants.
2. Derive the layer/phase/gain equations and invariants.
3. Implement a framework-independent reference generator.
4. Generate a parameter sweep of synthetic stimuli.
5. Measure objective properties: event density, gain/RMS profile, spectral centroid where relevant, reset discontinuity, CPU/event load.
6. Design a controlled listening protocol with baseline conditions.
7. Conduct at least an internal pilot or provide a runnable study harness specification if participant work is outside the run.
8. Translate evidence into defaults, bounds, presets, and warnings.
9. Produce proposed operator/preset versions and acceptance tests.

## Required deliverables

1. **Research report** with definitions, history, evidence, and limitations.
2. **Claim/evidence matrix** separating mathematical fact, perceptual evidence, public reconstruction, and product inference.
3. **Reference equations and pseudocode** for event-based and loop-based variants.
4. **Parameter recommendation matrix** with default, safe range, evidence/confidence, and expected perceptual effect.
5. **Synthetic stimulus generator specification** and versioned project fixtures.
6. **Listening-study protocol** including controls, randomization, measures, analysis plan, and accessibility/equipment notes.
7. **Visualization recommendation** with explanatory storyboard.
8. **Operator contract proposal** for `rhythm.risset` and any separate subdivision/metric operators.
9. **Automated acceptance tests**, including layer relabeling, gain bounds, event caps, and deterministic stimuli.
10. **ADR proposal** choosing the MVP construction.
11. **User-facing terminology and claim language**, with prohibited/overstated formulations.
12. **Open questions** and post-MVP research opportunities.

## Acceptance criteria

The run is accepted only when:

- primary sources support the formal definition and historical claims;
- public “Troy” analysis is clearly separated from confirmed production information;
- a reference implementation and deterministic fixtures are supplied;
- default parameter recommendations include evidence and uncertainty;
- gain/event-rate behavior is bounded across the permitted parameter space;
- the listening protocol includes meaningful controls and measurable outcomes;
- proposed UI explanations accurately distinguish local acceleration from global recurrence;
- engineering can implement the operator and tests without making unresolved scientific choices.

## Handoff

Update:

- `AGL-061`, `AGL-063`, `AGL-065`;
- `rhythm.risset` operator definition/version;
- Infinite Staircase presets and guided experiment;
- audio benchmark cases in DR-03;
- shared mapping vocabulary in DR-08;
- ADR for the selected construction.
