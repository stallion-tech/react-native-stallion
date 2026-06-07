//
//  StallionTokenRegion.swift
//  react-native-stallion
//

import Foundation

enum StallionTokenRegion {
    private static let validRegions: Set<String> = ["ap", "us"]

    /// Parses the region prefix from a Stallion token.
    /// Returns "ap", "us", or nil. Nil means legacy unprefixed token; caller should default to "ap".
    static func parseTokenRegion(_ token: String?) -> String? {
        guard let token = token?.trimmingCharacters(in: .whitespacesAndNewlines), !token.isEmpty else {
            return nil
        }

        // App token: spb_<region>_<44-char nanoid> → 49 chars
        if token.hasPrefix("spb_"), token.count == 49, token[token.index(token.startIndex, offsetBy: 6)] == "_" {
            return extractRegion(from: token)
        }

        // CI token: stl_<region>_<36-char nanoid> → 43 chars
        if token.hasPrefix("stl_"), token.count == 43, token[token.index(token.startIndex, offsetBy: 6)] == "_" {
            return extractRegion(from: token)
        }

        return nil
    }

    static func defaultRegion() -> String {
        return "ap"
    }

    private static func extractRegion(from token: String) -> String? {
        let start = token.index(token.startIndex, offsetBy: 4)
        let end = token.index(token.startIndex, offsetBy: 6)
        let code = String(token[start..<end]).lowercased()
        guard code.range(of: "^[a-z]{2}$", options: .regularExpression) != nil else {
            return nil
        }
        return validRegions.contains(code) ? code : nil
    }
}
