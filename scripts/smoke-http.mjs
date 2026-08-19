import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { existsSync } from "node:fs";
import { assertNodeVersion, root } from "./lib/toolchain.mjs";

await assertNodeVersion();

if (!existsSync(path.join(root, "dist", "index.html"))) {
  console.error("dist/index.html is missing. Run npm run build first.");
  process.exit(1);
}

const port = Number(process.env["SMOKE_PORT"] ?? 4271);
const base = `http://127.0.0.1:${port}`;

// One case per served content class, plus the two behaviours the server promises but no test
// covered: the SPA fallback, and refusing to escape dist/.
const cases = [
  { path: "/", type: "text/html", contains: "<html" },
  { path: "/styles.css", type: "text/css" },
  { path: "/src/app.js", type: "text/javascript" },
  { path: "/schemas/agl-project-v3.schema.json", type: "application/json", json: true },
  { path: "/examples/fr01-minimal.v3.project.json", type: "application/json", json: true },
  { path: "/program/toolchain-lock.json", type: "application/json", json: true },
  { path: "/README.md", type: "text/markdown" },
  { path: "/no/such/route", type: "text/html", contains: "<html", note: "SPA fallback" },
  { path: "/../package.json", type: "text/html", contains: "<html", note: "traversal refused" },
];

const server = spawn(process.execPath, [path.join(root, "scripts", "serve.mjs")], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "inherit"],
});

let failures = 0;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("serve.mjs did not start within 10s")), 10_000);
    server.stdout.on("data", (chunk) => {
      if (String(chunk).includes("http://")) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.on("exit", (code) => reject(new Error(`serve.mjs exited early with ${code}`)));
  });

  for (const testCase of cases) {
    const label = `${testCase.path}${testCase.note ? ` (${testCase.note})` : ""}`;
    let response;
    try {
      response = await fetch(`${base}${testCase.path}`);
    } catch (error) {
      console.error(`FAIL ${label}: ${error.message}`);
      failures += 1;
      continue;
    }
    const body = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    if (response.status !== 200) {
      console.error(`FAIL ${label}: status ${response.status}`);
      failures += 1;
      continue;
    }
    if (!contentType.startsWith(testCase.type)) {
      console.error(`FAIL ${label}: content-type ${contentType}, expected ${testCase.type}`);
      failures += 1;
      continue;
    }
    if (testCase.contains && !body.includes(testCase.contains)) {
      console.error(`FAIL ${label}: body missing ${testCase.contains}`);
      failures += 1;
      continue;
    }
    if (testCase.json) {
      try {
        JSON.parse(body);
      } catch (error) {
        console.error(`FAIL ${label}: body is not valid JSON (${error.message})`);
        failures += 1;
        continue;
      }
    }
    console.log(`ok   ${label}`);
  }
} finally {
  server.kill("SIGTERM");
}

if (failures > 0) {
  console.error(`HTTP smoke: ${failures} of ${cases.length} endpoints failed.`);
  process.exit(1);
}
console.log(`HTTP smoke: ${cases.length}/${cases.length} endpoints served correctly.`);
