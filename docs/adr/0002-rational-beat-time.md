# ADR-0002 — Use Exact Rational Beats as Canonical Musical Time

**Status:** Accepted  
**Date:** 2026-08-13

## Context

The product manipulates thirds, tuplets, cyclic rhythms, recursive time scaling, tempo equivalence, and long loops. Floating-point beat positions accumulate representation error and can make mathematically identical operations diverge. Browser audio ultimately schedules in floating-point seconds, but that need not dictate the authoring model.

## Decision

Store canonical event starts, durations, clip boundaries, pattern intervals, and meter positions as normalized rational numbers using integer numerator/denominator.

Translate to seconds only through a versioned tempo-map function at render-plan creation. Seconds-to-beat conversion is explicitly approximate.

JSON stores rational integer components as decimal strings.

## Consequences

### Positive

- Exact cyclic and tuplet relationships.
- Stable equality, hashing, migration, and deterministic fixtures.
- No long-loop drift at the event-generation layer.
- Mathematical transformations remain algebraically meaningful.

### Negative

- BigInt/rational arithmetic is slower than primitive numbers.
- Serialization and worker boundaries require custom records.
- Extremely large denominators require normalization and practical limits.
- UI/audio code needs explicit conversions.

## Alternatives rejected

1. **Floating beat numbers** — simple but insufficient for exact repeated transforms.
2. **Integer ticks at a fixed PPQ** — exact only for rhythms whose denominators divide the selected resolution; high PPQ still cannot represent every recursive ratio cleanly.
3. **Seconds as canonical time** — incompatible with tempo-independent musical structure.

## Guardrails

- Normalize every rational.
- Define denominator/bit-size budgets for imported/generated values.
- Do not repeatedly convert between rational beats and seconds during transformations.
- Tempo interpolation semantics are versioned and tested.

## Validation

Sprint 0 tests exact arithmetic and drift-free repeated pattern queries. Future property tests and tempo-map round-trip tolerances are required.
