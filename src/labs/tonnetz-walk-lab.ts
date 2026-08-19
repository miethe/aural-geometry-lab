import { NoteSequencePlayer, type PreviewNote } from "../audio/note-sequence-player.js";
import { tonnetzGrid, triadPitchClasses, voiceTriad, type TonnetzNode, type TriadQuality } from "../operators/tonnetz.js";
import { metric, segmentedControl, selectControl } from "../ui/controls.js";
import { button, clear, el, svgEl } from "../ui/dom.js";
import { labHeader, panel } from "../ui/lab-layout.js";
import type { LabModule } from "./types.js";

const PITCH_NAMES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"] as const;

const metadata = {
  id: "tonnetz-walk",
  name: "Tonnetz Walk",
  shortName: "Tonnetz",
  category: "Harmonic geometry",
  summary: "Move through a lattice where spatial adjacency corresponds to interval and chord relationships.",
  status: "preview" as const,
  statusLabel: "Computational preview",
  researchCharters: ["DR-04", "DR-08"],
  milestone: "M1 lab hardening",
};

export const tonnetzWalkLab: LabModule = {
  ...metadata,
  mount(container): () => void {
    let originPitchClass = 0;
    let quality: TriadQuality = "major";
    let selected: TonnetzNode = { q: 0, r: 0, pitchClass: 0, label: "C" };
    let walk: TonnetzNode[] = [selected];
    const graph = el("div", { className: "tonnetz-visualization" });
    const metrics = el("div", { className: "metric-grid metric-grid-four" });
    const walkStrip = el("div", { className: "walk-strip" });
    const player = new NoteSequencePlayer("tonnetz", sequenceParameters());

    const playButton = button("Play harmonic walk", {
      className: "button button-primary",
      onClick: async () => {
        player.update(sequenceParameters());
        await player.start();
      },
    });
    const clearButton = button("Clear path", {
      className: "button button-secondary",
      onClick: () => {
        walk = [selected];
        renderWalk();
        renderMetrics();
      },
    });

    const controls = el(
      "div",
      { className: "control-grid compact-control-grid" },
      selectControl({
        label: "Lattice origin",
        value: originPitchClass,
        choices: PITCH_NAMES.map((label, value) => ({ label, value })),
        onChange: (value) => {
          originPitchClass = value;
          const gridNodes = tonnetzGrid(3, originPitchClass);
          selected = gridNodes.find((node) => node.q === 0 && node.r === 0) ?? gridNodes[0] ?? selected;
          walk = [selected];
          renderGraph();
          renderWalk();
          renderMetrics();
        },
      }),
      segmentedControl({
        label: "Triad quality",
        value: quality,
        choices: [
          { value: "major", label: "Major" },
          { value: "minor", label: "Minor" },
        ],
        onChange: (value) => {
          quality = value;
          renderGraph();
          renderMetrics();
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
      el("div", { className: "lab-toolbar" }, playButton, clearButton, el("span", { className: "audio-notice", text: "Click nodes to build a path; repeated pitch classes occupy different geometric contexts." })),
      metrics,
      el(
        "div",
        { className: "two-column-layout" },
        panel("Harmonic lattice", graph, { className: "panel-visual" }),
        panel("Mapping controls", controls),
      ),
      panel("Selected path", walkStrip, { kicker: "Graph traversal → chord sequence" }),
      panel(
        "MVP interpretation",
        el(
          "div",
          { className: "explanation-grid" },
          explanation("Fifth axis", "Moving along q changes pitch class by a perfect fifth."),
          explanation("Third axis", "Moving along r changes pitch class by a major third."),
          explanation("Voice leading", "The preview voices each selected triad near middle C; the hardened lab will optimize register continuity across the entire path."),
        ),
        { kicker: "Research gate DR-04" },
      ),
    );

    renderGraph();
    renderWalk();
    renderMetrics();

    return () => player.stop();

    function selectNode(node: TonnetzNode): void {
      selected = node;
      walk = [...walk, node].slice(-10);
      player.update(sequenceParameters());
      renderGraph();
      renderWalk();
      renderMetrics();
    }

    function renderGraph(): void {
      clear(graph);
      const width = 680;
      const height = 560;
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = 58;
      const nodes = tonnetzGrid(3, originPitchClass);
      const positions = new Map<string, { x: number; y: number }>();
      for (const node of nodes) {
        positions.set(key(node), axialToPixel(node.q, node.r, centerX, centerY, scale));
      }
      const svg = svgEl("svg", {
        viewBox: `0 0 ${width} ${height}`,
        role: "img",
        "aria-label": "Interactive Tonnetz pitch lattice",
      });
      const nodeByKey = new Map(nodes.map((node) => [key(node), node]));
      for (const node of nodes) {
        const source = positions.get(key(node));
        if (source === undefined) {
          continue;
        }
        for (const [dq, dr] of [[1, 0], [0, 1], [1, -1]] as const) {
          const targetNode = nodeByKey.get(`${node.q + dq},${node.r + dr}`);
          const target = targetNode === undefined ? undefined : positions.get(key(targetNode));
          if (target !== undefined) {
            svg.append(svgEl("line", { x1: source.x, y1: source.y, x2: target.x, y2: target.y, class: "tonnetz-edge" }));
          }
        }
      }
      for (const node of nodes) {
        const position = positions.get(key(node));
        if (position === undefined) {
          continue;
        }
        const selectedHere = node.q === selected.q && node.r === selected.r;
        const visitedCount = walk.filter((walkNode) => walkNode.q === node.q && walkNode.r === node.r).length;
        const group = svgEl("g", { class: `tonnetz-node-group ${selectedHere ? "is-selected" : ""}` });
        const circle = svgEl("circle", {
          cx: position.x,
          cy: position.y,
          r: selectedHere ? 25 : 20,
          class: `tonnetz-node ${visitedCount > 0 ? "is-visited" : ""}`,
          tabindex: 0,
          role: "button",
          "aria-label": `Select ${node.label} at coordinate ${node.q}, ${node.r}`,
        });
        const text = svgEl("text", { x: position.x, y: position.y + 5, class: "tonnetz-label", "text-anchor": "middle" });
        text.textContent = node.label;
        const activate = (): void => selectNode(node);
        circle.addEventListener("click", activate);
        circle.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        });
        group.append(circle, text);
        if (visitedCount > 1) {
          const count = svgEl("text", { x: position.x + 18, y: position.y - 16, class: "tonnetz-count", "text-anchor": "middle" });
          count.textContent = String(visitedCount);
          group.append(count);
        }
        svg.append(group);
      }
      graph.append(svg);
    }

    function renderWalk(): void {
      clear(walkStrip);
      walk.forEach((node, index) => {
        walkStrip.append(
          el(
            "div",
            { className: "walk-step" },
            el("span", { className: "walk-index", text: String(index + 1) }),
            el("strong", { text: `${node.label} ${quality}` }),
            el("code", { text: `(${node.q}, ${node.r})` }),
          ),
        );
        if (index < walk.length - 1) {
          walkStrip.append(el("span", { className: "walk-arrow", text: "→" }));
        }
      });
    }

    function renderMetrics(): void {
      const pitches = triadPitchClasses(selected.pitchClass, quality).map((pitch) => PITCH_NAMES[pitch] ?? String(pitch));
      const previous = walk.at(-2);
      const motion = previous === undefined ? 0 : circularPitchDistance(previous.pitchClass, selected.pitchClass);
      clear(metrics);
      metrics.append(
        metric("Selected root", selected.label, `Coordinate (${selected.q}, ${selected.r})`),
        metric("Triad", pitches.join(" · "), quality),
        metric("Latest motion", `${motion} semitone${motion === 1 ? "" : "s"}`, "Pitch-class distance"),
        metric("Path length", String(walk.length), "Up to 10 visible steps"),
      );
    }

    function sequenceParameters() {
      const notes: PreviewNote[] = [];
      walk.forEach((node, step) => {
        const triad = voiceTriad(node.pitchClass, quality, 60);
        triad.forEach((midi, chordIndex) => {
          notes.push({
            beat: step * 1.5 + chordIndex * 0.08,
            durationBeats: 1.1,
            midi,
            velocity: 0.8 - chordIndex * 0.08,
            pan: (chordIndex - 1) * 0.18,
            waveform: chordIndex === 1 ? "sine" : "triangle",
          });
        });
      });
      return {
        bpm: 96,
        cycleBeats: Math.max(2, walk.length * 1.5),
        notes,
        loop: false,
        masterGain: 0.65,
      } as const;
    }
  },
};

function axialToPixel(q: number, r: number, centerX: number, centerY: number, size: number): { x: number; y: number } {
  return {
    x: centerX + size * Math.sqrt(3) * (q + r / 2),
    y: centerY + size * 1.5 * r,
  };
}

function key(node: Pick<TonnetzNode, "q" | "r">): string {
  return `${node.q},${node.r}`;
}

function circularPitchDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 12;
  return Math.min(distance, 12 - distance);
}

function explanation(title: string, text: string): HTMLElement {
  return el("article", { className: "explanation-card" }, el("h3", { text: title }), el("p", { text }));
}
