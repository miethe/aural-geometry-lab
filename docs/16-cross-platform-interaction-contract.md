# Cross-Platform Interaction Contract

**Status:** normative for MVP implementation  
**Scope:** web studio and future native Apple clients  
**Version:** 1

## 1. Why this contract exists

Aural Geometry Lab has several simultaneous views of the same underlying system: timeline, mathematical canvas, operator graph, inspector, mixer, and guided lab. These views must never become independent editors with subtly different meanings.

The project model is the source of truth. Surfaces project that model and emit commands against it. Selection is shared application state. Hover, transient drag previews, panel sizes, and local disclosure are view state.

## 2. State taxonomy

### Canonical project state

Serialized and deterministic:

- tracks and clips;
- operator graph;
- parameters;
- tempo/meter;
- seeds;
- lab state that changes generated output;
- frozen event snapshots;
- authored paths/geometry used by operators;
- assets;
- project-scoped mappings and constraints.

### Session state

Not required in the portable project:

- transport running/stopped;
- current audition time;
- selected entities;
- active focus surface;
- open inspector section;
- temporary A/B audition override;
- pending worker evaluation;
- device/MIDI connection status.

### View preference state

May be stored as optional per-project or app preference data, but never changes canonical musical output:

- panel widths;
- zoom/pan;
- graph viewport;
- timeline vertical scale;
- reduced-motion preference;
- preferred inspector density;
- last-opened lab guide step.

## 3. Entity identity

Every selectable semantic entity has a stable identity tuple:

```text
kind + id + optional projection path
```

Core kinds:

- project;
- track;
- clip;
- event;
- operator-node;
- operator-edge;
- geometry-object;
- geometry-element;
- mapping-stage;
- provenance-step;
- lab-step;
- asset.

A rendered glyph is not an entity unless it has independent semantics. For example, the glow around a selected Euclidean onset is a projection of the event, not a second selectable object.

## 4. Selection model

Selection contains:

- zero or one **primary** entity;
- zero or more ordered selected entities;
- an optional range anchor;
- the surface that most recently changed the selection.

Rules:

1. A single click/tap replaces selection.
2. Additive selection uses platform convention: Command/Ctrl-click on pointer platforms and explicit multiselect affordance on touch.
3. Shift selection extends a meaningful ordered range only on surfaces that define ordering.
4. Selecting one projection selects the semantic entity everywhere.
5. A surface may highlight related entities without adding them to selection.
6. Hidden selected entities remain selected unless a command explicitly clears them.
7. Deleting the primary selection promotes the most recently selected remaining entity.
8. Selection changes are not persisted into project history and do not dirty the project.

## 5. Linked highlighting

Three visual levels are distinct:

- **selected:** user-owned state;
- **related:** derived semantic relationship;
- **hover/focus preview:** transient view state.

Example: selecting a Fractal Motif event can produce:

- selected note in timeline;
- related ancestry path in recursion tree;
- related source operator in graph;
- related mapping stage in inspector.

Only the event is selected unless the user explicitly adds the ancestors.

## 6. Command model

Every canonical mutation is expressed as an explicit command with:

- command type and version;
- unique command ID;
- project ID;
- timestamp for audit/display only;
- deterministic payload;
- optional transaction ID;
- optional coalescing key;
- precondition version/revision;
- inverse or sufficient before-state to construct one.

Commands produce one of:

- committed project revision;
- rejected diagnostic;
- no-op result.

UI components do not mutate project objects directly.

## 7. Transactions and undo

A transaction is the unit of user intent, not the unit of pointer events.

Examples:

- dragging a Euclidean ring through 80 intermediate positions = one undo step;
- typing `13` into a pulse field = one undo step;
- drawing a Tonnetz path = one undo step when the gesture commits;
- connecting three graph edges manually = three steps unless created by one higher-level command;
- “freeze selection” = one step including snapshot creation and clip replacement.

During a drag, the UI may maintain a transient preview state. Only the committed final command enters project history.

## 8. Generated material lifecycle

### Live generated

Canonical source remains an operator/pattern. Timeline events are projections of current evaluation.

