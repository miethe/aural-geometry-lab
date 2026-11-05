import type { LabModule, LabStatus } from "../labs/types.js";
import { metric, statusPill } from "./controls.js";
import { button, clear, el, svgEl } from "./dom.js";
import { euclideanRhythm } from "../operators/euclidean.js";
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

/** UI-local study storage; not a serialized AGL public project/package contract. */
export interface LocalRingSettings {
  readonly id: string;
  readonly name: string;
  readonly voice: string;
  readonly steps: number;
  readonly pulses: number;
  readonly rotation: number;
  readonly gain: number;
}
export interface LocalStudy {
  readonly id: string;
  readonly name: string;
  readonly modifiedAt: string;
  readonly bpm: number;
  readonly masterGain: number;
  readonly rings: readonly LocalRingSettings[];
}
type StudyStorage = Pick<Storage, "getItem" | "setItem">;
export const localStudyKey = "agl.local-studies.v1";

export function browserStudyStorage(): StudyStorage | undefined {
  try { return window.localStorage; } catch { return undefined; }
}

export function readLocalStudies(storage: StudyStorage | undefined): { projects: LocalStudy[]; error?: string } {
  try {
    if (!storage) throw new Error("Storage unavailable");
    const raw = storage.getItem(localStudyKey);
    if (raw === null) return { projects: [] };
    if (raw.length > 500_000) throw new Error("Library too large");
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data["version"] !== 1 || !Array.isArray(data["projects"]) || data["projects"].length > 50 || !data["projects"].every(isLocalStudy)) throw new Error("Invalid library");
    const projects = data["projects"] as LocalStudy[];
    if (new Set(projects.map((project) => project.id)).size !== projects.length) throw new Error("Duplicate study identity");
    return { projects: [...projects].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)) };
  } catch {
    return { projects: [], error: "Local library unavailable or unreadable. Existing stored data has been preserved." };
  }
}

export function saveLocalStudy(storage: StudyStorage | undefined, project: LocalStudy): string | undefined {
  if (!isLocalStudy(project)) return "Study settings are invalid; nothing was saved.";
  const result = readLocalStudies(storage);
  if (result.error) return result.error;
  const projects = result.projects.filter((candidate) => candidate.id !== project.id);
  if (projects.length >= 50) return "Library full (50 studies). Nothing was overwritten.";
  try {
    storage!.setItem(localStudyKey, JSON.stringify({ version: 1, projects: [project, ...projects] }));
    return undefined;
  } catch { return "Could not save locally. Storage may be blocked or full. Keep this tab open and try again."; }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function bounded(value: unknown, min: number, max: number, integer = false): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value));
}
function isLocalStudy(value: unknown): value is LocalStudy {
  if (!isRecord(value) || typeof value["id"] !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(value["id"]) || typeof value["name"] !== "string" || value["name"].trim().length === 0 || value["name"].length > 80 || typeof value["modifiedAt"] !== "string" || !Number.isFinite(Date.parse(value["modifiedAt"])) || !bounded(value["bpm"], 48, 180, true) || !bounded(value["masterGain"], .15, .9) || !Array.isArray(value["rings"]) || value["rings"].length !== 3) return false;
  return value["rings"].every((ring: unknown, index: number) => isRecord(ring) && ring["id"] === ["kick", "hat", "bell"][index] && typeof ring["name"] === "string" && ring["name"].length <= 80 && typeof ring["voice"] === "string" && ring["voice"].length <= 80 && bounded(ring["steps"], 3, 24, true) && bounded(ring["pulses"], 0, ring["steps"], true) && bounded(ring["rotation"], 0, ring["steps"] - 1, true) && bounded(ring["gain"], .1, 1));
}

export function newLocalStudy(): LocalStudy {
  return {
    id: Array.from(crypto.getRandomValues(new Uint32Array(4))).join("-"),
    name: "Untitled study", modifiedAt: new Date().toISOString(), bpm: 108, masterGain: .68,
    rings: [
      { id: "kick", name: "Low pulse", voice: "sine body", steps: 16, pulses: 0, rotation: 0, gain: 1 },
      { id: "hat", name: "High pulse", voice: "noise click", steps: 12, pulses: 0, rotation: 0, gain: .8 },
      { id: "bell", name: "Bell pulse", voice: "triangle ping", steps: 9, pulses: 0, rotation: 0, gain: .72 },
    ],
  };
}

