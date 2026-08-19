# ADR 0013 — One Studio with Explore, Compose, and Inspect Projections

- **Status:** Accepted
- **Date:** 2026-08-18
- **Sources:** DR-11, DR-14

## Context

AGL must support immediate mathematical play, temporal composition, and rigorous causal inspection without creating separate applications or capability modes.

## Decision

Explore, Compose, and Inspect are layout/emphasis presets over one canonical project, command bus, selection, transport, and undo history. Any core panel can be revealed from any workspace.

Selection, primary selection, keyboard focus, pointer hover, related/provenance highlight, range anchors, and orphaned references are separate states. Focus does not automatically select expensive/multi-selectable entities.

Every parameter uses one semantic `ParameterSpec` for direct manipulation, exact entry, keyboard/accessibility actions, units, domain, reset, nudge, and clamp/wrap/reject behavior. Graph editing uses the executable type checker; invalid edges never enter ordinary canonical state.

## Alternatives considered

- DAW-first shell.
- Graph-first shell.
- Separate beginner/expert apps.
- Workspace modes that disable edits.

## Consequences

- One product model supports progressive disclosure.
- Shell and selection architecture become foundational.
- iPad can recompose the same semantics around one dominant surface.

## Risks

- Poor defaults can recreate excessive density.
- Workspace/session persistence must not pollute project meaning.
