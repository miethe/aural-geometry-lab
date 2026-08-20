# ADR 0025 — Project Import Dispositions, Byte-Recoverable Migration, and Legacy Operator Rebinding

- **Status:** Proposed by FR-02; acceptance required before AGL-172/173 implementation
- **Date:** 2026-08-19
- **Sources:** FR-02 evidence bundle at commit `352f103`; ADRs 0019–0024; FR01-002, FR01-007, FR01-031, FR01-032, FR01-036; FR02-001–016
- **Extends:** ADR 0019, ADR 0021, ADR 0023, ADR 0024
- **Project schema impact:** none; project v3 remains the new-write schema

## Context

Project v3 already has a closed core, a versioned extension collection, explicit required semantic extensions, catalog and budget identity, exact Rational wire values, and source/materialization lineage. The remaining risk is not representational capacity. It is the open workflow around future data, legacy semantic ambiguity, exact source-byte recovery, package asset closure, and cross-language trust-boundary parity.

The current v2→v3 reference migration also demonstrates why the workflow must fail closed: it can retain the v2-only `affectsResult` field, use incompatible placeholder formulas for node and catalog digests, change PRNG/stable-ID semantics without a dedicated blocking loss, and issue a receipt before proving the target is valid.

## Decision

1. Every import produces exactly one disposition: `accept`, `accept-with-loss`, `quarantine`, or `refuse`.
2. `refuse` is reserved for hostile, malformed, ambiguous, over-limit, integrity-failing, or falsely versioned bytes. Refused bytes are never decoded into a project object and are never saved as canonical AGL content.
3. `quarantine` is a read-only repository/package state outside the project schema. Quarantined content may expose bounded metadata and raw-source export, but may not compile, evaluate, schedule audio, materialize, export semantic results, or be canonically rewritten.
4. A claimed project-v3 object remains closed. Unknown fields in v3 core objects are refused. Future optional data is portable only through `extensions[]`; readers never strip, guess, or auto-move an unknown core field into an extension.
5. An unknown extension with `affectsSemantics:false` is preserved structurally and may be opened. An unknown extension with `affectsSemantics:true`, or any contract listed by `requiredSemanticExtensions` that the reader lacks, quarantines the entire project.
6. A future project schema version is strict-JSON preflighted, retained byte-for-byte in quarantine, and not down-converted. Safe header metadata may be shown only after bounded parsing that does not reinterpret the future schema.
7. Legacy migration is sequential only. Each edge validates its source and target, emits an ordered edge record, accumulates losses monotonically, and may not downgrade a blocking loss. A composed v1→v3 migration is exactly v1→v2 followed by v2→v3.
8. Persistent migration is transactional and non-destructive. It creates a new save generation and a new undo baseline. The original source bytes remain immutable; command history is not translated across schema semantics.
9. Migration receipt v2 is the audit authority but not the byte store. For every persisted migration, `sourceBytesDigest` is mandatory under the FR-02 profile and must resolve to measured source bytes retained under content address `assets/<hex>.project.json` with media type `application/vnd.auralgeometrylab.project+json`. The receipt itself is stored under `migration-receipts/<receipt-byte-sha256>.json`.
10. Rollback means restoring the exact retained source bytes as a new active save generation after re-verifying their hash and source contract. It is not an inverse transformation of the target. Partial-hop rollback is unavailable unless that intermediate version's exact bytes were also retained.
11. Legacy operator references are never executed from synthetic digests and are never rebound to the nearest installed version. Rebinding is atomic across the graph against one sealed catalog; every node must match an explicitly selected type, version, semantic digest, parameter contract, and port contract.
12. The original migration receipt is immutable. A later `agl.operator-rebinding-receipt` v1 resolves named blocking loss codes by reference to the migration ID and source-byte digest. The resolved project contains actual catalog/node digests and a semantic `agl.migration.operator-rebinding@v1` extension. Unresolved nodes or lineage keep the project quarantined.
13. No rebinding operation rewrites frozen artifact bytes or claims regenerated equivalence. Snapshot lineage retains the historical source recipe/digests. If its historical execution environment cannot be proven, the snapshot remains playable only from its verified artifact and is not regenerable.
14. Project asset IDs are logical references; bytes are addressed by SHA-256. In a complete package, every project asset has one measured content-addressed member whose path stem, manifest SHA, project digest, bytes, and media type agree. Multiple logical asset IDs may share one blob only when digest/bytes/media type agree. Every package `role:asset` member must be reachable either from project asset metadata or from an accepted receipt by exact digest; arbitrary orphan support blobs are refused.
15. `payloadAssetId` is the portable v3 payload address. `payloadRef` is local/migration-only unless a required semantic extension defines the resolver and integrity contract; otherwise it quarantines any material that depends on it.
16. `presentation.defaultLab` and graph layout are nonsemantic hints. An unavailable lab falls back to the neutral studio and produces `accept-with-loss`; result-affecting preset state must be compiled into graph/material state or a required semantic extension.
17. Canonical v1 performs no Unicode normalization. It rejects malformed scalar sequences, sorts object keys by UTF-8 bytes, and hashes the exact Unicode scalar sequence. NFC and NFD strings are therefore distinct semantic inputs when the field is semantic.
18. TypeScript and Swift consume the identical raw corpus. Native DTO decoding occurs only after an `agl-strict-json-v1`-equivalent byte preflight has rejected duplicate names, unsafe integer literals, malformed UTF-8/Unicode, trailing data, and boundedness violations.
19. A project may execute only after strict bytes, schema, runtime/cross-reference, compatibility, operator-catalog, asset-closure, and unresolved-loss checks all pass. A pass in one layer never substitutes for another.
20. Project v3 is frozen as-is once the FR-02 gates are implemented. These decisions do not authorize editing the v3 schema in place.

