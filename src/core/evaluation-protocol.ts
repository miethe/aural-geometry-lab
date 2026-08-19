import { isSha256Digest } from "./canonical.js";
import { validateDerivationIdentityForClassV2, type DerivationDeterminismClassV2, type DerivationIdentityV2 } from "./derivation.js";
import { Rational, validateCanonicalRationalWire, type RationalWireLike } from "./rational.js";

export const EVALUATION_PROTOCOL_VERSION_V2 = "agl-evaluation-protocol-v2" as const;

export const MAX_EVALUATION_BUDGET_V2 = Object.freeze({
  maxWorkUnits: 1_000_000_000_000,
  maxEvents: 1_000_000,
  maxMemoryBytes: 4 * 1024 * 1024 * 1024,
  maxWallMilliseconds: 24 * 60 * 60 * 1_000,
  cancellationPollWorkUnits: 1_000_000,
});

export interface EvaluationBudgetV2 {
  readonly profileId: string;
  readonly profileVersion: number;
  readonly maxWorkUnits: number;
  readonly maxEvents: number;
  readonly maxMemoryBytes: number;
  readonly maxWallMilliseconds: number;
  readonly cancellationPollWorkUnits: number;
}

export interface EvaluationRequestV2 {
  readonly schema: "agl.evaluation.request";
  readonly schemaVersion: 2;
  readonly protocolVersion: typeof EVALUATION_PROTOCOL_VERSION_V2;
  readonly identity: DerivationIdentityV2;
  readonly determinismClass: DerivationDeterminismClassV2;
  readonly interval: { readonly start: RationalWireLike; readonly end: RationalWireLike };
  readonly requestPayloadDigest: string;
  readonly budget: EvaluationBudgetV2;
}

export interface EvaluationProgressV2 {
  readonly requestId: string;
  readonly generation: string;
  readonly completedWorkUnits: number;
  readonly totalWorkUnits?: number;
  readonly fraction?: number;
}

export function validateEvaluationRequestV2(value: unknown): readonly string[] {
  const issues: string[] = [];
  if (!isPlainRecord(value)) return ["request:not-object"];
  const request = value as Record<string, unknown>;
  rejectUnknownObjectKeys(request, [
    "schema", "schemaVersion", "protocolVersion", "identity", "determinismClass",
    "interval", "requestPayloadDigest", "budget",
  ], "request", issues);
  if (request.schema !== "agl.evaluation.request" || request.schemaVersion !== 2 || request.protocolVersion !== EVALUATION_PROTOCOL_VERSION_V2) issues.push("Unsupported evaluation request contract.");
  const determinismClass = request.determinismClass;
  if (determinismClass !== "exact" && determinismClass !== "profile-numeric" && determinismClass !== "render-only") issues.push("Unknown derivation determinism class.");
  if (!isPlainRecord(request.identity)) issues.push("identity:not-object");
  else {
    const identityIssues = validateDerivationIdentityForClassV2(request.identity, determinismClass as DerivationDeterminismClassV2);
    for (const issue of identityIssues) issues.push(`identity:${issue}`);
  }
  if (typeof request.requestPayloadDigest !== "string" || !isSha256Digest(request.requestPayloadDigest)) issues.push("requestPayloadDigest must use sha256:.");

  if (!isPlainRecord(request.interval)) issues.push("interval:not-object");
  else {
    rejectUnknownObjectKeys(request.interval, ["start", "end"], "interval", issues);
    const start = request.interval.start;
    const end = request.interval.end;
    if (isPlainRecord(start)) rejectUnknownObjectKeys(start, ["numerator", "denominator"], "interval.start", issues);
    if (isPlainRecord(end)) rejectUnknownObjectKeys(end, ["numerator", "denominator"], "interval.end", issues);
    const startIssues = validateCanonicalRationalWire(start as RationalWireLike);
    const endIssues = validateCanonicalRationalWire(end as RationalWireLike);
    if (
      startIssues.length > 0 || endIssues.length > 0 ||
      (startIssues.length === 0 && endIssues.length === 0 && (
        Rational.fromWire(start as RationalWireLike).compare(0) < 0 ||
        Rational.fromWire(end as RationalWireLike).compare(Rational.fromWire(start as RationalWireLike)) <= 0
      ))
    ) issues.push("Evaluation interval must be a canonical non-negative, non-empty half-open rational interval.");
  }

  if (!isPlainRecord(request.budget)) issues.push("budget:not-object");
  else {
    const b = request.budget;
    rejectUnknownObjectKeys(b, [
      "profileId", "profileVersion", "maxWorkUnits", "maxEvents", "maxMemoryBytes",
      "maxWallMilliseconds", "cancellationPollWorkUnits",
    ], "budget", issues);
    const identity = isPlainRecord(request.identity) ? request.identity : undefined;
    if (typeof b.profileId !== "string" || b.profileId.length === 0 || b.profileId.length > 256) issues.push("budget.profileId is invalid.");
    if (!Number.isSafeInteger(b.profileVersion) || (b.profileVersion as number) < 1) issues.push("budget.profileVersion must be a positive safe integer.");
    if (identity !== undefined && (b.profileId !== identity.budgetProfileId || b.profileVersion !== identity.budgetProfileVersion)) issues.push("Budget identity does not match derivation identity.");
    for (const [name, budgetValue] of [["maxWorkUnits", b.maxWorkUnits], ["maxEvents", b.maxEvents], ["maxMemoryBytes", b.maxMemoryBytes], ["maxWallMilliseconds", b.maxWallMilliseconds], ["cancellationPollWorkUnits", b.cancellationPollWorkUnits]] as const) {
      if (!Number.isSafeInteger(budgetValue) || (budgetValue as number) <= 0) issues.push(`${name} must be a positive safe integer.`);
    }
    if (typeof b.maxWorkUnits === "number" && b.maxWorkUnits > MAX_EVALUATION_BUDGET_V2.maxWorkUnits) issues.push("maxWorkUnits exceeds the protocol safety ceiling.");
    if (typeof b.maxEvents === "number" && b.maxEvents > MAX_EVALUATION_BUDGET_V2.maxEvents) issues.push("maxEvents exceeds the protocol safety ceiling.");
    if (typeof b.maxMemoryBytes === "number" && b.maxMemoryBytes > MAX_EVALUATION_BUDGET_V2.maxMemoryBytes) issues.push("maxMemoryBytes exceeds the protocol safety ceiling.");
    if (typeof b.maxWallMilliseconds === "number" && b.maxWallMilliseconds > MAX_EVALUATION_BUDGET_V2.maxWallMilliseconds) issues.push("maxWallMilliseconds exceeds the protocol safety ceiling.");
    if (typeof b.cancellationPollWorkUnits === "number" && b.cancellationPollWorkUnits > MAX_EVALUATION_BUDGET_V2.cancellationPollWorkUnits) issues.push("cancellationPollWorkUnits exceeds the responsiveness ceiling.");
    if (typeof b.cancellationPollWorkUnits === "number" && typeof b.maxWorkUnits === "number" && b.cancellationPollWorkUnits > b.maxWorkUnits) issues.push("Cancellation poll interval cannot exceed total work-unit budget.");
  }
  return issues;
}

