# DR-14 — Cross-Surface Editing, Node-Graph, Timeline, and Undo Semantics

**Current date:** 2026-08-14  
**Program:** Aural Geometry Lab

## Mission

Stress-test and refine AGL's interaction contract so canvas, graph, timeline, inspector, and direct manipulation remain one coherent editor under concurrency, undo/redo, generated material, and asynchronous evaluation.

## Starting artifact

Review and attack:

- `docs/16-cross-platform-interaction-contract.md`
- `src/core/interaction.ts`
- `src/core/commands.ts`
- `src/core/materialization.ts`

## Questions

1. What is the correct command/transaction model for high-frequency drag previews with one undo step?
2. How should selection, keyboard focus, hover, related/provenance highlighting, and range anchors coexist?
3. How should generated material support exceptions without destroying generator semantics?
4. When should edits freeze a region, insert a downstream edit operator, or fork a generator?
5. How should graph rewiring interact with running audio and in-flight worker evaluations?
6. What revision/hash/cancellation model prevents stale async results from becoming current?
7. How should A/B temporary overrides work with transport and undo?
8. What commands are safe to coalesce?
9. What happens when a selected entity disappears because upstream generation changes?
10. How should project migrations preserve command/event lineage?
11. Which parts of undo belong to document systems versus the AGL command log on native platforms?
12. Which CRDT/collaboration constraints should be anticipated without implementing collaboration in MVP?

## Required outputs

1. Revised normative interaction contract.
2. State machine diagrams.
3. Command taxonomy and payload schemas.
4. Transaction/coalescing laws.
5. Generated-content edit decision table.
6. Async evaluation race-condition matrix.
7. 50+ model-based/property test cases.
8. React and SwiftUI mapping notes.
9. ADR proposal.

## Evidence requirements

Use primary HCI/editor architecture literature where useful, official node-editor/framework behavior as implementation evidence, and established command/undo patterns. The final recommendations must be justified by AGL semantics rather than framework convenience.

