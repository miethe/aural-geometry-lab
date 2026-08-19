export interface EuclideanRhythmOptions {
  readonly steps: number;
  readonly pulses: number;
  readonly rotation?: number;
}

/**
 * Bjorklund's algorithm: distribute `pulses` as evenly as possible over `steps`.
 * The result is normalized so an onset appears at index zero when pulses > 0,
 * then the requested rotation is applied.
 */
export function euclideanRhythm(options: EuclideanRhythmOptions): readonly boolean[] {
  const { steps, pulses } = options;
  const rotation = options.rotation ?? 0;
  assertIntegerInRange("steps", steps, 1, 256);
  assertIntegerInRange("pulses", pulses, 0, steps);

  if (pulses === 0) {
    return Array<boolean>(steps).fill(false);
  }
  if (pulses === steps) {
    return Array<boolean>(steps).fill(true);
  }

  const counts: number[] = [];
  const remainders: number[] = [pulses];
  let divisor = steps - pulses;
  let level = 0;

  while (true) {
    const remainder = remainders[level];
    if (remainder === undefined) {
      throw new Error("Euclidean rhythm construction lost its remainder state.");
    }
    counts.push(Math.floor(divisor / remainder));
    remainders.push(divisor % remainder);
    divisor = remainder;
    level += 1;
    const nextRemainder = remainders[level];
    if (nextRemainder === undefined || nextRemainder <= 1) {
      break;
    }
  }
  counts.push(divisor);

  const raw: number[] = [];
  const build = (currentLevel: number): void => {
    if (currentLevel === -1) {
      raw.push(0);
      return;
    }
    if (currentLevel === -2) {
      raw.push(1);
      return;
    }

    const count = counts[currentLevel];
    if (count === undefined) {
      throw new Error("Euclidean rhythm construction lost its count state.");
    }
    for (let index = 0; index < count; index += 1) {
      build(currentLevel - 1);
    }
    const remainder = remainders[currentLevel];
    if (remainder !== undefined && remainder !== 0) {
      build(currentLevel - 2);
    }
  };

  build(level);
  const sized = raw.slice(0, steps).map((value) => value === 1);
  const firstOnset = sized.indexOf(true);
  const normalized = rotateBooleanPattern(sized, -firstOnset);
  return rotateBooleanPattern(normalized, rotation);
}

export function rotateBooleanPattern(
  pattern: readonly boolean[],
  rotation: number,
): readonly boolean[] {
  if (pattern.length === 0) {
    return [];
  }
  const normalized = ((rotation % pattern.length) + pattern.length) % pattern.length;
  return pattern.map((_, index) => {
    const sourceIndex = (index - normalized + pattern.length) % pattern.length;
    return pattern[sourceIndex] ?? false;
  });
}

export function cyclicGapLengths(pattern: readonly boolean[]): readonly number[] {
  const onsetIndexes = pattern
    .map((active, index) => (active ? index : -1))
    .filter((index) => index >= 0);
  if (onsetIndexes.length <= 1) {
    return onsetIndexes.length === 0 ? [] : [pattern.length];
  }

  return onsetIndexes.map((index, onsetIndex) => {
    const next = onsetIndexes[(onsetIndex + 1) % onsetIndexes.length];
    if (next === undefined) {
      throw new Error("Gap calculation failed unexpectedly.");
    }
    return next > index ? next - index : pattern.length - index + next;
  });
}

function assertIntegerInRange(
  name: string,
  value: number,
  minimum: number,
  maximum: number,
): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be an integer from ${minimum} through ${maximum}.`);
  }
}
