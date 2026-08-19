import { canonicalDigestV1 } from "./canonical.js";
import { entityKinds, surfaceIds, type EntityKind, type SurfaceId } from "./interaction.js";

export const ACCESSIBILITY_SEMANTIC_MIRROR_VERSION = "agl-accessibility-mirror-v1" as const;

export type AccessibilityRoleV1 =
  | "application"
  | "group"
  | "button"
  | "toggle"
  | "slider"
  | "spinbutton"
  | "list"
  | "listitem"
  | "tree"
  | "treeitem"
  | "grid"
  | "row"
  | "gridcell"
  | "status"
  | "document"
  | "img";

const ACCESSIBILITY_ROLES_V1 = new Set<AccessibilityRoleV1>([
  "application", "group", "button", "toggle", "slider", "spinbutton", "list", "listitem",
  "tree", "treeitem", "grid", "row", "gridcell", "status", "document", "img",
]);
const ACCESSIBILITY_ACTION_KINDS_V1 = new Set([
  "activate", "toggle", "increment", "decrement", "set-value", "show-details", "delete", "move", "open-dialog",
]);
const ACCESSIBILITY_MOVE_DIRECTIONS_V1 = new Set(["up", "down", "left", "right", "before", "after"]);
const ENTITY_KINDS_V1 = new Set<string>(entityKinds);
const SURFACE_IDS_V1 = new Set<string>(surfaceIds);

export type AccessibilityActionV1 =
  | { readonly id: string; readonly kind: "activate" | "toggle" | "increment" | "decrement" | "set-value" | "show-details" | "delete"; readonly label: string }
  | { readonly id: string; readonly kind: "move"; readonly label: string; readonly direction: "up" | "down" | "left" | "right" | "before" | "after" }
  | { readonly id: string; readonly kind: "open-dialog"; readonly label: string; readonly dialogId: string };

export interface AccessibilitySemanticRefV1 {
  readonly entityKind: EntityKind;
  readonly entityId: string;
}

export interface AccessibilitySemanticNodeV1 {
  readonly id: string;
  readonly parentId?: string;
  readonly order: number;
  readonly surface: SurfaceId;
  readonly semanticRef?: AccessibilitySemanticRefV1;
  readonly role: AccessibilityRoleV1;
  readonly label: string;
  readonly description?: string;
  readonly valueText?: string;
  readonly stateText?: readonly string[];
  readonly disabled?: boolean;
  readonly selected?: boolean;
  readonly focused?: boolean;
  readonly draggable?: boolean;
  readonly actions: readonly AccessibilityActionV1[];
}

export interface AccessibilitySemanticMirrorV1 {
  readonly schema: "agl.accessibility.mirror";
  readonly schemaVersion: 1;
  readonly contractVersion: typeof ACCESSIBILITY_SEMANTIC_MIRROR_VERSION;
  readonly projectEpoch: string;
  readonly projectionDigest: string;
  readonly roots: readonly string[];
  readonly nodes: readonly AccessibilitySemanticNodeV1[];
}

export interface AccessibilityIssueV1 {
  readonly path: string;
  readonly code: string;
  readonly message: string;
}

export function accessibilityMirrorDigestV1(
  mirror: Omit<AccessibilitySemanticMirrorV1, "projectionDigest">,
): string {
  // Order is semantic for keyboard/screen-reader navigation. Do not sort it away.
  return canonicalDigestV1(mirror);
}

