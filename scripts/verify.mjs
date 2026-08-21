import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkFigures } from "./check-figures.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
let designEncodingValueCount = 0;
function fail(message) { failures.push(message); }
function requiredString(value, label) {
  if (typeof value !== "string" || value.length === 0) { fail(`${label} must be a non-empty string.`); return undefined; }
  return value;
}
function fileExists(relativePath, label = relativePath) {
  if (!existsSync(path.join(root, relativePath))) { fail(`Missing ${label}: ${relativePath}`); return false; }
  return true;
}

async function readJson(relativePath) {
  const absolute = path.join(root, relativePath);
  try { return JSON.parse(await readFile(absolute, "utf8")); }
  catch (error) {
    fail(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
}

// The FR-02 hostile corpus is deliberately unparseable (duplicate members, trailing
// content, invalid UTF-8). It is covered by verifyHostileCorpus below instead of by the
// "every .json must parse" walk.
const UNPARSEABLE_BY_DESIGN = new Set([path.join("conformance", "fr02", "raw")]);

async function verifyAllJson(directory) {
  const absolute = path.join(root, directory);
  if (!existsSync(absolute)) { fail(`Missing JSON directory: ${directory}`); return; }
  const entries = await readdir(absolute, { withFileTypes: true });
  for (const entry of entries) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) { if (!UNPARSEABLE_BY_DESIGN.has(relative)) await verifyAllJson(relative); }
    else if (entry.name.endsWith(".json")) await readJson(relative);
  }
}

async function sha256(relativePath) {
  const bytes = await readFile(path.join(root, relativePath));
  return createHash("sha256").update(bytes).digest("hex");
}

const distIndex = path.join(root, "dist", "src", "core", "index.js");
if (!existsSync(distIndex)) fail("dist is missing; run the build before verification.");

for (const directory of ["program", "examples", "design", "conformance", "schemas", "research/completed/wave-1"]) {
  await verifyAllJson(directory);
}

const backlog = await readJson("program/backlog.json");
const research = await readJson("program/research-register.json");
const labs = await readJson("program/lab-manifest.json");
const decisions = await readJson("program/wave1-decision-register.json");
const evidence = await readJson("research/completed/wave-1/evidence-manifest.json");
const designTokens = await readJson("design/tokens.json");
const findings = await readJson("program/fr01-findings-register.json");
const contractManifest = await readJson("program/fr01-contract-manifest.json");
const architectureManifest = await readJson("program/architecture-manifest.json");
const frontierRuns = await readJson("program/frontier-run-register.json");
const toolchain = await readJson("program/toolchain-lock.json");
const packageMetadata = await readJson("package.json");
const claimRegister = await readJson("program/claim-register.json");
const releaseManifest = await readJson("program/fr01-release-manifest.json");

const backlogIds = new Set();
const backlogById = new Map();
const statusVocabulary = new Set(Array.isArray(backlog?.statusVocabulary) ? backlog.statusVocabulary : []);
for (const item of Array.isArray(backlog?.items) ? backlog.items : []) {
  if (typeof item?.id !== "string") { fail("Backlog contains an item without a string id."); continue; }
  if (backlogIds.has(item.id)) fail(`Duplicate backlog id: ${item.id}`);
  backlogIds.add(item.id);
  backlogById.set(item.id, item);
  if (!statusVocabulary.has(item.status)) fail(`${item.id} uses unknown status ${String(item.status)}.`);
}

const researchIds = new Set();
for (const run of Array.isArray(research?.runs) ? research.runs : []) {
  if (typeof run?.id !== "string") { fail("Research register contains a run without a string id."); continue; }
  if (researchIds.has(run.id)) fail(`Duplicate research id: ${run.id}`);
  researchIds.add(run.id);
  if (typeof run.charter !== "string" || !fileExists(run.charter, `${run.id} charter`)) continue;
  if (run.status === "completed-integrated") {
    for (const key of ["report", "integrationPacket", "integratedBy"]) {
      if (typeof run[key] !== "string" || !fileExists(run[key], `${run.id} ${key}`)) {
        fail(`${run.id} completed-integrated but ${key} is missing: ${String(run[key])}`);
      }
    }
  }
}

