# Pre-Handoff Frontier-Model Acceleration Plan

**Program:** Aural Geometry Lab  
**Phase:** M0.5 — design, semantics, research, and cross-platform hardening  
**As of:** 2026-08-14

## 1. Purpose

Before local agent swarms begin the full implementation, use frontier-model capacity on work whose value comes from synthesis, adversarial reasoning, specification quality, and the ability to hold the entire product in context. Avoid spending scarce local-agent execution tokens on questions that can be answered once, centrally, and turned into contracts every implementation agent can follow.

The dividing line is simple:

- **Do centrally now:** choices whose wrong answer creates broad rework or silent semantic drift.
- **Delegate later:** choices that are local, mechanically testable, or naturally converge through implementation feedback.

This phase does not attempt to finish the application. It attempts to make the application unusually hard to implement incorrectly.

## 2. Highest-leverage uses of GPT-5.6 Pro / XHigh

### Tier A — complete before swarm implementation

#### A1. Interaction semantics and state ownership

Resolve, specify, and test:

- what selection means across timeline, graph, canvas, inspector, and lab guide;
- which surface owns edits versus merely projects state;
- how generated material differs from frozen material;
- what happens when a user edits one generated event;
- how A/B comparison, bypass, undo/redo, and time travel interact;
- how direct manipulation writes back to graph parameters;
- how derived views avoid creating duplicate sources of truth;
- how project state differs from ephemeral UI state;
- what constitutes a transaction for undo/redo.

Why now: these decisions infect nearly every React component and every future SwiftUI view.

Deliverables in this phase:

- `docs/13-ui-ux-final-design-spec.md`
- `docs/16-cross-platform-interaction-contract.md`
- `src/core/interaction.ts`
- `src/core/materialization.ts`
- shared conformance fixtures.

#### A2. Full UI/UX and visual-system specification

Specify the final product before generating polished mockups:

- information architecture;
- responsive layouts;
- Explore / Compose / Inspect depth model;
- component anatomy;
- visual grammar for mathematics, music, provenance, generation, and uncertainty;
- all lab-specific canvases;
- direct-manipulation behavior;
- keyboard, pointer, touch, and Pencil behavior;
- empty/loading/error/budget/research-gated states;
- accessibility and reduced-motion behavior;
- screen-by-screen mockup briefs.

Why now: generated UI without a semantic design system tends to produce attractive but mutually inconsistent screens.

#### A3. Research synthesis that changes product semantics

Run deep research where evidence can alter algorithms, defaults, claims, or acceptance criteria:

1. DR-01 — Risset psychoacoustics.
2. DR-03 — browser audio scheduling/rendering.
3. DR-08 — sonification mapping/evaluation.
4. DR-09 — exact Penrose tiling.
5. DR-11 — professional music-tool UX patterns.
6. DR-12 — iPad native architecture.
7. DR-13 — multimodal mathematical visualization/accessibility.
8. DR-14 — graph/timeline/direct-manipulation semantics.
9. DR-15 — cross-platform core strategy.

Why now: downstream agents should consume decisions, fixtures, and ADRs rather than rediscovering literature in parallel.

#### A4. Test oracles and invariants

Use frontier reasoning to create tests for *meaning*, not merely implementation:

- algebraic laws;
- cross-surface selection consistency;
- deterministic command replay;
- generated/frozen lineage preservation;
- graph compilation invariants;
- render-plan equivalence;
- tempo-map boundary laws;
- Penrose geometry invariants;
- offline/real-time event equivalence;
- export round trips;
- accessibility semantics.

Why now: agents are excellent at satisfying tests. The leverage comes from writing the right tests first.

#### A5. Adversarial architecture review

Have independent long-context passes attack:

- project-format forward compatibility;
- audio-thread safety;
- cancellation and stale-result races;
- graph cycles;
- BigInt/rational portability;
- worker serialization;
- sample/project-package security;
- undo history corruption;
- derived state divergence;
- cross-platform semantic drift;
- accessibility failures in canvas/node editors.

Output should be converted to ADRs, acceptance tests, and risk-register entries—not left as prose.

### Tier B — valuable if frontier capacity remains abundant

#### B1. Golden-fixture generation

Produce large, independent fixture corpora for:

- Euclidean rhythms;
- Tonnetz mappings and transformations;
- Risset layer states;
- recursive motif ancestry;
- cellular automata;
- Lorenz trajectories;
- project migrations;
- MIDI/MusicXML exports;
- selection and command replay.

Fixtures should include edge cases and expected diagnostics, not only happy paths.

#### B2. Lab curriculum and explanation layer

For each lab, produce:

- 3–5 guided experiments;
- prediction prompts;
- manipulation sequence;
- expected observation;
- mathematical explanation;
- what the experiment does **not** establish;
- glossary;
- accessible text description;
- provenance examples.

This is especially suited to high-context reasoning because the explanations must agree with both implementation and research evidence.

#### B3. Performance workload design

Define representative workloads before optimization:

- light interactive;
- dense musical project;
- worst legal graph;
- recursion pressure;
- geometry pressure;
- automation pressure;
- offline render;
- low-power tablet profile.

