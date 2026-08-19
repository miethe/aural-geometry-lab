# FR-01 — Whole-System Adversarial Repository Review

- **Date:** 2026-08-18
- **Reviewed baseline:** AGL v0.3.0 Wave-1 integrated system
- **Hardened baseline:** AGL v0.4.0 / M0.9
- **Disposition:** Accepted as the implementation-authority amendment before broad M1/M2 swarm execution

## TL;DR

FR-01 was executed against the complete repository as a hostile contract, implementation, portability, and trust-boundary review—not as a prose-only architecture exercise. It found places where individually plausible web, native, worker, audio, schema, export, or UI implementations could silently disagree.

Nine Critical and thirty-seven High findings are now registered. The reference foundation directly repairs or versions the most dangerous semantics: project/migration compatibility, canonical identity and strict JSON, command atomicity, graph legality, worker freshness/cache ownership, audio-plan/runtime separation, materialization/selection, package/export integrity, accessibility mirrors, and evidence-gated claims.

The remaining High risks are not hidden: all are assigned to concrete backlog items and workstreams. Passing v0.4 tests establishes contract/reference correctness, not completion of production browser audio, exact Penrose generation, export codecs, cloud-conflict handling, or the native application.

## Research and design basis

This review reconciles the existing Wave-1 system with DR-01 (Risset), DR-03 (browser audio), DR-08 (sonification), DR-09 (Penrose), DR-11 (professional UX), DR-12 (native iPad), DR-14 (editing/undo), and DR-15 (cross-platform core). The raw reports remain evidence; the accepted ADRs, contracts, fixtures, and this findings register are the implementation authority.

## Completion criteria

- Every Critical/High finding has a backlog ID and owning workstream.
- Any changed public meaning is versioned; no legacy contract is reinterpreted in place.
- New invariants are executable tests, schemas, or language-neutral fixtures.
- Schema, runtime, examples, package trust boundaries, and native fixture mirrors are checked together.
- Open empirical/production gates remain explicitly described as open.

## Attack method

```text
bytes / package / JSON
      ↓ strict parsing, schema, compatibility, migration
canonical project + exact values + semantic IDs
      ↓ command/history + sealed operator catalog
deterministic graph compiler + bounded worker evaluation
      ↓ freshness/cache/materialization/provenance
exact beats → ideal seconds → immutable audio/export plans
      ↓ runtime schedule binding / offline / native adapters
accessibility mirrors + claims + release evidence
```

Each seam was attacked for ambiguity, mutation, partial failure, stale completion, integer/Unicode/path collisions, unbounded work, hidden state, incompatible schemas, projection-dependent identity, unsupported loss claims, and cross-platform divergence.

## Coverage of the requested attack surface

| Requested area | FR-01 result | Authority |
|---|---|---|
| Project schema/versioning | Project v3 sole new-write authority; strict unknown-field and compatibility closure; loss-aware migrations | ADR 0019 |
| Operator versioning | Semantic/catalog digests, sealed registry, full dimension legality; implementation receipts remain owned | ADR 0024 / AGL-189 |
| Exact time/tempo | Exact rational ingress, analytic tempo map, separate seconds and sample-frame domains | ADR 0021–0022 |
| Seeds/IDs | SHA-256 typed canonical values, stable-ID v2, named PRNG streams | ADR 0021 |
| Graph compile/evaluate | One deterministic compiler, host-owned conformance class, bounded evaluation protocol | ADR 0024 |
| Cancellation/stale races | Generation/hash/epoch publication barrier; cancellation only resource control | ADR 0024 |
| Commands/undo | Atomic command v2, core inverses, explicit gesture sessions, monotonic replay | ADR 0020 |
| Generated/frozen | Four explicit edit meanings, identity capabilities, guarded materialization | ADR 0020 / 0024 |
| Render-plan ownership | Immutable plan v2 separated from generation/transport/backend binding | ADR 0022 |
| Realtime/offline equivalence | Same plan and sample-frame semantics; PCM identity not universally promised | ADR 0022 |
| Cross-surface selection | Semantic selection v2; focus/hover/related/orphan states separated | ADR 0024 |
| Exports | Actual-byte verification and explicit procedural/notation loss manifest | ADR 0023 |
| Browser/native portability | Contract-first fixtures; native hostile JSON/package parity remains gated | ADR 0023–0024 |
| Accessibility mirrors | One validated semantic hierarchy and command inventory; non-drag paths required | ADR 0023 |
| Research-gated claims | Versioned claim register, exact qualifications, trusted evidence authority | ADR 0023 |

## Finding summary

| Severity | Count |
|---|---:|
| Critical | 9 |
| High | 37 |
| Medium | 5 |
| Low | 0 |

- **Total:** 51
- **Fixed or contract-hardened:** 33
- **Open/deferred and explicitly owned:** 18

## Critical findings

| ID | Failure | Repair/status | Owner |
|---|---|---|---|
| FR01-001 | A swarm can produce a file that passes one schema or example but is rejected by the runtime, or silently omit compatibility fields that control execution. | Establish project v3 as the sole new-write authority, add strict compatibility versions and unknown-field checks, align JSON Schema/examples, and validate every fixture against both schema and runtime. — **fixed-contract-owned-implementation** | AGL-172 / WS-RUNTIME |
| FR01-002 | A v1/v2 project opens as v3 while operator meaning, track membership, or lab state cannot be reconstructed; agents then execute a plausible but different composition. | Emit migration receipt v2 with source/target digests, preserved opaque extensions, blocking loss records, and requiresUserReview; quarantine catalog rebinding. — **fixed-contract-owned-implementation** | AGL-173 / WS-RUNTIME |
| FR01-003 | A command serialized by one agent cannot be replayed by another; worse, a stale or malicious UI can provide an inverse that corrupts Undo. | Replace with command v2: one PascalCase grammar, typed target/write sets, preconditions, clone-first atomic transactions, core-generated validated inverses, no-op suppression, and explicit history semantics. — **fixed-contract-owned-implementation** | AGL-174 / WS-RUNTIME |
| FR01-004 | Different tuples can share the same legacy serialized input/hash; adding a draw in one branch changes sibling generated output and invalidates stable selections, exceptions, or project replay. | Introduce typed canonical value encoding, SHA-256 digests, bounded stable-ID v2, and immutable named PRNG streams derived from root seed plus path. Keep v1 migration-only. — **fixed-contract-owned-cross-platform** | AGL-182 / WS-NATIVE |
| FR01-005 | The same plan hashes differently per playback, offline and realtime disagree, and a short event can become zero or gain a frame because duration is rounded separately instead of quantizing absolute endpoints. | Define immutable ResolvedAudioPlan v2 in project-timeline seconds, separate AudioScheduleBinding v1 for generation/transport/backend epoch, and quantize absolute start/end once. — **fixed-contract-owned-implementation** | AGL-177 / WS-AUDIO |
| FR01-006 | A canceled worker finishes late and publishes stale geometry, provenance, materialization, or audio plan because cancellation state—not current semantic identity—is treated as proof. | Use project epoch, scope, channel, generation, input/environment/catalog/budget hashes, payload integrity, and current desired identity; cancellation is resource control only. — **fixed-contract-owned-implementation** | AGL-176 / WS-RUNTIME |
| FR01-007 | A hostile archive uses traversal, links, case collisions, compression bombs, undeclared files, or false sizes/hashes to overwrite files or bypass semantic validation. | Define package manifest v2, strict portable paths, content-addressed assets, measured member metadata, no links/devices, no extra/missing members, bounded totals/ratios, and validated authoritative project. — **fixed-contract-owned-implementation** | AGL-179 / WS-RUNTIME |
| FR01-042 | One reader accepts the first duplicate key, another the last, and another rejects it; or a large integer/lone surrogate changes during decode, allowing schema, hash, project ID, or package metadata substitution. | Introduce strict UTF-8 JSON parsing with duplicate-member, unsafe-integer, malformed-Unicode, trailing-data, depth/node/collection limits before schema/runtime validation; require native parity. — **fixed-contract-owned-cross-platform** | AGL-179 / WS-RUNTIME |
| FR01-044 | A compromised, stale, or buggy worker marks profile-numeric/render-only output as exact, causing backend-dependent values to enter backend-independent cache keys and later publish as authoritative. | Make determinism class host-owned from the sealed operator/catalog contract; worker results echo it only for mismatch detection and cannot promote cache semantics. — **fixed-contract-owned-implementation** | AGL-176 / WS-RUNTIME |

