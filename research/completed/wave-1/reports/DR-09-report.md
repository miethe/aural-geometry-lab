# 2026-08-18 — DR-09: Exact Penrose Tiling Generation, Adjacency, Traversal, and Musical Sequencing

**Program:** Aural Geometry Lab  
**Research decision:** **Accept de Bruijn’s regular pentagrid as the production construction, emitting P3 thick/thin Penrose rhombs. Use exact pentagrid/strip integers and cyclotomic vertex coordinates as canonical geometry; use Float64 only as a rendering projection. Use a 5D cut-and-project implementation as the independent oracle and Robinson triangles as the inflation/hierarchy oracle.**

## Executive decision

**TL;DR**

The production generator should be a **regular de Bruijn pentagrid → P3 rhomb tiling**, not an inflation-first implementation. It gives globally stable tile identities from grid-line addresses, direct finite-region generation, convex unit-edge tiles, exact adjacency, and a natural bridge to 5D cut-and-project mathematics. de Bruijn’s 1981 construction is the foundational source; modern treatments explicitly prove that a regular pentagrid maps to a plane-covering rhomb tiling and identify the same vertices through a five-dimensional projection construction. citeturn0search2turn0search7turn22view0turn24search0

Internally, **do not canonicalize vertices by spatial tolerance**. A vertex is the exact five-integer mesh coordinate \(n=(n_0,\ldots,n_4)\), and its physical point is the symbolic cyclotomic integer
\[
P(n)=\sum_{j=0}^{4}n_j\zeta^j,\qquad \zeta=e^{2\pi i/5}.
\]
For a regular pentagrid satisfying \(\sum\gamma_j=0\), de Bruijn’s coordinate construction gives mesh indices with \(\sum n_j\in\{1,2,3,4\}\), and distinct meshes map to distinct tiling vertices; that makes the five-tuple itself a canonical vertex address for the chosen configuration. citeturn19view2turn22view0

Production strip classification can be **fully exact using only integers and \(\mathbb Q(\phi)\)**, where \(\phi=(1+\sqrt5)/2\). There is no need to intersect pentagrid lines with Float64 coordinates to decide topology. Because every one of the five grid normals is an exact \(\mathbb Z[\phi]\)-linear combination of any two nonparallel grid normals, all remaining strip coordinates at a grid-line intersection reduce to expressions \(a+b\phi\), followed by an exact ceiling operation. This is substantially simpler than carrying general algebraic planar coordinates through every predicate.

For the MVP, use one explicitly certified regular pentagrid phase,
\[
\boxed{\gamma=(0,\;1/5,\;2/5,\;-1/5,\;-2/5)}
\]
with \(\sum\gamma_j=0\). I derive below an exact certificate that no three grid families can meet at one point for this phase. Arbitrary user-specified phases should **not** ship in MVP; additional phases should be admitted only as named, regularity-certified presets.

I also built two small, computationally independent reference paths during this research run: a pentagrid intersection/dualization prototype and a 5D cut-and-project acceptance-window validator. For the canonical fixture selected by centroid in \([-5,5]^2\), they agree on all **160 vertices**. The resulting fixture contains **129 rhombs: 83 thick and 46 thin; 288 undirected edges; 228 shared interior edges; 60 boundary edges; maximum edge multiplicity two; and \(V-E+F=1\)**. The machine-readable fixture is available here: **[Download the DR-09 golden Penrose fixture](sandbox:/mnt/data/dr09-penrose-golden-v1.json)**.

This decision directly closes the research gate around AGL-120 through AGL-123: AGL-120 needs a selected construction/reference corpus; AGL-121 requires deterministic gap/overlap-safe finite patches with stable IDs; AGL-122 requires exact shared-edge adjacency without clipping artifacts; and AGL-123 requires bounded deterministic traversal and mappings. fileciteturn0file0 DR-09 is explicitly registered as depending on DR-08 and unblocking those four work items, while the Penrose lab remains research-gated in the lab manifest. fileciteturn0file4 fileciteturn0file2 M5 specifically requires accepted Penrose geometry. fileciteturn0file3

## Construction-method comparison

Penrose’s rhomb and kite/dart systems, Robinson’s triangular refinement, and de Bruijn’s pentagrid/cut-and-project description belong to the same mathematical Penrose family rather than being unrelated visual recipes. The Bielefeld Tilings Encyclopedia identifies Penrose rhombs as a two-prototile matching-rule tiling, gives inflation factor \(\phi\), and records de Bruijn’s higher-dimensional projection construction; Robinson triangles are mutually locally derivable from the rhombs and explicitly introduce handed triangular prototiles suitable for hierarchical substitution. citeturn21search1turn21search2turn21search6 Penrose’s own 1979 exposition and de Bruijn’s 1981 papers are the primary historical/theoretical anchors. citeturn6view0turn0search2turn0search7

| Construction | Mathematical basis | Finite arbitrary region | Stable identity / adjacency | Numeric robustness | Incremental refinement | Matching-rule pedagogy | DR-09 verdict |
|---|---|---:|---:|---:|---:|---:|---|
| **P3 thick/thin rhomb composition** | Classical Penrose matching rules and composition; inflation factor \(\phi\). citeturn21search2turn23view2 | Medium: natural supertiles, awkward viewport-first enumeration | Medium: history IDs work until representation/depth changes | High with exact symbolic substitution | High for adding substitution depth, weaker for arbitrary camera movement | Excellent: unit edges, arrows/arcs, eight legal vertex neighborhoods | Keep as derived educational hierarchy, not region generator |
| **Robinson triangles** | Four marked/handed triangular prototiles; mutually locally derivable with Penrose rhombs. citeturn21search1turn21search6 | Medium: excellent for finite supertiles; poor for unrelated viewport windows | High inside a fixed substitution tree; leaf IDs are depth-sensitive | Excellent | **Excellent** | **Excellent for inflation**; handedness must be retained | Secondary hierarchy/oracle |
| **P2 kite/dart** | Classical two-tile Penrose representation; seven documented vertex neighborhoods. citeturn23view2 | Medium | Medium | High with symbolic vertices | Medium | **Best immediate recognition**, but the dart is concave | Derived visualization only |
| **de Bruijn regular pentagrid → P3 rhombs** | Primary de Bruijn construction; regular grid intersections dualize to rhombs covering the plane. citeturn0search2turn22view0 | **Excellent**: directly bound line indices for a finite region | **Excellent**: tile = pair of persistent grid lines; vertex = persistent five-tuple | **Excellent**: integers + \(\mathbb Q(\phi)\) suffice for topology | **Excellent** for pan/zoom; no refinement-history identity problem | Excellent when pentagrid/ribbons are shown | **Production choice** |
| **5D cut-and-project** | de Bruijn’s \(\mathbb Z^5\) lattice / acceptance-window construction; modern texts present it alongside pentagrids. citeturn19view2turn24search0turn0search4 | Excellent mathematically; enumeration is somewhat less direct | Excellent | Excellent | Good | **Best explanation of quasiperiodic order** | Independent computational oracle and expert view |

