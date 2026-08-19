import { NoteSequencePlayer, type PreviewNote } from "../audio/note-sequence-player.js";
import { integrateLorenz, normalizePoints, type Point3D } from "../operators/chaos.js";
import { metric, rangeControl } from "../ui/controls.js";
import { button, clear, el, svgEl } from "../ui/dom.js";
import { labHeader, panel } from "../ui/lab-layout.js";
import type { LabModule } from "./types.js";

const metadata = {
  id: "chaos-attractor",
  name: "Chaos Attractor",
  shortName: "Chaos",
  category: "Dynamical systems",
  summary: "Integrate a deterministic nonlinear system, inspect its trajectory, and map bounded coordinates into musical controls.",
  status: "preview" as const,
  statusLabel: "Computational preview",
  researchCharters: ["DR-07", "DR-08"],
  milestone: "M1 lab hardening",
};

export const chaosAttractorLab: LabModule = {
  ...metadata,
  mount(container): () => void {
    let sigma = 10;
    let rho = 28;
    let beta = 8 / 3;
    let sampleStride = 14;
    let points = generate();
    const visualization = el("div", { className: "chaos-visualization" });
    const metrics = el("div", { className: "metric-grid metric-grid-four" });
    const mappingPreview = el("div", { className: "mapping-table" });
    const player = new NoteSequencePlayer("chaos", sequenceParameters());

    const playButton = button("Play attractor path", {
      className: "button button-primary",
      onClick: async () => {
        player.update(sequenceParameters());
        await player.start();
      },
    });

    const controls = el(
      "div",
      { className: "control-grid" },
      rangeControl({
        label: "Sigma",
        value: sigma,
        min: 4,
        max: 20,
        step: 0.25,
        format: (value) => value.toFixed(2),
        onInput: (value) => {
          sigma = value;
          regenerate();
        },
      }).root,
      rangeControl({
        label: "Rho",
        value: rho,
        min: 12,
        max: 48,
        step: 0.25,
        format: (value) => value.toFixed(2),
        onInput: (value) => {
          rho = value;
          regenerate();
        },
      }).root,
      rangeControl({
        label: "Beta",
        value: beta,
        min: 1,
        max: 5,
        step: 0.05,
        format: (value) => value.toFixed(2),
        onInput: (value) => {
          beta = value;
          regenerate();
        },
      }).root,
      rangeControl({
        label: "Musical sample stride",
        value: sampleStride,
        min: 4,
        max: 36,
        step: 1,
        format: (value) => `every ${value} points`,
        description: "Changes how densely the continuous trajectory is converted into events.",
        onInput: (value) => {
          sampleStride = value;
          player.update(sequenceParameters());
          renderMetrics();
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
      el("div", { className: "lab-toolbar" }, playButton, el("span", { className: "audio-notice", text: "The path is deterministic; the mapping is bounded and scale-quantized." })),
      metrics,
      el(
        "div",
        { className: "two-column-layout" },
        panel("Lorenz x–z projection", visualization, { className: "panel-visual" }),
        panel("System parameters", controls),
      ),
      panel("Coordinate mapping", mappingPreview, { kicker: "Continuous state → musical control" }),
      panel(
        "Research boundary",
        el("p", {
          className: "body-copy",
          text: "A chaotic equation does not automatically produce perceptually meaningful music. DR-07 must compare sampling, smoothing, quantization, and parameter-normalization strategies while preserving the system’s recognizable dynamics.",
        }),
        { kicker: "DR-07" },
      ),
    );

    renderAll();
    return () => player.stop();

    function generate(): readonly Point3D[] {
      return integrateLorenz({
        sigma,
        rho,
        beta,
        timeStep: 0.008,
        steps: 4_200,
        initial: [0.1, 0, 0],
      });
    }

    function regenerate(): void {
      points = generate();
      player.update(sequenceParameters());
      renderAll();
    }

    function renderAll(): void {
      renderVisualization();
      renderMetrics();
      renderMapping();
    }

    function renderVisualization(): void {
      clear(visualization);
      const width = 760;
      const height = 520;
      const padding = 30;
      const normalized = normalizePoints(points.slice(200));
      const pathData = normalized
        .filter((_, index) => index % 2 === 0)
        .map((point, index) => `${index === 0 ? "M" : "L"}${(padding + point.x * (width - padding * 2)).toFixed(2)},${(height - padding - point.z * (height - padding * 2)).toFixed(2)}`)
        .join(" ");
      const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Lorenz attractor x-z projection" });
      svg.append(
        svgEl("rect", { x: padding, y: padding, width: width - padding * 2, height: height - padding * 2, rx: 18, class: "chaos-frame" }),
        svgEl("path", { d: pathData, class: "chaos-path" }),
      );
      const start = normalized[0];
      const end = normalized.at(-1);
      if (start !== undefined) {
        svg.append(svgEl("circle", { cx: padding + start.x * (width - padding * 2), cy: height - padding - start.z * (height - padding * 2), r: 6, class: "chaos-marker is-start" }));
      }
      if (end !== undefined) {
        svg.append(svgEl("circle", { cx: padding + end.x * (width - padding * 2), cy: height - padding - end.z * (height - padding * 2), r: 6, class: "chaos-marker is-end" }));
      }
      visualization.append(svg);
    }

    function renderMetrics(): void {
      const considered = points.slice(200);
      const xRange = extent(considered.map((point) => point.x));
      const zRange = extent(considered.map((point) => point.z));
      const pathLength = considered.slice(1).reduce((sum, point, index) => {
        const previous = considered[index];
        return previous === undefined ? sum : sum + distance(previous, point);
      }, 0);
      const noteCount = sequenceParameters().notes.length;
      clear(metrics);
      metrics.append(
        metric("Integrated points", points.length.toLocaleString(), "RK4, Δt = 0.008"),
        metric("x extent", `${xRange.min.toFixed(1)}…${xRange.max.toFixed(1)}`, "After burn-in"),
        metric("z extent", `${zRange.min.toFixed(1)}…${zRange.max.toFixed(1)}`, "After burn-in"),
        metric("Mapped notes", noteCount.toLocaleString(), `Path length ${pathLength.toFixed(0)}`),
      );
    }

    function renderMapping(): void {
      clear(mappingPreview);
      const rows: readonly (readonly [string, string, string])[] = [
        ["normalized x", "scale degree", "left/right lobe changes melodic region"],
        ["normalized y", "stereo pan", "continuous spatial movement"],
        ["normalized z", "velocity", "higher trajectory increases emphasis"],
        ["sample stride", "event density", "operator-controlled discretization"],
        ["fixed seed + parameters", "reproducibility", "exact same trajectory and event stream"],
      ];
      for (const [source, target, detail] of rows) {
        mappingPreview.append(el("div", { className: "mapping-row" }, el("code", { text: source }), el("span", { className: "mapping-arrow", text: "→" }), el("strong", { text: target }), el("span", { text: detail })));
      }
    }

    function sequenceParameters() {
      const normalized = normalizePoints(points.slice(200));
      const sampled = normalized.filter((_, index) => index % sampleStride === 0).slice(0, 160);
      const scale = [0, 2, 3, 5, 7, 9, 10];
      const notes: PreviewNote[] = sampled.map((point, index) => {
        const scalePosition = Math.round(point.x * 20);
        const degree = scale[scalePosition % scale.length] ?? 0;
        const octave = Math.floor(scalePosition / scale.length);
        return {
          beat: index * 0.125,
          durationBeats: 0.095 + point.z * 0.12,
          midi: 45 + octave * 12 + degree,
          velocity: 0.35 + point.z * 0.5,
          pan: point.y * 1.6 - 0.8,
          waveform: point.x < 0.5 ? "sine" : "triangle",
        };
      });
      return {
        bpm: 110,
        cycleBeats: Math.max(2, notes.length * 0.125),
        notes,
        loop: false,
        masterGain: 0.52,
      } as const;
    }
  },
};

function extent(values: readonly number[]): { min: number; max: number } {
  return { min: Math.min(...values), max: Math.max(...values) };
}

function distance(left: Point3D, right: Point3D): number {
  return Math.hypot(right.x - left.x, right.y - left.y, right.z - left.z);
}
