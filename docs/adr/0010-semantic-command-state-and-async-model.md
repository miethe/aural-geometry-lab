# ADR 0010 — Semantic Commands, Stratified State, and Async Acceptance

- **Status:** Accepted
- **Date:** 2026-08-18
- **Sources:** DR-11, DR-12, DR-14, DR-15

## Context

Canvas, graph, timeline, inspector, React, and Swift must observe one project meaning. High-frequency gestures and asynchronous evaluation cannot become project history or overwrite current state out of order.

## Decision

Maintain distinct state strata: authoritative project, presentation/session, preview, temporary override, derived/cache, runtime/audio, history, and durable lineage.

Direct manipulation uses `begin → preview* → commit/cancel`. Preview never mutates canonical project/history. A gesture creates zero or one transaction.

Commands include project epoch, command/transaction/logical-action IDs, actor/origin, payload versions, canonical target/write sets, and fine-grained preconditions. The core validates and derives inverses from pre-state. Coalescing requires the same explicit edit session and compatible target/write sets; elapsed time alone is insufficient.

Derived requests include project epoch, scope, channel, generation, input digest, semantic-environment digest, and request ID. Publication requires all dimensions and integrity to match. Cancellation is resource control, not freshness proof.

## Alternatives considered

- One global store for all state.
- Every pointer sample as a command.
- UI/framework-owned undo.
- Global revision as the only async or commit precondition.

## Consequences

- Web/native behavior can conform.
- Preview audio and geometry remain responsive without history explosion.
- Worker and command protocols become more explicit.

## Risks

- More coordinator code.
- Adapters can still bypass the command bus unless module boundaries enforce it.
