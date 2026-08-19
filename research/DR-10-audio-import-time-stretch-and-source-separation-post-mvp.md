# Deep Research Charter DR-10

## Post-MVP Audio Import, Time Stretch, Transcription, and Source Separation

**Current date:** 2026-08-13  
**Program:** Aural Geometry Lab  
**Priority:** Post-MVP  
**Primary decisions unlocked:** staged audio-input roadmap, loop/monophonic/stem capabilities, DSP/ML architecture, quality metrics, privacy/licensing, and product boundaries

## Research role

Act as an audio DSP researcher, music-information-retrieval engineer, source-separation specialist, browser/WASM architect, music-rights/privacy analyst, and product strategist.

## Objective

Determine how Aural Geometry Lab could eventually apply mathematical transformations to recorded audio rather than only symbolic events and generated voices. Segment the problem into feasible stages—one-shots/loops, transient-aware time manipulation, monophonic analysis, polyphonic transcription, user-provided stems, and source separation—then recommend which capabilities are technically, legally, and product-wise justified.

## Context

MVP is intentionally event/MIDI-first. Applying “reflect the melody,” “make this rhythm Risset-accelerate,” or “map this track through geometry” to mixed stereo audio is ambiguous and artifact-prone. The research must prevent a vague audio-import request from silently expanding the product into a DAW, stem-separation service, or copyright-risk workflow.

## Decisions required

1. Staged capability ladder and value of each stage.
2. Browser-local versus server/desktop processing boundary.
3. Audio analysis representation and confidence/uncertainty model.
4. Time-stretch/pitch-shift algorithms and quality profiles.
5. Beat/transient/onset/tempo analysis approach.
6. Monophonic pitch tracking and note segmentation scope.
7. Polyphonic transcription feasibility and expected errors.
8. User-supplied stems versus automatic source separation.
9. Model/runtime/licensing/privacy implications.
10. Rights-safe user experience and storage/sharing policy.
11. Quality/latency/performance benchmarks.
12. Which features should remain explicitly unsupported.

## Research questions

### Capability decomposition

Evaluate separately:

1. importing one-shot samples;
2. importing beat-aligned loops with manual metadata;
3. automatic transient/tempo analysis;
4. non-real-time time stretching and pitch shifting;
5. real-time elastic playback;
6. monophonic pitch contour/note extraction;
7. drum/onset transcription;
8. polyphonic note transcription;
9. user-supplied stems;
10. local/server source separation;
11. resynthesis from extracted symbolic/control representations.

For each, identify user value, ambiguity, artifact profile, computational cost, browser feasibility, and product fit.

### Mathematical-operation semantics

- Which existing event operators can meaningfully apply to audio, and through what analyzed representation?
- Does a Risset rhythm require loop copies/time-varying playback rate, transient resynthesis, granular processing, or event extraction?
- What does pitch inversion mean for monophonic versus polyphonic audio?
- How are reverb, vocals, drums, and overlapping sources treated?
- How should confidence and destructive approximation be surfaced?
- When should the app require the user to choose a stem/analysis target rather than guessing?

### DSP

- Compare phase vocoder, WSOLA/PSOLA-like, granular, transient-preserving, and neural methods for relevant material.
- What quality/latency trade-offs exist for browser/WASM?
- Can Faust/WASM or existing permissive libraries provide suitable foundations?
- How should offline and real-time paths differ?
- What sample rates/channel formats/durations are practical?

### MIR/ML

- Compare onset, beat, tempo, pitch, chord, and transcription approaches.
- What models can run locally through WebGPU/WASM within acceptable resource limits?
- Which model licenses permit intended distribution and use?
- How should model version and confidence enter project provenance?
- What server processing would create privacy, cost, and operational obligations?

### Source separation

- What current quality is realistic for vocals, drums, bass, and other stems?
- How do artifacts affect downstream mathematical transformations?
- Is user-supplied stem import a better early feature than automatic separation?
- What model weights/licenses and compute requirements apply?
- Can processing remain local, and what hardware/browser support is needed?

### Rights, privacy, and sharing

- How should the app communicate that users must have rights to imported material?
- Should imported audio remain local by default and be excluded from telemetry?
- What may be packaged/shared with a project?
- How are asset hashes, licenses, source metadata, and “not embedded” references represented?
- What restrictions are needed for hosted rendering or separation?

## Scope

### In scope

- technical/product feasibility of recorded-audio transformations;
- local browser/WASM, optional desktop/server architecture;
- quality benchmarks and provenance;
- privacy/licensing workflow;
- staged roadmap.

### Out of scope

- implementing the full feature set during MVP;
- legal advice or blanket rights clearance;
- bypassing DRM or extracting protected streams;
- guaranteeing clean stems/transcription from arbitrary mixes;
- building a full recording/editing DAW.

## Source requirements

Prioritize:

- primary DSP/MIR/source-separation papers;
- official model/library documentation and licenses;
- objective benchmark datasets/metrics plus perceptual studies;
- browser WebAssembly/WebGPU/audio specifications;
- authoritative copyright/privacy/product counsel inputs for policy decisions.

Use current model/tool versions and record dates because this area changes rapidly.

## Method

1. Define representative user tasks and audio corpus with rights-cleared/test material.
2. Build a capability/architecture matrix.
3. Prototype the most promising low-risk stages: loop import and offline transform.
4. Benchmark candidate algorithms/models for quality, speed, memory, and artifact types.
5. Test downstream compatibility with existing mathematical operators.
6. Conduct perceptual/composer evaluation.
7. Analyze local versus server cost/privacy/licensing.
8. Produce a staged roadmap and explicit non-goals.

## Required deliverables

1. Capability ladder and product-value matrix.
2. Formal semantics/limitations for applying existing operators to audio.
3. DSP/MIR/model comparison with current versions/licenses.
4. Browser/desktop/server architecture options.
5. Benchmark corpus, metrics, and reproducible results.
6. Confidence/provenance model for analyzed audio.
7. Asset rights/privacy/storage/sharing specification.
8. Cost/performance estimates for local and hosted paths.
9. Recommended post-MVP phases and rejected features.
10. Prototype code or pseudocode for the first selected stage.
11. ADR proposals and release-risk updates.

## Acceptance criteria

- The roadmap separates symbolically clean operations from approximate audio analysis/resynthesis.
- Every capability has explicit quality, performance, ambiguity, licensing, and privacy limits.
- Recommendations use current benchmark evidence rather than demos alone.
- Imported material stays local by default unless a separately approved service is selected.
- Model/library licenses are documented.
- The first recommended phase adds meaningful value without turning Aural Geometry Lab into an unfocused DAW.

## Handoff

Create a post-MVP epic only after product approval. Do not add arbitrary mixed-audio promises to MVP requirements based solely on this research charter.
