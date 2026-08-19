// swift-tools-version: 6.1
import PackageDescription

let package = Package(
    name: "AuralGeometryCore",
    platforms: [
        .iOS(.v18),
        .macOS(.v15)
    ],
    products: [
        .library(name: "AuralGeometryCore", targets: ["AuralGeometryCore"])
    ],
    targets: [
        .target(name: "AuralGeometryCore"),
        .testTarget(
            name: "AuralGeometryCoreTests",
            dependencies: ["AuralGeometryCore"],
            resources: [.process("Fixtures")]
        )
    ]
)
