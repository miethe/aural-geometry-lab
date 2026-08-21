// Zero-model math checker for the composited figure plates.
//
// Since the AGL-149 follow-up the mathematics on a plated screen is not drawn by the image model:
// design/mockups/figure-plates.json reserves a rectangle, scripts/build-figures.mjs generates the
// figure from the operator kernels, and design/mockups/composite-figure.sh drops the byte-identical
// SVG into it. All three variants of a plated screen therefore carry the SAME figure, so any
// per-variant disagreement on the "mathematical correctness" reject axis is by construction a
// reading error, not a fact about the figure. This module decides that axis deterministically
// against the SVG's own `data-*` attributes and the kernel, so it never depends on what a model
// (or a reviewer) saw in the raster.
//
// For every plate it asserts:
//   a. the referenced figure exists and is non-empty;
//   b. its committed bytes are identical to the current generator output (a stale committed SVG
//      must fail — nothing else in the repo links the committed file to the generator);
//   c. per <g data-layer-index>: data-onsets == indices of euclideanRhythm({steps,pulses,rotation}),
//      data-gaps == cyclicGapLengths(...), the gaps sum to steps (or 0 when pulses===0), and
//      data-notation == E(pulses,steps);
//   d. geometry, not just data: every <circle data-step=k data-onset=...> sits at the angle step k
//      implies on its ring (recomputed from the ring's own centre and radius), and the set of
//      circles with data-onset="true" recovers exactly data-onsets.
//
// Usage:
//   node scripts/check-figures.mjs [--screen S04] [--json]
// With --screen it checks one plate; without, every plate. --json prints the machine record used
// by design/mockups/score-one.sh to stamp the axis. Exit code is 0 on pass, non-zero on fail.

import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { cyclicGapLengths, euclideanRhythm } from "../dist/src/operators/euclidean.js";
import { specForFigurePath } from "./figure-specs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockupsDir = path.join(root, "design", "mockups");
const platesPath = path.join(mockupsDir, "figure-plates.json");

// Onset markers are emitted with coordinates rounded to three decimals; a marker on its correct
// angle can therefore differ from the recomputed ideal by at most half a unit in the last place.
// 0.01 is comfortably above that and far below the ~40px spacing between adjacent steps, so a
// marker nudged onto the wrong step (the defect this proves against) can never pass.
const GEOMETRY_TOLERANCE = 0.01;

// The checker reaches the kernel and the renderer through `dist/`, so everything it asserts is a
// statement about the last BUILD, not about `src/`. Run `npm run verify` on its own after editing
// src/operators/euclidean.ts or src/design/figures.ts and it would re-render from stale compiled
// code, compare that to the equally stale committed SVG, and report green -- the exact false pass
// this module exists to prevent, one level up. `npm run check` builds first and is unaffected; a
// bare `npm run verify` is not, so the staleness is made a failure rather than left to convention.
const BUILD_SOURCES = [
  ["src/operators/euclidean.ts", "dist/src/operators/euclidean.js"],
  ["src/design/figures.ts", "dist/src/design/figures.js"],
];

export function checkBuildFreshness() {
  const failures = [];
  for (const [sourceRelative, builtRelative] of BUILD_SOURCES) {
    const sourcePath = path.join(root, sourceRelative);
    const builtPath = path.join(root, builtRelative);
    if (!existsSync(sourcePath)) continue;
    if (!existsSync(builtPath)) {
      failures.push(`${builtRelative} is missing — run \`npm run build\` before checking figures.`);
      continue;
    }
    if (statSync(sourcePath).mtimeMs > statSync(builtPath).mtimeMs) {
      failures.push(`${sourceRelative} is newer than ${builtRelative} — the figure check would validate against a stale build. Run \`npm run build\`.`);
    }
  }
  return failures;
}

async function loadPlates() {
  const parsed = JSON.parse(await readFile(platesPath, "utf8"));
  return parsed?.plates ?? {};
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  return match ? match[1] : undefined;
}

