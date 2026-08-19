export const entityKinds = [
  "project",
  "track",
  "clip",
  "material",
  "event",
  "operator-node",
  "operator-edge",
  "geometry-object",
  "geometry-element",
  "mapping-stage",
  "provenance-step",
  "lab-step",
  "asset",
] as const;

export type EntityKind = (typeof entityKinds)[number];

export const surfaceIds = [
  "library",
  "navigator",
  "canvas",
  "timeline",
  "graph",
  "inspector",
  "guide",
  "mixer",
  "export",
] as const;

export type SurfaceId = (typeof surfaceIds)[number];

export interface GeneratedSelectionIdentity {
  readonly producerId: string;
  readonly outputPortId: string;
  readonly keySchema: string;
  readonly keyVersion: number;
  readonly stableKey: string;
  readonly sourceFingerprint?: string;
}

export interface SelectionRef {
  kind: EntityKind;
  id: string;
  projectionPath?: string;
  generated?: GeneratedSelectionIdentity;
}

export interface OrphanedSelection {
  readonly ref: SelectionRef;
  readonly reason: "missing" | "identity-version-changed" | "source-detached";
  readonly orphanedAtIntentEpoch: string;
}

export interface SemanticPosition {
  readonly kind: "entity" | "time";
  readonly ref?: SelectionRef;
  readonly laneId?: string;
  readonly time?: { readonly numerator: string; readonly denominator: string };
}

export interface SelectionState {
  primary?: SelectionRef | undefined;
  ordered: SelectionRef[];
  anchor?: SelectionRef | undefined;
  changedBy?: SurfaceId | undefined;
  intentEpoch?: string;
  range?: {
    readonly domainId: string;
    readonly anchor: SemanticPosition;
    readonly head: SemanticPosition;
  };
  orphaned?: readonly OrphanedSelection[];
}

export interface FocusState {
  readonly surface: SurfaceId;
  readonly ref?: SelectionRef;
  readonly focusPath?: readonly string[];
}

export interface HoverState {
  readonly pointerId: string;
  readonly surface: SurfaceId;
  readonly ref?: SelectionRef;
}

export interface RelatedHighlight {
  readonly source: SelectionRef;
  readonly related: readonly SelectionRef[];
  readonly relationship: "provenance" | "dependency" | "projection" | "successor";
}

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).length;
}

function keySegment(value: string): string {
  return `${utf8Length(value)}:${value}`;
}

/** Stable cross-platform identity key with UTF-8 byte-length prefixes. */
export function selectionKey(ref: SelectionRef): string {
  const base = [ref.kind, ref.id, ref.projectionPath ?? ""].map(keySegment).join("|");
  if (ref.generated === undefined) {
    return base;
  }
  const generated = [
    ref.generated.producerId,
    ref.generated.outputPortId,
    ref.generated.keySchema,
    String(ref.generated.keyVersion),
    ref.generated.stableKey,
    ref.generated.sourceFingerprint ?? "",
  ].map(keySegment).join("|");
  return `${base}|g|${generated}`;
}

export function sameSelectionRef(left: SelectionRef, right: SelectionRef): boolean {
  return selectionKey(left) === selectionKey(right);
}

export function normalizeSelectionRefs(refs: readonly SelectionRef[]): SelectionRef[] {
  const seen = new Set<string>();
  const result: SelectionRef[] = [];
  for (const ref of refs) {
    const key = selectionKey(ref);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cloneRef(ref));
    }
  }
  return result;
}

export function createSelectionState(
  ordered: readonly SelectionRef[] = [],
  changedBy?: SurfaceId,
): SelectionState {
  const normalized = normalizeSelectionRefs(ordered);
  return {
    ordered: normalized,
    primary: normalized.at(-1),
    changedBy,
  };
}

export function selectOnly(ref: SelectionRef, changedBy?: SurfaceId): SelectionState {
  const cloned = cloneRef(ref);
  return { primary: cloned, ordered: [cloned], changedBy };
}

export function addSelection(
  state: SelectionState,
  ref: SelectionRef,
  changedBy?: SurfaceId,
): SelectionState {
  const existing = state.ordered.filter((item) => !sameSelectionRef(item, ref));
  const cloned = cloneRef(ref);
  const ordered = [...existing, cloned];
  return { ...state, ordered, primary: cloned, changedBy };
}

export function removeSelection(
  state: SelectionState,
  ref: SelectionRef,
  changedBy?: SurfaceId,
): SelectionState {
  const ordered = state.ordered.filter((item) => !sameSelectionRef(item, ref));
  const anchor = state.anchor && sameSelectionRef(state.anchor, ref) ? undefined : state.anchor;
  return { ...state, ordered, primary: ordered.at(-1), anchor, changedBy };
}

export function toggleSelection(
  state: SelectionState,
  ref: SelectionRef,
  changedBy?: SurfaceId,
): SelectionState {
  const exists = state.ordered.some((item) => sameSelectionRef(item, ref));
  return exists ? removeSelection(state, ref, changedBy) : addSelection(state, ref, changedBy);
}

export function orphanGeneratedSelection(
  state: SelectionState,
  ref: SelectionRef,
  reason: OrphanedSelection["reason"],
): SelectionState {
  const intentEpoch = state.intentEpoch ?? "0";
  const next = removeSelection(state, ref, state.changedBy);
  const orphaned = [
    ...(state.orphaned ?? []).filter((item) => !sameSelectionRef(item.ref, ref)),
    { ref: cloneRef(ref), reason, orphanedAtIntentEpoch: intentEpoch },
  ];
  return { ...next, orphaned };
}

