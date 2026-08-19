# Aural Geometry Lab — Wave-1 Integrated UI/UX Amendment

**Status:** normative amendment to `docs/13-ui-ux-final-design-spec.md`  
**Version:** 1.1  
**Architecture baseline:** 0.3.0  
**Date:** 2026-08-18  
**Research integrated:** DR-08, DR-11, DR-12, DR-14, with DR-01/03/09/15 consequences

## 1. Authority and intent

This amendment resolves the cross-run semantic changes that affect every mockup, React component, SwiftUI surface, and user study. Where it conflicts with the August 14 UI/UX specification, this amendment wins.

The visual thesis remains:

> **Touch a structure, hear the consequence; hear an event, reveal the structure that caused it.**

The semantic refinement is:

> **Every visible state must identify whether it is authored, generated, projected, previewed, derived, scheduled, or evidential.**

The interface may simplify those distinctions in Explore, but it may not erase them.

## 2. One studio, three workspaces

Explore, Compose, and Inspect are **workspace presets**, not capability modes.

They share:

- one canonical project;
- one semantic command bus;
- one transport and audible-plan authority;
- one linear project undo/redo history;
- one linked selection model;
- one material and provenance model;
- one operator graph;
- one evidence/claim registry.

A workspace may alter layout, panel emphasis, disclosure, focus destination, and default zoom. It may not silently change object identity, edit semantics, generation behavior, or operation availability.

### 2.1 Explore

Dominant goal: understand and manipulate a phenomenon.

Default hierarchy:

1. mathematical canvas;
2. one primary question or guided prompt;
3. two to five direct controls;
4. transport and audio state;
5. concise evidence/default qualification;
6. revealable explanation and graph.

Explore must not present an empty graph as the first experience. It may show a curated projection over an underlying graph.

### 2.2 Compose

Dominant goal: arrange and combine material.

Default hierarchy:

1. timeline/tracks;
2. mathematical canvas or editor for selected material;
3. compact track/mixer controls;
4. contextual Inspector;
5. graph available as a drawer or focus surface.

### 2.3 Inspect

Dominant goal: explain cause and semantics.

Default hierarchy:

1. selected object and linked projections;
2. source → mapping → constraint → target trace;
3. formula/current values;
4. causality/window/seed/budget status;
5. graph dependencies and provenance;
6. evidence class and claim qualification.

## 3. State vocabulary is architectural

### 3.1 Project versus session versus runtime

The UI must not imply that all visible state belongs to the saved project.

| State | Examples | Saved in `project.json` | Project undo |
|---|---|---:|---:|
| Authoritative project | graph, tracks, materials, parameters, exceptions, source recipes | Yes | Yes |
| Studio session | workspace, panel layout, selection, focus, viewport | No | No |
| Preview overlay | current drag/trim/control candidate | No | No |
| Derived evaluation | events, geometry, mapping trace, validation | No unless materialized | No |
| Audio runtime | enable state, active generation, interruption, device route | No | No |
| Evidence state | claim class, source receipt, research gate | Referenced/versioned where required | Usually no |

### 3.2 Selection is not focus

The shared interaction model distinguishes:

- **selection** — actionable user-chosen entities;
- **primary selection** — one selected entity driving default Inspector detail;
- **focus** — keyboard/navigation locus;
- **hover** — pointer-local transient location;
- **related** — derived source/dependent/provenance relationship;
- **orphaned** — selected generated identity that no longer exists;
- **range anchor/head** — ordered selection boundaries.

Moving keyboard focus through a graph or timeline must not automatically select each entity or launch expensive evaluation. Related projections highlight without becoming selected. Color must never be the only distinction.

### 3.3 Async and audio states

Every surface that depends on evaluation must be able to represent:

```text
idle → preview/evaluating → current
                         ↘ cache-only
                         ↘ stale/discarded
                         ↘ cancelled
                         ↘ error
```

Audio state is separate:

```text
disabled → arming → playing ↔ paused
                  ↘ interrupted → reconfiguring → paused/playing
                  ↘ error
                  ↘ panic/stop
```

A stale worker result may never appear as current. A last-valid audio plan may remain audible during preparation, but the UI must distinguish **document truth**, **candidate plan**, **armed plan**, and **active audible plan** when they differ.

## 4. Material model

Do not use one flat set of “generated/frozen/edited/stale” states.

### 4.1 Material kind

```text
User Authored
Live Generated
Snapshot
Edited Derivative
```

### 4.2 Source status

Derived from source recipe and semantic dependency digest:

```text
Not Applicable
Current
Changed
Missing
Detached
```

The visible label combines them only for presentation:

```text
SNAPSHOT · CURRENT
SNAPSHOT · SOURCE CHANGED
EDITED DERIVATIVE · SOURCE MISSING
SNAPSHOT · DETACHED
```

Source status must include icon/shape/text—not color alone. Unrelated project or layout changes must not create a “changed” status.

### 4.3 Editing generated output

Attempting to edit a projected generated event or geometry element must resolve explicitly to one of four meanings:

1. **Edit generator** — global rule change.
2. **Add downstream operator or sparse exception** — procedural result remains live.
3. **Fork generator** — independent procedural branch with initial semantic equivalence.
4. **Materialize range** — bounded authored snapshot with lineage.

No surface may silently mutate generated output in place. Ephemeral generators may not accept stable per-entity exceptions.

### 4.4 Materialization interaction

Materialization is prepare-then-commit:

```text
Choose exact half-open range
        ↓
Preview output/count/size/lineage
        ↓
Prepare immutable artifact asynchronously
        ↓
Verify current source dependency digest
        ↓
Atomic commit or explicit source-changed failure
```

The UI must not imply completion while preparation is merely running. Cancel is resource control; a late result still passes the freshness guard.

## 5. Direct manipulation and commands

Every continuous manipulation uses:

```text
begin → preview* → commit | cancel
```

A five-second drag produces zero or one project transaction and zero or one undo item. Pointer samples, Pencil samples, keyboard repeats, and slider events are not project history.

Every parameter uses a shared `ParameterSpec` and editor family with:

- direct manipulation when meaningful;
- exact value entry one action away;
- units and formatting;
- default and reset;
- deterministic keyboard nudge;
- coarse/fine control;
- clamp, wrap, or reject policy;
- domain-aware validation;
- accessible increment/decrement/set actions;
- current source, modulation, or mapping indication.

Rotary knobs are reserved for genuinely angular/cyclic or hardware-transfer interactions. They are not the default mathematical input.

## 6. Typed graph interaction

The graph UI consumes the same compatibility service as compilation.

During connection:

- compatible ports become valid targets;
- incompatible ports remain visible but non-targetable;
- the reason is shown before drop;
- safe conversions are explicit nodes, not hidden coercions;
- keyboard and non-drag connection paths expose the same candidates;
- a rewire is one atomic command;
- drag motion never mutates the committed graph or active audio topology.

Result-affecting control, asset, parameter, and reference dependencies must enter the causal/provenance model even when they are visually styled differently from normal dataflow wires.

Auto-layout is explicit, local, previewable, and undoable. It never continuously reflows the whole graph.

## 7. Mapping and provenance UX

The canonical explanatory pipeline is:

```text
Source
  → Sample
  → Normalize
  → Smooth
  → Transform
  → Quantize / Threshold
  → Constrain
  → Target
```

Stages may repeat or be reordered in the graph, but each is explicit and versioned.

### 7.1 Required mapping states

The UI must disclose:

- source dimension, unit, domain, measurement/topology semantics;
- pointwise, causal-stateful, bounded-lookahead, or whole-window behavior;
- live versus frozen fitted statistics;
- missing/nonfinite-value policy;
- smoothing latency/state reset;
- quantization and tie policy;
- random stream and draw when a decision is stochastic;
- hard/soft constraint changes;
- raw mapped target versus final shaped target;
- clipping/coalescing/budget diagnostics.

### 7.2 “Why this event?”

Selecting an event should produce a structured trace:

```text
Source value / mathematical entity
        ↓
Sampling position and clock
        ↓
Normalization fit or live state
        ↓
Transforms and current values
        ↓
Quantization / random gate
        ↓
Constraint deltas
        ↓
Final logical musical target
        ↓
Audio realization and approximation record
```

The trace is data produced with evaluation, not prose reconstructed from rendered audio.

## 8. Evidence-aware design

Every scientific or mathematical statement in guided UI may carry one of:

- **Established**
- **Strong inference**
- **Engineering default**
- **Experimental**
- **Research gated**

These labels are not decorative badges. They determine copy, help text, study framing, and whether a preset may be described as validated.

Examples:

- Risset 2:1 log-tempo closure: established mathematical construction.
- `20 s`, `120 BPM`, `B=2`: engineering defaults; not universal perceptual optima.
- “3:2 strengthens the illusion”: experimental; must not be stated as fact.
- Penrose pentagrid/Q(phi) construction: accepted architecture grounded in research.
- Exact Penrose implementation: artifact-gated until fixture/oracle corpus is present.

