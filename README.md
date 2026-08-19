# Aural Geometry Lab

A browser-first, native-ready mathematical music studio for hearing, seeing, manipulating, composing with, and explaining structures from rhythm, harmony, geometry, recursion, dynamical systems, and perception.

**Architecture baseline:** `0.4.0`  
**Program state:** M0.9 FR-01 repository hardening complete; M1/M2 production implementation remains controlled and in progress  
**As of:** 2026-08-18

## Current release: FR-01 hardened system

Version 0.4 incorporates the eight Wave-1 Deep Research programs and then applies a repository-wide hostile architecture review across project compatibility, operator semantics, exact time, deterministic identity, graph evaluation, asynchronous races, undo, generated material, audio plans, exports, accessibility, native portability, and scientific claims.

The FR-01 release contains:

- **51 formally registered findings:** 9 Critical, 37 High, and 5 Medium;
- **33 fixed or contract-hardened findings** and **18 open findings with explicit backlog/workstream ownership**;
- **6 new accepted ADRs, ADR 0019–0024**, layered over the Wave-1 ADR set;
- **project v3**, **command v2**, **evaluation protocol v2**, **resolved audio plan v2**, and **logical package v2**;
- canonical SHA-256 semantic encoding, stable-ID v2, named-stream PRNG v2, and exact tempo-map v1;
- strict schema/runtime/fixture differential gates;
- TypeScript and Swift conformance for exact wires, IDs, PRNG streams, sample frames, selections, source status, and project-v3 decoding;
- hostile package, export, accessibility-mirror, and research-claim contracts;
- hardened analytic Risset and exact Penrose identity foundations;
- a 142-item owned implementation backlog and amended swarm sequencing.

## Authority order

When artifacts conflict, use this order:

1. mathematical, standards, and accepted research invariants;
2. FR-01 ADRs and the findings register;
3. language-neutral schemas and conformance fixtures;
4. hardened reference implementation behavior;
5. Wave-1 research documents, product defaults, and visual presentation.

Raw research is retained as evidence. It is not an alternate implementation specification.

## Public contract baseline

| Contract | Current write version | Prior posture |
|---|---:|---|
| Project | `agl-project-v3` | v1/v2 read and migration only |
| Migration receipt | v2 | loss-aware; no clean-upgrade fiction |
| Semantic command | `agl-command-contract-v2` | command v1 migration/legacy only |
| Evaluation request | `agl-evaluation-protocol-v2` | generation/hash/epoch acceptance |
| Resolved audio plan | `agl-resolved-audio-plan-v2` | plan v1 read/legacy only |
| Audio schedule binding | v1 | runtime-only, never project state |
| Logical package | `agl.logical-package.v2` | package v1 legacy only |
| Export manifest | v1 | explicit source and loss semantics |
| Accessibility mirror | v1 | semantic—not visual-only—accessibility |
| Mapping trace | v1 | stage-by-stage explanation/provenance |
| Claim register | v1 | evidence class, qualification, and allowed-use gates |

Semantic versions and pinned schema/fixture hashes are recorded in [`program/fr01-contract-manifest.json`](program/fr01-contract-manifest.json).

## Architectural spine

```text
Project v3 + exact rational/source semantics
                    │
                    ▼
     Semantic command/history boundary
                    │
                    ▼
Sealed operator catalog + deterministic graph compiler
                    │
                    ▼
 Bounded, generation/hash-gated worker evaluation
                    │
                    ▼
 Events / controls / geometry + structured provenance
                    │
                    ▼
 Exact beat → deterministic ideal seconds resolution
                    │
                    ▼
        Immutable ResolvedAudioPlan v2
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
 Runtime schedule binding   Offline/export adapter
 Web Audio / Worklet        future AVAudioEngine
```

The product remains one studio with **Explore, Compose, and Inspect** workspaces over the same project, graph, selection, transport, and command history.

Generated output is never silently edited in place. A user must edit its generator, add a downstream transform/exception where stable identity permits it, fork it, or materialize a bounded snapshot.

## Executable foundation

The repository currently implements and tests:

- canonical typed encoding, SHA-256, strict JSON parsing, hostile bounds, and exact rationals;
- project-v3 compatibility validation, semantic digesting, source recipes, materialization receipts, and loss-aware migration;
- sealed/versioned operator definitions and deterministic graph compilation;
- semantic transactions, clone-first atomicity, core-generated inverses, history replay, and edit-session coalescing;
- half-open interval-query patterns, preflight event budgets, and long-event loop overlap;
- project-epoch/scope/channel/generation/hash-gated derivation and cache identity;
- projection-independent selection and intent-gated generated orphan semantics;
- exact beat-to-seconds tempo resolution and one-time absolute sample-frame quantization;
- hostile package member validation, export manifests, accessibility semantic mirrors, and trusted claim gates;
- Euclidean, Risset, Tonnetz, recursive motif, elementary cellular automata, Lorenz RK4, and exact `Q(φ)` foundations;
- bounded Penrose identities, certified default phase/query contracts, and exact topology projection boundaries;
- Swift portable-contract fixtures for the cross-platform subset.

## Validation snapshot

The release-grade command is:

```bash
npm run check:all
```

It currently passes:

- **85/85 TypeScript/Node tests**;
- **14 Swift tests passing** (1 skipped: AGL-191 strict-byte parser);
- **12/12 Draft 2020-12 public JSON Schema fixtures/examples**;
- 142 backlog-item dependency checks;
- 51 finding ownership/status checks, including 46/46 Critical/High ownership checks;
- 11 public-contract hash and runtime-validator checks;
- Wave-1 research evidence hashes and native fixture mirrors;
- clean release-archive extraction/revalidation and eight-endpoint static HTTP smoke.

See [`docs/26-fr01-validation-report.md`](docs/26-fr01-validation-report.md).

## Run locally

### Prerequisites

- Node.js `>=22.12`
- TypeScript 5.8.3, preferably from `npm install`
- Python 3 with `jsonschema`
- Swift 6.1+ for native conformance tests

```bash
npm install
npm run check:all
npm run dev
```

Open `http://localhost:4173`.

Static preview:

```bash
npm run build
npm run serve
```

A browser user gesture is required before audio starts. **Stop all audio** remains globally reachable.

## Repository map

```text
src/
  core/          project, canonical values, commands, graph, evaluation,
                 mapping, materialization, audio plans, export, accessibility
  operators/     mathematical and mapping foundations
  geometry/      exact Q(phi) and Penrose contracts
  audio/         current browser demonstrator adapters
  labs/          seven lab surfaces
  ui/            current dependency-light shell
schemas/         versioned public JSON Schemas
conformance/     language-neutral fixtures and FR-01 hostile corpus
native/          Swift portable-contract package
research/        immutable Wave-1 evidence and remaining research charters
design/          design tokens, components, interactions, and screens
program/         backlog, milestones, findings, decisions, claims, manifests
docs/            architecture, UX, ADRs, validation, and swarm handoff
examples/        legacy/migration examples and canonical project-v3 example
tests/           TypeScript invariants and hostile regression suite
```

## Essential documents

### FR-01 authority

- [Whole-system adversarial repository review](docs/24-fr01-whole-system-adversarial-repository-review.md)
- [Findings register](program/fr01-findings-register.json)
- [Contract and migration amendment](docs/25-fr01-contract-and-migration-amendment.md)
- [Contract manifest](program/fr01-contract-manifest.json)
- [Validation report](docs/26-fr01-validation-report.md)
- [Swarm handoff amendment](docs/27-fr01-swarm-handoff-amendment.md)
- [ADR 0019–0024](docs/adr/)

### Wave-1 authority and design

- [System-wide research integration](docs/18-wave1-system-integration.md)
- [Cross-run decision register](program/wave1-decision-register.json)
- [Integrated UI/UX amendment](docs/19-ui-ux-wave1-integrated-amendment.md)
- [Interaction state-machine baseline](docs/21-interaction-state-machine-conformance.md)
- [Full UI/UX specification](docs/13-ui-ux-final-design-spec.md)
- [Native Apple stretch architecture](docs/14-native-apple-stretch-architecture.md)
- [Frontier-model runbook](docs/17-frontier-model-runbook.md)
- [Implementation report](IMPLEMENTATION_REPORT.md)

## Deliberate limits

This is a hardened architecture/reference release, **not the completed production MVP**.

Still open and explicitly owned:

- production project repository, IndexedDB/native package adapters, source-byte preservation, and cloud-conflict proof;
- complete command handlers, history store, React timeline/graph/Inspector integration, and model-based interaction testing;
- real Worker compiler/evaluator/cache/budget implementation and hard-cancellation behavior;
- production audio-plan compiler, voice registry, Web Audio scheduler, AudioWorklet protocol, offline renderer, and physical browser/device benchmarks;
- migration of the playable Risset demonstrator from its legacy scheduler to the analytic plan path and perceptual acceptance;
- exact Penrose patch generator, independent oracles, matching corpus, and traversal acceptance;
- real WAV/MIDI/MusicXML codecs and loss manifests;
- claim-registry wiring into all product copy;
- profile-numeric conformance for chaos and other floating workloads;
- operator implementation-conformance receipts that prevent code drift under unchanged versions;
- streaming canonical digests and fragmented audio/export plans for large projects;
- native strict-JSON and hostile package-import parity with the browser;
- representative-user accessibility/usability studies;
- native iPad Files/iCloud, AVAudioEngine, MIDI, adaptive-UI, and physical-device proof;
- streaming canonical digest/render-plan/export for large bounded workloads;
- evaluator implementation receipts beyond operator metadata digests;
- strict native hostile-JSON/package import parity;
- dependency lock, SBOM, license, and connected-install review.

No unmeasured performance, perceptual success, cross-browser PCM identity, exact Penrose runtime completion, or native readiness is claimed.

## License posture

This project is released under the **MIT License** (see [`LICENSE`](LICENSE)); the license was selected on 2026-08-18, superseding the
earlier "treat as private" posture.

Two review items remain open and are **not** settled by the license choice — they are tracked in the delivery plan as **M6.5**
(dependency/license review + SBOM):

- **Third-party dependencies** — no lockfile-driven dependency/license review or SBOM has been produced yet (risk R-09).
- **Bundled audio samples** — no sample ships in this repository today. Any sample added later needs its distribution rights
  confirmed before it is committed; MIT on this repository does not grant rights to third-party sample content (risk R-10).
