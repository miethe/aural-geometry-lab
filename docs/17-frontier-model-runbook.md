# Frontier-Model Reasoning Runbook

**Purpose:** high-token, high-reasoning work to execute centrally before or during swarm implementation  
**Model posture:** strongest available long-context/reasoning configuration  
**As of:** 2026-08-14

These are **not** implementation tickets. Each run should consume the current repository plus accepted research outputs and return changes to contracts, tests, ADRs, or backlog. A run that produces only advice is incomplete.

## FR-01 — Whole-System Adversarial Architecture Review

### Prompt

Act as a principal architect, real-time audio engineer, programming-languages engineer, HCI systems architect, and hostile design reviewer. Review the complete Aural Geometry Lab repository as one system. Assume multiple autonomous implementation agents will work concurrently and look for decisions that can diverge silently.

Attack at minimum:

- project schema/versioning;
- operator versioning;
- exact time and tempo conversion;
- deterministic seeds/IDs;
- graph compilation/evaluation;
- worker cancellation and stale-result races;
- command/undo transactions;
- generated/frozen material semantics;
- render-plan ownership;
- real-time/offline equivalence;
- cross-surface selection;
- exports;
- browser/native portability;
- accessibility semantic mirrors;
- research-gated claims.

For each issue provide severity, concrete failure scenario, affected files/contracts, proposed repair, regression test, and whether an ADR is required. Then directly draft the ADR/test changes needed.

### Completion

- no unresolved Critical/High item without backlog owner;
- new invariants become tests;
- contract changes are versioned.

## FR-02 — Project Format and Migration Torture Test

Review the project schema as if AGL must open projects made five years earlier and preserve projects containing unknown future optional data.

Generate:

- compatibility matrix;
- unknown-field policy;
- unknown-required-feature policy;
- migration graph;
- rollback/recovery semantics;
- asset/package addressing rules;
- canonical JSON/normalization rules;
- malformed/adversarial project corpus;
- migration property tests;
- schema-v2 proposal.

Explicitly test Rational JSON, seeds, operator versions, lab presets, frozen lineage, view state, assets, and future native clients.

## FR-03 — Interaction Model State-Machine Audit

Start from `docs/16-cross-platform-interaction-contract.md` and DR-14 if available.

Construct formal state machines/model-based tests for:

- selection/focus/related highlight;
- direct manipulation preview→commit→undo;
- generated event edit choice;
- freeze/regenerate;
- graph rewiring while playing;
- A/B audition/apply/cancel;
- stale async result arrival;
- deletion of selected/generated entities;
- responsive surface hiding;
- native document undo integration.

Find ambiguities by producing counterexamples. Resolve them in the normative contract and generate executable property/model tests.

## FR-04 — Mathematical Operator Oracle Expansion

For every implemented operator and every accepted research-gated operator:

- derive invariants;
- produce independent reference calculations;
- generate edge/corner cases;
- identify numeric stability risks;
- create golden fixtures;
- create metamorphic/property tests;
- define performance budgets.

Do not merely restate the implementation. Seek independent oracles.

Target at least 25 meaningful tests per mature operator family, weighted toward properties rather than examples.

## FR-05 — Lab Scientific/Mathematical Claim Audit

Review all lab copy, presets, visualizations, and guided experiments.

For every visible claim classify:

- mathematical definition;
- historical attribution;
- psychoacoustic evidence;
- musical convention;
- product inference;
- pedagogical analogy.

Verify claims against accepted research outputs, remove overclaiming, create evidence tags, and identify any visualization that implies more than the underlying mathematics establishes.

## FR-06 — UI/UX Mockup Synthesis and Critique

Input:

- `docs/13-ui-ux-final-design-spec.md`;
- `docs/15-mockup-generation-spec.md`;
- design tokens/manifests;
- current generated mockups.

For each screen:

1. assess against the design rubric;
2. identify semantic errors, not only visual defects;
3. compare novice and expert workflows;
4. simulate keyboard/touch/Pencil use;
5. simulate 1600×1000, 1280×800, iPad landscape, iPad portrait;
6. verify generated/frozen/provenance clarity;
7. propose exact component/layout changes;
8. update the design spec if the better answer changes the contract.

## FR-07 — Cross-Platform Conformance Expansion

Review TypeScript and Swift portable contracts and determine the smallest shared conformance suite that prevents semantic drift.

Produce fixtures for:

- selection keys;
- project decode/encode;
- normalized rational JSON;
- stable IDs;
- command payloads;
- generated/frozen lineage;
- tempo-map conversions;
- initial shared operators;
- render plans;
- export metadata.

Distinguish bit-identical requirements from tolerance-based floating-point requirements.

## FR-08 — Performance Workload and Budget Design

Define named workloads representing real use:

- W1 Guided Simple;
- W2 Composition Medium;
- W3 Dense Timeline;
- W4 Recursive Pressure;
- W5 Geometry Pressure;
- W6 Chaos Long Run;
- W7 Graph Cancellation Storm;
- W8 Offline Render;
- W9 iPad Thermal/Battery;
- W10 Accessibility Semantic Mirror Stress.

For each define input project, expected events/geometry, frame budget, evaluation target, memory target, audio late-event threshold, and acceptable degradation behavior.

Generate benchmark fixtures/scripts where implementation-independent.

## FR-09 — Import/Export and Local-First Security Review

Threat-model project/package import and export:

- path traversal;
- archive bombs;
- hostile sample files;
- oversized JSON;
- recursive graph explosions;
- untrusted metadata;
- future extension namespaces;
- MIME/content confusion;
- browser object URLs;
- document package coordination on Apple platforms;
- privacy leakage through manifests/analytics.

Return concrete validation limits, fuzz cases, test fixtures, and security ADRs.

## FR-10 — Swarm Consistency Review

Run after every major milestone or multi-agent merge.

Given the merged repository, detect:

- duplicate abstractions;
- semantic forks;
- undocumented defaults;
- operator-version mismatches;
- state duplicated across layers;
- incompatible visual patterns;
- inaccessible custom controls;
- tests that assert implementation instead of meaning;
- backlog/docs drift.

Return a patch-oriented consolidation plan ranked by future rework risk.

## FR-11 — Research-to-Engineering Distillation

For each completed Deep Research dossier:

- extract claims with confidence;
- map each claim to implementation/UI/default/test impact;
- flag conflicting evidence;
- propose ADR;
- generate fixtures;
- update research gate status;
- write user-facing explanation text constrained by evidence.

This prevents research outputs from becoming passive documents.

## FR-12 — Release-Candidate Product Coherence Review

Before private MVP:

Simulate complete journeys for:

- curious nonmusician;
- musician without mathematical background;
- mathematically sophisticated hobbyist;
- professional composer/producer;
- keyboard-only user;
- screen-reader user;
- iPad/Pencil user if native spike exists.

Trace every step across project state, audio, visualization, error recovery, export, and explanation. Identify dead ends and inconsistent depth transitions. Convert issues into release-gate tests/backlog items.

## Usage rule

Use these reasoning runs when implementation evidence is available. Do not ask a frontier model to hallucinate whether a browser/device implementation works; provide logs, traces, benchmark outputs, screenshots, or failing fixtures and have it reason over those artifacts.

