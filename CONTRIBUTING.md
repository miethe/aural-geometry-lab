# Contributing to Aural Geometry Lab

## Prerequisites

- Node.js `>=22.12.0` (tested 22.16.0), npm (tested 10.9.2).
- TypeScript is pinned to exactly `5.8.3` (`program/toolchain-lock.json`) — install via
  `npm install`, don't rely on a mismatched global compiler.
- Python 3 with `jsonschema` — required for `npm run schema:validate` and `npm run release:archive`.
- Swift 6.1+ (tested 6.2.1, minimum 6.0.0) — only if you're touching `native/AuralGeometryCore/`.

## Running the full gate

```bash
npm install
npm run check:all
```

`check:all` is the release-grade gate: build, 85 TypeScript/Node tests, Swift conformance tests,
JSON Schema validation (12/12 fixtures), 142 backlog-dependency checks, 51 FR-01 finding-ownership
checks, 11 public-contract hash checks, Wave-1 evidence/native-fixture-mirror checks, a deterministic
release-archive round trip, and a static HTTP smoke test. Run it before opening a PR that touches
anything beyond docs.

The lighter dev-loop gate is `npm run check` (clean, build, test, schema:validate, verify).

## Schema-versioning rule

`schemas/` holds coexisting versions (`agl-project-v2`/`v3`, `agl-command-v1`/`v2`,
`agl-resolved-audio-plan-v1`/`v2`, `agl-package-manifest-v1`/`v2`). **Never edit a published schema
in place.** Add a new version and a migration path (see `agl-migration-receipt-v2.schema.json` and
`src/core/project-schema.ts`); keep old-version fixtures passing as migration-only. Update
`conformance/` fixtures and, for project-shape changes, `examples/` in the same PR.

## Test layout

- `tests/core.test.mjs` — rational arithmetic, pattern timing, operator kernels, stable IDs/PRNG,
  operator-registry versioning, event budgets.
- `tests/fr01.test.mjs` — the FR-01 hostile suite: strict JSON, canonical digest, migration
  receipts, materialization, selection v2, package v2, export manifest, accessibility mirror, claim
  register, evaluation-protocol v2, audio-plan v2.
- `conformance/`, `conformance/fr01/`, `conformance/wave1/` — schema fixtures/examples, validated by
  `npm run schema:validate` and mirrored by the Swift package in `native/AuralGeometryCore/Tests/`.

Run `npm run test` for the TypeScript suite; run `swift test` inside `native/AuralGeometryCore/` for
the Swift conformance suite.

## Commit / PR expectations

Any change to a public schema, exact-arithmetic/ID/RNG semantics, command/undo behavior,
render-plan/cutover semantics, cross-platform fixtures, or a scientific/accessibility claim needs:

- the affected ADR/finding ID(s) (`docs/adr/`, `program/fr01-findings-register.json`),
- schema/fixture diffs,
- migration impact (if any),
- exact-vs-profile-numeric conformance class,
- determinism/cache implications,
- accessibility implications,
- a clean `npm run check:all`.

Do not claim a feature is implemented unless you can point to it in `src/` or `tests/`. Prefer
"planned" over an optimistic status. Do not overstate psychoacoustic or mathematical claims — the
claim register (`src/core/claims.ts`) requires a trusted evidence record, not a caller-supplied
string.

## Proposing a new lab

1. Add the mathematical kernel under `src/operators/` and register it in `catalog.ts`.
2. Add an `src/labs/*-lab.ts` wrapper over the shared `types.ts`.
3. Add example fixtures under `examples/`, and — if the lab touches a public contract — schema
   fixtures under `conformance/`.
4. Run `npm run check:all` and update the relevant `docs/03-lab-specifications.md` entry and
   `program/backlog.json` item.

The repository is currently treated as private (no license selected — see README "License posture");
do not push contents outside this working tree without resolving that first.