The decisive engineering distinction is **finite-region semantics**. Inflation answers “what descendants does this seed supertile have after \(d\) substitutions?” A browser viewport asks a different question: “which tiles from this one fixed infinite tiling intersect this rectangle right now?” Pentagrid line addresses survive arbitrary viewport motion without changing identity, whereas an inflation-first representation must either grow a large seed far beyond the camera or manage a more elaborate hierarchy/address normalization layer. de Bruijn’s construction is therefore unusually well matched to an interactive spatial application. An earlier computational application by Owens and Stepney likewise used Penrose generation that could be expanded as computation approached a finite boundary, illustrating the practical importance of region-wise growth for unbounded Penrose structures. citeturn11search8

The **tile representation should nevertheless be P3 rhombs**, not raw pentagrid cells or 5D lattice points. Rhombs are convex, have a single edge-length class, have only two geometric types, and expose a shared-edge graph with at most four tile neighbors. The standard P3 prototiles have unit sides and acute angles \(36^\circ\) and \(72^\circ\); their areas are \(\sin36^\circ\) and \(\sin72^\circ\), whose ratio is \(\phi\). citeturn21search13 Kite/dart should be a derived explanatory projection through the Robinson representation rather than the canonical graph geometry.

Robinson triangles remain important because they solve a different problem extremely well. The Bielefeld reference describes four triangle prototiles—large/small and left/right—and explicitly notes that the handed distinction matters even though the unmarked shapes are mirror symmetric. citeturn21search1 They therefore make an excellent **independent substitution oracle** and “inflation microscope,” but not the best persistent world-coordinate model.

Pentagrid and cut-and-project should not be portrayed as two unrelated proofs. D’Andrea’s treatment explicitly develops the pentagrid and then derives the rhomb vertex set by projecting selected \(\mathbb Z^5\) lattice cells, while Baake and Grimm place Penrose-type structures in the broader model-set/cut-and-project framework. citeturn19view2turn24search0turn0search3turn0search4 They are mathematically linked, but they are still useful as **computationally independent implementations** because one can enumerate grid intersections while the other validates integer lattice points against acceptance windows.

## Exact production geometry and finite-patch semantics

Let
\[
\phi=\frac{1+\sqrt5}{2},\qquad
\zeta=e^{2\pi i/5},\qquad
u_j=\zeta^j,\quad 0\le j<5.
\]

For phase vector \(\gamma=(\gamma_0,\ldots,\gamma_4)\), grid family \(j\) is

\[
G_j=\left\{
z\in\mathbb C:
\operatorname{Re}(z\zeta^{-j})+\gamma_j\in\mathbb Z
\right\}.
\]

D’Andrea gives exactly this grid form and the associated ceiling function
\[
N_j(z)=\left\lceil \operatorname{Re}(z\zeta^{-j})+\gamma_j\right\rceil.
\]
A pentagrid is **regular** when no point belongs to more than two grid lines. Around a regular intersection there are four meshes; their five integer mesh coordinates map to the four vertices of a unit-edge rhomb. citeturn22view0

The mesh-to-tiling map is

\[
\boxed{P(n_0,\ldots,n_4)=\sum_{j=0}^{4}n_j\zeta^j.}
\]

Crossing one line of family \(j\) changes precisely one mesh coordinate by one, so the corresponding tiling edge changes by \(\pm\zeta^j\), immediately proving that every canonical edge has exact length one. citeturn22view0

**Production generation therefore does not need planar line intersections.** Suppose tile \(T\) corresponds to the intersection of lines \((r,m_r)\) and \((s,m_s)\), with \(r<s\). Set
\[
n_r=m_r,\qquad n_s=m_s.
\]
For any remaining family \(j\), precompute exact coefficients satisfying
\[
u_j=\alpha_{rsj}u_r+\beta_{rsj}u_s.
\]
Because all directions are fifth roots of unity, these coefficients are in \(\mathbb Z[\phi]\); examples reduce to values among \(\pm1,\pm\phi,\pm(\phi-1)\). Therefore the strip value at the intersection is exactly
\[
t_j=
\alpha_{rsj}(m_r-\gamma_r)
+
\beta_{rsj}(m_s-\gamma_s)
+
\gamma_j,
\]
and
\[
n_j=\lceil t_j\rceil.
\]

With the proposed denominator-five phase, every \(t_j\) can be stored as
\[
t_j=\frac{A+B\phi}{5},\qquad A,B\in\mathbb Z.
\]
The ceiling operation can be implemented with `BigInt` comparisons in the quadratic field; it must **not** call `Math.ceil(Number(...))`.

The resulting rhomb is

\[
n,\quad
n+e_r,\quad
n+e_r+e_s,\quad
n+e_s,
\]

with the last three reordered if necessary so the polygon is counter-clockwise. If
\[
d=\min\big((s-r)\bmod5,(r-s)\bmod5\big),
\]
then \(d=1\) is a **thick** \(72^\circ/108^\circ\) rhomb and \(d=2\) is a **thin** \(36^\circ/144^\circ\) rhomb. This classification is purely combinatorial; no angle computation is required. The unit-side geometry and the two angle classes agree with standard Penrose P3 definitions. citeturn21search13turn23view2

A production implementation can be as small conceptually as:

```text
generateTile(r, mr, s, ms, config):
    require 0 <= r < s < 5

    n[r] = mr
    n[s] = ms

    for j in 0..4 except r,s:
        (alpha, beta) = EXACT_DIRECTION_COEFFICIENTS[r][s][j]
        t = alpha * (mr - gamma[r])
          + beta  * (ms - gamma[s])
          + gamma[j]
        n[j] = ceilQPhi(t)

    vertices = [
        n,
        n + e[r],
        n + e[r] + e[s],
        n + e[s]
    ]

    if exactOrientation(vertices[0], vertices[1], vertices[2]) < 0:
        reverse polygon winding

    return Rhomb(
        address = (r,mr,s,ms),
        type = familySeparation(r,s) == 1 ? THICK : THIN,
        vertices = vertices
    )
```

