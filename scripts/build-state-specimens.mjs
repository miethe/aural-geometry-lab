import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Renders every semantic-state value at both timeline-clip (12px) and inspector-row (16px)
// scale, using ONLY each value's declared non-color carrier, in a single ink on a single
// ground. The sheet is itself proof the encoding survives hue removal. Deterministic: no
// timestamps, integer geometry, fixed decimal precision.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INK = "#111111";
const GROUND = "#ffffff";
const AXES = ["materialKind", "sourceStatus", "derivation", "audio", "evidence", "mappingStage", "selection"];

const num = (value) => Number(value.toFixed(2)).toString();

function swatchWidth(height) {
  return height * 3;
}

function lineDash(style, height) {
  const unit = height >= 16 ? 2 : 1.5;
  switch (style) {
    case "dotted": return `${num(unit * 0.5)} ${num(unit)}`;
    case "dashed": return `${num(unit * 2)} ${num(unit)}`;
    case "dash-dot": return `${num(unit * 2)} ${num(unit)} ${num(unit * 0.5)} ${num(unit)}`;
    default: return "";
  }
}

// A shape-carried state still declares a lineStyle, and it is load-bearing: sourceStatus
// `not-applicable` is shape=rect + lineStyle=none (an empty slot), while `current` is
// lineStyle=solid on the same rect. Stroking the shape unconditionally rendered the two
// identically on this sheet even though their declared tuples differ — the sheet contradicted
// the encoding it exists to demonstrate. So the outline honours lineStyle here too.
function shapePath(shape, x, y, w, h, lineStyle) {
  if (lineStyle === "none") return "";
  const dash = lineDash(lineStyle, h);
  const S = `fill="none" stroke="${INK}" stroke-width="1"${dash.length > 0 ? ` stroke-dasharray="${dash}"` : ""}`;
  const r = h / 2;
  switch (shape) {
    case "circle": {
      const cx = x + h / 2;
      const cy = y + h / 2;
      return `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(h / 2 - 0.5)}" ${S}/>`;
    }
    case "pill":
      return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" rx="${num(r)}" ry="${num(r)}" ${S}/>`;
    case "rounded-rect":
      return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" rx="2" ry="2" ${S}/>`;
    case "diamond": {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const pts = [[cx, y], [x + w, cy], [cx, y + h], [x, cy]].map((p) => `${num(p[0])},${num(p[1])}`).join(" ");
      return `<polygon points="${pts}" ${S}/>`;
    }
    case "notched-rect": {
      const n = Math.max(3, h * 0.4);
      const pts = [
        [x, y], [x + w - n, y], [x + w, y + n], [x + w, y + h], [x, y + h],
      ].map((p) => `${num(p[0])},${num(p[1])}`).join(" ");
      return `<polygon points="${pts}" ${S}/>`;
    }
    case "chevron": {
      const pts = [
        [x, y], [x + w - h / 2, y], [x + w, y + h / 2], [x + w - h / 2, y + h], [x, y + h], [x + h / 2, y + h / 2],
      ].map((p) => `${num(p[0])},${num(p[1])}`).join(" ");
      return `<polygon points="${pts}" ${S}/>`;
    }
    default:
      return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" ${S}/>`;
  }
}

// Fill markers reference shared <pattern> definitions declared once in <defs>.
function fillRef(fill) {
  switch (fill) {
    case "solid": return INK;
    case "hatch-45": return "url(#fill-hatch-45)";
    case "hatch-135": return "url(#fill-hatch-135)";
    case "crosshatch": return "url(#fill-crosshatch)";
    case "stipple": return "url(#fill-stipple)";
    default: return "none";
  }
}

function renderSpecimen(entry, x, y, height) {
  const w = swatchWidth(height);
  const carrier = entry.carrier;
  if (carrier === "glyph") {
    const cx = x + w / 2;
    const cy = y + height / 2;
    return `<text x="${num(cx)}" y="${num(cy)}" font-family="ui-monospace, monospace" font-size="${num(height)}" fill="${INK}" text-anchor="middle" dominant-baseline="central">${escapeXml(entry.glyph ?? "")}</text>`;
  }
  if (carrier === "fill") {
    return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(height)}" fill="${fillRef(entry.fill)}" stroke="${INK}" stroke-width="0.75"/>`;
  }
  if (carrier === "shape") {
    return shapePath(entry.shape, x + 0.5, y + 0.5, w - 1, height - 1, entry.lineStyle);
  }
  // lineStyle carrier (default): a rect outline drawn with the declared dash/weight.
  if (entry.lineStyle === "none") {
    return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(height)}" fill="none" stroke="none"/>`;
  }
  if (entry.lineStyle === "double") {
    const inner = `<rect x="${num(x + 2)}" y="${num(y + 2)}" width="${num(w - 4)}" height="${num(height - 4)}" fill="none" stroke="${INK}" stroke-width="1"/>`;
    const outer = `<rect x="${num(x + 0.5)}" y="${num(y + 0.5)}" width="${num(w - 1)}" height="${num(height - 1)}" fill="none" stroke="${INK}" stroke-width="1"/>`;
    return outer + inner;
  }
  const dash = lineDash(entry.lineStyle, height);
  const dashAttr = dash.length > 0 ? ` stroke-dasharray="${dash}"` : "";
  return `<rect x="${num(x + 0.5)}" y="${num(y + 0.5)}" width="${num(w - 1)}" height="${num(height - 1)}" fill="none" stroke="${INK}" stroke-width="1"${dashAttr}/>`;
}

