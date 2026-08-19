# DR-11 — Professional Music-Tool UX and Progressive Disclosure

**Research cutoff:** 2026-08-18, America/New_York  
**Charter date supplied:** 2026-08-14  
**Program:** Aural Geometry Lab  
**Decision target:** `docs/13-ui-ux-final-design-spec.md`

**TL;DR**

AGL should **not** adopt a conventional DAW shell wholesale. The strongest cross-tool pattern is a stable creative workspace with **task-oriented panel configurations, contextual inspectors, direct manipulation, keyboard accelerators, and explicit materialization boundaries**. Ableton, Bitwig, Logic, Dorico, Max, and TouchDesigner all solve professional density by keeping the underlying objects stable while changing which views and controls are exposed. citeturn0search3turn1search6turn5search10

The recommended AGL shell is **Explore → Compose → Inspect as workspace presets, not capability-restricting modes**. Every workspace acts on one canonical project and one linked selection. Explore foregrounds mathematical manipulation and immediate sound; Compose foregrounds temporal structure; Inspect foregrounds graph, equations, values, and provenance. Users must be able to reveal any panel from any workspace. This aligns closely with existing AGL backlog commitments to timeline/generated-vs-frozen semantics, typed graph editing, mathematical inspection, linked selection, provenance, freeze-to-clip, and accessibility. fileciteturn0file0

AGL should make procedural state first-class: **Live Generated → Frozen Snapshot → Edited Derivation**, with an additional **Stale** condition when an upstream source changes. Logic's Session Player/MIDI conversion, Bitwig's non-destructive Operators, Ableton's Freeze/Bounce distinction, and provenance systems such as VisTrails all point toward explicit state and lineage rather than silently replacing generated material. citeturn13search6turn20search16turn20search0turn22search4

For numeric control, use **direct manipulation first, exact numbers one action away**: scrub/drag, snap, coarse/fine modifiers, keyboard nudging, typed values, reset, and live feedback. This convention appears across Logic for iPad, Procreate, VCV Rack, and recent HCI work on creative-software parameter widgets. citeturn11search3turn10search0turn4search1turn22search1

On iPad, do not merely enlarge the desktop UI. Use a single dominant work surface, revealable/resizable zones, bottom view controls, touch-sized ports and parameters, Pencil precision, keyboard/pointer parity, and non-drag alternatives for every core operation. Logic Pro for iPad demonstrates this professional-density pattern particularly well, and WCAG 2.2 requires a non-drag pointer alternative for dragging functionality in web content. citeturn0search12turn11search0turn11search1turn18search13

## Evidence base and design conclusions

### Scope and evidence quality

The comparative sample covers Ableton Live, Logic Pro on Mac and iPad, Bitwig Studio, Max/MSP, TouchDesigner, VCV Rack as a software-modular exemplar, Dorico and MuseScore, Strudel/Tidal/SuperCollider, OpenMusic and Opusmodus, Loopy Pro, Drambo, Procreate as an iPad-native direct-manipulation reference, and EyeHarp as an explicitly accessibility-oriented musical instrument. Product documentation is treated as evidence of **what an interface does**, not evidence that the interface is empirically usable.

The empirical layer comes from peer-reviewed HCI work on graph readability, visual programming, precise touch, direct manipulation, gesture learning, parameter tuning, and accessible musical interfaces. Green and Petre's work is particularly relevant because visual dataflow environments can achieve a strong match between problem and notation while still suffering from **viscosity**—resistance to local change—and weak **secondary notation**, meaning difficulty using spatial arrangement, color, grouping, and other visual cues to communicate additional structure. citeturn21search8 Purchase's graph-layout experiments found that reducing edge crossings materially improved comprehension, while later work cautioned that no single layout algorithm can simply be declared universally superior. citeturn16search4turn16search1

Recent work is directionally useful but must be weighted appropriately. The 2025 Tweeq study sampled widgets in nine widely used creative applications, identified multimodal input, expert efficiency/precision, and low visual footprint as core design goals, and received generally positive responses from five creative professionals; the authors explicitly characterize the expert study as informal, so it is useful design evidence rather than broad validation. citeturn22search1

AGL's supplied program artifacts already encode several conclusions DR-11 would otherwise have had to derive from scratch. The backlog requires generated/frozen differentiation, graph freeze-to-clip with lineage, a typed keyboard-operable graph, mathematical inspection, linked selection across event/node/geometry/provenance, explicit ancestry for recursive material, live-versus-frozen trajectory labeling, and a keyboard/focus/non-color accessibility baseline. fileciteturn0file0 The seven current labs span runnable rhythm experiences through research-gated geometry, meaning the shell must accommodate both approachable direct manipulation and substantially different underlying mathematical structures without becoming seven bespoke applications. fileciteturn0file1

The program assumes only two product engineers and one product/UX FTE, with fractional accessibility support, which argues against maintaining separate novice/expert shells or radically different desktop/iPad information architectures. fileciteturn0file2 The supplied research register ends at DR-10 as of August 13, 2026, so DR-11 should also be added formally if these conclusions become program dependencies. fileciteturn0file3

### Core conclusion: expose different views of the same composition

The strongest convergence across the sample is **not** "music software uses timelines and mixers." It is that professional tools let a small number of persistent domain objects appear through different task-specific views.

Ableton's Session and Arrangement Views expose non-linear launching and linear composition as different representations/workflows connected through the same tracks, with explicit UI when what is sounding has diverged from the Arrangement. citeturn0search0turn0search13 Bitwig explicitly describes Arrange, Mix, and Edit as curated layouts of panels for different musical jobs rather than separate applications. citeturn1search6 Logic's main window combines Tracks, contextual Inspector, Mixer, editors, browsers, and numerical list editors, with areas independently shown, hidden, or moved into separate windows. citeturn0search3 Dorico goes farther and exposes task modes such as Write, Engrave, and Play, changing which controls are visible; even its Properties panel progressively exposes more detail in Engrave than Write. citeturn5search10turn5search11

For AGL, **Explore, Compose, and Inspect should therefore describe layout emphasis, not permission boundaries**. Dorico's strict modes are useful precedent for density reduction, but AGL should not copy the restriction that a user cannot perform certain semantic edits in a particular workspace. citeturn5search16 A mathematical studio has unusually strong cross-view relationships: a Euclidean ring, graph operator, timeline event, equation value, and provenance record may all denote different aspects of one thing. The existing linked-selection requirement is therefore not a minor convenience; it should be the organizing principle of the shell. fileciteturn0file0

An AGL interaction model should look conceptually like this:

```text
                      ┌──────────────────────────────────────┐
                      │         Persistent studio shell      │
                      │ Transport • project • undo • status  │
                      └──────────────────────────────────────┘
                                      │
                 same project + same linked selection + same history
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
        EXPLORE                    COMPOSE                  INSPECT
   mathematical object         temporal structure        causal structure
   + immediate sound          + tracks/clips/mix        + graph/equations
             │                        │                        │
     Geometry / rings              Timeline                 Graph
     Play surfaces                 Mixer                    Values
     Macro controls                Browser                  Provenance
     Guided examples               Editors                  Diagnostics
             └────────────────────────┼────────────────────────┘
                                      │
                          reveal any panel anywhere
                                      │
                              canonical project model
```

This diagram is a synthesis of the multi-view architectures documented in Ableton, Bitwig, Logic, Max, and Dorico rather than a reproduction of any single product. citeturn0search13turn1search6turn0search3turn2search3turn5search10

## Pattern taxonomy and comparative analysis

### Recurrent patterns versus inherited hardware metaphors

