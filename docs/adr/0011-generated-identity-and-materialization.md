# ADR 0011 — Generated Identity, Material Kinds, and Materialization

- **Status:** Accepted
- **Date:** 2026-08-18
- **Sources:** DR-09, DR-11, DR-14

## Context

Most AGL labs generate events or geometry. Direct mutation of a projection makes it unclear whether the user changed a rule, added an exception, created a variant, or authored a snapshot.

## Decision

Every generator declares output identity capability:

- `stable`;
- `successorMapped`;
- `ephemeral`.

Missing generated identities never retarget by proximity.

Generated edits are explicit:

1. edit generator;
2. downstream transform/sparse exception;
3. fork generator;
4. materialize bounded output;
5. cancel.

Material records separate `MaterialKind` (`UserAuthored`, `LiveGenerated`, `Snapshot`, `EditedDerivative`) from derived `SourceStatus` (`NotApplicable`, `Current`, `Changed`, `Missing`, `Detached`).

Materialization is prepare-then-commit over an exact half-open interval. Commit requires unchanged dependency digest and creates a content-addressed artifact plus immutable receipt/source recipe. Upstream changes never silently mutate snapshots.

## Alternatives considered

- In-place generated edits.
- Auto-freeze on edit.
- Flat generated/frozen/stale enum.
- Hash-only lineage.

## Consequences

- Strong provenance and predictable regeneration.
- Sparse exceptions are capability-gated.
- Re-materialization produces an explicit successor.

## Risks

- Source recipes can increase package size.
- Stable identity promises require per-operator proof.