### Certified default phase

The MVP phase should be

\[
\gamma=(0,1/5,2/5,-1/5,-2/5),
\qquad
\sum_j\gamma_j=0.
\]

The sum-zero normalization is the standard convention used in the pentagrid formulation. citeturn19view2 Regularity means ruling out every triple-grid intersection. For any three distinct families \(a,b,c\), write
\[
u_c=\alpha u_a+\beta u_b.
\]
A simultaneous intersection of lines with integer indices \(m_a,m_b,m_c\) would imply

\[
\gamma_c-\alpha\gamma_a-\beta\gamma_b
=
m_c-\alpha m_a-\beta m_b
\in\mathbb Z[\phi].
\]

For the proposed phase, exact reduction of the ten family triples gives the following right-hand-side coordinates in the basis \(\{1,\phi\}\):

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

An element of \(\mathbb Z[\phi]\) has **integer** coefficients in this basis; none of the ten rows has that property. Hence no triple family intersection is possible, so this phase is regular. This certificate is included machine-readably in the supplied golden fixture.

### Exact identities and numeric representation

The canonical structures should be:

```ts
type GridFamily = 0 | 1 | 2 | 3 | 4;
type Z = bigint;

interface VertexAddress {
  n: readonly [Z, Z, Z, Z, Z];
}

interface GridLineAddress {
  family: GridFamily;
  index: Z;
}

interface TileAddress {
  a: GridLineAddress; // a.family < b.family
  b: GridLineAddress;
}

interface PenroseRhomb {
  id: string;
  address: TileAddress;
  type: "thick" | "thin";
  orientationClass: 0 | 1 | 2 | 3 | 4;
  vertexIds: readonly [string, string, string, string];
}
```

A vertex should persist as the five-tuple rather than a reduced four-coefficient cyclotomic representation. Although \(1+\zeta+\zeta^2+\zeta^3+\zeta^4=0\) means arbitrary \(\mathbb Z^5\) coefficient vectors have a one-dimensional redundancy, the **pentagrid mesh coordinates are already canonically restricted**: for a regular, sum-zero pentagrid they have index \(\sum n_j\in\{1,2,3,4\}\), and distinct meshes give distinct vertices. citeturn19view2

Recommended IDs are therefore:

```text
config:
  sha256(canonical semantic config)

tile:
  P3/<configHash>/g<r>:<mr>/g<s>:<ms>

vertex:
  P3/<configHash>/v:<n0>,<n1>,<n2>,<n3>,<n4>

edge:
  P3/<configHash>/e:<lexicographically-smaller-vertex-id>/<other-vertex-id>
```

Use the full digest in persisted state; a shortened digest is only a UI abbreviation. **Viewport, zoom, selection state, render quality, clipping rectangle, and camera transform must not participate in the local mathematical tile ID.** A project-level identity can namespace it with the operator-instance ID. Changing \(\gamma\) changes the tiling and therefore intentionally changes the configuration namespace.

For exact predicates, topology has **zero tolerance**:

| Predicate | Production rule |
|---|---|
| Vertex equality | Exact five-tuple equality |
| Edge equality | Exact unordered endpoint-ID equality |
| Tile equality | Exact grid-line-address equality |
| Edge length | Symbolically one; no Euclidean tolerance |
| Thick/thin classification | Exact family separation |
| Orientation | Exact sign in the cyclotomic determinant field |
| Edge intersection | Exact orientation predicates |
| Adjacency | Exact shared `EdgeID` only |
| Acceptance-window membership | Exact \(\mathbb Q(\phi)\)/cyclotomic predicate |
| Rendering/picking | Float64/Float32 allowed, explicitly non-topological |

For a generic difference of two symbolic vertices, the oriented determinant of two cyclotomic integer vectors can be reduced to
\[
\sin36^\circ\,(A+B\phi),\qquad A,B\in\mathbb Z,
\]
so orientation reduces to the exact sign of \(A+B\phi\). No arbitrary geometric epsilon is needed.

Float64 should only evaluate a symbolic point for display:
\[
x=\operatorname{Re}P(n),\qquad y=\operatorname{Im}P(n).
\]
For diagnostic comparisons, let \(S=\sum_j|n_j|\) and binary64 unit roundoff \(u=2^{-53}\). A conservative rendering error envelope is
\[
\epsilon_{\rm coord}=32u\max(1,S)
\]
in unit-edge world coordinates, propagated through the current view transform. That envelope may be used for raster hit slop or “nearly on screen edge” decisions; **it must never merge vertices, create an edge, suppress an overlap, or decide a matching rule**.

### Finite region and clipping

The production object is conceptually one fixed infinite tiling. A “finite patch” is a **query result**, not a different finite tiling.

D’Andrea’s proof writes
\[
f(z)=\sum_jN_j(z)\zeta^j
\]
and shows that it stays within bounded distance of \((5/2)z\); explicitly, with
\[
\lambda_j=N_j(z)-\operatorname{Re}(z\zeta^{-j})-\gamma_j,\qquad 0\le\lambda_j<1,
\]
one obtains the \(5z/2\) term plus a bounded sum. citeturn22view0 Retaining the phase term gives
\[
f(z)=\frac52z+g+\sum_j\lambda_j\zeta^j,
\qquad
g=\sum_j\gamma_j\zeta^j,
\]
hence the conservative bound
\[
\left|f(z)-\frac52z-g\right|\le5.
\]

A rhomb lies at most two unit lengths from its chosen base vertex. Therefore, if a tile intersects output viewport \(W\), its pentagrid intersection must lie inside the inverse image of \(W\) expanded by a conservative seven world units before the \(2/5\) scale, i.e. roughly a **2.8-unit pentagrid-space safety halo**. This gives a direct finite enumerator:

```text
query(viewport W):
    R = inverseAffineBound(W, factor=2/5, phase=g)
    R = expand(R, conservativeRadius=2.8)

    for each family j:
        lineRange[j] =
            all integers n for which
            Re(z * ζ^-j) + gamma[j] = n
            can intersect R

    for each family pair r < s:
        for mr in lineRange[r]:
            for ms in lineRange[s]:
                reject if exact/interval intersection is outside R
                T = generateTile(r,mr,s,ms)
                retain T if its whole polygon intersects requested halo

    dedupe by TileID
```

The key semantic distinction is:

**Canonical tile:** always the full exact rhomb.  
**Visible fragment:** a transient render record `ClipFragment { sourceTileId, clipPolygon, clipBoundaryEdges }`.

