# Aural Geometry Lab — DR-09 Research Integration Packet

**Date:** 2026-08-18  
**Research input:** DR-09 — *Exact Penrose Tiling Generation, Adjacency, Traversal, and Musical Sequencing*  
**Disposition:** Architecture-ready with artifact-recovery and cross-run conditions  
**Primary backlog scope:** AGL-120 through AGL-124  
**Primary milestone:** M5 — Aperiodic geometry and full studio beta

## Source and authority boundary

This packet treats the completed DR-09 report as the primary research input, reconciled against the current AGL backlog, frontier-run register, lab manifest, program plan, and research register. 
No new web research was performed. This is intentionally a post-research architecture pass, not a second evidence-discovery run. External mathematical claims below inherit the citations and source hierarchy already assembled in DR-09: Penrose, de Bruijn, D’Andrea, the Bielefeld Tilings Encyclopedia, Baake and Grimm, and the cited PRX graph analysis.

The Research Foundry public-platform design specification was loaded in the conversation but belongs to a separate program and does not govern AGL geometry, project, or research-integration semantics.

## TL;DR

DR-09 successfully resolves the principal mathematical choice: AGL should generate P3 rhombs from a certified regular de Bruijn pentagrid, using integer addresses and exact \(\mathbb Q(\phi)\) predicates for topology.

The architecture should **not**, however, copy the report’s proposed operator schema literally. It must separate the infinite tiling configuration, finite evaluation query, and non-semantic viewport. It should also separate the geometry identity hash from matching-decoration and implementation versions.

AGL-120 is mathematically unblocked, but it should not be marked done until the referenced golden-fixture bytes, prototype source, regularity certificate, legal vertex-star corpus, and matching-decoration table are checked into the repository and independently regenerated. The report’s referenced JSON fixture is not present among the currently mounted artifacts; only its summary and hashes are recoverable from the report.

The greatest unresolved architecture decision is whether the exact number kernel is shared across TypeScript and Swift through a systems core or independently implemented with strict conformance fixtures. That must be reconciled with native/shared-core research before native architecture freezes.

---

# 1. Executive Decision Summary

| # | Decision | Disposition | Classification | Why |
|---:|---|---|---|---|
| 1 | Use a regular de Bruijn pentagrid as the production construction. | **ADOPT** | Established evidence + engineering recommendation | It supplies direct finite-region enumeration, stable line-address identities, exact adjacency, and an authoritative theorem-backed route to P3 rhombs. Inflation-first methods are less suitable for viewport-driven generation. |
| 2 | Use P3 thick/thin rhombs as canonical tiles. | **ADOPT** | Established evidence | Convex unit-edge rhombs make edge identity, adjacency, clipping, picking, matching rules, and graph construction substantially cleaner than kite/dart geometry. |
| 3 | Use Robinson triangles as a hierarchy/composition oracle rather than the primary region generator. | **ADOPT** | Established evidence + engineering recommendation | Robinson triangles expose substitution ancestry well but would make viewport identity depth-dependent if used as the main generator. |
| 4 | Use a 5D cut-and-project implementation as an independent computational oracle. | **ADOPT WITH CONDITIONS** | Established evidence + prototype evidence | It has a different implementation path from grid-intersection enumeration, but the two methods are mathematically related. Treat this as failure-mode diversity, not fully independent mathematical evidence. |
| 5 | Represent topology through integer pentagrid addresses and exact \(\mathbb Q(\phi)\) arithmetic. | **ADOPT** | Established mathematical basis | Vertex, tile, edge, orientation, strip membership, and adjacency decisions can be exact. No tolerance-based canonicalization is needed. |
| 6 | Permit Float64 or Float32 only in rendering, spatial broad phases, and pointer projection. | **ADOPT** | Strong engineering implication | Floating representations must never decide vertex equality, shared edges, matching legality, overlap suppression, or traversal ties that enter persisted output. |
| 7 | Use \(\gamma=(0,1/5,2/5,-1/5,-2/5)\) as the sole MVP phase. | **ADOPT WITH CONDITIONS** | Exact derivation in DR-09 | DR-09 provides a ten-triple regularity certificate. The machine-readable certificate and exact evaluator still need repository check-in. |
| 8 | Expose arbitrary phase editing in MVP. | **REJECT** | Engineering recommendation | An arbitrary phase can be singular or near a singular boundary and would invalidate simple identity, matching, and finite-query assumptions. Admit only versioned, certified presets. |
| 9 | Define a finite patch as a query into one configured infinite tiling. | **ADOPT** | Architectural consequence | Zooming, panning, clipping, and region size must not create different mathematical tilings or alter IDs. |
| 10 | Represent clipped polygons as tiles or graph nodes. | **REJECT** | Exact semantic requirement | Clip fragments are rendering artifacts. Synthetic viewport edges cannot participate in adjacency or matching. |
| 11 | Build adjacency exclusively from canonical shared edge IDs. | **ADOPT** | Exact finite property | Coordinate proximity, nearest-neighbor search, and endpoint epsilon are unnecessary and less reliable. |
| 12 | Use globally stable mathematical IDs derived from configuration and exact addresses. | **ADOPT WITH CONDITIONS** | Engineering recommendation | The report’s scheme is strong, but AGL should split `geometryConfigHash`, decoration convention, producer instance, and implementation version to prevent unnecessary identity churn. |
| 13 | Treat matching-rule validation as optional decorative QA. | **REJECT** | Established mathematical requirement | Undecorated thick/thin rhombs permit non-Penrose arrangements. A production implementation needs a versioned legal-star and edge-decoration corpus. |
| 14 | Ship bounded deterministic traversals with explicit termination and repeat policies. | **ADOPT** | Engineering recommendation | Every traversal must become a finite reproducible value before it can enter event generation, persistence, export, or offline rendering. |
| 15 | Embed pitch scales, quantization, or harmony directly in the Penrose geometry operator. | **REJECT** | Cross-run architecture requirement | DR-09 should emit geometry and graph features. DR-08 owns normalization, quantization, musical constraints, provenance, and evaluation. |
| 16 | Ship Ribbon Weave, Hierarchy Pulse, and Vertex-Star Walk as the initial mapping presets. | **ADOPT WITH CONDITIONS** | Engineering recommendation | They preserve real Penrose features, but Hierarchy Pulse still requires a canonical Robinson ancestry contract and all three must expand into explicit DR-08 mapping graphs. |
| 17 | Use periodic rhomb and square-grid controls in guided comparisons. | **ADOPT** | Strong experimental-design inference | They allow geometry or graph structure to change while keeping traversal, event count, mapping, quantization, voices, and transport fixed. |
| 18 | Freeze the DR-09 performance numbers as final product limits. | **DEFER** | Provisional engineering estimates | The 10,000-tile, 100 ms, memory, and traversal budgets are sensible starting hypotheses but require FR-08 calibration on the declared browser and hardware matrix. |
| 19 | Mark AGL-120 complete immediately. | **ADOPT WITH CONDITIONS** | Program-governance decision | The geometry decision is resolved, but completion requires repository-resident fixture bytes, prototype/oracle code, source corpus, certificate, and reproducible receipts. |
| 20 | Claim that a rendered finite patch proves nonperiodicity or global self-similarity. | **REJECT** | Scientific-claims requirement | Finite patches can demonstrate finite invariants and illustrate theorem-backed properties; they cannot independently prove global aperiodicity. |

The research register currently records DR-09 as `chartered`, depending on DR-08 and unblocking AGL-120 through AGL-123. The lab manifest still records the Penrose sequencer as research-gated, while M5 requires accepted Penrose geometry. Those states should be updated after the integration gates identified here are completed. 
---

# 2. Evidence → Decision Matrix

| Finding / evidence | Evidence strength | Engineering implication | Recommended decision | Confidence | Source(s) |
|---|---|---|---|---|---|
| A regular pentagrid dualizes into a P3 Penrose rhomb tiling. | **Established theorem-level basis** | Production correctness can be rooted in the construction rather than inferred from local appearance. | Use regular pentagrid generation as the canonical source operator. | Very high | de Bruijn and D’Andrea, as synthesized in DR-09. |
| Pentagrid intersections can be classified with integer line indices and \(\mathbb Q(\phi)\) strip arithmetic. | **Established derivation** | Planar Float64 line intersection is unnecessary for topology. | Implement a small exact quadratic-field kernel. | Very high | DR-09 equations and exact construction. |
| The chosen phase has an exact ten-triple regularity certificate. | **Exact report derivation** | The MVP can avoid singular triple-grid intersections without runtime guessing. | Accept `dr09-default-v1`; persist its certificate and hash. | High, pending independent regeneration | DR-09 regularity table. |
| A tile can be identified by the pair of pentagrid lines whose intersection generates it. | **Strong mathematical consequence** | Tile identity remains stable under viewport, pan, zoom, chunking, and cache changes. | Use normalized line-pair addresses for local tile identity. | Very high | DR-09 identity model. |
| A vertex is represented by a restricted five-integer mesh tuple. | **Established for the selected regular, sum-zero configuration** | No coordinate tolerance or four-basis reduction is needed for canonical identity. | Persist the full tuple; do not persist a rounded point as identity. | High | DR-09 exact identity discussion. |
| Every tile edge changes one mesh coordinate by \(\pm1\). | **Exact construction property** | Canonical edge length and edge direction family are symbolic. | Validate edge vectors in tuple space; render length is secondary. | Very high | DR-09 construction equations. |
| Canonical edge equality is exact endpoint-ID equality. | **Exact finite property** | Adjacency is an \(O(T)\) edge-map operation. | Ban nearest-neighbor and epsilon-based adjacency. | Very high | DR-09 adjacency algorithm. |
| Clipping introduces synthetic boundaries unrelated to tiling topology. | **Exact semantic implication** | Clipped fragments cannot be geometry entities or graph nodes. | Keep clipping entirely in the visualization projection layer. | Very high | DR-09 finite-region semantics. |
| The report’s two prototypes agree on all 160 fixture vertices. | **Strong prototype evidence** | The primary generator has a useful cross-check with different implementation failure modes. | Require both implementations in the repository acceptance corpus. | Medium-high until source and fixture bytes are reproduced | DR-09 prototype account. |
| The reported fixture contains 129 tiles, 160 vertices, 288 edges, and satisfies \(V-E+F=1\). | **Golden result reported, but not currently reproducible from supplied bytes** | These values can be acceptance oracles only after the fixture is recovered. | Preserve the values and hashes, but block “golden passed” status until bytes regenerate them. | Medium | DR-09 golden summary. |
| The small fixture’s thick:thin ratio is 83:46, not \(\phi:1\). | **Exact fixture statement** | Finite-window ratios cannot be asserted as exact global frequencies. | Test convergence trends only on growing boundary-negligible regions. | High | DR-09 golden summary and inflation derivation. |
| Matching legality requires decorations or equivalent legal-star data. | **Established mathematical requirement** | Shape-only validation would accept decorative non-Penrose arrangements. | Check in a versioned legal-star and edge-mark table. | Very high | DR-09 matching section. |
| Passing local matching checks does not prove arbitrary finite-patch extendability. | **Established caveat** | A user-edit validator cannot claim global legality. | Keep arbitrary topology editing and extension certification out of MVP. | Very high | DR-09/D’Andrea caveat. |
| The rhomb-edge skeleton is bipartite with degrees 3–7; the tile-adjacency dual need not be bipartite. | **Independent graph evidence** | The two graph families require separate schemas, validators, and educational labels. | Name them `tilingSkeleton` and `tileAdjacency`; never expose a generic ambiguous “Penrose graph.” | High | DR-09 synthesis of graph literature. |
| Radial/angular traversal ties can be resolved exactly. | **Strong engineering derivation** | Persisted event order need not depend on `atan2`, rendering precision, or browser sort quirks. | Use exact squared-radius/cross-product comparators plus final ID ties. | High | DR-09 traversal catalog. |
| User-drawn paths are inherently numeric, but their resolved tile sequence can be frozen. | **Strong engineering inference** | Replaying a gesture should not silently reproject under different camera or raster conditions. | Store resolved TileIDs, source configuration, query hash, and projection version. | High | DR-09 traversal guidance. |
| Penrose sonification should expose intrinsic features before musical shaping. | **Cross-run architecture conclusion** | Geometry, traversal, quantization, constraints, and event generation remain inspectable stages. | Feed typed Penrose features into DR-08 operators. | Very high | DR-09 and DR-08 integration packet. |
| Performance budgets in DR-09 are explicitly proposals, not literature results. | **Engineering hypothesis** | They are useful benchmark targets but cannot be product claims or final support limits. | Adopt as provisional benchmark profiles and run FR-08. | High | DR-09 performance plan. |
| AGL already has seeds, stable-ID utilities, worker evaluation, budgeting, typed ports, projection, and invariant-test backlog seams. | **Current program authority** | DR-09 should extend the common architecture rather than create a private Penrose runtime. | Implement through AGL-005, AGL-020–025, AGL-050/051, and AGL-133. | Very high | AGL backlog. |

---

# 3. Architecture Consequences

