//
//  StallionFileDownloader.swift
//  react-native-stallion
//
//  Updated by Thor963 on 17/05/23.
//

import Foundation
import ZIPFoundation

class StallionFileDownloader: NSObject {
    private lazy var urlSession = URLSession(configuration: .default,
                                             delegate: self,
                                             delegateQueue: nil)
    private var downloadTask: URLSessionDownloadTask?
    private var _resolve: RCTPromiseResolveBlock?
    private var _reject: RCTPromiseRejectBlock?
    private var _onProgress: ((Float) -> Void)?
    private var lastSentProgress: Float = 0
    private var _downloadDirectory: String?
    
    private let queue = DispatchQueue(label: "com.stallion.networkmanager", qos: .background)

    override init() {
        super.init()
    }

    func downloadBundle(url: URL, downloadDirectory: String, onProgress: @escaping ((Float) -> Void), resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        queue.async {
            do {
                self._resolve = resolve
                self._reject = reject
                self._onProgress = onProgress
                self._downloadDirectory = downloadDirectory
                
                // Prepare for download
                let downloadedZip = try self.prepareForDownload(downloadDirectory: downloadDirectory)
                
                // Create request
                var request = URLRequest(url: url)
                request.httpMethod = "GET"
              
                let appToken = StallionStateManager.sharedInstance().stallionConfig.appToken ?? ""
                let sdkToken = StallionStateManager.sharedInstance().stallionConfig.sdkToken ?? ""
                
                if !appToken.isEmpty {
                    request.setValue(appToken, forHTTPHeaderField: StallionConstants.STALLION_APP_TOKEN_KEY)
                }
                if !sdkToken.isEmpty {
                    request.setValue(sdkToken, forHTTPHeaderField: StallionConstants.STALLION_SDK_TOKEN_KEY)
                }
                
                // Initiate download
                self.downloadTask = self.urlSession.downloadTask(with: request)
                self.downloadTask?.resume()
                
            } catch {
                reject("500", "Error preparing for download: \(error.localizedDescription)", error as NSError)
            }
        }
    }
    
    private func prepareForDownload(downloadDirectory: String) throws -> URL {
        let downloadFolder = URL(fileURLWithPath: downloadDirectory, isDirectory: true)
        let fileManager = FileManager.default
        
        // Delete existing folder if it exists
        if fileManager.fileExists(atPath: downloadFolder.path) {
            try fileManager.removeItem(at: downloadFolder)
        }
        
        // Create new download folder
        try fileManager.createDirectory(at: downloadFolder, withIntermediateDirectories: true, attributes: nil)
        
        // Return path to zip file
        return downloadFolder.appendingPathComponent(StallionConstants.FilePaths.ZipFolderName).appendingPathExtension(StallionConstants.FilePaths.ZipExtension)
    }
    
    private func validateAndUnzip(downloadedZip: URL, destDirectory: String) throws {
        let fileManager = FileManager.default
        let destFolder = URL(fileURLWithPath: destDirectory, isDirectory: true)
      let otaBundle = destFolder.appendingPathComponent(StallionConstants.FilePaths.ZipFolderName).appendingPathComponent(StallionConstants.FilePaths.JSFileName)
        
        // Validate the ZIP file
        guard try isValidZip(downloadedZip: downloadedZip) else {
            throw NSError(domain: "Invalid ZIP file", code: 500)
        }
        
        // Unzip the file
        try fileManager.unzipItem(at: downloadedZip, to: destFolder)
        
        // Verify that the extracted bundle exists
        guard fileManager.fileExists(atPath: otaBundle.path) else {
            throw NSError(domain: "Corrupted file error", code: 500)
        }
        
        // Clean up the ZIP file
        try fileManager.removeItem(at: downloadedZip)
        
        self._resolve?(StallionConstants.DownloadPromiseResponses.Success)
    }
    
    private func isValidZip(downloadedZip: URL) throws -> Bool {
        let fileManager = FileManager.default
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

extension StallionFileDownloader: URLSessionDownloadDelegate {
    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didWriteData bytesWritten: Int64, totalBytesWritten: Int64, totalBytesExpectedToWrite: Int64) {
        let progress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
      if progress - self.lastSentProgress > StallionConstants.PROGRESS_EVENT_THRESHOLD {
            self.lastSentProgress = progress
            self._onProgress?(progress)
        }
    }
    
    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
        do {
          if let downloadDirectory = self._downloadDirectory {
            try self.validateAndUnzip(downloadedZip: location, destDirectory: downloadDirectory)
          } else {
            throw NSError(domain: "Destination folder not found while unzipping", code: 500)
          }
        } catch {
            self._reject?("500", "File validation/unzipping failed: \(error.localizedDescription)", error as NSError)
        }
    }
    
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if let error = error {
            self._reject?("500", "Network error: \(error.localizedDescription)", error as NSError)
        }
    }
}
