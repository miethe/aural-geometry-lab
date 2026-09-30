export interface CompositeCycleRing {
  readonly steps: number;
  readonly pattern: readonly boolean[];
}

export interface CompositeCycleAnalysis {
  readonly cycleSteps: number;
  readonly sharedOnsetSteps: number;
  readonly pairwiseAlignments: number;
}

/** Analyze coincident onsets over a bounded least-common-multiple cycle. */
export function analyzeCompositeCycle(
  rings: readonly CompositeCycleRing[],
  maximumCycleSteps = 1_000_000,
): CompositeCycleAnalysis {
  if (!Number.isSafeInteger(maximumCycleSteps) || maximumCycleSteps < 1) {
    throw new RangeError("The composite-cycle bound must be a positive safe integer.");
  }
  if (rings.length === 0) {
    return { cycleSteps: 0, sharedOnsetSteps: 0, pairwiseAlignments: 0 };
  }

  let cycleSteps = 1;
  for (const ring of rings) {
    if (!Number.isSafeInteger(ring.steps) || ring.steps < 1 || ring.pattern.length !== ring.steps || ring.pattern.some((step) => typeof step !== "boolean")) {
      throw new RangeError("Each ring must have a positive integer length matching its pattern.");
    }
    cycleSteps = leastCommonMultiple(cycleSteps, ring.steps);
    if (cycleSteps > maximumCycleSteps) {
      throw new RangeError(`Composite cycle exceeds the ${maximumCycleSteps}-step analysis bound.`);
    }
  }

  let sharedOnsetSteps = 0;
  let pairwiseAlignments = 0;
  for (let step = 0; step < cycleSteps; step += 1) {
    let activeRings = 0;
    for (const ring of rings) {
      if (ring.pattern[step % ring.steps] === true) activeRings += 1;
    }
    if (activeRings > 1) {
      sharedOnsetSteps += 1;
      pairwiseAlignments += activeRings * (activeRings - 1) / 2;
    }
  }
  return { cycleSteps, sharedOnsetSteps, pairwiseAlignments };
}

function greatestCommonDivisor(left: number, right: number): number {
  let a = left;
  let b = right;
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function leastCommonMultiple(left: number, right: number): number {
  return left / greatestCommonDivisor(left, right) * right;
}
