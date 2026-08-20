import test from "node:test";
import assert from "node:assert/strict";
import { cyclicGapLengths, euclideanRhythm } from "../dist/src/operators/euclidean.js";
import { tonnetzGrid } from "../dist/src/operators/tonnetz.js";
import { euclideanRingsSvg, tonnetzLatticeSvg } from "../dist/src/design/figures.js";

const euclideanCases = [
  [12, 5, 0], [12, 7, 2], [7, 5, -1], [8, 3, 3], [4, 4, 0], [4, 1, 1], [4, 0, 0], [4, 4, 2],
];

test("Euclidean ring SVG carries kernel-derived onset, gap, and notation data", () => {
  for (const [steps, pulses, rotation] of euclideanCases) {
    const svg = euclideanRingsSvg({ layers: [{ label: "Clave", steps, pulses, rotation }] });
    const layer = firstGroup(svg);
    const pattern = euclideanRhythm({ steps, pulses, rotation });
    const expectedOnsets = pattern.flatMap((onset, index) => onset ? [index] : []);
    assert.deepEqual(csv(attribute(layer, "data-onsets")), expectedOnsets, `E(${pulses},${steps}) onset data must match euclideanRhythm`);
    assert.deepEqual(csv(attribute(layer, "data-gaps")), cyclicGapLengths(pattern), `E(${pulses},${steps}) gap data must match cyclicGapLengths`);
    assert.equal(csv(attribute(layer, "data-gaps")).reduce((sum, gap) => sum + gap, 0), pulses === 0 ? 0 : steps);
    assert.equal(attribute(layer, "data-notation"), `E(${pulses},${steps})`);
    const circles = [...layer.matchAll(/<circle\b[^>]*data-step="(\d+)"[^>]*data-onset="(true|false)"[^>]*\/>/g)];
    assert.equal(circles.length, steps, `E(${pulses},${steps}) must render one data circle per step`);
    assert.equal(circles.filter((match) => match[2] === "true").length, pulses);
  }
});

test("Euclidean ring SVG prevents inverted steps and pulses", () => {
  const correct = euclideanRingsSvg({ layers: [{ label: "Pulse field", steps: 12, pulses: 7 }] });
  const swapped = euclideanRingsSvg({ layers: [{ label: "Pulse field", steps: 7, pulses: 5 }] });
  assert.notEqual(correct, swapped, "swapping steps and pulses must produce a different SVG");
  assert.equal(attribute(firstGroup(correct), "data-notation"), "E(7,12)");
  assert.equal(attribute(firstGroup(swapped), "data-notation"), "E(5,7)");
});

test("Tonnetz lattice SVG carries exactly the kernel nodes and valid interval edges", () => {
  const radius = 2;
  const origin = 1;
  const svg = tonnetzLatticeSvg({ radius, originPitchClass: origin });
  assert.equal(attribute(firstTag(svg, "svg"), "data-figure"), "tonnetz-lattice");
  assert.equal(Number(attribute(firstTag(svg, "svg"), "data-radius")), radius);
  assert.equal(Number(attribute(firstTag(svg, "svg"), "data-origin-pitch-class")), origin);
  const actualNodes = [...svg.matchAll(/<g\b(?=[^>]*data-node="true")([^>]*)>/g)].map((match) => {
    const tag = `<g${match[1]}>`;
    return [Number(attribute(tag, "data-q")), Number(attribute(tag, "data-r")), Number(attribute(tag, "data-pitch-class")), attribute(tag, "data-label")];
  });
  const expectedNodes = tonnetzGrid(radius, origin).map(({ q, r, pitchClass, label }) => [q, r, pitchClass, label]);
  assert.deepEqual(actualNodes, expectedNodes);
  assert.equal(new Set(actualNodes.map(([q, r]) => `${q},${r}`)).size, actualNodes.length);
  const nodePitches = new Map(actualNodes.map(([q, r, pitchClass]) => [`${q},${r}`, pitchClass]));
  for (const match of svg.matchAll(/<line\b([^>]*)\/>/g)) {
    const tag = `<line${match[1]}/>`;
    const edge = attribute(tag, "data-edge");
    const from = `${attribute(tag, "data-from-q")},${attribute(tag, "data-from-r")}`;
    const to = `${attribute(tag, "data-to-q")},${attribute(tag, "data-to-r")}`;
    assert.ok(nodePitches.has(from) && nodePitches.has(to), `${edge} endpoints must be grid nodes`);
    const difference = modulo((nodePitches.get(to) ?? 0) - (nodePitches.get(from) ?? 0), 12);
    const expected = edge === "fifth" ? 7 : edge === "major-third" ? 4 : 9;
    assert.equal(difference, expected, `${edge} edge must carry its Tonnetz interval`);
  }
});

test("figure SVG generators are byte deterministic", () => {
  const rings = { layers: [{ label: "A & B", steps: 12, pulses: 5, rotation: 2 }] };
  const lattice = { radius: 3, originPitchClass: 10 };
  assert.equal(euclideanRingsSvg(rings), euclideanRingsSvg(rings));
  assert.equal(tonnetzLatticeSvg(lattice), tonnetzLatticeSvg(lattice));
});

function firstTag(svg, name) {
  const match = svg.match(new RegExp(`<${name}\\b[^>]*>`));
  assert.ok(match, `expected a ${name} tag`);
  return match[0];
}

function firstGroup(svg) {
  const match = svg.match(/<g\b[^>]*>.*?<\/g>/);
  assert.ok(match, "expected a group element");
  return match[0];
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`));
  assert.ok(match, `expected ${name} on ${tag}`);
  return match[1];
}

function csv(value) {
  return value === "" ? [] : value.split(",").map(Number);
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}
