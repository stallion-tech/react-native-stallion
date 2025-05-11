import Foundation

@objc class StallionDownloadCacheManager: NSObject {
    
    private static let metaFileName = "download-cache.meta"
    
    @objc static func getDownloadCache(config: StallionConfig, downloadUrl: String, downloadPath: String) -> Int64 {
        let lastDownloadingUrl = config.lastDownloadingUrl ?? ""
        let alreadyDownloaded = readMetaFile(at: downloadPath)
        
        if lastDownloadingUrl != downloadUrl || alreadyDownloaded <= 0 {
          config.updatePrevDownloadUrl(downloadUrl)
          StallionFileManager.deleteFileOrFolderSilently(downloadPath)
            return 0
        } else {
            return alreadyDownloaded
        }
    }
    
    @objc static func saveDownloadCache(path: String, bytes: Int64) {
        let metaPath = (path as NSString).appendingPathComponent(metaFileName)
        do {
            try "\(bytes)".data(using: .utf8)?.write(to: URL(fileURLWithPath: metaPath))
        } catch {
            // Silently ignore
        }
    }
    
    private static func readMetaFile(at path: String) -> Int64 {
        let metaPath = (path as NSString).appendingPathComponent(metaFileName)
        let fileURL = URL(fileURLWithPath: metaPath)
        
        guard FileManager.default.fileExists(atPath: metaPath) else { return 0 }
        
        do {
            let data = try Data(contentsOf: fileURL)
            let stringValue = String(data: data, encoding: .utf8) ?? "0"
            return Int64(stringValue.trimmingCharacters(in: .whitespacesAndNewlines)) ?? 0
        } catch {
            return 0
        }
    }
  
    @objc static func deleteDownloadCache(path: String) {
        let metaPath = (path as NSString).appendingPathComponent("download-cache.meta")
        let fileURL = URL(fileURLWithPath: metaPath)
        try? FileManager.default.removeItem(at: fileURL)
    }
  
}
