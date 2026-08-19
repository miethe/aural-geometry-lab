# Deep Research Charter DR-03

## Browser Audio Scheduling, Latency, and Rendering Architecture

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** Immediate / architecture blocker  
**Primary decisions unlocked:** real-time scheduler, AudioWorklet boundary, offline renderer, supported browser matrix, Tone.js/Faust posture, and measurable latency budgets

## Research role

Act as a Web Audio specification expert, browser-audio engineer, real-time systems engineer, DSP architect, performance-test designer, MIDI engineer, and open-source dependency reviewer.

## Objective

Select and specify a production-ready browser audio architecture for exact-beat mathematical patterns rendered in real time and offline. Establish what must run on the main thread, workers, and audio rendering thread; quantify scheduling behavior across current desktop browsers; and define stable adapters for native Web Audio, optional Tone.js services, AudioWorklet DSP, Faust/WASM, OfflineAudioContext, and Web MIDI.

## Context

Sprint 0 uses native Web Audio with 24–30 ms JavaScript timers and a short look-ahead horizon. This demonstrates feasibility but has not been benchmarked or separated behind a render-plan API. The flagship Risset lab can create high instantaneous event rates and therefore stresses scheduling, gain normalization, and source teardown.

The canonical domain uses rational beat time. The audio layer receives floating-point seconds only in immutable render plans.

## Decisions required

1. Reference real-time backend architecture.
2. Look-ahead scheduler algorithm, queue horizon, wake strategy, and adaptation.
3. AudioWorklet responsibilities and message protocol.
4. Web Worker versus main-thread graph/render-plan preparation.
5. Voice/sampler architecture and source pooling policy.
6. Real-time edit/reschedule/cancellation semantics.
7. Offline rendering backend and deterministic tolerance.
8. Tone.js adoption boundary, if any.
9. Faust/WASM adoption boundary, if any.
10. Web MIDI scope, permission UX, timing, and fallback.
11. Browser/hardware support matrix and measurable acceptance thresholds.
12. Diagnostic metrics exposed to users/developers.

## Research questions

### Platform capabilities

- What do current Web Audio, AudioWorklet, OfflineAudioContext, and Web MIDI specifications guarantee versus leave implementation-defined?
- How do current Chromium, Firefox, and Safari desktop implementations differ in autoplay policy, base/output latency reporting, AudioWorklet behavior, offline rendering, suspend/resume, and MIDI?
- Which features require HTTPS/secure context?
- What happens on sample-rate changes, device changes, background tabs, sleeping laptops, Bluetooth devices, and high system load?

### Scheduling

- Which look-ahead scheduling patterns are robust for note events and parameter automation?
- What wake interval and horizon ranges perform best across browsers without excessive stale scheduling?
- How should tempo-map changes, seeks, loops, and rapidly changing generators invalidate scheduled events?
- Which events can be cancelled after source creation, and which require generation IDs/muting/rebuilding?
- At what event density should the system switch from individual nodes to a worklet/synth voice, aggregate pulses, or reject parameters?
- How should late events be handled: drop, schedule immediately, coalesce, or report?

### Thread boundaries

- Which computations are safe on the main thread?
- When should graph evaluation run in workers?
- Which DSP/control tasks truly require AudioWorklet?
- How should worklet processors receive event/control data with bounded allocation and message overhead?
- Which shared-memory approaches are portable and justified, considering cross-origin isolation requirements?

### Rendering and determinism

- Can real-time and offline rendering share one render plan and voice definitions?
- What numeric/audio tolerance is realistic across browser engines?
- How should rendered WAV metadata/manifest preserve project, seed, backend, sample rate, and approximations?
- Which DSP nodes behave differently or are unsupported in OfflineAudioContext?

### Libraries

- What value does Tone.js add for transport, instruments, samplers, and scheduling versus direct Web Audio?
- Can Tone.js remain an adapter without owning canonical time/project semantics?
- What are its current license, release cadence, browser compatibility, and bundle implications?
- Where does Faust/WASM improve maintainability/performance for custom DSP, and what toolchain/runtime/licensing consequences follow?
- Which portions should be implemented directly first to preserve a reference baseline?

### MIDI

- What browser support and permission constraints exist?
- How should incoming MIDI timestamps map to audio/transport time?
- Can clock synchronization be trusted for MVP, or should the app limit itself to note/control input/output?
- What diagnostics/fallbacks are required when Web MIDI is unavailable?

## Scope

### In scope

- desktop browser real-time audio;
- event scheduling and parameter automation;
- AudioWorklet and workers;
- oscillator/sampler/basic DSP voices;
- offline WAV rendering;
- optional MIDI note/control I/O;
- performance and compatibility harness;
- dependency/licensing posture.

### Out of scope

- native desktop audio drivers/plugins;
- professional stage guarantees;
- arbitrary third-party audio plugins;
- cloud rendering;
- source separation/time stretching except where benchmark inputs require simple loop playback.

## Source requirements

Use primary sources wherever possible:

- W3C/Web Audio and Web MIDI specifications;
- MDN/browser vendor documentation;
- official Tone.js, Faust, React/Vite/library documentation and repositories;
- browser issue trackers for confirmed implementation limitations;
- peer-reviewed or reputable engineering publications for scheduling methods.

Validate current behavior empirically; documentation alone is insufficient for latency/performance claims.

## Experimental method

Build a browser benchmark harness that records:

- intended and actual/scheduled event time;
- late-event count and lateness distribution;
- scheduler wake jitter;
- AudioContext state/sample rate/base/output latency;
- CPU/main-thread long tasks;
- active source count and teardown time;
- parameter-update latency;
- offline render duration and output consistency;
- failure behavior on backgrounding/suspend/resume/device change.

Test profiles:

1. steady 4–32 events/second;
2. bursty dense patterns;
3. Risset layers approaching configured cap;
4. live parameter scrubbing;
5. heavy canvas/3D rendering;
6. worker graph recomputation;
7. 10–30 minute soak;
8. low-power/CPU-throttled mode.

Test at least representative current versions of Chromium, Firefox, and Safari on macOS; add Windows Chromium/Firefox where available. Record exact hardware, OS, browser build, output device, sample rate, and power mode.

## Required deliverables

1. Platform capability/browser matrix.
2. Benchmark harness source and reproducible run instructions.
3. Raw benchmark results and analysis.
4. Recommended thread/process architecture.
5. Render-plan, scheduler, voice, worklet-message, and cancellation API contracts.
6. Event-density/gain/source-count budgets with rationale.
7. Real-time edit/seek/loop strategy.
8. Offline render design and determinism/tolerance policy.
9. Tone.js and Faust/WASM adoption decisions with license/bundle/maintenance analysis.
10. Web MIDI scope and fallback UX.
11. Diagnostics specification.
12. ADR proposals and test thresholds for M2 acceptance.

## Acceptance criteria

- Recommendations are supported by both specifications and empirical measurements.
- The benchmark harness is versioned and repeatable.
- The architecture prevents UI/graph work from blocking the rendering path.
- Stale-event cancellation/rescheduling semantics are explicit.
- Dense Risset behavior has a safe strategy and hard cap.
- Real-time/offline outputs share a defined semantic contract.
- Browser limitations and support tiers are honest and actionable.
- Library adoption does not couple canonical project/time semantics to a replaceable dependency.
- Engineering can implement AGL-041 through AGL-049 with measurable pass/fail criteria.

## Handoff

Update the audio ADRs, render-plan API, scheduler implementation, browser support policy, Infinite Staircase event-rate bounds, CI/browser harness, and release risk register.
