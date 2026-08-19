# 2026-08-13 — DR-01: Risset Rhythm Psychoacoustics and Infinite-Staircase Design

**Program:** Aural Geometry Lab  
**Research status:** Decision-ready for MVP; several perceptual optimizations remain explicitly experimental  
**Primary recommendation:** Ship `rhythm.risset@1` as a deterministic **event-based, fixed-timbre, log-tempo barberpole operator with exact layer-relabel closure**, using the octave ratio \(r=2\) as the canonical Risset case. Keep subdivision shedding, metric ambiguity, fixed anchors, and Shepard/Risset pitch motion as independent operators or controls rather than silently incorporating them into the core illusion.

**TL;DR**

The historical and mathematical core is solid. Shepard established circular pitch organization in 1964; Risset explicitly reported a rhythmic analog by 1986; Stowell later formalized a practical “eternal accelerando” implementation; and Ghisi places the octave-spaced Risset rhythm inside the more general family of “barberpole tempo illusions.” citeturn25view4turn18search15turn23view0turn18search0

The strongest direct perceptual result located is Madison’s 2009 experiment: 19 nonmusicians tracked multilevel accelerating/decelerating rhythms across physical repetition boundaries, with tempo-level switches distributed across the cycle rather than concentrated at reset points. That establishes the perceptual plausibility of endless tempo change, but **it is not an empirical optimization study of Stowell-style crossfaded loop layers**. Therefore layer count, crossfade width, cycle duration, anchor effects, and the claim that 3:2 metric ambiguity “strengthens” the illusion must remain product hypotheses until AGL-065 supplies data. citeturn14search0

For MVP, use \(r=2\), a 20 s log-tempo traversal, 120 BPM nominal center, a four-layer raised-cosine window spanning \(\pm2\) tempo octaves, fixed pulse timbre, and linear-gain partition normalization. An analytic sweep shows that this \(\pm2\)-octave window has constant summed gain **and** constant nominal summed squared gain across the wrap; it avoids the approximately 3 dB nominal power sag of the two-layer raised-cosine case while retaining a deterministic amplitude bound. These parameter values are partly engineering choices, not literature-established perceptual optima.

Subdivision shedding should be a separate layer-aware event filter. A 3:2 metric-ambiguity preset is scientifically defensible as an **exploratory polyrhythmic condition**, because 2:3/3:2 figures can be perceptually ambiguous and susceptible to metrical priming, but no evidence located shows that 3:2 improves a Risset illusion specifically. Pitch coupling should be post-MVP/default-off because pitch context itself can bias perceived tempo. citeturn15search2turn15search13turn15search5

For *The Odyssey*, there is unusually strong production-side confirmation: on July 20, 2026, Christopher Nolan explicitly described the music under the Troy sequence as a “continuous acceleration” and “a Risset rhythm,” saying it was used to increase anxiety and tension. What is **not** confirmed is the implementation: no authoritative source located specifies layer count, octave spacing, envelope, 3:2 structure, subdivision shedding, source loops, or session technique. A public analyst's 2/4-versus-3/4 observation is therefore useful only as a hypothesis. citeturn26view0turn12search3

## Executive determination

DR-01 is correctly classified as an immediate blocker. The program register says it unblocks AGL-061, AGL-063, and AGL-065; the backlog separately places Shepard pitch coupling in P1 rather than the P0 Infinite Staircase path. fileciteturn0file3 fileciteturn0file0 The lab manifest already identifies Infinite Staircase as a P0 runnable vertical slice whose outstanding research dependencies are DR-01, DR-03, and DR-08. fileciteturn0file1 The resulting design should therefore settle the **semantic** operator now while leaving browser-performance ceilings to DR-03 and general sonification vocabulary/evaluation harmonization to DR-08. This also matches M2, whose exit criteria require both scheduler acceptance and Infinite Staircase acceptance. fileciteturn0file2

The recommended semantic split is:

| Capability | MVP status | Decision |
|---|---:|---|
| Infinite local acceleration/deceleration with global closure | **Core** | `rhythm.risset@1` |
| Octave-spaced tempo layers \(r=2\) | **Canonical** | Call this a **Risset rhythm** |
| Non-octave layer ratios | Supported/advanced | Call family **barberpole tempo illusion** rather than implying the historical Risset construction is unchanged |
| Event-based synthesis | **Canonical renderer** | Fixed timbre isolates temporal cues |
| Continuously rate-scaled audio loops | Comparison renderer | Valid construction family, but playback-rate timbre/pitch changes make it a poor rhythm-only scientific baseline |
| Subdivision shedding | Separate stage | `rhythm.subdivision.shed@1` |
| 3:2 metrical ambiguity | Separate exploratory stage/preset | `rhythm.metricAmbiguity@1`; no claim that Göransson used it |
| Fixed pulse | Experimental control | Separate `rhythm.anchor` source; not part of Risset |
| Shepard/Risset pitch motion | Post-MVP/default-off | Independent operator; AGL-064 is already P1 |
| “Troy” preset | **Do not name as reconstruction** | Use “Cinematic Metric Ambiguity” or “Continuous-Tension Study” |

The central scientific boundary is important. There is good evidence for hierarchical tempo perception and for apparently continuous tempo-change illusions, but there is **not** a mature literature establishing a single optimal Risset crossfade recipe. Madison's controlled experiment used a nine-level recursively accented temporal hierarchy rather than the exact crossfaded-copy construction contemplated here. citeturn14search0 Stowell's work is principally a scheduling/compositional implementation contribution, while Ghisi supplies the broad mathematical framework and taxonomy. citeturn23view0turn18search0 Accordingly, AGL should distinguish three epistemic levels in UI/provenance:

**Established:** layer scaling, logarithmic closure, Risset history, multilevel tempo ambiguity.  
**Supported but construction-dependent:** endless acceleration/deceleration can be perceptually convincing.  
**Product hypothesis:** the exact values of envelope width, cycle duration, anchors, 3:2 accents, or subdivision shedding improve the effect.

That distinction is sufficient to unblock engineering without pretending that an unevaluated preset is a psychoacoustic optimum.

## Evidence base and taxonomy

Shepard's 1964 experiment used specially synthesized complex tones and demonstrated circular judgments of relative pitch: neighboring members could successively be heard as “higher” around a pitch circle even though the sequence closes on itself. Shepard's paper explicitly argued that pitch judgments were not adequately represented by a purely rectilinear scale. citeturn25view4 Risset subsequently demonstrated computer-synthesized pitch paradoxes and continuously descending/rising constructions; by 1986 he explicitly described having synthesized a **rhythmic analog**, namely sequences capable of sounding slower even when reproduced at a higher speed. citeturn18search15

The historical record therefore supports the analogy but not the statement that tempo has a literal psychoacoustic octave equivalence identical to pitch chroma. Ghisi's later mathematical treatment calls the power-of-two rate spacing of Risset rhythm “octaves,” and places it within a family of synchronized, faded rhythmic streams at different rates that produce seemingly eternal accelerando or rallentando. Ghisi then generalizes the construction to arbitrary subdivisions, non-integer proportions, arbitrary rate modulation, and more complicated accelerations. citeturn18search0 For product language, **tempo octave** is acceptable when explicitly introduced as the \(2{:}1\) analogy; “tempo equivalence interval” should not imply that every listener perceptually equates \(60\) and \(120\) BPM in the same categorical way as pitches an octave apart.

The best terminology hierarchy is therefore:

| Term | Recommended use | Confidence |
|---|---|---:|
| **Risset rhythm** | Canonical \(2{:}1\)-spaced cyclic tempo illusion | High; established usage from Risset lineage and Ghisi. citeturn18search15turn18search0 |
| **Eternal accelerando / eternal decelerando** | Descriptive construction/perceptual goal | High; used explicitly in Stowell's 2011 paper title. citeturn23view0 |
| **Barberpole tempo illusion** | General family, especially \(r\neq2\), non-integer or harmonic ratios | High; Ghisi's formal generalization. citeturn18search0 |
| **Shepard–Risset rhythm** | Avoid as primary canonical term | Medium; understandable analogy, but “Risset rhythm” is cleaner and better attested for rhythm |
| **Accelerating rhythm paradox** | Explanatory prose, not API terminology | Medium |
| **Infinite/endless tempo illusion** | Educational prose | High if phrased as an apparent/perceived effect rather than literal unbounded physical acceleration |

**Continuous-rate and loop-crossfade variants are members of the same construction family, but perceptual equivalence has not been demonstrated.** In a continuously warped event representation, each pattern copy accelerates locally and individual events retain a fixed timbre. In a conventional audio-loop implementation, the same recorded loop is played at different continuously changing playback rates and mixed by an amplitude window. Stowell's paper addresses the latter scheduling/compositional problem; a widely circulated SuperCollider implementation based on that work uses octave-related levels and a smooth cosine-like power profile. That implementation is useful engineering lineage, but it is not itself controlled perceptual evidence. citeturn23view0turn19search0

That distinction matters because ordinary playback-rate manipulation changes more than temporal event rate: it also changes the temporal and spectral structure of the source. The Web Audio specification defines `AudioBufferSourceNode.playbackRate` as a playback-speed parameter and specifies interpolation of buffer samples during changed-rate playback. citeturn17view2 A fixed-timbre trigger generator therefore provides the cleaner scientific stimulus whenever the claim is specifically about **rhythm perception** rather than the combined experience of tempo, pitch, and timbral change.

Madison's 2009 experiment provides the strongest direct psychoacoustic support located for the broader endless-tempo phenomenon. Nineteen adults aged 19–35 without systematic instrumental training heard sequences built from 768 events and nine nested temporal levels. Inter-event intervals changed continuously by a factor of two across a cycle while accent hierarchy masked the physical repetition. Participants synchronized their tapping to perceived temporal levels. Their level changes were not concentrated at the stimulus boundaries, participants did not report those boundaries, and perceived/tapped temporal levels could move across a substantially wider range than the underlying factor-of-two physical change. citeturn14search0 This supports three crucial product concepts: listeners can switch among hierarchical temporal interpretations; power-of-two temporal relations are especially useful for closure; and physical recurrence need not be perceived as a reset.

Madison also found a substantial directional asymmetry in where listeners tended to change temporal level: during speeding sequences switches clustered around intervals of roughly half a second, while slowing sequences switched at much longer intervals, around two seconds on average, with substantial interindividual variation. citeturn14search0 This is a warning against defining “the perceived tempo” as whichever layer has the largest gain. Perception can remain attached to one temporal level and then jump by a metric factor. AGL's inspector should therefore display **physical layer rates and gains** without asserting that one displayed layer is necessarily the listener's perceived beat.

Independent music-perception work places beat/tactus tracking in a broad middle-rate region rather than across arbitrary temporal scales; synthesis in the music-cognition literature commonly places tactus approximately between a few hundred milliseconds and roughly 1–1.5 seconds, with a preferred area near the middle of that range. citeturn15search15 That is enough to justify centering a demonstration near 90–120 BPM, but not enough to call 120 BPM a Risset-specific optimum.

Two adjacent research areas are directly relevant to optional operators. First, subdividing an otherwise identical interval can change perceived musical duration/tempo: trained and untrained listeners in a filled-duration study did not perceive subdivided and unsubdivided beats identically. citeturn15search10 That makes subdivision density a **causal perceptual variable**, not merely ornamentation. It should not be hidden inside the canonical Risset operator.

Second, recent controlled work with ambiguous polyrhythms found that metrical priming and acoustic balance influence which beat listeners impose on ambiguous 3:4 and 2:3 patterns, with corresponding behavioral/neural effects; a 2026 scoping review likewise finds that ratio, tempo, sensory modality, and musical training affect polyrhythm perception. citeturn15search2turn15search13 This supports a 3:2 ambiguity experiment, but it does **not** demonstrate that 3:2 improves Risset continuity.

Pitch must also be treated as an independent factor. Recent psychophysical work reports pitch-context-induced biases in perceived time/tempo, meaning a rising Shepard component could make a rhythm manipulation appear stronger even when the rhythmic evidence is unchanged. citeturn15search5 That is sufficient reason to keep AGL-064 independently switchable and default-off during rhythm acceptance testing, which is consistent with its existing P1 status. fileciteturn0file0

## Formal construction and DSP contract

The following definition is recommended as the normative semantics for `rhythm.risset@1`.

Let the source be an exactly periodic event pattern \(P\) with normalized event phases

\[
P=\{(p_j,a_j,v_j)\},\qquad 0\le p_j<1,
\]

where \(p_j\) is source-cycle phase, \(a_j\) an event weight, and \(v_j\) an immutable voice/event descriptor. “Immutable” here means that the Risset transformation itself does not alter pitch, timbre, subdivision, or accent semantics.

Let:

\[
r>1
\]

be the layer-rate ratio; \(r=2\) is the canonical Risset octave case, consistent with Ghisi's description of the historical construction. citeturn18search0

Let:

\[
C>0
\]

be the duration in seconds required to traverse one log-tempo equivalence interval, and

\[
d\in\{-1,+1\}
\]

be direction, where \(+1\) means accelerando and \(-1\) means decelerando.

Define the unwrapped log-tempo coordinate

\[
u(t)=u_0+d\frac{t}{C}.
\]

For conceptual layer \(k\in\mathbb Z\),

\[
x_k(t)=k+u(t)
\]

is its position in log-\(r\) tempo space, and its instantaneous source-cycle frequency is

\[
f_k(t)=f_c\,r^{x_k(t)}.
\]

Therefore

\[
\frac{d}{dt}\ln f_k(t)=d\frac{\ln r}{C},
\]

so every physical layer undergoes constant acceleration in **log tempo**, not constant linear BPM acceleration. After one traversal,

\[
f_k(t+C)
  = f_c r^{k+u(t)+d}
  = f_{k+d}(t).
\]

That is the fundamental layer-relabel invariant. It also defines direction unambiguously: in accelerando, a physical layer moves toward higher instantaneous rate while newly audible material enters from the lower-rate side; in decelerando the reverse occurs.

Gain is a window over log-tempo position:

\[
\tilde g_k(t)=W_B(x_k(t)-x_c).
\]

The recommended raised-cosine family is

\[
W_B(x)=
\begin{cases}
\frac12\left[1+\cos\left(\pi x/B\right)\right], & |x|<B\\
0, & |x|\ge B.
\end{cases}
\]

Because \(x_k(t+C)=x_{k+d}(t)\),

\[
\tilde g_k(t+C)=\tilde g_{k+d}(t).
\]

Any normalization that depends only symmetrically on the simultaneous set of \(\{\tilde g_k\}\) preserves the same invariant.

For the default **linear partition normalization**,

\[
g_k(t)=
\frac{\tilde g_k(t)}
{\sum_j \tilde g_j(t)}.
\]

Then

\[
0\le g_k(t)\le1,
\qquad
\sum_k g_k(t)=1.
\]

This is a useful engineering property: if each source voice is independently bounded by unit peak, triangle inequality gives

\[
\left|\sum_k g_k(t)s_k(t)\right|
\le\sum_k g_k(t)|s_k(t)|
\le1
\]

