import Foundation

public struct RationalJSON: Codable, Equatable, Sendable {
    public var numerator: String
    public var denominator: String

    public init(numerator: String, denominator: String) {
        self.numerator = numerator
        self.denominator = denominator
    }
}

public struct TempoV1: Codable, Equatable, Sendable {
    public var bpm: Double
    public var numerator: Int
    public var denominator: Int
}

public struct TrackV1: Codable, Equatable, Sendable {
    public var id: String?
    public var name: String?
    public var kind: String?
}

public struct NodeV1: Codable, Equatable, Sendable {
    public var id: String?
    public var type: String?
    public var version: Int?
}

public struct ConnectionV1: Codable, Equatable, Sendable {
    public var id: String?
    public var source: String?
    public var target: String?
}

/// Portable representation of the existing Sprint-0 schema.
/// Unknown nested content is intentionally not modeled here yet; the native spike
/// should evolve in lockstep with the shared v2 schema rather than inventing one.
public struct AuralGeometryProjectV1: Codable, Equatable, Sendable {
    public var schema: String
    public var schemaVersion: Int
    public var id: String
    public var name: String
    public var createdAt: String
    public var modifiedAt: String
    public var seed: String
    public var tempo: TempoV1
    public var tracks: [TrackV1]
    public var nodes: [NodeV1]
    public var connections: [ConnectionV1]
    public var activeLab: String?
}

public enum EntityKind: String, Codable, CaseIterable, Sendable {
    case project
    case track
    case clip
    case material
    case event
    case operatorNode = "operator-node"
    case operatorEdge = "operator-edge"
    case geometryObject = "geometry-object"
    case geometryElement = "geometry-element"
    case mappingStage = "mapping-stage"
    case provenanceStep = "provenance-step"
    case labStep = "lab-step"
    case asset
}

public enum SurfaceID: String, Codable, CaseIterable, Sendable {
    case library
    case navigator
    case canvas
    case timeline
    case graph
    case inspector
    case guide
    case mixer
    case export
}

public struct SelectionRef: Codable, Equatable, Hashable, Sendable {
    public var kind: EntityKind
    public var id: String
    public var projectionPath: String?

    public init(kind: EntityKind, id: String, projectionPath: String? = nil) {
        self.kind = kind
        self.id = id
        self.projectionPath = projectionPath
    }

    public var stableKey: String {
        [kind.rawValue, id, projectionPath ?? ""].map(Self.segment).joined(separator: "|")
    }

    private static func segment(_ value: String) -> String {
        "\(value.utf8.count):\(value)"
    }
}

public struct SelectionState: Equatable, Sendable {
    public var primary: SelectionRef?
    public var ordered: [SelectionRef]
    public var anchor: SelectionRef?
    public var changedBy: SurfaceID?

    public init(
        primary: SelectionRef? = nil,
        ordered: [SelectionRef] = [],
        anchor: SelectionRef? = nil,
        changedBy: SurfaceID? = nil
    ) {
        self.primary = primary
        self.ordered = ordered
        self.anchor = anchor
        self.changedBy = changedBy
    }

    public static func only(_ ref: SelectionRef, changedBy: SurfaceID? = nil) -> SelectionState {
        SelectionState(primary: ref, ordered: [ref], changedBy: changedBy)
    }

    public func toggling(_ ref: SelectionRef, changedBy: SurfaceID? = nil) -> SelectionState {
        if let index = ordered.firstIndex(of: ref) {
            var next = ordered
            next.remove(at: index)
            return SelectionState(
                primary: next.last,
                ordered: next,
                anchor: anchor == ref ? nil : anchor,
                changedBy: changedBy
            )
        }

        var next = ordered.filter { $0 != ref }
        next.append(ref)
        return SelectionState(primary: ref, ordered: next, anchor: anchor, changedBy: changedBy)
    }
}

public struct GeneratedSelectionIdentityV2: Codable, Equatable, Hashable, Sendable {
    public var producerId: String
    public var outputPortId: String
    public var keySchema: String
    public var keyVersion: Int
    public var stableKey: String
    public var sourceFingerprint: String?

    public init(
        producerId: String,
        outputPortId: String,
        keySchema: String,
        keyVersion: Int,
        stableKey: String,
        sourceFingerprint: String? = nil
    ) {
        self.producerId = producerId
        self.outputPortId = outputPortId
        self.keySchema = keySchema
        self.keyVersion = keyVersion
        self.stableKey = stableKey
        self.sourceFingerprint = sourceFingerprint
    }
}

