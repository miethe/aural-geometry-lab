# Aural Geometry Lab — Wave-1 Adversarial Architecture Review

**Run:** FR-01 baseline  
**Date:** 2026-08-18  
**Target:** integrated architecture v0.3.0  
**Disposition:** accepted with explicit implementation gates

## 1. Review question

Assume multiple local agents now implement AGL in parallel. Which ambiguities, accidental contracts, contradictions, or missing evidence could make individually reasonable work merge into an incoherent product?

This review attacks the integrated architecture rather than repeating the research.

## 2. Critical findings and resolutions

| Attack | Failure mode | Resolution in v0.3 | Remaining gate |
|---|---|---|---|
| “Exact time everywhere” | Risset and tempo-resolved times are forced into fake rationals or drift-prone floats | Exact source/musical time → ideal seconds → one sample-frame quantization | FR-02 must torture project/time migration and half-sample boundaries |
| Two render plans | Web uses seconds, native retains a separate rational event model | One semantic evaluation result and one backend-neutral `ResolvedAudioPlan`; backend schedule is transient | Complete schema/compiler and cross-platform plan fixtures |
| Risset report/packet conflict | Different normalization defaults become two incompatible `rhythm.risset@1` operators | Completed report wins: raised-cosine linear partition, B=2; L2 is explicit comparison | Listening validation; legacy slot player must be retired |
| Project package ambiguity | Native directory and browser ZIP claim to be one byte format | One logical member model; two physical profiles; semantic package digest ignores physical metadata | Browser/native round-trip and iCloud/File Provider conflict POA |
| Flat material enum | “Stale” becomes an origin type; snapshots update silently | MaterialKind and derived SourceStatus are separate; payload immutable | Implement source-recipe store and digest service |
| Whole-project freshness | Unrelated changes discard valid work or mark snapshots stale | Scope dependency digest + epoch/channel/generation/environment identity | Canonical digest implementation and model-based race suite |
| Cancellation as correctness | Late workers/worklets publish stale data after “cancel” | Cancellation is resource control; publication requires identity match | Exercise worker termination, cache-only admission, and transport epochs |
| UI-owned graph legality | React/Swift allow edges the compiler rejects | One pure compatibility service for preview, commit, import, keyboard, compile | Production compiler API and React Flow adapter tests |
| Every gesture update is history | Undo, autosave, graph evaluation, and audio churn explode | begin→preview*→commit/cancel; session-based coalescing | Command/history store and end-to-end input adapter tests |
| Generated event mutation | Timeline state cannot explain regeneration | generator edit, downstream exception/operator, fork, or materialize | Per-operator generated identity capability and exception fixtures |
| Stable ID overclaim | CA/chaos/fractal/Penrose items are silently rebound by proximity | stable/successor-mapped/ephemeral capability; missing refs become orphans | Domain-specific identity contracts before per-item edit UI |
| A/B as “simple UI state” | Document edits, undo routing, source drift, and structural overrides become ambiguous | A/B excluded from MVP canonical architecture | Separate ADR only after baseline editor is complete |
| Audio last-valid deception | UI shows new graph while old audio continues indefinitely | document/candidate/armed/active plan are explicit states; failures visible and scoped | DR-03 implementation defines cutover/timeout/tail policies |
| Cross-browser PCM equality | Harmless DSP differences fail tests or drive browser-specific semantics | semantic plan/sample-frame equality; feature/tolerance tests for DSP | Execute browser matrix and calibrate tolerances |
| Gain safety changes math | Limiter or density shedding silently changes laboratory semantics | mathematical normalization, deterministic approximation record, and final safety stage are separate | Voice/density benchmark and approximation provenance |
| Universal sonification channel | Pitch/loudness/spatial mappings are hard-coded as scientifically “best” | task/evidence metadata, explicit mapping pipeline, alternative representations | DR-13 and per-lab user studies |
| Causal and frozen mappings blur | Future data changes already-heard live output or offline differs silently | pointwise/causal/lookahead/whole-window types; compiler context checks | Stateful checkpoint/reset and window-fit persistence |
| Penrose “looks right” | Decorative quasi-pattern passes as exact tiling | exact integer/Q(phi) topology, shared-edge adjacency, oracle corpus, validation scopes | Recover DR-09 fixture/prototypes/legal-star/matching tables |
| Clipping creates topology | Viewport fragments become graph nodes/edges | clipping is projection only; canonical full geometry remains authoritative | Enforce types in renderer and property tests |
| Native app becomes second product | SwiftUI/AVAudioEngine fields leak into project and commands diverge | ports/adapters over shared schemas/fixtures; bounded Swift implementation | Document/container POA and Euclidean native proof |
| Premature Rust migration | New toolchain freezes unstable semantics and distracts M1–M6 | conformance-first selective core; TS reference; Swift bounded; JSC test oracle | FR-08 benchmark evidence before any shared kernel ADR |
| Scientific copy outruns evidence | Engineering defaults and production-analysis hypotheses become facts | evidence/claim registry with Established/Inference/Default/Experimental/Gated classes | Build registry and content lint before public beta |

## 3. Implementation defects intentionally not hidden

The v0.3 package is a strong foundation, not a false claim of finished production behavior.

1. **Project v2 validation is foundational, not exhaustive.** The JSON Schema is added, but runtime validation still needs deep cross-reference, canonical-rational, hash, compatibility, and hostile-input limits.
2. **Canonical digest ownership is specified but not implemented.** No implementation may invent its own project/dependency/receipt hash algorithm meanwhile.
3. **The browser demo still uses a legacy fixed-slot Risset audio adapter.** The analytic operator exists and is tested, but the current playable vertical slice is not yet the conformance implementation.
4. **Scheduler constants are unmeasured on the target matrix.** 25/100/250 ms are benchmark candidates, not support guarantees.
5. **Penrose generation is not complete.** Q(phi), identities, and phase certificate exist; the exact patch generator and source research artifacts remain gated.
6. **Mapping contracts precede mapping implementations.** The shared pipeline compiles at the type/validation layer, but full normalizers, stateful smoothers, constraints, and trace execution remain M1/M4 work.
7. **Swift proves wire/behavior compatibility only.** It is not a native product core, audio engine, or geometry implementation.
8. **No browser or device performance evidence was fabricated.** M2/M5/M7 retain empirical gates.

## 4. Architecture freeze conditions

Before declaring project/semantic architecture frozen:

- FR-02 project format and migration torture passes;
- canonical serializer/digest fixtures pass in TS and Swift;
- command/history model tests cover conflicts, undo/redo, no-op, migration epoch, and generated identities;
- logical package physical profiles round-trip;
- operator catalog declares causality, conformance, identity, and budgets;
- `ResolvedAudioPlan` schema and temporal-origin policy are complete;
- source-recipe/materialization receipt representation is complete.

Before P0 rhythm alpha:

- legacy Risset playback is replaced by the analytic operator/render-plan path;
- browser scheduler matrix is executed;
- real-time/offline event and sample-frame agreement passes;
- listening fixture and claim copy are approved.

Before Penrose beta:

- DR-09 artifact set is recovered or independently regenerated;
- two oracle implementations agree;
- legal-star and matching corpus passes;
- query halo/completeness and clip-type invariants pass;
- traversal output is bounded and deterministic.

## 5. Verdict

The integrated architecture is coherent enough for parallel M1 implementation **because ambiguity has been converted into explicit contracts, rejected behaviors, and gates**. The swarm must not reinterpret the raw research independently. It implements the accepted ADRs and decision register, preserving the reports as evidence and the open gates as blockers.