before source-event overlap or downstream effects. It is therefore a more conservative default than equal-power normalization.

An equal-power comparison mode is

\[
g_k^{(P)}=
\frac{\tilde g_k}
{\sqrt{\sum_j\tilde g_j^2}},
\]

which holds \(\sum g_k^2=1\). That is a constant-energy model **only when cross-layer covariance is ignored**. The layers are tempo-scaled copies of one pattern and can be correlated at coincident attacks, so equal-power crossfading does not guarantee constant instantaneous level. AGL must not label it “constant loudness”; “nominal equal power” is accurate.

The analytic envelope sweep gives a particularly useful default. With \(B=1\), two adjacent raised-cosine layers satisfy \(\sum g=1\), but their squared-gain sum varies from \(1\) down to \(1/2\), a **3.0103 dB** nominal-power reduction at equal crossfade. With \(B=2\), four adjacent layers are normally non-zero and the unnormalized lattice sum is identically

\[
\sum_k W_2(k+u)=2
\]

while

\[
\sum_k W_2(k+u)^2=\frac32.
\]

After L1 normalization, therefore,

\[
\sum g_k=1,\qquad
\sum g_k^2=\frac38
\]

for every \(u\): both the gain sum and the uncorrelated-source nominal power are phase-independent up to a fixed scale. This is a **derived mathematical property**, not a listener result, but it makes \(B=2\) substantially cleaner than the two-layer case for MVP.

Amplitude closure alone is insufficient: source-pattern phase must close under relabeling too. Define the unwrapped cycle position

\[
\Theta_k(t)=\beta_k+
r^k
\frac{f_c C r^{u_0}}
     {d\ln r}
\left(r^{dt/C}-1\right).
\]

Its derivative is exactly

\[
\dot{\Theta}_k(t)=f_k(t).
\]

Let

\[
A_d=
\frac{f_c C r^{u_0}}
     {d\ln r}
     (r^d-1).
\]

Choose the layer offsets recursively so that

\[
\boxed{
\beta_{k+d}
\equiv
\beta_k+r^kA_d
\pmod 1
}
\]

with arbitrary \(\beta_0\). Then

\[
\Theta_k(t+C)
\equiv
\Theta_{k+d}(t)
\pmod1.
\]

Thus **rate, gain, and pattern phase all close exactly after one traversal modulo a layer-label shift**, for any \(r>1\), any \(C>0\), any positive center rate, and either direction. Integer octave ratios are therefore not mathematically necessary for event-based phase closure. The special status of \(r=2\) is historical, musical/perceptual, and taxonomic rather than an algebraic requirement. Ghisi's generalization to non-integer proportions is consistent with this broader mathematical picture. citeturn18search0

Events are emitted whenever \(\Theta_k(t)\) crosses

\[
n+p_j,\qquad n\in\mathbb Z.
\]

Because \(\Theta_k(t)\) is strictly increasing even for decelerando—the rate decreases, but pattern playback does not reverse—the crossing times have a closed-form inverse. Given target source-cycle position \(z=n+p_j\),

\[
t=
\frac{C}{d}
\log_r\left[
1+
\frac{d\ln r\;(z-\beta_k)}
     {f_c C r^{k+u_0}}
\right],
\]

when the bracketed quantity is positive and \(t\) falls inside the requested render interval.

This is preferable to integrating dozens of oscillators numerically: it produces exact deterministic event times independent of scheduler step size.

A framework-independent reference kernel is therefore:

```text
function rissetEvents(pattern, interval, cfg):
    require cfg.ratio > 1
    require cfg.cycleSeconds > 0
    require cfg.direction in {-1, +1}

    r  = cfg.ratio
    C  = cfg.cycleSeconds
    d  = cfg.direction
    fc = cfg.sourceCyclesPerSecond
    u0 = cfg.initialLogPhase

    # Determine every conceptual integer layer whose compact gain window
    # intersects [interval.start, interval.end].
    layers = activeIntegerLayers(interval, cfg)

    beta[0] = frac(cfg.sourcePhase)

    # Populate phase offsets in both directions from the exact recurrence.
    for required k in increasing/decreasing order:
        beta[k + d] =
            frac(beta[k] + pow(r, k) * closureA(cfg))

    events = []

    for k in layers:
        # Find source-cycle coordinates n+p_j whose inverse time
        # can lie inside the requested interval.
        for each source event j:
            for each candidate integer n:
                z = n + pattern[j].phase
                t = inversePhase(z, k, beta[k], cfg)

                if interval.start <= t < interval.end:
                    x = k + u0 + d*t/C
                    rawGain = raisedCosine(x - cfg.windowCenter,
                                          cfg.windowHalfWidth)

                    events.append({
                        time: t,
                        logicalLayer: k,
                        sourceEvent: j,
                        logTempo: x,
                        rateScale: pow(r, x),
                        rawGain: rawGain,
                        stableId:
                          hash(cfg.seed, k, n, pattern[j].stableId)
                    })

    # Normalize all simultaneous layer gains from the same analytical
    # gain lattice; do not infer normalization from event coincidence.
    for event in events:
        event.gain = normalizedWindowGain(
            event.time,
            event.logicalLayer,
            cfg
        ) * pattern[event.sourceEvent].gain

    assert eventBudget(events, cfg)
    return stableSort(events, time, logicalLayer, stableId)
```

The loop-based comparison variant uses the same \(f_k(t)\), \(g_k(t)\), and phase state but substitutes a periodic audio buffer for symbolic source events. For a source loop of duration \(D\),

\[
\text{playbackRate}_k(t)=D f_k(t).
\]

A newly introduced layer starts at source offset

\[
D\cdot \operatorname{frac}(\Theta_k(t))
\]

and follows the exponential rate trajectory. Web Audio supports timeline-scheduled `AudioParam` automation, including exponential ramps, and specifies that automation event times are expressed on the `AudioContext.currentTime` timeline rather than being numerically quantized to sample-rate timestamps. citeturn16search1 For genuinely phase-critical custom playback or very dense synthesis, an `AudioWorkletProcessor` runs on the audio rendering thread and is the appropriate implementation seam. citeturn17view3

The Web Audio 1.1 draft also makes an important future-proofing point: the default render quantum is 128 frames, but the specification now models render-quantum size explicitly and permits other sizing behavior. Engineering should therefore **not encode “128 samples” into Risset semantics or fixture hashes**; event semantics are in seconds/source phase, while the backend quantizes only when rendering. citeturn17view0

The event-based path also solves the aliasing question cleanly. Event **time density** is not itself digital aliasing; aliasing is a property of the waveform generated at each event and any discrete-time modulation. Use a band-limited synthetic click/noise burst whose content stays below the backend Nyquist frequency. By contrast, highly accelerated prerecorded buffers require resampling/interpolation and will change their spectrum under playback-rate manipulation; the Web Audio specification defines the interpolation behavior but does not establish a psychoacoustic equivalence to fixed-timbre events. citeturn17view2

## Parameters, presets, and deterministic fixtures

The parameter recommendations below distinguish **evidence-backed convention** from **AGL engineering inference**. There is no controlled paper located that jointly sweeps Risset layer count, window width, center tempo, and cycle duration, so those fields should carry evidence status in provenance rather than appearing as scientifically optimized constants. Madison supports multilevel tempo ambiguity; Stowell provides implementation precedent; Ghisi provides mathematical generality; none establishes a unique optimum. citeturn14search0turn23view0turn18search0

