# UX Design Specification

> **Wave-1 authority note (2026-08-18):** Use the final UI/UX specification plus `19-ui-ux-wave1-integrated-amendment.md`; this earlier UX document remains historical context.


## 1. Experience objective

The user should encounter mathematical music in this order:

1. **hear/see a compelling phenomenon;**
2. **manipulate one meaningful variable;**
3. **compare a controlled alternative;**
4. **inspect the rule and mapping;**
5. **open the complete system and compose.**

The product must not begin as an empty node graph. It must also avoid becoming a collection of fixed toys with no path to deeper authorship.

## 2. Core layout

Desktop studio:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Project · Transport · Tempo/Meter · CPU/Audio status · Stop all     │
├───────────────┬───────────────────────────────────┬─────────────────┤
│ Lab/Project   │ Primary canvas                    │ Inspector       │
│ navigation    │ geometry / timeline focus         │ mapping/math    │
│               │                                   │ provenance      │
├───────────────┴───────────────────────────────────┴─────────────────┤
│ Timeline / tracks / compact mixer                                   │
├─────────────────────────────────────────────────────────────────────┤
│ Collapsible typed operator graph                                    │
└─────────────────────────────────────────────────────────────────────┘
```

Panels are resizable and save per project. A **Focus** command enlarges one surface without destroying linked selection.

## 3. Modes of depth

### Explore

- curated preset already loaded;
- large play/control affordances;
- one or two primary parameters;
- guided observation;
- advanced graph/timeline collapsed.

### Compose

- tracks/timeline/mixer visible;
- presets become editable project content;
- graph available;
- freeze/export workflows available.

### Inspect

- equation/rule;
- input/output values;
- mapping pipeline;
- step execution;
- provenance and diagnostics;
- controlled A/B comparison.

Modes are views over one project, not separate project types.

## 4. Direct manipulation

Every geometric gesture requires:

- visible affordance and current value;
- keyboard equivalent;
- constrained/snap behavior explained;
- undoable command;
- deterministic result;
- linked graph parameter state.

Examples:

- rotate Euclidean ring → updates `rotation` parameter;
- draw Tonnetz path → writes graph-path input data;
- drag Lorenz sampling marker → updates or seeks trajectory state;
- select Penrose traversal start → writes stable tile ID.

## 5. Mathematical inspector

The inspector separates six layers:

1. **Source** — mathematical object or musical input.
2. **Sampling** — when/where values are selected.
3. **Normalization** — how ranges become comparable.
4. **Mapping** — which mathematical dimension controls which musical dimension.
5. **Musical shaping** — smoothing, quantization, rhythm, scale, voicing.
6. **Constraints/output** — playable range, event/gain limits, final events.

Each layer has:

- summary sentence;
- live values;
- formula/rule where relevant;
- bypass/reset;
- selected-event explanation.

## 6. Guided experiment format

```text
Question
  “Can a rhythm keep accelerating without becoming infinitely fast?”

Prediction
  Optional user choice before playback

Setup
  Versioned preset and equipment guidance

Manipulation
  Toggle anchor / crossfade / layer count

Observation
  Prompt plus optional response capture

Explanation
  Visual/mathematical interpretation with limits

Open system
  Reveal the graph and continue composing
```

Guides must clearly distinguish observation from established scientific claim.

## 7. Timeline and generated material

Generated content is visually distinct from frozen/editable content:

- **live generated region:** linked to source graph and can change;
- **frozen clip:** canonical event snapshot with retained lineage;
- **manual edits:** either detach selected events or create a downstream edit operator—never silently mutate generator output.

The UI must make this choice explicit.

## 8. Provenance interaction

Selecting an event opens a compact explanation first:

> This note came from generation 3 of the motif, was transposed +7 semitones, quantized to D Dorian, and moved down one octave to stay within the cello range.

Expanding reveals:

- ancestry graph;
- operator versions and parameters;
- exact source state;
- constraints considered/rejected;
- event IDs and technical trace.

## 9. Error and budget UX

Do not show only “failed.” Examples:

- “Depth 8 would generate approximately 65,536 notes, above this project's 4,096-event limit. Reduce depth, increase time scaling, or freeze a smaller branch.”
- “This connection expects a note pattern but receives geometry. Add a traversal/mapping operator.”
- “MIDI is unavailable in this browser/context; playback and file export still work.”
- “The trajectory became non-finite at step 18,442. Reduce the integration step or reset parameters.”

Budget meters are visible before failure for recursion, events, geometry, and render load.

## 10. Accessibility

### Keyboard

- roving focus for rings/grids/graphs;
- arrow keys move among meaningful adjacent elements;
- direct numeric entry for all drag-based changes;
- shortcuts are discoverable and remappable where feasible.

### Screen readers

- canvas/3D views have synchronized semantic summaries and selection lists;
- dynamic playback announcements are rate-limited and optional;
- mathematical expressions have accessible text alternatives.

### Sensory alternatives

- color has shape/label redundancy;
- pitch-coded state has textual/numeric representation;
- stereo-coded state has position labels;
- audio pulse has visual/haptic-compatible indication;
- reduced motion freezes or simplifies animation while preserving state updates.

### Cognitive load

- one primary concept per guided step;
- defaults remain musical and safe;
- advanced parameters grouped by effect rather than implementation internals;
- reset and A/B comparison always nearby;
- no auto-playing audio.

## 11. Visual language

- Dark or neutral studio canvas with high-contrast mathematical traces.
- Geometry and music use consistent selection/link tokens.
- Avoid decorative pseudo-mathematical texture.
- Exact objects display a verification/evidence indicator in educational mode.
- Research-gated surfaces display a clear gate, not a disabled mystery control.
- Motion conveys phase, flow, recursion, or transformation only; it is never mandatory ornament.

## 12. Responsive posture

MVP authoring targets desktop/laptop. Smaller widths support:

- project playback;
- preset parameter changes;
- guided experiments;
- read-only inspection.

Complex graph/timeline authoring may require a minimum viewport and should say so directly rather than collapsing into an unusable interface.
