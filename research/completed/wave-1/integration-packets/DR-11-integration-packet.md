# Aural Geometry Lab — DR-11 Research Integration Packet

**Date:** 2026-08-18  
**Research report:** DR-11 — *Professional Music-Tool UX and Progressive Disclosure*  
**Charter date:** 2026-08-14  
**Research cutoff:** 2026-08-18  
**Integration disposition:** **Accept with architectural conditions**  
**Primary decision target:** `docs/13-ui-ux-final-design-spec.md`

## TL;DR

DR-11 supports an AGL studio organized around **one canonical project viewed through Explore, Compose, and Inspect workspaces**. Those workspaces should change layout emphasis, not editing permissions or object identity.

The most consequential integration requirement is a first-class procedural-material model. However, DR-11’s visible labels—Live Generated, Snapshot, Edited, and Stale—should **not** be serialized as one flat state enum. Material kind, source linkage, and source status are separate axes.

The UI graph must use the same port-type rules as the compiler, so invalid connections never enter canonical state. All result-affecting dependencies must enter the provenance model, even when they are not rendered as primary dataflow wires.

Direct manipulation, typed precision, keyboard actions, assistive-technology actions, and controller mappings must dispatch the same semantic commands. Continuous gestures must collapse into deterministic undo transactions.

Several numeric proposals in DR-11—44–48-point touch targets and the usability-success percentages—are useful initial engineering hypotheses, not externally validated thresholds. They should be calibrated rather than elevated into scientific facts.

---

## Evidence Posture

No new web research was performed for this integration pass. External findings are carried forward only as represented and qualified in DR-11. The AGL backlog, laboratory manifest, program plan, and research register are used as implementation context. 
The actual contents of `docs/13-ui-ux-final-design-spec.md` were not supplied and were not found during the original DR-11 run. Consequently, this packet defines **normative deltas and review criteria**, not a line-level patch.

### Classification vocabulary

| Label | Meaning in this packet |
|---|---|
| **Established evidence** | Normative standard or peer-reviewed evidence directly supporting the bounded claim. |
| **Observed product behavior** | Authoritative evidence that a product implements a pattern; not proof that the pattern is usable or optimal. |
| **Strong inference** | A defensible architectural conclusion assembled from evidence plus AGL’s existing constraints. |
| **Engineering recommendation** | A proposed AGL contract chosen to reduce risk or preserve consistency. |
| **Speculative possibility** | An option worth retaining, but not ready to govern architecture or product claims. |

---

# 1. Executive Decision Summary

| # | Conclusion | Disposition | Classification | Why |
|---:|---|---|---|---|
| 1 | Implement one canonical studio shell with **Explore, Compose, and Inspect** workspace presets. | **ADOPT** | Strong inference | Task-oriented views recur across professional tools, while AGL already requires timeline, graph, mathematical visualization, provenance, and linked selection over the same objects. Separate shells would duplicate state and exceed current staffing. |
| 2 | Workspaces alter layout emphasis, not semantic permissions. | **ADOPT** | Engineering recommendation, strongly supported | Hard capability modes reduce density but create mode-dependent operation availability. AGL’s representations are too interdependent for separate edit authorities. |
| 3 | Preserve one project state, one semantic command bus, one transport, one undo history, and one linked selection across all workspaces. | **ADOPT** | Engineering recommendation | This is necessary to make the workspaces projections rather than partially independent applications. |
| 4 | Treat linked selection as a shell-level architectural primitive, not a late convenience feature. | **ADOPT** | Strong inference | A selected event, graph node, mathematical primitive, parameter explanation, and provenance trace may denote aspects of one entity. Retrofitting stable cross-view identity would be expensive. |
| 5 | Introduce explicit procedural-material semantics: live-generated material, materialized snapshots, and edited derivatives. | **ADOPT WITH CONDITIONS** | Strong inference | The distinction is central to predictability and provenance, but the serialized taxonomy needs refinement before acceptance. |
| 6 | Do **not** model `Stale` as a peer of `LiveGenerated`, `Snapshot`, and `EditedDerivative`. | **ADOPT** | Architecture correction | Staleness is a source relationship, not an origin or editability class. A derivative can also diverge from its source, and a source may be missing or detached rather than merely stale. |
| 7 | Compute source status from a transitive **semantic dependency digest**, not from the whole project revision. | **ADOPT WITH CONDITIONS** | Engineering recommendation | Unrelated track, layout, or naming edits must not stale a snapshot. The digest algorithm and retained source recipe require schema/graph reconciliation. |
| 8 | Materialization must retain a resolvable source recipe or immutable source-subgraph snapshot, not only a hash. | **ADOPT WITH CONDITIONS** | Engineering recommendation | A hash proves identity but cannot reproduce or compare a historical result if the referenced graph revision is no longer available. |
| 9 | Materialized payloads never silently change when the source graph changes. | **ADOPT** | Strong inference | Silent regeneration breaks authorship expectations, reproducibility, undo reasoning, and deterministic export. |
| 10 | Editing a materialized snapshot creates an explicit edited derivative or explicit state transition with retained ancestry. | **ADOPT WITH CONDITIONS** | Engineering recommendation | DR-11 correctly identifies the boundary but does not decide whether identity is preserved or a new material object is created. New identity is recommended. |
| 11 | Use the canonical compiler/type-checker service for connection preview, edge creation, insertion, replacement, import validation, and keyboard graph editing. | **ADOPT** | Engineering recommendation | UI-specific compatibility logic would drift from executable graph semantics. Invalid edges must never enter normal canonical state. |
| 12 | Represent every result-affecting dependency in the causal/provenance model, even when it is not shown as a normal dataflow wire. | **ADOPT WITH CONDITIONS** | Strong inference | Hidden references undermine explanation and reproducibility. The graph model must distinguish execution edges, control dependencies, and provenance-only dependencies. |
| 13 | Use direct manipulation plus immediate access to exact numeric entry, deterministic keyboard nudge, reset, units, and domain-aware constraints. | **ADOPT** | Observed behavior plus limited HCI support | Multiple professional tools support this combination. Exact interaction details and sensitivity factors remain AGL design work. |
| 14 | Dispatch all input modalities through the same semantic command IDs. | **ADOPT** | Engineering recommendation | Pointer, touch, Pencil, keyboard, assistive technology, MIDI, and menu actions must not create subtly different project states. |
| 15 | Treat one continuous gesture as one semantic undo transaction. | **ADOPT WITH CONDITIONS** | Engineering recommendation | This is necessary for precise undo/redo and native/web parity, but must reconcile with AGL-012 and live preview behavior. |
| 16 | Make graph auto-layout explicit, local, previewable, and undoable; never continuously reflow the entire graph. | **ADOPT** | Strong inference | Edge crossings affect comprehension, but spatial grouping is also user-authored secondary notation. |
| 17 | Make keyboard operation, non-drag alternatives, non-color state cues, reduced motion, and semantic announcements release invariants. | **ADOPT** | Established evidence plus existing P0 commitment | WCAG requirements and AGL-132 support treating accessibility as architecture rather than a later alternate UI. |
| 18 | Recompose the iPad interface around one dominant surface and contextual panels rather than scaling the desktop layout. | **ADOPT WITH CONDITIONS** | Observed product behavior plus engineering recommendation | Logic Pro for iPad demonstrates feasibility, but exact native implementation must reconcile with the native-platform architecture run. |
| 19 | Use 44–48 logical points as a provisional design range for frequently manipulated touch controls. | **ADOPT WITH CONDITIONS** | Engineering hypothesis | The actual WCAG web minimum cited by DR-11 is 24×24 CSS pixels with conditions. The larger range is an AGL target that needs device testing. |
| 20 | Reject a conventional Compose-centered DAW shell, graph-first shell, hardware rack, or separate beginner application as the primary architecture. | **REJECT** | Product strategy recommendation | Each can exist as an optional layout or bounded metaphor, but none adequately serves AGL’s mathematical-first Explore path and shared object model. |
| 21 | Treat DR-11’s usability percentages as provisional study criteria, not release facts or industry benchmarks. | **DEFER** | Engineering hypothesis | The report explicitly says these targets require calibration. Only zero-invalid-edge, keyboard parity, non-drag parity, and non-color requirements are immediate conformance gates. |
| 22 | Defer detached panels, multiple configurable workspaces, marking-menu accelerators, and sophisticated auto-routing until the core shell is stable. | **DEFER** | Engineering recommendation | These offer expert value but are not prerequisites for P0 lab coherence. |
| 23 | Reconcile materialization with audio/render semantics before defining “freeze” as a public cross-platform command. | **REQUIRES CROSS-RUN RECONCILIATION** | Open dependency | DR-11 defines authorship semantics, not whether a frozen artifact is events, notes, controls, rendered audio, or a polymorphic material payload. |
| 24 | Reconcile parameter descriptors and control-signal semantics with the general sonification/mapping contract. | **REQUIRES CROSS-RUN RECONCILIATION** | Open dependency | Units, cyclicity, smoothing, quantization, causality, and constraints cannot be independently redefined by the UI layer. |
| 25 | Do not claim the final UX specification has been updated until the actual file is reviewed. | **DEFER** | Evidence boundary | DR-11 produced a required-delta list, not a verified diff. |

The core DR-11 recommendation and its acceptance criteria are consistent with existing AGL items for timeline and clips, typed graph editing, mathematical inspection, linked selection, freeze-to-clip, accessible descriptions, and the P0 accessibility baseline. 
---

# 2. Evidence → Decision Matrix

| Finding / evidence | Evidence strength | Engineering implication | Recommended decision | Confidence | Source(s) |
|---|---|---|---|---|---|
| Professional tools commonly expose the same domain objects through task-oriented views and configurable zones. | **High for product behavior; low for comparative usability** | AGL can vary layout without creating separate object models or files. | Use Explore, Compose, and Inspect as projections over shared state. | High | Bitwig, Logic, Dorico behavior summarized in DR-11. |
| Ableton maintains nonlinear performance state and linear arrangement state while explicitly communicating divergence. | **High for behavior** | AGL must visibly communicate when current generated behavior and retained timeline material differ. | Add source status and first-class Compare/Re-materialize actions. | High | Ableton behavior summarized in DR-11. |
| Contextual inspectors recur in Logic, Bitwig, and Dorico. | **High for behavior** | A single Inspector framework can manage density across nodes, clips, tracks, geometry, and provenance. | Adopt one selection-driven Inspector contract. | High | DR-11 evidence table. |
| Graph edge crossings materially affected comprehension in controlled abstract graph tasks. | **High but ecologically limited** | AGL should provide routing and local cleanup tools. | Adopt explicit local layout and route-selection commands; do not infer one universal layout. | Medium-high | Purchase studies, as qualified by DR-11. |
| No graph-layout algorithm is universally superior across tasks. | **High, task-dependent** | Global automatic layout should not be treated as objectively correct. | Preserve user layout; preview and undo automated changes. | High | Purchase 1998, as summarized in DR-11. |
| Visual programming can match problem structure while still suffering viscosity and weak secondary notation. | **High foundational evidence; older tool context** | A visual graph does not remove the need for insertion, replacement, grouping, navigation, and layout-preserving operations. | Make graph editing type-directed and refactoring-oriented. | High | Green and Petre, summarized in DR-11. |
| Smooth zoom and pan can preserve context in large 2D spaces. | **High general visualization evidence; not graph-editor-specific** | Graph navigation should transition spatially rather than teleport without orientation. | Add breadcrumbs, zoom-to-selection/source/dependents, and reduced-motion alternatives. | Medium | van Wijk and Nuij, summarized in DR-11. |
| Finger input creates precision and occlusion constraints; specialized interaction can reduce errors. | **High mechanism evidence; older hardware/task** | Tiny sockets and dense desktop controls are inappropriate for primary touch interaction. | Provide large semantic hit regions and non-drag connection paths. | High | Benko et al.; WCAG; DR-11. |
| WCAG 2.2 requires a non-drag pointer alternative for dragging functionality unless an exception applies. | **Normative** | Dragging may not be the only way to connect, move, resize, scrub, or arrange essential content. | Make non-drag alternatives a release gate. | Very high | WCAG 2.2 discussion in DR-11. |
| Logic iPad, Procreate, and VCV combine direct manipulation with exact entry. | **High for behavior** | Precision should escalate from tactile control to exact control without switching tools or models. | Adopt one type-aware parameter component family. | High | DR-11 comparative analysis. |
| Tweeq identifies compact footprint, multimodal input, speed, and precision as professional-control goals. | **Moderate/low validation strength** | Temporary precision overlays are promising but not proven as the sole AGL solution. | Prototype `PrecisionHUD`; validate before making its exact interaction universal. | Medium | 2025 Tweeq study; informal evaluation of five professionals. |
| Gesture feedforward can improve discovery of arbitrary gestures. | **High within studied interaction** | Expert accelerators should emerge from visible novice actions rather than be undocumented. | Use visible commands, shortcut labels, and contextual hints; gestures remain optional accelerators. | Medium-high | OctoPocus, summarized in DR-11. |
| Expert users may rely heavily on accelerators while returning to visible menus for memory refresh. | **Moderate, older case-study evidence** | Removing the visible command after teaching the shortcut would reduce recoverability. | Keep visible command surfaces and a command palette. | Medium | Kurtenbach and Buxton, summarized in DR-11. |
| Bitwig exposes procedural event behavior non-destructively and visibly. | **High for behavior** | Generated behavior can remain attached to content without requiring immediate conversion. | Support live-generated material as a first-class kind. | High | Bitwig behavior summarized in DR-11. |
| Logic requires an explicit conversion boundary before generated Session Player material receives note-level editing. | **High for behavior** | Event-level editing should not silently mutate a live generator result. | Create an explicit edited derivative. | High | Logic behavior summarized in DR-11. |
| Ableton distinguishes reversible freezing from committed bounce operations. | **High for behavior** | “Freeze” should not implicitly destroy the source or collapse all provenance. | Separate materialization from destructive detachment/export. | High | Ableton behavior summarized in DR-11. |
| VisTrails captured workflow evolution and provenance to support reproducibility and navigation. | **High research-system evidence; different domain** | A snapshot should retain both its output and the exact recipe or resolvable workflow state that produced it. | Add an immutable materialization receipt and source recipe reference. | Medium-high | VisTrails, summarized in DR-11. |
| Logic Pro for iPad supports touch, Pencil, keyboard, pointer, and VoiceOver in one professional shell. | **High for feasibility; not proof of AGL usability** | AGL does not need separate semantic products for each input modality. | Share commands and project semantics; adapt presentation and hit geometry. | High | Logic iPad behavior summarized in DR-11. |
| EyeHarp demonstrates accessible alternative musical interaction, but the cited evaluation used a small, mismatched participant sample. | **Limited** | It is a useful design reference but cannot validate AGL accessibility claims. | Require studies with relevant users before making population-level claims. | High | EyeHarp limitation recorded in DR-11. |
| AGL already plans typed graph validation, freeze-to-clip lineage, linked selection, accessible descriptions, and non-color accessibility. | **High program authority** | DR-11 is primarily a contract-strengthening run rather than a wholly new product direction. | Modify existing backlog items rather than creating parallel UX infrastructure. | Very high | AGL backlog. |

