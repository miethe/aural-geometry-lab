import { EuclideanPlayer } from "../audio/euclidean-player.js";
import { analyzeCompositeCycle } from "./euclidean-analysis.js";
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
    let selectedRing = 0;
    let disposed = false;
    let timelineWindowStart = 0;
    let rings: readonly EuclideanRingState[] = [
      createRing("kick", "Low pulse", "sine body", 16, 5, 0, 1),
      createRing("hat", "High pulse", "noise click", 12, 7, 1, 0.8),
      createRing("bell", "Bell pulse", "triangle ping", 9, 4, 0, 0.72),
    ];
    const player = new EuclideanPlayer({ bpm, rings, masterGain });

    const visualization = el("div", { className: "euclidean-visualization spatial-canvas" });
    const audioStatus = el("p", { className: "audio-notice", attributes: { role: "status" }, text: "Audio stopped · browser synthesis" });
    const metrics = el("div", { className: "metric-grid metric-grid-four" });
    const ringControls = el("div", { className: "ring-controls" });
    const timelineRows = el("div", { className: "timeline-rows" });
    const timelineCursor = el("div", { className: "timeline-cursor", attributes: { "aria-hidden": "true" } });
    const timelineRuler = el("div", { className: "timeline-ruler" });
    const timeline = el("details", { className: "studio-timeline" },
      el("summary", { text: "Timeline · 4-bar window · live generated" }),
      el("p", { className: "audio-notice", text: "Derived · repeating ring onsets on a shared 1/16 grid in 4/4. Read-only preview; playhead timing is estimated." }),
      timelineRuler,
      el("div", { className: "timeline-body" }, timelineRows, timelineCursor));
    const startButton = button("Play rings", {
      className: "button button-primary",
      onClick: async () => {
        if (player.playing) {
          player.stop();
          startButton.textContent = "Play rings";
          audioStatus.textContent = "Audio stopped · browser synthesis";
          startButton.classList.remove("is-playing");
          activeTick = -1;
          renderVisualization();
          updateTimelineCursor();
          return;
        }
        startButton.disabled = true;
        try {
          await player.start((tick) => {
            if (disposed || (tick >= 0 && !player.playing)) return;
            activeTick = tick;
            renderVisualization();
            if (Math.floor(Math.max(0, tick) / 64) * 64 !== timelineWindowStart) renderTimeline();
            updateTimelineCursor();
          });
          if (disposed) { player.stop(); return; }
          startButton.textContent = "Stop";
          startButton.classList.add("is-playing");
          audioStatus.textContent = "Audio playing · browser synthesis";
        } catch {
          audioStatus.textContent = "Audio unavailable. Check browser audio permissions and try again.";
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

    container.classList.add("spatial-studio");
    const trackList = el("div", { className: "spatial-tracks", attributes: { "aria-label": "Select a ring" } });
    container.append(
      labHeader({ eyebrow: "COMPOSE / RHYTHM GEOMETRY", title: metadata.name,
        summary: "Select a ring. Drag to rotate. Hear the geometry.",
        status: metadata.status, statusLabel: "Live generated · demo player" }),
      el("div", { className: "lab-toolbar spatial-transport" }, startButton, audioStatus,
        el("a", { className: "button button-quiet", text: "← Library", attributes: { href: "#/library" } })),
      ringControls,
      el("div", { className: "spatial-workspace" },
        panel("Rhythm canvas", [trackList, visualization,
          el("p", { className: "spatial-legend", text: "● Onset   ○ Rest   ◉ Selected ring · drag to rotate; use Rotation controls with a keyboard" })], { className: "panel-visual spatial-field", kicker: "LIVE GENERATED · Euclidean kernel" }),
        el("aside", { className: "spatial-inspector", attributes: { "aria-label": "Rhythm inspector" } },
          panel("Parameters", globalControls, { kicker: "USER AUTHORED" }),
          panel("Math & timing", metrics, { kicker: "DERIVED · current parameters" }),
          panel("Provenance", el("p", { text: "Patterns: Euclidean kernel. Voices: demo synthesis. Timing readout: rounded estimate; browser scheduling is approximate." }), { kicker: "ENGINEERING DEFAULT" }))),
    );
    container.append(timeline);
    visualization.addEventListener("pointerdown", (event) => {
      const target = event.target as Element;
      const index = target.getAttribute("data-ring");
      if (index === null) return;
      selectedRing = Number(index);
      visualization.setPointerCapture(event.pointerId);
      rotateAt(event);
    });
    visualization.addEventListener("pointermove", (event) => {
      if (visualization.hasPointerCapture(event.pointerId)) rotateAt(event);
    });
    function rotateAt(event: PointerEvent): void {
      const svg = visualization.querySelector("svg");
      const ring = rings[selectedRing];
      if (!svg || !ring) return;
      const bounds = svg.getBoundingClientRect();
      const angle = Math.atan2(event.clientY - bounds.top - bounds.height / 2,
        event.clientX - bounds.left - bounds.width / 2) + Math.PI / 2;
      updateRing(selectedRing, { rotation: (Math.round(angle / (2 * Math.PI) * ring.steps) + ring.steps) % ring.steps });
    }

    renderRingControls();
    renderVisualization();
    renderMetrics();
    renderTimeline();

    return () => { disposed = true; player.stop(); container.classList.remove("spatial-studio"); };

    function updateRing(index: number, patch: Partial<Pick<EuclideanRingState, "steps" | "pulses" | "rotation" | "gain">>): void {
      rings = rings.map((ring, ringIndex) => {
        if (ringIndex !== index) {
          return ring;
        }
        const steps = patch.steps ?? ring.steps;
        const pulses = Math.min(patch.pulses ?? ring.pulses, steps);
        const rotation = (patch.rotation ?? ring.rotation) % steps;
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
      renderTimeline();
    }

    function renderRingControls(): void {
      clear(ringControls);
      clear(trackList);
      for (const [index, ring] of rings.entries()) {
        const select = button(ring.name, { className: `button ring-select ring-${ring.id}`, onClick: () => {
          selectedRing = index; renderRingControls(); renderVisualization();
        } });
        select.setAttribute("aria-pressed", String(index === selectedRing));
        trackList.append(select);
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
              el("code", { text: `Derived · E(${ring.pulses}, ${ring.steps})` }),
            ),
            el("div", { className: "ring-pattern-text", text: ring.pattern.map((active) => active ? "●" : "·").join(" ") }),
            el("div", { className: "ring-control-grid" }, stepsControl.root, pulsesControl.root, rotationControl.root, gainControl.root),
            el("p", { className: "ring-gap-line", text: `Derived · cyclic gaps: ${gaps.length === 0 ? "none" : gaps.join(" · ")}` }),
          ),
        );
      }
    }

    function renderTimeline(): void {
      timelineWindowStart = Math.floor(Math.max(0, activeTick) / 64) * 64;
      clear(timelineRuler);
      timelineRuler.append(...[1, 2, 3, 4].map((bar) => el("span", { text: `Bar ${timelineWindowStart / 16 + bar}` })));
      clear(timelineRows);
      for (const ring of rings) {
        const row = el("div", { className: `timeline-track ring-${ring.id}` },
          el("strong", { className: "timeline-track-name", text: ring.name }));
        const cells = el("div", { className: "timeline-cells", attributes: { "aria-label": `Derived · ${ring.name}, 64 sixteenth-note steps` } });
        for (let step = 0; step < 64; step++) {
          const active = ring.pattern[(timelineWindowStart + step) % ring.steps] === true;
          cells.append(el("span", { className: `timeline-cell ${active ? "is-on" : "is-off"}`,
            title: `Derived · bar ${Math.floor((timelineWindowStart + step) / 16) + 1}, step ${step % 16 + 1}: ${active ? "onset" : "rest"}`,
            attributes: { "aria-hidden": "true", "data-onset": String(active), "data-step": String(step) } }));
        }
        row.append(cells);
        timelineRows.append(row);
      }
      updateTimelineCursor();
    }

    function updateTimelineCursor(): void {
      timelineCursor.hidden = activeTick < 0;
      timelineCursor.style.left = `${Math.max(0, activeTick % 64) / 64 * 100}%`;
    }

    function renderMetrics(): void {
      const cycle = analyzeCompositeCycle(rings);
      const totalPulses = rings.reduce((sum, ring) => sum + ring.pulses, 0);
      const totalSteps = rings.reduce((sum, ring) => sum + ring.steps, 0);
      clear(metrics);
      metrics.append(
        metric("Tempo", `${bpm} BPM`, "Shared sixteenth-note clock"),
        metric("Derived · onsets", String(totalPulses), `Derived · ${totalSteps} total ring positions`),
        metric("Derived · composite cycle", `${cycle.cycleSteps} steps`, `Estimated · ${(cycle.cycleSteps * 60 / bpm / 4).toFixed(1)} seconds`),
        metric("Derived · shared onsets", String(cycle.sharedOnsetSteps), `Derived · ${cycle.pairwiseAlignments} pairwise alignments per cycle`),
        metric("Estimated · aggregate density", `${Math.round(totalPulses / totalSteps * 100)}%`, "Across all rings"),
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
        svg.append(svgEl("circle", { cx: center, cy: center, r: radius, class: `euclidean-ring-line ring-${ring.id} ${ringIndex === selectedRing ? "is-selected" : ""}`, "data-ring": ringIndex }));
        ring.pattern.forEach((active, step) => {
          const angle = -Math.PI / 2 + (step / ring.steps) * Math.PI * 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          const isCurrent = activeTick >= 0 && activeTick % ring.steps === step;
          const point = svgEl("circle", {
            cx: x,
            cy: y,
            r: active ? (isCurrent ? 13 : 9) : (isCurrent ? 7 : 4),
            "data-ring": ringIndex,
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
