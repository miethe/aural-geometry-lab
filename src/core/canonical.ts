/**
 * Versioned, language-neutral canonical encoding used for semantic digests and
 * persistent identifier inputs. This is intentionally stricter than JSON:
 * unsupported values, cycles, non-finite numbers, and non-plain objects fail.
 */

export const CANONICAL_ENCODING_VERSION = "agl-canonical-value-v1" as const;
export const CANONICAL_DIGEST_VERSION = "sha256-canonical-v1" as const;
export const STABLE_ID_VERSION_V2 = "agl-stable-id-v2" as const;

export type CanonicalScalar = null | boolean | string | number | bigint;
export type CanonicalValue =
  | CanonicalScalar
  | readonly CanonicalValue[]
  | { readonly [key: string]: CanonicalValue };

const textEncoder = new TextEncoder();

export interface CanonicalEncodingLimitsV1 {
  readonly maximumDepth: number;
  readonly maximumNodes: number;
  readonly maximumStringBytes: number;
  readonly maximumArrayLength: number;
  readonly maximumObjectKeys: number;
  readonly maximumEncodedBytes: number;
}

export const DEFAULT_CANONICAL_ENCODING_LIMITS_V1: CanonicalEncodingLimitsV1 = {
  maximumDepth: 256,
  maximumNodes: 2_000_000,
  maximumStringBytes: 16 * 1024 * 1024,
  maximumArrayLength: 1_000_000,
  maximumObjectKeys: 1_000_000,
  maximumEncodedBytes: 512 * 1024 * 1024,
};

interface CanonicalEncodingContextV1 {
  readonly limits: CanonicalEncodingLimitsV1;
  nodes: number;
  encodedBytes: number;
}

export function canonicalEncodeV1(
  value: unknown,
  limits: CanonicalEncodingLimitsV1 = DEFAULT_CANONICAL_ENCODING_LIMITS_V1,
): string {
  validateCanonicalLimitsV1(limits);
  return encodeValue(value, new WeakSet<object>(), { limits, nodes: 0, encodedBytes: 0 }, 0);
}

export function canonicalDigestV1(
  value: unknown,
  limits: CanonicalEncodingLimitsV1 = DEFAULT_CANONICAL_ENCODING_LIMITS_V1,
): string {
  return `sha256:${sha256HexUtf8(canonicalEncodeV1(value, limits))}`;
}

export function stableIdV2(prefix: string, ...parts: readonly unknown[]): string {
  if (!/^[A-Za-z][A-Za-z0-9._-]{0,63}$/.test(prefix)) {
    throw new TypeError(
      "Stable ID prefix must be 1-64 portable identifier characters and start with a letter.",
    );
  }
  const digest = sha256HexUtf8(canonicalEncodeV1(parts));
  return `${prefix}~2~${digest}`;
}

export function isCanonicalDigest(value: string): boolean {
  return /^sha256:[a-f0-9]{64}$/.test(value);
}

/** Preferred semantic name for sha256-prefixed digests. */
export const isSha256Digest = isCanonicalDigest;

export function sha256HexUtf8(value: string): string {
  return sha256Hex(textEncoder.encode(value));
}

/** Pure synchronous SHA-256 for browser, Worker, Node, and Swift-vector parity. */
export function sha256Hex(bytes: Uint8Array): string {
  const constants = SHA256_CONSTANTS;
  const bitLength = BigInt(bytes.length) * 8n;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  for (let index = 0; index < 8; index += 1) {
    padded[paddedLength - 1 - index] = Number((bitLength >> BigInt(index * 8)) & 0xffn);
  }

  const hash = new Uint32Array(SHA256_INITIAL);
  const words = new Uint32Array(64);
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4, false);
    }
    for (let index = 16; index < 64; index += 1) {
      const w15 = words[index - 15]!;
      const w2 = words[index - 2]!;
      const s0 = rotateRight(w15, 7) ^ rotateRight(w15, 18) ^ (w15 >>> 3);
      const s1 = rotateRight(w2, 17) ^ rotateRight(w2, 19) ^ (w2 >>> 10);
      words[index] = add32(words[index - 16]!, s0, words[index - 7]!, s1);
    }

    let a = hash[0]!;
    let b = hash[1]!;
    let c = hash[2]!;
    let d = hash[3]!;
    let e = hash[4]!;
    let f = hash[5]!;
    let g = hash[6]!;
    let h = hash[7]!;

    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temporary1 = add32(h, sum1, choice, constants[index]!, words[index]!);
      const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temporary2 = add32(sum0, majority);
      h = g;
      g = f;
      f = e;
      e = add32(d, temporary1);
      d = c;
      c = b;
      b = a;
      a = add32(temporary1, temporary2);
    }

    hash[0] = add32(hash[0]!, a);
    hash[1] = add32(hash[1]!, b);
    hash[2] = add32(hash[2]!, c);
    hash[3] = add32(hash[3]!, d);
    hash[4] = add32(hash[4]!, e);
    hash[5] = add32(hash[5]!, f);
    hash[6] = add32(hash[6]!, g);
    hash[7] = add32(hash[7]!, h);
  }

  return [...hash].map((value) => value.toString(16).padStart(8, "0")).join("");
}

export function compareUtf8(left: string, right: string): number {
  const a = textEncoder.encode(left);
  const b = textEncoder.encode(right);
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const difference = a[index]! - b[index]!;
    if (difference !== 0) return difference;
  }
  return a.length - b.length;
}

