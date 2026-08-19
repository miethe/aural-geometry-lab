import { instantaneousPulseIntervalSeconds, rissetLayers } from "../operators/risset.js";
import { audioRuntime } from "./audio-runtime.js";

export interface RissetPlayerParameters {
  readonly baseBpm: number;
  readonly cycleSeconds: number;
  readonly layerCount: number;
  readonly tempoRatio: number;
  readonly masterGain: number;
  readonly anchorEnabled: boolean;
  readonly direction: "accelerate" | "decelerate";
}

export interface RissetPlaybackFrame {
  readonly elapsedSeconds: number;
  readonly phase: number;
  readonly playing: boolean;
}

interface LayerClock {
  readonly index: number;
  nextPulseTime: number;
}

export class RissetPlayer {
  private readonly groupId = "lab-risset";
  private parameters: RissetPlayerParameters;
  private clocks: LayerClock[] = [];
  private nextAnchorTime = 0;
  private startTime = 0;
  private intervalId: number | undefined;
  private animationId: number | undefined;
  private onFrame: ((frame: RissetPlaybackFrame) => void) | undefined;

  public constructor(parameters: RissetPlayerParameters) {
    this.parameters = parameters;
  }

  public get playing(): boolean {
    return this.intervalId !== undefined;
  }

  public async start(onFrame: (frame: RissetPlaybackFrame) => void): Promise<void> {
    this.stop();
    const context = await audioRuntime.ensureStarted();
    this.onFrame = onFrame;
    this.startTime = context.currentTime + 0.08;
    this.clocks = Array.from({ length: this.parameters.layerCount }, (_, index) => ({
      index,
      nextPulseTime: this.startTime,
    }));
    this.nextAnchorTime = this.startTime;
    this.intervalId = window.setInterval(() => this.schedule(), 24);
    this.animationId = window.requestAnimationFrame(() => this.animate());
    this.schedule();
  }

  public update(parameters: RissetPlayerParameters): void {
    const layerCountChanged = parameters.layerCount !== this.parameters.layerCount;
    this.parameters = parameters;
    audioRuntime.setMasterGain(parameters.masterGain);
    if (layerCountChanged && this.playing) {
      const now = audioRuntime.currentTime + 0.04;
      this.clocks = Array.from({ length: parameters.layerCount }, (_, index) => ({
        index,
        nextPulseTime: now,
      }));
    }
  }

  public stop(): void {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    if (this.animationId !== undefined) {
      window.cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
    audioRuntime.stopGroup(this.groupId);
    this.onFrame?.({ elapsedSeconds: 0, phase: 0, playing: false });
  }

  private schedule(): void {
    const now = audioRuntime.currentTime;
    const horizon = now + 0.12;
    const maximumPulsesPerClock = 48;

    for (const clock of this.clocks) {
      let scheduled = 0;
      while (clock.nextPulseTime < horizon && scheduled < maximumPulsesPerClock) {
        const phase = this.phaseAt(clock.nextPulseTime);
        const layers = rissetLayers({
          baseBpm: this.parameters.baseBpm,
          layerCount: this.parameters.layerCount,
          tempoRatio: this.parameters.tempoRatio,
          phase,
          envelopeShape: "raised-cosine",
        });
        const layer = layers[clock.index];
        if (layer === undefined) {
          break;
        }
        const gain = layer.gain * 0.12;
        if (gain > 0.0025) {
          audioRuntime.scheduleTone({
            groupId: this.groupId,
            time: clock.nextPulseTime,
            frequency: 820 + clock.index * 18,
            duration: 0.025,
            gain,
            waveform: "triangle",
            pan: this.parameters.layerCount === 1
              ? 0
              : (clock.index / (this.parameters.layerCount - 1)) * 1.2 - 0.6,
          });
        }
        const interval = instantaneousPulseIntervalSeconds(
          this.parameters.baseBpm,
          layer.tempoMultiplier,
        );
        clock.nextPulseTime += Math.max(0.026, interval);
        scheduled += 1;
      }
      if (scheduled >= maximumPulsesPerClock) {
        clock.nextPulseTime = horizon;
      }
    }

    if (this.parameters.anchorEnabled) {
      const anchorInterval = 60 / this.parameters.baseBpm;
      while (this.nextAnchorTime < horizon) {
        audioRuntime.scheduleTone({
          groupId: this.groupId,
          time: this.nextAnchorTime,
          frequency: 150,
          duration: 0.055,
          gain: 0.075,
          waveform: "sine",
        });
        this.nextAnchorTime += anchorInterval;
      }
    } else {
      this.nextAnchorTime = Math.max(this.nextAnchorTime, now);
    }
  }

  private animate(): void {
    const elapsedSeconds = Math.max(0, audioRuntime.currentTime - this.startTime);
    this.onFrame?.({
      elapsedSeconds,
      phase: this.phaseAt(audioRuntime.currentTime),
      playing: true,
    });
    this.animationId = window.requestAnimationFrame(() => this.animate());
  }

  private phaseAt(audioTime: number): number {
    const elapsed = Math.max(0, audioTime - this.startTime);
    const rawPhase = (elapsed / this.parameters.cycleSeconds) % 1;
    return this.parameters.direction === "accelerate" ? rawPhase : (1 - rawPhase) % 1;
  }
}
