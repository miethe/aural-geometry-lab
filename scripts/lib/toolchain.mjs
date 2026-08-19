import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export async function readToolchain() {
  return JSON.parse(await readFile(path.join(root, "program", "toolchain-lock.json"), "utf8"));
}

function parse(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isBelow(actual, minimum) {
  for (let index = 0; index < 3; index += 1) {
    if (actual[index] !== minimum[index]) return actual[index] < minimum[index];
  }
  return false;
}

// The lock has declared node.minimum since 0.4.0; nothing enforced it, so every recorded
// "tests pass" could have come from a runtime below the floor. Fail closed instead.
export async function assertNodeVersion(toolchain) {
  const lock = toolchain ?? (await readToolchain());
  const minimum = parse(lock.node?.minimum ?? "");
  const actual = parse(process.version);
  if (!minimum) {
    console.error("program/toolchain-lock.json declares no node.minimum.");
    process.exit(1);
  }
  if (!actual) {
    console.error(`Unrecognized Node version: ${process.version}`);
    process.exit(1);
  }
  if (isBelow(actual, minimum)) {
    console.error(
      `Node ${lock.node.minimum} or newer is required; running ${process.version}. ` +
        `The pinned runtime is ${lock.node.tested} (.nvmrc).`,
    );
    process.exit(1);
  }
}
