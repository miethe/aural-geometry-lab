# ADR 0018 — Performance, Numerical Profiles, and Shared-Core Evidence Gates

- **Status:** Accepted; numeric thresholds provisional
- **Date:** 2026-08-18
- **Sources:** DR-03, DR-09, DR-12, DR-15

## Context

Wave 1 provides architecture and benchmark designs, but not physical cross-browser or iPad results. Floating-point workloads can be profile-equivalent without being bit-identical, and insignificant differences cannot safely control persistent branches.

## Decision

Performance and support limits remain benchmark profiles until executed on declared environments. Conformance precedes timing.

Operators declare conformance class:

- `exact`;
- `profileNumeric`;
- `renderOnly`.

Floating-point thresholds/quantizers/event creation/topology/stable-ID branches require canonical pre-branch rounding, exact/fixed-point representation, one canonical implementation, or persistence of the branch decision.

A shared-core bakeoff begins only after accepted semantic readiness and a material problem. Optional kernels are coarse-grained pure request/result services; host runtimes keep graph orchestration, commands, cache, scheduling, and project mutation. Domain cores never run in an audio callback.

## Alternatives considered

- Optimize by language choice before workload measurement.
- Universal raw-float cache identity.
- Bit-identical floating trajectories as an unstated assumption.

## Consequences

- Benchmarks can tune thresholds without rewriting semantics.
- Raw numerical cache entries may include backend/profile identity.
- Systems-language adoption remains reversible and evidence based.

## Risks

- Provisional thresholds can become folklore unless clearly labeled.
- Numerical-profile work remains a gate for chaos and some geometry transforms.
