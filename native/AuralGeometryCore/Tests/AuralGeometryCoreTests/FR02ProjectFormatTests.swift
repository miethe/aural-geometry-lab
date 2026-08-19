import Foundation
import Testing
@testable import AuralGeometryCore

private struct FR02NativeParityManifest: Decodable {
    struct Case: Decodable {
        var name: String
        var sourceFile: String
        var expectedDisposition: String
        var errorIdentity: String?
        var roundTripExtension: String?
    }
    var schema: String
    var schemaVersion: Int
    var cases: [Case]
}

private func fixtureData(_ name: String) throws -> Data {
    let url = try #require(Bundle.module.url(forResource: name, withExtension: "json"))
    return try Data(contentsOf: url)
}

@Test("FR-02 native parity fixture inventory is explicit")
func fr02NativeParityInventory() throws {
    let fixture = try JSONDecoder().decode(
        FR02NativeParityManifest.self,
        from: fixtureData("fr02-native-parity-cases")
    )
    #expect(fixture.schema == "agl.conformance.fr02.native-parity-cases")
    #expect(fixture.schemaVersion == 1)
    #expect(fixture.cases.count == 6)
    #expect(fixture.cases.contains { $0.errorIdentity == "AGL-FMT-JSON-DUPLICATE_MEMBER" })
    #expect(fixture.cases.contains { $0.expectedDisposition == "quarantine" })
}

@Test("FR-02 unknown nonsemantic extension survives Swift DTO decoding")
func fr02UnknownNonsemanticExtensionDecode() throws {
    let project = try JSONDecoder().decode(
        AuralGeometryProjectV3.self,
        from: fixtureData("fr02-unknown-nonsemantic-project")
    )
    let extensionValue = try #require(project.extensions.first)
    #expect(extensionValue.namespace == "future.ui.palette")
    #expect(extensionValue.affectsSemantics == false)
    guard case .object(let payload) = extensionValue.payload else {
        #expect(Bool(false), "Expected opaque extension payload object")
        return
    }
    #expect(payload["accent"] == .string("ultraviolet"))
}

@Test("FR-02 required semantic extension remains visible to native compatibility policy")
func fr02UnknownRequiredExtensionDecode() throws {
    let project = try JSONDecoder().decode(
        AuralGeometryProjectV3.self,
        from: fixtureData("fr02-unknown-required-project")
    )
    #expect(project.compatibility.requiredSemanticExtensions == ["future.math.operator-hints@v1"])
    #expect(project.extensions.first?.affectsSemantics == true)
}

@Test(
    "FR-02 native strict-byte parser returns TypeScript error identities",
    .disabled("AGL-191: strict JSON/package preflight is not implemented in the Swift package")
)
func fr02NativeStrictByteParity() throws {
    // Enable only after the native preflight rejects duplicate names, unsafe
    // integers, malformed UTF-8/Unicode, trailing data, and limits before
    // Foundation JSONDecoder. The identical corpus bytes and expected identities
    // are in fr02-native-parity-cases.json.
    let duplicateMemberBytes = try fixtureData("fr02-duplicate-schema-version")
    #expect(!duplicateMemberBytes.isEmpty)
}