for (const item of Array.isArray(backlog?.items) ? backlog.items : []) {
  for (const dependency of Array.isArray(item.dependsOn) ? item.dependsOn : []) {
    const known = String(dependency).startsWith("DR-") ? researchIds.has(dependency) : backlogIds.has(dependency);
    if (!known) fail(`${item.id} depends on unknown item ${dependency}.`);
  }
}

const labIds = new Set();
for (const lab of Array.isArray(labs?.labs) ? labs.labs : []) {
  if (labIds.has(lab.id)) fail(`Duplicate lab id: ${lab.id}`);
  labIds.add(lab.id);
  for (const researchId of Array.isArray(lab.research) ? lab.research : []) {
    if (!researchIds.has(researchId)) fail(`${lab.id} references unknown research run ${researchId}.`);
  }
}

const decisionIds = new Set();
for (const decision of Array.isArray(decisions?.decisions) ? decisions.decisions : []) {
  if (decisionIds.has(decision.id)) fail(`Duplicate Wave-1 decision id: ${decision.id}`);
  decisionIds.add(decision.id);
  if (!Array.isArray(decision.sources) || decision.sources.length === 0) fail(`${decision.id} has no source runs.`);
  for (const source of decision.sources ?? []) if (!researchIds.has(source)) fail(`${decision.id} references unknown research source ${source}.`);
}

for (const item of Array.isArray(evidence?.items) ? evidence.items : []) {
  if (!fileExists(item.path, "evidence file")) continue;
  if (await sha256(item.path) !== item.sha256) fail(`Evidence hash mismatch for ${item.path}.`);
}

// FR-01 finding completion and ownership gates.
const findingIds = new Set();
const findingSeverityVocabulary = new Set(Array.isArray(findings?.severityVocabulary) ? findings.severityVocabulary : []);
const findingStatusVocabulary = new Set(Array.isArray(findings?.statusVocabulary) ? findings.statusVocabulary : []);
let criticalHighCount = 0;
let openOwnedCount = 0;
for (const finding of Array.isArray(findings?.findings) ? findings.findings : []) {
  if (typeof finding?.id !== "string") { fail("FR-01 finding without a string id."); continue; }
  if (findingIds.has(finding.id)) fail(`Duplicate FR-01 finding id: ${finding.id}`);
  findingIds.add(finding.id);
  if (!findingSeverityVocabulary.has(finding.severity)) fail(`${finding.id} uses unknown severity ${String(finding.severity)}.`);
  if (!findingStatusVocabulary.has(finding.status)) fail(`${finding.id} uses unknown status ${String(finding.status)}.`);
  if (finding.status.startsWith("open") || finding.status.startsWith("deferred")) openOwnedCount += 1;
  for (const field of ["title", "failureScenario", "affectedFilesOrContracts", "repair", "adr", "contractVersionChange"]) {
    requiredString(finding[field], `${finding.id}.${field}`);
  }
  if (!Array.isArray(finding.regressionTests) || finding.regressionTests.length === 0) fail(`${finding.id} has no regression tests.`);
  if (typeof finding.adr === "string") fileExists(finding.adr, `${finding.id} ADR`);
  if (["Critical", "High"].includes(finding.severity)) {
    criticalHighCount += 1;
    const owner = finding.backlogOwner;
    if (typeof owner?.backlogId !== "string" || typeof owner?.workstream !== "string") {
      fail(`${finding.id} is ${finding.severity} without backlogId and workstream ownership.`);
      continue;
    }
    const backlogItem = backlogById.get(owner.backlogId);
    if (backlogItem === undefined) fail(`${finding.id} references unknown backlog owner ${owner.backlogId}.`);
    else if (Array.isArray(backlogItem.owner) && !backlogItem.owner.includes(owner.workstream)) fail(`${finding.id} workstream ${owner.workstream} is not an owner of ${owner.backlogId}.`);
  }
}
const computedSeverity = {};
for (const severity of findingSeverityVocabulary) computedSeverity[severity] = 0;
for (const finding of Array.isArray(findings?.findings) ? findings.findings : []) computedSeverity[finding.severity] = (computedSeverity[finding.severity] ?? 0) + 1;
if (findings?.summary?.total !== findingIds.size) fail(`FR-01 summary total ${String(findings?.summary?.total)} does not equal ${findingIds.size}.`);
for (const [severity, count] of Object.entries(computedSeverity)) {
  if (findings?.summary?.bySeverity?.[severity] !== count) fail(`FR-01 ${severity} summary mismatch.`);
}
if (findings?.summary?.openOwned !== openOwnedCount) fail(`FR-01 open-owned summary mismatch: expected ${openOwnedCount}.`);
if (findings?.summary?.fixedOrContractHardened !== findingIds.size - openOwnedCount) fail(`FR-01 fixed/contract-hardened summary mismatch: expected ${findingIds.size - openOwnedCount}.`);

