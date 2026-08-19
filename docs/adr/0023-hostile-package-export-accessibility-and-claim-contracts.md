# ADR 0023 — Hostile Package Boundary, Loss-Aware Export, Accessibility Mirror, and Claim Gates

- **Status:** Accepted; production adapters and product wiring open
- **Date:** 2026-08-18
- **Sources:** DR-08, DR-09, DR-11, DR-12; FR-01 findings FR01-007, FR01-018, FR01-019, FR01-020, FR01-028, FR01-029, FR01-032, FR01-039, FR01-042, FR01-049, FR01-050
- **Supersedes/extends:** ADR 0007, ADR 0017

## Context

Project packages, exports, accessible representations, and scientific copy are all trust boundaries. A declarative manifest is unsafe if actual archive members are not measured. MIDI/MusicXML/WAV/package output can imply more semantic preservation than it provides. Canvas-only state can become inaccessible or differ between web/native. Research-gated copy can be bypassed if UI callers supply arbitrary evidence strings.

## Decision

### Package boundary

1. `agl.package.manifest` v2 describes a logical package, independent of native-directory versus portable-archive physical profiles.
2. Import enumerates actual members and rejects traversal, absolute/ambiguous/case-colliding/reserved paths, links/devices, missing/extra members, size/hash mismatch, duplicate authoritative projects, compression bombs, and exceeded limits.
3. Assets use content-addressed paths. Exactly one authoritative project is schema/runtime/compatibility validated before execution.
4. Package metadata is not trusted merely because it is declared; bytes and hashes are measured. Authoritative JSON is parsed as strict UTF-8 and rejects duplicate object names, malformed/lone Unicode, unsafe integer literals, trailing data, and boundedness violations before schema/runtime validation. Native and browser import adapters must provide equivalent hostile-JSON behavior.

### Export boundary

5. `agl.export.manifest` v1 binds source project/epoch/schema/semantic digest, material mode/IDs/recipes/receipts, exact half-open range, environment/catalog/plan, exporter, output hash/format, losses, and provenance.
6. Audio requires a plan digest/sample rate/channels. Non-audio output cannot claim audio metadata.
7. Symbolic export resolves a bounded canonical event/material state. Exporters do not rerun hidden sonification or geometry logic.
8. A completed export manifest is accepted only after the actual produced artifact bytes, media type, byte count, and SHA-256 are independently verified against it.
9. Live procedural MIDI/MusicXML export records `PROCEDURAL_MATERIAL_RESOLVED`; MusicXML records `MUSICXML_REPRESENTATION_SCOPE`. A completed manifest cannot contain an unresolved error-severity loss.

### Accessibility boundary

9. `agl.accessibility.mirror` v1 is generated from the same semantic projection as visual/audio surfaces.
10. It requires stable acyclic hierarchy/order, one focus locus, selection/focus distinction, non-color state text, non-drag alternatives, exact-value actions, and modality-independent command IDs.

### Evidence/claim boundary

11. Claims are registered by ID with allowed surfaces, source evidence, evidence class, exact qualification digest, and trusted gate evidence.
12. Caller-provided strings cannot satisfy a research/implementation gate. Missing or stale gate evidence fails copy resolution/CI.
13. Exact Penrose, perceptual success, production reconstruction, cross-browser audio equality, hearing safety, or universal sonification rankings may not be inferred beyond the claim register.

## Alternatives considered

- Trust ZIP extraction libraries/default filesystem behavior.
- One physical package format as semantic authority.
- MIDI/MusicXML as lossless project formats.
- Accessibility trees authored independently per surface/platform.
- Human review only for scientific copy.

## Consequences

- Import/export requires transactional streaming adapters and hostile corpora.
- Accessibility becomes a projection/runtime contract, not final-stage annotation.
- UI/docs/examples must use claim IDs rather than arbitrary prose for scientific statements.
- Native/cloud package conflict behavior remains a proof gate over the same logical package.

## Risks

- Archive metadata and Files providers vary; adapters need platform-specific hardening.
- Export loss terminology can overwhelm users unless presented progressively.
- Claim/evidence metadata can become stale unless release governance updates it.
- Accessibility semantic parity does not itself prove usability with representative users.

## Evidence

DR-08 requires transparent mappings, provenance, multimodal equivalents, and qualified claims. DR-09 forbids claiming exact/global Penrose properties from decorative finite images. DR-11 requires non-drag, non-color, focus/selection, and common commands. DR-12 distinguishes logical package from physical container and requires conflict testing. FR-01 implemented/validated the core contracts and exposed remaining adapter/wiring work.

## Confidence

Very high for the trust boundaries. Production package/export/accessibility/claim integration is owned by AGL-179/180/181/183.

## Open implementation gates

- AGL-179 owns hostile portable-archive/native-directory adapters and native strict-JSON parity.
- AGL-180 owns actual WAV/MIDI/MusicXML/package codecs and loss manifests.
- AGL-181 owns product accessibility adapter parity.
- AGL-183 owns build-time claim-registry enforcement.
