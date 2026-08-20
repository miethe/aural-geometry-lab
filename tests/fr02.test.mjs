import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SeededRandomV2,
  canonicalDigestV1,
  checkProjectCompatibilityV3,
  migrateProjectToLatest,
  migrateProjectV1ToV2,
  migrateProjectV2ToV3,
  parseStrictJsonTextV1,
  parseStrictJsonUtf8V1,
  projectSemanticDigestV3,
  sha256Hex,
  validateCanonicalRationalWire,
  validatePackageManifestV2,
  validateProject,
  verifyPackageMembersV2,
} from "../dist/src/core/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const readBytes = (relative) => new Uint8Array(fs.readFileSync(path.join(root, relative)));
const D0 = "sha256:" + "0".repeat(64);

function jsonBytes(value, indent = 2) {
  return new TextEncoder().encode(JSON.stringify(value, null, indent) + "\n");
}

function byteDigest(bytes) {
  return `sha256:${sha256Hex(bytes)}`;
}

function clone(value) {
  return structuredClone(value);
}

function dispositionForV3(project, supported) {
  const issues = validateProject(project);
  if (issues.length > 0) return { disposition: "refuse", issues };
  const compatibility = checkProjectCompatibilityV3(project, supported);
  return compatibility.length === 0
    ? { disposition: "accept", compatibility }
    : { disposition: "quarantine", compatibility };
}

function sourceRecipeDigest(recipe) {
  return canonicalDigestV1(["agl-source-recipe-v3", recipe]);
}

function minimalV1(overrides = {}) {
  return {
    schema: "agl.project", schemaVersion: 1, id: "project-v1", name: "v1",
    createdAt: "2026-08-19T00:00:00Z", modifiedAt: "2026-08-19T00:00:00Z", seed: "seed",
    tempo: { bpm: 120, numerator: 4, denominator: 4 }, tracks: [], nodes: [], connections: [],
    activeLab: "euclidean-rings", labState: {}, ...overrides,
  };
}

