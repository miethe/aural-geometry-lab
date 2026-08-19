# ADR-0004 — Maintain a Native Web Audio Reference Backend

**Status:** Accepted provisionally; DR-03 may refine implementation  
**Date:** 2026-08-13

## Context

Higher-level libraries can accelerate synthesis and scheduling, but Aural Geometry Lab needs precise control over timing boundaries, diagnostics, cancellation, offline equivalence, and long-term dependency posture. The browser platform itself provides the portability floor.

## Decision

Maintain a native Web Audio backend implementing the stable `AudioBackend`/render-plan contract.

Tone.js may be added as an adapter for supported instruments/scheduling conveniences only after contract tests demonstrate compatible semantics. Custom rendering-thread DSP uses AudioWorklet where justified. Faust/WASM is considered for advanced DSP after a reference implementation and DR-03 review.

Canonical project/time semantics never depend on Tone.js transport or Web Audio node objects.

## Consequences

### Positive

- Clear platform baseline and failure diagnostics.
- Avoids dependency lock-in for core scheduling semantics.
- Enables direct AudioWorklet/offline integration.
- Provides a reference against which adapters are tested.

### Negative

- More audio plumbing must be maintained.
- Tone/sampler/effect quality requires engineering effort.
- Browser inconsistencies remain our responsibility to measure.

## Alternatives rejected

1. **Tone.js-only engine** — convenient but makes replacement and semantic control harder.
2. **AudioWorklet-only event engine from day one** — premature complexity before benchmarks define needs.
3. **Native desktop engine for MVP** — contradicts browser-native/local-first product scope.

## Validation

DR-03 must supply benchmarks, supported-browser thresholds, thread boundaries, and cancellation behavior. Real-time and offline backends must consume one render-plan semantic model.
