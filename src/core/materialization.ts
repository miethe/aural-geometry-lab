import type { RationalWire } from "./project-schema.js";

export interface GeneratorLineageRef {
  sourceNodeId: string;
  operatorType: string;
  operatorVersion: number;
  projectRevision: number;
  evaluationHash: string;
  seed: string;
  intervalStart: string;
  intervalEnd: string;
}

export interface LiveGeneratedMaterialRef {
  kind: "live-generated";
  sourceNodeId: string;
  evaluationHash: string;
}

export interface FrozenMaterialRef {
  kind: "frozen";
  snapshotId: string;
  lineage: GeneratorLineageRef;
}

export interface ManualMaterialRef {
  kind: "manual";
  clipId: string;
}

export type MaterialRef = LiveGeneratedMaterialRef | FrozenMaterialRef | ManualMaterialRef;

export type MaterialKind =
  | "user-authored"
  | "live-generated"
  | "snapshot"
  | "edited-derivative";

export type SourceStatus =
  | "not-applicable"
  | "current"
  | "changed"
  | "missing"
  | "detached"
  | "unresolved";

export interface MaterialSourceLink {
  readonly producerNodeId: string;
  readonly outputPortId: string;
  readonly sourceRecipeRef: string;
  readonly dependencyDigestAtMaterialization: string;
  readonly parentMaterialId?: string;
}

export interface MaterialRecord {
  readonly id: string;
  readonly kind: MaterialKind;
  readonly name: string;
  readonly source?: MaterialSourceLink;
  readonly payloadRef?: string;
  readonly materializationReceiptId?: string;
}

export function deriveSourceStatus(input: {
  readonly material: MaterialRecord;
  readonly currentDependencyDigest?: string;
  readonly sourceExists: boolean;
  readonly detached: boolean;
}): SourceStatus {
  const { material } = input;
  if (material.kind === "user-authored") return "not-applicable";
  if (input.detached) return "detached";
  if (material.source === undefined || !input.sourceExists) return "missing";
  if (material.kind === "live-generated") return "current";
  if (input.currentDependencyDigest === undefined) return "unresolved";
  return input.currentDependencyDigest === material.source.dependencyDigestAtMaterialization ? "current" : "changed";
}

export type GeneratedEditChoice =
  | "edit-generator"
  | "freeze-region"
  | "materialize-region"
  | "downstream-edit-operator"
  | "fork-generator"
  | "cancel";

export interface GeneratedEditRequest {
  sourceNodeId: string;
  eventId: string;
  regionStart: string;
  regionEnd: string;
  choice: GeneratedEditChoice;
}

export type GeneratedEditResolution =
  | {
      kind: "edit-generator";
      sourceNodeId: string;
      targetEventId: string;
    }
  | {
      kind: "freeze-region";
      sourceNodeId: string;
      regionStart: string;
      regionEnd: string;
      targetEventId: string;
    }
  | {
      kind: "downstream-edit-operator";
      sourceNodeId: string;
      targetEventId: string;
    }
  | {
      kind: "fork-generator";
      sourceNodeId: string;
      targetEventId: string;
    }
  | { kind: "cancelled" };

/** Never resolves to an implicit in-place mutation of a generated projection. */
export function resolveGeneratedEdit(request: GeneratedEditRequest): GeneratedEditResolution {
  switch (request.choice) {
    case "edit-generator":
      return {
        kind: "edit-generator",
        sourceNodeId: request.sourceNodeId,
        targetEventId: request.eventId,
      };
    case "freeze-region":
    case "materialize-region":
      return {
        kind: "freeze-region",
        sourceNodeId: request.sourceNodeId,
        regionStart: request.regionStart,
        regionEnd: request.regionEnd,
        targetEventId: request.eventId,
      };
    case "downstream-edit-operator":
      return {
        kind: "downstream-edit-operator",
        sourceNodeId: request.sourceNodeId,
        targetEventId: request.eventId,
      };
    case "fork-generator":
      return {
        kind: "fork-generator",
        sourceNodeId: request.sourceNodeId,
        targetEventId: request.eventId,
      };
    case "cancel":
      return { kind: "cancelled" };
  }
}

export interface MaterializationPreparation {
  readonly preparationId: string;
  readonly projectEpoch: string;
  readonly source: {
    readonly producerNodeId: string;
    readonly outputPortId: string;
    readonly dependencyDigest: string;
    readonly sourceRecipeRef: string;
  };
  readonly range: {
    readonly start: RationalWire;
    readonly end: RationalWire;
  };
  readonly semanticEnvironmentDigest: string;
  readonly artifact: {
    readonly contentDigest: string;
    readonly assetRef: string;
    readonly mediaType: string;
    readonly bytes: number;
  };
  readonly preparedAt: string;
}