| Affected subsystem | Exact architectural implication | Contract change? | Dependencies | Migration impact if delayed | Recommendation |
|---|---|---|---|---|---|
| Canonical project model | Persist an exact Penrose **configuration**, not a generated patch. Store phase values as normalized rational strings. | **Public project contract** | AGL-010, AGL-011 | High: changing from float phases or persisted coordinates later would require identity-breaking migration. | Freeze before M1 project-schema closure. |
| Project model | Separate `PenroseConfiguration`, `GeometryQuery`, and `ViewState`. The report’s single parameter object incorrectly mixes these concerns. | **Public project and operator contract** | AGL-010, AGL-020 | High: viewport-driven IDs or cache keys would contaminate saved projects. | Make configuration a graph-node parameter, query an evaluation input, and camera a UI state object. |
| Stable identity | Use `geometryConfigHash + exact local address`; qualify references with producer node/instance ID. | **Public entity-reference contract** | AGL-005, AGL-036, AGL-141 | High: linked selection, overrides, provenance, and frozen paths all depend on this. | Add a generic `GeneratedEntityRef {producerNodeId, localEntityId}`. |
| Hash namespace | Geometry identity must not change merely because an arrow convention, renderer, golden corpus, or implementation version changes. | **Public identity contract** | AGL-005, AGL-011 | Very high: unnecessary hash churn would orphan selections and snapshots. | Split geometry hash, decoration convention, operator semantic version, and implementation build. |
| Exact numeric core | Add exact normalized rationals and \(\mathbb Q(\phi)\) comparison/ceil/sign primitives. | Internal kernel; cross-platform semantic contract | AGL-006, AGL-143, AGL-146 | High: a TypeScript-only ad hoc kernel becomes hard to reconcile with Swift. | Define language-neutral conformance first; implementation placement awaits native/shared-core decision. |
| Geometry subsystem | Canonical vertices remain five-tuples; Float64 positions are cached projections only. | Internal geometry contract, public inspector semantics | AGL-050, AGL-051, AGL-053 | High: tolerance-merged vertices would corrupt topology irreversibly. | Make exact address mandatory on every canonical geometry primitive. |
| Typed operator graph | Add distinct ports for canonical geometry, tile adjacency, semantic features, optional hierarchy, and validation. | **Public operator/port catalog** | AGL-004, AGL-020, AGL-021 | High: one generic blob port would force downstream reverse engineering. | Version all five outputs; clipped drawing primitives remain outside them. |
| Worker/runtime execution | Exact generation, adjacency, oracle validation, and traversal execute in a cancellable geometry worker. | Internal runtime contract | AGL-023, AGL-025 | Medium-high: main-thread implementations would later require architectural relocation. | Use revisioned requests, progress, deadlines, and stale-result suppression. |
| Evaluation cache | Cache by configuration, exact world chunk, sorted address set, hierarchy level, and semantic versions; exclude camera zoom. | Internal cache contract | AGL-024 | Medium: bad keys cause identity drift or stale validation. | Freeze key material and determinism tests before optimization. |
| Geometry query | A query returns a core set plus a complete adjacency/validation halo and explicit completeness status. | **Public output semantics** | AGL-020, AGL-023, AGL-025 | High: absent neighbors might otherwise be mistaken for real boundaries. | Require `haloComplete`, `truncated`, and per-edge boundary status. |
| Clipping | `ClipFragment` references a full source tile and carries tagged synthetic clip edges. | Visualization projection contract | AGL-050, AGL-051 | High: false graph edges and matching results become difficult to remove later. | Enforce at the type level: clip edges cannot satisfy `CanonicalEdgeID`. |
| Adjacency graph | Build from exact shared canonical edges; distinguish tile adjacency from the vertex-edge tiling skeleton. | **Public graph schema** | AGL-122, AGL-050 | High: graph algorithms and claims would be attached to the wrong graph. | Use explicit graph-kind discriminators. |
| Traversal model | Traversals are finite, versioned objects with deterministic ordering, termination reason, repeat policy, seed, and source graph hash. | **Public pattern/operator contract** | AGL-003, AGL-020, AGL-025, AGL-123 | High: traversal changes would silently alter projects and exports. | Persist traversal specifications; materialized results carry exact step lineage. |
| Rational musical time | Geometry emits ordered steps, not seconds. Step-to-beat mapping enters the existing rational-time/event pipeline. | Event/pattern contract extension | AGL-002, AGL-003, DR-08 | Medium-high: embedding milliseconds in traversal would couple geometry to transport. | Preserve exact step index and rational duration until RenderPlan conversion. |
| Event/pattern model | Each generated event should resolve to a traversal step and exact tile/edge/vertex features. | **Public provenance contract** | AGL-003, AGL-035, AGL-036 | High: “why this note?” cannot be reconstructed reliably later. | Add structured Penrose lineage references to source events. |
| Sonification/control signals | Penrose features enter DR-08 as typed categorical, ordinal, graph, circular, or exact-index dimensions. | Shared mapping contract | DR-08, AGL-112, AGL-123 | High: private mapping logic would fragment cross-lab semantics. | No pitch, scale, register, or quantizer fields in Penrose geometry. |
| Render plan | Audio adapters receive only resolved, bounded events and mapping targets. They never run geometry or graph traversal. | Render-plan boundary | AGL-041, DR-03 | High: realtime/offline paths could diverge if they traverse independently. | Require exact event-plan identity across realtime and offline front ends. |
| Realtime audio | Geometry recomputation produces a new evaluation/render generation; audio scheduling state remains derived. | Runtime behavior, not project state | AGL-012, AGL-031, AGL-041 | Medium | Reuse DR-03 generation/cancellation semantics. |
| Offline rendering | A frozen traversal plus the same mapping graph must yield the same event IDs/order and target parameters as realtime. | Export/reproducibility contract | AGL-041, AGL-045 | Medium-high | Require semantic equality, not cross-browser PCM identity. |
| Generated vs frozen material | Live geometry/traversals may regenerate; frozen tile sequences and resulting clips do not silently reproject or change. | **Public project state contract** | AGL-027, AGL-032, AGL-145 | Very high | Preserve generator, graph revision, configuration hash, query, traversal version, sequence hash, and source lineage. |
| Command/undo architecture | Configuration edits, preset changes, traversal edits, path projection, and freeze are commands. Worker/cache results are derived state. | Command contract | AGL-012, AGL-145 | High | One user gesture produces one atomic semantic command. |
| MIDI export | Export a bounded materialized event sequence. Penrose topology has no native MIDI representation. | Exporter semantics | AGL-130 | Low-medium | Include geometry/traversal provenance in export manifest or project sidecar. |
| MusicXML export | Export only supported notation after explicit quantization; retain export losses separately from geometry/mapping provenance. | Exporter semantics | AGL-131, DR-08 | Medium | Never imply MusicXML preserves the Penrose structure itself. |
| Swift/native client | Swift must reproduce exact IDs, addresses, graph edges, traversals, and discrete mapping decisions. | **Cross-platform contract** | AGL-143, AGL-146, DR-12, DR-15 | Very high | Decide shared core versus duplicated exact kernels before native implementation expands. |
| WebAssembly/shared core | A small Rust/C++/other shared exact kernel is plausible but not mandated by DR-09. | Deferred architecture decision | DR-15 | Medium for web MVP; high for M7 | Preserve a language-neutral kernel interface now. |
| Provenance | Record construction ID, geometry hash, phase preset/certificate, operator version, query completeness, oracle version/results, traversal semantics, seed, budget, truncation, mapping graph, and event lineage. | **Public provenance contract** | AGL-020, AGL-035, AGL-045 | Very high | Treat provenance as structured records, not inspector prose. |
| Accessibility | Exact tile, graph, validation, and traversal data must have ordered text/table descriptions and keyboard navigation. | Hard product contract | AGL-053, AGL-132, AGL-150 | High | Accessibility consumes the same semantic model as visuals and sound. |

The M1 milestone is where project round-trip, typed graph evaluation, and provenance become foundational; M5 is where Penrose geometry and all seven labs become product-complete. That makes the schema, ID, port, and provenance consequences above **M1 decisions**, even though the full lab ships at M5.

---

# 4. Proposed ADRs

## ADR-PEN-001: Canonical Penrose Construction and Representation

**Context**

AGL needs deterministic finite-region generation, stable IDs, exact adjacency, matching validation, and pedagogical access to inflation and cut-and-project structure.

**Decision**

Use a certified regular de Bruijn pentagrid as the production construction. Emit canonical P3 thick/thin unit-edge rhombs. Use Robinson triangles as a derived hierarchy representation and a 5D cut-and-project implementation as a validation oracle.

**Alternatives considered**

- P3 inflation/composition as primary generation.
- Robinson-triangle substitution as primary generation.
- P2 kite/dart generation.
- Direct cut-and-project enumeration.
- Decorative quasiperiodic image generation.

**Consequences**

- Stable viewport-independent line-address identities.
- Direct finite-region enumeration.
- Simple convex-tile adjacency.
- A small exact algebraic kernel is required.
- Hierarchy becomes derived rather than identity-defining.

**Risks**

- Pentagrid implementation errors can still produce plausible images.
- Cut-and-project and pentagrid implementations may share convention errors.
- The hierarchy derivation is not yet specified to implementation depth.

**Evidence**

de Bruijn’s construction and D’Andrea’s synthesis, plus DR-09’s independent prototype comparison.

**Confidence**

Very high for the construction choice; medium-high for the current prototype receipt until source artifacts are reproduced.

---

## ADR-PEN-002: Exact Topological Kernel and Rendering Boundary

**Context**

Tolerance-based canonicalization can merge distinct vertices, invent edges, alter matching results, or change persisted traversal order.

**Decision**

Represent exact decision values with integers, normalized rationals, and \(\mathbb Q(\phi)\). Keep canonical vertices as five-tuples. Permit Float64 projection only for display, broad-phase indexing, and pointer interaction. No floating tolerance may decide topology.

**Alternatives considered**

- Controlled Float64 with spatial hashing.
- Arbitrary-precision decimal coordinates.
- General cyclotomic-number objects throughout the renderer.
- Symbolic history plus tolerance-based endpoint merging.

**Consequences**

- Exact IDs and predicates.
- Smaller error surface than a general algebraic geometry system.
- Cross-language conformance becomes a mandatory architecture concern.

**Risks**

- Incorrect `sign`, `compare`, or `ceil` in \(\mathbb Q(\phi)\).
- BigInt performance differences among runtimes.
- Duplicated TypeScript and Swift implementations can diverge.

**Evidence**

DR-09 exact strip equations, determinant reduction, and zero-tolerance policy.

**Confidence**

Very high for semantics. Implementation placement requires cross-run reconciliation with DR-15.

---

## ADR-PEN-003: Penrose Configuration and Entity Identity

**Context**

DR-09 proposes configuration-scoped IDs, but the integration must prevent decoration, renderer, implementation, and camera changes from unnecessarily changing mathematical identity.

**Decision**

Define:

```text
geometryConfigHash =
  hash(
    constructionSemanticsVersion,
    normalizedPhase,
    familyBasisConvention,
    canonicalEdgeScale
  )

localTileId   = normalized grid-line pair
localVertexId = canonical five-tuple
localEdgeId   = sorted canonical vertex pair

entityRef = producerNodeId + geometryConfigHash + localEntityId
```

Keep `matchingConvention`, validation-corpus version, implementation build, camera, query region, and render options outside `geometryConfigHash`.

**Alternatives considered**

- Hash the complete operator parameter object.
- Use only local addresses without a configuration namespace.
- Use rendered coordinates.
- Include producer node ID inside the mathematical local ID.

**Consequences**

- Same mathematical entity can be recognized across queries and caches.
- Two graph nodes using the same geometry remain distinguishable through `producerNodeId`.
- Decoration convention upgrades do not orphan selections.

**Risks**

- Omitting a genuinely geometry-changing semantic from the hash.
- Existing AGL-005 canonicalization may require extension.

**Evidence**

DR-09 identity design plus integration analysis of project and matching-version semantics.

**Confidence**

High.

---

## ADR-PEN-004: Finite Query, Halo, and Clipping Semantics

**Context**

A finite viewport is not itself a finite Penrose tiling. Query boundaries can hide real neighbors, while clipping creates synthetic visual edges.

**Decision**

Model generation as:

```text
PenroseConfiguration
        +
GeometryQuery {
  coreRegion,
  inclusion,
  adjacencyHaloPolicy,
  budgets
}
        →
GeometryQueryResult {
  canonical full tiles,
  exact edges,
  completeness,
  truncation,
  boundary classifications
}
```

Clip only in the visualization adapter. A `ClipFragment` can reference a canonical tile but can never satisfy canonical geometry or adjacency interfaces.

**Alternatives considered**

- Generate and persist clipped polygons.
- Treat viewport edges as open graph boundaries.
- Regenerate through substitution depth per zoom level.
- Infer missing neighbors from nearest visible tiles.

**Consequences**

- Clipping cannot create false adjacency.
- Boundary absence becomes explicit as `outsideQuery`.
- Panning and zooming preserve IDs.
- Validation fixtures can use exact regions distinct from runtime presentation queries.

**Risks**

- Incomplete or incorrectly bounded halos.
- Ambiguity over whether a query is authored project state or transient view state.

**Evidence**

DR-09 finite-query bound and clipping design.

**Confidence**

Very high for semantics; high for the proposed 2.8 pentagrid-space enumeration halo pending implementation proof tests.

---

## ADR-PEN-005: Matching Rules, Validation Oracles, and Scientific Status

**Context**

Shape-only rhomb patches can look correct while violating Penrose matching. Local legality also does not establish infinite extendability.

**Decision**

Validate generated patches through layered, versioned oracles:

1. exact shape and tuple-space invariants;
2. exact edge multiplicity and adjacency;
3. exact complete vertex-star encoding against a checked-in legal corpus;
4. edge-decoration compatibility under `penrose-p3-dandrea-2023`;
5. cut-and-project acceptance;
6. optional Robinson hierarchy cross-check;
7. deterministic golden hashes.

Every validation result declares scope: `exactFinite`, `oracleAgreement`, `asymptoticTrend`, or `theoremAttributed`.

**Alternatives considered**

- Screenshot goldens.
- Float overlap area thresholds.
- Shape counts only.
- Local matching checks treated as proof of global legality.

**Consequences**

- Decorative approximations cannot pass as exact geometry.
- User-facing claims can accurately state what was tested.
- The validation corpus becomes a versioned dependency.

**Risks**

- The report does not supply the complete machine-readable legal-star and edge-decoration tables in the currently retrievable artifacts.
- Oracle implementations may share a coordinate-convention bug.

**Evidence**

DR-09 property and matching sections. 
**Confidence**

Very high for the decision; artifact completeness remains a blocking condition.

---

## ADR-PEN-006: Typed Penrose Ports and Persistence Boundary

**Context**

Downstream traversal, visualization, accessibility, and mapping require different semantic products. A single geometry blob would force consumers to reverse-engineer them.

**Decision**

Expose versioned ports:

```text
geometry2d
tileAdjacencyGraph
penroseFeatureTable
penroseHierarchy
geometryValidation
```

Persist operator configuration and authored traversal specifications, not regenerated patch data. Permit materialized patch/sequence storage only through explicit freeze/snapshot operations with lineage.

**Alternatives considered**

- Generic JSON output.
- One geometry-plus-metadata port.
- Persist every visible patch in the project.
- Let each preset inspect raw geometry privately.

**Consequences**

- Strong type checking.
- Shared cross-lab mapping.
- Smaller projects and deterministic regeneration.
- Clear separation between generated and frozen material.

**Risks**

- More schema definitions.
- Hierarchy output remains optional until its canonical address is resolved.

**Evidence**

DR-09 operator proposal and AGL’s typed operator architecture. 
**Confidence**

Very high.

---

## ADR-PEN-007: Deterministic Traversal and Gesture Materialization

