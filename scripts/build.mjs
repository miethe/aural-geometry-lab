import { cp, mkdir, rm, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const toolchain = JSON.parse(await readFile(path.join(root, "program", "toolchain-lock.json"), "utf8"));
const dist = path.join(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const localTsc = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "tsc.cmd" : "tsc");
const compiler = existsSync(localTsc) ? localTsc : "tsc";
const versionProbe = spawnSync(compiler, ["--version"], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (versionProbe.status !== 0) {
  console.error("Unable to execute the TypeScript compiler. Run npm install or provide the locked global compiler.");
  process.exit(versionProbe.status ?? 1);
}
const actualVersion = String(versionProbe.stdout).trim().replace(/^Version\s+/, "");
if (actualVersion !== toolchain.typescript.required) {
  console.error(`TypeScript ${toolchain.typescript.required} is required; discovered ${actualVersion}.`);
  process.exit(1);
}
if (!existsSync(localTsc)) {
  console.warn(`Using exact-version global TypeScript ${actualVersion}; npm install will provide the preferred local compiler.`);
}

const result = spawnSync(compiler, ["-p", path.join(root, "tsconfig.json")], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (result.status !== 0) process.exit(result.status ?? 1);

for (const directory of ["public", "docs", "research", "examples", "program", "design", "conformance", "schemas"]) {
  const source = path.join(root, directory);
  if (existsSync(source)) {
    const target = directory === "public" ? dist : path.join(dist, directory);
    await cp(source, target, { recursive: true });
  }
}
for (const file of ["README.md", "IMPLEMENTATION_REPORT.md"]) {
  const source = path.join(root, file);
  if (existsSync(source)) await cp(source, path.join(dist, file));
}
console.log(`Built Aural Geometry Lab ${toolchain.release} with TypeScript ${actualVersion} at ${dist}`);
