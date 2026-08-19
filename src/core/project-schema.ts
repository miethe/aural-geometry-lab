import { canonicalDigestV1, compareUtf8, isCanonicalDigest, stableIdV2 } from "./canonical.js";
import { Rational, validateCanonicalRationalWire } from "./rational.js";

export interface RationalWire {
  readonly numerator: string;
  readonly denominator: string;
}

export interface ProjectOperatorNode {
  readonly id: string;
  readonly type: string;
  readonly version: number;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly position: { readonly x: number; readonly y: number };
}

export interface ProjectConnection {
  readonly id: string;
  readonly sourceNodeId: string;
  readonly sourcePortId: string;
  readonly targetNodeId: string;
  readonly targetPortId: string;
}

export interface ProjectTrack {
  readonly id: string;
  readonly name: string;
  readonly kind: "trigger" | "note" | "audio" | "control";
  readonly operatorNodeIds: readonly string[];
  readonly muted: boolean;
  readonly solo: boolean;
  readonly gain: number;
}

/** Prototype schema retained only as a deterministic migration source. */
export interface AuralGeometryProjectV1 {
  readonly schema: "agl.project";
  readonly schemaVersion: 1;
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly modifiedAt: string;
  readonly seed: string;
  readonly tempo: {
    readonly bpm: number;
    readonly numerator: number;
    readonly denominator: number;
  };
  readonly tracks: readonly ProjectTrack[];
  readonly nodes: readonly ProjectOperatorNode[];
  readonly connections: readonly ProjectConnection[];
  readonly activeLab: string;
  readonly labState: Readonly<Record<string, unknown>>;
}

export type ProjectConnectionKind = "dataflow" | "control" | "reference" | "provenance";

export interface ProjectOperatorNodeV2 {
  readonly id: string;
  readonly type: string;
  readonly version: number;
  /** Required for project v3; optional only while reading legacy v2. */
  readonly operatorSemanticDigest?: string;
  readonly parameters: Readonly<Record<string, unknown>>;
}

export interface ProjectConnectionV2 {
  readonly id: string;
  readonly kind: ProjectConnectionKind;
  readonly affectsResult: boolean;
  readonly sourceNodeId: string;
  readonly sourcePortId: string;
  readonly targetNodeId: string;
  readonly targetPortId: string;
}

export interface ProjectOperatorNodeV3 extends ProjectOperatorNodeV2 {
  /** Digest of the versioned operator definition, not instance parameters. */
  readonly operatorSemanticDigest: string;
}

export interface ProjectConnectionV3 {
  readonly id: string;
  readonly kind: ProjectConnectionKind;
  readonly sourceNodeId: string;
  readonly sourcePortId: string;
  readonly targetNodeId: string;
  readonly targetPortId: string;
}

export interface ProjectTrackV2 {
  readonly id: string;
  readonly name: string;
  readonly kind: "trigger" | "note" | "audio" | "control";
  readonly materialIds: readonly string[];
  readonly route: {
    readonly muted: boolean;
    readonly solo: boolean;
    readonly gain: number;
    readonly pan: number;
    readonly voiceId?: string;
  };
}

export interface TempoPointV2 {
  readonly id: string;
  readonly beat: RationalWire;
  readonly bpm: number;
  readonly curve: "step" | "linear";
}

export type ProjectMaterialKind =
  | "user-authored"
  | "live-generated"
  | "snapshot"
  | "edited-derivative";

export interface ProjectMaterialV2 {
  readonly id: string;
  readonly kind: ProjectMaterialKind;
  readonly name: string;
  readonly trackId: string;
  readonly range: { readonly start: RationalWire; readonly end: RationalWire };
  readonly payloadRef?: string;
  readonly source?: {
    readonly producerNodeId: string;
    readonly outputPortId: string;
    readonly dependencyDigest: string;
    readonly sourceRecipeRef: string;
    readonly parentMaterialId?: string;
  };
  readonly materializationReceiptId?: string;
}

export interface ProjectAssetRefV2 {
  readonly id: string;
  readonly sha256: string;
  readonly mediaType: string;
  readonly bytes: number;
  readonly rights: "user-provided" | "bundled" | "generated" | "unknown";
}

export interface ProjectAssetRefV3 {
  readonly id: string;
  readonly digest: string;
  readonly mediaType: string;
  readonly bytes: number;
  readonly rights: "user-provided" | "bundled" | "generated" | "unknown";
}

export interface AuralGeometryProjectV2 {
  readonly schema: "agl.project";
  readonly schemaVersion: 2;
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly modifiedAt: string;
  readonly compatibility: {
    readonly semanticContractVersion: string;
    readonly operatorCatalogVersion: string;
    readonly stableIdVersion: string;
    readonly deterministicGenerationVersion: string;
    readonly budgetProfileId: string;
    readonly numericalProfileId?: string;
  };
  readonly seedContext: {
    readonly algorithm: string;
    readonly algorithmVersion: number;
    readonly encodingVersion: number;
    readonly seed: string;
    readonly defaultStreamId: string;
  };
  readonly meter: { readonly numerator: number; readonly denominator: number };
  readonly tempoMap: readonly TempoPointV2[];
  readonly graph: {
    readonly nodes: readonly ProjectOperatorNodeV2[];
    readonly connections: readonly ProjectConnectionV2[];
  };
  readonly tracks: readonly ProjectTrackV2[];
  readonly materials: readonly ProjectMaterialV2[];
  readonly assets: readonly ProjectAssetRefV2[];
  readonly experiments: Readonly<Record<string, unknown>>;
  readonly presentation?: {
    readonly defaultLab?: string;
    readonly graphLayout?: Readonly<Record<string, { readonly x: number; readonly y: number }>>;
  };
}


export interface ProjectCompatibilityV3 {
  readonly semanticContractVersion: "wave1-fr01-v3";
  readonly canonicalEncodingVersion: "agl-canonical-value-v1";
  readonly canonicalDigestVersion: "sha256-canonical-v1";
  readonly operatorSemanticDigestVersion: "agl-operator-semantic-digest-v2";
  readonly operatorCatalogDigestVersion: "agl-operator-catalog-digest-v2";
  readonly graphCompilerVersion: "agl-graph-compiler-v2";
  readonly operatorCatalogVersion: string;
  readonly operatorCatalogDigest: string;
  readonly stableIdVersion: "agl-stable-id-v2";
  readonly deterministicGenerationVersion: "agl-prng-v2";
  readonly budgetProfileId: string;
  readonly budgetProfileVersion: number;
  readonly commandSchemaVersion: 2;
  readonly resolvedAudioPlanSchemaVersion: 2;
  readonly selectionIdentityVersion: 2;
  readonly packageManifestSchemaVersion: 2;
  readonly tempoResolutionVersion: "agl-tempo-map-v1";
  /** Canonical sorted extension contracts the reader must understand to execute this project. */
  readonly requiredSemanticExtensions: readonly string[];
  readonly numericalProfileId?: string;
}

export interface ProjectSourceRecipeV3 {
  readonly id: string;
  readonly producerNodeId: string;
  readonly outputPortId: string;
  readonly dependencyDigest: string;
  readonly semanticEnvironmentDigest: string;
  readonly operatorCatalogDigest: string;
  readonly budgetProfileId: string;
  readonly budgetProfileVersion: number;
  readonly seedStreamId: string;
  readonly range: { readonly start: RationalWire; readonly end: RationalWire };
  readonly graphSnapshotAssetId?: string;
}

export interface ProjectMaterializationReceiptV3 {
  readonly id: string;
  readonly preparationId: string;
  readonly materialId: string;
  readonly sourceRecipeId: string;
  readonly sourceRecipeDigest: string;
  readonly dependencyDigest: string;
  readonly semanticEnvironmentDigest: string;
  readonly operatorCatalogDigest: string;
  readonly budgetProfileId: string;
  readonly budgetProfileVersion: number;
  readonly seedStreamId: string;
  readonly artifactAssetId: string;
  readonly artifactDigest: string;
  readonly range: { readonly start: RationalWire; readonly end: RationalWire };
  readonly committedAt: string;
}

export interface ProjectMaterialV3 {
  readonly id: string;
  readonly kind: ProjectMaterialKind;
  readonly name: string;
  readonly trackId: string;
  readonly range: { readonly start: RationalWire; readonly end: RationalWire };
  readonly payloadRef?: string;
  readonly payloadAssetId?: string;
  readonly source?: {
    readonly producerNodeId: string;
    readonly outputPortId: string;
    readonly dependencyDigestAtMaterialization: string;
    readonly sourceRecipeId: string;
    readonly sourceRecipeDigestAtMaterialization: string;
    readonly parentMaterialId?: string;
  };
  readonly materializationReceiptId?: string;
}

