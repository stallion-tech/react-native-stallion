//
//  StallionConstants.swift
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//

import Foundation

class StallionConstants {
    public struct FilePaths {
        static let DownloadDirectory = "StallionDownload"
        static let TargetDirectory = "StallionPackage"
        static let ZipFolderName = "build"
        static let ZipExtension = "zip"
    }
    public struct HeaderKeys {
        static let ApiKey = "api-key"
        static let SecretKey = "secret-key"
        static let ContentType = "Content-Type"
    }
    public struct DownloadReqBodyKeys {
        static let BucketId = "bucketId"
        static let Version = "version"
        static let Platform = "platform"
    }
    static let PlatformValue = "ios"
    static let DownloadApiUrl = "https://api.di-gi.in/api/v1/client/bundle/download"
    public struct DownloadPromiseResponses {
        static let Success = "Success"
        static let GenericError = "Something went wrong internally"
        static let FileSystemError = "File system error"
        static let ApiError = "Download api error"
        static let InitError = "Download initialisation error"
        static let DirectoryInitError = "Directory initialisation error"
    }
    public struct AuthTokens {
        static let ApiKey = "apiKey"
        static let SecretKey = "secretKey"
    }
    static let apiKey = Bundle.main.object(forInfoDictionaryKey: "StallionApiKey") as? String
    static let secretKey = Bundle.main.object(forInfoDictionaryKey: "StallionSecretKey") as? String
    static let DOWNLOAD_PROGRESS_EVENT = "StallionDownloadProgress";
}