| Parameter | MVP default | Product-safe range | Basis and expected effect | Confidence |
|---|---:|---:|---|---:|
| `ratio` \(r\) | **2.0** | 1.5–3.0 advanced; reject \(\le1\) | \(2{:}1\) is canonical Risset “octave” spacing. Non-integer ratios belong to generalized barberpole tempo space. citeturn18search0 | **High** for \(2\); medium for generalized range |
| `direction` | `+1` | ±1 | Exact sign of \(d\ln f/dt\); no ambiguity in API semantics | **High** |
| `cycleSeconds` \(C\) | **20 s** | 12–40 s | Stowell-derived public examples use a 20 s “megabar”; Stowell's released musical demonstration was reported around 30 s per doubling. This is implementation lineage, not psychophysical optimum. citeturn19search0turn18search8 | Low–medium |
| Nominal center beat | **120 BPM** | 80–140 BPM Explore; 60–180 Inspect | Places strongest layers in a common tactus region; broad literature supports a privileged mid-tempo range. citeturn15search15 | Medium, not Risset-specific |
| Window | **raised cosine** | raised cosine; equal-power comparison | Smooth compact support and straightforward closure | High mathematically |
| `windowHalfWidth` \(B\) | **2.0 log-\(r\) units** | 1.5, 2.0, 2.5 as curated values | Four nonzero layers for \(B=2\); analytic lattice gives constant gain and nominal-power sums. Wider windows obscure individual edges but add event/CPU load | Medium engineering |
| Conceptual layers | \(\mathbb Z\) | fixed by semantics | Makes relabeling exact | High mathematical |
| Renderer slots | **6** | derived as \(\lceil2B\rceil+2\) minimum | Four normally audible at \(B=2\), plus zero-gain entry/exit guards | High engineering |
| Gain policy | **L1/window-sum** | L1 default; L2 Inspect; `none` diagnostic | L1 guarantees a deterministic summed-gain bound; \(B=2\) avoids phase-varying nominal power | High engineering; perceptual preference untested |
| Pattern density | **1 event/beat** | 1–2 core; 4 only via explicit subdivision stage | Keeps event density from becoming an independent tempo cue; subdivision itself changes temporal judgments. citeturn15search10 | Medium |
| Scheduled-event warning | **32 triggers/s** | warning only | AGL heuristic for “dense rhythm becoming texture”; explicitly **not** a claimed hearing threshold | Low / product heuristic |
| Hard generation ceiling | **128 triggers/s/operator** | DR-03 may revise | Conservative semantic budget to prevent runaway scheduling; performance value belongs to DR-03, not psychoacoustic theory | Provisional |
| Source timbre | **fixed synthetic tick** | fixed across Risset layers | Isolates timing from playback-rate pitch/brightness | High experimental rationale |
| Anchor | **off** | control only | Stable temporal reference is predicted to reduce ambiguity; no direct Risset anchor study located | Low direct evidence |
| Subdivision shedding | **off** | separate stage | Prevents filled-duration/event-density confound. citeturn15search10 | High design rationale |
| 3:2 metric ambiguity | **off** | exploratory preset | 2:3 figures support genuinely ambiguous metrical interpretation, but enhancement of Risset continuity is untested. citeturn15search2turn15search13 | Medium for ambiguity; low for “strengthening” |
| Pitch coupling | **off** | separate post-MVP operator | Pitch can bias perceived timing/tempo. citeturn15search5 | High rationale |

The \(B=2\), 120 BPM objective sweep is useful for DR-03. With a one-event-per-beat source and all four nonzero logical layers actually scheduled, the total physical event load varies analytically from about **7 to 15 triggers/s** over a traversal. Four subdivisions per beat raises that to about **28–60 triggers/s**. Because the L1 gain window suppresses the extreme rates, the gain-weighted event rate stays much more stable—about 2.22–2.30 equivalent full-gain events/s for the one-event-per-beat fixture. These are deterministic calculations from the proposed equations, not perceptual observations.

This leads directly to three DR-03 benchmark cases:

| Audio benchmark fixture | Trigger density | Purpose |
|---|---:|---|
| `risset-core-1x` | ~7–15/s | Normal P0 Infinite Staircase |
| `risset-subdiv-4x` | ~28–60/s | High-density musically useful case |
| `risset-budget-stress` | 128/s | Budget/fallback boundary |

No layer with significant gain may be silently dropped because the event budget is exceeded. If a request would exceed budget, evaluation should return a structured budget error or require an explicit lower-density rendering policy. That behavior aligns with the existing AGL evaluation-budget architecture rather than embedding nondeterministic browser overload behavior into the operator. fileciteturn0file0

**Subdivision shedding contract.** The clean graph is:

```text
source.pattern
      │
      ▼
rhythm.risset@1
      │  LayeredTriggerEvent {
      │    time,
      │    sourcePhase,
      │    logicalLayer,
      │    logTempo,
      │    rateScale,
      │    gain,
      │    provenance
      │  }
      ▼
rhythm.subdivision.shed@1   [optional]
      │
      ▼
voice / mixer
```

`rhythm.subdivision.shed` should be an **event filter**, not a tempo generator. Its retention rule can depend on source phase, source subdivision identity, and Risset `logTempo`, but it must never change event timestamps. This makes “shedding” inspectable: the UI can render would-have-existed events as ghosts rather than hiding a tempo transformation inside Risset.

A deterministic rule might be

\[
\mathrm{retain}(e)=
[\sigma(e)\le S(x_e)]
\]

where \(\sigma(e)\) is a source-defined subdivision depth and \(S(x)\) is the maximum retained depth at log-tempo \(x\). For example, high-rate layers can lose sixteenth subdivisions before eighths and quarter-note anchors. This can make dense layers perceptually cleaner, but because subdivision itself changes temporal perception, its effect on illusion strength must be measured separately. citeturn15search10

**Metric ambiguity contract.** Do **not** encode 3:2 by quietly setting the Risset equivalence ratio to \(1.5\). Those are different manipulations. The metric operator should create or accent two concurrent grids on a six-unit common cycle:

\[
G_3=\{0,2,4\},\qquad
G_2=\{0,3\}.
\]

Both streams should be RMS/perceptually balanced in the study condition because current 2:3 polyrhythm evidence shows that acoustic balance can bias metrical interpretation. citeturn15search2 This becomes `rhythm.metricAmbiguity@1 { ratio: [3,2], balance: 0.5 }`.

A separate advanced preset may genuinely use

```json
{
  "ratio": 1.5,
  "label": "3:2 barberpole layer ratio",
  "evidenceStatus": "generalized-construction"
}
```

but it should not be called the canonical Risset preset. Ghisi specifically supports non-integer/proportional generalization under the broader barberpole framework. citeturn18search0

**Anchor control.** A fixed pulse should be implemented independently and mixed after Risset. Recommended study value:

```json
{
  "operator": "rhythm.anchor@1",
  "bpm": 120,
  "relativeLevelDb": -12,
  "voice": "anchor.lowTick",
  "phase": 0
}
```

The hypothesis is that a stable temporal reference reduces the freedom to reinterpret which temporal level constitutes “the beat,” thereby making global recurrence easier to notice. That prediction follows from hierarchical beat-selection evidence, but I found no direct controlled Risset-plus-anchor experiment establishing its magnitude. It is consequently an excellent **control condition**, not a feature AGL should claim is known to weaken the illusion. Madison's data show listeners spontaneously change temporal level when no fixed external reference is supplied; the anchor test asks whether explicitly supplying one suppresses that behavior. citeturn14search0

**Pitch coupling.** Keep `pitch.shepard@1` downstream or parallel:

```text
rhythm.risset ───────────────► percussion voice
       │
       └─ normalized logTempo ─► pitch.shepard [optional]
```

The study harness must never treat pitch-coupled trials as evidence for a rhythm-only claim because pitch context can alter temporal judgments. citeturn15search5 The existing backlog already treats Shepard pitch coupling as a separate P1 item, which is exactly the right architectural boundary. fileciteturn0file0

