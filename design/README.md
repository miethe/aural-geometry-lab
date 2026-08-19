# Aural Geometry Lab — Design Contract

The design package is platform-neutral and implementation-oriented. It exists so React, SwiftUI, mockup generation, visual critique, and accessibility work consume one semantic vocabulary.

**Baseline:** 0.3.0 / 2026-08-18

Files:

- `tokens.json` / `tokens.css` — visual and semantic tokens;
- `components.json` — canonical component inventory;
- `interactions.json` — cross-input semantic interaction rules;
- `screens.json` — S01–S16 canonical screen campaign.

The normative prose sources are:

- `docs/13-ui-ux-final-design-spec.md`
- `docs/19-ui-ux-wave1-integrated-amendment.md`
- `docs/21-interaction-state-machine-conformance.md`

Key Wave-1 semantic additions:

- workspaces are projections, not capability modes;
- material kind and source status are separate axes;
- focus, selection, hover, related, and orphaned states are distinct;
- async derivation and audio runtime states are explicit;
- the mapping pipeline and “Why this event?” trace are first-class;
- evidence class is visible where scientific/product claims require qualification;
- every continuous gesture uses one semantic preview/commit transaction;
- core operations require keyboard and non-drag alternatives;
- iPad uses one dominant surface with contextual zones rather than enlarged desktop chrome.