/// FR-01 semantic identity is independent of timeline/canvas projection paths.
public struct SemanticSelectionRefV2: Codable, Equatable, Hashable, Sendable {
    public var kind: EntityKind
    public var id: String
    public var generated: GeneratedSelectionIdentityV2?

    public init(kind: EntityKind, id: String, generated: GeneratedSelectionIdentityV2? = nil) {
        self.kind = kind
        self.id = id
        self.generated = generated
    }

    public var stableKey: String {
        if let generated {
            return [
                "semantic-selection-v2",
                kind.rawValue,
                generated.producerId,
                generated.outputPortId,
                generated.keySchema,
                String(generated.keyVersion),
                generated.stableKey,
            ].map(Self.segment).joined(separator: "|")
        }
        return ["semantic-selection-v2", kind.rawValue, id].map(Self.segment).joined(separator: "|")
    }

    private static func segment(_ value: String) -> String {
        "\(value.utf8.count):\(value)"
    }
}

public struct SelectionProjectionRefV1: Codable, Equatable, Hashable, Sendable {
    public var semantic: SemanticSelectionRefV2
    public var surface: SurfaceID
    public var projectionPath: String

    public var stableKey: String {
        [semantic.stableKey, surface.rawValue, projectionPath]
            .map { "\($0.utf8.count):\($0)" }
            .joined(separator: "|")
    }
}

public enum GeneratedEditChoice: String, Codable, Sendable {
    case freezeRegion = "freeze-region"
    case downstreamEditOperator = "downstream-edit-operator"
    case cancel
}

public struct GeneratorLineageRef: Codable, Equatable, Sendable {
    public var sourceNodeId: String
    public var operatorType: String
    public var operatorVersion: Int
    public var projectRevision: Int
    public var evaluationHash: String
    public var seed: String
    public var intervalStart: String
    public var intervalEnd: String
}

// MARK: - Wave-1 integrated portable contracts

public enum JSONValue: Codable, Equatable, Sendable {
    case string(String)
    case number(Double)
    case bool(Bool)
    case object([String: JSONValue])
    case array([JSONValue])
    case null

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() { self = .null }
        else if let value = try? container.decode(Bool.self) { self = .bool(value) }
        else if let value = try? container.decode(Double.self) { self = .number(value) }
        else if let value = try? container.decode(String.self) { self = .string(value) }
        else if let value = try? container.decode([JSONValue].self) { self = .array(value) }
        else { self = .object(try container.decode([String: JSONValue].self)) }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let value): try container.encode(value)
        case .number(let value): try container.encode(value)
        case .bool(let value): try container.encode(value)
        case .object(let value): try container.encode(value)
        case .array(let value): try container.encode(value)
        case .null: try container.encodeNil()
        }
    }
}

public struct ProjectCompatibilityV2: Codable, Equatable, Sendable {
    public var semanticContractVersion: String
    public var operatorCatalogVersion: String
    public var stableIdVersion: String
    public var deterministicGenerationVersion: String
    public var budgetProfileId: String
    public var numericalProfileId: String?
}

public struct SeedContextV2: Codable, Equatable, Sendable {
    public var algorithm: String
    public var algorithmVersion: Int
    public var encodingVersion: Int
    public var seed: String
    public var defaultStreamId: String
}

public struct MeterV2: Codable, Equatable, Sendable {
    public var numerator: Int
    public var denominator: Int
}

public struct TempoPointV2: Codable, Equatable, Sendable {
    public var id: String
    public var beat: RationalJSON
    public var bpm: Double
    public var curve: String
}

public struct ProjectOperatorNodeV2: Codable, Equatable, Sendable {
    public var id: String
    public var type: String
    public var version: Int
    public var parameters: [String: JSONValue]
}

public struct ProjectConnectionV2: Codable, Equatable, Sendable {
    public var id: String
    public var kind: String
    public var affectsResult: Bool
    public var sourceNodeId: String
    public var sourcePortId: String
    public var targetNodeId: String
    public var targetPortId: String
}

public struct ProjectGraphV2: Codable, Equatable, Sendable {
    public var nodes: [ProjectOperatorNodeV2]
    public var connections: [ProjectConnectionV2]
}

