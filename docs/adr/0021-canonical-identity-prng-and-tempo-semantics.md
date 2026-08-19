# ADR 0021 — Canonical Identity, Named Random Streams, Exact Time, and Tempo Semantics

- **Status:** Accepted; numerical-profile and large-artifact streaming gates open
- **Date:** 2026-08-18
- **Sources:** DR-01, DR-03, DR-09, DR-12, DR-14, DR-15; FR-01 findings FR01-004, FR01-008, FR01-009, FR01-021, FR01-022, FR01-036, FR01-041, FR01-042, FR01-047
- **Supersedes/extends:** ADR 0002, ADR 0003, ADR 0014, ADR 0015

## Context

Legacy stable IDs used a short non-cryptographic hash over ambiguous serialization. Legacy random-stream forks depended on mutable draw state. JavaScript approximate numbers could enter exact rational time, and tempo interpolation was insufficiently versioned. Canonicalization itself is a trust boundary: hidden properties, getters, sparse arrays, malformed Unicode, duplicate JSON keys, unsafe integer literals, and unbounded object graphs can otherwise create collisions or cross-runtime interpretation differences.

## Decision

1. `agl-canonical-value-v1` is the typed canonical encoding for semantic digest and persistent-ID inputs. It distinguishes null, Boolean, valid-Unicode strings, arbitrary integers, finite binary64 values, arrays, and UTF-8-key-sorted plain objects.
2. Canonical encoding rejects cycles, excessive depth/nodes/bytes, sparse or custom-prototype arrays, accessors, symbol keys, non-enumerable/hidden own properties, nonplain objects, `undefined`, nonfinite numbers, negative zero ambiguity, and malformed/lone UTF-16 surrogates.
3. Authoritative JSON enters through `agl-strict-json-v1`, which decodes strict UTF-8 and rejects duplicate object members, unsafe integer literals, malformed Unicode, trailing data, and boundedness violations before schema/runtime validation.
4. Semantic digests use SHA-256 over canonical bytes with `sha256:` identifiers. Standard and block-boundary vectors are normative across TypeScript and Swift.
5. New persistent IDs use `agl-stable-id-v2`: a portable prefix and full SHA-256 over a canonical typed tuple. UI may abbreviate but never persist abbreviations.
6. New deterministic generation uses `agl-prng-v2` / named immutable streams derived from root seed plus stream path. Sibling evaluation order cannot perturb another stream. Bounded integers use rejection sampling. PRNG identity is reproducibility infrastructure, not cryptography.
7. Exact musical time uses normalized arbitrary-precision rational wire values as canonical decimal strings. `Rational.from(number)` accepts only finite safe integers; approximate binary-floating conversion requires an explicitly named API.
8. `agl-tempo-map-v1` defines nonnegative exact beat points, step segments, and analytic linear-BPM-over-beat integration/inversion. The final point is step. BPM, beat, and numerical horizons are bounded.
9. Beats remain exact through domain evaluation. Deterministic floating project-timeline seconds are introduced only at temporal resolution. Backends quantize absolute event endpoints once under a separate versioned sample-frame rule; they never accumulate independently rounded deltas.
10. Persistent identity, graph topology, generated correspondence, and branch decisions may not depend on insignificant raw floating differences. They use exact, quantized, profile-numeric, or explicitly materialized semantics.
11. Risset v1 uses analytic event ordinals and safe bounded horizons; ordinals/IDs do not pass through unsafe JavaScript integer space.
12. Penrose topology/identity uses exact integer and \(\mathbb Q(\phi)\) values; Float64 is projection-only and cannot decide canonical equality, adjacency, or traversal ties.
13. Legacy ID/PRNG behavior is read/replay-only and may not create new project entities.
14. The v1 canonical digest is currently in-memory; extremely large projects/plans require a future streaming/incremental canonical-digest and fragmented-plan profile rather than silently raising limits.

## Alternatives considered

- JSON stringification or delimiter concatenation.
- FNV/short IDs plus collision handling.
- Random UUIDs for generated content.
- One mutable project-wide PRNG.
- Standard-library RNG.
- Floating seconds as project time.
- Scheduler-tick numerical tempo integration.
- Tolerance-based Penrose canonicalization.

## Consequences

- TypeScript and Swift share exact-wire, SHA, ID, PRNG, sample-frame, selection, and Penrose certificate fixtures.
- Canonical-version changes are explicit migrations, never patches in place.
- Existing legacy generated IDs may remain legacy-scoped or require a reviewed migration.

## Risks

- Canonicalization and strict JSON parsing are security/compatibility critical and require fuzz/property testing.
- Full SHA identifiers are longer.
- The numerical profile for chaos and other floating workloads remains a separate gate.
- Large in-memory canonicalization/plan assembly can exhaust memory even within nominal per-value limits; AGL-190 owns streaming/fragmentation.

## Regression evidence

- Canonical hidden-state, malformed-Unicode, limits, SHA standard/block-boundary, tuple-boundary, stable-ID, named-stream, and bounded-integer tests.
- Strict JSON duplicate-key/unsafe-number/malformed-UTF-8 tests.
- Exact rational ingress and wire tests.
- Tempo analytic/inverse/tiny-ramp tests.
- Risset unsafe horizon and Penrose exact-identity tests.
