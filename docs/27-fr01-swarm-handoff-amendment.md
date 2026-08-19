# FR-01 Swarm Handoff Amendment — v0.4

## Purpose

This is the implementation-control addendum for local agent swarms. It prevents parallel work from recreating the semantic divergence FR-01 removed.

## Mandatory read order

1. `README.md`
2. `docs/24-fr01-whole-system-adversarial-repository-review.md`
3. `docs/25-fr01-contract-and-migration-amendment.md`
4. ADRs 0019–0024
5. `program/fr01-findings-register.json`
6. `program/fr01-contract-manifest.json`
7. Schema/fixture/source contract for the changed subsystem
8. Wave-1 integration, UI/UX, and state-machine documents
9. Raw research only for provenance or questions left open by the authority layer

## Non-negotiable merge rules

A semantic PR includes every applicable item: ADR/version decision, schema and runtime validator, migration impact, TypeScript tests, shared/native fixture, findings/backlog update, accessibility/claim/export impact, and clean `npm run check:all`.

Agents may not:

- write project v1/v2 or command v1;
- mint v1 stable IDs or mutable-stream PRNG results;
- use ordinary permissive JSON parsing as an untrusted package/project boundary;
- define a UI-only graph compatibility rule;
- allow workers to self-promote determinism/cache class;
- trust cancellation or revision alone for freshness;
- run graph/project/provenance/BigInt/JSON work in a realtime audio callback;
- mutate generated projections directly or retarget missing entities by proximity;
- mix runtime generation/transport state into immutable audio plans;
- represent MIDI/MusicXML as lossless AGL serialization;
- expose drag-only or color-only essential semantics;
- unlock research-gated copy with caller-supplied evidence strings;
- change operator executable behavior under an unchanged semantic version without an implementation receipt.

## Parallel streams

| Stream | Scope | Immediate ownership |
|---|---|---|
| A — Project/package | v3 persistence, source bytes, migration/quarantine, hostile archive/native profiles | AGL-172, 173, 179, 184, 191 |
| B — Commands/material | handlers, history, timeline material, source recipes, materialization | AGL-174, 157, 145 |
| C — Graph/runtime | catalog, compiler, worker, cache, budgets, identity capability, implementation receipts | AGL-175, 176, 159, 160, 189 |
| D — Audio | plan compiler, binding, voices, scheduler/worklet, offline, P0 labs, plan fragmentation | AGL-177, 178, 185, 190 |
| E — Product/UX | React shell, timeline/graph/Inspector, export UI, claim and accessibility adapters | AGL-144, 180, 181, 183 |
| F — Labs/Penrose | exact generator/oracles/traversal and lab-specific identity/mapping proofs | AGL-186 |
| G — Native | Swift parity, strict JSON/package, Files/iCloud, audio/MIDI, adaptive UI | AGL-147, 167, 168, 182, 191 |
| H — Quality | property/fuzz/schema differential, evidence, benchmarks, SBOM/license/release | AGL-170, 171, 178, 187–191 |

## Dependency order

```text
A: project v3 + compatibility + package trust
   ├── B: commands/history/material persistence
   ├── C: compiler/evaluator/cache/receipts
   └── G: native document/conformance

B + C → E: production editor surfaces
A + C → D: plan compiler/audio
C + DR-09 artifacts → F: exact Penrose
all streams → H: release evidence
```

## Required escalation

Escalate rather than improvise when a change affects project/migration meaning, operator/version/digest behavior, exact time/tempo/sample conversion, ID/random streams, graph legality, commands/inverses/history, async/cache acceptance, generated identity/materialization, render-plan ownership, export loss, cross-platform fixtures, accessibility semantics, or scientific claims.

An escalation issue states the proposed versioning, alternatives, migration impact, tests, and affected ADR.

## PR evidence checklist

- [ ] Finding/backlog owner is named.
- [ ] Public version remains valid or advances explicitly.
- [ ] Canonical digest/ID/random behavior is unchanged or migrated.
- [ ] No transient/runtime/platform state entered project semantics.
- [ ] No exact value passed through an implicit floating conversion.
- [ ] Preview/cancellation/stale work cannot publish canonical state.
- [ ] Worker cannot redefine host determinism/cache authority.
- [ ] Realtime/offline and web/native boundaries remain explicit.
- [ ] Actual export/package bytes are verified where produced.
- [ ] Non-drag accessibility and exact-value command paths exist.
- [ ] Claims/provenance/loss consequences are disclosed.
- [ ] Negative/hostile/property tests accompany the happy path.
- [ ] Clean extracted release artifact still passes all gates.
