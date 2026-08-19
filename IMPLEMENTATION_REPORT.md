# Aural Geometry Lab — FR-01 Hardened Implementation Report

**Build:** 0.4.0  
**As of:** 2026-08-18  
**Result:** Wave-1 research integrated, then repository-wide adversarial architecture hardening completed with versioned repairs, executable invariants, and owned residual risk

## 1. Executive result

FR-01 reviewed Aural Geometry Lab as one concurrent implementation system rather than as independent documents or modules. The review attacked public file formats, versioned operators, exact timing, deterministic identity, graph legality, asynchronous acceptance, semantic history, generated material, audio ownership, export fidelity, browser/native parity, accessibility mirrors, and research-gated claims.

The review registered **51 findings**:

| Severity | Count |
|---|---:|
| Critical | 9 |
| High | 37 |
| Medium | 5 |
| Total | 51 |

Disposition:

- **33** are fixed or contract-hardened in the v0.4 foundation;
- **18** retain production/integration work, each with a backlog item and workstream owner;
- no unresolved Critical/High finding lacks ownership.

The detailed issue records—including failure scenario, affected contracts, repair, regression test, ADR, version change, and owner—are in [`program/fr01-findings-register.json`](program/fr01-findings-register.json) and [`docs/24-fr01-whole-system-adversarial-repository-review.md`](docs/24-fr01-whole-system-adversarial-repository-review.md).

## 2. Architecture corrections

### 2.1 Project compatibility and migration

New project writes now target **project v3**.

Project v3 adds:

- explicit semantic-contract, canonical-encoding, stable-ID, PRNG, operator-catalog, graph-compiler, budget, and quantization versions;
- strict unknown-field and hostile-size limits;
- canonical semantic digesting separated from source-byte identity and editorial metadata;
- operator semantic digests on graph nodes;
- source recipes and immutable materialization receipts;
- source/material cross-record validation;
- semantic extensions with explicit compatibility handling.

Legacy v1/v2 readers remain migration-only. Migration receipt v2 records source/target digests, applied steps, blocking/warning losses, original-byte digest where available, and mandatory user review. Missing historical operator semantics are quarantined rather than silently rebound.

### 2.2 Canonical identity and deterministic generation

The release adds:

- `agl-canonical-value-v1`: typed, ordered, cycle-safe canonical encoding;
- `sha256-canonical-v1`: bounded SHA-256 semantic digests;
- `agl-stable-id-v2`: bounded cryptographic identity over unambiguous canonical tuples;
- `agl-prng-v2`: named deterministic streams derived from immutable root seed and stream path;
- strict JSON parsing that rejects duplicate keys, invalid Unicode, unsafe integer literals, and invalid UTF-8.

Stable-ID v1 and PRNG v1 remain replay-only because their collision and mutable-fork semantics are unsuitable for new persistent identity.

### 2.3 Exact time and tempo

The timing authority is now explicit:

```text
exact rational beats/source phase
        ↓
versioned analytic tempo resolution
        ↓
ideal floating-point seconds
        ↓
absolute endpoint sample-frame quantization
```

`agl-tempo-map-v1` analytically integrates step or linear-BPM-over-beat segments. It rejects ambiguous terminal linear segments and unsafe/nonpositive tempo states.

`seconds-to-frame-v1` quantizes each absolute event start and end once:

```text
frame(t) = floor(sampleRate × t + 0.5)
```

Duration is then `endFrame - startFrame`; independently rounded duration deltas are prohibited.

### 2.4 Operator and graph authority

The operator registry now:

- deep-freezes definitions;
- seals before execution;
- validates parameter values and null/unknown behavior;
- computes semantic digests that exclude editorial labels but include behavior;
- computes a sealed catalog digest;
- declares temporal, identity, conformance, budget, and provenance semantics.

Graph compiler v2 is the shared legality authority for UI preview, commit, import, and evaluation. It validates operator digest/version, ports, full dimension semantics, cardinality, duplicate semantic edges, dependency classes, and cycles, then emits deterministic order and dependency closure.

### 2.5 Semantic commands and history

Command v2 replaces two incompatible command grammars.

The core now provides:

- one versioned envelope and canonical field-path vocabulary;
- clone-first atomic transaction application;
- core-generated and core-validated inverses;
- fine-grained preconditions for stale/rebase behavior;
- one explicit edit-session boundary for coalescing;
- no-op suppression;
- linear semantic undo/redo with monotonic project revisions;
- history movement only after replay succeeds.

