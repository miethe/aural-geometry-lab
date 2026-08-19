# AuralGeometryCore — Wave-1 Native Contract Package

This is a **portable semantic contract and conformance package**, not the native application and not a duplicate of the full browser runtime.

Wave-1 scope now covers:

- project-v1 decoding and project-v2 exact-wire decoding;
- rational values serialized as decimal strings;
- shared entity/surface selection identities;
- separated material kind and derived source status;
- logical native-directory/portable-archive package profiles;
- versioned `seconds-to-frame-v1` quantization;
- Penrose default-phase certificate availability;
- generated-material lineage vocabulary;
- shared JSON fixture tests.

Run with a Swift 6.1+ toolchain:

```bash
swift test
```

The package intentionally does **not** implement the complete graph evaluator, exact Penrose generator, AVAudioEngine backend, or SwiftUI shell. DR-12 and DR-15 establish a conformance-first ports-and-adapters path: expand Swift only for bounded native proof requirements, while schemas, fixtures, IDs, commands, projects, and render semantics remain platform-neutral.
