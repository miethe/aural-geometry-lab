# Leg B — IntentTree board validation against repository authority

Read-only audit performed against the supplied 73-node dump and the repository's authority chain. No build, install, network operation, Git mutation, or `.claude/` access was performed.

Citation convention used below:

- `D:n` means `board-dump.txt:n` in the supplied scratchpad.
- `B:AGL-NNN` means JSON path `program/backlog.json $.items[?(@.id=="AGL-NNN")]`, including that object's `status`, `dependsOn`, and `acceptanceSummary`.
- `P:Mn` means JSON path `program/program-plan.json $.milestones[?(@.id=="Mn")]`.

## 1. FIDELITY

### Counts and top-level result

The dump contains 73 records: 7 `work_package` nodes and 66 `atomic_task` nodes, and all 73 are flattened to `not_started` (`D:1-73`). The machine backlog contains exactly 142 items (`program/backlog.json:16-1739`; independently stated by `AGENTS.md:42-45`).

The seven work packages align one-for-one with the seven planned milestones M1–M7: M1 is `started`; M2–M7 are `planned`; M7 is explicitly stretch (`program/program-plan.json:92-169`, `P:M1` through `P:M7`). At the atomic layer, however, the board is not a faithful decomposition:

- 33 of 66 atomic tasks are clean scope matches.
- 30 of 66 are partial/composite/stale mismatches.
- 3 of 66 have no machine-backlog item at all.
- Including the seven matching work packages, the 73 board nodes classify as 40 match, 30 mismatch, 3 missing.
- The board's atomic tasks touch 85 unique backlog items at least partially. Therefore 57 of 142 backlog items have no board counterpart; 18 of those are already-done foundation/history and 39 are not done.
- Among those 85 touched items, the authoritative statuses are 31 `started`, 37 `ready`, 4 `planned`, 5 `research-integrated`, 6 `research-gated`, and 2 `blocked`; none is `not_started`. The board therefore erases meaningful maturity and blocking state (`program/backlog.json $.items[?(@.id in the 85 IDs shown in the crosswalk below)].status`; compare `D:1-73`).

“Match” below means the board title maps cleanly to an authoritative item. “Mismatch” means the title combines items, omits a controlling FR-01 completion scope, or assigns work to the wrong maturity/shape. This classification is about scope; Section 2 separately audits dependency and gate state.

### Work-package crosswalk

| Board node | Machine milestone | Result |
|---|---|---|
| M1 — Production project/runtime spine (`D:1`) | `P:M1` | Match; label is slightly older, but the intended M1 project-v3/runtime spine is clear. |
| M2 — Audio/render spine and rhythm-lab alpha (`D:16`) | `P:M2` | Match. |
| M3 — Harmonic and recursive composition alpha (`D:28`) | `P:M3` | Match. |
| M4 — Emergent systems alpha (`D:39`) | `P:M4` | Match. |
| M5 — Aperiodic geometry and full studio beta (`D:48`) | `P:M5` | Match. |
| M6 — Private MVP hardening and release gate (`D:59`) | `P:M6` | Match. |
| M7 — Native iPad proof-of-architecture (`D:69`) | `P:M7` | Match; the board should retain the machine plan's `stretch: true`. |

### Atomic-task crosswalk