// FR-01 contract manifest: every schema/fixture is present and hash-pinned.
const publicContractIds = new Set();
for (const document of Array.isArray(contractManifest?.authorityDocuments) ? contractManifest.authorityDocuments : []) fileExists(document, "FR-01 authority document");
for (const contract of Array.isArray(contractManifest?.publicContracts) ? contractManifest.publicContracts : []) {
  if (publicContractIds.has(contract.id)) fail(`Duplicate FR-01 public contract id: ${contract.id}`);
  publicContractIds.add(contract.id);
  if (!fileExists(contract.schema, `${contract.id} schema`)) continue;
  if (await sha256(contract.schema) !== contract.schemaSha256) fail(`Schema hash mismatch for ${contract.schema}.`);
  for (const fixture of Array.isArray(contract.fixtures) ? contract.fixtures : []) {
    if (!fileExists(fixture.path, `${contract.id} fixture`)) continue;
    if (await sha256(fixture.path) !== fixture.sha256) fail(`Fixture hash mismatch for ${fixture.path}.`);
  }
}
for (const fixture of Array.isArray(contractManifest?.sharedConformanceFixtures) ? contractManifest.sharedConformanceFixtures : []) {
  if (!fileExists(fixture.path, "shared conformance fixture")) continue;
  if (await sha256(fixture.path) !== fixture.sha256) fail(`Shared conformance fixture hash mismatch for ${fixture.path}.`);
  const nativeCopy = path.join("native", "AuralGeometryCore", "Tests", "AuralGeometryCoreTests", "Fixtures", path.basename(fixture.path));
  if (!fileExists(nativeCopy, "native conformance fixture copy")) continue;
  if (await sha256(fixture.path) !== await sha256(nativeCopy)) fail(`Native fixture diverges from canonical fixture: ${fixture.path}`);
}
// Project-v3 fixture is also a native wire-contract fixture under a filesystem-safe name.
const nativeProjectFixture = "native/AuralGeometryCore/Tests/AuralGeometryCoreTests/Fixtures/fr01-minimal-v3-project.json";
if (fileExists(nativeProjectFixture, "native project-v3 fixture")) {
  if (await sha256("examples/fr01-minimal.v3.project.json") !== await sha256(nativeProjectFixture)) fail("Native project-v3 fixture diverges from the canonical example.");
}

// Architecture manifest must advertise the same public contracts and baseline.
if (architectureManifest?.baseline !== contractManifest?.release) fail("Architecture baseline and FR-01 contract release diverge.");
if (architectureManifest?.schemaVersion !== 2 || architectureManifest?.adrRange?.last !== "0024") fail("Architecture manifest is not the FR-01 v0.4 authority shape.");
if (packageMetadata?.version !== contractManifest?.release || toolchain?.release !== contractManifest?.release) fail("Package, toolchain, architecture, and contract releases diverge.");
const architectureContracts = new Map((architectureManifest?.publicContracts ?? []).map((item) => [item.id, item]));
for (const contract of contractManifest?.publicContracts ?? []) {
  const architectureContract = architectureContracts.get(contract.id);
  if (architectureContract === undefined) fail(`Architecture manifest omits public contract ${contract.id}.`);
  else if (architectureContract.version !== contract.version || architectureContract.schema !== contract.schema) fail(`Architecture manifest diverges for contract ${contract.id}.`);
}
const fr01Run = (frontierRuns?.runs ?? []).find((run) => run.id === "FR-01");
if (fr01Run?.status !== "completed-repository-hardening") fail("Frontier register does not mark FR-01 completed-repository-hardening.");
if (fr01Run?.hardenedRelease !== contractManifest?.release) fail("FR-01 frontier release diverges from contract manifest.");
// A frontier run that names an artifact must name one that exists. A completed run whose
// result/findings path has drifted reports green while pointing at nothing.
for (const run of frontierRuns?.runs ?? []) {
  for (const field of ["spec", "result", "findings", "artifactManifest", "corpus", "tests", "baselineResult", "validation"]) {
    const declared = run?.[field];
    if (typeof declared === "string" && declared.length > 0) fileExists(declared, `frontier run ${run.id} ${field}`);
  }
  if (typeof run?.status === "string" && run.status.startsWith("completed") && typeof run.result !== "string") {
    fail(`Frontier run ${run.id} is ${run.status} without a result artifact.`);
  }
}

