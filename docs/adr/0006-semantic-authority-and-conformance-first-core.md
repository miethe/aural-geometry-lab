# ADR 0006 — Semantic Authority and Conformance-First Cross-Platform Core

- **Status:** Accepted
- **Date:** 2026-08-18
- **Sources:** DR-12, DR-14, DR-15

## Context

AGL targets a browser MVP and a bounded native-iPad stretch. The schema, evaluator, command system, and numerical profiles are still stabilizing. Prematurely selecting one implementation language as the product specification would freeze accidental behavior and create a third-toolchain cost without evidence.

## Decision

Authority order is:

1. accepted mathematical/behavioral contracts and ADRs;
2. language-neutral schemas and golden fixtures;
3. executable reference behavior;
4. platform adapters and UI.

TypeScript remains the browser executable reference during stabilization. Swift implements only accepted native capabilities against shared fixtures. JavaScriptCore is a pinned test/debug oracle, not a shipping runtime. Rust and Swift/Wasm are optional future coarse-grained kernels and require a measured material problem plus a demonstrated solution.

## Alternatives considered

- Immediate Rust core for web and iOS.
- Complete independent TypeScript and Swift products.
- Production JavaScriptCore runtime.
- Swift/Wasm rewrite.

## Consequences

- Fixture/schema quality becomes first-class work.
- Some bounded TS/Swift duplication remains.
- Project compatibility is not tied to a backend.
- A future shared kernel can be introduced without replacing project files.

## Risks

- TypeScript may still become a de facto spec if fixtures are weak.
- Two implementations can drift between fixture updates.
- Evidence gates require disciplined benchmark execution.
