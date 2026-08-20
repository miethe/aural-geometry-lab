# Aural Geometry Lab — AGENTS.md

This file mirrors `CLAUDE.md`'s load-bearing facts for non-Claude harnesses (Codex and others read
only this file, never `CLAUDE.md`). **Update both together** — do not let one drift from the other.

## What this is

A local-first, browser-based "mathematical music studio": one typed operator graph, exact-rational
musical time, deterministic evaluation/caching, and full audio-plan/export provenance, across seven
labs (Euclidean rhythm rings, Risset/Shepard accelerating rhythm, Tonnetz harmonic-lattice walks,
recursive fractal motifs, 1D cellular automata, Lorenz chaotic attractors, Penrose aperiodic
tilings). Current release (v0.4.0, FR-01) is a hardened **contracts + reference-kernel** — not the
production app. The React studio, the Worker-based graph evaluator, and the production audio
scheduler are **not built**. `src/ui/*` is an explicitly disposable native-DOM demo shell — do not
treat it as target architecture.

## Stack

- TypeScript 5.8.3 strict, ESM, Node `>=22.12.0`, npm 10.9.2 tested. No React/Vite/React Flow/
  Three.js/Tone.js installed yet, despite being planned in `docs/02`/`docs/04`.
- Python 3 + `jsonschema` for schema validation/release archiving only — no Python app code.
- Swift 6.1+ (min 6.0.0) in `native/AuralGeometryCore/` — cross-platform conformance fixtures only,
  not a product app.
- `program/toolchain-lock.json` pins TypeScript to exactly `5.8.3`; build fails otherwise.

## Commands — exact, from `package.json`

```
npm install
npm run dev              # scripts/dev.mjs — native-DOM demo at http://localhost:4173
npm run build            # scripts/build.mjs
npm run serve            # scripts/serve.mjs — static preview (PORT env, default 4173)
npm run test             # scripts/test.mjs — every tests/*.test.mjs (108: 98 pass, 10 todo)
npm run schema:validate  # python3 scripts/validate-json-schemas.py — Draft 2020-12 (12/12)
npm run verify           # scripts/verify.mjs — structural/contract + design-token checks
npm run check            # clean && build && test && schema:validate && verify
npm run check:all        # scripts/check-all.mjs — full release gate (see below)
npm run release:archive  # python3 scripts/make-release.py — deterministic release archive
npm run clean            # scripts/clean.mjs
```

`npm run check:all` also runs: Swift tests (14 passed, 1 skipped under AGL-191), 142 backlog-item dependency checks, 51 FR-01
finding-ownership checks (46/46 Critical/High owned), 11 public-contract hash/runtime-validator
checks, Wave-1 evidence-hash/native-fixture-mirror checks, a deterministic release-archive
build/re-extract, and a 9-endpoint static HTTP smoke test. Run it before calling anything "done."
Do not invent commands beyond this list or `scripts/`.

## Real vs. planned

**Built and tested:** `src/core/` (exact-rational time, canonical encoding/hashing/strict JSON,
stable IDs, PRNG v2, project schema v3, semantic commands v2, sealed operator registry, graph
compiler, pattern/event model, tempo-map v1, resolved-audio-plan v2 model, materialization,
export/accessibility/claim models); `src/operators/` (Euclidean, Risset, Tonnetz, fractal, cellular,
chaos kernels); `src/geometry/` (exact `Q(φ)`, bounded Penrose identity/topology); `src/labs/`
(seven lab wrappers); `src/audio/` (four demonstrator modules — Euclidean, Risset,
note-sequence, plus runtime — wired into 6 of 7 labs; only Penrose has no player); `src/ui/` (a
native-DOM SPA with its own hash router — disposable as ARCHITECTURE, but it is built, it works,
and it is deployed: see Deployment below). 15 versioned JSON Schemas,
12 conformance fixtures, 11 Swift conformance tests, 5 example project files.

**Specified, not implemented:** React/Vite/React Flow/Three.js/Tone.js studio (timeline, mixer,
typed visual graph editor, mathematical inspector, guided-experiment player); IndexedDB persistence/
autosave/recovery; Worker-based graph evaluator (cache/budgets are data contracts today, not an
enforcing runtime); `ResolvedAudioPlan`-driven scheduler, AudioWorklet bridge, offline
(OfflineAudioContext) renderer; real MIDI/WAV/MusicXML export codecs; exact Penrose patch generator/
adjacency graph/traversal engine (placeholder UI is intentional, AGL-124); accessibility UI beyond
the `accessibility.ts` data model; native iPad/SwiftUI app (stretch milestone M7 only).

