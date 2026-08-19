import { metric, statusPill } from "../ui/controls.js";
import { el, svgEl } from "../ui/dom.js";
import { labHeader, panel } from "../ui/lab-layout.js";
import type { LabModule } from "./types.js";

const metadata = {
  id: "penrose-sequencer",
  name: "Penrose Sequencer",
  shortName: "Penrose",
  category: "Aperiodic geometry",
  summary: "Convert nonperiodic fivefold tilings into traversable musical structure without pretending that a decorative star is a valid Penrose construction.",
  status: "research" as const,
  statusLabel: "Construction accepted · artifacts gated",
  researchCharters: ["DR-09", "DR-08"],
  milestone: "M5 exact generator after artifact recovery",
};

export const penroseSequencerLab: LabModule = {
  ...metadata,
  mount(container): () => void {
    const conceptualDiagram = createConceptualDiagram();
    const metrics = el(
      "div",
      { className: "metric-grid metric-grid-four" },
      metric("Symmetry", "Fivefold", "Rotational structure"),
      metric("Periodicity", "None", "For a valid infinite Penrose tiling"),
      metric("Construction", "Pentagrid → P3", "Exact integer/Q(φ) topology"),
      metric("Artifact gate", "Open", "Golden/oracles/matching corpus"),
    );

    container.append(
      labHeader({
        eyebrow: metadata.category,
        title: metadata.name,
        summary: metadata.summary,
        status: metadata.status,
        statusLabel: metadata.statusLabel,
      }),
      metrics,
      el(
        "div",
        { className: "two-column-layout" },
        panel("Conceptual fivefold canvas", conceptualDiagram, { className: "panel-visual" }),
        panel(
          "Gate conditions",
          el(
            "div",
            { className: "gate-list" },
            gate("Artifact corpus recovered", "Check in or independently regenerate the DR-09 golden fixture, pentagrid/cut-and-project oracle sources, regularity certificate, legal star corpus, and matching table."),
            gate("Exact generator accepted", "Generate full P3 rhombs from certified pentagrid addresses; use exact shared-edge IDs and publish query/halo completeness."),
            gate("Traversal semantics", "Define graph walks that reveal aperiodic order rather than merely scanning screen coordinates."),
            gate("Musical mapping validated", "Separate tile type, orientation, inflation level, adjacency, and radial position into independently testable controls."),
          ),
        ),
      ),
      panel(
        "Candidate architecture",
        el(
          "div",
          { className: "pipeline-stack" },
          pipelineStage("Exact pentagrid kernel", "Certified phase, integer line addresses, exact Q(φ) strip predicates, and canonical P3 rhombs."),
          pipelineStage("Exact graph products", "Canonical full tiles/vertices/edges, tile adjacency, tiling skeleton, orientation, and optional hierarchy."),
          pipelineStage("Traversal operator", "Hamiltonian approximation, breadth/depth walks, radial shells, edge-following, or user-drawn path."),
          pipelineStage("Mapping operator", "Tile attributes become instruments, pitch classes, durations, articulation, and spatial position."),
          pipelineStage("Validation", "No gaps/overlaps beyond tolerance; local matching rules; repeatable output; bounded event density."),
        ),
        { kicker: "Planned typed pipeline" },
      ),
      panel(
        "Why implementation stops here",
        [
          el("p", {
            className: "body-copy",
            text: "DR-09 resolves the production construction, but a visually plausible picture still is not implementation evidence. The lab remains gated until exact fixture/oracle/matching artifacts and the property suite prove the generated topology." ,
          }),
          el(
            "a",
            {
              className: "button button-secondary inline-link-button",
              text: "Open DR-09 research charter",
              attributes: { href: "research/DR-09-exact-penrose-tiling-sequencer.md", target: "_blank", rel: "noreferrer" },
            },
          ),
        ],
        { kicker: "Construction accepted · implementation evidence gate" },
      ),
    );

    return () => undefined;
  },
};

function createConceptualDiagram(): HTMLElement {
  const wrapper = el("div", { className: "penrose-concept" });
  const width = 620;
  const height = 520;
  const centerX = width / 2;
  const centerY = height / 2;
  const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Conceptual fivefold geometry, explicitly not a generated Penrose tiling" });
  for (let ring = 1; ring <= 4; ring += 1) {
    const radius = ring * 52;
    const points = Array.from({ length: 10 }, (_, index) => {
      const angle = -Math.PI / 2 + index * Math.PI / 5 + (ring % 2) * Math.PI / 10;
      return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
    });
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      if (current !== undefined && next !== undefined) {
        svg.append(svgEl("line", { x1: current.x, y1: current.y, x2: next.x, y2: next.y, class: "penrose-concept-line" }));
      }
      if (current !== undefined) {
        svg.append(svgEl("line", { x1: centerX, y1: centerY, x2: current.x, y2: current.y, class: "penrose-radial-line", opacity: 0.15 + ring * 0.08 }));
      }
    }
  }
  svg.append(svgEl("circle", { cx: centerX, cy: centerY, r: 22, class: "penrose-core" }));
  const label = svgEl("text", { x: centerX, y: centerY + 5, class: "penrose-core-label", "text-anchor": "middle" });
  label.textContent = "φ";
  const warning = svgEl("text", { x: centerX, y: height - 18, class: "penrose-warning", "text-anchor": "middle" });
  warning.textContent = "conceptual fivefold scaffold — not asserted to be a Penrose tiling";
  svg.append(label, warning);
  wrapper.append(svg);
  return wrapper;
}

function gate(title: string, detail: string): HTMLElement {
  return el(
    "article",
    { className: "gate-item" },
    statusPill("open", "research"),
    el("div", {}, el("h3", { text: title }), el("p", { text: detail })),
  );
}

function pipelineStage(title: string, detail: string): HTMLElement {
  return el("article", { className: "pipeline-stage" }, el("strong", { text: title }), el("p", { text: detail }));
}
