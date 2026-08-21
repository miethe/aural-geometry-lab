import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkBuildFreshness, checkFigureSvg, checkFigures, checkScreen } from "../scripts/check-figures.mjs";
import { figureSpecs, specForFigurePath } from "../scripts/figure-specs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const platesPath = path.join(root, "design", "mockups", "figure-plates.json");
const plates = JSON.parse(readFileSync(platesPath, "utf8")).plates;

test("every plate's committed SVG is byte-identical to its generator output", () => {
  for (const [screen, plate] of Object.entries(plates)) {
    const spec = specForFigurePath(plate.figure);
    assert.ok(spec, `${screen}: figure ${plate.figure} must have a spec in scripts/figure-specs.mjs`);
    const committed = readFileSync(path.join(root, "design", "mockups", plate.figure), "utf8");
    assert.equal(committed, spec.render(), `${screen}: committed ${plate.figure} must equal \`npm run figures\` output`);
  }
});

test("checkFigures() passes for every current committed plate figure", async () => {
  const results = await checkFigures();
  assert.ok(results.length > 0, "there must be at least one plated figure to check");
  for (const result of results) {
    assert.equal(result.plated, true);
    assert.deepEqual(result.failures, [], `${result.screen} must report no failures: ${JSON.stringify(result.failures)}`);
    assert.equal(result.mathematicalCorrectness, "pass");
  }
});

test("checkScreen reports a non-plated screen distinctly and never stamps it", async () => {
  const result = await checkScreen("S99-not-a-plate");
  assert.equal(result.plated, false);
  assert.equal(result.mathematicalCorrectness, undefined);
});

test("the gate bites: a moved onset marker fails the geometry check", () => {
  const svg = figureSpecs[0].render();
  const clean = checkFigureSvg(svg, "S04");
  assert.deepEqual(clean.failures, [], "the untouched figure must pass before we corrupt it");

  // Move step 0's marker off its ring angle by one radius-tick. Its data-onset flag and data-onsets
  // are untouched, so only the recomputed-angle check (d) can catch it.
  const corrupted = svg.replace(
    /<circle data-step="0" data-onset="true" cx="240\.000" cy="48\.000"/,
    '<circle data-step="0" data-onset="true" cx="240.000" cy="60.000"',
  );
  assert.notEqual(corrupted, svg, "the marker substitution must actually change the SVG");
  const moved = checkFigureSvg(corrupted, "S04");
  assert.ok(
    moved.failures.some((failure) => /step 0/.test(failure) && /ring/.test(failure)),
    `moving a marker off its angle must fail the geometry check: ${JSON.stringify(moved.failures)}`,
  );
});

test("the gate bites: a corrupted data-onsets entry fails the data check", () => {
  const svg = figureSpecs[0].render();
  const corrupted = svg.replace('data-onsets="0,2,5,7,10"', 'data-onsets="0,3,5,7,10"');
  assert.notEqual(corrupted, svg, "the data-onsets substitution must actually change the SVG");
  const result = checkFigureSvg(corrupted, "S04");
  assert.ok(
    result.failures.some((failure) => /data-onsets/.test(failure) && /euclideanRhythm/.test(failure)),
    `a wrong data-onsets entry must fail against the kernel: ${JSON.stringify(result.failures)}`,
  );
});

test("the gate bites: a duplicated data-step fails even though count and onsets still look right", () => {
  // The mutation that motivated the bijection check: redraw step 1's rest at step 0's slot. The
  // marker count is unchanged, every marker still sits on a legitimate step angle, and the filled
  // set still recovers data-onsets — so count/angle/onset checks alone all pass while the figure is
  // missing a step and drawing another twice.
  const svg = figureSpecs[0].render();
  assert.deepEqual(checkFigureSvg(svg, "S04").failures, [], "the untouched figure must pass first");

  const stepOne = svg.match(/<circle data-step="1" data-onset="(?:true|false)" cx="[\d.]+" cy="[\d.]+"/);
  assert.ok(stepOne, "expected a step-1 marker to corrupt");
  const stepZero = svg.match(/<circle data-step="0" data-onset="(?:true|false)" cx="([\d.]+)" cy="([\d.]+)"/);
  assert.ok(stepZero, "expected a step-0 marker to copy coordinates from");
  const duplicated = svg.replace(
    stepOne[0],
    `<circle data-step="0" data-onset="false" cx="${stepZero[1]}" cy="${stepZero[2]}"`,
  );
  assert.notEqual(duplicated, svg, "the duplication must actually change the SVG");

  const result = checkFigureSvg(duplicated, "S04");
  assert.ok(
    result.failures.some((failure) => /not exactly 0\.\./.test(failure)),
    `a duplicated/missing data-step must fail the bijection check: ${JSON.stringify(result.failures)}`,
  );
});

