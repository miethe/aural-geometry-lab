import { canonicalDigestV1, compareUtf8 } from "./canonical.js";
import { validateOperatorParameters, type OperatorPortDefinition, type OperatorRegistry } from "./operator.js";
import type { ProjectConnectionKind, ProjectConnectionV3, ProjectOperatorNodeV3 } from "./project-schema.js";

export const GRAPH_COMPILER_VERSION = "agl-graph-compiler-v2" as const;

export interface GraphContractV1 {
  readonly nodes: readonly ProjectOperatorNodeV3[];
  readonly connections: readonly ProjectConnectionV3[];
}

export interface GraphDiagnostic {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly path: string;
  readonly message: string;
}

export interface CompiledGraphV1 {
  readonly compilerVersion: typeof GRAPH_COMPILER_VERSION;
  readonly graphSemanticDigest: string;
  readonly topologicalNodeIds: readonly string[];
  readonly resultConnectionIds: readonly string[];
  readonly provenanceConnectionIds: readonly string[];
  readonly dependencyClosure: Readonly<Record<string, readonly string[]>>;
}

export type GraphCompileResult =
  | { readonly kind: "compiled"; readonly graph: CompiledGraphV1; readonly diagnostics: readonly GraphDiagnostic[] }
  | { readonly kind: "rejected"; readonly diagnostics: readonly GraphDiagnostic[] };

