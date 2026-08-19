export interface RenderPlanNoteEvent {
  kind: "note";
  id: string;
  startSeconds: number;
  durationSeconds: number;
  midi: number;
  cents: number;
  velocity: number;
  voice: string;
}

export interface RenderPlanTriggerEvent {
  kind: "trigger";
  id: string;
  startSeconds: number;
  durationSeconds: number;
  velocity: number;
  voice: string;
}

export type RenderPlanEvent = RenderPlanNoteEvent | RenderPlanTriggerEvent;

/** Prototype render plan retained for v0.2 compatibility. */
export interface RenderPlanV1 {
  schema: "agl.render-plan";
  schemaVersion: 1;
  projectId: string;
  projectRevision: number;
  evaluationHash: string;
  interval: {
    startBeat: string;
    endBeat: string;
    startSeconds: number;
    endSeconds: number;
  };
  events: RenderPlanEvent[];
}

export type AudioLatePolicy = "strict-drop" | "immediate" | "sample-catch-up" | "coalesce";

export type TemporalOrigin =
  | {
      readonly kind: "musical-beat";
      readonly beat: { readonly numerator: string; readonly denominator: string };
      readonly tempoMapDigest: string;
    }
  | {
      readonly kind: "analytic";
      readonly mappingType: string;
      readonly mappingVersion: number;
      readonly sourcePhase?: { readonly numerator: string; readonly denominator: string };
      readonly mappingDigest: string;
    }
  | { readonly kind: "absolute-seconds"; readonly source: string };

export interface ResolvedAudioEventBase {
  readonly id: string;
  readonly trackId: string;
  readonly voiceId: string;
  readonly idealTimeSeconds: number;
  readonly durationSeconds: number;
  readonly temporalOrigin: TemporalOrigin;
  readonly priority: "critical" | "normal" | "shed-first";
  readonly latePolicy: AudioLatePolicy;
  readonly cancellationGroup: string;
  readonly provenanceRef: string;
}

export interface ResolvedAudioNoteEvent extends ResolvedAudioEventBase {
  readonly kind: "note";
  readonly midi: number;
  readonly cents: number;
  readonly velocity: number;
}

export interface ResolvedAudioTriggerEvent extends ResolvedAudioEventBase {
  readonly kind: "trigger";
  readonly velocity: number;
}

export interface ResolvedAudioControlEvent extends ResolvedAudioEventBase {
  readonly kind: "control";
  readonly target: string;
  readonly value: number;
}

export type ResolvedAudioEvent =
  | ResolvedAudioNoteEvent
  | ResolvedAudioTriggerEvent
  | ResolvedAudioControlEvent;

export interface ResolvedAudioPlanV1 {
  readonly schema: "agl.audio.render-plan";
  readonly schemaVersion: 1;
  readonly planId: string;
  readonly planDigest: string;
  readonly generation: string;
  readonly projectId: string;
  readonly projectEpoch: string;
  readonly projectSemanticDigest: string;
  readonly semanticEnvironmentDigest: string;
  readonly quantizationVersion: "seconds-to-frame-v1";
  readonly range: {
    readonly startSeconds: number;
    readonly endSeconds: number;
    readonly sourceBeatRange?: {
      readonly start: { readonly numerator: string; readonly denominator: string };
      readonly end: { readonly numerator: string; readonly denominator: string };
    };
  };
  readonly voiceDefinitions: readonly {
    readonly id: string;
    readonly version: string;
  }[];
  readonly assetRefs: readonly string[];
  readonly approximations: readonly {
    readonly code: string;
    readonly message: string;
    readonly sourceRef?: string;
  }[];
  readonly events: readonly ResolvedAudioEvent[];
}

export interface BackendScheduleEvent {
  readonly eventId: string;
  readonly generation: string;
  readonly startFrame: number;
  readonly durationFrames: number;
}

