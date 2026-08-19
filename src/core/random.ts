import {
  canonicalEncodeV1,
  sha256HexUtf8,
  stableIdV2,
  STABLE_ID_VERSION_V2
} from "./canonical.js";

export { stableIdV2, STABLE_ID_VERSION_V2 };

/**
 * Legacy 32-bit FNV-1a hash retained only for projects that explicitly declare
 * agl-stable-id-v1 / agl-prng-v1. It is not collision-resistant and must not be
 * used for new persistent entity identity.
 */
export function hashString(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

/** @deprecated Use stableIdV2 for new persistent identities. */
export function stableId(prefix: string, ...parts: readonly unknown[]): string {
  const serialized = parts.map((part) => stableSerializeV1(part)).join("|");
  return `${prefix}_${hashString(serialized).toString(36).padStart(7, "0")}`;
}

/**
 * Legacy mutable-stream PRNG retained for agl-prng-v1 compatibility.
 * Its fork() semantics depend on current draw state and therefore must not be
 * used when stream identity needs to survive evaluation-order changes.
 */
export class SeededRandom {
  private state: number;

  public constructor(seed: string | number) {
    this.state = typeof seed === "number" ? seed >>> 0 : hashString(seed);
    if (this.state === 0) this.state = 0x6d2b79f5;
  }

  public next(): number {
    let value = (this.state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  }

  public integer(minInclusive: number, maxExclusive: number): number {
    validateIntegerBounds(minInclusive, maxExclusive);
    return Math.floor(this.next() * (maxExclusive - minInclusive)) + minInclusive;
  }

  public pick<T>(values: readonly T[]): T {
    if (values.length === 0) throw new RangeError("Cannot select from an empty collection.");
    const value = values[this.integer(0, values.length)];
    if (value === undefined) throw new Error("Random selection failed unexpectedly.");
    return value;
  }

  public fork(label: string): SeededRandom {
    return new SeededRandom(`${this.state}:${label}`);
  }
}

export const PRNG_VERSION_V2 = "agl-prng-v2" as const;
export const PRNG_ALGORITHM_V2 = "agl-mulberry32-named-stream-v2" as const;

/**
 * Versioned named-stream PRNG. Fork identity is derived from immutable root
 * seed + stream path, so adding draws in one branch cannot silently perturb a
 * sibling branch. Integer sampling uses rejection rather than modulo/floating
 * scaling bias.
 */
export class SeededRandomV2 {
  private state: number;
  private readonly rootSeed: string;
  private readonly streamPath: readonly string[];

  public constructor(rootSeed: string, streamPath: readonly string[] = []) {
    if (rootSeed.length === 0 || rootSeed.length > 4096) throw new TypeError("Root seed must contain 1-4096 characters.");
    if (streamPath.length > 256 || streamPath.some((label) => label.length === 0 || label.length > 256)) throw new TypeError("Random stream paths must contain at most 256 labels of 1-256 characters.");
    this.rootSeed = rootSeed;
    this.streamPath = [...streamPath];
    const material = canonicalEncodeV1([
      PRNG_ALGORITHM_V2,
      rootSeed,
      [...streamPath],
    ]);
    this.state = Number.parseInt(sha256HexUtf8(material).slice(0, 8), 16) >>> 0;
  }

  public nextUint32(): number {
    let value = (this.state += 0x6d2b79f5) >>> 0;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  }

  public next(): number {
    return this.nextUint32() / 4_294_967_296;
  }

  public integer(minInclusive: number, maxExclusive: number): number {
    validateIntegerBounds(minInclusive, maxExclusive);
    const span = maxExclusive - minInclusive;
    if (span > 4_294_967_296) {
      throw new RangeError("Random integer span cannot exceed 2^32 in agl-prng-v2.");
    }
    const limit = Math.floor(4_294_967_296 / span) * span;
    let draw: number;
    do draw = this.nextUint32(); while (draw >= limit);
    return minInclusive + (draw % span);
  }

  public pick<T>(values: readonly T[]): T {
    if (values.length === 0) throw new RangeError("Cannot select from an empty collection.");
    const value = values[this.integer(0, values.length)];
    if (value === undefined) throw new Error("Random selection failed unexpectedly.");
    return value;
  }

  public fork(label: string): SeededRandomV2 {
    if (label.length === 0 || label.length > 256) throw new TypeError("Random stream label must contain 1-256 characters.");
    return new SeededRandomV2(this.rootSeed, [...this.streamPath, label]);
  }

  public streamIdentity(): string {
    return stableIdV2("rng", this.rootSeed, [...this.streamPath]);
  }
}

export function stableIdV2FromUnknown(prefix: string, ...parts: readonly unknown[]): string {
  // stableIdV2 performs the authoritative strict canonical-value validation.
  return stableIdV2(prefix, ...parts);
}

function validateIntegerBounds(minInclusive: number, maxExclusive: number): void {
  if (!Number.isSafeInteger(minInclusive) || !Number.isSafeInteger(maxExclusive)) {
    throw new TypeError("Random integer bounds must be safe integers.");
  }
  if (maxExclusive <= minInclusive) {
    throw new RangeError("Random integer max must exceed min.");
  }
}

function stableSerializeV1(value: unknown): string {
  if (value === null || typeof value !== "object") return String(value);
  if (Array.isArray(value)) return `[${value.map(stableSerializeV1).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${key}:${stableSerializeV1(record[key])}`)
    .join(",")}}`;
}

