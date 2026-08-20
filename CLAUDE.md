# Aural Geometry Lab — CLAUDE.md

Aural Geometry Lab (AGL) is a local-first, browser-based "mathematical music studio": one typed
operator graph, exact-rational musical time, deterministic evaluation/caching, and full
audio-plan/export provenance, exposed through seven curated labs (Euclidean rhythm rings, Risset/
Shepard accelerating rhythm, Tonnetz harmonic-lattice walks, recursive fractal motifs, 1D cellular
automata, Lorenz chaotic attractors, Penrose aperiodic tilings). Audience: curious explorers, music
learners/educators, composer/producers, and creative coders/researchers.

**Read this before writing code here.** Two things are true at once, and conflating them has
already produced wrong answers:

1. **A working app exists and is deployed.** `src/ui/*` compiles to a real single-page app with its
   own hash router (`app-shell.ts`, `hashchange` → `#/<lab.id>`), all seven labs reachable and six
   of them audible. It runs on the LAN — see "Deployment" below. It is *not* a mockup, and "there is
   no web app" is a false statement about this repository.
2. **It is not the target architecture.** The repo is a hardened *contracts + reference-kernel*
   release (v0.4.0, FR-01 complete). The production React studio, the Worker-based graph evaluator,
   and the production audio scheduler are **not built**. `src/ui/*` is an explicitly disposable
   native-DOM shell (ADR/roadmap) — do not extend it as if it were the studio.

The practical consequence: **AGL-144 (React production shell) is a replacement, not a greenfield
build.** Whatever ships has to not regress what is already serving. No backlog item states that bar
yet (`node_01M0DX6B8638F4JYXM4AMTRE82`).

## Tech stack

- TypeScript 5.8.3 (strict), ESM (`"type": "module"`), Node `>=22.12.0` (tested 22.16.0), npm
  (tested 10.9.2). `devDependencies` is TypeScript-only — no React/Vite/React Flow/Three.js/Tone.js
  yet, even though docs/02 and docs/04 plan them.
- Python 3 + `jsonschema` — schema validation and release archiving only, no app code.
- Swift 6.1+ (tested 6.2.1, min 6.0.0), SwiftPM package `native/AuralGeometryCore/` — cross-platform
  conformance fixtures only (canonical encoding v2, wire cases, PRNG v2, selection, material-status,
  audio-frame, Penrose default-phase certificate). Not a product app.
- `program/toolchain-lock.json` pins the compiler: build fails if the discovered TypeScript is not
  exactly `5.8.3` (a local install wins; a global one is accepted only if no local compiler exists
  and matches exactly).

## Commands (all in `package.json`, delegating to `scripts/*.mjs|py`)

