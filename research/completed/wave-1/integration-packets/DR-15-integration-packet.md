2026-08-18

# Aural Geometry Lab — DR-15 Research Integration Packet

**Research run:** DR-15 — Cross-Platform Core Strategy  
**Program snapshot evaluated:** 2026-08-14  
**Packet status:** Proposed for central Wave 1 integration  
**Primary source:** Completed DR-15 report, program backlog, frontier-run register, lab manifest, program plan, and research register. 
## TL;DR

AGL should adopt a **conformance-first split core**: share schemas, formal semantics, fixtures, wire formats, and compatibility tests now; share implementation only after measured evidence justifies it.

TypeScript remains the executable browser reference during semantic stabilization. Swift implements only the native capabilities required by the bounded iPad proof. JavaScriptCore is valuable as a test oracle, not as the shipping native runtime.

Rust and Swift/WebAssembly remain future candidates for **selective, coarse-grained kernels**. Neither has met the burden of proof because no evidence-grade AGL browser/iPad benchmark results yet exist.

The immediate architecture work is not a language migration. It is the portable semantic contract: exact rational serialization, versioned deterministic generation, floating-point profiles, cancellation semantics, project compatibility, backend-neutral provenance, real-time audio isolation, and cross-platform fixtures.

## Evidence-status vocabulary

| Label | Meaning |
|---|---|
| **E — Established evidence** | Directly supported by the AGL program artifacts, completed DR-15 report, an accepted standard, or primary platform documentation. |
| **I — Strong inference** | Follows strongly from established evidence but was not directly measured in AGL. |
| **R — Engineering recommendation** | Proposed implementation or policy choice intended for AGL adoption. |
| **S — Speculative possibility** | Plausible future option that has not passed AGL-specific feasibility, conformance, or performance gates. |

A recommendation is not converted into an established fact merely because it appears in this packet. Numeric adoption thresholds retained from DR-15 remain **provisional policy values** until FR-08 ratifies them.

---

# 1. Executive Decision Summary

| # | Disposition | Decision | Basis and implementation consequence |
|---:|---|---|---|
| 1 | **ADOPT** | Use a **conformance-first selective-core architecture**. | AGL needs one semantic truth more urgently than one implementation language. The architecture should make project compatibility, exact values, deterministic outputs, and operator behavior portable before introducing a third production toolchain. |
| 2 | **ADOPT WITH CONDITIONS** | Keep TypeScript as the executable reference implementation through semantic stabilization. | TypeScript is subordinate to accepted schemas, ADRs, formal contracts, and language-neutral fixtures. An implementation bug must not become normative merely because it exists in the reference code. |
| 3 | **ADOPT WITH CONDITIONS** | Implement only the Swift semantics required by AGL-147 and later proven native requirements. | AGL-147 is a bounded iPad proof: open a Euclidean project, render rings, play via native audio, edit, save, and pass shared fixtures. It is not a commitment to full native graph/runtime parity. |
| 4 | **ADOPT** | Make schemas, migrations, rational rules, seed vectors, stable-ID rules, operator fixtures, numerical profiles, benchmark manifests, and project corpora platform-neutral. | These artifacts become the normative cross-platform semantic layer and directly extend AGL-143, AGL-146, FR-07, and FR-08. |
| 5 | **ADOPT** | Serialize arbitrary-size rational numerator and denominator values as canonical decimal strings. | JSON numbers do not provide portable arbitrary-precision integer semantics. ECMAScript BigInt is arbitrary precision, but project interchange must remain language-neutral. |
| 6 | **ADOPT** | Persist deterministic-generation algorithm identity and version alongside seeds and stream identity. | “Same seed” is meaningful only when algorithm, seed encoding, stream derivation, and operator semantics are also fixed. Do not introduce a new PRNG in this packet; externalize the accepted AGL-005 behavior. |
| 7 | **ADOPT** | Keep graph compilation, scheduling, cancellation, progress, cache ownership, error policy, and result commitment in the host runtime. | Selective kernels should be pure compute services. Moving orchestration across an FFI boundary prematurely would enlarge semantic and concurrency risk without demonstrated benefit. |
| 8 | **ADOPT** | Require coarse-grained, buffer-oriented kernel boundaries. | No per-event, per-node, per-rational, or per-provenance-record FFI calls. Requests and results cross once as versioned batches with explicit ownership. |
| 9 | **ADOPT** | Keep domain evaluation completely outside the real-time audio render callback. | Graphs, recursion, arbitrary-precision arithmetic, provenance construction, JavaScriptCore, and systems-language domain kernels are background work. The audio thread consumes bounded, precomputed render-plan data. Apple documents real-time rendering as a nonblocking context and warns against allocation, blocking APIs, file/network I/O, and Objective-C messaging. |
| 10 | **ADOPT** | Use JavaScriptCore as an XCTest/debug differential oracle. | Bundle the compiled TypeScript reference core, run shared fixtures in JSC, and compare Swift or future Rust results. This reuses reference behavior without making the shipping architecture depend on a JS VM. |
| 11 | **REJECT** | Do not use JavaScriptCore as the default production native domain runtime. | Threads using one `JSVirtualMachine` serialize; concurrent evaluation requires separate VMs. Cancellation and ownership would be structured around the VM instead of Swift concurrency. |
| 12 | **REJECT** | Do not download updated TypeScript/operator code into the native app. | A fixed reviewed bundle is distinct from remote code replacement. App Review guideline 2.5.2 restricts downloading or executing code that introduces or changes application functionality; remote semantic updates would also undermine reproducibility. |
| 13 | **DEFER** | Do not adopt a production Rust shared core now. | Rust is technically viable for WebAssembly and ARM64 iOS and has a strong arbitrary-integer ecosystem, but AGL has no benchmark evidence showing sufficient end-to-end benefit to offset FFI, packaging, CI, debugging, and contributor costs. |
| 14 | **ADOPT WITH CONDITIONS** | Include both Rust and Swift/WebAssembly in any future shared-core bakeoff. | Swift/Wasm can potentially share one Swift implementation between native and web, but current bridge tooling is younger and Swift has no first-party arbitrary-precision integer module. |
| 15 | **REQUIRES CROSS-RUN RECONCILIATION** | Define an explicit floating-point conformance profile before promising cross-platform numerical reproducibility. | Exact discrete domains can require equality. Lorenz and other numerical workloads require declared checkpoint, ULP/relative/absolute, NaN, signed-zero, branch, and quantized-output semantics. WebAssembly itself permits multiple NaN outcomes outside its deterministic profile. |
| 16 | **ADOPT** | Build the DR-15 benchmark harness now, but record the current benchmark conclusion as **not established**. | The report produced a benchmark design, not AGL performance results. Several required kernels remain semantically blocked by AGL-010/011, AGL-020–025, DR-07, DR-09, or accepted fixtures. |
| 17 | **ADOPT WITH CONDITIONS** | Retain DR-15’s adoption triggers as provisional governance defaults. | The `≥1.5×` end-to-end speedup, `≥30%` memory reduction, `≥25%` critical-path reduction, `≥20%` duplicated-semantics capacity, and “two workload breaches” values are policy proposals—not empirical laws. FR-08 must ratify or replace them. |
| 18 | **REJECT** | Do not move project migrations, command/undo state, graph-editor state, or audio scheduling into a systems core merely because one exists. | These are high-coupling orchestration and product-semantics surfaces. Selective exact or compute-heavy kernels should be evaluated first. |
| 19 | **ADOPT** | Keep backend identity out of canonical project semantics; retain it separately as execution provenance. | Projects describe what computation means. Execution manifests describe which implementation, compiler, device, and build produced a particular result. Raw floating-point cache entries are an exception and may need backend identity until canonicalization is defined. |
| 20 | **ADOPT WITH CONDITIONS** | Retain a TypeScript fallback for at least one milestone after any web accelerator becomes default. | This preserves rollback, differential diagnosis, project compatibility, and a baseline while the new backend accumulates production evidence. |

---

# 2. Evidence → Decision Matrix

| Finding / evidence | Evidence strength | Engineering implication | Recommended decision | Confidence | Source(s) |
|---|---|---|---|---|---|
| The project schema, migrations, executable operator contract, compiler, worker evaluator, cache, and budget service are ready but not complete. | **High — E** | A shared implementation would freeze a semantic surface that is still changing. | Stabilize M1 contracts before a shared-core decision. | High | |
| The Swift portable-contract spike is complete, and expanded cross-platform golden fixtures are already planned. | **High — E** | AGL has validated the mechanism needed for behaviorally equivalent implementations without shared code. | Extend conformance assets before widening native scope. | High | |
| DR-15 is stretch architecture; M7 is a stretch native proof after the browser MVP path. | **High — E** | Core migration must not displace M1–M6 browser/runtime/audio/lab delivery. | Keep native work bounded and evidence-gated. | High | |
| The staffing assumption is two product engineers. | **High — E** | A permanent Rust/Wasm/iOS packaging platform has material opportunity cost. | Demand a substantial measured benefit before adoption. | High | |
| No AGL source tree, physical iPad benchmark target, or complete accepted benchmark corpus was available to DR-15. | **High — E** | Internet microbenchmarks cannot establish AGL’s performance case. | Record all performance comparisons as pending. | High | |
| ECMAScript BigInt represents arbitrary-size integers and defines exact integer operations. | **High — E** | TypeScript can support the existing exact-rational semantics naturally. | Retain BigInt internally but serialize through portable string fields. | High | |
| JSON’s broadly interoperable exact integer range is limited around binary64’s 53-bit integer precision; JCS recommends wrapping unsupported large numbers in strings. | **High — E** | Raw JSON numeric fields are unsuitable for arbitrary-size rational components. | Canonical decimal-string integer wire format. | High | |
| Swift Numerics lists arbitrary-precision integers as future expansion rather than an existing module. | **High — E** | Pure Swift exact rational arithmetic needs an external dependency or AGL-owned implementation. | Add a dependency/license/performance selection gate before full exact-native semantics. | High | |
| Rust supports ARM64 iOS and browser-oriented `wasm32-unknown-unknown`; `num-bigint` offers portable `BigInt`/`BigUint` serialization. | **High — E** | Rust is technically feasible as one implementation of exact kernels on both targets. | Retain Rust as a future candidate, not an assumed outcome. | High | |
| JavaScriptCore can evaluate bundled JS, but all threads entering one VM must wait. | **High — E** | JSC reuses semantics effectively but imposes awkward production concurrency and cancellation constraints. | Oracle-only policy. | High | |
| Worker messages are queued tasks and do not interrupt currently executing work. | **High — E** | Sending a cancel message cannot preempt a long synchronous TS/Wasm call. | Require atomic polling, bounded chunking, or hard worker termination fallback. | High | |
| `SharedArrayBuffer` transfer requires cross-origin isolation; ordinary `ArrayBuffer` can be transferred rather than cloned. | **High — E** | SAB cancellation cannot be the only browser strategy. Large payloads should use transferable ownership. | Adopt chunking fallback and optional SAB fast path. | High | |
| A dedicated worker can be terminated and its running script aborted. | **High — E** | A hard-stop safety path exists even for an uncooperative monolithic kernel, at the cost of worker state and caches. | Add disposable-worker termination as timeout fallback, not normal cancellation. | High | |
| Apple’s real-time audio guidance excludes potentially blocking operations, allocation, file/network I/O, and Objective-C messaging from render logic. | **High — E** | Domain runtimes, JS VMs, BigInt, graph evaluation, and provenance allocation do not belong on the render callback. | Enforce a render-plan boundary independent of core language. | High | |
| Swift 6 offers compile-time data-race checking, while UniFFI currently documents partial Swift 6 support and async `Sendable` rough edges. | **High — E** | The Swift façade should own concurrency semantics; generated high-level bindings should not define AGL’s foundational boundary yet. | Prefer a narrow C ABI plus handwritten Swift façade for a prototype. | High | |
| Swift/Wasm’s JavaScriptKit supports async and multithreading, but BridgeJS is explicitly experimental and requires Swift 6.3. | **Medium — E** | Swift/Wasm is credible enough for a future bakeoff but not mature enough to justify rewriting the current core. | Include as challenger after readiness gates. | Medium-high | |
| WebAssembly ordinary numeric operations are specified, but some NaN outputs remain nondeterministic without the deterministic profile. | **High — E** | “Same Wasm source” does not imply every floating output bit is portable. | Define a numerical profile and avoid NaN payloads as semantic data. | High | |
| DR-15’s ROM is 16–30 person-days for conformance-first work versus 81–141 for shared Rust, with approximately ±50% uncertainty. | **Medium — E/R** | The least-regret work is also required under every later architecture. | Fund the semantic/fixture layer first; treat all ROM values as planning ranges. | Medium | |

---

# 3. Architecture Consequences

