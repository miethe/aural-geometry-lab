import { canonicalDigestV1, compareUtf8, isSha256Digest, stableIdV2 } from "./canonical.js";

/** Legacy Sprint-0 command envelope retained for compatibility. */
export interface ProjectCommand<TPayload = unknown> {
  commandType: string;
  commandVersion: number;
  commandId: string;
  projectId: string;
  expectedRevision: number;
  payload: TPayload;
  transactionId?: string;
  coalescingKey?: string;
  issuedAt?: string;
}

export type CommandOrigin = "user" | "undo" | "redo" | "migration" | "system";

export type CommandPrecondition =
  | { readonly kind: "entity-exists"; readonly entityId: string }
  | { readonly kind: "entity-absent"; readonly entityId: string }
  | {
      readonly kind: "field-digest-equals";
      readonly entityId: string;
      readonly fieldPathId: string;
      readonly expectedDigest: string;
    }
  | {
      readonly kind: "input-digest-equals";
      readonly targetId: string;
      readonly expectedDigest: string;
    };

export interface SemanticCommandEnvelope<TPayload = unknown> {
  readonly schema: "agl.command";
  readonly schemaVersion: 1;
  readonly commandId: string;
  readonly transactionId: string;
  readonly logicalActionId: string;
  readonly projectId: string;
  readonly projectEpoch: string;
  readonly baseRevision: string;
  readonly actor: {
    readonly actorId: string;
    readonly sequence: string;
  };
  readonly origin: CommandOrigin;
  readonly kind: string;
  readonly payloadVersion: number;
  readonly payload: TPayload;
  readonly targetSet: readonly string[];
  readonly writeSet: readonly string[];
  readonly preconditions: readonly CommandPrecondition[];
  readonly lineage?: {
    readonly causedByCommandId?: string;
    readonly migratedFromCommandId?: string;
  };
}

export interface CanonicalCommandRecord<TPayload = unknown> {
  readonly envelope: SemanticCommandEnvelope<TPayload>;
  readonly inverse: SemanticCommandEnvelope;
  readonly revisionBefore: string;
  readonly revisionAfter: string;
  readonly semanticDigestBefore: string;
  readonly semanticDigestAfter: string;
}

export interface CommittedTransaction {
  readonly transactionId: string;
  readonly logicalActionId: string;
  readonly label: string;
  readonly revisionBefore: string;
  readonly revisionAfter: string;
  readonly semanticDigestBefore: string;
  readonly semanticDigestAfter: string;
  readonly forward: readonly SemanticCommandEnvelope[];
  readonly inverse: readonly SemanticCommandEnvelope[];
}

export interface CommandCommit<TProject = unknown> {
  kind: "committed";
  project: TProject;
  revision: number;
  inverse?: ProjectCommand;
}

export interface CommandRejected {
  kind: "rejected";
  code: string;
  message: string;
  recovery?: string[];
}

export interface CommandNoOp {
  kind: "no-op";
  revision: number;
}

export type CommandResult<TProject = unknown> =
  | CommandCommit<TProject>
  | CommandRejected
  | CommandNoOp;

/** Legacy coalescing helper. */
export function canCoalesce(left: ProjectCommand, right: ProjectCommand): boolean {
  return Boolean(
    left.coalescingKey &&
      right.coalescingKey &&
      left.coalescingKey === right.coalescingKey &&
      left.transactionId &&
      left.transactionId === right.transactionId &&
      left.projectId === right.projectId,
  );
}

/** Wave-1 semantic coalescing: time proximity is intentionally irrelevant. */
export function canCoalesceSemanticCommands(
  left: SemanticCommandEnvelope,
  right: SemanticCommandEnvelope,
): boolean {
  return (
    left.projectId === right.projectId &&
    left.projectEpoch === right.projectEpoch &&
    left.transactionId === right.transactionId &&
    left.logicalActionId === right.logicalActionId &&
    left.kind === right.kind &&
    sameStringSet(left.targetSet, right.targetSet) &&
    sameStringSet(left.writeSet, right.writeSet)
  );
}

export type PreviewSessionState<TPreview = unknown> =
  | { readonly kind: "idle" }
  | {
      readonly kind: "previewing";
      readonly sessionId: string;
      readonly logicalActionId: string;
      readonly projectEpoch: string;
      readonly targetSet: readonly string[];
      readonly writeSet: readonly string[];
      readonly initialDigest: string;
      readonly preview: TPreview;
    }
  | {
      readonly kind: "validating";
      readonly sessionId: string;
      readonly logicalActionId: string;
      readonly projectEpoch: string;
      readonly targetSet: readonly string[];
      readonly writeSet: readonly string[];
      readonly initialDigest: string;
      readonly finalDigest: string;
      readonly preview: TPreview;
    };

