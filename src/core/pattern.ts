import {
  assertValidInterval,
  type BeatInterval,
  type EvaluationContext,
  type Pattern,
  type TimedEvent,
} from "./events.js";
import { compareUtf8, stableIdV2 } from "./canonical.js";
import { Rational } from "./rational.js";

export const STATIC_PATTERN_SEMANTICS_VERSION = "agl-static-pattern-v2" as const;

export class StaticPattern<TEvent extends TimedEvent> implements Pattern<TEvent> {
  public readonly id: string;
  public readonly cycle?: Rational;
  private readonly events: readonly TEvent[];

  public constructor(id: string, events: readonly TEvent[], cycle?: Rational) {
    if (id.length === 0) throw new TypeError("Pattern ID cannot be empty.");
    this.id = id;
    const ids = new Set<string>();
    for (const event of events) {
      if (ids.has(event.id)) throw new TypeError(`Pattern ${id} contains duplicate event ID ${event.id}.`);
      ids.add(event.id);
      if (event.duration.compare(0) < 0) throw new RangeError(`Pattern event ${event.id} has negative duration.`);
      if (!Number.isFinite(event.velocity) || event.velocity < 0 || event.velocity > 1) throw new RangeError(`Pattern event ${event.id} has invalid velocity.`);
    }
    if (cycle !== undefined) {
      if (cycle.compare(0) <= 0) throw new RangeError("Pattern cycle must be positive.");
      for (const event of events) {
        if (event.start.compare(0) < 0 || event.start.compare(cycle) >= 0) {
          throw new RangeError(`Loop-source event ${event.id} must start within [0, cycle).`);
        }
      }
      this.cycle = cycle;
    }
    this.events = [...events].sort(compareTimedEvents);
  }

  public query(interval: BeatInterval, context: EvaluationContext): readonly TEvent[] {
    assertValidInterval(interval);
    if (!Number.isSafeInteger(context.maxEvents) || context.maxEvents < 0) {
      throw new RangeError("Evaluation maxEvents must be a non-negative safe integer.");
    }
    return this.cycle === undefined
      ? this.querySingle(interval, context.maxEvents)
      : this.queryLooped(interval, this.cycle, context.maxEvents);
  }

  private querySingle(interval: BeatInterval, maxEvents: number): readonly TEvent[] {
    const result: TEvent[] = [];
    for (const event of this.events) {
      if (!eventIntersects(event, interval)) continue;
      if (result.length >= maxEvents) throw eventBudgetError(this.id, result.length + 1, maxEvents);
      result.push(event);
    }
    return result;
  }

  private queryLooped(interval: BeatInterval, cycle: Rational, maxEvents: number): readonly TEvent[] {
    const result: TEvent[] = [];
    for (const event of this.events) {
      const [firstCycle, lastCycle] = cycleRangeForEvent(event, interval, cycle);
      if (lastCycle < firstCycle) continue;
      const candidateCount = lastCycle - firstCycle + 1n;
      if (candidateCount > BigInt(maxEvents - result.length)) {
        throw eventBudgetError(this.id, result.length + Number(candidateCount > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : candidateCount), maxEvents);
      }
      for (let cycleIndex = firstCycle; cycleIndex <= lastCycle; cycleIndex += 1n) {
        const offset = cycle.multiply(cycleIndex);
        const generatedIdentity = event.generatedIdentity === undefined
          ? undefined
          : {
              ...event.generatedIdentity,
              stableKey: stableIdV2("gkey", event.generatedIdentity.stableKey, cycleIndex.toString()),
            };
        result.push({
          ...event,
          id: stableIdV2("event", this.id, event.id, cycleIndex.toString()),
          start: event.start.add(offset),
          ...(generatedIdentity === undefined ? {} : { generatedIdentity }),
        } as TEvent);
      }
    }
    return result.sort(compareTimedEvents);
  }
}

export function eventIntersects(event: TimedEvent, interval: BeatInterval): boolean {
  if (event.duration.equals(0)) {
    return event.start.compare(interval.start) >= 0 && event.start.compare(interval.end) < 0;
  }
  const eventEnd = event.start.add(event.duration);
  return event.start.compare(interval.end) < 0 && eventEnd.compare(interval.start) > 0;
}

function cycleRangeForEvent(
  event: TimedEvent,
  interval: BeatInterval,
  cycle: Rational,
): readonly [bigint, bigint] {
  if (event.duration.equals(0)) {
    const first = ceilRational(interval.start.subtract(event.start).divide(cycle));
    const last = ceilRational(interval.end.subtract(event.start).divide(cycle)) - 1n;
    return [first, last];
  }
  const eventEnd = event.start.add(event.duration);
  // eventEnd + k*cycle > interval.start
  const first = interval.start.subtract(eventEnd).divide(cycle).floor() + 1n;
  // event.start + k*cycle < interval.end
  const last = ceilRational(interval.end.subtract(event.start).divide(cycle)) - 1n;
  return [first, last];
}

function ceilRational(value: Rational): bigint {
  return -value.multiply(-1n).floor();
}

function compareTimedEvents(left: TimedEvent, right: TimedEvent): number {
  const start = left.start.compare(right.start);
  return start !== 0 ? start : compareUtf8(left.id, right.id);
}

function eventBudgetError(patternId: string, attempted: number, maximum: number): RangeError {
  return new RangeError(`Pattern ${patternId} would produce at least ${attempted} events; limit is ${maximum}.`);
}

