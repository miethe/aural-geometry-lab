# ADR-0001 — Keep the Domain Kernel Independent of UI and Audio Frameworks

**Status:** Accepted  
**Date:** 2026-08-13

## Context

Aural Geometry Lab needs sophisticated UI, browser audio, visualization, and eventually third-party libraries. Mathematical operators, exact musical time, project semantics, and provenance must outlive any specific React, node-editor, audio, or 3D framework. Coupling them would make correctness tests require browsers, make project compatibility depend on dependency upgrades, and increase rewrite risk.

## Decision

The canonical domain kernel and mathematical operators are framework-independent TypeScript modules.

They may depend on stable language/runtime primitives but not on:

- React or DOM APIs;
- Tone.js or Web Audio node classes;
- Three.js/rendering classes;
- IndexedDB;
- node-editor UI models.

Adapters translate canonical patterns/events/geometry into UI, persistence, and audio render plans.

## Consequences

### Positive

- Mathematical tests run quickly without a browser.
- UI/audio libraries can change without altering project semantics.
- Worker/offline/server/native ports remain possible.
- Research reference implementations map cleanly into production operators.

### Negative

- Additional adapter types and data conversion are required.
- Framework conveniences cannot leak into core types.
- Some duplicate representations may exist at boundaries.

## Alternatives rejected

1. **Tone.js as the canonical sequencing model** — expedient but couples musical semantics to a replaceable dependency and floating time model.
2. **React state as project model** — makes serialization, workers, tests, and migration brittle.
3. **A generic node-editor model as canonical graph** — UI libraries optimize for presentation, not versioned executable semantics.

## Validation

- Sprint 0 core/operator tests execute under Node without DOM/audio.
- Browser labs consume the kernel through adapters.
- Future production package split must preserve this dependency direction.

## Revisit trigger

Only revisit if a core requirement is impossible to express efficiently without a lower-level portable runtime such as Rust/WASM. Even then, the framework-independence principle remains; only implementation language changes.
