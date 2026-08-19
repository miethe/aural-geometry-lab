import { EuclideanPlayer } from "../audio/euclidean-player.js";
import { cyclicGapLengths, euclideanRhythm } from "../operators/euclidean.js";
import { metric, rangeControl } from "../ui/controls.js";
import { button, clear, el, svgEl } from "../ui/dom.js";
import { labHeader, panel } from "../ui/lab-layout.js";
import type { LabModule } from "./types.js";

export interface EuclideanRingState {
  readonly id: string;
  readonly name: string;
  readonly voice: string;
  readonly steps: number;
  readonly pulses: number;
  readonly rotation: number;
  readonly gain: number;
  readonly pattern: readonly boolean[];
}

const metadata = {
  id: "euclidean-rings",
  name: "Euclidean Rings",
  shortName: "Euclidean",
  category: "Rhythm geometry",
  summary: "Distribute onsets evenly around cyclic grids, rotate the rings, and hear their shared phase structure.",
  status: "working" as const,
  statusLabel: "Runnable vertical slice",
  researchCharters: ["DR-02", "DR-08"],
  milestone: "M0 foundation",
};

export const euclideanRingsLab: LabModule = {
  ...metadata,
  mount(container): () => void {
    let bpm = 108;
    let masterGain = 0.68;
    let activeTick = -1;
    let rings: readonly EuclideanRingState[] = [
      createRing("kick", "Low pulse", "sine body", 16, 5, 0, 1),
      createRing("hat", "High pulse", "noise click", 12, 7, 1, 0.8),
      createRing("bell", "Bell pulse", "triangle ping", 9, 4, 0, 0.72),
    ];
    const player = new EuclideanPlayer({ bpm, rings, masterGain });

    const visualization = el("div", { className: "euclidean-visualization" });
    const metrics = el("div", { className: "metric-grid metric-grid-four" });
    const ringControls = el("div", { className: "ring-controls" });
    const startButton = button("Play rings", {
      className: "button button-primary",
      onClick: async () => {
        if (player.playing) {
          player.stop();
          startButton.textContent = "Play rings";
          startButton.classList.remove("is-playing");
          activeTick = -1;
          renderVisualization();
          return;
        }
        startButton.disabled = true;
        try {
          await player.start((tick) => {
            activeTick = tick;
            renderVisualization();
          });
          startButton.textContent = "Stop";
          startButton.classList.add("is-playing");
        } finally {
          startButton.disabled = false;
        }
      },
    });

    const globalControls = el(
      "div",
      { className: "control-grid compact-control-grid" },
      rangeControl({
        label: "Tempo",
        value: bpm,
        min: 48,
        max: 180,
        step: 1,
        format: (value) => `${value} BPM`,
        onInput: (value) => {
          bpm = value;
          updatePlayer();
          renderMetrics();
        },
      }).root,
      rangeControl({
        label: "Master level",
        value: masterGain,
        min: 0.15,
        max: 0.9,
        step: 0.01,
        format: (value) => `${Math.round(value * 100)}%`,
        onInput: (value) => {
          masterGain = value;
          updatePlayer();
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
      el(
        "div",
        { className: "lab-toolbar" },
        startButton,
        el("span", { className: "audio-notice", text: "Every ring advances on the same sixteenth-note clock." }),
      ),
      metrics,
      el(
        "div",
        { className: "two-column-layout euclidean-layout" },
        panel("Concentric sequencer", visualization, { className: "panel-visual" }),
        panel("Global controls", globalControls),
      ),
      panel("Ring definitions", ringControls, { kicker: "k onsets across n steps" }),
      panel(
        "How to read it",
        el(
          "div",
          { className: "explanation-grid" },
          explanation("Evenness", "The Bjorklund construction keeps cyclic gaps between onsets as balanced as the integer grid allows."),
          explanation("Rotation", "Rotation preserves the rhythm’s interval structure while changing its phase against the other rings."),
          explanation("Composite cycle", "Rings with different lengths realign after the least common multiple of their step counts."),
        ),
        { kicker: "Inspector" },
      ),
    );

    renderRingControls();
    renderVisualization();
    renderMetrics();

    return () => player.stop();

    function updateRing(index: number, patch: Partial<Pick<EuclideanRingState, "steps" | "pulses" | "rotation" | "gain">>): void {
      rings = rings.map((ring, ringIndex) => {
        if (ringIndex !== index) {
          return ring;
        }
        const steps = patch.steps ?? ring.steps;
        const pulses = Math.min(patch.pulses ?? ring.pulses, steps);
        const rotation = patch.rotation ?? ring.rotation;
        const gain = patch.gain ?? ring.gain;
        return createRing(ring.id, ring.name, ring.voice, steps, pulses, rotation, gain);
      });
      updatePlayer();
      renderRingControls();
      renderVisualization();
      renderMetrics();
    }

    function updatePlayer(): void {
      player.update({ bpm, rings, masterGain });
    }

    function renderRingControls(): void {
      clear(ringControls);
      for (const [index, ring] of rings.entries()) {
        const stepsControl = rangeControl({
          label: "Steps",
          value: ring.steps,
          min: 3,
          max: 24,
          step: 1,
          format: String,
          onInput: (steps) => updateRing(index, { steps }),
        });
        const pulsesControl = rangeControl({
          label: "Pulses",
          value: ring.pulses,
          min: 0,
          max: ring.steps,
          step: 1,
          format: String,
          onInput: (pulses) => updateRing(index, { pulses }),
        });
        const rotationControl = rangeControl({
          label: "Rotation",
          value: ring.rotation,
          min: 0,
          max: Math.max(0, ring.steps - 1),
          step: 1,
          format: String,
          onInput: (rotation) => updateRing(index, { rotation }),
        });
        const gainControl = rangeControl({
          label: "Voice level",
          value: ring.gain,
          min: 0.1,
          max: 1,
          step: 0.05,
          format: (value) => `${Math.round(value * 100)}%`,
          onInput: (gain) => updateRing(index, { gain }),
        });
        const gaps = cyclicGapLengths(ring.pattern);
        ringControls.append(
          el(
            "article",
            { className: `ring-card ring-${ring.id}` },
            el(
              "header",
              { className: "ring-card-header" },
              el("div", {}, el("h3", { text: ring.name }), el("span", { text: ring.voice })),
              el("code", { text: `E(${ring.pulses}, ${ring.steps})` }),
            ),
            el("div", { className: "ring-pattern-text", text: ring.pattern.map((active) => active ? "●" : "·").join(" ") }),
            el("div", { className: "ring-control-grid" }, stepsControl.root, pulsesControl.root, rotationControl.root, gainControl.root),
            el("p", { className: "ring-gap-line", text: `Cyclic gaps: ${gaps.length === 0 ? "none" : gaps.join(" · ")}` }),
          ),
        );
      }
    }

    function renderMetrics(): void {
      const lcmSteps = rings.reduce((value, ring) => leastCommonMultiple(value, ring.steps), 1);
      const totalPulses = rings.reduce((sum, ring) => sum + ring.pulses, 0);
      const totalSteps = rings.reduce((sum, ring) => sum + ring.steps, 0);
      clear(metrics);
      metrics.append(
        metric("Tempo", `${bpm} BPM`, "Shared sixteenth-note clock"),
        metric("Onsets", String(totalPulses), `${totalSteps} total ring positions`),
        metric("Composite cycle", `${lcmSteps} steps`, `${(lcmSteps * 60 / bpm / 4).toFixed(1)} seconds`),
        metric("Aggregate density", `${Math.round(totalPulses / totalSteps * 100)}%`, "Across all rings"),
      );
    }

    function renderVisualization(): void {
      clear(visualization);
      const size = 620;
      const center = size / 2;
      const radii = [220, 162, 104];
      const svg = svgEl("svg", {
        viewBox: `0 0 ${size} ${size}`,
        role: "img",
        "aria-label": "Three concentric Euclidean rhythm rings",
      });
      svg.append(svgEl("circle", { cx: center, cy: center, r: 54, class: "euclidean-core" }));
      const coreLabel = svgEl("text", { x: center, y: center - 2, class: "euclidean-core-label", "text-anchor": "middle" });
      coreLabel.textContent = player.playing ? `STEP ${activeTick + 1}` : "READY";
      const subLabel = svgEl("text", { x: center, y: center + 20, class: "euclidean-core-sub", "text-anchor": "middle" });
      subLabel.textContent = `${bpm} BPM`;
      svg.append(coreLabel, subLabel);

      rings.forEach((ring, ringIndex) => {
        const radius = radii[ringIndex] ?? Math.max(70, 220 - ringIndex * 58);
        svg.append(svgEl("circle", { cx: center, cy: center, r: radius, class: `euclidean-ring-line ring-${ring.id}` }));
        ring.pattern.forEach((active, step) => {
          const angle = -Math.PI / 2 + (step / ring.steps) * Math.PI * 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          const isCurrent = activeTick >= 0 && activeTick % ring.steps === step;
          const point = svgEl("circle", {
            cx: x,
            cy: y,
            r: active ? (isCurrent ? 13 : 9) : (isCurrent ? 7 : 4),
            class: `euclidean-step ${active ? "is-on" : "is-off"} ${isCurrent ? "is-current" : ""} ring-${ring.id}`,
          });
          svg.append(point);
        });
      });
      visualization.append(svg);
    }
  },
};

function createRing(
  id: string,
  name: string,
  voice: string,
  steps: number,
  pulses: number,
  rotation: number,
  gain: number,
): EuclideanRingState {
  return {
    id,
    name,
    voice,
    steps,
    pulses,
    rotation,
    gain,
    pattern: euclideanRhythm({ steps, pulses, rotation }),
  };
}

function explanation(title: string, text: string): HTMLElement {
  return el("article", { className: "explanation-card" }, el("h3", { text: title }), el("p", { text }));
}

function greatestCommonDivisor(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function leastCommonMultiple(left: number, right: number): number {
  return Math.abs(left * right) / greatestCommonDivisor(left, right);
}