if (releaseManifest?.release !== contractManifest?.release || releaseManifest?.milestone !== "M0.9") fail("FR-01 release manifest diverges from the contract baseline.");
for (const authorityPath of Object.values(releaseManifest?.authority ?? {})) {
  if (typeof authorityPath !== "string" || !fileExists(authorityPath, "FR-01 release authority")) fail("FR-01 release manifest contains an invalid authority path.");
}
const releaseCounts = releaseManifest?.counts ?? {};
const expectedReleaseCounts = {
  findings: findingIds.size,
  critical: computedSeverity.Critical ?? 0,
  high: computedSeverity.High ?? 0,
  medium: computedSeverity.Medium ?? 0,
  fixedOrContractHardened: findingIds.size - openOwnedCount,
  openOwned: openOwnedCount,
  criticalHighOwned: criticalHighCount,
  backlogItems: backlogIds.size,
  publicContracts: publicContractIds.size,
};
for (const [key, value] of Object.entries(expectedReleaseCounts)) {
  if (releaseCounts[key] !== value) fail(`FR-01 release manifest count ${key}=${String(releaseCounts[key])} does not equal ${value}.`);
}
if (!["pending-clean-extraction-validation", "clean-extraction-validated"].includes(releaseManifest?.status)) fail("FR-01 release manifest uses an unknown release status.");
if (releaseManifest?.status === "clean-extraction-validated") {
  const releaseValidation = releaseManifest?.validation ?? {};
  if (releaseValidation.deterministicArchiveBuildsCompared < 2 || releaseValidation.deterministicArchiveByteIdentity !== true) fail("FR-01 release manifest lacks deterministic archive evidence.");
  if (releaseValidation.zipIntegrity !== "pass" || releaseValidation.cleanExtractionCheckAll !== "pass" || releaseValidation.cleanExtractionSchemaValidation !== "pass") fail("FR-01 release manifest lacks clean archive validation evidence.");
  if (releaseValidation.staticHttpSmokeEndpoints < 8 || releaseValidation.generatedBuildStateExcluded !== true) fail("FR-01 release manifest lacks static-smoke or generated-state exclusion evidence.");
}

for (const stateFamily of ["materialKind", "sourceStatus", "derivation", "audio", "evidence", "mappingStage", "selection"]) {
  if (!Array.isArray(designTokens?.semanticStates?.[stateFamily])) fail(`Design tokens missing semantic state family ${stateFamily}.`);
}

