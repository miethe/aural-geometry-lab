# ADR 0016 — Native iPad Ports-and-Adapters Architecture

- **Status:** Accepted with native proof gates
- **Date:** 2026-08-18
- **Sources:** DR-12, DR-15

## Context

The iPad is a compelling authoring surface, but native work cannot fork AGL project semantics or displace the browser MVP. Multiple document windows coexist with process-global audio and MIDI resources.

## Decision

The native app consumes canonical schemas, commands, events, plans, projections, and fixtures. SwiftUI, AVFoundation, Core MIDI, Metal, Files, and BackgroundTasks remain adapters.

Initial document shell: `DocumentGroup<FileDocument>` behind a persistence adapter, subject to destructive cloud-conflict tests and fallback to `UIDocument`.

`ProjectStore` and `CommandDispatcher` own editing; `AGLDocument` is a persistence snapshot. Platform `UndoManager` mirrors AGL transactions.

A process-wide coordinator owns AVAudioSession, route/interruption/media reset, and MIDI endpoints. MVP permits one active audible project. A separate manual AVAudioEngine handles offline export.

SwiftUI Canvas is default for bounded 2D; Metal is selected by measured workload. Pencil capabilities are accelerators with touch/keyboard/accessibility equivalents.

## Alternatives considered

- Native semantic fork.
- WebView wrapper as the native product.
- Full iPhone studio parity.
- Process-per-document audio ownership.

## Consequences

- Native UX can be first-class without changing project meaning.
- Cross-platform fixtures are release gates.
- App-level coordinators are required from the first audio proof.

## Risks

- Swift exact BigInt dependency is unresolved.
- Document conflict and physical package profile require proof.