function encodeValue(
  value: unknown,
  ancestors: WeakSet<object>,
  context: CanonicalEncodingContextV1,
  depth: number,
): string {
  context.nodes += 1;
  if (context.nodes > context.limits.maximumNodes) throw new RangeError("Canonical value exceeds the node-count safety limit.");
  if (depth > context.limits.maximumDepth) throw new RangeError("Canonical value exceeds the nesting-depth safety limit.");
  if (value === null) { consumeEncodedBytesV1(context, 2); return "n;"; }
  switch (typeof value) {
    case "boolean":
      consumeEncodedBytesV1(context, 3);
      return value ? "b1;" : "b0;";
    case "string": {
      assertWellFormedUnicodeV1(value);
      const byteLength = textEncoder.encode(value).length;
      if (byteLength > context.limits.maximumStringBytes) throw new RangeError("Canonical string exceeds the byte-length safety limit.");
      const prefix = `s${byteLength}:`;
      consumeEncodedBytesV1(context, prefix.length + byteLength);
      return `${prefix}${value}`;
    }
    case "bigint": {
      const encoded = `i${value.toString()};`;
      consumeEncodedBytesV1(context, encoded.length);
      return encoded;
    }
    case "number": {
      const encoded = encodeNumber(value);
      consumeEncodedBytesV1(context, encoded.length);
      return encoded;
    }
    case "undefined":
    case "function":
    case "symbol":
      throw new TypeError(`Unsupported canonical value type: ${typeof value}.`);
    case "object":
      break;
  }

  if (ancestors.has(value)) throw new TypeError("Canonical values cannot contain cycles.");
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (value.length > context.limits.maximumArrayLength) throw new RangeError("Canonical array exceeds the length safety limit.");
      // Sparse arrays, custom properties, accessors, and symbol keys are not JSON-like
      // values and can otherwise create canonical-encoding collisions.
      const ownKeys = Reflect.ownKeys(value);
      const expectedKeys = new Set(["length", ...Array.from({ length: value.length }, (_, index) => String(index))]);
      if (ownKeys.length !== expectedKeys.size || ownKeys.some((key) => typeof key !== "string" || !expectedKeys.has(key))) {
        throw new TypeError("Canonical arrays must be dense and cannot contain custom or symbol properties.");
      }
      const encoded: string[] = [];
      for (let index = 0; index < value.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (descriptor === undefined || !("value" in descriptor) || !descriptor.enumerable) {
          throw new TypeError("Canonical arrays must contain enumerable data properties at every index.");
        }
        encoded.push(encodeValue(descriptor.value, ancestors, context, depth + 1));
      }
      const prefix = `a${value.length}:[`;
      consumeEncodedBytesV1(context, prefix.length + 1);
      return `${prefix}${encoded.join("")}]`;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Canonical objects must be plain records. Convert class instances explicitly.");
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key === "symbol")) {
      throw new TypeError("Canonical objects cannot contain symbol-keyed properties.");
    }
    const keys = (ownKeys as string[]).sort(compareUtf8);
    if (keys.length > context.limits.maximumObjectKeys) throw new RangeError("Canonical object exceeds the key-count safety limit.");
    for (const key of keys) {
      assertWellFormedUnicodeV1(key);
      const descriptor = descriptors[key];
      if (descriptor === undefined || !("value" in descriptor) || !descriptor.enumerable) {
        throw new TypeError("Canonical objects require enumerable data properties and cannot contain accessors.");
      }
    }
    const prefix = `o${keys.length}:{`;
    consumeEncodedBytesV1(context, prefix.length + 1);
    return `${prefix}${keys
      .map((key) => `${encodeValue(key, ancestors, context, depth + 1)}${encodeValue(descriptors[key]!.value, ancestors, context, depth + 1)}`)
      .join("")}}`;
  } finally {
    ancestors.delete(value);
  }
}

function encodeNumber(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError("Canonical numbers must be finite.");
  // Normalize negative zero because AGL project semantics never distinguish it.
  const normalized = Object.is(value, -0) ? 0 : value;
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setFloat64(0, normalized, false);
  return `f${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")};`;
}

export function assertWellFormedUnicodeV1(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new TypeError("Canonical strings cannot contain unpaired UTF-16 surrogate code units.");
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError("Canonical strings cannot contain unpaired UTF-16 surrogate code units.");
    }
  }
}

function validateCanonicalLimitsV1(limits: CanonicalEncodingLimitsV1): void {
  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`Canonical encoding limit ${name} must be a positive safe integer.`);
  }
}

function consumeEncodedBytesV1(context: CanonicalEncodingContextV1, amount: number): void {
  context.encodedBytes += amount;
  if (!Number.isSafeInteger(context.encodedBytes) || context.encodedBytes > context.limits.maximumEncodedBytes) {
    throw new RangeError("Canonical encoding exceeds the output-size safety limit.");
  }
}

function rotateRight(value: number, bits: number): number {
  return ((value >>> bits) | (value << (32 - bits))) >>> 0;
}

function add32(...values: readonly number[]): number {
  let result = 0;
  for (const value of values) result = (result + value) >>> 0;
  return result;
}

const SHA256_INITIAL = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

const SHA256_CONSTANTS = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);
