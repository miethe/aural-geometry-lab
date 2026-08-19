> **FR-01 authority notice (2026-08-18):** Read `docs/27-fr01-swarm-handoff-amendment.md` after this document. Where they differ, the v0.4 amendment, ADRs 0019–0024, and `program/fr01-findings-register.json` control.

# Aural Geometry Lab — Local Swarm Implementation Handoff

**Baseline:** 0.3.0  
**Date:** 2026-08-18  
**Objective:** parallelize M1/M2 without semantic forks

## 1. Read order

Every implementation agent reads, in order:

1. `docs/18-wave1-system-integration.md`
2. relevant ADRs in `docs/adr/0006`–`0018`
3. `program/wave1-decision-register.json`
4. relevant public schema/fixture
5. relevant source interface/test
6. original report/packet only for evidence or unresolved detail

The raw research is not a competing specification.

## 2. Merge rules

An agent must escalate rather than independently decide when work changes:

- public project/package/command/operator/render schemas;
- exact arithmetic, stable IDs, RNG, or canonical serialization;
- materialization or generated-identity semantics;
- command/undo/coalescing behavior;
- async acceptance or cache identity;
- audio plan/cutover/late-event semantics;
- cross-platform fixture output;
- scientific/educational claims;
- Penrose topology or Risset v1 semantics;
- accessibility semantics;
- architecture ownership between TS, Swift, Rust/Wasm, React, or audio threads.

## 3. Recommended parallel workstreams

### Stream A — Project and package spine

Owns:

- AGL-010/011/014/015/155/156;
- full project-v2 validator;
- canonical serializer and digest vocabulary;
- sequential migration registry and source-byte preservation;
- logical package member model;
- archive safety and native-directory/browser-archive round trip.

Must not define commands, evaluator behavior, or UI state.

### Stream B — Commands, materials, and session state

Owns:

- AGL-012/027/032/145/157/159;
- project store and transaction history;
- preconditions/inverses/coalescing;
- source recipes/materialization receipts;
- generated identity/exception rules;
- selection/focus/orphan/session models;
- model-based sequence tests.

Consumes Stream A schemas and digest service.

### Stream C — Graph, mapping, and worker runtime

Owns:

- AGL-020–025/035/112/113/158/160;
- executable operator interface;
- compiler/type compatibility service;
- dependency closure;
- worker request/result protocol;
- deterministic cache and budgets;
- mapping operators and traces.

Must keep host orchestration outside optional kernels and audio callbacks.

### Stream D — Audio and P0 lab migration

Owns:

- AGL-041–045/049/060–065/161/162;
- `ResolvedAudioPlan` compiler;
- voice registry;
- Web Audio main-thread scheduler;
- worklet queue/voice path;
- offline backend;
- generation cutover;
- analytic Risset/Euclidean migration;
- browser and listening harnesses.

Uses DR-03 constants as benchmark candidates, never claims.

### Stream E — React studio and accessibility

Owns:

- AGL-030/032–036/050–053/132/140–142/144/149/165;
- React/Vite shell;
- Explore/Compose/Inspect layouts;
- graph/timeline/Inspector adapters;
- shared parameter components;
- semantic state and accessibility projections;
- mockups and visual regression.

UI emits semantic intents; it does not mutate projects or duplicate graph legality.

### Stream F — Exact Penrose

Owns:

- AGL-120–124/163/164;
- artifact recovery/regeneration;
- exact Q(phi) kernel hardening;
- pentagrid generator;
- query/halo/completeness;
- shared-edge adjacency;
- validation/oracles/goldens;
- bounded traversal and mapping features.

May not mark the lab exact from screenshots or tolerance-based topology.

### Stream G — Native proof and cross-platform conformance

Owns:

- AGL-143/146/147/167/168;
- schema-generated/fixture-conformant Swift models;
- document/container/conflict POA;
- ProjectStore/command adapter;
- AVAudioEngine adapter over `ResolvedAudioPlan`;
- process-wide audio/MIDI ownership;
- Euclidean iPad proof.

Must not broaden into full native parity or create native-only project fields.

### Stream H — Quality, claims, and performance

Owns:

- AGL-133–137/166/169–171;
- property/metamorphic/golden/browser/E2E suites;
- evidence/claim registry and content lint;
- benchmark workload manifests;
- license/privacy/import security;
- release-gate reporting.

## 4. Integration order

```text
A: schema/digests/package ─┐
                           ├─► B: commands/materials
                           ├─► C: graph/runtime/mapping
                           └─► G: native document contract

C + A ─► D: audio plan/backends/P0 labs
B + C ─► E: production studio
C + DR-09 artifacts ─► F: Penrose
All streams ─► H: conformance/release evidence
```

## 5. Required PR evidence

Every PR touching semantic behavior includes:

- affected ADR/decision IDs;
- schema/fixture changes;
- migration impact;
- exact versus profile-numeric conformance class;
- deterministic/cache implications;
- accessibility/state implications;
- tests proving success and rejected behavior;
- explicit statement when empirical validation remains outstanding.

## 6. Definition of done by layer

A feature is not “done” because the UI works.

It is done only when:

1. authored semantics are serializable/versioned;
2. command/undo behavior is deterministic;
3. evaluation is bounded and stale-safe;
4. provenance explains the result;
5. real-time/offline/native boundaries agree at the promised conformance level;
6. accessibility has an equivalent semantic path;
7. unsupported claims are absent;
8. project round-trip and migration pass;
9. fixtures prevent language/framework drift.
