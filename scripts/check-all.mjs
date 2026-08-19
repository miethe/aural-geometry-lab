import { spawnSync } from "node:child_process";
import process from "node:process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
run(npm, ["run", "check"]);
run("python3", ["scripts/validate-json-schemas.py"]);
// SwiftPM caches embed absolute paths; clean before every release-grade conformance run.
run("swift", ["package", "--package-path", "native/AuralGeometryCore", "clean"]);
run("swift", ["test", "--package-path", "native/AuralGeometryCore"]);