---

# 3. Architecture Consequences

| Affected subsystem | Exact architectural implication | Contract impact | Dependencies | Migration impact if delayed | Recommendation |
|---|---|---|---|---|---|
| **Canonical project model** | Material records need explicit material kind, source linkage, source status, lineage, and materialization receipts. | **Public serialized contract** | AGL-010, AGL-011, AGL-027 | **Very high.** Existing clips would need inference-based migration, and provenance may be irrecoverable. | Freeze the material model before project schema v1 is declared stable. |
| **Project revisions** | Project revision identity and semantic dependency identity must be distinct. | Internal and serialized references | Command bus, persistence, evaluator cache | High. Whole-project revision staleness would create false warnings and become embedded in saved projects. | Add source-closure semantic digests before implementing stale detection. |
| **Event/pattern model** | Materialized payloads must retain stable event identities or deterministic successor identities across save/reopen. | Public/internal domain contract | AGL-003, AGL-005, AGL-027 | High. Later stable-ID introduction would break selection, provenance, and diff fixtures. | Materialization must produce canonical event/pattern payloads with stable IDs. |
| **Rational musical time** | Materialization ranges must be exact, half-open rational intervals rather than floating timeline positions. | Public serialized contract | AGL-002, AGL-027 | High. Float-based snapshots could drift or disagree across platforms. | Use `[start, end)` exact rational ranges in every receipt and command. |
| **Typed operator graph** | The graph editor must call the same compatibility function used by compilation. | Internal API with visible behavior | AGL-021, AGL-022, AGL-034 | High. Duplicate UI rules would produce saved graphs that compile differently from previews. | Expose a pure compatibility/diagnostics API from the graph type system. |
| **Graph command model** | Edge creation, insertion, replacement, bypass, and compatible-node creation become validated semantic commands. | Internal command API | AGL-012, AGL-021, AGL-034 | Medium-high. Generic canvas operations would need replacement and migration of shortcuts/tests. | Define graph commands before building pointer-specific handlers. |
| **Causal dependency model** | Dataflow edges, control dependencies, asset references, parameter references, and provenance-only relationships need explicit categories. | Public/internal graph/provenance contract | AGL-020–024, AGL-035–036 | Very high if hidden dependencies already exist. Historical snapshots could not be explained reliably. | Introduce a typed causal-dependency closure used by evaluator, cache, provenance, and stale detection. |
| **Evaluation cache** | Cache keys and staleness checks should consume the same semantic dependency digest. | Internal deterministic contract | AGL-024 | Medium-high. Separate digest systems would disagree over whether content is current. | Define one canonical dependency-digest service. |
| **Worker/runtime execution** | Live preview, committed graph evaluation, materialization, and comparison must identify project revision and command generation. | Internal protocol | AGL-023, AGL-025 | Medium. Race conditions could let stale worker results overwrite current previews. | Tag evaluations with source digest, command generation, interval, and cancellation token. |
| **Command/undo architecture** | All semantic actions route through common commands; continuous gestures require begin/preview/commit/cancel transaction semantics. | Core internal API | AGL-012 | Very high. Retrofitting grouped undo across lab-specific gestures is expensive. | Extend AGL-012 before P0 direct-manipulation surfaces stabilize. |
| **UI session state** | Workspace, open panels, focus, selection, viewport, transport, and transient previews must be separated from semantic project state. | Internal/session persistence contract | AGL-030, persistence | Medium-high. Polluting project hashes and undo history with layout changes would undermine determinism. | Define `StudioSessionState` separately from `ProjectState`. |
| **Linked selection** | Every representable project entity needs a stable `SelectionRef`; projections resolve it without copying identity. | Internal cross-view contract | AGL-003, AGL-005, AGL-036, AGL-050 | Very high. Canvas-local selection IDs would later require rewriting all labs. | Make `SelectionRef` part of the shell foundation and visualization projection contract. |
| **Geometry subsystem** | Geometry primitives need stable entity references, semantic hit regions, accessible descriptions, and linked-selection mapping. | Internal projection contract | AGL-050, AGL-051, AGL-053 | High. Pixel-only hit testing would not support provenance, keyboard navigation, or Swift parity. | Extend projection primitives with semantic IDs and interaction descriptors. |
| **Parameter model** | Parameters require declared type, unit, domain, default, formatting, nudge policy, clamp/wrap/reject policy, and accessible semantics. | Public operator/internal UI contract | AGL-004, AGL-020, DR-08 reconciliation | Very high. UI-specific assumptions would diverge among labs and platforms. | Create a shared `ParameterSpec` contract before generalized inspectors. |
| **Control signals** | UI fields must not imply scalar semantics where the underlying parameter is cyclic, rational, vector, stochastic, causal, or bounded-lookahead. | Public/internal operator contract | DR-08, AGL-112 | High. Generic sliders would hide mathematical meaning and require breaking component changes. | Let operator/control-signal types choose the editing component and explanation. |
| **Realtime audio** | DR-11 does not alter audio-thread architecture, but live-generated content must only update through committed source revisions and accepted render generations. | Internal runtime behavior | DR-03, AGL-031, AGL-041–044 | Medium-high. Unbounded UI preview updates could cause audio churn or race conditions. | Reconcile preview/commit semantics with generation-based rendering. |
| **Offline rendering** | Materialized semantic payload and offline render input must be traceable to the same source receipt; byte-identical audio is not implied. | Export manifest/internal conformance | DR-03, AGL-041, AGL-045 | Medium. Later provenance attachment may not recover the exact source graph. | Carry materialization receipt IDs into render/export manifests. |
| **Realtime/offline equivalence** | The UX may claim source equivalence only at the canonical event/render-plan level accepted by the audio architecture, not necessarily waveform bit identity. | User-facing and test contract | DR-03 | High if UI labels promise more than backend conformance supports. | Define the exact equivalence layer before writing “same result” copy. |
| **Project persistence** | Snapshot payloads, source recipes, receipt hashes, lineage, and statuses require deterministic serialization and migrations. | Public file format | AGL-010, AGL-011, AGL-013, AGL-015 | Very high. Incomplete early formats could permanently lose provenance. | Include DR-11 fixtures in schema and package round-trip tests. |
| **Swift/native client** | Native UI must use the same material, command, parameter, and selection semantics while adapting layout and accessibility projection. | Cross-platform public/internal contract | Native architecture integration/DR-12 | Very high if Swift introduces platform-only project fields or command meanings. | Make native conformance consume shared fixtures; do not serialize native panel geometry as project semantics. |
| **WebAssembly/shared core** | DR-11 does not require WASM, but any shared core must expose semantic commands and type checks rather than UI widgets. | Internal boundary | Native/runtime architecture | Low if interfaces are settled; high if introduced before contracts. | Keep the contracts implementation-language-neutral. |
| **MIDI/controller input** | Controller mappings should resolve to command/parameter IDs and canonical values rather than mutate audio/UI state directly. | Internal mapping contract | AGL-048, parameter contract | Medium. Direct audio mutations would be difficult to undo, persist, or reproduce. | Route controller input through semantic commands where it changes project state. |
| **MIDI export** | Export should distinguish materialized current payload from live generator semantics; provenance requires an AGL manifest or sidecar because standard MIDI cannot carry the full model. | Export contract | AGL-130 | Medium. Users may assume exported MIDI remains live-linked. | Export the selected material state and record source receipt in an AGL export manifest. |
| **MusicXML export** | As with MIDI, note-level output represents a materialized/edited result rather than the executable source graph. | Export contract | AGL-131 | Medium | Surface the conversion boundary and preserve receipt references outside MusicXML when necessary. |
| **Accessibility architecture** | Command inventories, semantic roles, state descriptions, focus movement, announcements, and non-drag alternatives must exist from first implementation. | Public behavior/release contract | AGL-132 | Very high. Retrofitting semantics to canvas-local gestures is costly and incomplete. | Add accessibility acceptance to each component, not only a final audit. |
| **Design system** | Runtime semantic states and visual tokens must be distinct. State is not defined by color or token value. | Internal design-system contract | `docs/13...`, AGL-132 | Medium-high | Define component state APIs first; bind palette, icon, pattern, and stroke tokens afterward. |

The architecture consequences reinforce existing M1 requirements for deterministic project round-trip and provenance, M2 requirements for P0 rhythm-lab acceptance, and M6 requirements for accessibility and representative-user validation.

---

# 4. Proposed ADRs

## ADR-UX-001: Semantic Multi-Workspace Studio Shell

**Context**

AGL’s project entities appear in musical time, executable graphs, mathematical geometry, audio behavior, and provenance. Professional tools commonly manage density through task-oriented views and revealable contextual zones, but product documentation does not establish that any one arrangement is empirically optimal. AGL’s existing backlog nevertheless requires the same entities to participate in timeline, graph, Inspector, visualization, and provenance workflows.

**Decision**

Implement one studio shell with three layout presets:

- **Explore:** mathematical object, direct manipulation, immediate sound, constrained primary controls.
- **Compose:** timeline, clips, tracks, mixer, reusable material.
- **Inspect:** typed graph, equations, live values, evaluation stages, diagnostics, and provenance.

Workspace changes may alter visible panels, viewport, and layout emphasis. They must not change semantic project identity, command availability, material identity, transport state, undo stack, or linked selection.

Any core panel may be revealed from any workspace.

**Alternatives considered**

- Compose-centered DAW shell.
- Graph-centered application.
- Capability-restricting modes.
- Separate beginner and expert applications.
- Seven lab-specific shells.

**Consequences**

- Requires a disciplined separation between project state and session/layout state.
- Reduces duplicated UI infrastructure.
- Allows each laboratory to provide a customized Explore projection without changing product semantics.
- Increases shell complexity relative to hard modes because capabilities remain available across workspaces.

**Risks**

- Users may still experience “view tax” if transitions or panel defaults are poor.
- Allowing all panels everywhere can recreate excessive density without sensible presets.
- Layout persistence may become platform-specific.

**Evidence**

Observed multi-view/product-zone patterns in Ableton, Bitwig, Logic, Dorico, and Max; existing AGL linked-selection and shared-project requirements. 
**Confidence**

**High** for the shared-shell architecture; **medium** for exact panel arrangements.

---

## ADR-UX-002: Canonical Procedural Material, Materialization, and Source-Status Model

**Context**

DR-11 proposes Live Generated, Snapshot, Edited Derivative, and Stale states. The first three describe material origin or editability; `Stale` describes whether retained output still corresponds to current source semantics. Source deletion and explicit detachment are not covered by `Current | Stale`. The report also alternates among “freeze,” “materialize,” “snapshot,” and “commit,” without establishing one canonical operation name.

**Decision**

Represent the canonical model using separate axes:

```text
MaterialKind =
    UserAuthored
  | LiveGenerated
  | Snapshot
  | EditedDerivative

SourceStatus =
    NotApplicable
  | Current
  | Changed
  | Missing
  | Detached
```

A user-facing label may combine the axes, such as `SNAPSHOT · SOURCE CHANGED`.

Use **Materialize Range** as the internal command name until user testing selects the public label. Materialization:

1. evaluates an exact half-open interval;
2. creates an independent canonical payload;
3. creates an immutable materialization receipt;
4. retains a resolvable source recipe or immutable source-subgraph snapshot;
5. preserves the live generator;
6. never silently updates the materialized payload.

Editing a snapshot creates an `EditedDerivative` with a new stable material ID and parent snapshot reference.

**Alternatives considered**

- One flat four-value enum.
- Whole-project revision equality for freshness.
- Destructive “freeze.”
- Hash-only provenance.
- Automatically mutating the snapshot after source changes.

**Consequences**

- Schema and migrations become more complex.
- Source status can be computed accurately and presented consistently.
- Edited derivatives can remain linked to their ancestry.
- Re-materialization produces an explicit successor rather than historical overwrite.

**Risks**

- Retaining source recipes may increase project-package size.
- A source recipe reference is unreliable unless historical graph revisions are guaranteed durable.
- Users may find five source-status values too diagnostic if all are always visible.

**Evidence**

Logic conversion boundaries, Ableton freeze/bounce distinction, Bitwig non-destructive operators, and VisTrails provenance provide behavioral and research precedents; the exact AGL schema is an engineering recommendation.

**Confidence**

**High** that the distinctions are required; **medium-high** for the proposed schema names.

---

## ADR-UX-003: Type-Directed Graph Editing Uses the Executable Type System

**Context**

AGL-021 already requires invalid graph edges to be rejected before evaluation, and AGL-034 requires a validated, keyboard-operable graph. A generic node canvas that performs separate UI validation would duplicate and eventually diverge from compiler semantics.

**Decision**

Expose a pure graph compatibility service used by:

- edge preview;
- edge commitment;
- keyboard connection;
- node insertion into an edge;
- compatible-node creation;
- node replacement;
- import/migration diagnostics;
- graph compilation.

An incompatible target remains visible for orientation but cannot become a committed edge. The UI must provide a structured reason, such as:

```text
Expected: AudioSignal
Received: Pattern<Trigger>
No implicit conversion is available.
```

Conversions must be explicit operator nodes or explicitly declared safe conversions in the type system.

**Alternatives considered**

- Accept any edge and show an evaluation error later.
- UI-only port-family colors.
- Implicit coercions not represented in the graph.
- Hardware-modular permissiveness.

**Consequences**

