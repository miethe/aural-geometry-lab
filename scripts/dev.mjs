import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const build = spawn(process.execPath, [path.join(root, "scripts", "build.mjs")], {
  cwd: root,
  stdio: "inherit",
});

build.on("exit", (code) => {
  if (code !== 0) {
    process.exit(code ?? 1);
  }

  const server = spawn(process.execPath, [path.join(root, "scripts", "serve.mjs")], {
    cwd: root,
    stdio: "inherit",
  });
  const localTsc = path.join(
    root,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "tsc.cmd" : "tsc",
  );
  const compiler = existsSync(localTsc) ? localTsc : "tsc";
  const watcher = spawn(
    compiler,
    ["-p", path.join(root, "tsconfig.json"), "--watch", "--preserveWatchOutput"],
    {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  const stop = () => {
    server.kill();
    watcher.kill();
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
});
