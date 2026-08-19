# Aural Geometry Lab — Final UI/UX Design Specification

**Status:** implementation-authoritative design target for MVP  
**Version:** 1.1  
**As of:** 2026-08-18  
**Platforms:** responsive web first; iPad native stretch; iPhone companion stretch

> **Wave-1 authority note:** This specification is implementation-authoritative together with [`19-ui-ux-wave1-integrated-amendment.md`](19-ui-ux-wave1-integrated-amendment.md). The amendment supersedes older language that treats workspaces as capability modes, flattens material/stale state, or assumes A/B is an MVP primitive.

---

## 1. Product experience thesis

Aural Geometry Lab should feel like **an instrument for mathematical structure**.

The interface is not primarily a DAW with mathematical plugins, nor a museum of educational demonstrations. It is a continuous environment in which the same object can be:

- heard as music;
- seen as geometry or structure;
- manipulated directly;
- inspected mathematically;
- arranged compositionally;
- traced through provenance;
- frozen into editable musical material.

The core interaction promise is:

> **Touch a structure, hear the consequence; hear an event, reveal the structure that caused it.**

Every design decision should reinforce that bidirectionality.

### 1.1 Experience order

For a new concept, the user should encounter depth in this order:

1. **Phenomenon** — something compelling is already visible and playable.
2. **Direct control** — one meaningful variable can be changed immediately.
3. **Comparison** — bypass, A/B, anchor, or alternate mapping exposes causality.
4. **Explanation** — the inspector shows the rule and current values.
5. **Composition** — the user opens timeline/graph and combines the system with others.
6. **Provenance** — any generated event can be traced back through the chain.

The UI must not begin with an empty graph unless the user explicitly chooses a blank advanced project.

### 1.2 Design character

The product should read as:

- **instrument-grade** rather than dashboard-like;
- **scientific** without becoming sterile;
- **luminous** without becoming neon sci-fi;
- **dense when needed** without being cramped;
- **calm** while audio and mathematics remain dynamic;
- **precise** while still inviting exploration;
- **tactile** through direct manipulation and immediate audiovisual response.

Avoid:

- marketing-site card layouts inside the studio;
- faux holographic HUD styling;
- decorative formulas that do not reflect current state;
- meaningless oscilloscopes/waveforms;
- gradients used only for visual drama;
- giant empty gutters;
- icons without labels/tooltips;
- skeuomorphic mixing consoles;
- forcing every concept into a node graph.

---

## 2. Information architecture

### 2.1 Top-level structure

```text
Aural Geometry Lab
├── Library
│   ├── Recent projects
│   ├── New project
│   ├── Import project
│   └── Guided laboratories
├── Studio
│   ├── Explore
│   ├── Compose
│   └── Inspect
├── Export / Share
├── Settings
└── Help / Concepts
```

Labs are templates and guided views over the same project runtime. Opening a lab does not move the user into a separate miniature application.

### 2.2 Studio surfaces

The studio consists of six coordinated surfaces:

1. **Transport / global toolbar**
2. **Navigator / project context**
3. **Primary mathematical canvas**
4. **Inspector / provenance**
5. **Timeline / tracks / compact mixer**
6. **Typed operator graph**

Only the first three need to be visible simultaneously in Explore mode. Compose and Inspect progressively expose the others.

### 2.3 Mode model

#### Explore

Purpose: understand and play with one system.

Visible by default:

- transport;
- lab title/question;
- primary canvas;
- 2–5 primary controls;
- guide step;
- compact status.

Collapsed by default:

- timeline;
- graph;
- detailed inspector;
- diagnostics.

#### Compose

Purpose: make a piece using one or more mathematical systems.

Visible by default:

- transport;
- tracks/timeline;
- main canvas;
- compact inspector or track controls;
- graph drawer handle.

#### Inspect

Purpose: explain exactly why current output exists.

Visible by default:

- primary canvas or selected surface;
- inspector;
- provenance path;
- A/B controls;
- current mathematical values;
- timeline selection context.

Modes are reversible views. They do not fork project state.

---

## 3. Global desktop layout

### 3.1 Canonical wide layout: 1600×1000 and above

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ App/Project   Undo Redo   Play Stop Loop   Tempo Meter   Mode   CPU   Stop  │ 48
├──────────────┬───────────────────────────────────────────┬───────────────────┤
│ Navigator    │                                           │ Inspector         │
│ 220–260      │           Primary Canvas                  │ 300–380           │
│              │                                           │                   │
│              │                                           │                   │
│              │                                           │                   │
├──────────────┴───────────────────────────────────────────┴───────────────────┤
│ Timeline / tracks / mixer                                           220–320 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Operator graph drawer: collapsed 28 / expanded 260–440                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

