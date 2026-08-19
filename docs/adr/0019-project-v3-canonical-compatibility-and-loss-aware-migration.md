# ADR 0019 — Project v3 Canonical Compatibility and Loss-Aware Migration

- **Status:** Accepted; production repository and catalog-rebinding work open
- **Date:** 2026-08-18
- **Sources:** DR-08, DR-11, DR-12, DR-14, DR-15; FR-01 findings FR01-001, FR01-002, FR01-031, FR01-036
- **Supersedes/extends:** ADR 0007, ADR 0010, ADR 0011

## Context

Project v2 did not bind every result-affecting semantic version, operator contract, source recipe, materialization receipt, budget profile, or extension. The former migration path could preserve opaque legacy data while still presenting the target as a clean executable upgrade. Raw source bytes and canonical semantic identity also serve different purposes and must not be conflated.

## Decision

1. `agl.project` schema version 3 is the sole new-write project authority.
2. Project v3 declares the semantic contract, canonical encoding/digest, operator catalog, stable-ID, deterministic-generation, command, graph compiler, evaluation, tempo, render-plan, selection, package, budget, and required semantic-extension versions that affect execution.
3. Unknown fields fail closed in canonical v3 structures. Unknown result-affecting extensions are never ignored.
4. Every node pins operator type, semantic version, and operator semantic digest. Unsupported or ambiguous legacy references cannot be rebound by nearest version.
5. Canonical semantic digest includes all result-affecting state and excludes editorial/session-only fields such as modified timestamp, panel geometry, focus, hover, transport runtime, and device state.
6. Source recipes and materialization receipts bind producer/output, semantic dependency closure, environment/catalog/budget/numerical identity, seed stream, exact half-open range, artifact identity, and optional immutable graph snapshot.
7. v1/v2 migrations are sequential and deterministic, preserve the original source-byte digest independently from the normalized target semantic digest, and emit an immutable migration receipt with warnings, blocking losses, lineage, and review status.
8. A migration containing blocking semantic loss may be inspected and saved as quarantined legacy content but may not execute as a clean v3 project until explicitly reviewed/rebound.
9. Migration establishes a new active undo baseline. Durable entity and migration lineage is preserved; active historical undo envelopes are not silently translated across schema semantics.
10. Strict compatibility and hostile-input limits apply before compile/evaluate, including bounded IDs/text/collections, exact rational strings, duplicate ownership rejection, and required cross-reference integrity.

## Alternatives considered

- Extend v2 in place.
- Use application version as the only compatibility signal.
- Preserve unknown fields and let individual subsystems decide whether they matter.
- Automatically choose the closest installed operator version.
- Use only raw-byte hashes or only normalized semantic hashes.
- Claim a migration is complete because bytes were preserved opaquely.

## Consequences

- Older projects remain readable through migration/quarantine paths, while all new writes are explicit about execution semantics.
- Project files are more verbose, but they are inspectable and portable across TypeScript and Swift implementations.
- Production catalog rebinding, repository persistence, source-byte retention, and hostile corpus expansion remain implementation work.

## Risks

- A result-affecting field accidentally omitted from the semantic projection can create false digest equality.
- Legacy operator semantics may be unrecoverable without the original implementation or evidence corpus.
- Very large integer/string payloads require bounded validation before canonicalization.

## Regression evidence

- Project-v3 JSON Schema and runtime differential validation.
- Semantic digest excludes editorial timestamp but changes for execution state.
- Duplicate ownership/material-kind and unknown-field negative cases.
- v1/v2→v3 loss-aware migration receipt and source/target digest fixtures.
- Swift project-v3 decode fixture.
