import { canonicalDigestV1, compareUtf8, type CanonicalValue } from "./canonical.js";
import type { PortType } from "./events.js";
import type {
  ConformanceClass,
  DimensionSpec,
  GeneratedIdentityCapability,
  ParameterSpec,
  SemanticInvariantProfile,
  TemporalSemantics,
} from "./semantics.js";
import type { MappingStage } from "./mapping.js";

export const OPERATOR_SEMANTIC_DIGEST_VERSION = "agl-operator-semantic-digest-v2" as const;
export const OPERATOR_CATALOG_DIGEST_VERSION = "agl-operator-catalog-digest-v2" as const;

export interface OperatorPortDefinition {
  readonly id: string;
  readonly name: string;
  readonly type: PortType;
  readonly required: boolean;
  readonly multiple?: boolean;
  readonly dimension?: DimensionSpec;
}

export interface OperatorParameterDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly kind: "number" | "integer" | "boolean" | "enum" | "string";
  readonly defaultValue: unknown;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly options?: readonly string[];
  readonly semantic?: ParameterSpec;
}

export interface EvaluationBudgetDeclaration {
  readonly dimensions: readonly (
    | "events"
    | "recursion"
    | "iterations"
    | "geometry"
    | "memory"
    | "wall-time"
    | "audio-density"
  )[];
  readonly profileId: string;
  readonly profileVersion: number;
}

export interface OperatorDefinition {
  readonly type: string;
  readonly version: number;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly deterministic: boolean;
  readonly inputs: readonly OperatorPortDefinition[];
  readonly outputs: readonly OperatorPortDefinition[];
  readonly parameters: readonly OperatorParameterDefinition[];
  readonly conformanceClass?: ConformanceClass;
  readonly mappingStage?: MappingStage;
  readonly temporal?: TemporalSemantics;
  readonly generatedIdentity?: GeneratedIdentityCapability;
  readonly invariants?: SemanticInvariantProfile;
  readonly budget?: EvaluationBudgetDeclaration;
  readonly provenanceSchemaVersion?: number;
  readonly evidenceStatus?: "direct" | "qualified" | "experimental" | "engineering-default";
}

export class OperatorRegistry {
  private readonly definitions = new Map<string, OperatorDefinition>();
  private readonly semanticDigests = new Map<string, string>();
  private sealed = false;
  private sealedCatalogDigest: string | undefined;

  public constructor(private readonly strictSemanticMetadata = false) {}

  public register(definitionInput: OperatorDefinition): void {
    if (this.sealed) throw new Error("Cannot register an operator after the catalog is sealed.");
    validateOperatorDefinition(definitionInput, this.strictSemanticMetadata);
    const definition = deepFreeze(structuredClone(definitionInput));
    const key = operatorKey(definition.type, definition.version);
    if (this.definitions.has(key)) throw new Error(`Operator already registered: ${key}`);
    this.definitions.set(key, definition);
    this.semanticDigests.set(key, operatorSemanticDigest(definition));
  }

  public has(type: string, version: number): boolean {
    return this.definitions.has(operatorKey(type, version));
  }

  public get(type: string, version: number): OperatorDefinition {
    const definition = this.definitions.get(operatorKey(type, version));
    if (definition === undefined) throw new Error(`Unknown operator: ${type}@${version}`);
    return definition;
  }

  public getSemanticDigest(type: string, version: number): string {
    const digest = this.semanticDigests.get(operatorKey(type, version));
    if (digest === undefined) throw new Error(`Unknown operator semantic digest: ${type}@${version}`);
    return digest;
  }

  public list(): readonly OperatorDefinition[] {
    return [...this.definitions.values()].sort((left, right) => compareUtf8(left.type, right.type) || left.version - right.version);
  }

  public seal(): string {
    if (this.sealedCatalogDigest !== undefined) return this.sealedCatalogDigest;
    this.sealed = true;
    this.sealedCatalogDigest = canonicalDigestV1([
      OPERATOR_CATALOG_DIGEST_VERSION,
      this.list().map((definition) => ({
        type: definition.type,
        version: definition.version,
        semanticDigest: this.getSemanticDigest(definition.type, definition.version),
      })),
    ]);
    return this.sealedCatalogDigest;
  }

  public catalogDigest(): string {
    if (this.sealedCatalogDigest === undefined) throw new Error("Operator catalog must be sealed before its digest is authoritative.");
    return this.sealedCatalogDigest;
  }
}

/**
 * Hash only execution-relevant operator semantics. Display copy, category labels,
 * and evidence presentation are intentionally excluded so editorial changes do
 * not invalidate projects, caches, or generated identities. Any execution
 * change MUST increment the operator version or this digest contract version.
 */
export function operatorSemanticDigest(definition: OperatorDefinition): string {
  return canonicalDigestV1([
    OPERATOR_SEMANTIC_DIGEST_VERSION,
    toCanonical(operatorSemanticProjectionV2(definition)),
  ]);
}