export function validateEvaluationProgressV2(progress: EvaluationProgressV2, previous?: EvaluationProgressV2): readonly string[] {
  const issues: string[] = [];
  if (!Number.isSafeInteger(progress.completedWorkUnits) || progress.completedWorkUnits < 0) issues.push("completedWorkUnits must be a non-negative safe integer.");
  if (progress.totalWorkUnits !== undefined && (!Number.isSafeInteger(progress.totalWorkUnits) || progress.totalWorkUnits <= 0 || progress.completedWorkUnits > progress.totalWorkUnits)) issues.push("totalWorkUnits is invalid.");
  if (progress.fraction !== undefined && (!Number.isFinite(progress.fraction) || progress.fraction < 0 || progress.fraction > 1)) issues.push("Progress fraction must be within [0,1].");
  if (progress.requestId.length === 0 || progress.requestId.length > 256 || !/^(0|[1-9][0-9]*)$/.test(progress.generation)) issues.push("Progress request/generation identity is invalid.");
  if (progress.totalWorkUnits !== undefined && progress.fraction !== undefined) {
    const expected = progress.completedWorkUnits / progress.totalWorkUnits;
    if (Math.abs(progress.fraction - expected) > 1e-12) issues.push("Progress fraction disagrees with completed/total work units.");
  }
  if (previous !== undefined) {
    if (previous.requestId !== progress.requestId || previous.generation !== progress.generation || progress.completedWorkUnits < previous.completedWorkUnits) issues.push("Progress must be monotonic for one request/generation.");
    if (previous.totalWorkUnits !== undefined && progress.totalWorkUnits !== undefined && previous.totalWorkUnits !== progress.totalWorkUnits) issues.push("totalWorkUnits cannot change within one request/generation.");
  }
  return issues;
}

export function cancellationPollRequiredV2(workUnitsSincePoll: number, budget: EvaluationBudgetV2): boolean {
  if (!Number.isSafeInteger(workUnitsSincePoll) || workUnitsSincePoll < 0) throw new RangeError("workUnitsSincePoll must be a non-negative safe integer.");
  return workUnitsSincePoll >= budget.cancellationPollWorkUnits;
}

function rejectUnknownObjectKeys(value: Record<string, unknown>, allowed: readonly string[], path: string, issues: string[]): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) if (!allowedSet.has(key)) issues.push(`${path}:unknown-field:${key}`);
}


function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
