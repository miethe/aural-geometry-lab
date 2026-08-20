import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { euclideanRingsSvg } from "../dist/src/design/figures.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "design", "mockups", "figures");

const figures = [
  {
    filename: "S04-euclidean-rings.svg",
    render: () => euclideanRingsSvg({
      layers: [
        { label: "Clave", steps: 12, pulses: 5 },
        { label: "Pulse field", steps: 12, pulses: 7, rotation: 1 },
      ],
    }),
  },
  {
    filename: "S07-euclidean-pulse-field.svg",
    render: () => euclideanRingsSvg({
      layers: [{ label: "7/12 Euclidean pulse field", steps: 12, pulses: 7 }],
    }),
  },
];

await mkdir(outputDirectory, { recursive: true });
for (const figure of figures) {
  const destination = path.join(outputDirectory, figure.filename);
  await writeFile(destination, figure.render(), "utf8");
  console.log(`Wrote ${path.relative(root, destination)}`);
}