export function operatorSemanticProjectionV2(definition: OperatorDefinition): unknown {
  return {
    type: definition.type,
    version: definition.version,
    deterministic: definition.deterministic,
    inputs: definition.inputs.map((port) => ({
      id: port.id,
      type: port.type,
      required: port.required,
      multiple: port.multiple ?? false,
      dimension: port.dimension ?? null,
    })),
    outputs: definition.outputs.map((port) => ({
      id: port.id,
      type: port.type,
      required: port.required,
      dimension: port.dimension ?? null,
    })),
    parameters: definition.parameters.map((parameter) => ({
      id: parameter.id,
      kind: parameter.kind,
      defaultValue: parameter.defaultValue,
      minimum: parameter.minimum ?? null,
      maximum: parameter.maximum ?? null,
      options: parameter.options ?? null,
      semantic: parameter.semantic ?? null,
    })),
    conformanceClass: definition.conformanceClass ?? null,
    mappingStage: definition.mappingStage ?? null,
    temporal: definition.temporal ?? null,
    generatedIdentity: definition.generatedIdentity ?? null,
    invariants: definition.invariants ?? null,
    budget: definition.budget ?? null,
    provenanceSchemaVersion: definition.provenanceSchemaVersion ?? null,
  };
}

export function validateOperatorDefinition(definition: OperatorDefinition, strict = false): void {
  if (!definition.type || !/^[a-z0-9]+(?:[.-][a-z0-9]+)+$/.test(definition.type)) {
    throw new TypeError("Operator type must be a non-empty namespaced lowercase identifier.");
  }
  if (!Number.isSafeInteger(definition.version) || definition.version < 1) {
    throw new TypeError("Operator version must be a positive safe integer.");
  }
  if (!definition.name || !definition.category || !definition.description) {
    throw new TypeError("Operator name, category, and description are required.");
  }
  if (strict && (definition.conformanceClass === undefined || definition.temporal === undefined)) {
    throw new Error(`${definition.type}@${definition.version} lacks required Wave-1 conformance/temporal metadata.`);
  }
  validatePorts(definition.inputs, "in");
  validatePorts(definition.outputs, "out");

  const parameterIds = new Set<string>();
  for (const parameter of definition.parameters) {
    if (!parameter.id || parameterIds.has(parameter.id)) throw new Error(`Duplicate or empty operator parameter: ${parameter.id}`);
    parameterIds.add(parameter.id);
    validateParameter(parameter);
  }

  if (definition.generatedIdentity?.kind !== undefined && definition.generatedIdentity.kind !== "ephemeral" && !definition.deterministic) {
    throw new Error("A nondeterministic operator cannot promise stable/successor generated identity without a separately versioned seeded contract.");
  }
  if (definition.generatedIdentity?.kind === "successor-mapped" && definition.generatedIdentity.successorMapVersion < 1) {
    throw new Error("Successor-mapped identity requires a positive successor-map version.");
  }
  if (definition.budget !== undefined) {
    if (!definition.budget.profileId || !Number.isSafeInteger(definition.budget.profileVersion) || definition.budget.profileVersion < 1) {
      throw new Error("Operator budget profile requires an ID and positive safe integer version.");
    }
    if (new Set(definition.budget.dimensions).size !== definition.budget.dimensions.length) {
      throw new Error("Operator budget dimensions must be unique.");
    }
  }
  if (definition.provenanceSchemaVersion !== undefined && (!Number.isSafeInteger(definition.provenanceSchemaVersion) || definition.provenanceSchemaVersion < 1)) {
    throw new Error("Operator provenance schema version must be a positive safe integer.");
  }
}

function validatePorts(ports: readonly OperatorPortDefinition[], direction: "in" | "out"): void {
  const ids = new Set<string>();
  for (const port of ports) {
    if (!port.id || ids.has(port.id)) throw new Error(`Duplicate or empty operator port: ${direction}:${port.id}`);
    ids.add(port.id);
    if (!port.name) throw new Error(`Operator port ${direction}:${port.id} requires a name.`);
    if (direction === "out" && port.multiple !== undefined) {
      throw new Error(`Output port ${port.id} cannot declare input cardinality metadata.`);
    }
  }
}

