# ADR-0005 — Gate Penrose Sequencer on Independent Geometric Validation

**Status:** Accepted  
**Date:** 2026-08-13

## Context

Penrose-like decorative patterns are easy to draw, while valid Penrose tilings require specific tile shapes/constructions, matching behavior, robust geometry, and correct adjacency. Labeling an attractive approximation as a Penrose tiling would undermine the product's mathematical credibility.

## Decision

The Penrose Sequencer cannot reach implemented/complete status until DR-09 selects and independently validates:

- a construction algorithm;
- tile representation;
- numeric/exactness strategy;
- stable IDs;
- finite patch/clipping semantics;
- matching/overlap/gap properties;
- adjacency;
- golden fixtures and tolerance policy.

Until then, the UI may explain the intended concept but must explicitly state that any conceptual diagram is not asserted to be a valid tiling. It must not emit production Penrose-derived musical events.

## Consequences

### Positive

- Protects mathematical and educational integrity.
- Creates a clear evidence bar and acceptance suite.
- Avoids building traversal/mapping on invalid geometry.

### Negative

- The lab remains visibly incomplete longer than other labs.
- Research and exact-geometry work may be substantial.
- Marketing/demo pressure cannot bypass the gate.

## Alternatives rejected

1. **Use a visually similar rhomb pattern** — materially misleading.
2. **Embed a static image and traverse pixels** — not an interactive mathematical model and provides no reliable adjacency.
3. **Adopt an unverified code snippet** — insufficient provenance and test evidence.

## Validation

The gate closes only when DR-09 acceptance criteria and AGL-120–AGL-122 pass. Any reduced-scope alternative requires a new ADR and must use different terminology.