| Command | What it actually does |
|---|---|
| `npm install` | Installs the (TypeScript-only) toolchain. |
| `npm run dev` | `scripts/dev.mjs` — serves the native-DOM demo shell at `http://localhost:4173`. |
| `npm run build` | `scripts/build.mjs` — compiles `src/` with the pinned TypeScript. |
| `npm run serve` | `scripts/serve.mjs` — static preview server over a built output (`PORT` env, default 4173). |
| `npm run test` | `scripts/test.mjs` — runs every `tests/*.test.mjs` (Node's native test runner). Currently 108 declared: 98 pass, 10 owner-tagged `todo` gates in `fr02.test.mjs`. |
| `npm run schema:validate` | `python3 scripts/validate-json-schemas.py` — Draft 2020-12 validation of every `schemas/*.schema.json` against its `conformance/` fixtures/examples. Currently 12/12. |
| `npm run verify` | `scripts/verify.mjs` — structural/contract checks, including design-token presence (`design/tokens.json`). |
| `npm run check` | `clean && build && test && schema:validate && verify` — the dev-loop gate. |
| `npm run check:all` | `scripts/check-all.mjs` — the release-grade gate: everything in `check`, plus Swift tests (14 passed, 1 skipped under AGL-191), 142 backlog-item dependency checks, 51 FR-01 finding-ownership checks (46/46 Critical/High owned), 11 public-contract hash/runtime-validator checks, Wave-1 evidence-hash and native-fixture-mirror checks, a deterministic release-archive build/re-extract (`scripts/release-check.mjs`), and a 9-endpoint static HTTP smoke test (`scripts/smoke-http.mjs`). |
| `npm run release:archive` | `python3 scripts/make-release.py` — builds a deterministic, reproducible release archive. Its file list comes from `git ls-files`, so `.gitignore` governs what ships; a filesystem walk previously swept gitignored local state (including `.claude/`) into a public artifact. |
| `npm run clean` | `scripts/clean.mjs` — clears build output. |

`npm run check:all` is the command to run before claiming anything is "done." Do not invent
commands not listed above or in `scripts/`.

## Architecture — what exists today

1. **Canonical domain kernel** (`src/core/`) — exact-rational beat time (`rational.ts`,
   `tempo-map.ts`); interval-queried events/patterns (`events.ts`, `pattern.ts`); the typed/versioned/
   sealed operator model and acyclic graph compiler (`operator.ts`, `graph.ts`); semantic
   commands/undo (`commands.ts`); canonical encoding/hashing/strict JSON (`canonical.ts`,
   `strict-json.ts`); named-stream deterministic PRNG and stable IDs (`random.ts`); project schema
   v3 + migration (`project-schema.ts`); portable package format (`project-package.ts`);
   materialization/source-recipe model (`materialization.ts`); evaluation-protocol envelope
   (`evaluation-protocol.ts`); resolved-audio-plan model (`render-plan.ts`); export/accessibility-
   mirror/claim-gate models (`export.ts`, `accessibility.ts`, `claims.ts`); plus `derivation.ts`,
   `interaction.ts`, `mapping.ts`, `semantics.ts` helpers.
2. **Operators** (`src/operators/`) — pure mathematical kernels: `euclidean.ts`, `risset.ts`,
   `tonnetz.ts`, `fractal.ts`, `cellular.ts`, `chaos.ts`, plus `catalog.ts` (the sealed registry).
3. **Labs** (`src/labs/`) — one wrapper module per lab (`euclidean-rings-lab.ts`,
   `infinite-staircase-lab.ts`, `tonnetz-walk-lab.ts`, `fractal-motif-lab.ts`,
   `cellular-automaton-lab.ts`, `chaos-attractor-lab.ts`, `penrose-sequencer-lab.ts`) over a shared
   `catalog.ts`/`types.ts`.
4. **Geometry** (`src/geometry/`) — exact `Q(φ)` arithmetic (`qphi.ts`) and bounded Penrose-tiling
   identity/topology foundations (`penrose.ts`). The exact tiling *generator* is not built
   (research-gated behind DR-09).
5. **Audio** (`src/audio/`) — `audio-runtime.ts`, `euclidean-player.ts`, `risset-player.ts`,
   `note-sequence-player.ts`: ad hoc browser demonstrators covering 6 of 7 labs — every lab except
   Penrose instantiates a player. This is not the planned `ResolvedAudioPlan`-driven scheduler.
6. **UI** (`src/ui/`) — dependency-light native DOM shell (`app-shell.ts`, `dashboard.ts`,
   `lab-layout.ts`, `controls.ts`, `dom.ts`). Disposable; do not build the production studio on it.

### Planned, not built

- The React + Vite + React Flow (typed node editor) + Canvas/SVG studio with Explore/Compose/Inspect
  workspaces, timeline/mixer, linked timeline/inspector/canvas selection, accessibility projections.
- Worker-based graph evaluator (cache/budgets are data contracts in `render-plan.ts`/
  `evaluation-protocol.ts`; no actual `Worker` execution runtime exists yet).
- Production `ResolvedAudioPlan`-driven scheduler, AudioWorklet bridge, offline
  (OfflineAudioContext) renderer.
- Real MIDI, WAV, and MusicXML export codecs (schemas/contracts exist; codecs do not).
- Exact Penrose patch generator, adjacency graph, traversal engine (the placeholder UI is
  intentional — AGL-124).
- IndexedDB persistence/autosave/recovery, a project command bus wired to a UI, undo/redo UI.
- Accessibility implementation beyond the `accessibility.ts` data model. The shipped demo shell
  carries only 3 aria/role attributes total; the keyboard/focus/reduced-motion work is specified
  against the *production* UI, which does not exist yet.
- Native iPad/SwiftUI app (only the SwiftPM conformance-fixture package exists) — explicit stretch
  milestone M7, not committed MVP scope.
- ~~CI configuration~~ — **built 2026-08-19.** `.github/workflows/ci.yml` runs `check:all` on
  macOS (the Swift conformance package needs it) plus a job proving the Node floor still refuses a
  below-floor runtime. Green on `main`. `package-lock.json` is committed, so risk R-24's mitigation
  is complete.

Full milestone/backlog breakdown: `docs/04-delivery-roadmap.md`, `docs/05-backlog.md`,
`program/program-plan.json`, `program/backlog.json`.

## Deployment — the app is running

**An internal LAN host, port 3060** — the address lives in the AOS node inventory and is
deliberately not recorded in this public repo. It serves a `dist/` build of this repo through
`scripts/serve.mjs`. Verified 2026-08-19: the served `/src/app.js` is byte-identical to a local
`npm run build` output, response headers carry `serve.mjs`'s signature (`Cache-Control: no-store`),
and all seven lab routes return 200. `serve.mjs` binds `0.0.0.0`, so any host on the LAN reaches it.

What it actually does today — **this is the regression bar for AGL-144**, and until that bar is
written into the backlog it exists only here:

| Surface | State |
|---|---|
| Seven lab routes (`#/<lab.id>`) | all reachable |
| Audio | 6 of 7 labs instantiate a player; Penrose has none (intentional, AGL-124) |
| Served data | `schemas/`, `examples/`, `conformance/`, `docs/`, `program/`, `research/`, `design/` all served as static files |
| Routing | hash-based, `src/ui/app-shell.ts`; unknown paths fall back to `index.html` |
| Persistence | none — no IndexedDB, no autosave; state is per-session |
| Accessibility | 3 aria/role attributes total |

Locally: `npm run dev` (port 4173) or `npm run serve` over a built `dist/` (`PORT` env). There is no
deploy automation in this repo — the node deployment is operated out-of-band, which is why nothing
in `docs/` described it and why "no web app" kept getting repeated.

## Validation regime

- **`schemas/`** — 15 versioned public JSON Schemas (Draft 2020-12), one per public contract
  (project v2/v3, command v1/v2, evaluation-request v2, resolved-audio-plan v1/v2,
  migration-receipt v2, package-manifest v1/v2, export-manifest v1, accessibility-mirror v1,
  mapping-trace v1, claim-register v1, audio-schedule-binding v1).
- **`conformance/`** — language-neutral fixtures/examples validated against those schemas
  (`npm run schema:validate`, 12/12), plus the FR-01 (`conformance/fr01/`) and Wave-1
  (`conformance/wave1/`) hostile-input corpora, and the Swift portable-contract package
  (`native/AuralGeometryCore/`, 14 passing tests + 1 skipped under AGL-191) that proves the
  *same* fixtures parse identically in a second language.
- **`conformance/fr02/`** — the FR-02 project-format torture corpus (38 declared cases). 14 are
  committed fixtures — including `raw/`, which is **deliberately unparseable** and therefore
  exempt from `verify.mjs`'s must-parse walk; the other 24 are generator specs with no committed
  bytes. `tests/fr02.test.mjs` exercises the committed side (13 passing property tests) and
  declares 10 owner-tagged `todo` gates for the behavior AGL-172/173/179/182/191 have not built
  yet. **The suite reaches its fixtures by hardcoded path — it does not read `corpus.json`, and
  nothing consumes `error-identities.json`**, so a case added to the corpus manifest gains no
  coverage by being listed. `npm run verify` holds the corpus's *declaration* (unique ids,
  source-file-or-generator, no unclaimed file in `raw/`) and the FR-02 registers (see below).
