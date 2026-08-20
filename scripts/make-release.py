#!/usr/bin/env python3
"""Create a deterministic Aural Geometry Lab source/release ZIP."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import stat
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "aural-geometry-lab"
EXCLUDED_PARTS = {".git", ".build", ".swiftpm", "node_modules", "dist", "coverage", "__pycache__", ".pytest_cache", ".mypy_cache"}
EXCLUDED_NAMES = {".DS_Store"}
# Paths kept OUT of the release archive even though git tracks them.
# design/mockups/images/ is Git-LFS-tracked (see .gitattributes). This script reads bytes from the
# WORKING TREE (path.read_bytes()), so on a checkout with LFS smudged it would archive ~39 MB of
# real PNGs, and on a clone where LFS objects were never fetched it would archive the ~130-byte
# pointer files instead -- silently producing two different "deterministic" archives from the same
# commit. Excluding the directory removes the ambiguity rather than papering over it. The images
# remain in git; they are design evidence, not source.
EXCLUDED_PREFIXES = ("design/mockups/images",)


def include(path: Path, output: Path) -> bool:
    if path.resolve() == output.resolve():
        return False
    relative = path.relative_to(ROOT)
    if any(part in EXCLUDED_PARTS for part in relative.parts):
        return False
    if path.name in EXCLUDED_NAMES or path.suffix in {".pyc", ".pyo"}:
        return False
    if relative.as_posix().startswith(EXCLUDED_PREFIXES):
        return False
    return path.is_file() and not path.is_symlink()


def candidates(output: Path):
    """Files eligible for the archive.

    git is authoritative when this is a checkout: .gitignore already states exactly which paths
    are local state, and a bare filesystem walk ignores it. On a provisioned checkout that walk
    swept in the whole deployed .claude/ tree -- including .claude/rules/, which carries LAN
    addresses and credential paths and must never be published -- because gitignored is not the
    same as absent. Outside a checkout (an exported source tree) fall back to the walk.
    """
    result = subprocess.run(
        ["git", "-C", str(ROOT), "ls-files", "-z", "--cached", "--exclude-standard"],
        capture_output=True,
    )
    if result.returncode == 0:
        return [ROOT / name for name in result.stdout.decode("utf-8").split("\0") if name]
    return list(ROOT.rglob("*"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path, help="Output ZIP path")
    args = parser.parse_args()
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.unlink(missing_ok=True)

    files = sorted(
        (path for path in candidates(output) if include(path, output)),
        key=lambda path: path.relative_to(ROOT).as_posix(),
    )

    release_manifest = json.loads((ROOT / "program" / "fr01-release-manifest.json").read_text(encoding="utf-8"))
    expected_files = release_manifest.get("validation", {}).get("sourceFilesInArchive")
    if expected_files is not None and expected_files != len(files):
        raise SystemExit(f"Release manifest expects {expected_files} source files, found {len(files)}.")

    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9, strict_timestamps=True) as archive:
        for path in files:
            relative = path.relative_to(ROOT).as_posix()
            info = zipfile.ZipInfo(f"{PREFIX}/{relative}", date_time=(1980, 1, 1, 0, 0, 0))
            info.external_attr = (stat.S_IMODE(path.stat().st_mode) & 0xFFFF) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            archive.writestr(info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)

    print(f"Created {output} with {len(files)} files.")


if __name__ == "__main__":
    main()
