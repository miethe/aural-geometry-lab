# ADR 0015 — Exact Penrose Production Geometry

- **Status:** Accepted with artifact-recovery gates
- **Date:** 2026-08-18
- **Sources:** DR-09, DR-15

## Context

The Penrose lab requires deterministic finite-region generation, stable identity, exact adjacency, clipping safety, traversal, and cross-platform conformance. Decorative or tolerance-merged geometry is insufficient.

## Decision

Use a certified regular de Bruijn pentagrid to emit canonical P3 thick/thin rhombs. Topology uses integers, normalized rationals, and Q(phi). Float64/Float32 are rendering and broad-phase projections only.

Canonical identity:

- vertex: five-integer mesh tuple;
- tile: normalized grid-line pair;
- edge: sorted canonical vertex pair;
- reference: producer node + geometry-config hash + local identity.

A patch is a query into one configured infinite tiling. Query results expose completeness, halo, truncation, and boundary status. Clipping creates non-topological fragments; synthetic clip edges cannot satisfy canonical edge or adjacency interfaces.

Adjacency uses exact shared edge IDs. Traversals are bounded, versioned, deterministic values. Geometry emits typed features into the shared mapping pipeline; it does not embed pitch/scale/harmony.

## Alternatives considered

- Inflation-first viewport generator.
- P2 kite/dart canonical geometry.
- Tolerance-based coordinate merging.
- Clipped polygons as graph entities.

## Consequences

- Stable pan/zoom/query identity.
- Exact cross-language fixtures become mandatory.
- A small exact quadratic-field kernel is required.

## Risks

Completion remains blocked until golden bytes, prototype/oracle sources, regularity certificate, legal-star corpus, and matching-decoration corpus are checked in and reproduced.