// Semantic-state encoding contract: every state must be distinguishable without color. Each
// axis and each of its values needs a non-color carrier assignment, and no two values in an
// axis may share the same (glyph, lineStyle, fill, shape) tuple. Removing hue must never remove
// a state, so the block itself must contain no color at all.
const ENCODING_CARRIERS = new Set(["glyph", "lineStyle", "fill", "shape", "weight", "position"]);
const ENCODING_LINE_STYLES = new Set(["solid", "dotted", "dashed", "dash-dot", "double", "none"]);
const ENCODING_FILLS = new Set(["solid", "hatch-45", "hatch-135", "crosshatch", "stipple", "none"]);
const ENCODING_SHAPES = new Set(["rect", "rounded-rect", "pill", "circle", "diamond", "notched-rect", "chevron"]);
const ENCODING_COLOR_WORDS = /\b(red|green|blue|amber|yellow|orange|purple|violet|cyan|magenta|teal|grey|gray|pink|brown)\b/i;
const ENCODING_HEX = /#[0-9a-fA-F]{3,8}\b/;
const semanticStateEncodings = designTokens?.semanticStateEncodings;
if (typeof semanticStateEncodings !== "object" || semanticStateEncodings === null || Array.isArray(semanticStateEncodings)) {
  fail("Design tokens missing semanticStateEncodings object.");
} else {
  let encodedValueCount = 0;
  for (const [axis, values] of Object.entries(designTokens?.semanticStates ?? {})) {
    if (!Array.isArray(values)) continue;
    const axisEncoding = semanticStateEncodings[axis];
    if (typeof axisEncoding !== "object" || axisEncoding === null || Array.isArray(axisEncoding)) {
      fail(`semanticStateEncodings is missing axis ${axis}.`);
      continue;
    }
    const declaredValues = new Set(values);
    for (const extra of Object.keys(axisEncoding)) {
      if (!declaredValues.has(extra)) fail(`semanticStateEncodings.${axis} declares value ${extra}, which semanticStates.${axis} does not list.`);
    }
    const tuples = new Map();
    for (const value of values) {
      const entry = axisEncoding[value];
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        fail(`semanticStateEncodings.${axis} has no encoding entry for value ${value}.`);
        continue;
      }
      encodedValueCount += 1;
      for (const [key, keyValue] of Object.entries(entry)) {
        if (/colou?r/i.test(key)) fail(`semanticStateEncodings.${axis}.${value} uses a color key ${key}.`);
        if (typeof keyValue === "string" && ENCODING_HEX.test(keyValue)) fail(`semanticStateEncodings.${axis}.${value}.${key} contains a hex color.`);
      }
      if (!ENCODING_CARRIERS.has(entry.carrier)) fail(`semanticStateEncodings.${axis}.${value}.carrier ${String(entry.carrier)} is not an allowed channel.`);
      else {
        const carried = entry[entry.carrier];
        if (carried === null || carried === undefined || carried === "none") fail(`semanticStateEncodings.${axis}.${value}.carrier names ${entry.carrier}, but that channel is absent, null, or "none".`);
      }
      if (entry.glyph !== null && (typeof entry.glyph !== "string" || entry.glyph.length === 0)) fail(`semanticStateEncodings.${axis}.${value}.glyph must be a non-empty string or null.`);
      if (!ENCODING_LINE_STYLES.has(entry.lineStyle)) fail(`semanticStateEncodings.${axis}.${value}.lineStyle ${String(entry.lineStyle)} is not an allowed line style.`);
      if (!ENCODING_FILLS.has(entry.fill)) fail(`semanticStateEncodings.${axis}.${value}.fill ${String(entry.fill)} is not an allowed fill.`);
      if (!ENCODING_SHAPES.has(entry.shape)) fail(`semanticStateEncodings.${axis}.${value}.shape ${String(entry.shape)} is not an allowed shape.`);
      if (!Number.isInteger(entry.minLegibleSizePx) || entry.minLegibleSizePx <= 0) fail(`semanticStateEncodings.${axis}.${value}.minLegibleSizePx must be a positive integer.`);
      const description = requiredString(entry.description, `semanticStateEncodings.${axis}.${value}.description`);
      if (typeof description === "string" && ENCODING_COLOR_WORDS.test(description)) fail(`semanticStateEncodings.${axis}.${value}.description names a color.`);
      const tuple = `${entry.glyph ?? "∅"}|${entry.lineStyle}|${entry.fill}|${entry.shape}`;
      if (tuples.has(tuple)) fail(`semanticStateEncodings.${axis} reuses the same (glyph, lineStyle, fill, shape) tuple for ${tuples.get(tuple)} and ${value}.`);
      else tuples.set(tuple, value);
    }
  }
  designEncodingValueCount = encodedValueCount;
}