public struct ProjectTrackRouteV2: Codable, Equatable, Sendable {
    public var muted: Bool
    public var solo: Bool
    public var gain: Double
    public var pan: Double
    public var voiceId: String?
}

public struct ProjectTrackV2: Codable, Equatable, Sendable {
    public var id: String
    public var name: String
    public var kind: String
    public var materialIds: [String]
    public var route: ProjectTrackRouteV2
}

public enum MaterialKind: String, Codable, CaseIterable, Sendable {
    case userAuthored = "user-authored"
    case liveGenerated = "live-generated"
    case snapshot
    case editedDerivative = "edited-derivative"
}

public enum SourceStatus: String, Codable, CaseIterable, Sendable {
    case notApplicable = "not-applicable"
    case current
    case changed
    case missing
    case detached
    case unresolved
}

public struct ProjectMaterialRangeV2: Codable, Equatable, Sendable {
    public var start: RationalJSON
    public var end: RationalJSON
}

public struct ProjectMaterialSourceV2: Codable, Equatable, Sendable {
    public var producerNodeId: String
    public var outputPortId: String
    public var dependencyDigest: String
    public var sourceRecipeRef: String
    public var parentMaterialId: String?
}

public struct ProjectMaterialV2: Codable, Equatable, Sendable {
    public var id: String
    public var kind: MaterialKind
    public var name: String
    public var trackId: String
    public var range: ProjectMaterialRangeV2
    public var payloadRef: String?
    public var source: ProjectMaterialSourceV2?
    public var materializationReceiptId: String?
}

public struct ProjectAssetV2: Codable, Equatable, Sendable {
    public var id: String
    public var sha256: String
    public var mediaType: String
    public var bytes: Int
    public var rights: String
}

public struct ProjectPresentationV2: Codable, Equatable, Sendable {
    public struct Point: Codable, Equatable, Sendable { public var x: Double; public var y: Double }
    public var defaultLab: String?
    public var graphLayout: [String: Point]?
}

public struct AuralGeometryProjectV2: Codable, Equatable, Sendable {
    public var schema: String
    public var schemaVersion: Int
    public var id: String
    public var name: String
    public var createdAt: String
    public var modifiedAt: String
    public var compatibility: ProjectCompatibilityV2
    public var seedContext: SeedContextV2
    public var meter: MeterV2
    public var tempoMap: [TempoPointV2]
    public var graph: ProjectGraphV2
    public var tracks: [ProjectTrackV2]
    public var materials: [ProjectMaterialV2]
    public var assets: [ProjectAssetV2]
    public var experiments: [String: JSONValue]
    public var presentation: ProjectPresentationV2?
}

public struct ProjectCompatibilityV3: Codable, Equatable, Sendable {
    public var semanticContractVersion: String
    public var canonicalEncodingVersion: String
    public var canonicalDigestVersion: String
    public var operatorSemanticDigestVersion: String
    public var operatorCatalogDigestVersion: String
    public var graphCompilerVersion: String
    public var operatorCatalogVersion: String
    public var operatorCatalogDigest: String
    public var stableIdVersion: String
    public var deterministicGenerationVersion: String
    public var budgetProfileId: String
    public var budgetProfileVersion: Int
    public var commandSchemaVersion: Int
    public var resolvedAudioPlanSchemaVersion: Int
    public var selectionIdentityVersion: Int
    public var packageManifestSchemaVersion: Int
    public var tempoResolutionVersion: String
    public var requiredSemanticExtensions: [String]
    public var numericalProfileId: String?
}

public struct ProjectOperatorNodeV3: Codable, Equatable, Sendable {
    public var id: String
    public var type: String
    public var version: Int
    public var operatorSemanticDigest: String
    public var parameters: [String: JSONValue]
}

public struct ProjectConnectionV3: Codable, Equatable, Sendable {
    public var id: String
    public var kind: String
    public var sourceNodeId: String
    public var sourcePortId: String
    public var targetNodeId: String
    public var targetPortId: String
}

public struct ProjectGraphV3: Codable, Equatable, Sendable {
    public var nodes: [ProjectOperatorNodeV3]
    public var connections: [ProjectConnectionV3]
}

public struct ProjectAssetV3: Codable, Equatable, Sendable {
    public var id: String
    public var digest: String
    public var mediaType: String
    public var bytes: Int
    public var rights: String
}

