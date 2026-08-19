# ADR 0024 — Evaluation Protocol v2, Deterministic Graph Compilation, and Cross-Platform Conformance

- **Status:** Accepted; worker/runtime and numerical-profile implementation open
- **Date:** 2026-08-18
- **Sources:** DR-08, DR-09, DR-12, DR-14, DR-15; FR-01 findings FR01-006, FR01-010, FR01-011, FR01-017, FR01-023, FR01-024, FR01-030, FR01-035, FR01-038, FR01-043, FR01-044, FR01-045, FR01-048
- **Supersedes/extends:** ADR 0006, ADR 0009, ADR 0010, ADR 0018

## Context

A shared operator catalog is insufficient if definitions mutate, graph UI/compiler use different compatibility rules, async workers publish stale results, or Swift and TypeScript reproduce only a subset of identity/random/project behavior. Exact and floating results also require different cache/conformance policies.

## Decision

1. Operator definitions are deep-frozen, versioned, parameter-validated, and content-digested. A sealed catalog has one catalog digest.
2. A project v3 node binds type/version to the exact operator semantic digest. Compatibility is explicit; nearest-version execution is forbidden.
3. One deterministic graph compiler validates node definitions/parameters, port types and complete dimension semantics (value kind, measurement model, unit, domain bounds/period/categories, missing-value policy), cardinality, required inputs, dependency kinds, cycles, and ordering. UI/import/native adapters call the same compatibility service.
4. Dataflow/control/reference dependencies that affect results enter dependency closure; provenance-only relationships remain distinguishable.
5. `agl.evaluation.request/result` v2 identifies project epoch, scope, channel (`committed`, `preview`, `override`, `export`, `materialization`), generation, request, input/environment/catalog/budget/numerical/cache namespace, worker attempt, and payload digest.
6. Current publication requires exact match to desired identity and valid result integrity. Determinism/conformance class is host-owned from the sealed catalog; a worker result may echo but may not promote its own class. Cancellation is best-effort resource control only.
7. A stale deterministic exact result may be cache-only. It never becomes current unless a fresh request desires the same semantic identity.
8. Evaluation budgets are versioned and preflight work/events/recursion/iterations/geometry/memory/deadline. Cooperative cancellation has bounded polling/yield; unresponsive disposable workers may be terminated after deadline.
9. Generated operators declare `stable`, `successorMapped`, or `ephemeral` identity with key schema/version. Persistent selection/exceptions are capability-gated.
10. Cross-platform authority is conformance-first: schemas, canonical algorithms, fixtures, migrations, and behavioral contracts are shared; TypeScript remains reference during stabilization; Swift implements required capabilities.
11. Shared executable kernels are optional, coarse-grained, pure request/result services only after performance or duplicated-semantics evidence gates pass.
12. Exact outputs require exact equality. Profile-numeric outputs require an explicit numerical profile, backend/execution provenance, and cache policy. Raw floats never control persistent identity/topology without a canonical decision seam.
13. JSON Schema/runtime/TypeScript/Swift fixture drift fails `check:all`.
14. A semantic digest proves the declared operator contract, not executable-code identity. Every released operator implementation requires a conformance receipt binding evaluator build identity to accepted golden/property fixtures.
15. Custom transaction clone functions and worker payloads are untrusted extension seams: clone results must be deeply independent, and worker output cannot redefine host identity, determinism class, or cache policy.

## Alternatives considered

- Mutable operator registry and type/version only.
- Generic node canvas validation independent from compiler.
- Revision-only or cancellation-only result acceptance.
- Backend-independent cache for all floating results.
- Production JavaScriptCore or immediate full Rust core.
- Per-event/object FFI.

## Consequences

- Autonomous agents can implement workers, UI, and native adapters against one contract.
- Catalog/graph/worker protocol changes require version bumps and fixtures.
- Cross-language duplicated implementation remains but is constrained by shared vectors.
- Numerical-profile work remains a prerequisite for chaos and some geometry-derived decisions.

## Risks

- Canonical fixtures can accidentally encode a reference bug; independent mathematical oracles remain necessary.
- Hashing large dependency closures can become expensive without incremental design.
- Strict identity capability can limit direct edits until each lab proves correspondence.
- Hard worker termination discards local caches and does not constitute graceful cancellation.

## Evidence

DR-08 requires typed causality/mapping/provenance semantics. DR-14 requires generation/hash-gated async results and explicit generated identity. DR-15 recommends conformance-first selective cores and host-owned orchestration. DR-09 requires exact geometry/oracles rather than shared implementation alone. FR-01 added executable compiler, protocol, schema, TypeScript/Swift vectors, and drift validation.

## Confidence

Very high for the architecture. Worker integration, per-operator identity proofs, and numerical profiles remain owned by AGL-175/176/159/170/182.

## Open implementation gates

- AGL-175/176 own the production compiler, worker protocol, cache, and hard-cancellation runtime.
- AGL-189 owns operator implementation-conformance receipts and semantic-version enforcement.
- AGL-170 owns the profile-numeric policy for chaos and other floating workloads.