export function reactivateExactOrphan(
  state: SelectionState,
  ref: SelectionRef,
): SelectionState {
  const match = (state.orphaned ?? []).find((item) => sameSelectionRef(item.ref, ref));
  if (match === undefined || match.orphanedAtIntentEpoch !== (state.intentEpoch ?? "0")) {
    return state;
  }
  const next = addSelection(state, ref, state.changedBy);
  return {
    ...next,
    orphaned: (state.orphaned ?? []).filter((item) => !sameSelectionRef(item.ref, ref)),
  };
}

function cloneRef(ref: SelectionRef): SelectionRef {
  return ref.generated === undefined
    ? { ...ref }
    : { ...ref, generated: { ...ref.generated } };
}

/** FR-01 semantic selection identity. Projection/location is deliberately separate. */
export interface SelectionRefV2 {
  readonly kind: EntityKind;
  /** Authored entity ID or a display-local ID for generated entities. */
  readonly id: string;
  readonly generated?: GeneratedSelectionIdentity;
}

export interface SelectionProjectionRefV1 {
  readonly semantic: SelectionRefV2;
  readonly surface: SurfaceId;
  readonly projectionPath: string;
}

export interface SelectionStateV2 {
  readonly intentEpoch: string;
  readonly primary?: SelectionRefV2;
  readonly ordered: readonly SelectionRefV2[];
  readonly orphaned: readonly OrphanedSelectionV2[];
  readonly changedBy?: SurfaceId;
}

export interface OrphanedSelectionV2 {
  readonly ref: SelectionRefV2;
  readonly reason: OrphanedSelection["reason"];
  readonly orphanedAtIntentEpoch: string;
}

export function semanticSelectionKeyV2(ref: SelectionRefV2): string {
  if (ref.generated === undefined) return ["semantic-selection-v2", ref.kind, ref.id].map(keySegment).join("|");
  const generated = ref.generated;
  return [
    "semantic-selection-v2",
    ref.kind,
    generated.producerId,
    generated.outputPortId,
    generated.keySchema,
    String(generated.keyVersion),
    generated.stableKey,
  ].map(keySegment).join("|");
}

export function selectionProjectionKeyV1(ref: SelectionProjectionRefV1): string {
  return [semanticSelectionKeyV2(ref.semantic), ref.surface, ref.projectionPath].map(keySegment).join("|");
}

export function sameSemanticSelectionV2(left: SelectionRefV2, right: SelectionRefV2): boolean {
  return semanticSelectionKeyV2(left) === semanticSelectionKeyV2(right);
}

export function createSelectionStateV2(intentEpoch = "0", changedBy?: SurfaceId): SelectionStateV2 {
  assertCanonicalIntentEpoch(intentEpoch);
  return { intentEpoch, ordered: [], orphaned: [], ...(changedBy === undefined ? {} : { changedBy }) };
}

export function selectOnlyV2(
  state: SelectionStateV2,
  ref: SelectionRefV2,
  nextIntentEpoch: string,
  changedBy?: SurfaceId,
): SelectionStateV2 {
  assertIntentAdvance(state.intentEpoch, nextIntentEpoch);
  const cloned = cloneRefV2(ref);
  return {
    intentEpoch: nextIntentEpoch,
    primary: cloned,
    ordered: [cloned],
    orphaned: [],
    ...(changedBy === undefined ? {} : { changedBy }),
  };
}

export function orphanGeneratedSelectionV2(
  state: SelectionStateV2,
  ref: SelectionRefV2,
  reason: OrphanedSelectionV2["reason"],
): SelectionStateV2 {
  if (ref.generated === undefined) throw new TypeError("Only generated selections can become generated-identity orphans.");
  const ordered = state.ordered.filter((item) => !sameSemanticSelectionV2(item, ref));
  const primary = state.primary !== undefined && sameSemanticSelectionV2(state.primary, ref) ? ordered.at(-1) : state.primary;
  const orphaned = [
    ...state.orphaned.filter((item) => !sameSemanticSelectionV2(item.ref, ref)),
    { ref: cloneRefV2(ref), reason, orphanedAtIntentEpoch: state.intentEpoch },
  ];
  const { primary: _previousPrimary, ...withoutPrimary } = state;
  return { ...withoutPrimary, ordered, ...(primary === undefined ? {} : { primary }), orphaned };
}

export function reactivateExactOrphanV2(
  state: SelectionStateV2,
  ref: SelectionRefV2,
): SelectionStateV2 {
  const orphan = state.orphaned.find((item) => sameSemanticSelectionV2(item.ref, ref));
  if (orphan === undefined || orphan.orphanedAtIntentEpoch !== state.intentEpoch) return state;
  const ordered = [...state.ordered.filter((item) => !sameSemanticSelectionV2(item, ref)), cloneRefV2(ref)];
  return {
    ...state,
    primary: ordered.at(-1)!,
    ordered,
    orphaned: state.orphaned.filter((item) => !sameSemanticSelectionV2(item.ref, ref)),
  };
}

export function nextSelectionIntentEpoch(current: string): string {
  assertCanonicalIntentEpoch(current);
  return (BigInt(current) + 1n).toString();
}

function cloneRefV2(ref: SelectionRefV2): SelectionRefV2 {
  return ref.generated === undefined ? { ...ref } : { ...ref, generated: { ...ref.generated } };
}

function assertCanonicalIntentEpoch(value: string): void {
  if (!/^(0|[1-9][0-9]*)$/.test(value)) throw new TypeError("Selection intent epoch must be a canonical unsigned decimal string.");
}

function assertIntentAdvance(current: string, next: string): void {
  assertCanonicalIntentEpoch(current);
  assertCanonicalIntentEpoch(next);
  if (BigInt(next) <= BigInt(current)) throw new RangeError("A new user selection intent must advance intentEpoch.");
}