export interface ProjectExtensionV3 {
  readonly namespace: string;
  readonly schemaVersion: number;
  readonly affectsSemantics: boolean;
  readonly payload: unknown;
}

export interface AuralGeometryProjectV3 {
  readonly schema: "agl.project";
  readonly schemaVersion: 3;
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly modifiedAt: string;
  readonly compatibility: ProjectCompatibilityV3;
  readonly seedContext: {
    readonly algorithm: "agl-mulberry32-named-stream-v2";
    readonly algorithmVersion: 2;
    readonly encodingVersion: 1;
    readonly seed: string;
    readonly defaultStreamId: string;
  };
  readonly meter: { readonly numerator: number; readonly denominator: number };
  readonly tempoMap: readonly TempoPointV2[];
  readonly graph: {
    readonly nodes: readonly ProjectOperatorNodeV3[];
    readonly connections: readonly ProjectConnectionV3[];
  };
  readonly tracks: readonly ProjectTrackV2[];
  readonly materials: readonly ProjectMaterialV3[];
  readonly sourceRecipes: readonly ProjectSourceRecipeV3[];
  readonly materializationReceipts: readonly ProjectMaterializationReceiptV3[];
  readonly assets: readonly ProjectAssetRefV3[];
  readonly extensions: readonly ProjectExtensionV3[];
  readonly presentation?: {
    readonly defaultLab?: string;
    readonly graphLayout?: Readonly<Record<string, { readonly x: number; readonly y: number }>>;
  };
}

export type AuralGeometryProject = AuralGeometryProjectV1 | AuralGeometryProjectV2 | AuralGeometryProjectV3;

export interface ValidationIssue { readonly path: string; readonly message: string }

export interface ProjectValidationLimits {
  readonly maximumNodes: number;
  readonly maximumConnections: number;
  readonly maximumTracks: number;
  readonly maximumMaterials: number;
  readonly maximumAssets: number;
  readonly maximumStringLength: number;
  readonly maximumJsonDepth: number;
  readonly maximumObjectKeys: number;
  readonly maximumArrayLength: number;
}

export const DEFAULT_PROJECT_VALIDATION_LIMITS: ProjectValidationLimits = {
  maximumNodes: 20_000,
  maximumConnections: 100_000,
  maximumTracks: 4_096,
  maximumMaterials: 100_000,
  maximumAssets: 100_000,
  maximumStringLength: 1_000_000,
  maximumJsonDepth: 128,
  maximumObjectKeys: 100_000,
  maximumArrayLength: 1_000_000,
};

export interface MigrationLossV2 {
  readonly code: string;
  readonly severity: "warning" | "blocking";
  readonly message: string;
  readonly preservedAt?: string;
}

export interface MigrationReceipt {
  readonly schema: "agl.project.migration-receipt";
  readonly schemaVersion: 2;
  readonly migrationId: string;
  readonly sourceSchemaVersion: number;
  readonly targetSchemaVersion: number;
  readonly sourceSemanticDigest: string;
  readonly targetSemanticDigest: string;
  readonly sourceBytesDigest?: string;
  readonly appliedMigrations: readonly string[];
  readonly losses: readonly MigrationLossV2[];
  readonly requiresUserReview: boolean;
  readonly migratedAt: string;
}

export function validateProject(
  value: unknown,
  limits: ProjectValidationLimits = DEFAULT_PROJECT_VALIDATION_LIMITS,
): readonly ValidationIssue[] {
  if (!isRecord(value)) return [{ path: "$", message: "Project must be an object." }];
  const hostileIssues = validateJsonSafety(value, limits);
  if (value["schemaVersion"] === 1) return [...hostileIssues, ...validateProjectV1(value)];
  if (value["schemaVersion"] === 2) return [...hostileIssues, ...validateProjectV2(value, limits)];
  if (value["schemaVersion"] === 3) return [...hostileIssues, ...validateProjectV3(value, limits)];
  return [...hostileIssues,
    { path: "$.schema", message: "schema must equal agl.project." },
    { path: "$.schemaVersion", message: "schemaVersion must equal 1, 2, or 3." },
  ];
}

export function migrateProjectV1ToV2(project: AuralGeometryProjectV1): AuralGeometryProjectV2 {
  const graphLayout: Record<string, { readonly x: number; readonly y: number }> = {};
  for (const node of project.nodes) graphLayout[node.id] = { ...node.position };
  return {
    schema: "agl.project",
    schemaVersion: 2,
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    modifiedAt: project.modifiedAt,
    compatibility: {
      semanticContractVersion: "wave1-v1",
      operatorCatalogVersion: "0.3.0",
      stableIdVersion: "agl-stable-id-v1",
      deterministicGenerationVersion: "agl-prng-v1",
      budgetProfileId: "agl-mvp-budget-v1",
    },
    seedContext: {
      algorithm: "agl-prng",
      algorithmVersion: 1,
      encodingVersion: 1,
      seed: project.seed,
      defaultStreamId: "project-default",
    },
    meter: { numerator: project.tempo.numerator, denominator: project.tempo.denominator },
    tempoMap: [{
      id: "tempo-0",
      beat: { numerator: "0", denominator: "1" },
      bpm: project.tempo.bpm,
      curve: "step",
    }],
    graph: {
      nodes: project.nodes.map(({ position: _position, ...node }) => node),
      connections: project.connections.map((connection) => ({
        ...connection,
        kind: "dataflow" as const,
        affectsResult: true,
      })),
    },
    tracks: project.tracks.map((track) => ({
      id: track.id,
      name: track.name,
      kind: track.kind,
      materialIds: [],
      route: { muted: track.muted, solo: track.solo, gain: track.gain, pan: 0 },
    })),
    materials: [],
    assets: [],
    experiments: {
      migratedLabState: project.labState,
      legacyTrackOperatorNodeIds: Object.fromEntries(project.tracks.map((track) => [track.id, track.operatorNodeIds])),
    },
    presentation: { defaultLab: project.activeLab, graphLayout },
  };
}