All structural panels are resizable within safe bounds. Width/height choices are view preferences and cannot change output semantics.

### 3.2 Standard laptop: 1280–1599

- navigator defaults to icon + label compact width ~188–220;
- inspector defaults ~300;
- timeline defaults ~220;
- graph remains collapsed until requested;
- a single **Focus Surface** action can temporarily maximize canvas, timeline, graph, or inspector.

### 3.3 Intermediate width: 900–1279

- navigator becomes collapsible overlay/sidebar;
- inspector may overlay rather than permanently consume width;
- canvas remains primary;
- timeline retains a minimum usable height;
- graph becomes a focus drawer/full-surface mode.

### 3.4 Compact web/mobile widths

MVP web supports:

- project playback;
- guided labs;
- primary parameter editing;
- read-only or simplified inspection.

Do not force full graph editing into a phone-sized browser.

---

## 4. Global toolbar and transport

### 4.1 Layout

Left to right:

1. app/project switcher;
2. project title + saved/dirty indicator;
3. undo / redo;
4. primary transport;
5. loop / count-in / metronome;
6. tempo + meter;
7. mode switcher: Explore / Compose / Inspect;
8. optional MIDI/device indicator;
9. evaluation/audio health meter;
10. global emergency stop.

### 4.2 Primary transport behavior

Controls:

- Play/Pause
- Stop
- Return to start
- Loop
- Optional record/gesture capture when implemented

Rules:

- Play is never automatic on project open.
- First audio interaction can include a concise browser audio activation hint.
- Stop preserves playhead; Stop twice or dedicated return command returns to start.
- Emergency Stop tears down active voices and visually confirms completion.

### 4.3 Tempo display

Default compact presentation:

```text
120.0 BPM   4/4
```

Click/tap opens:

- exact BPM entry;
- tap tempo;
- tempo-map indicator when nonconstant;
- meter changes;
- optional swing/groove when applicable.

Tempo is a project value; lab-local tempo transformations are shown separately in the inspector.

### 4.4 Health indicator

A compact meter shows three independent states:

- audio scheduling health;
- graph evaluation load;
- generative budget pressure.

Normal state should be quiet. Warning opens a diagnostics popover with plain-language recovery.

---

## 5. Navigator

### 5.1 Sections

```text
PROJECT
  Tracks
  Assets
  Presets

LAB
  Guide
  Parameters
  Experiments

SURFACES
  Canvas
  Timeline
  Graph
  Inspector

TOOLS
  Export
  Diagnostics
```

The navigator is contextual. A simple lab in Explore mode can hide project complexity behind a single “Open Studio” action.

### 5.2 Track representation

Track row:

- type glyph + label;
- name;
- mute/solo compact controls;
- generation/frozen status mark;
- optional activity meter;
- selected state.

Avoid tiny conventional DAW controls when not necessary. The compact mixer belongs primarily in the timeline track header.

---

## 6. Primary mathematical canvas

The canvas is the conceptual center of AGL.

### 6.1 Universal canvas chrome

Top-left overlay:

- lab/concept title;
- one-line purpose/question;
- optional verification/research status.

Top-right overlay:

- reset view;
- zoom controls;
- 2D/3D switch if both are meaningful;
- snapshot/export visual;
- reduced-motion toggle shortcut;
- full-screen/focus.

Bottom overlay:

- current time/phase when relevant;
- selected-object summary;
- optional mini legend.

### 6.2 Manipulation principles

Every directly manipulable object must show:

- affordance before drag;
- hover/focus state;
- current value while changing;
- snap/constraint behavior;
- undoability;
- exact numeric entry path.

A direct gesture writes to a canonical parameter or authored input. It cannot secretly introduce state that exists only inside the renderer.

### 6.3 Precision modes

Pointer:

- normal drag;
- Shift = fine adjustment where platform convention permits;
- Option/Alt may temporarily disable snapping where safe;
- double-click opens numeric entry or reset depending component.

Touch/Pencil:

- direct manipulation uses larger invisible hit targets than rendered marks;
- long press opens contextual value/actions;
- Pencil may expose a precision handle while finger remains coarse.

### 6.4 Canvas selection

Selecting a mathematical entity must highlight all semantic projections:

- timeline event(s);
- graph source or transform node;
- inspector stage;
- provenance path.