| Pattern | What recurs in strong tools | Legacy-hardware dependency | Main usability implication | AGL decision |
|---|---|---|---|---|
| **Horizontal time + vertical lanes** | Arrangement/Tracks areas remain the dominant representation for committed temporal structure in Ableton, Logic, and Bitwig. citeturn0search6turn13search10turn1search0 | Low. Time-on-x is now a software convention, even though tracks inherit studio terminology. | Strong shared vocabulary for composition; poor fit as the *only* representation for generative systems. | Use timeline as Compose's dominant view, not the application's root ontology. |
| **Contextual Inspector** | Logic and Bitwig change the Inspector with selection; Dorico similarly exposes properties of selected notation. citeturn0search3turn1search2turn5search11 | None. Software-native. | High density without permanently exposing every parameter. | One Inspector framework for events, nodes, geometry, tracks, generated regions, and provenance. |
| **Task-oriented workspaces** | Bitwig's Arrange/Mix/Edit and Dorico's modes optimize panel layouts for different jobs. citeturn1search6turn5search10 | None. | Reduces simultaneous complexity, but restrictive modes can create mode errors. | Explore/Compose/Inspect are rearrangements, never semantic locks. |
| **Browser at an edge** | Ableton, Logic, and Bitwig keep searchable reusable content in peripheral browser panels with drag/drop into the work surface. citeturn0search2turn13search7turn1search3 | Low. | Search/browse is expected; permanently occupying width is not necessary. | Collapsible left Browser for labs, operators, presets, materials, examples. |
| **Mixer channel strips** | Ableton, Logic, and Bitwig retain vertical strip layouts with gain/pan/routing and optional sections. citeturn0search4turn1search4 | **High.** Direct descendent of mixing-console organization. | Familiar and space-efficient for many channels, but not a useful master metaphor for mathematical relationships. | Provide a real mixer in Compose; do not map arbitrary math controls onto faux channel strips. |
| **Rack/knob/cable interface** | VCV Rack intentionally models Eurorack; Max and node systems retain patch-cord interaction without necessarily preserving the physical rack. citeturn4search2turn2search0 | **Very high** for rack panels/knobs; lower for abstract edges. | Tactile familiarity can come with arbitrary cable routing, small targets, and unnecessary skeuomorphism. | Borrow drag-to-connect and modifiers; reject virtual-rack visual language. |
| **Typed/data-family ports** | TouchDesigner gives operator families distinct colors and constrains network connections by operator family; AGL itself already requires a typed graph checker. citeturn3search0turn3search4 fileciteturn0file0 | None. | Preventing an invalid edge is better than accepting one and reporting an evaluation failure later. | Compatibility filtering must operate during connection, before commit. |
| **Zoomable nested graph** | TouchDesigner supports zoomable networks/components; Max supports multiple patcher views; OpenMusic uses nested visual abstractions. citeturn3search3turn2search7turn7search7 | None. | Scales graph size but can destroy orientation without breadcrumbs/context. | Use nested subgraphs with breadcrumbs and explicit "up" navigation; never zoom alone as the only hierarchy cue. |
| **Direct manipulation + numerical escape hatch** | Logic iPad supports value dragging plus a numeric dialog; Procreate combines touch transforms with exact dimension/angle input; VCV exposes exact parameter fields alongside drag/modifiers. citeturn11search3turn10search0turn4search1 | None. | Tactile exploration and exact reproducibility need not conflict. | Make every continuous parameter scrubbable *and* directly enterable. |
| **Visible novice path + expert accelerator** | Dorico keeps visible notation toolboxes while experts can use popovers; SuperCollider exposes menu/help/UI while evaluation and navigation have shortcuts; gesture research shows users can transition from visible guidance to accelerated gestures. citeturn5search1turn5search3turn6search0turn14search0 | None. | Hiding expert commands behind a separate mode lowers the ceiling; hiding novice affordances entirely lowers learnability. | Visible action + shortcut/gesture on the same command. |
| **Presentation separate from logic** | Max Presentation Mode lets an interface be arranged independently of patching while referring to the same underlying objects, with cross-view correspondence. citeturn2search3turn2search18 | None. | Excellent precedent for approachable performance surfaces over complex graphs. | Explore can be a curated projection of the same graph, not a duplicated "simple project." |
| **Software-native non-destructive state** | Freeze, bypass, automation, event operators, undo, conversion, aliases, and provenance are fundamentally software-native and have no requirement to imitate analog workflows. citeturn20search0turn20search16turn1search3 | None. | This is where AGL should depart most strongly from legacy DAW metaphors. | Make lineage, regenerate, freeze, compare, and revert first-class. |

The important distinction is therefore not "old versus modern." Several hardware-derived conventions remain highly efficient because musicians already know them. A fader is a sensible continuous control for track gain; a faux rotary knob is a poor representation for a Lorenz integration step or recursion limit when the relevant information is numeric, bounded, and often compared across states. VCV Rack itself demonstrates the difference: it supports highly refined drag sensitivity, fine modifiers, exact parameter entry, and reset behaviors even while preserving the rack metaphor. citeturn4search1

### Managing timeline, inspector, mixer, browser, and graph density

Professional tools overwhelmingly **avoid giving every subsystem equal permanent area**. Logic's major zones can be independently shown and hidden; Bitwig changes panel arrangements by task; Ableton lets Mixer and detail areas appear in different main views; Dorico repurposes side and lower zones according to task. citeturn0search3turn1search6turn0search5turn5search10

AGL should use four density mechanisms in combination:

**Stable edges.** Browser left, Inspector right, details/mixer bottom is a strong convention because the center remains the creative object. The actual panels can close, but their reopening location is predictable. Logic and Bitwig both exploit this. citeturn0search3turn1search2

**Contextual detail.** A selected node should not require opening a different node editor; the Inspector changes. A selected generated clip should expose generation parameters and provenance; a frozen clip should expose snapshot lineage and editable material properties. This follows the contextual Inspector convention rather than proliferating special-purpose modal dialogs. citeturn1search2turn5search11

**Task presets.** "Explore," "Compose," and "Inspect" should save layout emphasis, zoom/focus preferences, and which peripheral panels are open. Bitwig's curated views are the closest precedent. citeturn1search6

**Multiple simultaneous representations when comparison matters.** HCI work comparing zooming with multiple windows found multiple visible views advantageous when a task imposes higher visual-memory demands or requires comparison among several distant locations. citeturn15search11 This supports AGL's planned linked graph/geometry/provenance inspection rather than forcing users to repeatedly navigate between mutually exclusive full-screen views.

### Node-graph UX that prevents errors rather than explaining them later

AGL has an unusually strong starting point because AGL-021 already requires invalid graph edges to be rejected before evaluation and AGL-034 requires a typed, keyboard-operable graph. fileciteturn0file0 The UI should visibly exploit those semantics rather than implement a generic canvas whose error checking only happens after drop.

TouchDesigner demonstrates several useful software-native techniques: data/operator families have consistent visual identities, connections encode family relationships, the Create menu distinguishes operator kinds, users can create from a connection context, network flow is generally directional, and status areas communicate feedback. citeturn3search0turn3search1turn3search6turn3search10 Max adds inlet/outlet assistance bubbles, connection hover highlighting, endpoint marks, configurable routing, and direct patch-cord actions. citeturn2search0turn2search11turn2search12

AGL should go one step further because its types are semantic:

```text
Before drag             During drag                    On compatible target
────────────            ───────────                    ────────────────────

[Euclidean] rhythm ●    valid ports brighten           [Quantize]
                   │ ─────────────────────────────────▶ ○ pattern
                   │                                   ↑
                   └ invalid ports dim                  drop commits edge

                                                    "Pattern → Pattern"
                                                    visible before drop


On incompatible target

[Euclidean] rhythm ● ─ ─ ─ X  [Gain]
                             ○ audio

                      "Expected Audio;
                       got Pattern"
                      no invalid edge created
```

The rule is **preview compatibility before commitment**. Incompatible ports remain visible for orientation but become non-targets; keyboard connection flow should use the same compatibility filter.

Graph layout should optimize comprehensibility without continuously rearranging the user's map. Purchase's controlled work found edge-crossing reduction particularly important to graph understanding; Green and Petre emphasize that spatial layout itself functions as secondary notation. citeturn16search4turn21search8 Therefore AGL should provide route/clean-selection commands and suggested layouts, but avoid live global auto-layout after every change. Automatic re-layout can remove crossings while simultaneously destroying the user's learned spatial grouping—an inference supported by those two bodies of evidence rather than a directly tested AGL claim. citeturn16search4turn21search8