## Open owned findings

| ID | Severity | Remaining gate | Owner | Acceptance work |
|---|---|---|---|---|
| FR01-025 | High | Playable prototypes still bypass the production render-plan/backend architecture | AGL-177 / WS-AUDIO | Legacy players no longer compute timing; real-time and offline adapters consume finalized plan v2, runtime generation/transport epochs live only in bindings, and absolute endpoints quantize once. |
| FR01-026 | High | Cross-browser scheduler and realtime/offline tolerances are unmeasured | AGL-178 / WS-AUDIO | Chrome/Firefox/Safari hardware runs calibrate horizon, late policy, native/worklet thresholds, sample-frame agreement, cancellation cutover, and waveform-feature tolerances. |
| FR01-027 | High | Exact Penrose runtime still lacks recovered golden/oracle/matching artifacts and generator | AGL-186 / WS-LABS | Pentagrid patches, cut-and-project and hierarchy oracles, legal stars/matching, exact adjacency/query halo, stable traversal, and golden hashes pass before the lab leaves research-gated status. |
| FR01-028 | High | Export manifests exist but WAV/MIDI/MusicXML/package codecs are not production implementations | AGL-180 / WS-QUALITY | Every export binds immutable source state, output hash, provenance, recipes/receipts, exact range, and explicit representational losses; no exporter reruns hidden sonification. |
| FR01-029 | High | Claim registry enforcement is not yet wired to product copy/build | AGL-183 / WS-QUALITY | Every scientific/product claim resolves to an allowed surface, exact qualification digest, citations, and trusted gate evidence; forbidden or ungated copy fails CI. |
| FR01-030 | High | Profile-numeric behavior remains undefined for chaos and other floating workloads | AGL-170 / WS-QUALITY | Exact versus profile-numeric outputs, tolerances, NaN/signed-zero policy, checkpoints, branch quantization, and cache identity are versioned. |
| FR01-031 | High | Legacy migrated operators require explicit sealed-catalog rebinding | AGL-173 / WS-RUNTIME | Blocking migration losses quarantine execution until the user reviews opaque extensions and explicitly rebinds every legacy operator to a sealed catalog digest. |
| FR01-032 | High | Physical package profile and iCloud/File Provider conflict behavior remain unproven | AGL-167 / WS-NATIVE | Offline divergent edits, Files/iCloud conflicts, move/rename, eviction, multiwindow, and browser/native containers preserve both versions without corruption. |
| FR01-033 | High | Transport generation cutover and runtime graph failure behavior are contracts without production state machines | AGL-177 / WS-AUDIO | Legacy players no longer compute timing; real-time and offline adapters consume finalized plan v2, runtime generation/transport epochs live only in bindings, and absolute endpoints quantize once. |
| FR01-034 | High | Real-time callback boundary is not yet mechanically enforced | AGL-178 / WS-AUDIO | Chrome/Firefox/Safari hardware runs calibrate horizon, late policy, native/worklet thresholds, sample-frame agreement, cancellation cutover, and waveform-feature tolerances. |
| FR01-035 | High | Generated identity capability is not yet proven for every operator/lab | AGL-159 / WS-RUNTIME | Every generator declares stable, successor-mapped, or ephemeral identity and passes corresponding selection/exception fixtures. |
| FR01-037 | Medium | Command field preconditions need a versioned canonical path vocabulary | AGL-174 / WS-RUNTIME | All production commands implement validated apply/inverse semantics, atomic transactions, undo/redo branching, grouped gestures, crash recovery, and model-based tests. |
| FR01-038 | Medium | Exact and profile-numeric cache results require separate compatibility rules | AGL-170 / WS-QUALITY | Exact versus profile-numeric outputs, tolerances, NaN/signed-zero policy, checkpoints, branch quantization, and cache identity are versioned. |
| FR01-039 | Medium | MIDI runtime I/O and Standard MIDI File export could be conflated | AGL-180 / WS-AUDIO | Every export binds immutable source state, output hash, provenance, recipes/receipts, exact range, and explicit representational losses; no exporter reruns hidden sonification. |
| FR01-040 | Medium | Pinned toolchain exists but dependency lock and connected install proof remain incomplete | AGL-136 / WS-QUALITY | Lockfile, notices, sample rights, and reciprocal-license boundaries are approved. |
| FR01-047 | High | Canonical digest and resolved plans are whole-value in-memory operations | AGL-190 / WS-RUNTIME | Large canonical projects and audio/export plans are hashed and processed incrementally with deterministic fragment identity, bounded memory, cancellation, and equivalence to the current v1/v2 whole-value contracts. |
| FR01-048 | High | Operator semantic metadata digest does not prove evaluator implementation identity | AGL-189 / WS-RUNTIME | Every released operator implementation binds evaluator build identity to type/version/semantic digest plus accepted golden/property fixtures; behavior change under an unchanged semantic version fails release verification. |
| FR01-051 | High | Swift/native project import still relies on ordinary JSONDecoder rather than the strict hostile JSON contract | AGL-191 / WS-NATIVE | Swift/native import rejects duplicate keys, malformed Unicode/UTF-8, unsafe integers, trailing data, ambiguous paths, links, size/hash mismatches, and produces the same accepted/rejected hostile corpus outcomes as TypeScript. |

## Versioned contract baseline

| Contract | Version | Schema |
|---|---:|---|
| project | 3 | `schemas/agl-project-v3.schema.json` |
| migration-receipt | 2 | `schemas/agl-migration-receipt-v2.schema.json` |
| semantic-command | 2 | `schemas/agl-command-v2.schema.json` |
| evaluation-request | 2 | `schemas/agl-evaluation-request-v2.schema.json` |
| resolved-audio-plan | 2 | `schemas/agl-resolved-audio-plan-v2.schema.json` |
| audio-schedule-binding | 1 | `schemas/agl-audio-schedule-binding-v1.schema.json` |
| logical-package | 2 | `schemas/agl-package-manifest-v2.schema.json` |
| export-manifest | 1 | `schemas/agl-export-manifest-v1.schema.json` |
| accessibility-mirror | 1 | `schemas/agl-accessibility-mirror-v1.schema.json` |
| mapping-trace | 1 | `schemas/agl-mapping-trace-v1.schema.json` |
| claim-register | 1 | `schemas/agl-claim-register-v1.schema.json` |

Additional semantic authorities include `agl-strict-json-v1`, `agl-canonical-value-v1`, `sha256-canonical-v1`, `agl-rational-wire-v1`, stable-ID v2, named PRNG v2, graph compiler v2, tempo-map v1, evaluation protocol v2, and the pending evidence-gated profiles recorded in `program/fr01-contract-manifest.json`.