export function migrateProjectV2ToV3(project: AuralGeometryProjectV2): AuralGeometryProjectV3 {
  const migratedNodes: ProjectOperatorNodeV3[] = project.graph.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    version: node.version,
    operatorSemanticDigest: canonicalDigestV1(["agl-legacy-operator-semantic-reference-v1", node.type, node.version]),
    parameters: node.parameters,
  }));
  const migratedConnections: ProjectConnectionV3[] = project.graph.connections.map((connection) => ({
    id: connection.id,
    kind: connection.kind,
    sourceNodeId: connection.sourceNodeId,
    sourcePortId: connection.sourcePortId,
    targetNodeId: connection.targetNodeId,
    targetPortId: connection.targetPortId,
  }));
  const requiredOperators = migratedNodes
    .map((node) => ({ type: node.type, version: node.version, operatorSemanticDigest: node.operatorSemanticDigest }))
    .sort((a, b) => compareUtf8(a.type, b.type) || a.version - b.version);
  const operatorCatalogDigest = canonicalDigestV1({ requiredOperators });
  const sourceRecipes: ProjectSourceRecipeV3[] = [];
  const materials: ProjectMaterialV3[] = project.materials.map((material) => {
    if (material.source === undefined) {
      return {
        id: material.id,
        kind: material.kind,
        name: material.name,
        trackId: material.trackId,
        range: material.range,
        ...(material.payloadRef === undefined ? {} : { payloadRef: material.payloadRef }),
        ...(material.materializationReceiptId === undefined ? {} : { materializationReceiptId: material.materializationReceiptId }),
      };
    }
    const sourceRecipeId = stableIdV2("recipe", project.id, material.id, material.source.sourceRecipeRef);
    const sourceRecipe: ProjectSourceRecipeV3 = {
      id: sourceRecipeId,
      producerNodeId: material.source.producerNodeId,
      outputPortId: material.source.outputPortId,
      dependencyDigest: normalizeLegacyDigest(material.source.dependencyDigest),
      semanticEnvironmentDigest: canonicalDigestV1({ migratedFrom: "project-v2", materialId: material.id }),
      operatorCatalogDigest,
      budgetProfileId: project.compatibility.budgetProfileId,
      budgetProfileVersion: 1,
      seedStreamId: project.seedContext.defaultStreamId,
      range: material.range,
    };
    sourceRecipes.push(sourceRecipe);
    return {
      id: material.id,
      kind: material.kind,
      name: material.name,
      trackId: material.trackId,
      range: material.range,
      ...(material.payloadRef === undefined ? {} : { payloadRef: material.payloadRef }),
      source: {
        producerNodeId: material.source.producerNodeId,
        outputPortId: material.source.outputPortId,
        dependencyDigestAtMaterialization: normalizeLegacyDigest(material.source.dependencyDigest),
        sourceRecipeId,
        sourceRecipeDigestAtMaterialization: sourceRecipeSemanticDigestV3(sourceRecipe),
        ...(material.source.parentMaterialId === undefined ? {} : { parentMaterialId: material.source.parentMaterialId }),
      },
      ...(material.materializationReceiptId === undefined ? {} : { materializationReceiptId: material.materializationReceiptId }),
    };
  });
  return {
    schema: "agl.project",
    schemaVersion: 3,
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    modifiedAt: project.modifiedAt,
    compatibility: {
      semanticContractVersion: "wave1-fr01-v3",
      canonicalEncodingVersion: "agl-canonical-value-v1",
      canonicalDigestVersion: "sha256-canonical-v1",
      operatorSemanticDigestVersion: "agl-operator-semantic-digest-v2",
      operatorCatalogDigestVersion: "agl-operator-catalog-digest-v2",
      graphCompilerVersion: "agl-graph-compiler-v2",
      operatorCatalogVersion: project.compatibility.operatorCatalogVersion,
      operatorCatalogDigest,
      stableIdVersion: "agl-stable-id-v2",
      deterministicGenerationVersion: "agl-prng-v2",
      budgetProfileId: project.compatibility.budgetProfileId,
      budgetProfileVersion: 1,
      commandSchemaVersion: 2,
      resolvedAudioPlanSchemaVersion: 2,
      selectionIdentityVersion: 2,
      packageManifestSchemaVersion: 2,
      tempoResolutionVersion: "agl-tempo-map-v1",
      requiredSemanticExtensions: ["agl.legacy.project-v2.experiments@v1"],
      ...(project.compatibility.numericalProfileId === undefined
        ? {}
        : { numericalProfileId: project.compatibility.numericalProfileId }),
    },
    seedContext: {
      algorithm: "agl-mulberry32-named-stream-v2",
      algorithmVersion: 2,
      encodingVersion: 1,
      seed: project.seedContext.seed,
      defaultStreamId: project.seedContext.defaultStreamId,
    },
    meter: project.meter,
    tempoMap: project.tempoMap,
    graph: {
      nodes: project.graph.nodes.map((node) => ({
        ...node,
        operatorSemanticDigest: node.operatorSemanticDigest ?? canonicalDigestV1({ legacyOperatorContract: { type: node.type, version: node.version } }),
      })).sort((a, b) => compareUtf8(a.id, b.id)),
      connections: [...project.graph.connections].sort((a, b) => compareUtf8(a.id, b.id)),
    },
    tracks: project.tracks,
    materials,
    sourceRecipes,
    materializationReceipts: [],
    assets: project.assets.map((asset) => ({
      id: asset.id,
      digest: `sha256:${asset.sha256}`,
      mediaType: asset.mediaType,
      bytes: asset.bytes,
      rights: asset.rights,
    })),
    extensions: [{
      namespace: "agl.legacy.project-v2.experiments",
      schemaVersion: 1,
      affectsSemantics: true,
      payload: project.experiments,
    }],
    ...(project.presentation === undefined ? {} : { presentation: project.presentation }),
  };
}

export function migrateProjectToLatest(input: {
  readonly project: AuralGeometryProject;
  readonly migratedAt: string;
  readonly sourceBytesDigest?: string;
}): { readonly project: AuralGeometryProjectV3; readonly receipt: MigrationReceipt } {
  const sourceVersion = input.project.schemaVersion;
  const sourceSemanticDigest = canonicalDigestV1(input.project);
  const appliedMigrations: string[] = [];
  const losses: MigrationLossV2[] = [];
  let current: AuralGeometryProjectV2 | AuralGeometryProjectV3;
  if (input.project.schemaVersion === 1) {
    current = migrateProjectV1ToV2(input.project);
    appliedMigrations.push("agl-project-v1-to-v2");
    losses.push(
      { code: "LEGACY_TRACK_OPERATOR_MEMBERSHIP_PRESERVED_OPAQUELY", severity: "blocking", message: "Project v1 track-to-operator membership cannot be reconstructed as v3 material semantics automatically.", preservedAt: "extensions/agl.legacy.project-v2.experiments" },
      { code: "LEGACY_LAB_STATE_PRESERVED_OPAQUELY", severity: "warning", message: "Project v1 labState is preserved as an opaque semantic extension and requires an explicit lab migration." },
    );
  } else current = input.project;
  let target: AuralGeometryProjectV3;
  if (current.schemaVersion === 2) {
    target = migrateProjectV2ToV3(current);
    appliedMigrations.push("agl-project-v2-to-v3");
    losses.push(
      { code: "LEGACY_OPERATOR_DIGEST_REQUIRES_CATALOG_REBIND", severity: "blocking", message: "Project v2 did not persist authoritative operator semantic digests. Migrated nodes are quarantined until explicitly rebound to a sealed operator catalog." },
      { code: "LEGACY_EXPERIMENTS_PRESERVED_OPAQUELY", severity: "warning", message: "Project v2 experiments are preserved as an opaque semantic extension." },
    );
  } else target = current;
  const targetSemanticDigest = projectSemanticDigestV3(target);
  return {
    project: target,
    receipt: {
      schema: "agl.project.migration-receipt",
      schemaVersion: 2,
      migrationId: stableIdV2("migration", sourceSemanticDigest, targetSemanticDigest, input.migratedAt),
      sourceSchemaVersion: sourceVersion,
      targetSchemaVersion: 3,
      sourceSemanticDigest,
      targetSemanticDigest,
      ...(input.sourceBytesDigest === undefined ? {} : { sourceBytesDigest: input.sourceBytesDigest }),
      appliedMigrations,
      losses,
      requiresUserReview: losses.some((loss) => loss.severity === "blocking"),
      migratedAt: input.migratedAt,
    },
  };
}

export function projectSemanticProjectionV3(project: AuralGeometryProjectV3): unknown {
  return {
    schema: project.schema,
    schemaVersion: project.schemaVersion,
    compatibility: project.compatibility,
    seedContext: project.seedContext,
    meter: project.meter,
    tempoMap: project.tempoMap,
    graph: {
      nodes: [...project.graph.nodes].sort((a, b) => compareUtf8(a.id, b.id)),
      connections: [...project.graph.connections].sort((a, b) => compareUtf8(a.id, b.id)),
    },
    // Names and timestamps are authorship/presentation metadata, not sound or math semantics.
    tracks: project.tracks.map((track) => ({
      id: track.id,
      kind: track.kind,
      materialIds: track.materialIds,
      route: track.route,
    })),
    materials: [...project.materials]
      .sort((a, b) => compareUtf8(a.id, b.id))
      .map(({ name: _name, ...material }) => material),
    sourceRecipes: [...project.sourceRecipes].sort((a, b) => compareUtf8(a.id, b.id)),
    materializationReceipts: [...project.materializationReceipts]
      .sort((a, b) => compareUtf8(a.id, b.id))
      .map(({ committedAt: _committedAt, ...receipt }) => receipt),
    assets: [...project.assets].sort((a, b) => compareUtf8(a.id, b.id)),
    extensions: project.extensions
      .filter((extension) => extension.affectsSemantics)
      .sort((a, b) => compareUtf8(a.namespace, b.namespace) || a.schemaVersion - b.schemaVersion),
  };
}

export function projectSemanticDigestV3(project: AuralGeometryProjectV3): string {
  return canonicalDigestV1(projectSemanticProjectionV3(project));
}

export function sourceRecipeSemanticDigestV3(recipe: ProjectSourceRecipeV3): string {
  return canonicalDigestV1(["agl-source-recipe-v3", recipe]);
}

export function extensionContractIdV3(extension: Pick<ProjectExtensionV3, "namespace" | "schemaVersion">): string {
  return `${extension.namespace}@v${extension.schemaVersion}`;
}

export function checkProjectCompatibilityV3(
  project: AuralGeometryProjectV3,
  supported: {
    readonly operatorCatalogDigests: ReadonlySet<string>;
    readonly semanticExtensions: ReadonlySet<string>;
    readonly budgetProfiles: ReadonlySet<string>;
  },
): readonly string[] {
  const issues: string[] = [];
  if (!supported.operatorCatalogDigests.has(project.compatibility.operatorCatalogDigest)) issues.push("unsupported-operator-catalog");
  if (!supported.budgetProfiles.has(`${project.compatibility.budgetProfileId}@v${project.compatibility.budgetProfileVersion}`)) issues.push("unsupported-budget-profile");
  for (const extension of project.compatibility.requiredSemanticExtensions) if (!supported.semanticExtensions.has(extension)) issues.push(`unsupported-semantic-extension:${extension}`);
  return issues;
}