Smooth focus transitions are preferable to teleporting between distant graph regions because smooth zoom/pan can preserve context in large 2D information spaces. citeturn15search0turn15search8 AGL should combine that with breadcrumbs, "zoom to selection," "zoom to source," "zoom to dependents," and a temporary upstream/downstream trace overlay.

TouchDesigner's separate dependency lines are also a warning: dependencies created through references can be less obvious than ordinary wires, and some script references may not receive visible network edges at all. citeturn3search6 AGL should reject that ambiguity. Anything capable of changing the result of an operator should appear in the provenance/dependency model even if it is not a normal dataflow edge.

### Visual evidence atlas

The following source figures are worth treating as reference screenshots during implementation reviews. This dossier describes rather than reproduces copyrighted product imagery; the cited product documentation contains the originals.

| Reference screenshot / figure | What to inspect |
|---|---|
| **Ableton Session View and Arrangement View** | Compare the clip-launch grid with the timeline and especially the UI state indicating that currently heard Session material differs from Arrangement playback. This is the closest existing analogy to "exploratory state versus committed structure." citeturn0search0turn0search6 |
| **Logic Pro for iPad main project view** | Observe the persistent transport, large center Tracks area, bottom view-control bar, and revealable Browser/Inspector/Editors/Plugins/Mixer areas. citeturn13search7turn0search12 |
| **Bitwig Arrange/Mix/Edit views** | Observe that the same project objects survive across curated panel arrangements rather than spawning task-specific documents. citeturn1search6turn1search8 |
| **Max Presentation Mode versus patching view** | Observe how presentation geometry can diverge from implementation geometry while object identity remains linked. citeturn2search3 |
| **Tweeq Figures 15–16** | The 2025 paper is published under CC BY 4.0. Figure 15 shows a compact input expanding into a precision overlay whose scale changes for coarse/fine adjustment; Figure 16 shows simultaneous parameter adjustment. These are especially strong references for AGL's parameter component. citeturn22search1 |
| **EyeHarp interface figures** | The open-access paper shows the large-target melody and step-sequencer layers of a gaze-controlled instrument; the paper's performer evaluation is small and involved participants without motor disabilities, so use the figures as accessibility design references rather than proof of universal usability. citeturn12search7 |

### Comparative matrix

The symbols below are **analyst ratings of documented affordance strength, not empirical usability scores**: ●●● strong/core, ●● substantial, ● limited/specialized, — not central or not applicable.

| Tool | Disc. | Density | Precision | Direct | Kbd | Touch | Graph | Generated-content semantics | Accessibility | Evidence basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| **Ableton Live 12** | ●● | ●●● | ●●● | ●●● | ●●● | ● | — | **Strong:** Session/Arrangement divergence, Freeze vs Bounce, MIDI/event transforms | ●●● improving | Stable dual views, collapsible areas, Info/Learn concepts, extensive keyboard/screen-reader work. Current documentation also records remaining accessibility gaps. citeturn0search0turn0search8turn18search2turn20search1 |
| **Logic Pro Mac** | ●● | ●●● | ●●● | ●●● | ●●● | ● | — | **Strong:** region types, automation, freeze/bounce | ●● | Highly configurable main window, contextual Inspector, numerical editors, Mixer/browser/editors. citeturn0search3turn20search5 |
| **Logic Pro iPad 3** | ●●● | ●●● | ●●● | ●●● | ●●● | ●●● | — | **Very strong:** Session Player ↔ MIDI/pattern conversion | ●●● | Resizable zones, Pencil precision, pointer/keyboard support, numeric dialogs, VoiceOver workflows. citeturn13search9turn11search0turn11search3turn18search9 |
| **Bitwig Studio** | ●● | ●●● | ●●● | ●●● | ●●● | ● | ●● for Grid/modulation | **Very strong:** Operators, bypass, Chance/Occurrence/Recurrence visual state | ●● | Explicitly task-oriented panel layouts; non-destructive event operations have visible semantics. citeturn1search6turn20search16 |
| **Max/MSP** | ●● | ●●● | ●●● | ●●● | ●● | ● | ●●● | **Medium:** patch execution/state; presentation can hide implementation | ●● | Patching/presentation split, assisted ports, flexible cords and Inspector. citeturn2search0turn2search3turn2search11 |
| **TouchDesigner** | ●● | ●●● | ●●● | ●●● | ●● | ● | ●●● | **Strong graph state**, weaker when dependencies become implicit references | ●● | Typed/family-colored operators, create-on-network workflows, nested zoomable networks. citeturn3search0turn3search3turn3search6 |
| **VCV Rack** | ●● | ●●● | ●●● | ●●● | ●● | ● | ●● | **Low explicit provenance** | ● | Exceptionally refined knob/cable interaction and exact entry, but deliberately preserves arbitrary modular cabling and dense hardware metaphor. citeturn4search1turn4search2 |
| **Dorico Pro** | ●●● | ●●● | ●●● | ●● | ●●● | ●● | — | **Medium:** hidden/semantic notation objects receive signposts | ●● | Task modes, contextual Properties, visible toolboxes plus expert popovers. citeturn5search10turn5search3turn5search18 |
| **Strudel / Tidal / SuperCollider** | ●● to ● | ●●● | ●●● | ● to ●● | ●●● | ●● Strudel | textual graph/flow | **Very strong procedural semantics**, weak "commit" convention | ●● | Strudel couples editable code with current-event highlighting and MiniREPLs; SuperCollider emphasizes evaluation commands and contextual help. citeturn6search3turn6search4turn6search0 |
| **OpenMusic / Opusmodus** | ●● | ●●● | ●●● | ●● | ●●● | ● | ●●● OpenMusic | **Strong:** calculated materials, variables/history, temporal objects | ● | OpenMusic couples visual programs with temporal composition; Opusmodus NCODE exposes no-code generated values that can be retained as named material. citeturn7search8turn7search15turn7search4 |
| **Loopy Pro** | ●●● | ●●● | ●● | ●●● | ●● | ●●● | routing rather than VPL | **Medium:** clip/performance states | ●● | Touch-first looping with configurable gestures, MIDI learn, keyboard support, customizable performance surfaces. citeturn10search1 |
| **Drambo** | ●● | ●●● | ●● | ●●● | ●● | ●●● | ●●● | **Strong procedural signal flow** | ●● | Particularly relevant because it adapts modular synthesis to touch using auto-connected directional modules rather than requiring every cable to be drawn. citeturn10search2turn10search14 |
| **Procreate** | ●●● | ●●● | ●●● | ●●● | ●● | ●●● | — | — | ●●● | Strong non-music reference for a low-chrome iPad surface that escalates from touch manipulation to exact numeric dimensions/angles and Pencil precision. citeturn10search0turn10search3 |
| **EyeHarp** | ●● | ●● | specialized | ●●● gaze | specialized | pointing-device compatible | — | sequencer state | **●●● purpose-built** | Explicitly designed as a gaze/head-controlled musical instrument. Its 2016 evaluation demonstrates feasibility and expressiveness but does not establish usability for all target disability populations. citeturn12search5turn12search7 |

The matrix makes one point especially clear: **professional density is compatible with direct manipulation only when exact and accelerated paths coexist**. Recent Tweeq work describes precisely this tension: creative professionals need compact widgets because the content deserves screen space, but compact widgets must still support high-speed and accurate control across multiple modalities. citeturn22search1

## AGL interaction rules and failure patterns

### Design rules for Aural Geometry Lab

These are the recommended normative rules for DR-11.

