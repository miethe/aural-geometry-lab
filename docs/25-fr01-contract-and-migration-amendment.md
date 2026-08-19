# FR-01 Contract and Migration Amendment — v0.4

## Purpose

This document defines how the v0.3 Wave-1 repository transitions to the FR-01-hardened v0.4 contract baseline. It is normative for new writes, migrations, adapters, caches, exports, and cross-platform conformance.

## Authority order

1. Mathematical and standards invariants.
2. Accepted FR-01 ADRs 0019–0024 and the findings register.
3. Versioned schemas and language-neutral fixtures.
4. Hardened reference implementation behavior.
5. Wave-1 research, provisional defaults, and UI presentation.

## Current new-write contracts

| Contract | Write version | Compatibility rule |
|---|---:|---|
| project | 3 | Must validate against `schemas/agl-project-v3.schema.json` and its runtime contract before use |
| migration-receipt | 2 | Must validate against `schemas/agl-migration-receipt-v2.schema.json` and its runtime contract before use |
| semantic-command | 2 | Must validate against `schemas/agl-command-v2.schema.json` and its runtime contract before use |
| evaluation-request | 2 | Must validate against `schemas/agl-evaluation-request-v2.schema.json` and its runtime contract before use |
| resolved-audio-plan | 2 | Must validate against `schemas/agl-resolved-audio-plan-v2.schema.json` and its runtime contract before use |
| audio-schedule-binding | 1 | Must validate against `schemas/agl-audio-schedule-binding-v1.schema.json` and its runtime contract before use |
| logical-package | 2 | Must validate against `schemas/agl-package-manifest-v2.schema.json` and its runtime contract before use |
| export-manifest | 1 | Must validate against `schemas/agl-export-manifest-v1.schema.json` and its runtime contract before use |
| accessibility-mirror | 1 | Must validate against `schemas/agl-accessibility-mirror-v1.schema.json` and its runtime contract before use |
| mapping-trace | 1 | Must validate against `schemas/agl-mapping-trace-v1.schema.json` and its runtime contract before use |
| claim-register | 1 | Must validate against `schemas/agl-claim-register-v1.schema.json` and its runtime contract before use |

## Migration-only contracts

| Contract | Version | Rule |
|---|---:|---|
| project | 1 | prototype read/migration source only |
| project | 2 | Wave-1 read/migration source only |
| semantic-command | 1 | incompatible grammar/inverse semantics; no new writes |
| resolved-audio-plan | 1 | mixed runtime ownership; no new writes |
| logical-package | 1 | insufficient hostile-member semantics; no new writes |
| stable-id | 1 | collision-prone and ambiguous; existing legacy identities only |
| prng | 1 | fork depends on mutable draw state; legacy replay only |
| selection-identity | 1 | projection-coupled; legacy UI/session compatibility only |

## Trust-boundary rule

Authoritative JSON/package input is processed in this order:

```text
bounded member enumeration
  → portable path/link/type/compression checks
  → measured bytes and SHA-256
  → strict UTF-8 JSON (no duplicate keys/unsafe integers/malformed Unicode)
  → public JSON Schema
  → runtime semantic/cross-reference validation
  → compatibility and migration decision
  → compile/evaluate only if executable
```

Ordinary `JSON.parse`/`JSONDecoder` is not sufficient as the native or archive trust boundary unless a strict byte-level preflight has already established equivalent semantics.

## Project migration states

| State | Read | Save | Execute | Required action |
|---|---:|---:|---:|---|
| Canonical v3, fully compatible | Yes | v3 | Yes | Normal validation/compile |
| Legacy v1/v2 with no blocking loss | Yes | v3 + receipt | After migration validation | Preserve source bytes/hash and lineage |
| Legacy with ambiguous operator/catalog binding | Yes | Quarantined v3 | No | Explicit sealed-catalog rebinding/review |
| Unknown required semantic extension | Preserve | No canonical rewrite | No | Install supported contract or explicit migration |
| Hostile/ambiguous bytes | No | No | No | Reject before extraction/execution |

## Subsystem transition rules

### Project and migration

- New files are project v3 only.
- Source-byte digest and semantic digest are distinct.
- Unknown required semantics fail closed.
- Migration receipts disclose all losses; blocking losses prevent clean execution.

### Commands and history

- New mutations use command v2.
- v1 envelopes are not replayed as v2.
- Migration creates a new active undo baseline.
- UI/native history systems adapt to AGL transaction history.

### IDs, randomness, and time

- New entities use stable-ID v2 and named PRNG v2 streams.
- Legacy IDs/streams remain scoped to legacy replay/migration.
- Exact rational wire values use decimal strings.
- Approximate `number` conversion is explicit and never silently enters exact identity/time.

### Operators and graph

- Nodes bind operator type/version/semantic digest.
- Catalogs seal before compile/evaluate.
- UI/import/native graph legality uses the compiler compatibility service.
- Operator implementation behavior must eventually be bound by AGL-189 receipts.

### Evaluation and caches

- Current publication requires epoch/scope/channel/generation and semantic hashes.
- Cancellation never establishes freshness.
- Exact and profile-numeric cache namespaces remain distinct.
- Worker result determinism class cannot override host/catalog authority.

### Audio

- ResolvedAudioPlan v2 contains immutable project-timeline intent.
- Generation/transport/backend epochs live in schedule-binding v1.
- Realtime and offline use the same plan semantics.
- Existing direct schedulers are prototype-only until AGL-177/178 close.

### Generated material and selection

- Direct edits resolve to generator edit, downstream transform/exception, fork, or materialize.
- Materialization is source-hash guarded prepare/commit.
- Semantic selection never incorporates projection path.
- Missing generated references become orphans; nearest-neighbor retargeting is prohibited.

### Package and export

- Package manifest v2 and strict JSON are required at trust boundaries.
- Export completion requires verification against actual bytes.
- MIDI/MusicXML are finite/loss-aware realizations, not project serialization.

### Accessibility and claims

- Every surface projects the same semantic accessibility mirror and command IDs.
- Drag-only and color-only core semantics are prohibited.
- Product/scientific copy must resolve through claim-register v1 and trusted evidence gates.

## Cross-platform rule

TypeScript is the executable reference during stabilization, but accepted contracts and fixtures outrank implementation accidents. Swift implements the bounded native subset and must pass the shared corpus. Production native import additionally remains blocked by AGL-191 until strict JSON/package parity is demonstrated.

## Versioning rule

No public contract is reinterpreted in place. A semantic change requires one of:

- a compatible additive change already allowed by the current contract;
- a new contract/operator/digest/profile version plus migration;
- an implementation fix that restores the already specified semantics, with regression evidence;
- or explicit quarantine when meaning cannot be recovered.

## Architecture-freeze gates

- AGL-172–176: project/commands/compiler/evaluator production spine.
- AGL-177–178: audio plan/backends and physical benchmark matrix.
- AGL-179/191: hostile package and native strict JSON parity.
- AGL-189: implementation-conformance receipts.
- AGL-190: streaming digest and fragmented plan/export.
- AGL-170: profile-numeric conformance.

## Verification

`npm run check:all` is the release-grade local gate. Contract/schema/fixture changes must update `program/fr01-contract-manifest.json` SHA-256 receipts and maintain clean-extraction validation.
