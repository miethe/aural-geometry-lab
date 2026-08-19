import Foundation
import Testing
@testable import AuralGeometryCore

private struct AudioFrameFixture: Decodable {
    struct FixtureCase: Decodable {
        var seconds: Double
        var sampleRate: Int
        var expectedFrame: Int
    }
    var quantizationVersion: String
    var cases: [FixtureCase]
}

private struct MaterialStatusFixture: Decodable {
    struct FixtureCase: Decodable {
        var name: String
        var kind: MaterialKind
        var hasSource: Bool
        var detached: Bool
        var sourceExists: Bool
        var receiptDigest: String?
        var currentDigest: String?
        var expected: SourceStatus
    }
    var cases: [FixtureCase]
}

private struct ExactWireFixture: Decodable {
    struct FixtureCase: Decodable {
        var name: String
        var input: RationalJSON
        var canonical: RationalJSON
    }
    var cases: [FixtureCase]
}

private struct PenroseCertificateFixture: Decodable {
    var construction: String
    var phase: [String]
    var regular: Bool
    var triples: [Triple]
    struct Triple: Decodable { var families: [Int]; var qphi: [String] }
}

@Test("Wave-1 sample-frame quantization matches shared fixtures")
func audioFramesMatch() throws {
    let url = try #require(Bundle.module.url(forResource: "audio-frame-cases", withExtension: "json"))
    let fixture = try JSONDecoder().decode(AudioFrameFixture.self, from: Data(contentsOf: url))
    #expect(fixture.quantizationVersion == audioFrameQuantizationVersion)
    for item in fixture.cases {
        #expect(try secondsToSampleFrameV1(seconds: item.seconds, sampleRate: item.sampleRate) == item.expectedFrame)
    }
}

@Test("Material source status is derived rather than persisted truth")
func materialStatusesMatch() throws {
    let url = try #require(Bundle.module.url(forResource: "material-status-cases", withExtension: "json"))
    let fixture = try JSONDecoder().decode(MaterialStatusFixture.self, from: Data(contentsOf: url))
    for item in fixture.cases {
        let actual = deriveSourceStatus(
            kind: item.kind,
            hasSource: item.hasSource,
            detached: item.detached,
            sourceExists: item.sourceExists,
            receiptDigest: item.receiptDigest,
            currentDigest: item.currentDigest
        )
        #expect(actual == item.expected, Comment(rawValue: item.name))
    }
}

@Test("Exact-wire rationals remain strings in Swift")
func exactWireRemainsPortable() throws {
    let url = try #require(Bundle.module.url(forResource: "exact-wire-cases", withExtension: "json"))
    let fixture = try JSONDecoder().decode(ExactWireFixture.self, from: Data(contentsOf: url))
    for item in fixture.cases {
        #expect(!item.input.denominator.isEmpty, Comment(rawValue: item.name))
        #expect(!item.canonical.denominator.hasPrefix("-"), Comment(rawValue: item.name))
    }
}

@Test("Penrose default phase certificate is available to the native contract")
func penroseCertificateLoads() throws {
    let url = try #require(Bundle.module.url(forResource: "penrose-default-phase-certificate", withExtension: "json"))
    let fixture = try JSONDecoder().decode(PenroseCertificateFixture.self, from: Data(contentsOf: url))
    #expect(fixture.construction == "de-bruijn-regular-pentagrid-p3-v1")
    #expect(fixture.phase == ["0", "1/5", "2/5", "-1/5", "-2/5"])
    #expect(fixture.regular)
    #expect(fixture.triples.count == 10)
}

@Test("Project v2 can be decoded without platform-only fields")
func decodeProjectV2() throws {
    let data = Data(#"""
{
      "schema":"agl.project","schemaVersion":2,"id":"p2","name":"Wave 1",
      "createdAt":"2026-08-18T00:00:00Z","modifiedAt":"2026-08-18T00:00:00Z",
      "compatibility":{"semanticContractVersion":"wave1-v1","operatorCatalogVersion":"0.3.0","stableIdVersion":"agl-stable-id-v1","deterministicGenerationVersion":"agl-prng-v1","budgetProfileId":"agl-mvp-budget-v1"},
      "seedContext":{"algorithm":"agl-prng","algorithmVersion":1,"encodingVersion":1,"seed":"s","defaultStreamId":"project-default"},
      "meter":{"numerator":4,"denominator":4},
      "tempoMap":[{"id":"t0","beat":{"numerator":"0","denominator":"1"},"bpm":120,"curve":"step"}],
      "graph":{"nodes":[],"connections":[]},"tracks":[],"materials":[],"assets":[],"experiments":{}
    }
"""#.utf8)
    let project = try JSONDecoder().decode(AuralGeometryProjectV2.self, from: data)
    #expect(project.schemaVersion == 2)
    #expect(project.tempoMap.first?.beat == RationalJSON(numerator: "0", denominator: "1"))
}
