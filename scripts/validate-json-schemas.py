#!/usr/bin/env python3
"""Validate all public AGL JSON Schema fixtures and project examples."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parent.parent
FORMAT_CHECKER = FormatChecker()

CASES: list[tuple[str, str]] = [
    ("schemas/agl-project-v2.schema.json", "examples/*.v2.project.json"),
    ("schemas/agl-project-v3.schema.json", "examples/*.v3.project.json"),
    ("schemas/agl-command-v2.schema.json", "conformance/fr01/command-v2.valid.json"),
    ("schemas/agl-evaluation-request-v2.schema.json", "conformance/fr01/evaluation-request-v2.valid.json"),
    ("schemas/agl-resolved-audio-plan-v2.schema.json", "conformance/fr01/resolved-audio-plan-v2.valid.json"),
    ("schemas/agl-audio-schedule-binding-v1.schema.json", "conformance/fr01/audio-schedule-binding-v1.valid.json"),
    ("schemas/agl-package-manifest-v2.schema.json", "conformance/fr01/package-manifest-v2.valid.json"),
    ("schemas/agl-accessibility-mirror-v1.schema.json", "conformance/fr01/accessibility-mirror-v1.valid.json"),
    ("schemas/agl-export-manifest-v1.schema.json", "conformance/fr01/export-manifest-v1.valid.json"),
    ("schemas/agl-migration-receipt-v2.schema.json", "conformance/fr01/migration-receipt-v2.valid.json"),
    ("schemas/agl-claim-register-v1.schema.json", "program/claim-register.json"),
]


def iter_paths(pattern: str) -> Iterable[Path]:
    paths = sorted(ROOT.glob(pattern))
    if not paths:
        raise FileNotFoundError(f"No fixtures matched {pattern}")
    return paths


def json_path(error) -> str:
    result = "$"
    for part in error.absolute_path:
        result += f"[{part!r}]" if isinstance(part, int) else f".{part}"
    return result


def main() -> int:
    failed = False
    total = 0
    for schema_relative, fixture_pattern in CASES:
        schema_path = ROOT / schema_relative
        schema = json.loads(schema_path.read_text())
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema, format_checker=FORMAT_CHECKER)
        for fixture_path in iter_paths(fixture_pattern):
            total += 1
            instance = json.loads(fixture_path.read_text())
            errors = sorted(validator.iter_errors(instance), key=lambda error: list(error.absolute_path))
            if errors:
                failed = True
                print(f"FAIL {fixture_path.relative_to(ROOT)} against {schema_path.relative_to(ROOT)}")
                for error in errors:
                    print(f"  {json_path(error)}: {error.message}")
            else:
                print(f"PASS {fixture_path.relative_to(ROOT)}")
    print(f"Validated {total} public JSON fixtures/examples against Draft 2020-12 schemas.")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
