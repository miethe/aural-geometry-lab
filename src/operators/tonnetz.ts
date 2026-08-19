export interface TonnetzCoordinate {
  readonly q: number;
  readonly r: number;
}

export interface TonnetzNode extends TonnetzCoordinate {
  readonly pitchClass: number;
  readonly label: string;
}

export type TriadQuality = "major" | "minor";

const PITCH_CLASS_NAMES = [
  "C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B",
] as const;

/** A fifth axis (q) crossed with a major-third axis (r). */
export function tonnetzPitchClass(
  coordinate: TonnetzCoordinate,
  originPitchClass = 0,
): number {
  return modulo(originPitchClass + 7 * coordinate.q + 4 * coordinate.r, 12);
}

export function tonnetzNode(
  coordinate: TonnetzCoordinate,
  originPitchClass = 0,
): TonnetzNode {
  const pitchClass = tonnetzPitchClass(coordinate, originPitchClass);
  return {
    ...coordinate,
    pitchClass,
    label: PITCH_CLASS_NAMES[pitchClass] ?? String(pitchClass),
  };
}

export function tonnetzGrid(radius: number, originPitchClass = 0): readonly TonnetzNode[] {
  if (!Number.isInteger(radius) || radius < 1 || radius > 8) {
    throw new RangeError("Tonnetz radius must be an integer from 1 through 8.");
  }
  const nodes: TonnetzNode[] = [];
  for (let q = -radius; q <= radius; q += 1) {
    for (let r = -radius; r <= radius; r += 1) {
      if (Math.abs(q + r) <= radius) {
        nodes.push(tonnetzNode({ q, r }, originPitchClass));
      }
    }
  }
  return nodes;
}

export function triadPitchClasses(rootPitchClass: number, quality: TriadQuality): readonly number[] {
  const third = quality === "major" ? 4 : 3;
  return [modulo(rootPitchClass, 12), modulo(rootPitchClass + third, 12), modulo(rootPitchClass + 7, 12)];
}

export function voiceTriad(
  rootPitchClass: number,
  quality: TriadQuality,
  centerMidi = 60,
): readonly number[] {
  const root = nearestMidiForPitchClass(rootPitchClass, centerMidi);
  const third = quality === "major" ? 4 : 3;
  return [root, root + third, root + 7];
}

export function nearestMidiForPitchClass(pitchClass: number, centerMidi: number): number {
  const normalizedPitchClass = modulo(pitchClass, 12);
  const octaveBase = Math.floor(centerMidi / 12) * 12;
  const candidates = [
    octaveBase - 12 + normalizedPitchClass,
    octaveBase + normalizedPitchClass,
    octaveBase + 12 + normalizedPitchClass,
  ];
  return candidates.reduce((best, candidate) =>
    Math.abs(candidate - centerMidi) < Math.abs(best - centerMidi) ? candidate : best,
  );
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
