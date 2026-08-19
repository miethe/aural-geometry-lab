export interface LorenzParameters {
  readonly sigma: number;
  readonly rho: number;
  readonly beta: number;
  readonly timeStep: number;
  readonly steps: number;
  readonly initial: readonly [number, number, number];
}

export interface Point3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Fourth-order Runge-Kutta integration for the Lorenz system. */
export function integrateLorenz(parameters: LorenzParameters): readonly Point3D[] {
  validate(parameters);
  const points: Point3D[] = [{
    x: parameters.initial[0],
    y: parameters.initial[1],
    z: parameters.initial[2],
  }];

  for (let index = 1; index < parameters.steps; index += 1) {
    const current = points[index - 1];
    if (current === undefined) {
      throw new Error("Lorenz integration lost its current point.");
    }
    points.push(rungeKuttaStep(current, parameters));
  }
  return points;
}

export function normalizePoints(
  points: readonly Point3D[],
): readonly { readonly x: number; readonly y: number; readonly z: number }[] {
  if (points.length === 0) {
    return [];
  }
  const extents = {
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxY: Math.max(...points.map((point) => point.y)),
    minZ: Math.min(...points.map((point) => point.z)),
    maxZ: Math.max(...points.map((point) => point.z)),
  };
  return points.map((point) => ({
    x: normalize(point.x, extents.minX, extents.maxX),
    y: normalize(point.y, extents.minY, extents.maxY),
    z: normalize(point.z, extents.minZ, extents.maxZ),
  }));
}

function rungeKuttaStep(point: Point3D, parameters: LorenzParameters): Point3D {
  const h = parameters.timeStep;
  const k1 = derivative(point, parameters);
  const k2 = derivative(add(point, k1, h / 2), parameters);
  const k3 = derivative(add(point, k2, h / 2), parameters);
  const k4 = derivative(add(point, k3, h), parameters);
  return {
    x: point.x + (h / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: point.y + (h / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    z: point.z + (h / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z),
  };
}

function derivative(point: Point3D, parameters: LorenzParameters): Point3D {
  return {
    x: parameters.sigma * (point.y - point.x),
    y: point.x * (parameters.rho - point.z) - point.y,
    z: point.x * point.y - parameters.beta * point.z,
  };
}

function add(point: Point3D, delta: Point3D, scale: number): Point3D {
  return {
    x: point.x + delta.x * scale,
    y: point.y + delta.y * scale,
    z: point.z + delta.z * scale,
  };
}

function normalize(value: number, minimum: number, maximum: number): number {
  if (maximum === minimum) {
    return 0.5;
  }
  return (value - minimum) / (maximum - minimum);
}

function validate(parameters: LorenzParameters): void {
  for (const [name, value] of [
    ["sigma", parameters.sigma],
    ["rho", parameters.rho],
    ["beta", parameters.beta],
    ["timeStep", parameters.timeStep],
  ] as const) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`Lorenz ${name} must be positive.`);
    }
  }
  if (!Number.isInteger(parameters.steps) || parameters.steps < 2 || parameters.steps > 100_000) {
    throw new RangeError("Lorenz steps must be an integer from 2 through 100000.");
  }
  if (parameters.initial.some((value) => !Number.isFinite(value))) {
    throw new RangeError("Lorenz initial coordinates must be finite.");
  }
}