| ID | AGL rule | Rationale / evidence |
|---|---|---|
| **UX-R1** | **Explore, Compose, and Inspect are workspace presets, not modes that disable capabilities.** | Task-oriented views reduce density, but one canonical object model avoids mode errors and duplicate state. Bitwig provides the clearest precedent. citeturn1search6 |
| **UX-R2** | **Selection is global and linked across timeline, graph, geometry, Inspector, and provenance.** | Contextual inspectors are established practice; AGL already requires linked selection. citeturn1search2turn0search3 fileciteturn0file0 |
| **UX-R3** | **No core concept may exist only in one representation.** An event accessible visually must also have semantic/keyboard access and provenance representation. | Supports the existing accessibility and mathematical-description commitments. fileciteturn0file0 |
| **UX-R4** | **Direct manipulation is the first path; exact numeric input is never more than one action away.** | Logic iPad, Procreate, VCV Rack, and Tweeq converge on this combination. citeturn11search3turn10search0turn4search1turn22search1 |
| **UX-R5** | **Every numeric field supports scrub, typed entry, keyboard nudge, coarse/fine adjustment, reset, unit display, and visible min/max or domain constraints where meaningful.** | Creative-software parameter research favors multiple control modalities rather than a single generic slider. citeturn22search1 |
| **UX-R6** | **Do not use a rotary knob unless angular interaction or hardware transfer is itself meaningful.** | Hardware-style knobs are common but not necessary for precise mathematical parameters; modern professional tools also offer direct numerical paths. citeturn4search1turn22search1 |
| **UX-R7** | **Invalid graph connections must be prevented before drop.** | TouchDesigner provides connection-type cues; AGL's type checker already promises pre-evaluation rejection. citeturn3search0 fileciteturn0file0 |
| **UX-R8** | **Starting an edge filters/highlights compatible ports and shows the proposed type conversion before commitment.** | This converts the type system into feedforward, reducing error recovery burden. TouchDesigner and Max provide precedents for port/connection assistance. citeturn3search0turn2search11 |
| **UX-R9** | **A port must be targetable by label/body area, not only by a tiny socket.** | Touch precision is intrinsically limited by finger size, and WCAG requires adequate target sizing/spacing. citeturn22search0turn18search3 |
| **UX-R10** | **Every drag action has a click/tap or keyboard alternative.** | WCAG 2.2 SC 2.5.7 explicitly requires non-drag alternatives for web functionality unless dragging is essential. citeturn18search7turn18search13 |
| **UX-R11** | **Graph auto-layout is explicit, local, undoable, and previewed. Never continuously reflow the whole graph.** | Crossings matter, but spatial layout is also user-created secondary notation. citeturn16search4turn21search8 |
| **UX-R12** | **Nested graphs always show breadcrumbs and support "up," "source," "dependents," and "zoom to selection."** | Zoomable graphs scale, but explicit context reduces navigation burden. citeturn3search3turn15search8 |
| **UX-R13** | **Generated, frozen, committed, and stale material differ by at least two non-color visual channels.** | AGL already requires generated/frozen distinction; accessibility guidance advises against relying on a single perceptual method. fileciteturn0file0 citeturn18search6 |
| **UX-R14** | **Freeze never destroys the source graph relationship.** | Ableton distinguishes reversible Freeze from committing/bouncing; VisTrails demonstrates the value of retaining change provenance. citeturn20search0turn22search4 |
| **UX-R15** | **Editing a frozen snapshot creates an explicit derived state rather than silently masquerading as live-generated output.** | Logic requires Session Player regions to be converted before note-level editing; that semantic boundary is highly relevant to AGL. citeturn13search6 |
| **UX-R16** | **When upstream inputs change, snapshots become visibly stale rather than silently regenerating.** | This is an AGL-specific inference from provenance systems and freeze semantics: reproducibility requires users to know whether a result corresponds to current source state. citeturn22search4turn20search0 |
| **UX-R17** | **Regenerate, compare, re-freeze, detach, and trace-source are first-class actions on generated material.** | Logic Session Players expose regeneration/conversion; AGL's backlog explicitly requires lineage and freeze. citeturn13search5turn13search6 fileciteturn0file0 |
| **UX-R18** | **The visible novice action and expert accelerator invoke the same command.** | Marking-menu research found experts use accelerated marks but still return to visible menus to refresh memory; OctoPocus showed dynamic guidance can support novice-to-expert transition. citeturn14search6turn14search0 |
| **UX-R19** | **Do not put essential functionality behind undocumented gestures.** Gestures enhance visible commands rather than replace them. | Gesture-learning research shows feedforward is valuable precisely because arbitrary gestures are otherwise difficult to discover/remember. citeturn14search0 |
| **UX-R20** | **Keep the musical/mathematical object visually dominant; parameter chrome expands only during interaction or inspection.** | Tweeq identifies minimal visual footprint as a core design requirement for creative-software parameter controls. citeturn22search1 |
| **UX-R21** | **State changes caused by another view must be explicitly communicated.** | Ableton's Session/Arrangement divergence handling is a strong precedent for preventing "why is this playing?" confusion. citeturn0search0 |
| **UX-R22** | **Accessibility parity is a release invariant, not a later alternative interface.** Graph editing, timeline editing, generated-state actions, and provenance must be keyboard/semantic operations from their first implementation. | Ableton and Logic show how difficult accessibility retrofits become when complex areas are not modeled semantically; AGL-132 already makes this a P0 requirement. citeturn18search2turn18search11 fileciteturn0file0 |

### Generated and committed content semantics

The best product precedent is not a single system but a combination.

Bitwig keeps probabilistic behavior attached to events as non-destructive Operators, with neutral defaults, bypass controls, and visible event-level indicators. citeturn20search16 Logic gives Session Player regions a distinct region type and visual identity; the user can manipulate the generated performance at a higher level, but must convert the region to MIDI or a pattern before editing individual notes. citeturn13search10turn13search6 Ableton distinguishes temporary reversible Freeze from a bounce that produces committed audio. citeturn20search0turn20search1

AGL should formalize these ideas into the following semantic state machine:

```text
        graph / algorithm / seed / parameters
                     │
                     ▼
           ┌───────────────────┐
           │   LIVE GENERATED  │
           │ linked to source  │
           │ regenerates       │
           └────────┬──────────┘
                    │ Freeze range
                    ▼
           ┌───────────────────┐
           │ FROZEN SNAPSHOT   │
           │ deterministic     │
           │ source retained   │
           └──────┬──────┬─────┘
                  │      │ source changes
          edit     │      ▼
                  │   ┌─────────────┐
                  │   │    STALE    │
                  │   │ snapshot ≠  │
                  │   │ current src │
                  │   └─────────────┘
                  ▼
           ┌───────────────────┐
           │ EDITED DERIVATION │
           │ locally mutable   │
           │ lineage retained  │
           └───────────────────┘
```

This should not be represented by color alone. A recommended combination is:

| State | Shape/stroke | Badge | Interior treatment | Behavior |
|---|---|---|---|---|
| **Live Generated** | solid outer shape + procedural edge marker | `LIVE` + generator icon | subtle patterned/hatched header or origin stripe | follows source automatically |
| **Frozen Snapshot** | solid conventional clip border | `SNAPSHOT` / snowflake-like neutral symbol | ordinary editable material body plus provenance stripe | remains unchanged when source changes |
| **Edited Derivation** | solid clip border + derivative marker | `EDITED` | conventional edit visualization | local event edits permitted |
| **Stale Snapshot** | snapshot styling + warning marker | `SOURCE CHANGED` | no animation required | offers Compare / Re-freeze / Keep |

The pattern/label/icon redundancy supports AGL's non-color accessibility commitment. fileciteturn0file0

Every snapshot should store enough metadata to answer, without reconstructive detective work:

`generatedByNodeId`, operator/version, source graph revision, seed, evaluation interval, exact parameter set or content hash, freeze command ID, freeze timestamp, output hash, and parent material ID. This is a design inference from AGL's deterministic evaluation architecture and change-provenance research; VisTrails' central idea is automatically capturing both products and the workflow evolution that generated them. citeturn22search4

### Anti-pattern catalog

