import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  OperatorRegistry,
  Rational,
  SeededRandom,
  StaticPattern,
  stableId,
  validateProject,
  selectionKey,
  selectOnly,
  toggleSelection,
  resolveGeneratedEdit,
  canCoalesce,
  validateRenderPlan,
  migrateProjectV1ToV2,
  validateMappingPipeline,
  classifyDerivationResult,
  deriveSourceStatus,
  commitMaterialization,
  canCoalesceSemanticCommands,
  beginPreviewSession,
  updatePreviewSession,
  requestPreviewCommit,
  isPreviewNoOp,
  orphanGeneratedSelection,
  reactivateExactOrphan,
  secondsToSampleFrameV1,
  scheduleResolvedPlan,
  validateResolvedAudioPlan,
  validatePackageManifest,
} from "../dist/src/core/index.js";
import {
  automatonDensity,
  createDefaultOperatorRegistry,
  cyclicGapLengths,
  euclideanRhythm,
  generateElementaryAutomaton,
  generateFractalMotif,
  integrateLorenz,
  rissetCycleError,
  rissetLayers,
  tonnetzPitchClass,
  voiceTriad,
  DEFAULT_RISSET_SEMANTICS,
  rissetEventTimes,
  rissetLayerStatesAt,
  rissetSemanticCycleError,
} from "../dist/src/operators/index.js";
import {
  QPhi,
  verifyDefaultPenrosePhaseCertificate,
  canonicalTileId,
  canonicalEdgeId,
} from "../dist/src/geometry/index.js";

test("Rational arithmetic remains exact", () => {
  const third = new Rational(1n, 3n);
  const result = third.add(third).add(third);
  assert.equal(result.toString(), "1");
  assert.equal(new Rational(-3n, -6n).toString(), "1/2");
  assert.equal(Rational.parse("0.125").toString(), "1/8");
});

test("StaticPattern loops without floating-point drift", () => {
  const event = {
    id: "event-a",
    kind: "trigger",
    start: new Rational(1n, 4n),
    duration: new Rational(1n, 8n),
    velocity: 1,
    voice: "click",
    tags: [],
    provenance: [],
  };
  const pattern = new StaticPattern("loop", [event], new Rational(1n));
  const events = pattern.query(
    { start: new Rational(0n), end: new Rational(4n) },
    { seed: "test", maxEvents: 100 },
  );
  assert.deepEqual(events.map((item) => item.start.toString()), ["1/4", "5/4", "9/4", "13/4"]);
});

test("Euclidean rhythms balance cyclic gaps", () => {
  const pattern = euclideanRhythm({ steps: 8, pulses: 3, rotation: 0 });
  assert.equal(pattern.filter(Boolean).length, 3);
  const gaps = cyclicGapLengths(pattern);
  assert.ok(Math.max(...gaps) - Math.min(...gaps) <= 1);
});

test("Risset tempo state closes under layer relabeling", () => {
  const invariant = rissetCycleError({
    layerCount: 7,
    tempoRatio: 2,
    baseBpm: 72,
    envelopeShape: "raised-cosine",
  });
  assert.equal(invariant.withinTolerance, true);
  const layers = rissetLayers({ layerCount: 7, tempoRatio: 2, baseBpm: 72, phase: 0.5 });
  assert.equal(layers.length, 7);
  assert.ok(layers.every((layer) => layer.gain >= 0 && layer.gain <= 1));
});

test("Fractal generation is bounded and deterministic", () => {
  const parameters = { seedDegrees: [0, 2, 5, 7], depth: 3, totalBeats: 8, rootMidi: 48 };
  const first = generateFractalMotif(parameters);
  const second = generateFractalMotif(parameters);
  assert.equal(first.length, 64);
  assert.deepEqual(first, second);
  assert.throws(() => generateFractalMotif({ ...parameters, depth: 7, maxEvents: 100 }));
});

