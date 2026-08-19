import Foundation
import Testing
@testable import AuralGeometryCore

private struct SelectionV2Fixture: Decodable {
    struct Projection: Decodable { var surface: SurfaceID; var projectionPath: String }
    struct FixtureCase: Decodable {
        var name: String
        var semantic: SemanticSelectionRefV2
        var alternate: SemanticSelectionRefV2?
        var projections: [Projection]
        var expectedSemanticKey: String
        var expectedAlternateSemanticKey: String?
        var expectedProjectionKeys: [String]
    }
    var cases: [FixtureCase]
}

private struct PRNGV2Fixture: Decodable {
    struct StreamCase: Decodable {
        var name: String
        var rootSeed: String
        var streamPath: [String]
        var canonicalSeedMaterial: String
        var seedMaterialDigest: String
        var streamIdentity: String
        var firstUint32: [UInt32]
        var boundedIntegers: [Int]
    }
    struct StableIDCase: Decodable {
        var name: String
        var prefix: String
        var parts: [FixtureValue]
        var canonicalParts: String
        var expected: String
    }
    indirect enum FixtureValue: Decodable {
        case string(String)
        case array([FixtureValue])

        init(from decoder: Decoder) throws {
            let container = try decoder.singleValueContainer()
            if let string = try? container.decode(String.self) { self = .string(string) }
            else { self = .array(try container.decode([FixtureValue].self)) }
        }

        var canonical: CanonicalValueV1 {
            switch self {
            case .string(let value): .string(value)
            case .array(let values): .array(values.map(\.canonical))
            }
        }
    }
    var algorithm: String
    var version: String
    var streams: [StreamCase]
    var stableIds: [StableIDCase]
}

@Test("FR-01 semantic selection identity is projection independent")
func selectionV2Conformance() throws {
    let url = try #require(Bundle.module.url(forResource: "selection-v2-cases", withExtension: "json"))
    let fixture = try JSONDecoder().decode(SelectionV2Fixture.self, from: Data(contentsOf: url))
    for item in fixture.cases {
        #expect(item.semantic.stableKey == item.expectedSemanticKey, Comment(rawValue: item.name))
        if let alternate = item.alternate, let expected = item.expectedAlternateSemanticKey {
            #expect(alternate.stableKey == expected, Comment(rawValue: item.name + " alternate"))
            #expect(alternate.stableKey == item.semantic.stableKey, Comment(rawValue: item.name + " semantic equivalence"))
        }
        let actualProjectionKeys = item.projections.map {
            SelectionProjectionRefV1(semantic: item.semantic, surface: $0.surface, projectionPath: $0.projectionPath).stableKey
        }
        #expect(actualProjectionKeys == item.expectedProjectionKeys, Comment(rawValue: item.name + " projections"))
    }
}

@Test("FR-01 canonical SHA, stable IDs, and PRNG streams match TypeScript")
func prngV2Conformance() throws {
    let url = try #require(Bundle.module.url(forResource: "prng-v2-cases", withExtension: "json"))
    let fixture = try JSONDecoder().decode(PRNGV2Fixture.self, from: Data(contentsOf: url))
    #expect(fixture.algorithm == prngAlgorithmV2)
    #expect(fixture.version == prngVersionV2)

    for item in fixture.streams {
        let material: CanonicalValueV1 = .array([
            .string(prngAlgorithmV2), .string(item.rootSeed), .array(item.streamPath.map(CanonicalValueV1.string)),
        ])
        #expect(try canonicalEncodeV1(material) == item.canonicalSeedMaterial, Comment(rawValue: item.name + " canonical material"))
        #expect(try canonicalDigestV1(material) == item.seedMaterialDigest, Comment(rawValue: item.name + " digest"))

        var generator = try SeededRandomV2(rootSeed: item.rootSeed, streamPath: item.streamPath)
        #expect((0..<item.firstUint32.count).map { _ in generator.nextUInt32() } == item.firstUint32, Comment(rawValue: item.name + " uint32"))

        var integerGenerator = try SeededRandomV2(rootSeed: item.rootSeed, streamPath: item.streamPath)
        let integers = try (0..<item.boundedIntegers.count).map { _ in
            try integerGenerator.integer(minInclusive: -17, maxExclusive: 23)
        }
        #expect(integers == item.boundedIntegers, Comment(rawValue: item.name + " integers"))

        let identityGenerator = try SeededRandomV2(rootSeed: item.rootSeed, streamPath: item.streamPath)
        #expect(try identityGenerator.streamIdentity() == item.streamIdentity, Comment(rawValue: item.name + " identity"))
    }

    for item in fixture.stableIds {
        let parts = item.parts.map(\.canonical)
        #expect(try canonicalEncodeV1(.array(parts)) == item.canonicalParts, Comment(rawValue: item.name + " canonical parts"))
        #expect(try stableIDV2(prefix: item.prefix, parts: parts) == item.expected, Comment(rawValue: item.name))
    }
}

@Test("FR-01 project v3 compatibility and package profiles decode portably")
func projectV3Decode() throws {
    let projectURL = try #require(Bundle.module.url(forResource: "fr01-minimal-v3-project", withExtension: "json"))
    let project = try JSONDecoder().decode(AuralGeometryProjectV3.self, from: Data(contentsOf: projectURL))
    #expect(project.schemaVersion == 3)
    #expect(project.compatibility.semanticContractVersion == "wave1-fr01-v3")
    #expect(project.compatibility.stableIdVersion == stableIDVersionV2)
    #expect(project.compatibility.requiredSemanticExtensions.isEmpty)
    #expect(PackageProfileV2.portableArchive.rawValue == "agl.portable-archive.v2")
}