Surface/framework callbacks remain adapters and cannot define project mutation or inverse meaning.

### 2.6 Pattern and evaluation safety

Interval-query patterns now preflight event budgets before expansion, include long events that began in prior loop cycles but overlap the query, and enforce half-open interval semantics for point events.

Evaluation protocol v2 carries:

- project epoch;
- scope and channel;
- generation and request identity;
- input and semantic-environment digests;
- operator-catalog, budget-profile, numerical-profile, and cache namespace identity;
- worker attempt/instance metadata;
- monotonic progress and payload-integrity checks.

Cancellation is resource control only. Publication requires current epoch/scope/channel/generation and matching semantic hashes. Worker determinism/conformance class is host-owned from the sealed catalog and cannot be self-promoted by result payloads. Stale deterministic results may be cache-only where their conformance class permits it.

### 2.7 Generated material and cross-surface selection

Material origin and source status remain separate axes. `Unresolved` is distinct from `Missing`; lack of evidence cannot be converted into a factual source-deletion claim.

Materialization uses prepare-then-commit semantics and verifies source dependency, semantic environment, and prepared artifact hashes before one atomic project change.

Selection v2 uses semantic entity identity independent of surface projection paths, generated display IDs, and source fingerprints. Missing generated entities become non-actionable orphans and reactivate only on exact identity while the user’s intent epoch remains unchanged.

### 2.8 Render-plan ownership and audio cutover

`ResolvedAudioPlan v2` is immutable project-timeline output. It owns semantic event timing, voices/resources, provenance, source range, tail policy, environment/catalog/voice digests, budgets, and quantization version.

Runtime-only data is separated into `AudioScheduleBinding v1`, including generation, transport epoch, context/sample-rate epoch, effective cutover, and backend identity. Runtime schedule binding never enters canonical project state.

Real-time and offline adapters consume the same resolved plan semantics. Cross-engine bit-identical PCM is not promised; event identity/timing and defined numerical/audio tolerances are the conformance boundary.

### 2.9 Package, export, accessibility, and claims

Logical package v2 verifies actual archive members rather than trusting manifest declarations. It rejects path traversal, absolute paths, links, duplicate/case-colliding names, undeclared members, incorrect hashes/sizes/media types, and hostile compression ratios.

Export manifest v1 binds an output to project/material/source state, range, semantic environment, catalog, plan, actual artifact digest/media type/size, approximation records, and symbolic loss disclosures. MIDI and MusicXML cannot be represented as lossless AGL project serialization.

Accessibility mirror v1 is a semantic hierarchy with roles, text state, focus, exact adjustable actions, and non-drag alternatives. Visual canvas geometry is not the accessibility source of truth.

The claim registry requires trusted evidence records and allowed qualification classes. Caller-supplied evidence strings cannot unlock a scientific/product claim.

### 2.10 Risset and Penrose foundations

Risset v1 now rejects unsafe event ordinals and nonfinite horizons before enumeration, preserving deterministic closure and ID behavior across bounded ranges.

Penrose foundations now use bounded SHA-256 IDs over exact addresses, validate families/tuples/configuration/query bounds, retain exact `Q(φ)` topology, and reject Float64 projection overflow. The complete exact patch generator and independent oracle/matching corpus remain owned work—not claimed completion.

## 3. New public and semantic versions

| Area | Version |
|---|---|
| Semantic contract | `wave1-fr01-v3` |
| Project | 3 |
| Migration receipt | 2 |
| Command | `agl-command-contract-v2` |
| Evaluation protocol | `agl-evaluation-protocol-v2` |
| Resolved audio plan | `agl-resolved-audio-plan-v2` |
| Logical package | `agl.logical-package.v2` |
| Stable ID | `agl-stable-id-v2` |
| Deterministic generation | `agl-prng-v2` |
| Operator semantic/catalog digest | v2 |
| Graph compiler | `agl-graph-compiler-v2` |
| Tempo resolution | `agl-tempo-map-v1` |
| Sample quantization | `seconds-to-frame-v1` |
| Selection identity | 2 |
| Penrose identity | `penrose-id-v2` |

Pinned schemas, fixtures, and SHA-256 receipts are in [`program/fr01-contract-manifest.json`](program/fr01-contract-manifest.json).

