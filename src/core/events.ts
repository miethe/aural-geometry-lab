import { Rational } from "./rational.js";
import type { MappingTraceStep } from "./mapping.js";

export type PortType =
  | "pattern.trigger"
  | "pattern.note"
  | "signal.control"
  | "signal.audio"
  | "math.sequence"
  | "math.graph"
  | "math.geometry"
  | "geometry.penrose"
  | "graph.tile-adjacency"
  | "math.feature-table"
  | "constraints"
  | "visualization"
  | "validation"
  | "provenance";

export interface ProvenanceStep {
  readonly operatorType: string;
  readonly operatorVersion: number;
  readonly summary: string;
  readonly inputEventIds: readonly string[];
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly mappingTrace?: MappingTraceStep;
  readonly semanticDigest?: string;
}

export interface GeneratedEventIdentity {
  readonly producerNodeId: string;
  readonly outputPortId: string;
  readonly keySchema: string;
  readonly keyVersion: number;
  readonly stableKey: string;
  readonly sourceFingerprint?: string;
}

export interface TimedEvent {
  readonly id: string;
  readonly start: Rational;
  readonly duration: Rational;
  readonly velocity: number;
  readonly tags: readonly string[];
  readonly provenance: readonly ProvenanceStep[];
  readonly generatedIdentity?: GeneratedEventIdentity;
}

export interface TriggerEvent extends TimedEvent {
  readonly kind: "trigger";
  readonly voice: string;
}

export interface NoteEvent extends TimedEvent {
  readonly kind: "note";
  readonly midi: number;
  readonly cents: number;
  readonly voice: string;
}

export type MusicalEvent = TriggerEvent | NoteEvent;

export interface BeatInterval {
  readonly start: Rational;
  readonly end: Rational;
}

export interface EvaluationContext {
  readonly seed: string;
  readonly maxEvents: number;
  readonly sampleRate?: number;
  readonly budgetProfileId?: string;
  readonly semanticEnvironmentDigest?: string;
}

export interface Pattern<TEvent extends TimedEvent> {
  readonly id: string;
  readonly cycle?: Rational;
  query(interval: BeatInterval, context: EvaluationContext): readonly TEvent[];
}

export function assertValidInterval(interval: BeatInterval): void {
  if (interval.end.compare(interval.start) <= 0) {
    throw new RangeError("Pattern query interval end must be after its start.");
  }
}

export function assertValidVelocity(velocity: number): void {
  if (!Number.isFinite(velocity) || velocity < 0 || velocity > 1) {
    throw new RangeError("Velocity must be a finite number from 0 through 1.");
  }
}