export function beginPreviewSession<TPreview>(input: {
  readonly sessionId: string;
  readonly logicalActionId: string;
  readonly projectEpoch: string;
  readonly targetSet: readonly string[];
  readonly writeSet: readonly string[];
  readonly initialDigest: string;
  readonly preview: TPreview;
}): PreviewSessionState<TPreview> {
  return { kind: "previewing", ...input };
}

export function updatePreviewSession<TPreview>(
  state: PreviewSessionState<TPreview>,
  preview: TPreview,
): PreviewSessionState<TPreview> {
  if (state.kind !== "previewing") {
    throw new Error("Only a previewing session can receive preview updates.");
  }
  return { ...state, preview };
}

export function requestPreviewCommit<TPreview>(
  state: PreviewSessionState<TPreview>,
  finalDigest: string,
): PreviewSessionState<TPreview> {
  if (state.kind !== "previewing") {
    throw new Error("Only a previewing session can commit.");
  }
  return {
    kind: "validating",
    sessionId: state.sessionId,
    logicalActionId: state.logicalActionId,
    projectEpoch: state.projectEpoch,
    targetSet: state.targetSet,
    writeSet: state.writeSet,
    initialDigest: state.initialDigest,
    finalDigest,
    preview: state.preview,
  };
}

export function cancelPreviewSession<TPreview>(): PreviewSessionState<TPreview> {
  return { kind: "idle" };
}

export function isPreviewNoOp<TPreview>(state: PreviewSessionState<TPreview>): boolean {
  return state.kind === "validating" && state.initialDigest === state.finalDigest;
}

function sameStringSet(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  const a = [...left].sort(compareUtf8);
  const b = [...right].sort(compareUtf8);
  return a.every((value, index) => value === b[index]);
}

/** FR-01 authoritative portable command contract. V1 is quarantined. */
export interface SemanticCommandEnvelopeV2<TPayload = unknown> {
  readonly schema: "agl.command";
  readonly schemaVersion: 2;
  readonly contractVersion: "agl-command-contract-v2";
  readonly commandId: string;
  readonly transactionId: string;
  readonly logicalActionId: string;
  /** Explicit continuous-edit/gesture session. Required for coalescing. */
  readonly editSessionId?: string;
  readonly projectId: string;
  readonly projectEpoch: string;
  readonly baseRevision: string;
  readonly actor: {
    readonly actorId: string;
    readonly sequence: string;
  };
  readonly origin: CommandOrigin;
  readonly kind: string;
  readonly payloadVersion: number;
  readonly payload: TPayload;
  /** Canonical sorted unique semantic entity IDs. */
  readonly targetSet: readonly string[];
  /** Canonical sorted unique field-path IDs, never ad-hoc JSON paths. */
  readonly writeSet: readonly string[];
  readonly preconditions: readonly CommandPrecondition[];
  readonly lineage?: {
    readonly causedByCommandId?: string;
    readonly migratedFromCommandId?: string;
  };
  readonly issuedAt?: string;
}

export interface InverseCommandSpec<TPayload = unknown> {
  readonly kind: string;
  readonly payloadVersion: number;
  readonly payload: TPayload;
  readonly targetSet: readonly string[];
  readonly writeSet: readonly string[];
  readonly preconditions: readonly CommandPrecondition[];
}

export interface CommandApplication<TProject> {
  readonly project: TProject;
  readonly inverse: InverseCommandSpec;
}

export interface CommandDefinitionV2<TProject, TPayload = unknown> {
  readonly kind: string;
  readonly payloadVersion: number;
  readonly validatePayload: (payload: unknown) => payload is TPayload;
  readonly apply: (project: TProject, payload: TPayload) => CommandApplication<TProject>;
}

export class CommandRegistryV2<TProject> {
  private readonly definitions = new Map<string, CommandDefinitionV2<TProject, unknown>>();

  public register<TPayload>(definition: CommandDefinitionV2<TProject, TPayload>): void {
    const key = commandDefinitionKey(definition.kind, definition.payloadVersion);
    if (this.definitions.has(key)) throw new Error(`Command definition already registered: ${key}`);
    if (!/^[A-Z][A-Za-z0-9.:-]{0,127}$/.test(definition.kind)) {
      throw new TypeError("Command kind must be a portable PascalCase identifier.");
    }
    if (!Number.isSafeInteger(definition.payloadVersion) || definition.payloadVersion < 1) {
      throw new TypeError("Command payload version must be a positive safe integer.");
    }
    this.definitions.set(key, Object.freeze({ ...definition }) as CommandDefinitionV2<TProject, unknown>);
  }