export function createProjectLibrary(labs: readonly LabModule[]): HTMLElement {
  const storage = browserStudyStorage();
  const result = readLocalStudies(storage);
  const status = el("p", { className: "library-storage", attributes: { role: "status" },
    text: result.error ?? `${result.projects.length} local studies · Stored in this browser · No cloud sync` });
  const cards = el("div", { className: "project-grid" });
  const preview = el("aside", { className: "project-preview", attributes: { "aria-label": "Selected project preview" } });
  const selectionButtons: HTMLButtonElement[] = [];
  const root = el("div", { className: "project-library" },
    el("header", { className: "library-heading" },
      el("div", {}, el("span", { className: "eyebrow", text: "WORKSPACE / LIBRARY" }),
        el("h1", { text: "Recent projects" }), el("p", { text: "Local studies. Geometry ready to play." })),
      button("+ New project", { className: "button button-primary", onClick: createBlank })),
    el("div", { className: "library-workspace" }, cards, preview),
    panel("Guided labs", el("div", { className: "guided-labs" }, ...labs.map((lab, index) =>
      el("a", { className: "guided-lab", attributes: { href: `#/${lab.id}` } },
        el("span", { className: "guided-symbol", text: ["◎", "≋", "◇", "⋈", "▦", "∞", "⬡"][index] ?? "○", attributes: { "aria-hidden": "true" } }),
        el("strong", { text: lab.shortName }), statusPill(lab.statusLabel, lab.status))))), status);
  cards.append(button("+ New blank study", { className: "project-new", onClick: createBlank }));
  for (const project of result.projects) {
    const select = button(project.name, { className: "project-select", onClick: () => selectProject(project) });
    select.setAttribute("aria-pressed", "false");
    selectionButtons.push(select);
    cards.append(el("article", { className: "project-card" }, studyThumbnail(project), select,
      el("span", { className: "project-kind", text: "◎ Euclidean Rings" }),
      el("small", { text: `Modified ${new Date(project.modifiedAt).toLocaleString()}` }),
      el("code", { text: `${project.bpm} BPM · Local study` }),
      el("a", { className: "button button-quiet", text: "Open study →", attributes: { href: `#/euclidean-rings/${project.id}` } })));
  }
  if (result.projects[0]) selectProject(result.projects[0]);
  else preview.append(el("span", { className: "eyebrow", text: "PREVIEW" }), el("h2", { text: "A space for your next rhythm" }),
    el("p", { text: "Create a blank study, or explore a guided lab and save its settings here." }));
  return root;

  function createBlank(): void {
    const project = newLocalStudy();
    const error = saveLocalStudy(storage, project);
    if (error) { status.textContent = error; return; }
    window.location.hash = `#/euclidean-rings/${project.id}`;
  }
  function selectProject(project: LocalStudy): void {
    selectionButtons.forEach((control, index) => control.setAttribute("aria-pressed", String(result.projects[index]?.id === project.id)));
    clear(preview);
    preview.append(el("span", { className: "eyebrow", text: "PREVIEW / SELECTED IN LIBRARY" }),
      el("h2", { text: project.name }), studyThumbnail(project),
      el("p", { text: `Euclidean Rings · ${project.bpm} BPM` }),
      el("h3", { text: "Material summary" }),
      ...project.rings.map((ring) => el("p", { className: "project-material", text: `◌ ${ring.name} · Derived E(${ring.pulses}, ${ring.steps}) · live generated` })),
      el("p", { text: "Local settings · Patterns regenerate from the Euclidean kernel on open." }),
      el("a", { className: "button button-primary", text: "Open in studio →", attributes: { href: `#/euclidean-rings/${project.id}` } }));
  }
}

function studyThumbnail(project: LocalStudy): SVGSVGElement {
  const svg = svgEl("svg", { viewBox: "0 0 300 180", role: "img", "aria-label": "Derived preview of saved Euclidean rings", class: "study-thumbnail" });
  project.rings.forEach((ring, index) => {
    const radius = 72 - index * 20;
    svg.append(svgEl("circle", { cx: 150, cy: 90, r: radius, class: "thumbnail-ring" }));
    euclideanRhythm(ring).forEach((active, step) => {
      const angle = step / ring.steps * Math.PI * 2 - Math.PI / 2;
      svg.append(svgEl("circle", { cx: 150 + Math.cos(angle) * radius, cy: 90 + Math.sin(angle) * radius,
        r: active ? 4 : 2, class: `thumbnail-step ${active ? "is-on" : "is-off"}` }));
    });
  });
  return svg;
}