function validateProjectV1(value: Record<string, unknown>): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  requireLiteral(value, "schema", "agl.project", issues);
  requireLiteral(value, "schemaVersion", 1, issues);
  for (const key of ["id", "name", "createdAt", "modifiedAt", "seed", "activeLab"]) requireString(value, key, issues);
  for (const key of ["tracks", "nodes", "connections"]) requireArray(value, key, issues);
  const tempo = value["tempo"];
  if (!isRecord(tempo)) issues.push({ path: "$.tempo", message: "Tempo must be an object." });
  else {
    validatePositiveFinite(tempo["bpm"], "$.tempo.bpm", issues);
    validatePositiveInteger(tempo["numerator"], "$.tempo.numerator", issues);
    validatePositiveInteger(tempo["denominator"], "$.tempo.denominator", issues);
  }
  if (!isRecord(value["labState"])) issues.push({ path: "$.labState", message: "Lab state must be an object." });
  return issues;
}

function validateProjectV2(value: Record<string, unknown>, limits: ProjectValidationLimits): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  validateCommonProjectHeader(value, 2, issues);
  for (const key of ["compatibility", "seedContext", "meter", "graph", "experiments"] as const) {
    if (!isRecord(value[key])) issues.push({ path: `$.${key}`, message: `${key} must be an object.` });
  }
  for (const key of ["tempoMap", "tracks", "materials", "assets"] as const) requireArray(value, key, issues);
  validateCoreCollections(value, issues, limits, 2);
  return issues;
}

function validateProjectV3(value: Record<string, unknown>, limits: ProjectValidationLimits): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  rejectUnknownKeys(value, ["schema", "schemaVersion", "id", "name", "createdAt", "modifiedAt", "compatibility", "seedContext", "meter", "tempoMap", "graph", "tracks", "materials", "sourceRecipes", "materializationReceipts", "assets", "extensions", "presentation"], "$", issues);
  validateCommonProjectHeader(value, 3, issues);
  for (const key of ["compatibility", "seedContext", "meter", "graph"] as const) {
    if (!isRecord(value[key])) issues.push({ path: `$.${key}`, message: `${key} must be an object.` });
  }
  for (const key of ["tempoMap", "tracks", "materials", "sourceRecipes", "materializationReceipts", "assets", "extensions"] as const) {
    requireArray(value, key, issues);
  }
  validateCoreCollections(value, issues, limits, 3);
  const compatibility = value["compatibility"];
  if (isRecord(compatibility)) {
    rejectUnknownKeys(compatibility, ["semanticContractVersion", "canonicalEncodingVersion", "canonicalDigestVersion", "operatorSemanticDigestVersion", "operatorCatalogDigestVersion", "graphCompilerVersion", "operatorCatalogVersion", "operatorCatalogDigest", "stableIdVersion", "deterministicGenerationVersion", "budgetProfileId", "budgetProfileVersion", "commandSchemaVersion", "resolvedAudioPlanSchemaVersion", "selectionIdentityVersion", "packageManifestSchemaVersion", "tempoResolutionVersion", "requiredSemanticExtensions", "numericalProfileId"], "$.compatibility", issues);
    const literals: Record<string, string | number> = {
      semanticContractVersion: "wave1-fr01-v3",
      canonicalEncodingVersion: "agl-canonical-value-v1",
      canonicalDigestVersion: "sha256-canonical-v1",
      operatorSemanticDigestVersion: "agl-operator-semantic-digest-v2",
      operatorCatalogDigestVersion: "agl-operator-catalog-digest-v2",
      graphCompilerVersion: "agl-graph-compiler-v2",
      stableIdVersion: "agl-stable-id-v2",
      deterministicGenerationVersion: "agl-prng-v2",
      commandSchemaVersion: 2,
      resolvedAudioPlanSchemaVersion: 2,
      selectionIdentityVersion: 2,
      packageManifestSchemaVersion: 2,
      tempoResolutionVersion: "agl-tempo-map-v1",
    };
    for (const [key, literal] of Object.entries(literals)) requireLiteral(compatibility, key, literal, issues, "$.compatibility");
    validateDigest(compatibility["operatorCatalogDigest"], "$.compatibility.operatorCatalogDigest", issues);
    for (const key of ["operatorCatalogVersion", "budgetProfileId"] as const) requireString(compatibility, key, issues, "$.compatibility");
    validatePositiveInteger(compatibility["budgetProfileVersion"], "$.compatibility.budgetProfileVersion", issues);
    validateCanonicalExtensionContractSet(compatibility["requiredSemanticExtensions"], "$.compatibility.requiredSemanticExtensions", issues);
  }
  const seedContext = value["seedContext"];
  if (isRecord(seedContext)) {
    rejectUnknownKeys(seedContext, ["algorithm", "algorithmVersion", "encodingVersion", "seed", "defaultStreamId"], "$.seedContext", issues);
    requireLiteral(seedContext, "algorithm", "agl-mulberry32-named-stream-v2", issues, "$.seedContext");
    requireLiteral(seedContext, "algorithmVersion", 2, issues, "$.seedContext");
    requireLiteral(seedContext, "encodingVersion", 1, issues, "$.seedContext");
    requireString(seedContext, "seed", issues, "$.seedContext");
    requireString(seedContext, "defaultStreamId", issues, "$.seedContext");
  }
  const presentation = value["presentation"];
  if (presentation !== undefined) {
    if (!isRecord(presentation)) issues.push({ path: "$.presentation", message: "presentation must be an object." });
    else {
      rejectUnknownKeys(presentation, ["defaultLab", "graphLayout"], "$.presentation", issues);
      const graphLayout = presentation["graphLayout"];
      if (graphLayout !== undefined) {
        if (!isRecord(graphLayout)) issues.push({ path: "$.presentation.graphLayout", message: "graphLayout must be an object." });
        else for (const [nodeId, position] of Object.entries(graphLayout)) {
          if (!isRecord(position)) issues.push({ path: `$.presentation.graphLayout.${nodeId}`, message: "Graph position must be an object." });
          else {
            rejectUnknownKeys(position, ["x", "y"], `$.presentation.graphLayout.${nodeId}`, issues);
            if (typeof position["x"] !== "number" || !Number.isFinite(position["x"]) || typeof position["y"] !== "number" || !Number.isFinite(position["y"])) issues.push({ path: `$.presentation.graphLayout.${nodeId}`, message: "Graph position x/y must be finite numbers." });
          }
        }
      }
    }
  }
  if (isRecord(presentation) && isRecord(presentation["graphLayout"]) && isRecord(value["graph"]) && Array.isArray(value["graph"]["nodes"])) {
    const nodeIds = new Set(value["graph"]["nodes"].filter(isRecord).map((node) => node["id"]).filter((id): id is string => typeof id === "string"));
    for (const nodeId of Object.keys(presentation["graphLayout"])) if (!nodeIds.has(nodeId)) issues.push({ path: `$.presentation.graphLayout.${nodeId}`, message: "Graph layout references an unknown node." });
  }
  validateV3SourceAndReceiptCollections(value, issues);
  return issues;
}

function validateCommonProjectHeader(value: Record<string, unknown>, version: number, issues: ValidationIssue[]): void {
  requireLiteral(value, "schema", "agl.project", issues);
  requireLiteral(value, "schemaVersion", version, issues);
  requirePortableId(value["id"], "$.id", issues);
  requireString(value, "name", issues);
  validateIsoDate(value["createdAt"], "$.createdAt", issues);
  validateIsoDate(value["modifiedAt"], "$.modifiedAt", issues);
  if (typeof value["createdAt"] === "string" && typeof value["modifiedAt"] === "string" && !Number.isNaN(Date.parse(value["createdAt"])) && !Number.isNaN(Date.parse(value["modifiedAt"])) && Date.parse(value["modifiedAt"]) < Date.parse(value["createdAt"])) issues.push({ path: "$.modifiedAt", message: "modifiedAt cannot precede createdAt." });
}