Related projections use a secondary “linked” style, not selected style.

---

## 7. Mathematical inspector

The inspector is a structured causal explanation, not a property dump.

### 7.1 Six-stage causal pipeline

Always use the same mental model:

1. **Source**
2. **Sampling**
3. **Normalization**
4. **Mapping**
5. **Musical shaping**
6. **Constraints / Output**

Each section supports three density levels:

- **Summary** — plain-language sentence and current value.
- **Details** — controls, formula, units, ranges.
- **Trace** — exact provenance and technical identifiers.

### 7.2 Inspector header

Show:

- selected entity type/name;
- deterministic ID only in technical detail mode;
- source node/version;
- status: live generated / frozen / manual;
- “Locate in…” menu: Canvas, Timeline, Graph.

### 7.3 Formula presentation

A formula panel contains:

- typeset expression;
- variable definitions;
- live substitution using current values;
- result;
- explanation sentence;
- optional step arrows.

Do not show formulas unrelated to current state merely for decoration.

### 7.4 A/B comparison

Inspector-level A/B control:

```text
A  Current    [hold/toggle]    B  Bypass Mapping
```

Possible comparison targets:

- bypass a stage;
- alternate mapping;
- anchor on/off;
- quantization on/off;
- smoothing on/off;
- one operator parameter alternate.

B is temporary until explicitly applied.

### 7.5 Provenance trace

Compact sentence first:

> Generation 3 → transposed +7 → quantized to D Dorian → octave-shifted to cello range.

Expanded trace shows a vertical causal chain with:

- step index;
- operator label/version;
- input/output summary;
- exact parameter changes;
- constraint accept/reject decisions;
- links to source entities.

---

## 8. Timeline, tracks, and mixer

### 8.1 Timeline anatomy

```text
┌───────────────┬───────────────────────────────────────────────────────────┐
│ Track header  │ Ruler / bars / beats / loop region                      │
├───────────────┼───────────────────────────────────────────────────────────┤
│ Euclidean     │ [ live generated clip................................. ] │
│ Tonnetz       │      [ frozen chord clip ]                              │
│ Manual        │ [ editable notes ]                                      │
└───────────────┴───────────────────────────────────────────────────────────┘
```

Track header target width: ~180–220 desktop.

### 8.2 Material visual states

#### Live generated

Visual language:

- patterned/animated boundary or generator-link badge;
- source operator glyph;
- not individually draggable as ordinary notes unless edit policy invoked;
- update indicator when graph reevaluates.

#### Frozen

Visual language:

- solid clip boundary;
- lineage badge/link;
- normal editing affordances;
- “Regenerate from source…” action does not overwrite without confirmation.

#### Manual

Visual language:

- standard editable clip/event;
- no generator lineage unless created from a frozen source.

Do not rely on color alone; use border/pattern/glyph differences.

### 8.3 Event shapes

- Trigger: compact diamond/vertical hit mark.
- Note: piano-roll bar or rounded note bar.
- Control: line/curve points.
- Geometry-derived marker: normal event shape plus small source-geometry badge.

### 8.4 Rational/irregular timing

Timeline grid supports:

- ordinary subdivisions;
- tuplets;
- exact rational position readout;
- adaptive labels that avoid visual clutter.

If an event cannot be represented cleanly at current zoom, its exact position remains available in inspector/numeric entry.

### 8.5 Compact mixer

Track header includes:

- mute;
- solo;
- gain;
- pan;
- instrument summary.

Expanded mixer is optional post-MVP unless required by composition workflows.

---

## 9. Typed operator graph

### 9.1 Purpose

The graph explains and composes systems. It should be discoverable but not forced on beginners.

### 9.2 Node anatomy

```text
┌──────────────────────────────┐
│ [icon] Euclidean Rhythm   v1 │
│ 8 steps · 3 pulses · rot 1   │
├──────────────────────────────┤
│ ○ clock / grid               │
│                              │
│                      ◇ trig  │
├──────────────────────────────┤
│ budget  3 events/cycle       │
└──────────────────────────────┘
```

Node regions:

- header: name, version, category, bypass;
- concise parameter summary;
- typed ports;
- optional inline primary controls;
- budget/status footer;
- diagnostic badge.

### 9.3 Port type visual grammar

Port types use **shape + label + optional semantic accent**, never color alone.

Recommended:

- Trigger Pattern — diamond
- Note Pattern — pill/capsule
- Control Signal — circle
- Geometry — hexagon
- Graph/Path — square with notch
- Numeric Sequence — triangle
- Constraint Set — shield-like pentagon
- Audio Signal — waveform bracket

