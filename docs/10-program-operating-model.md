# Program Operating Model

## 1. Delivery topology

Aural Geometry Lab requires a product/research/engineering loop rather than a linear “research then build” handoff.

```text
Question / musical objective
        ↓
Evidence review + mathematical model
        ↓
Reference implementation + fixtures
        ↓
Interaction/mapping prototype
        ↓
Composer/learner/perceptual validation
        ↓
Operator/preset version decision
        ↓
Production implementation + acceptance evidence
```

## 2. Core roles

| Role | Responsibilities |
|---|---|
| Product owner | Thesis, scope, priority, user outcomes, release decision |
| Technical lead | Architecture, contracts, delivery integration, dependency posture |
| Audio/runtime engineer | Scheduling, render plan, DSP, MIDI/offline render, gain safety |
| Frontend/visualization engineer | Studio surfaces, 2D/3D projections, linked interaction |
| Computational-music researcher | Mathematical models, source quality, fixtures, terminology, research gates |
| UX/accessibility lead | Progressive disclosure, guided experiments, accessibility validation |
| QA/research engineer | Property tests, browser harness, benchmarks, study reproducibility |

One person may cover multiple roles initially, but decision responsibilities remain explicit.

## 3. Work item flow

1. **Ready for research** — question and decision need defined.
2. **Research active** — charter executing; evidence and prototype may evolve.
3. **Decision record ready** — recommendation, alternatives, fixtures, uncertainty.
4. **Ready for implementation** — acceptance tests and contracts defined.
5. **Implementation active** — code, docs, tests.
6. **Evidence review** — engineering and research acceptance.
7. **Done** — integrated, documented, versioned, and demonstrable.

Research-gated items cannot jump directly from idea to “done.”

## 4. Artifacts of record

- `docs/00-program-charter.md` — product authority.
- `docs/02-system-architecture.md` and ADRs — architecture authority.
- `program/backlog.json` — delivery authority.
- `program/research-register.json` — evidence/gate authority.
- `program/lab-manifest.json` — lab maturity snapshot.
- operator definitions/versions — executable semantics authority.
- golden fixtures/tests — behavioral evidence.
- project schema/migrations — compatibility authority.

Conflicts should be resolved by updating the appropriate authority artifact, not by adding contradictory notes elsewhere.

## 5. Decision records

Use ADRs for decisions that are:

- difficult to reverse;
- cross-cutting;
- likely to be questioned later;
- coupled to compatibility, correctness, or licensing.

Each ADR records context, decision, alternatives, consequences, validation, and revisit triggers.

## 6. Research result handoff

Every completed Deep Research run must deliver:

1. source-grounded report with claim/evidence table;
2. explicit recommendation and rejected alternatives;
3. exact definitions/terminology;
4. reference pseudocode or implementation notes;
5. machine-readable fixtures or datasets where possible;
6. parameter/default recommendations with confidence;
7. unresolved questions and limitations;
8. proposed tests and acceptance thresholds;
9. required ADR/operator/preset changes.

A narrative report without implementation decisions is not accepted as complete.

## 7. Version and release discipline

- `main` remains releasable after M1 begins.
- Feature branches are short-lived.
- Operator semantic changes require version review.
- Project schema changes require migration and golden round-trip tests.
- Preset changes that alter intended research behavior require preset version and evidence note.
- Generated build artifacts are reproducible and should not substitute for source review.

## 8. Demonstration cadence

Each milestone demo must include:

- one guided first-time-user flow;
- one advanced graph/inspector flow;
- one failure/budget diagnostic;
- one deterministic save/reopen/export proof;
- current research gate status and changed assumptions.

Do not demo only polished audio. The program's differentiator includes explanation, provenance, and interoperability.

## 9. Quality gates for pull requests

A change cannot merge when applicable unless:

- strict type check passes;
- relevant unit/property/golden tests pass;
- new operators define ports, parameters, versions, budgets, docs, and provenance;
- UI has keyboard and error states;
- performance impact is measured for hot paths;
- new dependencies pass license/security review;
- claims link to accepted research evidence;
- docs/examples are updated.

## 10. Initial next-action sequence

1. Run DR-03 and DR-08 immediately; run DR-01 and DR-09 in parallel.
2. Convert project schema into full validation/migration contracts.
3. Implement graph executor and project command/persistence spine.
4. Define render-plan API and instrument/scheduler benchmarks.
5. Migrate Infinite Staircase and Euclidean Rings into canonical project/graph execution.
6. Use DR-04–DR-07 to harden computational previews in milestone order.
7. Add export, accessibility, and browser harness continuously rather than at the end.
