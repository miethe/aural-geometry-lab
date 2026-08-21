import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { figureSpecs } from "./figure-specs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "design", "mockups", "figures");

await mkdir(outputDirectory, { recursive: true });
for (const figure of figureSpecs) {
  const destination = path.join(outputDirectory, figure.filename);
  await writeFile(destination, figure.render(), "utf8");
  console.log(`Wrote ${path.relative(root, destination)}`);
}