if (existsSync(distIndex)) {
  const core = await import(pathToFileURL(distIndex).href);
  const exampleNames = (await readdir(path.join(root, "examples"))).filter((name) => name.endsWith(".project.json"));
  for (const name of exampleNames) {
    const project = await readJson(path.join("examples", name));
    if (project !== undefined) {
      const issues = core.validateProject(project);
      if (issues.length > 0) fail(`${name} failed project validation: ${JSON.stringify(issues)}`);
    }
  }

  const audioPlanFixture = await readJson("conformance/fr01/resolved-audio-plan-v2.valid.json");
  const runtimeFixtures = [
    ["conformance/fr01/command-v2.valid.json", (value) => core.validateCommandEnvelopeV2(value) === undefined ? [] : [core.validateCommandEnvelopeV2(value)]],
    ["conformance/fr01/evaluation-request-v2.valid.json", core.validateEvaluationRequestV2],
    ["conformance/fr01/resolved-audio-plan-v2.valid.json", core.validateResolvedAudioPlanV2],
    ["conformance/fr01/audio-schedule-binding-v1.valid.json", (value) => audioPlanFixture === undefined ? ["missing audio plan fixture"] : core.validateAudioScheduleBindingV1(value, audioPlanFixture)],
    ["conformance/fr01/package-manifest-v2.valid.json", core.validatePackageManifestV2],
    ["conformance/fr01/accessibility-mirror-v1.valid.json", core.validateAccessibilityMirrorV1],
    ["conformance/fr01/export-manifest-v1.valid.json", core.validateExportManifestV1],
  ];
  if (claimRegister !== undefined) {
    const claimIssues = core.validateClaimRegisterV1(claimRegister);
    if (!Array.isArray(claimIssues) || claimIssues.length > 0) fail(`program/claim-register.json failed runtime validation: ${JSON.stringify(claimIssues)}`);
  }

  for (const [fixturePath, validator] of runtimeFixtures) {
    const fixture = await readJson(fixturePath);
    if (fixture === undefined) continue;
    const issues = validator(fixture);
    if (!Array.isArray(issues) || issues.length > 0) fail(`${fixturePath} failed runtime contract validation: ${JSON.stringify(issues)}`);
  }
}

for (const required of [
  "docs/18-wave1-system-integration.md",
  "docs/19-ui-ux-wave1-integrated-amendment.md",
  "docs/21-interaction-state-machine-conformance.md",
  "docs/24-fr01-whole-system-adversarial-repository-review.md",
  "docs/25-fr01-contract-and-migration-amendment.md",
  "docs/26-fr01-validation-report.md",
  "docs/27-fr01-swarm-handoff-amendment.md",
  "program/fr01-findings-register.json",
  "program/fr01-contract-manifest.json",
  "program/fr01-release-manifest.json",
  "src/core/mapping.ts",
  "src/core/commands.ts",
  "src/core/evaluation-protocol.ts",
  "src/core/render-plan.ts",
  "src/core/strict-json.ts",
  "schemas/agl-claim-register-v1.schema.json",
  "src/geometry/qphi.ts",
]) fileExists(required, "required integrated artifact");
const adrFiles = (await readdir(path.join(root, "docs", "adr"))).filter((name) => /^\d{4}-.+\.md$/.test(name));
const adrPrefixCounts = new Map();
for (const name of adrFiles) adrPrefixCounts.set(name.slice(0, 4), (adrPrefixCounts.get(name.slice(0, 4)) ?? 0) + 1);
for (const [prefix, count] of adrPrefixCounts) if (count !== 1) fail(`ADR prefix ${prefix} occurs ${count} times.`);
for (let adr = 19; adr <= 24; adr += 1) {
  const prefix = String(adr).padStart(4, "0");
  if (adrPrefixCounts.get(prefix) !== 1) fail(`Expected exactly one FR-01 ADR ${prefix}.`);
}

