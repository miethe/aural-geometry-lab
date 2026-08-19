# Cross-Platform Core Strategy for Aural Geometry Lab

**Current date:** 2026-08-18  
**Program snapshot evaluated:** 2026-08-14  
**Research charter:** DR-15

## Executive conclusion and program context

**TL;DR**

Aural Geometry Lab should **not migrate its core to Rust, JavaScriptCore, or Swift/WebAssembly now**. The project has not yet reached the domain-stability point specified by the charter itself: exact time, deterministic IDs, initial mathematical kernels, and a Swift portable-contract spike exist, but the project schema/migrations and graph compiler/evaluator/cache/budget spine are not yet complete, Penrose remains research-gated, and the native iPad architecture is explicitly a stretch milestone. fileciteturn0file0 fileciteturn0file3

The best architecture discovered is a **conformance-first split core**:

> **Share semantics as contracts, fixtures, schemas, and wire formats now; share implementation only where later evidence proves it valuable.**

Keep TypeScript as the browser reference implementation. Implement the limited native semantics required by the iPad proof in Swift. Use the already-planned cross-platform golden fixtures as the enforcement mechanism. Keep JavaScriptCore as a **development/test oracle**, not the production runtime. Introduce Rust only behind coarse-grained kernel interfaces after real AGL benchmarks establish a material compute or semantic-maintenance problem. Also put **shared Swift compiled to WebAssembly** into that future bakeoff: Swift/Wasm has become materially more credible in 2026 and eliminates native Rust FFI, although its arbitrary-precision integer story and browser tooling are currently weaker than Rust's. citeturn24search0turn24search15turn18search0

That recommendation is not an argument against Rust. Rust is probably the **strongest technical candidate if AGL eventually needs a single implementation of compute-heavy exact kernels**. It has mature arbitrary-size integer support through `num-bigint`, supported WebAssembly and ARM64 iOS targets, and an active Wasm binding ecosystem. citeturn13search1turn15search0turn15search6turn22search0 The problem is timing: no supplied AGL source tree or target-device benchmark presently demonstrates that those strengths outweigh a second toolchain, two FFI surfaces, more CI packaging, and a new contributor skill requirement.

The current program state makes premature consolidation especially expensive. AGL already has exact rational musical time, deterministic seed/stable-ID utilities, initial mathematical kernels, and fourteen core tests complete. More importantly, **AGL-143 is already done**: a compile-tested Swift portable-contract spike decodes project/selection contracts and passes shared conformance fixtures. AGL-146, which expands those cross-platform golden fixtures, is ready. That means the program has already validated the central mechanism needed to make behaviorally equivalent native code viable without prematurely sharing implementation. fileciteturn0file0

By contrast, much of the semantic surface that a shared core would have to freeze is still in front of the team. Project schema and migrations are ready but not done; executable operator contracts, graph compilation, worker evaluation, deterministic cache, and evaluation budgets are likewise ready but not done. The native iPad proof, AGL-147, is research-gated by DR-12 and DR-15 and only asks for a Euclidean document round trip, native audio, editing/saving, and shared fixtures—not complete native parity. fileciteturn0file0 DR-15 itself is categorized as **stretch architecture**, and M7 is explicitly a stretch milestone after the browser MVP path. fileciteturn0file4 fileciteturn0file3

The staffing context is decisive. The program assumes **two product engineers**, with M1–M6 still carrying the browser/runtime/audio/lab roadmap. fileciteturn0file3 A premature full-core migration would compete directly with the work needed to stabilize the very semantics that would make migration measurable.

**Decision today:**

| Question | Decision |
|---|---|
| Replace TypeScript with Rust now? | **No** |
| Build complete duplicate Swift core now? | **No** |
| Use JavaScriptCore as the shipping native core? | **No** |
| Continue TypeScript reference + constrained Swift implementation? | **Yes** |
| Make schemas, test vectors, semantics, serialization, RNG, and benchmark fixtures platform-neutral? | **Yes, immediately** |
| Use JavaScriptCore in native differential/conformance tests? | **Yes** |
| Prototype Rust before a migration decision? | **Yes, after the semantic/benchmark prerequisites are met** |
| Include Swift/Wasm in that prototype bakeoff? | **Yes** |
| Move real-time audio execution into any domain core? | **No** |

This aligns directly with the program's own frontier process: FR-07 calls for cross-platform conformance expansion before the native spike, while FR-08 calls for performance workload and budget design before optimization. fileciteturn0file1

## Architecture comparison

The matrix below is an **architectural assessment, not benchmark data**. `++` means a natural strength; `+` means a good fit with manageable work; `±` means a material caveat; `–` means a poor fit for AGL's constraints; `?` means the answer must come from the AGL benchmark suite.