export function compileGraphV1(graph: GraphContractV1, registry: OperatorRegistry): GraphCompileResult {
  const diagnostics: GraphDiagnostic[] = [];
  const nodeById = new Map<string, ProjectOperatorNodeV3>();
  const connectionIds = new Set<string>();
  const connectionSemantics = new Set<string>();

  for (const [index, node] of graph.nodes.entries()) {
    const path = `$.graph.nodes[${index}]`;
    if (nodeById.has(node.id)) diagnostics.push(error("GRAPH_DUPLICATE_NODE", `${path}.id`, `Duplicate node ID ${node.id}.`));
    nodeById.set(node.id, node);
    if (!registry.has(node.type, node.version)) {
      diagnostics.push(error("GRAPH_UNKNOWN_OPERATOR", path, `Unknown operator ${node.type}@${node.version}.`));
      continue;
    }
    const expectedDigest = registry.getSemanticDigest(node.type, node.version);
    if (node.operatorSemanticDigest !== expectedDigest) {
      diagnostics.push(error("GRAPH_OPERATOR_DIGEST_MISMATCH", `${path}.operatorSemanticDigest`, `Project operator semantics do not match the sealed catalog for ${node.type}@${node.version}.`));
    }
    const parameterIssues = validateOperatorParameters(registry.get(node.type, node.version), node.parameters);
    for (const issue of parameterIssues) diagnostics.push(error(`GRAPH_PARAMETER_${issue.code}`, `${path}.parameters.${issue.parameterId}`, issue.message));
  }

  const incoming = new Map<string, ProjectConnectionV3[]>();
  const resultConnections: ProjectConnectionV3[] = [];
  const provenanceConnections: ProjectConnectionV3[] = [];

  for (const [index, connection] of graph.connections.entries()) {
    const path = `$.graph.connections[${index}]`;
    if (connectionIds.has(connection.id)) diagnostics.push(error("GRAPH_DUPLICATE_CONNECTION", `${path}.id`, `Duplicate connection ID ${connection.id}.`));
    connectionIds.add(connection.id);
    const semanticConnectionKey = [connection.kind, connection.sourceNodeId, connection.sourcePortId, connection.targetNodeId, connection.targetPortId].join("\u001f");
    if (connectionSemantics.has(semanticConnectionKey)) diagnostics.push(error("GRAPH_DUPLICATE_CONNECTION_SEMANTICS", path, "Two connection IDs describe the same semantic edge."));
    connectionSemantics.add(semanticConnectionKey);
    const source = nodeById.get(connection.sourceNodeId);
    const target = nodeById.get(connection.targetNodeId);
    if (source === undefined || target === undefined) {
      if (source === undefined) diagnostics.push(error("GRAPH_SOURCE_MISSING", `${path}.sourceNodeId`, "Connection source node does not exist."));
      if (target === undefined) diagnostics.push(error("GRAPH_TARGET_MISSING", `${path}.targetNodeId`, "Connection target node does not exist."));
      continue;
    }
    if (!registry.has(source.type, source.version) || !registry.has(target.type, target.version)) continue;
    const sourceDefinition = registry.get(source.type, source.version);
    const targetDefinition = registry.get(target.type, target.version);
    const sourcePort = sourceDefinition.outputs.find((port) => port.id === connection.sourcePortId);
    const targetPort = targetDefinition.inputs.find((port) => port.id === connection.targetPortId);
    if (sourcePort === undefined) diagnostics.push(error("GRAPH_SOURCE_PORT_MISSING", `${path}.sourcePortId`, `Output port ${connection.sourcePortId} does not exist.`));
    if (targetPort === undefined) diagnostics.push(error("GRAPH_TARGET_PORT_MISSING", `${path}.targetPortId`, `Input port ${connection.targetPortId} does not exist.`));
    if (sourcePort === undefined || targetPort === undefined) continue;
    for (const issue of portCompatibilityIssues(sourcePort, targetPort, connection.kind)) diagnostics.push({ ...issue, path });

    const targetIncoming = incoming.get(target.id) ?? [];
    targetIncoming.push(connection);
    incoming.set(target.id, targetIncoming);
    if (connection.kind === "provenance") provenanceConnections.push(connection);
    else {
      resultConnections.push(connection);
    }
  }

  for (const [index, node] of graph.nodes.entries()) {
    if (!registry.has(node.type, node.version)) continue;
    const definition = registry.get(node.type, node.version);
    const nodeIncoming = incoming.get(node.id) ?? [];
    for (const port of definition.inputs) {
      const count = nodeIncoming.filter((connection) => connection.targetPortId === port.id && connection.kind !== "provenance").length;
      if (port.required && count === 0) diagnostics.push(error("GRAPH_REQUIRED_INPUT_MISSING", `$.graph.nodes[${index}]`, `${node.type}@${node.version} requires input ${port.id}.`));
      if (!port.multiple && count > 1) diagnostics.push(error("GRAPH_INPUT_CARDINALITY", `$.graph.nodes[${index}]`, `Input ${port.id} accepts at most one result-affecting connection.`));
    }
  }

  const topological = deterministicTopologicalOrder(graph.nodes.map((node) => node.id), resultConnections);
  if (topological === undefined) diagnostics.push(error("GRAPH_RESULT_CYCLE", "$.graph.connections", "Result-affecting graph contains a cycle; feedback requires a future explicitly versioned delay/state contract."));

  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) return { kind: "rejected", diagnostics };
  const order = topological!;
  const dependencyClosure = computeDependencyClosure(order, resultConnections);
  const semanticProjection = {
    compilerVersion: GRAPH_COMPILER_VERSION,
    nodes: [...graph.nodes]
      .sort((a, b) => compareUtf8(a.id, b.id))
      .map((node) => ({ id: node.id, type: node.type, version: node.version, operatorSemanticDigest: node.operatorSemanticDigest, parameters: node.parameters })),
    connections: [...resultConnections].sort((a, b) => compareUtf8(a.id, b.id)),
  };
  return {
    kind: "compiled",
    diagnostics,
    graph: {
      compilerVersion: GRAPH_COMPILER_VERSION,
      graphSemanticDigest: canonicalDigestV1(semanticProjection as never),
      topologicalNodeIds: order,
      resultConnectionIds: resultConnections.map((connection) => connection.id).sort(compareUtf8),
      provenanceConnectionIds: provenanceConnections.map((connection) => connection.id).sort(compareUtf8),
      dependencyClosure,
    },
  };
}

export function connectionAffectsResult(kind: ProjectConnectionKind): boolean {
  return kind !== "provenance";
}