| Board node | Backlog counterpart(s) | Result |
|---|---|---|
| M1.1 Project schema v3 + JSON Schema validator (`D:2`) | `B:AGL-010`, `B:AGL-172` | **Mismatch** — describes already-built schema/validator surfaces but omits compatibility negotiation, canonical digest, strict unknown-field/hostile limits, corpus, and semantic freeze. |
| M1.2 Schema migration framework (`D:3`) | `B:AGL-011`, `B:AGL-173` | **Mismatch** — omits loss-aware receipts, source-byte preservation, execution quarantine, and explicit sealed-catalog rebinding. |
| M1.3 Project command bus (`D:4`) | `B:AGL-012`, `B:AGL-174` | **Mismatch** — omits command v2, production handlers, persistent/branching history, crash recovery, and model tests. |
| M1.4 IndexedDB repository (`D:5`) | `B:AGL-013` | Match. |
| M1.5 Asset store (`D:6`) | `B:AGL-014` | Match. |
| M1.6 Portable project package v2 (`D:7`) | `B:AGL-015`, `B:AGL-156`, `B:AGL-179` | **Mismatch** — compresses logical profile, two physical adapters, hostile archive/strict-JSON trust boundary, and round-trip/conflict proof into one vague node. |
| M1.7 Executable operator interface (`D:8`) | `B:AGL-020` | Match. |
| M1.8 Port type checker (`D:9`) | `B:AGL-021` | Match. |
| M1.9 Graph compiler v2 (`D:10`) | `B:AGL-022`, `B:AGL-175` | **Mismatch** — omits content-addressed compiled plans and the single web/native/import compatibility service. |
| M1.10 Worker evaluator (`D:11`) | `B:AGL-023`, `B:AGL-160`, `B:AGL-176` | **Mismatch** — omits evaluation protocol v2 freshness identity, stale-result barrier, cache-only stale admission, and hard termination. |
| M1.11 Deterministic cache (`D:12`) | `B:AGL-024` | Match. |
| M1.12 Evaluation budget service (`D:13`) | `B:AGL-025` | Match. |
| M1.13 Event/mapping provenance trace wiring (`D:14`) | `B:AGL-035`, `B:AGL-050`, `B:AGL-158` | **Mismatch** — a composite of mapping semantics, projection, and Inspector work rather than one atomic backlog item. |
| M1.14 Baseline timeline + mathematical inspector (minimal) (`D:15`) | `B:AGL-032`, `B:AGL-035` | **Mismatch** — combines two items and omits their app-shell, transport, worker, graph, projection, and command dependencies. |
| M2.1 Audio render-plan compiler (`D:17`) | `B:AGL-041`, `B:AGL-161` | **Mismatch** — must be plan-v2 production completion, not merely a compiler over the earlier plan-v1 description. |
| M2.2 Audio schedule binding (runtime-only) (`D:18`) | `B:AGL-177` | **Mismatch** — names the binding but omits legacy-backend cutover, transport/generation state machine, and one-time endpoint quantization. |
| M2.3 Instrument voice registry (`D:19`) | `B:AGL-042` | Match. |
| M2.4 Real-time Web Audio scheduler + instrumentation (`D:20`) | `B:AGL-043` | Match in scope; its empirical limits remain evidence-gated. |
| M2.5 AudioWorklet bridge (`D:21`) | `B:AGL-044` | Match. |
| M2.6 Offline WAV renderer (`D:22`) | `B:AGL-045` | Match. |
| M2.7 Gain/emergency-stop safety (`D:23`) | `B:AGL-049` | Match. |
| M2.8 Migrate Infinite Staircase into canonical graph/audio-plan path (`D:24`) | `B:AGL-060`, `B:AGL-162`, `B:AGL-185` | **Mismatch** — combines graph migration, analytic operator replacement, backend integration, and perceptual acceptance. |
| M2.9 Migrate Euclidean Rings into canonical graph/audio-plan path (`D:25`) | `B:AGL-070` | Match for migration; it does not cover the separate research/interaction items omitted from the board. |
| M2.10 Cross-browser audio scheduler benchmark harness (`D:26`) | `B:AGL-134`, `B:AGL-178` | **Mismatch** — combines harness specification with execution of the physical browser/hardware conformance matrix. |
| M2.11 Infinite-Staircase listening-test fixture (`D:27`) | `B:AGL-065`, `B:AGL-185` | **Mismatch** — the fixture is distinct from the blinded acceptance required before qualified claims. |
| M3.1 Tonnetz convention decision + operator hardening (`D:29`) | `B:AGL-080`, `B:AGL-081` | **Mismatch** — combines preview migration with a DR-04 research-gated decision. |
| M3.2 Tonnetz interactive path editor (`D:30`) | `B:AGL-082` | Match. |
| M3.3 Tonnetz deterministic voicing optimizer (`D:31`) | `B:AGL-083` | Match. |
| M3.4 Fractal grammar/model selection (`D:32`) | `B:AGL-091` | Match in scope; research-gated. |
| M3.5 Fractal seed-motif editor (`D:33`) | `B:AGL-092` | Match. |
| M3.6 Fractal recursion tree + ancestry trace (`D:34`) | `B:AGL-093` | Match. |
| M3.7 Fractal growth forecast + freeze-to-clip (`D:35`) | `B:AGL-094` | Match. |
| M3.8 MIDI exporter (`D:36`) | `B:AGL-130`, Tonnetz portion of `B:AGL-084` | Match; actual byte/loss-manifest completion is separately owned by AGL-180. |
| M3.9 MusicXML subset exporter (`D:37`) | `B:AGL-131`, Tonnetz portion of `B:AGL-084` | Match; same AGL-180 caveat. |
| M3.10 Cross-lab Euclidean→Tonnetz→Fractal example (`D:38`) | None | **Missing** — this is a roadmap milestone outcome (`docs/04-delivery-roadmap.md:89-97`) but has no item in `program/backlog.json $.items`. |
| M4.1 CA sonification + optional 2D scope decision (`D:40`) | `B:AGL-101` | Match in scope; research-gated. |
| M4.2 CA rule-step inspector (`D:41`) | `B:AGL-102` | Match. |
| M4.3 CA lineage + event provenance (`D:42`) | `B:AGL-103` | Match. |
| M4.4 Chaos numerical/mapping profile decision (`D:43`) | `B:AGL-111`, `B:AGL-170` | **Mismatch** — conflates the DR-07/08 lab decision with the cross-runtime numerical conformance profile. |
| M4.5 Chaos control-signal pipeline (`D:44`) | `B:AGL-112` | Match. |
| M4.6 Chaos live/frozen trajectory modes (`D:45`) | `B:AGL-113` | Match. |
| M4.7 Worker performance + cancellation hardening (`D:46`) | `B:AGL-176`, `B:AGL-171` | **Mismatch** — combines freshness/cancellation runtime with workload/evidence calibration. |
| M4.8 Cross-lab modulation example (`D:47`) | None | **Missing** — a roadmap exit outcome (`docs/04-delivery-roadmap.md:105-113`) with no machine-backlog item. |
| M5.1 DR-09 exact-tiling algorithm acceptance (`D:49`) | `B:AGL-120` | Match in subject, but status is stale: construction selection is already `research-integrated`; artifacts/generator remain gated. |
| M5.2 Exact Penrose patch generator (`D:50`) | `B:AGL-121`, `B:AGL-186` | **Mismatch** — one item is ready, the production whole is blocked, and the title hides oracle/halo/identity prerequisites. |
| M5.3 Penrose adjacency graph (`D:51`) | `B:AGL-122`, `B:AGL-186` | **Mismatch** — shared-edge adjacency is part of the blocked exact-production proof. |
| M5.4 Independent oracle/matching corpus + goldens (`D:52`) | `B:AGL-163`, `B:AGL-186` | **Mismatch** — both the artifact-recovery prerequisite and aggregate Penrose completion are blocked, not plain `not_started`. |
| M5.5 Penrose traversal/mapping engine (`D:53`) | `B:AGL-123`, `B:AGL-186` | **Mismatch** — traversal is ready only after the blocked exact generator/oracle chain. |
| M5.6 Replace honest-placeholder Penrose UI (`D:54`) | `B:AGL-124` | Match. |
| M5.7 Typed visual operator graph (production) (`D:55`) | `B:AGL-034`, `B:AGL-175` | **Mismatch** — editor and compiler-compatibility service are separate and belong after B+C/product shell, not as an isolated M5 task. |
| M5.8 Mature timeline/mixer (`D:56`) | `B:AGL-032`, `B:AGL-033` | **Mismatch** — combines two items and masks earlier baseline/dependencies. |
| M5.9 Project packaging + offline WAV export UI (`D:57`) | `B:AGL-015`, `B:AGL-045`, `B:AGL-179`, `B:AGL-180` | **Mismatch** — combines package, offline backend, hostile import, actual codecs, loss manifests, and UI. |
| M5.10 Three examples + onboarding/guided-experiment pass (`D:58`) | `B:AGL-037`, `B:AGL-151` | **Mismatch** — combines an untracked three-example deliverable with player/curriculum work; curriculum remains DR-16-gated. |
| M6.1 Cross-browser matrix (`D:60`) | `B:AGL-134`, `B:AGL-178` | **Mismatch** — authoritative items cover the audio/browser/hardware matrix, not a complete product/browser matrix. |
| M6.2 Accessibility audit + WCAG remediation (`D:61`) | `B:AGL-132`, `B:AGL-150`, `B:AGL-181` | **Mismatch** — combines baseline, DR-13-gated hardening, and semantic-mirror parity integration. |
| M6.3 Performance budgets + stress fixtures (`D:62`) | `B:AGL-133`, `B:AGL-171` | **Mismatch** — combines general property/invariant testing with workload/evidence calibration. |
| M6.4 Recovery/failure-mode testing (`D:63`) | recovery portions of `B:AGL-013`, end-to-end portions of `B:AGL-135` | **Mismatch** — no dedicated backlog item defines the full recovery/failure-mode scope. |
| M6.5 Dependency/license review + SBOM (`D:64`) | `B:AGL-136` | Match. |
| M6.6 Research-claim/evidence review (`D:65`) | `B:AGL-169`, `B:AGL-183` | **Mismatch** — registry creation and enforced use across UI/docs/examples/release are distinct from a final review. |
| M6.7 Representative user studies (`D:66`) | None | **Missing** — a roadmap M6 outcome (`docs/04-delivery-roadmap.md:140-150`) with no machine-backlog item; AGL-065 is only a Risset listening fixture. |
| M6.8 Reproducible CI build (`D:67`) | CI portions of `B:AGL-030`, `B:AGL-136` | **Mismatch** — CI is present on the board, but the production scaffold and pre-M1 reproducibility trigger are absent/mis-sequenced. |
| M6.9 Private-beta release gate sign-off (`D:68`) | `B:AGL-137` | Match. |
| M7.1 Native project/document round-trip (`D:70`) | `B:AGL-147`, `B:AGL-167` | Match as a bounded POA subtask. |
| M7.2 AVAudioEngine adapter over plan (`D:71`) | `B:AGL-147`, `B:AGL-168` | Match as a bounded POA subtask. |
| M7.3 Adaptive iPad layout + shared fixtures (`D:72`) | `B:AGL-147`, `B:AGL-146`, `B:AGL-182` | Match as a bounded POA/conformance subtask. |
| M7.4 Euclidean iPad proof + go/no-go (`D:73`) | `B:AGL-147` | Match. |

