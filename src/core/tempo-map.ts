import { canonicalDigestV1 } from "./canonical.js";
import {
  Rational,
  validateCanonicalRationalWire,
  type RationalWireLike,
} from "./rational.js";

export const TEMPO_RESOLUTION_VERSION = "agl-tempo-map-v1" as const;
export const MAX_TEMPO_POINTS_V1 = 10_000;
export const MIN_BPM_V1 = 1e-6;
export const MAX_BPM_V1 = 1_000_000;

export interface TempoPointContractV1 {
  readonly id: string;
  readonly beat: RationalWireLike;
  readonly bpm: number;
  /** Defines interpolation from this point to the next; last point is constant thereafter. */
  readonly curve: "step" | "linear";
}

export interface TempoMapIssue {
  readonly path: string;
  readonly code: string;
  readonly message: string;
}

export function validateTempoMapV1(points: readonly TempoPointContractV1[]): readonly TempoMapIssue[] {
  const issues: TempoMapIssue[] = [];
  if (points.length === 0) {
    return [{ path: "$.tempoMap", code: "TEMPO_EMPTY", message: "Tempo map must contain at least one point." }];
  }
  if (points.length > MAX_TEMPO_POINTS_V1) {
    issues.push({ path: "$.tempoMap", code: "TEMPO_POINT_LIMIT", message: `Tempo map exceeds ${MAX_TEMPO_POINTS_V1} points.` });
  }
  const ids = new Set<string>();
  let previous: Rational | undefined;
  for (const [index, point] of points.entries()) {
    const path = `$.tempoMap[${index}]`;
    if (point.id.length === 0 || point.id.length > 256) issues.push({ path: `${path}.id`, code: "TEMPO_ID_INVALID", message: "Tempo point ID must contain 1-256 characters." });
    if (ids.has(point.id)) issues.push({ path: `${path}.id`, code: "TEMPO_ID_DUPLICATE", message: `Duplicate tempo point ID ${point.id}.` });
    ids.add(point.id);
    const rationalIssues = validateCanonicalRationalWire(point.beat);
    if (rationalIssues.length > 0) {
      issues.push({ path: `${path}.beat`, code: "TEMPO_BEAT_INVALID", message: rationalIssues.join(" ") });
      continue;
    }
    const beat = Rational.fromWire(point.beat);
    if (beat.compare(0) < 0) issues.push({ path: `${path}.beat`, code: "TEMPO_NEGATIVE_BEAT", message: "Tempo points must be at non-negative beats in v1." });
    if (index === 0 && !beat.equals(0)) issues.push({ path: `${path}.beat`, code: "TEMPO_FIRST_NOT_ZERO", message: "The first tempo point must be at beat 0." });
    if (previous !== undefined && beat.compare(previous) <= 0) {
      issues.push({ path: `${path}.beat`, code: "TEMPO_NOT_STRICTLY_SORTED", message: "Tempo beats must be strictly increasing." });
    }
    previous = beat;
    if (!Number.isFinite(point.bpm) || point.bpm < MIN_BPM_V1 || point.bpm > MAX_BPM_V1) {
      issues.push({ path: `${path}.bpm`, code: "TEMPO_BPM_INVALID", message: `BPM must be finite and between ${MIN_BPM_V1} and ${MAX_BPM_V1}.` });
    }
    if (point.curve !== "step" && point.curve !== "linear") {
      issues.push({ path: `${path}.curve`, code: "TEMPO_CURVE_INVALID", message: "Tempo curve must be step or linear." });
    }
    if (index === points.length - 1 && point.curve !== "step") {
      issues.push({ path: `${path}.curve`, code: "TEMPO_LAST_CURVE_UNUSED", message: "The last tempo point must use step because no following segment exists." });
    }
  }
  return issues;
}

export function tempoMapDigestV1(points: readonly TempoPointContractV1[]): string {
  const issues = validateTempoMapV1(points);
  if (issues.length > 0) throw new TypeError(`Invalid tempo map: ${issues.map((issue) => issue.code).join(", ")}`);
  return canonicalDigestV1([
    TEMPO_RESOLUTION_VERSION,
    points.map((point) => ({ id: point.id, beat: { ...point.beat }, bpm: point.bpm, curve: point.curve })),
  ]);
}