- Invalid edges cannot enter ordinary canonical project state.
- Type-system changes automatically propagate to UI behavior.
- Graph components depend on domain services rather than visual heuristics.

**Risks**

- Compatibility queries must remain responsive in large graphs.
- Overly strict typing could block creatively useful transforms unless explicit adapters are available.
- Importing future or partially invalid projects needs a quarantine/diagnostic path rather than silent deletion.

**Evidence**

TouchDesigner and Max product patterns; AGL’s existing port-checker requirement; preventive-error design inference from DR-11.

**Confidence**

**Very high**.

---

## ADR-UX-004: Unified Parameter Specification and Modality-Independent Commands

**Context**

DR-11 strongly favors direct manipulation plus exact entry, keyboard nudge, reset, units, and coarse/fine interaction. It does not justify universal step sizes, sensitivity multipliers, range policies, or a generic slider for every mathematical domain.

**Decision**

Each editable parameter declares a versioned `ParameterSpec` containing at least:

```text
parameterId
valueType
unit / dimension
domain
defaultValue
displayFormat
parseFormat
stepPolicy
precisionModes
snapPolicy
outOfRangePolicy
cyclicity
accessibleName
accessibleDescription
```

Pointer, touch, Pencil, keyboard, menu, command-palette, assistive-technology, and MIDI/controller input resolve to the same semantic command:

```text
SetParameter(targetId, parameterId, canonicalValue)
```

A continuous gesture uses an interactive transaction:

```text
begin → preview* → commit
              ↘ cancel
```

Only the committed value creates a semantic project revision and normal undo unit.

**Alternatives considered**

- Per-component mutation logic.
- Device-pixel deltas serialized as parameter changes.
- Universal floating-point slider.
- Every pointer-move becoming a separate undo operation.
- MIDI/controller updates bypassing the command bus.

**Consequences**

- Cross-platform behavior can be fixture-tested.
- Inspectors and lab projections can share control semantics.
- Exact values remain canonical while display formatting is locale-sensitive.
- Raw interaction sampling remains ephemeral.

**Risks**

- `ParameterSpec` overlaps with operator and sonification type systems.
- Some live-performance controls may require high-rate runtime modulation rather than project-edit commands.
- Preview scheduling must not overload graph evaluation or audio rendering.

**Evidence**

Observed behavior in Logic iPad, Procreate, VCV Rack; limited Tweeq evidence; DR-11 design rules.

**Confidence**

**High** for command unification; **medium** for the exact descriptor fields.

**Cross-run condition**

Must reconcile with DR-08’s unit, control-signal, causality, normalization, and constraint semantics before the serialized contract is frozen.

---

## ADR-UX-005: Global Selection References and Projection Identity

**Context**

AGL-036 requires event, node, geometry, and provenance selections to cross-highlight. Lab-local canvas IDs cannot reliably support this across serialization, undo, worker evaluation, and native/web implementations.

**Decision**

Define a canonical session-level reference:

```text
SelectionRef {
  entityType;
  stableEntityId;
  optionalSubentityId;
  optionalTimeContext;
}
```

Each projection declares whether and how it resolves a `SelectionRef`. Selection is session state, not semantic project content and not a normal undoable edit.

Workspace switching preserves the primary selection. Secondary linked highlights derive from it and do not replace it.

**Alternatives considered**

- Independent selection per panel.
- Coordinate-based selection.
- Serializing selected object as project semantics.
- UI component pointers or object references.

**Consequences**

- Event-to-node-to-geometry-to-provenance navigation becomes reliable.
- Selection can survive workspace changes and project save/reopen when desired.
- Visual and accessibility projections share identity.

**Risks**

- One entity may map to many generated events or geometric primitives.
- Deleted or migrated entities require graceful unresolved-selection handling.
- Massive generated sets require aggregation rather than one selectable object per primitive.

**Evidence**

Contextual Inspector conventions and AGL’s explicit linked-selection requirement.

**Confidence**

**Very high**.

---

## ADR-UX-006: Explicit Causal Dependencies and Provenance Closure

**Context**

Node environments may contain references or implicit dependencies that are not visible as ordinary wires. DR-11 correctly warns that a result changing for an invisible reason would undermine AGL’s Inspect and provenance claims.

**Decision**

The runtime graph maintains typed dependency relationships:

```text
Dataflow
Control
ParameterReference
AssetReference
TemporalDependency
ProvenanceOnly
```

Every dependency capable of changing an operator’s output participates in:

- topological/evaluation planning where relevant;
- cache invalidation;
- source semantic digest;
- provenance trace;
- stale/source-status computation;
- Inspector explanation.

The primary graph may visually suppress some dependency categories by default, but Inspect must expose them through trace overlays or dependency views.

**Alternatives considered**

- Only visible data wires count as dependencies.
- Script or parameter references remain outside graph semantics.
- A separate provenance system reconstructs dependencies after execution.

**Consequences**

- Cache, stale detection, explanation, and evaluation share one causal model.
- Primary graphs can stay readable without becoming epistemically incomplete.
- Provenance becomes executable state rather than decorative metadata.

**Risks**

- Dynamic or script-discovered dependencies may be difficult to enumerate.
- Overly broad dependency closure can cause unnecessary invalidation.
- Visual distinction among dependency categories could become cluttered.

**Evidence**

TouchDesigner warning pattern plus AGL provenance and deterministic-evaluation requirements.

**Confidence**

**High** for the requirement; **medium** for the final edge taxonomy.

---

## ADR-UX-007: Graph Layout Is User-Authored Nonsemantic State

**Context**

Graph readability research supports reducing crossings but does not establish one universally best layout. Spatial placement also provides secondary notation and learned navigation context.

**Decision**

Node position, grouping, viewport, and routing are persisted as presentation state but excluded from graph evaluation and semantic output hashes.

Automated layout must be:

- explicitly invoked;
- scoped to a selection, group, or bounded subgraph;
- previewable;
- cancellable;
- undoable;
- prohibited from continuously reflowing the whole graph.

Graph navigation includes breadcrumbs, fit, zoom to selection/source/dependents, and temporary causal trace overlays.

**Alternatives considered**

- Continuous global force layout.
- No automated layout assistance.
- Layout positions included in semantic graph identity.
- Teleport-only navigation.

**Consequences**

- Users retain spatial memory.
- Layout edits do not invalidate evaluation caches.
- Refactoring and cleanup remain available.

**Risks**

- Poor user layouts can still become difficult to understand.
- Local layout can increase crossings outside the selected boundary.
- Smooth motion needs a reduced-motion alternative.

**Evidence**

Purchase graph-layout studies, Green and Petre secondary notation, and smooth-zoom research as qualified by DR-11.

**Confidence**

**Medium-high**.

---

## ADR-UX-008: Accessibility and Input Parity Are Command-Level Release Contracts

**Context**

DR-11 and AGL-132 require keyboard operation, focus, semantics, reduced motion, and non-color cues. WCAG 2.2 requires non-drag alternatives in applicable web interactions. Product precedents demonstrate feasibility but do not themselves prove AGL accessibility.

**Decision**

Every core semantic command must have:

- a keyboard-accessible path;
- an accessible name and state;
- a non-drag pointer path where dragging is otherwise offered;
- status/error announcements;
- non-color state representation;
- reduced-motion behavior that preserves information.

Pointer, touch, Pencil, keyboard, assistive technology, and controller adaptations may differ in interaction mechanics, but they invoke the same command IDs and canonical values.

At least two non-color channels must distinguish live-generated, snapshot, edited, changed-source, valid/invalid, and primary/linked selection states where those distinctions are simultaneously relevant.

**Alternatives considered**

- Simplified separate accessible application.
- Keyboard support after visual implementation.
- Color-only state systems.
- Drag-only graph editing.
- Gesture-only expert actions.

**Consequences**

- Accessibility influences component and command design from inception.
- Cross-platform conformance can test semantic parity rather than pixel equality.
- Visualizations need aggregated semantic representations.

**Risks**

- “Core operation” must be inventoried explicitly.
- A technically complete keyboard path may still be inefficient or confusing.
- Human validation with relevant users remains necessary.

**Evidence**

WCAG requirements, product feasibility examples, AGL-132, and DR-11’s caution around EyeHarp evidence. 
**Confidence**

**Very high** for the architecture; human usability confidence remains unestablished.

---

# 5. Mathematical / Behavioral Contracts

## 5.1 Canonical material contract

The following is an **engineering recommendation derived from DR-11**, not a structure directly validated by the cited products.

```ts
type MaterialKind =
  | "user-authored"
  | "live-generated"
  | "snapshot"
  | "edited-derivative";

type SourceStatus =
  | "not-applicable"
  | "current"
  | "changed"
  | "missing"
  | "detached";

interface MaterialRecord {
  id: StableId;
  kind: MaterialKind;
  payloadRef: ContentRef;
  parentMaterialId?: StableId;
  sourceLink?: MaterialSourceLink;
  createdByCommandId: StableId;
}

interface MaterialSourceLink {
  generatorNodeId: StableId;
  materializationReceiptId?: StableId;
  sourceStatus: SourceStatus;
}
```

### Required invariants

1. `user-authored` normally has `sourceStatus = not-applicable`.
2. `live-generated` has a source link and is recomputed from committed source semantics.
3. `snapshot` has an independent payload and a materialization receipt.
4. `edited-derivative` has a parent material or source receipt and permits event-level mutation.
5. `changed`, `missing`, and `detached` do not mutate the retained payload.
6. Source status must not be inferred from visual appearance.
7. The same material ID must denote the same canonical material across all workspaces.
8. Workspace transitions do not clone or convert material.

## 5.2 Materialization receipt

```ts
interface MaterializationReceiptV1 {
  schemaVersion: 1;
  receiptId: StableId;
  materialId: StableId;

  source: {
    generatorNodeId: StableId;
    graphRevisionId: StableId;
    semanticDependencyDigest: Hash;
    sourceRecipeRef: ContentRef; // Must remain resolvable.
    operatorVersions: OperatorVersionRef[];
    seed?: Seed;
    evaluationPolicyVersion: string;
  };

  interval: {
    start: RationalTime;
    end: RationalTime; // Half-open [start, end)
  };

  output: {
    payloadType: string;
    payloadHash: Hash;
  };

  commandId: StableId;
  parentMaterialId?: StableId;

  createdAt?: IsoTimestamp; // Audit field; excluded from semantic hashes.
}
```

### Receipt rules

- `start < end`.
- The interval is interpreted as `[start, end)`.
- `payloadHash` is calculated from canonical serialized semantic payload, not UI rendering.
- `createdAt`, panel state, selection, and viewport do not participate in the semantic hash.
- `sourceRecipeRef` must resolve after save/reopen and after subsequent source edits.
- If historical graph revisions are not durable, the source recipe or minimal source closure must be embedded.
- A hash without retrievable content is evidence of identity, not reproducibility.
- Operator and evaluator semantic versions must be sufficient to interpret the source recipe.
- A materialization command is atomic: either payload and receipt both commit, or neither commits.

## 5.3 Source semantic digest

Let:

- \(G\) be the current canonical project graph;
- \(n\) be the generator node;
- \(I=[a,b)\) be the exact evaluation interval;
- \(s\) be the explicit seed set;
- \(V\) be all relevant operator semantic versions;
- \(P\) be evaluation policies that can change output;
- \(C(G,n)\) be the transitive semantic dependency closure of \(n\).

Define:

\[
D(G,n,I,s,V,P)
=
H\left(
\operatorname{CanonicalSerialize}
\left(
C(G,n), I, s, V, P
\right)
\right)
\]

For material \(m\) with stored receipt digest \(D_m\):

\[
\operatorname{SourceStatus}(m,G)
=
\begin{cases}
\text{Missing}, & \text{if the source cannot be resolved}\\
\text{Detached}, & \text{if active comparison was explicitly severed}\\
\text{Current}, & D_m = D(G,n,I,s,V,P)\\
\text{Changed}, & D_m \ne D(G,n,I,s,V,P)
\end{cases}
\]

### Digest invariants

- Node positions, panel layout, track color, viewport, selection, and unrelated project edits do not alter \(D\).
- Any parameter, input, asset, seed, operator semantic version, control dependency, or evaluation policy capable of changing output must alter \(D\).
- Reverting all relevant source semantics to their previous values restores `Current`.
- Changing the source and changing it back must not permanently mark the material changed merely because a project revision counter advanced.
- Digest equality establishes semantic source correspondence under the accepted canonicalization contract; it does not prove audio waveform bit identity across arbitrary backends.

## 5.4 Material state transitions

| Command | Preconditions | Result | Source payload behavior | Undo |
|---|---|---|---|---|
| `CreateLiveGenerated` | Valid generator and output binding | New `live-generated` material | Follows committed source revisions | Removes material/binding |
| `MaterializeRange` | Valid generator, exact nonempty interval, evaluation succeeds | New `snapshot` plus receipt | Independent immutable baseline payload | Removes snapshot/receipt; generator remains |
| `EditSnapshot` | Snapshot exists and edit is valid | New `edited-derivative` with parent snapshot | Snapshot unchanged | Removes derivative and restores selection |
| `EditDerivative` | Derivative exists | Updates derivative through ordinary event commands | Source and parent unchanged | Exact inverse command |
| `SourceChange` | Committed graph edit | Live material recomputes; linked retained materials may become `changed` | Snapshot/derivative payload unchanged | Reverts source; status recomputed |
| `ReMaterialize` | Source resolvable | New successor snapshot and receipt | Previous snapshot retained unless explicitly removed in same transaction | Restores previous material set |
| `KeepChanged` | Source status `changed` | Records acknowledgement only | Must remain `changed`; must not be relabeled `current` | Removes acknowledgement |
| `Detach` | Source-linked retained material | Source status becomes `detached`; historical receipt remains | Payload unchanged | Restores active source comparison |
| `DeleteSource` | Deletion command valid | Linked retained material becomes `missing` | Payload unchanged | Restores source and status |

**Important correction:** the report’s suggested `Keep` action must not silently convert a changed source relationship into `Current`. “Keep” means retain the artifact despite divergence.

## 5.5 Workspace invariants

Let \(P\) be canonical project state, \(S\) session state, and \(W_x\) a workspace change.

\[
\operatorname{SemanticHash}(W_x(P,S).P)
=
\operatorname{SemanticHash}(P)
\]