The proposed deterministic fixture corpus is:

```json
{
  "schema": "agl.fixture.risset",
  "schemaVersion": 1,
  "generatorVersion": "rhythm.risset@1",
  "sampleRate": 48000,
  "seed": "DR01-20260813",
  "source": {
    "id": "iso4-v1",
    "beatsPerCycle": 4,
    "events": [
      {"phase": 0.00, "gain": 1.0, "voice": "tick-v1"},
      {"phase": 0.25, "gain": 1.0, "voice": "tick-v1"},
      {"phase": 0.50, "gain": 1.0, "voice": "tick-v1"},
      {"phase": 0.75, "gain": 1.0, "voice": "tick-v1"}
    ]
  },
  "canonical": {
    "ratio": 2.0,
    "cycleSeconds": 20.0,
    "centerBeatBpm": 120.0,
    "window": "raisedCosine",
    "windowHalfWidth": 2.0,
    "normalization": "linearPartition",
    "sourcePhase": 0.0
  }
}
```

Versioned project cases:

| Fixture ID | Delta from canonical | Purpose |
|---|---|---|
| `dr01-risset-core-up-v1` | `direction:+1` | Main accelerando |
| `dr01-risset-core-down-v1` | `direction:-1` | Directional symmetry |
| `dr01-risset-seam-stress-v1` | accented asymmetric four-beat source | Detect pattern/reset leakage |
| `dr01-risset-two-layer-v1` | `B:1` | Compare sparse crossfade / nominal 3 dB power modulation |
| `dr01-risset-equal-power-v1` | L2 normalization | Crossfade comparison |
| `dr01-risset-anchor-v1` | fixed 120 BPM anchor | Stable-reference control |
| `dr01-risset-shed-v1` | layer-aware subdivision shedding | Density-manipulation test |
| `dr01-barberpole-3to2-v1` | `ratio:1.5` | Generalized layer-ratio experiment |
| `dr01-metric-3to2-v1` | separate 3:2 accent grid | Metric-ambiguity experiment |
| `dr01-risset-hard-reset-v1` | forced phase/gain restart at cycle boundary | Positive reset-detection control |
| `dr01-risset-pitch-v1` | independent Shepard pitch coupling | Post-MVP confound measurement |

The core synthetic `tick-v1` should be a deterministic short, band-limited transient with the same waveform on every layer; no sampled soundtrack material is needed. This satisfies the charter's copyright boundary while producing stimuli whose temporal, amplitude, and spectral behavior can be reproduced exactly.

Automated acceptance for those fixtures should include:

```text
RATE-RATIO
  abs(f(k+1,t) / f(k,t) - r) < 1e-12

RATE-RELABEL
  relerr(f(k,t+C), f(k+d,t)) < 1e-12

GAIN-RELABEL
  abs(g(k,t+C) - g(k+d,t)) < 1e-12

PHASE-RELABEL
  circularDistance(theta(k,t+C), theta(k+d,t)) < 1e-12

DIRECTION
  sign(d/dt log(f(k,t))) == cfg.direction

GAIN-BOUNDS
  0 <= g(k,t) <= 1
  abs(sum_k(g(k,t)) - 1) < 1e-12

DEFAULT-WINDOW-POWER
  for B=2:
  max_t(sum(g(k,t)^2)) - min_t(sum(g(k,t)^2)) < 1e-12

FINITE-SUPPORT
  W(x) == 0 for abs(x) >= B
  newly allocated layers begin at zero gain
  retired layers leave at zero gain

EVENT-ORDER
  timestamps are monotone after stable sort
  no duplicate (logicalLayer, sourceCycle, sourceEvent) IDs

QUERY-INVARIANCE
  eval([a,c]) filtered to [b,c]
    == eval([b,c]) byte-for-byte for b>=a

CHUNK-INVARIANCE
  concat(eval([a,b]), eval([b,c]))
    == eval([a,c])

DETERMINISM
  same project + seed + operator version
    => identical event JSON and fixture hash

EVENT-BUDGET
  <= 128 events/s accepted
  > 128 events/s returns structured budget failure
  no silent event dropping

REALTIME/OFFLINE-PLAN
  canonical render-plan event times identical;
  backend rendering tolerance delegated to DR-03

NO-HIDDEN-PITCH
  core Risset events preserve voice/pitch descriptor exactly

NO-HIDDEN-SUBDIVISION
  core Risset emits one transformed event for every eligible
  source-pattern crossing independent of logTempo
```

The important difference from many simple implementations is the **query/chunk invariance test**. A deterministic graph evaluator must not initialize each requested time interval at local phase zero. The equations are functions of absolute project time, so evaluating 10–20 s separately must generate the same events as evaluating 0–20 s and cropping. That property is necessary for timeline seeks, cache chunks, freezing, and offline/real-time agreement.

## Perceptual validation and visualization

No human participant pool was available inside this research run, so the appropriate charter fulfillment is a **runnable AGL-065 study-harness specification**, not fabricated pilot results. The study should explicitly separate “I hear acceleration” from “I failed to detect the mathematical wrap,” because those are related but non-identical perceptual outcomes.

The recommended first internal pilot is within-subject, headphone-based, with at least 24 usable participants for parameter debugging and approximately 32 as the target before accepting a P0 preset. Those values are engineering pilot sizes rather than a claimed power calculation; effect-size estimates from the pilot should determine the later confirmatory sample. Madison's controlled demonstration used 19 nonmusicians, which establishes that such effects are measurable with relatively modest samples but does not provide an effect size for AGL's different stimulus. citeturn14search0

Each trial should last approximately 42–50 s with \(C=20\) s, giving at least two hidden equivalence boundaries. Start log phase \(u_0\) should vary deterministically between trials so a participant cannot learn that a reset is always at, say, second 20. Direction, condition, source-pattern variant, and initial phase should be counterbalanced.

The minimum experimental condition set is:

| Condition | Scientific role |
|---|---|
| Core Risset up/down | Candidate MVP |
| Hard-reset accelerando/decelerando | Positive control: a restart should be detectable |
| Single accelerating/decelerating layer | Shows what happens without layer replacement |
| Core + fixed anchor | Tests stable-reference hypothesis |
| Core + subdivision shedding | Measures whether density simplification helps or harms |
| Core + 3:2 metric ambiguity | Exploratory metric effect |
| Two-layer \(B=1\) | Crossfade-width comparison |
| \(B=2\) L1 vs L2 | Normalization comparison |

Shepard pitch should **not** participate in the main MVP acceptance analysis. Put it in a separate exploratory factorial block only after the rhythm-only preset is accepted, because pitch can introduce an independent temporal bias. citeturn15search5

Four complementary measures are recommended.

**Direction judgment** is the simplest primary perceptual endpoint: after each trial, choose “speeding up,” “slowing down,” or “neither/unclear,” followed by confidence 1–5. This verifies the intended sign of the illusion without requiring the listener to understand Risset construction.

**Reset detection** should run continuously during playback. Participants press a key whenever they think the rhythm “restarted, jumped, or wrapped.” The harness records button times but never displays cycle boundaries. Each trial also contains matched **sham boundary times** sampled at the same spacing but away from true mathematical closure points. The meaningful statistic is therefore whether responses disproportionately cluster near actual boundaries relative to sham times, not merely how many buttons were pressed.

**Beat tracking** should use a tap key in a dedicated block. Analyze the median log inter-tap interval and metric-level jumps, not raw BPM alone. Madison's result shows that listeners can switch temporal level while remaining synchronized to stimulus structure, so octave-like jumps are part of the phenomenon rather than automatically an error. citeturn14search0