| Anti-pattern | Failure mechanism | AGL response |
|---|---|---|
| **Everything visible at once** | Makes "professional" synonymous with permanently dense. | Use stable revealable zones and task presets. |
| **Separate beginner application / expert application** | Creates a migration cliff and doubles design/engineering. | One command model; progressively expose detail. |
| **Explore/Compose/Inspect as hard semantic modes** | Produces "why can't I edit this here?" errors. Dorico shows the density benefit of modes but also demonstrates that modes can constrain available operations. citeturn5search16 | Workspaces change emphasis, not permissions. |
| **Tiny graph sockets** | Pointer accuracy becomes the interaction bottleneck. Precise-touch research documents this problem directly. citeturn22search0 | Large semantic hit areas and keyboard edge creation. |
| **Accept invalid edges, error later** | Makes the user debug a connection the type system already knew was impossible. | Feedforward compatibility filtering. |
| **Cable spaghetti as authenticity** | VCV Rack's arbitrary output-to-input behavior is faithful to modular hardware but intentionally permissive rather than semantically typed. citeturn4search2 | Typed edges, routing help, local cleanup. |
| **Continuous global auto-layout** | Solves crossings by destroying spatial memory/secondary notation. citeturn16search4turn21search8 | Explicit local layout commands. |
| **Hidden dependencies** | A result can change for reasons not represented in the visible graph. TouchDesigner documentation shows how references can exist outside ordinary data wires. citeturn3search6 | All causal dependencies enter provenance even when omitted from primary graph rendering. |
| **Color means "generated"** | Fails under color-vision variation, high contrast, monochrome printing, and screen-reader access. | Label + icon + stroke/pattern + semantic role. |
| **Generated material looks exactly like ordinary editable events** | Users cannot predict whether local edits are possible or will survive regeneration. | Explicit state machine above. |
| **"Freeze" that actually destroys the generator** | Conflates optimization/materialization with irreversible commitment. Ableton explicitly keeps Freeze reversible. citeturn20search0 | Preserve source and lineage. |
| **Silent regeneration** | Changes authored output without a clear action boundary. | Live material may recompute; snapshots never do. |
| **Drag-only manipulation** | Excludes users unable to execute precise drag and conflicts with WCAG 2.2. citeturn18search13 | Click/tap/keyboard alternatives. |
| **Gesture-only expert commands** | Fast after learning, practically undiscoverable before learning. | Visible action + accelerator + optional dynamic hint. citeturn14search0turn14search6 |
| **Opaque icon grids** | Reduces chrome at the cost of recognition. | Text labels at first exposure; tooltips/help and user-controlled compacting later. |
| **Generic sliders for every mathematical quantity** | Loses units, topology, ranges, cyclicity, vectors, probabilities, and exact values. Tweeq specifically criticizes one-size-fits-all primitive widgets in professional creative software. citeturn22search1 | Type-aware controls: scalar, rational, angle, cyclic phase, probability, vector, enum, seed. |
| **Long mandatory onboarding tours** | Front-loads information before the object giving it meaning exists. | Contextual first-use coaching and runnable examples. |
| **Hover as required information** | Touch and keyboard users do not have reliable hover. | Hover may supplement persistent labels/selection state, never replace them. |
| **A full desktop DAW simply scaled to iPad** | Finger target size and panel competition make desktop density unsuitable for direct touch. citeturn22search0turn18search5 | Recompose around a dominant surface and modal/revealable detail zones. |

## Recommended shell, iPad adaptation, and design-spec changes

### Desktop layout options

#### Recommended: stable shell with workspace presets

This option best reconciles AGL's mathematical identity with professional music conventions.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Project     undo/redo        transport / tempo / meter       status / CPU   │
├───────────────┬──────────────────────────────────────────┬───────────────────┤
│               │                                          │                   │
│   BROWSER     │              PRIMARY WORKSPACE           │    INSPECTOR      │
│               │                                          │                   │
│ Labs          │ Explore: geometry / ring / visual model  │ Selection         │
│ Operators     │ Compose: timeline                         │ Parameters        │
│ Presets       │ Inspect: graph + linked visualization    │ Explanation       │
│ Materials     │                                          │ Provenance        │
│               │                                          │                   │
├───────────────┴──────────────────────────────────────────┴───────────────────┤
│ CONTEXT DETAIL: editor / graph detail / mixer / history / diagnostics       │
└──────────────────────────────────────────────────────────────────────────────┘
         Explore             Compose               Inspect
       [ workspace switcher — same project, selection and transport ]
```

The browser, Inspector, and lower detail zone collapse independently. On large displays, panels may detach or a second window may host graph/provenance, following Logic's ability to use separate windows and differently configured main windows. citeturn0search3

**Explore** opens with the mathematical visualization occupying most of the center. A newcomer can manipulate one or two primary variables and hear/see immediate results. The graph can remain available as a lower drawer or secondary panel rather than disappearing from the model. This resembles Max's ability to present an interaction surface distinct from patch layout while preserving object identity. citeturn2search3

**Compose** makes the timeline dominant, puts track controls near the lanes, and makes Mixer and detail editor easily available. The browser becomes more valuable here for presets/materials. This borrows familiar DAW composition grammar without forcing all mathematical work into tracks. Ableton, Logic, and Bitwig all justify the convention. citeturn0search6turn0search3turn1search0

**Inspect** defaults to a split graph + mathematical visualization with the right Inspector widened to include equation, live values, evaluation stages, diagnostics, and provenance. This directly serves AGL-035 and AGL-036. fileciteturn0file0

**Trade-off:** the user must learn what each workspace emphasizes, but visual continuity is high and implementation cost is controlled because the panels are shared.

#### Alternative: single Compose-centered shell

A more DAW-like option would keep the timeline permanently central and present mathematical Explore and graph Inspect as lower/side editors, similar to how music applications put piano roll, automation, devices, or plug-ins under a primary arrangement.

The advantage is immediate familiarity for experienced DAW users. The disadvantage is strategic: AGL's differentiator becomes visually subordinate to a conventional timeline. It also makes the first experience harder for a curious newcomer whose starting question is "what does a Euclidean rhythm look and sound like?" rather than "which track should I create?"

**Verdict:** reject as primary architecture, retain as an optional saved workspace for expert users.

#### Alternative: graph-centered shell

Max/OpenMusic/TouchDesigner-style graph centering would make AGL's computational architecture exceptionally explicit. OpenMusic demonstrates that visual programs can coexist with temporal composition structures. citeturn7search8turn7search15

The disadvantage is discoverability. Graph construction is not the most direct representation for every lab, and visual-programming research warns that graphical notation does not automatically eliminate cognitive cost. citeturn21search8 A Euclidean ring, Tonnetz walk, CA grid, or Lorenz attractor should be directly manipulable before the user understands its graph implementation.

**Verdict:** excellent Inspect workspace; wrong default shell.

### iPad layout

Logic Pro for iPad provides the most relevant professional precedent: it maintains a persistent transport, a dominant center workspace, a view-control bar for Browser/Inspector/Fader/editors/plugins/Mixer, handles for resizing/hiding areas, direct numeric scrubbing, a separate numeric dialog, Apple Pencil precision, keyboard shortcuts, and pointer gestures. citeturn0search11turn0search12turn11search0turn11search1turn11search3

AGL should use that structural grammar without mimicking Logic's visual styling:

```text
LANDSCAPE iPAD

┌──────────────────────────────────────────────────────────────────┐
│ project      ◀ ▶        transport / loop       workspace   ⋯    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                     DOMINANT ACTIVE SURFACE                      │
│                                                                  │
│      Explore: geometry/ring       Compose: timeline              │
│      Inspect: graph               Detail: editor                 │
│                                                                  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Browse   Inspector   Graph   Timeline   Mixer   Provenance      │
└──────────────────────────────────────────────────────────────────┘
                contextual panel slides/reveals above bar