  public get(kind: string, payloadVersion: number): CommandDefinitionV2<TProject, unknown> {
    const result = this.definitions.get(commandDefinitionKey(kind, payloadVersion));
    if (result === undefined) throw new Error(`Unknown command definition: ${kind}@${payloadVersion}`);
    return result;
  }
}

export type CommandTransactionResultV2<TProject> =
  | {
      readonly kind: "committed";
      readonly project: TProject;
      readonly transaction: {
        readonly schema: "agl.committed-transaction";
        readonly schemaVersion: 2;
        readonly transactionId: string;
        readonly logicalActionId: string;
        readonly revisionBefore: string;
        readonly revisionAfter: string;
        readonly semanticDigestBefore: string;
        readonly semanticDigestAfter: string;
        readonly forward: readonly SemanticCommandEnvelopeV2[];
        readonly inverse: readonly SemanticCommandEnvelopeV2[];
      };
    }
  | { readonly kind: "no-op"; readonly project: TProject; readonly revision: string }
  | {
      readonly kind: "rejected";
      readonly project: TProject;
      readonly code: "INVALID_ENVELOPE" | "PRECONDITION_FAILED" | "UNKNOWN_COMMAND" | "INVALID_PAYLOAD" | "APPLICATION_FAILED";
      readonly message: string;
      readonly commandId?: string;
    };

export interface ApplyCommandTransactionV2Options<TProject> {
  readonly project: TProject;
  readonly projectId: string;
  readonly projectEpoch: string;
  readonly revision: string;
  readonly commands: readonly SemanticCommandEnvelopeV2[];
  readonly registry: CommandRegistryV2<TProject>;
  readonly semanticDigest: (project: TProject) => string;
  readonly checkPrecondition: (project: TProject, precondition: CommandPrecondition) => boolean;
  readonly inverseActorId?: string;
  /** Canonical projects are plain data; clone before applying so rejected transactions cannot mutate the caller. */
  readonly cloneProject?: (project: TProject) => TProject;
}

/**
 * Atomically validates and applies a command transaction. The core creates
 * inverses from validated pre-state; UI-supplied inverses are never accepted.
 */
