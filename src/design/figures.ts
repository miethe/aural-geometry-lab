import { cyclicGapLengths, euclideanRhythm } from "../operators/euclidean.js";
import { tonnetzGrid, tonnetzPitchClass, type TonnetzNode } from "../operators/tonnetz.js";

export interface EuclideanRingLayer {
  readonly label: string;
  readonly steps: number;
  readonly pulses: number;
  readonly rotation?: number;
}

export interface EuclideanRingsFigureOptions {
  readonly layers: readonly EuclideanRingLayer[];
  readonly size?: number;
  readonly theme?: Partial<FigureTheme>;
}

export interface TonnetzLatticeFigureOptions {
  readonly radius: number;
  readonly originPitchClass?: number;
  readonly size?: number;
  readonly theme?: Partial<FigureTheme>;
}

/**
 * Ink for a figure that is composited onto a dark studio surface.
 *
 * These figures are rasterised (design/mockups/composite-figure.sh) and dropped into a reserved
 * plate in a rendered mockup, so every element must carry explicit presentation attributes: an SVG
 * with no `fill`/`stroke` inherits the spec default of solid black, which on the dark-instrument
 * theme renders each ring as an opaque disc.
 */
export interface FigureTheme {
  /** Labels and node outlines. `text.primary` in design/tokens.json. */
  readonly ink: string;
  /** Rings, rests, and lattice edges. `text.muted`. */
  readonly muted: string;
  /** Onsets — the marks the reader is meant to count. `accent.music`. */
  readonly accent: string;
  /** Behind lattice node labels so edges do not run through them. `bg.canvas`. */
  readonly ground: string;
  readonly fontFamily: string;
}