// FR-02 hostile corpus: every declared case must point at a source that exists, and every
// file under the unparseable-by-design directory must be claimed by a case. Without this the
// corpus is inert data that no gate holds.
const fr02Corpus = await readJson("conformance/fr02/corpus.json");
const fr02CaseIds = new Set();
let fr02CaseCount = 0;
if (fr02Corpus !== undefined) {
  const cases = Array.isArray(fr02Corpus.cases) ? fr02Corpus.cases : [];
  if (cases.length === 0) fail("conformance/fr02/corpus.json declares no cases.");
  const claimed = new Set();
  const ids = fr02CaseIds;
  for (const entry of cases) {
    const id = requiredString(entry?.id, "FR-02 corpus case id");
    if (id !== undefined) {
      if (ids.has(id)) fail(`FR-02 corpus case ${id} is declared more than once.`);
      ids.add(id);
    }
    requiredString(entry?.expectedDisposition, `FR-02 corpus case ${id ?? "?"} expectedDisposition`);
    const source = entry?.source?.file ?? entry?.source?.hexFile;
    if (typeof source === "string" && source.length > 0) {
      const relative = path.join("conformance", "fr02", source);
      fileExists(relative, `FR-02 corpus case ${id ?? "?"} source`);
      claimed.add(relative);
      continue;
    }
    // Generator-sourced cases carry no committed bytes; the FR-02 runner (AGL-173) derives
    // them. Hold the declaration shape so a case can never lose its provenance silently.
    if (typeof entry?.source?.generator !== "string" || entry.source.generator.length === 0) {
      fail(`FR-02 corpus case ${id ?? "?"} declares neither a source file nor a generator.`);
      continue;
    }
    // A generator base that does not resolve is a spec no runner can ever execute. Four of
    // these pointed at conformance/fr01-minimal.v3.project.json, which has never existed.
    const base = entry.source.base;
    if (typeof base === "string" && base.length > 0 && !base.includes("*")) {
      fileExists(path.join("conformance", "fr02", base), `FR-02 corpus case ${id ?? "?"} generator base`);
    }
  }
  fr02CaseCount = ids.size;
  for (const directory of UNPARSEABLE_BY_DESIGN) {
    const absolute = path.join(root, directory);
    if (!existsSync(absolute)) { fail(`Missing FR-02 hostile corpus directory: ${directory}`); continue; }
    for (const name of await readdir(absolute)) {
      const relative = path.join(directory, name);
      if (!claimed.has(relative)) fail(`${relative} is not claimed by any FR-02 corpus case.`);
    }
  }
}

// FR-02 registers. Landing them ungated would repeat the FR-02 corpus's own failure mode:
// an artifact that describes work nothing checks. The manifest is the strong half — it carries
// sha256 for every FR-02 file, so it detects silent edits to the corpus.
const fr02Findings = await readJson("program/fr02-findings-register.json");
const fr02Manifest = await readJson("program/fr02-artifact-manifest.json");
const fr02FindingIds = new Set();
let fr02CriticalHighCount = 0;
const fr02SuiteSource = existsSync(path.join(root, "tests", "fr02.test.mjs"))
  ? await readFile(path.join(root, "tests", "fr02.test.mjs"), "utf8")
  : undefined;