export function secondsToSampleFrameV1(seconds: number, sampleRate: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError("Seconds must be finite and non-negative.");
  }
  if (!Number.isSafeInteger(sampleRate) || sampleRate <= 0) {
    throw new RangeError("Sample rate must be a positive safe integer.");
  }
  const frame = Math.floor(seconds * sampleRate + 0.5);
  if (!Number.isSafeInteger(frame)) {
    throw new RangeError("Resolved sample frame exceeds the safe integer range.");
  }
  return frame;
}

export function scheduleResolvedPlan(
  plan: ResolvedAudioPlanV1,
  sampleRate: number,
): readonly BackendScheduleEvent[] {
  return plan.events.map((event) => ({
    eventId: event.id,
    generation: plan.generation,
    startFrame: secondsToSampleFrameV1(event.idealTimeSeconds, sampleRate),
    durationFrames: secondsToSampleFrameV1(event.durationSeconds, sampleRate),
  }));
}

export function validateRenderPlan(plan: RenderPlanV1 | ResolvedAudioPlanV1): string[] {
  return plan.schema === "agl.render-plan"
    ? validateLegacyRenderPlan(plan)
    : validateResolvedAudioPlan(plan);
}

export function validateResolvedAudioPlan(plan: ResolvedAudioPlanV1): string[] {
  const issues: string[] = [];
  if (plan.schema !== "agl.audio.render-plan" || plan.schemaVersion !== 1) {
    issues.push("Unsupported resolved audio-plan schema/version.");
  }
  if (!(plan.range.endSeconds >= plan.range.startSeconds)) {
    issues.push("Resolved audio-plan range is inverted.");
  }
  let previousTime = -Infinity;
  for (const event of plan.events) {
    if (!Number.isFinite(event.idealTimeSeconds) || !Number.isFinite(event.durationSeconds)) {
      issues.push(`${event.id}: event time must be finite.`);
    }
    if (event.idealTimeSeconds < plan.range.startSeconds || event.idealTimeSeconds >= plan.range.endSeconds) {
      issues.push(`${event.id}: event start must lie in the half-open plan range.`);
    }
    if (event.durationSeconds < 0) {
      issues.push(`${event.id}: event duration cannot be negative.`);
    }
    if (event.idealTimeSeconds < previousTime) {
      issues.push(`${event.id}: events must be stably sorted by ideal time.`);
    }
    previousTime = Math.max(previousTime, event.idealTimeSeconds);
    if (event.kind === "note") {
      if (!(event.midi >= 0 && event.midi <= 127)) {
        issues.push(`${event.id}: MIDI note must be within [0, 127].`);
      }
      if (!(event.velocity >= 0 && event.velocity <= 1)) {
        issues.push(`${event.id}: velocity must be within [0, 1].`);
      }
    }
    if (event.kind === "trigger" && !(event.velocity >= 0 && event.velocity <= 1)) {
      issues.push(`${event.id}: velocity must be within [0, 1].`);
    }
  }
  return issues;
}

function validateLegacyRenderPlan(plan: RenderPlanV1): string[] {
  const issues: string[] = [];
  if (plan.schema !== "agl.render-plan" || plan.schemaVersion !== 1) {
    issues.push("Unsupported render-plan schema/version.");
  }
  if (!(plan.interval.endSeconds >= plan.interval.startSeconds)) {
    issues.push("Render-plan interval seconds are inverted.");
  }
  for (const event of plan.events) {
    if (!Number.isFinite(event.startSeconds) || !Number.isFinite(event.durationSeconds)) {
      issues.push(`${event.id}: event time must be finite.`);
    }
    if (event.durationSeconds < 0) {
      issues.push(`${event.id}: event duration cannot be negative.`);
    }
    if (!(event.velocity >= 0 && event.velocity <= 1)) {
      issues.push(`${event.id}: velocity must be within [0, 1].`);
    }
    if (event.kind === "note" && !(event.midi >= 0 && event.midi <= 127)) {
      issues.push(`${event.id}: MIDI note must be within [0, 127].`);
    }
  }
  return issues;
}