Edges inherit source port type treatment.

### 9.4 Connection behavior

Dragging a connection:

- compatible targets become clearly available;
- incompatible targets remain visible but reject with explanation;
- near a convertible target, offer explicit adapter suggestions;
- cycles are detected before commit;
- connection preview never mutates graph until drop/confirm.

### 9.5 Add-node workflow

Open via:

- `A` or Space on empty graph;
- plus button;
- drag from port into empty space.

Search supports:

- operator name;
- category;
- accepted input/output type;
- concepts such as “rhythm,” “geometry,” “random,” “quantize.”

Results show one-sentence purpose and input/output types.

### 9.6 Graph accessibility

Required:

- nodes keyboard focusable;
- directional navigation among nearby nodes;
- ports accessible through an explicit connection mode;
- nonvisual node list/tree alternative;
- connection descriptions announced;
- canvas panning cannot trap keyboard focus.

React Flow is a candidate implementation because its current API provides keyboard/focus/accessibility primitives, but the AGL semantic list remains required even if the graph library exposes ARIA behavior.

---

## 10. Design system

### 10.1 Theme posture

Default theme: **Dark Instrument**.

Secondary theme: **Light Analysis** may be added for daylight/education/printing, but MVP does not require perfect visual parity if it compromises schedule. Contrast requirements apply to both.

### 10.2 Color roles

Use semantic roles rather than lab-specific arbitrary palettes:

- `bg.canvas` — deepest work surface;
- `bg.panel` — structural panel;
- `bg.raised` — menu/popover/selected control surface;
- `text.primary`;
- `text.secondary`;
- `text.muted`;
- `border.default`;
- `accent.selection`;
- `accent.music`;
- `accent.math`;
- `accent.mapping`;
- `status.success`;
- `status.warning`;
- `status.error`;
- `status.research`;
- `provenance.related`.

Lab visualizations may use additional categorical series, but those colors cannot carry sole meaning.

### 10.3 Typography

Recommended families:

- UI: system sans / Inter-like neutral grotesk;
- numeric/technical: system monospace / JetBrains Mono-like;
- equations: MathJax/KaTeX-compatible math face where web rendering requires it.

Scale:

- 11–12: micro labels/status;
- 13: compact controls;
- 14: default UI text;
- 16: section/subpanel title;
- 20–24: lab title;
- 28–36: guided experiment headline only.

The studio should not use oversized display typography.

### 10.4 Spacing

Base unit: 4 px.

Common:

- 4 — icon/internal micro gap;
- 8 — control gap;
- 12 — standard compact padding;
- 16 — section padding;
- 24 — major separation;
- 32+ — only for onboarding/library compositions.

### 10.5 Radii

- 4 — tiny badges;
- 6 — compact fields/buttons;
- 8 — panels/nodes;
- 12 — larger modal cards;
- full pill only for chips/toggles where semantics fit.

Avoid excessively rounded everything.

### 10.6 Borders and depth

Use border contrast and subtle layering more than large shadows.

- canvas/panel separation: 1 px border;
- selected entity: 2 px semantic outline + shape-specific marker;
- menus/popovers: modest shadow;
- dragged object: stronger elevation/outline;
- no ubiquitous glass blur in the web studio.

### 10.7 Icons

- simple line icons;
- paired with labels when nonstandard;
- consistent transport conventions;
- mathematical operator icons may be custom but must remain recognizable at 16 px;
- icon-only buttons require tooltip and accessible name.

---

## 11. Control components

### 11.1 Numeric field

Features:

- direct type entry;
- scrub/drag label for continuous parameters;
- units;
- min/max where bounded;
- reset to default;
- keyboard arrows for increments;
- Shift/fine increment;
- validation on commit with non-destructive error.

### 11.2 Parameter slider

Use only when relative position is meaningful. Always pair with numeric value.

For logarithmic controls, visually indicate nonlinearity or label key values.

### 11.3 Segmented control

Good for 2–4 mutually exclusive modes such as:

- Explore / Compose / Inspect;
- 2D / 3D;
- accelerate / decelerate;
- replacement / overlay.

### 11.4 Toggle

Use for independent binary state. Avoid toggles for actions.

### 11.5 Chips

Use for compact categorical states:

- `LIVE`
- `FROZEN`
- `MIDI`
- `v1`
- `RESEARCH GATE`

### 11.6 Budget meter

Shows:

- current predicted load;
- limit;
- threshold band;
- why the budget exists;
- actionable correction.

Never show CPU-like urgency for a harmless low value.

---

## 12. Screen specifications

### 12.1 S01 Project Library

#### Objective

Get the user into a meaningful sound quickly while preserving project ownership.

#### Structure

Top:

- product name;
- New Project;
- Import;
- settings/help.

Main:

- **Continue** recent projects;
- **Explore a Lab** horizontal or compact grid;
- **Start Blank** advanced option.

Project card content:

- project name;
- last modified;
- current lab or “Studio”;
- duration/tempo where meaningful;
- small deterministic seed icon/status;
- thumbnail generated from project canvas;
- context menu.

Lab card content:

- concept name;
- short question/promise;
- difficulty/depth indicator only if validated;
- “Open experiment.”

### 12.2 S02 Infinite Staircase — Explore

Canvas is ~70% of visible area.

Visualization:

- vertical axis = logarithmic tempo bands;
- each layer represented as a moving pulse lane/ring segment;
- top and bottom visually wrap/identify equivalent tempo-octave boundary;
- loudness envelope visible as opacity/width plus optional small graph;
- dominant perceptual band highlighted without claiming objective perception.

Primary controls:

- Play;
- Direction;
- Cycle duration;
- Layers;
- Tempo ratio;
- `Reveal reset` comparison.

Guide:

> Can the pulse seem to accelerate forever?

### 12.3 S03 Infinite Staircase — Inspect

Select one layer.

Inspector shows:

- layer index;
- base BPM;
- phase;
- current tempo;
- gain;
- equation substitution;
- next-cycle relabel target;
- crossfade role;
- current source pattern.

A/B buttons:

- Full illusion;
- No crossfade;
- Anchor pulse;
- No subdivision shedding.

Timeline may show source pulse pattern and rendered layer projections.

### 12.4 S04 Euclidean Rings — Compose

Canvas:

- 1–8 concentric rings;
- active onsets as shape marks;
- current playhead radial line;
- ring rotation handle;
- step numbers optional at high zoom;
- selected ring thickens outline and reveals handles;
- center summary: composite cycle / tempo.

Ring control strip:

- instrument/name;
- steps;
- pulses;
- rotation;
- probability/accent secondary;
- mute/solo.

A side/bottom strip displays:

- cyclic gaps;
- LCM/composite alignment;
- next full alignment time.

### 12.5 S05 Full Studio Compose

Purpose: canonical overview of the product.

Project includes:

- Euclidean drum track;
- Tonnetz chord track;
- one transformed melodic line;
- selected event.

Visible:

- main canvas showing currently selected system;
- timeline with three material types;
- inspector compact;
- graph drawer partially open enough to establish relationship.

### 12.6 S06 Graph Focus

Graph fills center and timeline collapses to ~80 px context strip.

Selected node inspector shows:

- operator docs;
- parameters;
- current evaluation hash/revision in advanced section;
- event count/budget;
- bypass A/B;
- open associated canvas.

### 12.7 S07 Timeline Focus

Canvas collapses to compact preview.

Timeline supports:

- track resizing;
- clip selection;
- event selection;
- loop selection;
- freeze command;
- downstream-edit operator command;
- automation lanes;
- zoom-to-selection.

When editing a live generated event, show a small decision sheet:

```text
This event is generated by Fractal Motif.

[ Freeze this region and edit ]
[ Keep generation live; add an edit operator ]
[ Cancel ]
```

### 12.8 S08 Tonnetz Walk

Canvas:

- periodic lattice with clear pitch labels;
- chord triangles/polygons when selected;
- path line with ordered points;
- common tones persist visually between adjacent chords;
- moved voices are shown as short vectors/arcs in a companion panel.

Direct manipulation:

- click/tap chord to append path;
- drag path point to substitute chord;
- Pencil draw can trace a path in native stretch.

### 12.9 S09 Fractal Motif

Canvas can toggle:

- **Nested Timeline**;
- **Recursion Tree**;
- **Split**.

Recursion tree:

- root motif at top/center;
- child transformations labeled compactly;
- selected leaf path emphasized;
- event-count forecast shown before depth changes.

Depth control must preview predicted event count before commit.

### 12.10 S10 Cellular Automaton Orchestra

Canvas:

- automaton grid;
- generation axis;
- playback cursor;
- selected cell + neighborhood;
- rule truth table mini panel;
- mapping overlay toggle.

Musical mapping panel distinguishes:

- automaton state;
- extracted feature;
- musical mapping.