function validateCoreCollections(
  value: Record<string, unknown>,
  issues: ValidationIssue[],
  limits: ProjectValidationLimits,
  version: 2 | 3,
): void {
  const graph = value["graph"];
  const nodeIds = new Set<string>();
  const connectionIds = new Set<string>();
  if (isRecord(graph)) {
    rejectUnknownKeys(graph, ["nodes", "connections"], "$.graph", issues);
    const nodes = graph["nodes"];
    const connections = graph["connections"];
    if (!Array.isArray(nodes)) issues.push({ path: "$.graph.nodes", message: "nodes must be an array." });
    else {
      if (nodes.length > limits.maximumNodes) issues.push({ path: "$.graph.nodes", message: "Node count exceeds limit." });
      for (const [index, node] of nodes.entries()) {
        const path = `$.graph.nodes[${index}]`;
        if (!isRecord(node)) { issues.push({ path, message: "Node must be an object." }); continue; }
        rejectUnknownKeys(node, version === 3 ? ["id", "type", "version", "operatorSemanticDigest", "parameters"] : ["id", "type", "version", "operatorSemanticDigest", "parameters"], path, issues);
        collectUniqueId(node["id"], `${path}.id`, nodeIds, issues);
        requireOperatorType(node["type"], `${path}.type`, issues);
        validatePositiveInteger(node["version"], `${path}.version`, issues);
        if (!isRecord(node["parameters"])) issues.push({ path: `${path}.parameters`, message: "parameters must be an object." });
        if (version === 3) validateDigest(node["operatorSemanticDigest"], `${path}.operatorSemanticDigest`, issues);
      }
    }
    if (!Array.isArray(connections)) issues.push({ path: "$.graph.connections", message: "connections must be an array." });
    else {
      if (connections.length > limits.maximumConnections) issues.push({ path: "$.graph.connections", message: "Connection count exceeds limit." });
      for (const [index, connection] of connections.entries()) {
        const path = `$.graph.connections[${index}]`;
        if (!isRecord(connection)) { issues.push({ path, message: "Connection must be an object." }); continue; }
        rejectUnknownKeys(connection, version === 3 ? ["id", "kind", "sourceNodeId", "sourcePortId", "targetNodeId", "targetPortId"] : ["id", "kind", "affectsResult", "sourceNodeId", "sourcePortId", "targetNodeId", "targetPortId"], path, issues);
        collectUniqueId(connection["id"], `${path}.id`, connectionIds, issues);
        requireEnum(connection["kind"], ["dataflow", "control", "reference", "provenance"], `${path}.kind`, issues);
        if (version === 2 && typeof connection["affectsResult"] !== "boolean") issues.push({ path: `${path}.affectsResult`, message: "affectsResult must be boolean." });
        if (version === 3 && "affectsResult" in connection) issues.push({ path: `${path}.affectsResult`, message: "affectsResult is derived from connection kind in project v3 and must be omitted." });
        for (const key of ["sourceNodeId", "sourcePortId", "targetNodeId", "targetPortId"]) requirePortableId(connection[key], `${path}.${key}`, issues);
        if (typeof connection["sourceNodeId"] === "string" && !nodeIds.has(connection["sourceNodeId"])) issues.push({ path: `${path}.sourceNodeId`, message: "Unknown source node." });
        if (typeof connection["targetNodeId"] === "string" && !nodeIds.has(connection["targetNodeId"])) issues.push({ path: `${path}.targetNodeId`, message: "Unknown target node." });
      }
    }
  }

  const tempoMap = value["tempoMap"];
  if (Array.isArray(tempoMap)) validateTempoMap(tempoMap, issues);
  const meter = value["meter"];
  if (isRecord(meter)) {
    rejectUnknownKeys(meter, ["numerator", "denominator"], "$.meter", issues);
    validatePositiveInteger(meter["numerator"], "$.meter.numerator", issues);
    validatePositiveInteger(meter["denominator"], "$.meter.denominator", issues);
  }

  const trackIds = new Set<string>();
  const materialIds = new Set<string>();
  const materialOwnerByTrackList = new Map<string, string>();
  const tracks = value["tracks"];
  if (Array.isArray(tracks)) {
    if (tracks.length > limits.maximumTracks) issues.push({ path: "$.tracks", message: "Track count exceeds limit." });
    for (const [index, track] of tracks.entries()) {
      const path = `$.tracks[${index}]`;
      if (!isRecord(track)) { issues.push({ path, message: "Track must be an object." }); continue; }
      rejectUnknownKeys(track, ["id", "name", "kind", "materialIds", "route"], path, issues);
      collectUniqueId(track["id"], `${path}.id`, trackIds, issues);
      requireString(track, "name", issues, path);
      requireEnum(track["kind"], ["trigger", "note", "audio", "control"], `${path}.kind`, issues);
      if (!Array.isArray(track["materialIds"])) issues.push({ path: `${path}.materialIds`, message: "materialIds must be an array." });
      const route = track["route"];
      if (!isRecord(route)) issues.push({ path: `${path}.route`, message: "route must be an object." });
      else {
        rejectUnknownKeys(route, ["muted", "solo", "gain", "pan", "voiceId"], `${path}.route`, issues);
        if (typeof route["muted"] !== "boolean" || typeof route["solo"] !== "boolean") issues.push({ path: `${path}.route`, message: "muted and solo must be boolean." });
        validateFiniteRange(route["gain"], 0, 16, `${path}.route.gain`, issues);
        validateFiniteRange(route["pan"], -1, 1, `${path}.route.pan`, issues);
      }
    }
  }

  const materials = value["materials"];
  if (Array.isArray(materials)) {
    if (materials.length > limits.maximumMaterials) issues.push({ path: "$.materials", message: "Material count exceeds limit." });
    for (const [index, material] of materials.entries()) {
      const path = `$.materials[${index}]`;
      if (!isRecord(material)) { issues.push({ path, message: "Material must be an object." }); continue; }
      rejectUnknownKeys(material, version === 3 ? ["id", "kind", "name", "trackId", "range", "payloadRef", "payloadAssetId", "source", "materializationReceiptId"] : ["id", "kind", "name", "trackId", "range", "payloadRef", "source", "materializationReceiptId"], path, issues);
      collectUniqueId(material["id"], `${path}.id`, materialIds, issues);
      requireEnum(material["kind"], ["user-authored", "live-generated", "snapshot", "edited-derivative"], `${path}.kind`, issues);
      requireString(material, "name", issues, path);
      requirePortableId(material["trackId"], `${path}.trackId`, issues);
      validateRationalRange(material["range"], `${path}.range`, issues);
      if (version === 3) {
        const kind = material["kind"];
        const hasSource = isRecord(material["source"]);
        const hasPayload = typeof material["payloadRef"] === "string" || typeof material["payloadAssetId"] === "string";
        const hasReceipt = typeof material["materializationReceiptId"] === "string";
        if (kind === "user-authored") {
          if (hasSource) issues.push({ path: `${path}.source`, message: "User-authored material cannot have a procedural source." });
          if (!hasPayload) issues.push({ path, message: "User-authored material requires an inline or asset payload." });
          if (hasReceipt) issues.push({ path: `${path}.materializationReceiptId`, message: "User-authored material cannot claim a materialization receipt." });
        }
        if (kind === "live-generated") {
          if (!hasSource) issues.push({ path: `${path}.source`, message: "Live-generated material requires source lineage." });
          if (hasPayload || hasReceipt) issues.push({ path, message: "Live-generated material cannot persist a resolved payload or receipt; materialize it explicitly." });
        }
        if (kind === "snapshot") {
          if (!hasSource || !hasPayload || !hasReceipt) issues.push({ path, message: "Snapshot material requires source lineage, a resolved payload, and a materialization receipt." });
        }
        if (kind === "edited-derivative") {
          if (!hasSource || !hasPayload) issues.push({ path, message: "Edited derivative requires source lineage and an authored payload." });
          if (hasSource && typeof (material["source"] as Record<string, unknown>)["parentMaterialId"] !== "string") issues.push({ path: `${path}.source.parentMaterialId`, message: "Edited derivative requires a parent material." });
        }
      }
    }
  }
  if (Array.isArray(tracks)) {
    for (const [index, track] of tracks.entries()) {
      if (!isRecord(track) || !Array.isArray(track["materialIds"])) continue;
      const localMaterialIds = new Set<string>();
      for (const materialId of track["materialIds"]) {
        if (typeof materialId !== "string" || !materialIds.has(materialId)) { issues.push({ path: `$.tracks[${index}].materialIds`, message: `Unknown material ${String(materialId)}.` }); continue; }
        if (localMaterialIds.has(materialId)) issues.push({ path: `$.tracks[${index}].materialIds`, message: `Duplicate material ${materialId} in track.` });
        localMaterialIds.add(materialId);
        const priorOwner = materialOwnerByTrackList.get(materialId);
        if (priorOwner !== undefined && priorOwner !== track["id"]) issues.push({ path: `$.tracks[${index}].materialIds`, message: `Material ${materialId} is listed by multiple tracks.` });
        if (typeof track["id"] === "string") materialOwnerByTrackList.set(materialId, track["id"]);
      }
    }
  }
  if (Array.isArray(materials)) {
    for (const [index, material] of materials.entries()) {
      if (!isRecord(material) || typeof material["trackId"] !== "string") continue;
      if (!trackIds.has(material["trackId"])) issues.push({ path: `$.materials[${index}].trackId`, message: "Unknown track." });
      if (typeof material["id"] === "string") {
        const listedOwner = materialOwnerByTrackList.get(material["id"]);
        if (listedOwner === undefined) issues.push({ path: `$.materials[${index}]`, message: "Material must be listed exactly once by its owning track." });
        else if (listedOwner !== material["trackId"]) issues.push({ path: `$.materials[${index}].trackId`, message: "Material trackId disagrees with track.materialIds ownership." });
      }
    }
  }

  const assetIds = new Set<string>();
  const assets = value["assets"];
  if (Array.isArray(assets)) {
    if (assets.length > limits.maximumAssets) issues.push({ path: "$.assets", message: "Asset count exceeds limit." });
    for (const [index, asset] of assets.entries()) {
      const path = `$.assets[${index}]`;
      if (!isRecord(asset)) { issues.push({ path, message: "Asset must be an object." }); continue; }
      rejectUnknownKeys(asset, version === 3 ? ["id", "digest", "mediaType", "bytes", "rights"] : ["id", "sha256", "mediaType", "bytes", "rights"], path, issues);
      collectUniqueId(asset["id"], `${path}.id`, assetIds, issues);
      if (version === 2) {
        if (typeof asset["sha256"] !== "string" || !/^[a-f0-9]{64}$/.test(asset["sha256"])) issues.push({ path: `${path}.sha256`, message: "Invalid raw SHA-256." });
      } else validateDigest(asset["digest"], `${path}.digest`, issues);
      requireString(asset, "mediaType", issues, path);
      if (!Number.isSafeInteger(asset["bytes"]) || Number(asset["bytes"]) < 0) issues.push({ path: `${path}.bytes`, message: "bytes must be a non-negative safe integer." });
      requireEnum(asset["rights"], ["user-provided", "bundled", "generated", "unknown"], `${path}.rights`, issues);
    }
  }
  if (version === 3 && Array.isArray(materials)) {
    for (const [index, material] of materials.entries()) {
      if (!isRecord(material)) continue;
      const payloadAssetId = material["payloadAssetId"];
      if (typeof payloadAssetId === "string" && !assetIds.has(payloadAssetId)) issues.push({ path: `$.materials[${index}].payloadAssetId`, message: "Unknown payload asset." });
    }
  }
}

