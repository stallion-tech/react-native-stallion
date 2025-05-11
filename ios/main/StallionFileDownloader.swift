import Foundation
import ZIPFoundation

class StallionFileDownloader: NSObject {
    private var downloadTask: URLSessionDataTask?
    private var _resolve: RCTPromiseResolveBlock?
    private var _reject: RCTPromiseRejectBlock?
    private var _onProgress: ((Float) -> Void)?
    private var lastSentProgress: Float = 0
    private var _downloadDirectory: String?
    private var _alreadyDownloaded: Int64 = 0

    private let queue = DispatchQueue(label: "com.stallion.networkmanager", qos: .background)

    override init() {
        super.init()
    }

    func downloadBundle(
        url: URL,
        downloadDirectory: String,
        alreadyDownloaded: Int64,
        onProgress: @escaping ((Float) -> Void),
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            self._resolve = resolve
            self._reject = reject
            self._onProgress = onProgress
            self._downloadDirectory = downloadDirectory
            self._alreadyDownloaded = alreadyDownloaded

            let config = StallionStateManager.sharedInstance().stallionConfig!
            config.lastDownloadingUrl = url.absoluteString

            do {
                let downloadedZip = try self.prepareForDownload(downloadDirectory: downloadDirectory, alreadyDownloaded: alreadyDownloaded)

                var request = URLRequest(url: url)
                request.httpMethod = "GET"
                if alreadyDownloaded > 0 {
                    request.setValue("bytes=\(alreadyDownloaded)-", forHTTPHeaderField: "Range")
                }

                let appToken = config.appToken ?? ""
                let sdkToken = config.sdkToken ?? ""

                if !appToken.isEmpty {
                    request.setValue(appToken, forHTTPHeaderField: StallionConstants.STALLION_APP_TOKEN_KEY)
                }
                if !sdkToken.isEmpty {
                    request.setValue(sdkToken, forHTTPHeaderField: StallionConstants.STALLION_SDK_TOKEN_KEY)
                }

                guard let outputStream = OutputStream(url: downloadedZip, append: alreadyDownloaded > 0) else {
                    reject("500", "Unable to open output stream", nil)
                    return
                }

                outputStream.open()
                self.downloadTask = URLSession.shared.dataTask(with: request) { data, response, error in
                    defer { outputStream.close() }

                    if let error = error {
                        if let dir = self._downloadDirectory {
                            let failedBytes = self._alreadyDownloaded + Int64(data?.count ?? 0)
                            StallionDownloadCacheManager.saveDownloadCache(path: dir, bytes: failedBytes)
                        }
                        reject("500", "Download failed: \(error.localizedDescription)", error as NSError)
                        return
                    }

                    guard let data = data, let httpResponse = response as? HTTPURLResponse else {
                        reject("500", "Invalid response or empty body", nil)
                        return
                    }

                    let buffer = [UInt8](data)
                    _ = outputStream.write(buffer, maxLength: buffer.count)

                    let totalSoFar = alreadyDownloaded + Int64(buffer.count)
                    StallionDownloadCacheManager.saveDownloadCache(path: downloadDirectory, bytes: totalSoFar)

                    let expected = (httpResponse.expectedContentLength > 0 ? httpResponse.expectedContentLength + alreadyDownloaded : totalSoFar)
                    let progress = Float(totalSoFar) / Float(expected)
                    if progress - self.lastSentProgress > StallionConstants.PROGRESS_EVENT_THRESHOLD {
                        self.lastSentProgress = progress
                        self._onProgress?(progress)
                    }

                    do {
                        try self.validateAndUnzip(downloadedZip: downloadedZip, destDirectory: downloadDirectory)
                        StallionDownloadCacheManager.deleteDownloadCache(path: downloadDirectory)
                    } catch {
                        reject("500", "Unzipping failed: \(error.localizedDescription)", error as NSError)
                    }
                }

                self.downloadTask?.resume()
            } catch {
                reject("500", "Error preparing for download: \(error.localizedDescription)", error as NSError)
            }
        }
    }

    private func prepareForDownload(downloadDirectory: String, alreadyDownloaded: Int64) throws -> URL {
        let downloadFolder = URL(fileURLWithPath: downloadDirectory, isDirectory: true)
        let fileManager = FileManager.default

        if fileManager.fileExists(atPath: downloadFolder.path), alreadyDownloaded == 0 {
            try fileManager.removeItem(at: downloadFolder)
        }

        try fileManager.createDirectory(at: downloadFolder, withIntermediateDirectories: true, attributes: nil)

        return downloadFolder.appendingPathComponent(StallionConstants.FilePaths.ZipFolderName).appendingPathExtension(StallionConstants.FilePaths.ZipExtension)
    }

    private func validateAndUnzip(downloadedZip: URL, destDirectory: String) throws {
        let fileManager = FileManager.default
        let destFolder = URL(fileURLWithPath: destDirectory, isDirectory: true)
        let otaBundle = destFolder.appendingPathComponent(StallionConstants.FilePaths.ZipFolderName).appendingPathComponent(StallionConstants.FilePaths.JSFileName)

        guard try isValidZip(downloadedZip: downloadedZip) else {
            throw NSError(domain: "Invalid ZIP file", code: 500)
        }

        try fileManager.unzipItem(at: downloadedZip, to: destFolder)

        guard fileManager.fileExists(atPath: otaBundle.path) else {
            throw NSError(domain: "Corrupted file error", code: 500)
        }

        try fileManager.removeItem(at: downloadedZip)
        self._resolve?(StallionConstants.DownloadPromiseResponses.Success)
    }

    private func isValidZip(downloadedZip: URL) throws -> Bool {
        let headerSize = 4
        guard let inputStream = InputStream(url: downloadedZip) else {
            throw NSError(domain: "Cannot open ZIP file", code: 500)
        }

        inputStream.open()
        defer { inputStream.close() }

        var header = [UInt8](repeating: 0, count: headerSize)
        let bytesRead = inputStream.read(&header, maxLength: headerSize)
        guard bytesRead == headerSize else { return false }
        return header == [0x50, 0x4B, 0x03, 0x04] // PKZIP magic number
    }
}