test("Elementary automata reproduce known Rule 90 expansion", () => {
  const grid = generateElementaryAutomaton({ width: 9, generations: 4, rule: 90 });
  assert.equal(grid.length, 4);
  assert.deepEqual(grid[0], [false, false, false, false, true, false, false, false, false]);
  assert.equal(grid[1].filter(Boolean).length, 2);
  assert.ok(automatonDensity(grid[3]) > 0);
});

test("Lorenz integration is deterministic and finite", () => {
  const parameters = { sigma: 10, rho: 28, beta: 8 / 3, timeStep: 0.01, steps: 500, initial: [0.1, 0, 0] };
  const points = integrateLorenz(parameters);
  assert.equal(points.length, 500);
  assert.ok(points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z)));
  assert.deepEqual(points, integrateLorenz(parameters));
});

test("Tonnetz axes encode fifths and major thirds", () => {
  assert.equal(tonnetzPitchClass({ q: 1, r: 0 }, 0), 7);
  assert.equal(tonnetzPitchClass({ q: 0, r: 1 }, 0), 4);
  assert.deepEqual(voiceTriad(0, "major", 60), [60, 64, 67]);
});

test("Project validation reports malformed schema", () => {
  const issues = validateProject({ schema: "wrong", schemaVersion: 2 });
  assert.ok(issues.length >= 8);
  const valid = {
    schema: "agl.project",
    schemaVersion: 1,
    id: "project-1",
    name: "Test",
    createdAt: "2026-08-13T00:00:00Z",
    modifiedAt: "2026-08-13T00:00:00Z",
    seed: "test",
    tempo: { bpm: 120, numerator: 4, denominator: 4 },
    tracks: [],
    nodes: [],
    connections: [],
    activeLab: "infinite-staircase",
    labState: {},
  };
  assert.deepEqual(validateProject(valid), []);
});


test("Rational negative floor and modulo are mathematically consistent", () => {
  const value = new Rational(-7n, 3n);
  assert.equal(value.floor(), -3n);
  assert.equal(value.modulo(2).toString(), "5/3");
});

test("Seeded randomness and stable IDs reproduce exactly", () => {
  const first = new SeededRandom("same-seed");
  const second = new SeededRandom("same-seed");
  assert.deepEqual(
    Array.from({ length: 12 }, () => first.next()),
    Array.from({ length: 12 }, () => second.next()),
  );
  assert.equal(
    stableId("node", { b: 2, a: 1 }, [3, 4]),
    stableId("node", { a: 1, b: 2 }, [3, 4]),
  );
});

test("Euclidean edge cases and rotations are explicit", () => {
  assert.deepEqual(euclideanRhythm({ steps: 4, pulses: 0 }), [false, false, false, false]);
  assert.deepEqual(euclideanRhythm({ steps: 4, pulses: 4 }), [true, true, true, true]);
  const base = euclideanRhythm({ steps: 8, pulses: 3, rotation: 0 });
  const rotated = euclideanRhythm({ steps: 8, pulses: 3, rotation: 9 });
  assert.deepEqual(rotated, [base[7], ...base.slice(0, 7)]);
  assert.throws(() => euclideanRhythm({ steps: 3, pulses: 4 }), RangeError);
});

test("Operator registry is versioned and rejects duplicate semantics", () => {
  const registry = createDefaultOperatorRegistry();
  assert.ok(registry.list().length >= 14);
  assert.equal(registry.get("rhythm.risset", 1).deterministic, true);
  const isolated = new OperatorRegistry();
  const definition = registry.get("rhythm.euclidean", 1);
  isolated.register(definition);
  assert.throws(() => isolated.register(definition), /already registered/);
});

test("Pattern event budgets stop accidental expansion", () => {
  const event = {
    id: "budget-event",
    kind: "trigger",
    start: Rational.zero(),
    duration: new Rational(1n, 16n),
    velocity: 1,
    voice: "click",
    tags: [],
    provenance: [],
  };
  const pattern = new StaticPattern("budget-loop", [event], new Rational(1n, 4n));
  assert.throws(
    () => pattern.query(
      { start: Rational.zero(), end: new Rational(8n) },
      { seed: "budget", maxEvents: 8 },
    ),
    /limit is 8/,
  );
});