import { canonicalDigestV1, compareUtf8, isCanonicalDigest, type CanonicalEncodingLimitsV1 } from "./canonical.js";
import { Rational, validateCanonicalRationalWire } from "./rational.js";

export interface ResolvedAudioEventBaseV2 {
  readonly id: string;
  /** Stable total-order key, independent of engine sort stability. */
  readonly orderKey: string;
  readonly trackId: string;
  readonly voiceId: string;
  readonly idealStartSeconds: number;
  readonly idealEndSeconds: number;
  readonly temporalOrigin: TemporalOrigin;
  readonly priority: "critical" | "normal" | "shed-first";
  readonly latePolicy: AudioLatePolicy;
  readonly cancellationGroup: string;
  readonly provenanceRef: string;
}

export interface ResolvedAudioNoteEventV2 extends ResolvedAudioEventBaseV2 {
  readonly kind: "note";
  readonly midi: number;
  readonly cents: number;
  readonly velocity: number;
}
export interface ResolvedAudioTriggerEventV2 extends ResolvedAudioEventBaseV2 {
  readonly kind: "trigger";
  readonly velocity: number;
}
export interface ResolvedAudioControlEventV2 extends ResolvedAudioEventBaseV2 {
  readonly kind: "control";
  readonly target: string;
  readonly value: number;
}
export type ResolvedAudioEventV2 = ResolvedAudioNoteEventV2 | ResolvedAudioTriggerEventV2 | ResolvedAudioControlEventV2;


export const MAX_AUDIO_PLAN_EVENTS_V2 = 100_000;
export const MAX_AUDIO_PLAN_VOICES_V2 = 4_096;
export const MAX_AUDIO_PLAN_ASSETS_V2 = 100_000;
export const MAX_AUDIO_PLAN_APPROXIMATIONS_V2 = 10_000;
export const MAX_AUDIO_PLAN_RANGE_SECONDS_V2 = 7 * 24 * 60 * 60;
export const MAX_AUDIO_PLAN_TAIL_SECONDS_V2 = 24 * 60 * 60;

/** Bounded plan fragments may exceed general project canonicalization limits. */
export const AUDIO_PLAN_CANONICAL_LIMITS_V2: CanonicalEncodingLimitsV1 = Object.freeze({
  maximumDepth: 128,
  maximumNodes: 8_000_000,
  maximumStringBytes: 1 * 1024 * 1024,
  maximumArrayLength: MAX_AUDIO_PLAN_EVENTS_V2,
  maximumObjectKeys: 100_000,
  maximumEncodedBytes: 256 * 1024 * 1024,
});

export interface ResolvedAudioPlanV2 {
  readonly schema: "agl.audio.render-plan";
  readonly schemaVersion: 2;
  readonly contractVersion: "agl-resolved-audio-plan-v2";
  readonly timeDomain: "project-timeline-seconds-v1";
  readonly planId: string;
  readonly planDigest: string;
  readonly projectId: string;
  readonly projectEpoch: string;
  readonly projectSemanticDigest: string;
  readonly semanticEnvironmentDigest: string;
  readonly operatorCatalogDigest: string;
  readonly voiceRegistryDigest: string;
  readonly budgetProfileId: string;
  readonly budgetProfileVersion: number;
  readonly quantizationVersion: "seconds-to-frame-v1";
  /** Project-timeline range. It is deliberately independent of an audio-device epoch. */
  readonly range: {
    readonly startSeconds: number;
    readonly endSeconds: number;
    readonly sourceBeatRange?: {
      readonly start: { readonly numerator: string; readonly denominator: string };
      readonly end: { readonly numerator: string; readonly denominator: string };
    };
  };
  readonly tailPolicy:
    | { readonly kind: "none" }
    | { readonly kind: "fixed"; readonly seconds: number }
    | { readonly kind: "voice-declared"; readonly maximumSeconds: number };
  readonly voiceDefinitions: readonly {
    readonly id: string;
    readonly version: string;
    readonly semanticDigest: string;
    readonly activeVoicePolicy: "preserve-active" | "replace-at-generation";
  }[];
  readonly assetRefs: readonly { readonly assetId: string; readonly digest: string }[];
  readonly approximations: readonly { readonly code: string; readonly message: string; readonly sourceRef?: string }[];
  readonly events: readonly ResolvedAudioEventV2[];
}