function validateV3SourceAndReceiptCollections(value: Record<string, unknown>, issues: ValidationIssue[]): void {
  const compatibility = isRecord(value["compatibility"]) ? value["compatibility"] : undefined;
  const expectedCatalogDigest = compatibility?.["operatorCatalogDigest"];
  const expectedBudgetProfileId = compatibility?.["budgetProfileId"];
  const expectedBudgetProfileVersion = compatibility?.["budgetProfileVersion"];
  const nodeIds = new Set(((value["graph"] as Record<string, unknown> | undefined)?.["nodes"] as unknown[] | undefined)?.flatMap((node) => isRecord(node) && typeof node["id"] === "string" ? [node["id"]] : []) ?? []);
  const materialIds = new Set((Array.isArray(value["materials"]) ? value["materials"] : []).flatMap((material) => isRecord(material) && typeof material["id"] === "string" ? [material["id"]] : []));
  const assetIds = new Set((Array.isArray(value["assets"]) ? value["assets"] : []).flatMap((asset) => isRecord(asset) && typeof asset["id"] === "string" ? [asset["id"]] : []));
  const recipes = value["sourceRecipes"];
  const recipeIds = new Set<string>();
  if (Array.isArray(recipes)) for (const [index, recipe] of recipes.entries()) {
    const path = `$.sourceRecipes[${index}]`;
    if (!isRecord(recipe)) { issues.push({ path, message: "Source recipe must be an object." }); continue; }
    rejectUnknownKeys(recipe, ["id", "producerNodeId", "outputPortId", "dependencyDigest", "semanticEnvironmentDigest", "operatorCatalogDigest", "budgetProfileId", "budgetProfileVersion", "seedStreamId", "range", "graphSnapshotAssetId"], path, issues);
    collectUniqueId(recipe["id"], `${path}.id`, recipeIds, issues);
    for (const key of ["producerNodeId", "outputPortId", "budgetProfileId", "seedStreamId"] as const) requirePortableId(recipe[key], `${path}.${key}`, issues);
    if (typeof recipe["producerNodeId"] === "string" && !nodeIds.has(recipe["producerNodeId"])) issues.push({ path: `${path}.producerNodeId`, message: "Unknown producer node." });
    for (const key of ["dependencyDigest", "semanticEnvironmentDigest", "operatorCatalogDigest"]) validateDigest(recipe[key], `${path}.${key}`, issues);
    validatePositiveInteger(recipe["budgetProfileVersion"], `${path}.budgetProfileVersion`, issues);
    if (expectedCatalogDigest !== undefined && recipe["operatorCatalogDigest"] !== expectedCatalogDigest) issues.push({ path: `${path}.operatorCatalogDigest`, message: "Source recipe operator catalog must match the project compatibility contract." });
    if (expectedBudgetProfileId !== undefined && recipe["budgetProfileId"] !== expectedBudgetProfileId) issues.push({ path: `${path}.budgetProfileId`, message: "Source recipe budget profile ID must match the project compatibility contract." });
    if (expectedBudgetProfileVersion !== undefined && recipe["budgetProfileVersion"] !== expectedBudgetProfileVersion) issues.push({ path: `${path}.budgetProfileVersion`, message: "Source recipe budget profile version must match the project compatibility contract." });
    validateRationalRange(recipe["range"], `${path}.range`, issues);
    if (typeof recipe["graphSnapshotAssetId"] === "string" && !assetIds.has(recipe["graphSnapshotAssetId"])) issues.push({ path: `${path}.graphSnapshotAssetId`, message: "Unknown graph snapshot asset." });
  }
  const receiptIds = new Set<string>();
  const receipts = value["materializationReceipts"];
  if (Array.isArray(receipts)) for (const [index, receipt] of receipts.entries()) {
    const path = `$.materializationReceipts[${index}]`;
    if (!isRecord(receipt)) { issues.push({ path, message: "Receipt must be an object." }); continue; }
    rejectUnknownKeys(receipt, ["id", "preparationId", "materialId", "sourceRecipeId", "sourceRecipeDigest", "dependencyDigest", "semanticEnvironmentDigest", "operatorCatalogDigest", "budgetProfileId", "budgetProfileVersion", "seedStreamId", "artifactAssetId", "artifactDigest", "range", "committedAt"], path, issues);
    collectUniqueId(receipt["id"], `${path}.id`, receiptIds, issues);
    for (const key of ["preparationId", "materialId", "sourceRecipeId", "budgetProfileId", "seedStreamId", "artifactAssetId"]) requirePortableId(receipt[key], `${path}.${key}`, issues);
    if (typeof receipt["materialId"] === "string" && !materialIds.has(receipt["materialId"])) issues.push({ path: `${path}.materialId`, message: "Unknown material." });
    if (typeof receipt["sourceRecipeId"] === "string" && !recipeIds.has(receipt["sourceRecipeId"])) issues.push({ path: `${path}.sourceRecipeId`, message: "Unknown source recipe." });
    if (typeof receipt["artifactAssetId"] === "string" && !assetIds.has(receipt["artifactAssetId"])) issues.push({ path: `${path}.artifactAssetId`, message: "Unknown artifact asset." });
    for (const key of ["sourceRecipeDigest", "dependencyDigest", "semanticEnvironmentDigest", "operatorCatalogDigest", "artifactDigest"]) validateDigest(receipt[key], `${path}.${key}`, issues);
    validatePositiveInteger(receipt["budgetProfileVersion"], `${path}.budgetProfileVersion`, issues);
    validateRationalRange(receipt["range"], `${path}.range`, issues);
    validateIsoDate(receipt["committedAt"], `${path}.committedAt`, issues);
  }
  const materials = value["materials"];
  if (Array.isArray(materials)) for (const [index, material] of materials.entries()) {
    if (!isRecord(material)) continue;
    const path = `$.materials[${index}]`;
    const source = material["source"];
    if (isRecord(source)) {
      rejectUnknownKeys(source, ["producerNodeId", "outputPortId", "dependencyDigestAtMaterialization", "sourceRecipeId", "sourceRecipeDigestAtMaterialization", "parentMaterialId"], `${path}.source`, issues);
      if (typeof source["producerNodeId"] === "string" && !nodeIds.has(source["producerNodeId"])) issues.push({ path: `${path}.source.producerNodeId`, message: "Unknown producer node." });
      if (typeof source["sourceRecipeId"] === "string" && !recipeIds.has(source["sourceRecipeId"])) issues.push({ path: `${path}.source.sourceRecipeId`, message: "Unknown source recipe." });
      validateDigest(source["dependencyDigestAtMaterialization"], `${path}.source.dependencyDigestAtMaterialization`, issues);
      validateDigest(source["sourceRecipeDigestAtMaterialization"], `${path}.source.sourceRecipeDigestAtMaterialization`, issues);
      if (typeof source["parentMaterialId"] === "string" && !materialIds.has(source["parentMaterialId"])) issues.push({ path: `${path}.source.parentMaterialId`, message: "Unknown parent material." });
    }
    if (typeof material["materializationReceiptId"] === "string" && !receiptIds.has(material["materializationReceiptId"])) issues.push({ path: `${path}.materializationReceiptId`, message: "Unknown receipt." });
  }
  // Cross-collection identity is globally unique because command targets use raw semantic IDs.
  const globalIds = new Map<string, string>();
  const collections: Array<[string, unknown]> = [
    ["node", (value["graph"] as Record<string, unknown> | undefined)?.["nodes"]],
    ["connection", (value["graph"] as Record<string, unknown> | undefined)?.["connections"]],
    ["track", value["tracks"]], ["material", value["materials"]], ["source-recipe", value["sourceRecipes"]],
    ["receipt", value["materializationReceipts"]], ["asset", value["assets"]],
  ];
  for (const [kind, collection] of collections) if (Array.isArray(collection)) for (const item of collection) {
    if (!isRecord(item) || typeof item["id"] !== "string") continue;
    const prior = globalIds.get(item["id"]);
    if (prior !== undefined && prior !== kind) issues.push({ path: "$", message: `Semantic ID ${item["id"]} is reused by ${prior} and ${kind}.` });
    else globalIds.set(item["id"], kind);
  }

  // Resolve material → recipe → receipt → artifact consistency rather than merely checking existence.
  const recipeById = new Map<string, Record<string, unknown>>();
  if (Array.isArray(recipes)) for (const recipe of recipes) if (isRecord(recipe) && typeof recipe["id"] === "string") recipeById.set(recipe["id"], recipe);
  const receiptById = new Map<string, Record<string, unknown>>();
  if (Array.isArray(receipts)) for (const receipt of receipts) if (isRecord(receipt) && typeof receipt["id"] === "string") receiptById.set(receipt["id"], receipt);
  const assetById = new Map<string, Record<string, unknown>>();
  const assets = value["assets"];
  if (Array.isArray(assets)) for (const asset of assets) if (isRecord(asset) && typeof asset["id"] === "string") assetById.set(asset["id"], asset);
  if (Array.isArray(materials)) for (const [index, material] of materials.entries()) {
    if (!isRecord(material) || typeof material["id"] !== "string") continue;
    const path = `$.materials[${index}]`;
    const source = isRecord(material["source"]) ? material["source"] : undefined;
    const recipe = source !== undefined && typeof source["sourceRecipeId"] === "string" ? recipeById.get(source["sourceRecipeId"]) : undefined;
    if (source !== undefined && recipe !== undefined) {
      if (source["producerNodeId"] !== recipe["producerNodeId"] || source["outputPortId"] !== recipe["outputPortId"]) issues.push({ path: `${path}.source`, message: "Material source producer/port disagrees with its source recipe." });
      if (source["sourceRecipeDigestAtMaterialization"] !== sourceRecipeSemanticDigestV3(recipe as unknown as ProjectSourceRecipeV3)) issues.push({ path: `${path}.source.sourceRecipeDigestAtMaterialization`, message: "Material source-recipe digest does not match the referenced recipe." });
      if (source["dependencyDigestAtMaterialization"] !== recipe["dependencyDigest"] && material["kind"] === "live-generated") issues.push({ path: `${path}.source.dependencyDigestAtMaterialization`, message: "Current live-generated source digest must match its recipe dependency digest." });
      if (!rationalRangesEqual(material["range"], recipe["range"])) issues.push({ path: `${path}.range`, message: "Material and source-recipe ranges must match." });
    }
    const receipt = typeof material["materializationReceiptId"] === "string" ? receiptById.get(material["materializationReceiptId"]) : undefined;
    if (receipt !== undefined) {
      if (receipt["materialId"] !== material["id"]) issues.push({ path: `${path}.materializationReceiptId`, message: "Receipt materialId does not match material." });
      if (source !== undefined && receipt["sourceRecipeId"] !== source["sourceRecipeId"]) issues.push({ path: `${path}.materializationReceiptId`, message: "Receipt sourceRecipeId does not match material source." });
      if (recipe !== undefined && receipt["sourceRecipeDigest"] !== sourceRecipeSemanticDigestV3(recipe as unknown as ProjectSourceRecipeV3)) issues.push({ path: `${path}.materializationReceiptId`, message: "Receipt sourceRecipeDigest does not match the referenced recipe." });
      if (recipe !== undefined && (receipt["dependencyDigest"] !== recipe["dependencyDigest"] || receipt["semanticEnvironmentDigest"] !== recipe["semanticEnvironmentDigest"] || receipt["operatorCatalogDigest"] !== recipe["operatorCatalogDigest"] || receipt["budgetProfileId"] !== recipe["budgetProfileId"] || receipt["budgetProfileVersion"] !== recipe["budgetProfileVersion"] || receipt["seedStreamId"] !== recipe["seedStreamId"])) issues.push({ path: `${path}.materializationReceiptId`, message: "Receipt semantic environment does not match the referenced source recipe." });
      if (!rationalRangesEqual(material["range"], receipt["range"])) issues.push({ path: `${path}.range`, message: "Material and receipt ranges must match." });
      if (typeof receipt["artifactAssetId"] === "string") {
        const asset = assetById.get(receipt["artifactAssetId"]);
        if (asset !== undefined && asset["digest"] !== receipt["artifactDigest"]) issues.push({ path: `${path}.materializationReceiptId`, message: "Receipt artifact digest does not match the referenced asset." });
        if (material["payloadAssetId"] !== receipt["artifactAssetId"]) issues.push({ path: `${path}.payloadAssetId`, message: "Snapshot payload asset must equal the receipt artifact asset." });
      }
    }
    if (source !== undefined && source["parentMaterialId"] === material["id"]) issues.push({ path: `${path}.source.parentMaterialId`, message: "Material cannot be its own parent." });
  }

  const extensions = value["extensions"];
  const extensionKeys = new Set<string>();
  const semanticExtensionKeys = new Set<string>();
  if (Array.isArray(extensions)) for (const [index, extension] of extensions.entries()) {
    const path = `$.extensions[${index}]`;
    if (!isRecord(extension)) { issues.push({ path, message: "Extension must be an object." }); continue; }
    rejectUnknownKeys(extension, ["namespace", "schemaVersion", "affectsSemantics", "payload"], path, issues);
    requireNamespace(extension["namespace"], `${path}.namespace`, issues);
    validatePositiveInteger(extension["schemaVersion"], `${path}.schemaVersion`, issues);
    if (typeof extension["namespace"] === "string" && Number.isSafeInteger(extension["schemaVersion"])) {
      const key = `${extension["namespace"]}@${String(extension["schemaVersion"])}`;
      if (extensionKeys.has(key)) issues.push({ path, message: `Duplicate extension contract ${key}.` }); else extensionKeys.add(key);
      if (extension["affectsSemantics"] === true) semanticExtensionKeys.add(`${extension["namespace"]}@v${String(extension["schemaVersion"])}`);
    }
    if (typeof extension["affectsSemantics"] !== "boolean") issues.push({ path: `${path}.affectsSemantics`, message: "affectsSemantics must be boolean." });
    if (!("payload" in extension)) issues.push({ path: `${path}.payload`, message: "payload is required." });
  }
  if (compatibility !== undefined && Array.isArray(compatibility["requiredSemanticExtensions"])) {
    const declared = new Set(compatibility["requiredSemanticExtensions"].filter((item): item is string => typeof item === "string"));
    for (const key of semanticExtensionKeys) if (!declared.has(key)) issues.push({ path: "$.compatibility.requiredSemanticExtensions", message: `Semantic extension ${key} is not declared as required.` });
    for (const key of declared) if (!semanticExtensionKeys.has(key)) issues.push({ path: "$.compatibility.requiredSemanticExtensions", message: `Required semantic extension ${key} is not present in the project.` });
  }

  const parentByMaterial = new Map<string, string>();
  if (Array.isArray(materials)) for (const material of materials) if (isRecord(material) && typeof material["id"] === "string" && isRecord(material["source"]) && typeof material["source"]["parentMaterialId"] === "string") parentByMaterial.set(material["id"], material["source"]["parentMaterialId"]);
  for (const materialId of parentByMaterial.keys()) {
    const visiting = new Set<string>();
    let current: string | undefined = materialId;
    while (current !== undefined) {
      if (visiting.has(current)) { issues.push({ path: "$.materials", message: `Material ancestry contains a cycle involving ${current}.` }); break; }
      visiting.add(current);
      current = parentByMaterial.get(current);
    }
  }
}