```

In portrait, AGL should favor one surface plus a bottom sheet rather than attempting a miniature three-column desktop layout.

Interaction adaptation should be modality-aware:

| Input | AGL behavior |
|---|---|
| **Finger** | Large targets, drag for broad continuous control, pinch/scroll navigation, tap selection, long-press only for supplemental context. |
| **Apple Pencil** | Same command semantics as finger but lower sensitivity/finer direct manipulation; optional hover preview where the OS/device provides it. Logic explicitly uses Pencil as a more precise one-finger input. citeturn11search0 |
| **Keyboard** | Full command access, focus movement, numeric entry, graph connection, timeline nudge, workspace/panel shortcuts. Logic and Ableton show that serious professional workflows benefit from keyboard navigation even in visually rich music environments. citeturn11search2turn18search8 |
| **Pointer/trackpad** | Secondary click/context actions, conventional hover as enhancement, precise drag, wheel/two-finger scroll and zoom. Logic documents these directly on iPad. citeturn11search1 |
| **Assistive technology** | Semantic navigation through tracks/events/nodes/parameters rather than a second simplified interface. Logic's VoiceOver timeline navigation demonstrates that even ruler positions and item movement can be made semantically navigable. citeturn18search11 |

For touch, AGL should set an internal target substantially larger than WCAG's 24×24 CSS-pixel AA minimum for frequently manipulated controls; **44–48 logical points is a sensible AGL design target**, especially for ports and transport controls. The 44–48 recommendation is a project design choice, not a WCAG requirement; WCAG's actual minimum criterion is 24×24 CSS pixels with defined exceptions/spacing conditions. citeturn18search3

Drambo provides another particularly relevant idea: touch modularity need not equal manually drawing every cable. Its module chain auto-connects according to flow while allowing explicit override. citeturn10search2 AGL can similarly make common graph operations "insert after," "insert before," and "replace with compatible operator" first-class touch actions while retaining free graph editing for experts.

### Material changes required in `docs/13-ui-ux-final-design-spec.md`

The named design-spec file was **not among the supplied artifacts and was not located through the connected GitHub or Drive search**, so this cannot be a trustworthy line-by-line diff. The following is therefore the normative delta DR-11 should require if the current spec does not already contain equivalent provisions.

The changes are material because they affect the P0 timeline, graph, inspector, linked-selection, accessibility, and freeze semantics already present in the backlog. fileciteturn0file0

#### Design tokens

Add semantic tokens independent of any final palette:

```text
content.state.liveGenerated
content.state.snapshot
content.state.editedDerivative
content.state.stale

content.state.liveGenerated.strokeStyle
content.state.snapshot.strokeStyle
content.state.stale.strokeStyle

graph.port.compatible
graph.port.incompatible
graph.port.candidate
graph.edge.data
graph.edge.control
graph.edge.provenance
graph.edge.disabled
graph.edge.error

selection.primary
selection.linked
selection.upstream
selection.downstream

provenance.source
provenance.snapshot
provenance.changed

control.target.min.pointer
control.target.min.touch
control.precision.coarse
control.precision.normal
control.precision.fine

motion.graphNavigation
motion.proceduralActivity
motion.reduced

