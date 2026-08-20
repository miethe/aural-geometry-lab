#!/usr/bin/env python3
"""AGL-149 — assemble the S01-S16 x A/B/C image-generation prompt pack.

Sources (all repo-canonical, nothing invented here):
  docs/15-mockup-generation-spec.md  -- master visual prompt (S2), fidelity rules (S3),
                                        screen briefs (S4), variant briefs (S5)
  design/tokens.json                 -- v0.3.0 palette / layout / semanticStates
  design/screens.json                -- v0.3.0 screen ids, platform, mode, requiredStates

Writes one .txt prompt per (screen, variant) into design/mockups/prompts/.
"""
import json, pathlib, textwrap

ROOT = pathlib.Path(__file__).resolve().parents[2]
tokens = json.loads((ROOT / "design/tokens.json").read_text())
screens = json.loads((ROOT / "design/screens.json").read_text())
OUT = ROOT / "design/mockups/prompts"
OUT.mkdir(parents=True, exist_ok=True)

MASTER = (
 "Design a high-fidelity production interface for Aural Geometry Lab, a mathematical music "
 "studio that lets users hear, see, manipulate, and explain mathematical structures as music. "
 "The product should feel like a serious creative instrument crossed with a scientific "
 "visualization environment: precise, calm, luminous, tactile, and deeply interactive - not a "
 "generic analytics dashboard, not a game, and not a sci-fi HUD. Use the supplied design tokens "
 "and layout specification. The default studio is dark neutral with restrained high-contrast "
 "semantic accents. Mathematical geometry and musical time should dominate the canvas. Controls "
 "should be compact, professional, and legible. Use progressive disclosure: a novice can play "
 "immediately while an expert can open the timeline, typed operator graph, and mathematical "
 "inspector. Make selected entities visibly linked across canvas, graph, timeline, and inspector. "
 "Generated material, frozen clips, provenance, research-gated content, and evaluation states "
 "must each have distinct visual treatments that do not rely on color alone. Avoid decorative "
 "equations, fake waveforms, meaningless neon grids, excessive glassmorphism, giant cards, "
 "marketing-page spacing, and arbitrary gradients. The interface must look implementable in "
 "React and adaptable to SwiftUI on iPad."
)

FIDELITY = [
 "use real labels from the screen manifest, never lorem ipsum",
 "show coherent musical and mathematical values (real tempi, real step/pulse counts, real note names)",
 "preserve the same transport and primary navigation locations within a platform class",
 "show a believable selection state linked across at least two surfaces",
 "show enough content to judge information density",
 "avoid impossible graph connections; keep operator port shapes and types consistent",
 "distinguish generated / frozen / manual material by shape and texture, not by hue alone",
 "do not fabricate an exact Penrose tiling; illustrative rhomb motifs must be labelled as such",
 "render all text crisply and spell every label exactly as given",
]

VARIANTS = {
 "A-instrument": (
   "VARIANT A - INSTRUMENT. Optimize for professional creative-tool density and speed. "
   "Compact controls, minimal decoration, high information density, tight 4/8/12px rhythm, "
   "small 11-13px labels, many simultaneously visible parameters. Think Ableton/Bitwig/Logic "
   "seriousness rather than consumer polish."
 ),
 "B-laboratory": (
   "VARIANT B - LABORATORY. Optimize for mathematical explanation and visualization while "
   "preserving composition capability. The inspector, the mapping pipeline, formulas, "
   "provenance chips and annotation layers are somewhat more prominent; the canvas carries "
   "labelled axes, units, and legends. Think Mathematica/Observable crossed with a DAW."
 ),
 "C-spatial": (
   "VARIANT C - SPATIAL / TACTILE. Optimize for direct manipulation, larger geometric controls, "
   "and iPad transferability. Reduce chrome and let the canvas dominate; controls are larger "
   "(44pt-class), fewer, and positioned for reach. Panels become contextual overlays rather "
   "than permanent columns."
 ),
}

