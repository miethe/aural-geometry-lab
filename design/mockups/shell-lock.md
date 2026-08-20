# AGL-149 — Shell convergence record

`docs/15-mockup-generation-spec.md` §1 sequences the campaign as *shell exploration → shell
convergence → …* and warns: **"Do not allow later lab mockups to silently redesign the application
shell."** This file is that convergence, recorded so the lock is auditable rather than implicit in
48 prompt files.

## Exploration wave

S05 *Full Studio Compose* — the spec's own canonical "what the product is" screen — was rendered
in all three interpretations **before** any other screen, with no shell constraint beyond the
master visual prompt and the v0.3.0 tokens:

| Mockup | What it contributed |
|---|---|
| `S05--A-instrument` | The **state legend** as an explicit table (Current / Changed / Missing / Detached / Stale), each row carrying its own glyph — the cleanest non-color-only encoding of `sourceStatus` produced by any variant. Also the horizontal 8-stage mapping strip with a thumbnail curve per stage. |
| `S05--B-laboratory` | The **evaluation block** (cache key, evaluated timestamp, determinism check) and **evidence rows** typed by class with a lock on the research-gated row — the only variant that made `evidence` and `derivation` legible as separate axes. Also axis labels and units on the lattice. |
| `S05--C-spatial` | The **material legend keyed by line style** (solid / dotted / hatched) rather than by hue, and the larger stepper-per-parameter inspector ergonomics that carry to touch. |

The three prompts are preserved byte-identical at `prompts/S05-*.txt`; regenerating the pack does
not alter them, so each rendered S05 image still corresponds exactly to the prompt that produced it.

## The lock

Per §5 the synthesis is **not an average** — each element below was taken from whichever variant
solved it best, and the losing solutions were dropped rather than blended:

- top toolbar 48px — mark, project + save state, centred transport, monospace BPM/meter/position,
  **derivation chip + audio chip** (B), undo/redo, workspace switcher, export/share, overflow;
- left navigator 232px — nav, track list, **material legend keyed by line style** (C);
- right inspector 336px — selection chip, Parameters/Math/Provenance tabs, mapping summary,
  **evaluation block** (B), **evidence rows with a locked research-gated row** (B);
- bottom timeline 240px — bars.beats ruler, per-track lanes, clips textured by material kind,
  playhead with readout;
- operator-graph drawer 28px collapsed, between canvas and timeline, with node count.

Panel widths are the `design/tokens.json` `layout.*Ideal` values, so the lock is a restatement of
the token contract, not a competing one.

**iPad and iPhone (S14/S15/S16) do not inherit this geometry.** They inherit an adaptation *rule*:
one dominant canvas, persistent transport, navigator and inspector demoted to contextual
zones/sheets/drawers, 44pt-class targets, and the same material-legend and status vocabulary.
Panel identity carries over; panel geometry does not. That is DR-11's own finding, and the reason
S14–S16 were not simply given the desktop lock.

The lock is applied by `build-prompts.py` (`SHELL_LOCK_DESKTOP` / `SHELL_LOCK_NATIVE`) to the
other 45 prompts, and deliberately **not** to S05's three, which were rendered pre-lock.

## Amendment — the lock is three scopes, not two (S01 defect, fixed)

The first lock had two scopes: `SHELL_LOCK_DESKTOP` for everything web, `SHELL_LOCK_NATIVE` for
iPad/iPhone. That was wrong, and the S01 renders proved it within one batch.

**S01 Project Library is a pre-project state — no project is open.** Applying the desktop lock to
it produced a live transport with a tempo and a playhead position, a material legend, and a bottom
timeline whose lanes were *named after other projects* (S01-C rendered "Euclidean Signals",
"Spiral Studies", "Tonnetz Drift" as three lanes of one arrangement). Projects are not tracks. It
is a semantic error, not a styling one, and it would have propagated to every later screen that
shares a pre-project or modal state.

Fixed by adding a third scope, `SHELL_LOCK_LIBRARY`: the converged chrome is present but in its
**empty** state — transport disabled with no tempo/meter/position readout, `Derivation idle` +
`Audio disabled`, undo/redo disabled, no track list, no material legend, no timeline, no graph
drawer, and the right panel demoted to an explicitly read-only *library preview* rather than the
live inspector.

The three superseded renders are kept at `images/superseded/*.shell-lock-overapplied.png` — the
defect is more useful as evidence than as a deleted mistake, and the critique report cites them.

**Generalisation for the remaining screens:** the lock describes the shell of *an open project*.
Any screen that is not one — a library, a full-screen modal, an onboarding state, a blocked gate —
needs its own scope rather than the desktop default. S12 (Penrose artifact gate) and S13 (Export)
are the next two to check against this.