| Evaluation dimension | TypeScript + Swift parity | Shared Rust: Wasm + native | Embedded JavaScriptCore | Shared Swift + Wasm | Conformance-first selective core |
|---|---|---|---|---|---|
| Exact rationals / arbitrary integers | `+` JS has BigInt; Swift needs another implementation | `++` one `BigInt` implementation | `++` same JS BigInt semantics | `±` Swift lacks first-party arbitrary BigInt | `++` exact contract; migrate kernel only if useful |
| Seeded deterministic generation | `+` two implementations, shared vectors | `++` one implementation | `++` reuse reference source | `++` one implementation | `++` versioned PRNG + golden vectors |
| Floating-point reproducibility | `±` two compilers/runtimes | `+` one source, but Wasm/native targets can still differ | `±` browser engine versus embedded JSC | `+` one source, two code generators | `+` explicit FP conformance profile |
| Graph evaluation | `++` natural host implementation | `+` good once ABI is coarse | `±` runtime/bridge coordination | `+` viable but newer browser stack | `++` keep orchestration host-native |
| Cancellation | `++` native Worker/Swift integration | `+` needs atomics/chunking across boundaries | `±` long JS calls are awkward to preempt | `+` same browser constraints as other Wasm | `++` cancellation stays host-controlled |
| Serialization/versioning | `+` shared schema needed | `+` still needs language-neutral contract | `++` can reuse JS codec | `+` still needs portable project format | `++` explicitly contract-owned |
| Provenance throughput | `+` good if batched | `++` strong packed-data candidate | `±` per-object JS/native bridging is unattractive | `+` potentially strong | `++` packed batches only where measured |
| Wasm/native FFI burden | `++` none inside each platform | `±` JS↔Wasm **and** Swift↔C/Rust | `±` Swift↔JS bridge | `+` JS↔Wasm only; native is direct Swift | `+` FFI only for extracted hot kernels |
| Browser Worker integration | `++` native fit | `++` good fit inside worker | N/A for native | `+` viable, younger tooling | `++` TS worker remains control plane |
| Audio-thread boundary | `++` if render plan is precomputed | `+` only if Rust stays off RT path | `–` JS runtime should not be on RT path | `+` still keep domain work off RT path | `++` explicit precomputed render-plan boundary |
| Debugging/tooling | `++` excellent per platform | `±` cross-language/Wasm debugging | `+` Safari Web Inspector exists | `±` native excellent; Wasm younger | `++` ordinary TS/Swift debugging first |
| Packaging/CI | `+` two conventional stacks | `–` Cargo + Wasm + Apple binary packaging | `+` JS asset + native bridge | `±` Swift/Wasm browser pipeline still evolving | `+` simple until evidence justifies more |
| Swift concurrency | `++` native Swift | `±` wrapper required; UniFFI Swift 6 support partial | `±` JSC VM serialization affects design | `++` same language, especially native | `++` Swift façade remains concurrency owner |
| Security / exposed bridge surface | `+` small native API | `+` small C ABI possible | `±` dynamic runtime and exported-native-object surface | `+` typed bridge possible | `++` minimum necessary runtime surface |
| Binary / app size | `+` likely uncomplicated | `?` measure Rust library and Wasm artifacts | `?` measure bundled JS/bridge | `?` measure Swift Wasm payload | `+` no extra runtime until justified |
| Contributor skill burden | `±` duplicate semantics | `–` adds Rust, Wasm and FFI expertise | `+` leverages existing TS knowledge | `±` Swift across platforms but new Wasm tooling | `++` lowest immediate burden |
| Semantic-drift risk | `–` inherent unless fixtures are excellent | `++` one implementation | `++` same reference source | `++` one implementation | `+` duplication is constrained and tested |
| Large recursion/geometry/CA | `+/?` benchmark dependent | `++/?` strongest candidate | `?` entirely device-dependent | `+/?` credible challenger | `++` extract only demonstrated bottlenecks |
| Long chaos workloads | `+/?` numerical contract matters more than language | `++/?` compute-friendly, same source | `?` device-dependent | `+/?` plausible | `++` shared only if reproducibility/perf requires it |
| Cold start | `++` no extra runtime in web/native | `?` Wasm instantiation/native library cost | `?` JS parse/runtime initialization | `?` Wasm startup cost | `++` baseline stays simple |
| Memory | `+/?` ordinary managed heaps | `++/?` potential data-layout advantage | `?` JS heap + bridge needs measurement | `+/?` needs device measurement | `++` optimize measured hot paths only |

**Exact arithmetic is a real Rust advantage, but not yet a migration argument.** ECMAScript BigInt represents arbitrary-size integers with mathematically exact integer operations. citeturn16search6 Apple also exposes BigInt functionality through JavaScriptCore's C API. citeturn14search4 Rust's `num-bigint` provides `BigInt`/`BigUint` and portable Serde representations. citeturn13search1 Swift is the outlier: Apple's Swift Numerics still lists arbitrary-precision integers under **future expansion**, rather than as a current module. citeturn18search0 A pure Swift implementation therefore needs a third-party arbitrary-integer dependency or an AGL-owned implementation.

That disadvantage also applies to the newly discovered **shared Swift/Wasm** architecture. Swift for WebAssembly has advanced substantially: JavaScriptKit supports Swift↔JavaScript interaction, promises/`async` and multithreading, while its newer BridgeJS layer can generate typed Swift/TypeScript bridging. However, BridgeJS is explicitly described as experimental and JavaScriptKit now requires Swift 6.3. citeturn24search0 Swift/Wasm development is active enough that the Swift community reported production use of shared Swift/WebAssembly code in Goodnotes in June 2026. citeturn24search15 That makes Swift/Wasm **too credible to exclude from a future bakeoff**, but not mature enough—and not strong enough on arbitrary precision—to justify rewriting AGL's existing TypeScript core today.

**Rust's integration path is technically viable but operationally nontrivial.** Rust has Tier-2 ARM64 iOS/iPadOS and simulator targets that cross-compile against Xcode's SDKs. citeturn15search6 Its `wasm32-unknown-unknown` target is also Tier 2 and intended for browser/JavaScript environments, although OS-dependent pieces of `std` do not work there. citeturn15search0 `wasm-bindgen` remains active, with release 0.2.114 published February 27, 2026. citeturn22search0 The Apple side can be packaged as a static library/XCFramework and consumed through Swift Package Manager; Apple explicitly supports multiplatform static or dynamic libraries inside XCFrameworks. citeturn14search0turn14search6

I would **not make UniFFI the foundational concurrency boundary** for AGL at this point. UniFFI describes its Swift binding support as production quality generally, but its current documentation still labels Swift 6 support partial and specifically notes rough edges around generated async code and `Sendable`. citeturn14search5 AGL's likely Rust interface is small enough that a deliberately narrow C ABI plus a handwritten Swift façade is preferable: less generated machinery, easier ownership rules, easier cancellation plumbing, and no need to mirror the whole Rust object model into Swift.

**JavaScriptCore solves semantic duplication better than it solves native architecture.** Apple explicitly supports evaluating JavaScript from Swift/C and allows contexts to be inspected with Safari Web Inspector. citeturn14search2turn14search3 But threads using the same `JSVirtualMachine` serialize: Apple says other threads attempting to use the same VM must wait, and recommends separate VMs for concurrent execution. citeturn14search1 That is an awkward foundation for concurrent graph evaluations, cancellation, native ownership, and high-throughput provenance. It is, however, nearly ideal as a **differential testing oracle**: compile the pure TypeScript reference core to JS, run that bundle in JSC from XCTest, and compare Swift/Rust results against it.

One common iOS assumption should deliberately **not** be built into the ADR: I did not find a sufficiently authoritative current Apple guarantee about the JIT characteristics of an app-created `JSContext` that would justify assuming either JIT-grade performance or interpreter-only performance. For DR-15, embedded-JSC compute speed therefore belongs in the hardware benchmark column marked `?`, not in an architectural argument.

## Portable semantic contract and interface boundaries

The architecture should treat **project format and behavioral semantics as the shared product**, rather than an implementation language.