### Backlog items with no board node

The 57 IDs below do not have a board counterpart under the crosswalk above. This is an exhaustive set difference between the 142 authoritative item IDs and the 85 unique IDs touched by the board.

Already done (18; omission is historical rather than unexecuted work):

| # | Backlog item | Status | Authoritative title/evidence |
|---:|---|---|---|
| 1 | `AGL-001` | done | Program charter and MVP boundaries (`B:AGL-001`). |
| 2 | `AGL-002` | done | Exact rational musical time (`B:AGL-002`). |
| 3 | `AGL-003` | done | Canonical event and pattern model (`B:AGL-003`). |
| 4 | `AGL-004` | done | Typed and versioned operator catalog (`B:AGL-004`). |
| 5 | `AGL-005` | done | Seed and stable-ID utilities (`B:AGL-005`). |
| 6 | `AGL-006` | done | Mathematical operator kernels (`B:AGL-006`). |
| 7 | `AGL-007` | done | Runnable browser foundation (`B:AGL-007`). |
| 8 | `AGL-008` | done | Initial invariant test harness (`B:AGL-008`). |
| 9 | `AGL-140` | done | Final cross-platform UI/UX design specification (`B:AGL-140`). |
| 10 | `AGL-141` | done | Cross-surface selection and interaction contract (`B:AGL-141`). |
| 11 | `AGL-142` | done | Platform-neutral design tokens and manifests (`B:AGL-142`). |
| 12 | `AGL-143` | done | Compile-tested Swift portable-contract spike (`B:AGL-143`). |
| 13 | `AGL-152` | done | Wave-1 research evidence archive (`B:AGL-152`). |
| 14 | `AGL-153` | done | Wave-1 cross-run decision register (`B:AGL-153`). |
| 15 | `AGL-154` | done | Integrated architecture baseline v0.3 (`B:AGL-154`). |
| 16 | `AGL-165` | done | Wave-1 UI/UX semantic amendment (`B:AGL-165`). |
| 17 | `AGL-166` | done | Wave-1 cross-run adversarial architecture review (`B:AGL-166`). |
| 18 | `AGL-188` | done | FR-01 repository-wide adversarial hardening baseline v0.4 (`B:AGL-188`). |

Not done (39; material board gaps):

