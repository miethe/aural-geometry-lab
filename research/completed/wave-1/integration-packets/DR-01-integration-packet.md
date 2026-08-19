# 2026-08-18 — Aural Geometry Lab Research Integration Packet: Risset Rhythm / Infinite Staircase

## Executive decisions and evidence

**Integration-scope caveat.** The completed DR-01 report body is not retrievable in the conversation state available to this pass; the retrievable AGL context consists of the DR-01 charter plus the program backlog, lab manifest, program plan, and research register. I therefore do **not** attribute any unseen numeric recommendation to the completed report. This packet integrates those AGL artifacts with a targeted re-verification of the load-bearing primary, peer-reviewed, standards, and official/public-production sources. Numeric defaults not directly justified by those sources are explicitly labeled as provisional engineering choices rather than recovered DR-01 findings.

AGL already has the architectural pieces that this integration must land into: exact rational musical time, canonical event/patterns, typed/versioned operators, deterministic IDs, worker evaluation, budgets, a canonical audio render plan, generated/frozen timeline semantics, visualization projection, and dedicated Infinite Staircase work items. In particular, AGL-061, AGL-063, and AGL-065 are explicitly DR-01-dependent; Infinite Staircase is a P0 lab and M2 requires its acceptance. fileciteturn0file0 fileciteturn0file1 fileciteturn0file2 fileciteturn0file3

I use four epistemic labels below:

- **Established evidence** — primary source, peer-reviewed formal result, standards requirement, or direct production statement.
- **Strong inference** — conclusion follows well from evidence but was not directly tested for this exact product use.
- **Engineering recommendation** — AGL should choose this for deterministic/coherent semantics; it is not represented as a psychoacoustic fact.
- **Speculative possibility** — plausible, but not strong enough to govern product behavior or claims.

### Executive Decision Summary

| Decision | Classification | Basis and consequence |
|---|---|---|
| Define `rhythm.risset@1` as a logarithmic-rate, multi-layer, crossfaded event generator with exact closure under layer relabeling. | **ADOPT** | Classical Risset rhythm is the rhythmic analogue of circular pitch constructions; subsequent formal work describes faded synchronized streams separated by tempo “octaves.” The exact relabel invariant can be formalized cleanly and should be the operator's defining mathematical contract. citeturn17search0turn17search1turn18search10 |
| Make **2:1** the canonical equivalence ratio for something labeled simply “Risset rhythm.” | **ADOPT** | Ghisi explicitly distinguishes the powers-of-two Risset construction from generalized “barberpole tempo illusions” with arbitrary/non-integer proportions. AGL should not erase this terminology distinction. citeturn17search1 |
| Permit non-2:1 ratios only through an explicitly generalized mode/operator vocabulary such as “barberpole tempo,” not as an invisible reinterpretation of `rhythm.risset`. | **ADOPT WITH CONDITIONS** | The generalization is mathematically supported, but its perceptual robustness across ratios is not established at the level needed for default claims. citeturn17search1 |
| Define direction by the sign of local log-rate slope: `accelerate` means every persistent layer locally increases rate; `decelerate` means it locally decreases. | **ADOPT** | This makes direction invariant under layer replacement and avoids the misleading interpretation that the globally repeating composite has an ever-increasing scalar BPM. This is a formal consequence of the construction. citeturn17search1turn17search0 |
| Use **unwrapped phase for computation** and wrapped phase only for presentation. Never reset an individual layer's source phase merely because cycle phase wraps. | **ADOPT** | Rate relabeling alone is insufficient for seamless closure; source phase must relabel as well. The analytic phase definition below gives exact closure rather than a near-match. This is an engineering derivation grounded in the Risset construction. citeturn17search1turn18search10 |
| Represent the layer envelope explicitly in a declared physical domain—preferably **power weight**, converted to amplitude by square root—and normalize separately. | **ADOPT WITH CONDITIONS** | Literature supports smoothly fading streams but does not establish a psychoacoustically optimal gain convention. “Raised cosine,” “linear amplitude,” “equal power,” and “constant loudness” are not interchangeable claims. The domain must therefore be part of the versioned contract. citeturn17search1turn20search1 |
| Use raised-cosine power weighting plus instantaneous unit-power normalization for v1, while documenting it as an **engineering policy**, not the definition of a Risset rhythm or a constant-loudness solution. | **ADOPT WITH CONDITIONS** | Smooth tapered weighting is historically consistent with the Shepard/Risset family, but neither constant summed square gain nor any other simple normalization guarantees constant perceived loudness for correlated pulse trains. citeturn20search1turn20search5 |
| Do **not** make a fixed integer `layerCount` the mathematical essence of the operator. Define an envelope support in log-rate space and derive active indices; an implementation may retain guard slots. | **ADOPT** | Exact relabel closure is naturally defined over an integer-indexed family with finite support at a given time. A permanently fixed set of named layers produces edge/reset behavior unless identities are replenished/relabelled. This is a mathematical implementation consequence. |
| Keep **subdivision shedding** outside `rhythm.risset`, as a separate deterministic symbolic-pattern transformation. | **ADOPT** | Subdivision manipulation is not necessary to the Risset invariant, while AGL already values typed operators, visible stages, provenance, and generated/frozen distinctions. Keeping it separate prevents a stylistic effect from becoming falsely definitional. fileciteturn0file0 |
| Keep **3:2 metric ambiguity** outside the core operator and label any preset using it experimental/cinematic rather than evidence-backed enhancement. | **ADOPT WITH CONDITIONS** | 2:3 polyrhythms demonstrably support competing beat interpretations, with strong effects of subdivision and individual variation, but this does **not** establish that 3:2 materially strengthens the Risset illusion. citeturn20search15turn20search7 |
| Treat a fixed **anchor pulse** as an independent experimental/control layer, off by default. | **ADOPT WITH CONDITIONS** | Stable references are scientifically useful for testing whether listeners anchor to an external pulse, but the claim that an anchor necessarily weakens a Risset illusion is currently a strong inference rather than direct Risset-specific evidence. |
| Keep Shepard/Risset **pitch coupling off in the rhythm MVP** and independently toggleable later. | **ADOPT** | Pitch circularity is independently capable of conveying ascent/descent, so coupling it to rhythm would confound a claim that listeners heard rhythmic acceleration. AGL-064 already treats pitch coupling as independent, bounded, and P1. citeturn20search1turn20search5 fileciteturn0file0 |
| Make the MVP's canonical stimulus **event-based with synthetic, rate-invariant pulse timbre**. Treat variable-speed audio loops as a comparison implementation and arbitrary pitch-preserving time stretching as post-MVP. | **ADOPT** | Event synthesis isolates rhythm from playback-rate-induced pitch/timbre changes. AGL's DR-10 already assigns arbitrary audio import/time stretching to post-MVP. fileciteturn0file3 |
| One analytic render-plan representation must drive realtime and offline rendering; require semantic/event-time conformance, **not cross-browser bit-identical PCM**. | **ADOPT WITH CONDITIONS** | Web Audio has shared `BaseAudioContext` concepts for realtime/offline rendering and sample-time scheduling, but browser/DSP implementations need not generate bit-identical PCM. Web Audio 1.0 specifies 128-frame render quanta; DR-03 must own concrete scheduler and budget tolerances. citeturn18search1turn19view3 fileciteturn0file0 |
| Do not force exponentially warped Risset event times into AGL's exact-rational **musical-time** type. Keep exact rational source phase and a separate continuous/render-time mapping until materialization. | **REQUIRES CROSS-RUN RECONCILIATION** | Generic exponential event times involve logarithms and are not rational in general. The source pattern can remain exact-rational, while rendered seconds/sample frames need their own deterministic contract. This directly touches AGL-002, AGL-003, AGL-041, MIDI/XML, and DR-03. fileciteturn0file0 |
| Adopt the wrapped log-tempo visualization as the primary scientific visualization, paired with an unwrapped local-rate view. | **ADOPT** | AGL-062 already expects layer, gain, phase, relabeling, and dominant-band state. The paired views communicate the central truth: individual layers locally accelerate/decelerate while the aggregate closes by relabeling. fileciteturn0file0 |
| Freeze perceptual “convincing preset” thresholds as **product validation criteria**, not as literature-derived psychoacoustic constants. | **ADOPT WITH CONDITIONS** | Direct Risset psychophysics is much thinner than the mathematical literature; the broader beat literature establishes tempo constraints and individual variability, not a universal success percentage for Risset stimuli. citeturn20search0turn21search0turn21search1 |
| State publicly that Nolan explicitly described the Troy sequence in *The Odyssey* as using a “Risset rhythm” and “continuous acceleration”; do **not** infer the exact construction of Göransson's soundtrack track “Troy.” | **ADOPT WITH CONDITIONS** | Nolan directly makes the Risset statement for the Troy sequence; Apple/Back Lot's soundtrack identifies a track titled “Troy.” Neither source discloses layer counts, ratio, envelope, subdivision transformations, session routing, or whether soundtrack-master and film-cue constructions are identical. citeturn19view2turn22search0turn22search2turn22search13 |

### Evidence → Decision Matrix

| Finding / evidence | Evidence strength | Engineering implication | Recommended decision | Confidence | Source(s) |
|---|---|---|---|---|---|
| Risset documented a rhythmic analogue to pitch paradoxes by 1986, including sequences that can sound slower when reproduced faster. | Established primary evidence | Risset terminology has genuine historical basis; avoid attributing invention to modern film composers. | Use “Risset rhythm” historically, with careful scope. | High | Risset, JASA, 1986. citeturn17search0 |
| Classical Risset rhythm uses synchronized, faded streams separated by powers of two; later work formalizes arbitrary ratios as a broader barberpole-tempo family. | Peer-reviewed formal evidence | `r=2` is the canonical named construction; arbitrary `r` needs distinct semantic labeling. | Default/freeze `r=2`; generalized mode explicit. | High | Ghisi, 2021/2023. citeturn17search1 |
| Stowell describes “eternal accelerando” scheduling/composition and tempo-octave layering, with octave range a free construction parameter. | Direct-successor computational-music evidence | Multiple rate-shifted synchronized streams are implementation-valid; no literature-derived unique layer-count optimum. | Do not encode “five layers” as a scientific invariant. | High for construction; low for optimum | Stowell, ICMC 2011 record. citeturn18search10turn18search12 |
| Beat/tactus perception has temporal bounds: roughly 40–240 BPM for the 200–1500 ms beat range in London's account, with preference around 86–120 BPM. | Established synthesis of rhythm-perception literature | Center the dominant audible region near ~100 BPM for baseline stimuli; allow outer layers to become subdivision/texture but do not describe all rates as equally beat-like. | Preset center around 100 BPM; expose “dominant rate region.” | Moderate-high | London, 2004. citeturn21search0 |
| Beat induction was weaker at 1500 ms than 600 ms in a controlled study. | Peer-reviewed direct experiment | Very slow dominant layers are a poorer baseline if the goal is an unambiguous pulse. | Prefer ~600 ms/100 BPM as baseline center over ~40 BPM. | Moderate | McAuley et al., 2012. citeturn20search0 |
| 2:3 and other polyrhythms yield competing beat interpretations; subdivision grouping and pitch affect which stream becomes beat; substantial individual differences occur. | Peer-reviewed experimental evidence | A 3:2 layer changes metrical interpretation and adds a new causal variable. | Separate metric-ambiguity stage; never call it essential to Risset. | High | Polyrhythm studies. citeturn20search15turn20search7 |
| Shepard pitch circularity independently changes perceived direction/height. | Primary psychoacoustic evidence | Pitch motion is a rhythm-study confound. | Pitch coupling off in baseline/MVP. | High | Shepard 1964; Risset 1969. citeturn20search1turn20search5 |
| Web Audio specifies rendering in 128-frame quanta in Web Audio 1.0 and supports realtime/offline contexts on shared base semantics. | Normative standard | Compile a shared semantic render plan; scheduler backend may quantize/process differently. | Require event-plan conformance, not bit-identical browser PCM. | High | W3C Web Audio. citeturn18search1turn19view3 |
| Nolan directly describes the Troy action scoring as “continuous acceleration” and a Risset rhythm, and says Göransson uses it elsewhere in the film. | Direct production statement reported by reputable publication | AGL may discuss documented film use without reconstructing proprietary production details. | Use narrow, source-attributed wording. | High for film-use claim | EW, July 20, 2026. citeturn19view2 |
| The official soundtrack contains a Göransson track titled “Troy”; available production credits list extensive recording/programming/sound-design personnel but no disclosed Risset implementation parameters. | Official/reputable release data; absence-of-evidence constraint | Album-track identity does not reveal cue algorithm. | Do not claim an exact reconstruction of “Troy.” | High | Apple Music; Film Music Reporter. citeturn22search0turn22search2turn22search18 |
| AGL explicitly separates generated/frozen material, has a deterministic graph evaluator, render plan, budget service, and freeze-to-clip. | Established project architecture | Risset should remain procedural until frozen; derived events need lineage. | Integrate rather than create a parallel lab-specific runtime. | High | AGL backlog. fileciteturn0file0 |
| Infinite Staircase is P0 and M2 requires Infinite Staircase acceptance; DR-01 is recorded as unblocking its parameter profile, subdivision work, and listening-test fixture. | Established program state | Semantic decisions below are architecture blockers, while empirical preset optimization can remain lab-ship gated. | Freeze operator semantics now; gate final “convincing” preset on validation. | High | AGL program artifacts. fileciteturn0file1 fileciteturn0file2 fileciteturn0file3 |