export function applyCommandTransactionV2<TProject>(
  options: ApplyCommandTransactionV2Options<TProject>,
): CommandTransactionResultV2<TProject> {
  if (options.commands.length === 0) {
    return { kind: "no-op", project: options.project, revision: options.revision };
  }
  if (options.commands.length > 10_000) {
    return { kind: "rejected", project: options.project, code: "INVALID_ENVELOPE", message: "Transaction exceeds the 10,000-command safety limit." };
  }
  if (!isPortableSemanticId(options.projectId) || !isPortableSemanticId(options.projectEpoch) || !isCanonicalUnsignedDecimal(options.revision)) {
    return { kind: "rejected", project: options.project, code: "INVALID_ENVELOPE", message: "Transaction project identity, epoch, or revision is invalid." };
  }
  const first = options.commands[0]!;
  const commonIssue = validateCommandEnvelopeV2(first);
  if (commonIssue !== undefined) {
    return { kind: "rejected", project: options.project, code: "INVALID_ENVELOPE", message: commonIssue, commandId: first.commandId };
  }
  if (first.projectId !== options.projectId || first.projectEpoch !== options.projectEpoch) {
    return { kind: "rejected", project: options.project, code: "PRECONDITION_FAILED", message: "Project identity or epoch does not match.", commandId: first.commandId };
  }
  if (first.baseRevision !== options.revision && first.preconditions.length === 0) {
    return { kind: "rejected", project: options.project, code: "PRECONDITION_FAILED", message: "A stale command without fine-grained semantic preconditions cannot be rebased.", commandId: first.commandId };
  }
  const digestBefore = options.semanticDigest(options.project);
  if (!isSha256Digest(digestBefore)) {
    return { kind: "rejected", project: options.project, code: "APPLICATION_FAILED", message: "semanticDigest(project) must return a canonical SHA-256 digest." };
  }
  let working: TProject;
  try {
    working = options.cloneProject === undefined
      ? structuredClone(options.project)
      : options.cloneProject(options.project);
  } catch (error) {
    return { kind: "rejected", project: options.project, code: "APPLICATION_FAILED", message: `Project clone failed before atomic application: ${error instanceof Error ? error.message : String(error)}` };
  }
  try {
    assertNoSharedObjectReferencesV2(options.project, working);
  } catch (error) {
    return { kind: "rejected", project: options.project, code: "APPLICATION_FAILED", message: `cloneProject must return a deeply independent project value: ${error instanceof Error ? error.message : String(error)}` };
  }
  const inverseSpecs: Array<{ source: SemanticCommandEnvelopeV2; spec: InverseCommandSpec }> = [];
  const commandIds = new Set<string>();
  let previousActorSequence: bigint | undefined;
  for (const command of options.commands) {
    const issue = validateCommandEnvelopeV2(command);
    if (issue !== undefined || command.transactionId !== first.transactionId || command.logicalActionId !== first.logicalActionId || command.projectId !== first.projectId || command.projectEpoch !== first.projectEpoch || command.baseRevision !== first.baseRevision || command.origin !== first.origin || command.actor.actorId !== first.actor.actorId) {
      return { kind: "rejected", project: options.project, code: "INVALID_ENVELOPE", message: issue ?? "Commands in one transaction must share transaction, action, project, epoch, base revision, origin, and actor.", commandId: command.commandId };
    }
    if (commandIds.has(command.commandId)) return { kind: "rejected", project: options.project, code: "INVALID_ENVELOPE", message: "Command IDs must be unique within a transaction.", commandId: command.commandId };
    commandIds.add(command.commandId);
    const actorSequence = BigInt(command.actor.sequence);
    if (previousActorSequence !== undefined && actorSequence <= previousActorSequence) return { kind: "rejected", project: options.project, code: "INVALID_ENVELOPE", message: "Actor sequence must increase strictly within a transaction.", commandId: command.commandId };
    previousActorSequence = actorSequence;
    if (command.baseRevision !== options.revision && command.preconditions.length === 0) {
      return { kind: "rejected", project: options.project, code: "PRECONDITION_FAILED", message: "Every stale command in a transaction requires fine-grained semantic preconditions.", commandId: command.commandId };
    }
    if (!command.preconditions.every((precondition) => options.checkPrecondition(working, precondition))) {
      return { kind: "rejected", project: options.project, code: "PRECONDITION_FAILED", message: "A command precondition failed.", commandId: command.commandId };
    }
    let definition: CommandDefinitionV2<TProject, unknown>;
    try {
      definition = options.registry.get(command.kind, command.payloadVersion);
    } catch (error) {
      return { kind: "rejected", project: options.project, code: "UNKNOWN_COMMAND", message: error instanceof Error ? error.message : String(error), commandId: command.commandId };
    }
    if (!definition.validatePayload(command.payload)) {
      return { kind: "rejected", project: options.project, code: "INVALID_PAYLOAD", message: "Command payload failed its versioned validator.", commandId: command.commandId };
    }
    try {
      const applied = definition.apply(working, command.payload);
      validateInverseCommandSpecV2(applied.inverse, options.registry);
      assertNoSharedObjectReferencesV2(options.project, applied.project);
      working = applied.project;
      inverseSpecs.push({ source: command, spec: applied.inverse });
    } catch (error) {
      return { kind: "rejected", project: options.project, code: "APPLICATION_FAILED", message: error instanceof Error ? error.message : String(error), commandId: command.commandId };
    }
  }

  const digestAfter = options.semanticDigest(working);
  if (!isSha256Digest(digestAfter)) {
    return { kind: "rejected", project: options.project, code: "APPLICATION_FAILED", message: "semanticDigest(result) must return a canonical SHA-256 digest." };
  }
  if (digestBefore === digestAfter) {
    return { kind: "no-op", project: options.project, revision: options.revision };
  }
  const revisionAfter = incrementDecimalRevision(options.revision);
  const inverse = inverseSpecs.reverse().map(({ source, spec }, index): SemanticCommandEnvelopeV2 => ({
    schema: "agl.command",
    schemaVersion: 2,
    contractVersion: "agl-command-contract-v2",
    commandId: stableIdV2("cmd", source.commandId, "inverse", index),
    transactionId: source.transactionId,
    logicalActionId: source.logicalActionId,
    ...(source.editSessionId === undefined ? {} : { editSessionId: source.editSessionId }),
    projectId: source.projectId,
    projectEpoch: source.projectEpoch,
    baseRevision: revisionAfter,
    actor: { actorId: options.inverseActorId ?? "agl-core", sequence: String(index + 1) },
    origin: "undo",
    kind: spec.kind,
    payloadVersion: spec.payloadVersion,
    payload: spec.payload,
    targetSet: canonicalStringSet(spec.targetSet),
    writeSet: canonicalStringSet(spec.writeSet),
    preconditions: spec.preconditions,
    lineage: { causedByCommandId: source.commandId },
  }));
  return {
    kind: "committed",
    project: working,
    transaction: {
      schema: "agl.committed-transaction",
      schemaVersion: 2,
      transactionId: first.transactionId,
      logicalActionId: first.logicalActionId,
      revisionBefore: options.revision,
      revisionAfter,
      semanticDigestBefore: digestBefore,
      semanticDigestAfter: digestAfter,
      forward: options.commands.map((command) => deepFreezeCommandV2(structuredClone(command))),
      inverse: inverse.map((command) => deepFreezeCommandV2(structuredClone(command))),
    },
  };
}