test("a stale dist/ is reported rather than silently validated against", () => {
  // checkBuildFreshness compares source mtimes to their compiled outputs. With a current build it
  // must be silent; the failure path is what stops a bare `npm run verify` from reporting green
  // against compiled code that no longer matches src/.
  assert.deepEqual(checkBuildFreshness(), [], "the committed build must be current for the suite to be meaningful");
});

test("the score-one stamping step is deterministic and idempotent", () => {
  const scratch = mkdtempSync(path.join(tmpdir(), "agl-stamp-"));
  const critiquePath = path.join(scratch, "S04.json");
  const checkerPath = path.join(scratch, "check.json");

  // A minimal critique that rejected on the (vacated) math axis, plus the checker's real verdict.
  writeFileSync(critiquePath, JSON.stringify({
    screen: "S04",
    variants: {
      "A-instrument": { rejectAxes: { "mathematical correctness": "fail" }, verdict: "reject" },
    },
  }));
  const checkerJson = execFileSync("node", [path.join(root, "scripts", "check-figures.mjs"), "--screen", "S04", "--json"], { encoding: "utf8" });
  writeFileSync(checkerPath, checkerJson);

  const stamp = () => execFileSync("python3", [path.join(root, "scripts", "stamp-math-verdict.py"), critiquePath, checkerPath]);
  stamp();
  const first = readFileSync(critiquePath);
  stamp();
  const second = readFileSync(critiquePath);
  assert.ok(first.equals(second), "stamping twice must produce byte-identical output");

  const stamped = JSON.parse(first.toString());
  assert.equal(stamped.variants["A-instrument"].rejectAxes["mathematical correctness"], "pass");
  assert.equal(stamped.variants["A-instrument"].verdict, "reject", "the model's variant verdict must be left alone");
  assert.equal(stamped.mathVerdict.source, "scripts/check-figures.mjs");
  assert.equal(stamped.mathVerdict.verdict, "pass");
});

test("score-one.sh still skips an already-scored NON-plated screen with exit 0", () => {
  // Regression: stamp_math was `[ -n "$PLATED" ] && python3 ...`, which returns 1 for the 14
  // screens with no plate. Both call sites read that as a stamping failure, so every non-plated
  // screen exited 2 instead of reporting SKIP/OK — the by-eye path's prompt was untouched but its
  // exit status was not. S01 has a committed critique and no plate, so it must take the skip path.
  const plated = Object.keys(plates);
  assert.ok(!plated.includes("S01"), "S01 must have no plate for this regression to be meaningful");
  assert.ok(existsSync(path.join(root, "design", "mockups", "critique", "S01.json")), "S01 must already be scored");

  const output = execFileSync("bash", [path.join(root, "design", "mockups", "score-one.sh"), "S01", "unused-slug"], { encoding: "utf8" });
  assert.match(output, /^SKIP S01$/m, `a scored non-plated screen must report SKIP: ${output}`);
});

test("verify.mjs and score-one.sh are wired to the checker", () => {
  assert.match(readFileSync(path.join(root, "scripts", "verify.mjs"), "utf8"), /checkFigures/);
  const scoreOne = readFileSync(path.join(root, "design", "mockups", "score-one.sh"), "utf8");
  assert.match(scoreOne, /check-figures\.mjs/);
  assert.match(scoreOne, /stamp-math-verdict\.py/);
  assert.ok(existsSync(path.join(root, "scripts", "stamp-math-verdict.py")));
});