## 9. Audio UX

Audio requires an explicit user activation. The transport cannot display “playing” until the backend is running.

Required visible diagnostics:

- audio disabled/enable action;
- backend state;
- reported base/output latency as estimates, separately;
- active plan generation;
- candidate/armed update during substantive edit when useful;
- interruption/route reconfiguration;
- budget/density approximation or rejection;
- global panic/stop always reachable.

Digital gain or a limiter must never be described as guaranteeing safe sound-pressure exposure.

## 10. Lab-specific amendments

### 10.1 Infinite Staircase

Explore shows:

- wrapped log-tempo ring/column as the primary phenomenon;
- local arrows showing every persistent layer accelerating or decelerating;
- dominant audible-band indication without asserting one perceived beat;
- canonical ratio/cycle/center controls;
- engineering-default evidence label;
- independent optional stages for subdivision, metric ambiguity, anchor, and pitch.

Inspect adds:

- unwrapped log-tempo view;
- rate, gain, source phase, layer index, and relabeling;
- source pattern and event trace;
- reset-reveal comparison;
- construction versus perceptual-validation status.

Never display one globally rising BPM number as though the complete composite literally has unbounded scalar tempo.

### 10.2 Penrose Sequencer

Until artifact recovery is complete, show:

- production construction accepted;
- default phase certificate status;
- exact versus projected data boundary;
- missing golden/oracle artifacts;
- non-authoritative preview label.

Once implemented, the canvas differentiates:

- canonical full rhombs;
- query core and halo;
- synthetic clip boundaries;
- exact tile/vertex/edge IDs;
- tile adjacency versus tiling-skeleton graph;
- validation scope and completeness.

Clipped fragments never appear as mathematical tiles or graph nodes.

### 10.3 Chaos and continuous mappings

Always label causal-live versus frozen-window behavior. A frozen normalizer must show its window/fit identity. Raw numerical trajectories and shaped musical output should be comparable without implying raw floating-point bit identity across backends.

## 11. Responsive web and native adaptation

### 11.1 Desktop web

Stable zones remain:

- browser/navigator at left;
- dominant canvas or timeline center;
- contextual Inspector right;
- timeline/mixer/graph in revealable bottom or focus regions.

### 11.2 iPad

Do not scale the desktop workspace. Use:

- one dominant work surface;
- revealable/resizable peripheral zones;
- dimension-driven adaptation rather than orientation branching;
- 44-point design targets for frequent touch actions, while respecting platform/accessibility rules;
- Pencil hover/squeeze/roll as optional accelerators only;
- keyboard/pointer/VoiceOver parity through the same semantic commands;
- one active audible project in the MVP process-wide audio policy.

### 11.3 iPhone

The stretch companion is not a miniature DAW. It supports:

- open/play/pause/stop;
- one lab canvas or guided experiment;
- primary parameters;
- compact Inspector/status;
- remote/control possibilities;
- share/export initiation and review.

Full graph/timeline authoring is excluded from the initial companion concept.

## 12. Accessibility release invariants

Every core workflow requires:

- keyboard access;
- non-drag alternative;
- visible focus distinct from selection;
- state conveyed by text/shape/icon as well as color;
- semantic ordered representation of canvas/graph information;
- accessible adjustable actions for parameters;
- reduced-motion behavior;
- equivalent representation for information carried only by pitch, loudness, timbre, space, or animation;
- predictable error recovery and no focus loss on async updates.

The design target is often larger than the minimum normative web target. Do not describe the 44-point touch target as a universal accessibility threshold.

## 13. Mockup acceptance additions

A mockup fails even if visually polished when it:

- treats workspaces as different project modes;
- flattens material kind and source status;
- shows generated notes as freely mutable without a conversion decision;
- conflates focus and selection;
- omits preview/evaluating/stale/error states;
- hides mapping stages or causal/frozen status;
- makes unsupported scientific claims;
- shows a global Risset BPM that rises forever;
- turns clipped Penrose fragments into topology;
- depends on drag, color, or motion alone;
- invents platform-only semantic state;
- places exact/domain evaluation in an audio-render callback concept.

## 14. Machine-readable design authority

The following manifests are normative companions:

- `design/tokens.json`
- `design/components.json`
- `design/interactions.json`
- `design/screens.json`

Their v0.3 semantic vocabularies must be used by generated mockups, React implementation, SwiftUI adaptation, and design critique.