A clipped polygon is **never** a new tile, vertex, or graph node. Artificial clip edges are tagged `clipBoundary=true`; they cannot participate in edge matching or adjacency. Consequently clipping cannot create false neighbors.

For graph completeness, a patch request contains two regions: a user-visible **core** and at least one full-tile **adjacency halo**. Adjacency for a core tile is published only after all four canonical edges have been checked against the halo. A neighbor absent because of the query boundary is `outsideQuery`, not “no neighbor.”

There is no production **inflation depth**. The mathematical configuration is fixed independently of zoom. Inflation depth becomes a separate educational/hierarchy field such as `compositionLevel`, computed from a Robinson-triangle or composition oracle. This prevents zooming from changing tile identity and prevents an implementation detail from masquerading as the definition of the tiling.

## Validation, golden fixtures, and property tests

The central QA principle should be **multiple oracles with different failure modes**. A decorative quasi-fivefold picture can easily satisfy visual plausibility, so screenshots and “looks Penrose-like” tests have essentially no evidentiary value.

The primary theorem-level basis is de Bruijn’s construction: a regular pentagrid dualizes to a plane-covering Penrose rhomb tiling, and the same structure has a five-dimensional cut-and-project description. citeturn0search2turn0search7turn22view0turn19view2 D’Andrea’s modern treatment additionally records that Penrose rhomb tilings have exactly eight legal vertex-neighborhood types and explains reconstruction of the edge markings from the underlying vertex/edge geometry. citeturn23view2

### Independent reference prototypes

**Prototype A — pentagrid dualization.** It enumerates pairwise grid-line intersections, derives the surrounding five-integer mesh coordinates, and emits the four corresponding P3 vertices using \(P(n)=\sum n_j\zeta^j\). This follows the pentagrid side of de Bruijn’s construction. citeturn22view0

**Prototype B — cut-and-project acceptance.** For a candidate five-tuple \(n\), define
\[
I(n)=\sum_j n_j
\]
and
\[
z_0(n)=\sum_{j=0}^{4}(n_j-\gamma_j)\zeta^{2j}.
\]
For valid pentagrid vertices, \(I\in\{1,2,3,4\}\). The acceptance windows can be written
\[
P_1=\operatorname{conv}\{1,\zeta,\zeta^2,\zeta^3,\zeta^4\},
\]
\[
P_2=-\phi P_1,\qquad
P_3=\phi P_1,\qquad
P_4=-P_1,
\]
with the vertex accepted when \(z_0\) lies in the appropriate open window. This is the cut-and-project/acceptance-window formulation developed in D’Andrea from de Bruijn’s \(\mathbb Z^5\) construction. citeturn20search1turn19view2turn26view2

For the supplied DR-09 fixture, Prototype B accepted **all 160 unique vertex addresses** emitted by Prototype A. The smallest observed Float64 distance from those test points to an acceptance-window boundary was approximately **0.0124612**, many orders of magnitude larger than numerical roundoff at this fixture scale. That margin is only a diagnostic for this fixture; the production design still specifies exact acceptance predicates.

The fixture is:

**[Download `dr09-penrose-golden-v1.json`](sandbox:/mnt/data/dr09-penrose-golden-v1.json)**

Its machine-readable exact golden summary is:

```json
{
  "fixtureId": "dr09-p3-default-centroid-aabb-5",
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

The 83:46 ratio in this small square is approximately 1.804, **not** \(\phi\), and that is expected: tile-frequency statements are asymptotic, while finite-window counts carry boundary/configuration effects. The Penrose rhomb inflation factor is \(\phi\), and the thick/thin unit-rhomb area ratio is also \(\phi\). citeturn21search2turn21search13 From area conservation, the corresponding count matrix is
\[
M=
\begin{pmatrix}
2&1\\
1&1
\end{pmatrix},
\]
whose Perron eigenvalue is \(\phi^2\) and whose positive eigenvector has thick:thin ratio \(\phi:1\). Therefore the ratio \(\phi\) belongs in **large-region trend tests**, not as an exact finite-patch equality.

### Property suite

The implementation acceptance suite should distinguish exact finite assertions from asymptotic/theorem-backed properties:

| Property | Test status | Oracle |
|---|---|---|
| Every tile has exactly four distinct vertices | Exact | Tile construction |
| Every edge difference is exactly \(\pm e_j\) in mesh coordinates | Exact | Integer representation |
| Every physical edge has symbolic length one | Exact | Cyclotomic construction |
| Every tile is exactly thick or thin from family separation | Exact | Grid-line address |
| Polygon winding is positive | Exact | Exact orientation predicate |
| No two distinct tiles have positive-area interior overlap | Exact over tested patch | Spatial broad phase + exact segment/orientation predicates |
| Canonical edges have multiplicity \(1\) or \(2\); never \(>2\) | Exact over patch | Edge map |
| Every asserted interior edge has multiplicity exactly \(2\) | Exact | Edge map + query-halo status |
| Adjacency is symmetric | Exact | Graph invariant |
| Adjacent tiles name the identical `EdgeID` | Exact | Graph invariant |
| Clipped edges never produce adjacency | Exact | Schema/type invariant |
| Pentagrid vertex accepted by cut-and-project oracle | Exact in production oracle | Independent construction |
| Complete vertex stars belong to documented P3 legal set | Exact | Proposition 4.5 reference corpus. citeturn23view2 |
| Matching decorations agree across shared edges | Exact | Versioned P3 decoration table |
| Regeneration produces byte-identical sorted addresses | Exact | Golden hashes |
| Thick/thin ratio approaches \(\phi\) over growing boundary-negligible windows | Asymptotic | Inflation/area derivation |
| All eight P3 vertex types occur in sufficiently large representative patches | Corpus property, not tiny-patch requirement | Penrose local-property reference. citeturn23view2 |
| Tiling-skeleton vertex degree lies from 3 through 7 | Exact local whitelist | Independent graph literature. citeturn13view0 |
| Tiling skeleton is bipartite | Exact global construction property; finite subgraphs testable | PRX analysis of Penrose rhomb graph. citeturn13view0 |

The last two invariants refer to the **vertex-and-edge skeleton of the rhomb tiling**, not the tile-adjacency graph. That distinction matters: the tile-adjacency dual may contain triangles around degree-three tiling vertices and must not be incorrectly asserted to be bipartite. Flicker, Simon, and Parameswaran explicitly describe the rhomb-edge graph as planar and bipartite, with vertex valences from three through seven. citeturn13view0

For overlap testing, use an AABB or uniform-grid broad phase, then exact convex-polygon/segment predicates. No “overlap area less than epsilon” exception is necessary for canonical geometry. Shared boundaries have zero area by construction and are identified symbolically.

For gaps, define what region is actually asserted to be covered. A viewport rectangle with arbitrary Float64 edges is a presentation query, not a theorem object. Acceptance fixtures should use exact rational/algebraic core regions; generate a complete halo, construct the exact boundary cycles of the selected union, verify no interior overlaps, and verify the claimed core is contained in that union. For simply connected golden patches, the exact combinatorial checks include a single outer boundary component and
\[
V-E+F=1.
\]
The supplied 129-tile fixture satisfies that value.

### Matching rules

The P3 rhombs must not be treated as “two undecorated rhomb shapes that happen to look right.” Undecorated thick/thin rhombs admit non-Penrose arrangements; the matching information is essential. The standard P3 system can express the restriction through edge arrows or equivalent arc decorations, and D’Andrea records exactly eight allowed P3 vertex neighborhoods. citeturn21search2turn23view2

Use a versioned convention:

```text
matchingConvention = "penrose-p3-dandrea-2023"
```

because D’Andrea explicitly notes that his single-arrow direction convention is reversed relative to de Bruijn’s convention. citeturn23view0 A version label prevents a mathematically harmless convention change from looking like a corrupted fixture.

The validator should have two layers. First, derive each complete local star from exact incident tile/edge records and compare its rotational/reflection-normalized encoding against the source-grounded P3 legal-star table. Second, reconstruct the matching decorations and verify that every canonical shared edge carries compatible markings. D’Andrea explains that the P3 markings can be reconstructed from the vertex neighborhoods/edge geometry, including the otherwise ambiguous local cases. citeturn23view2

A crucial pedagogical and QA caveat is that **passing every local check in an arbitrary finite user-edited patch does not prove that the finite patch extends to an infinite Penrose tiling**. D’Andrea explicitly discusses this nonlocality: finite local information can leave extension legality unresolved. citeturn22view1 Generator-produced patches inherit legality from the global construction; arbitrary edit validation is a different, harder problem and remains out of MVP scope.

Mutation tests should deliberately corrupt valid goldens by changing one strip index, duplicating a tile, swapping one vertex, reversing an edge-mark convention, dropping a neighbor, introducing a synthetic clipping edge, and rounding two nearby vertices together. Each corruption should fail a different invariant. That is far stronger protection against “decorative quasiperiodicity” than a rendered snapshot.

## Adjacency, traversal, and musical sequencing

For \(T\) tiles, shared-edge adjacency is a linear-time construction because each P3 tile contributes exactly four canonical edges:

```text
edgeMap = Map<EdgeID, TileID[]>

