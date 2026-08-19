/**
 * Wave-1 normative Risset semantics plus the legacy Sprint-0 layer adapter.
 * The normative construction uses conceptual integer layers and analytic phase;
 * the legacy adapter retains a fixed renderer-slot view for the current demo.
 */

export type RissetDirection = 1 | -1;
export type RissetNormalization = "linear-partition" | "nominal-equal-power";

export interface RissetSemanticParameters {
  readonly ratio: number;
  readonly direction: RissetDirection;
  readonly cycleSeconds: number;
  readonly referenceCyclesPerSecond: number;
  readonly initialLogPhase: number;
  readonly sourcePhaseOrigin?: number;
  readonly windowCenter?: number;
  readonly windowHalfWidth: number;
  readonly normalization: RissetNormalization;
}

export interface RissetSemanticLayer {
  readonly conceptualIndex: number;
  readonly logTempo: number;
  readonly rateCyclesPerSecond: number;
  readonly rawWindow: number;
  readonly gain: number;
}

export interface RissetGeneratedEvent {
  readonly conceptualLayer: number;
  /** Canonical decimal string; numeric iteration is accepted only within the safe-integer evaluation horizon. */
  readonly sourceCycleOrdinal: string;
  readonly sourcePhase: number;
  readonly timeSeconds: number;
  readonly rateCyclesPerSecond: number;
  readonly gain: number;
}

export const DEFAULT_RISSET_SEMANTICS: RissetSemanticParameters = {
  ratio: 2,
  direction: 1,
  cycleSeconds: 20,
  referenceCyclesPerSecond: 2, // 120 BPM for a one-pulse source cycle
  initialLogPhase: 0,
  sourcePhaseOrigin: 0,
  windowCenter: 0,
  windowHalfWidth: 2,
  normalization: "linear-partition",
};

export function rissetLogPhaseAt(
  parameters: RissetSemanticParameters,
  timeSeconds: number,
): number {
  validateSemanticParameters(parameters);
  assertFinite(timeSeconds, "Risset time");
  return parameters.initialLogPhase + parameters.direction * timeSeconds / parameters.cycleSeconds;
}

export function rissetRateAt(
  parameters: RissetSemanticParameters,
  conceptualLayer: number,
  timeSeconds: number,
): number {
  validateSemanticParameters(parameters);
  if (!Number.isSafeInteger(conceptualLayer)) {
    throw new RangeError("Risset conceptual layer must be a safe integer.");
  }
  const q = rissetLogPhaseAt(parameters, timeSeconds);
  const rate = parameters.referenceCyclesPerSecond * parameters.ratio ** (conceptualLayer + q);
  if (!Number.isFinite(rate) || !(rate > 0)) throw new RangeError("Risset rate overflowed the finite render-time domain.");
  return rate;
}

/** Accumulated unwrapped source-cycle phase from the configured time origin. */
export function rissetSourcePhaseAt(
  parameters: RissetSemanticParameters,
  conceptualLayer: number,
  timeSeconds: number,
): number {
  validateSemanticParameters(parameters);
  if (!Number.isSafeInteger(conceptualLayer)) {
    throw new RangeError("Risset conceptual layer must be a safe integer.");
  }
  assertFinite(timeSeconds, "Risset time");
  const d = parameters.direction;
  const logRatio = Math.log(parameters.ratio);
  const initialRate =
    parameters.referenceCyclesPerSecond *
    parameters.ratio ** (conceptualLayer + parameters.initialLogPhase);
  const accumulated =
    initialRate *
    parameters.cycleSeconds /
    (d * logRatio) *
    (parameters.ratio ** (d * timeSeconds / parameters.cycleSeconds) - 1);
  const phase = (parameters.sourcePhaseOrigin ?? 0) + accumulated;
  if (!Number.isFinite(phase)) throw new RangeError("Risset source phase overflowed the finite render-time domain.");
  return phase;
}