function validateParameter(parameter: OperatorParameterDefinition): void {
  if (!parameter.name || !parameter.description) throw new Error(`Parameter ${parameter.id} requires name and description.`);
  if (parameter.minimum !== undefined && !Number.isFinite(parameter.minimum)) throw new Error(`Parameter ${parameter.id} minimum must be finite.`);
  if (parameter.maximum !== undefined && !Number.isFinite(parameter.maximum)) throw new Error(`Parameter ${parameter.id} maximum must be finite.`);
  if (parameter.minimum !== undefined && parameter.maximum !== undefined && parameter.maximum < parameter.minimum) {
    throw new Error(`Parameter ${parameter.id} maximum is below minimum.`);
  }
  switch (parameter.kind) {
    case "number":
      if (typeof parameter.defaultValue !== "number" || !Number.isFinite(parameter.defaultValue)) throw new Error(`Parameter ${parameter.id} requires a finite numeric default.`);
      break;
    case "integer":
      if (!Number.isSafeInteger(parameter.defaultValue)) throw new Error(`Parameter ${parameter.id} requires a safe integer default.`);
      break;
    case "boolean":
      if (typeof parameter.defaultValue !== "boolean") throw new Error(`Parameter ${parameter.id} requires a boolean default.`);
      break;
    case "string":
      if (typeof parameter.defaultValue !== "string") throw new Error(`Parameter ${parameter.id} requires a string default.`);
      break;
    case "enum":
      if (!Array.isArray(parameter.options) || parameter.options.length === 0 || new Set(parameter.options).size !== parameter.options.length) {
        throw new Error(`Enum parameter ${parameter.id} requires unique non-empty options.`);
      }
      if (typeof parameter.defaultValue !== "string" || !parameter.options.includes(parameter.defaultValue)) {
        throw new Error(`Enum parameter ${parameter.id} default must be one of its options.`);
      }
      break;
  }
  if (typeof parameter.defaultValue === "number") {
    if (parameter.minimum !== undefined && parameter.defaultValue < parameter.minimum) throw new Error(`Parameter ${parameter.id} default is below minimum.`);
    if (parameter.maximum !== undefined && parameter.defaultValue > parameter.maximum) throw new Error(`Parameter ${parameter.id} default is above maximum.`);
  }
  if (parameter.semantic !== undefined && parameter.semantic.id !== parameter.id) {
    throw new Error(`Parameter ${parameter.id} semantic ID must match its operator parameter ID.`);
  }
}

function operatorKey(type: string, version: number): string { return `${type}@${version}`; }

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value as Record<string, unknown>)) deepFreeze(item);
  }
  return value;
}

function toCanonical(value: unknown): CanonicalValue {
  if (value === null || typeof value === "string" || typeof value === "boolean" || typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new RangeError("Operator semantics cannot contain NaN or infinity.");
    return value;
  }
  if (Array.isArray(value)) return value.map(toCanonical);
  if (typeof value === "object" && value !== null) {
    const result: Record<string, CanonicalValue> = {};
    for (const [key, item] of Object.entries(value)) if (item !== undefined) result[key] = toCanonical(item);
    return result;
  }
  throw new TypeError(`Unsupported operator semantic value: ${typeof value}`);
}

export interface OperatorParameterIssue {
  readonly parameterId: string;
  readonly code: string;
  readonly message: string;
}

export function validateOperatorParameters(
  definition: OperatorDefinition,
  parameters: Readonly<Record<string, unknown>>,
): readonly OperatorParameterIssue[] {
  const issues: OperatorParameterIssue[] = [];
  const known = new Map(definition.parameters.map((parameter) => [parameter.id, parameter]));
  for (const key of Object.keys(parameters)) {
    if (!known.has(key)) issues.push({ parameterId: key, code: "UNKNOWN_PARAMETER", message: `Unknown parameter ${key}.` });
  }
  for (const parameter of definition.parameters) {
    const value = Object.prototype.hasOwnProperty.call(parameters, parameter.id) ? parameters[parameter.id] : parameter.defaultValue;
    switch (parameter.kind) {
      case "number":
        if (typeof value !== "number" || !Number.isFinite(value)) issues.push({ parameterId: parameter.id, code: "INVALID_NUMBER", message: "Expected a finite number." });
        break;
      case "integer":
        if (!Number.isSafeInteger(value)) issues.push({ parameterId: parameter.id, code: "INVALID_INTEGER", message: "Expected a safe integer." });
        break;
      case "boolean":
        if (typeof value !== "boolean") issues.push({ parameterId: parameter.id, code: "INVALID_BOOLEAN", message: "Expected a boolean." });
        break;
      case "string":
        if (typeof value !== "string") issues.push({ parameterId: parameter.id, code: "INVALID_STRING", message: "Expected a string." });
        break;
      case "enum":
        if (typeof value !== "string" || parameter.options === undefined || !parameter.options.includes(value)) issues.push({ parameterId: parameter.id, code: "INVALID_ENUM", message: `Expected one of: ${(parameter.options ?? []).join(", ")}.` });
        break;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      if (parameter.minimum !== undefined && value < parameter.minimum) issues.push({ parameterId: parameter.id, code: "BELOW_MINIMUM", message: `Value is below ${parameter.minimum}.` });
      if (parameter.maximum !== undefined && value > parameter.maximum) issues.push({ parameterId: parameter.id, code: "ABOVE_MAXIMUM", message: `Value is above ${parameter.maximum}.` });
    }
  }
  return issues;
}