BRIEFS = {
 "S01": "Project Library. Show the product name, a list of recent projects, a new-blank-project "
        "affordance, the seven guided labs, and small previews carrying lab type, modified date, "
        "tempo, and a deterministic-seed indicator. Show a local-first storage status line. "
        "Inviting, but still an instrument - not a content streaming app.",
 "S02": "Infinite Staircase Explore. The primary canvas shows logarithmic tempo bands circulating "
        "through a wrapped tempo space; a simple beat pattern appears as layered pulse lanes. "
        "Controls expose direction, cycle duration, layer count, ratio, and comparison toggles. A "
        "guide strip asks 'Can a rhythm keep accelerating without becoming infinitely fast?'. The "
        "inspector is collapsed by default.",
 "S03": "Infinite Staircase Inspect. The same project with the mathematical inspector open. Show "
        "the mapping pipeline source - sample - normalize - smooth - transform - quantize - "
        "constrain - target as an explicit chain. One layer/event is selected and shows its "
        "formula, current phase, gain, provenance, and an A/B control that reveals what the "
        "amplitude envelope is hiding at the reset point.",
 "S04": "Euclidean Rings Compose. Large concentric rhythm rings for 3-5 tracks with a compact "
        "timeline beneath, instrument labels, steps/pulses/rotation numeric controls per ring, an "
        "LCM composite-cycle indicator, a visible direct-drag affordance on a ring, and the "
        "selected ring visibly linked to its operator-graph node.",
 "S05": "Full Studio Compose. The canonical 'what the product is' screen: a generic project "
        "combining a Euclidean trigger source into a transformation into a synth, plus a Tonnetz "
        "chord track. Show the timeline, the mixer, the inspector, and a collapsed operator-graph "
        "drawer, all around one canvas. One transport, one undo stack, one project.",
 "S06": "Operator Graph Focus. The typed operator graph fills the centre. Nodes use typed port "
        "shapes and semantic categories; show one invalid-connection preview being refused by the "
        "compiler, one highlighted provenance path, a minimap, a search/add-node palette, and the "
        "selected node's inspector. Show the keyboard/non-drag route to making a connection.",
 "S07": "Timeline Focus. Show generated regions, frozen snapshot clips, a manual clip, an "
        "automation lane, a rational-grid tuplet marker, a selected event's provenance chip, and "
        "the generated-edit choice dialog (add downstream transform / fork the generator / freeze "
        "a snapshot) plus one orphaned event whose source is missing.",
 "S08": "Tonnetz Walk. The harmonic lattice with a drawn progression path across triad vertices, "
        "the selected chord highlighted, common-tone highlights on shared vertices, a "
        "voice-leading panel, the resulting timeline output, and P/L/R transformation labels on "
        "the path segments.",
 "S09": "Fractal Motif. A split canvas between a nested musical timeline and the recursion tree. "
        "A selected note exposes its ancestry from generation 0 through the current leaf. An "
        "event-budget predictor shows the projected event count before the depth is increased, "
        "with the budget control near it.",
 "S10": "Cellular Automaton Orchestra. The automaton grid with a generation cursor sweeping it, a "
        "mapping overlay tying columns to pitches, a selected cell showing its neighbourhood and "
        "the rule that produced it, a density plot over generations, and the musical output strip "
        "beneath.",
 "S11": "Chaos Attractor. A Lorenz trajectory in 2D projection plus a small 3D view, a current "
        "sample marker on the trajectory, a nearby-trajectory divergence comparison, axis-mapping "
        "chips (x to pitch, y to velocity, z to filter), the normalization and smoothing pipeline, "
        "and a numeric-stability warning state.",
 "S12": "Penrose Construction Accepted / Artifact Gate. A high-quality blocked-state screen "
        "explaining that exact tiling validation is pending: the exact pentagrid construction is "
        "chosen, the certificate status is shown, the missing fixture and oracle artifacts are "
        "enumerated, and a non-authoritative preview is permitted but explicitly labelled "
        "'illustrative geometry - not a validated Penrose tiling'. It must not claim the diagram "
        "is a valid Penrose tiling.",
 "S13": "Export. An export panel offering Project Package, MIDI, WAV, MusicXML, and visual "
        "snapshot. Each format shows its capability and its approximation warnings BEFORE export "
        "(for example: MusicXML cannot express this tuplet exactly), plus a deterministic metadata "
        "manifest preview with seed, versions, and hash.",
 "S14": "iPad Landscape Studio. A native-feeling adaptation, not shrunken desktop chrome: a "
        "project/lab sidebar, a large dominant canvas, a contextual inspector zone, a bottom "
        "timeline drawer, a persistent transport, and Pencil-aware direct manipulation with "
        "44pt-class targets.",
 "S15": "iPad Portrait Explore. Canvas-first. The sidebar is hidden, the inspector is a sheet, the "
        "transport and timeline live in a bottom drawer, touch targets are large while "
        "professional density is preserved.",
 "S16": "iPhone Companion. Project playback plus one lab canvas, parameter cards, a compact "
        "inspector, and no operator graph at all. Bottom transport, and a sheet for parameter "
        "editing. A companion, not a miniature DAW.",
}

