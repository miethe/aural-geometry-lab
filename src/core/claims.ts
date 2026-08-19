import { canonicalDigestV1 } from "./canonical.js";

export type ClaimClassV1 = "established" | "strong-inference" | "engineering-default" | "experimental" | "research-gated" | "prohibited";

export interface ClaimDefinitionV1 {
  readonly id: string;
  readonly class: ClaimClassV1;
  readonly text: string;
  readonly qualification?: string;
  readonly sources: readonly string[];
  readonly allowedSurfaces?: readonly string[];
  /** Evidence receipt IDs that must be accepted before a research-gated claim may ship. */
  readonly gateEvidenceIds?: readonly string[];
}

export interface ClaimRegisterV1 {
  readonly schema: "agl.program.claim-register";
  readonly schemaVersion: 1;
  readonly program: string;
  readonly asOf: string;
  readonly classes: readonly ClaimClassV1[];
  readonly claims: readonly ClaimDefinitionV1[];
}

export interface ClaimUseV1 {
  readonly claimId: string;
  readonly surface: string;
  readonly qualificationShown: boolean;
  /** Digest of the exact qualification text rendered on the surface. */
  readonly qualificationDigestShown?: string;
  /** Evidence IDs presented by the caller; these are not trusted on their own. */
  readonly acceptedGateEvidence?: readonly string[];
}

export interface ClaimEvaluationContextV1 {
  /** Evidence receipts independently accepted by the release/evidence authority. */
  readonly trustedGateEvidence: ReadonlySet<string>;
}

const EMPTY_CLAIM_CONTEXT: ClaimEvaluationContextV1 = { trustedGateEvidence: new Set<string>() };

export type ClaimUseDecisionV1 =
  | { readonly kind: "allowed"; readonly claim: ClaimDefinitionV1 }
  | { readonly kind: "rejected"; readonly code: "UNKNOWN_CLAIM" | "PROHIBITED" | "SURFACE_NOT_ALLOWED" | "QUALIFICATION_REQUIRED" | "RESEARCH_GATE_CLOSED"; readonly message: string };

export function evaluateClaimUseV1(register: ClaimRegisterV1, use: ClaimUseV1, context: ClaimEvaluationContextV1 = EMPTY_CLAIM_CONTEXT): ClaimUseDecisionV1 {
  const claim = register.claims.find((candidate) => candidate.id === use.claimId);
  if (claim === undefined) return { kind: "rejected", code: "UNKNOWN_CLAIM", message: `Unknown claim ${use.claimId}.` };
  if (claim.class === "prohibited") return { kind: "rejected", code: "PROHIBITED", message: `${claim.id} is prohibited on every product surface.` };
  if (claim.allowedSurfaces === undefined || !claim.allowedSurfaces.includes(use.surface)) return { kind: "rejected", code: "SURFACE_NOT_ALLOWED", message: `${claim.id} is not allowed on ${use.surface}.` };
  if (claim.qualification !== undefined) {
    const requiredQualificationDigest = claimQualificationDigestV1(claim);
    if (!use.qualificationShown || use.qualificationDigestShown !== requiredQualificationDigest) {
      return { kind: "rejected", code: "QUALIFICATION_REQUIRED", message: `${claim.id} requires the exact versioned qualification text.` };
    }
  }
  if (claim.class === "research-gated") {
    const required = claim.gateEvidenceIds ?? [];
    const presented = new Set(use.acceptedGateEvidence ?? []);
    const gateOpen = required.length > 0 && required.every((id) => presented.has(id) && context.trustedGateEvidence.has(id));
    if (!gateOpen) return { kind: "rejected", code: "RESEARCH_GATE_CLOSED", message: `${claim.id} remains research-gated; caller-supplied strings are not sufficient evidence.` };
  }
  return { kind: "allowed", claim };
}