density.compact
density.normal
density.touch
```

The visual-state tokens must support stroke, icon, pattern, and text—not just color—because the backlog already requires non-color accessibility cues. fileciteturn0file0

Numeric typography should support tabular figures and keep units structurally associated with values. The interaction behavior should be type-based rather than merely aesthetic: rational time, scalar floating point, integer count, probability, phase/angle, seed, enum, and vector should each have domain-aware editing.

#### Components

At minimum, the spec should formalize these reusable components rather than allowing each lab to invent its own:

| Component | Required behavior |
|---|---|
| **`WorkspaceSwitcher`** | Explore/Compose/Inspect; changes layout only; keyboard accessible. |
| **`PanelDock` / `PanelToggle`** | Stable Browser/Inspector/detail locations with persisted visibility and size. |
| **`ParameterField`** | Scrub, type, nudge, coarse/fine, reset, unit, bounds, default, accessible value semantics. |
| **`PrecisionHUD`** | Temporary overlay during scrubbing showing current value, delta, snapping, precision mode. Tweeq provides direct precedent for temporary precision overlays. citeturn22search1 |
| **`TypedPort`** | Label, type, direction, large hit region, compatibility state, keyboard focus. |
| **`GraphEdgePreview`** | Shows pending source/type/target and blocks incompatible commit. |
| **`GraphNavigator`** | Breadcrumbs, zoom-to-selection, upstream/downstream trace, fit graph, local layout. |
| **`ContentStateBadge`** | Live / Snapshot / Edited / Stale semantic state. |
| **`GeneratedRegion`** | Procedural preview + state identity + generator link. |
| **`SnapshotRegion`** | Frozen output with immutable-generation metadata but editable material if derived. |
| **`ProvenanceStrip`** | Compact visible lineage indicator on material. |
| **`ProvenanceInspector`** | Source operator, version, seed, range, source revision, output hash, parent, regenerate/compare/re-freeze/detach. |
| **`LinkedSelectionMarker`** | Secondary cross-highlight distinct from primary selection. |
| **`StatusBar` / `DiagnosticBanner`** | Evaluation state, bounded budget state, connection explanation, stale result, accessibility status announcements. |
| **`ContextHelp`** | Persistent concise explanation and optional shortcut/gesture hint rather than one-time tour. |
| **`CommandPalette`** | Searchable command surface using the same command IDs as menus/buttons/shortcuts. |
| **`CommitSheet`** | Explicit Freeze/Materialize operation showing interval, generator, output type, source-retention semantics. |

#### Screen requirements

The final design spec should contain explicit reference screens/states for:

**Studio shell:** Browser closed/open, Inspector closed/open, detail zone collapsed/expanded, each workspace selected.

**Explore:** one P0 Euclidean example and one Infinite Staircase example showing direct manipulation, generated state, and optional graph reveal. These are currently the two runnable P0 lab slices. fileciteturn0file1

**Compose:** timeline with live-generated region, frozen snapshot, locally edited derivative, and stale snapshot visible simultaneously.

**Inspect:** selected timeline event cross-highlighting graph node and geometry plus equation/value/provenance Inspector, directly satisfying AGL-035/036. fileciteturn0file0

**Graph connection:** valid target, incompatible target, keyboard connection sequence, and create-compatible-node flow.

**Freeze/materialize:** before freeze, immediately after freeze, after upstream graph change, compare current generator versus snapshot, and edited derivative.

**iPad:** landscape Explore, landscape Compose with Inspector, portrait single-surface state, Pencil parameter adjustment, external-keyboard graph operation.

**Accessibility:** focus order, screen-reader structure, non-drag alternatives, non-color generated states, reduced-motion graph navigation.

## Validation plan and evidence ledger

### Suggested usability-test tasks

The validation should test the **transitions between representations**, not merely whether individual buttons are findable. A user who can play a Euclidean ring but cannot understand how it became timeline material has not validated the product thesis.

The first formative study should include at least three distinct cohorts: curious music-capable newcomers with little/no node-programming experience; experienced DAW/composition/creative-tool users; and users relying on keyboard and/or relevant assistive interaction. That is a study design recommendation, not a statistical sample-size claim. Given the program's limited capacity and M6 requirement for representative user validation, staged qualitative rounds are more realistic than a single large benchmark study. fileciteturn0file2

| Task | What it tests | Key observable |
|---|---|---|
| **Make sound from an unfamiliar lab** | Initial discoverability of Explore | Time to first intentional result; wrong-area navigation; help opened |
| **Change a mathematical property by feel, then set an exact value** | Direct manipulation → precision escalation | Whether user discovers scrub then numeric path; final numeric error |
| **Explain what changed musically after changing a parameter** | Mapping transparency | Correct link between manipulation and result |
| **Turn an exploratory result into four bars in the composition** | Explore → Compose bridge | Whether "freeze/materialize" is discovered and understood |
| **Change the generator after freezing** | Live/snapshot semantics | Whether user predicts that snapshot remains unchanged and notices stale state |
| **Edit one frozen note/event** | Commit boundary | Whether user understands snapshot → edited derivation |
| **Return to the generator that created the event** | Provenance discoverability | Time and path to source |
| **Connect two graph nodes** | Basic graph manipulation | Connection time, target errors |
| **Attempt an incompatible connection** | Preventive type UX | Whether invalid edge is prevented and explanation understood |
| **Insert a compatible operator into an existing edge** | Professional graph efficiency | Number of destructive rewires/backtracks |
| **Find why a selected event occurred** | Inspect mental model | Event → node → parameter/equation/provenance trace |
| **Compare two generated outcomes** | Iterative exploration | Whether versions/snapshots can be compared without manual duplication |
| **Mix/solo one track while retaining mathematical context** | Compose density | Panel switching burden |
| **Repeat graph and timeline tasks keyboard-only** | Expert/accessibility ceiling | Completion without pointer |
| **Repeat touch tasks without dragging** | WCAG interaction parity | Availability and discoverability of alternative operation |
| **Perform precision task with finger, Pencil, then keyboard** | Modality adaptation | Error rate and subjective preference by operation |
| **Reopen project and identify which material is procedural** | Persistent state semantics | Correct state classification without replaying history |

### Proposed success metrics

These should be treated as **initial AGL acceptance targets to calibrate after pilot testing**, not industry benchmarks.

| Metric | Initial target |
|---|---:|
| Newcomers producing an intentional audible/visual result without external documentation | ≥ 80% |
| Newcomers correctly locating exact numeric entry after discovering direct manipulation | ≥ 85% |
| Valid graph connection success after one exposure | ≥ 90% |
| Incompatible connections committed into canonical graph | **0%** |
| Users correctly explaining incompatible-edge reason | ≥ 90% |
| Users correctly classify Live / Snapshot / Edited / Stale examples | ≥ 90% after brief exposure |
| Freeze/materialize task completed without deleting or duplicating the source manually | ≥ 90% |
| Users correctly predict behavior after upstream source change | ≥ 85% first round, ≥ 95% after design refinement |
| Trace selected event back to generating node after initial learning | median ≤ 15 s |
| Core graph/timeline/freeze/provenance tasks completable keyboard-only | **100%** |
| Core drag functions with a single-pointer non-drag alternative | **100%** |
| Critical state information relying on color alone | **0 cases** |
| Touch target accidental activation during tested core workflows | < 5% |
| "Lost in graph" incidents requiring reset/fit-all in a simple 10–20-node task | < 1 median per participant |
| Expert repetitive operation requiring modal dialog when direct/shortcut path is expected | **0 critical cases** |

Also capture navigation transitions, undo count, mistaken state transitions, unexpected regeneration, Inspector open/close frequency, panel resize churn, and verbalized uncertainty. Those logs will reveal whether a theoretically elegant shell actually imposes excessive "view tax."

### Claim and evidence table

Quality grading below distinguishes **authority for the specific claim**, not general prestige:

**A:** primary official specification/product documentation for observed behavior, or peer-reviewed primary research directly addressing the claim.  
**B:** relevant primary evidence with limited sample/ecological scope.  
**C:** useful design signal but exploratory/informal; should not be treated as validation.

| Claim | Evidence | Date | Type | Quality / limitation |
|---|---|---|---|---|
| Professional creative tools commonly use multiple task-oriented views over shared objects. | Bitwig's Arrange/Mix/Edit views; Logic's configurable work areas; Dorico modes/zones. citeturn1search6turn0search3turn5search10 | Current docs, accessed 2026-08-18 | Product observation | **A for behavior**, not usability evidence |
| A nonlinear exploratory music state and a committed timeline can coexist, but divergence must be communicated. | Ableton Session/Arrangement behavior and "Back to Arrangement" state. citeturn0search0turn0search13 | Live 12 docs, accessed 2026-08-18 | Product observation | **A for behavior** |
| Contextual inspectors are a recurring density-management solution. | Logic, Bitwig, Dorico. citeturn0search3turn1search2turn5search11 | Current docs, accessed 2026-08-18 | Product observation | **A for behavior** |
| Reducing edge crossings improves graph understanding more strongly than several other tested aesthetics. | Purchase, *Which aesthetic has the greatest effect on human understanding?* citeturn16search4 | 1997 | Controlled empirical study | **A**, but old and uses abstract graph-reading tasks rather than creative patching |
| No single graph-layout algorithm can simply be assumed best for human relational understanding. | Purchase, *The effects of graph layout*. citeturn16search1 | 1998 | Peer-reviewed empirical work | **A**, task/context dependent |
| Visual programming can provide closeness-of-match while still suffering viscosity and weak secondary notation. | Green & Petre, *Usability Analysis of Visual Programming Environments*. citeturn21search8 | 1996 | Peer-reviewed analysis/empirical application | **A**, foundational but predates current node tools |
| Smooth zoom/pan can help maintain context in large 2D spaces. | van Wijk & Nuij model and user experiment. citeturn15search0turn15search8 | 2003–2004 | Peer-reviewed visualization HCI | **A**, not graph-editor-specific |
| Touch precision is constrained by finger size; specialized precision techniques can materially reduce errors. | Benko, Wilson & Baudisch formal multi-touch study. citeturn22search0 | 2006 | CHI controlled experiment | **A**, hardware/task differs from current iPad but mechanism remains relevant |
| Direct manipulation and exact numerical control can productively coexist in creative tools. | Logic iPad numeric controls, Procreate transform controls, VCV parameter entry. citeturn11search3turn10search0turn4search1 | Current docs, accessed 2026-08-18 | Product observation | **A for behavior** |
| Creative professionals benefit from parameter widgets supporting diverse modalities, expert precision/speed, and low visual footprint. | Hashimoto & Kato, Tweeq. citeturn22search1 | 2025-09-27 | UIST paper + informal expert study | **B/C**: systematic product sampling, but only five-person informal evaluation |
| Dynamic on-screen feedforward can improve arbitrary gesture learning versus conventional help. | Bau & Mackay, OctoPocus; two experiments reported. citeturn14search0 | 2008 | UIST controlled experiments | **A** |
| Expert users can use accelerators heavily while still returning to visible menus to refresh memory. | Kurtenbach & Buxton real-work marking-menu case study. citeturn14search6 | 1994 | Longitudinal/case-study evidence | **B**, interaction technology differs but novice/expert transition is directly relevant |
| Procedural musical behavior can remain non-destructive and visibly attached to events. | Bitwig Operators and bypass/visual indicators. citeturn20search16 | Current docs, accessed 2026-08-18 | Product observation | **A for behavior** |
| Generated musical regions can use an explicit conversion boundary before note-level editing. | Logic Session Player → MIDI/pattern conversion. citeturn13search6turn13search10 | Logic Pro iPad 3 docs, accessed 2026-08-18 | Product observation | **A for behavior** |
| Temporary reversible rendering and committed rendering are meaningfully different operations. | Ableton Freeze versus Bounce Track in Place/New Track. citeturn20search0turn20search1 | Live 12 docs, accessed 2026-08-18 | Product observation | **A for behavior** |
| Capturing workflow evolution as provenance supports reproducibility and navigation through exploratory results. | VisTrails change-based provenance work. citeturn22search4turn22search8 | 2006–2008 | Research system / peer-reviewed publication | **A**, scientific visualization rather than music |
| Touch/web functionality should not rely exclusively on dragging and requires adequate target sizing/spacing. | WCAG 2.2 SC 2.5.7 and 2.5.8. citeturn18search7turn18search3 | WCAG 2.2; guidance current in 2026 | Normative web standard | **A** |
| A professional iPad music application can support touch, Pencil, keyboard, pointer, and screen-reader workflows in one shell. | Logic Pro for iPad documentation, including VoiceOver navigation. citeturn11search0turn11search1turn11search2turn18search11 | Logic Pro iPad 3 docs, accessed 2026-08-18 | Product observation | **A for behavior** |
| Accessibility-oriented musical interfaces can support alternate motor modalities, but evidence must be interpreted cautiously. | EyeHarp gaze/head-controlled instrument; 2016 study used eight nondisabled performer participants plus audience evaluation. citeturn12search7 | 2016-06-21 | Peer-reviewed technology report/pilot | **B**; not a direct validation with the principal motor-disability population |

The evidence therefore supports several design principles strongly—preventive graph typing, multi-path precision, visible novice-to-expert transitions, non-drag accessibility, provenance, and explicit materialization semantics—while other choices, such as exact panel proportions or the precise four-state clip styling, remain **AGL design hypotheses that must be validated in the proposed studies**.

## ADR proposal for the AGL interaction shell

### ADR — Semantic multi-workspace studio shell

**Status:** Proposed  
**Decision owner:** Product/UX + architecture  
**Applies to:** AGL-030 through AGL-038, AGL-050–053, all laboratory surfaces, desktop and iPad  
**Research basis:** DR-11

### Context

AGL must serve users ranging from mathematically curious newcomers to expert composers. Its canonical objects simultaneously participate in musical time, operator graphs, geometric or mathematical visualizations, audio rendering, and provenance. Existing backlog commitments already require timeline composition, a typed visual graph, mathematical Inspector, linked selection, generated/frozen differentiation, freeze-to-clip lineage, and accessibility. fileciteturn0file0

Conventional DAWs establish valuable expectations around transport, timelines, track lanes, contextual detail, browser placement, mixer behavior, snapping, keyboard shortcuts, and non-destructive editing. Ableton, Logic, and Bitwig all demonstrate these conventions. citeturn0search6turn0search3turn1search0 However, rack/cable/mixer metaphors are partly inherited from physical equipment and do not adequately represent mathematical generators, causal lineage, recursive processes, or geometry. VCV Rack is the clearest example of deliberately preserving those hardware semantics. citeturn4search2

Visual-programming systems show the benefit of computational graphs but also expose risks of clutter, hidden dependencies, navigation burden, and excessive reliance on layout. citeturn21search8turn3search6

### Decision

AGL will implement **one canonical studio shell with three named workspace presets: Explore, Compose, and Inspect**.

The workspaces share project state, selection, undo/redo, transport, evaluation state, command registry, accessibility tree, and panel/component implementations.

**Explore** prioritizes direct mathematical manipulation, visualization, immediate listening, and constrained primary parameters.

**Compose** prioritizes temporal arrangement, tracks, clips, mixing, and material reuse.

**Inspect** prioritizes the typed graph, equations, evaluation stages, linked visualization, diagnostics, and provenance.

The workspace switcher will **never disable semantic editing capabilities**. Users can reveal Graph, Timeline, Inspector, Browser, Mixer, and Provenance from any workspace. Workspaces control defaults and layout emphasis only. This decision follows the task-layout strengths of Bitwig and Logic while avoiding hard capability modes. citeturn1search6turn0search3

The central project semantics will include:

```text
ContentOrigin =
    UserAuthored
  | LiveGenerated
  | Snapshot
  | EditedDerivative