## Accepted FR-01 ADRs

- [ADR 0019 — Project v3 Canonical Compatibility and Loss-Aware Migration](adr/0019-project-v3-canonical-compatibility-and-loss-aware-migration.md)
- [ADR 0020 — Command v2 Atomic Application, Inverses, and History](adr/0020-command-v2-atomic-application-and-history.md)
- [ADR 0021 — Canonical Identity, Named Random Streams, Exact Time, and Tempo Semantics](adr/0021-canonical-identity-prng-and-tempo-semantics.md)
- [ADR 0022 — ResolvedAudioPlan v2 and Runtime Generation/Epoch Cutover](adr/0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md)
- [ADR 0023 — Hostile Package Boundary, Loss-Aware Export, Accessibility Mirror, and Claim Gates](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- [ADR 0024 — Evaluation Protocol v2, Deterministic Graph Compilation, and Cross-Platform Conformance](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)

## Detailed findings

The machine-readable authority is [`program/fr01-findings-register.json`](../program/fr01-findings-register.json). Every issue below includes the requested severity, concrete failure scenario, affected files/contracts, repair, regression evidence, ADR, ownership, and versioning consequence.

### FR01-001 — Project schemas, runtime validator, and examples described incompatible v3 semantics

- **Severity:** Critical
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `project-format`
- **Failure scenario:** A swarm can produce a file that passes one schema or example but is rejected by the runtime, or silently omit compatibility fields that control execution.
- **Affected files/contracts:** `src/core/project-schema.ts; schemas/agl-project-v3.schema.json; examples/fr01-minimal.v3.project.json`
- **Repair:** Establish project v3 as the sole new-write authority, add strict compatibility versions and unknown-field checks, align JSON Schema/examples, and validate every fixture against both schema and runtime.
- **ADR:** [`0019-project-v3-canonical-compatibility-and-loss-aware-migration.md`](adr/0019-project-v3-canonical-compatibility-and-loss-aware-migration.md)
- **Backlog owner:** `AGL-172` / `WS-RUNTIME`
- **Contract/version consequence:** project 2→3
- **Regression tests:**
  - FR-01 project v3 validation and semantic digest
  - Draft 2020-12 schema validation of v3 example

### FR01-002 — Legacy migration represented semantic loss as a clean upgrade

- **Severity:** Critical
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `migration`
- **Failure scenario:** A v1/v2 project opens as v3 while operator meaning, track membership, or lab state cannot be reconstructed; agents then execute a plausible but different composition.
- **Affected files/contracts:** `src/core/project-schema.ts; schemas/agl-migration-receipt-v2.schema.json`
- **Repair:** Emit migration receipt v2 with source/target digests, preserved opaque extensions, blocking loss records, and requiresUserReview; quarantine catalog rebinding.
- **ADR:** [`0019-project-v3-canonical-compatibility-and-loss-aware-migration.md`](adr/0019-project-v3-canonical-compatibility-and-loss-aware-migration.md)
- **Backlog owner:** `AGL-173` / `WS-RUNTIME`
- **Contract/version consequence:** migration receipt 1→2
- **Regression tests:**
  - FR-01 legacy migration explicit-loss test
  - migration-receipt-v2 schema fixture

### FR01-003 — Command JSON schema and TypeScript envelope used incompatible grammars and trusted UI inverse data

- **Severity:** Critical
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `commands-history`
- **Failure scenario:** A command serialized by one agent cannot be replayed by another; worse, a stale or malicious UI can provide an inverse that corrupts Undo.
- **Affected files/contracts:** `src/core/commands.ts; schemas/agl-command-v2.schema.json; conformance/fr01/command-v2.valid.json`
- **Repair:** Replace with command v2: one PascalCase grammar, typed target/write sets, preconditions, clone-first atomic transactions, core-generated validated inverses, no-op suppression, and explicit history semantics.
- **ADR:** [`0020-command-v2-atomic-application-and-history.md`](adr/0020-command-v2-atomic-application-and-history.md)
- **Backlog owner:** `AGL-174` / `WS-RUNTIME`
- **Contract/version consequence:** command 1→2
- **Regression tests:**
  - FR-01 command grammar/atomicity test
  - FR-01 core inverse/stale-guard test
  - FR-01 coalescing test

### FR01-004 — Persistent IDs and random streams were collision-prone and evaluation-order dependent

- **Severity:** Critical
- **Status:** `fixed-contract-owned-cross-platform`
- **Domain:** `identity-determinism`
- **Failure scenario:** Different tuples can share the same legacy serialized input/hash; adding a draw in one branch changes sibling generated output and invalidates stable selections, exceptions, or project replay.
- **Affected files/contracts:** `src/core/canonical.ts; src/core/random.ts; native/AuralGeometryCore/Sources/AuralGeometryCore/CanonicalV2.swift`
- **Repair:** Introduce typed canonical value encoding, SHA-256 digests, bounded stable-ID v2, and immutable named PRNG streams derived from root seed plus path. Keep v1 migration-only.
- **ADR:** [`0021-canonical-identity-prng-and-tempo-semantics.md`](adr/0021-canonical-identity-prng-and-tempo-semantics.md)
- **Backlog owner:** `AGL-182` / `WS-NATIVE`
- **Contract/version consequence:** stable ID 1→2; PRNG 1→2
- **Regression tests:**
  - FR-01 canonical encoding/SHA test
  - FR-01 stable ID ambiguity test
  - FR-01 PRNG branch independence test
  - Swift PRNG/stable-ID conformance

### FR01-005 — Audio plan mixed immutable musical content with runtime generation/transport state and quantized duration incorrectly

- **Severity:** Critical
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `audio-rendering`
- **Failure scenario:** The same plan hashes differently per playback, offline and realtime disagree, and a short event can become zero or gain a frame because duration is rounded separately instead of quantizing absolute endpoints.
- **Affected files/contracts:** `src/core/render-plan.ts; schemas/agl-resolved-audio-plan-v2.schema.json; schemas/agl-audio-schedule-binding-v1.schema.json`
- **Repair:** Define immutable ResolvedAudioPlan v2 in project-timeline seconds, separate AudioScheduleBinding v1 for generation/transport/backend epoch, and quantize absolute start/end once.
- **ADR:** [`0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md`](adr/0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md)
- **Backlog owner:** `AGL-177` / `WS-AUDIO`
- **Contract/version consequence:** resolved audio plan 1→2; schedule binding new v1
- **Regression tests:**
  - FR-01 plan/schema authority test
  - FR-01 endpoint quantization test

### FR01-006 — Cancellation was capable of being mistaken for async freshness

- **Severity:** Critical
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `async-runtime`
- **Failure scenario:** A canceled worker finishes late and publishes stale geometry, provenance, materialization, or audio plan because cancellation state—not current semantic identity—is treated as proof.
- **Affected files/contracts:** `src/core/derivation.ts; src/core/evaluation-protocol.ts; schemas/agl-evaluation-request-v2.schema.json`
- **Repair:** Use project epoch, scope, channel, generation, input/environment/catalog/budget hashes, payload integrity, and current desired identity; cancellation is resource control only.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-176` / `WS-RUNTIME`
- **Contract/version consequence:** evaluation protocol new v2
- **Regression tests:**
  - FR-01 derivation publication/integrity test
  - FR-01 evaluation channel/progress test

### FR01-007 — Package manifest trusted declared paths, sizes, and hashes without verifying actual archive members

- **Severity:** Critical
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `package-security`
- **Failure scenario:** A hostile archive uses traversal, links, case collisions, compression bombs, undeclared files, or false sizes/hashes to overwrite files or bypass semantic validation.
- **Affected files/contracts:** `src/core/project-package.ts; schemas/agl-package-manifest-v2.schema.json`
- **Repair:** Define package manifest v2, strict portable paths, content-addressed assets, measured member metadata, no links/devices, no extra/missing members, bounded totals/ratios, and validated authoritative project.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-179` / `WS-RUNTIME`
- **Contract/version consequence:** package manifest 1→2
- **Regression tests:**
  - FR-01 package hostile member test
  - package-manifest-v2 schema fixture

### FR01-008 — Exact rational construction accepted unsafe or approximate Number input

- **Severity:** High
- **Status:** `fixed`
- **Domain:** `time-math`
- **Failure scenario:** An integer beyond 2^53 or decimal parsed through binary floating point silently changes a beat, range, seed input, or cache key.
- **Affected files/contracts:** `src/core/rational.ts`
- **Repair:** Require exact string/scientific/fraction parsing, canonical rational wire validation, and an explicitly named approximate-number conversion seam.
- **ADR:** [`0021-canonical-identity-prng-and-tempo-semantics.md`](adr/0021-canonical-identity-prng-and-tempo-semantics.md)
- **Backlog owner:** `AGL-172` / `WS-RUNTIME`
- **Contract/version consequence:** rational constructor behavior hardened
- **Regression tests:**
  - FR-01 rational exact parse/wire test

### FR01-009 — Tempo curve meaning and beat/seconds conversion were underdefined

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `time-math`
- **Failure scenario:** Web and native agents implement different linear-tempo interpolation or repeatedly add floating deltas, causing drift and cross-platform event disagreement.
- **Affected files/contracts:** `src/core/tempo-map.ts; ProjectCompatibilityV3.tempoResolutionVersion`
- **Repair:** Version tempo-map v1; keep beats exact, define step and linear-BPM-over-beat analytic integration/inversion, and emit deterministic seconds only at the render boundary.
- **ADR:** [`0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md`](adr/0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md)
- **Backlog owner:** `AGL-177` / `WS-AUDIO`
- **Contract/version consequence:** tempo resolution new v1
- **Regression tests:**
  - FR-01 tempo analytic conversion/roundtrip test

### FR01-010 — Operator definitions and catalogs could mutate after registration

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `operator-catalog`
- **Failure scenario:** One agent modifies a shared definition object after another computed a project or graph digest; the same type/version then means different behavior.
- **Affected files/contracts:** `src/core/operator.ts; ProjectOperatorNodeV3.operatorSemanticDigest`
- **Repair:** Deep-clone/freeze definitions, validate parameters including explicit null, compute versioned semantic digests, seal catalogs, and persist catalog/operator digests.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-175` / `WS-RUNTIME`
- **Contract/version consequence:** operator semantic/catalog digest v2
- **Regression tests:**
  - FR-01 operator registry freeze/null/seal test

### FR01-011 — No single graph compiler enforced types, cardinality, cycles, and operator digests

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `graph-runtime`
- **Failure scenario:** The UI accepts a wire that the evaluator rejects, or different agents compute dependency closure/order differently, creating invalid saved graphs and divergent sound.
- **Affected files/contracts:** `src/core/graph.ts; src/core/operator.ts`
- **Repair:** Compile through one deterministic service that verifies catalog digest, node parameters, ports/types/dimensions/cardinality/required inputs, result cycles, topological order, and dependency closure.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-175` / `WS-RUNTIME`
- **Contract/version consequence:** graph compiler new v2
- **Regression tests:**
  - FR-01 graph compiler types/cardinality/cycle test

### FR01-012 — Transaction application could partially mutate caller state before failure

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `commands-history`
- **Failure scenario:** Command 2 of 3 fails after command 1 mutates a shared object, leaving project state changed without a committed transaction or inverse.
- **Affected files/contracts:** `src/core/commands.ts`
- **Repair:** Clone before apply, validate all transaction envelope invariants, compute/validate inverse per command, and only publish the final clone after all commands succeed.
- **ADR:** [`0020-command-v2-atomic-application-and-history.md`](adr/0020-command-v2-atomic-application-and-history.md)
- **Backlog owner:** `AGL-174` / `WS-RUNTIME`
- **Contract/version consequence:** command v2
- **Regression tests:**
  - FR-01 mutating-failure atomicity test

### FR01-013 — Time-only command coalescing could merge distinct user intents

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `commands-history`
- **Failure scenario:** Two edits close in time become one Undo step, or one gesture becomes many steps across platforms.
- **Affected files/contracts:** `src/core/commands.ts; src/core/interaction.ts`
- **Repair:** Coalesce only one explicit edit session with identical action, target set, and write set; preserve first-before/final-after; no time-only merge.
- **ADR:** [`0020-command-v2-atomic-application-and-history.md`](adr/0020-command-v2-atomic-application-and-history.md)
- **Backlog owner:** `AGL-174` / `WS-RUNTIME`
- **Contract/version consequence:** command v2
- **Regression tests:**
  - FR-01 command coalescing test

### FR01-014 — Looped pattern evaluation could exceed budgets before checking and omit long events crossing the query boundary

- **Severity:** High
- **Status:** `fixed`
- **Domain:** `event-pattern`
- **Failure scenario:** A recursive/looping clip allocates millions of events before failure, while long notes begun in a prior cycle disappear from playback or export.
- **Affected files/contracts:** `src/core/pattern.ts`
- **Repair:** Preflight conservative event counts, include prior cycles needed for overlapping durations, enforce half-open interval semantics, stable ordering, and bounded IDs.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-175` / `WS-RUNTIME`
- **Contract/version consequence:** pattern query hardened
- **Regression tests:**
  - FR-01 loop budget/long-event test
  - FR-01 point-event half-open test

### FR01-015 — Material source status conflated unknown evidence with missing source

- **Severity:** High
- **Status:** `fixed-contract-owned-ui`
- **Domain:** `generated-material`
- **Failure scenario:** A snapshot whose current digest is not yet evaluated is shown as missing or changed, prompting destructive rematerialization or false provenance claims.
- **Affected files/contracts:** `src/core/materialization.ts; native Contracts.swift; conformance/wave1/material-status-cases.json`
- **Repair:** Add unresolved state; derive status from material kind, source existence/detachment, and exact dependency digest rather than persist it as truth.
- **ADR:** [`0020-command-v2-atomic-application-and-history.md`](adr/0020-command-v2-atomic-application-and-history.md)
- **Backlog owner:** `AGL-157` / `WS-RUNTIME`
- **Contract/version consequence:** source status vocabulary extended
- **Regression tests:**
  - FR-01 unresolved source-status test
  - TS/Swift material-status fixtures

### FR01-016 — Materialization could commit output prepared from an obsolete source

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `generated-material`
- **Failure scenario:** The generator changes while freeze runs; completion writes a snapshot different from what the user saw/requested.
- **Affected files/contracts:** `src/core/materialization.ts; project v3 source recipes/receipts`
- **Repair:** Use prepare-then-commit with exact half-open range, project epoch, dependency/recipe/environment/catalog/artifact hashes, ID collision checks, and atomic commit failure on drift.
- **ADR:** [`0020-command-v2-atomic-application-and-history.md`](adr/0020-command-v2-atomic-application-and-history.md)
- **Backlog owner:** `AGL-157` / `WS-RUNTIME`
- **Contract/version consequence:** materialization receipt v3
- **Regression tests:**
  - FR-01 hash-guarded materialization test

### FR01-017 — Selection identity included projection path or generated display ID

- **Severity:** High
- **Status:** `fixed-contract-owned-integration`
- **Domain:** `selection-hci`
- **Failure scenario:** Selecting one mathematical entity in timeline and canvas produces two selections, or regenerated display IDs orphan/rebind the wrong entity.
- **Affected files/contracts:** `src/core/interaction.ts; native Contracts.swift; conformance/selection-v2-cases.json`
- **Repair:** Define semantic selection v2 independent of projection and generated display/fingerprint; projection keys are separate; orphan reactivation requires exact key and unchanged intent epoch.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-181` / `WS-PRODUCT`
- **Contract/version consequence:** selection identity 1→2
- **Regression tests:**
  - FR-01 selection semantic identity/orphan test
  - Swift selection v2 fixture

### FR01-018 — Export could silently flatten procedural or geometric meaning

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `export`
- **Failure scenario:** MIDI or MusicXML appears to preserve a live generator/Penrose structure when it only contains a bounded note realization; later audit cannot identify source recipes, receipts, range, plan, or losses.
- **Affected files/contracts:** `src/core/export.ts; schemas/agl-export-manifest-v1.schema.json`
- **Repair:** Require immutable source/project/environment/catalog/plan bindings, mode-consistent recipes/receipts, output hash, provenance, exact range, canonical media type, and explicit procedural/MusicXML loss records.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-180` / `WS-QUALITY`
- **Contract/version consequence:** export manifest new v1
- **Regression tests:**
  - FR-01 export manifest loss/binding test
  - export-manifest schema fixture

### FR01-019 — Accessibility semantics were at risk of becoming separate per-surface approximations

- **Severity:** High
- **Status:** `fixed-contract-owned-integration`
- **Domain:** `accessibility`
- **Failure scenario:** Canvas supports only drag/color/motion, keyboard focus forms cycles or follows expensive selection, and web/native announce different states.
- **Affected files/contracts:** `src/core/accessibility.ts; schemas/agl-accessibility-mirror-v1.schema.json`
- **Repair:** Use one acyclic semantic mirror with stable order/roles/state text/actions, exact value controls, non-drag alternatives, one focus locus, and shared projection data.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-181` / `WS-PRODUCT`
- **Contract/version consequence:** accessibility mirror new v1
- **Regression tests:**
  - FR-01 accessibility mirror hierarchy/action test
  - accessibility schema fixture

### FR01-020 — Research-gated claim authorization trusted caller-supplied evidence IDs

- **Severity:** High
- **Status:** `fixed-contract-owned-integration`
- **Domain:** `claims`
- **Failure scenario:** UI code passes an arbitrary evidence string and publishes “exact Penrose” or “validated Risset” before the required implementation/study exists.
- **Affected files/contracts:** `src/core/claims.ts; program/claim-register.json`
- **Repair:** Bind claims to allowed surfaces, exact qualification digest, sources, and trusted release-context gate evidence; caller strings cannot satisfy gates.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-183` / `WS-QUALITY`
- **Contract/version consequence:** claim registry hardened
- **Regression tests:**
  - FR-01 claim trusted-evidence test

### FR01-021 — Risset event ordinals could exceed safe integer identity space

- **Severity:** High
- **Status:** `fixed-contract-owned-lab`
- **Domain:** `risset`
- **Failure scenario:** Very long/high-rate queries round event ordinals, collide IDs, loop indefinitely, or generate nonfinite inverse times.
- **Affected files/contracts:** `src/operators/risset.ts`
- **Repair:** Preflight bounded horizon/event count, require safe layer/ordinal indices and finite phase/rate/inverse time, and fail deterministically before enumeration.
- **ADR:** [`0021-canonical-identity-prng-and-tempo-semantics.md`](adr/0021-canonical-identity-prng-and-tempo-semantics.md)
- **Backlog owner:** `AGL-185` / `WS-AUDIO`
- **Contract/version consequence:** operator behavior hardened
- **Regression tests:**
  - FR-01 Risset bounded closure/unsafe ordinal test

### FR01-022 — Penrose canonical identity and topology could depend on unbounded text or Float64 projection

- **Severity:** High
- **Status:** `fixed-foundation-owned-generator`
- **Domain:** `penrose`
- **Failure scenario:** Huge exact addresses create giant persisted IDs/DoS, or two vertices/edges merge because their rendered coordinates fall within an epsilon.
- **Affected files/contracts:** `src/geometry/penrose.ts; src/geometry/qphi.ts`
- **Repair:** Validate family/address ranges and canonical tuples, use bounded SHA-256 IDs over exact addresses, keep Q(phi) topology exact, and reject nonfinite Float64 projection.
- **ADR:** [`0015-exact-penrose-production-geometry.md`](adr/0015-exact-penrose-production-geometry.md)
- **Backlog owner:** `AGL-186` / `WS-LABS`
- **Contract/version consequence:** Penrose identity v2
- **Regression tests:**
  - FR-01 Penrose ID/topology validation test
  - FR-01 Q(phi) overflow test

### FR01-023 — Public JSON schemas and runtime validators could drift independently

- **Severity:** High
- **Status:** `fixed-tooling-owned-continuation`
- **Domain:** `schema-conformance`
- **Failure scenario:** A fixture passes Draft 2020-12 schema but fails runtime—or vice versa—so autonomous agents choose different authorities.
- **Affected files/contracts:** `schemas/*; scripts/validate-json-schemas.py; conformance/fr01/*`
- **Repair:** Align versioned schemas/fixtures and run all public examples/fixtures through JSON Schema plus runtime validators in check:all; fail missing/mismatched artifacts.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-188` / `WS-QUALITY`
- **Contract/version consequence:** tooling gate
- **Regression tests:**
  - 10 public schema/example validations
  - FR-01 plan/schema authority test

### FR01-024 — Swift contracts lagged project v3, semantic selection, source status, stable IDs, and PRNG

- **Severity:** High
- **Status:** `fixed-foundation-owned-expansion`
- **Domain:** `cross-platform`
- **Failure scenario:** The iPad opens the file but assigns different generated identities/random output or treats the same canvas/timeline entity as different selections.
- **Affected files/contracts:** `native/AuralGeometryCore; conformance/selection-v2-cases.json; conformance/prng-v2-cases.json`
- **Repair:** Add project v3 DTOs, unresolved source status, package profile v2, semantic selection v2, pure SHA-256/canonical stable-ID v2, named PRNG v2, and shared fixtures.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-182` / `WS-NATIVE`
- **Contract/version consequence:** Swift portable contract expanded
- **Regression tests:**
  - 11 Swift contract tests including v3/selection/PRNG

### FR01-025 — Playable prototypes still bypass the production render-plan/backend architecture

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `audio-rendering`
- **Failure scenario:** The current demo sounds correct while production scheduler/offline/native paths execute different timing, voice, cancellation, or safety semantics.
- **Affected files/contracts:** `src/audio/*; src/app/*; ResolvedAudioPlan v2 adapters`
- **Repair:** Migrate Infinite Staircase/Euclidean and all voices to finalized plan v2 plus schedule binding; prohibit lab-local timing authority.
- **ADR:** [`0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md`](adr/0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md)
- **Backlog owner:** `AGL-177` / `WS-AUDIO`
- **Contract/version consequence:** implementation migration
- **Regression tests:**
  - future backend adapter conformance
  - future P0 lab smoke suite

### FR01-026 — Cross-browser scheduler and realtime/offline tolerances are unmeasured

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `audio-validation`
- **Failure scenario:** A hard-coded 25/100 ms profile works on one desktop but misses notes, makes edits sluggish, or overloads native nodes elsewhere.
- **Affected files/contracts:** `DR-03 benchmark harness; AGL audio diagnostics`
- **Repair:** Run declared browser/OS/hardware matrix; calibrate horizon, late policy, native/worklet threshold, cancellation, latency telemetry, and feature tolerances.
- **ADR:** [`0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md`](adr/0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md)
- **Backlog owner:** `AGL-178` / `WS-AUDIO`
- **Contract/version consequence:** evidence gate
- **Regression tests:**
  - future scheduler benchmark corpus

### FR01-027 — Exact Penrose runtime still lacks recovered golden/oracle/matching artifacts and generator

- **Severity:** High
- **Status:** `open-owned-blocked`
- **Domain:** `penrose`
- **Failure scenario:** A visually convincing patch ships without exact matching, adjacency/query completeness, or independent oracle proof.
- **Affected files/contracts:** `DR-09 artifacts; src/geometry/penrose.ts; lab implementation`
- **Repair:** Recover or regenerate fixture bytes/prototypes/legal stars/matching tables; implement exact pentagrid generator, cut-and-project/hierarchy oracles, halo, clipping, adjacency, and traversal.
- **ADR:** [`0015-exact-penrose-production-geometry.md`](adr/0015-exact-penrose-production-geometry.md)
- **Backlog owner:** `AGL-186` / `WS-LABS`
- **Contract/version consequence:** blocked implementation
- **Regression tests:**
  - future DR-09 goldens and property suite

### FR01-028 — Export manifests exist but WAV/MIDI/MusicXML/package codecs are not production implementations

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `export`
- **Failure scenario:** A swarm treats the manifest contract as evidence that real export is complete, while codec timing, tails, quantization, loss records, and transactional output are untested.
- **Affected files/contracts:** `src/core/export.ts; AGL-130/131; offline renderer`
- **Repair:** Implement codecs from canonical events/plans, transactional files, tails, loss fixtures, and round-trip tests.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-180` / `WS-QUALITY`
- **Contract/version consequence:** implementation
- **Regression tests:**
  - future export corpus and end-to-end smoke

### FR01-029 — Claim registry enforcement is not yet wired to product copy/build

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `claims`
- **Failure scenario:** A component bypasses claim resolution and hard-codes an overclaim even though the registry is correct.
- **Affected files/contracts:** `program/claim-register.json; UI/docs/build pipeline`
- **Repair:** Require registered claim IDs for scientific copy, lint generated docs/examples/UI, and make missing qualification/gate fail CI/release review.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-183` / `WS-QUALITY`
- **Contract/version consequence:** implementation
- **Regression tests:**
  - future claim-surface snapshot/lint suite

### FR01-030 — Profile-numeric behavior remains undefined for chaos and other floating workloads

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `numerics`
- **Failure scenario:** TypeScript and Swift choose different branch/quantization outcomes from tiny float differences, changing persisted events, IDs, or cache results.
- **Affected files/contracts:** `program/backlog AGL-170; chaos/control operators; cache policy`
- **Repair:** Define exact versus profile-numeric classes, checkpoints, absolute/relative/ULP tolerances, NaN/signed-zero, branch quantization, backend provenance, and cache namespace.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-170` / `WS-QUALITY`
- **Contract/version consequence:** new numerical profile
- **Regression tests:**
  - future numerical conformance corpus

### FR01-031 — Legacy migrated operators require explicit sealed-catalog rebinding

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `migration`
- **Failure scenario:** A legacy type/version is assigned a synthetic digest and executed as if it had authoritative historical semantics.
- **Affected files/contracts:** `src/core/project-schema.ts; migration UI/runtime`
- **Repair:** Prevent execution while blocking loss exists; show preserved source, choose compatible catalog definition, record signed rebinding receipt, or keep read-only.
- **ADR:** [`0019-project-v3-canonical-compatibility-and-loss-aware-migration.md`](adr/0019-project-v3-canonical-compatibility-and-loss-aware-migration.md)
- **Backlog owner:** `AGL-173` / `WS-RUNTIME`
- **Contract/version consequence:** workflow
- **Regression tests:**
  - future migration/catalog torture tests

### FR01-032 — Physical package profile and iCloud/File Provider conflict behavior remain unproven

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `native-persistence`
- **Failure scenario:** Web archive and native directory package produce different logical files or two offline edits overwrite one another without preserving both versions.
- **Affected files/contracts:** `native package adapter; browser archive adapter; DR-12 POA`
- **Repair:** Prove identical logical member set/digest, single-writer policy, conflict preservation, rename/move/eviction, hostile archive, and rollback.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-167` / `WS-NATIVE`
- **Contract/version consequence:** implementation/evidence
- **Regression tests:**
  - future browser/native package POA

### FR01-033 — Transport generation cutover and runtime graph failure behavior are contracts without production state machines

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `audio-runtime`
- **Failure scenario:** A valid document edit compiles late; the UI shows new graph while old audio keeps playing silently, or stale worklet events fire after seek.
- **Affected files/contracts:** `transport; audio backend; graph candidate/active plan state`
- **Repair:** Implement project/transport epochs, last-valid/candidate/armed/active plan states, exact effective frame, failure/mute scope, tail policy, and telemetry.
- **ADR:** [`0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md`](adr/0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md)
- **Backlog owner:** `AGL-177` / `WS-AUDIO`
- **Contract/version consequence:** implementation
- **Regression tests:**
  - future model tests and audio cutover tests

### FR01-034 — Real-time callback boundary is not yet mechanically enforced

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `audio-realtime`
- **Failure scenario:** An agent calls graph evaluation, allocates provenance, logs, parses JSON, or locks from AudioWorklet/native render callback, causing glitches or deadlocks.
- **Affected files/contracts:** `AudioWorklet/native audio modules; code ownership rules`
- **Repair:** Restrict render path to bounded preallocated queue/voice/DSP code, add static dependency checks and stress tests, and keep domain core off real-time thread.
- **ADR:** [`0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md`](adr/0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md)
- **Backlog owner:** `AGL-178` / `WS-AUDIO`
- **Contract/version consequence:** implementation
- **Regression tests:**
  - future architecture lint and underrun stress

### FR01-035 — Generated identity capability is not yet proven for every operator/lab

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `generated-identity`
- **Failure scenario:** Sparse exceptions or persistent selections target an output whose topology/key changes under parameter edits, then silently affect the wrong event/tile.
- **Affected files/contracts:** `operator metadata; each lab fixtures`
- **Repair:** Require stable/successor-mapped/ephemeral declaration, key schema/version, metamorphic identity tests, and capability-gated UI actions.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-159` / `WS-RUNTIME`
- **Contract/version consequence:** operator metadata completion
- **Regression tests:**
  - future per-operator identity fixture corpus

### FR01-036 — Source-byte preservation and canonical semantic digest serve different purposes

- **Severity:** Medium
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `migration`
- **Failure scenario:** Canonicalization destroys original bytes needed for forensic migration receipts, while raw byte hash cannot identify semantic equality.
- **Affected files/contracts:** `src/core/project-schema.ts; package repository`
- **Repair:** Persist source bytes/hash separately from normalized project semantic digest; never use one as a substitute for the other.
- **ADR:** [`0019-project-v3-canonical-compatibility-and-loss-aware-migration.md`](adr/0019-project-v3-canonical-compatibility-and-loss-aware-migration.md)
- **Backlog owner:** `AGL-172` / `WS-RUNTIME`
- **Contract/version consequence:** contract clarified
- **Regression tests:**
  - migration receipt source/target digest fixture

### FR01-037 — Command field preconditions need a versioned canonical path vocabulary

- **Severity:** Medium
- **Status:** `open-owned`
- **Domain:** `commands-history`
- **Failure scenario:** Free-form string paths change meaning after schema migration, making stale guards or future collaboration unsafe.
- **Affected files/contracts:** `src/core/commands.ts; command schemas`
- **Repair:** Define field/path IDs by command payload schema, migrate versions explicitly, and forbid arbitrary JSON pointer mutation commands.
- **ADR:** [`0020-command-v2-atomic-application-and-history.md`](adr/0020-command-v2-atomic-application-and-history.md)
- **Backlog owner:** `AGL-174` / `WS-RUNTIME`
- **Contract/version consequence:** command payload evolution
- **Regression tests:**
  - future command path fixture corpus

### FR01-038 — Exact and profile-numeric cache results require separate compatibility rules

- **Severity:** Medium
- **Status:** `open-owned`
- **Domain:** `cache`
- **Failure scenario:** A raw floating result from one engine is reused under another backend/profile and changes threshold or event decisions.
- **Affected files/contracts:** `evaluation cache; numerical profile; provenance`
- **Repair:** Use backend-independent exact keys only for exact/canonical outputs; include numerical profile/backend/build for raw numeric results until canonicalized.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-170` / `WS-QUALITY`
- **Contract/version consequence:** cache namespace
- **Regression tests:**
  - future cache cross-backend tests

### FR01-039 — MIDI runtime I/O and Standard MIDI File export could be conflated

- **Severity:** Medium
- **Status:** `open-owned`
- **Domain:** `midi`
- **Failure scenario:** Web/native live device timestamps, permissions, UMP/MIDI2 resolution, and SMF quantization are handled as one API and silently lose resolution or clock meaning.
- **Affected files/contracts:** `AGL-048; AGL-130; native Core MIDI adapter`
- **Repair:** Keep ephemeral runtime I/O separate from canonical export; preserve UMP resolution natively, map clocks explicitly, and disclose SMF quantization.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-180` / `WS-AUDIO`
- **Contract/version consequence:** implementation
- **Regression tests:**
  - future MIDI fixtures/hardware matrix

### FR01-040 — Pinned toolchain exists but dependency lock and connected install proof remain incomplete

- **Severity:** Medium
- **Status:** `open-owned`
- **Domain:** `build-reproducibility`
- **Failure scenario:** A local agent resolves a different transitive dependency or uses an unreviewed global toolchain, producing nonreproducible output despite passing source tests.
- **Affected files/contracts:** `package.json; program/toolchain-lock.json; future package-lock.json/CI`
- **Repair:** Run connected npm install, commit lockfile/integrity metadata, enforce exact Node/npm/TS/Swift CI images, license/SBOM, and clean-build receipts.
- **ADR:** [`0018-performance-and-shared-core-evidence-gates.md`](adr/0018-performance-and-shared-core-evidence-gates.md)
- **Backlog owner:** `AGL-136` / `WS-QUALITY`
- **Contract/version consequence:** build gate
- **Regression tests:**
  - future connected CI clean build

### FR01-041 — Canonical encoding admitted hidden JavaScript state and malformed Unicode ambiguity

- **Severity:** High
- **Status:** `fixed`
- **Domain:** `canonicalization`
- **Failure scenario:** Two values that look identical through normal enumeration can carry accessors, symbol keys, non-enumerable properties, sparse/custom arrays, or lone surrogates and therefore hash or execute inconsistently across JavaScript, UTF-8 encoders, and Swift.
- **Affected files/contracts:** `src/core/canonical.ts; agl-canonical-value-v1; sha256-canonical-v1`
- **Repair:** Reject unsupported object shapes and hidden state, validate Unicode scalar well-formedness, enforce depth/node/string/collection/encoded-byte limits, and test SHA parity across block boundaries.
- **ADR:** [`0021-canonical-identity-prng-and-tempo-semantics.md`](adr/0021-canonical-identity-prng-and-tempo-semantics.md)
- **Backlog owner:** `AGL-187` / `WS-QUALITY`
- **Contract/version consequence:** canonical-value-v1 behavior clarified and fail-closed without reinterpreting accepted values
- **Regression tests:**
  - FR-01 canonical hidden-state/Unicode/limit rejection
  - FR-01 SHA-256 Node parity across block boundaries

### FR01-042 — Authoritative JSON could be interpreted differently because duplicate keys, unsafe integers, or malformed UTF-8 were accepted

- **Severity:** Critical
- **Status:** `fixed-contract-owned-cross-platform`
- **Domain:** `json-trust-boundary`
- **Failure scenario:** One reader accepts the first duplicate key, another the last, and another rejects it; or a large integer/lone surrogate changes during decode, allowing schema, hash, project ID, or package metadata substitution.
- **Affected files/contracts:** `src/core/strict-json.ts; src/core/project-package.ts; schemas/*; native import boundary`
- **Repair:** Introduce strict UTF-8 JSON parsing with duplicate-member, unsafe-integer, malformed-Unicode, trailing-data, depth/node/collection limits before schema/runtime validation; require native parity.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-179` / `WS-RUNTIME`
- **Contract/version consequence:** new agl-strict-json-v1 trust-boundary contract
- **Regression tests:**
  - FR-01 strict JSON duplicate key/unsafe integer/malformed UTF-8 corpus
  - public schema validation

### FR01-043 — Graph compatibility compared only coarse port labels and omitted complete dimension semantics

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `graph-type-system`
- **Failure scenario:** UI/compiler accepts a connection whose value kind matches but measurement model, unit, circular period, domain categories/bounds, or missing-value policy differs, producing plausible but semantically invalid mappings.
- **Affected files/contracts:** `src/core/graph.ts; operator port DimensionSpec; UI compatibility service`
- **Repair:** Hash and compare complete dimension semantics and make the compiler compatibility service the sole UI/import authority.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-175` / `WS-RUNTIME`
- **Contract/version consequence:** graph compiler v2 compatibility semantics hardened
- **Regression tests:**
  - FR-01 full dimension-domain compatibility cases

### FR01-044 — Worker results could self-declare an exact determinism class and poison exact caches

- **Severity:** Critical
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `worker-cache-integrity`
- **Failure scenario:** A compromised, stale, or buggy worker marks profile-numeric/render-only output as exact, causing backend-dependent values to enter backend-independent cache keys and later publish as authoritative.
- **Affected files/contracts:** `src/core/derivation.ts; src/core/evaluation-protocol.ts; evaluation request/result v2`
- **Repair:** Make determinism class host-owned from the sealed operator/catalog contract; worker results echo it only for mismatch detection and cannot promote cache semantics.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-176` / `WS-RUNTIME`
- **Contract/version consequence:** evaluation protocol v2 host authority clarified
- **Regression tests:**
  - FR-01 host-owned determinism-class mismatch rejection
  - cache policy tests

### FR01-045 — Custom transaction cloning could retain references to authoritative nested state

- **Severity:** High
- **Status:** `fixed`
- **Domain:** `command-atomicity`
- **Failure scenario:** A custom clone function returns a shallow copy; a failing handler mutates nested authoritative state before the transaction is rejected, violating atomicity despite clone-first architecture.
- **Affected files/contracts:** `src/core/commands.ts; command v2 transaction executor`
- **Repair:** Validate deep graph independence between pre-state, clone, and committed result; reject aliasing custom clones.
- **ADR:** [`0020-command-v2-atomic-application-and-history.md`](adr/0020-command-v2-atomic-application-and-history.md)
- **Backlog owner:** `AGL-174` / `WS-RUNTIME`
- **Contract/version consequence:** command v2 extension seam hardened
- **Regression tests:**
  - FR-01 shallow custom clone rejection and authoritative-state preservation

### FR01-046 — Audio plan runtime, schema, and canonicalization limits disagreed

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `audio-plan-bounds`
- **Failure scenario:** A plan passes JSON Schema but runtime rejects it, or runtime accepts a plan that exhausts canonicalization memory, causing browser/native/offline differential behavior and denial of service.
- **Affected files/contracts:** `src/core/render-plan.ts; schemas/agl-resolved-audio-plan-v2.schema.json; canonical encoder limits`
- **Repair:** Align collection ceilings, lower event limits to bounded MVP values, apply audio-specific canonical limits, and validate plan/schema fixtures together.
- **ADR:** [`0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md`](adr/0022-resolved-audio-plan-v2-and-generation-epoch-cutover.md)
- **Backlog owner:** `AGL-177` / `WS-AUDIO`
- **Contract/version consequence:** resolved audio plan v2 safety limits clarified
- **Regression tests:**
  - FR-01 audio-plan schema/runtime collection limit parity
  - resolved plan canonical-size rejection

### FR01-047 — Canonical digest and resolved plans are whole-value in-memory operations

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `large-artifact-boundedness`
- **Failure scenario:** A legitimate large project or long export stays below per-collection caps but still requires duplicate whole-object canonical bytes and a whole plan in memory, causing OOM or long uninterruptible work.
- **Affected files/contracts:** `src/core/canonical.ts; src/core/render-plan.ts; export pipeline; package writer`
- **Repair:** Define streaming canonical digest equivalence and deterministic plan/export fragmentation with bounded memory, resumable cancellation, stable fragment IDs, and whole-value compatibility fixtures.
- **ADR:** [`0021-canonical-identity-prng-and-tempo-semantics.md`](adr/0021-canonical-identity-prng-and-tempo-semantics.md)
- **Backlog owner:** `AGL-190` / `WS-RUNTIME`
- **Contract/version consequence:** future streaming canonical/profile and plan-fragment contract
- **Regression tests:**
  - future streaming-vs-whole digest equivalence corpus
  - future fragmented-vs-whole plan/export equivalence and cancellation tests

### FR01-048 — Operator semantic metadata digest does not prove evaluator implementation identity

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `operator-versioning`
- **Failure scenario:** An agent changes executable operator behavior but leaves type, semantic version, metadata, and digest projection unchanged; projects and caches appear compatible while outputs drift.
- **Affected files/contracts:** `src/core/operator.ts; src/operators/*; sealed catalog; release evidence`
- **Repair:** Create implementation-conformance receipts binding evaluator build/source identity to operator type/version/digest and accepted golden/property fixtures; fail release on behavior change without version advance.
- **ADR:** [`0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md`](adr/0024-evaluation-protocol-graph-compilation-and-cross-platform-conformance.md)
- **Backlog owner:** `AGL-189` / `WS-RUNTIME`
- **Contract/version consequence:** new operator implementation-conformance receipt contract
- **Regression tests:**
  - future evaluator mutation test
  - future operator receipt/source-build/fixture verification

### FR01-049 — Export manifest validation did not prove it described the actual artifact bytes

- **Severity:** High
- **Status:** `fixed-contract-owned-implementation`
- **Domain:** `export-integrity`
- **Failure scenario:** A manifest passes validation while the produced WAV/MIDI/MusicXML/archive has different bytes, media type, or length, allowing accidental or malicious substitution after semantic checks.
- **Affected files/contracts:** `src/core/export.ts; agl-export-manifest-v1; future codecs`
- **Repair:** Verify actual bytes, byte count, media type, and SHA-256 against the completed manifest before release or download.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-180` / `WS-QUALITY`
- **Contract/version consequence:** export manifest v1 completion semantics hardened
- **Regression tests:**
  - FR-01 export actual-byte hash/length/media verification

### FR01-050 — Accessibility and claim runtime vocabularies could drift from their JSON schemas and registers

- **Severity:** High
- **Status:** `fixed-contract-owned-integration`
- **Domain:** `accessibility-claims`
- **Failure scenario:** Schema accepts a role/surface/claim class that runtime silently handles differently, or release code omits the declared claim vocabulary, creating inaccessible actions or unauthorized copy.
- **Affected files/contracts:** `src/core/accessibility.ts; src/core/claims.ts; schemas/agl-accessibility-mirror-v1.schema.json; schemas/agl-claim-register-v1.schema.json; program/claim-register.json`
- **Repair:** Validate runtime enum vocabularies and top-level register metadata, add a public claim-register schema, and include both contracts in schema/runtime/release verification.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-181` / `WS-PRODUCT`
- **Contract/version consequence:** new public claim-register-v1 schema; accessibility mirror v1 runtime parity hardened
- **Regression tests:**
  - FR-01 accessibility enum runtime rejection
  - FR-01 claim register metadata/class validation
  - Draft 2020-12 claim-register validation

### FR01-051 — Swift/native project import still relies on ordinary JSONDecoder rather than the strict hostile JSON contract

- **Severity:** High
- **Status:** `open-owned`
- **Domain:** `native-portability-security`
- **Failure scenario:** The browser rejects duplicate keys, malformed Unicode, or unsafe numbers while the native client decodes them differently and opens a semantically different project/package.
- **Affected files/contracts:** `native/AuralGeometryCore; future FileDocument/package adapter; agl-strict-json-v1`
- **Repair:** Implement or wrap a strict byte-level native JSON/package preflight and run the identical accepted/rejected hostile corpus before native editing or execution.
- **ADR:** [`0023-hostile-package-export-accessibility-and-claim-contracts.md`](adr/0023-hostile-package-export-accessibility-and-claim-contracts.md)
- **Backlog owner:** `AGL-191` / `WS-NATIVE`
- **Contract/version consequence:** native agl-strict-json-v1 conformance gate
- **Regression tests:**
  - future Swift strict-JSON duplicate-key/UTF-8/unsafe-integer corpus
  - future web/native hostile-package differential suite

## What FR-01 does not prove

- The current browser demos still bypass portions of the production plan/backend architecture.
- Browser timing, physical-device latency, and realtime/offline audio tolerances remain unmeasured on the target matrix.
- The exact Penrose runtime generator and matching/oracle corpus remain blocked.
- WAV, MIDI, MusicXML, portable archive, and native-directory adapters are not complete production implementations.
- Accessibility contracts do not substitute for adapter implementation and representative-user testing.
- Swift portability tests do not yet prove hostile native JSON/package import parity or AVAudioEngine/iCloud behavior.
- Operator metadata digests do not substitute for implementation-conformance receipts.
- Whole-value canonicalization and plans need a streaming/fragmented profile for very large artifacts.

## Release conclusion

AGL v0.4 is a hardened semantic and reference baseline suitable for controlled parallel implementation. It is intentionally not labeled a completed MVP. Swarms implement the accepted contracts and owned gates; they do not reinterpret the raw research or prototype behavior independently.