export function validateClaimRegisterV1(register: ClaimRegisterV1): readonly string[] {
  const issues: string[] = [];
  const raw = register as unknown as { readonly schema?: unknown; readonly schemaVersion?: unknown; readonly program?: unknown; readonly asOf?: unknown; readonly classes?: unknown; readonly claims?: unknown };
  if (raw.schema !== "agl.program.claim-register" || raw.schemaVersion !== 1 || typeof raw.program !== "string" || typeof raw.asOf !== "string" || !Array.isArray(raw.classes) || !Array.isArray(raw.claims)) return ["Unsupported claim-register contract."];
  const allowedClasses = new Set<ClaimClassV1>(["established", "strong-inference", "engineering-default", "experimental", "research-gated", "prohibited"]);
  const declaredClasses = raw.classes as readonly unknown[];
  if (declaredClasses.length !== allowedClasses.size || new Set(declaredClasses).size !== declaredClasses.length || declaredClasses.some((value) => typeof value !== "string" || !allowedClasses.has(value as ClaimClassV1))) issues.push("Claim-register class vocabulary is incomplete or invalid.");
  if (raw.program.trim().length === 0 || raw.program.length > 256 || !/^\d{4}-\d{2}-\d{2}$/.test(raw.asOf)) issues.push("Claim-register program and asOf metadata are invalid.");
  const claims = raw.claims as readonly ClaimDefinitionV1[];
  if (claims.length > 10_000) issues.push("Claim register exceeds the v1 safety limit.");
  const ids = new Set<string>();
  for (const claim of claims) {
    if (ids.has(claim.id)) issues.push(`Duplicate claim ID ${claim.id}.`);
    ids.add(claim.id);
    if (!allowedClasses.has(claim.class)) issues.push(`${claim.id || "<empty>"}: unknown claim class.`);
    if (!portableId(claim.id) || claim.text.trim().length === 0 || claim.text.length > 16_384 || claim.sources.length === 0) issues.push(`${claim.id || "<empty>"}: portable claim ID, bounded text, and sources are required.`);
    if (claim.qualification !== undefined && (claim.qualification.trim().length === 0 || claim.qualification.length > 16_384)) issues.push(`${claim.id}: qualification must be non-empty and bounded.`);
    if (new Set(claim.sources).size !== claim.sources.length || claim.sources.some((source) => !portableId(source))) issues.push(`${claim.id}: sources must be unique portable references.`);
    if (claim.class === "prohibited" && claim.allowedSurfaces !== undefined) issues.push(`${claim.id}: prohibited claims cannot declare allowed surfaces.`);
    if (claim.class !== "prohibited" && (claim.allowedSurfaces?.length ?? 0) === 0) issues.push(`${claim.id}: non-prohibited claims require at least one allowed surface.`);
    if (claim.allowedSurfaces !== undefined && (new Set(claim.allowedSurfaces).size !== claim.allowedSurfaces.length || claim.allowedSurfaces.some((surface) => !portableId(surface)))) issues.push(`${claim.id}: allowed surfaces must be unique portable identifiers.`);
    if (claim.class === "research-gated") {
      if ((claim.gateEvidenceIds?.length ?? 0) === 0) issues.push(`${claim.id}: research-gated claims require explicit gate evidence IDs.`);
      if (new Set(claim.gateEvidenceIds ?? []).size !== (claim.gateEvidenceIds?.length ?? 0) || claim.gateEvidenceIds?.some((id) => !portableId(id))) issues.push(`${claim.id}: gate evidence IDs must be unique portable identifiers.`);
      if (claim.qualification === undefined) issues.push(`${claim.id}: research-gated claims require a qualification.`);
    } else if (claim.gateEvidenceIds !== undefined) issues.push(`${claim.id}: only research-gated claims may declare gate evidence IDs.`);
  }
  return issues;
}

export function claimQualificationDigestV1(claim: Pick<ClaimDefinitionV1, "id" | "qualification">): string | undefined {
  return claim.qualification === undefined
    ? undefined
    : canonicalDigestV1(["agl-claim-qualification-v1", claim.id, claim.qualification]);
}

export function validateClaimUseContextV1(context: ClaimEvaluationContextV1): readonly string[] {
  const issues: string[] = [];
  for (const evidenceId of context.trustedGateEvidence) if (!portableId(evidenceId)) issues.push(`Invalid trusted evidence ID ${evidenceId}.`);
  return issues;
}

function portableId(value: string): boolean { return /^[A-Za-z0-9][A-Za-z0-9._:~\/-]{0,255}$/.test(value); }
