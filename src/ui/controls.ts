import { el } from "./dom.js";

let controlInstanceSequence = 0;

export interface RangeControlOptions {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly format?: (value: number) => string;
  readonly description?: string;
  readonly onInput: (value: number) => void;
}

export interface RangeControl {
  readonly root: HTMLElement;
  readonly input: HTMLInputElement;
  readonly output: HTMLOutputElement;
  set(value: number): void;
}

export function rangeControl(options: RangeControlOptions): RangeControl {
  if (![options.value, options.min, options.max, options.step].every(Number.isFinite) || !(options.max > options.min) || options.step <= 0 || options.value < options.min || options.value > options.max) {
    throw new RangeError("Range controls require finite bounds, a positive step, and an in-range initial value.");
  }
  controlInstanceSequence += 1;
  const inputId = `range-${slug(options.label)}-${controlInstanceSequence.toString(36)}`;
  const output = el("output", { className: "control-output" });
  const input = el("input", {
    className: "range-input",
    id: inputId,
    attributes: {
      type: "range",
      min: String(options.min),
      max: String(options.max),
      step: String(options.step),
      value: String(options.value),
    },
  });
  const format = options.format ?? ((value: number) => String(value));
  output.value = format(options.value);
  input.addEventListener("input", () => {
    const value = Number(input.value);
    if (!Number.isFinite(value)) return;
    output.value = format(value);
    options.onInput(value);
  });

  const label = el(
    "label",
    { className: "control-label", attributes: { for: inputId } },
    el("span", { text: options.label }),
    output,
  );
  const root = el(
    "div",
    { className: "control" },
    label,
    input,
    options.description === undefined
      ? null
      : el("p", { className: "control-description", text: options.description }),
  );
  return {
    root,
    input,
    output,
    set(value: number): void {
      input.value = String(value);
      output.value = format(value);
    },
  };
}

export function toggleControl(options: {
  readonly label: string;
  readonly checked: boolean;
  readonly description?: string;
  readonly onChange: (checked: boolean) => void;
}): HTMLElement {
  const input = el("input", { attributes: { type: "checkbox" } });
  input.checked = options.checked;
  input.addEventListener("change", () => options.onChange(input.checked));
  return el(
    "label",
    { className: "toggle-control" },
    input,
    el("span", { className: "toggle-track" }, el("span", { className: "toggle-knob" })),
    el(
      "span",
      { className: "toggle-copy" },
      el("strong", { text: options.label }),
      options.description === undefined
        ? null
        : el("small", { text: options.description }),
    ),
  );
}

export function segmentedControl<T extends string>(options: {
  readonly label: string;
  readonly value: T;
  readonly choices: readonly { readonly value: T; readonly label: string }[];
  readonly onChange: (value: T) => void;
}): HTMLElement {
  const group = el("div", { className: "segmented", attributes: { role: "group", "aria-label": options.label } });
  for (const choice of options.choices) {
    const item = el("button", {
      className: choice.value === options.value ? "segment is-active" : "segment",
      text: choice.label,
      attributes: { type: "button", "data-value": choice.value },
    });
    item.addEventListener("click", () => {
      for (const sibling of group.querySelectorAll(".segment")) {
        sibling.classList.remove("is-active");
      }
      item.classList.add("is-active");
      options.onChange(choice.value);
    });
    group.append(item);
  }
  return el(
    "div",
    { className: "control" },
    el("span", { className: "control-label", text: options.label }),
    group,
  );
}

export function selectControl<T extends string | number>(options: {
  readonly label: string;
  readonly value: T;
  readonly choices: readonly { readonly value: T; readonly label: string }[];
  readonly onChange: (value: T) => void;
}): HTMLElement {
  const select = el("select", { className: "select-input" });
  for (const choice of options.choices) {
    const option = el("option", { text: choice.label, attributes: { value: String(choice.value) } });
    option.selected = choice.value === options.value;
    select.append(option);
  }
  select.addEventListener("change", () => {
    const selected = options.choices.find((choice) => String(choice.value) === select.value);
    if (selected !== undefined) {
      options.onChange(selected.value);
    }
  });
  return el(
    "label",
    { className: "control" },
    el("span", { className: "control-label", text: options.label }),
    select,
  );
}

export function metric(label: string, value: string, detail?: string): HTMLElement {
  return el(
    "div",
    { className: "metric" },
    el("span", { className: "metric-label", text: label }),
    el("strong", { className: "metric-value", text: value }),
    detail === undefined ? null : el("small", { className: "metric-detail", text: detail }),
  );
}

export function statusPill(label: string, tone: "working" | "preview" | "research" | "planned"): HTMLElement {
  return el("span", { className: `status-pill status-${tone}`, text: label });
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