| Affected subsystem | Exact architectural implication | Contract impact | Dependencies | Cost of implementing later | Recommendation |
|---|---|---|---|---|---|
| **Canonical project model** | Persist semantic versions and inputs, not the selected implementation backend. Required identity includes schema/migration, operator, deterministic-generation, budget, and applicable numerical-profile versions. | **Public** | AGL-010/011 | **High:** later changes require project migration and compatibility handling. | Freeze these fields during M1. |
| **Source-byte preservation** | Retain original project bytes/hash separately from the normalized semantic model and canonical semantic digest. | **Public/internal** | AGL-011 | **High:** source preservation cannot be reconstructed after destructive canonicalization. | Separate `sourceDigest` from `semanticDigest`. |
| **Rational musical time** | Use canonical arbitrary-precision numerator/denominator semantics across every backend. No JSON numeric representation for arbitrary-size components. | **Public** | AGL-002, AGL-010, AGL-143/146 | **High:** changing the wire format after project creation is costly. | Adopt decimal-string wire fields now. |
| **Deterministic generation** | Project and provenance records must include algorithm ID/version, seed representation version, and stream identity. | **Public** | AGL-005, AGL-010, AGL-133 | **High:** otherwise past generation cannot be faithfully reproduced. | Externalize existing AGL-005 vectors; do not invent a replacement PRNG. |
| **Canonical event/pattern model** | Event identity, ordering, exact musical positions, and generated/frozen lineage must be backend-independent. | **Public** | AGL-003, AGL-027, AGL-032 | **High** | Treat backend output as a candidate realization of canonical events, not as backend-native project state. |
| **Operator catalog** | Each operator declares semantic version, conformance class (`exact`, `profileNumeric`, or `renderOnly`), deterministic inputs, budget dimensions, and provenance schema. | **Public/internal** | AGL-004, AGL-020 | **Medium-high** | Add metadata before broad operator implementation. |
| **Typed graph/compiler** | Graph orchestration remains host-owned. Optional kernels receive validated immutable requests and cannot alter graph state. | **Internal with public error semantics** | AGL-021/022 | **High:** moving later is possible; moving now couples all runtime semantics to FFI. | Keep compiler in TypeScript/Swift hosts. |
| **Worker evaluator** | Define one cancellation/progress state machine across TS, Wasm, Swift, Rust, and JSC test backends. Use generation IDs to reject stale results. | **Internal; visible UX semantics** | AGL-023, FR-08 | **High** | Implement before long-running graph work ships. |
| **Hard cancellation fallback** | Browser runtime may terminate a disposable worker after a cancellation deadline, invalidating worker-local caches and continuations. | **Internal** | AGL-023, AGL-024, FR-08 | **Low-medium** | Add as a last-resort safety mechanism, not routine flow. |
| **Deterministic cache** | Exact/canonicalized results may use backend-independent keys. Raw floating-point results must include backend/profile identity until a canonical numeric representation exists. | **Internal with compatibility implications** | AGL-024, numerical-profile ADR | **High:** incorrect cross-backend cache aliasing can produce silent inconsistency. | Split exact and numerical cache policy. |
| **Evaluation budgets** | Work-unit, memory, iteration, recursion, geometry, and cancellation-poll semantics must be versioned and backend-independent. | **Public/internal** | AGL-025, FR-08 | **Medium-high** | Include `budgetProfileId/version` in requests, results, provenance, and cache keys. |
| **Control signals / chaos** | Raw floating trajectories are not exact persistent semantics. Persist parameters, solver/profile versions, checkpoints, and frozen outputs according to the final numerical policy. | **Public** | DR-07, DR-08, AGL-111–113 | **Critical:** an incorrect promise becomes a project-compatibility commitment. | Block final policy pending cross-run reconciliation. |
| **Geometry subsystem** | Exact/discrete geometry outputs require equality and canonical ordering. Penrose cannot enter cross-core benchmarks before DR-09/AGL-120 defines the accepted corpus. | **Public/internal** | DR-09, AGL-120–122 | **Medium** | Keep Penrose benchmark optional and blocked. |
| **Provenance** | Separate stable semantic provenance from execution provenance. Transfer records in versioned batches or structure-of-arrays form, never one bridge call per record. | **Public/internal** | AGL-020, AGL-035/036, AGL-050 | **High** | Define the batch schema before benchmarking one million records. |
| **Generated versus frozen material** | Generated material references the graph, versions, seeds, profile, and source identity. Frozen material stores the resolved bounded result plus lineage and does not silently regenerate. | **Public UX/project contract** | AGL-027, AGL-032, AGL-141 | **High** | Make backend switching semantically invisible; freeze remains a user command. |
| **Command/undo architecture** | Evaluators are pure. A result enters project history only through an accepted command after generation/version validation. Cancellation is not undo; backend selection is not an edit. | **Public interaction contract** | AGL-012, AGL-141, DR-14 | **High** | Reconcile detailed transaction semantics with DR-14. |
| **Audio render plan** | Domain computation produces one immutable, bounded `AudioRenderPlan`. Real-time and offline engines consume that plan without calling the domain core. | **Public/internal** | AGL-041, DR-03 | **Critical:** retrofitting after audio integration is expensive and risky. | Enforce during M2. |
| **Real-time audio** | No BigInt, graph evaluation, recursion, provenance allocation, JSC, Rust-domain FFI, locks, file/network I/O, or dynamic project decoding in the render callback. | **Internal hard contract** | DR-03, AGL-044/049 | **Critical** | Add architectural tests and code-review rule. |
| **Offline rendering** | Offline and real-time paths share semantic render-plan input. This does not itself guarantee bit-identical PCM across engines. | **Public reproducibility contract** | DR-03, AGL-041/045 | **High** | Define logical equivalence now; waveform tolerance remains DR-03-owned. |
| **MIDI/MusicXML** | Exporters consume canonical event/materialized data. Backend-specific objects are prohibited. Numerically generated material may require freeze/materialization before deterministic export. | **Public** | AGL-130/131 | **Medium** | Keep exporters outside optional kernels. |
| **Swift/native client** | Application code sees an idiomatic `Sendable` backend protocol and actor/task façade. Foreign handles remain private to the implementation module. | **Internal** | AGL-143, AGL-147, DR-12 | **Medium-high** | Define before native proof expands. |
| **WebAssembly/shared core** | Optional kernels live behind one coarse worker-facing boundary with version negotiation, bounded payloads, explicit buffer ownership, cancellation, and fallback. | **Internal** | AGL-146, FR-07/08 | **Low now; high after ad hoc FFI proliferation** | Define the seam before adding a kernel, but do not implement Rust now. |
| **Security/sandboxing** | JSC oracle exports no arbitrary native object graph and loads only a pinned bundled artifact. Wasm/Rust inputs remain untrusted and schema/budget validated. | **Internal** | AGL-136, native test target | **Medium** | Keep bridge surface data-only and capability-minimal. |
| **Packaging and CI** | Semantic fixtures run independently of language toolchains. Optional Rust/Swift-Wasm toolchains remain absent from required release CI until a gated prototype begins. | **Internal** | AGL-133/146, FR-07 | **Low-medium** | Avoid a permanent toolchain tax before adoption. |
| **Accessibility and diagnostics** | Exact, numerical, frozen, stale, cancelled, migrated, and incompatible states require textual/semantic representations rather than color-only indicators. | **Public UX hard contract** | AGL-132/150, DR-13 | **Medium** | Add states to the design-system semantics and screen-reader model. |

---

# 4. Proposed ADRs

## ADR-DR15-01: Share Cross-Platform Semantics by Contract Before Sharing Implementation

**Context**

AGL is browser-first, has a bounded native-iPad stretch milestone, and has not completed the project schema, migrations, production graph evaluator, cache, or budget semantics. The Swift portable-contract spike is already complete, and cross-platform golden-fixture expansion is ready.

**Decision**

1. Accepted schemas, formal semantic contracts, external fixtures, and migration rules are normative.
2. TypeScript is the executable reference implementation during semantic stabilization, but it is not superior to the accepted specification.
3. Swift implements only the behavior required by accepted native capabilities.
4. Shared implementation is introduced selectively and only after evidence gates pass.

**Alternatives considered**

- Immediate full Rust core.
- Full TypeScript/Swift duplicate implementation.
- Production JavaScriptCore.
- Full Swift/Wasm rewrite.
- No cross-platform contract beyond ad hoc tests.

**Consequences**

- Semantic compatibility is independent of language.
- Some short-term TS/Swift duplication remains.
- Fixture quality becomes a first-class engineering responsibility.
- A later Rust or Swift/Wasm adoption remains possible without replacing project files.

**Risks**

- The TypeScript implementation may still become an accidental de facto specification.
- Poorly designed fixtures can encode implementation accidents.
- Duplicate implementations can drift between fixture updates.

**Evidence**

DR-15’s central recommendation and existing AGL-143/146/FR-07 sequencing. 
**Confidence**

**High.**

---

## ADR-DR15-02: Canonical Exact-Arithmetic and Deterministic-Generation Wire Semantics

**Context**

AGL already uses exact rational musical time and deterministic seeds/stable IDs. JavaScript supports arbitrary-size BigInt, while JSON numeric interoperability and Swift’s current standard numerical packages do not provide a portable arbitrary-precision integer wire representation.

**Decision**

- Rational numerator and denominator are canonical decimal strings.
- Rational values are normalized to positive denominator, coprime components, and `0/1`.
- Deterministic-generation records include algorithm ID, algorithm version, seed encoding version, seed bytes/string, and stream identity.
- Native BigInt libraries are implementation details and never appear in project format.
- Stable IDs and generated decisions are validated through language-neutral vectors.

**Alternatives considered**

- JSON numbers.
- Backend-native BigInt serialization.
- Fixed-width 64-bit integers.
- Persist only a human-readable seed.
- Treat the TypeScript PRNG implementation as sufficient documentation.

**Consequences**

- Project files remain portable.
- Exact arithmetic can be independently implemented.
- Swift must select a bigint implementation before full exact-native semantics.
- Seed and ID migrations become explicit rather than accidental.

**Risks**

- Very large adversarial integers can consume excessive CPU/memory; schema and budget limits are still required.
- Canonicalization can conflict with original-byte preservation if the two concepts are not separated.

**Evidence**

ECMAScript BigInt, RFC 8259, RFC 8785, and DR-15. 
**Confidence**

**High.**

---

## ADR-DR15-03: Host-Owned Graph Orchestration with Pure Optional Kernels

**Context**

Graph compilation, cancellation, progress, cache ownership, budgets, project mutation, and provenance commitment are higher-level application semantics. Moving them across FFI would substantially enlarge the shared-core boundary.

**Decision**

- TypeScript and Swift hosts own graph planning and orchestration.
- Optional kernels receive validated immutable requests and return immutable results.
- Kernels do not access UI state, project repositories, command buses, audio engines, or mutable graph objects.
- Kernel results are proposals until the host validates generation identity and commits them.

**Alternatives considered**

- Entire graph evaluator in Rust.
- Entire graph evaluator in JSC.
- Object-oriented foreign API exposing nodes and events one by one.
- Backend-specific graph representations persisted in projects.

**Consequences**

- Cancellation and Swift concurrency remain idiomatic.
- FFI is smaller and easier to test.
- Some orchestration logic may remain duplicated between browser and native.
- Moving the graph evaluator later remains possible but requires a separate ADR.

**Risks**

- Host orchestration itself could become the performance bottleneck.
- Excessive serialization between orchestration and kernels could erase kernel gains.

**Evidence**

DR-15’s selective migration stages and risk analysis.

**Confidence**

**High.**

---

## ADR-DR15-04: Cooperative Cancellation, Stale-Result Rejection, and Hard-Stop Fallback

**Context**

Worker messages are queued and do not interrupt a currently running task. A monolithic TS or Wasm function can therefore ignore cancellation until it returns. A dedicated worker can be terminated, but termination discards its current state and pending tasks.

**Decision**

- Every evaluation uses a request ID and generation ID.
- Normal cancellation is cooperative:
  - SAB/atomic polling when cross-origin isolation is available; or
  - bounded chunking with event-loop yields otherwise.
- Hosts reject results whose generation ID is no longer current.
- A deadline-expired, unresponsive disposable worker may be terminated.
- Termination invalidates worker-local caches and continuations and returns a structured `hardCancelled` result.
- No partial result is committed unless the operation explicitly supports a versioned partial-result contract.

**Alternatives considered**

- Cancel messages only.
- Browser worker termination as the normal path.
- Unbounded synchronous kernels.
- Backend-specific cancellation behavior.

**Consequences**

- Cancellation responsiveness is measurable and comparable.
- Kernels must expose bounded poll points or resumable chunks.
- Hard termination remains available without pretending cleanup occurred.

**Risks**

- Polling too frequently reduces throughput.
- Polling too infrequently makes cancellation appear broken.
- SAB deployment requirements may conflict with hosting constraints.

**Evidence**

HTML worker/task/transfer semantics and DR-15. 
**Confidence**

**High for the state model; medium for final poll-latency limits pending FR-08.**

---

## ADR-DR15-05: Domain Computation Is Isolated from the Real-Time Audio Callback

**Context**

Apple’s render APIs operate under real-time constraints. The render path cannot safely perform arbitrary allocation, blocking work, file/network I/O, or broad runtime dispatch.

**Decision**

```text
project/graph/kernels/provenance
            ↓ background evaluation
      immutable AudioRenderPlan
            ↓ preallocation/validation
   event and control ring/buffers
            ↓
     real-time audio callback
```

No domain core—TypeScript, Swift, Rust, Wasm, or JSC—may be invoked from the real-time callback. A separately approved bounded DSP kernel is governed by the audio/DSP ADRs, not by this domain-core ADR.

**Alternatives considered**

- Call a shared Rust core directly from audio rendering.
- Run JavaScriptCore on the audio path.
- Materialize events or provenance lazily during rendering.
- Maintain separate semantic plans for real-time and offline output.

**Consequences**

- Core-language choice no longer determines audio-thread safety.
- Rust may accelerate plan generation but does not bypass render constraints.
- Real-time and offline rendering can share one semantic plan.

**Risks**

- Plan generation may need incremental lookahead for infinite or causal processes.
- Overly large plans can shift memory pressure upstream.
- PCM equivalence still requires DR-03 policy.

**Evidence**

Apple documentation, AGL-041, and DR-15. 
**Confidence**

**Very high.**

---

## ADR-DR15-06: JavaScriptCore Is a Pinned Test Oracle, Not a Shipping Semantic Runtime

**Context**

JSC can evaluate bundled JavaScript and offers inspection support, but one VM serializes cross-thread access. App-store policy and project reproducibility also argue against remotely replacing semantic code.

**Decision**

- Compile the pure TypeScript reference core into a pinned test bundle.
- Record its hash and semantic version.
- Load it only in test/debug targets.
- Expose data-only request/result functions.
- Do not export arbitrary application objects into JavaScript.
- Do not download or remotely replace the bundle.
- Exclude JSC from production unless a later ADR reverses this decision with hardware evidence.

**Alternatives considered**

- Production JSC runtime.
- Remote TypeScript operators.
- No native executable oracle.
- Browser-only differential testing.

**Consequences**

- Swift tests can invoke the same reference source.
- Production app size/runtime is unaffected if the bundle is omitted.
- JSC remains only one oracle; mathematical and external golden fixtures remain necessary.

**Risks**

- JSC does not model Chromium or Firefox behavior.
- The reference implementation and its JSC execution can share the same bug.
- JSC performance remains unknown and irrelevant to the oracle role.

**Evidence**

Apple JSC and App Review documentation; DR-15. 
**Confidence**

**High.**

---

## ADR-DR15-07: Optional Shared Kernels Use a Narrow Versioned ABI

**Context**

A future Rust native/Wasm kernel would otherwise expose AGL to ownership bugs, fine-grained bridge overhead, generated-binding concurrency constraints, and accidental public contracts.

**Decision**

- Use opaque handles.
- Negotiate ABI/protocol version before execution.
- Pass one bounded request buffer and receive one result buffer.
- The library allocates output; the library’s free function releases it.
- No foreign callbacks or retained host pointers.
- Cancellation uses an explicit handle/atomic state.
- Initial core handles are thread-confined; parallel work uses multiple handles or an explicitly approved thread-safe implementation.
- Structured errors cross as versioned data, not logs or panics.
- The Swift wrapper is handwritten and `Sendable`-checked.

**Alternatives considered**

- UniFFI as the foundational boundary.
- Exposing Rust object graphs directly.
- Per-event callback APIs.
- Shared mutable memory without ownership protocol.

**Consequences**

- Boundary overhead is visible and benchmarkable.
- Swift application code remains idiomatic.
- More manual glue is required than high-level code generation.

**Risks**

- A hand-written ABI can contain memory-lifetime defects.
- Buffer encoding may become a hidden second serialization format.
- Thread confinement may reduce parallelism unless multiple handles are supported.

**Evidence**