const DARK_INSTRUMENT_THEME: FigureTheme = {
  ink: "#F3F6F8",
  muted: "#7E8995",
  accent: "#67E8F9",
  ground: "#0B0D10",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

function resolveTheme(overrides: Partial<FigureTheme> | undefined): FigureTheme {
  return overrides === undefined ? DARK_INSTRUMENT_THEME : { ...DARK_INSTRUMENT_THEME, ...overrides };
}

const DEFAULT_SIZE = 480;

/** Emits a self-describing SVG whose onset data comes directly from Bjorklund's kernel. */
export function euclideanRingsSvg(options: EuclideanRingsFigureOptions): string {
  const size = svgSize(options.size);
  const theme = resolveTheme(options.theme);
  const center = size / 2;
  const outerRadius = size * 0.4;
  const ringSpacing = options.layers.length > 1 ? (outerRadius * 0.62) / (options.layers.length - 1) : 0;
  const layers = options.layers.map((layer, index) => {
    const rotation = layer.rotation ?? 0;
    const pattern = euclideanRhythm({ steps: layer.steps, pulses: layer.pulses, rotation });
    const onsets = pattern.flatMap((onset, step) => onset ? [step] : []);
    const gaps = cyclicGapLengths(pattern);
    const radius = outerRadius - index * ringSpacing;
    const circles = pattern.map((onset, step) => {
      const angle = (Math.PI * 2 * step) / layer.steps - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      // An onset is a filled disc, a rest a hollow ring: the two differ in FILL, not only in hue
      // or radius, so the figure still reads once colour is removed.
      const paint = onset
        ? `fill="${theme.accent}" stroke="none"`
        : `fill="none" stroke="${theme.muted}" stroke-width="${coordinate(size * 0.0035)}"`;
      return `<circle data-step="${step}" data-onset="${onset}" cx="${coordinate(x)}" cy="${coordinate(y)}" r="${coordinate(onset ? size * 0.016 : size * 0.009)}" ${paint}/>`;
    }).join("");
    const notation = `E(${layer.pulses},${layer.steps})`;
    return `<g data-layer-index="${index}" data-label="${escapeXml(layer.label)}" data-steps="${layer.steps}" data-pulses="${layer.pulses}" data-rotation="${rotation}" data-onsets="${onsets.join(",")}" data-gaps="${gaps.join(",")}" data-notation="${notation}"><circle class="ring" cx="${coordinate(center)}" cy="${coordinate(center)}" r="${coordinate(radius)}" fill="none" stroke="${theme.muted}" stroke-width="${coordinate(size * 0.003)}"/><text x="${coordinate(center)}" y="${coordinate(center - radius - size * 0.025)}" fill="${theme.ink}" font-family="${theme.fontFamily}" font-size="${coordinate(size * 0.032)}" text-anchor="middle">${escapeXml(layer.label)} ${notation}${rotation === 0 ? "" : ` rot ${rotation}`}</text>${circles}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" data-figure="euclidean-rings">${layers}</svg>`;
}

/** Emits a self-describing Tonnetz lattice using the project's Tonnetz coordinate kernel. */
export function tonnetzLatticeSvg(options: TonnetzLatticeFigureOptions): string {
  const size = svgSize(options.size);
  const theme = resolveTheme(options.theme);
  const originPitchClass = options.originPitchClass ?? 0;
  const nodes = tonnetzGrid(options.radius, originPitchClass);
  const positions = new Map(nodes.map((node) => [nodeKey(node.q, node.r), latticePosition(node, options.radius, size)]));
  const nodeSet = new Set(nodes.map((node) => nodeKey(node.q, node.r)));
  const edges = nodes.flatMap((node) => edgeTypes.flatMap((edge) => {
    const targetQ = node.q + edge.deltaQ;
    const targetR = node.r + edge.deltaR;
    if (!nodeSet.has(nodeKey(targetQ, targetR))) return [];
    const from = positions.get(nodeKey(node.q, node.r));
    const to = positions.get(nodeKey(targetQ, targetR));
    if (from === undefined || to === undefined) return [];
    // Interval class is carried by DASH PATTERN, not hue, so the three edge families stay
    // distinguishable in a monochrome or colour-blind reading of the lattice.
    const dash = edge.dash === "" ? "" : ` stroke-dasharray="${edge.dash}"`;
    return [`<line data-edge="${edge.name}" data-from-q="${node.q}" data-from-r="${node.r}" data-to-q="${targetQ}" data-to-r="${targetR}" x1="${coordinate(from.x)}" y1="${coordinate(from.y)}" x2="${coordinate(to.x)}" y2="${coordinate(to.y)}" stroke="${theme.muted}" stroke-width="${coordinate(size * 0.003)}" fill="none"${dash}/>`];
  })).join("");
  const nodeElements = nodes.map((node) => {
    const position = positions.get(nodeKey(node.q, node.r));
    if (position === undefined) throw new Error("Tonnetz position construction failed.");
    // Keep the emitted pitch class tied to the kernel even if grid construction changes later.
    const pitchClass = tonnetzPitchClass({ q: node.q, r: node.r }, originPitchClass);
    return `<g data-node="true" data-q="${node.q}" data-r="${node.r}" data-pitch-class="${pitchClass}" data-label="${escapeXml(node.label)}"><circle cx="${coordinate(position.x)}" cy="${coordinate(position.y)}" r="${coordinate(size * 0.027)}" fill="${theme.ground}" stroke="${theme.ink}" stroke-width="${coordinate(size * 0.003)}"/><text x="${coordinate(position.x)}" y="${coordinate(position.y)}" fill="${theme.ink}" font-family="${theme.fontFamily}" font-size="${coordinate(size * 0.026)}" text-anchor="middle" dominant-baseline="central">${escapeXml(node.label)}</text></g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" data-figure="tonnetz-lattice" data-radius="${options.radius}" data-origin-pitch-class="${originPitchClass}">${edges}${nodeElements}</svg>`;
}

const edgeTypes = [
  { name: "fifth", deltaQ: 1, deltaR: 0, dash: "" },
  { name: "major-third", deltaQ: 0, deltaR: 1, dash: "6 4" },
  { name: "minor-third", deltaQ: -1, deltaR: 1, dash: "2 3" },
] as const;

function latticePosition(node: TonnetzNode, radius: number, size: number): { readonly x: number; readonly y: number } {
  const scale = size / (radius * 4 + 4);
  return {
    x: size / 2 + scale * Math.sqrt(3) * (node.q + node.r / 2),
    y: size / 2 + scale * 1.5 * node.r,
  };
}

function svgSize(size: number | undefined): number {
  const resolved = size ?? DEFAULT_SIZE;
  if (!Number.isFinite(resolved) || resolved <= 0) throw new RangeError("SVG size must be a positive finite number.");
  return resolved;
}

function coordinate(value: number): string {
  return (Math.round(value * 1000) / 1000).toFixed(3);
}

function nodeKey(q: number, r: number): string {
  return `${q},${r}`;
}

function escapeXml(value: string): string {
  return value.replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[character] ?? character);
}