**Context**

Graph walks, spatial sweeps, seeded paths, and user gestures can otherwise depend on iteration order, floating ties, or changing viewport state.

**Decision**

Every traversal is a finite value with:

- graph/configuration hash;
- traversal kind and semantic version;
- start/target entities;
- deterministic neighbor/tie ordering;
- repeat policy;
- seed when stochastic;
- explicit maximum steps or search budget;
- termination reason;
- exact ordered entity sequence;
- provenance.

A user-drawn path is numerically projected once; the resulting TileID sequence is persisted when committed or frozen.

**Alternatives considered**

- Re-evaluate gestures on every render.
- Use JavaScript collection iteration order as a tie rule.
- Permit unbounded random or coverage walks.
- Store only centroids.

**Consequences**

- Exact realtime/offline event ordering.
- Reproducible export.
- Explicit stale/frozen semantics after geometry changes.

**Risks**

- Edge/vertex-touch degeneracies for path projection still need a canonical rule.
- Hierarchy traversal depends on unresolved hierarchy addressing.

**Evidence**

DR-09 traversal catalog.

**Confidence**

High.

---

## ADR-PEN-008: Penrose-to-Sonification Boundary and Periodic Controls

**Context**

Musical mappings can either reveal intrinsic structure or impose unrelated decoration.

**Decision**

Penrose operators emit exact semantic features. DR-08 operators perform transformation, normalization, quantization, musical constraint, and event generation. Initial presets are explicit graph profiles:

- Ribbon Weave;
- Hierarchy Pulse;
- Vertex-Star Walk.

Each includes a periodic control configuration using the same downstream mapping and audio chain.

**Alternatives considered**

- Hard-code pitches and rhythms inside the Penrose operator.
- Map TileID hashes directly to notes.
- Compare against an unrelated control with different event count or synthesizer.

**Consequences**

- “Why this note?” can distinguish geometry from musical shaping.
- Periodic comparisons become scientifically interpretable.
- Presets remain editable and reusable across labs.

**Risks**

- No universal scale, register, gain, or timbral default is justified.
- Hierarchy Pulse cannot close until the hierarchy oracle is canonical.
- User studies would be required before claiming that a particular mapping makes aperiodicity audible.

**Evidence**

DR-09 mapping section and DR-08 integration contract. 
**Confidence**

Very high for the boundary; medium-high for the exact preset parameterizations.

---

## ADR-PEN-009: Geometry Worker, Caching, and Provisional Budgets

**Context**

Exact generation, validation, and traversal should not block the main interaction thread.

**Decision**

Use a dedicated geometry worker behind the common AGL evaluator. Cache exact configuration certificates, chunk-address sets, interned vertices, canonical tiles, adjacency, hierarchy, oracle results, and traversals. Transfer packed render geometry to the main thread. Treat DR-09’s numeric budgets as provisional until FR-08.

**Alternatives considered**

- Main-thread generation.
- SharedArrayBuffer as baseline.
- Persist all generated geometry.
- Zoom-dependent mathematical LOD.

**Consequences**

- Responsive panning and cancellation.
- Exact worker state with compact renderer buffers.
- Presentation LOD does not change mathematical identity.

**Risks**

- BigInt performance and structured-clone costs.
- Cache memory pressure.
- Provisional limits may be too strict or too loose.

**Evidence**

DR-09 performance and cache plan. 
**Confidence**

High for topology; medium for numeric budgets.

---

# 5. Mathematical / Behavioral Contracts

## 5.1 Exact scalar kernel

Let

\[
\phi=\frac{1+\sqrt5}{2},\qquad \phi^2=\phi+1.
\]

A production value in \(\mathbb Q(\phi)\) should use:

```ts
interface QPhi {
  /** Value = (a + b*phi) / d */
  a: bigint;
  b: bigint;
  d: bigint; // strictly positive
}
```

Canonical normalization:

```text
d > 0
gcd(abs(a), abs(b), d) = 1
zero = {a: 0, b: 0, d: 1}
```

Required exact operations:

```text
normalize
add / subtract
multiply
compare
sign
floor
ceil
integer membership
rational membership
serialization
```

`compare`, `sign`, `floor`, and `ceil` may not depend on a Float64 approximation. A conforming implementation may use certified rational bounds for \(\phi\), exact quadratic-field logic, or another proved algorithm, but every branch affecting topology must return the same result across implementations.

A useful implementation technique is to refine lower and upper rational convergents of \(\phi\) until \(a+b\phi\) has the same nonzero sign at both bounds. Because \(\phi\) is irrational, the process terminates unless \(a=b=0\).

## 5.2 Grid construction

Let

\[
\zeta=e^{2\pi i/5},\qquad u_j=\zeta^j,\qquad j\in\{0,1,2,3,4\}.
\]

For exact phase vector \(\gamma\),

\[
G_j=
\left\{
z\in\mathbb C:
\operatorname{Re}(z\zeta^{-j})+\gamma_j\in\mathbb Z
\right\}.
\]

The associated mesh index is

\[
N_j(z)=
\left\lceil
\operatorname{Re}(z\zeta^{-j})+\gamma_j
\right\rceil.
\]

The canonical tiling vertex represented by \(n=(n_0,\ldots,n_4)\) is

\[
P(n)=\sum_{j=0}^{4}n_j\zeta^j.
\]

For the selected regular sum-zero configuration:

\[
\sum_j\gamma_j=0,\qquad
\sum_j n_j\in\{1,2,3,4\}.
\]

## 5.3 Default-phase regularity certificate

The only MVP phase is

\[
\gamma=
\left(
0,\frac15,\frac25,-\frac15,-\frac25
\right).
\]

For each triple \(a,b,c\), write \(u_c=\alpha u_a+\beta u_b\). A triple intersection would require

\[
\gamma_c-\alpha\gamma_a-\beta\gamma_b\in\mathbb Z[\phi].
\]

DR-09 derives the following coefficients in the basis \(\{1,\phi\}\):

| Families | Coefficients |
|---|---:|
| \(0,1,2\) | \((3/5,-1/5)\) |
| \(0,1,3\) | \((-2/5,1/5)\) |
| \(0,1,4\) | \((-1/5,0)\) |
| \(0,2,3\) | \((1/5,0)\) |
| \(0,2,4\) | \((-2/5,2/5)\) |
| \(0,3,4\) | \((-2/5,1/5)\) |
| \(1,2,3\) | \((2/5,-2/5)\) |
| \(1,2,4\) | \((-1,3/5)\) |
| \(1,3,4\) | \((-3/5,1/5)\) |
| \(2,3,4\) | \((-1/5,1/5)\) |

No row has two integer coefficients, so none belongs to \(\mathbb Z[\phi]\); therefore no triple-family intersection exists.

The production preset must carry:

```ts
interface PenroseConfigurationCertificate {
  certificateType: "regular-pentagrid-no-triple-intersections";
  configurationHash: string;
  basis: "1,phi";
  tripleResults: readonly {
    families: readonly [number, number, number];
    aNumerator: string;
    bNumerator: string;
    denominator: string;
    isInZPhi: false;
  }[];
  verifierVersion: string;
}
```

## 5.4 Exact tile construction

For a tile generated by lines \((r,m_r)\) and \((s,m_s)\), where \(r<s\):

\[
n_r=m_r,\qquad n_s=m_s.
\]

For every remaining family \(j\), precompute exact coefficients

\[
u_j=\alpha_{rsj}u_r+\beta_{rsj}u_s,
\qquad
\alpha_{rsj},\beta_{rsj}\in\mathbb Z[\phi].
\]

Then

\[
t_j=
\alpha_{rsj}(m_r-\gamma_r)
+
\beta_{rsj}(m_s-\gamma_s)
+
\gamma_j
\]

and

\[
n_j=\lceil t_j\rceil.
\]

For the default phase,

\[
t_j=\frac{A+B\phi}{5}
\]

for integers \(A,B\). `Math.ceil(Number(t_j))` is nonconforming.

The four canonical vertices are:

\[
n,\quad
n+e_r,\quad
n+e_r+e_s,\quad
n+e_s.
\]

The implementation must order them counterclockwise using an exact orientation predicate.

## 5.5 Tile type and orientation

Define

\[
\delta=\min\bigl((s-r)\bmod5,\;5-((s-r)\bmod5)\bigr).
\]

Because \(r\ne s\), \(\delta\in\{1,2\}\).

Recommended exact classification:

```text
delta = 1 → thick rhomb
delta = 2 → thin rhomb
```

Recommended orientation-class convention:

\[
\operatorname{orientationClass}=(r+s)\bmod5.
\]

This convention is an **engineering recommendation**, not explicitly frozen by the report. It must be versioned and fixture-backed before becoming a public contract.

## 5.6 Canonical IDs

```text
geometry configuration:
  sha256(canonical normalized geometry semantics)

tile local ID:
  g<r>:<mr>/g<s>:<ms>
  where r < s

vertex local ID:
  v:<n0>,<n1>,<n2>,<n3>,<n4>

edge local ID:
  e:<lexicographically-lower-vertex-local-id>/<higher-id>
```

Persisted entity reference:

```ts
interface GeneratedEntityRef {
  producerNodeId: string;
  geometryConfigHash: string;
  entityKind: "tile" | "vertex" | "edge";
  localEntityId: string;
}
```

The following may **not** enter `geometryConfigHash`:

- viewport;
- zoom;
- pan;
- clipping rectangle;
- render quality;
- selection;
- validation status;
- matching-arrow convention;
- golden-corpus version;
- implementation build;
- worker/chunk/cache layout.

The hash serialization must reuse AGL-005’s accepted canonicalization. If AGL-005 does not define canonical normalized rational encoding, that contract must be extended before Penrose IDs are accepted.

## 5.7 Exact topology and tolerance policy

| Predicate | Required behavior |
|---|---|
| Vertex equality | Exact five-tuple equality |
| Tile equality | Exact normalized line-pair equality |
| Edge equality | Exact unordered endpoint-ID equality |
| Edge direction | Exact tuple difference \(\pm e_j\) |
| Edge length | Symbolically one |
| Tile type | Exact family-pair classification |
| Polygon orientation | Exact sign in the determinant field |
| Segment intersection | Exact orientation/endpoint predicates |
| Adjacency | Identical canonical EdgeID only |
| Matching | Exact versioned decoration/star rules |
| Acceptance window | Exact field predicate with boundary distinguished |
| Rendering | Float64/Float32 allowed |
| Picking | Screen-space tolerance allowed, but returned entity must resolve to an exact ID |

For render projection,

\[
x=\operatorname{Re}P(n),\qquad
y=\operatorname{Im}P(n).
\]

With

\[
S=\sum_j|n_j|,\qquad u=2^{-53},
\]

DR-09 proposes

\[
\epsilon_{\mathrm{coord}}
=
32u\max(1,S)
\]

in unit-edge world coordinates. This envelope may affect raster hit slop or conservative screen inclusion only. It may never merge canonical entities or excuse overlap.

## 5.8 Finite-query semantics

A production query consists of:

```ts
interface PenroseGeometryQuery {
  coreRegion: AABB;
  regionEncoding:
    | "float64-presentation"
    | "exact-rational-fixture";

  inclusion: "intersects";
  requestedOutputs: {
    geometry: boolean;
    adjacency: boolean;
    matching: boolean;
    hierarchy: boolean;
    validation: boolean;
  };

  haloPolicy:
    | {kind: "edge-neighbor"; rings: 1}
    | {kind: "full-local-star"; rings: 2};

  budgets: {
    maxTiles: number;
    maxVertices: number;
    deadlineMs?: number;
  };
}
```

Result:

```ts
interface PenroseGeometryQueryResult {
  geometryConfigHash: string;
  coreTileIds: readonly string[];
  haloTileIds: readonly string[];

  haloComplete: boolean;
  truncated: boolean;
  terminationReason:
    | "complete"
    | "tile-budget"
    | "vertex-budget"
    | "deadline"
    | "cancelled";

  edgeBoundaryStatus: ReadonlyMap<
    string,
    "shared"
      | "outsideQuery"
      | "invalidOpenEdge"
  >;
}
```

Normative rules:

1. A core adjacency result is authoritative only when `haloComplete=true`.
2. `outsideQuery` is not equivalent to “no neighbor exists.”
3. A truncated result may be rendered, but it cannot be described as a complete patch.
4. Matching-star validation runs only for vertices with a complete incident neighborhood.
5. Zoom and camera changes cannot alter mathematical IDs.

## 5.9 Clipping contract

```ts
interface ClipFragment {
  sourceTileRef: GeneratedEntityRef;
  clipPolygonFloat64: Float64Array;
  clipBoundaryEdges: readonly {
    start: readonly [number, number];
    end: readonly [number, number];
    clipBoundary: true;
  }[];
}
```

A `ClipFragment`:

- is never a `PenroseRhomb`;
- has no independent TileID;
- cannot enter `tileAdjacencyGraph`;
- cannot satisfy matching rules;
- cannot be frozen as exact geometry without retaining the source tile reference;
- may be used for display/export rasterization only.

## 5.10 Validation status model

```ts
type PenroseValidationScope =
  | "exactFinite"
  | "oracleAgreement"
  | "asymptoticTrend"
  | "corpusCoverage"
  | "theoremAttributed";

interface PenroseValidationResult {
  validatorId: string;
  validatorVersion: string;
  scope: PenroseValidationScope;
  status: "pass" | "fail" | "incomplete" | "notApplicable";
  entityRefs?: readonly GeneratedEntityRef[];
  diagnostics: readonly Diagnostic[];
  evidenceRefs: readonly string[];
}
```

An acceptance-window predicate should return:

```text
inside
outside
boundary
```

rather than collapsing boundary into either side. The certified default configuration should produce no generated vertex on a forbidden boundary; encountering `boundary` is therefore a validation failure or a configuration-certification failure.

## 5.11 Graph contracts

Two separate graph kinds are required:

```ts
interface PenroseTileAdjacencyGraph {
  graphKind: "penrose-tile-adjacency";
  nodes: PenroseTileFeatures[];
  edges: {
    tileA: string;
    tileB: string;
    viaCanonicalEdgeId: string;
  }[];
}

interface PenroseTilingSkeleton {
  graphKind: "penrose-rhomb-edge-skeleton";
  vertices: PenroseVertex[];
  edges: PenroseEdge[];
}
```

Only `PenroseTilingSkeleton` is subject to the cited bipartite and degree-3-through-7 properties. The tile-adjacency graph must not inherit those claims.

