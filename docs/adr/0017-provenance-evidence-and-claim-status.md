# ADR 0017 — Provenance, Evidence Status, and User-Facing Claims

- **Status:** Accepted
- **Date:** 2026-08-18
- **Sources:** DR-01, DR-03, DR-08, DR-09, DR-15

## Context

AGL is simultaneously a creative instrument, educational lab, and research-capable system. Engineering defaults, theorem-backed properties, perceptual evidence, and product hypotheses must not be conflated.

## Decision

Separate:

- semantic provenance: source/operator/version/seed/profile/lineage and mapping stages;
- execution provenance: backend/build/browser/OS/device/sample rate/assets/approximations/metrics;
- evidence status: direct, qualified, experimental, or prohibited.

Every preset and guided claim records evidence provenance and validation status. Inspector traces show raw source, each stage, random/constraint effects, and final target.

Do not claim:

- cross-browser PCM identity without proof;
- that finite Penrose patches prove global aperiodicity;
- that a browser gain value guarantees hearing safety;
- that unverified production details reconstruct a proprietary film cue;
- that one auditory dimension is universally best.

## Consequences

- Educational copy and presets become versioned evidence-bearing artifacts.
- Execution receipts support reproducibility without contaminating project meaning.

## Risks

- Evidence metadata can become stale unless research integration is part of release governance.