test("Cross-surface selection identity is stable and toggle semantics are deterministic", () => {
  const event = { kind: "event", id: "evt:α", projectionPath: "track/1" };
  assert.equal(selectionKey(event), "5:event|6:evt:α|7:track/1");
  const selected = selectOnly(event, "timeline");
  assert.equal(selected.ordered.length, 1);
  const cleared = toggleSelection(selected, event, "canvas");
  assert.equal(cleared.ordered.length, 0);
  const restored = toggleSelection(cleared, event, "graph");
  assert.equal(restored.primary.id, "evt:α");
  assert.equal(restored.changedBy, "graph");
});

test("Generated output cannot resolve to an implicit in-place edit", () => {
  const base = { sourceNodeId: "node-1", eventId: "event-7", regionStart: "4", regionEnd: "8" };
  assert.deepEqual(resolveGeneratedEdit({ ...base, choice: "cancel" }), { kind: "cancelled" });
  assert.equal(resolveGeneratedEdit({ ...base, choice: "freeze-region" }).kind, "freeze-region");
  assert.equal(resolveGeneratedEdit({ ...base, choice: "downstream-edit-operator" }).kind, "downstream-edit-operator");
});

test("Command coalescing requires one explicit transaction and coalescing key", () => {
  const first = { commandType: "set-param", commandVersion: 1, commandId: "1", projectId: "p", expectedRevision: 1, payload: {}, transactionId: "drag-1", coalescingKey: "node:x" };
  const second = { ...first, commandId: "2", expectedRevision: 2 };
  assert.equal(canCoalesce(first, second), true);
  assert.equal(canCoalesce(first, { ...second, transactionId: "drag-2" }), false);
  assert.equal(canCoalesce(first, { ...second, coalescingKey: undefined }), false);
});

test("Render plan contract rejects unsafe event values", () => {
  const plan = {
    schema: "agl.render-plan",
    schemaVersion: 1,
    projectId: "p",
    projectRevision: 3,
    evaluationHash: "hash",
    interval: { startBeat: "0", endBeat: "4", startSeconds: 0, endSeconds: 2 },
    events: [{ kind: "note", id: "n", startSeconds: 0, durationSeconds: 1, midi: 60, cents: 0, velocity: 0.8, voice: "synth" }],
  };
  assert.deepEqual(validateRenderPlan(plan), []);
  assert.ok(validateRenderPlan({ ...plan, events: [{ ...plan.events[0], velocity: 2 }] }).length > 0);
});


test("Project v1 migration produces a valid exact-wire v2 project", () => {
  const legacy = {
    schema: "agl.project",
    schemaVersion: 1,
    id: "legacy-1",
    name: "Legacy",
    createdAt: "2026-08-13T00:00:00Z",
    modifiedAt: "2026-08-13T00:00:00Z",
    seed: "seed",
    tempo: { bpm: 120, numerator: 4, denominator: 4 },
    tracks: [{ id: "t", name: "Track", kind: "trigger", operatorNodeIds: ["n"], muted: false, solo: false, gain: 1 }],
    nodes: [{ id: "n", type: "rhythm.euclidean", version: 1, parameters: {}, position: { x: 10, y: 20 } }],
    connections: [],
    activeLab: "euclidean-rings",
    labState: { rings: 3 },
  };
  const migrated = migrateProjectV1ToV2(legacy);
  assert.equal(migrated.schemaVersion, 2);
  assert.deepEqual(migrated.tempoMap[0].beat, { numerator: "0", denominator: "1" });
  assert.deepEqual(migrated.presentation.graphLayout.n, { x: 10, y: 20 });
  assert.deepEqual(validateProject(migrated), []);
});