## Architecture consequences and ADR candidates

### Architecture consequences

| Affected subsystem | Exact architectural implication | Contract impact | Dependencies | Cost if deferred | Recommendation |
|---|---|---|---|---|---|
| **Canonical project model** | Persist source pattern reference + versioned Risset parameters, not a cache of continuously generated layer events. Materialized events belong only to frozen/export artifacts. | **Public project contract** | AGL-010/011, AGL-027, AGL-060 | High: migration from serialized implementation state | Add `rhythm.risset@1` to schema before M1 schema freeze. fileciteturn0file0 |
| **Exact rational musical time** | Preserve source-pattern positions as rationals. Do not pretend exponentially warped render times are rational. Introduce/use a distinct continuous render-time/sample-frame domain. | **Public/internal temporal contract** | AGL-002/003/041; DR-03 | **Critical**: otherwise later change infects events, files, exports, cache keys | Reconcile before graph/render contracts freeze. |
| **Event/pattern model** | `rhythm.risset` is a procedural temporal transformation/generator whose events are produced for a bounded render interval. Source event IDs remain stable through layer/cycle derivation. | Internal typed contract; possibly public operator port | AGL-003/020/022/023 | High | Do not mutate source pattern or bake rate-warped copies into the canonical pattern. fileciteturn0file0 |
| **Typed operator graph** | Core node owns only rate layering, phase integration, envelope, normalization, and direction. Subdivision shedding, metric overlay, anchor, and pitch coupling are separate nodes/stages. | **Public operator semantics** | AGL-004/020/060/063/064 | High: monolithic v1 becomes permanently difficult to decompose compatibly | Adopt orthogonal operator stages now. fileciteturn0file0 |
| **Control signals** | Log-rate is analytic: \(d\log_r\nu/dt=d/T\). Do not define canonical behavior by periodically sampled automation points. Sampling belongs to a renderer/adapter. | Internal render contract | AGL-041, DR-03/DR-08 | Medium-high | Preserve analytic parameters through compilation. |
| **Render plans** | Render plan needs per-layer analytic rate/phase/gain semantics or precomputed bounded events generated from them. Realtime/offline use the same compiled semantic representation. | **Core internal contract** | AGL-041/045 | Critical | Add an analytic/bounded-event plan representation before AGL-041 freezes. fileciteturn0file0 |
| **Realtime audio** | Schedule actual event times from phase inversion; no timer-driven “multiply tempo then wrap” logic. Keep UI/main-thread timing out of the audio timing contract. | Internal | DR-03, AGL-043/044 | High | DR-03 sets horizon/quantization/event-budget specifics. W3C audio operates in render quanta; use native audio scheduling/AudioWorklet where appropriate. citeturn18search1 |
| **Offline rendering** | Given identical project/plan/sample rate, generated event identities and ideal timestamps must match realtime compilation. PCM hash equality across unrelated browser engines is not required. | Test contract | AGL-041/045/134 | Medium | Golden-test event/sample-frame plans rather than cross-browser waveform bits. |
| **Worker/runtime** | Interval evaluation must be bounded by support width and event count; complexity should scale \(O(K+E)\), not with elapsed project history. | Internal performance contract | AGL-023/025 | High for long-running projects | Derive active layers directly from interval phase. |
| **Budget service** | DR-01 must not invent a scheduler-specific “maximum pulses/sec.” Operator supplies event-count forecasts and accepts a deterministic budget outcome. | Shared internal contract | AGL-025, DR-03 | High if separate caps diverge | Cross-run ownership belongs to DR-03/AGL-025. fileciteturn0file0turn0file3 |
| **Provenance** | Every generated event should identify `operatorVersion`, source event stable ID, layer index, cycle/phase context, and upstream optional-stage lineage. | Public explainability/provenance | AGL-005/020/036 | High | Preserve source identity rather than assigning unrelated IDs each render. |
| **Freeze-to-clip** | Freeze resolves a bounded interval and stores resolved output plus lineage/reference to the generating graph. Subsequent generator edits do not silently mutate frozen content. | Public UX/project semantics | AGL-027/032 | Medium | Use existing generated/frozen architecture. fileciteturn0file0 |
| **Undo/redo** | Parameter edits are ordinary graph commands; applying an Infinite Staircase preset is one transaction even if it inserts multiple orthogonal operators. | Public interaction semantics | AGL-012/034/038 | Medium | Never encode hidden side effects inside `rhythm.risset`. |
| **MIDI** | A continuous multi-rate illusion does not map naturally to one MIDI tempo value. Export should first materialize a bounded event range and state any quantization/layer flattening. | Public export contract | AGL-130 | Medium | Never export an invented “global Risset BPM.” fileciteturn0file0 |
| **MusicXML** | Same limitation: symbolic export represents a finite realization, not the endless operator semantics. | Public export contract | AGL-131 | Medium | Freeze/materialize + warnings. |
| **Visualization / geometry** | Projection contract must expose unwrapped log-rate, wrapped equivalence coordinate, gain/power, phase, layer identity/relabel event, and dominant perceptual band. | **Hard semantic visualization contract** | AGL-050/062 | High for educational correctness | Treat visuals as projections of operator state, not animations invented separately. fileciteturn0file0 |
| **Swift/native / WASM shared core** | Cross-language conformance should compare semantic values/events with specified tolerances, stable ordering, and sample-frame conversion; do not rely on language-specific `pow()` bits being identical. | Internal portability contract | Central native architecture; AGL-047 if shared DSP emerges | High if v1 fixture format assumes JS-only numeric quirks | Publish language-neutral fixtures. |
| **Asset system** | Core synthetic stimuli need no copyrighted audio assets. Loop mode must reference user/allowed assets normally. | Existing asset contract | AGL-014/136 | Low | No soundtrack stems or derived proprietary assets are required. |
| **Accessibility** | Operator explanations require synchronized text equivalents for direction, layer rate, gain, and wrapping; motion cannot be the sole representation. | Hard UX requirement | AGL-053/132 | Medium | Integrate with existing accessibility baseline. fileciteturn0file0 |

The rational-time consequence deserves particular emphasis. With exponential acceleration, event times generally have the form

\[
t_n \propto \log_r(1+C n),
\]

so an exact rational representation of every rendered onset is impossible in the generic case. **AGL-002 remains correct for symbolic musical structure; it must not be overloaded into an allegedly exact representation of irrational/transcendental render times.** The clean architecture is:

\[
\text{exact rational source phase}
\rightarrow
\text{analytic temporal mapping}
\rightarrow
\text{floating render seconds}
\rightarrow
\text{integer sample frames}.
\]

That seam should be explicit in the architecture specification rather than hidden inside the browser backend.

### Proposed ADRs

#### ADR-RI-RISSET-CORE: Classical Risset semantics versus generalized barberpole tempo

**Context**

The literature uses “Risset rhythm” for the powers-of-two construction, while Ghisi provides a broader mathematical framework covering arbitrary subdivisions and non-integer proportions. citeturn17search1

**Decision**

`rhythm.risset@1` SHALL have `equivalenceRatio = 2` as its canonical/public semantic. If the engine exposes arbitrary \(r>1\), it SHALL expose the resulting construction in provenance/UI as a **generalized barberpole-tempo** variant rather than silently asserting that every ratio is classical Risset.

**Alternatives considered**

A generic `ratio` field with no terminology distinction; separate `rhythm.barberpoleTempo` operator; restricting v1 physically to 2 only.

**Consequences**

Classical semantics remain crisp. A generalized operator can reuse the same mathematical kernel. Presets cannot accidentally overstate the historical definition.

**Risks**

Two names around one kernel can create UX complexity.

**Evidence**

Ghisi explicitly separates Risset's powers-of-two ancestor from generalized barberpole constructions. citeturn17search1

**Confidence**

High.

#### ADR-RI-RISSET-TIME: Analytic phase and explicit render-time domain

**Context**

A Risset layer changes rate exponentially; generic event times are not rational. AGL separately requires exact musical time and one render plan for realtime/offline. fileciteturn0file0

**Decision**

Source pattern positions remain exact rationals. The Risset operator persists analytic parameters and generates bounded render-time events through an explicit continuous-time mapping. Render-time conversion to sample frames SHALL have a separately specified deterministic policy. Internal layer phase SHALL be analytic/unwrapped; `fract()` SHALL be presentation-only.

**Alternatives considered**

Accumulated floating time deltas; repeatedly resampling a rational pattern grid; storing every generated event; using wrapped phase as runtime state.

**Consequences**

No cumulative drift; arbitrary seeks are deterministic; generated content remains compact; exact layer closure is testable.

**Risks**

Requires a clearly typed boundary between musical time and render time.

**Evidence**

Construction literature plus mathematical derivation below; AGL's existing split between exact time, graph evaluation, and render planning makes this the least-invasive architecture. citeturn17search1 fileciteturn0file0

**Confidence**

High on the need for separation; **cross-run reconciliation required** for the exact shared render-time/sample-frame type with DR-03.

#### ADR-RI-RISSET-GAIN: Power-domain envelope and normalization semantics

**Context**