## Rebinding receipt minimum fields

A v1 receipt contains: schema/version/policy; receipt ID and canonical digest; referenced migration ID; source-byte digest; target sealed-catalog digest; one binding per legacy node (node ID, legacy type/version, selected type/version/digest, parameter/port validation result); resolved loss codes; reviewer identity/time/basis; and evidence digests. Cryptographic signature syntax remains **unverified** because the repository contains no accepted key/trust contract; content addressing and immutable review identity are mandatory now, and a future signing contract must be separately versioned.

## Alternatives rejected

- Mutate project v3 to allow arbitrary unknown fields.
- Silently discard unknown fields or future schema data.
- Treat a canonical semantic digest as source-byte recovery.
- Store only a source hash without source bytes.
- Auto-select the nearest operator version.
- Rewrite frozen lineage during rebinding.
- Let Foundation `JSONDecoder` or ordinary `JSON.parse` define the trust boundary.
- Introduce project v4 solely to encode quarantine or recovery workflow state.

## Consequences

- Five-year compatibility is conservative: data survives even when execution cannot.
- Quarantine/recovery lives in repository/package orchestration, avoiding project-v4 churn.
- Migration implementations become more explicit and may require user review more often.
- Packages carry exact legacy bytes and receipts when recovery is promised.
- Native import remains gated by AGL-191 until strict-byte parity passes.

## Risks and open gates

- Source blobs can increase package size; deduplicate by digest and allow explicit user removal only after warning that rollback will be lost.
- A human rebind can still choose semantically different behavior. The receipt records the decision; it does not prove historical equivalence.
- A cryptographic signing/trust model is not present and must not be invented implicitly.
- External/remote assets are not supported by project v3; adding them would require a new addressing contract and may change the freeze verdict.

## Regression evidence required

- `conformance/fr02/corpus.json` and exact error identities.
- `tests/fr02.test.mjs`, including target-validation, migration composition, loss monotonicity, asset closure, and source-byte recovery properties.
- `conformance/fr02/native-parity-cases.json` in TypeScript and the byte-identical Swift fixture copy.
- Valid package fixtures for asset closure and migration recovery.