function validateTempoMap(points: readonly unknown[], issues: ValidationIssue[]): void {
  if (points.length === 0) { issues.push({ path: "$.tempoMap", message: "Tempo map requires at least one point." }); return; }
  const ids = new Set<string>();
  let previousBeat: Rational | undefined;
  for (const [index, point] of points.entries()) {
    const path = `$.tempoMap[${index}]`;
    if (!isRecord(point)) { issues.push({ path, message: "Tempo point must be an object." }); continue; }
    rejectUnknownKeys(point, ["id", "beat", "bpm", "curve"], path, issues);
    collectUniqueId(point["id"], `${path}.id`, ids, issues);
    if (!isRationalWire(point["beat"])) issues.push({ path: `${path}.beat`, message: "Beat must be a canonical rational wire object." });
    else {
      const beat = Rational.fromWire(point["beat"]);
      if (beat.compare(0) < 0) issues.push({ path: `${path}.beat`, message: "Tempo point beat cannot be negative." });
      if (previousBeat !== undefined && beat.compare(previousBeat) <= 0) issues.push({ path: `${path}.beat`, message: "Tempo points must be strictly increasing." });
      previousBeat = beat;
      if (index === 0 && beat.compare(0) !== 0) issues.push({ path: `${path}.beat`, message: "First tempo point must begin at beat zero." });
    }
    validatePositiveFinite(point["bpm"], `${path}.bpm`, issues);
    if (typeof point["bpm"] === "number" && (point["bpm"] < 1e-6 || point["bpm"] > 1_000_000)) issues.push({ path: `${path}.bpm`, message: "BPM must be between 1e-6 and 1,000,000." });
    requireEnum(point["curve"], ["step", "linear"], `${path}.curve`, issues);
    if (index === points.length - 1 && point["curve"] !== "step") issues.push({ path: `${path}.curve`, message: "The last tempo point must use step." });
  }
}