Workspace switching must preserve:

```text
project ID
project revision
material IDs
primary SelectionRef
transport position/state
semantic undo/redo stacks
active evaluation generation
```

Workspace switching may change:

```text
panel visibility
panel sizes
viewport
focus target
density preset
context detail surface
```

Workspace changes and ordinary selection changes should use a navigation/session history, not semantic undo.

## 5.6 Graph compatibility contract

For output port \(o\) and input port \(i\):

\[
\operatorname{CommitEdge}(o,i)
\text{ is permitted iff }
\operatorname{Accepts}(\operatorname{Type}(o), \operatorname{Type}(i))
\]

Required invariants:

```text
UI compatibility preview == compiler compatibility result
keyboard connection filter == pointer connection filter
import validation uses the same relation
no implicit conversion unless represented by the type system
no incompatible edge enters normal canonical project state
```

A structured incompatibility result should contain:

```ts
interface CompatibilityDiagnostic {
  sourceType: PortType;
  targetType: PortType;
  accepted: false;
  reasonCode: string;
  humanExplanation: string;
  compatibleAdapterOperatorIds?: string[];
}
```

## 5.7 Layout/evaluation independence

For graph semantics \(G\) and two layout states \(L_1,L_2\):

\[
\operatorname{Evaluate}(G,L_1)
=
\operatorname{Evaluate}(G,L_2)
\]

and:

\[
\operatorname{SemanticGraphHash}(G,L_1)
=
\operatorname{SemanticGraphHash}(G,L_2)
\]

Layout commands may alter a presentation-state hash but never the semantic graph hash, render-plan identity, or material source digest.

## 5.8 Parameter command equivalence

Let \(M\) be an input modality and \(v\) the same canonical parameter value. For any supported modalities \(M_1,M_2\):

\[
\operatorname{Apply}(P,\operatorname{SetParameter}_{M_1}(v))
=
\operatorname{Apply}(P,\operatorname{SetParameter}_{M_2}(v))
\]

The modality may affect how \(v\) is selected, but not the resulting project state.

### Interactive transaction invariant

For raw interaction samples \(r_0,\ldots,r_k\):

```text
begin(oldValue)
preview(r0)
...
preview(rk)
commit(newValue)
```

must produce one semantic undo unit:

\[
\operatorname{Undo}(\operatorname{Commit}(P,old,new)) = P
\]

A cancelled transaction produces no semantic project revision.

## 5.9 Parameter-domain requirements

No universal step or sensitivity is justified by DR-11. Each parameter type must explicitly define its policy.

| Type | Required semantics |
|---|---|
| Rational time | Exact numerator/denominator storage; normalization; no float round-trip in project state |
| Integer count | Integral steps; declared min/max; reject or clamp policy |
| Scalar real | Unit, finite-domain handling, precision/display rules |
| Probability | Declared representation and bounds; normally \([0,1]\), but policy must be explicit |
| Phase/angle | Declared cycle and wrap semantics; no linear endpoint ambiguity |
| Seed | Integer/string seed domain; changes must be explicit and provenance-bearing |
| Enum | No meaningless scrub interaction; searchable/keyboard selection |
| Vector | Component and aggregate edits must be distinguishable |
| Tempo/rate | Unit and coordinate system visible; linear and logarithmic editing must not be conflated |

## 5.10 Accessibility behavior

Hard contracts:

```text
100% of designated core commands have keyboard paths
100% of essential drag operations have non-drag pointer alternatives
0 critical states rely on color alone
all state-changing errors are programmatically announced
reduced motion preserves state and navigation comprehension
```

The precise visual treatment—icon, badge, pattern, stroke, text—is a design-system choice. The requirement is redundant semantic communication, not a particular snowflake or hatch.

## 5.11 Realtime/offline boundary

DR-11 does **not** establish numerical audio tolerances or waveform equivalence. The supported contract is narrower:

- materialization produces a canonical semantic payload and receipt;
- realtime and offline paths consume the accepted canonical event/render-plan semantics;
- provenance IDs survive both paths;
- UI copy must not promise bit-identical output unless DR-03’s backend contract establishes it;
- source status is determined above the audio backend.

This remains a cross-run dependency.

---

# 6. Test Oracle and Fixture Pack

## 6.1 Unit invariants

| Test | Input | Expected behavior/output | Tolerance | Why it matters | Research basis |
|---|---|---|---|---|---|
| Workspace semantic neutrality | Project open in Explore; switch Compose → Inspect → Explore | Same semantic project hash, material IDs, undo stack, transport state, and primary selection | Exact | Proves workspaces are views, not modes with independent state | DR-11 shell ADR. |
| Invalid edge rejection | `Pattern<Trigger>` output to `AudioSignal` input | `accepted=false`; no edge command committed; structured explanation returned | Exact | Prevents impossible state rather than deferring error | DR-11 graph rules. |
| Valid edge acceptance | `Pattern<Trigger>` output to compatible pattern input | One edge added with stable edge ID | Exact | Confirms UI and compiler path agree | Same |
| UI/compiler checker identity | Run compatibility query through UI service and compiler validation | Same result and reason code | Exact | Detects duplicated logic | AGL-021/034 + DR-11 |
| Materialization preserves source | Materialize `[0/1, 2/1)` from generator | Snapshot and receipt created; live source remains | Exact | Prevents destructive freeze semantics | DR-11 generated-material rules. |
| Snapshot payload stability | Change a relevant source parameter after materialization | Snapshot payload hash unchanged; status becomes `changed` | Exact | Proves no silent regeneration | Same |
| Unrelated edit neutrality | Change track label, color, viewport, or unrelated node | Source status remains `current` | Exact | Prevents whole-project-revision false positives | Engineering correction |
| Source restoration | Change source parameter, then restore exact prior value/version | Status returns to `current` | Exact digest equality | Verifies semantic rather than historical revision comparison | Engineering recommendation |
| Missing source | Delete generator node while retaining snapshot | Payload retained; status becomes `missing` | Exact | Distinguishes missing from changed | Schema correction |
| Detach | Execute explicit detach command | Payload and historical receipt retained; status becomes `detached` | Exact | Prevents provenance destruction | Engineering recommendation |
| Edit snapshot | Apply note/event edit to snapshot | New derivative ID; parent snapshot unchanged | Exact | Makes conversion boundary auditable | DR-11/Logic precedent |
| One gesture, one undo | 200 preview samples followed by one commit | One undo restores exact pre-gesture semantic hash | Exact | Prevents unusable undo history | DR-11 unified-command inference |
| Cancel gesture | Begin and preview parameter interaction, then cancel | No semantic revision or undo entry | Exact | Separates preview from authorship | Engineering recommendation |
| Modality equivalence | Set the same value by pointer, keyboard, typed entry, and accessibility action | Identical canonical project state | Exact | Enables cross-input parity | DR-11 precision contract |
| Layout/evaluation independence | Move nodes and reroute visual edges without semantic changes | Identical graph semantic hash and evaluation result | Exact | Preserves determinism and cache validity | Graph-layout evidence |
| Selection projection | Select event with known source node and geometry primitive | Same stable entity relation resolves in all available projections | Exact IDs | Proves linked selection is not visual coincidence | AGL-036/DR-11 |
| Non-color state semantics | Disable color styles in component test renderer | State remains identifiable from semantic label and at least two non-color channels | Exact presence; visual review | Enforces accessibility architecture | DR-11 UX-R13/22 |
| Status announcement | Attempt invalid connection by keyboard and pointer | Equivalent accessible error announcement | Exact reason code; platform text may differ | Prevents visual-only error communication | WCAG/accessibility rules |

## 6.2 Property-based tests

| Property | Generated input | Required property |
|---|---|---|
| **No incompatible canonical edges** | Random valid port-type catalog and random connection attempts | Every committed edge satisfies the canonical `Accepts` relation. |
| **Undo/redo involution** | Random valid semantic command sequence | Undo all commands restores the starting semantic hash; redo restores the final semantic hash. |
| **Materialization determinism** | Random deterministic source graph, seed, and exact interval | Same source closure, versions, seed, and interval produce byte-equivalent canonical payload and identical payload hash. |
| **Relevant-change sensitivity** | Random mutation of any dependency in the source closure | Semantic dependency digest changes unless the mutation normalizes to identical semantics. |
| **Irrelevant-change immunity** | Random mutation outside the source closure or in presentation state | Semantic dependency digest remains unchanged. |
| **Layout invariance** | Random node positions, groups, viewport, and edge routes | Evaluation and semantic graph hash remain unchanged. |
| **Modality equivalence** | Random canonical values representable through multiple input paths | Every modality produces the same final canonical value and command payload. |
| **Transaction atomicity** | Random preview sample sequence and cancellation/commit choice | Cancel creates no revision; commit creates exactly one undoable semantic revision. |
| **Selection stability** | Random workspace and panel transitions | Primary `SelectionRef` remains the same until the selected entity is deleted or selection explicitly changes. |
| **Serialization stability** | Random material/source-status combinations allowed by schema | Serialize → deserialize preserves semantic equality and status derivation. |
| **Migration determinism** | Every historical schema fixture | Repeated migration produces byte-identical target canonical form and path-specific diagnostics. |
| **Accessibility command coverage** | Generated command registry | Every command marked `core=true` has keyboard and programmatic action bindings; commands involving drag expose a non-drag path. |

## 6.3 Metamorphic tests

| Transformation | Expected invariant |
|---|---|
| Switch Explore ↔ Compose ↔ Inspect | No semantic project change. |
| Open/close Browser, Inspector, Mixer, Provenance | No semantic project change. |
| Pan, zoom, resize, detach a panel | No evaluation or source-digest change. |
| Recreate a parameter edit through another modality | Same canonical after-state. |
| Materialize, then alter source | Retained payload remains identical; source status changes. |
| Alter source, then exactly restore it | Source status returns to current. |
| Materialize current source again | New snapshot payload equals current live evaluation for the same interval under the accepted evaluator contract. |
| Edit derivative | Parent snapshot, generator, and materialization receipt remain unchanged. |
| Run local graph auto-layout, then undo | Exact prior layout state restored; semantic graph unchanged throughout. |
| Apply reduced-motion mode | Information and command availability remain equivalent; animation may differ. |
| Disable color | State classification remains possible through labels/icons/patterns/strokes and semantic roles. |

## 6.4 Golden fixtures

### Fixture G-DR11-01: Material lifecycle

**Test-only source operator**

```json
{
  "operator": "test.pattern-source",
  "version": 1,
  "parameters": {
    "events": [
      {"id": "e0", "time": "0/1", "value": 60},
      {"id": "e1", "time": "1/2", "value": 62},
      {"id": "e2", "time": "1/1", "value": 64},
      {"id": "e3", "time": "3/2", "value": 65}
    ]
  }
}
```

**Materialize**

```json
{
  "interval": {
    "start": "0/1",
    "end": "2/1"
  },
  "seed": 42
}
```

**Expected snapshot payload**

```json
[
  {"id": "e0", "time": "0/1", "value": 60},
  {"id": "e1", "time": "1/2", "value": 62},
  {"id": "e2", "time": "1/1", "value": 64},
  {"id": "e3", "time": "3/2", "value": 65}
]
```

**Mutation sequence**

1. Change node position: snapshot remains `current`.
2. Rename an unrelated track: remains `current`.
3. Change source `e2.value` from `64` to `67`: becomes `changed`; snapshot payload remains byte-equivalent.
4. Restore `e2.value` to `64`: returns to `current`.
5. Delete source node: becomes `missing`.
6. Undo deletion: returns to `current`.
7. Edit snapshot event `e1.value` to `63`: create derivative with new ID; original snapshot remains unchanged.

The canonical serializer and hash algorithm are not specified by DR-11; once accepted elsewhere, the fixture must lock a literal expected digest.

### Fixture G-DR11-02: Typed edge matrix

| Source type | Target type | Expected |
|---|---|---|
| `Pattern<Trigger>` | `Pattern<Trigger>` | Accept |
| `Pattern<Trigger>` | `Pattern<Event>` where covariance is explicitly supported | Type-system decision; fixture follows canonical rule |
| `Pattern<Trigger>` | `AudioSignal` | Reject |
| `Control<Probability>` | `Control<Probability>` | Accept |
| `Control<Probability>` | `Control<Angle>` | Reject unless an explicit adapter is inserted |
| `Geometry<Path2D>` | `Pattern<Trigger>` | Reject unless an explicit mapper operator is inserted |

### Fixture G-DR11-03: Parameter modality

Descriptor:

```json
{
  "parameterId": "phase",
  "valueType": "cyclic-rational",
  "cycle": "1/1",
  "defaultValue": "0/1",
  "stepPolicy": {
    "normal": "1/16",
    "fine": "1/64",
    "coarse": "1/4"
  },
  "outOfRangePolicy": "wrap"
}
```

The step values are **fixture values, not AGL defaults**.

Expected commands:

```text
typed "3/8"               → SetParameter("phase", "3/8")
keyboard + normal from 3/8 → SetParameter("phase", "7/16")
keyboard + fine from 3/8   → SetParameter("phase", "25/64")
coarse decrement from 1/8  → SetParameter("phase", "7/8")
```

Pointer/Pencil interactions ending at the same canonical values must serialize identically.

### Fixture G-DR11-04: Workspace neutrality

Starting state:

```json
{
  "workspace": "explore",
  "selection": {"entityType": "event", "stableEntityId": "e2"},
  "transport": {"position": "3/2", "playing": false},
  "projectSemanticHash": "<golden>",
  "undoDepth": 7
}
```

After `explore → compose → inspect`:

```text
selection == event:e2
transport.position == 3/2
transport.playing == false
projectSemanticHash == <golden>
undoDepth == 7
```

Panel and viewport state may differ.

### Fixture G-DR11-05: Accessibility state vocabulary

For each visible material state, the semantic projection must expose:

| Visible state | Minimum semantic name |
|---|---|
| Live generated | “Live generated material; follows source changes” |
| Snapshot current | “Snapshot; source currently matches” |
| Snapshot changed | “Snapshot; source has changed; retained result unchanged” |
| Edited derivative current | “Edited derivative; based on snapshot” |
| Edited derivative changed | “Edited derivative; source has changed” |
| Missing source | “Retained material; source unavailable” |
| Detached | “Detached material; historical source retained in provenance” |