export interface MaterializationReceipt {
  readonly id: string;
  readonly preparationId: string;
  readonly materialId: string;
  readonly projectEpoch: string;
  readonly sourceDependencyDigest: string;
  readonly sourceRecipeRef: string;
  readonly range: {
    readonly start: RationalWire;
    readonly end: RationalWire;
  };
  readonly semanticEnvironmentDigest: string;
  readonly artifactDigest: string;
  readonly assetRef: string;
  readonly committedAt: string;
}

export type MaterializationCommitResult =
  | {
      readonly kind: "committed";
      readonly receipt: MaterializationReceipt;
    }
  | {
      readonly kind: "rejected";
      readonly code: "SOURCE_CHANGED" | "PROJECT_EPOCH_CHANGED" | "INVALID_RANGE";
      readonly message: string;
    };

export function commitMaterialization(input: {
  readonly preparation: MaterializationPreparation;
  readonly currentProjectEpoch: string;
  readonly currentDependencyDigest: string;
  readonly materialId: string;
  readonly receiptId: string;
  readonly committedAt: string;
}): MaterializationCommitResult {
  const { preparation } = input;
  if (preparation.projectEpoch !== input.currentProjectEpoch) {
    return {
      kind: "rejected",
      code: "PROJECT_EPOCH_CHANGED",
      message: "The project epoch changed while materialization was being prepared.",
    };
  }
  if (preparation.source.dependencyDigest !== input.currentDependencyDigest) {
    return {
      kind: "rejected",
      code: "SOURCE_CHANGED",
      message: "The source dependency closure changed; prepare the materialization again.",
    };
  }
  if (compareRationalWire(preparation.range.start, preparation.range.end) >= 0) {
    return {
      kind: "rejected",
      code: "INVALID_RANGE",
      message: "Materialization range must be a non-empty half-open interval.",
    };
  }
  return {
    kind: "committed",
    receipt: {
      id: input.receiptId,
      preparationId: preparation.preparationId,
      materialId: input.materialId,
      projectEpoch: preparation.projectEpoch,
      sourceDependencyDigest: preparation.source.dependencyDigest,
      sourceRecipeRef: preparation.source.sourceRecipeRef,
      range: preparation.range,
      semanticEnvironmentDigest: preparation.semanticEnvironmentDigest,
      artifactDigest: preparation.artifact.contentDigest,
      assetRef: preparation.artifact.assetRef,
      committedAt: input.committedAt,
    },
  };
}

function compareRationalWire(left: RationalWire, right: RationalWire): -1 | 0 | 1 {
  const leftNumerator = BigInt(left.numerator);
  const leftDenominator = BigInt(left.denominator);
  const rightNumerator = BigInt(right.numerator);
  const rightDenominator = BigInt(right.denominator);
  const difference = leftNumerator * rightDenominator - rightNumerator * leftDenominator;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}

import { isCanonicalDigest } from "./canonical.js";
import type { GeneratedIdentityCapability } from "./semantics.js";
import type { GeneratedEventIdentity } from "./events.js";
import { validateCanonicalRationalWire } from "./rational.js";

export interface GeneratedEditRequestV2 {
  readonly sourceNodeId: string;
  readonly target: GeneratedEventIdentity;
  readonly identityCapability: GeneratedIdentityCapability;
  readonly region: { readonly start: RationalWire; readonly end: RationalWire };
  readonly choice: GeneratedEditChoice;
}

export type GeneratedEditResolutionV2 =
  | { readonly kind: "edit-generator"; readonly sourceNodeId: string }
  | { readonly kind: "materialize-region"; readonly sourceNodeId: string; readonly region: GeneratedEditRequestV2["region"] }
  | { readonly kind: "downstream-exception"; readonly sourceNodeId: string; readonly target: GeneratedEventIdentity }
  | { readonly kind: "fork-generator"; readonly sourceNodeId: string }
  | { readonly kind: "unsupported"; readonly reason: string; readonly allowed: readonly GeneratedEditChoice[] }
  | { readonly kind: "cancelled" };