## 5.12 Traversal contract

```ts
interface PenroseTraversalSpec {
  traversalVersion: string;
  graphHash: string;

  kind:
    | "bfs"
    | "dfs"
    | "shortest"
    | "weighted-shortest"
    | "seeded-random-walk"
    | "greedy-self-avoiding"
    | "radial-sweep"
    | "angular-sweep"
    | "type-orientation-group"
    | "ribbon-walk"
    | "hierarchy-walk"
    | "projected-user-path"
    | "coverage-heuristic";

  startTileId?: string;
  targetTileId?: string;

  repeatPolicy:
    | "allow"
    | "no-immediate-repeat"
    | "no-repeat";

  maxSteps: number;
  maxNodeExpansions?: number;
  seed?: string;

  tiePolicy:
    "edge-direction,edge-id,tile-id";
}
```

```ts
interface TraversalStep {
  index: number;
  tileId: string;
  enteredViaEdgeId?: string;
  exitedViaEdgeId?: string;
  turnClass?: number;
  sourceFeatureRefs: readonly string[];
}

interface PenroseTraversalResult {
  specHash: string;
  steps: readonly TraversalStep[];
  terminationReason:
    | "max-steps"
    | "target-reached"
    | "component-exhausted"
    | "query-boundary"
    | "trapped"
    | "search-budget"
    | "cancelled";
}
```

Normative ordering:

```text
BFS/DFS neighbors:
  edge direction class
  → EdgeID
  → TileID

radial:
  exact squared distance
  → exact angular/coordinate tie
  → TileID

angular:
  exact half-plane
  → exact cross-product sign
  → exact radius
  → TileID
```

Stochastic traversals sort candidates canonically before invoking the accepted AGL-005 keyed PRNG.

## 5.13 Gesture projection

A committed user path must retain:

```ts
interface ProjectedPenrosePath {
  sourcePolylineHash: string;
  projectionVersion: string;
  geometryConfigHash: string;
  geometryQueryHash: string;
  orderedTileIds: readonly string[];
  degeneracyPolicy: string;
  resultHash: string;
}
```

Touching a vertex, following an edge, re-entering a tile, and coincident segment ordering remain unspecified by DR-09. They must be resolved before the user-path traversal ships.

## 5.14 Musical-event relationship

The geometry operator emits no pitch, scale, register, tempo, or voice assignments.

The canonical flow is:

```text
Penrose entity/graph feature
→ typed DR-08 source dimension
→ explicit transform/normalization
→ optional quantization
→ optional musical constraint
→ rational-time event generation
→ event budget
→ RenderPlan
```

For fixed-step sequencing:

\[
t_i=t_0+i\Delta,
\]

where \(t_0\) and \(\Delta\) are exact AGL rational musical times. Variable-duration mappings must emit explicit rational durations or documented render-time approximations downstream; geometry itself does not own clock semantics.

## 5.15 Realtime/offline equivalence

Given identical:

- project revision;
- geometry configuration;
- complete query;
- traversal specification;
- seed;
- mapping graph;
- rational render interval;
- event budget;

realtime and offline preparation must produce exactly equal:

- ordered TileIDs;
- TraversalStep IDs;
- source-feature records;
- event IDs;
- rational event times;
- target parameter values at the RenderPlan boundary;
- provenance hashes.

Bit-identical PCM is not required by DR-09 and remains under DR-03’s backend-specific conformance model.

---

# 6. Test Oracle and Fixture Pack

## 6.1 Unit invariants

| Test | Input | Expected behavior/output | Tolerance | Why it matters | Research support |
|---|---|---|---|---|---|
| `qphi-normalize` | Equivalent noncanonical \((a,b,d)\) triples | Byte-identical canonical representation | Exact | Hash and comparison stability | DR-09 exact kernel |
| `qphi-sign` | Positive, negative, and near-canceling \(A+B\phi\) values | Correct exact sign | Exact | Orientation and strip ceilings depend on it | DR-09 determinant reduction |
| `qphi-ceil` | Values immediately around integers in \(\mathbb Q(\phi)\) | Mathematical ceiling | Exact | One incorrect ceiling changes vertex/tile topology | DR-09 construction |
| `default-phase-sum` | Default \(\gamma\) | Sum equals zero | Exact rational | Required selected convention | DR-09 |
| `default-phase-regularity` | Ten certified family triples | `isInZPhi=false` for all | Exact | Prevents triple intersections | DR-09 certificate |
| `tile-address-normalization` | Line pairs supplied in either order | Same normalized TileID | Exact | Stable identity | DR-09 IDs |
| `tile-four-vertices` | Generated tile | Four distinct tuples | Exact | Basic tile validity | DR-09 property suite |
| `tile-edge-difference` | Four tile edges | Each difference is \(\pm e_j\) | Exact | Symbolic unit length and direction | DR-09 |
| `tile-type` | All ten family pairs | Five thick and five thin pair classes | Exact | Prevent classification drift | Independent derivation from DR-09 geometry |
| `orientation-class` | All ten family pairs | Versioned five-class lookup | Exact | Traversal and mapping stability | Engineering recommendation |
| `positive-winding` | Generated tile | Exact positive orientation | Exact | Polygon operations | DR-09 |
| `vertex-index` | Generated vertices | \(\sum n_j\in\{1,2,3,4\}\) | Exact | Canonical mesh restriction | DR-09 |
| `edge-id-order` | Reversed endpoints | Same EdgeID | Exact | Adjacency stability | DR-09 |
| `edge-owner-cap` | Edge map with three owners | Hard validation failure | Exact | Detects duplicates/non-manifold output | DR-09 |
| `clip-edge-type-safety` | Synthetic clip edge | Rejected by canonical adjacency API | Exact | Prevents false neighbors | DR-09 |
| `acceptance-window-boundary` | Exact point on window boundary | Return `boundary` | Exact | Avoids implementation-defined inclusion | Integration recommendation |

## 6.2 Property-based tests

| Property | Generated input | Expected invariant |
|---|---|---|
| Exact regeneration | Random line pairs/indices inside bounded certified query domains | Identical sorted tile/vertex/edge address bytes across repeated runs |
| Enumeration-order independence | Permuted family-pair and line-index iteration order | Identical canonical output hashes |
| Chunk independence | Same world region split into random overlapping chunks | Union after TileID dedupe equals one-shot query |
| Pan invariance | Overlapping queries at different camera positions | Shared mathematical tiles retain identical IDs and tuples |
| Zoom invariance | Same world region viewed at multiple zoom levels | Canonical entity sets and IDs unchanged; only projection LOD differs |
| Adjacency symmetry | Any generated complete patch | Every \(A\to B\) has \(B\to A\) through same EdgeID |
| Edge multiplicity | Any complete patch | Every canonical edge has one or two owners, never more |
| Core completeness | Complete halo query | Every core edge is `shared` or explicitly `outsideQuery`; no unknown |
| Oracle agreement | Generated vertex tuples | Cut-and-project oracle returns `inside` in correct window |
| No interior overlap | Random bounded complete patches | No two distinct rhombs have positive-area interior intersection |
| Matching legality | Complete local stars | Every normalized star belongs to legal P3 corpus |
| Decoration compatibility | Every shared edge | Markings agree under selected convention |
| Skeleton degree | Complete interior vertices | Degree lies from 3 through 7 |
| Skeleton bipartite | Finite skeleton subgraphs | Two-coloring succeeds |
| Tile-dual non-assumption | Patches containing degree-three stars | Tests do not require tile adjacency to be bipartite |
| Bounded traversal | Random valid specs/budgets | Result length and node expansions never exceed declared budgets |
| Seed reproducibility | Random-walk specs with same seed | Byte-identical steps |
| Seed differentiation | Same graph, varied seed | Results may differ but remain valid, bounded, and reproducible |
| No-NaN projection | Bounded address ranges | All rendered coordinates finite |
| Query truncation honesty | Budgets below required size | `truncated=true`, no false `haloComplete=true` |

## 6.3 Metamorphic tests

| Transformation | Required relationship |
|---|---|
| Increase query region without changing configuration | Every old core tile remains present in the larger complete query |
| Increase halo from one to two rings | Core geometry and existing adjacency do not change; validation completeness may increase |
| Change camera/zoom only | No geometry, graph, traversal, or event identity changes |
| Change matching-arrow display convention only | Geometry IDs remain unchanged; decoration validation version changes |
| Reorder input tile array | Adjacency and graph hashes remain identical after canonical sorting |
| Cold versus warm cache | Identical result hashes and diagnostics |
| Worker cancellation followed by rerun | Rerun equals a clean run; no partial state contamination |
| Float32 versus Float64 rendering | Pixel geometry may vary within projection tolerance; picked canonical IDs remain equal |
| Live traversal then freeze | Frozen ordered sequence exactly equals the evaluated live sequence at commit revision |
| Edit upstream configuration after freeze | Frozen sequence/events remain byte-equivalent and become stale relative to source rather than silently changing |
| Periodic-control swap | Event pipeline settings remain equal; only source geometry/graph feature stream changes |
| Increase asymptotic window size | Thick:thin ratio should trend toward \(\phi\), not necessarily monotonically at every step |

## 6.4 Golden fixtures

### Golden G1 — Default-phase regularity certificate

Input:

```json
{
  "gamma": ["0", "1/5", "2/5", "-1/5", "-2/5"]
}
```

Expected:

- exact sum zero;
- ten triple certificates;
- all `isInZPhi=false`;
- stable configuration hash.

### Golden G2 — DR-09 square fixture

Reported selection semantics:

```text
fixtureId = dr09-p3-default-centroid-aabb-5
selection = tile centroid in [-5,5] × [-5,5]
```

Reported expected summary:

```json
{
  "configurationHashPrefix": "2783b84ba62aa120",
  "tileCount": 129,
  "typeCounts": {
    "thick": 83,
    "thin": 46
  },
  "vertexCount": 160,
  "undirectedEdgeCount": 288,
  "sharedInteriorEdgeCount": 228,
  "boundaryEdgeCount": 60,
  "maxEdgeMultiplicity": 2,
  "eulerVMinusEPlusF": 1,
  "tileAddressSha256":
    "58a5e1cc9cfc57137a62fb3db860bd2e178d297c2c118a05ff5769e8447d220d",
  "vertexTupleSha256":
    "7e201d2475e3b8c296d727e505ed52ba3c6d966680bd719dc3452f3a7d0052e3",
  "edgeMultiplicitySha256":
    "f2585ef96b8d514f8eddff32bb16e61e7e070a1bdfe5d8c1060f41e87c62eb09"
}
```



**Current integration caveat:** The report references `dr09-penrose-golden-v1.json`, but the fixture bytes are not present in the currently mounted artifacts and file search returns only the report containing its summary. This golden cannot yet serve as a repository acceptance oracle.

### Golden G3 — Legal P3 vertex-star corpus

Required contents:

```text
eight normalized complete star encodings
canonical rotation/reflection treatment
incident tile types
edge directions
matching marks
source passage/reference ID
corpus version/hash
```

The report establishes the need and count but the retrievable packet does not include the full machine-readable table.

### Golden G4 — Matching-decoration corpus

Required:

```text
matchingConvention = penrose-p3-dandrea-2023
tile type
edge slot
orientation/handedness
arrow or arc mark
shared-edge compatibility table
known convention reversal metadata
```

### Golden G5 — Traversal fixtures

At minimum:

- BFS from a named fixture tile for 64 steps;
- ribbon walk for 64 steps;
- seeded random walk using the accepted AGL-005 PRNG;
- radial ordering of all 129 fixture tiles;
- a deliberately trapped self-avoiding walk;
- a path terminating at query boundary;
- a projected gesture with edge/vertex degeneracies.

Each must include exact step hashes and termination reasons.

### Golden G6 — Periodic controls

- periodic rhomb strip corresponding to Ribbon Weave;
- periodic hierarchical grid corresponding to Hierarchy Pulse;
- square or periodic-rhomb tile-adjacency graph corresponding to Vertex-Star Walk.

Controls must use identical mapping graph, tempo, voice, quantizer, traversal length, and event budget.

## 6.5 Cross-platform conformance tests

Exact equality is required across TypeScript/browser, any shared core, and Swift for:

- normalized rational and \(\mathbb Q(\phi)\) serialization;
- `sign`, `compare`, and `ceil`;
- configuration hashes;
- TileIDs, VertexIDs, and EdgeIDs;
- sorted address lists;
- tile type and orientation class;
- edge multiplicity maps;
- validation outcomes;
- adjacency graph hashes;
- traversal sequences and termination reasons;
- keyed random-walk results;
- rational event times;
- frozen sequence hashes;
- project canonical semantic bytes.

Tolerance is allowed only for rendered coordinates:

\[
|a-b|
\le
\max(
\epsilon_{\text{coord},a},
\epsilon_{\text{coord},b},
\epsilon_{\text{backend}}
).
\]

A coordinate difference within tolerance may not excuse a different discrete ID, match result, adjacency edge, traversal step, or quantization outcome. DR-08 independently requires exact cross-platform equality for stable IDs and discrete decisions, while permitting a provisional \(10^{-12}\)-scaled tolerance only for ordinary non-branching Float64 scalar transformations.

## 6.6 Performance tests

The DR-09 thresholds are provisional engineering budgets:

| Workload | Provisional target | Hard/degradation bound | Test |
|---|---:|---:|---|
| Normal visible patch | ≤10,000 canonical tiles | 25,000 | Fixed-camera cold query |
| Worker query with halo | ≤25,000 tiles | 100,000 | Core plus two-ring validation halo |
| 10k tile generation | ≤100 ms p95 | Cancel/degrade before 250 ms | Cold worker, exact addresses |
| 10k tile adjacency | ≤50 ms p95 | 100 ms | Exact edge map |
| Cached pan delta | ≤25 ms | 50 ms | Warm adjacent chunk |
| Main-thread integration | ≤4 ms per synchronous slice | 8 ms | Transfer/decode/render-buffer integration |
| Picking | ≤4 ms p95 | 8 ms | Built spatial index |
| 10k traversal steps | ≤25 ms | 50 ms | Deterministic worker traversal |
| Interactive sequence | 1,024 events default | AGL-025 hard cap | Traversal→mapping→events |
| Geometry memory | <32 MiB normal | Degrade by 64 MiB | Worker plus renderer accounting |

Required scenarios:

1. cold 129-tile golden;
2. 1k, 10k, 25k, and 100k candidate scales;
3. repeated pan across chunk boundaries;
4. rapid pan with cancellation and stale-result suppression;
5. zoom-out presentation LOD;
6. simultaneous geometry query and audio playback;
7. validation oracle enabled/disabled;
8. one-ring versus two-ring halo;
9. 10-minute pan/zoom/traversal soak;
10. low-power or CPU-throttled mode;
11. TypeScript versus prospective shared-core exact kernel;
12. memory-pressure degradation.

Run FR-08 before converting these provisional values into acceptance gates. The frontier register already defines that workload.

## 6.7 Perceptual and user studies

No perceptual study is required to establish geometry correctness.

Studies become relevant only for product claims about whether a mapping helps users hear or understand structure:

| Study | Input | Outcome | Claim supported |
|---|---|---|---|
| Geometry-source identification | Penrose and periodic control under matched audio pipeline | Accuracy identifying source condition | Whether a specific preset makes the conditions discriminable |
| Feature comprehension | Guided exposure to thick/thin, ribbon, or star mapping | Feature-state identification accuracy | Whether users understand that mapping |
| Provenance comprehension | Raw versus quantized mapping comparison | Ability to identify which stage changed output | Whether inspector/pipeline explanation is effective |
| Accessibility evaluation | Keyboard, text/table, visual, and audio variants | Task completion and reported barriers | Usability of multimodal alternatives |

A successful discrimination study would not prove that listeners “hear aperiodicity” in a theorem-level sense. It would establish only that they can distinguish the tested stimuli under the tested mapping.

---

# 7. Recommended Defaults

| Parameter | Default | Valid/recommended range | Rationale | Evidence strength | User-facing? |
|---|---|---|---|---|---:|
| Construction | `p3-debruijn-pentagrid` | One MVP construction | Best stable finite-region semantics | Strong | Advanced inspector |
| Canonical tiles | P3 thick/thin rhombs | Fixed for MVP | Convex, exact shared edges | Strong | Yes |
| Configuration preset | `dr09-default-v1` | Certified presets only | Exact regularity certificate | Strong | Yes, preset name |
| Phase \(\gamma\) | `["0","1/5","2/5","-1/5","-2/5"]` | Fixed in MVP | Regular and sum-zero | Strong | Inspectable, not freely editable |
| Arbitrary phase editor | Disabled | Post-MVP certified workflow only | Prevent singular/uncertified configurations | Engineering | No MVP |
| Canonical edge length | `"1"` | Fixed mathematical unit | Shape and predicates are normalized | Mathematical | Inspector |
| Matching convention | `penrose-p3-dandrea-2023` | Versioned conventions | Avoid harmless arrow reversal appearing corrupt | Strong | Inspector |
| Topological tolerance | `0` | Exactly zero | IDs and topology are symbolic | Mathematical | No |
| Render coordinate envelope | \(32u\max(1,S)\) | Scale-aware formula | Conservative diagnostic bound | Report derivation | No |
| Query inclusion | `intersects` | Fixed MVP | Avoid missing partially visible canonical tiles | Engineering | No |
| Adjacency halo | One edge-neighbor ring | One ring | Sufficient for direct tile adjacency when complete | Engineering | Advanced |
| Matching/local-star halo | Two rings | Two rings | Safer for complete vertex neighborhoods | Engineering | No |
| Incomplete halo behavior | Explicit incomplete result | No silent inference | Prevent boundary absence becoming topology | Hard contract | Visible diagnostic |
| Clip representation | Transient `ClipFragment` | No canonical clipped entities | Prevent false adjacency | Hard contract | Visual distinction |
| Cut-and-project oracle | CI/test and inspect-on-demand | Optional sampled production diagnostics | Independent cross-check has cost | Strong recommendation | Inspect mode |
| Robinson hierarchy | Off until requested | Explicit hierarchy view/preset | Derived educational output | Engineering | Yes |
| Inflation depth | No production parameter | `compositionLevel` only | Zoom must not define identity | Strong | Yes, hierarchy only |
| Default traversal event count | 1,024 | 1 through AGL-025 cap | DR-09 provisional interactive default | Engineering | Yes |
| Random traversal | Off by default | Seeded only | Prevent source structure being confused with randomness | Strong | Yes |
| Seed source | AGL-005 stable seed | Existing seed contract | Cross-lab determinism | Program contract | Advanced |
| Visible tile target | 10,000 | Degrade by 25,000 | Provisional responsiveness target | Provisional | No |
| Worker query target | 25,000 | Hard 100,000 | Provisional worker budget | Provisional | No |
| Geometry memory target | 32 MiB | Degrade by 64 MiB | Provisional | Provisional | No |
| Mapping quantization | **No DR-09 default** | DR-08 profile-specific | Quantization is downstream | Strong | Yes |
| Pitch scale/register | **No DR-09 default** | Preset/voice-specific | No geometry evidence supports one | Strong | Yes |
| Gain/timbre/pan | **No DR-09 default** | DR-08/DR-03-specific | Perceptual/audio decision | Strong | Yes |
| Initial structural presets | Ribbon Weave, Hierarchy Pulse, Vertex-Star Walk | Three required; expert fourth later | Intrinsic feature mappings | Engineering | Yes |
| Expert cut-project preset | Deferred/experimental | Acceptance Window Drift | Valuable but mathematically and pedagogically dense | Engineering | Post-MVP |
| Default comparison control | Periodic rhomb for geometry; square grid for graph | Match experiment purpose | Controls confounds | Strong inference | Guided experiments |
| Path gesture persistence | Resolved TileID sequence | Preserve source path hash too | Deterministic replay | Engineering | Indirectly |
| Mathematical LOD | None | Presentation LOD only | Zoom cannot change tiles | Hard contract | No |

---

# 8. UX / Visualization Implications

## 8.1 Hard interaction contracts

### Construction linkage

**User goal:** Understand how the pentagrid produces the P3 tiling.

**Must be visible**

- five grid families;
- exact line family/index;
- linked line intersection and rhomb;
- linked pentagrid mesh and five-tuple vertex;
- configuration preset and validation state.

**Behavior**

Selection or keyboard focus on either representation highlights the same semantic entity through its exact reference.

**Avoid**

A purely decorative fivefold background with no inspectable construction.

**Accessibility**

Provide an ordered table:

```text
intersection
line A
line B
generated tile
tile type
orientation class
four vertex IDs
```

### Exact geometry inspector

**User goal:** Distinguish mathematical identity from rendered coordinates.

**Must be visible**

- full/abbreviated TileID;
- two ribbon addresses;
- tile type;
- orientation class;
- vertex five-tuples;
- exact symbolic point;
- Float64 render point;
- canonical unit edge;
- configuration hash and certificate.

**Avoid**

Showing only decimal coordinates, which implies the decimals define identity.

### Query and completeness status

**User goal:** Know whether the visible graph is complete.

**Must be visible when relevant**

- `haloComplete`;
- `truncated`;
- budget/deadline termination;
- `outsideQuery` boundaries;
- validation coverage;
- hidden halo count.

**Hard rule**

A traversal or validation result may not appear “fully valid” when its required halo is incomplete.

### Clip-fragment distinction

**User goal:** See the viewport crop without confusing it with the tiling.

**Behavior**

- Canonical rhomb boundary: normal solid semantic edge.
- Viewport-created fragment boundary: dashed or otherwise non-semantic.
- Graph edges appear only through canonical shared edges.

**Avoid**

Using color alone to distinguish canonical and clipped boundaries.

### Matching-rule view

**User goal:** Understand why two rhomb shapes alone are insufficient.

**Must be visible**

- selected matching convention;
- arrows/arcs or equivalent marks;
- local star type;
- complete/incomplete neighborhood state;
- exact shared-edge compatibility;
- deliberate mutation result.

**Required experiment**

“Break one tile” must alter an exact record or a controlled derived copy and produce a specific failed invariant. It must not merely recolor pixels.

**Claim guard**

The UI must say that local validity of an arbitrary finite edit does not establish infinite extendability.

### Hierarchy view

**User goal:** Explore composition/inflation.

**Must be visible**

- Robinson-triangle refinement;
- handedness;
- composition level;
- ancestry path;
- source rhomb linkage.

**Avoid**

Calling the finite viewport “a fractal” or claiming every crop is exactly self-similar.

### Graph view

**User goal:** Understand and traverse true tile adjacency.

**Must be visible**

- graph kind;
- tile nodes;
- shared canonical edge for each graph edge;
- query boundary;
- start/current/visited states;
- deterministic traversal order;
- termination reason.

**Avoid**

- synthetic clip-boundary graph edges;
- claiming the tile-adjacency graph is bipartite;
- hiding trapped or boundary termination.

### Periodic control view

**User goal:** Compare aperiodic and periodic structure under matched mappings.

**Hard synchronization**

- camera/world scale where meaningful;
- traversal length;
- mapping graph;
- quantizer;
- tempo;
- voice;
- event budget;
- playback start;
- inspector stage.

**Avoid**

Changing multiple musical variables between conditions and then attributing the audible difference to geometry.

## 8.2 Explore, Compose, and Inspect

These should be workspace emphases, not permission modes. DR-11 explicitly warns against hard semantic modes that arbitrarily disable operations.

### Explore emphasis

Prioritize:

- Construction view;
- periodic A/B control;
- guided matching mutation;
- hierarchy animation;
- structural presets;
- resettable experiments.

### Compose emphasis

Prioritize:

- traversal specification;
- start/target selection;
- event budget;
- mapping graph;
- rhythmic duration;
- voice selection;
- freeze/materialize;
- timeline placement.

### Inspect emphasis

Prioritize:

- exact addresses;
- configuration certificate;
- graph kind and edge provenance;
- legal-star result;
- cut-and-project oracle;
- mapping trace;
- query completeness;
- generated/frozen lineage.

All three workspaces operate on the same entities and command model.

## 8.3 Generated versus frozen material

The visual state must distinguish:

- live generated traversal;
- frozen sequence;
- edited derivation;
- stale snapshot after source change.

Use redundant labels, icons, stroke/pattern, and semantic descriptions—not color alone. The existing DR-11 and DR-14 work supports this broader generated-material contract. 
## 8.4 Presentation LOD

When tile count exceeds display capacity:

- suppress labels;
- aggregate validation indicators;
- simplify fills;
- suppress some outlines;
- disable individual picking with an explicit notice;
- request a closer zoom.

Never:

- switch to substitution supertiles as if they were the current canonical tiling;
- merge vertices;
- alter TileIDs;
- calculate adjacency from simplified geometry.

---

# 9. User-Facing Scientific Claims

## Safe to state directly

These claims are supported when the production implementation and certificate are the actual source:

1. **“This patch was generated from a certified regular de Bruijn pentagrid using the Penrose P3 rhomb construction.”**

2. **“Each canonical tile is identified by the two pentagrid lines whose crossing generates it.”**

3. **“Each canonical vertex is represented by a five-integer mesh address; the decimal screen position is only a rendering.”**

4. **“Every canonical tile edge has exact unit length in the mathematical model.”**

5. **“Adjacency is present only when two full tiles share the same canonical edge.”**

6. **“The construction has five undirected edge/ribbon direction families.”**

7. **“The displayed complete neighborhoods satisfy the selected versioned P3 matching-rule convention.”**

8. **“Composition exposes a hierarchy related to inflation of Penrose tiles.”**

9. **“The tile frequencies approach a golden-ratio relationship over sufficiently large regions; a small crop need not have that exact ratio.”**

10. **“The tile-edge skeleton and the tile-adjacency graph are different graphs.”**

These statements inherit the report’s primary mathematical source hierarchy.

## Safe only with qualification

1. **“This is a nonperiodic tiling.”**  
   Qualification: “The statement follows from the theorem-backed Penrose construction; the finite image alone is not the proof.”

2. **“The pattern is quasiperiodic.”**  
   Qualification: Name the intended meaning. For introductory UI, describe long-range order and recurrent finite patterns rather than implying every spectral or diffraction definition has been demonstrated in the lab.

3. **“This finite patch has no translation symmetry.”**  
   Qualification: “No nonzero translation preserving this finite patch was found within the specified tested search range.”

4. **“The patch is self-similar.”**  
   Qualification: “The construction has an inflation/composition hierarchy; an arbitrary finite crop is not necessarily exactly invariant under scaling.”

5. **“Penrose tilings have fivefold symmetry.”**  
   Qualification: “Five direction families and fivefold motifs occur, and some Penrose tilings have exact fivefold rotational symmetry. Not every individual Penrose tiling does.”

6. **“All eight P3 vertex types occur.”**  
   Qualification: “The legal P3 corpus has eight complete local vertex-neighborhood types. A small crop is not required to contain all eight.”

7. **“The cut-and-project oracle independently proves the generator.”**  
   Qualification: “It provides a computational cross-check with different failure modes; both implementations derive from the same mathematical structure.”

8. **“Ribbon Weave reveals Penrose structure in sound.”**  
   Qualification: “The mapping uses intrinsic ribbon and tile features. Whether listeners reliably perceive or understand that structure is an empirical question.”

9. **“The matching rules validate the patch.”**  
   Qualification: “They validate complete local neighborhoods and edge markings in the generated finite result. They do not solve the general finite-patch extension problem.”

The report explicitly distinguishes these finite observations from global theorem claims.

## Do not claim

- “It is a Penrose tiling because it looks quasiperiodic.”
- “This finite image proves aperiodicity.”
- “Rendering thousands of tiles proves global nonperiodicity.”
- “Every Penrose tiling has exact fivefold rotational symmetry.”
- “The default phase was selected because it has global fivefold symmetry.”
- “Every crop is exactly self-similar.”
- “The thick:thin ratio is exactly \(\phi\) in every finite patch.”
- “Local matching checks prove that any edited finite patch extends to an infinite Penrose tiling.”
- “The tile-adjacency graph is bipartite.”
- “Clipped fragments are Penrose tiles.”
- “A coverage heuristic is a Hamiltonian path.”
- “A greedy self-avoiding walk gives maximal coverage.”
- “The periodic control is less musical because it is periodic.”
- “The selected sonification lets listeners hear mathematical aperiodicity” without a controlled study.
- “Float coordinates are exact.”
- “A small Float64 boundary margin justifies replacing exact predicates.”
- “Pentagrid and cut-and-project are unrelated constructions.”
- “The P2 kite/dart, P3 rhomb, Robinson triangle, and cut-project visualizations are interchangeable without conversion metadata.”

---

# 10. Implementation Recommendations