export function rissetLayerStatesAt(
  parameters: RissetSemanticParameters,
  timeSeconds: number,
): readonly RissetSemanticLayer[] {
  validateSemanticParameters(parameters);
  const q = rissetLogPhaseAt(parameters, timeSeconds);
  const center = parameters.windowCenter ?? 0;
  const halfWidth = parameters.windowHalfWidth;
  const first = Math.ceil(center - q - halfWidth);
  const last = Math.floor(center - q + halfWidth);
  if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last)) throw new RangeError("Risset active-layer index exceeds the safe evaluation horizon.");
  const raw: Array<Omit<RissetSemanticLayer, "gain">> = [];
  for (let k = first; k <= last; k += 1) {
    const logTempo = k + q;
    const z = logTempo - center;
    const rawWindow = raisedCosineWindow(z, halfWidth);
    if (rawWindow <= 0) {
      continue;
    }
    const rateCyclesPerSecond = parameters.referenceCyclesPerSecond * parameters.ratio ** logTempo;
    if (!Number.isFinite(rateCyclesPerSecond) || !(rateCyclesPerSecond > 0)) throw new RangeError("Risset layer rate overflowed the finite render-time domain.");
    raw.push({
      conceptualIndex: k,
      logTempo,
      rateCyclesPerSecond,
      rawWindow,
    });
  }

  const denominator = parameters.normalization === "linear-partition"
    ? raw.reduce((sum, layer) => sum + layer.rawWindow, 0)
    : Math.sqrt(raw.reduce((sum, layer) => sum + layer.rawWindow ** 2, 0));

  if (!(denominator > 0)) {
    return [];
  }

  return raw.map((layer) => ({
    ...layer,
    gain: layer.rawWindow / denominator,
  }));
}

export function rissetEventTimes(
  parameters: RissetSemanticParameters,
  input: {
    readonly conceptualLayer: number;
    readonly sourcePhase: number;
    readonly intervalStartSeconds: number;
    readonly intervalEndSeconds: number;
    readonly maxEvents: number;
  },
): readonly RissetGeneratedEvent[] {
  validateSemanticParameters(parameters);
  if (!Number.isInteger(input.conceptualLayer)) {
    throw new RangeError("Risset conceptual layer must be an integer.");
  }
  if (!Number.isFinite(input.sourcePhase)) {
    throw new RangeError("Source phase must be finite.");
  }
  if (!(input.intervalEndSeconds > input.intervalStartSeconds)) {
    throw new RangeError("Risset event interval must be non-empty and half-open.");
  }
  if (!Number.isSafeInteger(input.maxEvents) || input.maxEvents < 0) {
    throw new RangeError("Risset maxEvents must be a non-negative safe integer.");
  }

  const p = wrapUnit(input.sourcePhase);
  const phaseStart = rissetSourcePhaseAt(parameters, input.conceptualLayer, input.intervalStartSeconds);
  const phaseEnd = rissetSourcePhaseAt(parameters, input.conceptualLayer, input.intervalEndSeconds);
  const firstOrdinal = Math.ceil(phaseStart - p - 1e-12);
  const lastOrdinal = Math.floor(phaseEnd - p + 1e-12);
  if (!Number.isSafeInteger(firstOrdinal) || !Number.isSafeInteger(lastOrdinal)) throw new RangeError("Risset source-cycle ordinal exceeds the safe evaluation horizon; split/rebase the render interval before materialization.");
  const candidateCount = Math.max(0, lastOrdinal - firstOrdinal + 1);
  if (!Number.isSafeInteger(candidateCount) || candidateCount > input.maxEvents) throw new RangeError(`Risset event budget exceeded; requires ${candidateCount} events and limit is ${input.maxEvents}.`);
  const events: RissetGeneratedEvent[] = [];

  for (let ordinal = firstOrdinal; ordinal <= lastOrdinal; ordinal += 1) {
    const targetPhase = ordinal + p;
    const timeSeconds = inverseRissetSourcePhase(
      parameters,
      input.conceptualLayer,
      targetPhase,
    );
    if (
      timeSeconds + 1e-12 < input.intervalStartSeconds ||
      timeSeconds >= input.intervalEndSeconds - 1e-12
    ) {
      continue;
    }
    if (events.length >= input.maxEvents) {
      throw new RangeError(`Risset event budget exceeded; limit is ${input.maxEvents}.`);
    }
    const layer = rissetLayerStatesAt(parameters, timeSeconds).find(
      (candidate) => candidate.conceptualIndex === input.conceptualLayer,
    );
    events.push({
      conceptualLayer: input.conceptualLayer,
      sourceCycleOrdinal: String(ordinal),
      sourcePhase: p,
      timeSeconds,
      rateCyclesPerSecond: rissetRateAt(parameters, input.conceptualLayer, timeSeconds),
      gain: layer?.gain ?? 0,
    });
  }
  return events;
}