CANVAS = {
 "web+native": "16:9 desktop application window, approximately 1600x900 logical pixels",
 "web+ipad": "16:9 desktop application window, approximately 1600x900 logical pixels",
 "ipad-native": "iPad landscape device screen, 4:3, no browser chrome",
 "iphone-native": "iPhone portrait device screen, 19.5:9, no browser chrome",
}
CANVAS_OVERRIDE = {"S15": "iPad portrait device screen, 3:4, no browser chrome"}

# --- Shell convergence (docs/15 S1 step 2) -----------------------------------
# Locked after the S05 exploration wave (S05-*-A/B/C, rendered pre-lock). The lock exists so
# later lab mockups cannot silently redesign the application shell; it is a synthesis of the
# strongest decisions from all three S05 interpretations, not a copy of one of them.
SHELL_LOCK_DESKTOP = """

LOCKED APPLICATION SHELL - this chrome is already converged. Reproduce it in the same places at
the same proportions in every desktop screen; only the centre canvas and the inspector contents
change between screens. Do not redesign it.
  - TOP TOOLBAR, 48px, full width: product mark and wordmark 'Aural Geometry Lab' at far left;
    then the project name with its saved/unsaved state; a centred transport cluster
    (skip-back, play/pause, stop); a monospace readout group of tempo BPM, meter, and
    bars.beats.ticks position; then a Derivation status chip and an Audio runtime status chip
    side by side; undo and redo; the Explore/Compose/Inspect workspace switcher; export/share;
    and an overflow/settings group at far right.
  - LEFT NAVIGATOR, 232px: workspace and lab navigation at the top, the project's track list
    below it, and a MATERIAL LEGEND keyed by line style and texture - solid = user-authored,
    dotted = live generated, diagonal hatch = frozen snapshot, and a distinct mark for edited
    derivative - never by hue alone.
  - RIGHT INSPECTOR, 336px: the selected entity's name and a selection chip at the top; tabs
    for Parameters / Math / Provenance; a compact mapping-pipeline summary; an evaluation block
    showing cache key, last evaluated time, and a determinism check; and evidence-class rows
    (established, engineering-default, research-gated) each with its own icon, the research-gated
    one carrying a lock.
  - BOTTOM TIMELINE, 240px: a bars.beats ruler, one lane per track, clips textured by material
    kind per the legend above, and a playhead carrying its position readout.
  - OPERATOR GRAPH DRAWER, 28px collapsed, sitting between the canvas and the timeline with a
    visible expand affordance and a node count.
"""
SHELL_LOCK_LIBRARY = """

LOCKED SHELL - LIBRARY STATE. This screen is the pre-project state: NO project is open. The
converged chrome is present but must be shown in its EMPTY state, and it is a correctness error
to populate it with project content here.
  - TOP TOOLBAR, 48px: product mark and wordmark at far left; then the library context (not a
    project name); the transport cluster present but DISABLED/greyed with no tempo, no meter and
    no position readout, because nothing is loaded; a Derivation chip reading idle and an Audio
    chip reading disabled or ready; undo and redo disabled; the workspace switcher with Library
    active; import/new; and an overflow/settings group at far right.
  - LEFT NAVIGATOR, 232px: workspaces, then the seven guided labs. There is NO track list and NO
    material legend on this screen - both belong to an open project.
  - NO BOTTOM TIMELINE and NO OPERATOR GRAPH DRAWER. A timeline whose lanes are named after other
    projects is a semantic error: projects are not tracks of one arrangement.
  - RIGHT PANEL, 336px: a read-only PREVIEW of the highlighted project - its lab type, tempo,
    modified date, deterministic seed, and material summary. It is a library preview, not the
    live inspector, and it must not offer parameter editing.
  - The centre is the library itself: recent projects with small deterministic previews, a new
    blank project affordance, the seven guided labs, and a local-first storage status line.
"""