Rust target/package viability, XCFramework packaging, Swift strict-concurrency behavior, and UniFFI’s documented Swift 6 limitations.

**Confidence**

**Medium-high as a prototype boundary; activation deferred.**

---

## ADR-DR15-08: Shared-Core Adoption Requires a Material Problem and a Demonstrated Solution

**Context**

A shared core creates permanent build, CI, packaging, debugging, ownership, and contributor costs. DR-15 produced no AGL performance measurements.

**Decision**

A shared-kernel bakeoff begins only after:

- AGL-010/011 are accepted;
- AGL-020–025 are accepted;
- AGL-146 is accepted;
- FR-07 and FR-08 are complete;
- applicable lab semantics and fixtures are accepted;
- AGL-147 is ready to execute.

A production adoption then requires:

1. A material performance, memory, or duplicated-semantics problem; and
2. Full conformance plus a meaningful end-to-end improvement after bridge/startup costs.

DR-15’s provisional gates are retained for FR-08 review:

- at least two representative workload budget breaches, **or** a critical release-blocking workload override;
- duplicated semantics consuming approximately `≥20%` of domain/runtime capacity for two milestones, or repeated escaped correctness defects;
- `100%` exact-domain and project-corpus conformance;
- approximately `≥1.5×` end-to-end improvement on the blocking workload or `≥30%` peak-memory reduction;
- approximately `≥25%` reduction in the affected user-visible critical path;
- no cancellation, startup, audio-safety, or Swift-concurrency regression;
- an accountable regular maintainer.

**Alternatives considered**

- Rust by architectural preference.
- Adopt the fastest microbenchmark.
- Require one implementation for every core package.
- Never permit shared implementation.

**Consequences**

- Architecture changes are reversible and evidence-based.
- FR-08 owns final numeric gates.
- A single severe correctness or release blocker can override the “two workload” performance heuristic.

**Risks**

- Capacity accounting can be gamed or inconsistently measured.
- Strict thresholds may delay a beneficial migration.
- A microkernel can pass while the end-to-end product remains unchanged.

**Evidence**

DR-15 decision triggers and program sequencing. 
**Confidence**

**High for evidence gating; medium for the provisional numbers.**

---

## ADR-DR15-09: Floating-Point Reproducibility Is Defined by a Versioned Numerical Profile

**Status:** **Deferred pending DR-07, DR-08, DR-03, and FR-08 reconciliation**

**Context**

Shared source code does not guarantee byte-identical native and Wasm floating results. Chaotic trajectories amplify small differences; numerical values may also feed thresholds, quantizers, or event-generation branches.

**Decision to be resolved**

The final ADR must specify:

- scalar type;
- operation ordering and fused-operation policy;
- compiler fast-math policy;
- subnormal handling;
- NaN and signed-zero semantics;
- checkpoint frequency;
- absolute/relative/ULP comparison relation;
- branch-boundary canonicalization;
- quantized/discrete output equality;
- cache-key behavior;
- project and frozen-output persistence;
- whether any lab requires one canonical numerical backend.

**Alternatives considered**

- Bit-identical output everywhere.
- Tolerance-only comparison.
- Shared Rust source as sufficient reproducibility.
- Backend-specific results with no declared relation.
- Persist every generated trajectory.

**Consequences**

- Numerical claims become honest and testable.
- Raw floating caches may remain backend-specific.
- Frozen material can preserve exact user-visible output even where live regeneration is profile-equivalent rather than byte-equal.

**Risks**

- A tolerance relation alone does not protect threshold or quantization branches.
- A profile can become too loose to be meaningful or too strict to be portable.
- Persisting large trajectories may impose storage costs.

**Evidence**

DR-15’s numerical-risk analysis and WebAssembly’s NaN semantics. 
**Confidence**

**High that a profile is required; low on final numeric policy until cross-run reconciliation.**

---

# 5. Mathematical / Behavioral Contracts

## 5.1 Semantic authority precedence

When artifacts conflict, AGL should use this order:

1. Accepted project schema, migration contract, ADR, and formal mathematical specification.
2. Versioned language-neutral golden fixtures and compatibility corpus.
3. Accepted property and metamorphic laws.
4. TypeScript executable reference implementation.
5. Swift, JSC, Rust, and Swift/Wasm implementations.

A TypeScript behavior that conflicts with levels 1–3 is a reference implementation defect, not a new semantic rule.

A fixture change that intentionally changes behavior requires:

- semantic-version impact analysis;
- project migration or compatibility disposition;
- updated source rationale;
- cross-platform regeneration;
- review that the fixture is not merely preserving an old implementation bug.

---

## 5.2 Canonical rational contract

Let a rational value be represented by the pair:

\[
q=(n,d),\qquad n\in\mathbb{Z},\quad d\in\mathbb{Z}\setminus\{0\}
\]

Define normalization \(N(n,d)\):

\[
g=\gcd(|n|,|d|)
\]

\[
N(n,d)=
\begin{cases}
(0,1), & n=0\\[4pt]
\left(\dfrac{\operatorname{sgn}(d)n}{g},\dfrac{|d|}{g}\right), & n\ne0
\end{cases}
\]

### Invariants

For every canonical rational \((n,d)\):

1. \(d>0\)
2. \(\gcd(|n|,d)=1\)
3. \(n=0 \Rightarrow d=1\)
4. Negative sign is represented only in the numerator.
5. Construction with \(d=0\) fails with a structured domain error.
6. Equality is exact:

\[
(n_1,d_1)=(n_2,d_2)\iff n_1d_2=n_2d_1
\]

7. Ordering is exact:

\[
(n_1,d_1)<(n_2,d_2)\iff n_1d_2<n_2d_1
\]

### Arithmetic

\[
\frac{n_1}{d_1}+\frac{n_2}{d_2}
=
N(n_1d_2+n_2d_1,\ d_1d_2)
\]

\[
\frac{n_1}{d_1}-\frac{n_2}{d_2}
=
N(n_1d_2-n_2d_1,\ d_1d_2)
\]

\[
\frac{n_1}{d_1}\times\frac{n_2}{d_2}
=
N(n_1n_2,\ d_1d_2)
\]

\[
\frac{n_1/d_1}{n_2/d_2}
=
N(n_1d_2,\ d_1n_2),\qquad n_2\ne0
\]

Implementations may cross-cancel operands before multiplication to control intermediate size, provided the canonical result is unchanged.

### Wire representation

```json
{
  "numerator": "-41",
  "denominator": "320"
}
```

Canonical numerator grammar:

```regex
^(0|-?[1-9][0-9]*)$
```

Canonical denominator grammar:

```regex
^[1-9][0-9]*$
```

Reject:

- `"-0"`
- `"01"`
- `"-01"`
- `"+1"`
- `"1e3"`
- `"1.0"`
- leading/trailing whitespace
- an empty string
- a zero denominator

Native JS `bigint`, Rust `BigInt`, or a future Swift bigint type must be converted to this DTO before project serialization. ECMAScript BigInt and RFC/JCS guidance support the arbitrary-size/string distinction.

### Canonical bytes versus source bytes

- `sourceBytes`: exact imported bytes, retained for recovery/audit.
- `semanticModel`: decoded and migrated canonical values.
- `semanticDigest`: digest of the designated canonical semantic serialization.
- `sourceDigest`: digest of original bytes.

Canonicalization must never overwrite the only copy of source bytes.

---

## 5.3 Deterministic-generation contract

Every deterministic generator is parameterized by:

```ts
interface DeterministicGenerationDescriptor {
  algorithmId: string;
  algorithmVersion: string;
  seedEncodingVersion: string;
  seed: string;          // Canonical, schema-defined representation
  streamId: string;
}
```

The actual algorithm and seed encoding must be taken from the accepted AGL-005 implementation and fixtures; this packet does not invent them.

### Determinism invariant

For the same:

- generator descriptor;
- canonical input values;
- operator semantic versions;
- budget profile;
- traversal/order specification;

every conforming implementation must produce the same:

- random words;
- bounded integer samples;
- shuffle/permutation;
- stochastic decisions;
- generated stable IDs;
- exact-domain result digest.

Formally:

\[
G(D,I,V,B)=G'(D,I,V,B)
\]

