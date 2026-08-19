import { audioRuntime, type OscillatorWaveform } from "./audio-runtime.js";

export interface PreviewNote {
  readonly beat: number;
  readonly durationBeats: number;
  readonly midi: number;
  readonly velocity: number;
  readonly pan?: number | undefined;
  readonly waveform?: OscillatorWaveform | undefined;
}

export interface NoteSequenceParameters {
  readonly bpm: number;
  readonly cycleBeats: number;
  readonly notes: readonly PreviewNote[];
  readonly loop: boolean;
  readonly masterGain: number;
}

export class NoteSequencePlayer {
  private readonly groupId: string;
  private parameters: NoteSequenceParameters;
  private timerId: number | undefined;
  private nextCycleStart = 0;
  private scheduledOneShot = false;

  public constructor(id: string, parameters: NoteSequenceParameters) {
    this.groupId = `note-sequence-${id}`;
    this.parameters = parameters;
  }

  public get playing(): boolean {
    return this.timerId !== undefined;
  }

  public async start(): Promise<void> {
    this.stop();
    const context = await audioRuntime.ensureStarted();
    audioRuntime.setMasterGain(this.parameters.masterGain);
    this.nextCycleStart = context.currentTime + 0.08;
    this.scheduledOneShot = false;
    this.timerId = window.setInterval(() => this.schedule(), 30);
    this.schedule();
  }

  public update(parameters: NoteSequenceParameters): void {
    this.parameters = parameters;
    audioRuntime.setMasterGain(parameters.masterGain);
  }

  public stop(): void {
    if (this.timerId !== undefined) {
      window.clearInterval(this.timerId);
      this.timerId = undefined;
    }
    audioRuntime.stopGroup(this.groupId);
  }

  private schedule(): void {
    const now = audioRuntime.currentTime;
    const horizon = now + 0.18;
    const secondsPerBeat = 60 / this.parameters.bpm;
    const cycleSeconds = this.parameters.cycleBeats * secondsPerBeat;

    while (this.nextCycleStart < horizon && (!this.scheduledOneShot || this.parameters.loop)) {
      for (const note of this.parameters.notes) {
        const time = this.nextCycleStart + note.beat * secondsPerBeat;
        audioRuntime.scheduleTone({
          groupId: this.groupId,
          time,
          frequency: midiToFrequency(note.midi),
          duration: Math.max(0.03, note.durationBeats * secondsPerBeat),
          gain: 0.1 * note.velocity,
          waveform: note.waveform ?? "triangle",
          pan: note.pan,
        });
      }
      this.scheduledOneShot = true;
      this.nextCycleStart += cycleSeconds;
    }

    if (!this.parameters.loop && this.scheduledOneShot && now > this.nextCycleStart) {
      if (this.timerId !== undefined) {
        window.clearInterval(this.timerId);
        this.timerId = undefined;
      }
    }
  }
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}
