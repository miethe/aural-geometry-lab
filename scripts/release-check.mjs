import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { assertNodeVersion, root } from "./lib/toolchain.mjs";

await assertNodeVersion();

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: ["ignore", "pipe", "inherit"] });
  if (result.status !== 0) {
    console.error(`${command} ${args.join(" ")} failed with ${result.status}.`);
    process.exit(result.status ?? 1);
  }
  return String(result.stdout);
}

async function digest(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

const work = await mkdtemp(path.join(tmpdir(), "agl-release-"));
try {
  // Determinism is the claim: two archives of the same tree must be byte-identical.
  const first = path.join(work, "first.zip");
  const second = path.join(work, "second.zip");
  run("python3", ["scripts/make-release.py", first]);
  run("python3", ["scripts/make-release.py", second]);

  const firstDigest = await digest(first);
  const secondDigest = await digest(second);
  if (firstDigest !== secondDigest) {
    console.error(`Release archive is not reproducible: ${firstDigest} != ${secondDigest}`);
    process.exit(1);
  }

  const extracted = path.join(work, "extracted");
  run("python3", ["-c", "import sys,zipfile;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])", first, extracted]);

  const manifest = JSON.parse(await readFile(path.join(root, "program", "fr01-release-manifest.json"), "utf8"));
  const expected = manifest?.validation?.sourceFilesInArchive;
  const listed = run("python3", ["-c", "import sys,zipfile;print(len([n for n in zipfile.ZipFile(sys.argv[1]).namelist() if not n.endswith('/')]))", first]).trim();
  if (expected !== undefined && Number(listed) !== expected) {
    console.error(`Extracted archive holds ${listed} files; release manifest expects ${expected}.`);
    process.exit(1);
  }

  console.log(`Release archive: reproducible (sha256 ${firstDigest.slice(0, 16)}…), ${listed} files, re-extract clean.`);
} finally {
  await rm(work, { recursive: true, force: true });
}
