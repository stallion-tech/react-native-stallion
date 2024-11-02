//
//  StallionDownloader.swift
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//
import Foundation
import ZIPFoundation

class StallionDownloader: NSObject {
    
  private lazy var urlSession = URLSession(configuration: .default,
                                                 delegate: self,
                                                 delegateQueue: nil)
  var downloadTask : URLSessionDownloadTask?;
  var _downloadPaths: [String] = [];
    
  var _resolve: RCTPromiseResolveBlock?;
  var _reject: RCTPromiseRejectBlock?;
  var _onProgress: ((Float) -> Void)?
  var lastSentProgress: Float = 0;
    
  override init() {
      super.init()
  }

  func load(url: URL, downloadPaths: [String], onProgress: @escaping ((Float) -> Void), resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) throws {
        self._resolve = resolve
        self._reject = reject
        self._downloadPaths = downloadPaths
        self._onProgress = onProgress
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"

        let sdkToken = StallionSyncManager.getSdkToken()

        request.setValue(StallionSyncManager.getAppToken(), forHTTPHeaderField: StallionConstants.STALLION_APP_TOKEN_KEY)
        if(!sdkToken.isEmpty) {
            request.setValue(sdkToken, forHTTPHeaderField: StallionConstants.STALLION_SDK_TOKEN_KEY)
        }
        let task = urlSession.downloadTask(with: request)
        task.resume()
        self.downloadTask = task
      }
}

extension StallionDownloader: URLSessionDownloadDelegate {

    func urlSession(_ session: URLSession,
                    downloadTask: URLSessionDownloadTask,
                    didWriteData bytesWritten: Int64,
                    totalBytesWritten: Int64,
                    totalBytesExpectedToWrite: Int64) {
        if downloadTask == self.downloadTask {
            let calculatedProgress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
            if((calculatedProgress - self.lastSentProgress) > StallionConstants.PROGRESS_EVENT_THRESHOLD) {
                self.lastSentProgress = calculatedProgress
                self._onProgress?(calculatedProgress)
            }
        }
    }
    
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        guard error != nil else { return }
        self._reject?("500", StallionConstants.DownloadPromiseResponses.ApiError, NSError(domain: StallionConstants.DownloadPromiseResponses.ApiError, code: 500))
    }
    
    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask,
                    didFinishDownloadingTo location: URL) {
        let response = downloadTask.response as? HTTPURLResponse
        if (response?.statusCode == 200) {
            do  {
              let documentFolderPath = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
              let finalDestinationDirectory = self._downloadPaths.reduce(documentFolderPath, { url, pathComponent in
                url.appendingPathComponent(String(pathComponent), isDirectory: true)
              })
              
                if !FileManager.default.fileExists(atPath: finalDestinationDirectory.path) {
                    try FileManager.default.createDirectory(atPath: finalDestinationDirectory.path, withIntermediateDirectories: true, attributes: nil)
                }
                
              let downloadedBuildDirectory = finalDestinationDirectory.appendingPathComponent(StallionConstants.FilePaths.ZipFolderName, isDirectory: true)
                
                let downloadedZipFilePath = finalDestinationDirectory.appendingPathComponent(StallionConstants.FilePaths.ZipFolderName, isDirectory: false).appendingPathExtension(StallionConstants.FilePaths.ZipExtension)
            
                let fileManager = FileManager()
                
                // if zip already exists, delete the zip
                if FileManager.default.fileExists(atPath: downloadedZipFilePath.path) {
                    try fileManager.removeItem(at: downloadedZipFilePath)
                }
                try FileManager.default.copyItem(at: location, to: downloadedZipFilePath)
                
                // if build already exists in download folder, delete it
                if FileManager.default.fileExists(atPath: downloadedBuildDirectory.path) {
                    try fileManager.removeItem(at: downloadedBuildDirectory)
                }
              try fileManager.unzipItem(at: downloadedZipFilePath, to: finalDestinationDirectory, skipCRC32: false, progress: nil, pathEncoding: nil)
                try fileManager.removeItem(at: downloadedZipFilePath)
                self._resolve?(StallionConstants.DownloadPromiseResponses.Success)
            } catch {
                // throw exception here
                let errorString = StallionConstants.DownloadPromiseResponses.FileSystemError
                self._reject?("500", errorString, NSError(domain: errorString, code: 500))
            }
        } else {
            self._reject?("500", StallionConstants.DownloadPromiseResponses.GenericError, NSError(domain: StallionConstants.DownloadPromiseResponses.GenericError, code: 500))
        }
    }
}