export function inverseRissetSourcePhase(
  parameters: RissetSemanticParameters,
  conceptualLayer: number,
  targetPhase: number,
): number {
  validateSemanticParameters(parameters);
  assertFinite(targetPhase, "Target source phase");
  const d = parameters.direction;
  const logRatio = Math.log(parameters.ratio);
  const initialRate =
    parameters.referenceCyclesPerSecond *
    parameters.ratio ** (conceptualLayer + parameters.initialLogPhase);
  const phaseDelta = targetPhase - (parameters.sourcePhaseOrigin ?? 0);
  const inside = 1 + d * logRatio * phaseDelta / (initialRate * parameters.cycleSeconds);
  if (!(inside > 0)) {
    throw new RangeError("Target phase lies outside the invertible Risset time domain.");
  }
  const time = parameters.cycleSeconds / d * (Math.log(inside) / logRatio);
  if (!Number.isFinite(time)) throw new RangeError("Inverse Risset time overflowed the finite render-time domain.");
  return time;
}

export function raisedCosineWindow(position: number, halfWidth: number): number {
  if (!Number.isFinite(position) || !Number.isFinite(halfWidth) || !(halfWidth > 0.5)) {
    throw new RangeError("Raised-cosine window requires finite position and halfWidth > 0.5.");
  }
  if (Math.abs(position) >= halfWidth) {
    return 0;
  }
  return 0.5 * (1 + Math.cos(Math.PI * position / halfWidth));
}

export function rissetSemanticCycleError(
  parameters: RissetSemanticParameters,
  timeSeconds = 0,
): {
  readonly maximumRateError: number;
  readonly maximumGainError: number;
  readonly maximumPhaseError: number;
  readonly withinTolerance: boolean;
} {
  validateSemanticParameters(parameters);
  const now = rissetLayerStatesAt(parameters, timeSeconds);
  const later = rissetLayerStatesAt(parameters, timeSeconds + parameters.cycleSeconds);
  const d = parameters.direction;
  let maximumRateError = 0;
  let maximumGainError = 0;
  let maximumPhaseError = 0;
  for (const layer of now) {
    const shifted = later.find((candidate) => candidate.conceptualIndex === layer.conceptualIndex - d);
    if (shifted === undefined) {
      continue;
    }
    maximumRateError = Math.max(maximumRateError, relativeError(layer.rateCyclesPerSecond, shifted.rateCyclesPerSecond));
    maximumGainError = Math.max(maximumGainError, Math.abs(layer.gain - shifted.gain));
    // Closure phase is an absolute analytic coordinate, not the relative
    // accumulated phase used to enumerate events from a chosen time origin.
    // Under one traversal it closes exactly after relabeling k -> k - d.
    const phaseNow = rissetClosurePhaseAt(parameters, layer.conceptualIndex, timeSeconds);
    const phaseLater = rissetClosurePhaseAt(
      parameters,
      layer.conceptualIndex - d,
      timeSeconds + parameters.cycleSeconds,
    );
    maximumPhaseError = Math.max(maximumPhaseError, relativeError(phaseNow, phaseLater));
  }
  const tolerance = 1e-10;
  return {
    maximumRateError,
    maximumGainError,
    maximumPhaseError,
    withinTolerance:
      maximumRateError <= tolerance &&
      maximumGainError <= tolerance &&
      maximumPhaseError <= tolerance,
  };
}