/** Runtime-only mapping from immutable project-timeline seconds to one backend clock epoch. */
export interface AudioScheduleBindingV1 {
  readonly schema: "agl.audio.schedule-binding";
  readonly schemaVersion: 1;
  readonly contractVersion: "agl-audio-schedule-binding-v1";
  readonly generation: string;
  readonly transportEpoch: string;
  readonly timelineAnchorSeconds: number;
  readonly effectiveAtBackendSeconds: number;
  readonly fadeSeconds: number;
  readonly supersedesGeneration?: string;
}

export interface BackendScheduleEventV2 {
  readonly eventId: string;
  readonly orderKey: string;
  readonly generation: string;
  readonly transportEpoch: string;
  readonly projectTimelineStartSeconds: number;
  readonly backendStartSeconds: number;
  readonly backendEndSeconds: number;
  readonly startFrame: number;
  readonly endFrame: number;
  readonly durationFrames: number;
}

export function resolvedAudioPlanDigestV2(
  plan: Omit<ResolvedAudioPlanV2, "planDigest"> | ResolvedAudioPlanV2,
): string {
  const { planDigest: _ignoredDigest, planId: _ignoredId, ...content } = plan as ResolvedAudioPlanV2;
  return canonicalDigestV1(content, AUDIO_PLAN_CANONICAL_LIMITS_V2);
}

export function resolvedAudioPlanIdV2(
  plan: Omit<ResolvedAudioPlanV2, "planDigest"> | ResolvedAudioPlanV2,
): string {
  return `plan~2~${resolvedAudioPlanDigestV2(plan).slice("sha256:".length)}`;
}

export function finalizeResolvedAudioPlanV2(
  input: Omit<ResolvedAudioPlanV2, "planId" | "planDigest">,
): ResolvedAudioPlanV2 {
  const cloned = structuredClone(input);
  const digest = resolvedAudioPlanDigestV2({ ...cloned, planId: "ignored" });
  const plan = deepFreezeAudioValue({ ...cloned, planId: `plan~2~${digest.slice("sha256:".length)}`, planDigest: digest }) as ResolvedAudioPlanV2;
  const issues = validateResolvedAudioPlanV2(plan);
  if (issues.length > 0) throw new TypeError(`Cannot finalize invalid resolved audio plan: ${issues.join(" ")}`);
  return plan;
}

