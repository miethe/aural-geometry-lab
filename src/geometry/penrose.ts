import { QPhi } from "./qphi.js";

export type PentagridFamily = 0 | 1 | 2 | 3 | 4;

export interface PenrosePhaseV1 {
  readonly values: readonly [
    { readonly numerator: string; readonly denominator: string },
    { readonly numerator: string; readonly denominator: string },
    { readonly numerator: string; readonly denominator: string },
    { readonly numerator: string; readonly denominator: string },
    { readonly numerator: string; readonly denominator: string },
  ];
  readonly certificateId: string;
}

export const DEFAULT_PENROSE_PHASE_V1: PenrosePhaseV1 = {
  values: [
    { numerator: "0", denominator: "1" },
    { numerator: "1", denominator: "5" },
    { numerator: "2", denominator: "5" },
    { numerator: "-1", denominator: "5" },
    { numerator: "-2", denominator: "5" },
  ],
  certificateId: "dr09-default-v1",
};

/** Exact ten-triple regularity certificate from DR-09, represented in Q(phi). */
export const DEFAULT_PHASE_REGULARITY_CERTIFICATE: readonly {
  readonly families: readonly [PentagridFamily, PentagridFamily, PentagridFamily];
  readonly value: QPhi;
}[] = [
  { families: [0, 1, 2], value: new QPhi(3n, -1n, 5n) },
  { families: [0, 1, 3], value: new QPhi(-2n, 1n, 5n) },
  { families: [0, 1, 4], value: new QPhi(-1n, 0n, 5n) },
  { families: [0, 2, 3], value: new QPhi(1n, 0n, 5n) },
  { families: [0, 2, 4], value: new QPhi(-2n, 2n, 5n) },
  { families: [0, 3, 4], value: new QPhi(-2n, 1n, 5n) },
  { families: [1, 2, 3], value: new QPhi(2n, -2n, 5n) },
  { families: [1, 2, 4], value: new QPhi(-5n, 3n, 5n) },
  { families: [1, 3, 4], value: new QPhi(-3n, 1n, 5n) },
  { families: [2, 3, 4], value: new QPhi(-1n, 1n, 5n) },
];

export function verifyDefaultPenrosePhaseCertificate(): boolean {
  return (
    DEFAULT_PHASE_REGULARITY_CERTIFICATE.length === 10 &&
    DEFAULT_PHASE_REGULARITY_CERTIFICATE.every((entry) => !entry.value.isAlgebraicInteger())
  );
}

export interface PenroseVertexAddress {
  readonly n: readonly [string, string, string, string, string];
}

export interface PentagridLineAddress {
  readonly family: PentagridFamily;
  readonly index: string;
}

export interface PenroseTileAddress {
  readonly first: PentagridLineAddress;
  readonly second: PentagridLineAddress;
}

export interface PenroseConfigurationV1 {
  readonly construction: "de-bruijn-pentagrid-p3";
  readonly semanticVersion: 1;
  readonly phase: PenrosePhaseV1;
  readonly edgeScale: { readonly numerator: string; readonly denominator: string };
  readonly familyBasisConvention: "roots-of-unity-ccw-v1";
}

export interface PenroseQueryV1 {
  readonly queryId: string;
  readonly coreRegion: {
    readonly kind: "aabb";
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
  };
  readonly haloPolicy: "complete-core-adjacency-v1";
  readonly maximumTiles: number;
}

export interface PenroseQueryStatus {
  readonly haloComplete: boolean;
  readonly truncated: boolean;
  readonly generatedTileCount: number;
  readonly boundaryClassification: "complete" | "outside-query" | "budget-truncated";
}

export function canonicalVertexId(configDigest: string, address: PenroseVertexAddress): string {
  return `P3/${configDigest}/v:${address.n.join(",")}`;
}

export function canonicalTileId(configDigest: string, address: PenroseTileAddress): string {
  const lines = [address.first, address.second].sort(
    (left, right) => left.family - right.family || compareIntegerStrings(left.index, right.index),
  );
  const first = lines[0];
  const second = lines[1];
  if (first === undefined || second === undefined) {
    throw new Error("Penrose tile address requires two grid lines.");
  }
  return `P3/${configDigest}/g${first.family}:${first.index}/g${second.family}:${second.index}`;
}

export function canonicalEdgeId(
  configDigest: string,
  firstVertexId: string,
  secondVertexId: string,
): string {
  const [left, right] = [firstVertexId, secondVertexId].sort();
  return `P3/${configDigest}/e:${left}/${right}`;
}

function compareIntegerStrings(left: string, right: string): number {
  const a = BigInt(left);
  const b = BigInt(right);
  return a < b ? -1 : a > b ? 1 : 0;
}

import { compareUtf8, isCanonicalDigest, stableIdV2 } from "../core/canonical.js";

export const PENROSE_ID_VERSION_V2 = "penrose-entity-id-v2" as const;

