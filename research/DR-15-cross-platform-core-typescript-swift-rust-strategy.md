# DR-15 — Cross-Platform Core Strategy: TypeScript, Swift Reimplementation, or Shared Systems Core

**Current date:** 2026-08-14  
**Program:** Aural Geometry Lab

## Mission

Choose the long-term core-sharing strategy only after the web domain model is stable enough to evaluate real trade-offs.

Compare:

1. TypeScript reference core + behaviorally equivalent Swift implementation.
2. Shared Rust core compiled to WebAssembly and linked natively into Swift.
3. Embedded JavaScript/JavaScriptCore reference engine inside the native app.
4. Any materially better architecture discovered during research.

## Evaluation dimensions

- exact rational arithmetic and arbitrary-size integers;
- deterministic seeded generation;
- floating-point reproducibility expectations;
- graph evaluation and cancellation;
- serialization and versioning;
- provenance throughput;
- WASM/native FFI overhead;
- browser worker integration;
- audio-thread boundaries;
- debugging/tooling;
- packaging and CI;
- Swift concurrency integration;
- security and sandboxing;
- binary/app size;
- contributor skill burden;
- maintenance and semantic-drift risk;
- performance on large recursion/geometry/chaos workloads.

## Required benchmark suite

Use representative AGL kernels:

- 1,000,000 rational operations;
- Euclidean corpus;
- recursive motif expansion near budget;
- 1M-step Lorenz integration;
- large CA grid;
- Penrose patch when DR-09 fixture exists;
- graph evaluation with cancellation;
- project encode/decode;
- provenance allocation.

Measure cold/warm behavior and memory where possible on browser desktop and representative iPad hardware.

## Required outputs

- comparison matrix;
- prototype interface boundaries;
- benchmark results/reproduction scripts;
- migration cost estimate by package;
- risk analysis;
- recommendation with a decision trigger, not ideology;
- ADR proposal;
- if recommending Rust/shared core, staged migration plan that preserves existing TypeScript tests and project compatibility.

## Decision bias

Do not migrate merely for theoretical elegance. The burden of proof is on a shared systems core until the duplicated-semantics or performance cost becomes material.