export function validateCommandEnvelopeV2(command: SemanticCommandEnvelopeV2): string | undefined {
  if (command.schema !== "agl.command" || command.schemaVersion !== 2 || command.contractVersion !== "agl-command-contract-v2") return "Unsupported command schema or contract version.";
  for (const [label, value] of [["commandId", command.commandId], ["transactionId", command.transactionId], ["logicalActionId", command.logicalActionId], ["projectId", command.projectId], ["projectEpoch", command.projectEpoch], ["actorId", command.actor.actorId]] as const) {
    if (!isPortableSemanticId(value)) return `${label} must be a portable 1-256 character semantic ID.`;
  }
  if (command.editSessionId !== undefined && !isPortableSemanticId(command.editSessionId)) return "editSessionId must be a portable semantic ID when present.";
  if (!isCanonicalUnsignedDecimal(command.baseRevision) || !isCanonicalUnsignedDecimal(command.actor.sequence)) return "Revision and actor sequence must be canonical unsigned decimal strings.";
  if (!isPortableCommandKind(command.kind)) return "Command kind must be a portable PascalCase identifier.";
  if (!Number.isSafeInteger(command.payloadVersion) || command.payloadVersion < 1) return "payloadVersion must be a positive safe integer.";
  if (command.targetSet.length > 10_000 || command.writeSet.length > 10_000 || command.preconditions.length > 10_000) return "Command target, write, or precondition set exceeds the safety limit.";
  if (!isCanonicalStringSet(command.targetSet) || !isCanonicalStringSet(command.writeSet)) return "targetSet and writeSet must be UTF-8-sorted unique arrays.";
  if (command.targetSet.some((value) => !isPortableSemanticId(value))) return "targetSet contains a non-portable semantic ID.";
  if (command.writeSet.length === 0 || command.writeSet.some((value) => !isVersionedFieldPathId(value))) return "writeSet must contain versioned canonical field-path IDs.";
  if (command.origin !== "user" && command.origin !== "undo" && command.origin !== "redo" && command.origin !== "migration" && command.origin !== "system") return "Unknown command origin.";
  if (command.lineage?.causedByCommandId !== undefined && !isPortableSemanticId(command.lineage.causedByCommandId)) return "lineage.causedByCommandId is invalid.";
  if (command.lineage?.migratedFromCommandId !== undefined && !isPortableSemanticId(command.lineage.migratedFromCommandId)) return "lineage.migratedFromCommandId is invalid.";
  if (command.issuedAt !== undefined && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(command.issuedAt) || Number.isNaN(Date.parse(command.issuedAt)))) return "issuedAt must be canonical UTC ISO-8601 milliseconds.";
  for (const precondition of command.preconditions) {
    if (precondition.kind === "entity-exists" || precondition.kind === "entity-absent") {
      if (!isPortableSemanticId(precondition.entityId)) return "Entity precondition contains an invalid ID.";
    } else if (precondition.kind === "field-digest-equals") {
      if (!isPortableSemanticId(precondition.entityId) || !isVersionedFieldPathId(precondition.fieldPathId)) return "Field precondition contains an invalid entity or field-path ID.";
      if (!isSha256Digest(precondition.expectedDigest)) return "field precondition digest must use sha256:.";
    } else if (precondition.kind === "input-digest-equals") {
      if (!isPortableSemanticId(precondition.targetId) || !isSha256Digest(precondition.expectedDigest)) return "Input precondition contains an invalid target or digest.";
    } else return "Unknown command precondition kind.";
  }
  try { validateCommandPayload(command.payload); canonicalDigestV1(command.payload); } catch (error) { return `Command payload is not canonical: ${error instanceof Error ? error.message : String(error)}`; }
  return undefined;
}

export function canCoalesceSemanticCommandsV2(
  left: SemanticCommandEnvelopeV2,
  right: SemanticCommandEnvelopeV2,
): boolean {
  return validateCommandEnvelopeV2(left) === undefined && validateCommandEnvelopeV2(right) === undefined &&
    left.origin === "user" && right.origin === "user" &&
    left.projectId === right.projectId && left.projectEpoch === right.projectEpoch &&
    left.transactionId === right.transactionId && left.logicalActionId === right.logicalActionId &&
    left.editSessionId !== undefined && left.editSessionId === right.editSessionId &&
    left.actor.actorId === right.actor.actorId &&
    left.kind === right.kind && left.payloadVersion === right.payloadVersion &&
    sameOrderedStrings(left.targetSet, right.targetSet) && sameOrderedStrings(left.writeSet, right.writeSet);
}