## Must happen before MVP architecture freezes

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Separate `PenroseConfiguration`, `GeometryQuery`, and `ViewState`. | Critical | M | AGL-010, AGL-020 |
| Freeze exact rational and \(\mathbb Q(\phi)\) serialization/operation contracts. | Critical | M | AGL-006, AGL-143 |
| Freeze geometry/entity hash namespace and producer-qualified references. | Critical | M | AGL-005, AGL-036 |
| Add typed geometry, adjacency, feature, hierarchy, and validation ports. | Critical | M | AGL-004, AGL-020, AGL-021 |
| Define canonical clip-fragment type that cannot satisfy geometry interfaces. | High | S | AGL-050 |
| Add query completeness, truncation, and boundary-status semantics. | Critical | M | AGL-020, AGL-025 |
| Define Penrose provenance records and generated/frozen lineage. | Critical | M | AGL-020, AGL-027, AGL-035 |
| Decide how a language-neutral exact kernel is exposed, even if implementation placement remains open. | High | M | DR-15, AGL-146 |
| Recover and check in the DR-09 fixture, prototype source, and certificate artifacts. | Critical | M | AGL-120 |
| Freeze graph-kind distinction: tiling skeleton versus tile adjacency. | High | S | AGL-122, AGL-050 |

## Must happen before the affected lab ships

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Implement exact coefficient table and tile generator. | Critical | L | AGL-120, AGL-121 |
| Implement bounded region enumeration and conservative halo. | Critical | L | AGL-121, AGL-023 |
| Implement exact edge-map adjacency. | Critical | M | AGL-122 |
| Implement cut-and-project oracle. | High | L | AGL-120 |
| Check in and validate the eight-star corpus and matching-decoration table. | Critical | M | AGL-120, AGL-121 |
| Implement overlap, gap/core-containment, Euler, and determinism tests. | Critical | L | AGL-133 |
| Implement three bounded traversal presets. | High | L | AGL-122, AGL-123 |
| Resolve canonical Robinson hierarchy and ancestry. | High | L | AGL-123 |
| Expand presets into explicit DR-08 mapping graphs. | High | M | DR-08, AGL-123 |
| Implement periodic rhomb and square-grid controls. | High | M | AGL-151 |
| Implement construction, matching, hierarchy, graph, and inspector views. | High | XL | AGL-124, AGL-050/051 |
| Add accessible text/table and keyboard equivalents. | Critical | L | AGL-053, AGL-132, AGL-150 |
| Run FR-04 operator oracle expansion. | Critical | M | Golden corpus |
| Run FR-05 scientific-claim audit. | High | S | User-facing copy |
| Run FR-08 geometry performance calibration. | High | M | Production worker |
| Run FR-11 repository distillation/acceptance audit. | High | S | All DR-09 artifacts |

## Can safely happen after MVP

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Additional certified pentagrid phase presets. | Medium | L | Certification pipeline |
| P2 kite/dart derived visualization. | Low | M | P3 conversion |
| Rich cut-and-project expert workspace. | Medium | L | Oracle |
| Advanced acceptance-window sonification. | Low | M | DR-08 |
| Arbitrary large-region export. | Medium | L | Performance/storage |
| Native GPU rendering optimizations. | Low | L | M7 architecture |
| Additional traversal heuristics. | Low | M | Core traversal |
| Spectral/diffraction educational visualizations. | Medium | XL | Separate research scope |

## Research-only / experimental

| Item | Impact | Complexity | Primary dependency |
|---|---|---:|---|
| Arbitrary user-authored phase vectors without prior certification. | Low MVP value / high risk | L | New mathematics/validation |
| Arbitrary topology editing with infinite-extendability claims. | Out of scope | XL | Extension-decision research |
| Hamiltonian-path claims over finite Penrose tile graphs. | Low | XL | Graph-specific research |
| “Hear aperiodicity” perceptual claim. | Medium scientific interest | L | Controlled human study |
| Learned Penrose-to-music mappings. | Low MVP value | XL | DR-08 post-MVP ML contract |
| General substitution-tiling engine. | Out of MVP | XL | New program scope |

---

# 11. Backlog Deltas

The current backlog already provides the correct major work items: AGL-120 selects the implementation, AGL-121 builds deterministic finite patches, AGL-122 builds adjacency, AGL-123 provides traversal/mapping, and AGL-124 maintains honest research-gated UI.

## MODIFY — AGL-120: Exact Penrose implementation selection

**Rationale**

The mathematical choice is complete, but the current acceptance summary is too weak to ensure reproducibility.

**Suggested acceptance criteria**

- Accepted ADR-PEN-001 through ADR-PEN-005.
- Exact source corpus with DOI/stable URL, publication year, and access/license status.
- Checked-in default-phase regularity certificate.
- Checked-in pentagrid reference prototype.
- Checked-in cut-and-project oracle.
- Checked-in Robinson hierarchy oracle specification.
- Checked-in full golden fixture bytes.
- Fixture hashes regenerated in CI.
- Checked-in eight-star and matching-decoration corpora.
- FR-04 review scheduled.
- No unresolved geometry-choice decision.

**Dependencies**

DR-09 integration packet; recovered research artifacts.

**Milestone**

Before AGL-121 implementation acceptance; contributes to M5.

---

## ADD — DR-09 evidence and oracle package recovery

**Rationale**

The report references a golden fixture and prototypes, but their source bytes are not currently available in the mounted handoff artifacts.

**Suggested acceptance criteria**

- `dr09-penrose-golden-v1.json` recovered.
- File checksum recorded.
- Prototype source committed.
- Exact dependency/runtime versions recorded.
- Clean-room regeneration reproduces all three reported hashes.
- Fixture selection semantics explicitly state `centroid`, not `intersects`.
- Full configuration hash recorded, not only a prefix.

**Dependencies**

Completed DR-09 run storage or original research runtime.

**Milestone**

Immediate; blocks AGL-120 closure.

---

## SPLIT — AGL-121: Deterministic finite Penrose patch generator

Retain AGL-121 as the umbrella but implement as three independently testable components.

### Component A — Exact Penrose kernel

Acceptance:

- normalized rational and \(\mathbb Q(\phi)\) primitives;
- exact `sign`, `compare`, `floor`, and `ceil`;
- precomputed family coefficient table;
- cross-platform vectors.

### Component B — Pentagrid region enumerator

Acceptance:

- stable line/tile/vertex IDs;
- complete conservative query;
- chunk/order invariance;
- exact full-rhomb output;
- cancellation and budgets.

### Component C — Projection and clip adapter

Acceptance:

- Float64 render buffers;
- scale-aware render error metadata;
- transient clip fragments;
- no canonical clip edges;
- presentation LOD only.

**Dependencies**

AGL-120, AGL-023, AGL-025.

**Milestone**

M5.

---

## MODIFY — AGL-122: Penrose adjacency graph

**Rationale**

The item must own graph-kind and query-boundary semantics, not just symmetric neighbors.

**Suggested acceptance criteria**

- Exact EdgeID owner map.
- Edge multiplicity never exceeds two.
- Symmetric tile adjacency through identical EdgeID.
- Explicit `outsideQuery` versus invalid open edge.
- No output adjacency unless halo is complete.
- Separate `tileAdjacency` and `tilingSkeleton` schemas.
- Clip fragments rejected at type/API boundary.
- Golden adjacency hash reproduced.
- Tile-adjacency graph is not tested as bipartite.

**Dependencies**

AGL-121.

**Milestone**

M5.

---

## SPLIT — AGL-123: Penrose traversal and mapping engine

### Component A — Deterministic traversal adapters

Acceptance:

- BFS, shortest path, seeded walk, ribbon walk, radial/angular sweep;
- exact tie policies;
- repeat and termination policies;
- hard step/expansion budgets;
- stable TraversalStep provenance;
- gesture projection contract.

### Component B — Structural mapping presets

Acceptance:

- Ribbon Weave;
- Hierarchy Pulse;
- Vertex-Star Walk;
- explicit DR-08 graph expansion;
- periodic control for each;
- no geometry-private pitch/quantization logic;
- evidence-status metadata.

**Dependencies**

AGL-122, DR-08, AGL-005.

**Milestone**

M5.

---

## MODIFY — AGL-124: Honest Penrose research-gated UI

**Rationale**

The placeholder should transition through explicit evidence states rather than directly from placeholder to unlabeled visualization.

**Suggested acceptance criteria**

- `research-gated` state until AGL-120.
- `geometry-validating` state during implementation.
- `exact-generated` state only after fixture/invariant acceptance.
- Visible query completeness and validation status.
- Construction, exact inspector, matching, hierarchy, graph, and periodic-control views.
- No finite-proof overclaims.
- Non-color and keyboard-accessible semantics.

**Dependencies**

AGL-120 through AGL-123, AGL-150, AGL-151.

**Milestone**

M5.

---

## MODIFY — AGL-010: Full project schema and JSON Schema

**Add**

- exact rational-string format;
- Penrose semantic configuration;
- certified preset reference;
- separate view state;
- separate authored query/traversal state;
- geometry/decorative/operator version separation;
- generated-entity references;
- frozen traversal lineage.

**Milestone**

M1.

---

## MODIFY — AGL-011: Schema migration framework

**Acceptance addition**

A migration must never silently convert exact rational phase values to binary floating-point or silently recompute old entity IDs under new address conventions.

**Milestone**

M1.

---

## MODIFY — AGL-020 and AGL-021: Executable operator and port checker

**Add typed ports**

```text
geometry2d.penroseP3
graph.penroseTileAdjacency
graph.penroseSkeleton
features.penrose
hierarchy.penroseRobinson
validation.penrose
```

Clip fragments remain visualization primitives and are not compatible with canonical geometry or graph inputs.

**Milestone**

M1 architecture; implementation used at M5.

---

## MODIFY — AGL-023: Worker evaluator

**Acceptance additions**

- exact BigInt/\(\mathbb Q(\phi)\) worker execution;
- cancellation;
- query generation IDs;
- progress by candidate/tile stage;
- deadline and memory diagnostics;
- transferable render buffers;
- stale-result suppression.

**Milestone**

M1/M4 runtime foundation, required by M5.

---

## MODIFY — AGL-024: Deterministic evaluation cache

**Acceptance additions**

- configuration/chunk/address cache keys;
- zoom exclusion;
- cross-chunk TileID dedupe;
- semantic version invalidation;
- cold/warm result equivalence;
- no validation result reuse across mismatched corpus versions.

**Milestone**

M1/M5.

---

## MODIFY — AGL-025: Evaluation budget service

**Add budget dimensions**

- candidate grid intersections;
- canonical tiles;
- exact vertices;
- adjacency edges;
- oracle checks;
- local-star checks;
- traversal steps;
- traversal node expansions;
- geometry bytes;
- render-buffer bytes.

A budget hit must remain visible in provenance and query completeness.

**Milestone**

M1/M5.

---

## MODIFY — AGL-027 and AGL-032: Freeze-to-clip and timeline/clips

**Acceptance additions**

- frozen Penrose sequence stores exact TileIDs and traversal result hash;
- source graph/config/query revision retained;
- upstream geometry changes do not alter snapshot;
- stale/compare/re-freeze behavior;
- generated versus frozen status accessible without color.

**Milestone**

M3–M5.

---

## MODIFY — AGL-035 and AGL-036: Inspector and linked selection

**Acceptance additions**

- exact tuple and line-address inspection;
- selected tile ↔ pentagrid intersection ↔ graph node ↔ event linkage;
- query/validation status;
- full mapping trace;
- no nearest-entity substitution when an ID disappears.

**Milestone**

M1 foundations, M5 Penrose integration.

---

## MODIFY — AGL-050, AGL-051, and AGL-053: Visualization and accessibility

**Acceptance additions**

- canonical versus clip primitive types;
- construction and graph overlays;
- high-DPI projection from exact source entities;
- presentation-only LOD;
- keyboard tile/edge/vertex navigation;
- ordered semantic patch summaries;
- validation and traversal descriptions.

**Milestone**

M5.

---

## MODIFY — AGL-133: Property and invariant test suite

Add every exact, property, metamorphic, mutation, oracle, and golden test specified in Section 6.

**Milestone**

Starts M1; Penrose corpus accepted by M5.

---

## MODIFY — AGL-146: Cross-platform golden conformance fixtures

Add:

- exact rational/\(\mathbb Q(\phi)\) vectors;
- default certificate;
- configuration hash;
- 129-tile fixture;
- graph hashes;
- traversal hashes;
- render-coordinate tolerance records.

**Dependencies**

AGL-143 and native/shared-core decision.

**Milestone**

Before M7.

---

## MODIFY — AGL-151: Guided experiment curriculum hardening

Add Penrose experiments:

1. pentagrid intersection → rhomb;
2. clip edge versus canonical edge;
3. valid versus mutated matching rule;
4. finite patch versus global theorem;
5. inflation/composition hierarchy;
6. Penrose versus periodic control;
7. raw feature versus musically constrained output.

**Milestone**

M5/M6.

---

## BLOCK — Arbitrary phase editing

**Rationale**

No accepted generic regularity-certification and boundary policy exists for user-authored phases.

**Unblock condition**

A separate exact certification workflow, migration policy, UI, and golden corpus.

**Milestone**

Post-MVP.

---

## MODIFY — Research register DR-09 status

Change from:

```text
chartered
```

to an accepted vocabulary such as:

```text
research-complete-integration-pending
```

and then:

```text
integrated
```

after ADR, fixture, oracle, and backlog acceptance.

The current `chartered` state understates the completed research but `done` would overstate repository integration.

---

## UNBLOCK — AGL-120

Unblock once the evidence package is repository-resident and accepted. AGL-121 and AGL-122 remain dependent on that acceptance. AGL-123 additionally remains dependent on DR-08 integration.

---

# 12. Cross-Research Dependencies

## DR-08 — General sonification mapping

**This report concludes:**

Penrose geometry emits exact tile, edge, vertex, ribbon, hierarchy, adjacency, and traversal features. It must not own scales, pitch registers, quantizers, smoothing, musical constraints, or general event-shaping logic.

**Must be reconciled with:**

DR-08’s typed dimensions, stage pipeline, mapping trace, profiles, constraint provenance, keyed randomness, and evaluation corpus.

**Why:**

A structurally meaningful Penrose mapping can still become scientifically opaque if normalization or quantization is hidden.

**Question the integration pass must answer:**

Which exact feature schemas and dimension/topology declarations are required for:

- tile type;
- orientation class;
- ribbon family/index;
- local vertex degree/class;
- turn class;
- hierarchy level/ancestry;
- acceptance-window position?

DR-08 already treats Penrose geometry and traversal as the source boundary and requires exact discrete conformance.

---

## DR-03 — Browser audio and realtime/offline architecture

**This report concludes:**

Geometry and traversal must resolve to a finite deterministic event plan before entering audio.

**Must be reconciled with:**

RenderPlan generation, audio epochs, revision cutover, cancellation, late-event policy, offline rendering, and semantic—not PCM—equivalence.

**Why:**

Running traversal separately in realtime and offline adapters would create divergence and make project edits difficult to cancel deterministically.

**Question the integration pass must answer:**

At what project/evaluation revision is a live Penrose traversal committed to a RenderPlan, and how does a new query or traversal cancel future scheduled events?

---

## DR-14 — Cross-surface editing, graph, timeline, and undo

**This report concludes:**

A path gesture resolves to a stable TileID sequence; live geometry may regenerate while frozen material remains unchanged.

**Must be reconciled with:**

Preview/commit transactions, source revisions, stale evaluation, selection persistence, exception patches, freeze, fork, and snapshot states.

**Why:**

A user can edit the path, query, geometry configuration, mapping, or materialized clip from several surfaces.

**Question the integration pass must answer:**

Is a committed gesture stored as:

1. only a polyline that reprojects;
2. only a frozen TileID sequence;
3. both, with reproject as an explicit command?

**Recommendation:** store both, but make the resolved sequence authoritative until explicit reproject.

---

## DR-15 / Native shared-core strategy

**This report concludes:**

Exact IDs and all discrete geometry decisions must be cross-platform identical.

**Must be reconciled with:**

TypeScript, Swift, Rust/WASM, or another shared systems core.

**Why:**

Even a tiny discrepancy in an exact ceiling can replace an entire tile and cascade through adjacency and musical output.

**Question the integration pass must answer:**

Does AGL:

- implement one shared exact kernel;
- duplicate the kernel in TypeScript and Swift with exhaustive conformance;
- or keep native as a consumer of precomputed geometry?

This does not block the web implementation if the language-neutral contract is frozen, but it blocks native architecture closure.

---

## DR-11 — Professional music-tool UX

**This report concludes:**

Construction, composition, and inspection require different emphases.

**Must be reconciled with:**

DR-11’s principle that Explore/Compose/Inspect are workspace arrangements, not permission modes, and that generated versus frozen state cannot depend on color.

**Why:**

Penrose has unusually dense mathematical detail; hard modes could make essential actions mysteriously unavailable.

**Question the integration pass must answer:**

Which panels and overlays are emphasized in each workspace while preserving one shared command model and identity system?

---

## DR-13 — Multimodal accessibility

**This report concludes:**

Exact geometry, adjacency, traversal, and sonification features already form a semantic model suitable for accessible alternatives.

**Must be reconciled with:**

Keyboard traversal, ordered descriptions, non-color encoding, reduced motion, and complex-canvas semantics.

**Why:**

An auditory mapping cannot be the sole representation of structural information, and the canvas cannot require precise pointer gestures.

**Question the integration pass must answer:**

What canonical ordered text/table representations accompany each construction, matching, graph, hierarchy, and traversal view?

---

## DR-16 — Guided learning and experiment design

**This report concludes:**

The strongest educational experience compares exact construction, matching, hierarchy, graph traversal, and periodic controls while preserving honest claim boundaries.

**Must be reconciled with:**

Prediction, manipulation, observation, explanation, misconception, reset, and evidence-status patterns.

**Why:**

A visually compelling tiling can encourage exactly the overclaims DR-09 warns against.

**Question the integration pass must answer:**

How should the lab teach the distinction between:

- finite validation;
- finite illustration;
- asymptotic trend;
- attributed global theorem?

---

## AGL-005 — Seed and stable-ID utilities

**This report concludes:**

All stochastic traversal must use the established deterministic seed infrastructure.

**Must be reconciled with:**

Existing PRNG algorithm, key derivation, canonical serialization, and golden vectors.

**Why:**

DR-09 must not invent `Math.random` or a Penrose-specific seed contract.

**Question the integration pass must answer:**

What exact key tuple combines project, node, traversal, entity, step, and seed while preserving intended behavior under graph edits?

---

## MIDI and MusicXML export

**This report concludes:**

Penrose geometry produces bounded event sequences whose source structure is richer than either export format.

**Must be reconciled with:**

MIDI timing/track semantics, notation quantization, unsupported metadata, and export-loss provenance.

**Why:**

A successful export must not imply that the receiving file retains adjacency, ribbon identity, or matching rules.

**Question the integration pass must answer:**

Which provenance remains in a manifest/sidecar, and which transformations are recorded as export-only loss?

---

# 13. Contradictions, Weak Evidence, and Open Questions

## 13.1 Golden fixture availability

The report provides exact counts and hashes and references a downloadable JSON fixture, but the actual fixture is not present in the currently mounted conversation artifacts. Only the embedded summary is retrievable.

**Consequence:** AGL-120 cannot honestly claim a reproduced golden result yet.

## 13.2 Prototype reproducibility

DR-09 says two prototypes were built, but the integration context does not include:

- source code;
- exact runtime/dependency versions;
- command line;
- raw output;
- source commit;
- implementation-language details;
- whether the acceptance-window path used exact arithmetic or Float64 plus margin.

**Consequence:** Prototype agreement is strong research evidence, not yet a CI receipt.

## 13.3 Golden selection mismatch

The golden fixture is described as selecting tiles by **centroid inside** \([-5,5]^2\), while the proposed production operator defaults to tiles that **intersect** a region.

These are different finite-patch semantics and can produce different counts and hashes.

**Recommendation:** Keep the golden’s selection rule explicit and versioned; add a separate `intersects` fixture rather than changing the existing fixture silently.

## 13.4 Configuration-hash ambiguity

The report says to hash “canonical semantic config” but also shows matching convention and view fields in the operator configuration.

It does not specify whether the hash includes:

- matching-arrow convention;
- golden-corpus version;
- operator semantic version;
- edge length;
- family-coordinate convention;
- hierarchy convention.

**Recommendation:** Use the split hash scheme in ADR-PEN-003.

## 13.5 Full hash missing

The reported fixture exposes only a configuration-hash prefix.

**Consequence:** The prefix is useful for display but insufficient as a durable golden identity.

## 13.6 Orientation-class convention is not frozen

The report establishes five orientation classes but does not provide the exact numbering convention.

**Consequence:** Two conforming implementations could classify the same orientations with different integer labels, affecting presets and hashes.

**Recommendation:** Adopt and fixture a canonical formula or lookup table.

## 13.7 Turn-class semantics are underspecified

`turnClass` appears in traversal and mapping proposals, but the report does not define:

- directed versus undirected angle;
- entry/exit edge orientation;
- U-turn handling;
- integer class numbering;
- start-step behavior.

**Consequence:** Vertex-Star Walk is not implementation-complete.

## 13.8 Hierarchy ancestry is underspecified

Robinson triangles are selected as the hierarchy oracle, but DR-09 does not fully specify:

- canonical triangle orientation/handedness encoding;
- composition origin;
- ambiguity resolution;
- ancestry ID;
- behavior at finite-query boundaries;
- whether hierarchy is unique for the selected pentagrid configuration.

**Consequence:** Hierarchy Pulse remains conditionally accepted rather than ready.

## 13.9 Legal-star corpus is described, not delivered

The report states that exactly eight P3 complete vertex neighborhoods are legal and recommends a normalized corpus, but the currently available report does not expose the complete machine-readable encodings.

**Consequence:** Matching-rule acceptance cannot be implemented directly from this packet alone.

## 13.10 Matching-mark reconstruction is not pseudocoded

The report says marks can be reconstructed, including ambiguous local cases, but does not provide a complete algorithm or table.

**Consequence:** Two implementations could make opposite but internally consistent arrow assignments.

## 13.11 Acceptance-window boundary handling

The report uses open acceptance windows and reports a Float64 diagnostic margin of approximately `0.0124612` for the fixture.

That margin:

- applies only to that fixture;
- does not prove future points are similarly separated;
- does not define exact boundary behavior;
- does not justify numeric predicates.

**Recommendation:** use exact tri-state predicates.

## 13.12 “Independent” oracle language is easy to overstate

Pentagrid and cut-and-project implementations differ computationally but are mathematically linked and may share:

- phase convention;
- roots-of-unity basis;
- family numbering;
- generated candidate addresses;
- coordinate transforms.

**Consequence:** Agreement strongly reduces coding risk but is not two unrelated mathematical proofs.

## 13.13 Finite-query halo bound needs implementation proof

DR-09 derives a conservative relation and proposes a roughly 2.8-unit pentagrid-space expansion. The derivation is plausible, but engineering still must prove:

- closed/open boundary treatment;
- line-range rounding;
- inverse-affine bounds;
- tile-base-vertex choice;
- no false omissions under large coordinates;
- correct handling of Float64 presentation AABBs.

**Consequence:** Treat the bound as a design input plus property-test target, not an unchecked constant.

## 13.14 Runtime Float64 query semantics remain ambiguous

A viewport AABB supplied as Float64 is itself an exact dyadic value at the bit level, but the report does not say whether the query engine:

- converts it to exact dyadic rationals;
- uses outward interval arithmetic;
- uses a conservative Float64 broad phase followed by exact checks;
- allows harmless overenumeration.

**Recommendation:** Require no false omissions; permit conservative overenumeration before exact canonical dedupe.

## 13.15 Exact overlap versus gap validation

No-overlap is straightforward with exact canonical polygons. “No gaps,” however, only has meaning relative to a declared exact core region and complete union boundary.

**Consequence:** A screenshot or arbitrary Float64 viewport cannot carry an unqualified “gap-free exact patch” badge.

## 13.16 Asymptotic trend acceptance lacks a window sequence

The report correctly says thick:thin tends to \(\phi\), but it does not specify:

- region shapes;
- centers;
- growth schedule;
- boundary correction;
- convergence error threshold.

**Consequence:** Use trend visualization and regression envelopes, not a single rigid numeric pass/fail threshold until a corpus is chosen.

## 13.17 “All eight stars occur” lacks minimum corpus size

The report correctly treats this as a corpus property, not a tiny-patch invariant, but no representative patch or minimum radius is supplied.

**Consequence:** AGL needs a separate star-coverage fixture.

## 13.18 Performance evidence is provisional

No raw browser benchmark accompanies the 10k-tile and memory targets.

**Consequence:** These values are engineering planning assumptions, not measured support claims.

## 13.19 BigInt portability and performance

The semantics are sound, but DR-09 does not establish:

- exact browser matrix performance;
- Swift representation;
- serialization overhead;
- worker structured-clone cost;
- whether a shared systems core is worthwhile.

**Consequence:** Requires an implementation spike, not new mathematical research.

## 13.20 Event default is not scientifically meaningful

The suggested 1,024-event default is a usability/performance starting point, not a property of Penrose tilings or musical perception.

## 13.21 Custom-phase product value is unproven

Even if generic phase certification is feasible, DR-09 does not establish that user-editable phases materially improve the MVP experience.

**Consequence:** Keep deferred unless a concrete user goal appears.

## 13.22 No perceptual evidence for the presets

Ribbon Weave, Hierarchy Pulse, and Vertex-Star Walk are structurally defensible mappings, but no user study shows they:

- improve understanding;
- sound preferable;
- make periodic/aperiodic structure distinguishable;
- reduce cognitive load.

**Consequence:** Label them engineering/pedagogical presets, not empirically validated sonifications.

---

# 14. Research Follow-Ups

Only the following follow-ups are likely to change engineering or product decisions materially.

| Priority | Question | Why current evidence is insufficient | Decision blocked | Best method |
|---|---|---|---|---|
| **Critical** | Can the referenced golden fixture and both prototype implementations be recovered and independently regenerated? | Only report summaries and hashes are currently available. | AGL-120 closure and trusted golden acceptance | Recover source artifacts; clean-room run; compare full bytes and hashes |
| **Critical** | What are the exact eight-star encodings and complete matching-decoration tables under `penrose-p3-dandrea-2023`? | The report states their existence but does not deliver a machine-readable corpus in the retrievable artifacts. | Matching-rule implementation and FR-04 | Source-bound extraction plus independent table generation and mutation tests |
| **High** | What is the canonical Robinson hierarchy/ancestry for the selected pentagrid configuration? | “Use Robinson triangles” does not fully define stable ancestry IDs or ambiguity handling. | Hierarchy Pulse and hierarchy traversal | Small mathematical/implementation derivation; compare with trusted substitution implementation |
| **High** | Should the exact kernel be shared across web and Swift or duplicated? | DR-09 defines semantics but not cross-platform implementation economics. | Native architecture and AGL-146 | Implement TS and small Rust/Swift spikes; benchmark and run exact conformance corpus |
| **High** | Are DR-09’s provisional tile, latency, and memory budgets appropriate for the support matrix? | No raw benchmark accompanies them. | Final AGL-121/122 performance gates | FR-08 workload sweep on declared browser/hardware profiles |
| **Medium** | What exact degeneracy rules govern user-path projection? | Edge-following, vertex touches, re-entry, and sampling are unspecified. | User-drawn traversal | Build adversarial geometric fixtures; choose deterministic policy through UX/command review |
| **Medium** | Do users understand the three structural presets and their periodic controls? | Structural relevance does not establish comprehension. | Educational claims and default guided sequence | Small within-subject comprehension study with matched controls |
| **Low / post-MVP** | Is there enough user value to justify arbitrary phase presets or editing? | Feasibility alone does not establish product value. | Custom-phase roadmap | Prototype named certified alternatives; user research before generic editor |

No further broad literature survey is required to choose the production construction.

---

# 15. Integration Checklist