Fading is intrinsic to the family of constructions, but literature does not give AGL a uniquely validated loudness-normalization rule. citeturn17search1

**Decision**

`rhythm.risset@1` SHALL declare envelope-domain semantics. Recommended v1 policy:

\[
P_k \ge 0,\qquad
g_k=\sqrt{\frac{P_k}{\sum_j P_j}}
\]

for an envelope defined as **power weight**. The default shape SHALL be raised cosine unless an existing Sprint-0 contract already persisted a conflicting linear-gain interpretation; in that case preserve that behavior as v0 and migrate explicitly.

**Alternatives considered**

Sum of gains = 1; unnormalized gains; RMS measurement/feedback; perceptual loudness normalization.

**Consequences**

A precise invariant, clear diagnostics, and no confusion between gain and power.

**Risks**

Constant \(\sum g_k^2\) does **not** imply constant measured RMS or perceived loudness when streams correlate.

**Evidence**

Smooth fading is well founded; normalization choice is an engineering policy, not a psychoacoustic result. Shepard's pitch construction likewise employed smooth spectral tapering without establishing one universally necessary window. citeturn20search1turn17search1

**Confidence**

High as an engineering contract; moderate that raised cosine is the best product default.

#### ADR-RI-RISSET-COMPOSITION: Orthogonalize illusion from stylistic/experimental stages

**Context**

Subdivision shedding, 3:2 ambiguity, anchor pulses, and pitch motion affect perception but are not mathematically necessary for Risset closure. AGL's graph model and provenance architecture favor visible composition. fileciteturn0file0

**Decision**

Core pipeline:

\[
\text{source pattern}
\rightarrow
[\text{subdivision transform}]
\rightarrow
\text{Risset}
\rightarrow
[\text{metric overlay}]
\rightarrow
[\text{anchor}]
\rightarrow
[\text{pitch coupling/render mapping}]
\]

Bracketed stages are independent operators or explicit graph stages, not hidden switches that alter the definition of Risset.

**Alternatives considered**

One feature-rich Infinite Staircase monolith; preset-only postprocessing not visible in graph.

**Consequences**

Clear provenance, undo, comparisons, bypass, and scientific controls.

**Risks**

More graph nodes; Explore mode must hide unnecessary complexity.

**Evidence**

3:2 beat interpretations are demonstrably independent perceptual structure; pitch circularity is independently effective. citeturn20search15turn20search1

**Confidence**

High.

#### ADR-RI-RISSET-MVP-AUDIO: Event-based synthetic reference stimulus

**Context**

Changing ordinary sample playback speed jointly changes rhythm rate, pitch, and spectral behavior. DR-01 must allow rhythm claims without those confounds, while DR-10 already places general time stretching after MVP. fileciteturn0file3

**Decision**

The normative MVP fixture and listening-study stimulus SHALL be event-based, with a synthetic fixed-timbre trigger independent of layer rate. Loop playback MAY be implemented as a comparison backend but SHALL not define conformance. Pitch-preserving arbitrary-source time stretching is out of v1 scope.

**Alternatives considered**

Loop playback as canonical; bundled soundtrack-derived examples; time-stretched imported audio.

**Consequences**

Cleaner tests and perceptual interpretation; no copyrighted stem dependency.

**Risks**

Synthetic stimuli may be less musically compelling than production audio.

**Evidence**

Engineering isolation of a causal variable; AGL scope already assigns arbitrary-source processing to DR-10. fileciteturn0file3

**Confidence**

High.

#### ADR-RI-RISSET-RENDER: Semantic equality before PCM equality

**Context**

AGL requires one render plan for realtime/offline. Web Audio defines realtime/offline graph rendering and render quanta, but implementations can vary below semantic scheduling level. citeturn18search1turn19view3

**Decision**

Conformance hierarchy:

1. operator parameters and generated event identities;
2. ideal event times;
3. canonical sample-frame assignment at selected sample rate;
4. bounded audio-feature/PCM tolerance within the same reference DSP implementation.

Cross-browser bit-identical PCM SHALL NOT be an acceptance requirement unless DR-03 proves a controlled backend where it is achievable.

**Alternatives considered**

Waveform-hash equality everywhere; browser-specific goldens only.

**Consequences**

Meaningful portability tests rather than brittle DSP hashes.

**Risks**

Requires explicit audio-feature tolerances for backend tests.

**Evidence**

W3C Web Audio plus AGL-041/045/134 architecture. citeturn18search1 fileciteturn0file0

**Confidence**

High; exact scheduler tolerances await DR-03.

#### ADR-RI-RISSET-VIS: Visualize both local monotonicity and global closure

**Context**

An “endless acceleration” UI can easily imply that the composite has a scalar BPM increasing without limit, which is not what the closed layered construction mathematically does.

**Decision**

The lab SHALL expose two linked views: an unwrapped log-rate view showing each layer's local slope, and a wrapped log-rate/equivalence view showing fades and layer relabeling. Layer seam/relabel events SHALL be visible in Inspect mode and describable textually.

**Alternatives considered**

Single BPM gauge; Penrose-stair animation only; 3D cylinder only.

**Consequences**

Educational copy and visualization remain scientifically aligned.

**Risks**

Two-view pedagogy is slightly more complex.

**Evidence**

Consistent with AGL-062's existing requirement to expose layer, gain, phase, relabel, and dominant-band state. fileciteturn0file0

**Confidence**

High.

## Formal contracts, defaults, and test oracle

### Mathematical / Behavioral Contracts

#### Canonical coordinates

Let:

\[
r>1
\]

be the tempo-equivalence ratio, with classical Risset

\[
r=2.
\]

Let

\[
d \in \{-1,+1\}
\]

represent direction, where \(+1\) is acceleration and \(-1\) deceleration.

Let \(T>0\) be the time required for a persistent layer to traverse one equivalence interval. Its clock domain **must be explicit**.

Define unwrapped cycle coordinate:

\[
q(t)=q_0+d\frac{t-t_0}{T}.
\]

The wrapped UI coordinate is:

\[
u(t)=q(t)-\lfloor q(t)\rfloor.
\]

**Invariant:** runtime scheduling SHALL use \(q\), never \(u\), as its primary temporal state.

For integer layer index \(k\in\mathbb Z\), with reference source-cycle rate \(\nu_{\rm ref}>0\):

\[
\nu_k(t)=\nu_{\rm ref}\,r^{k+q(t)}.
\]

Therefore

\[
\frac{d}{dt}\log_r\nu_k(t)=\frac{d}{T}.
\]

This is the normative direction semantics:

\[
d=+1\Rightarrow\dot{\nu}_k(t)>0,
\qquad
d=-1\Rightarrow\dot{\nu}_k(t)<0.
\]

After one cycle,

\[
\nu_k(t+T)=\nu_{k+d}(t).
\]

That is the **rate relabel invariant**.

#### Exact source-phase closure

A rate curve alone does not guarantee a seamless trigger pattern. Define source-cycle phase in cycles as

\[
\Phi_k(t)
=
\phi_0+
\frac{\nu_{\rm ref}T}{d\ln r}\,
r^{k+q(t)}.
\]

Then

\[
\frac{d\Phi_k}{dt}
=
\nu_{\rm ref}r^{k+q(t)}
=
\nu_k(t),
\]

and, critically,

\[
\Phi_k(t+T)=\Phi_{k+d}(t).
\]

Thus both rate and source phase relabel exactly.

For a source pattern containing rational phase positions

\[
p_j\in[0,1),\qquad j=0,\ldots,M-1,
\]

an event occurs whenever

\[
\Phi_k(t)=n+p_j,\quad n\in\mathbb Z.
\]

No repeated floating-point accumulation is required.

For an interval starting at \(t_a\), define

\[
\Delta\Phi
=
\Phi_k(t)-\Phi_k(t_a)
=
\frac{\nu_k(t_a)T}{d\ln r}
\left(
r^{d(t-t_a)/T}-1
\right).
\]

Inverting for a desired positive phase advance \(\Delta\Phi\):

\[
\boxed{
t-t_a=
\frac{T}{d\ln r}
\ln\left(
1+
\frac{d\ln r}{\nu_k(t_a)T}\Delta\Phi
\right)
}
\]

subject to a positive logarithm argument.

This equation should be used to calculate absolute event times from event ordinal/source phase, not by summing inter-event durations.

#### Envelope and normalization

Define layer coordinate relative to the dominant rate center:

\[
z_k(t)=k+q(t)-c.
\]

For raised-cosine **power** envelope with support half-width \(B\):

\[
P_B(z)=
\begin{cases}
\frac12\left[1+\cos\left(\frac{\pi z}{B}\right)\right], & |z|<B\\[4pt]
0,& |z|\ge B.
\end{cases}
\]

Require:

\[
B>0.5
\]

so at least one integer layer lies strictly within support for all fractional \(q\).

Let

\[
S(t)=\sum_jP_B(z_j(t)).
\]

Normalized amplitude gain:

\[
\boxed{
g_k(t)=\sqrt{\frac{P_B(z_k(t))}{S(t)}}
}
\]

and therefore

\[
0\le g_k\le1,\qquad
\sum_kg_k^2=1
\]

within floating tolerance.

Because

\[
z_k(t+T)=z_{k+d}(t),
\]

the power envelope also relabels:

\[
P_k(t+T)=P_{k+d}(t).
\]

With identical layer timbre and the phase invariant above, the ideal composite is therefore globally closed under relabeling even though each persistent layer has a locally monotonic rate.

**Important non-equivalence:** \(\sum g_k^2=1\) is **not** a claim of constant perceived loudness, and correlated coincident pulses can add coherently. The final audio safety path remains AGL-049's responsibility. fileciteturn0file0

For \(N\) simultaneously active unit-amplitude streams,

\[
\sum_k g_k\le\sqrt{N}
\]

by Cauchy-Schwarz. That is a useful pre-voice mixing bound, not a full audio-peak bound when pulse tails overlap.

#### Pattern rate versus BPM

The kernel should use **source-cycle rate**, not a casually named BPM field.

If a source declares \(b\) perceived/nominal beats per pattern cycle,

\[
\operatorname{BPM}_k(t)
=
60\,b\,\nu_k(t).
\]

Without that source metadata, the kernel SHALL call \(\nu\) “cycle rate,” not “tempo BPM.” This prevents a four-beat pattern running at one cycle/second from being misreported as 60 BPM rather than a nominal 240 quarter-note BPM.

#### Active layers

The mathematical operator is integer-indexed but a compact envelope makes the audible set finite:

\[
K(t)=\left\{k\in\mathbb Z:|z_k(t)|<B\right\}.
\]

For interval rendering, enumerate the union of all indices whose support intersects \([t_a,t_b)\); do **not** instantiate every historic layer from time zero.

Layer identity SHALL be the conceptual integer \(k\), not the current render-slot number.

A fixed array of render slots may be reused internally, but slot reuse must never change provenance identity.

#### Interval semantics

All event generation SHALL use half-open intervals:

\[
[t_a,t_b).
\]

This prevents double-generation when adjacent render windows touch.

Stable event ordering for equal timestamps SHALL be lexicographic over a specified tuple such as:

\[
(
t,
k,
\text{sourceEventStableId},
\text{sourceCycleOrdinal}
).
\]

Do not depend on hash-map insertion order, browser sort instability, or worker completion order.

#### Deterministic IDs

A generated trigger should derive its identity from semantic lineage, for example:

```text
hash(
  operatorInstanceStableId,
  operatorVersion,
  sourceEventStableId,
  conceptualLayerIndex,
  sourceCycleOrdinal
)
```

`renderSlot`, worker chunk number, current look-ahead window, and wall-clock execution time SHALL NOT participate.

#### Loop-based implementation

A loop backend may use

\[
\text{playbackRate}_k(t)\propto\nu_k(t)
\]

with gain \(g_k(t)\) and phase derived from \(\Phi_k\). Ordinary variable-speed playback also changes pitch/spectral content; therefore this backend is a comparison/rendering choice, not the normative rhythm-only research stimulus. Pitch-preserving arbitrary-input processing remains aligned with post-MVP DR-10. fileciteturn0file3

### Framework-independent reference pseudocode

```text
function rissetEvents(params, sourcePattern, interval):
    require params.ratio > 1
    require params.cycleDuration > 0
    require params.supportHalfWidth > 0.5
    require params.direction in {-1, +1}

    qA = q(interval.start)
    qB = q(interval.end)

    layerIndices = allIntegerLayersWhoseEnvelopeSupportIntersects(
        min(qA, qB),
        max(qA, qB),
        params.supportHalfWidth,
        params.envelopeCenter
    )

    result = []

    for k in layerIndices:
        phaseA = sourcePhase(k, interval.start)
        phaseB = sourcePhase(k, interval.end)

        // phase is monotonically increasing for both directions
        low  = phaseA
        high = phaseB

        for sourceEvent in sourcePattern.events:
            p = sourceEvent.phase  // exact rational in [0,1)

            firstCycle = ceil(low - p)
            lastCycleExclusive = ceil(high - p)

            for n from firstCycle to lastCycleExclusive - 1:
                targetPhase = n + p
                t = invertPhase(k, targetPhase)

                if interval.start <= t < interval.end:
                    gains = normalizedLayerGainsAt(t)

                    emit {
                        time: t,
                        sourceEventId: sourceEvent.id,
                        conceptualLayerIndex: k,
                        sourceCycleOrdinal: n,
                        gain: gains[k],
                        rate: rate(k, t),
                        phase: targetPhase
                    }

    stableSort(result,
        time,
        conceptualLayerIndex,
        sourceEventId,
        sourceCycleOrdinal)

    enforceBudget(result.length)

    return result
```

An optimized implementation should not recompute every layer's complete gain vector for every event when the same result can be derived analytically/cached; that optimization may not alter semantics.

### Test Oracle and Fixture Pack

#### Unit invariants

| Test | Input | Expected oracle / tolerance | Why it matters | Basis |
|---|---|---|---|---|
| Rate relabel | Arbitrary valid \(r,T,q,k,t\) | \(\nu_k(t+T)=\nu_{k+d}(t)\), relative error ≤ \(10^{-12}\) in reference Double implementation | Defines global closure | Mathematical consequence of Risset log-rate construction. citeturn17search1 |
| Phase relabel | Same | \(\Phi_k(t+T)=\Phi_{k+d}(t)\), modulo source cycle ≤ \(10^{-12}\) cycles | Prevents audible seam despite matching rates | Derived contract |
| Direction | Random valid params | Sign of finite difference of \(\log_r\nu_k\) equals `direction` everywhere | Prevents inverted semantics | Derived contract |
| Phase derivative | Random \(t\) away from numerical extremes | Numerical derivative of \(\Phi\) agrees with \(\nu_k\) to reference derivative tolerance | Proves phase/rate consistency | Derived contract |
| Power bound | Random \(q,k\) | \(0\le P\le1\) | Gain safety | Derived contract |
| Power normalization | Random phases/supports | \(|\sum g_k^2-1|\le10^{-12}\) | Makes declared normalization exact | Engineering contract |
| No zero denominator | \(B>0.5\), random \(q\) | \(S(t)>0\) | Prevents NaN gain | Mathematical support bound |
| Half-open window | Same event exactly at split \(b\) | Present in `[b,c)`, absent from `[a,b)` | Prevent duplicate realtime chunks | Deterministic scheduling |
| Stable tie ordering | Coincident phases on several layers | Exact specified lexical order | JS/Swift/worker conformance | Determinism |
| Integer phase shift | \(\phi_0 \to \phi_0+m,m\in\mathbb Z\) | Identical audible trigger times | Phase-equivalent stimulus | Source pattern periodicity |
| No mutable-history dependence | Seek directly to interval vs render from zero | Same event set and values | Random access/project reproducibility | AGL deterministic architecture. fileciteturn0file0 |

The \(10^{-12}\) figures above are **reference-kernel arithmetic tolerances**, not audio scheduling tolerances. DR-03 should define browser scheduling/sample-frame tolerances.

#### Property-based tests

Generate over:

\[
r\in(1,4],\quad
T>0,\quad
q_0\in[-10,10],\quad
k\in[-16,16],
\]

with extreme ranges extended in dedicated numerical tests rather than normal random generation.

Properties:

1. phase is monotonically increasing for both acceleration and deceleration;
2. event timestamps within one layer are strictly increasing unless the source itself contains coincident event phases;
3. every generated event maps back to its declared source phase modulo one;
4. splitting interval \(I=[a,c)\) at arbitrary \(b\) produces exactly the same ordered event multiset as rendering \(I\) in one call;
5. changing worker/chunk size does not alter event identity or values;
6. conceptual layer enumeration plus compact support is finite for every bounded interval;
7. direct seek and sequential generation are semantically identical.

These tests belong naturally in AGL-133's property/invariant suite. fileciteturn0file0

#### Metamorphic tests

**One-cycle relabel.**

Render semantic layer state over \(t\) and \(t+T\). After replacing every layer ID \(k\) with \(k-d\) in the second observation, rate, phase, and envelope state must match the first.

**Chunking metamorphism.**

\[
R([a,c)) = R([a,b)) \Vert R([b,c))
\]

after stable merge. This should hold for arbitrary \(b\), including an exact cycle seam.

**Clock-origin metamorphism.**

Changing absolute application wall-clock origin while preserving operator-local \(t-t_0\) must not alter any result.

**Render-mode metamorphism.**

Realtime-plan compilation and offline-plan compilation from the same project interval must produce the same canonical event IDs and ideal times before backend quantization.

**Freeze metamorphism.**

Freeze interval \(I\), then reevaluate the unchanged source graph: generated output over \(I\) must equal the frozen semantic event fixture. After upstream edit, frozen output remains unchanged while regenerated output changes and lineage makes the distinction observable. This exercises AGL-027/032. fileciteturn0file0

#### Exact numeric golden fixture

Use:

```text
fixture: risset-basic-2x-8s-v1
ratio r            = 2
direction d        = +1
cycle T            = 8 s
q0                 = 0
reference rate     = 1 source-cycle/s
source phases      = [0]
layer k            = 0
```

Relative accumulated source phase from \(t=0\) is:

\[
\Delta\Phi(t)
=
\frac{8}{\ln2}
\left(2^{t/8}-1\right).
\]

The \(n\)-th event after \(t=0\) is:

\[
t_n=
8\log_2\left(1+\frac{n\ln2}{8}\right).
\]

Reference values:

| \(n\) | \(t_n\) seconds |
|---:|---:|
| 1 | 0.959028565 |
| 2 | 1.844445640 |
| 3 | 2.666750420 |
| 4 | 3.434344603 |
| 5 | 4.154056392 |

For layer \(k=+1\):

| \(n\) | \(t_n\) seconds |
|---:|---:|
| 1 | 0.489472547 |
| 2 | 0.959028565 |
| 3 | 1.410225678 |
| 4 | 1.844445640 |
| 5 | 2.262919854 |

For layer \(k=-1\):

| \(n\) | \(t_n\) seconds |
|---:|---:|
| 1 | 1.844445640 |
| 2 | 3.434344603 |
| 3 | 4.831510429 |
| 4 | 6.077659105 |
| 5 | 7.202275799 |

At exactly \(T=8\) s:

\[
\nu_0(8)=2\nu_0(0)=\nu_1(0).
\]

These fixtures are derived from the contract, not empirical psychoacoustics.

A gain golden fixture can use a deliberately simple fixture-specific \(B=2\), \(q=0\), and layer coordinates \(-1,0,+1\):

\[
P=[0.5,1,0.5].
\]

After power normalization:

\[
g=
[0.5,\;1/\sqrt2,\;0.5]
=
[0.5,\;0.7071067811865475,\;0.5],
\]

with

\[
\sum g^2=1.
\]

#### Cross-platform conformance

The JS/browser, Swift/native, and any WASM/shared-core implementation should consume the **same JSON fixture inputs** and produce:

- same ordered event identities;
- same conceptual layer indices and source ordinals exactly;
- phase/rate/gain numeric values within specified Double tolerance;
- ideal event times within `max(1 ns, implementation-agreed ULP tolerance)` at the semantic layer;
- same integer sample frame after the central render-plan project defines the canonical seconds→frames rounding policy.

Do **not** use raw serialized floating-point bytes as the cross-language contract.

At the audio layer, compare timing and aggregate features before considering sample-level comparisons. Cross-browser realtime/offline behavior belongs in AGL-134/DR-03. fileciteturn0file0turn0file3

#### Performance tests

The generator SHALL be output-sensitive:

\[
O(K+E)
\]

for \(K\) potentially active conceptual layers and \(E\) emitted events in the requested interval, excluding stable sort where necessary.

For \(M\) source events per source cycle and layer phase advance \(\Delta\Phi_k\), a conservative per-layer event-count forecast is approximately bounded by:

\[
E_k\le M\left(\lceil\Delta\Phi_k\rceil+1\right).
\]

Test:

- arbitrary seek 1 hour into a project must not enumerate the preceding hour;
- one-cycle rendering after a million conceptual prior cycles must cost essentially the same as cycle zero;
- splitting into 10, 100, or 1000 scheduler windows must produce identical events;
- pathological high-rate requests must go through AGL-025/DR-03 budget behavior rather than freeze the worker;
- no hidden `setTimeout`/animation-frame loop may be required to advance mathematical phase.

The actual maximum events/second and scheduler deadline belong to DR-03 rather than DR-01. AGL-043 and AGL-134 are already explicitly DR-03-gated. fileciteturn0file0turn0file3

### Recommended Defaults

The evidence is strong enough to choose exact mathematical semantics, but **not** strong enough to pretend that one layer count/cycle length/window is a psychoacoustically proven optimum. Those values must therefore carry different confidence.

