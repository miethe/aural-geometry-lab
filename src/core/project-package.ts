import { canonicalDigestV1, compareUtf8, isCanonicalDigest, sha256Hex } from "./canonical.js";
import { projectSemanticDigestV3, validateProject, type AuralGeometryProjectV3 } from "./project-schema.js";
import { parseStrictJsonUtf8V1 } from "./strict-json.js";

export type PackageProfile =
  | "agl.native-directory-package.v1"
  | "agl.portable-archive.v1";

export interface PackageMemberDigest {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly mediaType: string;
  readonly authoritative: boolean;
}

export interface AGLPackageManifestV1 {
  readonly schema: "agl.package.manifest";
  readonly schemaVersion: 1;
  readonly logicalProfile: "agl.logical-package.v1";
  readonly physicalProfile: PackageProfile;
  readonly projectSchemaVersion: number;
  readonly projectSemanticId: string;
  readonly saveGeneration: string;
  readonly projectSemanticDigest: string;
  readonly members: readonly PackageMemberDigest[];
  readonly compatibility: {
    readonly minimumReaderVersion: string;
    readonly requiredOperatorCatalogVersion: string;
  };
}

export function validatePackageManifest(manifest: AGLPackageManifestV1): readonly string[] {
  const issues: string[] = [];
  if (manifest.schema !== "agl.package.manifest" || manifest.schemaVersion !== 1) {
    issues.push("Unsupported package manifest schema/version.");
  }
  if (manifest.logicalProfile !== "agl.logical-package.v1") {
    issues.push("Unsupported logical package profile.");
  }
  const paths = new Set<string>();
  let hasProject = false;
  for (const member of manifest.members) {
    if (paths.has(member.path)) {
      issues.push(`Duplicate package member: ${member.path}`);
    }
    paths.add(member.path);
    if (member.path === "project.json" && member.authoritative) {
      hasProject = true;
    }
    if (member.path.startsWith("/") || member.path.includes("..")) {
      issues.push(`Unsafe package member path: ${member.path}`);
    }
    if (!/^[a-f0-9]{64}$/.test(member.sha256)) {
      issues.push(`${member.path}: SHA-256 must be 64 lowercase hex characters.`);
    }
    if (!Number.isSafeInteger(member.bytes) || member.bytes < 0) {
      issues.push(`${member.path}: byte count must be a non-negative safe integer.`);
    }
  }
  if (!hasProject) {
    issues.push("Package must contain authoritative project.json.");
  }
  return issues;
}

export interface PackageSecurityLimitsV2 {
  readonly maximumMembers: number;
  readonly maximumTotalUncompressedBytes: number;
  readonly maximumMemberUncompressedBytes: number;
  readonly maximumCompressionRatio: number;
  readonly maximumPathBytes: number;
  readonly maximumManifestBytes: number;
  readonly maximumProjectBytes: number;
}

export const DEFAULT_PACKAGE_SECURITY_LIMITS_V2: PackageSecurityLimitsV2 = {
  maximumMembers: 10_000,
  maximumTotalUncompressedBytes: 2 * 1024 * 1024 * 1024,
  maximumMemberUncompressedBytes: 1024 * 1024 * 1024,
  maximumCompressionRatio: 100,
  maximumPathBytes: 1_024,
  maximumManifestBytes: 4 * 1024 * 1024,
  maximumProjectBytes: 256 * 1024 * 1024,
};

export type PackageProfileV2 = "agl.native-directory-package.v2" | "agl.portable-archive.v2";

export interface PackageMemberDigestV2 {
  readonly path: string;
  /** Archive adapters must reject symlinks, hard links, devices, and directories. */
  readonly entryKind: "file";
  readonly role: "project" | "asset" | "preview" | "research-receipt" | "migration-receipt";
  readonly sha256: string;
  readonly bytes: number;
  readonly compressedBytes?: number;
  readonly mediaType: string;
  readonly authoritative: boolean;
}

export interface AGLPackageManifestV2 {
  readonly schema: "agl.package.manifest";
  readonly schemaVersion: 2;
  readonly logicalProfile: "agl.logical-package.v2";
  readonly physicalProfile: PackageProfileV2;
  readonly projectSchemaVersion: 3;
  readonly projectSemanticId: string;
  readonly saveGeneration: string;
  readonly projectSemanticDigest: string;
  readonly declaredTotalBytes: number;
  readonly members: readonly PackageMemberDigestV2[];
  readonly compatibility: {
    readonly minimumReaderVersion: string;
    readonly requiredOperatorCatalogDigest: string;
    readonly canonicalEncodingVersion: string;
  };
}