**Continuous strength** can be measured in a separate, shorter block with a one-dimensional “how strongly does this feel like ongoing acceleration/deceleration?” control. Do not combine continuous strength manipulation and tapping in the same trial; the concurrent motor tasks unnecessarily complicate interpretation.

The product's proposed **“convincing preset” acceptance rule** should be declared as an AGL engineering criterion rather than attributed to prior literature:

| Measure | Proposed P0 acceptance |
|---|---|
| Correct direction | ≥75% of trials and bootstrap 95% CI lower bound > chance |
| Boundary detectability | Actual-boundary minus sham response probability within ±10 percentage points under an equivalence analysis |
| Hard-reset control | Clearly more detectable than seamless Risset; otherwise the reset task is not sensitive |
| Confidence | Median ≥3/5 on correctly identified direction trials |
| Tapping | Intended direction in median log-IOI trajectory for ≥70% of usable listeners; metric jumps allowed |
| Objective level drift | No systematic first-to-last-quarter RMS increase/decrease >1 dB in the fixed-timbre core stimulus |
| Spectral cue | No programmed pitch/timbre/brightness trajectory in rhythm-only core |
| Dropouts | No backend underruns or event-budget violations |

The ±10 percentage-point equivalence margin and 75% direction criterion are **product thresholds**, not established psychoacoustic constants. They are strict enough to reject a preset whose seam is routinely audible while not pretending that an impossible percept must occur universally.

The statistical model should preserve repeated measures. Direction correctness is appropriately modeled with a mixed-effects logistic model with fixed effects for condition, direction, musical training, and relevant interactions, and random participant/stimulus intercepts. Reset responses can use a mixed logistic boundary-versus-sham model followed by an equivalence test against the ±0.10 product margin. Tap intervals should be analyzed in \(\log_2\) time so factor-of-two metric changes are symmetric. Exploratory pairwise condition comparisons should use multiplicity control such as Holm adjustment.

Do not exclude musicians; record formal training and treat it as a covariate/exploratory moderator. Existing rhythm and polyrhythm research shows meaningful individual differences related to metrical interpretation and training, so a “works for everyone” acceptance standard would be scientifically inappropriate. citeturn15search13

Equipment requirements should be modest but controlled. Use headphones for recorded research data, request a quiet environment, offer a conservative volume-calibration tick before trials, and never increase master level automatically when users report difficulty. The Risset mechanism does not require stereo spatialization, so mono-compatible stimuli are preferable. Accessibility should include keyboard-only responses, non-color visual labels, reduced-motion visualization, captioned instructions, and a non-audio explanatory pathway. These fit the existing AGL accessibility requirements. fileciteturn0file0

The visual explanation should have **one primary view and two linked derived views**, rather than making a Penrose staircase the actual mathematical representation.

The primary model should remain AGL-062's **wrapped log-tempo strip**, because that item already calls for layer, gain, phase, relabel, and dominant-band state to link to playback. fileciteturn0file0 Put \(\log_r f\) vertically. Each layer is a moving point/track; opacity or width shows \(g_k\). A horizontal “audibility band” around the preferred center makes it immediately apparent that individual layers climb or descend while replacement layers enter from the opposite edge.

Conceptually:

```text
higher rate
     ↑
 +2  · · · · layer fades out
 +1       ╱
  0 =====╱===== strongest region =====
 -1    ╱
 -2  ╱       new layer fades in
     │
     └──────────────→ time

        wrap:
        topological identity changes,
        physical trajectory does not jump
```

A secondary **cylinder view** wraps the vertical log-tempo coordinate. It gives the best pedagogical explanation of local acceleration plus global closure: a point can continuously spiral upward on the cylinder yet revisit the same angular tempo class. Ghisi's barberpole framing makes this geometric analogy especially appropriate. citeturn18search0

A torus is mathematically meaningful only in Inspect mode when AGL simultaneously displays **source-pattern phase modulo one** and **log-tempo phase modulo one**. Those two circular coordinates define the natural toroidal state visualization after layer identification. It is elegant for advanced users, but too abstract for first exposure.

A Penrose-stair/barberpole image is useful solely as an analogy. It should never substitute for the actual coordinate model because a Penrose staircase does not explain phase offsets, gain normalization, or why an arbitrary source pattern closes.

The recommended guided-experiment storyboard is:

| Step | Audio | Visual revelation | Teaching point |
|---|---|---|---|
| Single layer | One accelerating layer | Unwrapped log-tempo line | Local acceleration is real |
| Add copies | Several octave-related layers | Parallel lines | Same pattern exists at multiple temporal scales |
| Add crossfade | Gain window appears | Lines brighten/dim through center | Attention can transfer between scales |
| Reveal wrap | Cylinder/log-strip seam enabled | Layer identity relabels | Global state closes without a local jump |
| Add anchor | Fixed horizontal pulse reference | Reference line remains stationary | An external frame can expose relative change |
| Add subdivision shedding | Events disappear selectively | Ghosted filtered events | Density is a separate manipulation |
| Add 3:2 ambiguity | Two accent grids appear | Six-cell common-cycle overlay | Meter can be ambiguous independently of tempo wrapping |
| Add Shepard pitch | Pitch helix appears separately | Two linked but independent spirals | Pitch and rhythm illusions can reinforce or confound one another |

This sequence accurately distinguishes **a layer's genuine local rate change** from the **ensemble's recurrent global state**. It avoids the misleading statement that “nothing is actually accelerating.” Individual layers really do accelerate or decelerate; what is illusory is the inference of an unbounded global tempo trajectory despite cyclic replacement.

## Claims, Troy boundary, and evidence matrix

The *Troy* evidentiary situation is stronger than ordinary fan analysis but narrower than an implementation reconstruction.

The official soundtrack release contains a Ludwig Göransson track titled “Troy,” released as part of *The Odyssey* soundtrack in July 2026. citeturn9search0turn9search8 More importantly, in a July 20, 2026 Entertainment Weekly discussion of the Troy sequence, Tom Holland described the repetitive accelerating score as highly stressful, and Christopher Nolan explicitly characterized the device as **continuous acceleration** and a **Risset rhythm**, explaining it as the rhythmic counterpart of a Shepard-tone-like continuous ascent and saying it was used to increase anxiety and tension. Nolan also said Göransson uses the device elsewhere in *The Odyssey*. citeturn26view0

That is authoritative enough to say that the production intentionally uses a Risset-rhythm concept in the Troy sequence. It is **not** sufficient to infer the detailed production graph. Nolan gives no layer count, rate ratio, gain law, pattern phases, subdivision transformation, audio-loop source, 3:2 relationship, processing chain, or DAW/session implementation. citeturn26view0

Nolan's wording that he and Hans Zimmer had “come up with” the idea on *Dunkirk* should also not be repeated as a claim that they invented the Risset rhythm. Risset's peer-reviewed description predates *Dunkirk* by decades. The historically safe interpretation is that Nolan and Zimmer had previously **adopted/developed this scoring use** in their work together, not that they originated the psychoacoustic construction. citeturn18search15turn26view0

A public analysis located during this run describes the Troy material as seeming to phase between a military 2/4 feel and a chaotic 3/4 feel. That is musically interesting and motivates the proposed 3:2/metric-ambiguity experiment, but it is **unofficial analysis**, not production documentation. citeturn12search3 Contemporary controlled 2:3-polyrhythm research independently establishes that such ratios can support metrical ambiguity, which makes the laboratory preset scientifically coherent without implying that the public reconstruction is correct about Göransson's session. citeturn15search2

The decision-bearing evidence matrix is:

| Claim | Source and date | Claim type | Method / population / stimulus | Confidence / decision |
|---|---|---|---|---|
| Pitch can support circular “always higher/lower” judgments | Shepard, JASA, 1964-12-01. citeturn25view4 | Primary perceptual evidence | Computer-generated complex tones; relative-pitch judgments | **High**; historical basis for circularity analogy |
| Risset explicitly constructed a rhythmic analog of his pitch paradox | Risset, JASA, 1986-09. citeturn18search15 | Primary historical/scientific claim | Synthesized rhythmic sequences | **High** |
| Canonical Risset rhythm uses power-of-two rate layers; broader barberpole family can use non-integer proportions | Ghisi, online 2021-12-07 / JMM 2023. citeturn18search0 | Peer-reviewed mathematical analysis | Formal construction/generalization | **High** |
| Practical “eternal accelerando” scheduling is established in computer-music literature | Stowell, ICMC 2011. citeturn23view0 | Primary computational-music source | Scheduling/composition method | **High** for implementation lineage; not perceptual optimum |
| A public Stowell-derived implementation uses multiple rate-scaled loops with a smooth cosine-like level window and a 20 s doubling example | Public SuperCollider implementation, 2016, citing Stowell. citeturn19search0 | Public implementation | Code example | **Medium** engineering lineage; **not** psychoacoustic evidence |
| Listeners can perceive/track a multilevel pattern through hidden factor-two tempo recurrences | Madison, PLOS ONE, 2009-12-03. citeturn14search0 | Primary perceptual evidence | N=19 nonmusicians; 768-event, nine-level sequences; synchronized tapping | **High** for multilevel endless-tempo effect |
| Perceptual temporal-level switching is variable and direction-dependent | Madison 2009. citeturn14search0 | Primary perceptual evidence | Same N=19 tapping study | **High**; warns against “dominant layer = perceived tempo” |
| Midrange tempi form a privileged beat/tactus region | Music-cognition synthesis. citeturn15search15 | Scholarly synthesis | Review of temporal/metrical perception | **Medium-high** for center-band rationale |
| Subdivision density can alter perceived duration/tempo | Filled-duration music study, 2010. citeturn15search10 | Primary perceptual evidence | Musicians and nonmusicians; subdivided versus simple beat intervals | **High** rationale for separate shedding operator |
| 2:3/3:2-like polyrhythmic figures can be perceptually ambiguous and biased by priming/acoustic balance | 2026 polyrhythm studies; 2026 review. citeturn15search2turn15search13 | Primary + review | EEG/behavioral studies including 2:3; broader scoping review | **High** for ambiguity; **low** for “improves Risset” |
| Pitch context can bias temporal/tempo perception | Recent psychophysical study. citeturn15search5 | Primary perceptual evidence | Pitch/time manipulation | **High** rationale for pitch-off rhythm baseline |
| The Troy sequence intentionally uses a Risset rhythm / continuous acceleration | Nolan interview, Entertainment Weekly, 2026-07-20. citeturn26view0 | Authoritative production statement | Director discussing scene and score | **High** |
| Troy uses exactly 3:2, 2/4↔3/4 phasing | Public analysis. citeturn12search3 | Public reconstruction/observation | Listening-based commentary | **Low** as production fact; hypothesis only |
| Troy used a particular layer count, envelope, subdivision algorithm, or loop architecture | No authoritative specification located in the production material examined; Nolan specifies concept, not mechanics. citeturn26view0 | Unknown | — | **Do not claim** |
| AudioParam automation can represent precise exponential parameter trajectories | W3C Web Audio API 1.1. citeturn16search1 | Web standard | Normative API definition | **High** |
| Default render quantum is currently 128 frames but should not become operator semantics | W3C Web Audio API 1.1. citeturn17view0 | Web standard | Normative processing model | **High** |
| AudioWorklet executes custom processing on the audio rendering thread | W3C Web Audio API 1.1. citeturn17view3 | Web standard | Normative API definition | **High** |
| \(B=2\) raised-cosine/L1 window gives exact relabeling and constant lattice gain/power sums | DR-01 derivation, 2026-08-13 | Mathematical fact | Analytic equation/sweep | **High** |
| 20 s, 120 BPM, \(B=2\) is perceptually optimal | No such optimization study located | Product hypothesis | Must be tested by AGL-065 | **Low until pilot** |
| Fixed anchor weakens illusion | DR-01 hypothesis grounded in temporal-reference logic | Product inference | To be tested by AGL-065 | **Low direct evidence** |

Recommended public wording:

> **Risset Rhythm**  
> This experiment layers copies of a rhythmic pattern at related temporal scales. Each layer genuinely speeds up or slows down, while its prominence shifts to another layer as the system wraps through log-tempo space. The combined pattern can create the impression of acceleration or deceleration that continues beyond the physical cycle. Risset described a rhythmic analog of circular pitch paradoxes in the twentieth century, and later researchers developed practical and generalized forms of the construction. citeturn18search15turn23view0turn18search0

For the film connection:

> **Film-score connection**  
> Christopher Nolan has described Ludwig Göransson's score for the Troy sequence in *The Odyssey* as using a Risset rhythm—a continuous-acceleration device used to intensify tension. This laboratory demonstrates the underlying psychoacoustic idea with synthetic material; it is not a reconstruction of Göransson's recording session or soundtrack production. citeturn26view0

For the cinematic preset:

> **Cinematic Metric Ambiguity — experimental**  
> This preset combines the Risset construction with an independently generated 3:2 metrical ambiguity. Research supports the idea that 2:3/3:2 polyrhythms can admit competing metrical interpretations, but the combination here is an AGL experiment, not a documented reconstruction of *The Odyssey*. citeturn15search2turn15search13

Prohibited or overstated formulations are:

| Do not say | Why |
|---|---|
| “The rhythm literally accelerates forever.” | The ensemble is recurrent; the **perception** can imply unbounded acceleration |
| “Nothing is really accelerating.” | False: individual layers have genuinely changing event rates |
| “60 and 120 BPM are perceptually the same, like pitch octaves.” | Overstates tempo-octave equivalence |
| “Equal-power is the psychoacoustically correct crossfade.” | No optimization evidence located |
| “Four/five/six layers are required for the illusion.” | No controlled minimum-layer result located |
| “3:2 makes the Risset illusion stronger.” | Testable hypothesis, currently unsupported |
| “A fixed beat is known to break the illusion.” | Plausible control hypothesis, not established result found here |
| “Göransson used 3:2/subdivision shedding/six layers on ‘Troy.’” | No authoritative production source located for those mechanics |
| “This preset recreates ‘Troy.’” | It does not; it demonstrates related principles with synthetic material |
| “Nolan and Zimmer invented the Risset rhythm on *Dunkirk*.” | Risset's documented construction predates the film by decades. citeturn18search15turn26view0 |
| “The effect works on everyone.” | Perceptual studies show listener variation; no universal effect is established. citeturn14search0turn15search13 |

## ADR, handoff, and open questions

**ADR title:** `ADR — Infinite Staircase uses event-based exact-relabel Risset construction`

**Status:** Proposed → sufficiently researched for acceptance.

**Context.** AGL needs one mathematically closed, explainable construction that can drive real-time and offline rendering, support deterministic graph evaluation, and serve as a clean psychoacoustic stimulus. Sprint 0 already has a raised-cosine envelope and layer-relabel tests. DR-01 must avoid allowing soundtrack speculation or optional perceptual manipulations to redefine the fundamental operator. The backlog identifies exactly those decisions as gates for AGL-061, AGL-063, and AGL-065. fileciteturn0file0

**Decision.** Adopt:

```text
rhythm.risset@1
  canonical family: Risset
  canonical ratio: 2
  time law: linear motion in log_r tempo
  source: exactly periodic trigger pattern
  renderer-independent output: layered trigger events
  source timbre: unchanged
  conceptual layer indices: all integers
  closure: exact rate + gain + source-phase relabeling
  direction: +1 accelerando, -1 decelerando
  window: compact raised cosine
  default half-width: 2 log-r units
  normalization: linear gain partition
  center: 120 BPM nominal
  traversal: 20 s / log-r interval
  generated-event warning: 32/s
  provisional hard event budget: 128/s
```

The serialized contract should expose semantics rather than backend implementation:

```json
{
  "operator": "rhythm.risset",
  "version": 1,
  "params": {
    "ratio": 2.0,
    "direction": 1,
    "cycleSeconds": 20.0,
    "centerBeatBpm": 120.0,
    "initialLogPhase": 0.0,
    "sourcePhase": 0.0,
    "window": {
      "family": "raisedCosine",
      "halfWidthLogRatio": 2.0,
      "normalization": "linearPartition"
    },
    "phaseMode": "exactRelabel",
    "maxEventsPerSecond": 128
  },
  "semantics": {
    "changesPitch": false,
    "changesTimbre": false,
    "changesSubdivision": false,
    "closure": "layerRelabel",
    "tempoCoordinate": "logRatio"
  }
}
```

The output event metadata should include at least:

```ts
type RissetTrigger = {
  id: StableId;
  time: RationalOrExactTime;
  sourceEventId: StableId;
  sourcePhase: number;
  logicalLayer: number;
  logTempo: number;
  rateScale: number;
  gain: number;
  direction: -1 | 1;
  provenance: {
    operator: "rhythm.risset";
    version: 1;
    ratio: number;
  };
};
```

**Why event-based wins the MVP ADR.** It preserves source timbre, makes rhythm the independent variable, permits exact analytic event scheduling and layer-relabel closure, makes source-pattern provenance visible, avoids relying on unspecified browser resampling quality, supports deterministic timeline chunking, and can generate both real-time and offline render plans from the same data. Web Audio provides the necessary precise time/automation and AudioWorklet mechanisms underneath that representation. citeturn16search1turn17view3

The audio-loop variant remains valuable as an Inspect/Compose comparison because it corresponds closely to common practical Risset implementations, but it should be explicitly labeled **rate-scaled loop** and should not be the stimulus from which AGL makes rhythm-only psychoacoustic claims. citeturn23view0turn19search0

**Rejected alternative: bake subdivision shedding into `rhythm.risset`.** This makes event-density changes inseparable from the claimed tempo illusion, despite evidence that subdivisions independently alter temporal judgments. citeturn15search10 Keep AGL-063's implementation graphically adjacent but semantically separate.

**Rejected alternative: make 3:2 the production default.** Controlled polyrhythm research supports 2:3 ambiguity, not increased Risset strength, and the film-production evidence does not establish 3:2 as Göransson's mechanism. citeturn15search2turn26view0turn12search3

**Rejected alternative: couple Shepard pitch by default.** Pitch can bias temporal perception, so doing so would prevent a clean attribution of the effect to rhythmic structure; the backlog's separate P1 AGL-064 is the correct scope. citeturn15search5 fileciteturn0file0

The concrete handoff is:

| Program item | DR-01 update |
|---|---|
| **AGL-061** | Accept canonical \(r=2\), 20 s, 120 BPM, \(B=2\), L1 raised-cosine profile; add \(B=1\), L2, anchor, 3:2, and shedding as comparison presets; mark exact defaults “engineering-selected pending AGL-065 pilot.” |
| **AGL-063** | Implement subdivision retention/shedding as a layer-aware post-Risset event filter. Do not alter timestamps inside shedding. |
| **AGL-065** | Implement direction + hidden-reset protocol with hard-reset positive control, sham boundaries, tapping block, confidence, and parameter-comparison conditions. |
| **`rhythm.risset@1`** | Adopt equations, exact phase recurrence, conceptual integer layers, event metadata, and tests above. |
| **Infinite Staircase presets** | `Canonical Risset`, `Two-Layer Exposed`, `Anchor Control`, `Subdivision Shedding`, `Cinematic Metric Ambiguity`, `3:2 Barberpole` |
| **DR-03** | Benchmark ~15, 60, and 128 trigger/s Risset workloads; verify real-time/offline plan consistency and dynamic slot churn |
| **DR-08** | Standardize vocabulary for `physicalRate`, `logTempo`, `perceivedBeat`/`reportedBeat`, `layerGain`, `sourcePhase`, `closurePhase`, `metricInterpretation` |
| **ADR** | Accept event-based exact-relabel construction as P0 canonical |

The most important unresolved research question is now **perceptual optimization rather than semantics**. AGL-065 should determine whether \(B=2\) actually outperforms \(B=1\) or \(B=2.5\), whether 20 s is preferable to 12/30/40 s, and whether an L1 envelope's deterministic amplitude behavior is perceptually preferable to nominal equal-power mixing. There is no justification for postponing the core operator while waiting for those answers because all of them can be varied without changing the operator's mathematical contract.

A second post-MVP question is whether phase relationships across layers should themselves become a compositional parameter. Exact closure permits deterministic nonzero \(\beta_k\), but accent alignment and coincident attacks may alter stream segregation and reset salience. That is a worthwhile factorial experiment once the canonical condition is stable.

A third question is whether generalized non-octave ratios have distinct perceptual regimes. Ghisi establishes that non-integer barberpole constructions are mathematically legitimate. citeturn18search0 AGL can therefore study \(r=3/2\), \(\sqrt2\), or harmonic families later, but should not collapse those findings back into the historical term “Risset rhythm” without qualification.

A fourth is the fixed-anchor effect. It is theoretically useful enough to include immediately as a control, but AGL-065 should measure whether the anchor reduces direction ratings, increases seam detection, changes tapping level, merely forms a separate auditory stream, or has little effect. The result could become publishable-quality evidence because this specific manipulation appears underexplored in the literature located here.

A fifth is the relationship between metric ambiguity and cinematic tension. Current evidence establishes that 2:3 patterns can sustain competing metrical interpretations, while Nolan independently confirms intentional Risset acceleration in the Troy sequence. citeturn15search2turn26view0 Whether combining those mechanisms increases subjective tension, strengthens infinite acceleration, or instead makes tempo direction less clear is an empirical question. AGL should measure those as separate dependent variables.

Finally, the “Troy” boundary is now precise enough for product/legal/editorial use:

**Confirmed:** Nolan publicly says the Troy sequence uses a Risset rhythm/continuous acceleration to increase tension. citeturn26view0  
**Observable but not production-confirmed:** listeners may hear changing or competing meters. citeturn12search3  
**Scientifically plausible independent mechanism:** 3:2/2:3 structures can support ambiguous meter. citeturn15search2turn15search13  
**Not confirmed:** the soundtrack's exact ratio, number of layers, crossfade law, phase architecture, subdivision shedding, source assets, session routing, or implementation.  
**Product consequence:** AGL may teach the confirmed Risset concept and separately demonstrate a cinematic 3:2 experiment, but must never present the latter as an authoritative reconstruction.

That closes every scientific choice necessary for the P0 operator: the remaining uncertainty can be represented as preset evidence status and tested empirically rather than leaking into API semantics.

**DR-01 recommended disposition: `accepted-for-MVP / perceptual-preset-validation-pending-AGL-065`.**

#Psychoacoustics #RissetRhythm #RhythmPerception #DSP #WebAudio #MusicCognition #AuralGeometryLab #InfiniteStaircase

**Rough conversation-token estimate:** ~145k tokens.