```text
                                Shared semantic layer
              ┌────────────────────────────────────────────────┐
              │ JSON Schema + migrations fixtures              │
              │ rational / seed / ID / operator specifications │
              │ golden input/output vectors                    │
              │ project compatibility corpus                   │
              │ benchmark manifest + expected digests          │
              └───────────────┬────────────────┬───────────────┘
                              │                │
                       Browser runtime    Native runtime
                              │                │
                       Dedicated Worker   Swift CoreRuntime
                              │                │
                    TypeScript reference  Swift implementation
                              │                │
                     ┌────────┴──────┐   ┌─────┴───────────┐
                     │ optional      │   │ optional        │
                     │ Rust/Wasm     │   │ Rust C ABI      │
                     │ hot kernels   │   │ hot kernels     │
                     └───────────────┘   └─────────────────┘

                    Debug / CI native differential oracle
                              Swift ↔ JSC
                                 │
                      compiled TS reference bundle

        Evaluation outputs → immutable/bounded AudioRenderPlan → RT audio path
        The domain core never executes on the real-time audio callback.
```

**The portable contract should include five things that are currently more important than sharing source code.**

First, exact rationals need one canonical definition: numerator and denominator are arbitrary-precision signed/positive integers respectively; denominator is strictly positive; numerator/denominator are reduced by GCD; zero canonicalizes to `0/1`; division by zero is an error. On the project wire, represent the integers as **decimal strings**, for example:

```json
{
  "numerator": "-123456789012345678901234567890",
  "denominator": "960"
}
```

This avoids relying on JSON implementations agreeing on integers beyond binary64's exactly interoperable range. RFC 8259 notes that ordinary JSON implementations reliably agree on integer numeric values only within roughly ±2^53, and RFC 8785 specifically recommends wrapping numbers requiring greater integer precision in JSON strings. citeturn17search0turn17search1 If AGL needs byte-canonical project material for content addressing, RFC 8785/JCS is a reasonable canonicalization profile **after** large integers have been represented as strings. citeturn17search1

Second, deterministic generation should be defined as a protocol, not “whatever the standard library RNG does”:

```text
algorithm: agl-prng-v1
seed wire representation: fixed canonical string
state transition: fully specified
integer sampling: fully specified
shuffle/permutation: AGL algorithm, fully specified
golden vectors:
  seed -> first N words
  seed + corpus -> output digest
```

The actual PRNG algorithm can remain the existing AGL-005 algorithm if it is already suitable; changing it is unnecessary. A project that depends on generated results should persist the PRNG/version identifier so future implementations know what semantics they must reproduce. AGL-005 already has deterministic fixtures, so the task is to promote those fixtures into a cross-language normative corpus rather than design a second RNG. fileciteturn0file0

Third, floating-point behavior needs a **declared reproducibility profile**, because “same source language” does not by itself mean “same floating-point bitstream on every target.” WebAssembly's current numeric specification uses IEEE-754 floating-point and round-to-nearest/ties-to-even, but allows nondeterminism in details such as NaN payload propagation. citeturn16search4 For AGL, I recommend:

| Value class | Required cross-platform guarantee |
|---|---|
| Exact time/rational arithmetic | Mathematically exact |
| Stable IDs, seeds, graph topology | Exact |
| Integer/rational operator output | Exact |
| Euclidean/CA discrete state | Exact |
| Persisted scalar `Double` parameters | Exact binary64 round-trip |
| Ordinary finite geometry transforms | ULP/tolerance contract unless explicitly promoted to exact |
| Lorenz raw trajectory | Numerical-conformance contract, **not casually assumed bit-identical** |
| Decisions derived from chaos | Quantize explicitly before branch/ID decisions |
| Frozen trajectory/content | Persist materialized result if exact later replay matters |

The important design rule is: **never make persistent identity or graph structure depend on insignificant raw floating-point differences.** AGL-112 already anticipates an explicit sample→normalize→smooth→quantize→constrain control pipeline, which is exactly the right architectural seam for chaos-derived decisions. fileciteturn0file0 If product requirements eventually demand bit-identical million-step Lorenz trajectories across web and native, that becomes a genuine shared-core trigger; even then the build must define an appropriate strict floating profile rather than assuming one source file is sufficient.

Fourth, the project codec should remain **outside a future Rust accelerator** at first. The migration framework explicitly needs deterministic sequential migrations and source-byte preservation. fileciteturn0file0 Those are compatibility concerns, not hot numerical kernels. A Rust computation layer should initially receive a normalized, current-version evaluation request rather than arbitrary historical project JSON:

```text
project bytes
   ↓
host schema validation
   ↓
host sequential migrations
   ↓
normalized ProjectSnapshot / CompiledPlan
   ↓
optional shared compute core
```

This keeps Rust replaceable and prevents the persistent file format from becoming hostage to a particular FFI layer.

Fifth, **FFI must be coarse**. Do not expose `Rational`, `Event`, `GraphNode`, or `ProvenanceRecord` as chatty foreign objects. The conceptual native ABI should look more like this:

```c
typedef struct AGLCore AGLCore;
typedef struct AGLCancel AGLCancel;

typedef struct {
    uint8_t *data;
    size_t len;
    size_t capacity;
} AGLBuffer;

AGLCore *agl_core_create(
    const uint8_t *config,
    size_t config_len
);

int32_t agl_core_evaluate(
    AGLCore *core,
    const uint8_t *request,
    size_t request_len,
    const AGLCancel *cancel,
    AGLBuffer *result
);

int32_t agl_core_expand_motif(
    AGLCore *core,
    const uint8_t *request,
    size_t request_len,
    const AGLCancel *cancel,
    AGLBuffer *result
);

int32_t agl_core_ca_batch(
    AGLCore *core,
    const uint8_t *request,
    size_t request_len,
    const AGLCancel *cancel,
    AGLBuffer *result
);

void agl_buffer_free(AGLBuffer buffer);
void agl_core_destroy(AGLCore *core);
```

That is intentionally boring. Large requests and results cross once. Provenance should cross as a versioned packed batch or structure-of-arrays representation with a string/ID table, not as one foreign-language callback per record.

On the Swift side, the public application interface stays idiomatic and concurrency-safe:

```swift
public protocol AGLCoreBackend: Sendable {
    func evaluate(
        _ request: EvaluationRequest,
        cancellation: AGLCancellation
    ) async throws -> EvaluationResult
}

public actor AGLCoreRuntime {
    private let backend: any AGLCoreBackend

    public init(backend: some AGLCoreBackend) {
        self.backend = backend
    }

    public func evaluate(
        _ request: EvaluationRequest
    ) async throws -> EvaluationResult {
        let cancellation = AGLCancellation()

        return try await withTaskCancellationHandler {
            try await backend.evaluate(
                request,
                cancellation: cancellation
            )
        } onCancel: {
            cancellation.cancel()
        }
    }
}
```

The implementation can be `SwiftCoreBackend`, `RustCoreBackend`, or even a `JSCReferenceBackend` in test targets without changing application code. Swift 6's strict concurrency checking is intended to detect data-race hazards at compile time, so keeping the FFI behind a small `Sendable` façade is preferable to distributing foreign handles throughout the UI/runtime. citeturn18search3

Browser cancellation needs similar discipline. Worker messages are queued tasks; the HTML Standard explicitly notes that message delivery does **not interrupt a currently running task**. citeturn23search3 Therefore a 500 ms synchronous TS or Wasm kernel cannot be made responsive merely by sending it a `"cancel"` message. AGL has two valid patterns:

```text
Cross-origin isolated:
    SharedArrayBuffer + atomic cancellation flag
    kernel polls flag at bounded work intervals

Fallback:
    process workload in bounded chunks
    return/yield to Worker event loop between chunks
    consume cancel/progress messages
```

The HTML Standard permits a Window and its dedicated worker to share `SharedArrayBuffer` memory within the appropriate isolated agent cluster and restricts shared-memory serialization when cross-origin isolation is not available. citeturn23search0turn23search1turn23search5 Ordinary `ArrayBuffer`s can also be transferred rather than cloned, which should be used for large result/provenance buffers. citeturn23search2turn23search4

This same cancellation problem makes JSC less appealing as the production native graph runtime: an iPad evaluation executing inside one `JSVirtualMachine` cannot rely on another thread freely entering that same VM, because Apple serializes access to a VM. citeturn14search1 Cooperative chunking or isolated VMs can work, but at that point Swift-native orchestration is the cleaner architecture.

Finally, **none of these cores belongs on the audio render callback**. Apple says device rendering can occur on a real-time thread and that blocking calls must be avoided; its lower-level guidance explicitly calls out memory allocation, Objective-C messaging, file/network I/O, and potentially blocking operations as unsuitable for real-time render logic. citeturn19search1turn19search4 AGL should therefore enforce:

```text
domain graph / recursion / chaos / BigInt / provenance
                      ↓
             background evaluation
                      ↓
             AudioRenderPlan
                      ↓
      preallocated event/control buffers
                      ↓
             real-time audio thread
```

That design largely removes “audio performance” as a reason to put the whole domain core in Rust. Rust may improve **plan generation**, but the real-time consumer should already be bounded, allocation-free, and independent of TypeScript/Rust/JSC object models.

## Benchmark evidence and reproduction protocol

There is an important distinction between **research evidence** and **benchmark results** here.

The uploaded program materials contain backlog, milestone, lab, and research metadata—not the AGL source repository. The connected GitHub installation did not expose an Aural Geometry Lab repository, and a public search did not locate the code. The available execution environment also did not provide an iPad device/browser measurement target or a Rust toolchain. I therefore did **not** substitute made-up implementations or unrelated Internet microbenchmarks and label those “AGL benchmarks.” That would violate the charter's burden-of-proof principle.

The defensible current benchmark result is thus:

> **The shared-core performance case is not established. Rust currently fails the burden-of-proof gate because the required AGL end-to-end measurements do not yet exist.**

Several required benchmarks are also semantically premature according to AGL's own backlog.

| Required workload | Program readiness | Evidence-grade DR-15 benchmark status |
|---|---|---|
| 1,000,000 rational operations | Exact rational implementation is done | Runnable once source/fixtures are available |
| Euclidean corpus | Initial kernel done; full evidence/convention task remains research-gated | Runnable against current fixture, rerun after convention corpus stabilizes |
| Recursive motif near budget | Fractal kernel exists, but budget/runtime hardening remains ahead | **Wait for accepted AGL-025/recursive fixture** |
| 1M-step Lorenz | RK4 preview migration started; DR-07 numerical profile still gates accepted semantics | **Do not use provisional semantics for architecture decision** |
| Large CA grid | Elementary CA preview migration started; richer-mode semantics still research-gated | Run current elementary fixture; rerun after accepted profile |
| Penrose patch | Penrose implementation and exact generator are research-gated by DR-09 | **Blocked by design, as charter anticipated** |
| Graph evaluation with cancellation | Worker evaluator AGL-023 is ready, not done | **Blocked until actual evaluator exists** |
| Project encode/decode | Full schema/migration AGL-010/011 are ready, not done | **Blocked until project format stabilizes** |
| Provenance allocation | Provenance belongs in AGL-020/runtime work; production path not yet complete | **Blocked for representative throughput measurement** |

Those states follow directly from the backlog and lab manifest. fileciteturn0file0 fileciteturn0file2 In particular, Penrose is still research-gated, while Lorenz, CA, and fractal are computational previews rather than accepted final implementations. fileciteturn0file2 This is exactly why the DR-15 mission says to wait for model stability.

**The benchmark harness should nevertheless be created now**, because defining it early prevents the later architecture choice from being shaped around whichever implementation happens to win a convenient microbenchmark.

A recommended normative benchmark manifest is:

```json
{
  "schema": "agl.dr15.benchmark",
  "schemaVersion": 1,
  "protocolVersion": "agl-core-semantics-v1",
  "measurement": {
    "coldRuns": 10,
    "warmups": 5,
    "warmRuns": 30,
    "report": ["median", "p95", "mad", "peakMemoryBytes"]
  },
  "kernels": [
    {
      "id": "rational-1m",
      "fixture": "fixtures/rational-1m.json",
      "expected": "fixtures/rational-1m.expected.json"
    },
    {
      "id": "euclidean-corpus",
      "fixture": "fixtures/euclidean-corpus.json",
      "expected": "fixtures/euclidean-corpus.expected.json"
    },
    {
      "id": "recursive-near-budget",
      "fixture": "fixtures/recursive-near-budget.json",
      "expected": "fixtures/recursive-near-budget.expected.json"
    },
    {
      "id": "lorenz-rk4-1m",
      "fixture": "fixtures/lorenz-rk4-1m.json",
      "expected": "fixtures/lorenz-rk4-1m.expected.json"
    },
    {
      "id": "ca-large",
      "fixture": "fixtures/ca-large.json",
      "expected": "fixtures/ca-large.expected.json"
    },
    {
      "id": "penrose-patch",
      "fixture": "fixtures/penrose-dr09.json",
      "optionalUntil": "DR-09 accepted"
    },
    {
      "id": "graph-cancellation",
      "fixture": "fixtures/graph-cancellation.json"
    },
    {
      "id": "project-codec",
      "fixture": "fixtures/project-corpus/index.json"
    },
    {
      "id": "provenance-1m",
      "fixture": "fixtures/provenance-1m.json"
    }
  ]
}
```