function escapeXml(text) {
  return text.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[character]));
}

const defs = [
  `<pattern id="fill-hatch-45" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="${INK}" stroke-width="0.75"/></pattern>`,
  `<pattern id="fill-hatch-135" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(135)"><line x1="0" y1="0" x2="0" y2="4" stroke="${INK}" stroke-width="0.75"/></pattern>`,
  `<pattern id="fill-crosshatch" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0 L4 4 M4 0 L0 4" stroke="${INK}" stroke-width="0.6"/></pattern>`,
  `<pattern id="fill-stipple" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.6" fill="${INK}"/></pattern>`,
].join("");

const tokens = JSON.parse(await readFile(path.join(root, "design", "tokens.json"), "utf8"));
const encodings = tokens.semanticStateEncodings ?? {};
const states = tokens.semanticStates ?? {};

const marginX = 16;
const labelX = marginX;
const labelWidth = 210;
const col12X = marginX + labelWidth;
const col16X = col12X + swatchWidth(16) + 40;
const rowStride = 28;
const axisGap = 20;

// Column headers sit on their own line BELOW the sheet title. Sharing y=24 with the title ran
// the two into each other once the title was long enough to reach the first column.
const COLUMN_HEADER_Y = 44;
const body = [];
let cursorY = 76;
body.push(`<text x="${col12X}" y="${COLUMN_HEADER_Y}" font-family="ui-monospace, monospace" font-size="9" fill="${INK}">12px clip</text>`);
body.push(`<text x="${col16X}" y="${COLUMN_HEADER_Y}" font-family="ui-monospace, monospace" font-size="9" fill="${INK}">16px row</text>`);

for (const axis of AXES) {
  const axisValues = Array.isArray(states[axis]) ? states[axis] : [];
  const axisEncoding = encodings[axis] ?? {};
  body.push(`<text x="${marginX}" y="${num(cursorY)}" font-family="ui-monospace, monospace" font-size="12" font-weight="600" fill="${INK}">${escapeXml(axis)}</text>`);
  cursorY += 20;
  for (const value of axisValues) {
    const entry = axisEncoding[value];
    if (entry === undefined) continue;
    const rowMid = cursorY + 8;
    body.push(`<text x="${labelX}" y="${num(rowMid)}" font-family="ui-monospace, monospace" font-size="10" fill="${INK}" dominant-baseline="central">${escapeXml(value)} (${escapeXml(entry.carrier)})</text>`);
    body.push(renderSpecimen(entry, col12X, cursorY + 8 - 6, 12));
    body.push(renderSpecimen(entry, col16X, cursorY + 8 - 8, 16));
    cursorY += rowStride;
  }
  cursorY += axisGap;
}

const TITLE = "Semantic state encodings — carrier-only, single ink";
const TITLE_FONT_SIZE = 13;
const height = cursorY + 8;
// The sheet is as wide as its widest element, which is not always the swatch columns: at 13px
// monospace the title alone is ~390px against a 378px column span, so a column-only width
// clipped the last word off the canvas.
const width = Math.max(
  col16X + swatchWidth(16) + marginX,
  marginX * 2 + TITLE.length * TITLE_FONT_SIZE * 0.6,
);
const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${num(width)}" height="${num(height)}" viewBox="0 0 ${num(width)} ${num(height)}" role="img" aria-label="Semantic state encoding specimens, monochrome">`,
  `<defs>${defs}</defs>`,
  `<rect x="0" y="0" width="${num(width)}" height="${num(height)}" fill="${GROUND}"/>`,
  `<text x="${marginX}" y="24" font-family="ui-monospace, monospace" font-size="${TITLE_FONT_SIZE}" font-weight="600" fill="${INK}">${escapeXml(TITLE)}</text>`,
  body.join("\n"),
  `</svg>`,
  "",
].join("\n");

const destination = path.join(root, "design", "state-encoding-specimens.svg");
await writeFile(destination, svg, "utf8");
console.log(`Wrote ${path.relative(root, destination)} (${AXES.length} axes)`);