for tile in tiles:
    for canonical edge of tile:
        edgeMap[edge.id].append(tile.id)

for (edge, owners) in edgeMap:
    if owners.length > 2:
        fail("non-manifold / duplicate geometry")

    if owners.length == 2:
        (a,b) = sorted(owners)
        graph[a].add({tile:b, via:edge})
        graph[b].add({tile:a, via:edge})

    if owners.length == 1:
        classify as query-boundary or erroneous-open-edge
```

No coordinate search, nearest-neighbor index, endpoint epsilon, or segment-overlap tolerance appears in adjacency. An edge’s endpoint IDs are the proof of equality.

The canonical tile graph node should carry enough features that traversal and sonification do not need to reverse-engineer geometry:

```ts
interface PenroseTileFeatures {
  tileId: string;
  type: "thick" | "thin";

  // Five undirected rhomb orientations.
  orientationClass: 0 | 1 | 2 | 3 | 4;

  // The two pentagrid ribbons whose crossing produced this tile.
  ribbonA: { family: 0|1|2|3|4; index: bigint };
  ribbonB: { family: 0|1|2|3|4; index: bigint };

  // Derived exact / semantic data.
  vertexClasses?: readonly string[];
  vertexDegrees?: readonly number[];
  hierarchy?: PenroseHierarchyAddress;

  // Rendering-derived only, never identity.
  centroidFloat64?: readonly [number, number];
}
```

The two grid lines in the tile address are particularly valuable: in the dual picture, every tile lies at the crossing of two ribbons, and Penrose rhomb tilings have five ribbon directions. D’Andrea develops the ribbon/pentagrid correspondence explicitly. citeturn22view2turn26view0

### Traversal catalog

Every traversal result should be a finite object:

```ts
interface TraversalRequest {
  startTileId: string;
  maxSteps: number;
  maxEvents: number;
  seed?: string;
  repeatPolicy: "stop" | "loop" | "reflect";
  tiePolicyVersion: string;
}

interface TraversalStep {
  index: number;
  tileId: string;
  enteredViaEdgeId?: string;
  exitedViaEdgeId?: string;
  turnClass?: number;
  provenance: string;
}
```

| Traversal | Deterministic rule | Complexity | Termination semantics | Scientific meaning |
|---|---|---:|---|---|
| **Adjacency BFS** | Neighbor order = edge direction class, then `EdgeID`, then `TileID` | \(O(V+E)\) | Stop at budget/radius | Local graph shells |
| **Adjacency DFS** | Same ordered neighbors | \(O(V+E)\) | Stop at budget | Long branch-like exploration |
| **Shortest path** | BFS for unit graph cost | \(O(V+E)\) | Reach target or exhaust component/budget | True tile-graph distance |
| **Weighted shortest path** | Dijkstra with explicit nonnegative weights | \(O((V+E)\log V)\) | Target/budget | User-defined geometric cost |
| **Seeded random walk** | PRNG chooses from canonically sorted neighbors | \(O(B)\) for budget \(B\) | Exact `maxSteps` | Stochastic but reproducible |
| **Greedy self-avoiding walk** | Remove visited neighbors; seeded/canonical tie break | \(O(B)\) aside from set lookup | Stops early on trap | **Not** a claim of maximal coverage |
| **Radial sweep** | Exact squared-radius order; exact tie then ID | \(O(V\log V)\) | One pass | Spatial shells |
| **Angular sweep** | Half-plane + exact cross-product comparator; no `atan2` needed | \(O(V\log V)\) | One pass | Five-direction orientation structure |
| **Type/orientation grouping** | `(type, orientationClass, exact radius, id)` | \(O(V\log V)\) | One pass | Finite orientation classes |
| **Ribbon walk** | Continue through the opposite edge belonging to the selected ribbon | \(O(B)\) | Budget / finite query boundary | Strong Penrose structural mapping |
| **Inflation-tree traversal** | Canonical child-address DFS/BFS | \(O(B)\) | Hierarchy depth + budget | Substitution structure |
| **User path projection** | Spatial broad phase, then canonical tile intersection ordering | \(O((K+I)\log V)\) typical | End of path/budget | Geometric gesture projected onto exact tiles |
| **Coverage heuristic** | Greedy unvisited-neighbor score with bounded backtracking | Explicit node-expansion cap | Hard budget | Label as “coverage heuristic,” never Hamiltonian |

A radial or angular traversal should not use raw Float64 comparison when ties affect persisted event ordering. Squared distances and orientation comparisons can be implemented in the same exact algebraic predicate layer used for geometry. For user-drawn freehand paths, the input itself is inherently sampled/numeric; after projection, persist the resulting **tile-ID sequence** so subsequent evaluation and playback are deterministic even if rendering transforms later change.

Randomness must use the already-established program seed/stable-ID infrastructure rather than `Math.random`; AGL-005 is recorded as done with deterministic fixtures. fileciteturn0file0

### Musical mappings

DR-09 should hand DR-08 **semantic features**, not bake a scale or quantizer into Penrose geometry. DR-08 is already the registered prerequisite for AGL-123. fileciteturn0file4 The visible signal path should remain:

```text
exact tile/graph feature
    → feature transform / normalization
    → optional quantization
    → musical constraint
    → event generation
    → event budget