export function canonicalStringSet(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort(compareUtf8);
}

function isCanonicalStringSet(values: readonly string[]): boolean {
  return values.every((value, index) => value.length > 0 && (index === 0 || compareUtf8(values[index - 1]!, value) < 0));
}

function sameOrderedStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}


function validateInverseCommandSpecV2<TProject>(spec: InverseCommandSpec, registry: CommandRegistryV2<TProject>): void {
  if (!isPortableCommandKind(spec.kind)) throw new TypeError("Inverse command kind must be a portable PascalCase identifier.");
  if (!Number.isSafeInteger(spec.payloadVersion) || spec.payloadVersion < 1) throw new TypeError("Inverse command payloadVersion must be a positive safe integer.");
  if (!isCanonicalStringSet(spec.targetSet) || !isCanonicalStringSet(spec.writeSet) || spec.writeSet.length === 0) throw new TypeError("Inverse command target/write sets must be canonical and non-empty.");
  if (spec.targetSet.some((value) => !isPortableSemanticId(value)) || spec.writeSet.some((value) => !isVersionedFieldPathId(value))) throw new TypeError("Inverse target/write identifiers are invalid.");
  validateCommandPayload(spec.payload);
  canonicalDigestV1(spec.payload);
  const definition = registry.get(spec.kind, spec.payloadVersion);
  if (!definition.validatePayload(spec.payload)) throw new TypeError("Inverse command payload failed its versioned validator.");
  for (const precondition of spec.preconditions) {
    if (precondition.kind === "entity-exists" || precondition.kind === "entity-absent") {
      if (!isPortableSemanticId(precondition.entityId)) throw new TypeError("Invalid inverse entity precondition.");
    } else if (precondition.kind === "field-digest-equals") {
      if (!isPortableSemanticId(precondition.entityId) || !isVersionedFieldPathId(precondition.fieldPathId) || !isSha256Digest(precondition.expectedDigest)) throw new TypeError("Invalid inverse field precondition.");
    } else if (precondition.kind === "input-digest-equals") {
      if (!isPortableSemanticId(precondition.targetId) || !isSha256Digest(precondition.expectedDigest)) throw new TypeError("Invalid inverse input precondition.");
    } else throw new TypeError("Unknown inverse precondition kind.");
  }
}

function assertNoSharedObjectReferencesV2(original: unknown, candidate: unknown): void {
  if (typeof original !== "object" || original === null || typeof candidate !== "object" || candidate === null) return;
  const originalObjects = new WeakSet<object>();
  const seenOriginal = new WeakSet<object>();
  const collect = (value: unknown): void => {
    if (typeof value !== "object" || value === null || seenOriginal.has(value)) return;
    seenOriginal.add(value);
    originalObjects.add(value);
    for (const child of Object.values(value as Record<string, unknown>)) collect(child);
  };
  collect(original);
  const seenCandidate = new WeakSet<object>();
  const inspect = (value: unknown): void => {
    if (typeof value !== "object" || value === null || seenCandidate.has(value)) return;
    if (originalObjects.has(value)) throw new Error("candidate project shares an object reference with the authoritative pre-state");
    seenCandidate.add(value);
    for (const child of Object.values(value as Record<string, unknown>)) inspect(child);
  };
  inspect(candidate);
}

function isPortableCommandKind(value: string): boolean {
  return /^[A-Z][A-Za-z0-9.:-]{0,127}$/.test(value);
}

function isCanonicalUnsignedDecimal(value: string): boolean {
  return value.length <= 4096 && /^(0|[1-9][0-9]*)$/.test(value);
}

function incrementDecimalRevision(value: string): string {
  if (!isCanonicalUnsignedDecimal(value)) throw new TypeError("Revision must be a canonical unsigned decimal string.");
  return (BigInt(value) + 1n).toString();
}