| # | Backlog item | Status | Authoritative title/evidence |
|---:|---|---|---|
| 19 | `AGL-026` | planned | Explicit state and delay operators (`B:AGL-026`). |
| 20 | `AGL-027` | started | Graph freeze-to-clip (`B:AGL-027`). |
| 21 | `AGL-031` | ready | Transport (`B:AGL-031`). |
| 22 | `AGL-036` | started | Linked selection (`B:AGL-036`). |
| 23 | `AGL-038` | planned | Preset browser (`B:AGL-038`). |
| 24 | `AGL-040` | started | Native Web Audio reference backend (`B:AGL-040`). |
| 25 | `AGL-046` | deferred | Optional Tone.js adapter (`B:AGL-046`). |
| 26 | `AGL-047` | deferred | Faust and WASM DSP proof (`B:AGL-047`). |
| 27 | `AGL-048` | research-integrated | Web MIDI adapter (`B:AGL-048`). |
| 28 | `AGL-051` | ready | Shared 2D canvas (`B:AGL-051`). |
| 29 | `AGL-052` | planned | 3D canvas adapter (`B:AGL-052`). |
| 30 | `AGL-053` | started | Accessible mathematical descriptions (`B:AGL-053`). |
| 31 | `AGL-054` | planned | Visual snapshot and video export (`B:AGL-054`). |
| 32 | `AGL-061` | research-integrated | Risset psychoacoustic parameter profile (`B:AGL-061`). |
| 33 | `AGL-062` | research-integrated | Log-tempo visualization (`B:AGL-062`). |
| 34 | `AGL-063` | research-integrated | Source-pattern and subdivision engine (`B:AGL-063`). |
| 35 | `AGL-064` | research-integrated | Shepard pitch coupling (`B:AGL-064`). |
| 36 | `AGL-071` | research-gated | Euclidean algorithm and preset evidence (`B:AGL-071`). |
| 37 | `AGL-072` | ready | Direct ring manipulation (`B:AGL-072`). |
| 38 | `AGL-073` | ready | Composite cycle analysis (`B:AGL-073`). |
| 39 | `AGL-074` | planned | Accent and probability layer (`B:AGL-074`). |
| 40 | `AGL-090` | started | Bounded fractal recursion preview (`B:AGL-090`). |
| 41 | `AGL-100` | started | Elementary CA preview migration (`B:AGL-100`). |
| 42 | `AGL-104` | planned | Validated richer CA mode (`B:AGL-104`). |
| 43 | `AGL-110` | started | Lorenz RK4 preview migration (`B:AGL-110`). |
| 44 | `AGL-114` | planned | Nearby-initial-condition comparison (`B:AGL-114`). |
| 45 | `AGL-144` | ready | React production shell from final design contract (`B:AGL-144`). |
| 46 | `AGL-145` | started | Harden graph/timeline/direct-manipulation command semantics (`B:AGL-145`). |
| 47 | `AGL-148` | planned | iPhone companion experience (`B:AGL-148`). |
| 48 | `AGL-149` | ready | Canonical high-fidelity mockup set (`B:AGL-149`). |
| 49 | `AGL-155` | started | Canonical semantic digest service (`B:AGL-155`). |
| 50 | `AGL-157` | ready | Materialization receipt and source-recipe store (`B:AGL-157`). |
| 51 | `AGL-159` | ready | Generated identity capability registry (`B:AGL-159`). |
| 52 | `AGL-164` | started | Exact Q(phi) kernel and Penrose identity foundation (`B:AGL-164`). |
| 53 | `AGL-184` | planned | Legacy v1/v2 contract quarantine and removal plan (`B:AGL-184`). |
| 54 | `AGL-187` | ready | FR-01 property, mutation, schema-differential, and fuzz corpus (`B:AGL-187`). |
| 55 | `AGL-189` | ready | Operator implementation conformance receipts and semantic-version enforcement (`B:AGL-189`). |
| 56 | `AGL-190` | ready | Streaming canonical digest and fragmented render-plan/export pipeline (`B:AGL-190`). |
| 57 | `AGL-191` | ready | Native strict-JSON and hostile package-import conformance (`B:AGL-191`). |

The two deferred entries may remain off the execution loop, but their deliberate deferral must be represented rather than erased (`B:AGL-046`, `B:AGL-047`).

## 2. SEQUENCING

### Does the board order agree with the swarm sequence?

Only at a coarse milestone level. The original handoff orders project/schema/package Stream A first, then B commands/material, C graph/runtime, and G native contracts; A+C feeds D audio, B+C feeds E product UI, C plus DR-09 artifacts feeds F Penrose, and all streams continuously feed H quality (`docs/22-swarm-implementation-handoff.md:151-163`). The FR-01 amendment preserves that dependency graph with project v3/package trust at the root and names the immediate owners added by FR-01 (`docs/27-fr01-swarm-handoff-amendment.md:39-64`).

The board's simple M1→M7 list gets “runtime before audio/labs” broadly right but loses four important structures:

1. **A, B, C, and bounded G are parallel dependency branches, not one unqualified M1 queue.** The board supplies no edges, dependency state, or stream ownership (`D:1-15`; compare `docs/27-fr01-swarm-handoff-amendment.md:43-50,55-63`).
2. **Product UI E requires B+C and the production shell.** M1.14 schedules timeline/Inspector without any React/Vite shell node, while M5.7 delays the production graph editor until M5; authoritative dependencies require AGL-030/144 plus command/compiler/worker services (`B:AGL-030`, `B:AGL-032`, `B:AGL-034`, `B:AGL-035`, `B:AGL-144`, `B:AGL-175`; `docs/27-fr01-swarm-handoff-amendment.md:60`).
3. **Quality H is a cross-cutting stream.** Moving nearly all quality work to M6 conflicts with “all streams → H”; semantic PR evidence, negative/hostile/property tests, claims, and clean archive gates travel with each change (`docs/22-swarm-implementation-handoff.md:140-149,162,165-176`; `docs/27-fr01-swarm-handoff-amendment.md:63,72-86`).
4. **Native conformance G begins from A, not only after M6.** The stretch product POA may remain M7, but cross-platform project/digest/ID/PRNG/package/strict-JSON fixtures are immediate conformance work owned by AGL-182/191 (`docs/27-fr01-swarm-handoff-amendment.md:49,58`; `B:AGL-182`, `B:AGL-191`).

