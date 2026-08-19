import type { LabModule, LabStatus } from "../labs/types.js";
import { metric, statusPill } from "./controls.js";
import { el } from "./dom.js";
import { panel } from "./lab-layout.js";

export function createDashboard(labs: readonly LabModule[]): HTMLElement {
  const workingCount = labs.filter((lab) => lab.status === "working").length;
  const previewCount = labs.filter((lab) => lab.status === "preview").length;
  const researchCount = labs.filter((lab) => lab.status === "research").length;
  const root = el("div", { className: "dashboard" });

  root.append(
    el(
      "header",
      { className: "dashboard-hero" },
      el(
        "div",
        { className: "dashboard-hero-copy" },
        el("span", { className: "eyebrow", text: "Wave-1 integrated architecture · v0.3.0" }),
        el("h1", { text: "Make mathematics audible—and music structurally visible." }),
        el("p", {
          text: "Aural Geometry Lab is a reproducible workspace for composing with rhythms, graphs, recursive systems, geometry, and dynamical equations. Eight research domains now converge on one project, mapping, command, audio, geometry, UX, and native-ready contract. The runnable previews remain intentionally separate from the production semantic spine being built in M1.",
        }),
        el(
          "div",
          { className: "hero-actions" },
          dashboardLink("Open Infinite Staircase", "#/infinite-staircase", "button button-primary"),
          dashboardLink("Read the integrated architecture", "docs/18-wave1-system-integration.md", "button button-secondary", true),
        ),
      ),
      createHeroDiagram(),
    ),
    el(
      "div",
      { className: "metric-grid metric-grid-four dashboard-metrics" },
      metric("Labs in MVP", String(labs.length), "One shared runtime target"),
      metric("Wave-1 decisions", "36", "Cross-run reconciliations"),
      metric("Contract tests", "43", "35 TypeScript + 8 Swift"),
      metric("Evidence runs", "8", "Reports + Integration Packets"),
    ),
    panel("MVP laboratory catalog", createLabGrid(labs), { kicker: "Working product surface" }),
    panel(
      "Foundation architecture",
      el(
        "div",
        { className: "architecture-grid" },
        architectureLayer("Experience", "Lab shell · inspector · visual canvases · transport", "Browser UI"),
        architectureLayer("Canonical model", "Exact beat time · events · patterns · provenance · project schema", "Dependency-free TypeScript"),
        architectureLayer("Mathematical kernel", "Sequences · graphs · recursion · automata · geometry · dynamics", "Pure deterministic operators"),
        architectureLayer("Real-time boundary", "Look-ahead scheduler · Web Audio graph · safety limiter", "Native Web Audio adapter"),
        architectureLayer("Interchange", "Versioned JSON now; MIDI, WAV, MusicXML in planned milestones", "Portable artifacts"),
      ),
      { kicker: "Separation of concerns" },
    ),
    panel(
      "Delivery path",
      el(
        "div",
        { className: "milestone-timeline" },
        milestone("M0.75", "Wave-1 integration", "Complete", ["Evidence archive", "36 decisions", "13 ADRs", "Project/mapping/audio/interaction foundations", "Web + Swift conformance"], ""),
        milestone("M1", "Production semantic spine", "Started", ["Project v2 + packages", "Commands/materialization", "Graph compiler/workers", "Mapping/provenance", "React shell foundation"], "is-current"),
        milestone("M2", "Audio spine and P0 labs", "Next gate", ["ResolvedAudioPlan", "AudioWorklet/offline", "Browser benchmarks", "Analytic Risset migration", "Euclidean acceptance"], ""),
        milestone("M5+", "Full studio and native proof", "Evidence-gated", ["Seven complete labs", "Exact Penrose", "Accessibility/user evidence", "Private beta", "Bounded iPad proof"], ""),
      ),
      { kicker: "Stage gates, not date promises" },
    ),
    panel(
      "Program artifacts",
      el(
        "div",
        { className: "artifact-links" },
        artifactLink("Product requirements", "Scope, personas, stories, and acceptance criteria", "docs/01-product-requirements.md"),
        artifactLink("Wave-1 integration", "Cross-run architecture, resolved conflicts, implementation gates", "docs/18-wave1-system-integration.md"),
        artifactLink("Lab specifications", "Full MVP definition for every laboratory", "docs/03-lab-specifications.md"),
        artifactLink("Delivery roadmap", "Workstreams, milestones, dependencies, and exit gates", "docs/04-delivery-roadmap.md"),
        artifactLink("Research evidence", "Completed reports, packets, receipts, and remaining charters", "research/README.md"),
        artifactLink("Swarm handoff", "Parallel workstreams, merge rules, and implementation order", "docs/22-swarm-implementation-handoff.md"),
      ),
      { kicker: "Handoff-ready" },
    ),
  );

  return root;
}

function createLabGrid(labs: readonly LabModule[]): HTMLElement {
  const grid = el("div", { className: "lab-card-grid" });
  for (const lab of labs) {
    const link = el(
      "a",
      { className: "lab-card", attributes: { href: `#/${lab.id}` } },
      el(
        "div",
        { className: "lab-card-topline" },
        el("span", { className: "lab-card-category", text: lab.category }),
        statusPill(lab.statusLabel, lab.status),
      ),
      el("h3", { text: lab.name }),
      el("p", { text: lab.summary }),
      el(
        "footer",
        {},
        el("span", { text: lab.milestone }),
        el("span", { className: "lab-card-arrow", text: "→" }),
      ),
    );
    grid.append(link);
  }
  return grid;
}

function createHeroDiagram(): HTMLElement {
  return el(
    "div",
    { className: "hero-diagram", attributes: { "aria-label": "Mathematical objects flowing through mappings into sound and visualization" } },
    diagramNode("Mathematics", "patterns · graphs · geometry"),
    el("span", { className: "hero-diagram-arrow", text: "→" }),
    diagramNode("Mapping", "quantize · constrain · explain"),
    el("span", { className: "hero-diagram-arrow", text: "→" }),
    diagramNode("Experience", "hear · see · manipulate"),
  );
}

function diagramNode(title: string, detail: string): HTMLElement {
  return el("div", { className: "hero-diagram-node" }, el("strong", { text: title }), el("span", { text: detail }));
}

function dashboardLink(label: string, href: string, className: string, external = false): HTMLAnchorElement {
  return el("a", {
    className,
    text: label,
    attributes: external ? { href, target: "_blank", rel: "noreferrer" } : { href },
  });
}

function architectureLayer(title: string, detail: string, technology: string): HTMLElement {
  return el(
    "article",
    { className: "architecture-layer" },
    el("span", { className: "architecture-tech", text: technology }),
    el("h3", { text: title }),
    el("p", { text: detail }),
  );
}

function milestone(
  id: string,
  title: string,
  timing: string,
  items: readonly string[],
  className: string,
): HTMLElement {
  return el(
    "article",
    { className: `milestone ${className}`.trim() },
    el("div", { className: "milestone-marker", text: id }),
    el(
      "div",
      { className: "milestone-copy" },
      el("span", { className: "milestone-timing", text: timing }),
      el("h3", { text: title }),
      el("ul", {}, ...items.map((item) => el("li", { text: item }))),
    ),
  );
}

function artifactLink(title: string, detail: string, href: string): HTMLElement {
  return el(
    "a",
    { className: "artifact-link", attributes: { href, target: "_blank", rel: "noreferrer" } },
    el("strong", { text: title }),
    el("span", { text: detail }),
    el("span", { className: "artifact-arrow", text: "↗" }),
  );
}

export function navStatusClass(status: LabStatus): string {
  return `nav-status nav-status-${status}`;
}
