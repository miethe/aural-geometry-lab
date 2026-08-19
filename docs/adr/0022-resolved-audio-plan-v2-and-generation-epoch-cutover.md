# ADR 0022 — ResolvedAudioPlan v2 and Runtime Generation/Epoch Cutover

- **Status:** Accepted; backend integration and empirical calibration open
- **Date:** 2026-08-18
- **Sources:** DR-01, DR-03, DR-12, DR-14, DR-15; FR-01 findings FR01-005, FR01-025, FR01-026, FR01-033, FR01-034, FR01-046, FR01-047
- **Supersedes/extends:** ADR 0008, ADR 0012

## Context

The prior audio-plan shape mixed project-timeline content with playback generation, transport epoch, and activation time. It also permitted duration quantization independent of start time. That makes plan hashes depend on runtime state, risks realtime/offline disagreement, and creates sample-boundary errors. Current lab players still contain prototype scheduling paths.

## Decision

1. `agl.audio.render-plan` **schemaVersion 2** is immutable, content-addressed, backend-neutral musical/audio intent in project-timeline seconds.
2. The plan contains exact temporal-origin metadata, project/environment/catalog/voice/asset identity, ordered events/automation/tails/approximations, and its own canonical digest/ID.
3. Generation ID, transport epoch, active backend epoch, effective audio time/frame, fade, and superseded binding belong to `agl.audio.schedule-binding` v1, not the plan.
4. A tempo resolver converts exact source beats into deterministic ideal seconds before the audio backend.
5. A backend converts every absolute start and end once using the versioned sample-frame rule. Duration is `endFrame - startFrame`; it is never independently rounded. A semantically nonzero event that collapses to one boundary may be represented by the documented minimum-one-frame policy.
6. Worker/domain evaluation prepares bounded plans; main/control thread owns browser audio graph calls; AudioWorklet/native callbacks own only bounded preallocated dispatch/DSP.
7. JavaScript wake time never defines musical time. The scheduler services already timestamped events with an adaptive bounded horizon.
8. Edits/seeks/loop changes create a new generation and transport epoch with an exact future cutover. Already emitted audio is immutable history; future stale work is gated or silenced.
9. Realtime and offline consume the same plan and voice semantic definitions. Required equality hierarchy is project/plan/event/sample-frame semantics first; cross-engine PCM bytes are not promised.
10. Export tail policy, voice lifecycle, late-event policy, approximation/shedding, and gain safety are explicit and provenance-bearing.
11. Domain graph/project/provenance/BigInt/JSON work is prohibited from the real-time callback.
12. Resolved-plan v2 has explicit bounded collection and canonicalization limits. Very large projects require deterministic plan fragmentation/streaming; adapters may not lift caps or allocate an unbounded whole-project plan.

## Alternatives considered

- One plan object containing runtime transport/generation.
- Scheduler timers as timing authority.
- Round start plus separately rounded duration.
- Each lab/backend independently evaluating operators.
- Bit-identical Web Audio PCM as the cross-browser requirement.
- Whole-song scheduling with mutable in-place cancellation.

## Consequences

- Plan caching/offline export/native adaptation become coherent.
- Production P0 labs must migrate off legacy local schedulers.
- Backend adapters need explicit generation buses/queues and cutover state machines.
- Empirical benchmark values can tune horizons/thresholds without changing project semantics.

## Risks

- Main-thread native-node creation can still miss deadlines under pathological UI load.
- AudioWorklet/native voice paths can diverge without shared plan/voice fixtures.
- Effect tails and structural graph changes complicate generation cutover.
- Hardware/browser measurements remain absent from this repository run.

## Evidence

DR-03 defines absolute-time look-ahead, Worker/main/AudioWorklet separation, generation cancellation, and semantic—not PCM—determinism. DR-12 maps the same semantic plan into native sample frames. DR-14 defines last-valid/candidate/armed/active plan behavior. DR-15 forbids domain computation on real-time callbacks. FR-01 fixed the plan/runtime ownership and endpoint-rounding defects.

## Confidence

Very high for the architecture and quantization invariant. Numeric scheduler/voice thresholds remain owned by AGL-178.

## Open implementation gates

- AGL-177 migrates every playable surface to plan v2 + schedule binding.
- AGL-178 owns browser/device scheduler and realtime/offline calibration.
- AGL-190 owns streaming canonical digests and fragmented plan/export pipelines for large artifacts.
