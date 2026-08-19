/** Cross-platform semantic metadata shared by operators, mappings, and UI. */

export type ConformanceClass = "exact" | "profileNumeric" | "renderOnly";

export type MeasurementKind =
  | "nominal"
  | "ordinal"
  | "interval"
  | "ratio"
  | "circular"
  | "topological";

export type ValueKind =
  | "scalar"
  | "integer"
  | "boolean"
  | "category"
  | "angle"
  | "vector"
  | "position"
  | "duration"
  | "rate"
  | "count"
  | "probability"
  | "event"
  | "graph-node"
  | "graph-edge"
  | "path-position";

export type MissingValuePolicy =
  | "drop"
  | "gap"
  | "hold-last"
  | "interpolate"
  | "default"
  | "explicit-missing"
  | "error";

export interface DimensionSpec {
  readonly id: string;
  readonly label: string;
  readonly valueKind: ValueKind;
  readonly measurement: MeasurementKind;
  readonly unit: string;
  readonly domain?: {
    readonly min?: number;
    readonly max?: number;
    readonly period?: number;
    readonly categories?: readonly string[];
  };
  readonly missingPolicy: MissingValuePolicy;
}

export type TemporalSemantics =
  | { readonly kind: "pointwise" }
  | {
      readonly kind: "causal-stateful";
      readonly reset: "transport-start" | "clip-start" | "manual" | "never";
    }
  | {
      readonly kind: "bounded-lookahead";
      readonly seconds: number;
    }
  | {
      readonly kind: "whole-window";
      readonly windowRef: string;
    };

export interface SemanticInvariantProfile {
  readonly preservesEquality?: boolean;
  readonly preservesOrder?: boolean;
  readonly preservesIntervals?: boolean;
  readonly preservesRatios?: boolean;
  readonly preservesCircularity?: boolean;
  readonly preservesTopology?: boolean;
}

export type GeneratedIdentityCapability =
  | {
      readonly kind: "stable";
      readonly keySchema: string;
      readonly keyVersion: number;
    }
  | {
      readonly kind: "successor-mapped";
      readonly keySchema: string;
      readonly keyVersion: number;
      readonly successorMapVersion: number;
    }
  | { readonly kind: "ephemeral" };

export type ParameterValueKind =
  | "number"
  | "integer"
  | "boolean"
  | "enum"
  | "string"
  | "rational"
  | "vector"
  | "angle";

export interface ParameterSpec {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly valueKind: ParameterValueKind;
  readonly defaultValue: unknown;
  readonly unit?: string;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly period?: number;
  readonly options?: readonly string[];
  readonly interaction?: {
    readonly nudge?: number;
    readonly coarseNudge?: number;
    readonly fineNudge?: number;
    readonly boundaryPolicy?: "clamp" | "wrap" | "reject";
    readonly resetValue?: unknown;
  };
  readonly evidenceStatus?: "direct" | "qualified" | "experimental" | "engineering-default";
}

export function validateTemporalSemantics(
  temporal: TemporalSemantics,
  context: { readonly live: boolean; readonly declaredLatencySeconds: number },
): readonly string[] {
  const issues: string[] = [];
  if (temporal.kind === "bounded-lookahead") {
    if (!Number.isFinite(temporal.seconds) || temporal.seconds < 0) {
      issues.push("Bounded lookahead must be finite and non-negative.");
    }
    if (context.live && temporal.seconds > context.declaredLatencySeconds) {
      issues.push("Mapping lookahead exceeds the declared live latency.");
    }
  }
  if (temporal.kind === "whole-window" && context.live) {
    issues.push("Whole-window mappings cannot execute as live causal mappings.");
  }
  return issues;
}