if (fr02SuiteSource === undefined) fail("Missing FR-02 executable suite: tests/fr02.test.mjs");
for (const finding of Array.isArray(fr02Findings?.findings) ? fr02Findings.findings : []) {
  const id = requiredString(finding?.id, "FR-02 finding id");
  if (id === undefined) continue;
  if (fr02FindingIds.has(id)) fail(`Duplicate FR-02 finding id: ${id}`);
  fr02FindingIds.add(id);
  if (!["Critical", "High", "Medium", "Low"].includes(finding.severity)) fail(`${id} uses unknown severity ${String(finding.severity)}.`);
  for (const field of ["status", "title", "affectedFilesOrContracts", "failureScenario", "repair", "regressionTest"]) {
    requiredString(finding[field], `${id}.${field}`);
  }
  // The register's value is that each finding names a gate that RESOLVES. Two id spaces are
  // legitimate: FR02-Pnn is a property test in the suite, FR02-Cnn is a corpus case. This
  // proves the citation points at something real; it cannot prove the gate tests the finding.
  if (typeof finding.regressionTest === "string") {
    for (const gateId of finding.regressionTest.split(/[\s,;]+/).filter(Boolean)) {
      if (gateId.startsWith("FR02-C")) {
        if (!fr02CaseIds.has(gateId)) fail(`${id} names corpus case ${gateId}, which conformance/fr02/corpus.json does not declare.`);
      } else if (fr02SuiteSource !== undefined && !fr02SuiteSource.includes(gateId)) {
        fail(`${id} names regression test ${gateId}, which tests/fr02.test.mjs does not define.`);
      }
    }
  }
  if (["Critical", "High"].includes(finding.severity)) {
    fr02CriticalHighCount += 1;
    const owner = finding.backlogOwner;
    if (typeof owner?.backlogId !== "string" || typeof owner?.workstream !== "string") {
      fail(`${id} is ${finding.severity} without backlogId and workstream ownership.`);
      continue;
    }
    const backlogItem = backlogById.get(owner.backlogId);
    if (backlogItem === undefined) fail(`${id} references unknown backlog owner ${owner.backlogId}.`);
    else if (Array.isArray(backlogItem.owner) && !backlogItem.owner.includes(owner.workstream)) fail(`${id} workstream ${owner.workstream} is not an owner of ${owner.backlogId}.`);
  }
}
if (fr02FindingIds.size === 0) fail("program/fr02-findings-register.json declares no findings.");
const fr02ManifestEntries = Array.isArray(fr02Manifest?.entries) ? fr02Manifest.entries : [];
if (fr02ManifestEntries.length === 0) fail("program/fr02-artifact-manifest.json declares no entries.");
const fr02Declared = new Set();
for (const entry of fr02ManifestEntries) {
  const relative = requiredString(entry?.path, "FR-02 manifest entry path");
  if (relative === undefined) continue;
  fr02Declared.add(relative);
  if (!fileExists(relative, "FR-02 manifest artifact")) continue;
  const declaredDigest = typeof entry.sha256 === "string" ? entry.sha256.replace(/^sha256:/, "") : undefined;
  if (declaredDigest !== undefined && await sha256(relative) !== declaredDigest) {
    fail(`FR-02 manifest digest mismatch for ${relative}.`);
  }
}
async function walkFiles(directory, out = []) {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) await walkFiles(relative, out);
    else out.push(relative);
  }
  return out;
}
// Coverage in the other direction: the corpus cannot grow a file the manifest does not hash.
for (const relative of await walkFiles(path.join("conformance", "fr02"))) {
  if (!fr02Declared.has(relative)) fail(`${relative} is an FR-02 artifact that program/fr02-artifact-manifest.json does not declare.`);
}
for (const relative of [
  "docs/28-fr02-project-format-torture-test.md",
  "docs/adr/0025-project-import-quarantine-byte-recovery-and-catalog-rebinding.md",
  "tests/fr02.test.mjs",
  "program/fr02-findings-register.json",
]) {
  if (!fr02Declared.has(relative)) fail(`${relative} is not declared in program/fr02-artifact-manifest.json.`);
}

// Composited figure plates: the committed SVG must be byte-identical to the generator output and
// mathematically faithful to the operator kernel. This is the link that binds design/mockups/
// figures/*.svg to src/operators/*.ts — a stale committed figure, or one whose markers drift off
// their step angle, fails here rather than being read off the raster by a model or a reviewer.
let figurePlateCount = 0;
for (const result of await checkFigures()) {
  if (!result.plated) continue;
  figurePlateCount += 1;
  for (const violation of result.failures ?? []) fail(`Figure plate ${result.screen}: ${violation}`);
}

if (failures.length > 0) {
  console.error("Verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log(
  `Verified ${backlogIds.size} backlog items, ${researchIds.size} research runs, ${decisionIds.size} Wave-1 decisions, ` +
  `${labIds.size} labs, ${findingIds.size} FR-01 findings (${criticalHighCount} Critical/High owned), ` +
  `${publicContractIds.size} public contracts, ${fr02CaseCount} FR-02 corpus cases, ${fr02FindingIds.size} FR-02 findings (${fr02CriticalHighCount} Critical/High owned), ${fr02Declared.size} manifest-hashed FR-02 artifacts, ${designEncodingValueCount} color-free semantic-state encodings, ${figurePlateCount} kernel-faithful figure plates, evidence/contract hashes, native conformance mirrors, runtime validators, and required authority artifacts.`,
);
