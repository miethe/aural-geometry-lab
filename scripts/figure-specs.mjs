// The single source of truth for which kernel-generated figures exist and how each is rendered.
//
// Both scripts/build-figures.mjs (which writes design/mockups/figures/*.svg) and
// scripts/check-figures.mjs (which asserts a committed SVG is byte-identical to that output and
// mathematically faithful to the operator kernel) consume this list. Keeping the spec in one file
// is the same "so the two halves cannot drift" idiom design/mockups/figure-plates.json states for
// its own reserved/composited rectangle: a figure and the gate that verifies it must not be able
// to disagree about what was supposed to be drawn.
//
// Each entry carries `filename` (the basename under design/mockups/figures/, matched against a
// plate's `figure` path by basename) and `render` (a zero-argument function returning the SVG
// string). Every onset, gap, notation string and marker position in that string comes from
// src/operators/*.ts by way of src/design/figures.ts.

import { euclideanRingsSvg } from "../dist/src/design/figures.js";

export const figureSpecs = [
  {
    filename: "S04-euclidean-rings.svg",
    render: () => euclideanRingsSvg({
      layers: [
        { label: "Clave", steps: 12, pulses: 5 },
        { label: "Pulse field", steps: 12, pulses: 7, rotation: 1 },
      ],
    }),
  },
  {
    filename: "S07-euclidean-pulse-field.svg",
    render: () => euclideanRingsSvg({
      layers: [{ label: "7/12 Euclidean pulse field", steps: 12, pulses: 7 }],
    }),
  },
];

/** The spec whose `filename` matches `basename(figurePath)`, or undefined when none does. */
export function specForFigurePath(figurePath) {
  const base = figurePath.replace(/^.*[\\/]/, "");
  return figureSpecs.find((spec) => spec.filename === base);
}
