export type DerivationChannel = "committed" | "preview" | "override" | "export" | "materialization";

export interface DerivationIdentity {
  readonly projectEpoch: string;
  readonly scopeId: string;
  readonly channel: DerivationChannel;
  readonly generation: string;
  readonly inputDigest: string;
  readonly semanticEnvironmentDigest: string;
  readonly requestId: string;
}

export interface DerivationResult<T> {
  readonly identity: DerivationIdentity;
  readonly status: "completed" | "failed" | "cancelled" | "hardCancelled";
  readonly payload?: T;
  readonly payloadDigest?: string;
  readonly deterministic: boolean;
  readonly integrityValid: boolean;
}

export interface DesiredDerivation {
  readonly projectEpoch: string;
  readonly scopeId: string;
  readonly channel: DerivationChannel;
  readonly generation: string;
  readonly inputDigest: string;
  readonly acceptedSemanticEnvironmentDigests: readonly string[];
}

export type DerivationDisposition = "current" | "cache-only" | "discarded";

/**
 * Cancellation is intentionally absent from freshness logic. A result is current
 * only when the semantic identity still matches the desired derivation.
 */
export function classifyDerivationResult<T>(
  result: DerivationResult<T>,
  desired: DesiredDerivation | undefined,
): DerivationDisposition {
  if (!result.integrityValid || result.status !== "completed" || result.payload === undefined) {
    return "discarded";
  }
  if (desired === undefined) {
    return result.deterministic ? "cache-only" : "discarded";
  }
  const identity = result.identity;
  const current =
    identity.projectEpoch === desired.projectEpoch &&
    identity.scopeId === desired.scopeId &&
    identity.channel === desired.channel &&
    identity.generation === desired.generation &&
    identity.inputDigest === desired.inputDigest &&
    desired.acceptedSemanticEnvironmentDigests.includes(identity.semanticEnvironmentDigest);
  if (current) {
    return "current";
  }
  return result.deterministic ? "cache-only" : "discarded";
}

import { canonicalDigestV1, isCanonicalDigest } from "./canonical.js";

export type DerivationDeterminismClassV2 = "exact" | "profile-numeric" | "render-only";

export interface DerivationIdentityV2 {
  readonly schema: "agl.derivation.identity";
  readonly schemaVersion: 2;
  readonly projectEpoch: string;
  readonly scopeId: string;
  readonly channel: DerivationChannel;
  readonly generation: string;
  readonly requestId: string;
  readonly inputDigest: string;
  readonly semanticEnvironmentDigest: string;
  readonly evaluatorVersion: string;
  readonly operatorCatalogDigest: string;
  readonly budgetProfileId: string;
  readonly budgetProfileVersion: number;
  readonly numericalProfileId?: string;
  readonly numericalProfileVersion?: number;
  /** Execution-profile identity for raw floating outputs; required for profile-numeric cache entries. */
  readonly numericalBackendDigest?: string;
  readonly cacheNamespace: string;
  readonly workerInstanceId: string;
  readonly attempt: number;
}

export interface DerivationResultV2<T> {
  readonly identity: DerivationIdentityV2;
  readonly status: "completed" | "failed" | "cancelled" | "hard-cancelled";
  readonly payload?: T;
  readonly payloadDigest?: string;
  readonly determinismClass: DerivationDeterminismClassV2;
  readonly partial: boolean;
}

export interface DesiredDerivationV2 extends Omit<DerivationIdentityV2, "workerInstanceId" | "attempt"> {
  readonly determinismClass: DerivationDeterminismClassV2;
}

export type DerivationDispositionV2 =
  | { readonly kind: "current"; readonly cacheKey?: string }
  | { readonly kind: "cache-only"; readonly cacheKey: string }
  | { readonly kind: "discarded"; readonly reason: string };

/**
 * Correctness is identity/hash gated. Cancellation and worker lifecycle are
 * intentionally absent: both are only resource-control mechanisms.
 */
