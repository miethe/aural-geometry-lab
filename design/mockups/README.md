# AGL-149 — Canonical high-fidelity mockup campaign

**Backlog item:** `AGL-149` (E14, P1) — *Generate and critique S01–S16 against v0.3 semantic
states and the three-interpretation mockup campaign.*
**Depends on:** AGL-140 (final design spec), AGL-142 (tokens/manifests), DR-11 (professional
music-tool UX).
**Normative sources:** `docs/15-mockup-generation-spec.md` (master prompt §2, fidelity rules §3,
screen set §4, variants §5, rubric §6), `design/tokens.json` v0.3.0, `design/screens.json`
v0.3.0, `design/components.json`.

## What is here

| Path | Contents |
|---|---|
| `build-prompts.py` | Assembles the 48 prompts (16 screens × 3 interpretations) from the repo-canonical sources above. Deterministic — rerunning reproduces the pack byte-for-byte. |
| `prompts/` | The 48 assembled prompts, one `.txt` per (screen, variant). |
| `run-one.sh` | One render leg. Shells the routed provider, writes `images/<name>.png`, then composites any reserved figure plate into it. |
| `images/` | Rendered mockups + the raw provider log for each render. |
| `figure-plates.json` | Which screens reserve a canvas region for a kernel-generated figure, and where. Read by **both** `build-prompts.py` and `composite-figure.sh`, so the reserved rectangle and the composited rectangle cannot drift. |
| `figures/` | Generated SVG figures. Build with `npm run figures`; never hand-edit — they are output. |
| `composite-figure.sh` | Rasterises a figure and composites it into its plate. No-ops for screens without one. |
| `critique.json` | Per-mockup rubric scores (§6), reject flags, and the synthesis verdict. |
| `../../docs/reports/agl-149-mockup-critique.md` | The human-readable critique and synthesis. |

## Provider routing

Resolved through `delegation-router` before any leg ran:

```
task_class      image_generation      (routable; not MUST-stay-primary)
requires_write  true                  (deliverable is a file)
chosen_plugin   codex
model           gpt-5.6-terra
effort          high
agent_type      codex-executor
invocation      codex exec --sandbox workspace-write "{prompt}"
fallback_chain  nano-banana/nano-banana-2 → nano-banana/nano-banana-pro → claude/claude-sonnet-5
```

Capability was **verified before the campaign ran**, not assumed: a probe leg
(`codex exec … "generate a red circle, save probe.png"`) produced a real 256×256 PNG, and
`codex features list` reports `image_generation  stable  true`. The rendering tool is Codex's
built-in `image_gen`; it writes to `$CODEX_HOME/generated_images/` and each leg copies the
selected output to its target path.

**Critique and synthesis were not delegated.** `verdict` and `synthesis` are MUST-stay-primary
task classes, so the scoring pass and the converged direction are the orchestrator's, reading
the rendered images directly.

## What these images are, and are not

They are a **visual-direction campaign**, not an implementation authority. Per
`docs/15-mockup-generation-spec.md` §8 a mockup becomes implementation-authoritative only once
its components map to `design/components.json`, deviations from tokens are recorded, interaction
behaviour is written down rather than inferred from pixels, its content/math values are valid,
and it carries an accessibility annotation. **None of that is satisfied by a generated raster.**
Generative image models cannot be trusted to render exact hex values, exact panel pixel widths,
correct musical values, or legible small type; every such detail in these images is a proposal to
be checked against the tokens, never a measurement of them.

The annotation pass (§7) and the handoff gate (§8) remain open work.

## Figure plates — the mathematics is composited, never prompted

Every one of the 20 rejected tranche-1 mockups failed the `mathematical correctness` reject axis:
a rendered figure contradicting a number printed beside it. S04-B labelled a ring `E(12,5)` whose
onsets were `{0,1,2,3,4}` — the arguments inverted — and S07-A claimed a "7/12 pulse field" while
drawing five onsets. That was never a prompting deficiency: the prompts already stated the exact
counts and §S3 already forbade contradicting them. **Generative image models cannot render
mathematically-constrained content, and in AGL the mathematics is the content.**

So for the screens listed in `figure-plates.json` the model is no longer asked to draw it:

1. `npm run figures` generates the figure as SVG from `src/design/figures.ts`, which obtains every
   onset, gap, notation string, lattice node and edge by calling `src/operators/*.ts` directly.