Every backend should emit the same machine-readable result:

```json
{
  "backend": "rust-wasm",
  "backendVersion": "git-sha",
  "fixtureHash": "sha256:...",
  "environment": {
    "device": "...",
    "os": "...",
    "browser": "...",
    "compiler": "...",
    "buildMode": "release"
  },
  "kernel": "rational-1m",
  "coldMs": {
    "median": 0,
    "p95": 0
  },
  "warmMs": {
    "median": 0,
    "p95": 0
  },
  "peakMemoryBytes": 0,
  "resultDigest": "sha256:...",
  "conformance": "pass"
}
```

The individual workloads should be defined as follows:

| Kernel | Normative workload |
|---|---|
| Rational | Exactly 1,000,000 deterministic add/subtract/multiply/divide/compare/normalize operations, using the **real AGL operand-size distribution** once telemetry/traces exist; include pathological large numerators separately |
| Euclidean | Accepted AGL Euclidean golden corpus across pulses, steps, rotations and edge cases; result digest must match exactly |
| Recursive motif | Real motif fixture driven to 90–100% of accepted event/recursion budget without crossing it; record events/sec, ancestry allocation and cancellation |
| Lorenz | Exactly 1,000,000 accepted RK4 steps using DR-07 parameters; record first/periodic checkpoints, final state and trajectory digest according to the FP profile |
| CA | Existing elementary CA semantics over a large deterministic grid, e.g. a 4,096-cell row over 4,096 generations if accepted by FR-08; digest the complete logical state |
| Penrose | **Only** the DR-09/AGL-120 accepted reference corpus; no substitute tiling |
| Graph cancel | Production compiled graph with deterministic work units; request cancellation at 10%, 50%, and 90%; measure request→stop latency |
| Project codec | Small/medium/large real projects plus migration fixtures; encode, decode, validate, migrate, round-trip |
| Provenance | Allocate/materialize 1,000,000 representative provenance records at realistic ancestry depths; record records/s and bytes/record |

The `4,096 × 4,096` CA example above is a **proposed FR-08 workload**, not an existing requirement; FR-08 should ratify a scale based on actual project budgets. fileciteturn0file1 The same principle applies to exact cancellation-latency and memory budgets: DR-15 should define what is measured, while FR-08 should approve what counts as good enough.

For device coverage, use a **base A16 iPad as the floor**, an **M3 iPad Air as the representative mid-range device**, and optionally an M5 iPad Pro as a ceiling. Apple introduced the A16 iPad and M3 iPad Air in March 2025, and the M5 iPad Pro in October 2025. citeturn21search0turn21search2 The A16 floor matters more for the architecture decision than proving that a high-end M5 can brute-force the workload.

Recommended runs:

```text
Desktop browser
  macOS fixed hardware
  Safari
  Chromium
  Firefox
  release/minified build
  TypeScript
  Rust/Wasm
  Swift/Wasm candidate

iPad Safari
  A16 minimum target
  M3 Air representative target
  same browser benchmark page
  TypeScript
  Rust/Wasm
  Swift/Wasm candidate

Native iPad
  same A16 and M3 devices
  Swift
  Rust native
  JavaScriptCore
```

Record device model, OS build, browser version, thermal state if available, build/toolchain versions, core revision, fixture revision, and whether cross-origin isolation is enabled. Browser `ArrayBuffer`s used for large input/output should be transferred rather than cloned; the HTML Standard explicitly defines this transfer mechanism for worker communication. citeturn23search2turn23search4

A minimal reproduction driver could be:

```bash
#!/usr/bin/env bash
set -euo pipefail

OUT="${OUT:-bench-results/$(date -u +%Y%m%dT%H%M%SZ)}"
mkdir -p "$OUT"

# Contract tests must pass before any timing result is accepted.
pnpm test --filter agl-core
pnpm test --filter agl-conformance

# Browser implementations.
pnpm run bench:dr15:browser -- \
  --manifest bench/dr15/benchmark.json \
  --backend ts \
  --out "$OUT/browser-ts.json"

pnpm run bench:dr15:browser -- \
  --manifest bench/dr15/benchmark.json \
  --backend rust-wasm \
  --out "$OUT/browser-rust-wasm.json"

pnpm run bench:dr15:browser -- \
  --manifest bench/dr15/benchmark.json \
  --backend swift-wasm \
  --out "$OUT/browser-swift-wasm.json"

# Native XCTest/performance target, run on physical hardware.
: "${IPAD_UDID:?Set IPAD_UDID to a physical benchmark device}"

xcodebuild test \
  -scheme AGLCoreBench \
  -configuration Release \
  -destination "platform=iOS,id=${IPAD_UDID}" \
  -resultBundlePath "$OUT/native.xcresult"

pnpm run bench:dr15:summarize -- "$OUT"
```

For a Rust candidate, CI should pin Rust, `wasm-bindgen`, the Wasm optimizer/tooling, Xcode, and the Apple target matrix; iOS Rust targets require the corresponding Xcode SDK. citeturn15search6 For native packaging, build device and simulator static-library slices into an XCFramework and consume it behind a Swift package; that is an Apple-supported distribution shape. citeturn14search0turn14search6

For a Swift/Wasm candidate, pin Swift 6.3+ and JavaScriptKit/BridgeJS rather than following `main`; current JavaScriptKit explicitly requires Swift 6.3 and marks BridgeJS experimental. citeturn24search0

**Cold versus warm must not be conflated.**

Cold measurements include:

```text
TS: page/worker initialization + module loading
Rust/Wasm: above + Wasm fetch/compile/instantiate
JSC: context/VM construction + core JS parse/evaluation
Swift native: process/library initialization
Swift/Wasm: Wasm/runtime initialization
```

Warm measurements exclude one-time initialization and measure only steady-state kernel work. Report both; a Rust kernel that is 2× faster for a 3 ms operation but adds 50 ms of startup to the relevant interaction may be a product regression.