for any conforming implementations \(G\) and \(G'\).

### Required specification details

The algorithm specification must define:

- state width and initial state derivation;
- integer overflow/modulo behavior;
- output word width and byte order;
- mapping from words to bounded integers;
- whether rejection sampling is used;
- shuffle order and tie behavior;
- stream derivation;
- behavior for empty and maximum ranges;
- stable-ID namespace/derivation;
- version-change and migration policy.

Prohibited sources of canonical randomness include:

- `Math.random()`;
- Swift `SystemRandomNumberGenerator`;
- default thread RNGs;
- current time;
- iteration order of hash maps;
- device identity;
- backend implementation identity.

### Golden vectors

At minimum:

```text
descriptor → first N output words
descriptor + bounded-range corpus → exact sampled integers
descriptor + shuffle fixture → exact permutation
descriptor + operator fixture → exact result digest
descriptor + stable-ID fixture → exact ID list
```

The value of \(N\) is fixed by the accepted fixture corpus; DR-15 does not justify inventing it.

---

## 5.4 Cross-platform equivalence classes

### Exact conformance

Require exact logical equality for:

- arbitrary integers and rationals;
- booleans, enums, strings, and tagged states;
- stable IDs;
- graph topology and canonical ordering;
- Euclidean patterns after DR-02 convention acceptance;
- CA states for accepted discrete CA semantics;
- project migrations;
- cache keys;
- provenance identities and parent relations;
- quantized pitch/event identities;
- cancellation terminal states;
- structured error codes and paths.

For maps or mathematically unordered sets, canonicalize ordering before comparison.

### Numerical-profile conformance

For each numerical profile \(P\), define a relation:

\[
a\sim_P b
\]

A minimal finite-value relation may have the form:

\[
|a-b|\le
\max\left(
\epsilon_{\text{abs}},
\epsilon_{\text{rel}}\max(|a|,|b|)
\right)
\]

and/or:

\[
\operatorname{ULPDistance}(a,b)\le U_P
\]

DR-15 does **not** establish values for \(\epsilon_{\text{abs}},\epsilon_{\text{rel}},U_P\).

The profile must also define:

- both values have the same classification: finite, \(+\infty\), \(-\infty\), or NaN;
- whether signed zero is normalized or preserved;
- NaN equality policy, normally classification-only rather than payload equality;
- checkpoint indices and required state fields;
- permitted operation reordering and fused multiply-add behavior;
- subnormal/flush-to-zero policy;
- compiler fast-math policy;
- downstream branch semantics.

WebAssembly permits multiple valid NaN outputs unless the deterministic profile is used, so NaN payload bytes cannot become accidental project semantics.

### Branch-boundary rule

A floating tolerance is insufficient when a value feeds:

- a threshold;
- a comparator;
- a quantizer;
- a discrete event decision;
- a stable-ID branch;
- a topology change.

For these boundaries, AGL must adopt one of:

1. canonical rounding before the branch;
2. an exact integer/fixed-point branch representation;
3. one canonical implementation for that branch;
4. persistence of the resulting discrete decision.

The final branch outcome must be exact across conforming backends.

### Lorenz-specific posture

The required one-million-step Lorenz test compares:

- initial conditions;
- solver/profile identity;
- periodic checkpoints;
- final state;
- quantized or materialized downstream outputs;
- numerical diagnostics.

It must not claim byte-identical trajectories unless the eventual ADR explicitly requires and proves them.

---

## 5.5 Evaluation and cancellation state machine

### States

```text
queued
running
cancelRequested
completed
failed
cancelled
hardCancelled
```

### Valid transitions

```text
queued → running
queued → cancelled
running → completed
running → failed
running → cancelRequested
cancelRequested → cancelled
cancelRequested → completed   only if completion linearized first
cancelRequested → failed      only for a genuine failure observed first
running/cancelRequested → hardCancelled
```

### Invariants

1. Every request reaches exactly one terminal state.
2. `cancel()` is idempotent.
3. A terminal request never emits further progress or result updates.
4. Progress is monotonic and lies in \([0,1]\).
5. Only `completed` may report canonical progress `1`.
6. A stale generation result is discarded regardless of backend success.
7. Cancellation does not mutate the project and does not create an undo entry.
8. Partial output is nonpersistable unless the operation declares a versioned partial-result contract.
9. A hard-cancelled worker loses worker-local caches and continuation state.
10. The cancellation-poll work bound and p95 request-to-stop bound are ratified by FR-08.

### Browser implementations

**Fast path**

```text
cross-origin isolated
→ SharedArrayBuffer atomic cancel flag
→ kernel polls at bounded work intervals
```

**Portable path**

```text
bounded chunk
→ return/yield to worker event loop
→ process cancel/progress messages
→ continue with versioned continuation
```

**Safety fallback**

```text
deadline exceeded
→ terminate disposable worker
→ invalidate worker cache/continuation
→ emit hardCancelled
```

Worker messages are queued rather than preemptive; worker termination aborts the running script.

---

## 5.6 Prototype runtime boundary

### Language-neutral request

```ts
interface CoreRequestEnvelope {
  protocolVersion: string;
  semanticVersion: string;
  requestId: string;
  generationId: string;
  operation: string;
  conformanceClass: "exact" | "profileNumeric" | "renderOnly";
  numericalProfileId?: string;
  budgetProfileId: string;
  payloadEncoding: string;
  payload: ArrayBuffer;
}
```

### Language-neutral result

```ts
interface CoreResultEnvelope {
  protocolVersion: string;
  semanticVersion: string;
  requestId: string;
  generationId: string;
  status:
    | "completed"
    | "failed"
    | "cancelled"
    | "hardCancelled";
  payloadEncoding?: string;
  payload?: ArrayBuffer;
  provenanceEncoding?: string;
  provenance?: ArrayBuffer;
  warnings: StructuredWarning[];
  error?: StructuredCoreError;
  metrics?: CoreExecutionMetrics;
}
```

### Browser façade

```ts
interface KernelBackend {
  readonly descriptor: BackendDescriptor;

  execute(
    request: CoreRequestEnvelope,
    cancellation: CancellationHandle
  ): Promise<CoreResultEnvelope>;
}
```

The TypeScript Worker remains the control plane. A future Wasm backend is an implementation of this interface, not a replacement for project/graph ownership.

### Swift façade

```swift
public protocol AGLCoreBackend: Sendable {
    var descriptor: BackendDescriptor { get }

    func execute(
        _ request: CoreRequestEnvelope,
        cancellation: AGLCancellation
    ) async throws -> CoreResultEnvelope
}

public actor AGLCoreRuntime {
    private let backend: any AGLCoreBackend

    public init(backend: some AGLCoreBackend) {
        self.backend = backend
    }

    public func execute(
        _ request: CoreRequestEnvelope
    ) async throws -> CoreResultEnvelope {
        let cancellation = AGLCancellation()

        return try await withTaskCancellationHandler {
            try await backend.execute(
                request,
                cancellation: cancellation
            )
        } onCancel: {
            cancellation.request()
        }
    }
}
```

The actor façade protects application ownership but does not, by itself, define backend parallelism. Initial policy:

- one backend handle is serial/thread-confined;
- multiple independent handles may serve parallel evaluations;
- mutable foreign handles do not escape the backend module;
- all wrapper targets compile under Swift 6 strict concurrency with no `@unchecked Sendable` except explicitly reviewed containment.

Swift 6 provides compiler data-race diagnostics; UniFFI currently documents incomplete Swift 6 async `Sendable` support.

### Prototype C ABI

```c
typedef struct AGLCore AGLCore;
typedef struct AGLCancel AGLCancel;

typedef struct {
    uint8_t *data;
    size_t len;
    size_t capacity;
} AGLBuffer;

uint32_t agl_core_abi_version(void);

int32_t agl_core_create(
    const uint8_t *config,
    size_t config_len,
    AGLCore **out_core,
    AGLBuffer *out_error
);

void agl_core_destroy(AGLCore *core);

int32_t agl_cancel_create(
    AGLCancel **out_cancel,
    AGLBuffer *out_error
);

void agl_cancel_request(AGLCancel *cancel);
void agl_cancel_destroy(AGLCancel *cancel);

int32_t agl_core_execute(
    AGLCore *core,
    const uint8_t *request,
    size_t request_len,
    const AGLCancel *cancel,
    AGLBuffer *out_result,
    AGLBuffer *out_error
);

void agl_buffer_free(AGLBuffer buffer);
```

### ABI requirements

- ABI version checked before creation.
- The library owns and frees result/error buffers.
- Input pointers are borrowed only for the duration of the call.
- No callback crosses the FFI.
- No panic/exception crosses the ABI.
- Core handle thread-safety is explicit.
- Request/result size limits are checked before allocation.
- Unknown protocol/semantic versions fail closed.
- Structured errors carry stable code, message key, path, and details.
- Benchmarking includes encode/decode and transfer overhead.

---

## 5.7 Project, cache, and provenance contracts

### Canonical project fields

The project schema should be capable of representing:

```ts
interface SemanticCompatibilityDescriptor {
  projectSchemaVersion: string;
  migrationSetVersion: string;
  operatorCatalogVersion: string;
  deterministicGeneration?: {
    algorithmId: string;
    algorithmVersion: string;
    seedEncodingVersion: string;
  };
  stableIdVersion: string;
  budgetProfileVersion: string;
  numericalProfileId?: string;
}
```

A canonical project must not persist:

```text
backend = "rust-wasm"
backend = "swift"
backend = "javascriptcore"
compiler version
device model
Wasm module path
native library path
```

Those belong in execution provenance.

### Semantic and execution provenance

```text
Semantic provenance:
  operator IDs/versions
  source and parent stable IDs
  exact parameters
  seed/stream identity
  numerical/budget profile
  graph/project semantic digest
  generated/frozen lineage

Execution provenance:
  backend family and build ID
  compiler/toolchain
  OS/browser/device
  Wasm/native artifact digest
  fixture revision
  timing/memory metrics
```

Semantic provenance affects project meaning. Execution provenance explains a particular realization.

### Cache-key contract

For exact or profile-canonicalized results:

\[
K =
H(
S \parallel M \parallel O \parallel I \parallel R \parallel B \parallel P \parallel A
)
\]

where:

- \(S\): schema/migration semantic version;
- \(M\): canonical project or graph semantic digest;
- \(O\): operator IDs and semantic versions;
- \(I\): canonical inputs;
- \(R\): deterministic-generation/stable-ID versions and seeds;
- \(B\): budget profile;
- \(P\): numerical profile, if applicable;
- \(A\): relevant asset content hashes.

For raw floating-point results that are only tolerance-equivalent:

\[
K_{\text{raw-fp}}=K\parallel \text{backendFamily}\parallel \text{backendBuild}
\]

until the numerical profile defines a backend-independent canonical representation.

### Provenance batch boundary

The batch format must be versioned and support:

- record stable IDs;
- operator/version table;
- parent/reference ranges;
- parent ID array;
- source/value attribute tables;
- string/enum interning;
- optional execution metadata;
- deterministic iteration order.

A batch partitioned into multiple transport chunks must decode to the same logical record graph as one monolithic batch.

---

## 5.8 Render-plan and audio contract

```text
Canonical project / exact graph
          ↓
background compile and evaluation
          ↓
versioned immutable AudioRenderPlan
          ↓
validated bounded event/control buffers
          ↓
real-time or offline audio consumer
```

### Required invariants

1. The domain core is never called from the real-time callback.
2. The render plan is immutable after publication.
3. The plan declares its schema/version and semantic digest.
4. Event/control counts are bounded before publication.
5. Required buffers are allocated before real-time use.
6. Teardown and generation invalidation are bounded.
7. Real-time and offline paths consume the same logical plan.
8. PCM bit equality is not implied by logical-plan equality.
9. A systems-language DSP module, if introduced, is a separate bounded audio component—not the DR-15 domain core.
10. Audio safety, scheduling, and PCM tolerance remain subject to DR-03.

Apple supports both real-time and manual/offline AVAudioEngine rendering, but the operational constraints differ.

---

## 5.9 Command, undo, generated, and frozen behavior

### Evaluation commitment

```text
user edit
→ command transaction
→ new graph generation ID
→ asynchronous evaluation
→ result arrives
→ generation/profile/version validation
→ commit derived artifact or display result
```

If the generation is stale, the result is discarded and never becomes an undoable project change.

### Cancellation

- Requesting cancellation changes transient evaluation state.
- It does not revert a project command.
- It does not create an undo item.
- The user may separately undo the edit that caused evaluation.

### Backend changes

Switching among conforming backends for diagnostics or fallback:

- does not mark the project dirty;
- does not create an undo entry;
- does not alter semantic IDs;
- does create execution-provenance records;
- must not alter exact-domain results.

### Generated material

Generated material retains:

- source graph/node IDs;
- operator versions;
- seed/stream;
- numerical and budget profiles;
- requested interval;
- semantic digest;
- stale/current evaluation state.

### Frozen material

Frozen material retains:

- resolved bounded output;
- source graph reference and semantic digest;
- exact lineage/provenance;
- generation/profile versions;
- optional execution provenance;
- explicit frozen status.

Subsequent generator edits never silently mutate frozen material.

---

# 6. Test Oracle and Fixture Pack

## 6.1 Unit invariants

| Test ID | Input | Expected behavior/output | Tolerance | Why it matters | Source |
|---|---|---|---|---|---|
| `RAT-NORM-001` | `2/4` | `1/2` | Exact | Basic reduction. | DR-15 exact-rational contract. |
| `RAT-NORM-002` | `-2/-4` | `1/2` | Exact | Sign normalization. | Same. |
| `RAT-NORM-003` | `2/-4` | `-1/2` | Exact | Denominator must be positive. | Same. |
| `RAT-NORM-004` | `0/-7` | `0/1` | Exact | Canonical zero. | Same. |
| `RAT-ADD-001` | `1/3 + 1/6` | `1/2` | Exact | Exact addition across denominators. | Same. |
| `RAT-SUB-001` | `5/6 - 1/4` | `7/12` | Exact | Exact subtraction. | Same. |
| `RAT-MUL-001` | `-3/7 × 14/9` | `-2/3` | Exact | Multiplication and reduction. | Same. |
| `RAT-DIV-001` | `(5/8) ÷ (-15/16)` | `-2/3` | Exact | Division and sign. | Same. |
| `RAT-DIV-000` | `(1/2) ÷ 0` | Structured `divisionByZero` error | Exact code/path | Cross-language failure semantics. | Same. |
| `RAT-LARGE-001` | Compare `9007199254740993/1` and `9007199254740992/1` | First is greater | Exact | Detect accidental binary64 conversion. | JSON/BigInt evidence. |
| `WIRE-INT-001` | `"01"`, `"-0"`, `"+1"`, `"1e3"`, `" 1"` | Reject each | Exact validation paths | Preserve one canonical representation. | RFC/JCS-backed recommendation. |
| `WIRE-ROUNDTRIP-001` | Big integer beyond \(2^{53}\) encoded as string | Decode/encode preserves digits | Exact | Project portability. | |
| `EVAL-TERM-001` | Concurrent completion and cancel request | Exactly one terminal state | Exact | Prevent double commit/race ambiguity. | DR-15 cancellation analysis. |
| `EVAL-STALE-001` | Result generation `g1`; current graph `g2` | Result rejected | Exact | Prevent stale UI/project overwrite. | AGL-023/141 architecture. |
| `PROJECT-BACKEND-001` | Save project under TS and Swift sessions | Canonical project contains no backend field or artifact path | Exact | Backend-independent projects. | DR-15 recommendation. |
| `RT-BOUNDARY-001` | Instrumented real-time render callback | Zero domain-core calls and zero project/provenance decoding | Exact | Audio safety. | |
| `JSC-PIN-001` | Load oracle bundle | Bundle hash and semantic version match test manifest | Exact | Prevent silent reference-code drift. | DR-15 JSC policy. |
| `FFI-OWN-001` | Execute and free result/error buffers | No leak, double free, or retained input pointer | Sanitizer-clean | FFI safety. | Proposed ADR-DR15-07. |

No PRNG numeric output should be invented here. `RNG-*` unit vectors remain blocked until the existing AGL-005 implementation is externalized.

---

## 6.2 Property-based tests

| Property family | Required property |
|---|---|
| Rational normalization | `normalize(normalize(q)) == normalize(q)` |
| Rational canonicality | For canonical `q`, denominator is positive and gcd is one. |
| Rational equality | Scaling numerator and denominator by any nonzero integer does not change canonical value. |
| Rational arithmetic | Addition and multiplication are commutative; addition/multiplication are associative within arbitrary-precision resource budgets. |
| Rational identities | `q + 0 == q`, `q × 1 == q`, `q - q == 0`, and for nonzero `q`, `q ÷ q == 1`. |
| Rational order | Comparison is antisymmetric, transitive, and consistent with subtraction sign. |
| Codec | `decode(encode(canonical(q))) == canonical(q)`. |
| Migration | Sequential migration equals the accepted direct semantic target for every corpus project. |
| Deterministic generation | Same descriptor and input produce identical vectors and digest. |
| Stream isolation | Changing only `streamId` changes only the declared stream-dependent values. |
| Stable IDs | Inserting an unrelated entity does not renumber unaffected stable entities where the ID contract declares insertion stability. |
| Graph purity | Repeated evaluation of the same exact request has the same logical result and provenance. |
| Graph ordering | Independent node storage/hash iteration order does not change canonical results. |
| Cancellation | `cancel()` is idempotent; exactly one terminal state exists. |
| Progress | Progress never decreases and never exceeds one. |
| Cache | Semantically equal exact requests produce the same key; every declared semantic version change invalidates the key. |
| Provenance closure | Every parent ID resolves within the batch/project or an explicitly declared external source reference. |
| Backend project neutrality | Changing backend alters execution provenance only. |
| FFI ownership | Randomized valid/invalid request sequences do not leak or double-free memory under sanitizers. |
| Binary decoding | Arbitrary malformed lengths, versions, and tags fail without out-of-bounds access or unbounded allocation. |

---

## 6.3 Metamorphic tests

| Test | Transformation | Required relation |
|---|---|---|
| Rational scaling | Replace `(n,d)` with `(kn,kd)`, \(k\ne0\) | Canonical result unchanged. |
| Kernel chunking | Evaluate as one request versus deterministic chunks | Completed logical output and provenance identical. |
| Worker transport | Transfer `ArrayBuffer` versus local copy in test harness | Decoded request/result identical. |
| Graph permutation | Permute storage order of independent nodes/edges | Canonical plan/result unchanged. |
| Provenance partitioning | Encode one batch versus multiple transport chunks | Decoded provenance graph identical. |
| Cache replay | Compute, cache, reload, recompute | Exact result and semantic provenance identical. |
| Backend substitution | TS versus Swift/JSC/future Rust for exact fixture | Exact canonical result and errors identical. |
| CA composition | Evaluate \(n\) generations then \(m\), versus \(n+m\) from same state | Final state identical, once accepted CA semantics are fixed. |
| Recursive continuation | Pause at a deterministic work boundary and resume | Same final motif/events/ancestry as uninterrupted execution. |
| Project source preservation | Decode/migrate/canonicalize without overwrite | Original bytes and source hash unchanged. |
| Hard worker restart | Terminate, recreate worker, rerun exact request | Same final exact result; warm-cache metrics may differ. |
| Numerical checkpoint | Re-run same profile/backend/build | Checkpoints satisfy the profile; discrete branch outputs match exactly. |
| Frozen stability | Change source graph after freezing | Frozen output unchanged; lineage continues to reference prior source digest. |
| Backend switch | Switch backend without editing | Project dirty flag and command history unchanged. |

Do **not** assert that changing Lorenz step partitioning or operation ordering preserves trajectory values. That is not a valid metamorphic relation without a specifically designed numerical method and profile.

---

## 6.4 Golden fixtures

The fixture tree should be implementation-neutral:

```text
fixtures/
  semantic/
    rational/
    deterministic-generation/
    stable-ids/
    operators/
    graphs/
    errors/
  projects/
    v1/
    migrations/
    invalid/
    source-byte-preservation/
  labs/
    euclidean/
    recursive/
    ca/
    lorenz/
    penrose/
  provenance/
  render-plan/
  cross-platform/
  benchmark/
```

### Required fixture classes

| Fixture | Contents | Current status |
|---|---|---|
| Rational corpus | Canonical and noncanonical pairs, arithmetic, errors, large operands | Can be created now from AGL-002 semantics. |
| Deterministic-generation vectors | Accepted AGL-005 algorithm/seed/stream outputs | **Extract; do not invent.** |
| Stable-ID corpus | Entity creation, insertion, deletion, reorder, regeneration | **Extract from AGL-005 and interaction contracts.** |
| Operator vectors | Input, version, budget, output, provenance, errors | Expand with AGL-020. |
| Project source corpus | Original bytes, decoded semantic model, canonical bytes, source/semantic hashes | Build with AGL-010/011. |
| Migration corpus | Every supported prior version and invalid migration case | Build with AGL-011. |
| Exact graph corpus | Compiled plan, result, cache key, provenance | Build with AGL-021–025. |
| JSC oracle manifest | Compiled bundle hash, TypeScript revision, semantic version | Add before AGL-147. |
| Euclidean corpus | Accepted steps/pulses/rotation convention and edge cases | Blocked on DR-02/AGL-071 acceptance. |
| Recursive near-budget | Real motif at 90–100% accepted budget | Blocked on AGL-025 and DR-05 semantics. |
| CA corpus | Accepted elementary/richer state and boundary semantics | Current elementary subset can begin; final corpus waits DR-06. |
| Lorenz corpus | Accepted RK4/profile checkpoints and downstream decisions | Blocked on DR-07/DR-08 numerical reconciliation. |
| Penrose corpus | Exact accepted patch/adjacency fixture only | Blocked on DR-09/AGL-120. |
| Render-plan corpus | Canonical logical plan from exact project inputs | Build with AGL-041 and DR-03. |
| Provenance corpus | Realistic ancestry depths and batch encoding | Build with AGL-020/035/050. |

---

## 6.5 Cross-platform conformance tests

### Required backend matrix

| Stage | Backends |
|---|---|
| Current semantic stabilization | TypeScript browser/Node reference; Swift portable implementation; JSC oracle |
| Browser conformance | Safari, Chromium, Firefox using TypeScript |
| Native proof | Swift native and JSC test oracle on physical iPad |
| Shadow bakeoff | Rust/Wasm, Rust native, Swift/Wasm, current TS and Swift baseline |
| Production accelerator | Baseline plus selected accelerator and fallback for at least one milestone |

### Conformance gates

| Domain | Gate |
|---|---|
| Exact rational/integer | `100%` exact canonical match |
| Deterministic RNG/stable IDs | `100%` vector and digest match |
| Euclidean/accepted CA | `100%` exact logical-state match |
| Project codec/migrations | `100%` accepted corpus compatibility |
| Graph exact outputs | `100%` exact result, ordering, errors, provenance |
| Floating numerical state | Pass accepted profile at every checkpoint |
| Quantized/threshold decisions | `100%` exact branch outcome |
| Cancellation | Same legal state transitions; p95 bound from FR-08 |
| Structured failures | Same stable code and semantic path; localized prose may differ |
| Swift wrapper | Swift 6 strict-concurrency build clean |
| JSC oracle | Pinned bundle/version; no arbitrary native-object exports |
| Audio boundary | Zero domain-core calls from render callback |

---

## 6.6 Performance tests

### Evidence boundary

No evidence-grade AGL benchmark numbers currently exist. A timing result is invalid unless the backend first passes the applicable conformance suite.

### Proposed benchmark manifest

DR-15 proposes:

- `10` cold runs;
- `5` warmups;
- `30` warm runs;
- median;
- p95;
- median absolute deviation;
- peak memory.

These are provisional. Thirty warm runs are adequate for exploratory median/MAD comparison but provide weak p95 resolution: p95 is effectively determined by approximately the second-highest observation. FR-08 should increase repetitions or use a time-budgeted repeated protocol before tail-latency claims become release gates.

### Required workloads

| Kernel | Normative workload | Required measurements | Current readiness |
|---|---|---|---|
| `rational-1m` | Exactly `1,000,000` deterministic add/subtract/multiply/divide/compare/normalize operations; real operand-size distribution plus pathological-large subset | Cold/warm time, ops/s, peak memory, result digest | Rational core exists; fixture extraction needed. |
| `euclidean-corpus` | Accepted corpus over pulses, steps, rotations, and edge cases | Corpus time, patterns/s, memory, exact digest | Kernel exists; final convention waits DR-02. |
| `recursive-near-budget` | Real motif at `90–100%` of accepted recursion/event budget without crossing it | Events/s, ancestry allocation, peak memory, cancel latency | Wait for AGL-025 and accepted recursive fixture. |
| `lorenz-rk4-1m` | Exactly `1,000,000` accepted RK4 steps | Checkpoint profile, final state, steps/s, memory, downstream digest | Wait for DR-07 numerical profile. |
| `ca-large` | Accepted large deterministic grid; `4,096 × 4,096` is a DR-15 proposal, not a fixed requirement | Cell-updates/s, memory, state digest, cancellation | FR-08 must ratify scale. |
| `penrose-patch` | Only DR-09/AGL-120 accepted corpus | Tiles/s, adjacency time, memory, exact digest | Blocked. |
| `graph-cancellation` | Production compiled graph; request cancel at `10%`, `50%`, and `90%` work completion | Request-to-stop p50/p95, wasted work, memory recovery | Wait for AGL-023. |
| `project-codec` | Small/medium/large real projects plus all migration fixtures | Decode, validate, migrate, encode, memory, byte/digest results | Wait for AGL-010/011. |
| `provenance-1m` | Materialize `1,000,000` representative records at realistic ancestry depths | Records/s, bytes/record, peak memory, encoding time | Schema and realistic fixture not yet defined. |

The manifest and workloads derive from DR-15. 
### Environments

**Desktop browser**

- fixed macOS hardware;
- Safari;
- Chromium;
- Firefox;
- release/minified build;
- TypeScript baseline;
- future Rust/Wasm and Swift/Wasm candidates.

**iPad Safari**

- A16-class floor proposed by DR-15;
- M3 iPad Air-class representative device;
- optional high-end iPad ceiling;
- same browser harness.

**Native iPad**

- physical floor and representative devices;
- Swift baseline;
- JSC oracle measurements for diagnostic interest only;
- future Rust native candidate.

Hardware models are benchmark profiles, not permanent project-format fields. Record device, OS, browser, compiler, thermal state where available, cross-origin-isolation status, core revision, fixture revision, and build configuration.

### Result validity

A performance result is accepted only when:

1. Fixture and backend revision hashes are recorded.
2. Conformance passes.
3. Release configuration is used.
4. Cold and warm measurements are separated.
5. Transfer/FFI/serialization is included in end-to-end results.
6. Peak memory covers all relevant heaps/memories.
7. The physical iPad is used for native performance claims.
8. Raw measurements are preserved.
9. Thermal throttling or interruption is identified.
10. A user-visible critical-path measurement accompanies microkernel timing.

### Reproduction skeleton

```bash
#!/usr/bin/env bash
set -euo pipefail

OUT="${OUT:-bench-results/$(date -u +%Y%m%dT%H%M%SZ)}"
mkdir -p "$OUT"

pnpm test --filter agl-core
pnpm test --filter agl-conformance

pnpm run bench:dr15:browser -- \
  --manifest bench/dr15/manifest.json \
  --backend ts \
  --out "$OUT/browser-ts.json"

# Enabled only when shadow candidates exist.
pnpm run bench:dr15:browser -- \
  --manifest bench/dr15/manifest.json \
  --backend rust-wasm \
  --out "$OUT/browser-rust-wasm.json"

pnpm run bench:dr15:browser -- \
  --manifest bench/dr15/manifest.json \
  --backend swift-wasm \
  --out "$OUT/browser-swift-wasm.json"

: "${IPAD_UDID:?Set IPAD_UDID to a physical benchmark device}"

xcodebuild test \
  -scheme AGLCoreBench \
  -configuration Release \
  -destination "platform=iOS,id=${IPAD_UDID}" \
  -resultBundlePath "$OUT/native.xcresult"

pnpm run bench:dr15:summarize -- "$OUT"
```

---

## 6.7 Perceptual and user studies

No perceptual study is required to decide whether Rust, Swift, TypeScript, or JSC implements a kernel.

The following usability validations are relevant:

| Study question | Method | Success criterion |
|---|---|---|
| Do users understand `Exact`, `Numerically conformant`, and `Frozen`? | Task-based comprehension test using project inspector states | Users correctly predict whether regeneration may differ and whether editing the source affects the result. |
| Does cancellation feel responsive? | Cancel near-budget evaluations at controlled points | Users receive immediate acknowledgement; terminal state and no-commit outcome are clear even if cleanup continues. |
| Can users diagnose reproducibility? | Ask users to identify seed, operator version, numerical profile, and frozen/source status | Required provenance is locatable without reading raw JSON. |
| Does backend fallback create confusion? | Inject accelerator failure and fall back to baseline | Work continues without project mutation; diagnostics explain the fallback in Inspect/support views. |

These are product-usability tests, not evidence that one implementation language is scientifically superior.

---

# 7. Recommended Defaults

| Parameter | Default | Valid/recommended range | Rationale | Evidence strength | User-facing? |
|---|---|---|---|---|---|
| Core strategy | Conformance-first selective core | Revisit only at gates | Lowest-regret architecture under current maturity. | High — R/E | No |
| Executable reference | TypeScript | Until semantic-stabilization revisit | Preserves current investment and browser fit. | High — R | Advanced diagnostics only |
| Normative authority | Contracts + fixtures above implementation | Fixed | Prevents bug-as-spec behavior. | High — R | No |
| Native Swift scope | AGL-147-required semantics only | Expand after conformance and product need | Native proof is bounded. | High — E/R | No |
| JSC role | Test/debug oracle | Production disabled | Reuses TS semantics without production VM coupling. | High — R | No |
| Rust accelerator | Disabled | Shadow prototype only after gates | No performance case established. | High — E/R | No |
| Swift/Wasm accelerator | Disabled | Future bakeoff challenger | Credible but immature for current rewrite. | Medium — E/R | No |
| Project backend field | Absent | Execution manifest only | Backend is not project meaning. | High — R | Inspect only |
| Rational numerator | Canonical decimal string | Arbitrary size within resource budgets | Portable exact semantics. | High — E/R | Advanced value entry may expose |
| Rational denominator | Positive canonical decimal string | `>0`; arbitrary size within budgets | Canonical sign and value. | High — R | Advanced value entry may expose |
| Canonical zero | `0/1` | Fixed | One representation. | High — R | No |
| PRNG algorithm | Existing accepted AGL-005 algorithm | No new default from DR-15 | Report does not justify replacement. | High — E | Inspect |
| Seed serialization | Explicit versioned canonical representation | Final encoding from AGL-005/schema review | Prevents Unicode/platform ambiguity. | High — R | Yes, seed UI |
| Numerical tolerance | **No default justified** | Must come from DR-07/DR-08/FR-08 | DR-15 establishes need, not values. | High — E | Inspect |
| NaN payload identity | Not semantic | Classification/profile only | Wasm permits multiple valid NaN payloads. | High — E/R | No |
| Signed-zero policy | **Unresolved** | Normalize or preserve by numerical profile | Must be explicit. | Medium — R | No |
| Browser cancellation | Bounded chunking portable path | SAB/atomic optional when isolated | Works without hosting dependency. | High — E/R | Cancel UI |
| Hard cancellation | Worker termination after deadline | Deadline from FR-08 | Safety fallback for uncooperative work. | High — E/R | Error/diagnostic state |
| Large buffer transfer | Transfer ownership, do not clone | Where sender no longer needs buffer | Reduces copying. | High — E/R | No |
| FFI granularity | One coarse request/result batch | Never per-event/per-record | Makes boundary cost measurable. | High — R | No |
| Provenance bridge | Versioned packed batch | Schema TBD | Avoid object-granular FFI. | High — R | No |
| Benchmark repetitions | `10` cold, `5` warmup, `30` warm—**provisional** | FR-08 should increase for tail claims | Retained from report; p95 reliability is weak at 30. | Medium — R | No |
| CA stress size | **No fixed default** | `4,096 × 4,096` only as FR-08 candidate | Current value is a proposal. | High — E | No |
| Adoption speed gate | Approximately `≥1.5×` end-to-end—provisional | FR-08-adjustable | Burden of proof must be material. | Medium — R | No |
| Adoption memory gate | Approximately `≥30%` peak reduction—provisional | FR-08-adjustable | Material memory benefit. | Medium — R | No |
| User-critical-path gate | Approximately `≥25%` reduction—provisional | FR-08-adjustable | Reject microbenchmark-only wins. | Medium — R | No |
| Duplication trigger | Approximately `≥20%` runtime capacity over two milestones—provisional | FR-07/program-adjustable | Measures semantic-maintenance cost. | Low-medium — R | No |
| Accelerator fallback | Retain TS baseline for at least one milestone | Longer if defects occur | Rollback and differential diagnosis. | High — R | No |
| Swift bigint library | **No default selected** | Dependency review required | Current evidence establishes need, not winner. | High — E | No |
| Binary/startup budget | **No default justified** | FR-08/device measurements | No artifacts measured. | High — E | No |
| Cancellation poll interval | **No default justified** | FR-08 workload-specific | Throughput/responsiveness trade-off is empirical. | High — E | No |

---

# 8. UX / Visualization Implications

| User goal | Information that must be visible | Interaction behavior | Meaning represented | Misleading representations to avoid | Accessibility | Explore / Compose / Inspect |
|---|---|---|---|---|---|---|
| Understand result exactness | `Exact`, `Numerically conformant`, or `Render-only`; profile/version where applicable | Selecting status opens explanation and provenance | Whether equality or profile relation applies | One generic “deterministic” badge | Text, icon, and semantic role; no color-only encoding | Explore explains; Compose stays compact; Inspect shows full contract |
| Reproduce a generated result | Project/schema, operator versions, seed/stream, profile, source/frozen status | “Copy reproducibility manifest” action | Inputs and versions required for replay | “Same seed” without algorithm/version | Screen-reader-friendly ordered field list | Inspect primary; Compose summary |
| Distinguish generated and frozen material | Source graph link, current/stale status, frozen timestamp/digest, lineage | Freeze is explicit and undoable; frozen output never silently regenerates | Live derivation versus committed materialization | Generated events styled exactly like ordinary permanent events | Label + icon + stroke/pattern + accessible description | Compose and Inspect hard contract |
| Cancel expensive work | Current stage, progress, cancel acknowledgement, terminal state | Cancel immediately acknowledges; project remains unchanged | Cooperative cancellation may take bounded time | Button appearing inert until kernel returns | Keyboard-accessible cancel; announced state changes | All modes |
| Avoid stale updates | Generation/version status and “superseded” explanation | Stale results are discarded, optionally shown in diagnostics | Result belongs to an old graph generation | Old result replacing new state because it finished later | Announce only current result by default | Inspect may show discarded runs |
| Understand project migration | Source version, target version, warnings, preserved original | Safe preview and explicit save boundary | Migration changes representation under versioned rules | Silent destructive rewrite | Path-specific errors; focus moves to first issue | Compose summary; Inspect detail |
| Diagnose backend execution | Backend/build, fallback reason, timing/memory, artifact hash | Hidden by default; support/advanced inspector only | Execution implementation, not project meaning | Presenting backend as authored project choice | Structured text/table alternative | Inspect only, except failure banner |
| Compare numerical behavior | Checkpoints, divergence visualization, profile bounds, frozen comparison | Optional A/B comparison without overwriting project | Profile equivalence versus exact identity | Overlay suggesting trajectories are identical because initial points match | Textual checkpoint table; non-motion alternative | Explore and Inspect |
| Recover from accelerator failure | Fallback status, whether result is exact/profile-equivalent | Automatic safe fallback where allowed; manual retry | Runtime degradation without semantic edit | Treating fallback as project modification | Announced nonmodal status; accessible details | Compose unobtrusive; Inspect detailed |
| Understand performance limits | Workload, budget consumption, memory/event/iteration counters | Budget forecast before expensive execution; cancel and freeze actions | Bounded computation and why it stopped | Generic spinner with no budget context | Text progress and remaining-budget description | Inspect primary |
| Inspect provenance | Stable IDs, source nodes, versions, parents, semantic versus execution provenance | Cross-highlight graph, event, geometry, and provenance | Why a result exists and how it was executed | Mixing backend build metadata into mathematical lineage | Ordered list/tree equivalent to visual graph | Inspect hard contract |
| Use without color or motion | Every state encoded redundantly | Keyboard navigation and direct commands | State and causality | Animation or hue as sole signal | Reduced-motion, focus order, screen-reader state, noncolor cues | All modes |

### UX requirements that are hard contracts

1. `Exact` may be displayed only for exact-domain equality.
2. `Reproducible` must identify the relevant schema, operator, seed, and numerical-profile versions.
3. Backend switching must not dirty the project or create undo history.
4. Cancellation must never masquerade as undo.
5. Stale results must never replace current state.
6. Frozen material must be visibly and semantically distinct from live generated material.
7. Numerical divergence must not be described as implementation failure when it remains inside the accepted profile.
8. A profile failure must not be hidden by a visually plausible result.
9. Backend/runtime metadata belongs in Inspect/support surfaces, not routine creative controls.
10. Every visual status requires an accessible textual equivalent.

---

# 9. User-Facing Scientific Claims

## Safe to state directly

- “AGL uses normalized rational numbers for exact symbolic musical positions. These values do not accumulate floating-point rounding error within the rational model.”
- “A conforming implementation produces the same exact-domain result when the project, operator versions, seed protocol, inputs, and budget semantics are the same.”
- “Frozen material stores a resolved result and its lineage; later edits to the generator do not silently change it.”
- “AGL separates mathematical/domain computation from the real-time audio render callback.”
- “The current cross-platform study did not establish that Rust, Swift/WebAssembly, or JavaScriptCore is faster for AGL’s workloads because the required AGL hardware benchmarks have not yet been executed.”
- “Project compatibility is defined by the project format, migrations, semantic versions, and conformance fixtures—not by one programming language.”

## Safe only with qualification

- **Claim:** “Rust can provide one implementation for browser and native kernels.”  
  **Required qualification:** Rust supports relevant Wasm and ARM64 iOS targets, but AGL-specific performance, memory, startup, maintenance, and FFI costs remain unmeasured.

- **Claim:** “JavaScriptCore can run the TypeScript reference engine in the native app.”  
  **Required qualification:** It can execute bundled JavaScript and is useful as a test oracle, but access to one VM serializes across threads and it is not equivalent to every browser engine.

- **Claim:** “Swift/WebAssembly can share Swift code between native and web.”  
  **Required qualification:** The ecosystem supports JavaScript interop, async, and multithreading, but current typed bridge tooling is experimental and arbitrary-precision integer support still requires another solution.

- **Claim:** “WebAssembly floating-point behavior is deterministic.”  
  **Required qualification:** Ordinary numeric operations are specified, but some NaN results have multiple valid representations unless a deterministic profile applies, and cross-target compiler/library behavior still requires conformance testing.

- **Claim:** “The same Lorenz experiment runs across platforms.”  
  **Required qualification:** The same parameters and numerical profile can define the same experiment, but long chaotic trajectories may not be byte-identical; checkpoints and downstream discrete outputs are compared under an explicit profile.

- **Claim:** “A shared implementation reduces semantic drift.”  
  **Required qualification:** It removes one class of duplicated algorithm code but does not eliminate drift in serialization, bindings, host orchestration, compiler targets, migrations, or project behavior.

## Do not claim

- “Rust is faster than TypeScript for AGL.”
- “Rust is the inevitable long-term core.”
- “Swift/Wasm is production-ready for AGL.”
- “JavaScriptCore is interpreter-only,” or “JavaScriptCore will provide browser-grade JIT performance.”
- “One source language guarantees identical floating-point results.”
- “A one-million-step Lorenz trajectory is byte-identical across browser, Wasm, and native.”
- “Wasm or native FFI is effectively free.”
- “Using a shared core automatically guarantees project compatibility.”
- “The `1.5×`, `30%`, `25%`, or `20%` thresholds are research-established universal cutoffs.”
- “A `4,096 × 4,096` CA workload is an AGL product requirement.”
- “A systems-language domain core should run on the real-time audio callback.”
- “JavaScriptCore may download new operator code without App Review or reproducibility implications.”
- “Thirty warm runs establish a stable p95 performance distribution.”
- “A numerical result that looks visually similar necessarily passed the numerical profile.”

---

# 10. Implementation Recommendations

## Must happen before MVP architecture freezes

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Accept ADR-DR15-01 and establish semantic-authority precedence. | **Critical** | S | Architecture review |
| Create the portable semantic-contract package and fixture schema. | **Critical** | M | AGL-010, AGL-020, AGL-133 |
| Adopt canonical rational decimal-string wire semantics. | **Critical** | S | AGL-010/011 |
| Externalize accepted AGL-005 PRNG and stable-ID vectors. | **Critical** | M | AGL-005, AGL-133 |
| Add semantic/profile/version descriptors to the project model. | **Critical** | M | AGL-010 |
| Define backend-neutral `CoreRequestEnvelope`, `CoreResultEnvelope`, and `AGLCoreBackend`. | **High** | M | AGL-020/023, AGL-143 |
| Implement the cancellation/generation/stale-result state machine. | **Critical** | L | AGL-023, FR-08 |
| Separate semantic provenance from execution provenance. | **High** | M | AGL-020/035/050 |
| Split exact and raw-floating cache-key policy. | **Critical** | M | AGL-024, numerical-profile ADR |
| Encode pure evaluation and result-commit rules in the command architecture. | **Critical** | M | AGL-012, DR-14 |
| Enforce the domain-core → render-plan → real-time boundary. | **Critical** | M | AGL-041, DR-03 |
| Define generated/frozen backend-neutral semantics. | **High** | M | AGL-027/032/141 |
| Land the DR-15 benchmark manifest and machine-readable result schema. | **High** | M | FR-08 |
| Add fixed JSC oracle-bundle policy to the native test architecture. | **Medium** | S | AGL-143/146 |

## Must happen before the affected lab ships

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Accept the Euclidean convention corpus and run exact cross-platform vectors. | **High** | M | DR-02, AGL-071 |
| Define recursive continuation, ancestry, near-budget, and cancellation fixtures. | **High** | L | DR-05, AGL-025, AGL-091 |
| Define accepted CA state/boundary semantics and exact state digests. | **High** | M | DR-06, AGL-101 |
| Accept the Lorenz numerical profile, checkpoints, and branch-output oracles. | **Critical** | L | DR-07, DR-08, FR-08 |
| Add Penrose only from the accepted DR-09/AGL-120 corpus. | **Critical for Penrose** | L | DR-09, AGL-120–122 |
| Validate project round-trip and migration compatibility in TS and Swift. | **Critical for native** | L | AGL-010/011/146 |
| Select and review the Swift arbitrary-precision integer implementation. | **Critical for exact native** | M | AGL-136, AGL-147 |
| Run physical-iPad benchmark and memory tests for the bounded native proof. | **High** | M | AGL-147, FR-08 |
| Validate that generated/frozen export behavior is backend-independent. | **High** | M | AGL-027/130/131 |

## Can safely happen after MVP

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Shadow Rust rational/RNG/Euclidean kernels. | Medium | L | All readiness gates |
| Shadow Swift/Wasm implementation of the same benchmark adapter. | Medium | L | All readiness gates |
| Add Rust/Wasm for a proven browser hot kernel. | High if triggered | XL | Adoption ADR |
| Package a proven Rust native kernel as an XCFramework. | High if triggered | XL | Browser/native shadow proof |
| Evaluate graph-evaluator migration. | Medium | XL | Demonstrated graph bottleneck or semantic-maintenance trigger |
| Remove baseline fallback. | Medium | M | At least one stable milestone and rollback review |
| Optimize provenance batch representation beyond the accepted baseline. | Medium | L | Real project telemetry |

## Research-only / experimental

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Measure JSC performance on representative hardware. | Low for current decision | M | Native benchmark harness |
| Compare SAB atomic cancellation with portable chunking. | Medium | M | Hosting profile, FR-08 |
| Evaluate Swift/Wasm BridgeJS maturity and binary/startup cost. | Conditional | M | Future bakeoff |
| Test Rust/Wasm versus Swift/Wasm only after exact conformance. | Conditional | L | Stage B shadow prototype |
| Explore one canonical numerical kernel for chaotic branches if profile equivalence proves insufficient. | Potentially high | L | DR-07/08 integration |

## Planning ROM retained from DR-15

These are rough person-day ranges with approximately **±50% uncertainty** because the actual source/package tree was unavailable. They are not commitments or schedule estimates.

| Logical package | TS + full Swift parity | Shared Rust | Production JSC | Shared Swift/Wasm | Incremental work recommended now |
|---|---:|---:|---:|---:|---:|
| Numeric core / rational / IDs / RNG | 5–9 | 7–12 | 2–4 | 8–14 | 2–4 |
| Domain/event/operator contracts | 6–10 | 8–14 | 3–6 | 8–14 | 2–3 |
| Project codec / migrations | 7–12 | 9–16 | 4–7 | 8–14 | 2–4 |
| Graph compiler/evaluator/cache/budgets | 12–22 | 18–30 | 8–14 | 16–28 | 3–5 |
| Mathematical kernels | 12–24 | 16–30 | 3–6 | 15–28 | 2–4 |
| Provenance / projection data | 5–9 | 7–12 | 3–6 | 7–12 | 1–2 |
| Audio render-plan adapter | 3–5 | 4–7 | 2–3 | 3–6 | 1–2 |
| Fixtures / conformance / build / CI | 8–14 | 12–20 | 6–10 | 12–20 | 3–6 |
| **Total ROM** | **58–105** | **81–141** | **31–56** | **77–136** | **16–30** |

---

# 11. Backlog Deltas

New identifiers below are temporary integration identifiers, not assumed existing backlog IDs.

| Action | Item | Rationale | Suggested acceptance criteria | Dependencies | Milestone |
|---|---|---|---|---|---|
| **ADD** | `NEW-DR15-01 — Portable semantic contract package` | Establish language-neutral authority. | Versioned schemas for rational, seed/stream, stable IDs, request/result, errors, numerical profile, provenance, benchmark result; TS and Swift decode tests. | AGL-002/005/010/020 | M1 |
| **ADD** | `NEW-DR15-02 — Backend-neutral CoreRuntime boundary` | Prevent application code from depending on Swift/Rust/JSC details. | TS and Swift interfaces; backend descriptor; generation/cancellation; structured errors; exact/profile conformance class. | AGL-020/023/143 | M1 |
| **ADD** | `NEW-DR15-03 — JavaScriptCore differential oracle target` | Reuse executable TS reference in native tests. | Pinned bundle hash/version; data-only bridge; fixture runner; production target excludes bundle; Web Inspector/debug support documented. | AGL-143/146 | M1/M7 prep |
| **ADD** | `NEW-DR15-04 — DR-15 benchmark harness and result registry` | Make future architecture decision reproducible. | Manifest, result JSON, environment metadata, conformance-before-timing, raw results, browser/native runners, physical-device workflow. | FR-08, AGL-133/146 | M1→M7 |
| **ADD** | `NEW-DR15-05 — Numerical conformance profile` | Prevent accidental byte-equality promises and branch drift. | Scalar/rounding/fast-math/NaN/signed-zero/checkpoint/tolerance/branch/cache policy accepted. | DR-07, DR-08, DR-03, FR-08 | M4 |
| **ADD** | `NEW-DR15-06 — Shared-core adoption telemetry and gate` | Measure duplicated-semantics cost and escaped drift. | Runtime-engineering capacity ledger; conformance escape classification; workload budget breaches; ADR revisit report. | FR-07/08 | M6/M7 |
| **MODIFY** | `AGL-010 — Full project schema and JSON Schema` | Project format must encode portable semantics. | Decimal-string rational fields; semantic compatibility descriptor; numerical/budget/seed versions; backend fields prohibited from canonical project. | NEW-DR15-01 | M1 |
| **MODIFY** | `AGL-011 — Schema migration framework` | Preserve source bytes separately from semantic canonicalization. | Source bytes/hash retained; semantic digest produced; sequential deterministic migrations; old/new backend corpus passes. | AGL-010 | M1 |
| **MODIFY** | `AGL-012 — Project command bus` | Evaluation/cancellation must not corrupt undo semantics. | Evaluation result commits only through validated transaction; stale/cancelled results create no command; backend switch creates no command; freeze remains atomic/undoable. | DR-14, AGL-023 | M1 |
| **MODIFY** | `AGL-020 — Executable operator interface` | Operators need portable determinism metadata. | Semantic version, conformance class, numerical profile, budget profile, pure request/result, provenance schema, deterministic error contract. | NEW-DR15-01 | M1 |
| **MODIFY** | `AGL-023 — Worker evaluator` | Cancellation cannot rely on messages alone. | State machine; generation IDs; monotonic progress; chunking; optional SAB polling; hard worker termination fallback; p95 metrics. | FR-08 | M1/M4 |
| **MODIFY** | `AGL-024 — Deterministic evaluation cache` | Raw floating results cannot safely alias across backends. | Exact/profile-canonical keys exclude backend; raw-FP keys include backend/build; semantic version invalidation fixtures. | NEW-DR15-05 | M1/M4 |
| **MODIFY** | `AGL-025 — Evaluation budget service` | Budget and cancellation work units must be portable. | Versioned work-unit model; recursion/events/iterations/geometry/memory; poll bounds; structured budget error; backend-independent accounting fixtures. | FR-08 | M1/M4 |
| **MODIFY** | `AGL-027 — Graph freeze-to-clip` | Freeze is the reproducibility escape hatch for numerical/live results. | Materialized output; source semantic digest; versions/seeds/profile; semantic lineage; optional execution provenance; no silent regeneration. | AGL-023/032 | M3/M5 |
| **MODIFY** | `AGL-041 — Audio render plan` | Audio-thread safety must be independent of core language. | Immutable bounded plan; plan version/digest; preallocation; same logical plan for real-time/offline; zero domain-core calls from render callback. | DR-03 | M2 |
| **MODIFY** | `AGL-133 — Property and invariant test suite` | Differential tests need formal laws, not only examples. | Rational laws; generation vectors; cache laws; cancellation terminality; graph order invariance; backend project neutrality; malformed binary fuzzing. | NEW-DR15-01 | M1 |
| **MODIFY** | `AGL-143 — Swift portable-contract spike` | Extend the spike into the adopted compatibility model. | Decode new semantic descriptors; exact rational conformance; generation/version fields; strict concurrency; execution-provenance separation. | AGL-010, NEW-DR15-01 | M1/M7 prep |
| **MODIFY** | `AGL-146 — Cross-platform golden conformance fixtures` | This becomes the principal anti-drift mechanism. | TS, Swift, JSC; exact corpus; project migration; structured errors; provenance; later Rust/Wasm/native and Swift/Wasm adapters. | FR-07 | M1/M7 prep |
| **MODIFY** | `AGL-136 — Dependency and license review` | Swift bigint and future systems dependencies require explicit ownership. | Swift bigint candidates reviewed for license, maintenance, arbitrary-size correctness, Codable/wire fit, performance, Swift 6 concurrency; Rust/Wasm dependencies reviewed only when prototype begins. | AGL-147 | M6/M7 prep |
| **SPLIT** | `AGL-147 — Native iPad proof-of-architecture` | The current item mixes proof capability with long-term backend choice. | **147A:** bounded Euclidean native document/audio/edit/save/conformance proof. **147B:** production backend decision after benchmark and gate review. | DR-12, DR-15, AGL-143/146 | M7 |
| **BLOCK** | Production Rust, Swift/Wasm, or JSC core adoption | No semantic-readiness or benchmark proof. | Block remains until ADR-DR15-08 readiness and proof gates pass. | AGL-010/011, AGL-020–025, AGL-146, FR-07/08 | M7+ |
| **UNBLOCK** | Shadow shared-kernel bakeoff | Enable empirical comparison without product commitment. | Exact corpus passes first; TS remains authoritative; no shipping dependency; Rust native/Wasm and Swift native/Wasm use identical fixture/benchmark adapters. | All readiness gates | M7 or later |

No existing backlog item should be removed solely because DR-15 prefers a selective core.

---

# 12. Cross-Research Dependencies

## DR-03 — Browser audio scheduling, latency, and rendering

**This report concludes:**  
Domain computation must stop at an immutable render-plan boundary and must never execute on the real-time callback.

**Must be reconciled with:**  
DR-03’s scheduler, Worker/main-thread/AudioWorklet boundaries, real-time/offline equivalence, plan publication, teardown, and PCM-conformance policy.

**Why:**  
DR-15 determines where the cross-platform domain core stops. DR-03 determines how logical events become safely timed audio.

**Question the integration pass must answer:**  
What exact `AudioRenderPlan` fields, generation-publication protocol, and real-time/offline equivalence relation are shared across browser and native?

---

## DR-12 — Native iPad architecture

**This report concludes:**  
Swift should implement only the bounded native capabilities currently required, behind `AGLCoreBackend`; JSC is an oracle; Rust and Swift/Wasm remain deferred candidates.

**Must be reconciled with:**  
DR-12’s document architecture, AVAudioEngine boundary, Swift concurrency model, MIDI, Pencil, package layout, and adaptive UI.

**Why:**  
DR-12 owns the native host architecture in which DR-15’s backend boundary will live.

**Question the integration pass must answer:**  
Does AGL-147A need graph execution beyond Euclidean generation, and what exact Swift bigint/document dependencies are acceptable for that proof?

---

## DR-14 — Cross-surface editing, command, and undo semantics

**This report concludes:**  
Evaluation is pure; cancellation is transient; stale results never commit; backend switching is not an edit; freeze is an explicit command.

**Must be reconciled with:**  
DR-14’s transaction boundaries, speculative edits, graph/timeline synchronization, generated-content editing, and undo grouping.

**Why:**  
A result may finish asynchronously after the project has changed. The command model determines whether and how that result becomes project state.

**Question the integration pass must answer:**  
What is the exact command/state-machine transition from “edit accepted” through “evaluation current” to “derived or frozen artifact committed”?

---

## DR-07 — Chaotic dynamics numerical profile

**This report concludes:**  
A one-million-step Lorenz run cannot be treated as exact cross-platform state without an explicit profile.

**Must be reconciled with:**  
DR-07’s integrator, step size, parameter ranges, checkpointing, numerical-stability tests, and interpretation of trajectory divergence.

**Why:**  
DR-15 cannot choose tolerances or decide whether profile equivalence is sufficient for the Chaos lab.

**Question the integration pass must answer:**  
Must the same project regenerate identical control/event decisions across platforms, and, if so, what canonicalization or frozen-output rule provides that guarantee?

---

## DR-08 — Sonification and control-signal semantics

**This report concludes:**  
Floating scalar tolerance is insufficient where values cross thresholds, quantizers, constraints, or event-generation branches.

**Must be reconciled with:**  
DR-08’s mapping pipeline, causal/frozen behavior, quantization, constraint decisions, and realtime/offline logical equivalence.

**Why:**  
Small numerical differences can become large exact event differences after a branch.

**Question the integration pass must answer:**  
Which stages require exact canonical decisions, and where may profile-equivalent floating intermediates remain noncanonical?

---

## DR-02 — Euclidean rhythm conventions

**This report concludes:**  
Euclidean patterns are suitable low-ambiguity exact shared-kernel fixtures.

**Must be reconciled with:**  
DR-02’s accepted algorithm, rotation convention, edge cases, labels, accent/probability separation, and corpus.

**Why:**  
Different Euclidean conventions can be internally correct while producing rotated or differently ordered patterns.

**Question the integration pass must answer:**  
What exact canonical output order and rotation-zero definition becomes the cross-platform oracle?

---

## DR-05 and DR-06 — Recursive and cellular workloads

**This report concludes:**  
Recursive motif and CA kernels are future compute-heavy candidates, but only after semantics and budgets stabilize.

**Must be reconciled with:**  
DR-05 grammar/ancestry/growth semantics and DR-06 CA state, dimensions, boundaries, seeds, and sonification mode.

**Why:**  
Benchmarking provisional preview code could select an architecture for the wrong workload.

**Question the integration pass must answer:**  
Which exact accepted fixture represents each lab’s production workload, and what work-unit model makes cancellation comparable?

---

## DR-09 — Penrose geometry

**This report concludes:**  
No substitute “Penrose-like” fixture may be used. The benchmark remains blocked until DR-09/AGL-120 accepts one exact construction and corpus.

**Must be reconciled with:**  
Exact tile representation, clipping, adjacency, stable IDs, traversal, and reference corpus.

**Why:**  
The performance and data-layout profile depends strongly on the accepted construction.

**Question the integration pass must answer:**  
Which geometry values are exact algebraic/symbolic values, which are projected floating coordinates, and what equality relation applies to each?

---

## DR-13 — Multimodal accessibility

**This report concludes:**  
Exact/numerical/frozen/stale/cancelled/migrated states require nonvisual semantic representations.

**Must be reconciled with:**  
DR-13’s canvas alternatives, screen-reader model, reduced-motion behavior, and noncolor status encoding.

**Why:**  
Cross-platform diagnostics become user-facing scientific semantics, not merely developer logs.

**Question the integration pass must answer:**  
What accessible vocabulary and ordered representation communicate numerical profile and provenance without exposing implementation jargon unnecessarily?

---

## FR-07 and FR-08 — Conformance and performance governance

**This report concludes:**  
Cross-platform conformance must precede native expansion, and workload budgets must precede optimization or migration.

**Must be reconciled with:**  
FR-07’s differential fixture scope and FR-08’s benchmark repetitions, hardware floor, cancellation bound, memory/startup budget, and adoption thresholds.

**Why:**  
DR-15’s numeric thresholds are provisional and its benchmark results are pending.

**Question the integration pass must answer:**  
What exact evidence package and signoff make a shared-core bakeoff eligible, and what constitutes a material win?

---

# 13. Contradictions, Weak Evidence, and Open Questions

| Issue | Adversarial assessment | Required resolution |
|---|---|---|
| “Rust is the strongest technical candidate.” | Strong inference for arbitrary integers and systems-level kernels, not an AGL benchmark result. | Keep language neutral until bakeoff. |
| “Swift/Wasm is materially credible.” | Ecosystem activity and tooling features do not establish AGL production maturity. | Evaluate only after readiness gates. |
| TypeScript as “reference core.” | Without authority precedence, reference behavior can ossify bugs. | Contracts and fixtures must outrank implementation. |
| JSC as an “oracle.” | It runs the same TypeScript implementation and therefore is not an independent mathematical oracle. | Keep formal/property/golden fixtures as primary authority. |
| JSC represents browser behavior. | JSC does not represent Chromium or Firefox and may differ from Safari’s browser integration. | Retain browser-engine conformance matrix. |
| JSC performance assumptions. | No authoritative basis was found for assuming either JIT-grade or interpreter-only app-created `JSContext` performance. | Benchmark only if production JSC is reconsidered. |
| App Review interpretation. | Bundled fixed JS is not the same as prohibited remote feature-changing code. The report’s no-remote-code conclusion is sound, but a blanket “JSC violates App Review” claim would be false. | Preserve the narrower policy. |
| Worker cancel messages. | Correctly identified as nonpreemptive, but DR-15 omitted the hard `Worker.terminate()` fallback. | Add hard cancellation as bounded last resort. |
| SAB cancellation. | Depends on cross-origin isolation and therefore on hosting/security headers. | Portable chunking remains mandatory. |
| `CoreRuntime` actor. | An actor façade does not automatically define backend thread safety, parallel evaluation, or foreign-handle ownership. | Declare handles thread-confined initially. |
| C ABI prototype. | Original example omitted ABI negotiation, cancel lifecycle, structured error buffer, and thread-safety rules. | Adopt the expanded prototype in this packet. |
| Backend-independent cache keys. | Unsafe for raw profile-equivalent floating results that can differ across backends. | Include backend/build until canonicalization or frozen output exists. |
| Shared source guarantees numerical identity. | False. Native and Wasm compilation, NaN behavior, fused operations, libraries, and host integration can still differ. | Numerical profile and checkpoint tests remain required. |
| Tolerance solves branch drift. | False near thresholds, quantizers, topology decisions, and event creation. | Require canonical branch semantics or persist decisions. |
| Swift bigint feasibility. | Need is established; actual dependency correctness, license, maintenance, performance, and concurrency are unassessed. | Complete a focused dependency evaluation before AGL-147A. |
| JCS solves canonical project semantics. | JCS gives deterministic JSON serialization under its assumptions; it does not define AGL normalization, migration, Unicode semantics, or semantic equality. | Use JCS only after AGL semantic normalization and only where designated. |
| Two-workload migration trigger. | Could ignore one catastrophic release-blocking workload. | Add a critical-blocker override. |
| `≥20%` capacity trigger. | Denominator and accounting method are undefined. | Define domain/runtime engineering person-days and review cadence. |
| “Repeated escaped defects.” | No severity or count definition exists. | FR-07/program governance must define qualifying incidents. |
| `≥1.5×`, `≥30%`, `≥25%`. | Sensible burden-of-proof values but not evidence-derived AGL thresholds. | FR-08 ratification required. |
| Ten cold and thirty warm runs. | Too few for strong p95 tail claims; environment noise can dominate. | Increase sampling or avoid release-level p95 claims from this count. |
| Peak browser/iPad memory. | Measurement methods differ and browser heap/Wasm/process metrics may not be directly comparable. | Define platform-specific collection method and comparison scope. |
| A16/M3 device profiles. | Useful current benchmark classes but not permanent support policy. | Tie to product support floor and record exact hardware. |
| `4,096 × 4,096` CA. | A suggested stress workload, not accepted semantics or budget. | FR-08 and DR-06 must ratify. |
| One million provenance records. | Useful stress target, but the realistic record shape and ancestry distribution are undefined. | Define provenance schema and real-project distribution first. |
| Same plan means same audio. | Logical render-plan equality does not establish PCM equality across browser/native engines. | DR-03 owns waveform equivalence. |
| Project migrations remain host-owned. | TS and Swift could still implement migrations differently. | One shared corpus plus, where practical, shared declarative migration descriptors. |
| Provenance batch format. | “Packed batch/SoA” is architectural direction, not an implemented schema. | Specify and fuzz before treating throughput estimates as meaningful. |
| Stable-ID algorithm. | AGL-005 is done, but its exact algorithm and wire vectors were not present in DR-15. | Extract rather than reconstruct from memory. |
| Security of JSC bridge. | Merely bundling code does not constrain native objects exposed through `JSExport`. | Data-only bridge, isolated VM, no application object graph. |
| Security of Wasm/Rust. | Memory isolation does not validate malicious project input, lengths, recursion, or resource use. | Schema, size, and budget validation remain host requirements. |
| ROM precision. | Approximately ±50%, based on logical packages rather than source-tree sizing. | Use for architecture comparison only. |
| Full graph migration threshold. | Performance alone may not justify moving project/command/provenance ownership. | Require semantic-maintenance evidence and separate ADR. |

---

# 14. Research Follow-Ups

| Question | Why current evidence is insufficient | Decision blocked | Best likely method | Priority |
|---|---|---|---|---|
| What numerical profile preserves meaningful Lorenz/control behavior across TS, Swift, native, and Wasm? | DR-15 identifies the problem but lacks accepted solver parameters, checkpoints, branch semantics, and tolerances. | Chaos compatibility, cache policy, shared numerical kernel | DR-07/DR-08 integration plus differential experiments across compilers/targets | **Critical** |
| Which Swift arbitrary-precision integer implementation should AGL use? | Swift’s standard numerical package does not currently provide one; no candidate was evaluated for correctness, license, maintenance, serialization, or performance. | Exact native rational/ID implementation in AGL-147A | Focused dependency audit; run rational corpus and one-million-op benchmark on physical iPad | **Critical for native proof** |
| What are AGL’s actual browser and physical-iPad performance/memory results? | No source/hardware execution occurred in DR-15. | Any production Rust/Swift-Wasm/JSC decision | Execute the accepted DR-15 harness after readiness gates; retain raw results | **Critical before shared-core adoption** |
| What cancellation design meets the accepted p95 without imposing cross-origin isolation? | Poll interval, chunk size, worker restart cost, and workload characteristics are unknown. | AGL-023/FR-08 cancellation gate | Prototype chunking, SAB atomic polling, and hard worker termination across representative workloads | **High** |
| Is JSC sufficiently faithful and useful as a native differential oracle? | JSC runs the same source but is not an independent semantic oracle and differs from Chromium/Firefox. | Scope of native CI oracle | Run the same fixture corpus in Node/browser engines/JSC; classify engine-specific failures | **Medium** |
| What provenance batch representation gives acceptable throughput and memory without losing explanation? | The report recommends batching but does not define record shape or realistic ancestry. | Provenance FFI and `provenance-1m` benchmark | Implement two candidate batch layouts against real cross-lab fixtures; fuzz and profile | **High before provenance ABI freeze** |
| Does a material problem exist that warrants a Rust/Swift-Wasm bakeoff? | Current evidence says no performance case is established. | Shadow Stage B | Instrument runtime capacity, escaped drift, workload budget breaches, and user-visible latency through M1–M6 | **Conditional** |
| If a bakeoff triggers, which candidate wins end-to-end? | Architecture-level strengths do not predict AGL workload behavior. | Production shared kernel | Rust native/Wasm versus Swift native/Wasm versus TS+Swift baseline using identical adapters and fixtures | **Conditional, high once triggered** |

No further research is needed to decide that projects must be backend-neutral, exact semantics require language-neutral fixtures, cancellation needs a formal state model, or domain computation must remain outside the real-time callback. Those are sufficiently supported architecture decisions.

---

# 15. Integration Checklist

- [ ] Update the core architecture specification with the conformance-first split-core model.
- [ ] Accept or revise ADR-DR15-01 through ADR-DR15-08.
- [ ] Create the deferred numerical-profile ADR shell for DR-07/DR-08/FR-08 reconciliation.
- [ ] Update the project JSON Schema with canonical rational and semantic-version descriptors.
- [ ] Update the migration contract for source-byte and semantic-digest separation.
- [ ] Update the executable operator contract with conformance class and profile metadata.
- [ ] Update the graph/compiler architecture to keep optional kernels pure and host-orchestrated.
- [ ] Update the worker evaluator with cancellation, hard termination, progress, and generation semantics.
- [ ] Update the deterministic cache specification for exact versus raw-FP results.
- [ ] Update the evaluation-budget specification with versioned work units and poll bounds.
- [ ] Update the provenance contract with semantic/execution separation and batch transport.
- [ ] Update the render-plan contract with the hard real-time boundary.
- [ ] Reconcile result commitment, cancellation, backend switching, and freeze with the command/undo specification.
- [ ] Update generated-versus-frozen project and UX semantics.
- [ ] Update the UI/UX specification with exact/numerical/frozen/stale/cancelled states.
- [ ] Add matching accessible semantic roles and noncolor design-system rules.
- [ ] Externalize rational, PRNG, stable-ID, project, graph, and provenance golden fixtures.
- [ ] Add JSC differential-oracle tests.
- [ ] Add the DR-15 benchmark manifest, runners, and result registry.
- [ ] Update FR-07 with the exact backend/conformance matrix.
- [ ] Update FR-08 with repetition, p95, hardware, memory, cancellation, and adoption-gate decisions.
- [ ] Update AGL-010/011/012/020/023/024/025/027/041/133/136/143/146/147.
- [ ] Update each affected lab specification with its exact or numerical conformance class.
- [ ] Add Swift bigint dependency evaluation before exact native implementation.
- [ ] Update MIDI/MusicXML export rules for generated numerical material.
- [ ] Add reviewed user-facing copy for exactness and reproducibility claims.
- [ ] Register this packet and its ADR/source links in the AGL research evidence registry.

# Integration Payload

**DR-15 disposition:** adopt a **conformance-first selective core**. Normative cross-platform truth is the accepted project schema, migrations, formal mathematical/behavioral contracts, language-neutral fixtures, project compatibility corpus, deterministic vectors, numerical profiles, and benchmark manifests. TypeScript remains the executable browser reference through semantic stabilization but is subordinate to those artifacts. Swift implements only accepted native requirements behind `AGLCoreBackend`. JavaScriptCore is a pinned test/debug oracle, not the production runtime. Rust native+Wasm and Swift native+Wasm remain shadow candidates; no production migration is currently justified because the required AGL hardware benchmarks do not exist. 
**Program rationale:** AGL-002/003/004/005/006/008 and the browser foundation are complete; AGL-143’s Swift contract spike is complete; AGL-146 is ready. Project schema/migrations and production operator/graph/evaluator/cache/budget semantics remain ready rather than accepted. AGL-147 is a P2 research-gated native proof, and M7 is explicitly stretch. Staffing assumes two product engineers. 
**Authority precedence:** accepted schemas/ADRs/formal contracts > versioned language-neutral fixtures > accepted property/metamorphic laws > TypeScript executable reference > Swift/JSC/Rust/Swift-Wasm implementations. A TypeScript conflict with a higher authority is a defect; fixture changes require semantic-version/project-compatibility review.

**Exact rational contract:** rational \(q=(n,d)\), \(n\in\mathbb Z\), \(d\ne0\); normalize with \(g=\gcd(|n|,|d|)\), sign in numerator, denominator positive, components coprime, zero exactly `0/1`; denominator zero is a structured error. Equality/order use arbitrary-precision cross products. Wire = `{numerator: canonical-decimal-string, denominator: positive-canonical-decimal-string}`; numerator regex `^(0|-?[1-9][0-9]*)$`; denominator regex `^[1-9][0-9]*$`; reject `-0`, leading zero, plus sign, decimal/exponent, whitespace. JSON numbers are not used for arbitrary-size components. ECMAScript BigInt is arbitrary precision; RFC 8259’s exact broadly interoperable integer range reflects binary64 limits; RFC 8785 recommends string wrapping for numbers outside ordinary JSON ecosystems.

**Deterministic generation:** project/provenance records carry `algorithmId`, `algorithmVersion`, `seedEncodingVersion`, canonical seed, and `streamId`. Same descriptor + canonical inputs + operator/budget semantics ⇒ exact same random words, bounded samples, permutations, stochastic decisions, stable IDs, and exact digest. The algorithm, overflow, word width, bounded sampling, rejection behavior, shuffle order, stream derivation, and ID namespace must be externally specified. Do not invent a new algorithm; extract AGL-005 vectors. No canonical use of platform/default RNG, time, device identity, or hash-map iteration.

**Conformance classes:** `exact` requires canonical equality for integers/rationals/IDs/enums/graph topology/Euclidean/accepted CA/project migrations/cache keys/provenance/discrete decisions/errors. `profileNumeric` uses a versioned relation over finite classification, checkpoints, absolute/relative/ULP bounds, operation/FMA/fast-math policy, subnormals, NaN, signed zero, and downstream branches. DR-15 supplies no valid numeric tolerance. WebAssembly permits multiple NaN outcomes outside its deterministic profile. `renderOnly` covers backend audio realization whose logical plan can be equivalent while PCM is not necessarily bit-identical.

**Numerical branch rule:** tolerance alone is invalid where floats feed thresholds, quantizers, event creation, topology, constraints, or stable-ID branches. Such boundaries require canonical pre-branch rounding, exact/fixed-point representation, one canonical implementation, or persistence of the exact branch decision. Lorenz one-million-step conformance compares accepted profile/checkpoints/final state/quantized outputs; byte-identical trajectories are not promised. Raw floating cache results include backend/build identity until profile canonicalization exists. Frozen numerical outputs preserve exact user-visible material plus lineage.

**Project/persistence:** canonical projects persist schema/migration/operator/PRNG/stable-ID/budget/numerical-profile semantics; they do not persist `rust-wasm`, `swift`, `jsc`, compiler/device/library paths, or backend artifact IDs. Preserve `sourceBytes/sourceDigest` separately from normalized `semanticModel/semanticDigest`. Semantic provenance stores source/operator/version/seed/profile/lineage; execution provenance stores backend/build/compiler/OS/browser/device/artifact hash/metrics. Exact/cache-canonical keys exclude backend; raw profile-equivalent FP keys include backend/build.

**Runtime boundary:** host owns graph compilation, scheduling, progress, cancellation, cache, budgets, error policy, project mutation, and result commitment. Kernels are pure immutable request→result services. `CoreRequestEnvelope` includes protocol/semantic versions, request/generation IDs, operation, conformance class, numerical/budget profile, payload encoding/buffer. `CoreResultEnvelope` includes matching identities, terminal status, payload/provenance buffers, warnings/errors/metrics. Swift exposes `AGLCoreBackend: Sendable` behind a concurrency façade; foreign handles remain private. Initial foreign core handles are thread-confined; parallelism uses multiple handles or a later explicit thread-safe contract.

**Optional ABI:** opaque `AGLCore`/`AGLCancel`; `agl_core_abi_version`; create/destroy; cancel create/request/destroy; one bounded input buffer; library-owned result/error buffers; explicit free; no callbacks; no retained host pointers; no exceptions/panics across ABI; stable error codes; protocol/version checks; request size/budget validation. Prefer handwritten C ABI + Swift façade for prototype; UniFFI currently documents partial Swift 6 support and async `Sendable` gaps.

**Cancellation:** states `queued|running|cancelRequested|completed|failed|cancelled|hardCancelled`; exactly one terminal state; cancel idempotent; monotonic progress; stale generation discarded; cancellation does not mutate project or create undo; partial output nonpersistable unless explicitly versioned. Worker `postMessage` is queued and nonpreemptive. Portable strategy = bounded chunks/yields; optional isolated fast path = SAB atomic polling; hard deadline fallback = terminate disposable worker, invalidate worker caches/continuations, emit `hardCancelled`. `ArrayBuffer` payload ownership should be transferred rather than cloned where possible.

**Command/generated/frozen:** evaluation result is provisional until current generation/profile/version validation and host command commitment. Backend switch is session/runtime state, not edit/undo. Cancel is not undo. Generated objects retain graph/source/version/seed/profile identity and stale/current state. Frozen objects materialize bounded output, semantic digest, exact lineage, profiles, and optional execution provenance; later generator edits do not change frozen content.

**Audio boundary:** `project/graph/domain kernels/provenance → background evaluation → immutable bounded AudioRenderPlan → prevalidated/preallocated event/control buffers → real-time callback`. Zero domain-core/JSC/BigInt/graph/provenance/lock/file/network/dynamic decode calls on real-time callback. Rust may accelerate plan generation, not bypass this boundary. Real-time and offline consume the same semantic plan; DR-03 owns PCM tolerance. Apple documents real-time rendering as nonblocking and warns against allocation, file/network I/O, Objective-C messaging, and potentially blocking APIs.

**JSC policy:** compile pure TS reference into pinned bundle; hash/version in test manifest; data-only request/result bridge; isolated VM per concurrent test lane if required; no arbitrary native-object exports; debug/XCTest only; production may omit; no remote semantic updates. One JSVirtualMachine serializes access across threads; App Review 2.5.2 restricts downloading/executing code that changes functionality. JSC is not an independent mathematical oracle and does not represent every browser engine.

**Future candidates:** Rust has supported ARM64 iOS and browser Wasm targets, `num-bigint`, `wasm-bindgen`, and XCFramework packaging paths, but adds Cargo/Wasm/iOS packaging/FFI/debugging/ownership/maintainer burden. Swift/Wasm supports JS interop, async, and multithreading; BridgeJS is experimental and Swift Numerics lacks current arbitrary-precision integers. Both enter a future empirical bakeoff; neither is assumed. 
**Readiness gates before bakeoff:** AGL-010/011 accepted; AGL-020–025 accepted; AGL-146 accepted; FR-07/08 complete; relevant lab fixture accepted; DR-09/AGL-120 accepted if Penrose included; AGL-147 ready to execute.

**Provisional material-problem triggers:** at least two production workload budget breaches after ordinary optimization, with a one-critical-release-blocker override; or duplicated TS/Swift semantics consuming approximately `≥20%` of domain/runtime capacity for two milestones; or repeated escaped correctness/project-compatibility defects despite fixtures. FR-07/program governance must define capacity denominator and qualifying defect severity.

**Provisional prototype proof:** `100%` exact-domain conformance; `100%` accepted project corpus compatibility; accepted FP profile; approximately `≥1.5×` end-to-end improvement including FFI/transfer or `≥30%` peak-memory reduction; approximately `≥25%` relevant user-critical-path reduction; no p95 cancellation/startup/audio-safety/Swift-concurrency regression; accountable maintainer. These values are policy defaults for FR-08 review, not research-established constants.

**Benchmark status:** no evidence-grade AGL performance results. Required suite = `1,000,000` rational operations; accepted Euclidean corpus; recursive motif at `90–100%` budget; `1,000,000` accepted Lorenz RK4 steps; large accepted CA grid (`4,096×4,096` only a proposal); DR-09 Penrose corpus; graph cancellation at `10%/50%/90%`; project codec/migrations; `1,000,000` realistic provenance records. Conformance precedes timing. Record cold/warm, median, p95, MAD, peak memory, result digest, environment, artifact/fixture hashes. DR-15 proposes `10` cold, `5` warmup, `30` warm runs; FR-08 should increase repetitions before p95 becomes a strong release gate. 
**Device protocol:** fixed macOS Safari/Chromium/Firefox; iPad Safari at proposed A16-class floor and M3-class representative device; physical native iPad on the same classes; optional high-end ceiling. Record exact model/OS/browser/toolchain/build/thermal/isolation state. Device class is benchmark metadata, not project semantics.

**ROM, ±50%:** TS+full Swift parity `58–105` person-days; shared Rust `81–141`; production JSC `31–56`; shared Swift/Wasm `77–136`; recommended semantic/fixture/boundary work now `16–30`. These are planning comparisons, not implementation commitments.

**Staged migration if triggered:** A—semantic freeze and external fixtures; B—shadow Rust native/Wasm plus Swift/Wasm for rational/RNG/Euclidean, `100%` conformance before timing; C—shadow recursive/CA/Lorenz/Penrose/provenance after their semantics stabilize; D—optional Rust/Wasm worker accelerator with TS fallback at least one milestone; E—optional Rust native XCFramework behind Swift façade; F—graph evaluator reconsidered only if graph throughput or duplicated graph semantics is itself material. Never migrate project migrations, command bus, graph-editor state, or audio scheduling simply because a systems core exists.

**ADR set:** DR15-01 contract-first semantics; DR15-02 exact arithmetic/generation wire; DR15-03 host-owned orchestration/pure kernels; DR15-04 cooperative cancellation/hard fallback; DR15-05 real-time audio isolation; DR15-06 JSC oracle-only/no remote semantic code; DR15-07 versioned narrow ABI; DR15-08 evidence-gated adoption; DR15-09 deferred numerical profile.

**Critical cross-run reconciliation:** DR-03 owns render-plan publication/audio equivalence; DR-12 owns native host/document/audio architecture; DR-14 owns commit/undo transaction semantics; DR-07 owns Lorenz solver/profile; DR-08 owns numerical-to-discrete branch semantics; DR-02 owns Euclidean convention; DR-05/06 own recursive/CA production fixtures; DR-09 owns Penrose corpus; DR-13 owns accessible exact/numerical/frozen semantics; FR-07/08 own conformance and empirical thresholds.

**Principal unresolved risks:** no benchmark results; Swift bigint unselected; numerical profile unset; JSC not independent oracle; p95 sample count weak; SAB hosting dependency; provenance batch undefined; backend-neutral raw-FP caching unsafe; shared source does not guarantee float identity; App Review concern applies to remote feature-changing code rather than fixed JSC use; one severe workload needs override; capacity/defect triggers need operational definitions; real-time/offline plan equality does not imply PCM equality.

#AuralGeometryLab #CrossPlatformArchitecture #DeterministicComputing #TypeScript #Swift #Rust #WebAssembly #JavaScriptCore #ADR #ConformanceTesting

**Estimated conversation token usage:** approximately 270k–300k tokens.