function validateCommandPayload(value: unknown): void {
  const ancestors = new WeakSet<object>();
  let nodes = 0;
  const visit = (item: unknown, depth: number): void => {
    nodes += 1;
    if (nodes > 1_000_000) throw new RangeError("Command payload exceeds the node-count safety limit.");
    if (depth > 64) throw new RangeError("Command payload exceeds the nesting-depth safety limit.");
    if (item === null || typeof item === "boolean") return;
    if (typeof item === "string") { if (item.length > 1_000_000) throw new RangeError("Command payload string exceeds the safety limit."); return; }
    if (typeof item === "number") {
      if (!Number.isFinite(item)) throw new TypeError("Command payload numbers must be finite.");
      if (Number.isInteger(item) && !Number.isSafeInteger(item)) throw new TypeError("Unsafe integer command payloads must use canonical decimal strings.");
      return;
    }
    if (typeof item !== "object" || item === undefined) throw new TypeError(`Unsupported command payload type: ${typeof item}.`);
    if (ancestors.has(item)) throw new TypeError("Command payloads cannot contain cycles.");
    ancestors.add(item);
    try {
      if (Array.isArray(item)) {
        if (item.length > 250_000) throw new RangeError("Command payload array exceeds the safety limit.");
        for (const child of item) visit(child, depth + 1);
      } else {
        const prototype = Object.getPrototypeOf(item);
        if (prototype !== Object.prototype && prototype !== null) throw new TypeError("Command payload objects must be plain records.");
        const values = Object.values(item as Record<string, unknown>);
        if (values.length > 100_000) throw new RangeError("Command payload object exceeds the key-count safety limit.");
        for (const child of values) {
          if (child === undefined) throw new TypeError("Command payloads cannot contain undefined values.");
          visit(child, depth + 1);
        }
      }
    } finally { ancestors.delete(item); }
  };
  visit(value, 0);
}

function isPortableSemanticId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:~\/-]{0,255}$/.test(value);
}

function isVersionedFieldPathId(value: string): boolean {
  return /^[a-z0-9]+(?:[.-][a-z0-9]+)*@v[1-9][0-9]*$/.test(value);
}

function deepFreezeCommandV2<TPayload>(command: SemanticCommandEnvelopeV2<TPayload>): SemanticCommandEnvelopeV2<TPayload> {
  return deepFreezeValue(command) as SemanticCommandEnvelopeV2<TPayload>;
}

function deepFreezeValue<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value as Record<string, unknown>)) deepFreezeValue(child, seen);
  return Object.freeze(value);
}

function commandDefinitionKey(kind: string, payloadVersion: number): string {
  return `${kind}@${payloadVersion}`;
}

/** Typed helper that stores committed transactions only; new commits clear redo. */
export type CommittedTransactionV2<TProject = unknown> = Extract<
  CommandTransactionResultV2<TProject>,
  { readonly kind: "committed" }
>["transaction"];

export interface CommittedHistoryStateV2<TProject = unknown> {
  readonly undo: readonly CommittedTransactionV2<TProject>[];
  readonly redo: readonly CommittedTransactionV2<TProject>[];
}

export interface PrepareHistoryReplayV2Options {
  readonly projectId: string;
  readonly projectEpoch: string;
  readonly currentRevision: string;
  readonly actorId: string;
  /** First actor sequence used by the replay transaction. */
  readonly actorSequenceStart: string;
}

export function emptyCommittedHistoryV2<TProject = unknown>(): CommittedHistoryStateV2<TProject> {
  return { undo: [], redo: [] };
}

export function recordCommittedHistoryV2<TProject>(
  history: CommittedHistoryStateV2<TProject>,
  transaction: CommittedTransactionV2<TProject>,
): CommittedHistoryStateV2<TProject> {
  validateCommittedTransactionV2(transaction);
  return { undo: [...history.undo, transaction], redo: [] };
}

/** Read-only history lookup. History is moved only after replay commits. */
export function peekUndoHistoryV2<TProject>(history: CommittedHistoryStateV2<TProject>): CommittedTransactionV2<TProject> | undefined {
  return history.undo.at(-1);
}

/** Read-only history lookup. History is moved only after replay commits. */
export function peekRedoHistoryV2<TProject>(history: CommittedHistoryStateV2<TProject>): CommittedTransactionV2<TProject> | undefined {
  return history.redo.at(-1);
}

/**
 * Re-envelope a historical inverse against the current monotonic revision.
 * Stored inverse envelopes are immutable history templates, never commands that
 * may be dispatched directly after later commits/undo operations.
 */
export function prepareUndoTransactionV2<TProject>(
  history: CommittedHistoryStateV2<TProject>,
  options: PrepareHistoryReplayV2Options,
): readonly SemanticCommandEnvelopeV2[] | undefined {
  const transaction = peekUndoHistoryV2(history);
  return transaction === undefined
    ? undefined
    : reEnvelopeHistoryCommandsV2(transaction.inverse, transaction, "undo", options);
}

/** Re-envelope historical forward commands for a redo against current state. */
export function prepareRedoTransactionV2<TProject>(
  history: CommittedHistoryStateV2<TProject>,
  options: PrepareHistoryReplayV2Options,
): readonly SemanticCommandEnvelopeV2[] | undefined {
  const transaction = peekRedoHistoryV2(history);
  return transaction === undefined
    ? undefined
    : reEnvelopeHistoryCommandsV2(transaction.forward, transaction, "redo", options);
}

