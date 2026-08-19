import { RissetPlayer, type RissetPlayerParameters } from "../audio/risset-player.js";
import { rissetCycleError, rissetLayers } from "../operators/risset.js";
import { metric, rangeControl, segmentedControl, toggleControl } from "../ui/controls.js";
import { button, clear, el, svgEl } from "../ui/dom.js";
import { formulaBlock, labHeader, panel } from "../ui/lab-layout.js";
import type { LabModule } from "./types.js";

const metadata = {
  id: "infinite-staircase",
  name: "Infinite Staircase",
  shortName: "Staircase",
  category: "Perceptual illusion",
  summary: "Build and inspect an endlessly accelerating or decelerating Risset rhythm in logarithmic tempo space.",
  status: "working" as const,
  statusLabel: "Research-integrated preview",
  researchCharters: ["DR-01", "DR-03", "DR-08"],
  milestone: "M2 shared-runtime migration",
};

export const infiniteStaircaseLab: LabModule = {
  ...metadata,
  mount(container): () => void {
    let parameters: RissetPlayerParameters = {
      baseBpm: 120,
      cycleSeconds: 20,
      layerCount: 7,
      tempoRatio: 2,
      masterGain: 0.72,
      anchorEnabled: false,
      direction: "accelerate",
    };
    let phase = 0;
    let elapsedSeconds = 0;
    const player = new RissetPlayer(parameters);

    const visualization = el("div", { className: "risset-visualization" });
    const metrics = el("div", { className: "metric-grid metric-grid-four" });
    const startButton = button("Start illusion", {
      className: "button button-primary",
      onClick: async () => {
        if (player.playing) {
          player.stop();
          startButton.textContent = "Start illusion";
          startButton.classList.remove("is-playing");
          phase = 0;
          elapsedSeconds = 0;
          renderVisualization();
          renderMetrics();
          return;
        }
        startButton.disabled = true;
        try {
          await player.start((frame) => {
            phase = frame.phase;
            elapsedSeconds = frame.elapsedSeconds;
            if (!frame.playing) {
              startButton.textContent = "Start illusion";
              startButton.classList.remove("is-playing");
            }
            renderVisualization();
            renderMetrics();
          });
          startButton.textContent = "Stop";
          startButton.classList.add("is-playing");
        } finally {
          startButton.disabled = false;
        }
      },
    });

    const controls = el("div", { className: "control-grid" });
    controls.append(
      rangeControl({
        label: "Reference tempo",
        value: parameters.baseBpm,
        min: 40,
        max: 240,
        step: 1,
        format: (value) => `${value} BPM`,
        description: "The tempo at the center of the audible window.",
        onInput: (baseBpm) => update({ baseBpm }),
      }).root,
      rangeControl({
        label: "Cycle duration",
        value: parameters.cycleSeconds,
        min: 8,
        max: 40,
        step: 0.5,
        format: (value) => `${value.toFixed(1)} s`,
        description: "Time required to move through one tempo octave.",
        onInput: (cycleSeconds) => update({ cycleSeconds }),
      }).root,
      rangeControl({
        label: "Tempo ratio",
        value: parameters.tempoRatio,
        min: 1.5,
        max: 3,
        step: 0.05,
        format: (value) => `${value.toFixed(2)}×`,
        description: "Adjacent layers are separated by this speed ratio.",
        onInput: (tempoRatio) => update({ tempoRatio }),
      }).root,
      rangeControl({
        label: "Layers",
        value: parameters.layerCount,
        min: 3,
        max: 11,
        step: 2,
        format: (value) => String(value),
        description: "More layers hide the handoff but increase density.",
        onInput: (layerCount) => update({ layerCount }),
      }).root,
      rangeControl({
        label: "Master level",
        value: parameters.masterGain,
        min: 0.15,
        max: 0.9,
        step: 0.01,
        format: (value) => `${Math.round(value * 100)}%`,
        onInput: (masterGain) => update({ masterGain }),
      }).root,
      segmentedControl({
        label: "Direction",
        value: parameters.direction,
        choices: [
          { value: "accelerate", label: "Accelerate" },
          { value: "decelerate", label: "Decelerate" },
        ],
        onChange: (direction) => update({ direction }),
      }),
      toggleControl({
        label: "Stable anchor pulse",
        checked: parameters.anchorEnabled,
        description: "Adds an objective reference that makes the illusion easier to inspect—and easier to break.",
        onChange: (anchorEnabled) => update({ anchorEnabled }),
      }),
    );

    const operatorChain = el(
      "div",
      { className: "operator-chain" },
      operatorNode("Source pulse", "pattern.trigger"),
      operatorArrow(),
      operatorNode("Exponential tempo scale", "rhythm.risset"),
      operatorArrow(),
      operatorNode("Raised-cosine crossfade", "signal.control"),
      operatorArrow(),
      operatorNode("Click synthesizer", "signal.audio"),
    );

    const invariant = rissetCycleError({
      baseBpm: parameters.baseBpm,
      layerCount: parameters.layerCount,
      tempoRatio: parameters.tempoRatio,
      envelopeShape: "raised-cosine",
    });

    container.append(
      labHeader({
        eyebrow: metadata.category,
        title: metadata.name,
        summary: metadata.summary,
        status: metadata.status,
        statusLabel: metadata.statusLabel,
      }),
      el(
        "div",
        { className: "lab-toolbar" },
        startButton,
        el("span", {
          className: "audio-notice",
          text: "Audio starts only after your click. This vertical slice still uses the legacy fixed-slot preview adapter; analytic Risset v1 is the tested production contract.",
        }),
      ),
      metrics,
      el(
        "div",
        { className: "two-column-layout" },
        panel("Tempo-space view", visualization, { className: "panel-visual" }),
        panel("Parameters", controls),
      ),
      panel("Operator pipeline", operatorChain, { kicker: "Typed graph preview" }),
      panel(
        "Why the staircase closes",
        [
          formulaBlock(
            "sₖ(t) = r^(k + t/T)",
            "Each layer moves linearly in log-tempo space, which means its physical speed changes exponentially.",
          ),
          formulaBlock(
            "sₖ(t + T) = sₖ₊₁(t)",
            "After one cycle, each layer occupies the previous layer’s tempo. Faded boundaries conceal the relabeling.",
          ),
          el("p", {
            className: "validation-line",
            text: invariant.withinTolerance
              ? `Foundation invariant passes: maximum relabeling error ${invariant.maximumTempoError.toExponential(2)}.`
              : `Invariant requires review: error ${invariant.maximumTempoError.toExponential(2)}.`,
          }),
        ],
        { kicker: "Mathematical inspector" },
      ),
    );

    renderVisualization();
    renderMetrics();

    return () => player.stop();

    function update(patch: Partial<RissetPlayerParameters>): void {
      parameters = { ...parameters, ...patch };
      player.update(parameters);
      renderVisualization();
      renderMetrics();
    }

    function renderMetrics(): void {
      const layers = rissetLayers({
        baseBpm: parameters.baseBpm,
        layerCount: parameters.layerCount,
        tempoRatio: parameters.tempoRatio,
        phase,
      });
      const dominant = [...layers].sort((left, right) => right.gain - left.gain)[0];
      clear(metrics);
      metrics.append(
        metric("Cycle phase", `${Math.round(phase * 100)}%`, `${elapsedSeconds.toFixed(1)} s elapsed`),
        metric("Dominant layer", dominant === undefined ? "—" : `${dominant.bpm.toFixed(1)} BPM`, "Highest crossfade gain"),
        metric("Tempo span", `${layers[0]?.bpm.toFixed(0) ?? "—"}–${layers.at(-1)?.bpm.toFixed(0) ?? "—"}`, "Instantaneous layer range"),
        metric("Equivalence", `×${parameters.tempoRatio.toFixed(2)}`, "One cycle per tempo ratio"),
      );
    }

    function renderVisualization(): void {
      clear(visualization);
      const width = 760;
      const rowHeight = 54;
      const top = 44;
      const side = 92;
      const height = top + parameters.layerCount * rowHeight + 38;
      const center = (parameters.layerCount - 1) / 2;
      const minLog = -center - 1;
      const maxLog = center + 1;
      const plotWidth = width - side - 24;
      const svg = svgEl("svg", {
        viewBox: `0 0 ${width} ${height}`,
        role: "img",
        "aria-label": "Logarithmic tempo layers moving through a crossfade window",
      });

      for (let grid = Math.ceil(minLog); grid <= Math.floor(maxLog); grid += 1) {
        const x = side + ((grid - minLog) / (maxLog - minLog)) * plotWidth;
        svg.append(
          svgEl("line", { x1: x, y1: top - 20, x2: x, y2: height - 24, class: "tempo-grid-line" }),
          textSvg(x, 20, `${parameters.tempoRatio ** grid >= 1 ? "×" : "×"}${(parameters.tempoRatio ** grid).toFixed(grid === 0 ? 0 : 2)}`, "tempo-axis-label", "middle"),
        );
      }

      const layers = rissetLayers({
        baseBpm: parameters.baseBpm,
        layerCount: parameters.layerCount,
        tempoRatio: parameters.tempoRatio,
        phase,
      });
      for (const layer of layers) {
        const y = top + layer.index * rowHeight;
        const x = side + ((layer.logTempo - minLog) / (maxLog - minLog)) * plotWidth;
        svg.append(
          textSvg(8, y + 5, `L${layer.index + 1}`, "tempo-layer-label", "start"),
          svgEl("line", { x1: side, y1: y, x2: width - 24, y2: y, class: "tempo-row-line" }),
          svgEl("circle", {
            cx: x,
            cy: y,
            r: 5 + 15 * layer.gain,
            class: "tempo-layer-orb",
            opacity: 0.2 + 0.8 * layer.gain,
          }),
          textSvg(Math.min(width - 72, x + 24), y + 5, `${layer.bpm.toFixed(1)}`, "tempo-bpm-label", "start"),
        );
      }
      svg.append(
        textSvg(side, height - 7, "slower", "tempo-direction-label", "start"),
        textSvg(width - 24, height - 7, "faster", "tempo-direction-label", "end"),
      );
      visualization.append(svg);
    }
  },
};

function textSvg(
  x: number,
  y: number,
  text: string,
  className: string,
  anchor: "start" | "middle" | "end",
): SVGTextElement {
  const element = svgEl("text", { x, y, class: className, "text-anchor": anchor });
  element.textContent = text;
  return element;
}

function operatorNode(name: string, type: string): HTMLElement {
  return el(
    "div",
    { className: "operator-node" },
    el("strong", { text: name }),
    el("code", { text: type }),
  );
}

function operatorArrow(): HTMLElement {
  return el("span", { className: "operator-arrow", text: "→" });
}