| Parameter | Default | Valid / recommended range | Rationale | Evidence strength | User-facing? |
|---|---:|---|---|---|---|
| `operatorVersion` | `1` | exact | Compatibility boundary | Engineering requirement | Inspect |
| `equivalenceRatio` | **2.0** | Core Risset: exactly 2; generalized math: \(r>1\) | Powers-of-two construction is the classical Risset case. citeturn17search1 | **High** | Yes |
| `direction` | `accelerate` | accelerate / decelerate | Both are mathematically symmetric; acceleration is simplest onboarding narrative. | High semantics; default is product choice | Yes |
| `cycleDuration` | **20 s provisional** | **No evidence-backed optimum.** Initial Explore guardrail suggested 8–40 s pending pilot. | Long enough to avoid an obvious rapid seam, short enough for interactive comparison. This is an engineering/product choice, not literature-established. | Low | Yes |
| `clockDomain` | **Required; no generic schema default** | explicit supported domains only | Seconds vs transport beats materially changes behavior under tempo edits. Infinite Staircase research fixture should use absolute/render seconds until cross-run decision. | High need; default unresolved | Inspect/Compose |
| dominant beat center for baseline one-beat stimulus | **100 BPM** | broad perceptual beat range ~40–240 BPM; strongest/preferred region substantially narrower | 600 ms/100 BPM lies near preferred beat timing; London reports preferred 500–700 ms and tactus range ~200–1500 ms. citeturn21search0turn20search0 | Moderate-high, indirect to Risset | Explore |
| `envelope.kind` | `raisedCosinePower` | Other smooth shapes only in Inspect/experimental | Smooth taper is appropriate; precise choice not perceptually established. | Moderate construction, low optimization | Inspect |
| `supportHalfWidth` | **2.5 equivalence intervals provisional** | Mathematical requirement \(>0.5\); product range not evidence-established | Gives a several-layer overlapping field while retaining compact finite support. **Engineering default only.** | Low | Inspect |
| independent `layerCount` | **None** | derived from support | Avoids making implementation slots part of mathematical semantics | High engineering confidence | No |
| `normalization` | `instantaneousPower` | v1 fixed or explicit enum | Makes \(\sum g^2=1\) testable; not a loudness claim | High engineering; low psychoacoustic optimality | Inspect |
| `phaseOrigin` | `0 cycles` | any real; integer shifts audibly equivalent for periodic source | Deterministic fixture origin | Mathematical | Inspect |
| source pattern | one-beat synthetic trigger for canonical fixture | user patterns in Compose | Isolates temporal illusion | Strong methodological inference | Explore/Compose |
| layer timbre | identical fixed pulse | identical recommended for research | Prevents timbral stream identity from becoming an uncontrolled cue | Strong methodological inference | Usually no |
| subdivision shedding | off | separate operator | Not part of core Risset definition | High | Toggle in guided experiment |
| 3:2 ambiguity | off | separate experimental stage | Evidence supports beat ambiguity, not stronger Risset illusion. citeturn20search15 | High separation; low efficacy | Experimental |
| anchor pulse | off | separate control | Preserves uncontaminated baseline | Moderate | Guided experiment |
| pitch coupling | off | separate P1 stage | Prevents pitch-direction confound. citeturn20search1 | High | Compose/experiment |
| event-rate cap | **No DR-01 default** | DR-03/AGL-025-owned | Backend capacity is architecture/platform evidence, not psychoacoustics | High | Diagnostics only |
| safety/master gain | **No DR-01 default** | AGL-049-owned | Constant layer power does not bound arbitrary overlapping voice output | High | Mixer |
| source loop time-stretch mode | none in core v1 | post-MVP | DR-10 scope | High | No |

**The 20 s cycle and 2.5 support width should not be canonized as “research-proven.”** They are useful implementation defaults only if their evidence status is encoded in the preset metadata and AGL-061 remains responsible for replacing or validating them. fileciteturn0file0

### Listening-study protocol and acceptance oracle

Because direct Risset psychophysics does not establish a universal threshold, the following is an **AGL validation contract**, not a literature fact.

**Primary design:** within-subject, randomized, headphones-preferred controlled study with at least 24 analyzable adults for the initial lab gate. Record musical/rhythm training, device/browser, headphone/speaker use, and self-reported relevant hearing limitations rather than assuming a homogeneous population. Broader rhythm research demonstrates tempo sensitivity and individual differences in beat selection. citeturn20search0turn20search7turn21search1

Core conditions should include:

| Condition | Purpose |
|---|---|
| Single locally accelerating layer | Positive acceleration control without endless closure |
| Risset stacked/faded rhythm | Target illusion |
| Risset deceleration | Direction symmetry |
| Same target + fixed anchor | Reference/control manipulation |
| 3:2 overlay | Experimental metric-ambiguity condition, not MVP efficacy assumption |
| Pitch-coupled Risset | Exploratory confound demonstration only |
| Level-ramped but nonaccelerating rhythm | Checks whether listeners confuse loudness growth with acceleration |

For the scientific baseline, use fixed-timbre synthetic triggers and the same instantaneous-power normalization across direction conditions. Do not couple pitch, brightness, or source-sample playback speed.

**Primary measures:**

1. forced choice: “speeding up” versus “slowing down”;
2. confidence, e.g. 1–5;
3. seam/reset localization in four equal cycle regions;
4. optional continuous “speeding/slowing” rating for exploratory analysis.

The seam task should randomize cycle phase across trials so that a participant cannot memorize a visual or absolute-time reset.

**Proposed product acceptance gate for a “convincing” baseline preset:**

- intended-direction point estimate \(\ge 75\%\);
- participant-level or mixed-model 95% interval excludes chance \(0.5\) in the correct direction;
- four-way seam localization is statistically equivalent to chance \(0.25\) within a **predeclared ±0.15 product margin**, rather than merely obtaining a nonsignificant \(p\)-value;
- acceleration and deceleration both pass rather than accepting only the easier direction;
- no systematic master-level or fixed-timbre difference explains direction;
- results and equipment metadata are retained with the preset evidence record.

The 75%, ±0.15, and \(N=24\) thresholds are **engineering validation thresholds selected here**, not values found in the Risset literature. They should be reviewed after the first pilot, without moving the goalposts after looking at outcomes.

## UX, visualization, and scientific claims

### UX / Visualization Implications

| User goal | Must be visible | Interaction behavior | Scientific meaning | Misleading representation to avoid | Accessibility / mode implications |
|---|---|---|---|---|---|
| Understand why acceleration can recur | Individual layer slopes + wrapped seam/relabel | Scrub through cycle and watch identity handoff | Local monotonic \(\nu_k(t)\), global relabel closure | One endlessly rising BPM gauge | **Explore:** simplified linked strip; **Inspect:** IDs, equations, phase. Text equivalent required. |
| Hear construction emerge | Active layer count, gain/fade state | Guided toggles: single layer → stack → fade → wrap | Separates local rate change from barberpole closure | Playing final effect first and claiming every element is necessary | AGL-037 guided experiment is the right integration target. fileciteturn0file0 |
| Compare acceleration/deceleration | Explicit direction and slope | Direction flip preserves other parameters | Sign of \(d\log\nu/dt\) | Reversing an audio file and calling that the mathematical inverse | Keyboard-toggleable; announce state. |
| Understand “tempo octave” | Log-rate axis marked \(\times2,\times4,\frac12\) | Hover/select shows ratio and absolute cycle rate | Equal distance means multiplicative change | Linear BPM spacing | Non-color labels and tick shapes. |
| Understand multiple tempi | Per-layer cycle rate and a highlighted dominant region | Select any layer | No unique physical global BPM exists | A single global numeric BPM for the composite | Screen-reader table of layer states. |
| Inspect fading | Power weight and amplitude gain distinguished | Toggle raw weight vs normalized gain | \(P\) and \(\sqrt{P/S}\) have different units/meaning | Calling both “volume” | Numerical text values; not color-only. |
| See exact closure | Seam/relabel marker and before/after matching identities | Step just before/after \(u=0\) | \(k\leftrightarrow k+d\) equivalence | Hiding seam so thoroughly that the math becomes uninspectable | Inspect exposes seam even when audio does not. |
| Explore source pattern effect | Pattern phases/accent positions | Edit in Compose, retain stable IDs | Rate warps a recurring source structure | Suggesting source accents are part of Risset definition | Keyboard-editable pattern. |
| Learn subdivision shedding | Separate stage shown in graph | Bypass independently | Symbolic density transformation | Rendering it as a hidden Risset property | Explore may use one toggle; Compose shows node. |
| Test stable reference | Anchor shown separately | Toggle A/B without resetting other params | External temporal reference/control | Labeling anchor “illusion breaker” as proven fact | Include text hypothesis. |
| Explore 3:2 ambiguity | Both periodicities and chosen ratio | A/B with baseline | Competing metric interpretations | “3:2 makes Risset stronger” | Experimental badge/evidence status. |
| Explore Shepard coupling | Independent pitch state | Toggle only after rhythm baseline | Additional circular pitch cue | Letting pitch-coupled success validate rhythm-only claim | Reduced-motion visual option; auditory explanation. |

The **hard UX contract** should be: *no view may imply that the composite has one physical tempo that increases without bound*. The user should see both:

\[
\text{local layer acceleration}
\quad+\quad
\text{global recurrence by relabeling}.
\]

A wrapped **log-tempo strip** should be primary in Explore because it is readable in 2D. Inspect can offer a cylindrical representation, where the circumference is log-rate modulo \(\log r\) and longitudinal progression is unwrapped cycle/time. A Penrose/escalator/barber-pole analogy is pedagogically useful but must remain an analogy, not the data coordinate system. AGL-062's existing log-tempo deliverable is therefore directionally correct and should be strengthened rather than replaced. fileciteturn0file0

### User-facing scientific claims

#### Safe to state directly

> **“A Risset rhythm is a rhythmic auditory illusion related to Shepard/Risset circular-pitch constructions, built from multiple rhythmic streams whose rates and levels are coordinated so that local acceleration or deceleration can recur.”**

Risset explicitly documented a rhythmic analogue in 1986, and subsequent work describes synchronized faded streams and eternal accelerando/decelerando constructions. citeturn17search0turn17search1turn18search10

> **“The classical Risset construction uses rates related by factors of two—tempo ‘octaves.’”**

Ghisi identifies powers-of-two layers as the Risset ancestor of the broader barberpole-tempo family. citeturn17search1

> **“Individual layers can keep accelerating locally even though the overall construction returns to an equivalent state when the layers exchange roles.”**

This is the direct mathematical closure represented by the v1 equations above and is consistent with the layered construction described in the computational literature. citeturn17search1turn18search10

> **“Christopher Nolan described the music accompanying the Troy sequence in *The Odyssey* as using a Risset rhythm—a continuous rhythmic acceleration intended to increase tension.”**

This is directly attributable to Nolan's July 20, 2026 interview. citeturn19view2

> **“Ludwig Göransson's official *The Odyssey* soundtrack includes a track titled ‘Troy.’”**

The album was released July 17, 2026 and lists “Troy.” citeturn22search0turn22search2turn22search13

#### Safe only with qualification

> **“A Risset rhythm can create the impression of endless acceleration.”**

Required qualification: “Perception varies by stimulus parameters and listener; ‘endless’ describes the intended illusion, not an objectively unbounded physical tempo.” Broader beat research documents tempo constraints and individual variation. citeturn21search0turn21search1turn20search7

> **“AGL's Infinite Staircase demonstrates the same psychoacoustic principle used in *The Odyssey*.”**

Required qualification: “Nolan publicly identifies the film's Troy sequence as using a Risset rhythm; AGL uses a synthetic educational construction and does not claim to reproduce Göransson's production session or soundtrack cue exactly.” citeturn19view2

> **“A stable anchor pulse may reduce the sense of endlessly shifting tempo.”**

Required qualification: “This is an AGL experimental hypothesis/control manipulation; direct Risset-specific evidence is insufficient to present it as established.”

> **“3:2 ambiguity can make the perceived beat less determinate.”**

