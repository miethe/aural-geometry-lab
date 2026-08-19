# FR-01 Validation Report — v0.4.0

- **Date:** 2026-08-18
- **Status:** Repository and clean release-archive extraction validation complete; production browser/audio/native-app acceptance remains outside this gate
- **Scope:** Contract/reference implementation and conformance evidence—not production browser/audio/native-app acceptance

## Automated validation snapshot

| Gate | Result |
|---|---:|
| TypeScript build | **Pass** — exact TypeScript `5.8.3` gate |
| Node/TypeScript tests | **85/85 passed** |
| Swift portable-contract tests | **11/11 passed** |
| Draft 2020-12 schema fixtures/examples | **12/12 passed** |
| FR-01 findings | **51 total: 9 Critical, 37 High, 5 Medium** |
| Critical/High ownership | **46/46 have backlog ID and workstream owner** |
| Backlog integrity | **142 unique items; dependencies/status vocabulary verified** |
| Wave-1 evidence hashes | **Pass** |
| FR-01 schema/fixture hashes | **Pass after manifest regeneration** |
| TypeScript/Swift shared fixture copies | **Pass** |
| Example runtime project validation | **Pass** |
| Accepted FR-01 ADR uniqueness | **6/6: ADR 0019–0024** |
| Clean release-archive extraction and revalidation | **Pass** |
| Static HTTP smoke | **Pass** — 8 authority/schema/fixture/runtime endpoints |

>  ⚠️ **Provenance of the release/smoke rows below (added 2026-08-19).** The "Static HTTP smoke"
>  and deterministic-archive rows describe the **upstream v0.4.0 tree**, not this repository. No
>  smoke script has ever existed at any commit here — `scripts/smoke-http.mjs` was first added on
>  2026-08-19 — and `make-release.py` aborts at every commit in this history, because the manifest
>  expected 228 source files and a pristine clone has 237–238. **These results are not reproducible
>  from this repository and must not be read as current.** Both gates are real and green as of
>  2026-08-19 (9/9 endpoints; archive reproducible over 243 files) — see `npm run check:all`. Do not
>  reconcile this block by renumbering 8 to 9; that would make an unverifiable historical figure
>  look like a present measurement. Tracked as `node_01M0DYDC9B24PXXH2R821Y2QTD`.

The release process repeated `check:all`, Swift conformance, schema validation, and static HTTP smoke from a newly extracted ZIP. Transient package/compiler caches were excluded and the distributable `dist/` tree was regenerated during validation.

## Deterministic release and clean-extraction evidence

| Gate | Result |
|---|---:|
| Independent deterministic archive builds | **Pass — 2/2 archives byte-identical** |
| Archive source/evidence files | **228** |
| Generated-state exclusion | **Pass — no `dist`, `.build`, `.swiftpm`, `node_modules`, or coverage entries** |
| ZIP integrity | **Pass** |
| Clean-extraction `npm run check:all` | **Pass** |
| Clean-extraction Draft 2020-12 validation | **Pass — 12/12** |
| Static HTTP smoke | **Pass — 8/8 endpoints returned non-empty HTTP 200 responses** |

The archive checksum is intentionally emitted beside the ZIP rather than embedded in the repository, avoiding a self-referential release artifact.

## New executable evidence

### Canonical identity and cross-platform determinism

- typed, bounded, cycle-safe canonical-value encoding and SHA-256 vectors;
- tuple-boundary and Unicode stable-ID v2 cases;
- named PRNG v2 stream independence, rejection integer sampling, and cross-language vectors;
- Swift parity for SHA, stable IDs, PRNG, semantic selection v2, project v3, source status, package profiles, exact wire values, Penrose phase, and sample frames.

### Project, migration, and commands

- strict project v3 runtime validation and Draft 2020-12 schema fixture;
- required semantic-extension negotiation and full compatibility envelope;
- semantic digest excludes editorial timestamp/name state;
- duplicate ownership/material-kind/source-recipe/ancestry negative cases;
- loss-aware v1/v2→v3 migration receipt;
- command v2 schema/runtime grammar parity;
- versioned canonical field-path write sets;
- clone-first atomic failure, core inverse validation, stale guards, coalescing, and no-op behavior;
- monotonic multi-level undo/redo re-enveloping;
- failed replay leaves project and history stacks unchanged.

### Graph, runtime, generated material, and caches

- immutable operator semantic/catalog digests excluding editorial copy;
- deterministic compiler digest/type/dimension/cardinality/required-input/cycle behavior;
- duplicate semantic-edge rejection;
- event-budget preflight and long-event loop overlap;
- derivation payload integrity and cache-only stale classification;
- exact/profile-numeric cache namespace separation;
- evaluation protocol unknown-field, hostile-budget, interval, channel, and monotonic-progress validation;
- unresolved source status and full source-recipe binding;
- hash-guarded prepare/commit materialization;
- projection-independent selection and intent-gated orphan reactivation.

### Audio, package, export, accessibility, and claims

- immutable ResolvedAudioPlan v2 schema/runtime agreement;
- separate AudioScheduleBinding v1 fixture;
- absolute start/end sample quantization and minimum-one-frame nonzero event rule;
- terminal tempo-segment and tiny-ramp stability tests;
- hostile package path/member/link/collision/hash/size/compression checks;
- package-contained project semantic verification;
- export source/loss semantics and artifact-byte verification;
- accessibility hierarchy/reachability/order/non-drag/exact-value/state-text/focus invariants;
- trusted evidence gates for claims and claim-register vocabulary validation.

### Domain kernels

- analytic Risset closure, bounded gain semantics, and unsafe ordinal-horizon rejection;
- exact/bounded Penrose identity and query/configuration validation;
- exact `Q(φ)` arithmetic and Float64 projection-overflow boundary.

## Validation commands

```bash
npm run check:all
python scripts/validate-json-schemas.py
swift test --package-path native/AuralGeometryCore
```

`npm run check:all` performs clean/build/test/verify and a clean Swift-package test. The release gate additionally extracts the ZIP to a new directory and repeats validation.

## Deliberately unproven

FR-01 does **not** claim completion of:

- production React timeline/graph/Inspector and accessibility adapters;
- IndexedDB repository and physical package/cloud-conflict implementation;
- real Worker execution/cache/hard-cancellation state machine;
- browser `AudioContext`/AudioWorklet scheduling on physical machines;
- AVAudioEngine native playback/export;
- actual WAV/MIDI/MusicXML codecs;
- exact Penrose patch generation, matching corpus, and independent oracles;
- perceptual Risset acceptance;
- profile-numeric chaos parity;
- representative-user accessibility/usability;
- connected dependency lock, SBOM, and license review.

Each remains explicitly owned in the backlog. Passing contract tests must not be represented as production integration evidence.