function rissetClosurePhaseAt(
  parameters: RissetSemanticParameters,
  conceptualLayer: number,
  timeSeconds: number,
): number {
  const d = parameters.direction;
  const q = rissetLogPhaseAt(parameters, timeSeconds);
  return (parameters.sourcePhaseOrigin ?? 0) +
    parameters.referenceCyclesPerSecond *
      parameters.cycleSeconds /
      (d * Math.log(parameters.ratio)) *
      parameters.ratio ** (conceptualLayer + q);
}

function validateSemanticParameters(parameters: RissetSemanticParameters): void {
  if (!Number.isFinite(parameters.ratio) || parameters.ratio <= 1) {
    throw new RangeError("Risset ratio must exceed 1.");
  }
  if (parameters.direction !== 1 && parameters.direction !== -1) {
    throw new RangeError("Risset direction must be +1 or -1.");
  }
  if (!Number.isFinite(parameters.cycleSeconds) || parameters.cycleSeconds <= 0) {
    throw new RangeError("Risset cycleSeconds must be positive.");
  }
  if (!Number.isFinite(parameters.referenceCyclesPerSecond) || parameters.referenceCyclesPerSecond <= 0) {
    throw new RangeError("Risset reference rate must be positive.");
  }
  if (!Number.isFinite(parameters.initialLogPhase)) {
    throw new RangeError("Risset initial log phase must be finite.");
  }
  if (parameters.sourcePhaseOrigin !== undefined && !Number.isFinite(parameters.sourcePhaseOrigin)) throw new RangeError("Risset source phase origin must be finite.");
  if (parameters.windowCenter !== undefined && !Number.isFinite(parameters.windowCenter)) throw new RangeError("Risset window center must be finite.");
  if (parameters.normalization !== "linear-partition" && parameters.normalization !== "nominal-equal-power") throw new RangeError("Unknown Risset normalization policy.");
  if (!Number.isFinite(parameters.windowHalfWidth) || parameters.windowHalfWidth <= 0.5) {
    throw new RangeError("Risset window half-width must exceed 0.5.");
  }
}