Memory should likewise be end-to-end: JavaScript heap plus Wasm memory for browser implementations, process resident/dirty memory on native, and maximum working set during near-budget recursion/CA/Penrose runs. Binary-size reporting should include compressed Wasm + glue for the web and the incremental stripped/archive size for native. **No numeric size assumption belongs in the ADR before those artifacts exist.**

## Migration cost and staged path

Because the actual source/package tree was not available, the table below uses **logical packages anchored to existing backlog responsibilities**, not invented claims about current directory names. Estimates are rough person-days for production-quality migration plus conformance, with approximately **±50% uncertainty** until the actual code is sized. They exclude ordinary feature work that would exist regardless of architecture.

| Logical package | Backlog anchors | TS + full Swift parity | Shared Rust | Production JSC | Shared Swift/Wasm | Recommended incremental work now |
|---|---|---:|---:|---:|---:|---:|
| Numeric core / rational / IDs / RNG | AGL-002, AGL-005 | 5–9 d | 7–12 d | 2–4 d | 8–14 d | 2–4 d |
| Domain/event/operator contracts | AGL-003, AGL-004, AGL-020 | 6–10 d | 8–14 d | 3–6 d | 8–14 d | 2–3 d |
| Project codec / migrations | AGL-010, AGL-011 | 7–12 d | 9–16 d | 4–7 d | 8–14 d | 2–4 d |
| Graph compiler/evaluator/cache/budgets | AGL-021–025 | 12–22 d | 18–30 d | 8–14 d | 16–28 d | 3–5 d |
| Mathematical kernels | AGL-006 plus labs | 12–24 d | 16–30 d | 3–6 d | 15–28 d | 2–4 d |
| Provenance / projection data | AGL-020, AGL-050 | 5–9 d | 7–12 d | 3–6 d | 7–12 d | 1–2 d |
| Audio render-plan adapter | AGL-041 | 3–5 d | 4–7 d | 2–3 d | 3–6 d | 1–2 d |
| Fixtures / conformance / build / CI | AGL-133, AGL-143, AGL-146 | 8–14 d | 12–20 d | 6–10 d | 12–20 d | 3–6 d |
| **Total ROM** | | **58–105 d** | **81–141 d** | **31–56 d** | **77–136 d** | **16–30 d** |

The totals explain why theoretical elegance is not enough. With two product engineers, 81–141 person-days of shared-Rust migration represents a substantial fraction of the available runtime engineering capacity before considering normal M1–M6 delivery. fileciteturn0file3 JSC looks inexpensive because it avoids reimplementation, but its lower migration cost buys permanent runtime/bridge constraints rather than removing complexity. Swift/Wasm avoids Rust on the native side but still requires moving a TypeScript-first codebase to a different implementation language and solving arbitrary-size integer support.

The recommended **16–30 person-days** are also not a throwaway spike. They produce assets the project needs under *every* future architecture: portable fixtures, serialization rules, FP profile, benchmark protocol, cancellation semantics, and backend interfaces. Much of that overlaps work already implied by AGL-133/143/146 and FR-07/08, so the true roadmap increment may be lower. fileciteturn0file0 fileciteturn0file1

Although the recommendation is not to adopt Rust now, the eventual Rust path should already be designed so that it **never invalidates existing TypeScript tests or projects**.

**Stage A — semantic freeze, no implementation migration**

Keep TypeScript authoritative. Promote existing exact-rational, deterministic-ID, Euclidean and operator tests into external language-neutral vectors. Complete AGL-010/011 and AGL-020–025. Complete AGL-146 and FR-07. Define the benchmark manifest and have FR-08 approve workload budgets. fileciteturn0file0 fileciteturn0file1

The critical rule is:

```text
TypeScript test semantics
       ↓
portable fixture corpus
       ↓
TS / Swift / Rust / JSC / Swift-Wasm all consume the same files
```

Do not rewrite test logic separately where an expected fixture can express the rule.

**Stage B — shadow shared-kernel prototype**

Implement only three low-ambiguity/high-signal candidates in Rust:

```text
exact rational arithmetic
deterministic RNG / stable-generation primitives
Euclidean corpus
```

Run Rust both as Wasm and native and require 100% conformance before measuring speed. Nothing ships. The TypeScript implementation remains authoritative.

In parallel, implement the same benchmark adapter using Swift/Wasm. This makes the later shared-core choice empirical rather than “Rust versus no Rust.”

**Stage C — compute-heavy shadow kernels**

After the relevant research profiles stabilize, add:

```text
recursive motif expansion
large CA
Lorenz batch integration
Penrose generation after DR-09
provenance batch construction
```

Do **not** migrate project migrations, command bus, graph editor state, or audio scheduling merely because Rust now exists.

**Stage D — optional browser accelerator**

If a kernel meets the decision trigger, put its Rust/Wasm implementation behind the existing TypeScript Worker API:

```typescript
interface KernelBackend {
  readonly semanticVersion: string;

  execute(
    request: ArrayBuffer,
    cancellation: CancellationHandle
  ): Promise<ArrayBuffer>;
}
```

Run differential tests in CI:

```text
TS result == Rust/Wasm result
```

for exact domains, and the declared FP conformance relation for numerical domains.

Keep a TypeScript fallback for at least one milestone so rollback remains trivial.

**Stage E — optional native accelerator**

Build the same Rust crate for `aarch64-apple-ios`, expose the small C ABI, package it as an XCFramework, and implement `RustCoreBackend` behind the same Swift façade. Rust's iOS target and Apple's XCFramework/SwiftPM mechanism both support this shape. citeturn15search6turn14search0turn14search6

Again:

```text
Swift result == Rust native result == TS reference fixture
```

before the Rust path becomes default.

**Stage F — reconsider orchestration only if semantic duplication itself becomes material**

Moving the **graph evaluator** into Rust is a fundamentally larger decision than moving CA or Penrose generation. It changes cancellation, progress, error handling, cache ownership, graph value representation, provenance allocation, and potentially debugging. Do this only if either graph throughput itself is a measured bottleneck or Swift/TypeScript graph semantic drift is consuming material engineering capacity.

Project schema/migrations may rationally **never** migrate to Rust. UI command semantics, document compatibility, and storage codecs are poor candidates for a systems-language migration unless evidence later says otherwise.

JavaScriptCore's role during all of these stages should be:

```text
XCTest / debug build
   ↓
load bundled compiled TS reference core
   ↓
execute fixture
   ↓
compare against Swift/Rust backend
```

That captures its best property—reuse of the reference implementation—without making native production architecture depend on a JS VM. Apple provides both embedded JS execution and Safari Web Inspector support for such contexts. citeturn14search2 Production builds can omit the oracle entirely.

## Risks and decision trigger

The main risks are not evenly distributed.

| Risk | TS + Swift | Rust | JSC | Swift/Wasm | Recommended mitigation |
|---|---:|---:|---:|---:|---|
| Premature freeze of changing semantics | Medium | **High** | Medium | **High** | Delay shared implementation until M1/runtime semantics settle |
| Cross-platform semantic drift | **High** | Low | Low | Low | Golden corpus + differential CI |
| FFI/data-copy tax | None | **Medium/High** | **High** if object-granular | Medium | Batch buffers, never per-event calls |
| Cancellation latency | Low/Medium | Medium | **High** | Medium | Atomic flags or bounded chunking |
| Float divergence in chaos | Medium | Medium | Medium | Medium | Explicit FP contract + quantization/freeze |
| Swift concurrency friction | Low | Medium | Medium | Low native / medium web | Swift façade owns concurrency |
| Real-time audio violation | Medium | Medium | **High** | Medium | Domain core never enters audio callback |
| Build/CI complexity | Low | **High** | Low/Medium | Medium/High | Reproducible pinned toolchains |
| Contributor bus factor | Medium | **High** | Low/Medium | Medium | No Rust adoption without maintainer ownership |
| App-size/startup regression | Low | Unknown | Unknown | Unknown | Cold-start/binary gates |
| Dynamic-code/App Review issue | None | None | Medium if remotely updated | None | Bundle fixed JS; never download core semantics |
| Project compatibility regression | Medium | Medium | Low/Medium | Medium | Host-owned schema/migrations + golden corpus |

For JSC specifically, Apple's current App Review rule 2.5.2 says apps may not download, install, or execute code that introduces or changes app functionality. citeturn19search0 A fixed reference bundle included in the reviewed application is a very different design from remotely downloading a new semantic engine; nevertheless, **do not create an architecture where native AGL fetches updated TypeScript operator code from a server**. Besides review risk, that would destroy project reproducibility.

The most serious cross-platform numerical risk is not “Rust versus Swift”; it is **accidentally treating floating-point-derived state as exact persistent semantics**. WebAssembly itself specifies deterministic rounding for ordinary arithmetic while still allowing multiple valid NaN outcomes. citeturn16search4 For Lorenz specifically, tiny numerical differences can become large trajectory differences over long integration horizons. AGL should therefore decide whether the product promise is “same mathematical experiment within a numerical profile” or “identical trajectory bytes.” The latter is expensive enough to be an explicit architecture requirement rather than an accidental expectation.

The most serious browser cancellation risk is a monolithic Wasm call. Worker `postMessage` is task-based and does not interrupt running code. citeturn23search3 The Rust prototype should therefore be rejected if it obtains impressive throughput by making cancellation materially worse.

The most serious native JSC risk is similar: VM serialization means concurrency and interruption must be designed around the JS runtime rather than naturally around Swift tasks. citeturn14search1 That is acceptable for an oracle, unattractive for the main runtime.

The most serious Rust organizational risk is that AGL would acquire a new **permanent platform** rather than a library. Rust introduces Cargo dependencies, two compilation targets, Wasm glue, Apple static-library/XCFramework packaging, FFI ownership/error handling, debugging across language boundaries, and release reproducibility. That can be worthwhile—but only when the team receives something materially valuable in return.

Accordingly, the decision should use an explicit trigger.

**Shared-kernel evaluation becomes mandatory only after all readiness gates are true:**

| Readiness gate | Requirement |
|---|---|
| Persistence stable | AGL-010 and AGL-011 accepted |
| Runtime semantics stable | AGL-020 through AGL-025 accepted |
| Cross-platform fixtures | AGL-146 accepted |
| Native conformance review | FR-07 completed |
| Performance budgets | FR-08 completed |
| Penrose, if included | DR-09 / AGL-120 fixture accepted |
| Native proof | AGL-147 ready to execute, not merely chartered |

Those dependencies reflect the existing backlog/frontier plan rather than adding a new process. fileciteturn0file0 fileciteturn0file1

**Once ready, a shared-kernel migration is justified when there is a material problem plus a demonstrated solution.** I recommend the following initial trigger values, with FR-08 empowered to adjust them before they become binding:

**Material problem — at least one must be true:**

1. At least **two production-relevant benchmark workloads** exceed their accepted browser-floor or A16-iPad performance/memory budget after ordinary algorithm and data-layout optimization; or
2. maintaining behaviorally equivalent Swift and TypeScript semantics consumes **≥20% of domain/runtime engineering capacity for two consecutive milestones**; or
3. semantic drift produces repeated escaped project-compatibility/correctness defects despite the golden-fixture system.

**Prototype proof — all must be true:**

| Proof | Proposed gate |
|---|---|
| Exact semantics | 100% match for rational, Euclidean, CA, RNG/stable-ID and exact graph fixtures |
| Project compatibility | 100% accepted project corpus round-trip / migration compatibility |
| Floating-point | Passes declared ULP/checkpoint/quantized-output profile |
| Performance | At least **~1.5× end-to-end** improvement on the workload causing the problem, **including FFI/transfer**, or ≥30% peak-memory reduction where memory is the blocker |
| Material user benefit | At least ~25% reduction on the relevant end-to-end critical path, not merely a microkernel win |
| Cancellation | No regression beyond FR-08's accepted p95 cancellation bound |
| Cold behavior | No material startup regression under the accepted budget |
| Audio safety | Zero domain-core calls from the real-time render callback |
| Native integration | Swift 6 strict-concurrency build is clean at the backend façade |
| Operational ownership | At least one regular maintainer is prepared to own the shared-core toolchain |

Those numbers are intentionally **high enough to make the shared core prove its value**. A 10% microbenchmark win is not worth making a two-engineer program permanently maintain Rust/Wasm/iOS FFI infrastructure.

A **full graph/domain migration to Rust** deserves an even higher threshold. Kernel acceleration can be justified by performance alone. Moving project semantics, graph orchestration, migrations, provenance ownership and evaluation state into Rust should require evidence that **semantic duplication itself** has become the dominant cost. Otherwise the selective architecture captures most of Rust's upside without turning Rust into the center of the application.