function csv(value) {
  return value === undefined || value === "" ? [] : value.split(",").map(Number);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Check the (c) data and (d) geometry contract of a euclidean-rings figure's SVG content, without
 * reference to any file on disk. Returns { failures, basis }. Exported so a test can corrupt a
 * correct figure in memory and see the gate bite.
 */
export function checkFigureSvg(svgContent, label = "figure") {
  const failures = [];
  const basis = [];

  const svgTag = svgContent.match(/<svg\b[^>]*>/);
  const figureKind = svgTag ? attribute(svgTag[0], "data-figure") : undefined;
  if (figureKind !== "euclidean-rings") {
    failures.push(`${label}: expected data-figure="euclidean-rings", found ${String(figureKind)}.`);
    return { failures, basis };
  }

  const groups = svgContent.match(/<g\b[^>]*>[\s\S]*?<\/g>/g) ?? [];
  if (groups.length === 0) {
    failures.push(`${label}: no <g data-layer-index> layers present.`);
    return { failures, basis };
  }

  for (const group of groups) {
    const openTag = group.match(/^<g\b[^>]*>/)[0];
    const index = attribute(openTag, "data-layer-index");
    const layerLabel = `${label} layer ${index}`;
    const steps = Number(attribute(openTag, "data-steps"));
    const pulses = Number(attribute(openTag, "data-pulses"));
    const rotation = Number(attribute(openTag, "data-rotation"));
    if (!Number.isInteger(steps) || !Number.isInteger(pulses) || !Number.isInteger(rotation)) {
      failures.push(`${layerLabel}: data-steps/data-pulses/data-rotation are not all integers.`);
      continue;
    }

    const pattern = euclideanRhythm({ steps, pulses, rotation });
    const expectedOnsets = pattern.flatMap((onset, step) => (onset ? [step] : []));
    const expectedGaps = [...cyclicGapLengths(pattern)];
    const expectedNotation = `E(${pulses},${steps})`;

    const declaredOnsets = csv(attribute(openTag, "data-onsets"));
    const declaredGaps = csv(attribute(openTag, "data-gaps"));
    const declaredNotation = attribute(openTag, "data-notation");

    if (!arraysEqual(declaredOnsets, expectedOnsets)) {
      failures.push(`${layerLabel}: data-onsets [${declaredOnsets.join(",")}] != euclideanRhythm({steps:${steps},pulses:${pulses},rotation:${rotation}}) [${expectedOnsets.join(",")}].`);
    } else {
      basis.push(`${layerLabel} (${expectedNotation}): onsets [${expectedOnsets.join(",")}] match euclideanRhythm({steps:${steps},pulses:${pulses},rotation:${rotation}}).`);
    }
    if (!arraysEqual(declaredGaps, expectedGaps)) {
      failures.push(`${layerLabel}: data-gaps [${declaredGaps.join(",")}] != cyclicGapLengths [${expectedGaps.join(",")}].`);
    }
    const gapSum = declaredGaps.reduce((sum, gap) => sum + gap, 0);
    const expectedSum = pulses === 0 ? 0 : steps;
    if (gapSum !== expectedSum) {
      failures.push(`${layerLabel}: data-gaps sum to ${gapSum}, expected ${expectedSum}.`);
    }
    if (declaredNotation !== expectedNotation) {
      failures.push(`${layerLabel}: data-notation "${String(declaredNotation)}" != "${expectedNotation}".`);
    }

    // (d) Geometry: recompute each marker's position from the ring's own centre and radius.
    const ringTag = group.match(/<circle\b[^>]*class="ring"[^>]*\/>/);
    if (!ringTag) {
      failures.push(`${layerLabel}: no <circle class="ring"> to recover the ring geometry from.`);
      continue;
    }
    const cx = Number(attribute(ringTag[0], "cx"));
    const cy = Number(attribute(ringTag[0], "cy"));
    const r = Number(attribute(ringTag[0], "r"));
    if (!Number.isFinite(cx) || !Number.isFinite(cy) || !(r > 0)) {
      failures.push(`${layerLabel}: ring centre/radius is not finite/positive.`);
      continue;
    }

    const stepCircles = [...group.matchAll(/<circle\b[^>]*data-step="\d+"[^>]*\/>/g)].map((match) => match[0]);
    if (stepCircles.length !== steps) {
      failures.push(`${layerLabel}: ${stepCircles.length} step markers drawn, expected ${steps}.`);
    }
    // The drawn steps must be a BIJECTION over 0..steps-1. Counting markers and recovering the
    // onset set is not enough on its own: duplicating step 0 over step 1's slot (same coordinates,
    // same data-onset flags) keeps the count right, keeps the filled set right, and puts every
    // marker on a legitimate step angle -- so without this check the figure passes while a step is
    // missing and another is drawn twice.
    const drawnSteps = stepCircles.map((circle) => Number(attribute(circle, "data-step")));
    const expectedSteps = Array.from({ length: steps }, (_, step) => step);
    if (!arraysEqual([...drawnSteps].sort((a, b) => a - b), expectedSteps)) {
      failures.push(`${layerLabel}: drawn data-step values [${[...drawnSteps].sort((a, b) => a - b).join(",")}] are not exactly 0..${steps - 1} (duplicated or missing step).`);
    }

    let maxDeviation = 0;
    const geometricOnsets = [];
    for (const circle of stepCircles) {
      const step = Number(attribute(circle, "data-step"));
      const onset = attribute(circle, "data-onset") === "true";
      if (onset) geometricOnsets.push(step);
      const angle = (Math.PI * 2 * step) / steps - Math.PI / 2;
      const expectedX = cx + r * Math.cos(angle);
      const expectedY = cy + r * Math.sin(angle);
      const actualX = Number(attribute(circle, "cx"));
      const actualY = Number(attribute(circle, "cy"));
      const deviation = Math.max(Math.abs(actualX - expectedX), Math.abs(actualY - expectedY));
      maxDeviation = Math.max(maxDeviation, deviation);
      if (deviation > GEOMETRY_TOLERANCE) {
        failures.push(`${layerLabel}: marker for step ${step} at (${actualX},${actualY}) is ${deviation.toFixed(3)} from its angle on the r=${r} ring (expected (${expectedX.toFixed(3)},${expectedY.toFixed(3)})).`);
      }
    }
    geometricOnsets.sort((a, b) => a - b);
    if (!arraysEqual(geometricOnsets, expectedOnsets)) {
      failures.push(`${layerLabel}: filled markers [${geometricOnsets.join(",")}] do not recover data-onsets [${expectedOnsets.join(",")}].`);
    } else if (stepCircles.length === steps) {
      basis.push(`${layerLabel}: ${steps} markers within ${maxDeviation.toFixed(4)} of their step angle on the r=${r} ring; filled set recovers the onsets exactly.`);
    }
  }

  return { failures, basis };
}

/**
 * Check one screen. Returns a record with `plated`; when plated, also `figure`, `basis`,
 * `failures`, and `mathematicalCorrectness` ("pass" | "fail"). A screen with no plate keeps the
 * by-eye path and is never stamped.
 */
export async function checkScreen(screenId) {
  const plates = await loadPlates();
  const plate = plates[screenId];
  if (plate === undefined) {
    return { screen: screenId, plated: false };
  }

  const failures = [...checkBuildFreshness()];
  const basis = [];
  const figureRelative = plate.figure;
  const figurePath = path.join(mockupsDir, figureRelative);

  // (a) present and non-empty.
  let committed;
  if (!existsSync(figurePath)) {
    failures.push(`${screenId}: figure ${figureRelative} does not exist (run \`npm run figures\`).`);
  } else {
    committed = await readFile(figurePath, "utf8");
    if (committed.length === 0) failures.push(`${screenId}: figure ${figureRelative} is empty.`);
    else basis.push(`${screenId}: ${figureRelative} present (${committed.length} bytes).`);
  }

  // (b) committed bytes identical to the current generator output.
  const spec = specForFigurePath(figureRelative);
  if (spec === undefined) {
    failures.push(`${screenId}: no figure spec in scripts/figure-specs.mjs matches ${figureRelative}.`);
  } else if (committed !== undefined) {
    const generated = spec.render();
    if (committed !== generated) {
      failures.push(`${screenId}: committed ${figureRelative} is not byte-identical to \`npm run figures\` output (stale committed SVG).`);
    } else {
      basis.push(`${screenId}: committed bytes are identical to the generator output.`);
    }
  }

  // (c) + (d): kernel-faithful data and geometry. Check the committed content so what SHIPS is
  // what is asserted; when it differs from the generator (b) already failed above.
  if (committed !== undefined && committed.length > 0) {
    const analysis = checkFigureSvg(committed, screenId);
    failures.push(...analysis.failures);
    basis.push(...analysis.basis);
  }

  return {
    screen: screenId,
    plated: true,
    figure: figureRelative,
    mathematicalCorrectness: failures.length === 0 ? "pass" : "fail",
    basis,
    failures,
  };
}

/** Check every plated screen. Returns an array of the plated screens' records. */
export async function checkFigures() {
  const plates = await loadPlates();
  const results = [];
  for (const screenId of Object.keys(plates)) {
    results.push(await checkScreen(screenId));
  }
  return results;
}

async function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const screenIndex = argv.indexOf("--screen");
  const screen = screenIndex >= 0 ? argv[screenIndex + 1] : undefined;

  if (screen !== undefined) {
    const result = await checkScreen(screen);
    if (json) console.log(JSON.stringify(result));
    else if (!result.plated) console.log(`${screen}: no plate (by-eye path; not stamped).`);
    else {
      console.log(`${screen}: mathematical correctness ${result.mathematicalCorrectness}`);
      for (const fact of result.basis) console.log(`  + ${fact}`);
      for (const failure of result.failures) console.error(`  ! ${failure}`);
    }
    process.exit(result.plated && result.mathematicalCorrectness === "fail" ? 1 : 0);
  }

  const results = await checkFigures();
  let failed = false;
  for (const result of results) {
    if (result.mathematicalCorrectness === "fail") failed = true;
  }
  if (json) {
    console.log(JSON.stringify({ screens: results }));
  } else {
    for (const result of results) {
      console.log(`${result.screen}: mathematical correctness ${result.mathematicalCorrectness}`);
      for (const failure of result.failures ?? []) console.error(`  ! ${failure}`);
    }
    if (!failed) console.log(`Checked ${results.length} plated figure(s): all mathematically faithful to the kernel.`);
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === pathToFileUrlHref(process.argv[1])) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exit(2);
  });
}

function pathToFileUrlHref(argvPath) {
  if (typeof argvPath !== "string" || argvPath.length === 0) return undefined;
  return new URL(`file://${path.resolve(argvPath)}`).href;
}
