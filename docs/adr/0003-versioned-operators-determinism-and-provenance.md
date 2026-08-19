# ADR-0003 — Version Operators and Make Determinism/Provenance First-Class

**Status:** Accepted  
**Date:** 2026-08-13

## Context

Generative music is difficult to reproduce when algorithms, random seeds, defaults, or mapping choices change. Educational explanations also fail if outputs cannot reveal how they were derived. A simple node graph without semantic versions and provenance is insufficient for saved projects and research fixtures.

## Decision

Every executable operator has:

- globally unique type;
- integer semantic implementation version;
- typed ports;
- declarative parameters/defaults/bounds;
- deterministic declaration;
- explicit seed input/context where needed;
- execution budgets;
- provenance formatter;
- migration strategy for parameter changes.

Canonical outputs include or reference provenance recording operator type/version, normalized parameters, input lineage, relevant mathematical state, and constraint decisions.

An output-semantic change for identical inputs requires a new operator version.

## Consequences

### Positive

- Projects remain reproducible.
- Research stimuli and golden fixtures are stable.
- “Why did this note happen?” can be answered.
- Cache keys and invalidation become principled.
- Multiple legacy operator versions can coexist for migration/rendering.

### Negative

- Operators require more metadata and maintenance.
- Provenance may consume significant storage.
- Bug fixes may need nuanced version decisions.
- The UI must present technical traces progressively.

## Alternatives rejected

1. **Use application version only** — too coarse to preserve mixed/legacy operator behavior.
2. **Always migrate to latest algorithms** — breaks deterministic reopening and research replication.
3. **Keep provenance only in logs** — logs are incomplete, ephemeral, and not linked to events.

## Guardrails

- Deduplicate provenance as a DAG for large projects.
- Support summary/full trace levels.
- Never hide seeded randomness inside a supposedly deterministic operator.
- Constraint modifications remain visible.

## Validation

- Same version/seed/input must produce identical canonical output fixtures.
- Project reopen tests pin operator versions.
- Selected events must resolve to a complete provenance chain.