export function validateResolvedAudioPlanV2(plan: ResolvedAudioPlanV2): readonly string[] {
  const issues: string[] = [];
  if (plan.schema !== "agl.audio.render-plan" || plan.schemaVersion !== 2 || plan.contractVersion !== "agl-resolved-audio-plan-v2" || plan.timeDomain !== "project-timeline-seconds-v1") issues.push("Unsupported v2 audio-plan contract or time domain.");
  for (const [name, digest] of [
    ["planDigest", plan.planDigest], ["projectSemanticDigest", plan.projectSemanticDigest],
    ["semanticEnvironmentDigest", plan.semanticEnvironmentDigest], ["operatorCatalogDigest", plan.operatorCatalogDigest],
    ["voiceRegistryDigest", plan.voiceRegistryDigest],
  ] as const) if (!isCanonicalDigest(digest)) issues.push(`${name} must be a canonical SHA-256 digest.`);
  if (isCanonicalDigest(plan.planDigest)) {
    const actual = resolvedAudioPlanDigestV2(plan);
    if (actual !== plan.planDigest) issues.push("planDigest does not match canonical plan content.");
    if (plan.planId !== resolvedAudioPlanIdV2(plan)) issues.push("planId must be derived from the canonical plan digest.");
  }
  if (!portableId(plan.planId) || !portableId(plan.projectId) || !portableId(plan.projectEpoch)) issues.push("Plan, project, and project-epoch IDs must be portable non-empty identifiers.");
  if (!finiteNonNegative(plan.range.startSeconds) || !finiteNonNegative(plan.range.endSeconds) || !(plan.range.endSeconds > plan.range.startSeconds)) issues.push("Plan range must be a non-empty finite half-open project-timeline interval.");
  else if (plan.range.endSeconds - plan.range.startSeconds > MAX_AUDIO_PLAN_RANGE_SECONDS_V2) issues.push("Plan range exceeds the v2 safety limit.");
  if (plan.range.sourceBeatRange !== undefined) {
    const startIssues = validateCanonicalRationalWire(plan.range.sourceBeatRange.start);
    const endIssues = validateCanonicalRationalWire(plan.range.sourceBeatRange.end);
    if (startIssues.length > 0 || endIssues.length > 0) issues.push("sourceBeatRange must use canonical rational wire values.");
    else {
      const start = Rational.fromWire(plan.range.sourceBeatRange.start);
      const end = Rational.fromWire(plan.range.sourceBeatRange.end);
      if (start.compare(0) < 0 || end.compare(start) <= 0) issues.push("sourceBeatRange must be a non-negative non-empty half-open interval.");
    }
  }
  if (!portableId(plan.budgetProfileId)) issues.push("budgetProfileId must be a portable non-empty identifier.");
  if (!Number.isSafeInteger(plan.budgetProfileVersion) || plan.budgetProfileVersion < 1) issues.push("budgetProfileVersion must be a positive safe integer.");
  if (plan.quantizationVersion !== "seconds-to-frame-v1") issues.push("Unsupported sample-frame quantization version.");

  if (plan.events.length > MAX_AUDIO_PLAN_EVENTS_V2) issues.push("Audio plan event count exceeds the v2 safety limit.");
  if (plan.voiceDefinitions.length > MAX_AUDIO_PLAN_VOICES_V2) issues.push("Audio plan voice count exceeds the v2 safety limit.");
  if (plan.assetRefs.length > MAX_AUDIO_PLAN_ASSETS_V2) issues.push("Audio plan asset count exceeds the v2 safety limit.");
  if (plan.approximations.length > MAX_AUDIO_PLAN_APPROXIMATIONS_V2) issues.push("Audio plan approximation count exceeds the v2 safety limit.");

  const eventIds = new Set<string>();
  const orderKeys = new Set<string>();
  let previous: ResolvedAudioEventV2 | undefined;
  for (const event of plan.events) {
    if (!portableId(event.id) || !portableId(event.orderKey) || !portableId(event.trackId) || !portableId(event.voiceId) || !portableId(event.cancellationGroup) || !portableId(event.provenanceRef)) issues.push(`${event.id || "<event>"}: event identity fields must be portable and non-empty.`);
    if (eventIds.has(event.id)) issues.push(`${event.id}: duplicate event ID.`); else eventIds.add(event.id);
    if (orderKeys.has(event.orderKey)) issues.push(`${event.id}: duplicate event orderKey.`); else orderKeys.add(event.orderKey);
    if (!finiteNonNegative(event.idealStartSeconds) || !finiteNonNegative(event.idealEndSeconds) || event.idealEndSeconds < event.idealStartSeconds) issues.push(`${event.id}: invalid ideal start/end time.`);
    if (event.idealStartSeconds < plan.range.startSeconds || event.idealStartSeconds >= plan.range.endSeconds) issues.push(`${event.id}: event start is outside the half-open plan range.`);
    const allowedEnd = plan.range.endSeconds + declaredTailSecondsV2(plan.tailPolicy);
    if (event.idealEndSeconds > allowedEnd) issues.push(`${event.id}: event end exceeds the plan range plus declared tail policy.`);
    for (const temporalIssue of validateTemporalOriginV2(event.temporalOrigin)) issues.push(`${event.id}: ${temporalIssue}`);
    if (previous !== undefined && compareAudioEventsV2(previous, event) >= 0) issues.push(`${event.id}: events must be strictly sorted by start time then UTF-8 orderKey.`);
    previous = event;
    if (event.kind === "note") {
      if (!Number.isInteger(event.midi) || event.midi < 0 || event.midi > 127 || !Number.isFinite(event.cents)) issues.push(`${event.id}: invalid note pitch.`);
      if (!unitInterval(event.velocity)) issues.push(`${event.id}: invalid velocity.`);
    } else if (event.kind === "trigger") {
      if (!unitInterval(event.velocity)) issues.push(`${event.id}: invalid velocity.`);
    } else if (!Number.isFinite(event.value) || !portableId(event.target)) issues.push(`${event.id}: invalid control target/value.`);
  }

  const voices = new Set<string>();
  let previousVoiceId: string | undefined;
  for (const voice of plan.voiceDefinitions) {
    if (!portableId(voice.id) || voice.version.length === 0) issues.push("Voice definitions require portable IDs and non-empty versions.");
    if (voices.has(voice.id)) issues.push(`Duplicate voice definition ${voice.id}.`); else voices.add(voice.id);
    if (!isCanonicalDigest(voice.semanticDigest)) issues.push(`${voice.id}: invalid voice semantic digest.`);
    if (previousVoiceId !== undefined && compareUtf8(previousVoiceId, voice.id) >= 0) issues.push("Voice definitions must be stored in canonical ascending UTF-8 ID order.");
    previousVoiceId = voice.id;
  }
  for (const event of plan.events) if (!voices.has(event.voiceId)) issues.push(`${event.id}: unresolved voice ${event.voiceId}.`);

  const assetIds = new Set<string>();
  let previousAssetId: string | undefined;
  for (const asset of plan.assetRefs) {
    if (!portableId(asset.assetId) || !isCanonicalDigest(asset.digest)) issues.push(`${asset.assetId || "<asset>"}: invalid asset reference.`);
    if (assetIds.has(asset.assetId)) issues.push(`Duplicate asset reference ${asset.assetId}.`); else assetIds.add(asset.assetId);
    if (previousAssetId !== undefined && compareUtf8(previousAssetId, asset.assetId) >= 0) issues.push("Asset references must be stored in canonical ascending UTF-8 ID order.");
    previousAssetId = asset.assetId;
  }
  for (const approximation of plan.approximations) {
    if (!portableId(approximation.code) || approximation.message.length === 0 || approximation.message.length > 4_096) issues.push("Approximation records require a portable code and bounded message.");
    if (approximation.sourceRef !== undefined && !portableId(approximation.sourceRef)) issues.push(`${approximation.code}: invalid approximation sourceRef.`);
  }
  if (plan.tailPolicy.kind === "fixed" && (!finiteNonNegative(plan.tailPolicy.seconds) || plan.tailPolicy.seconds > MAX_AUDIO_PLAN_TAIL_SECONDS_V2)) issues.push("Fixed tail seconds must be finite, non-negative, and within the v2 tail limit.");
  if (plan.tailPolicy.kind === "voice-declared" && (!finiteNonNegative(plan.tailPolicy.maximumSeconds) || plan.tailPolicy.maximumSeconds > MAX_AUDIO_PLAN_TAIL_SECONDS_V2)) issues.push("Voice-declared maximum tail must be finite, non-negative, and within the v2 tail limit.");
  return issues;
}

