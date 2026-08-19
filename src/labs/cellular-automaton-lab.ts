import { NoteSequencePlayer, type PreviewNote } from "../audio/note-sequence-player.js";
import { SeededRandom } from "../core/random.js";
import { automatonDensity, generateElementaryAutomaton, type AutomatonGrid } from "../operators/cellular.js";
import { metric, rangeControl, selectControl } from "../ui/controls.js";
import { button, clear, el, svgEl } from "../ui/dom.js";
import { labHeader, panel } from "../ui/lab-layout.js";
import type { LabModule } from "./types.js";

type SeedMode = "single" | "double" | "random";

const metadata = {
  id: "cellular-automaton",
  name: "Cellular Automaton Orchestra",
  shortName: "Automaton",
  category: "Emergent systems",
  summary: "Turn local binary rules into evolving musical texture while preserving a visible cell-to-event mapping.",
  status: "preview" as const,
  statusLabel: "Computational preview",
  researchCharters: ["DR-06", "DR-08"],
  milestone: "M1 lab hardening",
};

export const cellularAutomatonLab: LabModule = {
  ...metadata,
  mount(container): () => void {
    let rule = 30;
    let width = 32;
    let generations = 24;
    let seedMode: SeedMode = "single";
    let grid = generate();
    const visualization = el("div", { className: "automaton-visualization" });
    const metrics = el("div", { className: "metric-grid metric-grid-four" });
    const mappingPreview = el("div", { className: "mapping-table" });
    const player = new NoteSequencePlayer("automaton", sequenceParameters());

    const playButton = button("Play evolution", {
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
        label: "Rule",
        value: rule,
        min: 0,
        max: 255,
        step: 1,
        format: (value) => `Rule ${value}`,
        description: "Eight neighborhood outcomes encoded as one byte.",
        onInput: (value) => {
          rule = value;
          regenerate();
        },
      }).root,
      rangeControl({
        label: "Width",
        value: width,
        min: 16,
        max: 64,
        step: 2,
        format: (value) => `${value} cells`,
        onInput: (value) => {
          width = value;
          regenerate();
        },
      }).root,
      rangeControl({
        label: "Generations",
        value: generations,
        min: 8,
        max: 48,
        step: 1,
        format: String,
        onInput: (value) => {
          generations = value;
          regenerate();
        },
      }).root,
      selectControl({
        label: "Initial state",
        value: seedMode,
        choices: [
          { value: "single", label: "Single center cell" },
          { value: "double", label: "Two-cell seed" },
          { value: "random", label: "Deterministic random seed" },
        ],
        onChange: (value) => {
          seedMode = value;
          regenerate();
        },
      }),
    );

    container.append(
      labHeader({
        eyebrow: metadata.category,
        title: metadata.name,
        summary: metadata.summary,
        status: metadata.status,
        statusLabel: metadata.statusLabel,
      }),
      el("div", { className: "lab-toolbar" }, playButton, el("span", { className: "audio-notice", text: "Each generation occupies one sixteenth-note step; at most eight live cells are voiced per row." })),
      metrics,
      el(
        "div",
        { className: "two-column-layout" },
        panel("Space–time grid", visualization, { className: "panel-visual" }),
        panel("Automaton controls", controls),
      ),
      panel("Explicit mapping", mappingPreview, { kicker: "State → musical event" }),
      panel(
        "Why this needs research",
        el(
          "div",
          { className: "explanation-grid" },
          explanation("Selection bias", "Voicing every live cell makes dense rules merely louder. The MVP needs mappings that preserve structure without reducing it to density."),
          explanation("Temporal scale", "Generation rate, note duration, and rule dynamics interact; a useful default must expose patterns without smearing them."),
          explanation("Comparability", "Research should define listening tasks that distinguish rule identity, complexity, and reproducibility rather than relying only on aesthetic preference."),
        ),
        { kicker: "Research gate DR-06" },
      ),
    );

    renderAll();
    return () => player.stop();

    function generate(): AutomatonGrid {
      return generateElementaryAutomaton({
        width,
        generations,
        rule,
        initial: makeInitial(width, seedMode, `rule-${rule}-width-${width}`),
      });
    }

    function regenerate(): void {
      grid = generate();
      player.update(sequenceParameters());
      renderAll();
    }

    function renderAll(): void {
      renderGrid();
      renderMetrics();
      renderMapping();
    }

    function renderMetrics(): void {
      const liveCells = grid.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
      const densities = grid.map(automatonDensity);
      const meanDensity = densities.reduce((sum, value) => sum + value, 0) / densities.length;
      const entropy = binaryEntropy(meanDensity);
      const notes = sequenceParameters().notes.length;
      clear(metrics);
      metrics.append(
        metric("Rule", String(rule), `Binary ${rule.toString(2).padStart(8, "0")}`),
        metric("Live cells", liveCells.toLocaleString(), `${Math.round(meanDensity * 100)}% mean density`),
        metric("Binary entropy", entropy.toFixed(3), "Density-level estimate"),
        metric("Voiced events", notes.toLocaleString(), "Capped at eight per generation"),
      );
    }

    function renderGrid(): void {
      clear(visualization);
      const cellSize = Math.max(7, Math.min(18, 700 / width));
      const widthPixels = width * cellSize;
      const heightPixels = generations * cellSize;
      const svg = svgEl("svg", {
        viewBox: `0 0 ${widthPixels} ${heightPixels}`,
        role: "img",
        "aria-label": `Elementary cellular automaton rule ${rule}`,
      });
      grid.forEach((row, generation) => {
        row.forEach((active, column) => {
          svg.append(svgEl("rect", {
            x: column * cellSize,
            y: generation * cellSize,
            width: cellSize - 0.7,
            height: cellSize - 0.7,
            class: active ? "automaton-cell is-live" : "automaton-cell is-dead",
          }));
        });
      });
      visualization.append(svg);
    }

    function renderMapping(): void {
      clear(mappingPreview);
      const rows: readonly (readonly [string, string, string])[] = [
        ["generation index", "event beat", "g × ¼ beat"],
        ["cell column", "pitch and stereo position", "pentatonic register + left/right pan"],
        ["cell state", "event gate", "dead = silent; live = candidate note"],
        ["row density", "velocity contour", "denser row slightly increases emphasis"],
        ["event budget", "voice selection", "evenly sample at most eight live cells"],
      ];
      for (const [source, target, ruleText] of rows) {
        mappingPreview.append(
          el(
            "div",
            { className: "mapping-row" },
            el("code", { text: source }),
            el("span", { className: "mapping-arrow", text: "→" }),
            el("strong", { text: target }),
            el("span", { text: ruleText }),
          ),
        );
      }
    }

    function sequenceParameters() {
      const notes: PreviewNote[] = [];
      const scale = [0, 2, 4, 7, 9];
      grid.forEach((row, generation) => {
        const liveColumns = row.map((active, index) => active ? index : -1).filter((index) => index >= 0);
        const selectedColumns = evenlySample(liveColumns, 8);
        const density = automatonDensity(row);
        selectedColumns.forEach((column, voiceIndex) => {
          const normalized = column / Math.max(1, width - 1);
          const scalePosition = Math.round(normalized * 19);
          const degree = scale[scalePosition % scale.length] ?? 0;
          const octave = Math.floor(scalePosition / scale.length);
          notes.push({
            beat: generation * 0.25,
            durationBeats: 0.14,
            midi: 43 + octave * 12 + degree,
            velocity: 0.35 + density * 0.4,
            pan: normalized * 1.6 - 0.8,
            waveform: voiceIndex % 2 === 0 ? "triangle" : "sine",
          });
        });
      });
      return {
        bpm: 112,
        cycleBeats: Math.max(2, generations * 0.25),
        notes,
        loop: false,
        masterGain: 0.52,
      } as const;
    }
  },
};

function makeInitial(width: number, mode: SeedMode, seed: string): readonly boolean[] {
  const row = Array<boolean>(width).fill(false);
  const center = Math.floor(width / 2);
  if (mode === "single") {
    row[center] = true;
    return row;
  }
  if (mode === "double") {
    row[center] = true;
    row[(center + 1) % width] = true;
    return row;
  }
  const random = new SeededRandom(seed);
  return row.map(() => random.next() > 0.72);
}

function evenlySample(values: readonly number[], maximum: number): readonly number[] {
  if (values.length <= maximum) {
    return values;
  }
  return Array.from({ length: maximum }, (_, index) => values[Math.floor(index * values.length / maximum)]).filter((value): value is number => value !== undefined);
}

function binaryEntropy(probability: number): number {
  if (probability <= 0 || probability >= 1) {
    return 0;
  }
  return -probability * Math.log2(probability) - (1 - probability) * Math.log2(1 - probability);
}

function explanation(title: string, text: string): HTMLElement {
  return el("article", { className: "explanation-card" }, el("h3", { text: title }), el("p", { text }));
}