test("Mapping compiler rejects acausal stages in live zero-latency mode", () => {
  const dimension = { id: "x", label: "X", valueKind: "scalar", measurement: "ratio", unit: "1", missingPolicy: "error" };
  const diagnostics = validateMappingPipeline([
    {
      operatorInstanceId: "normalize",
      operatorType: "mapping.normalize.percentile",
      operatorVersion: 1,
      stage: "normalize",
      input: dimension,
      output: dimension,
      temporal: { kind: "whole-window", windowRef: "window-1" },
      deterministic: true,
      bypassable: true,
      invariants: { preservesOrder: true },
      parameters: {},
    },
  ], { live: true, declaredLatencySeconds: 0 });
  assert.equal(diagnostics[0].code, "MAPPING_ACAUSAL_LIVE");
});

test("Semantic command coalescing uses one explicit edit session and target/write sets", () => {
  const base = {
    schema: "agl.command",
    schemaVersion: 1,
    commandId: "c1",
    transactionId: "drag-1",
    logicalActionId: "move-nodes",
    projectId: "p",
    projectEpoch: "epoch-1",
    baseRevision: "4",
    actor: { actorId: "local", sequence: "1" },
    origin: "user",
    kind: "MoveEntities",
    payloadVersion: 1,
    payload: {},
    targetSet: ["node-b", "node-a"],
    writeSet: ["node-a.position", "node-b.position"],
    preconditions: [],
  };
  assert.equal(canCoalesceSemanticCommands(base, { ...base, commandId: "c2", targetSet: ["node-a", "node-b"] }), true);
  assert.equal(canCoalesceSemanticCommands(base, { ...base, commandId: "c3", writeSet: ["node-a.position"] }), false);
});

test("Preview lifecycle creates one no-op or one validating transaction", () => {
  const begun = beginPreviewSession({
    sessionId: "s",
    logicalActionId: "set-x",
    projectEpoch: "e",
    targetSet: ["n"],
    writeSet: ["n.x"],
    initialDigest: "same",
    preview: { x: 1 },
  });
  const updated = updatePreviewSession(begun, { x: 2 });
  const validating = requestPreviewCommit(updated, "same");
  assert.equal(validating.kind, "validating");
  assert.equal(isPreviewNoOp(validating), true);
});

test("Async result publication requires epoch, channel, generation, and hashes", () => {
  const identity = {
    projectEpoch: "e1",
    scopeId: "node-1",
    channel: "preview",
    generation: "g2",
    inputDigest: "input",
    semanticEnvironmentDigest: "env",
    requestId: "r",
  };
  const result = { identity, status: "completed", payload: { value: 1 }, deterministic: true, integrityValid: true };
  const desired = {
    projectEpoch: "e1",
    scopeId: "node-1",
    channel: "preview",
    generation: "g2",
    inputDigest: "input",
    acceptedSemanticEnvironmentDigests: ["env"],
  };
  assert.equal(classifyDerivationResult(result, desired), "current");
  assert.equal(classifyDerivationResult(result, { ...desired, generation: "g3" }), "cache-only");
});

test("Material source status is derived from the semantic dependency digest", () => {
  const material = {
    id: "m",
    kind: "snapshot",
    name: "Snapshot",
    source: {
      producerNodeId: "n",
      outputPortId: "out",
      sourceRecipeRef: "recipe",
      dependencyDigestAtMaterialization: "abc",
    },
  };
  assert.equal(deriveSourceStatus({ material, currentDependencyDigest: "abc", sourceExists: true, detached: false }), "current");
  assert.equal(deriveSourceStatus({ material, currentDependencyDigest: "def", sourceExists: true, detached: false }), "changed");
  assert.equal(deriveSourceStatus({ material, sourceExists: false, detached: false }), "missing");
});

