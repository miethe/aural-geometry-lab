#!/usr/bin/env python3
"""Create a deterministic Aural Geometry Lab source/release ZIP."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import stat
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "aural-geometry-lab"
EXCLUDED_PARTS = {".git", ".build", ".swiftpm", "node_modules", "dist", "coverage", "__pycache__", ".pytest_cache", ".mypy_cache"}
EXCLUDED_NAMES = {".DS_Store"}


def include(path: Path, output: Path) -> bool:
    if path.resolve() == output.resolve():
        return False
    relative = path.relative_to(ROOT)
    if any(part in EXCLUDED_PARTS for part in relative.parts):
        return False
    if path.name in EXCLUDED_NAMES or path.suffix in {".pyc", ".pyo"}:
        return False
    return path.is_file() and not path.is_symlink()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path, help="Output ZIP path")
    args = parser.parse_args()
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.unlink(missing_ok=True)

    files = sorted(
        (path for path in ROOT.rglob("*") if include(path, output)),
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