function relativeError(left: number, right: number): number {
  const scale = Math.max(1, Math.abs(left), Math.abs(right));
  return Math.abs(left - right) / scale;
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be finite.`);
  }
}

// ---------------------------------------------------------------------------
// Legacy fixed-slot adapter used by the current Sprint-0 visualization/player.
// ---------------------------------------------------------------------------

export interface RissetParameters {
  readonly layerCount: number;
  readonly tempoRatio: number;
  readonly phase: number;
  readonly baseBpm: number;
  readonly envelopeShape?: "raised-cosine" | "gaussian";
}

export interface RissetLayer {
  readonly index: number;
  readonly logicalIndex: number;
  readonly logTempo: number;
  readonly tempoMultiplier: number;
  readonly bpm: number;
  readonly gain: number;
}

export function rissetLayers(parameters: RissetParameters): readonly RissetLayer[] {
  validateRissetParameters(parameters);
  const phase = wrapUnit(parameters.phase);
  const center = (parameters.layerCount - 1) / 2;
  const padding = 1;
  const minLogTempo = -center - padding;
  const maxLogTempo = center + padding;

  return Array.from({ length: parameters.layerCount }, (_, index) => {
    const logicalIndex = index - center;
    const logTempo = logicalIndex + phase;
    const normalized = (logTempo - minLogTempo) / (maxLogTempo - minLogTempo);
    const gain = legacyEnvelope(normalized, parameters.envelopeShape ?? "raised-cosine");
    const tempoMultiplier = parameters.tempoRatio ** logTempo;
    return {
      index,
      logicalIndex,
      logTempo,
      tempoMultiplier,
      bpm: parameters.baseBpm * tempoMultiplier,
      gain,
    };
  });
}

export function rissetCycleError(
  parameters: Omit<RissetParameters, "phase">,
  epsilon = 1e-9,
): { readonly maximumTempoError: number; readonly withinTolerance: boolean } {
  validateRissetParameters({ ...parameters, phase: 0 });
  const stateAtZero = unwrappedRissetLayers({ ...parameters, phase: 0 });
  const stateAtOne = unwrappedRissetLayers({ ...parameters, phase: 1 });
  let maximumTempoError = 0;

  for (let index = 0; index < stateAtZero.length - 1; index += 1) {
    const shiftedAtZero = stateAtZero[index + 1];
    const atOne = stateAtOne[index];
    if (shiftedAtZero === undefined || atOne === undefined) {
      continue;
    }
    const error = Math.abs(shiftedAtZero.tempoMultiplier - atOne.tempoMultiplier);
    maximumTempoError = Math.max(maximumTempoError, error);
  }

  return {
    maximumTempoError,
    withinTolerance: maximumTempoError <= epsilon,
  };
}

export function instantaneousPulseIntervalSeconds(
  baseBpm: number,
  tempoMultiplier: number,
): number {
  if (!Number.isFinite(baseBpm) || baseBpm <= 0) {
    throw new RangeError("Base BPM must be positive.");
  }
  if (!Number.isFinite(tempoMultiplier) || tempoMultiplier <= 0) {
    throw new RangeError("Tempo multiplier must be positive.");
  }
  return 60 / (baseBpm * tempoMultiplier);
}

function unwrappedRissetLayers(parameters: RissetParameters): readonly RissetLayer[] {
  validateRissetParameters(parameters);
  const center = (parameters.layerCount - 1) / 2;
  const padding = 1;
  const minLogTempo = -center - padding;
  const maxLogTempo = center + padding;
  return Array.from({ length: parameters.layerCount }, (_, index) => {
    const logicalIndex = index - center;
    const logTempo = logicalIndex + parameters.phase;
    const normalized = (logTempo - minLogTempo) / (maxLogTempo - minLogTempo);
    const gain = legacyEnvelope(normalized, parameters.envelopeShape ?? "raised-cosine");
    const tempoMultiplier = parameters.tempoRatio ** logTempo;
    return {
      index,
      logicalIndex,
      logTempo,
      tempoMultiplier,
      bpm: parameters.baseBpm * tempoMultiplier,
      gain,
    };
  });
}

function validateRissetParameters(parameters: RissetParameters): void {
  if (!Number.isInteger(parameters.layerCount) || parameters.layerCount < 3 || parameters.layerCount > 15) {
    throw new RangeError("Risset layer count must be an integer from 3 through 15.");
  }
  if (!Number.isFinite(parameters.tempoRatio) || parameters.tempoRatio <= 1) {
    throw new RangeError("Risset tempo ratio must exceed 1.");
  }
  if (!Number.isFinite(parameters.phase)) {
    throw new RangeError("Risset phase must be finite.");
  }
  if (!Number.isFinite(parameters.baseBpm) || parameters.baseBpm <= 0) {
    throw new RangeError("Risset base BPM must be positive.");
  }
}

function legacyEnvelope(
  normalizedPosition: number,
  shape: "raised-cosine" | "gaussian",
): number {
  if (normalizedPosition <= 0 || normalizedPosition >= 1) {
    return 0;
  }
  if (shape === "gaussian") {
    const centered = (normalizedPosition - 0.5) / 0.22;
    return Math.exp(-0.5 * centered * centered);
  }
  const sine = Math.sin(Math.PI * normalizedPosition);
  return sine * sine;
}

function wrapUnit(value: number): number {
  return ((value % 1) + 1) % 1;
}
