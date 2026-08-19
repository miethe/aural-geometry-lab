export const RATIONAL_WIRE_VERSION = "agl-rational-wire-v1" as const;
export const DEFAULT_MAX_RATIONAL_DIGITS = 4096;

export interface RationalWireLike {
  readonly numerator: string;
  readonly denominator: string;
}

/** An exact rational number used for musical beat positions and durations. */
export class Rational {
  public readonly numerator: bigint;
  public readonly denominator: bigint;

  public constructor(numerator: bigint | number, denominator: bigint | number = 1n) {
    const n = typeof numerator === "bigint" ? numerator : safeIntegerToBigInt(numerator, "numerator");
    const d = typeof denominator === "bigint" ? denominator : safeIntegerToBigInt(denominator, "denominator");
    if (d === 0n) throw new RangeError("Rational denominator cannot be zero.");

    const sign = d < 0n ? -1n : 1n;
    const divisor = greatestCommonDivisor(absBigInt(n), absBigInt(d));
    this.numerator = (n * sign) / divisor;
    this.denominator = (d * sign) / divisor;
  }

  public static zero(): Rational { return new Rational(0n); }
  public static one(): Rational { return new Rational(1n); }

  public static from(value: Rational | bigint | number | string): Rational {
    if (value instanceof Rational) return value;
    if (typeof value === "bigint") return new Rational(value);
    if (typeof value === "number") return new Rational(safeIntegerToBigInt(value, "value"));
    return Rational.parse(value);
  }

  /** Explicitly approximate conversion from a binary64 number. */
  public static fromApproximateNumber(value: number, precision = 1_000_000): Rational {
    if (!Number.isFinite(value)) throw new RangeError("Rational values must be finite.");
    if (!Number.isSafeInteger(precision) || precision < 1) {
      throw new RangeError("Rational approximation precision must be a positive safe integer.");
    }
    if (Number.isSafeInteger(value)) return new Rational(BigInt(value));
    const scaled = Math.round(value * precision);
    if (!Number.isSafeInteger(scaled)) {
      throw new RangeError("Approximate rational conversion exceeds the safe integer range.");
    }
    return new Rational(BigInt(scaled), BigInt(precision));
  }

  /** @deprecated Prefer fromApproximateNumber to make approximation explicit. */
  public static fromNumber(value: number, precision = 1_000_000): Rational {
    return Rational.fromApproximateNumber(value, precision);
  }

  /** Parses integer, fraction, decimal, or scientific notation exactly. */
  public static parse(value: string): Rational {
    const trimmed = value.trim();
    if (trimmed.length === 0) throw new TypeError("Cannot parse an empty rational value.");
    if (trimmed.includes("/")) {
      const match = /^([+-]?\d+)\s*\/\s*([+-]?\d+)$/.exec(trimmed);
      if (match === null) throw new TypeError(`Invalid rational: ${value}`);
      return new Rational(BigInt(match[1]!), BigInt(match[2]!));
    }
    return parseExactDecimal(trimmed);
  }

  public static fromWire(wire: RationalWireLike, maximumDigits = DEFAULT_MAX_RATIONAL_DIGITS): Rational {
    const issues = validateCanonicalRationalWire(wire, maximumDigits);
    if (issues.length > 0) throw new TypeError(`Invalid canonical rational wire: ${issues.join(" ")}`);
    return new Rational(BigInt(wire.numerator), BigInt(wire.denominator));
  }

  public add(other: Rational | bigint | number | string): Rational {
    const rhs = Rational.from(other);
    return new Rational(this.numerator * rhs.denominator + rhs.numerator * this.denominator, this.denominator * rhs.denominator);
  }

  public subtract(other: Rational | bigint | number | string): Rational {
    const rhs = Rational.from(other);
    return new Rational(this.numerator * rhs.denominator - rhs.numerator * this.denominator, this.denominator * rhs.denominator);
  }

  public multiply(other: Rational | bigint | number | string): Rational {
    const rhs = Rational.from(other);
    return new Rational(this.numerator * rhs.numerator, this.denominator * rhs.denominator);
  }

  public divide(other: Rational | bigint | number | string): Rational {
    const rhs = Rational.from(other);
    if (rhs.numerator === 0n) throw new RangeError("Cannot divide a rational by zero.");
    return new Rational(this.numerator * rhs.denominator, this.denominator * rhs.numerator);
  }

  public modulo(other: Rational | bigint | number | string): Rational {
    const rhs = Rational.from(other);
    if (rhs.numerator === 0n) throw new RangeError("Cannot take a rational modulo zero.");
    return this.subtract(rhs.multiply(this.divide(rhs).floor()));
  }