Required qualification: “Polyrhythm research supports competing metric interpretations and strong subdivision effects, but there is not adequate evidence that 3:2 specifically strengthens a Risset illusion.” citeturn20search15turn20search7

> **“The normalized envelope keeps the layers at constant power.”**

Required qualification: “It keeps the **sum of squared layer gains** constant by construction; it does not guarantee constant waveform RMS, peak level, or perceived loudness.”

> **“Rates above the normal beat range become more texture-like or subdivision-like.”**

Required qualification: This reflects broad beat-perception limits; London reports very rapid periodicities tending to be heard as subdivisions and a preferred tactus range around 500–700 ms. It is not a hard physiological cutoff. citeturn21search0

#### Do not claim

**Do not say Nolan and Hans Zimmer invented the Risset rhythm.** Nolan says they “came up with”/embraced it on *Dunkirk*, but Risset's published rhythmic work predates *Dunkirk* by decades. Public copy should interpret Nolan's statement as referring to their use/application, not historical invention. citeturn19view2turn17search0

**Do not say AGL reconstructs Göransson's “Troy” exactly.** No authoritative source found here discloses its layer count, precise rate ratio, envelope, clock, subdivision rules, DAW routing, source-material treatment, or album-versus-film cue equivalence. citeturn19view2turn22search18

**Do not claim Göransson used AGL's 2:1 ratio, 20 s cycle, raised-cosine power window, five-ish active layers, subdivision shedding, 3:2 metric ambiguity, anchor pulses, or Shepard pitch coupling in “Troy.”** Those details are not established by the available production sources. citeturn19view2turn17search3

**Do not say every listener hears endless acceleration.** Beat interpretation varies with tempo, hierarchy, acoustics, and listener. citeturn20search0turn20search7turn21search1

**Do not call raised-cosine/equal-power normalization “psychoacoustically optimal.”** No evidence reviewed establishes that.

**Do not report a third-party static BPM estimate for “Troy” as its authoritative tempo.** The relevant public production description is explicitly one of acceleration, and no production tempo map has been disclosed. citeturn19view2

## Implementation sequencing and backlog deltas

### Implementation Recommendations

| Timing | Item | Impact | Complexity | Primary dependency |
|---|---|---:|---:|---|
| **Before MVP architecture freezes** | Freeze `rhythm.risset@1` equations, direction, index, phase, support, normalization, and terminology. | Critical | M | ADR-RI-RISSET-CORE/TIME/GAIN |
| **Before MVP architecture freezes** | Make musical-time → analytic-warp → render-seconds → sample-frame domains explicit. | **Critical** | L | DR-03 + AGL-002/003/041 |
| **Before MVP architecture freezes** | Decide serialization semantics for Sprint-0 raised-cosine envelope: linear gain or power. Version/migrate rather than silently change. | Critical | S–M | Existing Sprint-0 code + AGL-010/011 |
| **Before MVP architecture freezes** | Separate subdivision/metric/anchor/pitch stages from core Risset graph semantics. | High | M | AGL-020/060/063 |
| **Before MVP architecture freezes** | Define stable generated-event IDs independent of worker/render chunking. | Critical | M | AGL-005/020/023 |
| **Before MVP architecture freezes** | Add Risset analytic/bounded-event representation to canonical render plan. | Critical | L | AGL-041 + DR-03 |
| **Before affected lab ships** | Implement numeric/property/metamorphic fixture pack above. | Critical | M | AGL-133 |
| **Before affected lab ships** | Add direct-seek, chunk-independence, freeze/lineage, and realtime/offline-plan tests. | High | M | AGL-027/041/134 |
| **Before affected lab ships** | Run the parameter pilot before calling any preset “convincing.” | High | M | AGL-061/065 |
| **Before affected lab ships** | Implement wrapped + unwrapped log-tempo views and semantic text. | High | M | AGL-050/053/062 |
| **Before affected lab ships** | Add qualified *Odyssey/Troy* educational copy and source provenance. | Medium | S | Evidence registry/content review |
| **Before affected lab ships** | Ensure MIDI/MusicXML finite-realization warnings. | Medium | S–M | AGL-130/131 |
| **Can safely happen after core MVP** | Shepard pitch coupling. | Medium | M | AGL-064 |
| **Can safely happen after core MVP** | Generalized non-2:1 barberpole authoring UI. | Medium | M | Core operator/kernel |
| **Can safely happen after core MVP** | Loop-based musical sampler UX. | Medium | L | Asset/audio infrastructure |
| **Can safely happen after MVP** | Pitch-preserving arbitrary-source time stretch. | Low for DR-01 MVP | XL | DR-10 |
| **Research-only / experimental** | Assertive 3:2 “illusion strengthening” preset. | Low until validated | M | Dedicated factorial pilot |
| **Research-only / experimental** | Perceptual loudness normalization stronger than power normalization. | Medium | L | Controlled listening/measurement |

### Backlog Deltas

**MODIFY — AGL-060: Infinite Staircase canonical graph migration**

**Rationale:** Its current acceptance only says source pattern and Risset operator become graph nodes. That is insufficient to prevent a monolithic or temporally ambiguous implementation. fileciteturn0file0

**Suggested acceptance criteria:** `rhythm.risset@1` is versioned; source remains exact-rational; rate/phase mapping is analytic; direction and layer indexing are explicit; generated IDs are chunk-independent; optional subdivision/anchor/metric/pitch stages are not hidden core state.

**Dependencies:** AGL-020/022/041; time-domain ADR.

**Milestone:** M2, but schema-impacting decisions must land during M1.

**MODIFY — AGL-061: Risset psychoacoustic parameter profile**

**Rationale:** Separate scientific invariants from provisional product defaults.

**Suggested acceptance criteria:** `r=2` accepted as canonical; 100 BPM baseline dominant center documented; 20 s cycle and support width marked provisional until pilot; no unsupported “optimal layer count” claim; evidence confidence stored per preset; final convincing preset satisfies predeclared listening gate.

**Dependencies:** AGL-065.

**Milestone:** M2.

**SPLIT — AGL-063: Source-pattern and subdivision engine**

Current title combines two separable responsibilities. fileciteturn0file0

**Part A: source-pattern contract.** Exact rational source phases, accents, stable IDs, pattern-cycle metadata.

**Part B: subdivision-shedding operator.** Versioned deterministic transformation with explicit retention/shedding rules, independent bypass, and provenance.

**Acceptance:** bypass of subdivision stage produces exactly the original source pattern; transformation is deterministic and visible; no Risset parameter implicitly changes symbolic subdivisions.

**Dependency:** AGL-060; DR-08 vocabulary if sonification/mapping conventions affect stage names.

**Milestone:** M2.

**MODIFY — AGL-062: Log-tempo visualization**

**Rationale:** Existing scope is strong but should become a scientific semantic contract. fileciteturn0file0

**Acceptance:** simultaneous wrapped/unwrapped representation; logarithmic axis; current rate, gain/power, phase, conceptual layer ID, relabel seam, and dominant beat region exposed; no sole global BPM gauge; accessible synchronized text; reduced-motion mode.

**Dependencies:** AGL-050/053/060.

**Milestone:** M2.

**MODIFY — AGL-065: Infinite Staircase listening-test fixture**

**Rationale:** Current “reset detection and perceived direction” wording lacks controls, thresholds, randomization, and confound policy. fileciteturn0file0

**Acceptance:** randomized acceleration/deceleration; baseline single layer; target Risset; anchor control; fixed-timbre rhythm-only stimuli; seam phase randomized; direction + confidence + seam measures; predeclared analysis; equipment metadata; acceptance threshold versioned; test fixture itself deterministic.

**Dependencies:** AGL-061, AGL-041/045.

**Milestone:** M2.

**MODIFY — AGL-064: Shepard pitch coupling**

**Rationale:** Current “independent bounded pitch coupling” is correct and should explicitly prohibit using pitch-coupled success as the acceptance test for a rhythm claim. fileciteturn0file0

**Acceptance:** off by default; independent bypass; provenance records coupling; rhythm-only fixture still passes separately.

**Dependencies:** AGL-060.

**Milestone:** P1 / after core Infinite Staircase acceptance.

**MODIFY — AGL-041: Audio render plan**

**Rationale:** Risset exposes why the render plan needs a defined continuous temporal mapping and canonical sample-frame boundary rather than only rational musical positions. fileciteturn0file0

**Acceptance:** one analytic/generated event plan drives realtime/offline; explicit time domain; deterministic seek; sample-frame quantization contract delegated/resolved with DR-03.

**Dependencies:** DR-03, AGL-003/040.

**Milestone:** M2, architecture portion before freeze.

**MODIFY — AGL-133: Property and invariant test suite**

**Rationale:** Add rate relabel, phase relabel, interval partition, direct seek, normalization, stable ordering, and phase-origin laws.

**Acceptance:** generated property suite includes all v1 invariants and fixed numeric fixture above. fileciteturn0file0

**Milestone:** M2.

**MODIFY — AGL-130 / AGL-131: MIDI and MusicXML export**

**Rationale:** An endless multi-rate procedural operator is not representable as one conventional score tempo.

**Acceptance:** export materializes a bounded range; warns when operator semantics are flattened/quantized; no invented global BPM; deterministic independent-consumer fixture. fileciteturn0file0

**Milestone:** M3.

**BLOCK — final AGL-061 “convincing preset” evidence status**

Block only the **perceptual-quality label/default freeze**, not operator implementation, until AGL-065 pilot data meet or revise a predeclared criterion.

**UNBLOCK — AGL-060 mathematical/operator work**

The formal construction, ratio semantics, direction, analytic phase, and stage separation are sufficiently defined to proceed without waiting for subjective optimization.

**ADD — generalized barberpole-tempo authoring**

**Rationale:** Ghisi's arbitrary-ratio extension is legitimate but should not dilute classical Risset semantics. citeturn17search1

**Acceptance:** explicit generalized terminology; arbitrary \(r>1\) validated mathematically against closure equations; presets carry experimental/perceptual evidence status.

**Dependency:** `rhythm.risset@1` kernel and DR-08 vocabulary.

**Milestone:** Post-M2/P1 unless a Wave-1 integration decision pulls it forward.

## Cross-research reconciliation, weak evidence, and follow-ups

### Cross-Research Dependencies

**This report concludes:** source musical positions can remain exact rational, but Risset-warped render event times generally cannot.

**Must be reconciled with:** DR-03 and the central audio/render architecture.

**Why:** sample scheduling, seconds-to-frame conversion, lookahead, offline conformance, and cancellation require one defined continuous/render-time representation.

**Question the integration pass must answer:** *What is the canonical type and rounding policy between analytic render seconds and integer audio frames, and is it shared by JS, Swift, and WASM?*

---

**This report concludes:** `rhythm.risset` should preserve analytic rate/phase functions rather than canonical sampled control points.

**Must be reconciled with:** DR-08 control-signal vocabulary and general operator semantics.

**Why:** other AGL labs may represent generated controls through sample/normalize/smooth/quantize pipelines; Risset's exact closure should not depend on an arbitrary sampling cadence. fileciteturn0file3

**Question:** *Does AGL support analytic control functions as a first-class internal type, or does the graph compiler lower them into an exact-enough render-plan primitive?*

---

**This report concludes:** event budgets are necessary, but a hard pulses-per-second constant is not a DR-01 scientific result.

**Must be reconciled with:** DR-03, AGL-025, AGL-043, AGL-134.