Properties:

- automatically changes when upstream inputs change;
- events expose provenance;
- individual event mutation is not directly legal.

### Frozen

A bounded query result becomes canonical event data while retaining a lineage reference to the generator revision that produced it.

Properties:

- upstream changes no longer alter the snapshot;
- individual edits are legal;
- lineage remains inspectable;
- “regenerate from source” creates a new snapshot rather than silently overwriting edits.

### Detached event edit

When the user tries to edit a single generated event, the product must ask or apply an explicit saved policy:

1. **Freeze region:** snapshot the containing region, then edit.
2. **Add downstream edit operator:** preserve live generation and express the exception as a transform.
3. **Cancel.**

There is no silent mutation of generated output.

## 9. Direct manipulation contract

A direct gesture must resolve to a canonical parameter or authored-input command.

Examples:

- rotating a Euclidean ring → `set-operator-parameter(rotation)`;
- moving a Tonnetz path vertex → `replace-path-point`;
- dragging a mapping curve point → `set-mapping-control-point`;
- changing a recursive branch in tree view → `set-grammar-branch`;
- picking a Penrose start tile → `set-traversal-start(tileId)`.

If a visual property has no canonical parameter, it is a view preference and must not affect audio.

## 10. Evaluation freshness

Each derived result carries:

- project revision;
- graph compilation revision;
- query interval;
- evaluation hash;
- operator versions;
- seed;
- cancellation token/generation ID.

A surface must not display a worker result as current if its revision/hash no longer matches current project state. Stale results may remain visually ghosted only if clearly marked and useful for comparison.

## 11. A/B comparison

A/B is an audition layer, not necessarily a project mutation.

Default behavior:

- A = committed project state;
- B = one temporary bypass/parameter override;
- switching is sample/time aligned when technically feasible;
- exiting comparison discards B unless user chooses **Apply B**;
- Apply B emits a normal command and becomes undoable.

## 12. Focus versus selection

Keyboard focus and semantic selection are separate.

- focus identifies which control receives keyboard input;
- selection identifies what the user is working on;
- focusing a selected entity should not clear multiselection;
- moving focus through graph nodes may preview them without selecting until platform convention indicates selection;
- assistive technologies receive both focus semantics and selected state.

## 13. Surface-specific ordering

Range selection requires an ordering definition:

- timeline: chronological within track, then stable event ID tie-break;
- track list: visual track order;
- graph: no implicit Shift-range unless a spatial navigation mode explicitly defines it;
- geometry: only when the mathematical object defines a natural traversal/order;
- inspector: not a selectable collection by default.

## 14. Responsive reduction

Changing viewport must never change project semantics.

When a surface is unavailable on compact layouts:

- selection is preserved;
- commands remain valid;
- hidden state is not destroyed;
- a compact summary can represent hidden surfaces;
- project files remain identical.

## 15. Cross-platform conformance

Web and native clients must agree on:

- project schema;
- rational JSON encoding;
- stable authored entity IDs;
- command payload semantics;
- selection entity identity;
- generated/frozen rules;
- seed semantics;
- operator versions;
- canonical event outputs for shared operators;
- export semantics where both platforms implement the export.

Visual layout and native gestures may differ.

## 16. Native Apple mapping

- React command store ↔ Swift document/view-model command dispatcher.
- Web selection store ↔ Swift observable selection model.
- IndexedDB/local package ↔ `FileDocument`/document package.
- Web Audio render plan ↔ AVAudioEngine render plan adapter.
- pointer/touch direct manipulation ↔ SwiftUI gestures and Apple Pencil.

## 17. Required tests

1. Selecting the same event through two projections yields the same selection key.
2. Add/remove/toggle selection normalization is deterministic.
3. A transient drag produces exactly one committed command.
4. Freeze retains upstream lineage metadata.
5. Editing live generated output cannot mutate a projected event in place.
6. Stale worker results are rejected by revision/hash.
7. A/B audition exits without dirtying the project unless applied.
8. Compact responsive state preserves selection.
9. Web and Swift decode the same conformance fixture identities.