export function resolveGeneratedEditV2(request: GeneratedEditRequestV2): GeneratedEditResolutionV2 {
  if (compareRationalWire(request.region.start, request.region.end) >= 0) {
    return { kind: "unsupported", reason: "Generated edit region must be a non-empty half-open interval.", allowed: ["cancel"] };
  }
  switch (request.choice) {
    case "edit-generator": return { kind: "edit-generator", sourceNodeId: request.sourceNodeId };
    case "freeze-region":
    case "materialize-region": return { kind: "materialize-region", sourceNodeId: request.sourceNodeId, region: request.region };
    case "fork-generator": return { kind: "fork-generator", sourceNodeId: request.sourceNodeId };
    case "downstream-edit-operator":
      if (request.identityCapability.kind === "ephemeral") {
        return {
          kind: "unsupported",
          reason: "This generator does not promise persistent entity correspondence; use a generator edit, fork, or materialization.",
          allowed: ["edit-generator", "fork-generator", "materialize-region", "cancel"],
        };
      }
      if (request.target.keySchema !== request.identityCapability.keySchema || request.target.keyVersion !== request.identityCapability.keyVersion) {
        return {
          kind: "unsupported",
          reason: "Generated target identity does not match the generator's current identity contract.",
          allowed: ["edit-generator", "fork-generator", "materialize-region", "cancel"],
        };
      }
      return { kind: "downstream-exception", sourceNodeId: request.sourceNodeId, target: request.target };
    case "cancel": return { kind: "cancelled" };
  }
}

export interface MaterializationPreparationV2 {
  readonly schema: "agl.materialization.preparation";
  readonly schemaVersion: 2;
  readonly preparationId: string;
  readonly projectId: string;
  readonly projectEpoch: string;
  readonly source: {
    readonly producerNodeId: string;
    readonly outputPortId: string;
    readonly dependencyDigest: string;
    readonly sourceRecipeId: string;
    readonly sourceRecipeDigest: string;
    readonly operatorCatalogDigest: string;
    readonly semanticEnvironmentDigest: string;
    readonly budgetProfileId: string;
    readonly budgetProfileVersion: number;
    readonly seedStreamId: string;
  };
  readonly range: { readonly start: RationalWire; readonly end: RationalWire };
  readonly artifact: {
    readonly assetId: string;
    readonly contentDigest: string;
    readonly mediaType: string;
    readonly bytes: number;
  };
  readonly preparedAt: string;
}

export interface MaterializationReceiptV2 {
  readonly schema: "agl.materialization.receipt";
  readonly schemaVersion: 2;
  readonly id: string;
  readonly preparationId: string;
  readonly projectId: string;
  readonly projectEpoch: string;
  readonly materialId: string;
  readonly sourceRecipeId: string;
  readonly sourceRecipeDigest: string;
  readonly sourceDependencyDigest: string;
  readonly operatorCatalogDigest: string;
  readonly semanticEnvironmentDigest: string;
  readonly budgetProfileId: string;
  readonly budgetProfileVersion: number;
  readonly seedStreamId: string;
  readonly range: { readonly start: RationalWire; readonly end: RationalWire };
  readonly artifactAssetId: string;
  readonly artifactDigest: string;
  readonly committedAt: string;
}

export type MaterializationCommitResultV2 =
  | { readonly kind: "committed"; readonly receipt: MaterializationReceiptV2 }
  | {
      readonly kind: "rejected";
      readonly code:
        | "PROJECT_CHANGED"
        | "SOURCE_CHANGED"
        | "SOURCE_RECIPE_CHANGED"
        | "SEMANTIC_ENVIRONMENT_CHANGED"
        | "OPERATOR_CATALOG_CHANGED"
        | "BUDGET_PROFILE_CHANGED"
        | "SEED_STREAM_CHANGED"
        | "ARTIFACT_INTEGRITY_FAILED"
        | "ID_COLLISION"
        | "INVALID_PREPARATION";
      readonly message: string;
    };