**Why:** scheduler capacity varies by backend/device and belongs to runtime benchmarking. fileciteturn0file0turn0file3

**Question:** *What event-count and lookahead budgets can be guaranteed across the M2 browser support matrix, and what deterministic failure/degradation policy applies when exceeded?*

---

**This report concludes:** subdivision shedding, 3:2 ambiguity, anchor pulses, and pitch coupling are orthogonal transformations.

**Must be reconciled with:** DR-08's shared mapping/explainability vocabulary and typed graph design.

**Why:** the same distinction—generator versus mapping versus post-transform—should not be invented uniquely for Infinite Staircase.

**Question:** *What shared port/operator categories encode symbolic transform, temporal mapping, control overlay, and render mapping?*

---

**This report concludes:** power normalization is a formal gain invariant but not a loudness guarantee.

**Must be reconciled with:** DR-03 audio safety architecture and AGL-049.

**Why:** coherent events and voice tails can still create peaks.

**Question:** *Where is peak management performed, and which metering/limiting operations are considered presentation safety rather than part of scientific stimulus semantics?*

---

**This report concludes:** arbitrary audio-loop/time-stretch behavior should not define MVP Risset semantics.

**Must be reconciled with:** DR-10.

**Why:** pitch-preserving stretching introduces another DSP algorithm, latency, artifacts, and provenance surface. DR-10 is explicitly post-MVP. fileciteturn0file3

**Question:** *When DR-10 arrives, can its source-time mapping consume the same analytic \(\Phi_k(t)\) without changing `rhythm.risset@1`?* It should.

---

**This report concludes:** a frozen Infinite Staircase interval is a finite rendered realization, while the graph remains a generator.

**Must be reconciled with:** AGL command/undo, freeze-to-clip, MIDI/XML, and project persistence.

**Why:** user edits must not accidentally mutate frozen material, and exports must not claim to retain the infinite operator.

**Question:** *What exact provenance payload survives freeze/export, and how is re-generation from a historical operator version handled?*

### Contradictions, weak evidence, and open questions

**The strongest weakness is perceptual, not mathematical.** The existence and construction of Risset rhythm are well grounded; a high-quality evidence base telling AGL that “five layers, 20 seconds, raised cosine, 100 BPM is optimal for X% of listeners” does not exist in the sources reviewed here. Stowell offers computational construction; Ghisi offers a formal generalization; broader beat research constrains plausible timing regions. That is not equivalent to a factorial psychophysical optimization study. citeturn17search1turn18search10turn21search0

**“Risset rhythm” versus “barberpole tempo illusion” is a real terminology boundary.** Ghisi's generalized framework supports noninteger ratios, but calling every \(r\) “Risset” sacrifices historical/formal precision. citeturn17search1

**Rate closure is weaker than phase closure.** A naive implementation can satisfy “layer \(k\)'s rate after \(T\) equals another layer's rate” while still click/reset because source phases do not correspond. Sprint-0 tests that check only rate/layer relabeling are therefore incomplete.

**A fixed finite list of persistent layers is not mathematically the same as the conceptual relabeling family.** Edge layers must enter/leave through zero weight or be replenished with exactly derived phase. Otherwise the seam merely moves to the layer boundary.

**“Equal power” is not “constant loudness.”** Identical rhythmic streams can be strongly correlated, and perceived loudness depends on waveform, spectrum, temporal integration, and playback level. The proposed normalization is reproducible engineering semantics, not a solved psychoacoustic loudness model.

**A “tempo” value is ambiguous for a multi-level source pattern.** The core needs cycle-rate semantics. UI BPM requires an explicit beat-per-cycle interpretation.

**Very fast periodicities do not cease to exist when they leave the tactus range.** London's temporal limits concern likely metric/beat interpretation; they are not a technical discard threshold. citeturn21search0

**3:2 evidence is indirect.** Polyrhythm research strongly supports metric competition and subdivision effects, including substantial individual variation, but no evidence reviewed demonstrates a stronger endless-acceleration illusion specifically at 3:2. citeturn20search15turn20search7

**The anchor hypothesis is under-tested.** A stable reference logically supplies a comparison frame and is a good experimental control, but “anchor weakens Risset” should remain a hypothesis until AGL measures it.

**Envelope shape optimization is unresolved.** Smooth fades are part of the construction family; the best shape/domain/support for perceptual strength is not settled by the sources reviewed.

**Cycle length optimization is unresolved.** A long \(T\) produces gradual local acceleration and a slow handoff; a short \(T\) produces obvious rate movement but potentially more noticeable recurrence. There is no source-grounded universal optimum here.

**Individual differences matter.** Broader beat studies show strong differences in which pulse listeners select, and beat induction changes with tempo. AGL should not gate correctness on every participant hearing the same thing. citeturn20search0turn20search7turn21search1

**Nolan's historical wording needs correction-by-context, not contradiction-by-copy.** Nolan says he and Hans Zimmer “came up with” the Risset rhythm in connection with *Dunkirk*. Risset's own 1986 publication documents the rhythmic paradox decades earlier. AGL should describe Nolan/Zimmer as having employed or developed their film-scoring use of the technique, not invented the underlying Risset rhythm. citeturn19view2turn17search0

**The Troy sequence and the soundtrack track “Troy” are not proven to be identical technical objects.** Nolan's direct statement establishes the film-sequence technique; Apple/Back Lot establishes an album track by that name. Production credits establish personnel and palette, but not an operator graph. citeturn19view2turn22search2turn22search18

**The soundtrack's broader timbral palette does not establish the Risset implementation.** Göransson has publicly discussed experimentation with bronze instruments, ancient instruments, recording techniques, and contemporary processing; those facts support contextual discussion of the score but not specific Risset-layer semantics. citeturn17search3

### Research Follow-Ups

| Question | Why evidence is insufficient | Decision blocked | Best method | Priority |
|---|---|---|---|---|
| Which cycle/support combination gives the strongest rhythm-only illusion for the target lab audience? | No direct factorial evidence supports the provisional 20 s / \(B=2.5\) choice. | Final AGL-061 default and “convincing preset” evidence badge | Within-subject synthetic factorial pilot: e.g. several cycle lengths × 2–3 support widths; direction + seam measures | **P0** |
| Does power-domain raised cosine outperform Sprint-0's existing interpretation or alternative normalization without introducing loudness cues? | Construction evidence does not identify an optimal normalization. | Final v1 default; **not** core schema semantics if envelope domain is already explicit | Level-matched A/B pilot plus objective peak/RMS/centroid measurements | **P0 if Sprint-0 semantics conflict; otherwise P1** |
| Does an anchor pulse measurably reduce, strengthen, or simply change confidence in the illusion? | Current conclusion is inference. | Educational control wording, not core operator | Within-subject target vs target+anchor; direction, seam, confidence | **P1** |
| Does 3:2 metric ambiguity improve endlessness or merely make beat selection less stable? | Polyrhythm evidence answers metric ambiguity, not Risset efficacy. | “Cinematic metric-ambiguity” preset status/claim | Factorial Risset × 3:2 overlay study with pulse-selection/tapping measure | **P1** |
| What browser event budget and sample-frame error can M2 guarantee? | Psychoacoustics cannot answer backend capacity. | Scheduler limits, UI guardrails | DR-03 benchmark matrix / AGL-134 | **P0, but belongs to DR-03** |
| What exact production parameters were used in Göransson's “Troy”? | Public sources establish Risset use but not session details. | **Nothing needed for MVP** unless marketing insists on exact-reproduction language | Only authoritative composer/production/session disclosure would resolve it | **Do not pursue for engineering** |

No additional research is justified merely to determine whether AGL may mention *The Odyssey*. The current direct Nolan attribution is sufficient for carefully qualified educational copy. citeturn19view2

**Integration checklist**

- [ ] Architecture specification: explicit symbolic-time / analytic-time / sample-frame boundary.
- [ ] ADRs: core terminology, analytic phase/time, gain semantics, orthogonal stages, reference stimulus, render conformance, visualization semantics.
- [ ] Project schema: `rhythm.risset@1` persisted semantic fields and envelope-domain version.
- [ ] Migration specification: preserve Sprint-0 envelope semantics if they differ.
- [ ] Operator catalog: core Risset plus separate subdivision/metric/anchor/pitch stages.
- [ ] Render-plan contract: analytic/bounded Risset event generation and direct seek.
- [ ] Generated/frozen material contract and provenance payload.
- [ ] Undo/command rule for multi-node preset application.
- [ ] Log-tempo visualization projection contract.
- [ ] Accessible mathematical description.
- [ ] Reference generator and deterministic JSON fixtures.
- [ ] Property/metamorphic tests in AGL-133.
- [ ] Realtime/offline and browser conformance hooks in AGL-134/DR-03.
- [ ] Listening-test fixture and predeclared acceptance analysis in AGL-065.
- [ ] Evidence-tagged defaults/presets in AGL-061/038.
- [ ] AGL-063 split/refactor for source pattern versus subdivision shedding.
- [ ] MIDI/MusicXML finite-realization warnings.
- [ ] Research evidence registry with Nolan/Troy provenance and explicit unsupported-production-details boundary.
- [ ] User-facing educational copy and prohibited-claims rule.
- [ ] M2 exit criteria updated to distinguish mathematical conformance from perceptual preset acceptance.

## Integration Payload

**Status / epistemic boundary:** DR-01's completed report body was not retrievable during this pass; integration is reconstructed from the DR-01 charter, current AGL program artifacts, and source re-verification. Do not treat provisional numeric defaults below as quotations from an unseen report. AGL context: Infinite Staircase is P0; AGL-060 is canonical-graph migration; AGL-061 is DR-01-gated parameter profile; AGL-062 is log-tempo visualization; AGL-063 covers source/subdivision; AGL-064 is independent Shepard pitch; AGL-065 is reset/direction listening test. M2 exit requires Infinite Staircase acceptance and realtime/offline plan agreement. fileciteturn0file0 fileciteturn0file1 fileciteturn0file2 fileciteturn0file3

**Historical/formal evidence:** Risset's 1986 JASA note explicitly reports a rhythmic analogue of his pitch paradoxes. Ghisi 2021/2023 defines “barberpole tempo illusions” as synchronized faded rate streams; identifies classical Risset rhythm with powers-of-two/tempo-octave relationships; generalizes to arbitrary subdivisions/noninteger ratios/rate modulations. Therefore use `r=2` for canonical `rhythm.risset`; arbitrary `r>1` is mathematically valid generalized barberpole behavior but should not silently inherit classical terminology. Stowell 2011 supports computational scheduling/composition with Risset eternal accelerando streams but does not establish a psychoacoustically optimal layer count. citeturn17search0turn17search1turn18search10

