# ADR 0014 — Canonical Risset Rhythm v1

- **Status:** Accepted with perceptual validation gate
- **Date:** 2026-08-18
- **Sources:** DR-01, DR-08

## Context

The Infinite Staircase is P0. The completed report and its packet conflict on envelope normalization because the packet did not have the report body. Optional metric, subdivision, anchor, and pitch effects risk becoming hidden parts of the core definition.

## Decision

`rhythm.risset@1` is the classical 2:1 tempo-octave construction. Other ratios use generalized barberpole-tempo terminology.

Core owns logarithmic rate, analytic unwrapped source phase, direction, envelope, normalization, event identity, and provenance. Optional subdivision shedding, metric ambiguity, anchor, and pitch coupling are separate bypassable stages.

Canonical MVP preset:

- ratio 2;
- cycle 20 s;
- reference 120 BPM;
- raised-cosine linear-partition envelope;
- half-width B=2;
- fixed synthetic pulse;
- optional stages off.

An L2/equal-power mode is retained as a comparison, never labeled constant loudness. Event times are generated analytically and intervals are half-open. Event identity excludes renderer slots and scheduler chunks.

## Alternatives considered

- Monolithic cinematic preset.
- Fixed scientific layer count.
- Power-normalized envelope as the sole default.
- Loop-rate audio as normative stimulus.

## Consequences

- Mathematical closure and chunk invariance are testable.
- The current Sprint-0 player remains a preview adapter until migrated to analytic events.
- Perceptual defaults remain provisional until the listening gate.

## Risks

- Synthetic reference may be less musically dramatic.
- Existing prototype parameters need migration/labeling.
