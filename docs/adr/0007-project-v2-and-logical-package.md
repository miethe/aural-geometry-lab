# ADR 0007 — Project Schema v2 and Logical Package Profiles

- **Status:** Accepted with proof-of-architecture gates
- **Date:** 2026-08-18
- **Sources:** DR-11, DR-12, DR-14, DR-15

## Context

AGL requires exact time, deterministic migrations, hash-addressed assets, native Files/iCloud support, and browser interchange. A native document package is a directory; a browser-downloadable project is normally an archive. Session/runtime state must not contaminate project meaning.

## Decision

Define project schema v2 with:

- arbitrary-size rational components serialized as canonical decimal strings;
- explicit compatibility/version profiles;
- typed/versioned graph, tracks, materials, assets, seed context, and lineage;
- material kind and source linkage, while source status is derived;
- no selection, focus, hover, transport, audio device, scheduler, worker, or backend state.

Define one logical package:

```text
manifest.json
project.json
assets/*
preview/*          # optional, non-authoritative
```

Permit `native-directory` and `portable-archive` physical profiles. Both expose the same logical members and semantic package digest.

Preserve source bytes/digest separately from normalized semantic model/digest.

## Alternatives considered

- Monolithic JSON.
- Native directory package only.
- ZIP only.
- Separate web/native formats.

## Consequences

- Two physical profiles may require tests and import UX.
- Native package writes can reuse unchanged assets.
- Browser/native semantic round-trip remains possible.

## Risks

- Cloud provider package behavior varies.
- Archive extraction must be hostile-input safe.
- `FileDocument` conflict handling may prove insufficient; `UIDocument` remains the fallback adapter.