- **FR-02 registers** — `program/fr02-findings-register.json` (16 findings, 9 Critical/High, all
  `open-owned` against real backlog ids) and `program/fr02-artifact-manifest.json` (sha256 for
  all 33 FR-02 artifacts). `verify.mjs` enforces both: every manifest digest is recomputed, every
  file under `conformance/fr02/` must be declared, and every finding's `regressionTest` must
  resolve to an `FR02-Pnn` test in the suite or an `FR02-Cnn` case in the corpus. That proves the
  citation *resolves*, not that the gate tests the finding — FR02-013 cites `FR02-C006`, an
  unrelated v3 unknown-field case, so it has no real gate.
- **`tests/`** — `core.test.mjs` (rational arithmetic, pattern timing, operator kernels, stable
  IDs/PRNG, registry versioning, event budgets) and `fr01.test.mjs` (the hostile suite: strict JSON,
  canonical digest, migration receipts, materialization, selection v2, package v2, export manifest,
  accessibility mirror, claim register, evaluation-protocol v2, audio-plan v2), plus
  `fr02.test.mjs` (project-format properties: source-byte vs semantic identity, extension
  round-tripping, migration determinism and exact sequential composition, rational wire
  canonicality, package member closure). 108 declared today: 98 pass, 10 `todo`.
- **Claim register** (`src/core/claims.ts`, schema `agl-claim-register-v1`) — any research-gated
  psychoacoustic or mathematical claim requires a *trusted evidence record*; a caller-supplied
  evidence string cannot unlock a scientific/product claim. This exists to stop overstated
  Risset/psychoacoustic or Penrose-completeness claims (risks R-07, R-08).
- **FR-01 gates** — `program/fr01-findings-register.json` (51 findings, 46/46 Critical/High owned)
  and `program/fr01-contract-manifest.json` (11 pinned contract hashes) are enforced by
  `npm run check:all`, not just documented. Any semantic change (public schema, exact-arithmetic/ID/
  RNG semantics, command/undo behavior, render-plan/cutover semantics, cross-platform fixtures,
  scientific/accessibility claims) requires the matching ADR review (`docs/adr/`, 0006–0024) — see
  `docs/27-fr01-swarm-handoff-amendment.md` for the required PR evidence list.