**Normative v1 math:** \(r>1\), classical \(r=2\); direction \(d\in\{-1,+1\}\); cycle/traversal duration \(T>0\); unwrapped \(q(t)=q_0+d(t-t_0)/T\); UI wrap \(u=\mathrm{fract}(q)\). Conceptual layer \(k\in\mathbb Z\): \(\nu_k(t)=\nu_{\rm ref}r^{k+q(t)}\); direction contract \(d\log_r\nu_k/dt=d/T\); rate closure \(\nu_k(t+T)=\nu_{k+d}(t)\). Canonical source phase: \(\Phi_k(t)=\phi_0+\nu_{\rm ref}T/(d\ln r)\;r^{k+q(t)}\), giving \(d\Phi_k/dt=\nu_k\) and exact phase closure \(\Phi_k(t+T)=\Phi_{k+d}(t)\). Source event at exact rational phase \(p_j\) fires on \(\Phi_k=n+p_j\). Relative inversion:
\[
\Delta t={T\over d\ln r}\ln\!\left(1+{d\ln r\over \nu_k(t_a)T}\Delta\Phi\right).
\]
Generate absolute event times analytically; never accumulate inter-event durations and never reset source phase at `fract(q)=0`. Render intervals are half-open `[a,b)`.

**Envelope contract:** use conceptual integer family + compact support, not a fixed scientifically meaningful layer count. Recommended v1 envelope semantics are **power-domain** raised cosine:
\[
P_B(z)=\tfrac12[1+\cos(\pi z/B)],\ |z|<B;\quad0\text{ otherwise},
\]
\(z=k+q-c\), \(B>0.5\). Normalize amplitude \(g_k=\sqrt{P_k/\sum_jP_j}\), hence \(0\le g_k\le1\), \(\sum g_k^2=1\). This is reproducible engineering normalization, **not** constant RMS or constant loudness. If Sprint-0's raised cosine is persisted as linear amplitude, preserve it as old-version semantics and migrate explicitly rather than silently changing domain. Conceptual identities enter/leave through zero envelope support; internal slot reuse cannot become event identity.

**Time architecture:** Risset exposes a mandatory distinction between exact symbolic musical time and continuous render time. Source pattern phases remain AGL rational musical-time data; generic Risset event seconds contain logarithms and cannot generally be exact rational values. Recommended pipeline:
`rational source phase → analytic temporal mapping → Double render seconds → canonical integer sample frame`.
The precise seconds→frame rounding and realtime lookahead semantics require DR-03/central architecture reconciliation. Do not contaminate AGL-002 by pretending all rendered onsets are rationals. `cycleDuration` must have explicit clock domain; generic schema should have no silent default. Infinite Staircase research fixtures should use absolute/render seconds until the transport-beat interaction is centrally resolved.

**Operator architecture:** `rhythm.risset@1` owns only layer rate law, source-phase integration, gain envelope/normalization, direction, and relevant provenance. Keep `subdivision shedding`, `metric/polyrhythmic overlay`, `anchor pulse`, and `Shepard pitch coupling` as independently bypassable graph stages. This is required for causal explanation, undo, provenance, generated-vs-frozen semantics, and listening controls. AGL-063 should be split logically into source-pattern semantics and subdivision transformation. AGL-064's independent pitch coupling is correct and should remain off in rhythm acceptance. fileciteturn0file0

**MVP reference implementation:** event-based synthetic fixed-timbre triggers are normative. Ordinary loop playback is a comparison backend because variable playback rate couples temporal change to pitch/timbre; arbitrary pitch-preserving time stretching remains post-MVP DR-10. Same analytic/bounded-event render plan drives realtime and offline. Web Audio 1.0 specifies render quanta of 128 sample frames and common realtime/offline base semantics; require identical canonical event IDs/ideal times/sample-frame mapping, not browser-independent bit-identical PCM. citeturn18search1turn19view3 fileciteturn0file3

**Determinism/provenance:** generated ID should be a stable function of operator instance/version + source event stable ID + conceptual layer index + source-cycle ordinal; never worker chunk, current scheduler window, render slot, or wall time. Direct seek must equal sequential render. Rendering `[a,c)` must equal stable merge of `[a,b)` and `[b,c)`. Equal-time ordering explicitly lexical `(time, layerIndex, sourceEventId, sourceCycleOrdinal)`. Freeze-to-clip materializes a bounded realization and lineage; upstream changes then affect regenerated material but not frozen content. Preset application inserting optional stages is one command transaction. MIDI/MusicXML export materializes a finite range and warns about flattening/quantization; never invent a scalar global “Risset BPM.”

**Numeric golden:** `r=2,d=+1,T=8s,q0=0,νref=1 cycle/s, source phase=0`. Layer `k=0` first five events: `0.959028565, 1.844445640, 2.666750420, 3.434344603, 4.154056392 s`; `k=+1`: `0.489472547, 0.959028565, 1.410225678, 1.844445640, 2.262919854`; `k=-1`: `1.844445640, 3.434344603, 4.831510429, 6.077659105, 7.202275799`. Fixture-specific gain case `B=2,q=0,k=-1,0,+1`: power `[.5,1,.5]`, normalized amplitudes `[.5,.7071067811865475,.5]`, squared sum `1`. Core arithmetic reference tolerance suggested `1e-12` for identities like relabel/normalization; ideal cross-language event-time target `max(1 ns, agreed ULP tolerance)`; actual browser/audio scheduler tolerance is **not DR-01-owned** and must come from DR-03.

**Defaults/evidence status:** strong default `r=2`; baseline one-beat stimulus center `100 BPM` is indirectly supported because broader beat literature puts preferred tactus ~500–700 ms/86–120 BPM and broad beat range about 200–1500 ms/40–240 BPM; McAuley found stronger beat induction around 600 ms than 1500 ms. citeturn21search0turn20search0 Provisional engineering defaults only: `T=20s`, initial Explore guardrail `8–40s`, `supportHalfWidth B=2.5`, raised-cosine-power envelope. These are **not psychoacoustically validated optima** and should retain provisional evidence metadata pending AGL-065 pilot. No evidence-backed independent `layerCount` default: derive active layers from envelope support. Anchor off; subdivision shedding off; 3:2 off; pitch coupling off. Event budget and master safety have no DR-01 numeric default; DR-03/AGL-025 and AGL-049 own them.

**Perceptual evidence/status:** direct Risset parameter psychophysics is much thinner than construction/formal evidence. Broader research shows tempo-dependent beat induction and individual differences. Polyrhythm research with 2:3 and related ratios demonstrates competing metric interpretations, robust subdivision effects, pitch influence, and participant variability, but does **not** show that 3:2 strengthens Risset. citeturn20search0turn20search15turn20search7 Therefore 3:2 is experimental/cinematic metric ambiguity, not core. A fixed anchor is a legitimate A/B control but “anchor weakens illusion” remains a hypothesis. Shepard pitch is an independent directional cue and must be excluded from rhythm-only acceptance. citeturn20search1turn20search5

**Listening acceptance:** deterministic within-subject harness; randomized acceleration/deceleration; single-layer control; core Risset; anchor condition; optional 3:2 experimental condition; pitch-coupled exploratory condition; loudness-ramp control; fixed synthetic timbre; no pitch/brightness manipulation in baseline. Measures: intended direction 2AFC, confidence, 4-way seam localization, optional continuous direction rating. Proposed **product-defined**, not literature-derived, convincing gate: intended-direction point estimate ≥75%, 95% interval excludes .5; seam localization equivalent to 4AFC chance `.25` within predeclared ±`.15` margin; both acceleration and deceleration pass. Initial minimum ~24 analyzable participants is a validation-design choice subject to preregistered analysis/power review. Capture equipment, training, and hearing metadata.

**Visualization hard contract:** primary Explore visualization = wrapped log-tempo strip; linked unwrapped layer trajectory shows local monotonic change; Inspect shows layer ID, rate, source phase, raw power weight, normalized gain, dominant beat region, and relabel seam. Never portray one global BPM increasing to infinity. Cylinder/torus is useful Inspect/secondary visualization; Penrose/barber-pole/staircase is analogy only. Non-color cues, keyboard operation, reduced-motion alternative, and synchronized semantic text integrate with AGL-053/132. AGL-062 should be strengthened accordingly. fileciteturn0file0

**Troy production boundary:** direct source: on July 20, 2026 Christopher Nolan described the Troy scoring as “continuous acceleration,” explicitly called it “a Risset rhythm,” and said Göransson uses the technique multiple times in *The Odyssey*. citeturn19view2 Official/release evidence: Göransson's soundtrack released July 17, 2026 and contains track 9, “Troy”; production credits identify Göransson, programming, recording/mixing, score sound-design staff, aulos/lyre soloists, etc., but disclose no exact Risset graph. citeturn22search0turn22search2turn22search13turn22search18 Safe wording: “Nolan says the Troy sequence uses a Risset rhythm; AGL demonstrates the underlying psychoacoustic/mathematical idea with synthetic stimuli.” Forbidden: “AGL reproduces Göransson's Troy technique exactly”; “Troy uses five 2:1 layers / raised-cosine / 20-second cycles / 3:2 shedding / Shepard pitch” absent future authoritative evidence; “Nolan/Zimmer invented Risset rhythm.” Nolan's “came up with [it] on Dunkirk” wording must be contextualized as their film-scoring use because Risset's publication predates it by decades. citeturn19view2turn17search0

**ADR set:** `RISSET-CORE` classical `r=2` vs generalized barberpole terminology; `RISSET-TIME` analytic unwrapped phase + explicit rational/render-time boundary; `RISSET-GAIN` power-domain envelope and normalization; `RISSET-COMPOSITION` orthogonal optional stages; `RISSET-MVP-AUDIO` event-based synthetic reference; `RISSET-RENDER` semantic/event conformance before PCM equality; `RISSET-VIS` local acceleration + global closure linked views. `RISSET-TIME` and `RISSET-RENDER` require DR-03 reconciliation before final shared audio/time contracts freeze.

**Backlog effects:** MODIFY AGL-060 semantic acceptance; MODIFY/BLOCK final-default portion of AGL-061 pending pilot; MODIFY AGL-062; SPLIT AGL-063 responsibilities; MODIFY AGL-064 to enforce rhythm-only independent acceptance; MODIFY AGL-065 protocol/thresholds; MODIFY AGL-041 for analytic/generated time mapping; MODIFY AGL-133 with relabel/phase/chunk/direct-seek laws; MODIFY AGL-130/131 export semantics. UNBLOCK core mathematical/operator work now; keep only perceptual “convincing default” evidence status gated. Add generalized barberpole authoring later/P1. M2 remains the relevant lab acceptance milestone. fileciteturn0file0turn0file2

**Highest-priority unresolved cross-run questions:** DR-03 must settle render-seconds/sample-frame representation, rounding, scheduling tolerance, event budgets, realtime/offline conformance, and overload policy; DR-08 must reconcile analytic controls/stage taxonomy/shared mapping vocabulary; central persistence/native architecture must define cross-language Double/fixture tolerances; DR-10 should later consume the same Risset phase map for pitch-preserving arbitrary audio without changing `rhythm.risset@1`. The only DR-01-specific empirical blocker remaining for a product-quality label is parameter/listening validation, not the mathematical operator architecture. fileciteturn0file3

**Central integration verdict:** freeze the **mathematics and operator decomposition now**; do **not** freeze provisional psychoacoustic optima as facts. The architecture should make exact closure, deterministic seeking, generated/frozen provenance, temporal-domain separation, and scientific-stage independence immutable v1 semantics, while leaving cycle duration, support width, metric ambiguity, and perceptual acceptance preset data versionable. That split prevents weak perceptual evidence from becoming irreversible project-file architecture while still removing the MVP blocker.

Session token estimate: ~140k tokens including accumulated research/tool context.

Tags: #AuralGeometryLab #RissetRhythm #Psychoacoustics #AudioDSP #ResearchIntegration