Exact localized wording may vary; state identity and meaning may not.

## 6.5 Cross-platform conformance tests

| Test | Web | Swift/iPad | Expected |
|---|---|---|---|
| Project lifecycle fixture | Serialize/open/save | Open/save | Canonical material records and receipt semantics equivalent |
| Parameter command fixture | Pointer/keyboard | Touch/Pencil/keyboard | Same command ID and canonical value |
| Graph compatibility fixture | Type-check service | Native adapter | Same accept/reject result and reason code |
| Materialization fixture | Worker/evaluator | Native evaluator adapter | Same canonical semantic payload and payload hash |
| Workspace transition | Desktop shell | iPad adaptive shell | Same project, selection, transport, and undo semantics |
| Source-status derivation | Web dependency digest | Native dependency digest | Same `current/changed/missing/detached` result |
| Undo transaction | Browser gesture | Pencil gesture | One undo restores exact prior semantic hash |
| Accessibility projection | ARIA/semantic web tree | VoiceOver accessibility tree | Equivalent entity identity, state, actions, and ordering intent |
| Reduced motion | CSS/animation policy | OS accessibility policy | Same information and commands without required motion |
| Export provenance | WAV/MIDI/MusicXML manifest | Native export manifest | Same materialization receipt references |

Pixel equality is neither required nor desirable. Semantic identity, command behavior, project state, and fixture payloads are the conformance layer.

## 6.6 Performance tests

DR-11 does not establish authoritative millisecond budgets. The following tests should be instrumented, with thresholds set after floor-device/browser profiling.

| Test | Input | Required behavior | Numeric status |
|---|---|---|---|
| Compatibility feedforward | 20-, 100-, and 500-node typed graphs; begin connection | Compatible ports update without blocking input; no canonical mutation during preview | **Threshold TBD** |
| Linked-selection propagation | One event resolving to node, geometry, Inspector, and provenance | All projections update from one selection generation; stale updates are discarded | **Threshold TBD** |
| Source-status recomputation | Relevant and irrelevant edits in graphs of increasing size | Incremental digest computation; no full-project recomputation where avoidable | **Threshold TBD** |
| Materialization | Bounded intervals at accepted event budgets | Progress/cancellation diagnostics; atomic commit only on success | Delegated to evaluator/performance contracts |
| Panel switching | P0 projects with active visualization and audio | No semantic or transport discontinuity | Frame target delegated to UI platform profile |
| Graph navigation | 10–20 nodes for formative study; larger engineering fixtures | No loss of selection or context; reduced-motion alternative | User metric provisional |
| Touch target activation | Core iPad workflow | Accidental activation measured by component and modality | DR-11 proposes `<5%`, calibration required |

## 6.7 Perceptual and user studies

The study must test transitions among representations, not merely button discovery. DR-11 proposes three participant cohorts:

1. curious, music-capable newcomers with little or no node-programming experience;
2. experienced DAW/composition/creative-tool users;
3. users relying on keyboard and/or relevant assistive interaction.

No scientifically justified sample size is supplied by DR-11.

### Hard conformance gates

| Measure | Gate |
|---|---:|
| Incompatible edges committed into canonical graph | **0** |
| Designated core tasks keyboard-completable | **100%** |
| Essential drag functions with non-drag pointer alternative | **100%** |
| Critical state distinctions relying on color alone | **0** |

### Provisional formative targets

These are AGL hypotheses to calibrate, not literature-derived norms.

| Measure | Initial DR-11 target |
|---|---:|
| Newcomers produce intentional audible/visual result unaided | ≥80% |
| Newcomers locate exact entry after direct manipulation | ≥85% |
| Valid graph connection after one exposure | ≥90% |
| Explain incompatible-edge reason | ≥90% |
| Classify Live/Snapshot/Edited/Changed examples | ≥90% after brief exposure |
| Complete materialization without manually deleting/duplicating source | ≥90% |
| Predict source-change behavior | ≥85% first round; ≥95% after refinement |
| Trace event to generating node | Median ≤15 seconds |
| Accidental touch activation | <5% |
| “Lost in graph” incidents in a 10–20-node task | Median <1 |
| Critical repetitive expert operations forced through modal dialog | 0 |

Instrumentation should capture transitions, panel churn, undo count, wrong-state edits, unexpected regeneration, source-trace time, Inspector open/close frequency, and verbalized uncertainty.

---

# 7. Recommended Defaults

| Parameter / behavior | Default | Valid or recommended range | Rationale | Evidence strength | User-facing? |
|---|---|---|---|---|---|
| New-project workspace | **Explore** | Explore, Compose, Inspect | AGL’s differentiator is direct mathematical interaction; timeline-first would subordinate it. | Engineering recommendation | Yes |
| Desktop shell edges | Browser left; Inspector right; detail/mixer bottom | Panels independently collapsible | Stable reopening locations recur in professional tools. | High for behavior; unvalidated for AGL | Yes |
| Workspace semantics | Layout-only preset | No capability lock | Avoids duplicate state and mode-dependent editing. | Strong inference | Yes |
| iPad primary structure | One dominant surface plus contextual/bottom controls | Portrait uses one surface plus sheet | Better fit for touch density than a scaled desktop grid. | High for feasibility | Yes |
| Live-generated source behavior | Follow committed source changes | Preview policy separately defined | This is the meaning of live linkage. | Strong inference | Yes |
| Snapshot source behavior | Retain payload; never silently regenerate | Re-materialize only through explicit command | Required for predictability and provenance. | Strong inference | Yes |
| Changed-source behavior | Visible status plus Compare/Re-materialize/Keep actions | Exact wording and placement TBD | Users must know retained output differs from current source. | Strong inference | Yes |
| “Keep” behavior | Acknowledge divergence, do not mark current | — | Prevents false provenance state. | Engineering correction | Yes |
| Missing source behavior | Preserve payload and receipt; mark source unavailable | — | Missing is not equivalent to changed. | Engineering recommendation | Yes |
| Snapshot editing | Create new edited derivative | In-place identity transition remains an alternative, but is not recommended | New identity makes ancestry and undo clearer. | Engineering recommendation | Yes |
| Graph invalid connections | Block before commit | Incompatible ports remain visible but non-targetable | Uses feedforward from canonical type system. | High | Yes |
| Graph auto-layout | Off until explicitly invoked | Local/selection/subgraph scope | Preserves spatial memory and secondary notation. | Medium-high | Yes |
| Graph navigation motion | Smooth contextual transition | Reduced-motion substitution required | General visualization evidence supports context preservation. | Medium | Yes |
| Parameter interaction | Direct manipulation plus exact entry one action away | Type-dependent | Recurrent professional behavior; supports novice/expert continuity. | High for behavior | Yes |
| Parameter reset | Declared default through visible action | Double-click may be an accelerator, not the only path | Reset behavior should be discoverable and accessible. | Engineering recommendation | Yes |
| Touch targets | **No single final default justified** | Provisional 44–48 logical points for frequently manipulated controls | Larger than cited WCAG minimum; needs floor-device testing. | Engineering hypothesis | No/Design token |
| Web target minimum | Meet WCAG 2.2 target-size criterion and exceptions | 24×24 CSS px minimum where criterion applies; AGL should normally exceed it | Normative requirement represented in DR-11. | Very high | No |
| Normal/fine/coarse sensitivity factors | **No default justified** | Per `ParameterSpec` | Different domains require different scales. | Insufficient | No |
| Numeric decimal precision | **No global default justified** | Unit/type-dependent | False precision would be misleading. | Insufficient | Yes |
| Keyboard nudge amount | **No global default justified** | Per parameter step policy | Rational time, phase, counts, and continuous values differ. | Insufficient | Yes |
| Panel widths/heights | **No default justified by research** | Responsive presets determined by prototypes | DR-11 provides topology, not dimensions. | Insufficient | No |
| Graph layout algorithm | **No universal default established** | Offer one bounded initial implementation and retain replaceability | Research specifically cautions against universal superiority. | High | No |
| State iconography | **No exact icon default established** | Label + icon + another non-color channel | Semantics matter more than a specific snowflake/generator symbol. | Insufficient for exact design | Yes |
| Contextual onboarding | Runnable example plus first-use hint | Optional, dismissible, recoverable | Avoids mandatory tours while preserving discovery. | Medium-high | Yes |
| Advanced gestures | Disabled as required path | Optional accelerators after visible command exists | Gesture learning requires feedforward and recoverability. | Medium-high | Yes |
| User-created workspace layouts | Defer for MVP | Optional post-MVP | Valuable for experts but not required for the shared-shell thesis. | Product judgment | Yes |
| Usability acceptance percentages | Provisional only | Calibrate after formative rounds | No external benchmark supports the exact numbers. | Low as fixed thresholds | No |
| Accessibility parity | Enabled from first implementation | All core commands | Existing P0 requirement and normative standards. | Very high | Yes |

---

# 8. UX / Visualization Implications

| User goal | Information that must be visible | Interaction behavior | Mathematical/scientific meaning | Misleading representation to avoid | Accessibility | Explore / Compose / Inspect | Hard contract? |
|---|---|---|---|---|---|---|---|
| Understand the active mathematical object | Primary geometry, current parameters, audible state, live/generated status | Directly manipulate object; reveal exact value | Geometry or algorithm is the source model, not decoration | A timeline-only view implying tracks are the root ontology | Semantic description and keyboard actions | Explore dominant; available elsewhere | **Yes** for source identity |
| Place an exploration in musical time | Target interval, track/lane, output type, source retention | Explicit Materialize Range action | Converts bounded executable output into retained material | Dragging a visual object that silently severs lineage | Non-drag command and readable interval fields | Explore → Compose bridge | **Yes** |
| Predict whether edits will survive regeneration | Material kind and source status | Live edits at generator level; event edits create derivative | Distinguishes executable source from retained artifact | Generated clips looking identical to ordinary event clips | Label, semantic role, icon/pattern/stroke | Compose and Inspector | **Yes** |
| Know that source has changed | `SOURCE CHANGED`, source location, comparison options | Compare, re-materialize, keep, detach, trace | Retained output no longer equals current source semantics | Silently updating snapshot or relabeling it current after “Keep” | Announced state change; non-color cue | Compose and Inspect | **Yes** |
| Trace why an event exists | Event, source node, parameter/equation stage, provenance path | Select event → trace source/dependencies | Links rendered result to causal graph and transformation stages | Highlighting only the nearest node while hiding other dependencies | Structured semantic trace | Inspect dominant | **Yes** |
| Connect operators correctly | Source/target types, compatible targets, adapter options | Drag, click-connect, keyboard-connect, insert-compatible-node | Port types express mathematical and signal semantics | Accepting invalid edges for later failure | Large hit regions; non-drag and keyboard path | Inspect; graph may be revealed elsewhere | **Yes** |
| Maintain graph orientation | Breadcrumbs, current group, source/dependent direction | Smooth zoom, fit, trace overlay, local layout | Spatial arrangement is secondary notation, not execution semantics | Continuous global reflow implying layout is disposable | Reduced-motion navigation and textual path | Inspect | Partly |
| Adjust by feel, then by number | Current value, unit, delta, snapping, precision mode | Scrub/drag; type; nudge; reset; coarse/fine | Value semantics remain canonical across interaction paths | Knob or slider hiding exact domain, unit, wrap, or bounds | Accessible value actions and typed entry | All workspaces | **Yes** |
| Compare outcomes | Snapshot identity, source digest/status, output summary | Create snapshots, compare, re-materialize | Different retained evaluations are explicit artifacts | Repeatedly overwriting the same result without history | Textual comparison and focus order | Explore/Inspect | **Yes** for identity |
| Mix without losing mathematical context | Track controls plus selected material’s source/provenance indicator | Mute/solo/gain while preserving linked selection | Mixing changes audio presentation, not mathematical source definition unless explicitly wired | Faux mixer controls for unrelated mathematical parameters | Keyboard-operable channel controls | Compose | Partly |
| Learn without hitting an expert ceiling | Visible core action, shortcut hint, Context Help | Use visible action first; accelerator remains available | Same operation and command semantics at both skill levels | Separate beginner state that cannot express expert operations | Help available without hover | All | **Yes** for same command |
| Work on iPad | Dominant surface, transport, panel controls, current context | Finger broad adjustment, Pencil precision, keyboard/pointer parity | Input modality changes interaction mechanics, not project semantics | Miniaturized desktop three-column layout | VoiceOver, keyboard, non-drag, target sizing | All | **Yes** for semantic parity |
| Reopen and understand project state | Persistent material labels, source status, lineage | Open project without replaying action history | Procedural/retained/derived status is project data | Requiring undo history reconstruction to infer origin | Semantic names and descriptions | All | **Yes** |
| Use reduced motion | Current location, selection, source/dependent path | Replace animated travel with bounded transition or immediate focus plus context cues | Motion is presentation, not mathematical meaning | Removing orientation information when motion is disabled | Honor system preference | Inspect/Explore | **Yes** for information preservation |

### Normative visual-state requirement

The following distinction is required, but the exact styling remains design work:

| State | Required semantic channels |
|---|---|
| Live generated | Persistent text/accessible label plus generator-origin icon or structural marker |
| Snapshot current | Snapshot label plus provenance indicator |
| Edited derivative | Edited/derived label plus parent/lineage indicator |
| Source changed | Warning text plus warning icon/stroke/pattern; never color alone |
| Missing source | Explicit unavailable-source text and provenance access |
| Detached | Explicit detached text; historical lineage remains inspectable |

DR-11’s proposed badges, stripes, hatching, and stroke styles are reasonable mockup starting points, not immutable component contracts.

---

# 9. User-Facing Scientific Claims

DR-11 is primarily an HCI/product-pattern report. The strongest safe claims concern documented behavior, normative requirements, or AGL’s own implemented semantics—not broad statements that one design is universally easier or better.

## Safe to state directly

Once implemented and verified:

- “Explore, Compose, and Inspect show different views of the same AGL project.”
- “Switching workspaces does not convert or duplicate your musical material.”
- “Live-generated material follows its source.”
- “A snapshot retains the evaluated result for the selected interval.”
- “Changing the source does not silently rewrite a snapshot.”
- “Edited derivatives preserve a link to their parent material.”
- “AGL prevents incompatible graph connections before they are added.”
- “The same parameter value can be entered directly or reached through supported direct-manipulation and keyboard controls.”
- “Material state is communicated with text and non-color visual cues.”
- “Core drag interactions have non-drag alternatives.”
- “Professional music and creative applications commonly use configurable views, contextual inspectors, and both direct and exact parameter input.” This is an observed product-pattern claim, not a usability ranking.
- “WCAG 2.2 includes requirements concerning dragging alternatives and target size.” Any detailed copy must preserve the criterion’s conditions and exceptions.

## Safe only with qualification

- **Claim:** “Explore, Compose, and Inspect reduce complexity.”  
  **Required qualification:** They are an AGL design hypothesis informed by recurring professional-tool patterns; AGL-specific usability must be tested.

- **Claim:** “This design works for beginners and experts.”  
  **Required qualification:** It is designed to preserve visible novice paths and expert accelerators, but this requires representative user validation.

- **Claim:** “Smooth graph navigation prevents users from getting lost.”  
  **Required qualification:** Smooth zoom/pan has supporting general visualization evidence, but the result is not established for AGL’s graph tasks.

- **Claim:** “Local auto-layout makes graphs easier to understand.”  
  **Required qualification:** Reducing crossings can help graph comprehension, but no single algorithm or layout is universally best.

- **Claim:** “44–48-point controls are accessible.”  
  **Required qualification:** This is an AGL touch-target design range, not a guarantee of accessibility and not the literal WCAG minimum.

- **Claim:** “Precision overlays improve professional parameter editing.”  
  **Required qualification:** Tweeq provides promising design evidence with a small informal expert evaluation; AGL’s implementation needs validation.

- **Claim:** “A four-state visual system is intuitive.”  
  **Required qualification:** The underlying distinctions are important, but terminology and visual comprehension remain untested.

- **Claim:** “EyeHarp proves alternative-input musical interfaces are usable by people with motor disabilities.”  
  **Required qualification:** The cited work demonstrates technical and expressive feasibility, but the reported evaluation was small and did not directly validate the principal target disability population.

- **Claim:** “Logic Pro for iPad proves AGL can provide professional density on iPad.”  
  **Required qualification:** Logic demonstrates feasibility of combining input modalities and revealable zones, not that AGL’s specific shell will be usable.

## Do not claim

- “Research proves Explore → Compose → Inspect is the optimal music-tool interface.”
- “Workspace presets eliminate mode errors.”
- “A graph-first interface is inherently unusable.”
- “A DAW layout is empirically easier for professional musicians.”
- “The proposed success percentages are industry standards.”
- “44 or 48 points guarantees accurate touch interaction.”
- “One graph-layout algorithm is scientifically best.”
- “More popular applications have better usability.”
- “Generated, frozen, edited, and stale styling has been validated.”
- “A screen-reader-compatible semantic tree guarantees an accessible workflow.”
- “All disabled users can use AGL because keyboard, VoiceOver, or gaze interfaces exist.”
- “A snapshot is reproducible merely because it has a hash.”
- “Realtime and offline audio are identical” unless the audio architecture specifies and proves the exact equivalence level.
- “Freeze is reversible” unless the implemented command, source-retention, persistence, and undo contracts all pass.
- “The source is current” based only on project revision, timestamp, or visual state.
- “A retained artifact is still current because the user chose Keep.”

---

# 10. Implementation Recommendations

## Must happen before MVP architecture freezes

| Recommendation | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Accept ADR-UX-001 semantic multi-workspace shell. | Critical | M | AGL-030 |
| Freeze the orthogonal material/source-status model. | Critical | L | AGL-010, AGL-027 |
| Define `MaterializationReceipt` and durable source-recipe strategy. | Critical | L | AGL-010, AGL-011, AGL-015 |
| Define semantic dependency closure and digest service. | Critical | L | AGL-020–024 |
| Extend command bus with interactive begin/preview/commit/cancel transactions. | Critical | L | AGL-012 |
| Define `ParameterSpec` and `SetParameter` command semantics. | Critical | L | AGL-004, AGL-020, DR-08 reconciliation |
| Define global `SelectionRef` and projection-resolution interfaces. | Critical | M | AGL-005, AGL-036, AGL-050 |
| Expose canonical graph compatibility/diagnostic API. | Critical | M | AGL-021, AGL-022 |
| Separate project state, runtime/evaluation state, and studio session/layout state. | Critical | M | AGL-030, AGL-013 |
| Define accessibility command inventory and non-drag requirements. | High | M | AGL-132 |
| Decide internal terminology: `Materialize Range` versus public Freeze/Snapshot wording. | High | S | UX validation |
| Establish canonical serialization and hashing boundaries for receipts and payloads. | Critical | L | AGL-010, AGL-015 |
| Add DR-11 to the research register and dependency graph. | Medium | S | Research governance |

## Must happen before the affected lab ships

| Recommendation | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| P0 Infinite Staircase and Euclidean Rings use the shared shell rather than bespoke navigation. | Critical | L | AGL-060/070, AGL-030 |
| Each P0 Explore surface exposes exact values and keyboard alternatives for direct manipulation. | High | M | AGL-062/072, parameter contract |
| Compose can simultaneously display live-generated, snapshot, edited, and changed-source examples. | High | M | AGL-032 |
| Materialization from each P0 lab creates a receipt and deterministic bounded payload. | Critical | L | AGL-027, lab evaluator |
| Graph editing blocks invalid edges before commit and explains why. | Critical | M | AGL-034 |
| Event-to-source-to-equation/provenance tracing works in Inspect. | High | L | AGL-035/036 |
| Source changes visibly update status without mutating retained output. | Critical | M | Dependency digest |
| Material-state distinctions pass non-color and screen-reader tests. | Critical | M | AGL-132 |
| iPad layout supports one dominant surface and non-drag graph/materialization paths. | High | L | Native/adaptive shell |
| Reduced-motion graph navigation preserves context. | Medium | M | GraphNavigator |
| Run formative transition studies before calling the P0 shell “intuitive.” | High | M | Testable P0 vertical slices |
| Export manifests identify whether output came from live, snapshot, or derivative material. | Medium | M | AGL-045/130/131 |

## Can safely happen after MVP

| Recommendation | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| User-defined workspace layouts and named presets. | Medium | M | Stable panel shell |
| Detached panels and multi-window graph/provenance views. | Medium | L | Desktop/native window architecture |
| Advanced local graph-routing algorithms. | Medium | L | Stable layout-state contract |
| Marking-menu or gesture accelerators with dynamic feedforward. | Low/Medium | M | Command registry |
| Rich visual provenance diff between two source recipes. | Medium | L | Materialization receipts |
| Multi-snapshot comparison workspace. | Medium | L | Stable snapshot model |
| Customizable touch performance surfaces. | Medium | L | Controller/command mapping |
| MIDI-controller learn for semantic parameters. | Medium | M | AGL-048, ParameterSpec |
| User-selectable density themes beyond compact/normal/touch. | Low | M | Design system |
| Sophisticated source-detachment and archival workflows. | Medium | M | Provenance model |
| iPhone companion authoring beyond transport/performance controls. | Low | XL | Native architecture |

## Research-only / experimental

| Recommendation | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Compare alternative material-state terms and icon systems. | Medium | M | Functional prototype |
| Compare 44, 48, and adaptive touch targets on floor-device hardware. | High for iPad polish | M | iPad prototype |
| Compare precision HUD and conventional field/scrub interactions across parameter types. | Medium | M | Parameter prototypes |
| Compare graph navigation/layout strategies at 20, 50, and 100+ nodes. | Medium | L | Realistic graph corpus |
| Evaluate multi-window versus zoom-based Inspect for high-comparison tasks. | Low/Medium | L | Desktop prototype |
| Study accessibility workflows with users relying on screen readers, switch/keyboard input, low vision, or motor accommodations. | Critical for claims | L | Accessible prototype |

---

# 11. Backlog Deltas

| Action | Item | Rationale | Suggested acceptance criteria | Dependencies | Milestone |
|---|---|---|---|---|---|
| **ADD** | Register DR-11: Professional Music-Tool UX and Progressive Disclosure | Current register stops at DR-10. | Run recorded as completed; links to ADRs, affected backlog items, packet, and design-spec delta. | Research register | M1 |
| **MODIFY** | **AGL-010 — Full project schema and JSON Schema** | Material kind, source status, receipt, parentage, and source recipe need canonical fields. | Schema validates all allowed combinations; invalid combinations produce path-specific diagnostics; semantic fields are separate from UI/session state. | ADR-UX-002 | M1 |
| **MODIFY** | **AGL-011 — Schema migration framework** | Existing generated/frozen fields may need migration to orthogonal semantics. | Golden migrations are deterministic; ambiguous legacy records are explicitly diagnosed rather than guessed silently. | AGL-010 | M1 |
| **MODIFY** | **AGL-012 — Project command bus** | Direct manipulation and multimodal parity require interactive grouped transactions. | Begin/preview/commit/cancel supported; one gesture creates one undo unit; pointer/keyboard/AT commands share IDs. | Parameter contract | M1 |
| **MODIFY** | **AGL-020 — Executable operator interface** | Provenance formatter must expose dependencies and source-recipe materialization metadata. | Operator execution identifies semantic dependencies, versions, seeds, and provenance fields used by receipts. | DR-08 reconciliation | M1 |
| **MODIFY** | **AGL-021 — Port type checker** | UI must consume canonical compatibility and diagnostics. | Pure compatibility query API; structured reason codes; adapter suggestions; identical UI/compiler fixtures. | None beyond current | M1 |
| **MODIFY** | **AGL-022 — Graph compiler** | Hidden result-affecting dependencies cannot remain outside causal closure. | Compiler/evaluator plan records all typed dependencies; forbidden hidden references fail or are surfaced explicitly. | AGL-020/021 | M1 |
| **MODIFY** | **AGL-024 — Deterministic evaluation cache** | Cache and source-status logic must share semantic dependency hashes. | One canonical digest service; unrelated presentation changes do not invalidate; relevant closure changes do. | AGL-022 | M1 |
| **MODIFY** | **AGL-027 — Graph freeze-to-clip** | Current acceptance is too narrow for lineage, status, derivative, and reproducibility semantics. | Exact `[start,end)` materialization; source retained; independent payload; immutable receipt; source recipe resolvable; no silent regeneration; re-materialize and edit-derivative commands; undo fixtures pass. | AGL-012, 023, 032 | M2 |
| **MODIFY** | **AGL-030 — Production app scaffold** | The shell architecture must be explicit before lab UI divergence. | Explore/Compose/Inspect presets; shared project/selection/transport/undo; panel registry; separate `StudioSessionState`; keyboard workspace/panel actions. | ADR-UX-001 | M1 |
| **MODIFY** | **AGL-032 — Timeline and clips** | “Generated and frozen” is insufficiently precise. | Live, snapshot, derivative, current/changed/missing/detached semantics; non-color representation; source actions; persistent reopen fixture. | AGL-010, 027 | M2 |
| **MODIFY** | **AGL-034 — Typed visual operator graph** | Preventive typing, non-drag paths, navigation, and local layout must be explicit. | Feedforward compatibility; large semantic hit regions; keyboard and click-connect; insert/replace compatible operator; breadcrumbs; local previewed undoable layout; no invalid canonical edges. | AGL-021, 012 | M1/M2 |
| **MODIFY** | **AGL-035 — Mathematical inspector** | Inspect must explain live values, stages, and source provenance consistently. | Selected material/event shows equation, effective values, source node, versions, seed, interval, dependency trace, receipt, and changed-source explanation. | AGL-020/023 | M2 |
| **MODIFY** | **AGL-036 — Linked selection** | Stable identity and projection semantics need to be formal. | Canonical `SelectionRef`; cross-highlight event/node/geometry/provenance; workspace preservation; unresolved/deleted entity behavior; no canvas-local identity leakage. | AGL-003/005/050 | M1/M2 |
| **MODIFY** | **AGL-051 — Shared 2D canvas** | Canvas must support semantic IDs, accessible hit regions, and contextual navigation. | Stable projection IDs; semantic hit targets; pan/zoom/fit/source/dependents; reduced-motion path; layout excluded from evaluation hash. | AGL-050 | M2 |
| **MODIFY** | **AGL-053 — Accessible mathematical descriptions** | Material/source states and graph dependencies need synchronized semantic text. | Selected geometry and generated material expose current state, source status, causal summary, and available actions. | AGL-050/035 | M2 |
| **MODIFY** | **AGL-132 — Accessibility baseline** | Current acceptance should explicitly cover drag alternatives and command parity. | 100% core keyboard completion; 100% essential drag alternatives; zero critical color-only states; status announcements; focus order; reduced motion; semantic graph/timeline/material actions. | AGL-030/034/032 | M1–M6 |
| **ADD** | Shared `ParameterSpec` and `ParameterField` framework | Prevents lab-specific controls and cross-platform divergence. | Rational, integer, scalar, probability, phase, seed, enum, and vector fixtures; scrub/type/nudge/reset; grouped undo; accessible value actions; no hidden unit conversion. | AGL-004/012/020, DR-08 | M1 |
| **ADD** | Material lifecycle conformance fixture pack | State semantics need executable evidence. | G-DR11-01 through G-DR11-05 run in TypeScript and future Swift clients. | AGL-010/011/027 | M1/M2 |
| **ADD** | Semantic dependency and source-status service | Whole-project revisions are insufficient. | Transitive closure, canonical digest, current/changed/missing/detached derivation, incremental invalidation fixtures. | AGL-020–024 | M1 |
| **ADD** | Studio shell component contract | DR-11 lists reusable components that should not be reinvented by labs. | `WorkspaceSwitcher`, `PanelDock`, `ParameterField`, `TypedPort`, `GraphNavigator`, state badge, provenance Inspector, command palette, and materialize sheet have documented APIs and accessibility behavior. | AGL-030 | M1/M2 |
| **SPLIT** | Representative UX validation | Formative design calibration and M6 release validation serve different purposes. | **Part A M2:** P0 transition study and component calibration. **Part B M6:** representative validation against accepted release metrics. | P0 labs; accessibility prototype | M2 and M6 |
| **BLOCK** | Freeze of AGL-027/032 serialized semantics | Avoid premature implementation of a flat enum or whole-project staleness. | Block lifted after ADR-UX-002 and receipt/digest schema are accepted. | AGL-010/012/020–024 | M1 |
| **BLOCK** | Final `docs/13-ui-ux-final-design-spec.md` approval | Actual file has not been compared to DR-11. | Block lifted after line-level review against token, component, screen, accessibility, and state-contract deltas. | Design spec availability | M1 |
| **UNBLOCK** | Shared shell implementation | DR-11 provides sufficient direction once ADR-UX-001, 003, 005, and 008 are accepted. | Shell scaffold may proceed without final visual styling or usability-threshold calibration. | ADR acceptance | M1 |
| **REMOVE** | Any planned separate beginner/expert project semantics, if present | DR-11 rejects a migration cliff and duplicated command models. | No separate project schemas, generators, or command behavior by expertise level. | Design-spec audit | M1 |