export function validateAudioScheduleBindingV1(
  binding: AudioScheduleBindingV1,
  plan: ResolvedAudioPlanV2,
): readonly string[] {
  const issues: string[] = [];
  if (binding.schema !== "agl.audio.schedule-binding" || binding.schemaVersion !== 1 || binding.contractVersion !== "agl-audio-schedule-binding-v1") issues.push("Unsupported audio schedule-binding contract.");
  if (!canonicalUnsignedDecimal(binding.generation) || !canonicalUnsignedDecimal(binding.transportEpoch)) issues.push("Generation and transport epoch must be canonical unsigned decimal strings.");
  if (!finiteNonNegative(binding.timelineAnchorSeconds) || !finiteNonNegative(binding.effectiveAtBackendSeconds) || !finiteNonNegative(binding.fadeSeconds)) issues.push("Schedule-binding times must be finite and non-negative.");
  if (binding.timelineAnchorSeconds !== plan.range.startSeconds) issues.push("v1 schedule binding requires its timeline anchor to equal the plan range start.");
  if (binding.supersedesGeneration !== undefined && !canonicalUnsignedDecimal(binding.supersedesGeneration)) issues.push("supersedesGeneration must be a canonical unsigned decimal string.");
  if (binding.supersedesGeneration === binding.generation) issues.push("A schedule binding cannot supersede its own generation.");
  if (binding.fadeSeconds > MAX_AUDIO_PLAN_TAIL_SECONDS_V2) issues.push("Schedule-binding fade exceeds the v2 safety limit.");
  return issues;
}

