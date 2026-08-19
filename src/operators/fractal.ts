export interface FractalMotifParameters {
  readonly seedDegrees: readonly number[];
  readonly depth: number;
  readonly totalBeats: number;
  readonly rootMidi: number;
  readonly pitchScale?: number;
  readonly maxEvents?: number;
}

export interface FractalMotifEvent {
  readonly index: number;
  readonly beat: number;
  readonly durationBeats: number;
  readonly midi: number;
  readonly generation: number;
  readonly path: readonly number[];
}

/**
 * Recursively nests a motif inside each event interval. The output remains
 * deterministic and bounded by maxEvents, making it safe for live preview.
 */
export function generateFractalMotif(
  parameters: FractalMotifParameters,
): readonly FractalMotifEvent[] {
  validateParameters(parameters);
  const maxEvents = parameters.maxEvents ?? 4_096;
  const pitchScale = parameters.pitchScale ?? 1;
  const estimated = parameters.seedDegrees.length ** parameters.depth;
  if (estimated > maxEvents) {
    throw new RangeError(
      `Fractal motif would create ${estimated} events; limit is ${maxEvents}.`,
    );
  }

  const result: FractalMotifEvent[] = [];
  const recurse = (
    beat: number,
    durationBeats: number,
    midi: number,
    generation: number,
    path: readonly number[],
  ): void => {
    if (generation >= parameters.depth) {
      result.push({
        index: result.length,
        beat,
        durationBeats: Math.max(durationBeats * 0.82, 0.015625),
        midi: Math.round(midi),
        generation,
        path,
      });
      return;
    }

    const childDuration = durationBeats / parameters.seedDegrees.length;
    parameters.seedDegrees.forEach((degree, childIndex) => {
      recurse(
        beat + childDuration * childIndex,
        childDuration,
        midi + degree * pitchScale,
        generation + 1,
        [...path, childIndex],
      );
    });
  };

  recurse(0, parameters.totalBeats, parameters.rootMidi, 0, []);
  return result;
}

function validateParameters(parameters: FractalMotifParameters): void {
  if (parameters.seedDegrees.length < 2 || parameters.seedDegrees.length > 8) {
    throw new RangeError("Fractal seed must contain 2 through 8 degrees.");
  }
  if (parameters.seedDegrees.some((degree) => !Number.isFinite(degree))) {
    throw new RangeError("Fractal seed degrees must be finite.");
  }
  if (!Number.isInteger(parameters.depth) || parameters.depth < 1 || parameters.depth > 8) {
    throw new RangeError("Fractal depth must be an integer from 1 through 8.");
  }
  if (!Number.isFinite(parameters.totalBeats) || parameters.totalBeats <= 0) {
    throw new RangeError("Fractal total beats must be positive.");
  }
  if (!Number.isFinite(parameters.rootMidi) || parameters.rootMidi < 0 || parameters.rootMidi > 127) {
    throw new RangeError("Fractal root MIDI note must be from 0 through 127.");
  }
}