Then agents optimize against stable workload IDs rather than arbitrary local benchmarks.

#### B4. Mockup critique loops

Use generated mockups only after this specification exists. For each screen:

1. generate 3–5 materially different layouts;
2. critique against the design contract;
3. synthesize the strongest layout;
4. generate interaction states;
5. test reduced width and accessibility;
6. extract final component/layout decisions.

The goal is not aesthetic voting; it is reducing ambiguity before code.

## 3. Work best delegated to local agent swarms

Local agents should own the implementation-heavy work that benefits from repository access, iterative compilation, browser automation, and repeated small corrections:

- React/Vite scaffolding;
- component implementation;
- state-store wiring;
- React Flow integration;
- IndexedDB implementation;
- CSS/layout tuning;
- Web Worker plumbing;
- AudioWorklet implementation;
- Three.js/Canvas rendering details;
- export encoders;
- E2E automation;
- dependency updates;
- CI/CD;
- device/browser debugging;
- performance profiling;
- native Xcode integration when the stretch branch begins.

Frontier-model output should arrive to those agents as acceptance criteria, contracts, fixtures, and design references.

## 4. Recommended pre-handoff execution sequence

### Wave 0 — completed in this package update

- expand the final UI/UX design specification;
- establish platform-neutral selection and materialization semantics;
- create design tokens and screen manifests;
- add a mockup-generation brief;
- define native Apple stretch architecture;
- create a compile-tested pure Swift contract package;
- add shared conformance fixtures;
- charter new cross-cutting research runs;
- extend program/backlog metadata.

### Wave 1 — execute Deep Research

Run in parallel:

- DR-03 Browser Audio;
- DR-08 Sonification Mapping;
- DR-11 Music Tool UX;
- DR-12 Native iPad;
- DR-14 Interaction Semantics;
- DR-15 Cross-Platform Core.

Run DR-01 and DR-09 as domain-specific immediate blockers.

### Wave 2 — frontier synthesis after research

For each research run:

1. normalize findings into claims and evidence;
2. update affected ADRs;
3. update algorithm/default choices;
4. generate golden fixtures;
5. update lab acceptance suites;
6. update UX copy where claims changed;
7. mark research gate accepted/rejected.

### Wave 3 — generate final mockup set

Generate the canonical screen set described by `design/screens.json` and `docs/15-mockup-generation-spec.md`:

- desktop 1600×1000;
- standard laptop 1440×900;
- iPad landscape;
- iPad portrait;
- iPhone companion views.

Do not generate every screen at once. Lock the shell, then shared surfaces, then each lab.

### Wave 4 — swarm handoff

The implementation swarm receives:

- repository;
- approved research outputs;
- ADRs;
- UX specification;
- design tokens;
- canonical mockups;
- component and screen manifests;
- conformance fixtures;
- acceptance suites;
- prioritized backlog.

## 5. Definition of Ready for swarm implementation

A P0 implementation item is ready only when it has:

- an owner subsystem;
- canonical data contract;
- visual/interaction behavior when user-facing;
- acceptance criteria;
- failure/empty/loading states;
- accessibility expectation;
- performance/budget expectation where relevant;
- research gate status;
- test oracle or fixture strategy;
- no unresolved semantic decision hidden inside the coding task.

## 6. Model-allocation guidance

### Use GPT-5.6 Pro / XHigh for

- architecture and ADR synthesis;
- mathematical derivation/proofs;
- psychoacoustic and HCI research synthesis;
- adversarial review;
- schema/versioning design;
- cross-platform semantics;
- test-oracle creation;
- UI/UX critique with the full product in context;
- migration strategy;
- complicated bug root-cause analysis after agents provide traces.

### Use fast/local swarm models for

- boilerplate;
- isolated component construction;
- test implementation from supplied laws;
- routine refactors;
- style translation from tokens/mockups;
- repetitive export adapters;
- dependency integration;
- browser automation;
- PR decomposition;
- mechanical documentation synchronization.

### Escalation rule

A local agent should escalate when the question changes a public contract, mathematical meaning, user-visible interaction semantic, file format, deterministic output, research claim, or platform boundary. It should not independently invent those decisions.

## 7. Cost-offset logic

The useful economic comparison is not “one model is cheaper per token.” It is **rework avoided per implementation token**.

One centrally reasoned decision about generated-event editing, project versioning, or cross-platform time semantics can prevent many agents from implementing incompatible interpretations. Conversely, spending frontier reasoning on ten variants of a routine button component provides little leverage.

Treat this phase as creation of a high-quality constraint surface around the swarm.

## 8. Handoff artifacts added by M0.5

- Final UI/UX design spec.
- Native Apple stretch architecture.
- Cross-platform interaction contract.
- Mockup generation specification.
- Design tokens, component manifest, screen manifest, and interaction manifest.
- New research charters DR-11 through DR-16.
- TypeScript selection/materialization contracts and tests.
- Swift package proving the portable project/interaction contract can be represented outside TypeScript.
- Shared JSON conformance fixtures.