The existing program plan assumes only two product engineers and one product/UX FTE, making shared contracts materially preferable to parallel novice/expert or web/iPad semantic implementations.

---

# 12. Cross-Research Dependencies

## 12.1 Browser audio and render architecture

**This report concludes:**  
Live material follows committed source semantics; materialized payloads remain unchanged; realtime and offline output must trace to the same source receipt.

**Must be reconciled with:**  
DR-03 browser scheduling, render-plan, generation/cancellation, realtime/offline equivalence, and export behavior.

**Why:**  
DR-11 does not define whether equality means event equality, render-plan equality, semantic-audio equivalence, or waveform identity. It also does not define when a high-rate UI preview becomes a committed render generation.

**Question the integration pass must answer:**  
What canonical payload does `MaterializeRange` produce for each output type, and at what layer can AGL truthfully claim realtime/offline equivalence?

---

## 12.2 General sonification and mapping semantics

**This report concludes:**  
Every parameter needs type-aware editing, visible units, bounds, exact values, and explainable transformations.

**Must be reconciled with:**  
DR-08 mapping stages, dimensions, units, missing-value rules, causality, normalization, smoothing, quantization, constraints, and provenance.

**Why:**  
The UI cannot invent parameter semantics independently of the executable operator and control-signal model.

**Question the integration pass must answer:**  
Which `ParameterSpec` fields are canonical operator metadata, which are UI presentation metadata, and which transformations require explicit graph operators rather than field behavior?

---

## 12.3 Native iPad architecture

**This report concludes:**  
The iPad shell should recompose around one dominant surface and support touch, Pencil, keyboard, pointer, and assistive technology through shared commands.

**Must be reconciled with:**  
The native/iPad architecture run, Swift document model, command-dispatch/UndoManager adaptation, accessibility projection, and cross-platform project conformance.

**Why:**  
DR-11 establishes interaction semantics, not SwiftUI ownership, document persistence, windowing, gesture arbitration, or native audio implementation.

**Question the integration pass must answer:**  
How are `StudioSessionState`, `SelectionRef`, `ParameterSpec`, interactive transactions, and materialization receipts represented identically across TypeScript and Swift without serializing platform-only UI state?

---

## 12.4 P0 Infinite Staircase semantics

**This report concludes:**  
The Infinite Staircase Explore view should expose direct manipulation, generated status, exact values, and source tracing through the shared shell.

**Must be reconciled with:**  
DR-01’s accepted Risset operator semantics and visualization/claim boundaries.

**Why:**  
The shell must not imply that the visually dominant layer is necessarily the listener’s perceived tempo, or hide independent optional transformations inside generic controls.

**Question the integration pass must answer:**  
Which Risset parameters are primary Explore controls, which require Inspect, and which visual values can be described as physical state rather than perceptual interpretation?

---

## 12.5 P0 Euclidean Rings semantics

**This report concludes:**  
Euclidean Rings should support direct ring manipulation, exact entry, keyboard parity, composition materialization, and linked graph inspection.

**Must be reconciled with:**  
DR-02’s accepted Euclidean convention, rotation/phase semantics, preset evidence, and composite-cycle terminology.

**Why:**  
A visually intuitive ring is still misleading if rotation, onset indexing, or pattern equivalence differs from the canonical operator.

**Question the integration pass must answer:**  
What exact `ParameterSpec`, snapping, accessible description, and materialized-event ordering correspond to the accepted Euclidean convention?

---

## 12.6 P1 laboratory projections

**This report concludes:**  
Each laboratory receives a customized Explore projection but shares the same shell, material, parameter, command, provenance, and accessibility contracts.

**Must be reconciled with:**  
DR-04 Tonnetz, DR-05 fractal, DR-06 cellular automata, DR-07 chaos, and DR-09 Penrose findings.

**Why:**  
Direct manipulation and state explanations must preserve each domain’s accepted mathematics, ancestry, causality, numerical bounds, and evidence status.

**Question the integration pass must answer:**  
Which projection primitives and direct-manipulation operations are semantically valid for each lab, and which outputs can be materialized into the common timeline/event model?

---

## 12.7 Command and undo architecture

**This report concludes:**  
Visible actions, shortcuts, gestures, accessibility actions, and controller mappings invoke the same command; one continuous gesture becomes one undo transaction.

**Must be reconciled with:**  
AGL-012’s atomic commands, inverses, grouping, and any runtime preview mechanism.

**Why:**  
A live gesture may produce hundreds of preview values, worker evaluations, and audio generations without warranting hundreds of project revisions.

**Question the integration pass must answer:**  
Are previews ephemeral overlays, speculative project revisions, or coalesced commands, and how are cancellation and remote/native parity guaranteed?

---

## 12.8 Project persistence and historical provenance

**This report concludes:**  
A snapshot retains source lineage and enough information to compare or regenerate.

**Must be reconciled with:**  
AGL-010/011/013/015 project schema, repository, migration, and portable-package contracts.

**Why:**  
A source graph revision ID is insufficient if old revisions are not durably stored. Embedding source closure may increase package size and create migration obligations.

**Question the integration pass must answer:**  
Does every materialization embed a minimal immutable recipe, retain durable command-history revisions, or reference content-addressed source closures in the asset store?

---

## 12.9 Export semantics

**This report concludes:**  
Generated material crosses an explicit materialization boundary before it becomes ordinary event-level editable/exportable material.

**Must be reconciled with:**  
MIDI, MusicXML, WAV, and visual export contracts.

**Why:**  
Standard interchange formats cannot preserve AGL’s executable graph and complete provenance semantics.

**Question the integration pass must answer:**  
Which material kinds may be exported directly, when implicit materialization is allowed, and what AGL manifest or sidecar preserves source receipt and evidence state?

---

## 12.10 Accessibility validation

**This report concludes:**  
Accessibility parity is a release invariant, but product precedents and EyeHarp do not validate AGL’s workflows.

**Must be reconciled with:**  
AGL-132, native accessibility semantics, representative-user recruitment, and the M6 release gate.

**Why:**  
Automated semantic-tree and keyboard tests prove implementation properties, not efficiency, comprehension, fatigue, or practical accessibility.

**Question the integration pass must answer:**  
Which relevant user populations, assistive configurations, tasks, and failure thresholds are required before AGL makes accessibility claims?

---

# 13. Contradictions, Weak Evidence, and Open Questions

| Issue | Why it is problematic | Severity | Required resolution |
|---|---|---:|---|
| **Product behavior is frequently assigned “A” quality.** | It proves that a feature exists, not that it is discoverable, efficient, or suitable for AGL. | High | Maintain separate “behavior precedent” and “empirical usability” fields in the evidence registry. |
| **Four visible material labels are treated as a state machine.** | `Stale` is orthogonal to origin and editability; edited derivatives may also diverge. | Critical | Adopt separate material kind and source status. |
| **Source status has only Current/Stale in the report.** | Missing and detached sources have materially different behavior. | High | Add `Missing` and `Detached`, or an equivalent explicit model. |
| **A snapshot is described as having an “ordinary editable material body,” while editing it creates an Edited Derivation.** | It is unclear whether a snapshot is directly mutable or must first be converted. | Critical | Make the first event edit an explicit derivative-creation command; retain original snapshot. |
| **“Freeze,” “materialize,” “snapshot,” “commit,” and “convert” are used inconsistently.** | These terms carry different expectations in DAWs and data systems. | High | Use one internal command term; test user-facing labels. |
| **Hash or exact parameter set is suggested as interchangeable provenance.** | A hash cannot reproduce content, and parameters alone may omit upstream data, assets, versions, or policies. | Critical | Retain a resolvable complete source recipe plus digest. |
| **Source graph revision is proposed without a retention guarantee.** | A revision ID becomes a dead pointer if project history is compacted or not persisted. | Critical | Decide durable revisions versus embedded/content-addressed source closure. |
| **Whole source graph revision could mark snapshots stale after irrelevant edits.** | Produces false status changes and warning fatigue. | High | Use transitive semantic dependency digest. |
| **“Keep” may imply resolution of staleness.** | A user decision to retain output does not make it correspond to the changed source. | High | Keep records acknowledgement but leaves status `changed`. |
| **Detachment semantics are undefined.** | It could mean remove active linkage, erase provenance, copy content, or disable comparison. | Medium-high | Preserve historical receipt; distinguish active source comparison from ancestry. |
| **Realtime “live” update boundary is unclear.** | It could update per pointer sample, per command commit, per worker result, or per transport quantum. | Critical | Reconcile command previews with evaluator generations and audio scheduler. |
| **Realtime/offline sameness is underspecified.** | Event equality, plan equality, audio tolerance, and bit identity are not interchangeable. | Critical | Import exact equivalence semantics from DR-03. |
| **“One action away” is not operationally defined.** | A hidden gesture or long-press could technically satisfy it while remaining undiscoverable. | Medium | Define one visible activation from the current control, plus keyboard path. |
| **“Every numeric field” is overly broad.** | Seeds, enums, vectors, rational values, and cyclic phases require different interaction models. | High | Use type-aware parameter components and remove generic-field assumptions. |
| **No precision multipliers are supported.** | Coarse/fine behavior could vary wildly across labs and devices. | Medium | Parameter-level step policies; prototype and test representative domains. |
| **44–48 points mixes recommendation with requirement.** | It is not the cited WCAG criterion and may not fit every compact context. | Medium | Keep as provisional token range; validate on device. |
| **Exact panel proportions are unsupported.** | The report establishes topology, not size. | Low | Responsive prototype testing. |
| **Graph-layout evidence is old and based on abstract tasks.** | Creative patching involves memory, authorship, grouping, and repeated editing not captured by simple comprehension tasks. | Medium | Use it to reject careless crossings, not to choose an algorithm without testing. |
| **Smooth-zoom evidence is not graph-editor-specific.** | It may not outperform direct navigation for all users or accessibility configurations. | Medium | Offer contextual navigation plus reduced-motion/direct alternatives. |
| **Tweeq’s evaluation is small and informal.** | It supports prototyping, not universal parameter-component adoption without testing. | Medium | Validate PrecisionHUD and sensitivity behavior in AGL tasks. |
| **EyeHarp population mismatch limits accessibility inference.** | Participants without the principal motor disabilities cannot establish effectiveness for those users. | High | Recruit relevant users before claims. |
| **The accessibility tree is described as shared across workspaces/platforms.** | A literal shared tree is infeasible; web and native platforms expose different APIs. | Medium | Share a semantic accessibility model, project it through platform adapters. |
| **All panels available everywhere may recreate permanent density.** | Avoiding hard modes does not automatically produce progressive disclosure. | Medium | Define sensible defaults, panel budgets, and first-use behavior; measure view tax. |
| **Workspace layout persistence is undefined.** | Project-level persistence could create device incompatibility; local persistence could surprise users moving devices. | Medium | Store semantic workspace intent separately from device-specific geometry. |
| **Source status may change during transient preview.** | Rapidly flashing stale indicators would be distracting and not represent committed authorship. | High | Compute persistent status from committed semantic revisions; preview status is ephemeral. |
| **External formats cannot preserve full provenance.** | MIDI/MusicXML export could appear to retain a live link when it cannot. | Medium-high | Use explicit conversion copy and export manifest/sidecar. |
| **The proposed usability thresholds lack baseline data.** | They may be too low, too high, or insensitive to participant cohort. | High | Treat as calibration targets; preregister later release criteria from pilot evidence. |
| **No action-latency or graph-size budgets are established.** | A semantically correct feedforward system may still feel unusable. | High | Establish floor-device performance budgets after proof-of-architecture profiling. |
| **The actual target UI/UX spec was absent.** | Required changes may duplicate, conflict with, or omit existing provisions. | Critical for document closure | Perform a line-level audit before approving the spec. |

---

# 14. Research Follow-Ups

Only the following follow-ups are likely to change an implementation or release decision materially.

| Priority | Question | Why current evidence is insufficient | Decision blocked | Best likely method |
|---|---|---|---|---|
| **Critical** | Do users correctly understand Live, Snapshot, Edited Derivative, Changed Source, Missing Source, and Detached Source? | The state distinctions are architectural, but labels and visual treatments are AGL hypotheses. | Final terminology, badges, Commit/Materialize sheet, release copy | Task-based formative study using realistic P0 projects; classification, behavior prediction, and source-tracing tasks |
| **Critical** | What is the minimum viable accessible graph/timeline/materialization workflow for users relying on screen reader, keyboard/switch, low-vision, or motor accommodations? | Automated tests and product precedents cannot establish real workflow efficiency. | M6 accessibility claims and release acceptance | Participatory accessibility evaluation with relevant users and assistive configurations |
| **High** | Which touch-target and connection technique minimizes graph errors on floor-device iPads? | 44–48 points is an engineering range, not an empirically selected AGL value. | Final `TypedPort`, transport, and graph hit-area tokens | Controlled within-subject device study comparing target sizes and drag/click/insert flows |
| **High** | Which precision interaction works for rational time, phase, probability, integer count, and continuous scalar values? | Tweeq and product examples do not determine AGL-specific step policies or overlays. | `ParameterField` behavior, coarse/fine defaults, Pencil adaptation | Comparative prototype study measuring error, completion time, undo, and preference by parameter type |
| **High** | What source-recipe retention strategy balances reproducibility and project-package size? | DR-11 identifies required provenance but not storage architecture. | Final materialization receipt and portable-project schema | Engineering spike with representative P0/P1 source closures, package-size measurements, migration and recovery tests |
| **Medium** | Does explicit local layout plus source/dependent navigation outperform fit-all/global auto-layout for realistic AGL graphs? | Existing studies are abstract and old relative to AGL’s creative context. | Default graph layout/navigation commands | Task study on realistic 20-, 50-, and 100-node graphs; crossing count, trace time, memory, undo, and lost-navigation incidents |
| **Medium** | Do Explore/Compose/Inspect presets reduce view tax relative to a Compose-centered baseline? | Recurring product behavior does not prove AGL’s shell arrangement. | Default panel presets and first-run shell | Comparative formative test with P0 tasks, not a new broad literature run |
| **Medium** | Which internal term and public label best communicates bounded deterministic conversion: Materialize, Freeze, Snapshot, Commit, or Convert? | Existing products attach inconsistent meanings to these words. | Command naming, documentation, onboarding | Terminology comprehension and behavior-prediction study |
| **Medium** | What are acceptable feedforward and linked-selection latency budgets on supported floor devices? | DR-11 supplies no numeric interaction-performance evidence. | Performance gates for AGL-034/036 | Instrumented proof-of-architecture benchmark across browser/device support matrix |

