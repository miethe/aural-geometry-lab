# ADR 0009 — Explicit Sonification Mapping and Constraint Pipeline

- **Status:** Accepted
- **Date:** 2026-08-18
- **Sources:** DR-08

## Context

Sampling, normalization, smoothing, quantization, randomness, and musical constraints change what information a listener can perceive. Hiding them in lab code or renderers destroys explanation and reproducibility.

## Decision

All labs use explicit versioned stages:

```text
Source → Sample → Normalize → Smooth → Transform
       → Quantize/Threshold → Constrain → Target
```

Stages may repeat or reorder only when represented explicitly.

Each port/value declares dimension, unit, measurement/topology, domain, missing-value policy, and clock semantics. Each stage declares pointwise, causal-stateful, bounded-lookahead, or whole-window semantics. Zero-latency live graphs reject future-dependent operations.

Randomness is a separate seeded/keyed operator. Musical constraints are deterministic downstream stages with hard/soft priority, conflict outcomes, and traceable raw-to-final deltas.

## Alternatives considered

- Per-lab private mapping recipes.
- One universal auditory-dimension ranking.
- Hidden “musical mode.”
- Implicit smoothing and normalization.

## Consequences

- Mapping graphs are serializable, testable, bypassable, and explainable.
- Compiler and inspector need richer semantic metadata.
- Presets expand into ordinary explicit graphs.

## Risks

- More operator vocabulary and UI density.
- Users need progressive disclosure.
- Evidence does not justify universal defaults for every auditory channel.
