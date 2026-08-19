# ADR 0008 — Exact Time Domains and the Resolved Audio Plan Boundary

- **Status:** Accepted
- **Date:** 2026-08-18
- **Sources:** DR-01, DR-03, DR-12, DR-15

## Context

Musical/project time must remain exact. Some operators, especially Risset, generate event times involving logarithms that are not rational. Web Audio schedules seconds; native audio schedules sample/host time.

## Decision

Use three domains:

1. exact rational musical/source time in project and domain evaluation;
2. ideal floating-point seconds in one immutable backend-neutral `ResolvedAudioPlan`;
3. transient backend schedules in AudioContext seconds or integer sample frames.

Every audio event retains a temporal-origin record linking its seconds value to exact beat/source phase/analytic mapping.

Sample-frame quantization v1 for nonnegative times is:

\[
F_R(t)=\lfloor Rt+0.5\rfloor.
\]

The conversion version is recorded. Absolute times are converted independently; rounded deltas are never accumulated.

Real-time and offline paths consume the same plan and voice semantics. Cross-engine bit-identical PCM is not a product guarantee.

## Alternatives considered

- Force every rendered onset into rational time.
- Let each backend evaluate operators independently.
- Persist sample frames in projects.
- Use a library-specific transport as canonical time.

## Consequences

- Exactness is preserved where mathematically possible.
- Analytic operators fit without corrupting AGL rational time.
- Backend conformance can compare logical events before PCM.

## Risks

- Numerical profile and seconds-to-frame edge fixtures must remain stable.
- Plan size and incremental generation need budgets.
