# ADR 0012 — Browser Audio Runtime, Scheduling, and Generation Cutover

- **Status:** Accepted with empirical threshold gates
- **Date:** 2026-08-18
- **Sources:** DR-03, DR-14, DR-15

## Context

JavaScript timers are not musical clocks. Web Audio APIs are split between Window control objects and the rendering-side AudioWorklet. Live edits need deterministic semantics for already scheduled and already emitted audio.

## Decision

- Worker evaluates graphs and expands immutable plans.
- Main thread owns AudioContext, native graph construction, and look-ahead scheduling.
- AudioWorklet owns bounded custom DSP and dense/sample-frame event dispatch only.
- MessagePort batched messages are baseline; SharedArrayBuffer is optional.
- One-shot source nodes are disposable; assets and buses are reusable.

Start benchmarking at 25 ms wake / 100 ms horizon, adapt from observed jitter, and cap provisionally at 250 ms.

Every plan revision has a generation ID and future cutover time/frame. Superseded future events are stopped, gated, or ignored. Already emitted audio is immutable history. Runtime distinguishes last-valid, candidate, armed, active, and error/muted states.

## Alternatives considered

- Timer callbacks at event onset.
- Entire song pre-scheduling.
- Project graph evaluation in AudioWorklet.
- Mandatory SharedArrayBuffer.

## Consequences

- Timing survives ordinary UI jitter.
- Edit responsiveness and scheduling robustness are explicit tradeoffs.
- Browser benchmarks tune thresholds without changing architecture.

## Risks

- Main-thread native-node creation remains vulnerable to severe blocking.
- Voice tails and crossfade policy require per-voice declarations.
