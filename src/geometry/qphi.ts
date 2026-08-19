/** Exact element of Q(phi), where phi = (1 + sqrt(5)) / 2. */
export class QPhi {
  public readonly a: bigint;
  public readonly b: bigint;
  public readonly denominator: bigint;

  public constructor(
    a: bigint | number,
    b: bigint | number = 0n,
    denominator: bigint | number = 1n,
  ) {
    let aa = typeof a === "bigint" ? a : BigInt(a);
    let bb = typeof b === "bigint" ? b : BigInt(b);
    let dd = typeof denominator === "bigint" ? denominator : BigInt(denominator);
    if (dd === 0n) {
      throw new RangeError("Q(phi) denominator cannot be zero.");
    }
    if (dd < 0n) {
      aa = -aa;
      bb = -bb;
      dd = -dd;
    }
    const divisor = gcd3(abs(aa), abs(bb), dd);
    this.a = aa / divisor;
    this.b = bb / divisor;
    this.denominator = dd / divisor;
  }

  public static phi(): QPhi {
    return new QPhi(0n, 1n);
  }

  public add(other: QPhi): QPhi {
    return new QPhi(
      this.a * other.denominator + other.a * this.denominator,
      this.b * other.denominator + other.b * this.denominator,
      this.denominator * other.denominator,
    );
  }

  public subtract(other: QPhi): QPhi {
    return new QPhi(
      this.a * other.denominator - other.a * this.denominator,
      this.b * other.denominator - other.b * this.denominator,
      this.denominator * other.denominator,
    );
  }

  public multiply(other: QPhi): QPhi {
    // phi^2 = phi + 1
    const constant = this.a * other.a + this.b * other.b;
    const phiCoefficient =
      this.a * other.b + this.b * other.a + this.b * other.b;
    return new QPhi(
      constant,
      phiCoefficient,
      this.denominator * other.denominator,
    );
  }

  public negate(): QPhi {
    return new QPhi(-this.a, -this.b, this.denominator);
  }

  public compare(other: QPhi): -1 | 0 | 1 {
    return this.subtract(other).sign();
  }

  public sign(): -1 | 0 | 1 {
    // 2(a + b*phi) = (2a+b) + b*sqrt(5)
    const A = 2n * this.a + this.b;
    const B = this.b;
    if (A === 0n && B === 0n) {
      return 0;
    }
    if (B === 0n) {
      return A < 0n ? -1 : 1;
    }
    if (A === 0n) {
      return B < 0n ? -1 : 1;
    }
    if (A > 0n && B > 0n) {
      return 1;
    }
    if (A < 0n && B < 0n) {
      return -1;
    }
    const aSquared = A * A;
    const fiveBSquared = 5n * B * B;
    if (A > 0n && B < 0n) {
      return aSquared > fiveBSquared ? 1 : -1;
    }
    return fiveBSquared > aSquared ? 1 : -1;
  }

  public compareInteger(value: bigint): -1 | 0 | 1 {
    return new QPhi(
      this.a - value * this.denominator,
      this.b,
      this.denominator,
    ).sign();
  }

  public floor(): bigint {
    const lowerNumerator = this.b >= 0n ? this.a + this.b : this.a + 2n * this.b;
    const upperNumerator = this.b >= 0n ? this.a + 2n * this.b : this.a + this.b;
    let low = floorDiv(lowerNumerator, this.denominator) - 1n;
    let high = floorDiv(upperNumerator, this.denominator) + 2n;
    while (low + 1n < high) {
      const middle = floorDiv(low + high, 2n);
      if (this.compareInteger(middle) >= 0) {
        low = middle;
      } else {
        high = middle;
      }
    }
    return low;
  }

  public ceil(): bigint {
    const floor = this.floor();
    return this.compareInteger(floor) === 0 ? floor : floor + 1n;
  }

  public isAlgebraicInteger(): boolean {
    return this.denominator === 1n;
  }

  public toNumber(): number {
    const phi = (1 + Math.sqrt(5)) / 2;
    const value = (Number(this.a) + Number(this.b) * phi) / Number(this.denominator);
    if (!Number.isFinite(value)) throw new RangeError("Q(phi) projection exceeds the finite Float64 rendering domain.");
    return value;
  }

  public toString(): string {
    return `(${this.a.toString()} + ${this.b.toString()}φ)/${this.denominator.toString()}`;
  }

  public toJSON(): { readonly a: string; readonly b: string; readonly denominator: string } {
    return {
      a: this.a.toString(),
      b: this.b.toString(),
      denominator: this.denominator.toString(),
    };
  }
}

function floorDiv(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) {
    throw new RangeError("floorDiv denominator must be positive.");
  }
  if (numerator >= 0n) {
    return numerator / denominator;
  }
  return -((-numerator + denominator - 1n) / denominator);
}

function abs(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function gcd(left: bigint, right: bigint): bigint {
  let a = left;
  let b = right;
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a === 0n ? 1n : a;
}

function gcd3(first: bigint, second: bigint, third: bigint): bigint {
  return gcd(gcd(first, second), third);
}