When the shared-core trigger fires, the bakeoff should be:

```text
Rust native + Rust/Wasm
        versus
Swift native + Swift/Wasm
        versus
current TS + Swift baseline
```

not simply “Rust versus status quo.”

Rust begins that bakeoff with the strongest arbitrary-integer story. Swift/Wasm begins with the strongest native Swift integration story: the same Swift implementation can run natively without any Rust FFI at all, and the 2026 JavaScriptKit stack provides browser bridging with async and multithreading support, although its newer typed BridgeJS mechanism remains experimental. citeturn24search0turn24search15 Whichever candidate wins AGL's actual workload and maintenance criteria should win the architecture.

Until those triggers fire, **the burden of proof has not been met, so the current core stays TypeScript-first.**

## ADR proposal

```text
Title
Cross-platform semantics are shared by contract before they are shared by implementation

Status
Proposed

Decision date
2026-08-18

Context
Aural Geometry Lab has a browser-first MVP roadmap and a stretch native-iPad
proof-of-architecture. Exact rational time, deterministic IDs, initial mathematical
kernels, a browser foundation, and an initial Swift portable-contract spike already
exist. Project schema/migrations and the production graph/evaluation runtime are not
yet complete. The program has two product engineers.

A shared implementation could eventually reduce semantic drift and accelerate
compute-heavy recursive, geometric, cellular-automaton, provenance, and chaos
workloads. It would also add cross-language/toolchain, FFI, packaging, debugging,
and contributor costs before those benefits have been demonstrated.

Decision
1. TypeScript remains the reference browser/domain implementation through the
   current semantic-stabilization phase.

2. Portable semantics are authoritative in:
   - shared schemas;
   - versioned project fixtures;
   - exact-rational rules;
   - deterministic PRNG/test vectors;
   - operator golden vectors;
   - floating-point conformance profiles;
   - stable-ID/provenance fixtures;
   - benchmark manifests.

3. Swift implements only the native semantics required by AGL-147 and subsequent
   proven native requirements, behind a backend-neutral CoreRuntime interface.

4. AGL-146/FR-07 differential conformance is a prerequisite to widening the native
   implementation.

5. JavaScriptCore is not the production native core.
   It may be used in debug/test targets as an executable oracle for the compiled
   TypeScript reference implementation.

6. Project schema validation, migrations, source-byte preservation, and persistent
   project compatibility remain outside any optional systems-language accelerator
   until a separate decision explicitly moves them.

7. Long-running domain evaluation executes outside the real-time audio thread.
   The audio thread consumes bounded, precomputed render-plan/event/control data.

8. Rust is an allowed future shared-kernel implementation, not the assumed one.
   Its first candidates are exact numeric primitives and coarse compute-heavy
   kernels, never per-object/per-event FFI.

9. Swift compiled to WebAssembly is added to the future shared-core bakeoff.
   It must independently prove arbitrary-precision arithmetic, browser tooling,
   binary/startup cost, cancellation, and performance.

10. A shared-kernel implementation may become production-default only after:
    - persistence/runtime semantics are accepted;
    - cross-platform conformance fixtures are accepted;
    - FR-07 and FR-08 are complete;
    - the required browser/iPad benchmark suite has evidence-grade results;
    - a material performance/memory or duplicated-semantics problem exists;
    - the candidate demonstrates material end-to-end benefit after boundary costs.

Consequences
Positive:
- avoids rewriting unstable semantics;
- preserves current TypeScript investment and tests;
- directly reuses the completed Swift contract spike;
- minimizes near-term roadmap disruption;
- makes project compatibility independent of implementation language;
- provides strong detection of Swift semantic drift;
- preserves a clean path to Rust if evidence later warrants it;
- allows Swift/Wasm to compete if its 2026-era tooling matures sufficiently;
- prevents audio-thread architecture from being coupled to domain language.

Negative:
- some TypeScript/Swift semantic duplication exists during the native proof;
- golden/conformance fixtures must become unusually strong;
- performance gains from Rust are deferred until a real bottleneck is demonstrated;
- a future shared-core migration, if triggered, will still incur real cost.

Rejected for now
- Full immediate Rust rewrite:
  insufficient AGL benchmark evidence and excessive migration cost during semantic churn.

- Production JavaScriptCore native engine:
  attractive semantic reuse, but weaker concurrency/cancellation/bridge architecture
  and unproven device performance.

- Full Swift/Wasm rewrite:
  promising 2026 ecosystem and excellent native integration, but requires rewriting
  the existing TypeScript core and lacks a first-party arbitrary-precision integer
  facility.

- Unbounded TypeScript/Swift duplication:
  acceptable only with external golden semantics and differential CI.

Revisit
First mandatory revisit:
after AGL-010/011, AGL-020-025, AGL-146, FR-07, and FR-08 are accepted.

Second mandatory revisit:
before AGL-147 chooses its production-capable native backend.

Performance-driven revisit:
whenever two representative workloads breach accepted performance/memory budgets.

Maintenance-driven revisit:
whenever duplicated cross-platform semantics consume approximately 20% or more of
runtime engineering capacity across two consecutive milestones, or repeatedly escape
the conformance suite.
```

This ADR fits the program's existing sequencing rather than creating a new architecture program beside it. M1 is explicitly about deterministic project round-trip and typed graph compile/evaluate; M4 requires worker cancellation/performance; M5 brings accepted Penrose geometry; and only M7 asks for the native iPad proof and a native-architecture go/no-go. fileciteturn0file3 DR-15 should therefore **prepare the decision machinery now and make the irreversible implementation decision later**.

The key strategic distinction is:

> **AGL needs one semantic truth far more urgently than it needs one implementation language.**

Shared schemas, exact wire semantics, deterministic vectors, canonical project fixtures, differential testing, and a stable `CoreRuntime` boundary create that truth today. If TypeScript/Swift duplication later proves expensive or Rust/Swift-Wasm produces a decisive end-to-end win on real AGL recursion, geometry, CA, chaos, provenance, or graph workloads, the architecture already has a clean seam through which to consolidate. Until then, migrating the whole core would be paying a permanent complexity tax to solve a problem that has not yet become material.

#AuralGeometryLab #CrossPlatformArchitecture #TypeScript #Swift #Rust #WebAssembly #JavaScriptCore #DeterministicComputing #ADR #DR15

**Estimated conversation tokens used:** ~143k