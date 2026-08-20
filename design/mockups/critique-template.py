#!/usr/bin/env python3
"""Seed design/mockups/critique.json with the docs/15 section 6 rubric rows for every rendered
mockup. Scores are filled in by the critique pass, not by this script."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
screens = json.loads((ROOT / "design/screens.json").read_text())["screens"]
CRITERIA = ["immediate playability","mathematical legibility","musical legibility",
            "professional-tool credibility","linked-selection clarity","density management",
            "novice-to-expert progression","generated/frozen distinction",
            "provenance discoverability","error/budget visibility","accessibility cues",
            "responsive plausibility","implementation plausibility","visual restraint",
            "consistency with design tokens"]
REJECT = ["mathematical correctness","generated/frozen semantics","accessibility"]
VARIANTS = ["A-instrument","B-laboratory","C-spatial"]
out = {"schema":"agl.design.mockup-critique","schemaVersion":1,"backlogItem":"AGL-149",
       "rubricSource":"docs/15-mockup-generation-spec.md#6-critique-rubric",
       "designBaseline":"0.3.0","criteria":CRITERIA,"rejectOn":REJECT,
       "scale":"0-3; any 0 on a rejectOn axis rejects the mockup regardless of aesthetics",
       "mockups":[]}
for s in screens:
    for v in VARIANTS:
        out["mockups"].append({
            "id": f"{s['id']}--{v}", "screen": s["id"], "variant": v,
            "image": f"design/mockups/images/{s['id']}-{s['slug']}--{v}.png",
            "prompt": f"design/mockups/prompts/{s['id']}-{s['slug']}--{v}.txt",
            "requiredStates": s.get("requiredStates", []),
            "scores": {c: None for c in CRITERIA},
            "rejectAxes": {r: None for r in REJECT},
            "verdict": None, "notes": None})
(ROOT/"design/mockups/critique.json").write_text(json.dumps(out, indent=2)+"\n")
print(f"seeded {len(out['mockups'])} critique rows")
