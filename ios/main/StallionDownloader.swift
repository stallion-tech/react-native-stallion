//
//  StallionDownloader.swift
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//
import Foundation
import ZIPFoundation

class StallionDownloader {
    private var downloadProgressObservation: NSKeyValueObservation?
    class func load(url: URL, reqBody: [String: Any], completion: @escaping () -> (), onError: @escaping (_ errorString: String) -> Void) {
        do {
            let tempDownloadDirectory = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
                .appendingPathComponent(StallionConstants.FilePaths.DownloadDirectory, isDirectory: true)
            
            if !FileManager.default.fileExists(atPath: tempDownloadDirectory.path) {
                try FileManager.default.createDirectory(atPath: tempDownloadDirectory.path, withIntermediateDirectories: true, attributes: nil)
            }
            
            let finalDestinationDirectory = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
                .appendingPathComponent(StallionConstants.FilePaths.TargetDirectory, isDirectory: true)
            
            let downloadedBuildDirectory = tempDownloadDirectory.appendingPathComponent(StallionConstants.FilePaths.ZipFolderName, isDirectory: true)
            
            let downloadedZipFilePath = tempDownloadDirectory.appendingPathComponent(StallionConstants.FilePaths.ZipFolderName, isDirectory: false).appendingPathExtension(StallionConstants.FilePaths.ZipExtension)
            
            let sessionConfig = URLSessionConfiguration.default
            let session = URLSession(configuration: sessionConfig)

            let jsonData = try? JSONSerialization.data(withJSONObject: reqBody)
            
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.httpBody = jsonData

            
            request.setValue(StallionConstants.apiKey, forHTTPHeaderField: StallionConstants.HeaderKeys.ApiKey)
            request.setValue(StallionConstants.secretKey, forHTTPHeaderField: StallionConstants.HeaderKeys.SecretKey)
            request.setValue("application/json", forHTTPHeaderField: StallionConstants.HeaderKeys.ContentType)
            let task = session.downloadTask(with: request) { (tempLocalUrl, response, error) in
                if let tempLocalUrl = tempLocalUrl, error == nil {
                    // Success
                    if ((response as? HTTPURLResponse)?.statusCode == 200) {
                        do {
                            let fileManager = FileManager()
                            
                            // if zip already exists, delete the zip
                            if FileManager.default.fileExists(atPath: downloadedZipFilePath.path) {
                                try fileManager.removeItem(at: downloadedZipFilePath)
                            }
                            try FileManager.default.copyItem(at: tempLocalUrl, to: downloadedZipFilePath)
                            
                            // if build already exists in download folder, delete it
                            if FileManager.default.fileExists(atPath: downloadedBuildDirectory.path) {
                                try fileManager.removeItem(at: downloadedBuildDirectory)
                            }
                            try fileManager.unzipItem(at: downloadedZipFilePath, to: tempDownloadDirectory, skipCRC32: false, progress: nil, preferredEncoding: nil)
                            try fileManager.removeItem(at: downloadedZipFilePath)
                            
                            // if build exists in final destination, ovverride it
                            if FileManager.default.fileExists(atPath: finalDestinationDirectory.path) {
                                try fileManager.removeItem(at: finalDestinationDirectory)
                            }
                            try fileManager.moveItem(at: tempDownloadDirectory, to: finalDestinationDirectory)
                            completion()
                        } catch {
                            onError(StallionConstants.DownloadPromiseResponses.FileSystemError)
                        }
                    } else {
                        onError(StallionConstants.DownloadPromiseResponses.ApiError)
                    }
                } else {
                    onError(StallionConstants.DownloadPromiseResponses.InitError)
                }
            }
            task.resume()
        } catch {
            onError(StallionConstants.DownloadPromiseResponses.DirectoryInitError)
        }
    }
}