export function validatePackageManifestV2(
  manifest: AGLPackageManifestV2,
  limits: PackageSecurityLimitsV2 = DEFAULT_PACKAGE_SECURITY_LIMITS_V2,
): readonly string[] {
  const issues: string[] = [];
  if (manifest.schema !== "agl.package.manifest" || manifest.schemaVersion !== 2 || manifest.logicalProfile !== "agl.logical-package.v2") issues.push("Unsupported package manifest v2 contract.");
  if (manifest.projectSchemaVersion !== 3) issues.push("Package v2 requires project schema v3.");
  if (!isCanonicalDigest(manifest.projectSemanticDigest)) issues.push("Project semantic digest must use sha256:.");
  if (!isCanonicalDigest(manifest.compatibility.requiredOperatorCatalogDigest)) issues.push("Required operator catalog digest must use sha256:.");
  if (manifest.projectSemanticId.length === 0 || manifest.saveGeneration.length === 0 || manifest.compatibility.minimumReaderVersion.length === 0) issues.push("Project semantic ID, save generation, and minimum reader version are required.");
  if (manifest.compatibility.canonicalEncodingVersion !== "agl-canonical-value-v1") issues.push("Package v2 requires agl-canonical-value-v1.");
  if (manifest.members.length > limits.maximumMembers) issues.push("Package member count exceeds the reader safety limit.");
  if (manifest.physicalProfile !== "agl.native-directory-package.v2" && manifest.physicalProfile !== "agl.portable-archive.v2") issues.push("Unsupported physical package profile.");
  if (manifest.projectSemanticId.length === 0 || manifest.saveGeneration.length === 0) issues.push("Project semantic ID and save generation cannot be empty.");
  if (manifest.compatibility.canonicalEncodingVersion !== "agl-canonical-value-v1") issues.push("Unsupported canonical encoding version.");
  const paths = new Set<string>();
  const portablePathKeys = new Set<string>();
  let priorPath: string | undefined;
  let projectCount = 0;
  let totalBytes = 0;
  for (const member of manifest.members) {
    const pathIssues = validateCanonicalPackagePathV2(member.path, limits.maximumPathBytes);
    for (const issue of pathIssues) issues.push(`${member.path}: ${issue}`);
    if (paths.has(member.path)) issues.push(`Duplicate package member: ${member.path}`); else paths.add(member.path);
    // Paths are ASCII-only, so portable collision keys require no locale-dependent collation.
    const portableKey = member.path.normalize("NFC").toLowerCase();
    if (portablePathKeys.has(portableKey)) issues.push(`${member.path}: package path collides on a case-insensitive or normalization-insensitive filesystem.`); else portablePathKeys.add(portableKey);
    if (priorPath !== undefined && compareUtf8(priorPath, member.path) >= 0) issues.push("Package members must be stored in canonical ascending UTF-8 path order.");
    priorPath = member.path;
    if (member.entryKind !== "file") issues.push(`${member.path}: only regular-file package entries are permitted.`);
    if (!["project", "asset", "preview", "research-receipt", "migration-receipt"].includes(member.role)) issues.push(`${member.path}: unknown package-member role.`);
    if (typeof member.authoritative !== "boolean") issues.push(`${member.path}: authoritative must be boolean.`);
    if (typeof member.mediaType !== "string" || member.mediaType.length === 0 || member.mediaType.length > 255) issues.push(`${member.path}: mediaType must be a non-empty bounded string.`);
    if (!/^[a-f0-9]{64}$/.test(member.sha256)) issues.push(`${member.path}: invalid SHA-256.`);
    const validBytes = Number.isSafeInteger(member.bytes) && member.bytes >= 0 && member.bytes <= limits.maximumMemberUncompressedBytes;
    if (!validBytes) issues.push(`${member.path}: uncompressed byte count exceeds safety policy.`);
    if (validBytes) {
      totalBytes += member.bytes;
      if (!Number.isSafeInteger(totalBytes) || totalBytes > limits.maximumTotalUncompressedBytes) issues.push("Package total uncompressed bytes exceed safety policy.");
    }
    if (member.mediaType.trim().length === 0) issues.push(`${member.path}: mediaType is required.`);
    if (member.compressedBytes !== undefined) {
      if (!Number.isSafeInteger(member.compressedBytes) || member.compressedBytes < 0) issues.push(`${member.path}: compressed byte count is invalid.`);
      else if (member.bytes > 0 && member.compressedBytes === 0) issues.push(`${member.path}: non-empty member cannot declare zero compressed bytes.`);
      else if (member.compressedBytes > 0 && member.bytes / member.compressedBytes > limits.maximumCompressionRatio) issues.push(`${member.path}: compression ratio exceeds safety policy.`);
    }
    if (member.path === "project.json") {
      projectCount += 1;
      if (member.role !== "project" || !member.authoritative || member.mediaType !== "application/json") issues.push("project.json must be the authoritative project JSON member.");
    } else if (member.role === "project" || member.authoritative) issues.push(`${member.path}: only project.json may be authoritative/project role in v2.`);
    if (member.role === "asset") {
      const match = /^assets\/([a-f0-9]{64})(?:\.[a-z0-9._-]+)?$/.exec(member.path);
      if (match === null || match[1] !== member.sha256) issues.push(`${member.path}: asset path must be content-addressed by its SHA-256.`);
    } else if (member.role === "preview" && !member.path.startsWith("preview/")) issues.push(`${member.path}: preview role must use preview/.`);
    else if (member.role === "research-receipt" && !member.path.startsWith("research-receipts/")) issues.push(`${member.path}: research receipt role must use research-receipts/.`);
    else if (member.role === "migration-receipt" && !member.path.startsWith("migration-receipts/")) issues.push(`${member.path}: migration receipt role must use migration-receipts/.`);
  }
  if (projectCount !== 1) issues.push("Package must contain exactly one authoritative project.json member.");
  if (!Number.isSafeInteger(manifest.declaredTotalBytes) || manifest.declaredTotalBytes < 0 || manifest.declaredTotalBytes !== totalBytes) issues.push("declaredTotalBytes must exactly equal the sum of member byte counts.");
  return [...new Set(issues)];
}