export function commitMaterializationV2(input: {
  readonly preparation: MaterializationPreparationV2;
  readonly currentProjectId: string;
  readonly currentProjectEpoch: string;
  readonly currentDependencyDigest: string;
  readonly currentSourceRecipeDigest: string;
  readonly currentSemanticEnvironmentDigest: string;
  readonly currentOperatorCatalogDigest: string;
  readonly currentBudgetProfileId: string;
  readonly currentBudgetProfileVersion: number;
  readonly currentSeedStreamId: string;
  readonly actualArtifactDigest: string;
  readonly materialId: string;
  readonly receiptId: string;
  readonly occupiedMaterialIds: ReadonlySet<string>;
  readonly occupiedReceiptIds: ReadonlySet<string>;
  readonly committedAt: string;
}): MaterializationCommitResultV2 {
  const p = input.preparation;
  const rationalIssues = [
    ...validateCanonicalRationalWire(p.range.start),
    ...validateCanonicalRationalWire(p.range.end),
  ];
  const structuralIds = [
    p.preparationId, p.projectId, p.projectEpoch, p.source.producerNodeId, p.source.outputPortId,
    p.source.sourceRecipeId, p.source.budgetProfileId, p.source.seedStreamId, p.artifact.assetId,
    input.materialId, input.receiptId,
  ];
  const structuralDigests = [
    p.source.dependencyDigest, p.source.sourceRecipeDigest, p.source.operatorCatalogDigest,
    p.source.semanticEnvironmentDigest, p.artifact.contentDigest, input.actualArtifactDigest,
  ];
  if (
    p.schema !== "agl.materialization.preparation" || p.schemaVersion !== 2 ||
    rationalIssues.length > 0 || compareRationalWire(p.range.start, p.range.end) >= 0 ||
    structuralIds.some((id) => !portableId(id)) || structuralDigests.some((digest) => !isCanonicalDigest(digest)) ||
    !Number.isSafeInteger(p.source.budgetProfileVersion) || p.source.budgetProfileVersion < 1 ||
    !Number.isSafeInteger(p.artifact.bytes) || p.artifact.bytes < 0 || p.artifact.bytes > 1024 * 1024 * 1024 ||
    !/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/.test(p.artifact.mediaType) ||
    !Number.isFinite(Date.parse(p.preparedAt)) || !Number.isFinite(Date.parse(input.committedAt)) ||
    Date.parse(input.committedAt) < Date.parse(p.preparedAt)
  ) {
    return { kind: "rejected", code: "INVALID_PREPARATION", message: "Materialization preparation failed structural, digest, ID, timestamp, media, or range validation." };
  }
  if (p.projectId !== input.currentProjectId || p.projectEpoch !== input.currentProjectEpoch) return { kind: "rejected", code: "PROJECT_CHANGED", message: "Project identity or epoch changed during preparation." };
  if (p.source.dependencyDigest !== input.currentDependencyDigest) return { kind: "rejected", code: "SOURCE_CHANGED", message: "Semantic dependency closure changed during preparation." };
  if (p.source.sourceRecipeDigest !== input.currentSourceRecipeDigest) return { kind: "rejected", code: "SOURCE_RECIPE_CHANGED", message: "Source recipe changed during preparation." };
  if (p.source.semanticEnvironmentDigest !== input.currentSemanticEnvironmentDigest) return { kind: "rejected", code: "SEMANTIC_ENVIRONMENT_CHANGED", message: "Semantic environment changed during preparation." };
  if (p.source.operatorCatalogDigest !== input.currentOperatorCatalogDigest) return { kind: "rejected", code: "OPERATOR_CATALOG_CHANGED", message: "Operator catalog changed during preparation." };
  if (p.source.budgetProfileId !== input.currentBudgetProfileId || p.source.budgetProfileVersion !== input.currentBudgetProfileVersion) return { kind: "rejected", code: "BUDGET_PROFILE_CHANGED", message: "Evaluation budget profile changed during preparation." };
  if (p.source.seedStreamId !== input.currentSeedStreamId) return { kind: "rejected", code: "SEED_STREAM_CHANGED", message: "Deterministic seed stream changed during preparation." };
  if (p.artifact.contentDigest !== input.actualArtifactDigest || !isCanonicalDigest(input.actualArtifactDigest)) return { kind: "rejected", code: "ARTIFACT_INTEGRITY_FAILED", message: "Prepared artifact bytes do not match the declared content digest." };
  if (input.occupiedMaterialIds.has(input.materialId) || input.occupiedReceiptIds.has(input.receiptId)) return { kind: "rejected", code: "ID_COLLISION", message: "Material or receipt ID already exists." };
  return {
    kind: "committed",
    receipt: {
      schema: "agl.materialization.receipt",
      schemaVersion: 2,
      id: input.receiptId,
      preparationId: p.preparationId,
      projectId: p.projectId,
      projectEpoch: p.projectEpoch,
      materialId: input.materialId,
      sourceRecipeId: p.source.sourceRecipeId,
      sourceRecipeDigest: p.source.sourceRecipeDigest,
      sourceDependencyDigest: p.source.dependencyDigest,
      operatorCatalogDigest: p.source.operatorCatalogDigest,
      semanticEnvironmentDigest: p.source.semanticEnvironmentDigest,
      budgetProfileId: p.source.budgetProfileId,
      budgetProfileVersion: p.source.budgetProfileVersion,
      seedStreamId: p.source.seedStreamId,
      range: p.range,
      artifactAssetId: p.artifact.assetId,
      artifactDigest: p.artifact.contentDigest,
      committedAt: input.committedAt,
    },
  };
}

function portableId(value: string): boolean { return /^[A-Za-z0-9][A-Za-z0-9._:~\/-]{0,255}$/.test(value); }