```

This makes it possible to say which audible regularities came from Penrose structure and which were imposed downstream.

The three recommended AGL-123 presets are:

| Preset | Penrose features | Musical mapping | Why it is structurally meaningful | Periodic control |
|---|---|---|---|---|
| **Ribbon Weave** | Selected ribbon, thick/thin sequence, crossing-family pair, strip index | Thick/thin → two rhythmic/accent states; crossing family → voice/register; line index → optional scale degree after visibly labeled modulo/quantization | Ribbons are intrinsic to the pentagrid/rhomb construction, and their one-dimensional ordering is tied to Fibonacci structure. citeturn22view2turn26view0 | Periodic rhomb strip with repeating binary pattern under identical event mapping |
| **Hierarchy Pulse** | Composition level, Robinson ancestry, tile type | Level → register/density; child slot → onset subdivision; type → articulation | Directly exposes inflation/composition rather than arbitrary position | Periodic \(2\times\) or \(3\times\) hierarchical grid with identical depth mapping |
| **Vertex-Star Walk** | Adjacency traversal, local vertex degree/configuration, exit-edge direction, turn class | Vertex class/degree → pitch or timbre; turn class → interval; tile type → duration/accent | Exposes finite local complexity and actual graph transitions | Square/rhombic periodic adjacency graph with same traversal and quantizer |

An expert-only fourth preset, **Acceptance Window Drift**, can expose the cut-and-project variables \(I(n)\) and \(z_0(n)\). Map the acceptance-window position continuously to timbre/pan and keep the integer strip/ribbon classes as discrete pitch or voice features. This directly sonifies the higher-dimensional selection mechanism rather than decorating the 2D picture. The five-dimensional projection interpretation is part of de Bruijn’s construction and D’Andrea’s treatment. citeturn19view2turn24search0

Mappings with **high structural evidentiary value** are ribbon membership, grid-family pair, thick/thin type, exact adjacency, local vertex class/degree, turn class, composition ancestry, and acceptance-window coordinates. Mappings such as random color-to-note, hash(tileID) modulo twelve, arbitrary centroid hue, or distance from the canvas center can be artistically useful but should be labeled **decorative mappings** because the same idea works on virtually any geometry.

Do not map \(\phi\) directly to the program’s exact musical time representation unless the approximation step is explicit. AGL’s existing time model is rational and drift-free; an irrational duration ratio would therefore necessarily be approximated or represented outside that domain. fileciteturn0file0 A better default is to let the **combinatorial thick/thin sequence** control rational durations, accents, density, or articulation while showing any quantization choice as a separate DR-08 stage.

For periodic A/B experiments, a **periodic rhomb lattice** is a better geometric control than only a square grid because it can preserve unit edges and one rhomb angle class while removing Penrose matching structure. A square grid remains useful as a graph control because every full tile has degree four. Keep traversal, event budget, synthesizer, quantizer, tempo, and feature ranges fixed between A and B; otherwise the listening comparison confounds geometry with music-system changes.

## Visualization, pedagogy, and defensible claims

The educational UI should make the mathematical construction inspectable rather than merely drawing a beautiful quasiperiodic background.

A **Construction view** should show the five pentagrid families and the dual P3 patch side by side. Hovering an intersection \((r,m_r),(s,m_s)\) highlights the corresponding rhomb; hovering a pentagrid mesh highlights the tiling vertex with its five-tuple. D’Andrea’s pentagrid exposition makes precisely this dual relationship—the intersection of two grid lines corresponds to a rhomb and adjacent meshes map to unit-edge vertices—central to the construction. citeturn22view0

An **Exact Geometry inspector** should expose, for a selected object:

```text
Tile
  P3/<config>/g1:-3/g3:5
  type: thin
  orientation class: …
  ribbon pair: (1,-3), (3,5)

Vertex
  n = (…,…,…,…,…)
  index Σn = 1..4
  exact point = Σ n_j ζ^j
  render point = (x_float64, y_float64)

Edge
  canonical endpoint IDs
  direction family j
  canonical length = 1
