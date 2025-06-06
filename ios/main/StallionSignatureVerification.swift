import Foundation
import CommonCrypto
import Security

class StallionSignatureVerification {

    static let signatureFileName = ".stallionsigned"

    static func verifyReleaseSignature(downloadedBundlePath: String, publicKeyPem: String) -> Bool {
        do {
            let signatureFilePath = (downloadedBundlePath as NSString).appendingPathComponent(signatureFileName)
            guard FileManager.default.fileExists(atPath: signatureFilePath) else { return false }

            let jwt = try String(contentsOfFile: signatureFilePath, encoding: .utf8)
            let parts = jwt.components(separatedBy: ".")
            guard parts.count == 3 else { return false }
            let header = parts[0]
            let payload = parts[1]
            let signatureB64 = parts[2]

            guard let signatureData = base64UrlDecode(signatureB64),
                  let signedData = (header + "." + payload).data(using: .utf8) else { return false }

            guard let pubKey = try? convertPemToPublicKey(pemString: publicKeyPem) else { return false }

            var error: Unmanaged<CFError>?
            let verified = SecKeyVerifySignature(
                pubKey,
                .rsaSignatureMessagePKCS1v15SHA256,
                signedData as CFData,
                signatureData as CFData,
                &error
            )

            guard verified else { return false }

            guard let payloadData = base64UrlDecode(payload),
                  let payloadJson = try JSONSerialization.jsonObject(with: payloadData) as? [String: Any],
                  let expectedHash = payloadJson["packageHash"] as? String else { return false }

            let actualHash = try computeCodePushStyleHash(folderPath: downloadedBundlePath)
            return expectedHash == actualHash

        } catch {
            print("Signature verification error: \(error)")
            return false
        }
    }

    private static func computeCodePushStyleHash(folderPath: String) throws -> String {
        var manifest: [String] = []
        try addContentsOfFolder(to: &manifest, folderPath: folderPath, pathPrefix: "")
        let sortedManifest = manifest.sorted()
        let jsonData = try JSONSerialization.data(withJSONObject: sortedManifest, options: [])
        var jsonString = String(data: jsonData, encoding: .utf8) ?? ""
        jsonString = jsonString.replacingOccurrences(of: "\\/", with: "/")
        return sha256Hex(jsonString)
    }

    private static func addContentsOfFolder(to manifest: inout [String], folderPath: String, pathPrefix: String) throws {
        let items = try FileManager.default.contentsOfDirectory(atPath: folderPath)
        for item in items {
            let fullPath = (folderPath as NSString).appendingPathComponent(item)
            let relativePath = pathPrefix.isEmpty ? item : (pathPrefix as NSString).appendingPathComponent(item)

            if isIgnored(relativePath) { continue }

            var isDir: ObjCBool = false
            FileManager.default.fileExists(atPath: fullPath, isDirectory: &isDir)

            if isDir.boolValue {
                try addContentsOfFolder(to: &manifest, folderPath: fullPath, pathPrefix: relativePath)
            } else {
                let data = try Data(contentsOf: URL(fileURLWithPath: fullPath))
                let hash = sha256Hex(data)
                manifest.append("\(relativePath):\(hash)")
            }
        }
    }

    private static func isIgnored(_ path: String) -> Bool {
        return path.hasPrefix("__MACOSX/") ||
               path == ".DS_Store" ||
               path.hasSuffix("/.DS_Store") ||
               path == signatureFileName ||
               path.hasSuffix("/\(signatureFileName)")
    }

    private static func sha256Hex(_ input: String) -> String {
        guard let data = input.data(using: .utf8) else { return "" }
        return sha256Hex(data)
    }

    private static func sha256Hex(_ data: Data) -> String {
        var digest = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
        data.withUnsafeBytes {
            _ = CC_SHA256($0.baseAddress, CC_LONG(data.count), &digest)
        }
        return digest.map { String(format: "%02x", $0) }.joined()
    }

    private static func base64UrlDecode(_ input: String) -> Data? {
        var base64 = input.replacingOccurrences(of: "-", with: "+")
                             .replacingOccurrences(of: "_", with: "/")
        let padding = base64.count % 4
        if padding > 0 {
            base64 += String(repeating: "=", count: 4 - padding)
        }
        return Data(base64Encoded: base64)
    }

    private static func convertPemToPublicKey(pemString: String) throws -> SecKey {
        let cleaned = pemString
            .replacingOccurrences(of: "-----BEGIN PUBLIC KEY-----\n", with: "")
            .replacingOccurrences(of: "-----END PUBLIC KEY-----", with: "")
            .replacingOccurrences(of: "\n", with: "")
            .replacingOccurrences(of: "\r", with: "")

        guard let keyData = Data(base64Encoded: cleaned, options: .ignoreUnknownCharacters) else {
            throw NSError(domain: "Stallion", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid base64 key"])
        }

        let keyDict: [String: Any] = [
            kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
            kSecAttrKeyClass as String: kSecAttrKeyClassPublic,
            kSecAttrKeySizeInBits as String: 2048
        ]

        var error: Unmanaged<CFError>?
        guard let secKey = SecKeyCreateWithData(keyData as CFData, keyDict as CFDictionary, &error) else {
            throw error!.takeRetainedValue() as Error
        }
        return secKey
    }
}