function portCompatibilityIssues(
  source: OperatorPortDefinition,
  target: OperatorPortDefinition,
  kind: ProjectConnectionKind,
): readonly Omit<GraphDiagnostic, "path">[] {
  const issues: Omit<GraphDiagnostic, "path">[] = [];
  if (source.type !== target.type) {
    issues.push({ severity: "error", code: "GRAPH_PORT_TYPE_MISMATCH", message: `Expected ${target.type}; received ${source.type}. Add an explicit adapter operator.` });
  }
  if (kind === "provenance" && source.type !== "provenance") {
    issues.push({ severity: "error", code: "GRAPH_PROVENANCE_KIND_MISMATCH", message: "A provenance connection must originate at a provenance port." });
  }
  if (kind !== "provenance" && source.type === "provenance") {
    issues.push({ severity: "error", code: "GRAPH_RESULT_FROM_PROVENANCE", message: "Provenance output cannot be used as result data without an explicit adapter." });
  }
  if (target.dimension !== undefined) {
    if (source.dimension === undefined) {
      issues.push({ severity: "error", code: "GRAPH_DIMENSION_MISSING", message: `Target ${target.id} requires dimension ${target.dimension.id}, but source declares none.` });
    } else if (!sameDimension(source.dimension, target.dimension)) {
      issues.push({ severity: "error", code: "GRAPH_DIMENSION_MISMATCH", message: `Dimension mismatch ${source.dimension.id}/${source.dimension.unit} → ${target.dimension.id}/${target.dimension.unit}; use an explicit mapping operator.` });
    }
  }
  return issues;
}

function sameDimension(left: NonNullable<OperatorPortDefinition["dimension"]>, right: NonNullable<OperatorPortDefinition["dimension"]>): boolean {
  return canonicalDigestV1(dimensionCompatibilityProjectionV2(left)) === canonicalDigestV1(dimensionCompatibilityProjectionV2(right));
}

function dimensionCompatibilityProjectionV2(dimension: NonNullable<OperatorPortDefinition["dimension"]>): unknown {
  return {
    valueKind: dimension.valueKind,
    measurement: dimension.measurement,
    unit: dimension.unit,
    domain: dimension.domain === undefined ? null : {
      min: dimension.domain.min ?? null,
      max: dimension.domain.max ?? null,
      period: dimension.domain.period ?? null,
      categories: dimension.domain.categories ?? null,
    },
    missingPolicy: dimension.missingPolicy,
  };
}

function deterministicTopologicalOrder(nodeIds: readonly string[], connections: readonly ProjectConnectionV3[]): readonly string[] | undefined {
  const indegree = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  const outgoing = new Map<string, string[]>();
  for (const connection of connections) {
    indegree.set(connection.targetNodeId, (indegree.get(connection.targetNodeId) ?? 0) + 1);
    const targets = outgoing.get(connection.sourceNodeId) ?? [];
    targets.push(connection.targetNodeId);
    outgoing.set(connection.sourceNodeId, targets);
  }
  const ready = [...indegree.entries()].filter(([, degree]) => degree === 0).map(([id]) => id).sort(compareUtf8);
  const order: string[] = [];
  while (ready.length > 0) {
    const id = ready.shift()!;
    order.push(id);
    // Preserve edge multiplicity: two valid edges between the same node pair
    // increment indegree twice and therefore must decrement it twice.
    for (const target of [...(outgoing.get(id) ?? [])].sort(compareUtf8)) {
      const next = (indegree.get(target) ?? 0) - 1;
      indegree.set(target, next);
      if (next === 0) insertSorted(ready, target);
    }
  }
  return order.length === nodeIds.length ? order : undefined;
}

function computeDependencyClosure(order: readonly string[], connections: readonly ProjectConnectionV3[]): Readonly<Record<string, readonly string[]>> {
  const direct = new Map<string, Set<string>>();
  for (const connection of connections) {
    const dependencies = direct.get(connection.targetNodeId) ?? new Set<string>();
    dependencies.add(connection.sourceNodeId);
    direct.set(connection.targetNodeId, dependencies);
  }
  const closure = new Map<string, Set<string>>();
  for (const id of order) {
    const result = new Set<string>();
    for (const dependency of [...(direct.get(id) ?? [])].sort(compareUtf8)) {
      result.add(dependency);
      for (const inherited of closure.get(dependency) ?? []) result.add(inherited);
    }
    closure.set(id, result);
  }
  return Object.fromEntries([...closure.entries()].map(([id, values]) => [id, [...values].sort(compareUtf8)]));
}

function insertSorted(values: string[], value: string): void {
  const index = values.findIndex((candidate) => compareUtf8(candidate, value) > 0);
  if (index < 0) values.push(value); else values.splice(index, 0, value);
}

function error(code: string, path: string, message: string): GraphDiagnostic {
  return { severity: "error", code, path, message };
}
