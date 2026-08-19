import { cellularAutomatonLab } from "./cellular-automaton-lab.js";
import { chaosAttractorLab } from "./chaos-attractor-lab.js";
import { euclideanRingsLab } from "./euclidean-rings-lab.js";
import { fractalMotifLab } from "./fractal-motif-lab.js";
import { infiniteStaircaseLab } from "./infinite-staircase-lab.js";
import { penroseSequencerLab } from "./penrose-sequencer-lab.js";
import { tonnetzWalkLab } from "./tonnetz-walk-lab.js";
import type { LabModule } from "./types.js";

export const LABS: readonly LabModule[] = [
  infiniteStaircaseLab,
  euclideanRingsLab,
  tonnetzWalkLab,
  fractalMotifLab,
  cellularAutomatonLab,
  chaosAttractorLab,
  penroseSequencerLab,
];

export function findLab(id: string): LabModule | undefined {
  return LABS.find((lab) => lab.id === id);
}