export function canonicalVertexIdV2(configDigest: string, address: PenroseVertexAddress): string {
  assertPenroseConfigDigest(configDigest);
  if (!Array.isArray(address.n) || address.n.length !== 5) throw new TypeError("A Penrose vertex address requires exactly five integer coordinates.");
  const normalized = address.n.map(normalizeIntegerAddress);
  return stableIdV2("p3vertex", PENROSE_ID_VERSION_V2, configDigest, normalized);
}

export function canonicalTileIdV2(configDigest: string, address: PenroseTileAddress): string {
  assertPenroseConfigDigest(configDigest);
  assertPentagridFamily(address.first.family);
  assertPentagridFamily(address.second.family);
  if (address.first.family === address.second.family) throw new RangeError("A Penrose tile requires two distinct grid families.");
  const lines = [address.first, address.second]
    .map((line) => ({ family: line.family, index: normalizeIntegerAddress(line.index) }))
    .sort((left, right) => left.family - right.family || compareBigIntStrings(left.index, right.index));
  const first = lines[0]!;
  const second = lines[1]!;
  return stableIdV2("p3tile", PENROSE_ID_VERSION_V2, configDigest, first, second);
}

export function canonicalEdgeIdV2(configDigest: string, firstVertexId: string, secondVertexId: string): string {
  assertPenroseConfigDigest(configDigest);
  if (firstVertexId === secondVertexId) throw new RangeError("A Penrose edge requires two distinct vertices.");
  if (!/^p3vertex~2~[a-f0-9]{64}$/.test(firstVertexId) || !/^p3vertex~2~[a-f0-9]{64}$/.test(secondVertexId)) throw new TypeError("Penrose edge endpoints must be canonical Penrose vertex v2 IDs.");
  const [left, right] = [firstVertexId, secondVertexId].sort(compareUtf8);
  return stableIdV2("p3edge", PENROSE_ID_VERSION_V2, configDigest, left, right);
}

function normalizeIntegerAddress(value: string): string {
  if (!/^-?(0|[1-9][0-9]*)$/.test(value) || value === "-0") throw new TypeError(`Invalid canonical integer address: ${value}`);
  const normalized = BigInt(value).toString();
  if (normalized !== value) throw new TypeError(`Integer address is not canonical: ${value}`);
  return normalized;
}

function compareBigIntStrings(left: string, right: string): number {
  const a = BigInt(left); const b = BigInt(right);
  return a < b ? -1 : a > b ? 1 : 0;
}

function assertPenroseConfigDigest(value: string): void {
  if (!isCanonicalDigest(value)) throw new TypeError("Penrose configuration identity requires a canonical sha256: digest.");
}


export function validatePenroseConfigurationV1(configuration: PenroseConfigurationV1): readonly string[] {
  const issues: string[] = [];
  if (configuration.construction !== "de-bruijn-pentagrid-p3" || configuration.semanticVersion !== 1 || configuration.familyBasisConvention !== "roots-of-unity-ccw-v1") issues.push("Unsupported Penrose configuration contract.");
  if (configuration.phase.certificateId !== DEFAULT_PENROSE_PHASE_V1.certificateId || configuration.phase.values.length !== 5) issues.push("MVP accepts only the certified DR-09 phase preset.");
  for (const [index, value] of configuration.phase.values.entries()) {
    try {
      const numerator = BigInt(value.numerator); const denominator = BigInt(value.denominator);
      if (denominator <= 0n || gcdBigInt(absBigInt(numerator), denominator) !== 1n || (numerator === 0n && denominator !== 1n)) issues.push(`phase[${index}] is not a canonical rational.`);
    } catch { issues.push(`phase[${index}] is not a canonical rational.`); }
  }
  try {
    const numerator = BigInt(configuration.edgeScale.numerator); const denominator = BigInt(configuration.edgeScale.denominator);
    if (numerator <= 0n || denominator <= 0n || gcdBigInt(numerator, denominator) !== 1n) issues.push("edgeScale must be a canonical positive rational.");
  } catch { issues.push("edgeScale must be a canonical positive rational."); }
  return issues;
}

export function validatePenroseQueryV1(query: PenroseQueryV1): readonly string[] {
  const issues: string[] = [];
  if (query.queryId.length === 0 || query.haloPolicy !== "complete-core-adjacency-v1") issues.push("Query ID and supported halo policy are required.");
  const r = query.coreRegion;
  if (![r.minX, r.minY, r.maxX, r.maxY].every(Number.isFinite) || !(r.maxX > r.minX) || !(r.maxY > r.minY)) issues.push("Penrose query AABB must be finite and non-empty.");
  if (!Number.isSafeInteger(query.maximumTiles) || query.maximumTiles <= 0) issues.push("maximumTiles must be a positive safe integer.");
  return issues;
}

function assertPentagridFamily(value: number): asserts value is PentagridFamily {
  if (!Number.isSafeInteger(value) || value < 0 || value > 4) throw new RangeError("Pentagrid family must be an integer from 0 through 4.");
}
function absBigInt(value: bigint): bigint { return value < 0n ? -value : value; }
function gcdBigInt(left: bigint, right: bigint): bigint { let a = absBigInt(left), b = absBigInt(right); while (b !== 0n) [a, b] = [b, a % b]; return a; }