export function isRationalWire(value: unknown): value is RationalWire {
  return isRecord(value) && Object.keys(value).length === 2 && Object.hasOwn(value, "numerator") && Object.hasOwn(value, "denominator") &&
    typeof value["numerator"] === "string" &&
    typeof value["denominator"] === "string" &&
    validateCanonicalRationalWire({ numerator: value["numerator"], denominator: value["denominator"] }).length === 0;
}

function validateRationalRange(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value) || !isRationalWire(value["start"]) || !isRationalWire(value["end"])) {
    issues.push({ path, message: "Range must contain canonical rational start and end." });
    return;
  }
  if (Rational.fromWire(value["end"]).compare(Rational.fromWire(value["start"])) <= 0) issues.push({ path, message: "Range must be a non-empty half-open interval." });
}

function rationalRangesEqual(left: unknown, right: unknown): boolean {
  if (!isRecord(left) || !isRecord(right) || !isRationalWire(left["start"]) || !isRationalWire(left["end"]) || !isRationalWire(right["start"]) || !isRationalWire(right["end"])) return false;
  return Rational.fromWire(left["start"]).equals(Rational.fromWire(right["start"])) && Rational.fromWire(left["end"]).equals(Rational.fromWire(right["end"]));
}

function validateCanonicalExtensionContractSet(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!Array.isArray(value)) { issues.push({ path, message: "requiredSemanticExtensions must be an array." }); return; }
  let previous: string | undefined;
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string" || !/^[a-z0-9]+(?:[.-][a-z0-9]+)*@v[1-9][0-9]*$/.test(item)) { issues.push({ path: `${path}[${index}]`, message: "Invalid semantic extension contract ID." }); continue; }
    if (previous !== undefined && compareUtf8(previous, item) >= 0) issues.push({ path, message: "requiredSemanticExtensions must be unique and sorted by UTF-8 bytes." });
    previous = item;
  }
}

function validateJsonSafety(value: unknown, limits: ProjectValidationLimits): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const stack: Array<{ value: unknown; path: string; depth: number }> = [{ value, path: "$", depth: 0 }];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.depth > limits.maximumJsonDepth) { issues.push({ path: current.path, message: "JSON nesting exceeds limit." }); continue; }
    if (typeof current.value === "string" && current.value.length > limits.maximumStringLength) issues.push({ path: current.path, message: "String exceeds limit." });
    if (typeof current.value === "number" && !Number.isFinite(current.value)) issues.push({ path: current.path, message: "NaN and infinity are forbidden." });
    if (typeof current.value !== "object" || current.value === null) continue;
    if (seen.has(current.value)) { issues.push({ path: current.path, message: "Object graph contains a cycle." }); continue; }
    seen.add(current.value);
    if (Array.isArray(current.value)) {
      if (current.value.length > limits.maximumArrayLength) issues.push({ path: current.path, message: "Array exceeds limit." });
      for (let index = current.value.length - 1; index >= 0; index -= 1) stack.push({ value: current.value[index], path: `${current.path}[${index}]`, depth: current.depth + 1 });
    } else {
      const keys = Object.keys(current.value);
      if (keys.length > limits.maximumObjectKeys) issues.push({ path: current.path, message: "Object key count exceeds limit." });
      for (const key of keys) stack.push({ value: (current.value as Record<string, unknown>)[key], path: `${current.path}.${key}`, depth: current.depth + 1 });
    }
  }
  return issues;
}

function normalizeLegacyDigest(value: string): string {
  return isCanonicalDigest(value) ? value : canonicalDigestV1({ legacyDigest: value });
}

function rejectUnknownKeys(value: Record<string, unknown>, allowed: readonly string[], path: string, issues: ValidationIssue[]): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) if (!allowedSet.has(key)) issues.push({ path: `${path}.${key}`, message: `Unknown field ${key}; use a versioned extension rather than an implicit field.` });
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function requireString(value: Record<string, unknown>, key: string, issues: ValidationIssue[], prefix = "$"): void { if (typeof value[key] !== "string" || value[key] === "") issues.push({ path: `${prefix}.${key}`, message: `${key} must be a non-empty string.` }); }
function requireLiteral(value: Record<string, unknown>, key: string, literal: string | number, issues: ValidationIssue[], prefix = "$"): void { if (value[key] !== literal) issues.push({ path: `${prefix}.${key}`, message: `${key} must equal ${String(literal)}.` }); }
function requireArray(value: Record<string, unknown>, key: string, issues: ValidationIssue[]): void { if (!Array.isArray(value[key])) issues.push({ path: `$.${key}`, message: `${key} must be an array.` }); }
function requireEnum(value: unknown, allowed: readonly string[], path: string, issues: ValidationIssue[]): void { if (typeof value !== "string" || !allowed.includes(value)) issues.push({ path, message: `Expected one of: ${allowed.join(", ")}.` }); }
function requirePortableId(value: unknown, path: string, issues: ValidationIssue[]): void { if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:~\/-]{0,255}$/.test(value)) issues.push({ path, message: "Expected a portable non-empty ID (maximum 256 characters)." }); }
function requireNamespace(value: unknown, path: string, issues: ValidationIssue[]): void { if (typeof value !== "string" || !/^[a-z][a-z0-9]*(?:\.[a-z0-9-]+)+$/.test(value)) issues.push({ path, message: "Expected a reverse-domain-style namespace." }); }
function requireOperatorType(value: unknown, path: string, issues: ValidationIssue[]): void { if (typeof value !== "string" || !/^[a-z][a-z0-9-]*(?:\.[a-z0-9-]+)+$/.test(value)) issues.push({ path, message: "Invalid operator type identifier." }); }
function validatePositiveInteger(value: unknown, path: string, issues: ValidationIssue[]): void { if (!Number.isSafeInteger(value) || Number(value) <= 0) issues.push({ path, message: "Expected a positive safe integer." }); }
function validatePositiveFinite(value: unknown, path: string, issues: ValidationIssue[]): void { if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) issues.push({ path, message: "Expected a positive finite number." }); }
function validateFiniteRange(value: unknown, minimum: number, maximum: number, path: string, issues: ValidationIssue[]): void { if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum) issues.push({ path, message: `Expected a finite number in [${minimum}, ${maximum}].` }); }
function validateDigest(value: unknown, path: string, issues: ValidationIssue[]): void { if (typeof value !== "string" || !isCanonicalDigest(value)) issues.push({ path, message: "Expected sha256:<64 lowercase hex> digest." }); }
function validateIsoDate(value: unknown, path: string, issues: ValidationIssue[]): void { if (typeof value !== "string" || Number.isNaN(Date.parse(value))) issues.push({ path, message: "Expected an ISO-8601 timestamp." }); }
function collectUniqueId(value: unknown, path: string, ids: Set<string>, issues: ValidationIssue[]): void { requirePortableId(value, path, issues); if (typeof value === "string") { if (ids.has(value)) issues.push({ path, message: `Duplicate ID ${value}.` }); ids.add(value); } }