SHELL_LOCK_NATIVE = """

LOCKED SHELL ADAPTATION - the desktop shell above is NOT to be shrunk onto this device. The
adaptation rule is fixed: ONE dominant canvas surface; the transport persists; the navigator and
inspector become contextual zones, sheets, or drawers rather than permanent columns; the same
material legend (solid / dotted / hatched) and the same derivation, audio, and evidence status
vocabulary survive the adaptation; touch targets are 44pt-class. Panel identity and status
vocabulary carry over; panel geometry does not.
"""

theme = tokens["themes"]["dark-instrument"]["color"]
layout = tokens["layout"]
sem = tokens["semanticStates"]

palette = "\n".join(f"  {k} = {v}" for k, v in theme.items())
layout_txt = "\n".join(f"  {k} = {v}px" for k, v in layout.items())

SEMANTIC = (
 "SEMANTIC STATE VOCABULARY (design tokens v0.3.0 - these are the states the mockup must be able "
 "to show, each with a distinct non-color-only treatment):\n"
 + "\n".join(f"  {axis}: {', '.join(vals)}" for axis, vals in sem.items())
)

for s in screens["screens"]:
    sid = s["id"]
    canvas = CANVAS_OVERRIDE.get(sid, CANVAS[s["platform"]])
    req = s.get("requiredStates", [])
    req_txt = ("\nREQUIRED STATES for this screen (design/screens.json v0.3.0) - each must be "
               "visibly present and identifiable:\n" + "\n".join(f"  - {r}" for r in req)) if req else ""
    for vkey, vtxt in VARIANTS.items():
        lock = "" if sid == "S05" else SHELL_LOCK_LIBRARY if sid == "S01" else (
            SHELL_LOCK_NATIVE if s["platform"] in ("ipad-native", "iphone-native")
            else SHELL_LOCK_DESKTOP)
        body = f"""{MASTER}{lock}

SCREEN {sid} - {s['name']} ({s['mode']} workspace, {s['platform']}).
{BRIEFS[sid]}
{req_txt}

{vtxt}

CANVAS: {canvas}. Render the full interface edge to edge, straight-on, no perspective, no device
mockup shadows, no marketing background, no annotations outside the interface itself.

DESIGN TOKENS - dark-instrument theme, use these exact hues:
{palette}

LAYOUT TOKENS - respect these panel sizes:
{layout_txt}

TYPOGRAPHY: system-ui sans for UI at 11px micro / 13px compact / 14px body / 16px section /
22px lab title; monospace for all numeric and mathematical values. Radii 4/6/8/12px. Spacing
rhythm 4/8/12/16/24/32px.

{SEMANTIC}

FIDELITY RULES - every one of these is mandatory:
""" + "\n".join(f"  - {r}" for r in FIDELITY) + """

Produce one single image: the complete interface as it would appear on screen.
"""
        (OUT / f"{sid}-{s['slug']}--{vkey}.txt").write_text(body)

print(f"wrote {len(list(OUT.glob('*.txt')))} prompts to {OUT}")