### Nodes shown plainly `not_started` despite gates/blockers

Every board record is `not_started` and none displays a blocker (`D:1-73`). At minimum the following need explicit dependency/gate metadata:

| Board node(s) | Required gate/dependency that the board hides |
|---|---|
| M1.1 | M1 is already `started`, not unstarted. FR-02 must pass before project v3 is declared frozen (`P:M1`; `program/frontier-run-register.json:25-29`; `docs/17-frontier-model-runbook.md:41-58`). AGL-172 also depends on AGL-010, AGL-011, and AGL-155 (`B:AGL-172`). |
| M1.2 | AGL-173 depends on AGL-172 and AGL-020; blocking migration losses must quarantine execution pending explicit user rebinding (`B:AGL-173`; `program/fr01-findings-register.json:620-636`). |
| M1.3 | AGL-174 depends on AGL-012 and AGL-172; editor wiring must wait for the command/history store and adapters (`B:AGL-174`, `B:AGL-145`). |
| M1.4→M1.6 | IndexedDB depends on project/commands; asset store depends on IndexedDB; package proof/import depends on migration, assets, AGL-156, and AGL-172 (`B:AGL-013`, `B:AGL-014`, `B:AGL-015`, `B:AGL-156`, `B:AGL-179`). |
| M1.9→M1.10 | Compiler production depends on the command path; worker freshness depends on compiler, cache, budgets, and host-owned determinism (`B:AGL-175`, `B:AGL-176`; `program/fr01-findings-register.json:850-886`). |
| M1.14, M5.7, M5.8 | Product surfaces are gated by B+C and by the absent AGL-030/144 production shell (`docs/27-fr01-swarm-handoff-amendment.md:60`; `B:AGL-030`, `B:AGL-144`). |
| M2.1→M2.10 | Audio D requires A+C. M2 entry explicitly retains production backend cutover and the physical browser scheduler matrix (`P:M2`; `docs/27-fr01-swarm-handoff-amendment.md:61`). M2.4/2.5/2.10 consume DR-03 but benchmark constants remain candidates until measured (`B:AGL-043`, `B:AGL-044`, `B:AGL-134`, `B:AGL-178`). |
| M2.8 and M2.11 | Production Risset acceptance depends on AGL-162, AGL-177, and AGL-178; a blinded protocol must establish only qualified claims (`B:AGL-185`). |
| M2.9 | The migration itself maps to AGL-070, but the board omits the separate DR-02-gated Euclidean convention/evidence item AGL-071 (`B:AGL-070`, `B:AGL-071`). |
| M3.1 | Tonnetz model/terminology is DR-04 research-gated (`B:AGL-081`). |
| M3.4 | Fractal semantics/claims are DR-05 research-gated (`B:AGL-091`). |
| M4.1 | CA mapping/richer-mode selection is DR-06/DR-08 research-gated (`B:AGL-101`). |
| M4.4 | Chaos integrator/mapping/claims are DR-07/DR-08 research-gated; cross-platform numeric behavior also needs AGL-170 (`B:AGL-111`, `B:AGL-170`). |
| M5.1 | DR-09 construction selection is already integrated, so `not_started` is wrong; the remaining gate is artifact recovery and exact generation (`B:AGL-120`; `P:M5`). |
| M5.2–M5.5 | AGL-163 and AGL-186 are machine-status `blocked`; production Penrose requires recovered/regenerated goldens, two independent oracles, legal-star/matching corpus, exact halo/adjacency, and stable traversal (`B:AGL-163`, `B:AGL-186`; `docs/20-wave1-adversarial-architecture-review.md:73-79`; `program/fr01-findings-register.json:543-560`). |
| M5.10 | Curriculum hardening is DR-16 research-gated (`B:AGL-151`). |
| M6.2 | Multimodal accessibility hardening is DR-13 research-gated; integration also depends on production shell/compiler (`B:AGL-150`, `B:AGL-181`). |
| M6.6 | Scientific copy must resolve through the trusted claim register; caller-provided evidence cannot unlock it (`AGENTS.md:78-80`; `docs/27-fr01-swarm-handoff-amendment.md:35-37`; `B:AGL-169`, `B:AGL-183`). |
| M6.8 | This is too late for R-24's “before M1 acceptance” trigger, even though the program-plan M6 exit also names reproducible CI (`docs/09-risk-register.md:33`; `P:M6`; `B:AGL-030`). |
| M6.9 | Requires AGL-135 and AGL-136 plus signed charter/risk exceptions (`B:AGL-137`). |
| M7.1–M7.3 | Product POA is stretch, but native editing/execution is gated by package/container proof and strict JSON/package parity (`docs/25-fr01-contract-and-migration-amendment.md:135-154`; `B:AGL-167`, `B:AGL-182`, `B:AGL-191`). |

In addition, any node that changes project/migration, operator/digest, exact time/sample conversion, IDs/randomness, graph legality, commands/history, async/cache, materialization, audio plans, export, cross-platform fixtures, accessibility, or claims requires escalation/versioning and the applicable ADR plus the full semantic-PR evidence set. The board has none of that acceptance metadata (`docs/27-fr01-swarm-handoff-amendment.md:19-37,66-86`; `AGENTS.md:81-89`).

## 3. FIRST ACTIONABLE WORK

**No: M1.1 as titled is not the genuine first executable action.** It asks an agent to build “Project schema v3 + JSON Schema validator,” but those contracts already exist in the hardened reference baseline; the authoritative remaining work is hostile compatibility/freeze, not greenfield schema creation (`AGENTS.md:50-57`; `B:AGL-010`).

There are two precise levels:

1. **First executable gate action:** run **FR-02 — Project Format and Migration Torture Test**. It is machine-status `ready`, and M1's entry/freeze gate says it remains required before project v3 can be declared frozen (`program/frontier-run-register.json:25-29`; `P:M1`; `docs/17-frontier-model-runbook.md:41-58`). Its outputs are the compatibility matrix, unknown-field/required-feature policies, migration graph, rollback/recovery semantics, package/addressing rules, canonical normalization, hostile corpus, and migration property tests—not a generic schema task.
2. **First implementation owner after/alongside that gate:** **AGL-172 — Project v3 semantic freeze and hostile compatibility corpus**, the first FR-01 Stream-A immediate owner. Its acceptance requires project v3, compatibility negotiation, canonical semantic digest, strict unknown-field policy, hostile limits, and valid/invalid/migration corpora to be frozen and passing (`docs/27-fr01-swarm-handoff-amendment.md:41-45,52-58`; `B:AGL-172`).

Minimal correction: rename/re-scope M1.1 to “FR-02 + AGL-172 Project v3 semantic freeze and hostile compatibility corpus,” mark it `started` with a completion gate on FR-02, and record dependencies on AGL-010, AGL-011, and AGL-155. If FR-02 is maintained as a non-implementation/run node, add it immediately before M1.1 and make M1.1 the AGL-172 implementation follow-through (`program/frontier-run-register.json:25-29`; `B:AGL-172`).

## 4. MISSING WORK

### Deployment/local/LAN and CI claims

**Deployment/local-or-LAN board node: confirmed absent.** The exhaustive dump contains no deployment, hosting, runbook, environment, LAN acceptance, health-check, or release-host node (`D:1-73`). The current repository can build/serve the disposable static preview: `npm run dev` and `npm run serve` exist (`package.json:10-20`), the README points to `http://localhost:4173` (`README.md:136-149`), and the server binds `0.0.0.0` (`scripts/serve.mjs:13,48-50`). That proves local/LAN-capable preview serving, not production-app deployment; the production React app is explicitly not built (`AGENTS.md:12-15,59-66`). A board intended to reach a running production app needs a separate deployment/run acceptance node after the production shell, including bind/host configuration, asset base/routing behavior, health/smoke check, and documented operator steps. A specific external host/deployment target is **unverified** because none is authorized or named in the sources.

**CI-node absence: refuted.** M6.8 is explicitly “Reproducible CI build” (`D:67`). What is true is that `.github/workflows` is absent in the live checkout and AGENTS says no CI config is checked in (`AGENTS.md:59-66`). The board also places CI too late: AGL-030's acceptance includes CI, and R-24 says the connected lockfile/build matrix is required before M1 acceptance (`B:AGL-030`; `docs/09-risk-register.md:33`). The machine milestone plan also lists reproducible CI in M6, so the repository currently contains an internal sequencing tension: the minimal safe correction is an M1 production-scaffold/CI-foundation node plus a later M6 reproducibility/release verification node (`P:M6`; `B:AGL-030`, `B:AGL-136`).

### Other required categories omitted or materially under-specified

The 39 not-done, no-counterpart IDs in Section 1 are the exhaustive item-level omissions. Grouped by the handoff's A–H streams, the missing categories are:

1. **Project/package trust and lifecycle (A):** canonical semantic digest/content-addressed stores (AGL-155); explicit freeze-to-clip/materialization receipt and source-recipe store (AGL-027/157); legacy v1/v2 quarantine/removal (AGL-184); and native strict-JSON/hostile package parity (AGL-191). M1.2/M1.6 partially imply source bytes/rebinding/archive work but do not name these owners (`docs/22-swarm-implementation-handoff.md:40-51`; `docs/27-fr01-swarm-handoff-amendment.md:43`; `B:AGL-027`, `B:AGL-155`, `B:AGL-157`, `B:AGL-184`, `B:AGL-191`).
2. **Commands/material/session state (B):** hardened graph/timeline/direct-manipulation state machines and React adapters (AGL-145), generated identity capability registry (AGL-159), and linked selection/focus/orphan integration (AGL-036). These are required before editor wiring, not optional UI polish (`docs/22-swarm-implementation-handoff.md:53-65`; `B:AGL-036`, `B:AGL-145`, `B:AGL-159`).
3. **Graph/runtime completion (C):** explicit state/delay operators (AGL-026), operator implementation-conformance receipts/version enforcement (AGL-189), and the separately named derivation/materialization/identity work above. M1.9/M1.10 do not cover receipt enforcement (`docs/27-fr01-swarm-handoff-amendment.md:45`; `B:AGL-026`, `B:AGL-189`).
4. **Audio/runtime and bounded large artifacts (D):** the existing native Web Audio backend item (AGL-040), Web MIDI adapter (AGL-048), and streaming canonical digest/fragmented plan/export pipeline (AGL-190). Optional Tone.js/Faust items AGL-046/047 are deliberately deferred but should be represented as such if the board claims backlog fidelity (`docs/22-swarm-implementation-handoff.md:81-95`; `docs/27-fr01-swarm-handoff-amendment.md:46`; `B:AGL-040`, `B:AGL-046`, `B:AGL-047`, `B:AGL-048`, `B:AGL-190`).
5. **Production product/visualization shell (E):** production React shell/app scaffold (AGL-144 and the non-CI parts of AGL-030), transport (AGL-031), linked selection (AGL-036), preset browser (AGL-038), shared 2D canvas (AGL-051), 3D adapter (AGL-052), accessible mathematical descriptions (AGL-053), visual snapshot/video export (AGL-054), and canonical mockup set (AGL-149). This is the largest structural hole and makes M1.14/M5.7/M5.8 undispatchable as product work (`docs/22-swarm-implementation-handoff.md:97-109`; `docs/27-fr01-swarm-handoff-amendment.md:47`; corresponding `B:` objects).
6. **Lab completion outside headline tasks (F/labs):** Risset profile/visual/subdivision/pitch work (AGL-061–064); Euclidean evidence, direct manipulation, composite analysis, and probability layer (AGL-071–074); existing fractal/CA/chaos preview migrations (AGL-090/100/110); richer CA mode (AGL-104); nearby-chaos comparison (AGL-114); and the separately started exact Q(phi)/Penrose identity foundation (AGL-164). The board jumps from headline migrations/decisions to later UI without these authoritative items (corresponding `B:` objects; `AGENTS.md:50-65`).
7. **Native/conformance work distinct from the stretch app (G):** strict native import parity AGL-191 has no node; the board's broad M7 nodes only partially express document-conflict/container proof (AGL-167), process-wide audio/MIDI coordination (AGL-168), and TS/Swift conformance (AGL-182). The first is an architecture/security gate, not optional full-native parity (`docs/27-fr01-swarm-handoff-amendment.md:49`; `docs/25-fr01-contract-and-migration-amendment.md:135-154`; `B:AGL-167`, `B:AGL-168`, `B:AGL-182`, `B:AGL-191`).
8. **Continuous quality/evidence (H):** FR-01 property/mutation/schema-differential/fuzz corpus (AGL-187), operator receipts (AGL-189), streaming/fragmentation evidence (AGL-190), native hostile differential corpus (AGL-191), and a dedicated release/build claim-enforcement path. M6.3/M6.4 are too generic and too late (`docs/22-swarm-implementation-handoff.md:140-149`; `docs/27-fr01-swarm-handoff-amendment.md:50,63`; `B:AGL-187`, `B:AGL-189`, `B:AGL-190`, `B:AGL-191`).
9. **Machine-backlog holes created by roadmap-only outcomes:** the board contains the Euclidean→Tonnetz→Fractal example, the no-audio-thread cross-lab modulation example, and representative user studies, but the machine backlog has no owning item for any of them (`D:38,47,66`; `docs/04-delivery-roadmap.md:89-97,105-113,140-150`; `program/backlog.json $.items`). They need new backlog IDs or an explicit decision to remove them from the board; the board cannot be the only source of their acceptance semantics.
10. **Per-task governance metadata:** mandatory read order, relevant ADR, schema/fixture/version impact, migration impact, determinism/cache class, accessibility/claim/export impact, negative tests, empirical-outstanding statement, and clean-extraction/check evidence are required by the handoff but absent from every title-only atomic node (`docs/22-swarm-implementation-handoff.md:9-20,165-176`; `docs/27-fr01-swarm-handoff-amendment.md:7-17,72-86`).