```

This is much more pedagogically useful than displaying decimal coordinates alone because the integer/cyclotomic representation is the mathematical reason identity is stable.

A **Matching Rule view** should display the selected versioned arrows or arc decorations, optionally overlay the local vertex-star class, and allow a deliberate “break one tile” experiment. The valid/invalid transition should be computed from canonical edges and local-star fixtures, not from color pixels. Penrose rhomb matching can be expressed by decorations/arrows, and only eight vertex-neighborhood types occur in a legal P3 tiling. citeturn21search2turn23view2

A **Hierarchy view** should convert or overlay Robinson triangles and animate composition/decomposition levels. Robinson triangles are specifically useful because cutting Penrose rhombs into marked triangles gives a hierarchical substitution representation that is mutually locally derivable with the rhomb tiling. citeturn21search1turn21search6 The UI label should say **“composition/inflation hierarchy”**, not imply that the finite viewport itself is an exactly self-symmetric fractal.

A **Graph view** should place a graph node at each tile center and draw a graph edge only through a genuine canonical shared rhomb edge. Clip-boundary fragments should remain visibly different—dashed/faded edges are appropriate—and must never acquire graph edges along the viewport rectangle.

A **Periodic Control view** should lock two canvases to the same pan, traversal length, mapping pipeline, transport, and sound. The Penrose side can be paired with a periodic rhomb lattice or square lattice. The useful observation is not simply that “one looks less repetitive”; the user can inspect translation, ribbon sequences, local configurations, graph paths, and resulting events under identical controls.

The lab should be unusually precise about claims:

| Safe user-facing claim | Claim to avoid |
|---|---|
| “This patch was generated from a certified regular de Bruijn pentagrid, a construction known to produce Penrose P3 tilings.” citeturn0search2turn22view0 | “It is Penrose because it looks quasiperiodic.” |
| “The displayed complete neighborhoods satisfy the chosen P3 matching-rule convention.” | “A finite local-rule check proves every possible continuation is legal.” |
| “No nonzero translation preserving this finite window was found within the tested search range.” | “This finite image proves nonperiodicity.” |
| “Penrose matching rules force nonperiodic plane tilings; the theorem is global.” citeturn6view0turn21search2 | “We proved global aperiodicity by rendering 5,000 tiles.” |
| “Composition exposes the hierarchical inflation structure.” | “Every finite crop is exactly self-similar.” |
| “The tiling has five edge/ribbon direction families and ten directed orientation classes.” citeturn26view0 | “Every Penrose tiling has exact fivefold rotational symmetry.” |
| “Some Penrose tilings have exact fivefold symmetry; the family also contains many without it.” | “Fivefold visual order means this particular configuration is globally fivefold symmetric.” |
| “Patterns recur throughout Penrose tilings; D’Andrea uses ‘quasi-periodic’ for this repetitivity property.” citeturn26view0 | “Finite visual recurrence by itself establishes every spectral definition of quasiperiodicity.” |

The warning about exact rotational symmetry is important. D’Andrea’s classification states that, up to congruence, only particular Penrose tilings possess exact fivefold symmetry rather than this being a symmetry of every individual Penrose tiling. citeturn23view2 The default \(\gamma\) above was chosen for robust regularity and stable computation, **not** to create an especially symmetric showpiece.

The lab can legitimately demonstrate exact finite facts—tile geometry, IDs, edge equality, matching decorations, local configurations, adjacency, cut-and-project acceptance, and explicit composition steps. It can **illustrate** global nonperiodicity, repetitivity, quasiperiodic long-range organization, and inflation hierarchy. The actual global theorem claims come from the mathematical construction and literature, not from the finite rendering. This is aligned with AGL-124’s existing “honest Penrose research-gated UI” requirement. fileciteturn0file0

## Architecture, performance, ADR, and handoff

The production operator should separate four layers:

```text
Certified Penrose configuration
        │
        ▼
Exact pentagrid enumerator
  Q(phi) strip classification
  integer grid-line addresses
        │
        ▼
Canonical P3 geometry
  Z^5 vertex addresses
  exact edge IDs
        │
        ├──────────────► Cut/project validator
        │
        ├──────────────► Matching/local-star validator
        │
        ├──────────────► Robinson hierarchy oracle
        │
        ▼
Tile adjacency graph
        │
        ├──────────────► Traversals / feature tables
        │
        └──────────────► DR-08 mapping pipeline
        │
        ▼
Float64 render projection + clipping
```

This fits the existing AGL architecture well: the program already has an executable operator interface, worker evaluator, deterministic evaluation cache, evaluation budget service, visualization projection contract, shared 2D canvas, stable-ID utilities, and property/invariant test infrastructure in the backlog. fileciteturn0file0

The recommended operator contract is:

```ts
interface PenrosePentagridParams {
  construction: "p3-debruijn-pentagrid";
  configPreset: "dr09-default-v1";
  matchingConvention: "penrose-p3-dandrea-2023";

  region: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };

  inclusion: "intersects";
  adjacencyHaloRings: 1 | 2;

  budgets: {
    maxTiles: number;
    maxVertices: number;
    maxTraversalSteps?: number;
  };
}

interface PenroseGeometryOutput {
  configHash: string;
  tiles: PenroseRhomb[];
  vertices: PenroseVertex[];
  edges: PenroseEdge[];

  query: {
    coreRegion: AABB;
    haloComplete: boolean;
    truncated: boolean;
  };

  provenance: {
    operator: "penrose.p3Pentagrid";
    version: 1;
    configPreset: string;
    goldenCorpusVersion: string;
  };
}
```

The operator should expose separate typed ports:

```text
geometry2d     → canonical full-tile geometry
adjacencyGraph → tile nodes + canonical shared edges
featureTable   → Penrose semantic features for DR-08
hierarchy      → optional composition/ancestry overlay
validation     → invariant and oracle results
```

Clipped drawing primitives belong to the visualization adapter, not the geometry port. That distinction is what guarantees the AGL-122 condition that clipping cannot create false edges.

The project schema should persist the **semantic configuration**, not enormous regenerated patches:

```json
{
  "operator": "penrose.p3Pentagrid",
  "version": 1,
  "params": {
    "configuration": {
      "preset": "dr09-default-v1",
      "gamma": ["0", "1/5", "2/5", "-1/5", "-2/5"],
      "matchingConvention": "penrose-p3-dandrea-2023",
      "edgeLength": "1"
    },
    "view": {
      "camera": "...non-semantic..."
    }
  }
}
```

`gamma` is serialized as exact rational strings, never JSON floating-point approximations.

### Performance plan

Candidate generation for a bounded region grows proportionally to the number of relevant pairwise grid-line intersections, hence approximately with displayed area at fixed edge scale. Exact tile construction is constant work per candidate, and edge-map adjacency is \(O(T)\) because each of \(T\) tiles has four edges. These structural properties follow directly from the five fixed line families and quadrilateral output. citeturn22view0

The following are **proposed engineering acceptance budgets**, not literature-derived performance claims; FR-08 should calibrate them against the final browser/support matrix:

| Workload | Target | Hard bound |
|---|---:|---:|
| Normal interactive visible patch | \(\le 10{,}000\) canonical tiles | 25,000 |
| Worker query including halo | \(\le 25{,}000\) tiles | 100,000 |
| 10k-tile generation + exact addresses | ≤100 ms p95 on fixed reference machine | cancel/degrade before 250 ms |
| 10k-tile adjacency build | ≤50 ms p95 worker | 100 ms |
| Cached pan producing small delta | ≤25 ms worker | 50 ms |
| Main-thread geometry integration | ≤4 ms synchronous slice | 8 ms |
| Picking after spatial-index build | ≤4 ms p95 | 8 ms |
| Deterministic 10k-step traversal | ≤25 ms worker | 50 ms |
| Interactive event sequence | default 1,024 events | hard cap inherited from AGL budget service |
| Geometry memory | target <32 MiB at normal workload | 64 MiB before degradation |

Exact five-tuples should be retained in worker/cache state; renderer-facing geometry should be packed into transferable typed-array buffers. Modern browser worker messaging supports transferable `ArrayBuffer`s so ownership can move between execution contexts instead of requiring the underlying memory to be retained as two active copies. citeturn25search3turn25search6 `SharedArrayBuffer` is not needed for MVP and would introduce cross-origin-isolation deployment requirements. citeturn25search0

Use a **dedicated geometry worker** behind the existing AGL worker evaluator. The worker should own:

```text
exact pentagrid coefficient tables
config certification
world-chunk → TileAddress cache
TileAddress → canonical tile cache
VertexAddress intern table
edge / adjacency builder
cut-project validator
traversal algorithms
```

Cache keys should exclude zoom:

```text
tile-chunk:
  hash(config semantics, chunk coordinates, generator version)