test("Materialization commit rejects source drift and accepts an unchanged half-open range", () => {
  const preparation = {
    preparationId: "prep",
    projectEpoch: "epoch",
    source: { producerNodeId: "n", outputPortId: "out", dependencyDigest: "source", sourceRecipeRef: "recipe" },
    range: { start: { numerator: "0", denominator: "1" }, end: { numerator: "4", denominator: "1" } },
    semanticEnvironmentDigest: "env",
    artifact: { contentDigest: "artifact", assetRef: "asset", mediaType: "application/json", bytes: 100 },
    preparedAt: "2026-08-18T00:00:00Z",
  };
  const rejected = commitMaterialization({ preparation, currentProjectEpoch: "epoch", currentDependencyDigest: "changed", materialId: "m", receiptId: "r", committedAt: "2026-08-18T00:01:00Z" });
  assert.equal(rejected.kind, "rejected");
  const committed = commitMaterialization({ preparation, currentProjectEpoch: "epoch", currentDependencyDigest: "source", materialId: "m", receiptId: "r", committedAt: "2026-08-18T00:01:00Z" });
  assert.equal(committed.kind, "committed");
});

test("Generated selection becomes an orphan and only exact identity reactivates", () => {
  const ref = { kind: "event", id: "generated-1", generated: { producerId: "n", outputPortId: "out", keySchema: "event-v1", keyVersion: 1, stableKey: "42" } };
  const selected = { ...selectOnly(ref, "timeline"), intentEpoch: "intent-1" };
  const orphaned = orphanGeneratedSelection(selected, ref, "missing");
  assert.equal(orphaned.ordered.length, 0);
  assert.equal(orphaned.orphaned.length, 1);
  const restored = reactivateExactOrphan(orphaned, ref);
  assert.equal(restored.primary.id, "generated-1");
});

test("Resolved audio plan quantizes absolute times once and validates half-open ranges", () => {
  assert.equal(secondsToSampleFrameV1(0.5 / 48000, 48000), 1);
  const plan = {
    schema: "agl.audio.render-plan",
    schemaVersion: 1,
    planId: "plan",
    planDigest: "digest",
    generation: "1",
    projectId: "p",
    projectEpoch: "e",
    projectSemanticDigest: "project",
    semanticEnvironmentDigest: "env",
    quantizationVersion: "seconds-to-frame-v1",
    range: { startSeconds: 0, endSeconds: 1 },
    voiceDefinitions: [{ id: "tick", version: "1" }],
    assetRefs: [],
    approximations: [],
    events: [{
      kind: "trigger",
      id: "evt",
      trackId: "t",
      voiceId: "tick",
      idealTimeSeconds: 0.25,
      durationSeconds: 0.01,
      temporalOrigin: { kind: "analytic", mappingType: "rhythm.risset", mappingVersion: 1, mappingDigest: "map" },
      priority: "critical",
      latePolicy: "strict-drop",
      cancellationGroup: "track-t",
      provenanceRef: "prov",
      velocity: 1,
    }],
  };
  assert.deepEqual(validateResolvedAudioPlan(plan), []);
  assert.equal(scheduleResolvedPlan(plan, 48000)[0].startFrame, 12000);
});

test("Logical package manifest rejects path traversal and requires authoritative project.json", () => {
  const base = {
    schema: "agl.package.manifest",
    schemaVersion: 1,
    logicalProfile: "agl.logical-package.v1",
    physicalProfile: "agl.portable-archive.v1",
    projectSchemaVersion: 2,
    projectSemanticId: "p",
    saveGeneration: "g",
    projectSemanticDigest: "d",
    members: [{ path: "project.json", sha256: "a".repeat(64), bytes: 10, mediaType: "application/json", authoritative: true }],
    compatibility: { minimumReaderVersion: "0.3.0", requiredOperatorCatalogVersion: "0.3.0" },
  };
  assert.deepEqual(validatePackageManifest(base), []);
  assert.ok(validatePackageManifest({ ...base, members: [{ ...base.members[0], path: "../project.json" }] }).length > 0);
});