- [ ] Accept ADR-PEN-001: Canonical construction and P3 representation.
- [ ] Accept ADR-PEN-002: Exact numeric kernel and rendering boundary.
- [ ] Accept ADR-PEN-003: Configuration and entity identity.
- [ ] Accept ADR-PEN-004: Query, halo, and clipping semantics.
- [ ] Accept ADR-PEN-005: Matching and validation oracles.
- [ ] Accept ADR-PEN-006: Typed ports and persistence boundary.
- [ ] Accept ADR-PEN-007: Traversal and gesture materialization.
- [ ] Reconcile ADR-PEN-008 with DR-08.
- [ ] Calibrate ADR-PEN-009 through FR-08.
- [ ] Recover the golden JSON fixture.
- [ ] Recover and commit both prototype implementations.
- [ ] Commit the regularity certificate.
- [ ] Commit the legal-star corpus.
- [ ] Commit the matching-decoration corpus.
- [ ] Add exact rational and \(\mathbb Q(\phi)\) schema definitions.
- [ ] Extend the canonical project schema.
- [ ] Extend the operator catalog and port types.
- [ ] Extend worker request/result contracts.
- [ ] Extend cache-key contracts.
- [ ] Extend evaluation budgets.
- [ ] Add Penrose provenance structures.
- [ ] Add generated/frozen traversal semantics.
- [ ] Add tile/skeleton graph-kind discriminators.
- [ ] Add exact geometry and traversal golden fixtures.
- [ ] Add property, metamorphic, mutation, and oracle tests.
- [ ] Add web/Swift conformance fixtures.
- [ ] Update the UI/UX specification.
- [ ] Add non-color and keyboard-accessible canvas semantics.
- [ ] Add Construction, Matching, Hierarchy, Graph, and Periodic Control views.
- [ ] Add Ribbon Weave, Hierarchy Pulse, and Vertex-Star Walk preset graphs.
- [ ] Add periodic rhomb and square-grid controls.
- [ ] Add user-facing scientific claim copy and prohibited-claim rules.
- [ ] Update AGL-120 through AGL-124.
- [ ] Update AGL-010/011/020–025/027/032/035/036/050/051/053/133/146/151.
- [ ] Update DR-09 research-register status.
- [ ] Run FR-04, FR-05, FR-08, and FR-11.
- [ ] Record final integration receipts before marking Penrose geometry accepted for M5.

---

# Integration Payload

**Research disposition:** DR-09 resolves the mathematical construction decision. Adopt regular de Bruijn pentagrid generation, canonical P3 thick/thin rhombs, exact integer/\(\mathbb Q(\phi)\) topology, Float64 rendering projection only, 5D cut-and-project validation, Robinson-triangle hierarchy, exact edge-key adjacency, bounded deterministic traversal, and DR-08-owned musical shaping. The Penrose sequencer is currently research-gated; DR-09 depends on DR-08 and unblocks AGL-120/121/122/123; M5 requires accepted Penrose geometry. 
**Core exact math:** \(\phi=(1+\sqrt5)/2\), \(\zeta=e^{2\pi i/5}\), \(u_j=\zeta^j\). Pentagrid family \(G_j=\{z:\operatorname{Re}(z\zeta^{-j})+\gamma_j\in\mathbb Z\}\); mesh index \(N_j(z)=\lceil\operatorname{Re}(z\zeta^{-j})+\gamma_j\rceil\); tiling point \(P(n)=\sum n_j\zeta^j\). For tile line pair \((r,m_r),(s,m_s)\), set \(n_r=m_r,n_s=m_s\); for other \(j\), precompute \(u_j=\alpha_{rsj}u_r+\beta_{rsj}u_s\), evaluate \(t_j=\alpha_{rsj}(m_r-\gamma_r)+\beta_{rsj}(m_s-\gamma_s)+\gamma_j\), then exact \(n_j=\lceil t_j\rceil\). Under the default denominator-five phase, \(t_j=(A+B\phi)/5\). Tile vertices are \(n,n+e_r,n+e_r+e_s,n+e_s\). No topology branch may use `Math.ceil(Number(...))`.

**Default configuration:** `dr09-default-v1`, \(\gamma=(0,1/5,2/5,-1/5,-2/5)\), exact rational strings, sum zero, regularity-certified. The ten triple-family certificate values in the \(\{1,\phi\}\) basis are `(3/5,-1/5)`, `(-2/5,1/5)`, `(-1/5,0)`, `(1/5,0)`, `(-2/5,2/5)`, `(-2/5,1/5)`, `(2/5,-2/5)`, `(-1,3/5)`, `(-3/5,1/5)`, `(-1/5,1/5)`; none belongs to \(\mathbb Z[\phi]\), so no triple intersection occurs. Arbitrary phases are rejected for MVP and require named certification before admission.

**Exact kernel contract:** `QPhi(a,b,d)` represents \((a+b\phi)/d\), with `d>0`, gcd normalization, exact equality/ordering/sign/floor/ceil. Vertex identity is exact five-tuple. Edge difference is \(\pm e_j\); physical edge length is symbolically one. Orientation determinant reduces to \(\sin36^\circ(A+B\phi)\), so sign is exact. Topological tolerance is zero. Float64 projection error envelope is \(\epsilon_{\rm coord}=32\cdot2^{-53}\max(1,\sum|n_j|)\), display/picking only; it may never merge vertices, create adjacency, suppress overlap, or decide matching.

**Recommended tile conventions:** Normalize line pair with `r<s`. Let \(\delta=\min((s-r)\bmod5,5-((s-r)\bmod5))\); `delta=1` thick, `delta=2` thin. Recommended versioned orientation class is `(r+s) mod 5`, but this formula is an integration recommendation and requires a golden lookup before public freeze.

**Identity:** Split `geometryConfigHash` from matching convention, validation corpus, implementation build, query, camera, and renderer. Local tile ID is normalized line pair; local vertex ID is five-tuple; local edge ID is sorted endpoint pair. Persisted reference is `{producerNodeId,geometryConfigHash,entityKind,localEntityId}`. Full digests are persisted; abbreviations are UI-only. Changing camera, zoom, query, clipping, render LOD, or arrow display cannot change geometry IDs. Changing phase intentionally changes geometry namespace. DR-09’s single “canonical semantic config” hash is too ambiguous unless split.

**Query semantics:** One configured infinite tiling; finite patch is a query result. Separate `PenroseConfiguration`, `GeometryQuery`, and `ViewState`. Core query requires a complete halo. One edge-neighbor ring is the direct-adjacency default; two rings are recommended for complete vertex-star validation. Result carries `haloComplete`, `truncated`, termination reason, and edge boundary status `shared|outsideQuery|invalidOpenEdge`. Missing due to query boundary is never “no neighbor.” Runtime Float64 viewport queries must be conservatively complete; exact fixture regions use exact rational/algebraic boundaries. DR-09’s approximate 2.8 pentagrid-space safety halo is adopted as a candidate enumerator bound but requires no-false-omission property tests.

**Clipping:** Canonical tile is always full exact rhomb. `ClipFragment{sourceTileRef,clipPolygonFloat64,clipBoundaryEdges}` is transient visualization only. Synthetic clip edges are tagged and cannot implement `CanonicalEdgeID`; fragments never become graph nodes, matching entities, or exact tiles. Presentation LOD may suppress labels/outlines/picking but never alter canonical geometry.

**Graphs:** Distinguish `penrose-rhomb-edge-skeleton` from `penrose-tile-adjacency`. Adjacency is built in \(O(T)\) through `Map<EdgeID,TileID[]>`; owner count >2 fails, count 2 adds symmetric adjacency, count 1 is query boundary or invalid open edge. Skeleton bipartite and degree 3–7 claims do not transfer to tile adjacency; the tile dual may contain triangles.

**Validation:** Multiple oracles with different failure modes: exact tile shape/tuple invariants, positive winding, no positive-area overlap, edge multiplicity, core containment/boundary cycles, symmetric adjacency, exact cut-and-project acceptance, complete legal-star corpus, compatible edge decorations, deterministic hashes, optional Robinson hierarchy. Validation scope enum: `exactFinite|oracleAgreement|asymptoticTrend|corpusCoverage|theoremAttributed`. Acceptance windows are tri-state `inside|outside|boundary`; generated default vertices must not land on boundary. Local matching checks do not prove arbitrary finite-patch extendability. Undecorated rhombs are insufficient. Required convention: `penrose-p3-dandrea-2023`; keep decoration version outside geometry hash.

**Golden report values:** fixture `dr09-p3-default-centroid-aabb-5`; selection is centroid in \([-5,5]^2\), not production `intersects` semantics. Reported: 129 tiles, 83 thick, 46 thin, 160 vertices, 288 undirected edges, 228 shared interior edges, 60 boundary edges, maximum multiplicity 2, Euler \(V-E+F=1\). Hashes: tile addresses `58a5e1cc9cfc57137a62fb3db860bd2e178d297c2c118a05ff5769e8447d220d`; vertex tuples `7e201d2475e3b8c296d727e505ed52ba3c6d966680bd719dc3452f3a7d0052e3`; edge multiplicity `f2585ef96b8d514f8eddff32bb16e61e7e070a1bdfe5d8c1060f41e87c62eb09`. Reported config prefix `2783b84ba62aa120`; full hash required. The fixture bytes and prototype source are absent from currently mounted artifacts, so AGL-120 cannot close until recovered and clean-room regenerated.

**Asymptotic contract:** small fixture ratio 83:46≈1.804 is not an error and must not be forced to \(\phi\). Inflation count matrix \(M=\begin{pmatrix}2&1\\1&1\end{pmatrix}\), Perron eigenvalue \(\phi^2\), asymptotic thick:thin eigenvector \(\phi:1\). Test as a growing-window trend, not exact finite equality. All eight stars are a sufficiently-large-corpus property, not every-patch invariant.

**Typed ports:** `geometry2d.penroseP3`, `graph.penroseTileAdjacency`, `graph.penroseSkeleton`, `features.penrose`, optional `hierarchy.penroseRobinson`, `validation.penrose`. Clipped primitives belong solely to visualization projection. Project stores semantic configuration and authored traversal/query state; generated patch data remains cache/derived state unless explicitly frozen.

**Traversal:** finite versioned objects with graph/config hash, kind, start/target, repeat policy, seed, max steps/node expansions, exact tie policy, ordered TileIDs, edge transitions, turn class, and termination reason. BFS/DFS order `edgeDirection→EdgeID→TileID`; shortest path BFS; weighted shortest Dijkstra nonnegative; random walk sorted candidates plus AGL-005 PRNG; radial exact squared-distance order; angular half-plane/cross-product order; ribbon walk follows selected ribbon; hierarchy walk needs canonical ancestry; self-avoiding stops trapped and is not maximal; coverage is explicitly heuristic, not Hamiltonian. User path projection persists resolved TileIDs, source polyline hash, query/config hash, projection version, and degeneracy policy. Edge/vertex-touch rules remain unresolved.

**Generated/frozen semantics:** live query/traversal can regenerate under source changes. Freeze records exact sequence, source graph revision, config/query/traversal hashes, seed, mapping graph, event output hash, and command ID. Upstream edits do not mutate snapshot; snapshot becomes stale and offers compare/re-freeze/keep. Worker/cache state is derived and never command history. Reprojecting a committed user gesture is explicit, not silent.

**Sonification boundary:** exact Penrose feature → DR-08 typed transform/normalization → optional quantization → musical constraint → event generation → AGL budget. Penrose geometry contains no pitch scale, register, gain, timbre, tempo, or quantizer. Required presets: Ribbon Weave, Hierarchy Pulse, Vertex-Star Walk. Expert Acceptance Window Drift deferred. Controls: periodic rhomb lattice for geometric comparison, square grid for graph comparison. Hold traversal, event budget, voice, quantizer, tempo, and feature range fixed. No universal musical defaults are justified. 
**Time/rendering:** traversal emits ordered steps; step→event time uses AGL exact rational musical time. Geometry never schedules audio. Realtime/offline must have exact traversal, event ID/order, rational time, target parameter, and provenance equality; waveform identity is outside DR-09 and governed by DR-03. New geometry/traversal evaluations create new render generations; stale results cannot schedule future events.

**Performance hypotheses:** normal visible ≤10k tiles, hard 25k; worker including halo target 25k, hard 100k; 10k generation ≤100 ms p95 and degrade/cancel before 250 ms; adjacency ≤50/100 ms; cached pan ≤25/50 ms; main integration ≤4/8 ms; picking ≤4/8 ms; 10k traversal ≤25/50 ms; default interactive events 1,024, hard cap AGL-025; geometry memory target <32 MiB, degrade before 64 MiB. Dedicated geometry worker; transferable packed renderer buffers; MessagePort/ordinary worker boundary sufficient; no baseline SharedArrayBuffer requirement. All values provisional pending FR-08.

**ADR candidates:** PEN-001 canonical construction; PEN-002 exact kernel/render boundary; PEN-003 identity/config namespace; PEN-004 query/halo/clipping; PEN-005 matching/oracles/scientific status; PEN-006 typed ports/persistence; PEN-007 traversal/gesture materialization; PEN-008 DR-08 mapping and periodic controls; PEN-009 worker/cache/performance. PEN-002 implementation placement waits DR-15; PEN-007 state behavior reconciles with DR-14; PEN-008 parameter graphs reconcile with DR-08; PEN-009 numeric acceptance waits FR-08.

**Critical unresolved artifacts/issues:** missing golden bytes; missing prototype source/raw receipts; missing full config hash; centroid-vs-intersects fixture semantics; missing machine-readable eight-star corpus; missing decoration reconstruction table; orientation-class numbering not frozen; turn-class semantics absent; Robinson hierarchy ancestry unresolved; exact runtime query boundary policy underspecified; cut-project prototype exactness not demonstrated from available code; no empirical performance data; no perceptual validation of presets.

**Backlog:** modify AGL-120 acceptance; add evidence-package recovery; split AGL-121 exact kernel/enumerator/clip adapter; modify AGL-122 graph-kind/halo semantics; split AGL-123 traversal/preset graphs; modify AGL-124 evidence-state UI; modify AGL-010/011/020/021/023/024/025/027/032/035/036/050/051/053/133/146/151; block arbitrary phases; update DR-09 from `chartered` to `research-complete-integration-pending`; run FR-04, FR-05, FR-08, FR-11.

**Finite claims:** directly state exact generated configuration, addresses, unit edges, canonical adjacency, complete local matching, five direction families, and finite validation results. Qualify nonperiodicity, quasiperiodicity, recurrence, inflation/self-similarity, fivefold symmetry, translation tests, and audible structure. Never claim finite rendering proves global aperiodicity, every crop is self-similar, every Penrose tiling has exact fivefold symmetry, local checks prove extendability, tile adjacency is bipartite, or a heuristic traversal is Hamiltonian.

#PenroseTiling #ComputationalGeometry #ExactArithmetic #AperiodicTilings #GraphAlgorithms #Sonification #DeterministicSystems #AuralGeometryLab #DR09 #ResearchIntegration

**Rough conversation token estimate:** ~151,000 tokens.