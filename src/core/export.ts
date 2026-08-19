import { isCanonicalDigest, sha256Hex } from "./canonical.js";
import { validateCanonicalRationalWire, Rational } from "./rational.js";

export type ExportKindV1 = "audio-wav" | "midi-smf" | "musicxml" | "project-package";

export interface AGLExportManifestV1 {
  readonly schema: "agl.export.manifest";
  readonly schemaVersion: 1;
  readonly exportId: string;
  readonly exportKind: ExportKindV1;
  readonly createdAt: string;
  readonly source: {
    readonly projectId: string;
    readonly projectEpoch: string;
    readonly projectSchemaVersion: number;
    readonly projectSemanticDigest: string;
    readonly materialMode: "live-resolved" | "snapshot" | "edited-derivative" | "user-authored";
    readonly materialIds: readonly string[];
    readonly sourceRecipeIds: readonly string[];
    readonly materializationReceiptIds: readonly string[];
    readonly range: {
      readonly start: { readonly numerator: string; readonly denominator: string };
      readonly end: { readonly numerator: string; readonly denominator: string };
    };
  };
  readonly semanticEnvironmentDigest: string;
  readonly operatorCatalogDigest: string;
  readonly renderPlanDigest?: string;
  readonly exporter: { readonly id: string; readonly version: string };
  readonly output: {
    readonly mediaType: string;
    readonly sha256: string;
    readonly bytes: number;
    readonly sampleRate?: number;
    readonly channels?: number;
  };
  readonly losses: readonly {
    readonly code: string;
    readonly severity: "info" | "warning" | "error";
    readonly message: string;
    readonly sourceRef?: string;
  }[];
  readonly provenanceRefs: readonly string[];
}