**CI now exists** (2026-08-19): `.github/workflows/ci.yml`, two jobs, green on `main`.
`package-lock.json` is committed, so risk R-24's stated mitigation is complete.

## Deployment — it is running

An internal LAN host on port 3060 — address in the AOS node inventory, deliberately not recorded in
this public repo. Runs as `aural-geometry-lab.service` (systemd --user), serving a `dist/` build of
this repo via `scripts/serve.mjs` bound to `0.0.0.0:3060`. Verified 2026-08-19: served
`/src/app.js` is byte-identical to a local build, all seven lab routes return 200, 6 of 7 labs are
audible, no persistence, 3 aria/role attributes total.

**This is the regression bar for AGL-144.** The React studio is a REPLACEMENT for a working app,
not a greenfield build; no backlog item states that bar yet
(`node_01M0DX6B8638F4JYXM4AMTRE82`). Deployment is operated out-of-band — there is no deploy
automation in this repo, which is why nothing in `docs/` described it.

## Validation regime

- `schemas/` — 15 versioned Draft 2020-12 JSON Schemas, one per public contract.
- `conformance/` — fixtures/examples validated against those schemas, plus FR-01
  (`conformance/fr01/`), FR-02 (`conformance/fr02/`) and Wave-1 (`conformance/wave1/`) hostile
  corpora, mirrored in Swift
  (`native/AuralGeometryCore/`) to prove cross-language parity.
- `tests/core.test.mjs` + `fr01.test.mjs` + `fr02.test.mjs` — 108 Node-native tests, 98 passing and
  10 owner-tagged `todo` gates in fr02 (rational arithmetic, pattern
  timing, operator kernels, stable IDs/PRNG, registry versioning, plus the FR-01 hostile suite:
  strict JSON, canonical digest, migration receipts, materialization, selection v2, package v2,
  export manifest, accessibility mirror, claim register, evaluation-protocol v2, audio-plan v2).
- **Claim register** (`src/core/claims.ts`, schema `agl-claim-register-v1`): any psychoacoustic or
  mathematical claim requires a trusted evidence record — caller-supplied evidence strings cannot
  unlock a claim.
- **FR-01 gates**: `program/fr01-findings-register.json` (51 findings, 46/46 Critical/High owned)
  and `program/fr01-contract-manifest.json` (11 pinned contract hashes) are enforced by
  `npm run check:all`. Any semantic change (public schema, exact-arithmetic/ID/RNG semantics,
  command/undo, render-plan/cutover, cross-platform fixtures, scientific/accessibility claims)
  requires the matching ADR (`docs/adr/`, 0006–0024) plus the PR evidence set in
  `docs/27-fr01-swarm-handoff-amendment.md`.
- Authority order on conflict: math/standards invariants → FR-01 ADRs + findings register →
  language-neutral schemas/fixtures → hardened reference implementation → Wave-1 research/product
  defaults. `program/*.json` is the machine-readable authority over narrative docs.

## Schema-versioning rule (binding)

`schemas/` holds coexisting versions side by side (`agl-project-v2`/`v3`, `agl-command-v1`/`v2`,
`agl-resolved-audio-plan-v1`/`v2`, `agl-package-manifest-v1`/`v2`). **Never edit a published schema
in place.** Add a new version, write a migration path (`agl-migration-receipt-v2.schema.json`,
`src/core/project-schema.ts`), and keep old-version fixtures passing as migration-only. Any schema
or project-shape change must update `conformance/` fixtures and `examples/` in the same change, or
`npm run schema:validate` / `npm run test` will fail.

## Repo layout

`src/core/` domain kernel · `src/operators/` math kernels + catalog · `src/geometry/` Q(φ)/Penrose ·
`src/audio/` demo adapters · `src/labs/` seven lab wrappers · `src/ui/` disposable native-DOM shell ·
`schemas/` versioned public schemas · `conformance/` fixtures + FR-01 hostile corpus · `native/`
Swift conformance package · `research/` immutable Wave-1 evidence · `design/` design tokens/
components for a future React build · `program/` backlog/milestones/findings/manifests · `docs/`
architecture/UX/ADRs/validation · `examples/` migration + canonical project examples · `tests/`
invariant + hostile regression suite · `scripts/` backing every `npm run` command · `public/` static
assets for `dev`/`serve`.

## AOS integration

Incubating Agentic OS project. Its IntentTree tree is the task graph of record. Artifacts under
`.claude/skills/`, `.claude/agents/`, `.claude/workflows/` are deployed copies from SkillMeat and are
gitignored — reproducible from `.claude/aos-artifacts.yaml` (treat it like `package.json`, and the
deployed dirs like `node_modules`). Never hand-edit a deployed artifact; edit its upstream.