public struct ProjectSourceRecipeV3: Codable, Equatable, Sendable {
    public var id: String
    public var producerNodeId: String
    public var outputPortId: String
    public var dependencyDigest: String
    public var semanticEnvironmentDigest: String
    public var operatorCatalogDigest: String
    public var budgetProfileId: String
    public var budgetProfileVersion: Int
    public var seedStreamId: String
    public var range: ProjectMaterialRangeV2
    public var graphSnapshotAssetId: String?
}

public struct ProjectMaterialSourceV3: Codable, Equatable, Sendable {
    public var producerNodeId: String
    public var outputPortId: String
    public var dependencyDigestAtMaterialization: String
    public var sourceRecipeId: String
    public var sourceRecipeDigestAtMaterialization: String
    public var parentMaterialId: String?
}

public struct ProjectMaterialV3: Codable, Equatable, Sendable {
    public var id: String
    public var kind: MaterialKind
    public var name: String
    public var trackId: String
    public var range: ProjectMaterialRangeV2
    public var payloadRef: String?
    public var payloadAssetId: String?
    public var source: ProjectMaterialSourceV3?
    public var materializationReceiptId: String?
}

public struct ProjectMaterializationReceiptV3: Codable, Equatable, Sendable {
    public var id: String
    public var preparationId: String
    public var materialId: String
    public var sourceRecipeId: String
    public var sourceRecipeDigest: String
    public var dependencyDigest: String
    public var semanticEnvironmentDigest: String
    public var operatorCatalogDigest: String
    public var budgetProfileId: String
    public var budgetProfileVersion: Int
    public var seedStreamId: String
    public var artifactAssetId: String
    public var artifactDigest: String
    public var range: ProjectMaterialRangeV2
    public var committedAt: String
}

public struct ProjectExtensionV3: Codable, Equatable, Sendable {
    public var namespace: String
    public var schemaVersion: Int
    public var affectsSemantics: Bool
    public var payload: JSONValue
}

public struct AuralGeometryProjectV3: Codable, Equatable, Sendable {
    public var schema: String
    public var schemaVersion: Int
    public var id: String
    public var name: String
    public var createdAt: String
    public var modifiedAt: String
    public var compatibility: ProjectCompatibilityV3
    public var seedContext: SeedContextV2
    public var meter: MeterV2
    public var tempoMap: [TempoPointV2]
    public var graph: ProjectGraphV3
    public var tracks: [ProjectTrackV2]
    public var materials: [ProjectMaterialV3]
    public var sourceRecipes: [ProjectSourceRecipeV3]
    public var materializationReceipts: [ProjectMaterializationReceiptV3]
    public var assets: [ProjectAssetV3]
    public var extensions: [ProjectExtensionV3]
    public var presentation: ProjectPresentationV2?
}

public func deriveSourceStatus(
    kind: MaterialKind,
    hasSource: Bool,
    detached: Bool,
    sourceExists: Bool,
    receiptDigest: String?,
    currentDigest: String?
) -> SourceStatus {
    if kind == .userAuthored { return .notApplicable }
    if detached { return .detached }
    if !hasSource || !sourceExists { return .missing }
    if kind == .liveGenerated { return .current }
    guard let receiptDigest, let currentDigest else { return .unresolved }
    return receiptDigest == currentDigest ? .current : .changed
}

public enum PackageProfile: String, Codable, Sendable {
    case nativeDirectory = "agl.native-directory-package.v1"
    case portableArchive = "agl.portable-archive.v1"
}

public enum PackageProfileV2: String, Codable, Sendable {
    case nativeDirectory = "agl.native-directory-package.v2"
    case portableArchive = "agl.portable-archive.v2"
}

public let audioFrameQuantizationVersion = "seconds-to-frame-v1"
public let maximumPortableSampleFrame = 9_007_199_254_740_991

public func secondsToSampleFrameV1(seconds: Double, sampleRate: Int) throws -> Int {
    guard seconds.isFinite, seconds >= 0 else {
        throw ContractError.invalidSeconds
    }
    guard sampleRate > 0 else {
        throw ContractError.invalidSampleRate
    }
    let frame = (seconds * Double(sampleRate) + 0.5).rounded(.down)
    guard frame.isFinite, frame <= Double(maximumPortableSampleFrame), frame <= Double(Int.max) else { throw ContractError.frameOverflow }
    return Int(frame)
}

public enum ContractError: Error, Equatable, Sendable {
    case invalidSeconds
    case invalidSampleRate
    case frameOverflow
}