/** Resolve an absolute non-negative beat to ideal seconds without delta rounding. */
export function beatToSecondsV1(
  beatInput: Rational | RationalWireLike,
  points: readonly TempoPointContractV1[],
): number {
  const map = prepareTempoMap(points);
  const beat = beatInput instanceof Rational ? beatInput : Rational.fromWire(beatInput);
  if (beat.compare(0) < 0) throw new RangeError("agl-tempo-map-v1 does not resolve negative beats.");
  let seconds = 0;
  for (let index = 0; index < map.length - 1; index += 1) {
    const current = map[index]!;
    const next = map[index + 1]!;
    if (beat.compare(next.beat) <= 0) {
      const localBeats = beat.subtract(current.beat).toNumber();
      return seconds + integrateTempoSegment(current.bpm, next.bpm, next.beat.subtract(current.beat).toNumber(), localBeats, current.curve);
    }
    seconds += integrateTempoSegment(current.bpm, next.bpm, next.beat.subtract(current.beat).toNumber(), next.beat.subtract(current.beat).toNumber(), current.curve);
  }
  const last = map.at(-1)!;
  seconds += (60 * beat.subtract(last.beat).toNumber()) / last.bpm;
  if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError("Resolved tempo time is not a finite non-negative value.");
  return seconds;
}

/** Inverse projection for transport/UI. Returns a binary64 beat estimate, not exact musical time. */
export function secondsToBeatEstimateV1(secondsInput: number, points: readonly TempoPointContractV1[]): number {
  if (!Number.isFinite(secondsInput) || secondsInput < 0) throw new RangeError("Seconds must be finite and non-negative.");
  const map = prepareTempoMap(points);
  let remaining = secondsInput;
  for (let index = 0; index < map.length - 1; index += 1) {
    const current = map[index]!;
    const next = map[index + 1]!;
    const length = next.beat.subtract(current.beat).toNumber();
    const duration = integrateTempoSegment(current.bpm, next.bpm, length, length, current.curve);
    if (remaining <= duration) {
      return current.beat.toNumber() + invertTempoSegment(current.bpm, next.bpm, length, remaining, current.curve);
    }
    remaining -= duration;
  }
  const last = map.at(-1)!;
  return last.beat.toNumber() + (remaining * last.bpm) / 60;
}

export function resolveBeatRangeV1(
  range: { readonly start: Rational | RationalWireLike; readonly end: Rational | RationalWireLike },
  points: readonly TempoPointContractV1[],
): { readonly startSeconds: number; readonly endSeconds: number } {
  const start = range.start instanceof Rational ? range.start : Rational.fromWire(range.start);
  const end = range.end instanceof Rational ? range.end : Rational.fromWire(range.end);
  if (end.compare(start) <= 0) throw new RangeError("Beat range must be a non-empty half-open interval.");
  return { startSeconds: beatToSecondsV1(start, points), endSeconds: beatToSecondsV1(end, points) };
}

function prepareTempoMap(points: readonly TempoPointContractV1[]): readonly { id: string; beat: Rational; bpm: number; curve: "step" | "linear" }[] {
  const issues = validateTempoMapV1(points);
  if (issues.length > 0) throw new TypeError(`Invalid tempo map: ${issues.map((issue) => `${issue.code}@${issue.path}`).join(", ")}`);
  return points.map((point) => ({ ...point, beat: Rational.fromWire(point.beat) }));
}

function integrateTempoSegment(
  startBpm: number,
  endBpm: number,
  segmentBeats: number,
  localBeats: number,
  curve: "step" | "linear",
): number {
  if (localBeats < 0 || localBeats > segmentBeats) throw new RangeError("Tempo segment position is outside its segment.");
  if (curve === "step" || startBpm === endBpm) return (60 * localBeats) / startBpm;
  const delta = endBpm - startBpm;
  const relativeChange = (delta * localBeats) / (segmentBeats * startBpm);
  const seconds = (60 * segmentBeats / delta) * Math.log1p(relativeChange);
  if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError("Linear tempo integration produced an invalid result.");
  return seconds;
}

function invertTempoSegment(
  startBpm: number,
  endBpm: number,
  segmentBeats: number,
  seconds: number,
  curve: "step" | "linear",
): number {
  if (curve === "step" || startBpm === endBpm) return (seconds * startBpm) / 60;
  const delta = endBpm - startBpm;
  const exponent = (seconds * delta) / (60 * segmentBeats);
  const beats = (segmentBeats * startBpm * Math.expm1(exponent)) / delta;
  return Math.min(segmentBeats, Math.max(0, beats));
}