export function validateCanonicalPackagePathV2(path: string, maximumPathBytes = 1_024): readonly string[] {
  const issues: string[] = [];
  if (new TextEncoder().encode(path).length > maximumPathBytes) issues.push("path exceeds byte limit");
  if (path.length === 0 || path.startsWith("/") || path.endsWith("/") || path.includes("\\") || path.includes("\0")) issues.push("path is not a canonical relative POSIX path");
  const segments = path.split("/");
  if (segments.some((segment) => segment.length === 0 || segment === "." || segment === "..")) issues.push("path contains empty, dot, or parent segment");
  if (segments.some((segment) => !/^[a-z0-9._-]+$/.test(segment))) issues.push("path must use lowercase portable ASCII characters");
  const windowsReserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
  if (segments.some((segment) => windowsReserved.test(segment) || segment.endsWith(".") || segment.endsWith(" "))) issues.push("path contains a cross-platform reserved segment");
  if (path !== "project.json" && !/^(assets|preview|research-receipts|migration-receipts)\//.test(path)) issues.push("path is outside an allowed package namespace");
  return issues;
}


export interface ActualPackageMemberV2 {
  readonly path: string;
  readonly kind: "file" | "directory" | "symlink" | "hardlink" | "device" | "other";
  readonly bytes?: Uint8Array;
  /** Archive metadata; required for portable-archive verification. */
  readonly compressedBytes?: number;
}

/**
 * Verify a fully enumerated, bounded package after archive preflight but before
 * any member is trusted. The adapter must provide manifest.json as a regular
 * file and must enumerate links/devices rather than following or extracting
 * them. Declared bytes never substitute for measured bytes.
 */
export function verifyPackageMembersV2(
  manifest: AGLPackageManifestV2,
  actualMembers: readonly ActualPackageMemberV2[],
  limits: PackageSecurityLimitsV2 = DEFAULT_PACKAGE_SECURITY_LIMITS_V2,
): readonly string[] {
  const issues = [...validatePackageManifestV2(manifest, limits)];
  if (actualMembers.length > limits.maximumMembers + 1) issues.push("Actual package member count exceeds the reader safety limit.");
  const expected = new Map(manifest.members.map((member) => [member.path, member]));
  const seen = new Set<string>();
  const portableKeys = new Set<string>();
  let manifestCount = 0;
  let actualDeclaredBytes = 0;
  let actualCompressedBytes = 0;
  let project: AuralGeometryProjectV3 | undefined;

  for (const actual of actualMembers) {
    if (seen.has(actual.path)) { issues.push(`Duplicate actual package member: ${actual.path}`); continue; }
    seen.add(actual.path);
    const portableKey = actual.path.normalize("NFC").toLowerCase();
    if (portableKeys.has(portableKey)) issues.push(`${actual.path}: actual package path collides on a case-insensitive or normalization-insensitive filesystem.`);
    else portableKeys.add(portableKey);

    if (actual.path === "manifest.json") {
      manifestCount += 1;
      if (actual.kind !== "file" || actual.bytes === undefined) {
        issues.push("manifest.json must be one bounded regular file; links and special entries are forbidden.");
        continue;
      }
      if (actual.bytes.byteLength > limits.maximumManifestBytes) issues.push("manifest.json exceeds the reader safety limit.");
      try {
        const decoded = parseStrictJsonUtf8V1(actual.bytes);
        if (canonicalDigestV1(decoded) !== canonicalDigestV1(manifest)) issues.push("manifest.json bytes do not represent the supplied manifest object.");
      } catch (error) {
        issues.push(`manifest.json is not valid bounded UTF-8 JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
      continue;
    }

    const pathIssues = validateCanonicalPackagePathV2(actual.path, limits.maximumPathBytes);
    for (const issue of pathIssues) issues.push(`${actual.path}: ${issue}`);
    const declared = expected.get(actual.path);
    if (declared === undefined) { issues.push(`Undeclared package member: ${actual.path}`); continue; }
    if (actual.kind !== "file" || actual.bytes === undefined) {
      issues.push(`${actual.path}: package members must be regular files; links and special entries are forbidden.`);
      continue;
    }
    if (actual.bytes.byteLength > limits.maximumMemberUncompressedBytes) issues.push(`${actual.path}: actual byte count exceeds member safety policy.`);
    actualDeclaredBytes += actual.bytes.byteLength;
    if (!Number.isSafeInteger(actualDeclaredBytes) || actualDeclaredBytes > limits.maximumTotalUncompressedBytes) issues.push("Actual package total uncompressed bytes exceed safety policy.");
    if (actual.bytes.byteLength !== declared.bytes) issues.push(`${actual.path}: actual byte count does not match manifest.`);
    if (sha256Hex(actual.bytes) !== declared.sha256) issues.push(`${actual.path}: actual SHA-256 does not match manifest.`);

    if (manifest.physicalProfile === "agl.portable-archive.v2") {
      if (!Number.isSafeInteger(actual.compressedBytes) || (actual.compressedBytes ?? -1) < 0) issues.push(`${actual.path}: portable archives require measured compressed-byte metadata.`);
      else {
        actualCompressedBytes += actual.compressedBytes!;
        if (!Number.isSafeInteger(actualCompressedBytes)) issues.push("Actual compressed-byte total exceeds safe integer range.");
        if (actual.bytes.byteLength > 0 && actual.compressedBytes === 0) issues.push(`${actual.path}: non-empty archive member cannot have zero compressed bytes.`);
        else if (actual.compressedBytes! > 0 && actual.bytes.byteLength / actual.compressedBytes! > limits.maximumCompressionRatio) issues.push(`${actual.path}: measured compression ratio exceeds safety policy.`);
        if (declared.compressedBytes !== undefined && declared.compressedBytes !== actual.compressedBytes) issues.push(`${actual.path}: actual compressed-byte count does not match manifest.`);
      }
    }

    if (actual.path === "project.json") {
      if (actual.bytes.byteLength > limits.maximumProjectBytes) issues.push("project.json exceeds the reader safety limit.");
      try {
        const decoded = parseStrictJsonUtf8V1(actual.bytes);
        const projectIssues = validateProject(decoded);
        if (projectIssues.length > 0) issues.push(`project.json failed semantic validation: ${projectIssues.map((issue) => `${issue.path} ${issue.message}`).join(" | ")}`);
        else if ((decoded as { schemaVersion?: unknown }).schemaVersion === 3) project = decoded as AuralGeometryProjectV3;
        else issues.push("project.json must contain project schema v3 for package v2.");
      } catch (error) {
        issues.push(`project.json is not valid bounded UTF-8 JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  if (manifestCount !== 1) issues.push("Package must contain exactly one regular manifest.json member.");
  for (const path of expected.keys()) if (!seen.has(path)) issues.push(`Missing declared package member: ${path}`);
  if (actualDeclaredBytes !== manifest.declaredTotalBytes) issues.push("Measured total member bytes do not match manifest.declaredTotalBytes.");

  if (project !== undefined) {
    const digest = projectSemanticDigestV3(project);
    if (digest !== manifest.projectSemanticDigest) issues.push("project.json semantic digest does not match package manifest.");
    if (project.id !== manifest.projectSemanticId) issues.push("project.json ID does not match package manifest projectSemanticId.");
    if (project.compatibility.operatorCatalogDigest !== manifest.compatibility.requiredOperatorCatalogDigest) issues.push("project.json operator-catalog digest does not match package compatibility requirements.");
    if (project.compatibility.canonicalEncodingVersion !== manifest.compatibility.canonicalEncodingVersion) issues.push("project.json canonical-encoding version does not match package compatibility requirements.");
  }
  return [...new Set(issues)];
}

