import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  canonicalEncodeV1,
  canonicalDigestV1,
  sha256HexUtf8,
  sha256Hex,
  stableIdV2,
  SeededRandomV2,
  Rational,
  validateCanonicalRationalWire,
  beatToSecondsV1,
  secondsToBeatEstimateV1,
  tempoMapDigestV1,
  validateTempoMapV1,
  validateProject,
  migrateProjectToLatest,
  projectSemanticDigestV3,
  OperatorRegistry,
  operatorSemanticDigest,
  validateOperatorParameters,
  compileGraphV1,
  CommandRegistryV2,
  applyCommandTransactionV2,
  validateCommandEnvelopeV2,
  canCoalesceSemanticCommandsV2,
  emptyCommittedHistoryV2,
  recordCommittedHistoryV2,
  prepareUndoTransactionV2,
  prepareRedoTransactionV2,
  recordUndoAppliedV2,
  recordRedoAppliedV2,
  peekUndoHistoryV2,
  peekRedoHistoryV2,
  StaticPattern,
  classifyDerivationResultV2,
  derivationCacheKeyV2,
  validateEvaluationRequestV2,
  validateEvaluationProgressV2,
  cancellationPollRequiredV2,
  semanticSelectionKeyV2,
  selectionProjectionKeyV1,
  createSelectionStateV2,
  orphanGeneratedSelectionV2,
  reactivateExactOrphanV2,
  deriveSourceStatus,
  commitMaterializationV2,
  validatePackageManifestV2,
  verifyPackageMembersV2,
  validateCanonicalPackagePathV2,
  resolvedAudioPlanDigestV2,
  finalizeResolvedAudioPlanV2,
  validateResolvedAudioPlanV2,
  scheduleResolvedPlanV2,
  validateAccessibilityMirrorV1,
  validateExportManifestV1,
  verifyExportArtifactV1,
  evaluateClaimUseV1,
  validateClaimRegisterV1,
  claimQualificationDigestV1,
  parseStrictJsonTextV1,
  parseStrictJsonUtf8V1,
} from "../dist/src/core/index.js";
import {
  DEFAULT_RISSET_SEMANTICS,
  rissetEventTimes,
  rissetSemanticCycleError,
} from "../dist/src/operators/risset.js";
import {
  DEFAULT_PENROSE_PHASE_V1,
  canonicalEdgeIdV2,
  canonicalTileIdV2,
  canonicalVertexIdV2,
  validatePenroseConfigurationV1,
  validatePenroseQueryV1,
} from "../dist/src/geometry/penrose.js";
import { QPhi } from "../dist/src/geometry/qphi.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const D0 = "sha256:" + "0".repeat(64);
const D1 = "sha256:" + "1".repeat(64);
const D2 = "sha256:" + "2".repeat(64);
const D3 = "sha256:" + "3".repeat(64);

function baseOperator(type, inputType, outputType, required = false) {
  return {
    type,
    version: 1,
    name: type,
    category: "test",
    description: "FR-01 test operator",
    deterministic: true,
    inputs: inputType === undefined ? [] : [{ id: "in", name: "Input", type: inputType, required, multiple: false }],
    outputs: outputType === undefined ? [] : [{ id: "out", name: "Output", type: outputType, required: false }],
    parameters: [{ id: "amount", name: "Amount", description: "Test amount", kind: "number", defaultValue: 1, minimum: 0, maximum: 2 }],
    conformanceClass: "exact",
    temporal: { kind: "pointwise" },
    provenanceSchemaVersion: 1,
  };
}

function command(overrides = {}) {
  return {
    schema: "agl.command",
    schemaVersion: 2,
    contractVersion: "agl-command-contract-v2",
    commandId: "cmd-1",
    transactionId: "tx-1",
    logicalActionId: "set-value",
    editSessionId: "gesture-1",
    projectId: "project-1",
    projectEpoch: "epoch-1",
    baseRevision: "0",
    actor: { actorId: "actor-1", sequence: "1" },
    origin: "user",
    kind: "SetValue",
    payloadVersion: 1,
    payload: { value: 1 },
    targetSet: ["entity-1"],
    writeSet: ["value@v1"],
    preconditions: [],
    ...overrides,
  };
}

function commandRegistry() {
  const registry = new CommandRegistryV2();
  registry.register({
    kind: "SetValue",
    payloadVersion: 1,
    validatePayload: (payload) => typeof payload === "object" && payload !== null && Number.isFinite(payload.value),
    apply: (project, payload) => ({
      project: { ...project, value: payload.value },
      inverse: {
        kind: "SetValue",
        payloadVersion: 1,
        payload: { value: project.value },
        targetSet: ["entity-1"],
        writeSet: ["value@v1"],
        preconditions: [],
      },
    }),
  });
  registry.register({
    kind: "MutateThenFail",
    payloadVersion: 1,
    validatePayload: () => true,
    apply: (project) => {
      project.value = 999;
      throw new Error("intentional failure");
    },
  });
  return registry;
}

function trigger(id, start, duration = Rational.zero()) {
  return { kind: "trigger", id, start, duration, velocity: 1, voice: "click", tags: [], provenance: [] };
}

test("FR-01 canonical encoding is typed, ordered, cycle-safe, and SHA-256 compatible", () => {
  assert.equal(sha256HexUtf8("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(canonicalEncodeV1({ b: 2, a: 1 }), canonicalEncodeV1({ a: 1, b: 2 }));
  assert.notEqual(canonicalEncodeV1(1), canonicalEncodeV1("1"));
  assert.equal(canonicalEncodeV1(-0), canonicalEncodeV1(0));
  const cyclic = {}; cyclic.self = cyclic;
  assert.throws(() => canonicalEncodeV1(cyclic), /cycle/i);
  assert.throws(() => canonicalDigestV1(Number.NaN), /finite/i);
});



test("FR-01 canonical encoding rejects malformed or hidden JavaScript state and honors safety bounds", () => {
  assert.throws(() => canonicalEncodeV1("\ud800"), /surrogate/i);
  const sparse = []; sparse.length = 2; sparse[1] = 1;
  assert.throws(() => canonicalEncodeV1(sparse), /dense/i);
  const accessor = {}; Object.defineProperty(accessor, "x", { enumerable: true, get: () => 1 });
  assert.throws(() => canonicalEncodeV1(accessor), /accessor/i);
  const hidden = {}; Object.defineProperty(hidden, "x", { enumerable: false, value: 1 });
  assert.throws(() => canonicalEncodeV1(hidden), /enumerable/i);
  const symbolic = { x: 1 }; symbolic[Symbol("hidden")] = 2;
  assert.throws(() => canonicalEncodeV1(symbolic), /symbol/i);
  assert.throws(() => canonicalEncodeV1([1, 2], {
    maximumDepth: 8, maximumNodes: 8, maximumStringBytes: 8, maximumArrayLength: 1, maximumObjectKeys: 8, maximumEncodedBytes: 64,
  }), /array.*limit/i);
});

test("FR-01 SHA-256 implementation agrees with Node across block boundaries", async () => {
  const { createHash } = await import("node:crypto");
  for (const length of [0, 1, 55, 56, 63, 64, 65, 127, 128, 129, 1024, 65537]) {
    const bytes = Uint8Array.from({ length }, (_, index) => (index * 131 + length * 17) & 0xff);
    const expected = createHash("sha256").update(bytes).digest("hex");
    assert.equal(sha256Hex(bytes), expected);
  }
});

test("FR-01 strict JSON rejects duplicate names, malformed Unicode, unsafe integers, and invalid UTF-8", () => {
  assert.throws(() => parseStrictJsonTextV1('{"x":1,"x":2}'), /duplicate/i);
  assert.throws(() => parseStrictJsonTextV1('{"x":"\\ud800"}'), /surrogate/i);
  assert.throws(() => parseStrictJsonTextV1('{"x":9007199254740992}'), /safe interoperable range/i);
  assert.throws(() => parseStrictJsonUtf8V1(Uint8Array.from([0x7b, 0x22, 0x78, 0x22, 0x3a, 0xc3, 0x28, 0x7d])), /encoded data|UTF-8|decode/i);
  const parsed = parseStrictJsonTextV1('{"x":[1,true,null]}');
  assert.deepEqual(JSON.parse(JSON.stringify(parsed)), { x: [1, true, null] });
});

test("FR-01 stable IDs are bounded and unambiguous across tuple boundaries", () => {
  const left = stableIdV2("entity", "ab", "c");
  const right = stableIdV2("entity", "a", "bc");
  assert.notEqual(left, right);
  assert.match(left, /^entity~2~[a-f0-9]{64}$/);
  assert.equal(left, stableIdV2("entity", "ab", "c"));
});

test("FR-01 named PRNG streams are deterministic and independent of sibling draw order", () => {
  const rootA = new SeededRandomV2("seed");
  const childA = rootA.fork("child");
  rootA.next(); rootA.next();
  const rootB = new SeededRandomV2("seed");
  const childB = rootB.fork("child");
  assert.deepEqual([childA.nextUint32(), childA.nextUint32()], [childB.nextUint32(), childB.nextUint32()]);
  assert.equal(childA.streamIdentity(), childB.streamIdentity());
  assert.throws(() => rootA.integer(0, 2 ** 32 + 1), /2\^32/);
});


test("FR-01 selection v2 fixture is projection-independent in TypeScript and Swift", () => {
  const fixture = readJson("conformance/selection-v2-cases.json");
  for (const item of fixture.cases) {
    assert.equal(semanticSelectionKeyV2(item.semantic), item.expectedSemanticKey, item.name);
    if (item.alternate !== undefined) {
      assert.equal(semanticSelectionKeyV2(item.alternate), item.expectedAlternateSemanticKey, `${item.name} alternate`);
      assert.equal(semanticSelectionKeyV2(item.alternate), semanticSelectionKeyV2(item.semantic), `${item.name} semantic equivalence`);
    }
    assert.deepEqual(
      item.projections.map((projection) => selectionProjectionKeyV1({ semantic: item.semantic, ...projection })),
      item.expectedProjectionKeys,
      `${item.name} projections`,
    );
  }
});

test("FR-01 PRNG v2 and stable-ID fixture is identical across TypeScript and Swift", () => {
  const fixture = readJson("conformance/prng-v2-cases.json");
  assert.equal(fixture.algorithm, "agl-mulberry32-named-stream-v2");
  assert.equal(fixture.version, "agl-prng-v2");
  for (const item of fixture.streams) {
    const material = [fixture.algorithm, item.rootSeed, item.streamPath];
    assert.equal(canonicalEncodeV1(material), item.canonicalSeedMaterial, `${item.name} canonical material`);
    assert.equal(canonicalDigestV1(material), item.seedMaterialDigest, `${item.name} digest`);

    const uintGenerator = new SeededRandomV2(item.rootSeed, item.streamPath);
    assert.deepEqual(
      item.firstUint32.map(() => uintGenerator.nextUint32()),
      item.firstUint32,
      `${item.name} uint32`,
    );

    const integerGenerator = new SeededRandomV2(item.rootSeed, item.streamPath);
    assert.deepEqual(
      item.boundedIntegers.map(() => integerGenerator.integer(-17, 23)),
      item.boundedIntegers,
      `${item.name} bounded integers`,
    );
    assert.equal(new SeededRandomV2(item.rootSeed, item.streamPath).streamIdentity(), item.streamIdentity, `${item.name} identity`);
  }
  for (const item of fixture.stableIds) {
    assert.equal(canonicalEncodeV1(item.parts), item.canonicalParts, `${item.name} canonical parts`);
    assert.equal(stableIdV2(item.prefix, ...item.parts), item.expected, item.name);
  }
});

test("FR-01 rational parsing is exact and canonical wire rejects ambiguous values", () => {
  assert.equal(Rational.parse("1.25e-2").toString(), "1/80");
  assert.deepEqual(Rational.parse("-10/20").toJSON(), { numerator: "-1", denominator: "2" });
  assert.ok(validateCanonicalRationalWire({ numerator: "02", denominator: "4" }).length > 0);
  assert.ok(validateCanonicalRationalWire({ numerator: "0", denominator: "2" }).length > 0);
  assert.throws(() => Rational.from(Number.MAX_SAFE_INTEGER + 1), /safe integer/);
  assert.throws(() => Rational.from(0.1), /safe integer|approximate/i);
  assert.equal(Rational.fromApproximateNumber(0.1).toString(), "1/10");
});

test("FR-01 tempo conversion integrates linear BPM analytically and round-trips", () => {
  const map = [
    { id: "t0", beat: { numerator: "0", denominator: "1" }, bpm: 60, curve: "linear" },
    { id: "t1", beat: { numerator: "4", denominator: "1" }, bpm: 120, curve: "step" },
  ];
  assert.deepEqual(validateTempoMapV1(map), []);
  const expected = 4 * Math.log(2);
  assert.ok(Math.abs(beatToSecondsV1(new Rational(4n), map) - expected) < 1e-12);
  assert.ok(Math.abs(secondsToBeatEstimateV1(expected, map) - 4) < 1e-12);
  assert.equal(tempoMapDigestV1(map), tempoMapDigestV1(structuredClone(map)));
});

test("FR-01 project v3 validates and semantic digest ignores editorial modifiedAt", () => {
  const project = readJson("examples/fr01-minimal.v3.project.json");
  assert.deepEqual(validateProject(project), []);
  const edited = structuredClone(project); edited.modifiedAt = "2026-08-18T12:00:00Z";
  assert.equal(projectSemanticDigestV3(project), projectSemanticDigestV3(edited));
});

test("FR-01 project validation rejects duplicate ownership and invalid material-state combinations", () => {
  const project = readJson("examples/fr01-minimal.v3.project.json");
  project.tracks = [
    { id: "track-1", name: "A", kind: "note", materialIds: ["material-1"], route: { muted: false, solo: false, gain: 1, pan: 0 } },
    { id: "track-2", name: "B", kind: "note", materialIds: ["material-1"], route: { muted: false, solo: false, gain: 1, pan: 0 } },
  ];
  project.materials = [{ id: "material-1", trackId: "track-1", kind: "live-generated", payload: { events: [] } }];
  const messages = validateProject(project).map((issue) => `${issue.path} ${issue.message}`);
  assert.ok(messages.some((message) => /multiple tracks|requires source lineage|disagrees/i.test(message)));
});

test("FR-01 legacy migration emits explicit losses and blocks clean-upgrade claims", () => {
  const legacy = {
    schema: "agl.project", schemaVersion: 1, id: "legacy", name: "Legacy",
    createdAt: "2026-08-18T00:00:00Z", modifiedAt: "2026-08-18T00:00:00Z", seed: "s",
    tempo: { bpm: 120, numerator: 4, denominator: 4 },
    nodes: [], connections: [], tracks: [], activeLab: "unknown", labState: { x: 1 },
  };
  const migrated = migrateProjectToLatest({ project: legacy, sourceBytesSha256: "0".repeat(64), migratedAt: "2026-08-18T00:00:00.000Z" });
  assert.equal(migrated.project.schemaVersion, 3);
  assert.equal(migrated.receipt.requiresUserReview, true);
  assert.ok(migrated.receipt.losses.length > 0);
});

test("FR-01 operator registry freezes definitions, seals catalog, and treats explicit null as invalid", () => {
  const definition = baseOperator("test.source", undefined, "pattern.trigger");
  const registry = new OperatorRegistry(true);
  registry.register(definition);
  definition.parameters[0].defaultValue = 2;
  assert.equal(registry.get("test.source", 1).parameters[0].defaultValue, 1);
  assert.ok(validateOperatorParameters(registry.get("test.source", 1), { amount: null }).length > 0);
  const digest = registry.seal();
  assert.equal(registry.catalogDigest(), digest);
  assert.throws(() => registry.register(baseOperator("test.other", undefined, "pattern.trigger")), /sealed/);
});

test("FR-01 graph compiler enforces operator digests, port types, cardinality, and cycles", () => {
  const registry = new OperatorRegistry();
  const source = baseOperator("test.source", undefined, "pattern.trigger");
  const sink = baseOperator("test.sink", "pattern.trigger", "pattern.trigger", true);
  registry.register(source); registry.register(sink); registry.seal();
  const src = { id: "a", type: source.type, version: 1, operatorSemanticDigest: operatorSemanticDigest(source), parameters: {} };
  const dst = { id: "b", type: sink.type, version: 1, operatorSemanticDigest: operatorSemanticDigest(sink), parameters: {} };
  const edge = { id: "e", kind: "dataflow", sourceNodeId: "a", sourcePortId: "out", targetNodeId: "b", targetPortId: "in" };
  const compiled = compileGraphV1({ nodes: [dst, src], connections: [edge] }, registry);
  assert.equal(compiled.kind, "compiled");
  assert.deepEqual(compiled.graph.topologicalNodeIds, ["a", "b"]);
  const badDigest = compileGraphV1({ nodes: [{ ...src, operatorSemanticDigest: D0 }, dst], connections: [edge] }, registry);
  assert.equal(badDigest.kind, "rejected");
  assert.ok(badDigest.diagnostics.some((d) => d.code === "GRAPH_OPERATOR_DIGEST_MISMATCH"));
  const cycle = compileGraphV1({ nodes: [src, dst], connections: [edge, { ...edge, id: "e2", sourceNodeId: "b", targetNodeId: "a" }] }, registry);
  assert.equal(cycle.kind, "rejected");
});

test("FR-01 graph compatibility compares full dimension semantics, not display IDs", () => {
  const registry = new OperatorRegistry();
  const source = baseOperator("test.dimension-source", undefined, "control");
  source.outputs[0].dimension = { id: "value", label: "Value", valueKind: "scalar", measurement: "ratio", unit: "Hz", domain: { min: 0, max: 100 }, missingPolicy: "gap" };
  const target = baseOperator("test.dimension-target", "control", undefined, true);
  target.inputs[0].dimension = { id: "value", label: "Value", valueKind: "scalar", measurement: "ratio", unit: "Hz", domain: { min: 0, max: 200 }, missingPolicy: "gap" };
  registry.register(source); registry.register(target); registry.seal();
  const nodes = [source, target].map((definition, index) => ({
    id: index === 0 ? "source" : "target", type: definition.type, version: 1,
    operatorSemanticDigest: registry.getSemanticDigest(definition.type, 1), parameters: { amount: 1 },
  }));
  const result = compileGraphV1({ nodes, connections: [{ id: "edge", sourceNodeId: "source", sourcePortId: "out", targetNodeId: "target", targetPortId: "in", kind: "data" }] }, registry);
  assert.equal(result.kind, "rejected");
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === "GRAPH_DIMENSION_MISMATCH"));
});

test("FR-01 command v2 validates one grammar and atomically rejects mutating failures", () => {
  assert.equal(validateCommandEnvelopeV2(command()), undefined);
  assert.match(validateCommandEnvelopeV2(command({ kind: "set_value" })), /PascalCase/);
  const project = { value: 0 };
  const result = applyCommandTransactionV2({
    project, projectId: "project-1", projectEpoch: "epoch-1", revision: "0",
    commands: [command({ kind: "MutateThenFail", payload: {} })], registry: commandRegistry(),
    semanticDigest: canonicalDigestV1, checkPrecondition: () => true,
  });
  assert.equal(result.kind, "rejected");
  assert.equal(project.value, 0);
});

test("FR-01 command application rejects shallow custom clones that share authoritative nested objects", () => {
  const result = applyCommandTransactionV2({
    project: { value: 0, nested: { untouched: true } }, projectId: "project-1", projectEpoch: "epoch-1", revision: "0",
    commands: [command()], registry: commandRegistry(), semanticDigest: canonicalDigestV1, checkPrecondition: () => true,
    cloneProject: (project) => ({ ...project }),
  });
  assert.equal(result.kind, "rejected");
  assert.match(result.message, /deeply independent|shares an object reference/i);
});

test("FR-01 command v2 core-generates validated inverses and stale commands require per-command guards", () => {
  const registry = commandRegistry();
  const committed = applyCommandTransactionV2({
    project: { value: 0 }, projectId: "project-1", projectEpoch: "epoch-1", revision: "0",
    commands: [command()], registry, semanticDigest: canonicalDigestV1, checkPrecondition: () => true,
  });
  assert.equal(committed.kind, "committed");
  assert.equal(committed.project.value, 1);
  assert.equal(committed.transaction.inverse[0].kind, "SetValue");
  const stale = applyCommandTransactionV2({
    project: { value: 0 }, projectId: "project-1", projectEpoch: "epoch-1", revision: "2",
    commands: [command({ baseRevision: "1" })], registry, semanticDigest: canonicalDigestV1, checkPrecondition: () => true,
  });
  assert.equal(stale.kind, "rejected");
  assert.equal(stale.code, "PRECONDITION_FAILED");
});

test("FR-01 command coalescing requires one explicit edit session, target set, and write set", () => {
  const a = command();
  assert.equal(canCoalesceSemanticCommandsV2(a, { ...a, commandId: "cmd-2", actor: { ...a.actor, sequence: "2" } }), true);
  assert.equal(canCoalesceSemanticCommandsV2(a, { ...a, commandId: "cmd-2", editSessionId: "gesture-2", actor: { ...a.actor, sequence: "2" } }), false);
});

test("FR-01 looped pattern preflights event budgets and includes long events crossing from prior cycles", () => {
  const pattern = new StaticPattern("loop", [trigger("long", new Rational(3n, 4n), new Rational(2n))], Rational.one());
  const events = pattern.query({ start: Rational.zero(), end: new Rational(1n, 4n) }, { seed: "s", maxEvents: 10 });
  assert.ok(events.some((event) => event.start.equals(new Rational(-5n, 4n))));
  assert.throws(() => pattern.query({ start: Rational.zero(), end: new Rational(100n) }, { seed: "s", maxEvents: 2 }), /limit/);
});

test("FR-01 point events obey half-open interval semantics", () => {
  const point = trigger("p", Rational.one());
  const pattern = new StaticPattern("single", [point]);
  assert.equal(pattern.query({ start: Rational.one(), end: new Rational(2n) }, { seed: "s", maxEvents: 1 }).length, 1);
  assert.equal(pattern.query({ start: Rational.zero(), end: Rational.one() }, { seed: "s", maxEvents: 1 }).length, 0);
});

test("FR-01 derivation publication verifies payload digest and never treats cancellation as freshness", () => {
  const identity = {
    schema: "agl.derivation.identity", schemaVersion: 2, projectEpoch: "epoch", scopeId: "scope", channel: "committed",
    generation: "1", requestId: "req", inputDigest: D0, semanticEnvironmentDigest: D1, evaluatorVersion: "eval-v1",
    operatorCatalogDigest: D2, budgetProfileId: "budget", budgetProfileVersion: 1, cacheNamespace: "cache", workerInstanceId: "worker", attempt: 1,
  };
  const payload = { value: 1 };
  const result = { identity, status: "completed", payload, payloadDigest: canonicalDigestV1(payload), determinismClass: "exact", partial: false };
  const { workerInstanceId, attempt, ...identityWithoutWorker } = identity;
  const desired = { ...identityWithoutWorker, determinismClass: "exact" };
  assert.equal(classifyDerivationResultV2(result, desired).kind, "current");
  assert.equal(classifyDerivationResultV2({ ...result, payload: { value: 2 } }, desired).kind, "discarded");
  assert.equal(classifyDerivationResultV2({ ...result, identity: { ...identity, generation: "0" } }, desired).kind, "cache-only");
  assert.equal(classifyDerivationResultV2({ ...result, determinismClass: "render-only" }, desired).kind, "discarded");
  assert.equal(classifyDerivationResultV2(result, undefined).kind, "discarded");
  assert.throws(() => derivationCacheKeyV2(identity, "render-only"), /not eligible/);
});

test("FR-01 evaluation protocol accepts export/materialization channels and enforces monotonic progress", () => {
  const request = readJson("conformance/fr01/evaluation-request-v2.valid.json");
  request.identity.channel = "materialization";
  assert.deepEqual(validateEvaluationRequestV2(request), []);
  const previous = { requestId: "r", generation: "1", completedWorkUnits: 50, totalWorkUnits: 100, fraction: 0.5 };
  const regressed = { ...previous, completedWorkUnits: 40, fraction: 0.4 };
  assert.ok(validateEvaluationProgressV2(regressed, previous).length > 0);
  assert.equal(cancellationPollRequiredV2(request.budget.cancellationPollWorkUnits, request.budget), true);
});

test("FR-01 selection semantic identity excludes projection details and orphan reactivation is intent-gated", () => {
  const ref = { kind: "event", id: "display-1", generated: { producerNodeId: "node", outputPortId: "out", keySchema: "keys", keyVersion: 1, stableKey: "42" } };
  const projectionA = { semantic: ref, surface: "timeline", projectionPath: "lane/a" };
  const projectionB = { semantic: { ...ref, id: "display-2" }, surface: "canvas", projectionPath: "point/b" };
  assert.equal(semanticSelectionKeyV2(ref), semanticSelectionKeyV2(projectionB.semantic));
  assert.notEqual(selectionProjectionKeyV1(projectionA), selectionProjectionKeyV1(projectionB));
  let state = createSelectionStateV2("1", "timeline");
  state = { ...state, primary: ref, ordered: [ref] };
  const orphaned = orphanGeneratedSelectionV2(state, ref, "identity-disappeared");
  assert.equal(orphaned.orphaned.length, 1);
  assert.equal(reactivateExactOrphanV2({ ...orphaned, intentEpoch: "2" }, ref).ordered.length, 0);
  assert.equal(reactivateExactOrphanV2(orphaned, ref).ordered.length, 1);
});

test("FR-01 source status distinguishes unresolved evidence from missing source", () => {
  const material = { id: "m", name: "Snapshot", kind: "snapshot", source: { producerNodeId: "n", outputPortId: "out", dependencyDigestAtMaterialization: D0, sourceRecipeRef: "recipe" } };
  assert.equal(deriveSourceStatus({ material, sourceExists: true, detached: false }), "unresolved");
  assert.equal(deriveSourceStatus({ material, sourceExists: false, detached: false }), "missing");
  assert.equal(deriveSourceStatus({ material, sourceExists: true, detached: false, currentDependencyDigest: D0 }), "current");
});

test("FR-01 materialization is a hash-guarded atomic commit", () => {
  const preparation = {
    schema: "agl.materialization.preparation", schemaVersion: 2, preparationId: "prep", projectId: "p", projectEpoch: "e",
    source: { producerNodeId: "n", outputPortId: "out", dependencyDigest: D0, sourceRecipeId: "recipe", sourceRecipeDigest: D1, operatorCatalogDigest: D2, semanticEnvironmentDigest: D3, budgetProfileId: "budget", budgetProfileVersion: 1, seedStreamId: "stream" },
    range: { start: { numerator: "0", denominator: "1" }, end: { numerator: "1", denominator: "1" } },
    artifact: { assetId: "asset", contentDigest: D0, mediaType: "application/json", bytes: 10 }, preparedAt: "2026-08-18T00:00:00.000Z",
  };
  const base = { preparation, currentProjectId: "p", currentProjectEpoch: "e", currentDependencyDigest: D0, currentSourceRecipeDigest: D1, currentSemanticEnvironmentDigest: D3, currentOperatorCatalogDigest: D2, currentBudgetProfileId: "budget", currentBudgetProfileVersion: 1, currentSeedStreamId: "stream", actualArtifactDigest: D0, materialId: "m", receiptId: "r", occupiedMaterialIds: new Set(), occupiedReceiptIds: new Set(), committedAt: "2026-08-18T00:00:00.000Z" };
  assert.equal(commitMaterializationV2(base).kind, "committed");
  assert.equal(commitMaterializationV2({ ...base, currentDependencyDigest: D1 }).kind, "rejected");
  assert.equal(commitMaterializationV2({ ...base, actualArtifactDigest: D1 }).kind, "rejected");
});

test("FR-01 package v2 validates paths, actual bytes, links, and undeclared members", () => {
  const manifest = readJson("conformance/fr01/package-manifest-v2.valid.json");
  assert.deepEqual(validatePackageManifestV2(manifest), []);
  const projectBytes = fs.readFileSync(path.join(root, "examples/fr01-minimal.v3.project.json"));
  const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest));
  const validActual = [{ path: "manifest.json", kind: "file", bytes: manifestBytes }, { path: "project.json", kind: "file", bytes: projectBytes, compressedBytes: manifest.members[0].compressedBytes }];
  assert.deepEqual(verifyPackageMembersV2(manifest, validActual), []);
  assert.ok(verifyPackageMembersV2(manifest, [{ path: "manifest.json", kind: "file", bytes: manifestBytes }, { path: "project.json", kind: "symlink" }]).length > 0);
  assert.ok(verifyPackageMembersV2(manifest, [...validActual, { path: "preview/x.png", kind: "file", bytes: new Uint8Array(), compressedBytes: 0 }]).some((issue) => /Undeclared/.test(issue)));
  assert.ok(validateCanonicalPackagePathV2("assets/CON.txt").length > 0);
});

test("FR-01 resolved audio plan and schema fixture share one immutable-plan contract", () => {
  const plan = readJson("conformance/fr01/resolved-audio-plan-v2.valid.json");
  assert.deepEqual(validateResolvedAudioPlanV2(plan), []);
  assert.equal(plan.planDigest, resolvedAudioPlanDigestV2(plan));
  assert.equal("generation" in plan, false);
  assert.equal("activation" in plan, false);
});

test("FR-01 schedule quantizes absolute start/end once rather than rounded duration", () => {
  const plan = readJson("conformance/fr01/resolved-audio-plan-v2.valid.json");
  plan.range.endSeconds = 2;
  plan.events[0].idealStartSeconds = 0.49;
  plan.events[0].idealEndSeconds = 0.51;
  const { planId: _oldId, planDigest: _oldDigest, ...content } = plan;
  const finalized = finalizeResolvedAudioPlanV2(content);
  const scheduled = scheduleResolvedPlanV2(finalized, 10, { schema: "agl.audio.schedule-binding", schemaVersion: 1, contractVersion: "agl-audio-schedule-binding-v1", generation: "2", transportEpoch: "3", timelineAnchorSeconds: 0, effectiveAtBackendSeconds: 0, fadeSeconds: 0 });
  assert.equal(scheduled[0].startFrame, 5);
  assert.equal(scheduled[0].endFrame, 6);
  assert.equal(scheduled[0].durationFrames, 1);
});

test("FR-01 accessibility mirror requires non-drag alternatives, exact value actions, text state, and acyclic hierarchy", () => {
  const mirror = readJson("conformance/fr01/accessibility-mirror-v1.valid.json");
  assert.deepEqual(validateAccessibilityMirrorV1(mirror), []);
  const broken = structuredClone(mirror);
  broken.nodes.push({ id: "child", parentId: "a11y-root", order: 1, surface: "canvas", role: "button", label: "Child", stateText: ["Idle"], draggable: true, actions: [] });
  broken.nodes[0].parentId = "child";
  assert.ok(validateAccessibilityMirrorV1(broken).some((issue) => issue.code === "A11Y_DRAG_ONLY"));
  assert.ok(validateAccessibilityMirrorV1(broken).some((issue) => issue.code === "A11Y_PARENT_CYCLE"));
});

test("FR-01 export manifest binds source state and discloses symbolic losses", () => {
  const manifest = readJson("conformance/fr01/export-manifest-v1.valid.json");
  assert.deepEqual(validateExportManifestV1(manifest), []);
  const midi = structuredClone(manifest);
  midi.exportKind = "midi-smf";
  delete midi.renderPlanDigest; delete midi.output.sampleRate; delete midi.output.channels;
  midi.output.mediaType = "audio/midi";
  midi.source.materialMode = "live-resolved";
  midi.source.sourceRecipeIds = ["recipe"];
  midi.losses = [];
  assert.ok(validateExportManifestV1(midi).some((issue) => /procedural/i.test(issue)));
});

test("FR-01 export artifact verification checks actual bytes, digest, and media type", () => {
  const bytes = new TextEncoder().encode("MThd");
  const manifest = readJson("conformance/fr01/export-manifest-v1.valid.json");
  manifest.output.bytes = bytes.byteLength;
  manifest.output.sha256 = sha256Hex(bytes);
  assert.deepEqual(verifyExportArtifactV1(manifest, bytes, manifest.output.mediaType), []);
  assert.ok(verifyExportArtifactV1(manifest, new Uint8Array([1]), manifest.output.mediaType).some((issue) => /byte count|SHA-256/.test(issue)));
  assert.ok(verifyExportArtifactV1(manifest, bytes, "application/octet-stream").some((issue) => /media type/.test(issue)));
});

test("FR-01 accessibility runtime validation rejects unknown enum values even without JSON Schema", () => {
  const mirror = readJson("conformance/fr01/accessibility-mirror-v1.valid.json");
  mirror.nodes[0].role = "mystery-widget";
  mirror.nodes[0].surface = "unknown-surface";
  mirror.nodes[0].actions.push({ id: "bad-action", kind: "teleport", label: "Bad" });
  const codes = validateAccessibilityMirrorV1(mirror).map((issue) => issue.code);
  assert.ok(codes.includes("A11Y_ROLE_INVALID"));
  assert.ok(codes.includes("A11Y_SURFACE_INVALID"));
  assert.ok(codes.includes("A11Y_ACTION_INVALID"));
});

test("FR-01 claim register validates its contract and class vocabulary", () => {
  const register = readJson("program/claim-register.json");
  assert.deepEqual(validateClaimRegisterV1(register), []);
  const invalid = structuredClone(register);
  invalid.claims[0].class = "asserted-because-pretty";
  assert.ok(validateClaimRegisterV1(invalid).some((issue) => /unknown claim class/i.test(issue)));
  invalid.schemaVersion = 2;
  assert.deepEqual(validateClaimRegisterV1(invalid), ["Unsupported claim-register contract."]);
});

test("FR-01 claim gates require trusted evidence, not caller-supplied strings", () => {
  const register = readJson("program/claim-register.json");
  assert.deepEqual(validateClaimRegisterV1(register), []);
  const claim = register.claims.find((candidate) => candidate.id === "CLAIM-PENROSE-002");
  const use = { claimId: "CLAIM-PENROSE-002", surface: "research-gate", qualificationShown: true, qualificationDigestShown: claimQualificationDigestV1(claim), acceptedGateEvidence: ["EVIDENCE-PENROSE-EXACT-RUNTIME-V1"] };
  assert.equal(evaluateClaimUseV1(register, use).kind, "rejected");
  assert.equal(evaluateClaimUseV1(register, use, { trustedGateEvidence: new Set(use.acceptedGateEvidence) }).kind, "allowed");
  assert.equal(evaluateClaimUseV1(register, { claimId: "CLAIM-PENROSE-003", surface: "help", qualificationShown: true }).kind, "rejected");
});

test("FR-01 Risset analytic closure remains bounded and unsafe ordinals fail deterministically", () => {
  assert.equal(rissetSemanticCycleError(DEFAULT_RISSET_SEMANTICS, 0.1).withinTolerance, true);
  const events = rissetEventTimes(DEFAULT_RISSET_SEMANTICS, { conceptualLayer: 0, sourcePhase: 0, intervalStartSeconds: 0, intervalEndSeconds: 1, maxEvents: 1000 });
  assert.ok(events.length > 0);
  assert.equal(typeof events[0].sourceCycleOrdinal, "string");
  assert.throws(() => rissetEventTimes({ ...DEFAULT_RISSET_SEMANTICS, referenceCyclesPerSecond: Number.MAX_VALUE }, { conceptualLayer: 0, sourcePhase: 0, intervalStartSeconds: 0, intervalEndSeconds: 1, maxEvents: 100 }), /overflow|finite|horizon/i);
});

test("FR-01 Penrose identity is exact, bounded, order-invariant, and rejects invalid topology inputs", () => {
  const configDigest = D0;
  const v1 = canonicalVertexIdV2(configDigest, { n: ["0", "1", "2", "3", "4"] });
  const v2 = canonicalVertexIdV2(configDigest, { n: ["0", "1", "2", "3", "5"] });
  assert.match(v1, /^p3vertex~2~[a-f0-9]{64}$/);
  assert.notEqual(v1, v2);
  const a = canonicalTileIdV2(configDigest, { first: { family: 4, index: "-2" }, second: { family: 1, index: "3" } });
  const b = canonicalTileIdV2(configDigest, { first: { family: 1, index: "3" }, second: { family: 4, index: "-2" } });
  assert.equal(a, b);
  assert.equal(canonicalEdgeIdV2(configDigest, v1, v2), canonicalEdgeIdV2(configDigest, v2, v1));
  assert.throws(() => canonicalVertexIdV2(configDigest, { n: ["0"] }), /five/);
  assert.throws(() => canonicalTileIdV2(configDigest, { first: { family: 1, index: "0" }, second: { family: 1, index: "1" } }), /distinct/);
});

test("FR-01 Penrose certified configuration/query validation and Q(phi) Float64 overflow boundary", () => {
  const configuration = { construction: "de-bruijn-pentagrid-p3", semanticVersion: 1, phase: DEFAULT_PENROSE_PHASE_V1, edgeScale: { numerator: "1", denominator: "1" }, familyBasisConvention: "roots-of-unity-ccw-v1" };
  assert.deepEqual(validatePenroseConfigurationV1(configuration), []);
  assert.deepEqual(validatePenroseQueryV1({ queryId: "q", coreRegion: { kind: "aabb", minX: -1, minY: -1, maxX: 1, maxY: 1 }, haloPolicy: "complete-core-adjacency-v1", maximumTiles: 100 }), []);
  assert.throws(() => new QPhi(10n ** 10000n).toNumber(), /Float64/);
});


test("FR-01 operator semantic digests exclude editorial copy but include execution semantics", () => {
  const base = baseOperator("test.digest", "control.number", "control.number", true);
  const editorial = structuredClone(base);
  editorial.name = "Renamed for UX";
  editorial.description = "New explanatory copy";
  editorial.inputs[0].name = "Readable input";
  editorial.parameters[0].description = "New help text";
  assert.equal(operatorSemanticDigest(base), operatorSemanticDigest(editorial));
  const changed = structuredClone(base);
  changed.parameters[0].maximum = 99;
  assert.notEqual(operatorSemanticDigest(base), operatorSemanticDigest(changed));
});

test("FR-01 graph compilation rejects duplicate semantic edges hidden behind different IDs", () => {
  const registry = new OperatorRegistry();
  const source = baseOperator("test.dup-source", undefined, "pattern.trigger");
  const sink = baseOperator("test.dup-sink", "pattern.trigger", "pattern.trigger", false);
  registry.register(source); registry.register(sink); registry.seal();
  const nodes = [
    { id: "source", type: source.type, version: 1, operatorSemanticDigest: operatorSemanticDigest(source), parameters: {} },
    { id: "sink", type: sink.type, version: 1, operatorSemanticDigest: operatorSemanticDigest(sink), parameters: {} },
  ];
  const edge = { id: "edge-a", kind: "dataflow", sourceNodeId: "source", sourcePortId: "out", targetNodeId: "sink", targetPortId: "in" };
  const result = compileGraphV1({ nodes, connections: [edge, { ...edge, id: "edge-b" }] }, registry);
  assert.equal(result.kind, "rejected");
  assert.ok(result.diagnostics.some((issue) => issue.code === "GRAPH_DUPLICATE_CONNECTION_SEMANTICS"));
});

test("FR-01 command history re-envelopes multi-level undo and redo against monotonic revisions", () => {
  const registry = commandRegistry();
  let project = { value: 0 };
  let revision = "0";
  let history = emptyCommittedHistoryV2();

  const first = applyCommandTransactionV2({
    project, projectId: "project-1", projectEpoch: "epoch-1", revision,
    commands: [command({ commandId: "cmd-a", transactionId: "tx-a", editSessionId: "gesture-a", payload: { value: 1 } })],
    registry, semanticDigest: canonicalDigestV1, checkPrecondition: () => true,
  });
  assert.equal(first.kind, "committed");
  project = first.project; revision = first.transaction.revisionAfter;
  history = recordCommittedHistoryV2(history, first.transaction);

  const second = applyCommandTransactionV2({
    project, projectId: "project-1", projectEpoch: "epoch-1", revision,
    commands: [command({ commandId: "cmd-b", transactionId: "tx-b", editSessionId: "gesture-b", baseRevision: revision, actor: { actorId: "actor-1", sequence: "2" }, payload: { value: 2 } })],
    registry, semanticDigest: canonicalDigestV1, checkPrecondition: () => true,
  });
  assert.equal(second.kind, "committed");
  project = second.project; revision = second.transaction.revisionAfter;
  history = recordCommittedHistoryV2(history, second.transaction);

  const undoSecondCommands = prepareUndoTransactionV2(history, { projectId: "project-1", projectEpoch: "epoch-1", currentRevision: revision, actorId: "history", actorSequenceStart: "100" });
  assert.ok(undoSecondCommands);
  const undoSecond = applyCommandTransactionV2({ project, projectId: "project-1", projectEpoch: "epoch-1", revision, commands: undoSecondCommands, registry, semanticDigest: canonicalDigestV1, checkPrecondition: () => true });
  assert.equal(undoSecond.kind, "committed");
  project = undoSecond.project; revision = undoSecond.transaction.revisionAfter;
  history = recordUndoAppliedV2(history, "tx-b");
  assert.equal(project.value, 1);

  const undoFirstCommands = prepareUndoTransactionV2(history, { projectId: "project-1", projectEpoch: "epoch-1", currentRevision: revision, actorId: "history", actorSequenceStart: "200" });
  assert.ok(undoFirstCommands);
  const undoFirst = applyCommandTransactionV2({ project, projectId: "project-1", projectEpoch: "epoch-1", revision, commands: undoFirstCommands, registry, semanticDigest: canonicalDigestV1, checkPrecondition: () => true });
  assert.equal(undoFirst.kind, "committed");
  project = undoFirst.project; revision = undoFirst.transaction.revisionAfter;
  history = recordUndoAppliedV2(history, "tx-a");
  assert.equal(project.value, 0);
  assert.equal(peekUndoHistoryV2(history), undefined);
  assert.equal(peekRedoHistoryV2(history).transactionId, "tx-a");

  const redoFirstCommands = prepareRedoTransactionV2(history, { projectId: "project-1", projectEpoch: "epoch-1", currentRevision: revision, actorId: "history", actorSequenceStart: "300" });
  assert.ok(redoFirstCommands);
  const redoFirst = applyCommandTransactionV2({ project, projectId: "project-1", projectEpoch: "epoch-1", revision, commands: redoFirstCommands, registry, semanticDigest: canonicalDigestV1, checkPrecondition: () => true });
  assert.equal(redoFirst.kind, "committed");
  project = redoFirst.project;
  history = recordRedoAppliedV2(history, "tx-a");
  assert.equal(project.value, 1);
  assert.equal(peekUndoHistoryV2(history).transactionId, "tx-a");
});

test("FR-01 failed history replay cannot speculatively move undo or redo stacks", () => {
  const registry = commandRegistry();
  const committed = applyCommandTransactionV2({
    project: { value: 0 }, projectId: "project-1", projectEpoch: "epoch-1", revision: "0",
    commands: [command({ commandId: "cmd-history", transactionId: "tx-history" })], registry,
    semanticDigest: canonicalDigestV1, checkPrecondition: () => true,
  });
  assert.equal(committed.kind, "committed");
  const history = recordCommittedHistoryV2(emptyCommittedHistoryV2(), committed.transaction);
  const replay = prepareUndoTransactionV2(history, { projectId: "project-1", projectEpoch: "epoch-1", currentRevision: "1", actorId: "history", actorSequenceStart: "1" });
  const failed = applyCommandTransactionV2({
    project: committed.project, projectId: "project-1", projectEpoch: "epoch-1", revision: "1", commands: replay,
    registry: new CommandRegistryV2(), semanticDigest: canonicalDigestV1, checkPrecondition: () => true,
  });
  assert.equal(failed.kind, "rejected");
  assert.equal(history.undo.length, 1);
  assert.equal(history.redo.length, 0);
});

test("FR-01 profile-numeric derivations cannot alias caches across numerical backends", () => {
  const base = {
    schema: "agl.derivation.identity", schemaVersion: 2, projectEpoch: "epoch", scopeId: "scope", channel: "committed",
    generation: "1", requestId: "req", inputDigest: D0, semanticEnvironmentDigest: D1, evaluatorVersion: "eval-v1",
    operatorCatalogDigest: D2, budgetProfileId: "budget", budgetProfileVersion: 1, numericalProfileId: "fp64-rk4",
    numericalProfileVersion: 1, numericalBackendDigest: D3, cacheNamespace: "cache", workerInstanceId: "worker", attempt: 1,
  };
  const other = { ...base, numericalBackendDigest: canonicalDigestV1("other-backend") };
  assert.notEqual(derivationCacheKeyV2(base, "profile-numeric"), derivationCacheKeyV2(other, "profile-numeric"));
  const missing = { ...base }; delete missing.numericalBackendDigest;
  assert.throws(() => derivationCacheKeyV2(missing, "profile-numeric"), /backend-digest/);
});

test("FR-01 evaluation requests reject negative intervals and unbounded hostile budgets", () => {
  const request = readJson("conformance/fr01/evaluation-request-v2.valid.json");
  const negative = structuredClone(request);
  negative.interval.start = { numerator: "-1", denominator: "1" };
  assert.ok(validateEvaluationRequestV2(negative).some((issue) => /non-negative/.test(issue)));
  const hostile = structuredClone(request);
  hostile.budget.maxEvents = 1_000_001;
  assert.ok(validateEvaluationRequestV2(hostile).some((issue) => /safety ceiling/.test(issue)));
});

test("FR-01 project source recipes are bound to the declared catalog, budget, port, and seed stream", () => {
  const project = readJson("examples/fr01-minimal.v3.project.json");
  project.graph.nodes = [{ id: "node-1", type: "test.source", version: 1, operatorSemanticDigest: D0, parameters: {} }];
  project.sourceRecipes = [{
    id: "recipe-1", producerNodeId: "node-1", outputPortId: "out", dependencyDigest: D1,
    semanticEnvironmentDigest: D2, operatorCatalogDigest: project.compatibility.operatorCatalogDigest,
    budgetProfileId: project.compatibility.budgetProfileId, budgetProfileVersion: project.compatibility.budgetProfileVersion,
    seedStreamId: "project-default", range: { start: { numerator: "0", denominator: "1" }, end: { numerator: "1", denominator: "1" } },
  }];
  assert.deepEqual(validateProject(project), []);
  const recipe = project.sourceRecipes[0];
  const invalidPort = structuredClone(project); invalidPort.sourceRecipes[0].outputPortId = "";
  assert.ok(validateProject(invalidPort).some((issue) => issue.path.includes("outputPortId")));
  const wrongBudget = structuredClone(project); wrongBudget.sourceRecipes[0].budgetProfileId = "other-budget";
  assert.ok(validateProject(wrongBudget).some((issue) => /compatibility contract/.test(issue.message)));
  const wrongCatalog = structuredClone(project); wrongCatalog.sourceRecipes[0].operatorCatalogDigest = D3;
  assert.ok(validateProject(wrongCatalog).some((issue) => /operator catalog/.test(issue.message)));
  assert.ok(recipe.seedStreamId.length > 0);
});

test("FR-01 tempo maps reject a terminal linear segment and remain stable for tiny ramps", () => {
  const invalid = [
    { id: "a", beat: { numerator: "0", denominator: "1" }, bpm: 120, curve: "linear" },
    { id: "b", beat: { numerator: "4", denominator: "1" }, bpm: 120.000000001, curve: "linear" },
  ];
  assert.ok(validateTempoMapV1(invalid).some((issue) => issue.code === "TEMPO_LAST_CURVE_UNUSED"));
  invalid[1].curve = "step";
  const seconds = beatToSecondsV1(new Rational(4n), invalid);
  assert.ok(Number.isFinite(seconds));
  assert.ok(Math.abs(secondsToBeatEstimateV1(seconds, invalid) - 4) < 1e-8);
});

test("FR-01 package verification rejects measured compression bombs even when declarations look valid", () => {
  const manifest = readJson("conformance/fr01/package-manifest-v2.valid.json");
  const projectBytes = fs.readFileSync(path.join(root, "examples/fr01-minimal.v3.project.json"));
  const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest));
  const issues = verifyPackageMembersV2(manifest, [
    { path: "manifest.json", kind: "file", bytes: manifestBytes },
    { path: "project.json", kind: "file", bytes: projectBytes, compressedBytes: 1 },
  ]);
  assert.ok(issues.some((issue) => /compression ratio/.test(issue)));
});

test("FR-01 runtime validators reject malformed and unknown evaluation/rational fields without throwing", () => {
  assert.deepEqual(validateCanonicalRationalWire(undefined), ["Rational wire must be an object."]);
  assert.ok(validateCanonicalRationalWire({ numerator: "1", denominator: "2", hidden: "x" }).some((issue) => /Unknown rational wire field/.test(issue)));

  const request = readJson("conformance/fr01/evaluation-request-v2.valid.json");
  request.unapproved = true;
  request.identity.unapproved = true;
  request.budget.unapproved = true;
  request.interval.start.unapproved = true;
  const issues = validateEvaluationRequestV2(request);
  assert.ok(issues.includes("request:unknown-field:unapproved"));
  assert.ok(issues.includes("identity:identity:unknown-field:unapproved"));
  assert.ok(issues.includes("budget:unknown-field:unapproved"));
  assert.ok(issues.includes("interval.start:unknown-field:unapproved"));
  assert.ok(validateEvaluationRequestV2(null).includes("request:not-object"));
});

test("FR-01 command JSON fixture and runtime validator share canonical field-path and timestamp semantics", () => {
  const fixture = readJson("conformance/fr01/command-v2.valid.json");
  assert.equal(validateCommandEnvelopeV2(fixture), undefined);
  const badWrite = structuredClone(fixture);
  badWrite.writeSet = ["node-1:parameter:gain"];
  assert.match(validateCommandEnvelopeV2(badWrite), /field-path/);
  const badTime = structuredClone(fixture);
  badTime.issuedAt = "2026-08-18T00:00:00Z";
  assert.match(validateCommandEnvelopeV2(badTime), /milliseconds/);
});
