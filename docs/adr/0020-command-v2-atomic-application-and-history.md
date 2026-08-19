# ADR 0020 — Command v2 Atomic Application, Inverses, and History

- **Status:** Accepted; production command handlers and durable history store open
- **Date:** 2026-08-18
- **Sources:** DR-11, DR-12, DR-14; FR-01 findings FR01-003, FR01-012, FR01-013, FR01-015, FR01-016, FR01-037
- **Supersedes/extends:** ADR 0010, ADR 0011

## Context

The former command-v1 JSON Schema and TypeScript envelope described incompatible grammars. UI-provided inverse payloads, mutation-before-validation, time-only coalescing, and replaying stale historical envelopes could produce partial state, invalid undo, or web/native divergence. Generated/frozen material also requires multi-resource prepare/commit behavior rather than ordinary field mutation.

## Decision

1. `agl.command` schema version 2 is the sole new-write semantic-command envelope.
2. Every document mutation is a validated semantic command inside one atomic transaction. UI frameworks, accessibility adapters, MIDI mappings, and native controls submit intent; they do not mutate canonical state directly.
3. Command application validates envelope, payload, canonical field paths, target/write sets, actor sequence, epoch/revision metadata, and fine-grained preconditions before applying to an isolated clone or equivalent transactional structure.
4. The core derives forward/inverse canonical commands from validated pre-state. Caller-supplied inverses are never authoritative.
5. A successful transaction commits once. A failure leaves the authoritative object graph, revision, history, and derived generations unchanged. Custom clone strategies must prove deep independence from pre-state and final-state aliasing.
6. Global revision is ordering/diagnostic metadata, not the only concurrency guard. Commands use exact entity/field/input preconditions so unrelated concurrent edits do not force false conflicts.
7. Continuous interaction follows `begin → preview* → commit | cancel`. Preview is noncanonical and nonhistorical. A canonical no-op creates no revision, history item, redo invalidation, autosave, or committed evaluation generation.
8. Coalescing requires the same explicit edit session, logical action, target set, and write set. Elapsed time alone is never sufficient.
9. Graph rewires, operator insertion, generator fork, and materialization commit are atomic semantic operations; intermediate invalid topology never enters the project.
10. MVP history is linear at transaction granularity. Undo/redo re-envelops immutable forward/inverse templates against the current epoch/revision with new command/transaction IDs. History pointers move only after replay succeeds.
11. New committed user work after Undo clears Redo. Platform `UndoManager` or React-local history is an adapter to this authority, not a second semantic stack.
12. Materialization and external-asset changes use prepare/validate/commit. The commit verifies unchanged source recipe/dependency/environment/catalog/budget/seed/range/artifact identity before atomically adding the artifact and project references.

## Alternatives considered

- Framework-local reducers or native undo as authority.
- One command per pointer event.
- Snapshot-only undo.
- Caller-generated inverse payloads.
- Time-window merging.
- Disconnect then reconnect as separate graph edits.
- Committing prepared materialization without rechecking source identity.

## Consequences

- Web and native can share model-based history fixtures.
- Production handlers require exact apply/inverse definitions and conflict tests.
- Asset preparation is asynchronous, but project commitment remains deterministic and atomic.

## Risks

- Clone-first reference behavior may need persistent data structures/copy-on-write at scale.
- Field-path semantics must be versioned through schema migrations.
- Durable crash-recovery history is separate work and must not reinterpret command meaning.

## Regression evidence

- Command-v2 schema/runtime field-path and timestamp parity.
- Atomic failure, custom deep-clone isolation, generated inverse, stale-precondition, no-op, coalescing, multi-level undo/redo, and failed-replay preservation tests.
- Hash-guarded materialization prepare/commit tests.