/** Move the current undo entry only after the prepared undo transaction committed. */
export function recordUndoAppliedV2<TProject>(
  history: CommittedHistoryStateV2<TProject>,
  originalTransactionId: string,
): CommittedHistoryStateV2<TProject> {
  const transaction = peekUndoHistoryV2(history);
  if (transaction === undefined || transaction.transactionId !== originalTransactionId) {
    throw new Error("Undo history changed before replay commit; no history transition was applied.");
  }
  return { undo: history.undo.slice(0, -1), redo: [...history.redo, transaction] };
}

/** Move the current redo entry only after the prepared redo transaction committed. */
export function recordRedoAppliedV2<TProject>(
  history: CommittedHistoryStateV2<TProject>,
  originalTransactionId: string,
): CommittedHistoryStateV2<TProject> {
  const transaction = peekRedoHistoryV2(history);
  if (transaction === undefined || transaction.transactionId !== originalTransactionId) {
    throw new Error("Redo history changed before replay commit; no history transition was applied.");
  }
  return { undo: [...history.undo, transaction], redo: history.redo.slice(0, -1) };
}

/**
 * @deprecated This function no longer moves history speculatively. Use
 * prepareUndoTransactionV2 + recordUndoAppliedV2 after a successful commit.
 */
export function popUndoHistoryV2<TProject>(history: CommittedHistoryStateV2<TProject>): {
  readonly transaction?: CommittedTransactionV2<TProject>;
  readonly history: CommittedHistoryStateV2<TProject>;
} {
  const transaction = peekUndoHistoryV2(history);
  return transaction === undefined ? { history } : { transaction, history };
}

/**
 * @deprecated This function no longer moves history speculatively. Use
 * prepareRedoTransactionV2 + recordRedoAppliedV2 after a successful commit.
 */
export function popRedoHistoryV2<TProject>(history: CommittedHistoryStateV2<TProject>): {
  readonly transaction?: CommittedTransactionV2<TProject>;
  readonly history: CommittedHistoryStateV2<TProject>;
} {
  const transaction = peekRedoHistoryV2(history);
  return transaction === undefined ? { history } : { transaction, history };
}

function reEnvelopeHistoryCommandsV2<TProject>(
  templates: readonly SemanticCommandEnvelopeV2[],
  transaction: CommittedTransactionV2<TProject>,
  origin: "undo" | "redo",
  options: PrepareHistoryReplayV2Options,
): readonly SemanticCommandEnvelopeV2[] {
  if (!isPortableSemanticId(options.projectId) || !isPortableSemanticId(options.projectEpoch) || !isPortableSemanticId(options.actorId)) {
    throw new TypeError("History replay project, epoch, and actor IDs must be portable semantic IDs.");
  }
  if (!isCanonicalUnsignedDecimal(options.currentRevision) || !isCanonicalUnsignedDecimal(options.actorSequenceStart)) {
    throw new TypeError("History replay revision and actor sequence must be canonical unsigned decimals.");
  }
  const start = BigInt(options.actorSequenceStart);
  const replayTransactionId = stableIdV2(
    "tx",
    "history-replay-v2",
    origin,
    transaction.transactionId,
    options.projectEpoch,
    options.currentRevision,
  );
  return templates.map((template, index) => {
    const { issuedAt: _issuedAt, ...templateWithoutTimestamp } = template;
    return deepFreezeCommandV2({
    ...templateWithoutTimestamp,
    commandId: stableIdV2(
      "cmd",
      "history-replay-v2",
      origin,
      template.commandId,
      options.projectEpoch,
      options.currentRevision,
      index,
    ),
    transactionId: replayTransactionId,
    logicalActionId: `${origin === "undo" ? "Undo" : "Redo"}:${transaction.logicalActionId}`,
    projectId: options.projectId,
    projectEpoch: options.projectEpoch,
    baseRevision: options.currentRevision,
    actor: { actorId: options.actorId, sequence: String(start + BigInt(index)) },
    origin,
    lineage: { causedByCommandId: template.commandId },
  });
  });
}

function validateCommittedTransactionV2<TProject>(transaction: CommittedTransactionV2<TProject>): void {
  if (transaction.forward.length === 0 || transaction.inverse.length === 0) {
    throw new TypeError("Committed history transaction requires forward and inverse commands.");
  }
  if (transaction.revisionAfter !== incrementDecimalRevision(transaction.revisionBefore)) {
    throw new TypeError("Committed transaction must advance revision exactly once.");
  }
  if (!isSha256Digest(transaction.semanticDigestBefore) || !isSha256Digest(transaction.semanticDigestAfter)) {
    throw new TypeError("Committed transaction semantic digests must use sha256:.");
  }
}