/**
 * Quantize absolute backend start and end once. The immutable plan remains in
 * project-timeline seconds; the binding supplies the runtime backend epoch.
 */
export function scheduleResolvedPlanV2(
  plan: ResolvedAudioPlanV2,
  sampleRate: number,
  binding: AudioScheduleBindingV1,
): readonly BackendScheduleEventV2[] {
  const issues = [...validateResolvedAudioPlanV2(plan), ...validateAudioScheduleBindingV1(binding, plan)];
  if (issues.length > 0) throw new TypeError(`Invalid resolved audio schedule: ${issues.join(" ")}`);
  return Object.freeze(plan.events.map((event) => {
    const backendStartSeconds = binding.effectiveAtBackendSeconds + (event.idealStartSeconds - binding.timelineAnchorSeconds);
    const backendEndSeconds = binding.effectiveAtBackendSeconds + (event.idealEndSeconds - binding.timelineAnchorSeconds);
    const startFrame = secondsToSampleFrameV1(backendStartSeconds, sampleRate);
    const rawEndFrame = secondsToSampleFrameV1(backendEndSeconds, sampleRate);
    const endFrame = event.idealEndSeconds > event.idealStartSeconds && rawEndFrame <= startFrame
      ? startFrame + 1
      : rawEndFrame;
    if (!Number.isSafeInteger(endFrame)) throw new RangeError("Scheduled end frame exceeds the safe integer range.");
    return {
      eventId: event.id,
      orderKey: event.orderKey,
      generation: binding.generation,
      transportEpoch: binding.transportEpoch,
      projectTimelineStartSeconds: event.idealStartSeconds,
      backendStartSeconds,
      backendEndSeconds,
      startFrame,
      endFrame,
      durationFrames: Math.max(0, endFrame - startFrame),
    } as const;
  }));
}

export type LateEventDecisionV1 =
  | { readonly kind: "schedule"; readonly atSeconds: number; readonly sampleOffsetSeconds?: number }
  | { readonly kind: "drop" }
  | { readonly kind: "coalesce" };