test("Normative Risset event times match the DR-01 analytic golden", () => {
  const config = {
    ...DEFAULT_RISSET_SEMANTICS,
    cycleSeconds: 8,
    referenceCyclesPerSecond: 1,
    windowHalfWidth: 2,
  };
  const events = rissetEventTimes(config, {
    conceptualLayer: 0,
    sourcePhase: 0,
    intervalStartSeconds: 0.000001,
    intervalEndSeconds: 8,
    maxEvents: 20,
  });
  const expected = [0.959028565, 1.844445640, 2.666750420, 3.434344603, 4.154056392];
  expected.forEach((value, index) => assert.ok(Math.abs(events[index].timeSeconds - value) < 1e-9));
  assert.equal(rissetSemanticCycleError(config).withinTolerance, true);
});

test("Canonical B=2 linear-partition Risset window sums gains to one", () => {
  const layers = rissetLayerStatesAt({ ...DEFAULT_RISSET_SEMANTICS, initialLogPhase: 0, windowHalfWidth: 2, normalization: "linear-partition" }, 0);
  assert.ok(Math.abs(layers.reduce((sum, layer) => sum + layer.gain, 0) - 1) < 1e-12);
  assert.deepEqual(layers.map((layer) => layer.conceptualIndex), [-1, 0, 1]);
  assert.deepEqual(layers.map((layer) => layer.gain), [0.25, 0.5, 0.25]);
});

test("Q(phi) arithmetic, ordering, floor, and ceiling are exact", () => {
  const phi = QPhi.phi();
  assert.deepEqual(phi.multiply(phi).toJSON(), new QPhi(1n, 1n).toJSON());
  assert.equal(phi.floor(), 1n);
  assert.equal(phi.ceil(), 2n);
  assert.equal(phi.negate().floor(), -2n);
  assert.equal(phi.negate().ceil(), -1n);
  assert.equal(new QPhi(-2n, 1n).sign(), -1); // phi - 2 < 0
  assert.equal(new QPhi(-1n, 1n).sign(), 1);  // phi - 1 > 0
});

test("Default Penrose phase certificate is exact and canonical IDs ignore line ordering", () => {
  assert.equal(verifyDefaultPenrosePhaseCertificate(), true);
  const a = canonicalTileId("cfg", { first: { family: 4, index: "7" }, second: { family: 1, index: "-3" } });
  const b = canonicalTileId("cfg", { first: { family: 1, index: "-3" }, second: { family: 4, index: "7" } });
  assert.equal(a, b);
  assert.equal(canonicalEdgeId("cfg", "v-b", "v-a"), canonicalEdgeId("cfg", "v-a", "v-b"));
});


function readFixture(relative) {
  return JSON.parse(readFileSync(new URL(`../${relative}`, import.meta.url), "utf8"));
}

test("Shared exact-wire rational fixtures match the TypeScript implementation", () => {
  const fixture = readFixture("conformance/wave1/exact-wire-cases.json");
  for (const item of fixture.cases) {
    const rational = new Rational(BigInt(item.input.numerator), BigInt(item.input.denominator));
    assert.deepEqual(rational.toJSON(), item.canonical, item.name);
  }
});

test("Shared audio-frame fixtures match seconds-to-frame-v1", () => {
  const fixture = readFixture("conformance/wave1/audio-frame-cases.json");
  assert.equal(fixture.quantizationVersion, "seconds-to-frame-v1");
  for (const item of fixture.cases) {
    assert.equal(secondsToSampleFrameV1(item.seconds, item.sampleRate), item.expectedFrame);
  }
});

test("Shared material-status fixtures match TypeScript derivation", () => {
  const fixture = readFixture("conformance/wave1/material-status-cases.json");
  for (const item of fixture.cases) {
    const source = item.hasSource ? {
      producerNodeId: "n", outputPortId: "out", sourceRecipeRef: "recipe",
      dependencyDigestAtMaterialization: item.receiptDigest ?? "",
    } : undefined;
    const material = { id: item.name, kind: item.kind, name: item.name, ...(source ? { source } : {}) };
    assert.equal(deriveSourceStatus({
      material,
      currentDependencyDigest: item.currentDigest ?? undefined,
      sourceExists: item.sourceExists,
      detached: item.detached,
    }), item.expected, item.name);
  }
});
