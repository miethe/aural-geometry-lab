export type DomChild = Node | string | number | null | undefined | false;

export interface ElementOptions {
  readonly className?: string | undefined;
  readonly text?: string | undefined;
  readonly id?: string | undefined;
  readonly title?: string | undefined;
  readonly attributes?: Readonly<Record<string, string>> | undefined;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
  ...children: readonly DomChild[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (options.className !== undefined) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  if (options.id !== undefined) {
    element.id = options.id;
  }
  if (options.title !== undefined) {
    element.title = options.title;
  }
  for (const [name, value] of Object.entries(options.attributes ?? {})) {
    element.setAttribute(name, value);
  }
  appendChildren(element, children);
  return element;
}

export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Readonly<Record<string, string | number>> = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

export function appendChildren(parent: Node, children: readonly DomChild[]): void {
  for (const child of children.flatMap(flattenChild)) {
    if (child === null || child === undefined || child === false) {
      continue;
    }
    parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function clear(element: Element): void {
  element.replaceChildren();
}

export function button(
  label: string,
  options: {
    readonly className?: string | undefined;
    readonly title?: string | undefined;
    readonly onClick: () => void | Promise<void>;
  },
): HTMLButtonElement {
  const control = el("button", {
    className: options.className ?? "button",
    text: label,
    title: options.title,
    attributes: { type: "button" },
  });
  control.addEventListener("click", () => {
    void options.onClick();
  });
  return control;
}

function flattenChild(child: DomChild): DomChild[] {
  return [child];
}