This separation is central to educational honesty.

### 12.11 S11 Chaos Attractor

Default 2D projection for clarity; optional 3D.

Canvas:

- trajectory;
- current sample;
- sampled points used for music;
- second near-initial-condition trajectory when comparison enabled;
- axis labels and normalization window.

Mapping chips:

```text
x → scale degree
z → filter cutoff
y → pan
speed → event density
```

Unsafe/stiff numerical state uses a clear diagnostic overlay rather than allowing explosive output.

### 12.12 S12 Penrose Research Gate

Before DR-09 acceptance:

- title + explanation of gate;
- research status;
- what is validated already;
- what remains unresolved;
- “View implementation charter” link;
- optional illustrative geometry clearly labeled non-Penrose.

After acceptance, this screen is replaced by the actual sequencer canvas.

### 12.13 S13 Export

Format list:

- AGL Project Package;
- MIDI;
- WAV;
- MusicXML;
- Image/Snapshot.

Each format shows:

- supported data;
- approximations;
- deterministic metadata;
- warnings;
- size/duration estimate when available.

Export cannot silently quantize or discard unsupported structures.

---

## 13. Lab guide design

### 13.1 Guide anatomy

Each guided experiment uses:

1. **Question**
2. **Prediction**
3. **Setup**
4. **Manipulation**
5. **Observation**
6. **Explanation**
7. **Open the system**

The guide is a contextual side/bottom panel, not a modal wizard that hides the lab.

### 13.2 Step behavior

- one major concept per step;
- current control highlighted in the live UI;
- user may freely manipulate beyond the instruction;
- guide can reset to exact preset;
- step completion is optional unless a controlled study mode requires it;
- claims distinguish “you may hear/observe” from established evidence.

### 13.3 Learning depth

Three explanation layers:

- **Intuition** — no equation required;
- **Math** — equation/algorithm;
- **Implementation** — operator/version/technical details.

---

## 14. Interaction semantics

### 14.1 Pointer

- single click selects;
- double click opens/focuses entity or numeric edit where conventional;
- right click/context key opens contextual actions;
- drag manipulates only after threshold;
- canvas pan uses middle mouse/space-drag or configured gesture;
- scroll zoom is contextual and must not unexpectedly hijack page scrolling outside focused canvas.

### 14.2 Touch

- tap selects;
- second tap or explicit control opens details;
- two-finger pan/zoom for canvas where conventional;
- long press opens context/actions;
- selection handles are enlarged;
- accidental transport activation requires normal button semantics, not edge gestures.

### 14.3 Keyboard

Recommended global shortcuts:

| Action | Shortcut |
|---|---|
| Play/Pause | Space when not editing text/graph pan mode |
| Stop | Shift+Space or configurable |
| Undo | Cmd/Ctrl+Z |
| Redo | Cmd/Ctrl+Shift+Z |
| Save/export snapshot | Cmd/Ctrl+S maps to explicit local save/package semantics as platform permits |
| Search/Add operator | A or Cmd/Ctrl+K in graph context |
| Focus Canvas | 1 |
| Focus Timeline | 2 |
| Focus Graph | 3 |
| Toggle Inspector | 4 or platform-native command |
| Zoom to selection | F |
| Delete | Delete/Backspace with safe context |
| Escape | cancel gesture / close transient UI |

Shortcuts are displayed in tooltips/menus and must respect text entry contexts.

### 14.4 Apple Pencil stretch

Pencil-specific enhancements must remain optional:

- hover preview;
- pressure only where musically intentional and controllable;
- barrel/squeeze shortcuts only with visible alternatives;
- Pencil should never be the sole way to perform an authoring action.

---

## 15. Selection and linked state

Implementation follows `docs/16-cross-platform-interaction-contract.md`.

Visual selection hierarchy:

1. primary selected entity — strongest outline/focus marker;
2. secondary selected entities — same semantic style, less emphasis;
3. linked/related projections — thinner line/dashed connector or provenance marker;
4. hover/focus preview — transient and visibly different.

Example: selecting one Euclidean hit:

- hit marker is selected;
- corresponding timeline trigger is linked;
- source Euclidean node is linked;
- inspector mapping stage is linked;
- other hits remain normal.

---

## 16. State and feedback design

### 16.1 Evaluation pending

Use a small “recomputing” state tied to affected surface. Do not block unrelated UI.

For quick operations under ~one frame, no spinner.

For heavier work:

- retain previous result dimmed/marked stale if helpful;
- show cancel action when computation is long enough;
- update budget/prediction.

