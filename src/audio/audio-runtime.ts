export type OscillatorWaveform = OscillatorType;

export interface ScheduledTone {
  readonly groupId: string;
  readonly time: number;
  readonly frequency: number;
  readonly duration: number;
  readonly gain: number;
  readonly waveform?: OscillatorWaveform | undefined;
  readonly pan?: number | undefined;
}

export interface ScheduledNoise {
  readonly groupId: string;
  readonly time: number;
  readonly duration: number;
  readonly gain: number;
  readonly highpassHz?: number | undefined;
  readonly pan?: number | undefined;
}

/**
 * Shared browser-audio boundary. Mathematical operators remain independent of
 * Web Audio; only schedulers call this runtime.
 */
export class AudioRuntime {
  private context: AudioContext | undefined;
  private masterGain: GainNode | undefined;
  private compressor: DynamicsCompressorNode | undefined;
  private noiseBuffer: AudioBuffer | undefined;
  private readonly groupedSources = new Map<string, Set<AudioScheduledSourceNode>>();

  public async ensureStarted(): Promise<AudioContext> {
    if (this.context === undefined) {
      const AudioContextConstructor = window.AudioContext;
      this.context = new AudioContextConstructor({ latencyHint: "interactive" });
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.72;
      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.value = -12;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 8;
      this.compressor.attack.value = 0.004;
      this.compressor.release.value = 0.18;
      this.masterGain.connect(this.compressor).connect(this.context.destination);
    }
    if (this.context.state !== "running") {
      await this.context.resume();
    }
    return this.context;
  }

  public get currentTime(): number {
    return this.context?.currentTime ?? 0;
  }

  public setMasterGain(value: number): void {
    const clamped = clamp(value, 0, 1);
    if (this.masterGain !== undefined && this.context !== undefined) {
      this.masterGain.gain.setTargetAtTime(clamped, this.context.currentTime, 0.015);
    }
  }

  public scheduleTone(options: ScheduledTone): void {
    const context = this.requireContext();
    const destination = this.requireMasterGain();
    const start = Math.max(options.time, context.currentTime + 0.001);
    const duration = clamp(options.duration, 0.008, 8);
    const stop = start + duration + 0.06;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const panner = context.createStereoPanner();

    oscillator.type = options.waveform ?? "sine";
    oscillator.frequency.setValueAtTime(clamp(options.frequency, 20, 20_000), start);
    panner.pan.setValueAtTime(clamp(options.pan ?? 0, -1, 1), start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(options.gain, 0.0002), start + 0.004);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(envelope).connect(panner).connect(destination);
    this.trackSource(options.groupId, oscillator);
    oscillator.addEventListener("ended", () => {
      oscillator.disconnect();
      envelope.disconnect();
      panner.disconnect();
      this.untrackSource(options.groupId, oscillator);
    }, { once: true });
    oscillator.start(start);
    oscillator.stop(stop);
  }

  public scheduleNoise(options: ScheduledNoise): void {
    const context = this.requireContext();
    const destination = this.requireMasterGain();
    const start = Math.max(options.time, context.currentTime + 0.001);
    const duration = clamp(options.duration, 0.008, 2);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    const panner = context.createStereoPanner();

    source.buffer = this.getNoiseBuffer(context);
    filter.type = "highpass";
    filter.frequency.setValueAtTime(options.highpassHz ?? 4_000, start);
    panner.pan.setValueAtTime(clamp(options.pan ?? 0, -1, 1), start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(options.gain, 0.0002), start + 0.002);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(filter).connect(envelope).connect(panner).connect(destination);
    this.trackSource(options.groupId, source);
    source.addEventListener("ended", () => {
      source.disconnect();
      filter.disconnect();
      envelope.disconnect();
      panner.disconnect();
      this.untrackSource(options.groupId, source);
    }, { once: true });
    source.start(start);
    source.stop(start + duration + 0.01);
  }

  public stopGroup(groupId: string): void {
    const sources = this.groupedSources.get(groupId);
    if (sources === undefined) {
      return;
    }
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        // A source may already have ended; stopping is intentionally idempotent.
      }
    }
    sources.clear();
    this.groupedSources.delete(groupId);
  }

  public stopAll(): void {
    for (const groupId of [...this.groupedSources.keys()]) {
      this.stopGroup(groupId);
    }
  }

  private requireContext(): AudioContext {
    if (this.context === undefined) {
      throw new Error("AudioRuntime.ensureStarted() must be called before scheduling audio.");
    }
    return this.context;
  }

  private requireMasterGain(): GainNode {
    if (this.masterGain === undefined) {
      throw new Error("Audio master gain is not initialized.");
    }
    return this.masterGain;
  }

  private trackSource(groupId: string, source: AudioScheduledSourceNode): void {
    const sources = this.groupedSources.get(groupId) ?? new Set<AudioScheduledSourceNode>();
    sources.add(source);
    this.groupedSources.set(groupId, sources);
  }

  private untrackSource(groupId: string, source: AudioScheduledSourceNode): void {
    const sources = this.groupedSources.get(groupId);
    sources?.delete(source);
    if (sources?.size === 0) {
      this.groupedSources.delete(groupId);
    }
  }

  private getNoiseBuffer(context: AudioContext): AudioBuffer {
    if (this.noiseBuffer !== undefined) {
      return this.noiseBuffer;
    }
    const frameCount = Math.floor(context.sampleRate * 1.5);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let state = 0x1234abcd;
    for (let index = 0; index < frameCount; index += 1) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      channel[index] = ((state >>> 0) / 2_147_483_648) - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export const audioRuntime = new AudioRuntime();
