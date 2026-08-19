import { el } from "./dom.js";
import { statusPill } from "./controls.js";

export interface LabHeaderOptions {
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly status: "working" | "preview" | "research" | "planned";
  readonly statusLabel: string;
}

export function labHeader(options: LabHeaderOptions): HTMLElement {
  return el(
    "header",
    { className: "lab-header" },
    el(
      "div",
      { className: "lab-heading-copy" },
      el("span", { className: "eyebrow", text: options.eyebrow }),
      el("h1", { text: options.title }),
      el("p", { className: "lab-summary", text: options.summary }),
    ),
    statusPill(options.statusLabel, options.status),
  );
}

export function panel(
  title: string,
  content: Node | readonly Node[],
  options: { readonly className?: string; readonly kicker?: string } = {},
): HTMLElement {
  const nodes = Array.isArray(content) ? content : [content];
  return el(
    "section",
    { className: `panel ${options.className ?? ""}`.trim() },
    el(
      "header",
      { className: "panel-header" },
      options.kicker === undefined ? null : el("span", { className: "panel-kicker", text: options.kicker }),
      el("h2", { text: title }),
    ),
    ...nodes,
  );
}

export function formulaBlock(formula: string, explanation: string): HTMLElement {
  return el(
    "div",
    { className: "formula-block" },
    el("code", { text: formula }),
    el("p", { text: explanation }),
  );
}
