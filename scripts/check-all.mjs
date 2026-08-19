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
// CLAUDE.md and AGENTS.md have described these two as part of check:all since 0.4.0; neither was
// wired, and the release archive turned out to be broken at every commit as a result.
run("node", ["scripts/release-check.mjs"]);
run("node", ["scripts/smoke-http.mjs"]);
