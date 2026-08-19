import { NoteSequencePlayer, type PreviewNote } from "../audio/note-sequence-player.js";
import { generateFractalMotif, type FractalMotifEvent } from "../operators/fractal.js";
import { metric, rangeControl, selectControl } from "../ui/controls.js";
import { button, clear, el, svgEl } from "../ui/dom.js";
import { labHeader, panel } from "../ui/lab-layout.js";
import type { LabModule } from "./types.js";

const MOTIFS = {
  ascent: { label: "Open ascent", degrees: [0, 2, 5, 7] },
  arch: { label: "Symmetric arch", degrees: [0, 4, 7, 4] },
  angular: { label: "Angular branch", degrees: [0, 7, -2, 5] },
  triad: { label: "Triadic cell", degrees: [0, 4, 7] },
} as const;

type MotifId = keyof typeof MOTIFS;

const metadata = {
  id: "fractal-motif",
  name: "Fractal Motif",
  shortName: "Fractal",
  category: "Recursive structure",
  summary: "Nest a seed motif inside its own time intervals, producing self-similar structure at multiple musical scales.",
  status: "preview" as const,
  statusLabel: "Computational preview",
  researchCharters: ["DR-05", "DR-08"],
  milestone: "M1 lab hardening",
};

export const fractalMotifLab: LabModule = {
  ...metadata,
  mount(container): () => void {
    let motifId: MotifId = "ascent";
    let depth = 3;
    let rootMidi = 48;
    let totalBeats = 8;
    let pitchScale = 1;
    let events = generate();
    const visualization = el("div", { className: "fractal-visualization" });
    const metrics = el("div", { className: "metric-grid metric-grid-four" });
    const provenance = el("div", { className: "provenance-preview" });
    const player = new NoteSequencePlayer("fractal", sequenceParameters());

    const playButton = button("Play recursive motif", {
      className: "button button-primary",
      onClick: async () => {
        player.update(sequenceParameters());
        await player.start();
      },
    });

    const controls = el(
      "div",
      { className: "control-grid" },
      selectControl({
        label: "Seed motif",
        value: motifId,
        choices: Object.entries(MOTIFS).map(([value, motif]) => ({ value: value as MotifId, label: `${motif.label} [${motif.degrees.join(", ")}]` })),
        onChange: (value) => {
          motifId = value;
          regenerate();
        },
      }),
      rangeControl({
        label: "Recursion depth",
        value: depth,
        min: 1,
        max: 5,
        step: 1,
        format: (value) => String(value),
        description: "Event count grows as seed length raised to this depth.",
        onInput: (value) => {
          depth = value;
          regenerate();
        },
      }).root,
      rangeControl({
        label: "Root pitch",
        value: rootMidi,
        min: 36,
        max: 60,
        step: 1,
        format: (value) => midiName(value),
        onInput: (value) => {
          rootMidi = value;
          regenerate();
        },
      }).root,
      rangeControl({
        label: "Pitch scaling",
        value: pitchScale,
        min: 0.5,
        max: 2,
        step: 0.25,
        format: (value) => `${value.toFixed(2)}×`,
        description: "Scales each recursive pitch displacement.",
        onInput: (value) => {
          pitchScale = value;
          regenerate();
        },
      }).root,
      rangeControl({
        label: "Total duration",
        value: totalBeats,
        min: 4,
        max: 16,
        step: 1,
        format: (value) => `${value} beats`,
        onInput: (value) => {
          totalBeats = value;
          regenerate();
        },
      }).root,
    );

    container.append(
      labHeader({
        eyebrow: metadata.category,
        title: metadata.name,
        summary: metadata.summary,
        status: metadata.status,
        statusLabel: metadata.statusLabel,
      }),
      el("div", { className: "lab-toolbar" }, playButton, el("span", { className: "audio-notice", text: "Generation is deterministic and hard-limited before scheduling." })),
      metrics,
      el(
        "div",
        { className: "two-column-layout" },
        panel("Time–pitch recursion map", visualization, { className: "panel-visual" }),
        panel("Parameters", controls),
      ),
      panel("Event provenance sample", provenance, { kicker: "Click-to-explain foundation" }),
      panel(
        "Safety rule",
        el("p", {
          className: "body-copy",
          text: "Recursive operators must estimate event growth before evaluation. The foundation rejects graphs that exceed the configured event budget instead of allowing an exponential pattern to stall the audio or UI thread.",
        }),
        { kicker: "Bounded evaluation" },
      ),
    );

    renderAll();
    return () => player.stop();

    function generate(): readonly FractalMotifEvent[] {
      return generateFractalMotif({
        seedDegrees: MOTIFS[motifId].degrees,
        depth,
        totalBeats,
        rootMidi,
        pitchScale,
        maxEvents: 4_096,
      });
    }

    function regenerate(): void {
      try {
        events = generate();
        player.update(sequenceParameters());
        renderAll();
      } catch (error) {
        visualization.replaceChildren(el("div", { className: "inline-error", text: error instanceof Error ? error.message : String(error) }));
      }
    }

    function renderAll(): void {
      renderVisualization();
      renderMetrics();
      renderProvenance();
    }

    function renderMetrics(): void {
      const pitches = events.map((event) => event.midi);
      const minimum = Math.min(...pitches);
      const maximum = Math.max(...pitches);
      clear(metrics);
      metrics.append(
        metric("Events", events.length.toLocaleString(), `${MOTIFS[motifId].degrees.length}^${depth}`),
        metric("Smallest cell", `${(totalBeats / events.length).toFixed(4)} beats`, "Before articulation scaling"),
        metric("Pitch span", `${midiName(minimum)}–${midiName(maximum)}`, `${maximum - minimum} semitones`),
        metric("Determinism", "Exact", "Same parameters → same events"),
      );
    }

    function renderVisualization(): void {
      clear(visualization);
      const width = 800;
      const height = 440;
      const padding = { left: 58, right: 22, top: 28, bottom: 42 };
      const pitches = events.map((event) => event.midi);
      const minimumPitch = Math.min(...pitches) - 1;
      const maximumPitch = Math.max(...pitches) + 1;
      const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Fractal motif events plotted by time and pitch" });

      for (let beat = 0; beat <= totalBeats; beat += 1) {
        const x = padding.left + (beat / totalBeats) * (width - padding.left - padding.right);
        svg.append(svgEl("line", { x1: x, y1: padding.top, x2: x, y2: height - padding.bottom, class: "plot-grid-line" }));
        const label = svgEl("text", { x, y: height - 16, class: "plot-axis-label", "text-anchor": "middle" });
        label.textContent = String(beat);
        svg.append(label);
      }

      const displayEvents = downsample(events, 900);
      for (const event of displayEvents) {
        const x = padding.left + (event.beat / totalBeats) * (width - padding.left - padding.right);
        const normalizedPitch = (event.midi - minimumPitch) / Math.max(1, maximumPitch - minimumPitch);
        const y = height - padding.bottom - normalizedPitch * (height - padding.top - padding.bottom);
        const eventWidth = Math.max(1.5, (event.durationBeats / totalBeats) * (width - padding.left - padding.right));
        svg.append(svgEl("rect", {
          x,
          y: y - 3,
          width: eventWidth,
          height: 6,
          rx: 3,
          class: `fractal-event generation-${event.generation % 5}`,
          opacity: Math.max(0.35, 1 - event.generation * 0.08),
        }));
      }
      const yLabel = svgEl("text", { x: 14, y: height / 2, class: "plot-axis-title", transform: `rotate(-90 14 ${height / 2})`, "text-anchor": "middle" });
      yLabel.textContent = "pitch";
      const xLabel = svgEl("text", { x: width / 2, y: height - 2, class: "plot-axis-title", "text-anchor": "middle" });
      xLabel.textContent = "beat position";
      svg.append(yLabel, xLabel);
      visualization.append(svg);
    }

    function renderProvenance(): void {
      clear(provenance);
      const samples = [events[0], events[Math.floor(events.length / 3)], events[Math.floor(events.length * 2 / 3)], events.at(-1)].filter((event): event is FractalMotifEvent => event !== undefined);
      for (const event of samples) {
        provenance.append(
          el(
            "article",
            { className: "provenance-card" },
            el("strong", { text: `${midiName(event.midi)} at beat ${event.beat.toFixed(3)}` }),
            el("code", { text: `path [${event.path.join(" → ")}]` }),
            el("p", { text: `Reached generation ${event.generation}; each path index identifies the seed event selected at that recursion level.` }),
          ),
        );
      }
    }

    function sequenceParameters() {
      const notes: PreviewNote[] = events.slice(0, 1_024).map((event, index) => ({
        beat: event.beat,
        durationBeats: Math.min(0.45, Math.max(0.04, event.durationBeats)),
        midi: clamp(event.midi, 24, 104),
        velocity: 0.48 + (index % MOTIFS[motifId].degrees.length) * 0.08,
        pan: ((event.path.at(-1) ?? 0) / Math.max(1, MOTIFS[motifId].degrees.length - 1)) * 1.2 - 0.6,
        waveform: index % 3 === 0 ? "sine" : "triangle",
      }));
      return {
        bpm: 96,
        cycleBeats: totalBeats,
        notes,
        loop: false,
        masterGain: 0.56,
      } as const;
    }
  },
};

function midiName(midi: number): string {
  const names = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
  const rounded = Math.round(midi);
  return `${names[((rounded % 12) + 12) % 12] ?? "?"}${Math.floor(rounded / 12) - 1}`;
}

function downsample<T>(values: readonly T[], maximum: number): readonly T[] {
  if (values.length <= maximum) {
    return values;
  }
  const stride = values.length / maximum;
  return Array.from({ length: maximum }, (_, index) => values[Math.floor(index * stride)]).filter((value): value is T => value !== undefined);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