/** Late-event policy operates only after a backend schedule binding is applied. */
export function decideLateScheduledEventV2(input: {
  readonly event: ResolvedAudioEventV2;
  readonly scheduledStartSeconds: number;
  readonly nowBackendSeconds: number;
  readonly strictLateThresholdSeconds: number;
}): LateEventDecisionV1 {
  if (!finiteNonNegative(input.scheduledStartSeconds) || !finiteNonNegative(input.nowBackendSeconds) || !finiteNonNegative(input.strictLateThresholdSeconds)) throw new RangeError("Late-event timing inputs must be finite and non-negative.");
  const lateness = input.nowBackendSeconds - input.scheduledStartSeconds;
  if (lateness <= 0) return { kind: "schedule", atSeconds: input.scheduledStartSeconds };
  switch (input.event.latePolicy) {
    case "strict-drop": return lateness > input.strictLateThresholdSeconds ? { kind: "drop" } : { kind: "schedule", atSeconds: input.nowBackendSeconds };
    case "immediate": return { kind: "schedule", atSeconds: input.nowBackendSeconds };
    case "sample-catch-up": return { kind: "schedule", atSeconds: input.nowBackendSeconds, sampleOffsetSeconds: lateness };
    case "coalesce": return { kind: "coalesce" };
  }
}

/** @deprecated Use decideLateScheduledEventV2 after applying an explicit schedule binding. */
export function decideLateEventV1(input: {
  readonly event: ResolvedAudioEventV2;
  readonly nowSeconds: number;
  readonly strictLateThresholdSeconds: number;
}): LateEventDecisionV1 {
  return decideLateScheduledEventV2({
    event: input.event,
    scheduledStartSeconds: input.event.idealStartSeconds,
    nowBackendSeconds: input.nowSeconds,
    strictLateThresholdSeconds: input.strictLateThresholdSeconds,
  });
}

function declaredTailSecondsV2(policy: ResolvedAudioPlanV2["tailPolicy"]): number {
  if (policy.kind === "none") return 0;
  return policy.kind === "fixed" ? policy.seconds : policy.maximumSeconds;
}

function validateTemporalOriginV2(origin: TemporalOrigin): readonly string[] {
  const issues: string[] = [];
  if (origin.kind === "musical-beat") {
    const rationalIssues = validateCanonicalRationalWire(origin.beat);
    if (rationalIssues.length > 0) issues.push("musical beat origin is not canonical.");
    else if (Rational.fromWire(origin.beat).compare(0) < 0) issues.push("musical beat origin cannot be negative in v2.");
    if (!isCanonicalDigest(origin.tempoMapDigest)) issues.push("musical beat origin requires a canonical tempo-map digest.");
  } else if (origin.kind === "analytic") {
    if (!portableId(origin.mappingType) || !Number.isSafeInteger(origin.mappingVersion) || origin.mappingVersion < 1 || !isCanonicalDigest(origin.mappingDigest)) issues.push("analytic origin mapping identity is invalid.");
    if (origin.sourcePhase !== undefined && validateCanonicalRationalWire(origin.sourcePhase).length > 0) issues.push("analytic source phase is not canonical.");
  } else if (origin.kind === "absolute-seconds") {
    if (!portableId(origin.source)) issues.push("absolute-seconds origin source is invalid.");
  } else issues.push("unknown temporal-origin kind.");
  return issues;
}

function deepFreezeAudioValue<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreezeAudioValue(child);
  }
  return value;
}

function compareAudioEventsV2(left: ResolvedAudioEventV2, right: ResolvedAudioEventV2): number {
  return left.idealStartSeconds - right.idealStartSeconds || compareUtf8(left.orderKey, right.orderKey);
}
function finiteNonNegative(value: number): boolean { return Number.isFinite(value) && value >= 0; }
function unitInterval(value: number): boolean { return Number.isFinite(value) && value >= 0 && value <= 1; }
function canonicalUnsignedDecimal(value: string): boolean { return value.length <= 4096 && /^(0|[1-9][0-9]*)$/.test(value); }
function portableId(value: string): boolean { return /^[A-Za-z0-9][A-Za-z0-9._:~\/-]{0,255}$/.test(value); }

