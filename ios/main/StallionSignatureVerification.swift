import Foundation
import CommonCrypto
import Security

class StallionSignatureVerification {

    static let signatureFileName = "bundle.stallionsign"

    static func verifyReleaseSignature(downloadedBundlePath: String, publicKeyPem: String) -> Bool {
        do {
            // Load signature file
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

            // Convert PEM public key to SecKey
            guard let pubKey = try? convertPemToPublicKey(pemString: publicKeyPem) else { return false }

            // Verify signature
            var error: Unmanaged<CFError>?
            let verified = SecKeyVerifySignature(
                pubKey,
                .rsaSignatureMessagePKCS1v15SHA256,
                signedData as CFData,
                signatureData as CFData,
                &error
            )

            guard verified else { return false }

            // Decode payload and extract hash
            guard let payloadData = base64UrlDecode(payload),
                  let payloadJson = try JSONSerialization.jsonObject(with: payloadData) as? [String: Any],
                  let expectedHash = payloadJson["hash"] as? String else { return false }

            // Compute actual hash of folder
            let actualHash = try computeHashOfFolder(folderPath: downloadedBundlePath)
            return expectedHash == actualHash

        } catch {
            print("Signature verification error: \(error)")
            return false
        }
    }

    private static func computeHashOfFolder(folderPath: String) throws -> String {
        var sha256 = CC_SHA256_CTX()
        CC_SHA256_Init(&sha256)

        let fileManager = FileManager.default
        let items = try fileManager.contentsOfDirectory(atPath: folderPath)

        for item in items where item != signatureFileName {
            let fullPath = (folderPath as NSString).appendingPathComponent(item)
            if let fileData = try? Data(contentsOf: URL(fileURLWithPath: fullPath)) {
                fileData.withUnsafeBytes {
                    _ = CC_SHA256_Update(&sha256, $0.baseAddress, CC_LONG(fileData.count))
                }
            }
        }

        var digest = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
        CC_SHA256_Final(&digest, &sha256)
        return Data(digest).base64EncodedString()
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
        let cleaned = pemString.replacingOccurrences(of: "-----BEGIN PUBLIC KEY-----", with: "")
                               .replacingOccurrences(of: "-----END PUBLIC KEY-----", with: "")
                               .replacingOccurrences(of: "\n", with: "")
        guard let keyData = Data(base64Encoded: cleaned) else {
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