### 16.2 Error

Errors have three levels:

- inline field/node;
- surface diagnostic banner;
- project-level fatal/recovery.

Every user-facing error includes:

- what happened;
- why if known;
- what remains safe;
- recovery action.

### 16.3 Budget state

Example:

> Depth 8 would create ~65,536 notes, above this project’s 4,096-event interactive limit.
>
> **Reduce depth** · **Freeze a branch** · **Increase offline limit**

Budget UX should teach scale, not merely scold.

### 16.4 Research-gated state

Include:

- explicit gate label;
- why the gate exists;
- current status;
- allowed exploratory behavior;
- link to evidence/charter for advanced users.

### 16.5 MIDI unavailable

Do not disable unrelated work. Explain:

> MIDI input is unavailable in this browser/device. Playback, project editing, and MIDI file export remain available.

---

## 17. Accessibility specification

### 17.1 Keyboard completeness

Every pointer/touch authoring action has a keyboard/numeric alternative where semantically possible.

Canvas objects have:

- focusable semantic counterpart;
- logical navigation order;
- explicit activate/edit command;
- selection state.

### 17.2 Screen reader model

Each complex canvas exposes a synchronized structured summary.

Examples:

#### Euclidean Rings

```text
Ring 2, Snare. 8 steps, 3 pulses, rotation 1.
Selected onset: step 4 of 8. Next onset in 2 steps.
```

#### Tonnetz

```text
Selected chord: A minor. Path step 4 of 7.
Common tones with previous chord: A, C.
Moved voice: E to F, one semitone.
```

#### Chaos

```text
Lorenz trajectory, sample 312 of frozen 2,000.
x normalized 0.62 maps to scale degree 5.
y normalized 0.41 maps to pan -0.18.
```

### 17.3 Non-color redundancy

Use:

- shape;
- stroke pattern;
- label;
- position;
- icon;
- selected marker;

in addition to color.

### 17.4 Reduced motion

Reduced-motion mode:

- removes decorative interpolation;
- replaces continuously flying elements with stepped state updates or static trails;
- retains playhead and essential timing indication;
- never removes mathematical information;
- keeps audio behavior unchanged unless the user separately requests reduced auditory stimulation.

### 17.5 Auditory alternatives

No essential UI state can be available only through sound. Beat, selection, warning, and mapping state have visual/text alternatives.

### 17.6 Cognitive accessibility

- one primary action per guided step;
- strong reset affordance;
- defaults remain bounded/musical;
- advanced parameters grouped by effect, not code implementation;
- tooltips explain unfamiliar math/audio terms;
- stable panel positions;
- no unexpected autoplay;
- no modal cascade.

---

## 18. Motion and animation grammar

Motion must encode state.

Allowed purposes:

- phase/progression;
- tempo relation;
- traversal order;
- recursion ancestry;
- transformation from A to B;
- evaluation state;
- selection linkage.

Avoid motion solely to make the product look active.

Recommended durations:

- micro control: 80–140 ms;
- panel: 160–220 ms;
- focus transition: 180–260 ms;
- semantic transformation: synchronized to musical time or 250–600 ms depending meaning.

Audio-driven animation uses the audio clock/render plan where possible, not independent timers that drift perceptually.

---

## 19. Content and microcopy

Tone:

- concise;
- precise;
- curious;
- non-patronizing;
- explicit about uncertainty.

Good:

> **Reveal the reset**  
> Keep one pulse fixed so the hidden tempo handoff becomes easier to hear.

Bad:

> **Magic Mode**  
> See the impossible rhythm trick!

Technical detail is available without forcing it into primary labels.

---

## 20. Responsive/native mapping

### 20.1 iPad landscape

- persistent or collapsible project sidebar;
- canvas dominant;
- native/adaptive inspector;
- timeline bottom drawer;
- graph as drawer or focus surface;
- Pencil and touch hit targets enlarged;
- keyboard/pointer retain desktop-like efficiency.

### 20.2 iPad portrait

- canvas first;
- sidebar overlays;
- inspector becomes sheet/overlay;
- timeline bottom sheet/drawer;
- graph dedicated focus surface;
- transport persistent.

### 20.3 iPhone

- no full four-pane studio;
- canvas + parameter cards;
- inspector as push/sheet;
- timeline summary;
- graph read-only or limited control;
- playback and guided experiments remain strong.

See `docs/14-native-apple-stretch-architecture.md`.

---

## 21. Component inventory

Canonical component IDs are stored in `design/components.json`. Major families:

### Shell

- AppShell
- ProjectToolbar
- Transport
- ModeSwitcher
- Navigator
- Inspector
- TimelineDrawer
- GraphDrawer
- FocusSurface

### Controls

- NumericField
- ScrubbableNumber
- ParameterSlider
- Toggle
- SegmentedControl
- Select
- Chip
- IconButton
- BudgetMeter
- StatusIndicator
- ABCompare

### Musical

- TrackHeader
- GeneratedClip
- FrozenClip
- ManualClip
- TriggerEventGlyph
- NoteEventGlyph
- AutomationLane
- Playhead
- LoopRegion

### Graph

- OperatorNode
- TypedPort
- OperatorEdge
- GraphDiagnostic
- NodePalette
- GraphMinimap

### Math/visualization

- MathCanvas
- SelectionOverlay
- FormulaPanel
- MappingPipeline
- ProvenanceTrace
- VerificationBadge
- ResearchGate

### Lab-specific

- RissetTempoBands
- EuclideanRingSet
- TonnetzLattice
- RecursionTree
- AutomatonGrid
- AttractorPlot
- PenroseTilingCanvas

---

## 22. Design QA checklist

A screen is not ready for implementation until:

- hierarchy is clear at 100% zoom;
- user can identify primary action in <3 seconds;
- selected entity can be located across relevant surfaces;
- generated/frozen/manual state is visually distinguishable without color;
- any direct manipulation has visible value and numeric alternative;
- canvas has semantic/accessibility counterpart;
- error/loading/empty state is specified;
- keyboard path is specified;
- compact-width behavior is specified;
- no mathematical graphic makes an unsupported claim;
- all visible values are internally coherent;
- components map to design tokens/manifests;
- motion has a semantic purpose;
- destructive actions are undoable or confirmed;
- no audio autoplays on open.

---

## 23. Implementation notes for React

Recommended posture:

- React is a projection layer over an external project/command store; do not mirror the full project into unrelated component-local state.
- Use controlled state for cross-surface selection and canonical parameter controls.
- Canvas renderers receive immutable projections/selection data and emit semantic intents.
- A node-editor framework may manage viewport and node interaction, but graph semantics remain in the AGL graph runtime.
- Dense canvases should avoid creating one DOM node per visual datum when scale makes that expensive; keep an accessible semantic mirror.
- Workers return revision/hash with results so React can reject stale computations.
- Virtualize timeline/event lists when density requires it.

Current React guidance emphasizes deliberate state ownership and a single source of truth for state shared across components. The AGL command/project store follows that principle while keeping high-frequency view previews local where appropriate.

---

## 24. Implementation notes for SwiftUI stretch

Recommended mapping:

- `NavigationSplitView` / adaptive navigation for project context;
- SwiftUI inspector for contextual explanation;
- `Canvas` for moderate-density 2D visualization;
- document APIs for portable project/package handling;
- AVAudioEngine for native audio backend;
- platform undo/command integration wrapping the same semantic project commands;
- Pencil/drag/drop as optional input projections over canonical commands.

The native client should feel native; it need not reproduce desktop pixel geometry so long as project semantics and visual grammar remain aligned.

---

## 25. Mockup authority

Generated mockups are **exploration artifacts** until they are reconciled against this specification.

When mockups conflict with this document:

1. determine whether the mockup discovered a better interaction;
2. if yes, update this spec and component/screen manifests deliberately;
3. only then treat the new mockup as authoritative.

Never let a visually appealing generated image silently become the product contract.

Use `docs/15-mockup-generation-spec.md` for the canonical generation sequence and prompt grammar.

---

## 26. Source anchors for implementation research

These are implementation starting points, not substitutes for DR-11–DR-15:

- React state ownership and shared state: https://react.dev/learn/managing-state
- React Flow accessibility: https://reactflow.dev/learn/advanced-use/accessibility
- Apple SwiftUI Canvas: https://developer.apple.com/documentation/swiftui/canvas
- Apple split-view guidance: https://developer.apple.com/design/human-interface-guidelines/split-views
- SwiftUI inspector: https://developer.apple.com/documentation/swiftui/view/inspector(isPresented:content:)
- SwiftUI document model: https://developer.apple.com/documentation/swiftui/filedocument
- Apple audio/music technology overview: https://developer.apple.com/documentation/technologyoverviews/audio-and-music
- AVAudioEngine: https://developer.apple.com/documentation/avfaudio/avaudioengine
- Apple Pencil HIG: https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble

