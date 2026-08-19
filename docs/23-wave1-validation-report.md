# Aural Geometry Lab — Wave-1 Validation Report

**Baseline:** 0.3.0  
**Date:** 2026-08-18  
**Environment:** Node.js/TypeScript build environment plus Swift 6.2.1 Linux contract runner

## Automated result

```text
TypeScript/Node: 35 passed, 0 failed
Swift Testing:     8 passed, 0 failed
Program verify:  122 backlog items
                  16 research runs
                  36 Wave-1 decisions
                   7 labs
```

`npm run check:all` completed successfully.

## What the automated suite proves

- exact rational arithmetic and portable exact-wire fixtures;
- drift-free interval-query patterns and event budgets;
- deterministic seed/ID behavior;
- Euclidean, Tonnetz, recursion, elementary CA, and Lorenz foundations;
- analytic Risset event-time and relabel-closure invariants;
- canonical Risset B=2 linear-partition gain sum;
- project-v1 validation and deterministic v1→v2 migration foundation;
- live mapping rejection of acausal whole-window stages;
- semantic command coalescing and preview/no-op behavior;
- async result current/cache-only classification;
- material source-status and guarded materialization behavior;
- generated selection orphan/reactivation semantics;
- `ResolvedAudioPlan` and `seconds-to-frame-v1` behavior;
- logical package path/integrity guardrails;
- exact `Q(φ)` arithmetic and Penrose default-phase/identity foundations;
- TS/Swift parity for selection, exact-wire representation, material status, audio frames, project-v2 decoding, and Penrose certificate availability;
- evidence artifact SHA-256 integrity;
- program dependency/reference integrity;
- design semantic-state and canonical fixture-copy integrity.

## JSON Schema validation

The two migrated project-v2 examples pass Draft 2020-12 validation with format checking:

```text
PASS examples/euclidean-polyrhythm.v2.project.json
PASS examples/infinite-staircase.v2.project.json
```

Run independently with:

```bash
python scripts/validate-json-schemas.py
```

## Static HTTP smoke

The built static server returned HTTP 200 for:

- `/`
- `/src/app.js`
- `/docs/18-wave1-system-integration.md`
- `/program/wave1-decision-register.json`
- `/schemas/agl-project-v2.schema.json`
- `/design/screens.json`

This proves packaging/serving of the integrated artifacts, not browser audio correctness.

## Evidence not yet available

The following remain intentionally outside “pass” status:

- cross-browser/device timing and latency matrix;
- AudioWorklet density and cancellation thresholds;
- perceptual Risset/listening acceptance;
- cross-engine DSP tolerance calibration;
- exact Penrose patch/oracle/matching corpus acceptance;
- iCloud/File Provider conflict behavior;
- physical iPad AVAudioEngine/MIDI/Pencil performance;
- representative accessibility and usability studies;
- floating numerical profile for chaos and other long trajectories;
- importer/exporter security and round-trip corpus.

The package makes no claims that those have been completed.
