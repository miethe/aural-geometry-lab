import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!existsSync(path.join(root, "dist", "src", "core", "index.js"))) {
  const build = spawnSync(process.execPath, [path.join(root, "scripts", "build.mjs")], {
    cwd: root,
    stdio: "inherit",
  });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}
const testFiles = readdirSync(path.join(root, "tests"))
  .filter((name) => name.endsWith(".test.mjs"))
  .map((name) => path.join(root, "tests", name));
const result = spawnSync(process.execPath, ["--test", "--test-concurrency=1", ...testFiles], {
  cwd: root,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