function shuffled(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = random.integer(0, index + 1);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

test("FR02-P01/P02 strict source-byte identity is distinct from semantic identity", () => {
  const project = readJson("examples/fr01-minimal.v3.project.json");
  const compact = new TextEncoder().encode(JSON.stringify(project));
  const pretty = jsonBytes(project, 4);
  assert.notEqual(byteDigest(compact), byteDigest(pretty));
  const left = parseStrictJsonUtf8V1(compact);
  const right = parseStrictJsonUtf8V1(pretty);
  assert.equal(projectSemanticDigestV3(left), projectSemanticDigestV3(right));

  const random = new SeededRandomV2("fr02-editorial-projection");
  for (let iteration = 0; iteration < 256; iteration += 1) {
    const edited = clone(project);
    edited.id = `copy-${iteration}`;
    edited.name = `Name ${random.nextUint32()}`;
    edited.createdAt = "2020-01-01T00:00:00Z";
    edited.modifiedAt = `2026-08-19T00:00:${String(iteration % 60).padStart(2, "0")}Z`;
    edited.presentation = { defaultLab: `future-lab-${iteration}`, graphLayout: {} };
    assert.deepEqual(validateProject(edited), []);
    assert.equal(projectSemanticDigestV3(edited), projectSemanticDigestV3(project));
  }
});

test("FR02-P03 unknown nonsemantic extensions round-trip structurally and do not alter semantic digest", () => {
  const base = readJson("examples/fr01-minimal.v3.project.json");
  const random = new SeededRandomV2("fr02-nonsemantic-extensions");
  for (let iteration = 0; iteration < 256; iteration += 1) {
    const project = clone(base);
    const payload = {
      label: `future-${iteration}`,
      values: Array.from({ length: random.integer(0, 12) }, () => random.integer(-100, 101)),
      nested: { enabled: random.integer(0, 2) === 1 },
    };
    project.extensions = [{ namespace: `future.ui.case-${iteration}`, schemaVersion: 1, affectsSemantics: false, payload }];
    assert.deepEqual(validateProject(project), []);
    const reparsed = parseStrictJsonUtf8V1(jsonBytes(project));
    assert.deepEqual(JSON.parse(JSON.stringify(reparsed.extensions[0].payload)), payload);
    assert.equal(projectSemanticDigestV3(project), projectSemanticDigestV3(base));
  }
});

test("FR02-P04 semantic extensions and required contracts alter semantic digest", () => {
  const base = readJson("examples/fr01-minimal.v3.project.json");
  for (let iteration = 1; iteration <= 128; iteration += 1) {
    const project = clone(base);
    const namespace = `future.math.case-${iteration}`;
    project.compatibility.requiredSemanticExtensions = [`${namespace}@v1`];
    project.extensions = [{ namespace, schemaVersion: 1, affectsSemantics: true, payload: { value: iteration } }];
    assert.deepEqual(validateProject(project), []);
    assert.notEqual(projectSemanticDigestV3(project), projectSemanticDigestV3(base));
  }
});

test("FR02-P05 unknown required extensions fail closed as quarantine", () => {
  const project = readJson("conformance/fr02/project-v3.unknown-required-extension.quarantine.json");
  const result = dispositionForV3(project, {
    operatorCatalogDigests: new Set([project.compatibility.operatorCatalogDigest]),
    semanticExtensions: new Set(),
    budgetProfiles: new Set([`${project.compatibility.budgetProfileId}@v${project.compatibility.budgetProfileVersion}`]),
  });
  assert.equal(result.disposition, "quarantine");
  assert.deepEqual(result.compatibility, ["unsupported-semantic-extension:future.math.operator-hints@v1"]);
});

test("FR02-P06 migration is deterministic and does not mutate the source", () => {
  const source = readJson("examples/euclidean-polyrhythm.v2.project.json");
  const before = clone(source);
  const input = { project: source, migratedAt: "2026-08-19T20:00:00.000Z", sourceBytesDigest: byteDigest(jsonBytes(source)) };
  const left = migrateProjectToLatest(input);
  const right = migrateProjectToLatest(input);
  assert.deepEqual(source, before);
  assert.deepEqual(left, right);
  assert.equal(left.receipt.requiresUserReview, true);
  assert.equal(left.receipt.sourceBytesDigest, input.sourceBytesDigest);
});

test("FR02-P07 v1→v3 latest migration is exact sequential composition", () => {
  const random = new SeededRandomV2("fr02-v1-sequential");
  for (let iteration = 0; iteration < 128; iteration += 1) {
    const source = minimalV1({
      id: `v1-${iteration}`,
      seed: `seed-${random.nextUint32()}`,
      tempo: { bpm: random.integer(40, 241), numerator: random.integer(1, 17), denominator: [1, 2, 4, 8, 16][random.integer(0, 5)] },
      labState: { iteration, flag: random.integer(0, 2) === 1 },
    });
    const explicit = migrateProjectV2ToV3(migrateProjectV1ToV2(source));
    const latest = migrateProjectToLatest({ project: source, migratedAt: "2026-08-19T20:00:00.000Z" }).project;
    assert.deepEqual(latest, explicit);
  }
});

test("FR02-P08 persisted migration carries the exact source-byte digest", () => {
  const source = readJson("examples/euclidean-polyrhythm.v2.project.json");
  for (const indent of [0, 1, 2, 4, 8]) {
    const bytes = indent === 0 ? new TextEncoder().encode(JSON.stringify(source)) : jsonBytes(source, indent);
    const receipt = migrateProjectToLatest({
      project: parseStrictJsonUtf8V1(bytes), migratedAt: "2026-08-19T20:00:00.000Z", sourceBytesDigest: byteDigest(bytes),
    }).receipt;
    assert.equal(receipt.sourceBytesDigest, byteDigest(bytes));
  }
});

test("FR02-P09 Rational wire canonicality is property-weighted", () => {
  const random = new SeededRandomV2("fr02-rational-properties");
  for (let iteration = 0; iteration < 2_000; iteration += 1) {
    let numerator = BigInt(random.integer(-1_000_000, 1_000_001));
    let denominator = BigInt(random.integer(1, 1_000_001));
    const gcd = (a, b) => { a = a < 0n ? -a : a; while (b !== 0n) [a, b] = [b, a % b]; return a === 0n ? 1n : a; };
    const divisor = gcd(numerator, denominator);
    numerator /= divisor; denominator /= divisor;
    const canonical = { numerator: numerator.toString(), denominator: denominator.toString() };
    assert.deepEqual(validateCanonicalRationalWire(canonical), []);
    const factor = BigInt(random.integer(2, 20));
    const alias = { numerator: (numerator * factor).toString(), denominator: (denominator * factor).toString() };
    assert.ok(validateCanonicalRationalWire(alias).some((issue) => /not normalized/.test(issue)));
  }
  assert.ok(validateCanonicalRationalWire({ numerator: "00", denominator: "1" }).length > 0);
  assert.ok(validateCanonicalRationalWire({ numerator: "0", denominator: "0" }).length > 0);
  assert.ok(validateCanonicalRationalWire({ numerator: "9".repeat(4097), denominator: "1" }).length > 0);
});

test("FR02-P10 semantic IDs are globally collision-free across project collections", () => {
  const base = readJson("examples/fr01-minimal.v3.project.json");
  const kinds = ["node", "track", "asset"];
  for (const left of kinds) for (const right of kinds) {
    if (left === right) continue;
    const project = clone(base);
    const id = `collision-${left}-${right}`;
    if (left === "node" || right === "node") project.graph.nodes.push({ id, type: "test.source", version: 1, operatorSemanticDigest: D0, parameters: {} });
    if (left === "track" || right === "track") project.tracks.push({ id, name: "T", kind: "note", materialIds: [], route: { muted: false, solo: false, gain: 1, pan: 0 } });
    if (left === "asset" || right === "asset") project.assets.push({ id, digest: D0, mediaType: "application/octet-stream", bytes: 0, rights: "generated" });
    assert.ok(validateProject(project).some((issue) => /Semantic ID .* is reused/.test(issue.message)));
  }
});

test("FR02-P11 unknown lab/default view is nonsemantic and remains structurally valid", () => {
  const base = readJson("examples/fr01-minimal.v3.project.json");
  const project = readJson("conformance/fr02/project-v3.unknown-default-lab.accept-with-loss.json");
  assert.deepEqual(validateProject(project), []);
  assert.equal(projectSemanticDigestV3(project), projectSemanticDigestV3(base));
});

test("FR02-P12 future schema bytes are never accepted as v3", () => {
  const base = readJson("examples/fr01-minimal.v3.project.json");
  for (const version of [4, 5, 17, 2 ** 31 - 1]) {
    const project = clone(base); project.schemaVersion = version;
    const issues = validateProject(project);
    assert.ok(issues.some((issue) => issue.path === "$.schemaVersion"));
  }
});

test("FR02-P13/P14 content-addressed package fixture verifies measured bytes", () => {
  const directory = "conformance/fr02/package-asset-closure.valid";
  const manifest = readJson(`${directory}/manifest.json`);
  assert.deepEqual(validatePackageManifestV2(manifest), []);
  const actual = [{ path: "manifest.json", kind: "file", bytes: readBytes(`${directory}/manifest.json`) }];
  for (const member of manifest.members) actual.push({ path: member.path, kind: "file", bytes: readBytes(`${directory}/${member.path}`), compressedBytes: member.compressedBytes });
  assert.deepEqual(verifyPackageMembersV2(manifest, shuffled(actual, new SeededRandomV2("fr02-package-order"))), []);
  for (const member of manifest.members.filter((item) => item.role === "asset")) {
    assert.equal(member.path.match(/^assets\/([a-f0-9]{64})/)?.[1], member.sha256);
    assert.equal(sha256Hex(readBytes(`${directory}/${member.path}`)), member.sha256);
  }
});

test("FR02 strict JSON corpus has stable exact identities", () => {
  const classify = (error) => {
    const message = error instanceof Error ? error.message : String(error);
    if (/Duplicate JSON object member/.test(message)) return "AGL-FMT-JSON-DUPLICATE_MEMBER";
    if (/safe interoperable range/.test(message)) return "AGL-FMT-JSON-UNSAFE_INTEGER";
    if (/surrogate/.test(message)) return "AGL-FMT-JSON-MALFORMED_UNICODE";
    if (/trailing JSON content/.test(message)) return "AGL-FMT-JSON-TRAILING_CONTENT";
    if (/encoded data|UTF-8|decode/i.test(message)) return "AGL-FMT-JSON-INVALID_UTF8";
    throw error;
  };
  const cases = [
    ["raw/duplicate-schema-version.json", "AGL-FMT-JSON-DUPLICATE_MEMBER"],
    ["raw/unsafe-integer.json", "AGL-FMT-JSON-UNSAFE_INTEGER"],
    ["raw/lone-surrogate.json", "AGL-FMT-JSON-MALFORMED_UNICODE"],
    ["raw/trailing-content.json", "AGL-FMT-JSON-TRAILING_CONTENT"],
  ];
  for (const [relative, expected] of cases) {
    assert.throws(() => {
      try { parseStrictJsonTextV1(fs.readFileSync(path.join(root, "conformance/fr02", relative), "utf8")); }
      catch (error) { assert.equal(classify(error), expected); throw error; }
    });
  }
  const invalidUtf8 = Uint8Array.from(Buffer.from(fs.readFileSync(path.join(root, "conformance/fr02/raw/invalid-utf8.hex"), "utf8").trim(), "hex"));
  assert.throws(() => {
    try { parseStrictJsonUtf8V1(invalidUtf8); }
    catch (error) { assert.equal(classify(error), "AGL-FMT-JSON-INVALID_UTF8"); throw error; }
  });
});

// These are executable specifications blocked on AGL-172/173/179/191. They are
// intentionally TODO rather than assertions of the current defective behavior.
test.todo("FR02-P15 [AGL-173] v2 connections migrate without affectsResult and conflicts emit one blocking loss");
test.todo("FR02-P16 [AGL-173] PRNG/stable-ID v1→v2 semantic change is always disclosed as blocking");
test.todo("FR02-P17 [AGL-173] receipt emission implies fully validated target project");
test.todo("FR02-P18 [AGL-179] every project asset and recovery reference has measured package-member closure");
test.todo("FR02-P19 [AGL-172/173] rollback is advertised only when sourceBytesDigest resolves to exact retained bytes");
test.todo("FR02-P20 [AGL-191] Swift and TypeScript classify every native-parity byte vector identically before DTO decode");
test.todo("FR02-P21 [AGL-170] profile-numeric graph execution requires supported numerical profile/backend identity");
test.todo("FR02-P22 [AGL-172] payloadRef quarantines unless an exact required resolver extension is supported");
test.todo("FR02-P23 [AGL-173] legacy operator rebinding is atomic, exact-version, sealed-catalog, and receipt-bound");
test.todo("FR02-P24 [AGL-182] TypeScript/Swift canonical vectors prove no Unicode normalization in canonical v1");