  public floor(): bigint {
    if (this.numerator >= 0n) return this.numerator / this.denominator;
    return -((-this.numerator + this.denominator - 1n) / this.denominator);
  }

  public compare(other: Rational | bigint | number | string): -1 | 0 | 1 {
    const rhs = Rational.from(other);
    const difference = this.numerator * rhs.denominator - rhs.numerator * this.denominator;
    return difference < 0n ? -1 : difference > 0n ? 1 : 0;
  }

  public equals(other: Rational | bigint | number | string): boolean { return this.compare(other) === 0; }

  public toNumber(): number {
    const result = Number(this.numerator) / Number(this.denominator);
    if (!Number.isFinite(result)) throw new RangeError("Rational cannot be represented as a finite binary64 value.");
    return result;
  }

  public toString(): string {
    return this.denominator === 1n ? this.numerator.toString() : `${this.numerator}/${this.denominator}`;
  }

  public toJSON(): RationalWireLike {
    return { numerator: this.numerator.toString(), denominator: this.denominator.toString() };
  }
}

export function validateCanonicalRationalWire(
  value: RationalWireLike | unknown,
  maximumDigits = DEFAULT_MAX_RATIONAL_DIGITS,
): readonly string[] {
  const issues: string[] = [];
  if (!Number.isSafeInteger(maximumDigits) || maximumDigits < 1) {
    throw new RangeError("maximumDigits must be a positive safe integer.");
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return ["Rational wire must be an object."];
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return ["Rational wire must be a plain object."];
  const wire = value as Record<string, unknown>;
  for (const key of Object.keys(wire)) if (key !== "numerator" && key !== "denominator") issues.push(`Unknown rational wire field: ${key}.`);
  if (typeof wire.numerator !== "string" || !/^-?(0|[1-9][0-9]*)$/.test(wire.numerator)) issues.push("Numerator is not canonical decimal integer syntax.");
  if (typeof wire.denominator !== "string" || !/^[1-9][0-9]*$/.test(wire.denominator)) issues.push("Denominator must be a canonical positive decimal integer.");
  if (issues.length > 0) return issues;
  const numerator = wire.numerator as string;
  const denominator = wire.denominator as string;
  const numeratorDigits = numerator.startsWith("-") ? numerator.length - 1 : numerator.length;
  if (numeratorDigits > maximumDigits || denominator.length > maximumDigits) {
    issues.push(`Rational components exceed the ${maximumDigits}-digit hostile-input limit.`);
  }
  if (issues.length > 0) return issues;
  try {
    const canonical = new Rational(BigInt(numerator), BigInt(denominator)).toJSON();
    if (canonical.numerator !== numerator || canonical.denominator !== denominator) {
      issues.push(`Rational wire is not normalized; canonical form is ${canonical.numerator}/${canonical.denominator}.`);
    }
  } catch (error) {
    issues.push(error instanceof Error ? error.message : String(error));
  }
  return issues;
}

function parseExactDecimal(value: string): Rational {
  const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(value);
  if (match === null) throw new TypeError(`Invalid rational decimal: ${value}`);
  const sign = match[1] === "-" ? -1n : 1n;
  const integerDigits = match[2]!;
  const fractionalDigits = match[3] ?? "";
  const exponentText = match[4] ?? "0";
  if (integerDigits.length + fractionalDigits.length > DEFAULT_MAX_RATIONAL_DIGITS) {
    throw new RangeError("Rational decimal exceeds the hostile-input digit limit.");
  }
  const exponent = Number(exponentText);
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > DEFAULT_MAX_RATIONAL_DIGITS) {
    throw new RangeError("Rational decimal exponent exceeds the hostile-input limit.");
  }
  const combined = `${integerDigits}${fractionalDigits}`.replace(/^0+(?=\d)/, "");
  let numerator = sign * BigInt(combined || "0");
  const decimalScale = fractionalDigits.length - exponent;
  if (decimalScale <= 0) {
    numerator *= 10n ** BigInt(-decimalScale);
    return new Rational(numerator);
  }
  return new Rational(numerator, 10n ** BigInt(decimalScale));
}

function safeIntegerToBigInt(value: number, label: string): bigint {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`Rational ${label} supplied as number must be a safe integer.`);
  }
  return BigInt(value);
}

function absBigInt(value: bigint): bigint { return value < 0n ? -value : value; }

function greatestCommonDivisor(left: bigint, right: bigint): bigint {
  let a = left;
  let b = right;
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a === 0n ? 1n : a;
}