export function classifyDerivationResultV2<T>(
  result: DerivationResultV2<T>,
  desired: DesiredDerivationV2 | undefined,
  expectedDeterminismClass: DerivationDeterminismClassV2 | undefined = desired?.determinismClass,
): DerivationDispositionV2 {
  if (result.status !== "completed") return { kind: "discarded", reason: `status:${result.status}` };
  if (result.determinismClass !== "exact" && result.determinismClass !== "profile-numeric" && result.determinismClass !== "render-only") return { kind: "discarded", reason: "unknown-determinism-class" };
  if (expectedDeterminismClass === undefined) return { kind: "discarded", reason: "expected-determinism-class-required" };
  if (result.determinismClass !== expectedDeterminismClass) return { kind: "discarded", reason: "determinism-class-mismatch" };
  if (result.determinismClass === "profile-numeric" && result.identity.numericalProfileId === undefined) return { kind: "discarded", reason: "profile-numeric-result-missing-numerical-profile" };
  if (result.partial) return { kind: "discarded", reason: "partial-result-contract-not-supported" };
  if (result.payload === undefined || result.payloadDigest === undefined || !isCanonicalDigest(result.payloadDigest)) {
    return { kind: "discarded", reason: "missing-or-invalid-payload-digest" };
  }
  let actualDigest: string;
  try { actualDigest = canonicalDigestV1(result.payload); }
  catch { return { kind: "discarded", reason: "payload-not-canonical" }; }
  if (actualDigest !== result.payloadDigest) return { kind: "discarded", reason: "payload-integrity-failed" };
  const identityIssues = validateDerivationIdentityForClassV2(result.identity, result.determinismClass);
  if (identityIssues.length > 0) return { kind: "discarded", reason: `invalid-identity:${identityIssues.join("|")}` };
  if (desired !== undefined) {
    const { determinismClass: _desiredClass, ...desiredIdentity } = desired;
    const desiredIssues = validateDerivationIdentityForClassV2(
      { ...desiredIdentity, workerInstanceId: "desired", attempt: 1 },
      desired.determinismClass,
    );
    if (desiredIssues.length > 0) return { kind: "discarded", reason: `invalid-desired-identity:${desiredIssues.join("|")}` };
  }
  const cacheKey = derivationCacheKeyV2(result.identity, result.determinismClass);
  if (desired === undefined) {
    return result.determinismClass === "render-only"
      ? { kind: "discarded", reason: "render-only-result-has-no-current-consumer" }
      : { kind: "cache-only", cacheKey };
  }
  const identity = result.identity;
  const current =
    identity.schema === desired.schema && identity.schemaVersion === desired.schemaVersion &&
    identity.projectEpoch === desired.projectEpoch && identity.scopeId === desired.scopeId &&
    identity.channel === desired.channel && identity.generation === desired.generation &&
    identity.requestId === desired.requestId && identity.inputDigest === desired.inputDigest &&
    identity.semanticEnvironmentDigest === desired.semanticEnvironmentDigest &&
    identity.evaluatorVersion === desired.evaluatorVersion &&
    identity.operatorCatalogDigest === desired.operatorCatalogDigest &&
    identity.budgetProfileId === desired.budgetProfileId &&
    identity.budgetProfileVersion === desired.budgetProfileVersion &&
    identity.numericalProfileId === desired.numericalProfileId &&
    identity.numericalProfileVersion === desired.numericalProfileVersion &&
    identity.numericalBackendDigest === desired.numericalBackendDigest &&
    identity.cacheNamespace === desired.cacheNamespace &&
    result.determinismClass === desired.determinismClass;
  if (current) return result.determinismClass === "render-only" ? { kind: "current" } : { kind: "current", cacheKey };
  return result.determinismClass === "render-only"
    ? { kind: "discarded", reason: "stale-render-only-result" }
    : { kind: "cache-only", cacheKey };
}

export function derivationCacheKeyV2(
  identity: DerivationIdentityV2,
  determinismClass: DerivationDeterminismClassV2,
): string {
  if (determinismClass === "render-only") throw new TypeError("Render-only results are not eligible for the semantic derivation cache.");
  const issues = validateDerivationIdentityForClassV2(identity, determinismClass);
  if (issues.length > 0) throw new TypeError(`Invalid derivation identity: ${issues.join(" ")}`);
  // A lookup key must be computable before evaluation; output payload digests are
  // verified metadata, never part of the request cache key.
  return canonicalDigestV1({
    contract: "agl-derivation-cache-key-v2",
    cacheNamespace: identity.cacheNamespace,
    inputDigest: identity.inputDigest,
    semanticEnvironmentDigest: identity.semanticEnvironmentDigest,
    evaluatorVersion: identity.evaluatorVersion,
    operatorCatalogDigest: identity.operatorCatalogDigest,
    budgetProfileId: identity.budgetProfileId,
    budgetProfileVersion: identity.budgetProfileVersion,
    numericalProfileId: identity.numericalProfileId ?? null,
    numericalProfileVersion: identity.numericalProfileVersion ?? null,
    numericalBackendDigest: identity.numericalBackendDigest ?? null,
    determinismClass,
  });
}

