import Foundation
import Testing
@testable import AuralGeometryCore

private struct SelectionFixture: Decodable {
    struct FixtureCase: Decodable {
        var name: String
        var ref: SelectionRef
        var expectedKey: String
    }
    var cases: [FixtureCase]
}

@Test("Shared selection keys match JSON conformance fixtures")
func selectionKeysMatch() throws {
    let url = try #require(Bundle.module.url(forResource: "selection-cases", withExtension: "json"))
    let fixture = try JSONDecoder().decode(SelectionFixture.self, from: Data(contentsOf: url))
    for item in fixture.cases {
        #expect(item.ref.stableKey == item.expectedKey, Comment(rawValue: item.name))
    }
}

@Test("Selection toggle matches portable interaction semantics")
func selectionToggle() {
    let event = SelectionRef(kind: .event, id: "evt:α", projectionPath: "track/1")
    let state = SelectionState.only(event, changedBy: .timeline)
    let cleared = state.toggling(event, changedBy: .canvas)
    #expect(cleared.ordered.isEmpty)
    let restored = cleared.toggling(event, changedBy: .graph)
    #expect(restored.primary == event)
    #expect(restored.changedBy == .graph)
}

@Test("Sprint-0 project JSON can be decoded by the portable Swift contract")
func decodeProject() throws {
    let data = Data(#"{"schema":"agl.project","schemaVersion":1,"id":"p","name":"Demo","createdAt":"2026-08-14T00:00:00Z","modifiedAt":"2026-08-14T00:00:00Z","seed":"s","tempo":{"bpm":120,"numerator":4,"denominator":4},"tracks":[],"nodes":[],"connections":[],"activeLab":"euclidean-rings"}"#.utf8)
    let project = try JSONDecoder().decode(AuralGeometryProjectV1.self, from: data)
    #expect(project.schema == "agl.project")
    #expect(project.tempo.bpm == 120)
}