SnapshotFreshness =
    Current
  | Stale
```

`LiveGenerated` material remains linked and recomputable. `Snapshot` material is deterministic, retained independently of future graph evaluation, and contains lineage to its generator. `EditedDerivative` represents material that has crossed into ordinary event-level editing while retaining ancestry. A source revision mismatch marks a snapshot `Stale`; it never silently regenerates.

The graph UI will be **type-directed**. Connection creation filters compatible targets before commit. Node insertion, replacement, edge creation, and keyboard graph navigation use the same type checker as compilation. This exposes rather than duplicates AGL-021 semantics. fileciteturn0file0

All continuous parameters will use a common precision interaction contract:

```text
pointer/touch drag  → continuous adjustment
modifier/gesture    → coarse or fine sensitivity
keyboard arrows     → deterministic nudge
tap/click value     → exact numeric input
double-click/action → reset to declared default
```

The visible field, gesture, shortcut, MIDI/controller mapping, and accessibility action all dispatch the same underlying command.

On iPad, the shell will **recompose rather than scale**: one dominant work surface, bottom view controls, contextual sheets/panels, touch-sized interaction zones, Pencil precision, and keyboard/pointer parity. Logic Pro for iPad demonstrates the feasibility of this combination. citeturn13search7turn11search0turn11search1turn18search9

### Consequences

**Positive:** newcomers encounter the mathematical object before implementation complexity. Experts can reveal the graph, type exact values, use keyboard commands, and maintain dense multi-panel layouts without switching to a separate expert product.

**Positive:** each laboratory can customize its Explore projection without creating a different application shell. This is particularly important because the current manifest spans Euclidean rings, infinite staircase, Tonnetz, fractal, CA, chaos, and Penrose labs at different implementation/research states. fileciteturn0file1

**Positive:** generated-content semantics align the UI with the deterministic evaluator, freeze-to-clip requirement, provenance requirement, and research-driven nature of AGL rather than borrowing an ambiguous "clip is a clip" abstraction. fileciteturn0file0

**Positive:** accessibility becomes architectural. A command can be invoked through pointer, touch, keyboard, assistive technology, or potentially MIDI without each surface implementing its own semantics.

**Negative:** linked views and persistent selection require disciplined state architecture. Cross-highlighting cannot be bolted onto independent lab canvases later.

**Negative:** provenance and snapshot freshness add visible state that simpler music tools do not need. The visual system must keep these distinctions legible without making every clip look diagnostic.

**Negative:** allowing every panel from every workspace increases implementation complexity relative to hard modes. The trade is justified because hard modes create an artificial expert ceiling and constrain cross-domain workflows.

### Rejected alternatives

**Traditional DAW as root shell — rejected.** Familiar to experienced producers but subordinates AGL's mathematical interaction model to a timeline and mixer. The DAW conventions should be imported selectively.

**Graph-first application — rejected as default.** Excellent for experts and Inspect, but visual programming itself carries significant navigation and notation costs and is not the most direct representation of several AGL labs. citeturn21search8

**Separate beginner and expert interfaces — rejected.** It creates duplicated interaction models and a migration cliff. Evidence on gesture/menu learning instead supports visible novice representations with accelerators that users adopt incrementally and can return from. citeturn14search0turn14search6

**Hardware-rack metaphor — rejected except where musically literal.** VCV demonstrates the strengths of physical continuity but also preserves arbitrary patching conventions that conflict with AGL's typed semantic graph. citeturn4search2

**Automatic regeneration of all frozen content — rejected.** It eliminates a reliable distinction between computational source and authored result and undermines reproducibility/provenance. citeturn22search4turn20search0

### Acceptance criteria

The ADR should be considered implemented only when:

1. The same project can move Explore → Compose → Inspect without selection, transport, undo history, or material identity changing.
2. Any selected event can navigate to its graph source and provenance when one exists.
3. Generated, snapshot, edited, and stale material remain distinguishable without color.
4. Freezing retains source lineage and upstream edits cannot silently change the snapshot.
5. Invalid graph edges cannot enter canonical project state.
6. Every core graph operation has pointer and keyboard paths; every essential drag operation has a non-drag pointer alternative.
7. Direct manipulation and exact numeric entry use the same parameter semantics.
8. iPad supports finger, Pencil, keyboard, and pointer without maintaining separate project/UI semantics.
9. The P0 Infinite Staircase and Euclidean Rings labs both work through the shared shell rather than bespoke navigation structures. fileciteturn0file1
10. Representative user validation at the program's private-beta gate includes the Explore → Compose → Inspect transitions, procedural material comprehension, and accessibility tasks defined above, consistent with M6's existing validation requirement. fileciteturn0file2

**Bottom-line design decision:** AGL should feel less like "a DAW with math plug-ins" and more like **one mathematical musical object viewed through three professional lenses**. The DAW contributes temporal grammar; node environments contribute causal grammar; direct-manipulation tools contribute tactile grammar; algorithmic systems contribute generative grammar; accessibility research contributes modality independence. The product's unique UX should emerge where those grammars meet: **touch something mathematical, hear the result, place it in time, and inspect exactly why it happened without losing the thread between those actions.**

#MusicUX #HCI #CreativeTools #DAW #NodeGraph #iPadUX #Accessibility #GenerativeMusic #AuralGeometryLab #DR11

*Approx. conversation context processed: ~140k–155k tokens.*