export function validateExportManifestV1(manifest: AGLExportManifestV1): readonly string[] {
  const issues: string[] = [];
  if (manifest.schema !== "agl.export.manifest" || manifest.schemaVersion !== 1) issues.push("Unsupported export manifest contract.");
  if (manifest.exportId.length === 0 || manifest.source.projectId.length === 0 || manifest.source.projectEpoch.length === 0) issues.push("Export, project, and project-epoch IDs are required.");
  if (!Number.isSafeInteger(manifest.source.projectSchemaVersion) || manifest.source.projectSchemaVersion < 1) issues.push("projectSchemaVersion must be a positive safe integer.");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(manifest.createdAt) || Number.isNaN(Date.parse(manifest.createdAt))) issues.push("createdAt must use canonical UTC ISO-8601 milliseconds.");
  if (manifest.exporter.id.length === 0 || manifest.exporter.version.length === 0) issues.push("Exporter ID and version are required.");
  for (const [name, digest] of [
    ["projectSemanticDigest", manifest.source.projectSemanticDigest],
    ["semanticEnvironmentDigest", manifest.semanticEnvironmentDigest],
    ["operatorCatalogDigest", manifest.operatorCatalogDigest],
  ] as const) if (!isCanonicalDigest(digest)) issues.push(`${name} must use sha256:.`);
  if (manifest.renderPlanDigest !== undefined && !isCanonicalDigest(manifest.renderPlanDigest)) issues.push("renderPlanDigest must use sha256:.");
  if (!/^[a-f0-9]{64}$/.test(manifest.output.sha256)) issues.push("Output SHA-256 must be 64 lowercase hex characters.");
  if (!Number.isSafeInteger(manifest.output.bytes) || manifest.output.bytes <= 0) issues.push("Output bytes must be a positive safe integer.");
  if (manifest.output.sampleRate !== undefined && (!Number.isSafeInteger(manifest.output.sampleRate) || manifest.output.sampleRate <= 0)) issues.push("sampleRate must be a positive safe integer.");
  if (manifest.output.channels !== undefined && (!Number.isSafeInteger(manifest.output.channels) || manifest.output.channels < 1 || manifest.output.channels > 64)) issues.push("channels must be within 1-64.");
  const startIssues = validateCanonicalRationalWire(manifest.source.range.start);
  const endIssues = validateCanonicalRationalWire(manifest.source.range.end);
  if (startIssues.length > 0 || endIssues.length > 0 || (startIssues.length === 0 && endIssues.length === 0 && Rational.fromWire(manifest.source.range.end).compare(Rational.fromWire(manifest.source.range.start)) <= 0)) issues.push("Export source range must be a canonical non-empty half-open rational interval.");
  const uniqueFields: Array<[string, readonly string[]]> = [
    ["materialIds", manifest.source.materialIds],
    ["sourceRecipeIds", manifest.source.sourceRecipeIds],
    ["materializationReceiptIds", manifest.source.materializationReceiptIds],
    ["provenanceRefs", manifest.provenanceRefs],
  ];
  for (const [name, values] of uniqueFields) if (new Set(values).size !== values.length || values.some((value) => value.length === 0)) issues.push(`${name} must contain unique non-empty IDs.`);
  if ((manifest.exportKind === "audio-wav") !== (manifest.renderPlanDigest !== undefined)) issues.push("Audio exports require a render-plan digest; non-audio exports must not pretend to have one.");
  if (manifest.exportKind === "audio-wav") {
    if (manifest.output.mediaType !== "audio/wav") issues.push("WAV exports must declare mediaType audio/wav.");
    if (manifest.output.sampleRate === undefined || manifest.output.channels === undefined) issues.push("WAV exports require sample rate and channel count.");
  } else {
    if (manifest.output.sampleRate !== undefined || manifest.output.channels !== undefined) issues.push("Non-audio exports must not declare audio sample-rate/channel metadata.");
    const expectedMediaType: Record<Exclude<ExportKindV1, "audio-wav">, string> = {
      "midi-smf": "audio/midi",
      musicxml: "application/vnd.recordare.musicxml+xml",
      "project-package": "application/vnd.agl.project+zip",
    };
    if (manifest.output.mediaType !== expectedMediaType[manifest.exportKind]) issues.push(`${manifest.exportKind} export mediaType is not canonical.`);
  }
  switch (manifest.source.materialMode) {
    case "live-resolved":
      if (manifest.source.sourceRecipeIds.length === 0 || manifest.source.materializationReceiptIds.length !== 0) issues.push("Live-resolved exports require source recipes and cannot claim materialization receipts.");
      break;
    case "snapshot":
    case "edited-derivative":
      if (manifest.source.sourceRecipeIds.length === 0 || manifest.source.materializationReceiptIds.length === 0) issues.push("Snapshot/derivative exports require source recipes and materialization receipts.");
      break;
    case "user-authored":
      if (manifest.source.sourceRecipeIds.length !== 0 || manifest.source.materializationReceiptIds.length !== 0) issues.push("User-authored exports must not claim generated-source recipes or receipts.");
      break;
  }
  if ((manifest.exportKind === "midi-smf" || manifest.exportKind === "musicxml") && manifest.source.materialMode === "live-resolved" && manifest.losses.every((loss) => loss.code !== "PROCEDURAL_MATERIAL_RESOLVED")) issues.push("Symbolic export of live-generated material must disclose the procedural materialization boundary.");
  if (manifest.exportKind === "musicxml" && manifest.losses.every((loss) => loss.code !== "MUSICXML_REPRESENTATION_SCOPE")) issues.push("MusicXML exports must disclose that AGL graph/geometry semantics are outside MusicXML representation.");
  for (const [index, loss] of manifest.losses.entries()) {
    if (loss.code.length === 0 || loss.message.trim().length === 0) issues.push(`losses[${index}] requires a code and message.`);
    if (loss.severity === "error") issues.push(`losses[${index}] is an error; a completed export manifest cannot certify a failed representation.`);
  }
  return issues;
}


/** Verify the bytes actually produced by an exporter against its immutable manifest. */
export function verifyExportArtifactV1(
  manifest: AGLExportManifestV1,
  bytes: Uint8Array,
  observedMediaType?: string,
): readonly string[] {
  const issues = [...validateExportManifestV1(manifest)];
  if (!(bytes instanceof Uint8Array)) return [...issues, "Export artifact must be supplied as bytes."];
  if (bytes.byteLength !== manifest.output.bytes) issues.push("Actual export byte count does not match the manifest.");
  if (sha256Hex(bytes) !== manifest.output.sha256) issues.push("Actual export SHA-256 does not match the manifest.");
  if (observedMediaType !== undefined && observedMediaType !== manifest.output.mediaType) issues.push("Observed export media type does not match the manifest.");
  return issues;
}