export function validateDerivationIdentityV2(value: unknown): readonly string[] {
  const issues: string[] = [];
  if (!isPlainRecordV2(value)) return ["identity-not-object"];
  const identity = value as Record<string, unknown>;
  rejectUnknownKeysV2(identity, [
    "schema", "schemaVersion", "projectEpoch", "scopeId", "channel", "generation", "requestId",
    "inputDigest", "semanticEnvironmentDigest", "evaluatorVersion", "operatorCatalogDigest",
    "budgetProfileId", "budgetProfileVersion", "numericalProfileId", "numericalProfileVersion",
    "numericalBackendDigest", "cacheNamespace", "workerInstanceId", "attempt",
  ], "identity", issues);
  if (identity.schema !== "agl.derivation.identity" || identity.schemaVersion !== 2) issues.push("unsupported-schema");
  for (const [name, field] of [
    ["projectEpoch", identity.projectEpoch], ["scopeId", identity.scopeId], ["requestId", identity.requestId],
    ["evaluatorVersion", identity.evaluatorVersion], ["budgetProfileId", identity.budgetProfileId],
    ["cacheNamespace", identity.cacheNamespace], ["workerInstanceId", identity.workerInstanceId],
  ] as const) if (typeof field !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:~\/-]{0,255}$/.test(field)) issues.push(`${name}-invalid`);
  if (typeof identity.generation !== "string" || !/^(0|[1-9][0-9]*)$/.test(identity.generation) || identity.generation.length > 4096) issues.push("generation-invalid");
  if (!Number.isSafeInteger(identity.attempt) || (identity.attempt as number) < 1) issues.push("attempt-invalid");
  if (!Number.isSafeInteger(identity.budgetProfileVersion) || (identity.budgetProfileVersion as number) < 1) issues.push("budget-profile-version-invalid");
  if (typeof identity.channel !== "string" || !["committed", "preview", "override", "export", "materialization"].includes(identity.channel)) issues.push("channel-invalid");
  for (const [name, digest] of [["input", identity.inputDigest], ["environment", identity.semanticEnvironmentDigest], ["catalog", identity.operatorCatalogDigest]] as const) if (typeof digest !== "string" || !isCanonicalDigest(digest)) issues.push(`${name}-digest-invalid`);
  if (identity.numericalProfileId !== undefined && (typeof identity.numericalProfileId !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:~\/-]{0,255}$/.test(identity.numericalProfileId))) issues.push("numerical-profile-invalid");
  if (identity.numericalProfileVersion !== undefined && (!Number.isSafeInteger(identity.numericalProfileVersion) || (identity.numericalProfileVersion as number) < 1)) issues.push("numerical-profile-version-invalid");
  if (identity.numericalBackendDigest !== undefined && (typeof identity.numericalBackendDigest !== "string" || !isCanonicalDigest(identity.numericalBackendDigest))) issues.push("numerical-backend-digest-invalid");
  return issues;
}

export function validateDerivationIdentityForClassV2(
  identity: DerivationIdentityV2 | unknown,
  determinismClass: DerivationDeterminismClassV2,
): readonly string[] {
  const issues = [...validateDerivationIdentityV2(identity)];
  if (!isPlainRecordV2(identity)) return issues;
  if (determinismClass !== "exact" && determinismClass !== "profile-numeric" && determinismClass !== "render-only") {
    issues.push("unknown-determinism-class");
    return issues;
  }
  if (determinismClass === "profile-numeric") {
    if (identity.numericalProfileId === undefined) issues.push("profile-numeric-requires-numerical-profile");
    if (identity.numericalProfileVersion === undefined) issues.push("profile-numeric-requires-profile-version");
    if (identity.numericalBackendDigest === undefined) issues.push("profile-numeric-requires-backend-digest");
  } else if (determinismClass === "exact" && (identity.numericalProfileId !== undefined || identity.numericalProfileVersion !== undefined || identity.numericalBackendDigest !== undefined)) {
    issues.push("exact-result-must-not-carry-numerical-backend-identity");
  }
  return issues;
}



function isPlainRecordV2(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function rejectUnknownKeysV2(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  issues: string[],
): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) if (!allowedSet.has(key)) issues.push(`${path}:unknown-field:${key}`);
}
