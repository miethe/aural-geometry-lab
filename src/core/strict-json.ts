import { assertWellFormedUnicodeV1 } from "./canonical.js";

export const STRICT_JSON_VERSION_V1 = "agl-strict-json-v1" as const;

export interface StrictJsonLimitsV1 {
  readonly maximumDepth: number;
  readonly maximumNodes: number;
  readonly maximumStringBytes: number;
  readonly maximumArrayLength: number;
  readonly maximumObjectKeys: number;
}

export const DEFAULT_STRICT_JSON_LIMITS_V1: StrictJsonLimitsV1 = {
  maximumDepth: 128,
  maximumNodes: 2_000_000,
  maximumStringBytes: 16 * 1024 * 1024,
  maximumArrayLength: 1_000_000,
  maximumObjectKeys: 1_000_000,
};

/**
 * Parse UTF-8 JSON while rejecting duplicate object names, non-finite/lossy
 * integers, malformed Unicode scalar sequences, excessive nesting, and
 * oversized collections. JSON.parse alone cannot detect duplicate names.
 */
export function parseStrictJsonUtf8V1(
  bytes: Uint8Array,
  limits: StrictJsonLimitsV1 = DEFAULT_STRICT_JSON_LIMITS_V1,
): unknown {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return parseStrictJsonTextV1(text, limits);
}

export function parseStrictJsonTextV1(
  text: string,
  limits: StrictJsonLimitsV1 = DEFAULT_STRICT_JSON_LIMITS_V1,
): unknown {
  validateLimits(limits);
  const parser = new StrictJsonParserV1(text, limits);
  return parser.parse();
}

class StrictJsonParserV1 {
  private index = 0;
  private nodes = 0;
  public constructor(private readonly text: string, private readonly limits: StrictJsonLimitsV1) {}

  public parse(): unknown {
    this.skipWhitespace();
    const value = this.parseValue(0);
    this.skipWhitespace();
    if (this.index !== this.text.length) this.fail("Unexpected trailing JSON content.");
    return value;
  }

  private parseValue(depth: number): unknown {
    this.nodes += 1;
    if (this.nodes > this.limits.maximumNodes) this.fail("JSON exceeds the node-count safety limit.");
    if (depth > this.limits.maximumDepth) this.fail("JSON exceeds the nesting-depth safety limit.");
    const char = this.text[this.index];
    if (char === '"') return this.parseString();
    if (char === "{") return this.parseObject(depth + 1);
    if (char === "[") return this.parseArray(depth + 1);
    if (char === "t") return this.parseLiteral("true", true);
    if (char === "f") return this.parseLiteral("false", false);
    if (char === "n") return this.parseLiteral("null", null);
    if (char === "-" || (char !== undefined && char >= "0" && char <= "9")) return this.parseNumber();
    this.fail("Expected a JSON value.");
  }

  private parseObject(depth: number): Record<string, unknown> {
    this.index += 1;
    this.skipWhitespace();
    const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    const keys = new Set<string>();
    if (this.text[this.index] === "}") { this.index += 1; return result; }
    while (true) {
      if (this.text[this.index] !== '"') this.fail("Expected an object member name.");
      const key = this.parseString();
      if (keys.has(key)) this.fail(`Duplicate JSON object member ${JSON.stringify(key)}.`);
      keys.add(key);
      if (keys.size > this.limits.maximumObjectKeys) this.fail("JSON object exceeds the key-count safety limit.");
      this.skipWhitespace();
      if (this.text[this.index] !== ":") this.fail("Expected ':' after object member name.");
      this.index += 1;
      this.skipWhitespace();
      result[key] = this.parseValue(depth);
      this.skipWhitespace();
      const next = this.text[this.index];
      if (next === "}") { this.index += 1; return result; }
      if (next !== ",") this.fail("Expected ',' or '}' in object.");
      this.index += 1;
      this.skipWhitespace();
    }
  }

  private parseArray(depth: number): unknown[] {
    this.index += 1;
    this.skipWhitespace();
    const result: unknown[] = [];
    if (this.text[this.index] === "]") { this.index += 1; return result; }
    while (true) {
      if (result.length >= this.limits.maximumArrayLength) this.fail("JSON array exceeds the length safety limit.");
      result.push(this.parseValue(depth));
      this.skipWhitespace();
      const next = this.text[this.index];
      if (next === "]") { this.index += 1; return result; }
      if (next !== ",") this.fail("Expected ',' or ']' in array.");
      this.index += 1;
      this.skipWhitespace();
    }
  }

  private parseString(): string {
    const start = this.index;
    this.index += 1;
    let escaped = false;
    while (this.index < this.text.length) {
      const code = this.text.charCodeAt(this.index);
      if (!escaped && code === 0x22) {
        this.index += 1;
        const token = this.text.slice(start, this.index);
        const value = JSON.parse(token) as string;
        assertWellFormedUnicodeV1(value);
        if (new TextEncoder().encode(value).length > this.limits.maximumStringBytes) this.fail("JSON string exceeds the byte-length safety limit.");
        return value;
      }
      if (!escaped && code < 0x20) this.fail("Unescaped control character in JSON string.");
      if (!escaped && code === 0x5c) escaped = true;
      else escaped = false;
      this.index += 1;
    }
    this.fail("Unterminated JSON string.");
  }

  private parseNumber(): number {
    const rest = this.text.slice(this.index);
    const match = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(rest);
    if (match === null) this.fail("Invalid JSON number.");
    const token = match[0];
    this.index += token.length;
    const value = Number(token);
    if (!Number.isFinite(value)) this.fail("JSON number is not a finite binary64 value.");
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) this.fail("JSON integers outside the safe interoperable range must be encoded as decimal strings.");
    return value;
  }

  private parseLiteral<T>(token: string, value: T): T {
    if (!this.text.startsWith(token, this.index)) this.fail(`Invalid JSON literal; expected ${token}.`);
    this.index += token.length;
    return value;
  }

  private skipWhitespace(): void {
    while (this.index < this.text.length && /[\t\n\r ]/.test(this.text[this.index]!)) this.index += 1;
  }

  private fail(message: string): never {
    throw new SyntaxError(`${message} At UTF-16 offset ${this.index}.`);
  }
}

function validateLimits(limits: StrictJsonLimitsV1): void {
  for (const [name, value] of Object.entries(limits)) if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`Strict JSON limit ${name} must be a positive safe integer.`);
}
