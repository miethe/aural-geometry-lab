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
| `run-one.sh` | One render leg. Shells the routed provider and writes `images/<name>.png`. |
| `images/` | Rendered mockups + the raw provider log for each render. |
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
