import { audioRuntime } from "./audio-runtime.js";

export interface EuclideanPlaybackRing {
  readonly steps: number;
  readonly pattern: readonly boolean[];
  readonly gain: number;
}

export interface EuclideanPlayerParameters {
  readonly bpm: number;
  readonly rings: readonly EuclideanPlaybackRing[];
  readonly masterGain: number;
}

export class EuclideanPlayer {
  private readonly groupId = "lab-euclidean";
  private parameters: EuclideanPlayerParameters;
  private timerId: number | undefined;
  private nextStepTime = 0;
  private tick = 0;
  private onTick: ((tick: number) => void) | undefined;

  public constructor(parameters: EuclideanPlayerParameters) {
    this.parameters = parameters;
  }

  public get playing(): boolean {
    return this.timerId !== undefined;
  }

  public async start(onTick: (tick: number) => void): Promise<void> {
    this.stop();
    const context = await audioRuntime.ensureStarted();
    this.onTick = onTick;
    this.nextStepTime = context.currentTime + 0.08;
    this.tick = 0;
    this.timerId = window.setInterval(() => this.schedule(), 24);
    this.schedule();
  }

  public update(parameters: EuclideanPlayerParameters): void {
    this.parameters = parameters;
    audioRuntime.setMasterGain(parameters.masterGain);
  }

  public stop(): void {
    if (this.timerId !== undefined) {
      window.clearInterval(this.timerId);
      this.timerId = undefined;
    }
    audioRuntime.stopGroup(this.groupId);
    this.onTick?.(-1);
  }

  private schedule(): void {
    const now = audioRuntime.currentTime;
    const horizon = now + 0.12;
    const stepSeconds = 60 / this.parameters.bpm / 4;

    while (this.nextStepTime < horizon) {
      const scheduledTick = this.tick;
      for (const [ringIndex, ring] of this.parameters.rings.entries()) {
        const step = scheduledTick % ring.steps;
        if (ring.pattern[step] === true) {
          this.scheduleVoice(ringIndex, this.nextStepTime, ring.gain);
        }
      }
      const uiDelay = Math.max(0, (this.nextStepTime - now) * 1_000);
      window.setTimeout(() => this.onTick?.(scheduledTick), uiDelay);
      this.tick += 1;
      this.nextStepTime += stepSeconds;
    }
  }

  private scheduleVoice(index: number, time: number, gain: number): void {
    if (index === 0) {
      audioRuntime.scheduleTone({
        groupId: this.groupId,
        time,
        frequency: 88,
        duration: 0.11,
        gain: 0.18 * gain,
        waveform: "sine",
        pan: -0.12,
      });
      return;
    }
    if (index === 1) {
      audioRuntime.scheduleNoise({
        groupId: this.groupId,
        time,
        duration: 0.035,
        gain: 0.09 * gain,
        highpassHz: 5_500,
        pan: 0.18,
      });
      return;
    }
    audioRuntime.scheduleTone({
      groupId: this.groupId,
      time,
      frequency: 660,
      duration: 0.07,
      gain: 0.09 * gain,
      waveform: "triangle",
      pan: 0.45,
    });
  }
}