adjacency:
  hash(config, sorted tile-address set, adjacency-version)

hierarchy:
  hash(config, tile-address set, hierarchy-level, hierarchy-version)
```

The same tile can occur in multiple spatial query chunks; dedupe by exact `TileID`. Zooming out should not switch to “bigger mathematical tiles.” If the visible count exceeds the render budget, change only the presentation: aggregate, suppress outlines, disable individual labels/picking, or require a closer zoom. The canonical geometry remains unchanged.

The exact \(\mathbb Q(\phi)\) generator should precompute the tiny \(5\times5\times5\) family-coefficient table. That keeps the per-tile exact path to a few integer additions/multiplications and three exact ceilings rather than invoking a general-purpose algebraic-number package. `BigInt` can remain confined to identity and threshold-sensitive arithmetic; screen projection can use cached Float64 values.

### ADR proposal

**ADR-DR09-PENROSE-001 — Canonical Penrose Geometry**

| Field | Decision |
|---|---|
| Status | **Accept** |
| Production construction | Regular de Bruijn pentagrid |
| Canonical tile representation | P3 thick/thin rhombs |
| Default phase | \((0,1/5,2/5,-1/5,-2/5)\), exact and regularity-certified |
| Arbitrary phases | Deferred; certified preset phases only |
| Topological numerics | Grid integers + \(\mathbb Q(\phi)\) strip arithmetic + symbolic cyclotomic vertices |
| Rendering numerics | Controlled Float64; Float32 permitted downstream for rasterization only |
| Vertex ID | Exact canonical five-tuple scoped to configuration |
| Tile ID | Exact pair of pentagrid line addresses |
| Edge ID | Ordered pair of canonical vertex IDs |
| Finite patch | Query into one infinite configured tiling |
| Clipping | Render-only fragments referencing full source tiles |
| Adjacency | Exact shared canonical edge |
| Matching convention | Versioned D’Andrea-style P3 markings + legal vertex-star corpus |
| Independent oracle | 5D cut-and-project acceptance-window implementation |
| Hierarchy oracle | Robinson-triangle/composition representation |
| Inflation depth | Educational hierarchy only; never production tile identity |
| Traversal | Explicit finite budget, deterministic tie policy, seed when stochastic |
| Musical mapping | Semantic feature output feeding DR-08 quantization/constraint pipeline |
| Proof language | Finite patch demonstrates finite invariants; global aperiodicity claims attributed to the mathematical construction/theorems |

The principal consequence is favorable: the engine gets stronger correctness **and** simpler identity/adjacency at the price of a small exact-number kernel. The main implementation risk is exact ceiling/sign arithmetic in \(\mathbb Q(\phi)\), but that kernel is tiny enough for exhaustive unit and property testing.

### Engineering acceptance and project handoff

AGL-120 should close when this ADR, the primary/dependent source corpus, the default-phase regularity certificate, the cut-and-project oracle, and the supplied golden fixture are checked into the repository. AGL-121 then implements region enumeration and exact P3 records; its acceptance suite must regenerate the supplied hashes and pass overlap/gap/determinism tests. AGL-122 builds edge-key adjacency and explicitly tests clipping isolation. AGL-123 consumes that graph through the three bounded presets **Ribbon Weave**, **Hierarchy Pulse**, and **Vertex-Star Walk**, with DR-08 stages visible in provenance. Those responsibilities line up directly with the current backlog definitions. fileciteturn0file0

The frontier run register should be invoked immediately afterward: **FR-04 Mathematical Operator Oracle Expansion** against pentagrid/cut-project/Robinson fixtures; **FR-05 Lab Scientific/Mathematical Claim Audit** against the user-facing language above; **FR-08 Performance Workload and Budget Design** to calibrate the provisional thresholds; and **FR-11 Research-to-Engineering Distillation** to convert this report into repository ADR/schema/test artifacts. fileciteturn0file1

The key source hierarchy for that review is strong: Penrose’s original work and de Bruijn’s 1981 algebraic theory are the primary basis; D’Andrea’s 2023 Springer monograph supplies a modern proof-oriented synthesis of Robinson triangles, Penrose matching/local properties, pentagrids, and cut-and-project; the Bielefeld Tilings Encyclopedia independently documents the P3/Robinson substitution and MLD relationships; and the PRX graph analysis provides independent graph-level invariants. citeturn6view0turn0search2turn0search7turn24search0turn21search1turn21search2turn13view0

**Final research disposition:** there is no remaining architectural reason for AGL-120 through AGL-123 to wait on a geometry choice. The safe implementation path is **pentagrid for production identity and finite-region generation; \(\mathbb Q(\phi)\)+integer topology for exactness; P3 rhombs for canonical geometry; cut-and-project for the independent oracle; Robinson triangles for hierarchy; canonical-edge hashing for adjacency; bounded graph traversals for sequencing; and DR-08 for every musical quantization or constraint beyond intrinsic Penrose features.**

Tags: #PenroseTiling #ComputationalGeometry #AperiodicTilings #ExactArithmetic #GraphAlgorithms #Sonification #GenerativeMusic #AuralGeometryLab #DR09

**Rough conversation token estimate:** ~145k tokens including the research/tool corpus and this report.