No additional broad survey of DAWs, modular tools, or iPad applications is necessary before implementation. The decision risk now lies in AGL-specific semantics and validation, not insufficient product sampling.

---

# 15. Integration Checklist

- [ ] Update the AGL architecture specification with the semantic multi-workspace shell.
- [ ] Accept or revise ADR-UX-001 through ADR-UX-008.
- [ ] Update the canonical project schema with orthogonal material kind and source status.
- [ ] Define and version the materialization receipt.
- [ ] Decide durable source-recipe retention.
- [ ] Define the semantic dependency closure and digest contract.
- [ ] Extend the command bus with interactive transaction semantics.
- [ ] Define the shared `ParameterSpec` contract.
- [ ] Define the canonical graph compatibility/diagnostic API.
- [ ] Define global `SelectionRef` and projection-resolution behavior.
- [ ] Extend visualization projections with semantic IDs and accessible hit regions.
- [ ] Reconcile materialization with realtime/offline render-plan semantics.
- [ ] Reconcile parameter metadata with DR-08 mapping/control semantics.
- [ ] Reconcile the adaptive shell and command contracts with native/iPad architecture.
- [ ] Update `docs/13-ui-ux-final-design-spec.md` through an actual line-level review.
- [ ] Add the DR-11 semantic design tokens and component contracts.
- [ ] Add required shell, state, graph, materialization, iPad, and accessibility reference screens.
- [ ] Implement G-DR11-01 through G-DR11-05 golden fixtures.
- [ ] Add property, metamorphic, accessibility, and cross-platform conformance tests.
- [ ] Add formative P0 usability testing before M2 acceptance.
- [ ] Preserve calibrated representative-user validation as an M6 gate.
- [ ] Update AGL-010, 011, 012, 020–024, 027, 030, 032, 034–036, 051, 053, and 132.
- [ ] Add DR-11 to the research register.
- [ ] Update P0 Infinite Staircase and Euclidean Rings specifications to use the common shell.
- [ ] Review user-facing documentation for unsupported usability or accessibility claims.
- [ ] Ensure MIDI, MusicXML, WAV, and visual exports preserve material receipt references where applicable.

---

# Integration Payload

- **Packet identity:** `AGL-DR11-INTEGRATION-2026-08-18`
- **Source authority:** completed DR-11 report plus AGL backlog, lab manifest, program plan, and research register. No new external research was introduced. - **Overall decision:** **Accept with conditions.**
- **Evidence boundary:** official product documentation supports observed interface behavior, not comparative usability; empirical evidence supports graph-crossing sensitivity, visual-programming viscosity/secondary notation, smooth contextual navigation, touch-precision limitations, gesture feedforward, and provenance, but not AGL’s exact shell dimensions, state styling, touch target, or success thresholds.
- **Primary accepted architecture:** one canonical project, command system, transport, evaluation state, semantic undo history, and linked selection presented through **Explore**, **Compose**, and **Inspect** layout presets.
- **Workspace invariant:** workspace change modifies session/layout state only. It must not modify semantic project hash, material IDs, transport state, undo history, or primary selection.
- **Explore:** mathematical object, direct manipulation, immediate sound, primary controls.
- **Compose:** timeline, tracks, clips, mixer, retained materials.
- **Inspect:** typed graph, equations, live values, stages, diagnostics, and provenance.
- **Rejected primary shells:** Compose-centered DAW, graph-first application, hardware rack, separate beginner/expert applications, and lab-specific semantic shells. Compose-centered and graph-centered layouts may later exist as optional workspace presets.
- **Canonical material correction:** do not serialize `UserAuthored | LiveGenerated | Snapshot | EditedDerivative | Stale` as one enum. Use:
  - `MaterialKind = UserAuthored | LiveGenerated | Snapshot | EditedDerivative`
  - `SourceStatus = NotApplicable | Current | Changed | Missing | Detached`
- **User-facing mappings:** `LIVE`; `SNAPSHOT`; `EDITED`; qualifiers such as `SOURCE CHANGED`, `SOURCE MISSING`, or `DETACHED`.
- **Materialization internal command:** provisionally `MaterializeRange`; public label remains a usability decision.
- **Materialization interval:** exact rational half-open range `[start,end)`.
- **Materialization output:** independent canonical semantic payload plus immutable receipt; live source remains.
- **Materialization receipt minimum:** stable receipt/material IDs; generator node; graph revision; semantic dependency digest; resolvable source recipe or embedded source closure; operator versions; explicit seed; evaluation-policy version; exact interval; output type/hash; command ID; parent material ID; optional audit timestamp excluded from semantic hashes.
- **Critical provenance rule:** a hash is not a reproducible recipe. `sourceGraphRevisionId` is insufficient unless revision retention is guaranteed.
- **Source digest definition:** hash canonical serialization of the transitive output-affecting source closure, exact interval, seeds, operator semantic versions, and output-affecting evaluation policies.
- **Digest exclusions:** node position, viewport, panel state, selection, track color, unrelated graph branches, wall-clock timestamp.
- **Source status:** current iff stored source digest equals current source digest; changed if unequal; missing if unresolved; detached only after explicit command.
- **Reversion behavior:** if relevant source semantics return exactly to the stored digest, status returns to current.
- **Snapshot rule:** source changes never mutate retained payload.
- **Edited derivative rule:** first event-level edit creates a new stable material ID with parent snapshot/receipt; original snapshot remains unchanged.
- **Re-materialization rule:** creates an explicit successor snapshot and receipt; no historical overwrite.
- **Keep-changed rule:** records acknowledgement but remains `Changed`.
- **Detach rule:** removes active comparison while retaining historical provenance.
- **Graph typing:** UI preview, pointer connection, keyboard connection, insertion, replacement, import validation, and compiler validation use one canonical compatibility service.
- **Graph invariant:** no incompatible edge enters ordinary canonical project state.
- **Conversion rule:** type conversions must be explicit adapters/operators or explicitly represented canonical safe conversions; never hidden UI coercions.
- **Dependency rule:** every output-affecting data, control, parameter, asset, temporal, or provenance dependency enters causal closure, cache invalidation, source digest, and Inspect trace.
- **Graph visual rule:** primary view may suppress secondary dependency categories, but Inspect must expose them.
- **Graph layout rule:** layout is persisted presentation/secondary notation, excluded from semantic graph hash and evaluation.
- **Auto-layout rule:** explicit, local, previewed, cancellable, undoable; no continuous global reflow.
- **Graph navigation:** breadcrumbs; up; zoom-to-selection; zoom-to-source; zoom-to-dependents; fit; temporary upstream/downstream trace; reduced-motion alternative.
- **Selection contract:** session-level `SelectionRef(entityType, stableEntityId, optionalSubentityId, optionalTimeContext)` resolved by timeline, graph, geometry, Inspector, and provenance projections.
- **Selection rule:** workspace changes preserve primary selection; secondary cross-highlights derive from it; selection is not ordinary semantic undo.
- **Parameter contract:** versioned `ParameterSpec` declares type, unit/dimension, domain, default, formatting/parsing, step policy, precision modes, snapping, out-of-range policy, cyclicity, and accessible semantics.
- **Parameter modality invariant:** same canonical value through pointer, touch, Pencil, keyboard, typed entry, assistive action, or controller produces the same `SetParameter` command and project state.
- **Interactive transaction:** `begin → preview* → commit | cancel`; only commit creates a semantic revision and one undo unit.
- **No global parameter defaults supported:** coarse/fine factors, decimal precision, nudge step, snapping threshold, and clamp/wrap behavior must be parameter-specific and reconciled with DR-08.
- **Type-aware controls required:** rational time, integer count, real scalar, probability, cyclic phase/angle, seed, enum, and vector must not collapse into one generic slider.
- **Rotary-control rule:** use only where angular manipulation or hardware transfer is semantically meaningful.
- **Accessibility hard gates:** 100% designated core keyboard paths; 100% essential drag alternatives; zero critical color-only states; programmatic error/status announcements; reduced-motion information parity.
- **Non-color state requirement:** use at least two non-color channels among text, semantic role, icon, pattern, stroke, or structural marker.
- **iPad architecture:** recompose rather than scale; one dominant surface; bottom/contextual controls; portrait one-surface-plus-sheet; shared project/command semantics.
- **Input adaptation:** finger for broad manipulation; Pencil for finer mechanics but no exclusive semantics; full keyboard command access; pointer/trackpad enhancement; assistive semantic navigation.
- **Touch-size evidence boundary:** WCAG criterion represented by DR-11 is 24×24 CSS pixels with conditions/exceptions; AGL’s proposed 44–48 logical-point range is provisional and must be device-tested.
- **Onboarding:** runnable examples, persistent Context Help, visible commands, shortcut/gesture hints; no long mandatory tour; no essential hover or undocumented gesture.
- **Design-system deltas:** semantic content/source states; graph port/edge states; primary/linked/upstream/downstream selection; provenance source/snapshot/changed; touch/pointer targets; coarse/normal/fine precision; compact/normal/touch density; reduced-motion tokens.
- **Required reusable components:** `WorkspaceSwitcher`, `PanelDock`, `PanelToggle`, `ParameterField`, `PrecisionHUD`, `TypedPort`, `GraphEdgePreview`, `GraphNavigator`, `ContentStateBadge`, `GeneratedRegion`, `SnapshotRegion`, `ProvenanceStrip`, `ProvenanceInspector`, `LinkedSelectionMarker`, `StatusBar`, `DiagnosticBanner`, `ContextHelp`, `CommandPalette`, `MaterializeSheet`.
- **Required screens:** shell panel states; P0 Euclidean and Infinite Staircase Explore; Compose with live/snapshot/edited/changed material; Inspect cross-highlight; valid/invalid/keyboard graph connection; materialization lifecycle; iPad landscape/portrait/Pencil/keyboard; accessibility focus/non-drag/non-color/reduced-motion.
- **Hard test oracles:** workspace semantic neutrality; invalid-edge zero; materialization source retention; snapshot payload immutability; semantic-digest currentness; missing/detached distinction; derivative identity; one-gesture-one-undo; modality equivalence; layout/evaluation independence; cross-view selection; non-color semantics; accessible diagnostics.
- **Golden fixtures:** G-DR11-01 material lifecycle; G-DR11-02 typed edge matrix; G-DR11-03 parameter modality; G-DR11-04 workspace neutrality; G-DR11-05 accessibility vocabulary.
- **Cross-platform conformance:** project schema, receipts, semantic payload hashes, type diagnostics, command IDs, parameter values, selection IDs, source status, undo behavior, and export receipt references must agree across web and Swift; pixels and platform accessibility APIs need not.
- **Provisional usability targets:** 80% unaided intentional result; 85% exact-entry discovery; 90% valid connection and state classification; 90% materialization success; 85→95% source-change prediction; ≤15-second median source trace; <5% accidental touch activation; <1 median lost-navigation incident. These are calibration targets, not external benchmarks.
- **Immediate ADRs:** semantic workspace shell; procedural material/source-status model; type-directed graph editing; unified parameter command; global selection; explicit causal dependencies; user-authored nonsemantic graph layout; accessibility/input parity.
- **Immediate backlog impacts:** modify AGL-010/011/012/020/021/022/024/027/030/032/034/035/036/051/053/132; add parameter framework, dependency-digest service, material lifecycle fixtures, shell component contract, and DR-11 register entry.
- **M1 gates:** schema, migrations, command transactions, graph typing, dependency digest, selection, shell/session separation.
- **M2 gates:** P0 shared shell, materialization, state semantics, graph feedforward, Inspect trace, formative usability/accessibility calibration.
- **M6 gates:** representative validation, calibrated thresholds, cross-browser/native/accessibility performance, release claims.
- **Cross-run dependencies:** DR-03 for render/realtime/offline equality and generations; DR-08 for units/control/causality/constraint semantics; native/DR-12 for Swift shell/document/undo/accessibility projection; DR-01/02 for P0 mathematical controls and claims; DR-04/05/06/07/09 for P1 Explore projections; AGL-130/131/045 for export conversion and receipt manifests.
- **Unresolved critical questions:** source-recipe retention strategy; exact materialization payload types; preview-versus-commit evaluation boundary; public operation terminology; edited-derivative identity; export provenance sidecar; actual UI/UX spec diff; floor-device latency budgets; accessibility validation populations.
- **Do not claim:** optimality, proven beginner/expert usability, empirically validated four-state styling, industry-standard thresholds, universal graph layout, guaranteed accessibility from semantic conformance, 44/48-point guarantees, or realtime/offline audio identity not established by the audio architecture.
- **Final integration decision:** accept DR-11 as architecture-shaping evidence. Freeze the shared shell, command parity, type-directed graph, linked-selection, source-retaining materialization, and accessibility invariants now. Keep exact visual styling, control sensitivity, panel dimensions, touch size, terminology, and human-performance thresholds explicitly provisional.

#AuralGeometryLab #DR11 #MusicToolUX #InteractionArchitecture #ProgressiveDisclosure #NodeGraph #Provenance #Accessibility #iPadUX #DeterministicSystems

*Approximate conversation context processed, including the research report and integration work: ~145,000–165,000 tokens.*