## 5. PER-NODE READINESS — M1.1 THROUGH M1.6

None of M1.1–M1.6 has enough definition **as titled** for safe dispatch. The authoritative items provide the missing predicates, dependencies, version/gate state, and rejected behavior.

### M1.1 — Project schema v3 + JSON Schema validator

**Dispatch readiness: No; stale/underspecified.** Project v3 runtime validation and Draft 2020-12 schema already exist; the remaining work is compatibility/hostile-corpus/freeze (`B:AGL-010`; `AGENTS.md:50-57`).

Acceptance predicates to attach:

- Strict project-v3 runtime validator and Draft 2020-12 schema agree for all valid and invalid fixtures; diagnostic paths remain precise (`B:AGL-010`).
- Compatibility negotiation, canonical semantic digest, strict unknown-field policy, hostile input limits, and valid/invalid/migration corpora are frozen and passing (`B:AGL-172`).
- FR-02 produces and exercises the compatibility matrix, unknown-feature policy, migration graph, rollback/recovery, package/addressing, canonical normalization, hostile corpus, and property tests before the board claims “frozen” (`P:M1`; `docs/17-frontier-model-runbook.md:41-58`).
- Any semantic change advances a version/migration or is proven to restore specified semantics; schema, runtime validator, fixture, manifest hash, ADR, and PR evidence move together (`AGENTS.md:81-98`; `docs/27-fr01-swarm-handoff-amendment.md:19-21,72-86`).

### M1.2 — Schema migration framework

**Dispatch readiness: No; stale/underspecified.** “Framework” omits the safety behavior that makes migration executable (`B:AGL-011`, `B:AGL-173`).

Acceptance predicates to attach:

- V1→v2→v3 is sequential and deterministic and emits canonical migration receipts with explicit blocking losses (`B:AGL-011`).
- Original source bytes/hash are preserved separately from normalized semantic digest; opaque extensions are retained (`program/fr01-findings-register.json:714-731`; `B:AGL-011`).
- Blocking loss quarantines execution until the user reviews the preserved data and explicitly rebinds every legacy operator to a sealed catalog digest; no plausible synthetic historical digest is executed (`B:AGL-173`; `program/fr01-findings-register.json:620-636`).
- Migration torture/property corpus passes, and new writes never emit project v1/v2 (`docs/27-fr01-swarm-handoff-amendment.md:23-27`; `program/fr01-contract-manifest.json:203-218`; `B:AGL-011`).
- Dependencies AGL-172 and AGL-020 are explicit; later legacy-reader isolation/removal remains AGL-184 rather than being silently treated as done (`B:AGL-173`, `B:AGL-184`).

### M1.3 — Project command bus

**Dispatch readiness: No; stale/underspecified.** The authority is semantic command v2 plus a production handler/history store, not a generic bus (`B:AGL-012`, `B:AGL-174`).

Acceptance predicates to attach:

- Every production command has validated apply/inverse semantics, typed target/write sets and preconditions; inverse data is core-generated, not trusted from UI (`B:AGL-012`; `program/fr01-findings-register.json:71-90`).
- Transactions are clone-first and atomic, reject aliased shallow clones, suppress no-ops, and leave authoritative state unchanged on failure (`B:AGL-012`; `program/fr01-findings-register.json:251-267,889-905`).
- Undo/redo branching, persistent history, grouped gestures/edit-session coalescing, and crash recovery pass model-based tests (`B:AGL-174`).
- Coalescing requires one explicit edit session with identical action, target set, and write set; time proximity alone is insufficient (`program/fr01-findings-register.json:269-286`).
- AGL-172 is an explicit dependency, and React adapters/editor wiring wait for the production store (`B:AGL-174`, `B:AGL-145`).

### M1.4 — IndexedDB repository

**Dispatch readiness: No as titled; close once AGL-013 is attached.** The title identifies the technology but not the behaviors or dependencies (`B:AGL-013`).

Acceptance predicates to attach:

- Autosave, recovery, list, open, duplicate, delete, and storage diagnostics work and have usable failure states (`B:AGL-013`).
- Persistence uses the accepted project-v3/command-v2 semantics and does not flatten source bytes, migration receipts, unknown/unresolved states, or runtime/session state into canonical project meaning (`B:AGL-010`, `B:AGL-012`; `docs/27-fr01-swarm-handoff-amendment.md:25-37`).
- Dependencies AGL-010 and AGL-012 are represented; round-trip, crash/recovery, quota/failure, and malformed-import rejection tests are acceptance evidence (`B:AGL-013`; general item DoD at `docs/04-delivery-roadmap.md:192-201`).

### M1.5 — Asset store

**Dispatch readiness: No as titled.** The machine item is already `started`; its remaining work is more specific than “asset store” (`B:AGL-014`).

Acceptance predicates to attach:

- Logical package manifest, safe member paths, and content-addressed asset semantics are enforced (`B:AGL-014`).
- Native-directory and portable-archive adapters are completed without treating physical metadata as semantic identity (`B:AGL-014`, `B:AGL-156`).
- Actual member bytes, size/hash, path safety, declared membership, and bounded totals are verified at the trust boundary; links/devices/traversal/case collisions/bombs are rejected (`program/fr01-findings-register.json:155-172,829-847`; `B:AGL-179`).
- AGL-013 is explicit as the dependency; license/rights metadata/review remains linked to AGL-136 rather than assumed (`B:AGL-014`, `B:AGL-136`).

### M1.6 — Portable project package v2

**Dispatch readiness: No; composite and security-critical.** This title merges at least AGL-015, AGL-156, and AGL-179 and does not define which physical profile or attack surface an agent owns (`B:AGL-015`, `B:AGL-156`, `B:AGL-179`).

Acceptance predicates to attach:

- Browser archive and native directory profiles round-trip to the same logical member set and semantic package digest; physical metadata is not semantic identity (`B:AGL-015`, `B:AGL-156`).
- Source/project bytes, manifest, assets, warnings, and hashes are complete; conflict behavior preserves data rather than silently choosing one version (`B:AGL-015`; package conflict owner `B:AGL-167`).
- Streaming import rejects traversal, links/devices, duplicate/case-colliding paths, bombs, size/hash mismatch, undeclared/missing members, malformed strict JSON, and corrupt authoritative projects before execution (`B:AGL-179`; `program/fr01-findings-register.json:155-172,829-847`).
- Directory/archive logical round-trip and hostile corpus pass; native strict-JSON/package outcomes must eventually match TypeScript (`B:AGL-179`, `B:AGL-191`).
- Dependencies AGL-011/014, AGL-156, and AGL-172 are explicit, and applicable ADR 0023 plus schema/runtime/fixture/manifest-hash evidence accompanies the change (`B:AGL-015`, `B:AGL-156`, `B:AGL-179`; `program/fr01-contract-manifest.json:122-131,245-250`).

## VERDICT

**No — the board is not accurate enough to loop through as-is.** Its milestone names are sound, but its atomic layer flattens all state to `not_started`, omits 39 not-done backlog items, leaves 30 of 66 tasks materially composite/stale, contains three roadmap-only tasks without machine-backlog owners, hides the FR-02/DR/ADR/claim/Penrose/native/quality gates, omits the production shell and deployment work, and delays CI/conformance evidence to the wrong phase (`D:1-73`; Sections 1–4 evidence above).

Minimal corrections required before looping:

1. Preserve the seven M1–M7 packages, but bind every atomic node to explicit backlog ID(s), `dependsOn`, authoritative status, stream owner, and acceptance summary.
2. Add the 39 not-done/no-counterpart backlog items, or explicitly mark deliberate deferrals/exclusions; do not silently omit them. Completed M0/M0.5/M0.75/M0.9 items may remain outside the active loop but should be represented as completed baseline dependencies (`P:M1`; `B:AGL-188`).
3. Put FR-02 before project-v3 freeze and rescope M1.1 to AGL-172; restore A→B/C/G, A+C→D, B+C→E, C+DR-09→F, and all→H dependency edges (`docs/27-fr01-swarm-handoff-amendment.md:52-64`).
4. Mark AGL-163/186 Penrose work blocked, preserve all DR/claim/native/security gates, and attach the applicable ADR/PR evidence checklist to semantic nodes (`docs/27-fr01-swarm-handoff-amendment.md:19-37,66-86`).
5. Add the missing production React shell/app-scaffold and a separate local/LAN/deployment acceptance node. Keep M6.8, but split CI foundation into M1 (AGL-030/R-24) and final reproducibility/release verification into M6 (`B:AGL-030`; `docs/09-risk-register.md:33`; `P:M6`).
6. Give M3.10, M4.8, and M6.7 machine-backlog IDs with acceptance/dependencies, or remove them from the executable board until admitted into `program/backlog.json` (`D:38,47,66`; `program/backlog.json $.items`).

After those corrections, the board can serve as an execution projection of the repository authority. Until then, looping it would dispatch stale, under-scoped, out-of-order, and in two cases explicitly blocked work.
