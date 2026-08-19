export interface ElementaryAutomatonParameters {
  readonly width: number;
  readonly generations: number;
  readonly rule: number;
  readonly initial?: readonly boolean[];
}

export type AutomatonGrid = readonly (readonly boolean[])[];

export function generateElementaryAutomaton(
  parameters: ElementaryAutomatonParameters,
): AutomatonGrid {
  validateParameters(parameters);
  const first = parameters.initial === undefined
    ? centeredSeed(parameters.width)
    : normalizeInitial(parameters.initial, parameters.width);
  const rows: boolean[][] = [first];

  for (let generation = 1; generation < parameters.generations; generation += 1) {
    const previous = rows[generation - 1];
    if (previous === undefined) {
      throw new Error("Cellular automaton lost its previous generation.");
    }
    rows.push(stepElementaryAutomaton(previous, parameters.rule));
  }
  return rows;
}

export function stepElementaryAutomaton(
  row: readonly boolean[],
  rule: number,
): boolean[] {
  if (!Number.isInteger(rule) || rule < 0 || rule > 255) {
    throw new RangeError("Elementary cellular automaton rule must be from 0 through 255.");
  }
  return row.map((_, index) => {
    const left = row[(index - 1 + row.length) % row.length] ?? false;
    const center = row[index] ?? false;
    const right = row[(index + 1) % row.length] ?? false;
    const neighborhood = (left ? 4 : 0) + (center ? 2 : 0) + (right ? 1 : 0);
    return ((rule >> neighborhood) & 1) === 1;
  });
}

export function automatonDensity(row: readonly boolean[]): number {
  if (row.length === 0) {
    return 0;
  }
  return row.filter(Boolean).length / row.length;
}

function validateParameters(parameters: ElementaryAutomatonParameters): void {
  if (!Number.isInteger(parameters.width) || parameters.width < 4 || parameters.width > 128) {
    throw new RangeError("Automaton width must be an integer from 4 through 128.");
  }
  if (
    !Number.isInteger(parameters.generations) ||
    parameters.generations < 2 ||
    parameters.generations > 256
  ) {
    throw new RangeError("Automaton generations must be an integer from 2 through 256.");
  }
  if (!Number.isInteger(parameters.rule) || parameters.rule < 0 || parameters.rule > 255) {
    throw new RangeError("Automaton rule must be an integer from 0 through 255.");
  }
}

function centeredSeed(width: number): boolean[] {
  const row = Array<boolean>(width).fill(false);
  row[Math.floor(width / 2)] = true;
  return row;
}

function normalizeInitial(initial: readonly boolean[], width: number): boolean[] {
  if (initial.length !== width) {
    throw new RangeError("Initial automaton row must match the requested width.");
  }
  return [...initial];
}