2. `tests/figures.test.mjs` asserts the emitted SVG's `data-onsets` / `data-gaps` /
   `data-notation` and lattice tuples **against those same kernels**, so a wrong figure fails
   `npm run test` rather than a reviewer's eye. `data-notation` is derived as `E(pulses,steps)`
   from the arguments the kernel was called with, which makes the inverted-argument defect
   unrepresentable rather than merely discouraged.
3. `build-prompts.py` injects a RESERVED FIGURE PLATE block telling the model to leave that
   rectangle empty — and, when the figure is already built, lifts its labels out of the SVG and
   gives the model a closed list to copy, so control panels *outside* the plate cannot contradict
   it either.
4. `run-one.sh` calls `composite-figure.sh`, which rasterises the figure with `rsvg-convert` and
   composites it into the plate at the rendered image's actual pixel size (the plate rectangle is
   fractional for exactly this reason).

`rsvg-convert` (`brew install librsvg`) is required and is deliberately **not** given an
ImageMagick fallback: ImageMagick decodes SVG with its own internal renderer, which supports
neither the figure's CSS nor its text, and silently accepting an approximate rasteriser would
defeat the correctness this path exists for.

`figure-plates.json` and `scripts/build-figures.mjs` share one figure list, `scripts/figure-specs.mjs`
— one file so the generator and the checker below cannot drift about what was meant to be drawn.

### The mathematical-correctness reject axis is machine-derived for plated screens

Because a plated screen's figure is kernel-generated and byte-identical across all three variants,
the `mathematical correctness` reject axis is decided by a deterministic zero-model check, not by
the model reading pixels — the earlier by-eye path was unstable (two passes over the same
byte-identical S04 figure returned opposite onset readings, adjudicated and vacated in
`critique/S04.json`).

- `scripts/check-figures.mjs` asserts, for every plate, that the referenced figure exists, that its
  committed bytes equal the current `npm run figures` output (a stale committed SVG fails), that
  each layer's `data-onsets`/`data-gaps`/`data-notation` equal `euclideanRhythm`/`cyclicGapLengths`/
  `E(pulses,steps)` from the compiled `src/operators/euclidean.ts`, that the drawn `data-step`
  values are a bijection over `0..steps-1`, and that every onset marker sits at the angle its step
  implies on its ring (recomputed from the ring's own centre and radius). `node
  scripts/check-figures.mjs --screen S04 --json` prints the verdict; `npm run verify` runs it over
  every plate. `tests/figure-plates.test.mjs` proves the gate bites: a marker moved off its angle,
  a corrupted `data-onsets` entry, and a duplicated `data-step` are each reported as a failure.

  It reaches the kernel and the renderer through `dist/`, so it is a statement about the last
  build. `checkBuildFreshness()` therefore fails when `src/operators/euclidean.ts` or
  `src/design/figures.ts` is newer than its compiled output — otherwise a bare `npm run verify`
  after a source edit would re-render from stale code, compare it to the equally stale committed
  SVG, and report green. `npm run check` builds first and never had that exposure.
- `score-one.sh` runs the checker before scoring a plated screen (a failed check aborts the run — a
  broken figure is never stamped "pass"), replaces the by-eye mathematical-correctness prompt bullet
  with a plate-integrity bullet (the model reports only that the plate is present, uncovered and
  correctly placed), and after the model writes its critique overwrites every variant's
  `rejectAxes["mathematical correctness"]` with the machine verdict via
  `scripts/stamp-math-verdict.py`, recording provenance under a top-level `mathVerdict` key. The
  stamp is idempotent and model-free, so re-running the critique yields the same math verdict. The
  model's own variant `verdict` is left untouched — a variant rejected only on the vacated math axis
  is not silently flipped to accept; the human reads `mathVerdict` for that axis.

Screens with no plate keep the by-eye mathematical-correctness path unchanged, and still take the
`SKIP`/`OK` exit-0 path they always did.

**What the stamp does NOT establish.** The checker reads the figure SVG on disk; it never opens the
rendered PNG. If compositing did not happen — no `rsvg-convert`, or a composite failure that
`run-one.sh` swallowed with `exit 0` — the verdict is still `pass` while the reviewed raster
contains no correct figure. Whether the plate actually landed in the image is the model's
plate-integrity report, and that report is **not** a gate today. Each stamped `mathVerdict` carries
`attests`/`doesNotAttest` saying exactly this, so the record cannot be read as more than it is.
