---
filed_nodes:
  - node_01M0G0Q0E26DMAY191RBTHG24V
  - node_01M0G0QTAAB1CS68XXPH5P4TPX
  - node_01M0G0RG6MWNQM6DQH7BBYRDPS
  - node_01M0DX6B8638F4JYXM4AMTRE82
---

# AGL-149 — Canonical mockup campaign: critique and verdict (tranche 1)

**Date:** 2026-08-20 · **Backlog item:** `AGL-149` · **Design baseline:** 0.3.0
**Scope:** S01–S07 × {A-instrument, B-laboratory, C-spatial} = 21 rendered mockups.
S08–S16 deliberately not rendered — see §6.
**Rubric:** `docs/15-mockup-generation-spec.md` §6 (15 axes, 0–3; three reject axes).
**Machine-readable:** `design/mockups/critique.json`.

## 1. Verdict

**The campaign succeeds as a visual direction and fails as an implementation authority.** That is
the designed outcome, not a surprise — `docs/15` §8 says a mockup becomes implementation-
authoritative only once its components map to the manifest, its token deviations are recorded, its
interaction behaviour is *described* rather than inferred from pixels, and it carries an
accessibility annotation. A raster satisfies none of those by construction.

**20 of 21 mockups are rejected. Mean score 2.07 / 3 across 15 axes.** The sole surviving reject
axis after adjudication is **mathematical correctness**. One mockup survives: **S03-C**.

## 2. Method, and what was delegated

Per-mockup scoring was delegated — 7 legs, one per screen, routed through `delegation-router`:
`task_class=code_review`, `requires_write=true` → `codex` / `gpt-5.6-terra` / `codex-executor`,
effort `high`. Each leg read the three images, the generating prompt, `tokens.json`,
`screens.json`, `components.json`, and `docs/15`, and returned structured JSON.

**Adjudication, synthesis, and this verdict were not delegated** — `verdict` and `synthesis` are
MUST-stay-primary task classes. Two of the delegate's three reject axes were overturned in part.

## 3. Adjudication of the reject axes

### 3.1 Mathematical correctness — UPHELD

The delegate did arithmetic, not vibes, and it reproduces. Representative findings:

- **S02, all three variants.** The canvas is labelled `log₂ tempo` / `Log tempo / octave wrap`
  while the 60 / 90 / 120 / 180 / 240 BPM bands sit at near-equal spacing. The actual consecutive
  log₂ intervals alternate **0.58496, 0.41504, 0.58496, 0.41504** octaves. Equal spacing is
  therefore wrong on the screen whose entire subject is logarithmic tempo.
- **S04-B.** The ring is labelled `E(12,5)` beside controls reading Steps 12 / Pulses 5 — the
  arguments are inverted; it must be `E(5,12)`. Three sibling tracks repeat the inversion.
- **S04-A.** LCM 20,592 is correct for steps 13/16/11/9, but the same label claims `2:51.6 @ 120
  BPM`, which contradicts the toolbar's own ticks-per-beat.
- **S04-C.** Labelled `E(5,16)`, renders a pulse at **all sixteen** positions — off by 11 onsets.
- **S05-B.** `E(5,8)` rotation +1 should fill steps 1,3,4,6,7; the image fills 1,3,4,5,6.
- **S05-A.** The Tonnetz shows a dotted **C–F♯ adjacency — a tritone (6 semitones)**, which is
  neither a fifth (7) nor a third (3/4), and repeats vertex C.
- **S07-A.** Labelled `7/12`, renders **five** onsets. **S07-B:** labelled `5/7`, renders **seven**.
  **S07-C:** labelled `E(5,13)`, renders **four**.

**One finding corrects the orchestrator.** I had hand-checked S05-A's `E(5,13)` ring earlier in the
session and called its onsets non-Bjorklund. The delegate checked it properly: onsets 0,2,5,7,10
give cyclic gaps **2,3,2,3,3**, which *is* a rotation of the Bjorklund gap sequence 3,2,3,2,3. That
ring is correct and my earlier call was wrong.

### 3.2 Accessibility — PARTIALLY VACATED

The axis conflated two different claims:

- *"No accessibility annotation; icon-only controls carry no labels."* **Vacated.** `docs/15` §3
  requires those labels **"in annotation versions"**, and the §7 annotation pass has not run.
  Scoring an un-annotated raster against a deferred pass penalises the campaign for a step it was
  never asked to have taken yet.
- *"`sourceStatus` and `mappingStage` have no non-colour encoding; `derivation` and `audio` rely on
  coloured chips."* **Upheld.** This is in scope, substantively true across nearly every render,
  and it is a real contract violation: the master prompt requires each state to be distinguishable
  without hue. `materialKind` is consistently solved (solid / dotted / hatched / stepped); the
  other five `semanticStates` axes largely are not.

Net effect on the count: **none.** Mathematical correctness fails independently in the same 20.
Net effect on the diagnosis: **total** — there is one fixable cause, not two.

### 3.3 S8 handoff gate — NOT A DEFECT

Every leg reported that pixels supply no component mapping, no interaction description, no
token-deviation record, and no responsive rule. Correct, and expected. §8 describes conditions a
mockup must *later* satisfy; their absence in a raster is the starting state.

## 4. The structural finding

**Generative image models cannot render mathematically-constrained content, and in AGL the
mathematics *is* the content.** Every failure in §3.1 is a picture that contradicts a number
printed beside it. This is not a prompting deficiency to iterate away — the prompts already state
the exact counts, and the fidelity rules already forbid this.

The implication for the product, not just the campaign: **the mathematical canvas must be rendered
deterministically from the kernels that already exist** (`src/operators/euclidean.ts`,
`tonnetz.ts`, `risset.ts`, …), and generated imagery confined to chrome, layout, and density
studies. A future tranche should composite a real `E(k,n)` ring — computed, not drawn — into the
mockup rather than asking a model to draw one. That is cheaper *and* correct.

## 5. What the campaign did establish

Rejected does not mean worthless. Grounded in the images:

- **The converged shell holds.** Toolbar / navigator / inspector / timeline / graph-drawer geometry
  survived 18 renders across three interpretations without drifting (`shell-lock.md`).
- **`materialKind` has a working non-colour vocabulary** — solid = authored, dotted = live
  generated, hatched = frozen, stepped = edited derivative — legible at timeline-clip scale.
- **Hard semantics render.** S07 shows `MaterialKind` and `SourceStatus` as separate axes, the
  three-option generated-edit chooser, a materialization receipt with hash, and an orphaned event.
  S06 shows a compiler-refused connection with a validity tally and an explicit keyboard route.
  S03 shows wrapped and unwrapped views with the masked reset annotated. These were open questions.
- **The three interpretations genuinely diverge** rather than reskinning, and the per-screen
  recommendation splits across them: A for S01/S02/S04/S07, B for S05/S06, C for S03.

## 6. Scope: why S08–S16 were not rendered

The board (`tree_01M0BS11QH5Y61F2TJQFN40KJV`) parents `AGL-149` under **M5**, and S08–S16 map to
M3/M4/M5/M7 exit criteria. Rendering them now would freeze a visual answer against contracts that
have not been written — S12 most sharply, since M5's entry gate requires DR-09 acceptance and the
certificate content is not yet decided. The campaign harness is reusable per tranche at one command
per screen; nothing is lost by waiting, and each later tranche renders against contracts as they
actually are.

## 7. Required fixes before any of these becomes implementation-authoritative

1. **Composite computed mathematics** into the canvas region instead of generating it (§4).
2. **Extend non-colour encoding** beyond `materialKind` to `sourceStatus`, `derivation`, `audio`,
   `evidence`, `mappingStage`, `selection` (§3.2b).
3. **Run the §7 annotation pass** — this is what closes the vacated half of the accessibility axis.
4. **Add an error/budget state.** No render in the tranche shows one; the axis scored 0 nearly
   throughout, and `control.budget` is in the component manifest.
5. **Add a novice/first-run state axis.** Every render assumes a loaded project and an expert
   operator. `docs/15`'s master prompt requires "a novice can play immediately"; `immediate
   playability` and `novice-to-expert progression` score low across the board as a result.