export function validateAccessibilityMirrorV1(mirror: AccessibilitySemanticMirrorV1): readonly AccessibilityIssueV1[] {
  const issues: AccessibilityIssueV1[] = [];
  if (mirror.schema !== "agl.accessibility.mirror" || mirror.schemaVersion !== 1 || mirror.contractVersion !== ACCESSIBILITY_SEMANTIC_MIRROR_VERSION) {
    return [{ path: "$", code: "A11Y_SCHEMA_UNSUPPORTED", message: "Unsupported accessibility semantic-mirror contract." }];
  }
  if (!portableId(mirror.projectEpoch)) issues.push({ path: "$.projectEpoch", code: "A11Y_EPOCH_INVALID", message: "projectEpoch must be a portable bounded semantic ID." });
  if (mirror.nodes.length > 100_000 || mirror.roots.length > 10_000) issues.push({ path: "$", code: "A11Y_SIZE_LIMIT", message: "Accessibility mirror exceeds the v1 safety limit." });
  const byId = new Map<string, AccessibilitySemanticNodeV1>();
  let focusCount = 0;
  for (const [index, node] of mirror.nodes.entries()) {
    const path = `$.nodes[${index}]`;
    if (!portableId(node.id) || node.label.trim().length === 0 || node.label.length > 4_096) issues.push({ path, code: "A11Y_ID_OR_LABEL_INVALID", message: "Every semantic node requires a portable ID and bounded non-empty label." });
    if (node.description !== undefined && node.description.length > 16_384) issues.push({ path: `${path}.description`, code: "A11Y_DESCRIPTION_LIMIT", message: "Description exceeds the safety limit." });
    if (node.valueText !== undefined && node.valueText.length > 4_096) issues.push({ path: `${path}.valueText`, code: "A11Y_VALUE_LIMIT", message: "Value text exceeds the safety limit." });
    if ((node.stateText?.length ?? 0) > 256 || node.stateText?.some((value) => value.length === 0 || value.length > 4_096)) issues.push({ path: `${path}.stateText`, code: "A11Y_STATE_LIMIT", message: "State text must be non-empty and bounded." });
    if (!ACCESSIBILITY_ROLES_V1.has(node.role)) issues.push({ path: `${path}.role`, code: "A11Y_ROLE_INVALID", message: "Node role is not part of the v1 accessibility vocabulary." });
    if (!SURFACE_IDS_V1.has(node.surface)) issues.push({ path: `${path}.surface`, code: "A11Y_SURFACE_INVALID", message: "Node surface is not part of the v1 surface vocabulary." });
    if (node.semanticRef !== undefined && (!portableId(node.semanticRef.entityId) || !ENTITY_KINDS_V1.has(node.semanticRef.entityKind))) issues.push({ path: `${path}.semanticRef`, code: "A11Y_SEMANTIC_REF_INVALID", message: "Semantic references require a portable entity ID and known entity kind." });
    if (byId.has(node.id)) issues.push({ path: `${path}.id`, code: "A11Y_DUPLICATE_ID", message: `Duplicate semantic-node ID ${node.id}.` });
    byId.set(node.id, node);
    if (!Number.isSafeInteger(node.order) || node.order < 0) issues.push({ path: `${path}.order`, code: "A11Y_ORDER_INVALID", message: "Order must be a non-negative safe integer." });
    if (node.focused) focusCount += 1;
    const actionIds = new Set<string>();
    for (const action of node.actions) {
      if (!portableId(action.id) || action.label.trim().length === 0 || action.label.length > 4_096 || !ACCESSIBILITY_ACTION_KINDS_V1.has(action.kind)) issues.push({ path: `${path}.actions`, code: "A11Y_ACTION_INVALID", message: "Actions require portable IDs, known kinds, and bounded labels." });
      if (action.kind === "move" && !ACCESSIBILITY_MOVE_DIRECTIONS_V1.has(action.direction)) issues.push({ path: `${path}.actions`, code: "A11Y_MOVE_DIRECTION_INVALID", message: "Move actions require a known semantic direction." });
      if (action.kind === "open-dialog" && !portableId(action.dialogId)) issues.push({ path: `${path}.actions`, code: "A11Y_DIALOG_ID_INVALID", message: "Dialog actions require a portable dialog ID." });
      if (actionIds.has(action.id)) issues.push({ path: `${path}.actions`, code: "A11Y_ACTION_DUPLICATE", message: `Duplicate action ${action.id}.` });
      actionIds.add(action.id);
    }
    if ((node.role === "button" || node.role === "toggle") && !node.disabled && !node.actions.some((action) => action.kind === "activate" || action.kind === "toggle")) {
      issues.push({ path, code: "A11Y_INTERACTIVE_WITHOUT_ACTION", message: "Interactive controls require a semantic activation action." });
    }
    if ((node.role === "slider" || node.role === "spinbutton") && !node.disabled) {
      const kinds = new Set(node.actions.map((action) => action.kind));
      if (!kinds.has("increment") || !kinds.has("decrement") || !kinds.has("set-value")) {
        issues.push({ path, code: "A11Y_ADJUSTABLE_INCOMPLETE", message: "Adjustable values require increment, decrement, and exact set-value actions." });
      }
      if (node.valueText === undefined) issues.push({ path, code: "A11Y_VALUE_TEXT_MISSING", message: "Adjustable values require a textual value." });
    }
    if (node.draggable) {
      const hasMove = node.actions.some((action) => action.kind === "move");
      const hasDialog = node.actions.some((action) => action.kind === "open-dialog");
      if (!hasMove && !hasDialog) issues.push({ path, code: "A11Y_DRAG_ONLY", message: "Dragging must have a non-drag semantic alternative." });
    }
    if ((node.selected !== undefined || node.focused !== undefined || (node.stateText?.length ?? 0) > 0) && (node.stateText?.length ?? 0) === 0) {
      issues.push({ path, code: "A11Y_STATE_TEXT_MISSING", message: "Selection/focus/state must have text semantics and cannot rely on color alone." });
    }
  }
  if (focusCount > 1) issues.push({ path: "$.nodes", code: "A11Y_MULTIPLE_FOCUS", message: "A semantic mirror may expose at most one logical focus locus." });
  for (const [index, node] of mirror.nodes.entries()) {
    if (node.parentId !== undefined && !byId.has(node.parentId)) issues.push({ path: `$.nodes[${index}].parentId`, code: "A11Y_PARENT_MISSING", message: "Parent semantic node does not exist." });
  }
  const roots = new Set(mirror.roots);
  if (roots.size !== mirror.roots.length) issues.push({ path: "$.roots", code: "A11Y_ROOT_DUPLICATE", message: "Root IDs must be unique." });
  for (const root of roots) {
    const node = byId.get(root);
    if (node === undefined) issues.push({ path: "$.roots", code: "A11Y_ROOT_MISSING", message: `Root ${root} does not exist.` });
    else if (node.parentId !== undefined) issues.push({ path: "$.roots", code: "A11Y_ROOT_HAS_PARENT", message: `Root ${root} cannot have a parent.` });
  }
  for (const node of mirror.nodes) {
    if (node.parentId === undefined && !roots.has(node.id)) issues.push({ path: "$.roots", code: "A11Y_TOP_LEVEL_NOT_ROOT", message: `Top-level semantic node ${node.id} must be listed as a root.` });
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      issues.push({ path: "$.nodes", code: "A11Y_PARENT_CYCLE", message: `Accessibility hierarchy contains a parent cycle at ${id}.` });
      return;
    }
    visiting.add(id);
    const parent = byId.get(id)?.parentId;
    if (parent !== undefined && byId.has(parent)) visit(parent);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of byId.keys()) visit(id);

  const siblingOrders = new Map<string, Set<number>>();
  for (const node of mirror.nodes) {
    const parentKey = node.parentId ?? "<root>";
    const orders = siblingOrders.get(parentKey) ?? new Set<number>();
    if (orders.has(node.order)) issues.push({ path: "$.nodes", code: "A11Y_SIBLING_ORDER_DUPLICATE", message: `Sibling order ${node.order} is duplicated beneath ${parentKey}.` });
    orders.add(node.order);
    siblingOrders.set(parentKey, orders);
  }

  const children = new Map<string, string[]>();
  for (const node of mirror.nodes) if (node.parentId !== undefined) {
    const list = children.get(node.parentId) ?? [];
    list.push(node.id);
    children.set(node.parentId, list);
  }
  const reachable = new Set<string>();
  const stack = [...roots];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (reachable.has(id) || !byId.has(id)) continue;
    reachable.add(id);
    for (const child of children.get(id) ?? []) stack.push(child);
  }
  for (const id of byId.keys()) if (!reachable.has(id)) issues.push({ path: "$.nodes", code: "A11Y_NODE_UNREACHABLE", message: `Semantic node ${id} is not reachable from a declared root.` });

  try {
    const { projectionDigest: _digest, ...withoutDigest } = mirror;
    if (mirror.projectionDigest !== accessibilityMirrorDigestV1(withoutDigest)) issues.push({ path: "$.projectionDigest", code: "A11Y_DIGEST_MISMATCH", message: "projectionDigest does not match semantic mirror contents." });
  } catch (error) {
    issues.push({ path: "$", code: "A11Y_NONCANONICAL", message: error instanceof Error ? error.message : String(error) });
  }
  return issues;
}

function portableId(value: string): boolean { return /^[A-Za-z0-9][A-Za-z0-9._:~\/-]{0,255}$/.test(value); }
