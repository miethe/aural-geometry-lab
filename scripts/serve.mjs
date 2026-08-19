import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
if (!existsSync(path.join(dist, "index.html"))) {
  console.error("dist/index.html is missing. Run npm run build first.");
  process.exit(1);
}
const port = Number(process.env["PORT"] ?? 4173);
const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".map", "application/json; charset=utf-8"],
]);

function isInside(base, target) {
  const relative = path.relative(base, target);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/");
  const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const resolved = path.resolve(dist, relative);
  let target = resolved;
  if (!isInside(dist, resolved) || !existsSync(resolved) || statSync(resolved).isDirectory()) {
    target = path.join(dist, "index.html");
  }
  response.setHeader("Content-Type", mime.get(path.extname(target)) ?? "application/octet-stream");
  response.setHeader("Cache-Control", "no-store");
  if (request.method === "HEAD") {
    response.statusCode = 200;
    response.end();
    return;
  }
  createReadStream(target).on("error", (error) => {
    response.statusCode = 500;
    response.end(error.message);
  }).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Aural Geometry Lab: http://localhost:${port}`);
});
