import type {
  DimensionSpec,
  SemanticInvariantProfile,
  TemporalSemantics,
} from "./semantics.js";

export type MappingStage =
  | "source"
  | "sample"
  | "normalize"
  | "smooth"
  | "transform"
  | "quantize-threshold"
  | "constrain"
  | "target";

export type SonificationTechnique =
  | "parameterMapping"
  | "audification"
  | "modelBased"
  | "earcon"
  | "auditoryIcon"
  | "hybrid";

export type SonificationPurpose =
  | "analytic"
  | "pedagogical"
  | "compositional"
  | "perceptualIllusion"
  | "accessibility";

export interface MappingIntent {
  readonly technique: SonificationTechnique;
  readonly primaryPurpose: SonificationPurpose;
  readonly secondaryPurposes?: readonly SonificationPurpose[];
  readonly fidelityPriority:
    | "quantitative"
    | "ordinal"
    | "categorical"
    | "relational"
    | "topological"
    | "structural"
    | "aesthetic";
}

export interface MappingStageDefinition {
  readonly operatorInstanceId: string;
  readonly operatorType: string;
  readonly operatorVersion: number;
  readonly stage: MappingStage;
  readonly input: DimensionSpec;
  readonly output: DimensionSpec;
  readonly temporal: TemporalSemantics;
  readonly deterministic: boolean;
  readonly bypassable: boolean;
  readonly invariants: SemanticInvariantProfile;
  readonly parameters: Readonly<Record<string, unknown>>;
}

export interface MappingDiagnostic {
  readonly code: string;
  readonly severity: "info" | "warning" | "error";
  readonly message: string;
}

export interface MappingTraceStep<TInput = unknown, TOutput = unknown> {
  readonly operatorInstanceId: string;
  readonly operatorType: string;
  readonly operatorVersion: number;
  readonly stage: MappingStage;
  readonly bypassed: boolean;
  readonly temporal: TemporalSemantics;
  readonly input: { readonly value: TInput; readonly unit: string };
  readonly output: { readonly value: TOutput; readonly unit: string };
  readonly parametersDigest: string;
  readonly stateBeforeDigest?: string;
  readonly stateAfterDigest?: string;
  readonly randomDecision?: {
    readonly algorithm: string;
    readonly streamId: string;
    readonly drawIndex: string;
    readonly value: number;
  };
  readonly constraintDelta?: {
    readonly before: unknown;
    readonly after: unknown;
    readonly reason: string;
    readonly priority: "hard" | "soft";
  };
  readonly diagnostics: readonly MappingDiagnostic[];
}

export interface MappingTrace {
  readonly traceId: string;
  readonly sourceRef: string;
  readonly intent: MappingIntent;
  readonly steps: readonly MappingTraceStep[];
  readonly finalTarget: unknown;
}

export interface ControlSample<T> {
  readonly position: number | string;
  readonly value: T;
  readonly missing?: boolean;
}

export interface ControlSignal<T> {
  readonly id: string;
  readonly dimension: DimensionSpec;
  readonly clockDomain: "seconds" | "beats" | "index" | "path" | "event";
  readonly temporal: TemporalSemantics;
  readonly samples: readonly ControlSample<T>[];
}

export function validateMappingPipeline(
  stages: readonly MappingStageDefinition[],
  context: { readonly live: boolean; readonly declaredLatencySeconds: number },
): readonly MappingDiagnostic[] {
  const diagnostics: MappingDiagnostic[] = [];
  for (const stage of stages) {
    if (stage.temporal.kind === "whole-window" && context.live) {
      diagnostics.push({
        code: "MAPPING_ACAUSAL_LIVE",
        severity: "error",
        message: `${stage.operatorType}@${stage.operatorVersion} requires a frozen whole window.`,
      });
    }
    if (
      stage.temporal.kind === "bounded-lookahead" &&
      stage.temporal.seconds > context.declaredLatencySeconds
    ) {
      diagnostics.push({
        code: "MAPPING_LOOKAHEAD_EXCEEDS_LATENCY",
        severity: "error",
        message: `${stage.operatorType}@${stage.operatorVersion} requires ${stage.temporal.seconds}s lookahead.`,
      });
    }
  }
  return diagnostics;
}
