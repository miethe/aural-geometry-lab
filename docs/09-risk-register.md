# MVP Risk Register

> **Wave-1 authority note (2026-08-18):** Cross-run risks and gates are additionally recorded in `20-wave1-adversarial-architecture-review.md` and the updated machine-readable backlog.


Scales: probability and impact are **Low / Medium / High**. Owner roles are provisional.

| ID | Risk | Probability | Impact | Mitigation / trigger | Owner |
|---|---|---:|---:|---|---|
| R-01 | Browser scheduling jitter weakens rhythmic illusions or playback | High | High | DR-03; render-plan separation; look-ahead metrics; AudioWorklet where justified; offline reference render | Audio lead |
| R-02 | Attractive mappings are mathematically valid but musically unusable | High | High | DR-08; mapping pipeline; constraints/presets; composer testing; freeze/edit path | Product/research |
| R-03 | Product becomes seven disconnected toys | Medium | High | Shared project/graph/event/provenance model; cross-lab examples; no lab-private engine | Technical lead |
| R-04 | Empty graph/studio overwhelms new users | High | Medium | Explore mode, loaded presets, guided experiments, progressive disclosure | UX/product |
| R-05 | Exact-time model conflicts with real-time floating audio clocks | Medium | High | Clear beat→seconds boundary; tempo-map tests; immutable render plans | Runtime/audio |
| R-06 | Recursive/graph systems hang browser or flood audio | High | High | Multi-axis budgets, forecast, worker cancellation, source caps, gain safety | Runtime lead |
| R-07 | Penrose implementation is visually plausible but mathematically wrong | Medium | High | DR-09 gate; independent fixtures; geometry invariants; honest placeholder | Research lead |
| R-08 | Psychoacoustic claims overstate evidence or reconstruction of “Troy” | Medium | High | Separate public analysis from official score/session facts; controlled stimuli; qualified claims; no copyrighted stems | Research/product |
| R-09 | Third-party library licensing constrains distribution | Medium | High | Dependency review before adoption; adapters; avoid copying AGPL internals into proprietary core without review | Technical/product |
| R-10 | Bundled samples/assets lack sufficient rights metadata | Medium | High | Asset manifest/license fields; commissioned/CC0/internal samples; packaging checks | Product/legal |
| R-11 | Web MIDI inconsistencies create support burden | High | Medium | Optional capability; explicit browser/context diagnostics; file export fallback | Audio/UX |
| R-12 | 3D visualization consumes effort without adding understanding | Medium | Medium | 2D default; 3D requires information-value rationale and performance budget | UX/visualization |
| R-13 | Provenance storage becomes too large | Medium | Medium | DAG deduplication, trace levels, referenced trace artifacts, pruning policy | Runtime lead |
| R-14 | Project migrations break reproducibility | Medium | High | Sequential migrations; original-byte preservation; golden fixtures; operator version pinning | Project lead |
| R-15 | Offline and real-time rendering diverge audibly | Medium | High | Shared render plan; backend contract tests; documented unsupported DSP | Audio lead |
| R-16 | Accessibility is postponed because visual/audio concepts seem inherently inaccessible | Medium | High | P0 acceptance requirements; semantic projections; equivalent descriptions; external audit | UX/accessibility |
| R-17 | Mathematical terminology varies across sources (e.g., Tonnetz conventions) | High | Medium | DR charters choose explicit conventions; in-product glossary; versioned definitions | Research lead |
| R-18 | Numerical chaos results vary across engines/precision | Medium | Medium | Record integration method/step; tolerance fixtures; Float64 computation; freeze mode | Runtime/research |
| R-19 | LCM/composite cycles become enormous and unusable | High | Medium | Summarize/cap visualization; do not eagerly expand full cycle; rational query model | Lab engineer |
| R-20 | Scope drifts toward a full DAW | High | High | Charter exclusions; event-first approach; evaluate features against hear–see–manipulate–explain thesis | Product lead |
| R-21 | Scope drifts toward an academic demo with weak export/composition value | Medium | High | Composer journeys, MIDI/WAV export, cross-lab projects, usability testing | Product lead |
| R-22 | Performance differs substantially across hardware | High | Medium | tiered profiles, adaptive visuals, explicit budgets, diagnostics, minimum supported profile | QA/runtime |
| R-23 | User-created extreme parameters produce painful or unsafe levels | Medium | High | conservative gains, parameter bounds, normalization, master dynamics, global stop | Audio lead |
| R-24 | No package lock/build reproducibility in Sprint 0 due restricted environment | Mitigated 2026-08-19 | Medium | Run package install in connected CI, commit lockfile, build matrix before M1 acceptance | Technical lead |
| R-25 | Current native-DOM preview is mistaken for production UI architecture | Medium | Medium | ADR and roadmap explicitly frame it as disposable shell/reusable kernel | Technical lead |

## Risk review cadence

- Review critical/high-impact risks at each milestone gate.
- Add a risk whenever a research result invalidates an assumption.
- A risk can close only with linked evidence, not “seems resolved.”
- Release exceptions identify owner, expiry/revisit point, user impact, and fallback.