## 4. Accepted ADRs

FR-01 adds:

- ADR 0019 — Project v3 canonical compatibility and loss-aware migration;
- ADR 0020 — Command v2 atomic application, inverses, and history;
- ADR 0021 — Canonical identity, named random streams, exact time, and tempo semantics;
- ADR 0022 — ResolvedAudioPlan v2 and generation/transport-epoch cutover;
- ADR 0023 — Hostile package boundary, loss-aware export, accessibility mirror, and claim gates;
- ADR 0024 — Evaluation protocol v2, deterministic graph compilation, and cross-platform conformance.

## 5. Validation

Release-grade validation currently passes:

| Gate | Result |
|---|---:|
| TypeScript build | Pass with TypeScript 5.8.3 |
| TypeScript/Node tests | **85/85** |
| Swift portable-contract tests | **11/11** |
| Draft 2020-12 JSON Schema fixtures/examples | **12/12** |
| Backlog validation | 142 items |
| FR-01 finding validation | 51 findings; 46 Critical/High owned |
| Public contracts | 11 schema/fixture/hash/runtime gates |
| Wave-1 evidence hashes | Pass |
| Native fixture mirrors | Pass |
| Deterministic release archive | 2 independent builds byte-identical; 228 source/evidence files |
| Clean release-archive extraction/revalidation | Pass |
| Static HTTP smoke | Pass — 8/8 endpoints |

The suite covers canonical encoding/strict JSON, exact arithmetic/time, identity/PRNG, project/migration, operators/graphs, command atomicity/history, pattern budgets, asynchronous freshness, materialization, selection, audio quantization, package security, export artifacts, accessibility semantics, claims, Risset, Penrose, and TypeScript/Swift parity.

Run:

```bash
npm run check:all
```

See [`docs/26-fr01-validation-report.md`](docs/26-fr01-validation-report.md).

## 6. Remaining Critical/High production gates

The contract layer is hardened, but the following remain implementation/empirical gates:

- project-v3 repository/package/cloud-conflict implementation and source-byte preservation;
- legacy catalog rebinding and quarantine UX;
- production command handlers/history and React adapters;
- Worker compiler/evaluator/cache/cancellation wiring;
- production `ResolvedAudioPlan v2` compiler and generation/transport cutover;
- physical Chrome/Firefox/Safari scheduling and density benchmarks;
- exact Penrose patch generation, legal matching corpus, and independent oracles;
- actual WAV/MIDI/MusicXML codecs and artifact verification;
- claim-registry enforcement across every public surface;
- floating numerical profiles/cache rules;
- operator implementation-conformance receipts and semantic-version enforcement;
- streaming canonical digest plus fragmented plan/export processing for large artifacts;
- native strict-JSON and hostile package-import parity;
- native Files/iCloud/audio/MIDI proof;
- real-time callback mechanical isolation and code-review/static-analysis gates;
- streaming canonical digest/render-plan/export for large bounded workloads;
- evaluator implementation receipts beyond operator metadata digests;
- strict native hostile-JSON/package import parity.

Every Critical/High item is assigned in the findings register and 142-item backlog.

## 7. Recommended implementation sequence

1. Freeze project-v3 compatibility, source-byte/semantic digest ownership, migration quarantine, and logical-package adapters.
2. Implement command-v2 handlers/history, source recipes, receipts, and production materialization.
3. Implement sealed operator catalog, graph compiler, evaluation protocol, worker/cache/budget services, and generated-identity declarations.
4. Compile `ResolvedAudioPlan v2`, implement voice/runtime binding, scheduler/AudioWorklet/offline adapters, and execute browser benchmarks.
5. Migrate Infinite Staircase and Euclidean Rings onto the shared plan path; run Risset listening acceptance.
6. Build the React studio shell using the same graph compatibility, command, selection, accessibility, and claim services.
7. Implement exact Penrose generation/oracles/traversal and then other lab hardening.
8. Implement export codecs and loss-aware manifests.
9. Expand property/fuzz/schema-differential and cross-platform conformance.
10. Execute the bounded native iPad proof only after package/cloud/audio ownership gates pass.

Local swarms must follow [`docs/27-fr01-swarm-handoff-amendment.md`](docs/27-fr01-swarm-handoff-amendment.md).