- Determinism tiers (`docs/06-validation-strategy.md` §3): canonical operators target **D1**
  (repeatable for same versions/seed/inputs/interval); exporters target **D3** where feasible;
  real-time browser audio is explicitly not promised bit-identical across browsers.
- Authority order when artifacts conflict (README): math/standards invariants → FR-01 ADRs and
  findings register → language-neutral schemas/fixtures → hardened reference implementation →
  Wave-1 research/product defaults/visual presentation. `program/*.json` is the machine-readable
  authority; when docs and JSON conflict, JSON + accepted ADRs win.

## Repo layout

| Path | Contents |
|---|---|
| `src/core/` | Canonical domain kernel — project, commands, graph, evaluation, mapping, materialization, audio plans, export, accessibility. |
| `src/operators/` | Pure mathematical/mapping operator kernels + sealed catalog. |
| `src/geometry/` | Exact `Q(φ)` arithmetic and Penrose identity/topology foundations. |
| `src/audio/` | Current browser demonstrator adapters (not the production scheduler). |
| `src/labs/` | Seven lab surface wrappers over the shared catalog. |
| `src/ui/` | Current dependency-light native-DOM shell (disposable). |
| `schemas/` | Versioned public JSON Schemas. |
| `conformance/` | Language-neutral fixtures and the FR-01 hostile corpus. |
| `native/` | Swift portable-contract conformance package. |
| `research/` | Immutable Wave-1 evidence and remaining research charters (DR-01..DR-09). |
| `design/` | Design tokens, components, interactions, screens — inputs for a future React build. |
| `program/` | Backlog, milestones, findings, decisions, claims, toolchain-lock, contract manifests. |
| `docs/` | Architecture, UX, ADRs, validation reports, swarm handoff. |
| `examples/` | Migration examples and the canonical project-v3 example. |
| `tests/` | TypeScript/Node invariant + hostile regression suite. |
| `scripts/` | Node/Python scripts backing every `npm run` command. |
| `public/` | Static assets served by `dev`/`serve`. |

## Working here

- **Adding a lab:** wrap new mathematical behavior as an `src/operators/*.ts` kernel registered in
  `catalog.ts`, then add an `src/labs/*-lab.ts` wrapper over the shared `types.ts`. A lab is not
  "done" without example fixtures (`examples/`) and, if it touches a public contract, a schema fixture
  under `conformance/`.
- **Schemas are versioned, never mutated.** `schemas/` holds coexisting versions
  (`agl-project-v2.schema.json` and `agl-project-v3.schema.json`, `agl-command-v1`/`v2`,
  `agl-resolved-audio-plan-v1`/`v2`, `agl-package-manifest-v1`/`v2`). **Never edit a published schema
  in place** — add a new version, write a migration path (see `agl-migration-receipt-v2.schema.json`
  and `src/core/project-schema.ts`), and keep the old version's fixtures passing as migration-only.
- **Fixtures move in lockstep with schemas/code.** Any change to a public contract must update its
  `conformance/` fixtures and, where it's a project-shape change, `examples/` — `npm run
  schema:validate` and `npm run test` will otherwise fail, correctly.
- **Timing invariant is load-bearing:** everything upstream of rendering is exact rational beats;
  conversion to floating-point seconds happens once, at the tempo-map/render-plan boundary
  (`agl-tempo-map-v1`), then quantized once to sample frames via
  `frame = floor(sampleRate·t + 0.5)`. Don't introduce a second rounding point.
- **Generated material is never edited in place** — a user edits the generator, adds a downstream
  transform, forks it, or materializes a bounded snapshot (`src/core/materialization.ts`).
- Before touching `src/ui/*` or `src/audio/*`, check whether the change belongs there (pre-production
  demonstrator) or in the planned React studio / render-plan scheduler instead — see "Planned, not
  built" above and `docs/02-system-architecture.md` §2 for the target layered architecture.

## AOS integration

This is an **incubating** Agentic OS project. Its IntentTree tree is the task graph of record for
planning/tracking work here — prefer `itt`/`op` over ad hoc TODO lists for anything beyond a
single-session fix.

Artifacts under `.claude/skills/`, `.claude/agents/`, `.claude/workflows/` (once provisioned) are
**deployed copies from SkillMeat and are gitignored** — reproducible from `.claude/aos-artifacts.yaml`,
which should be treated like `package.json`, and the deployed directories like `node_modules`.
**Never hand-edit a deployed artifact** — resolve its upstream via SkillMeat and edit there; a local
edit will silently be overwritten on the next `skillmeat deploy`.
