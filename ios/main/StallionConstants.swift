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
        static let AccessKey = "x-sdk-access-token"
        static let ContentType = "Content-Type"
    }
    public struct DownloadReqBodyKeys {
        static let DownloadUrl = "url"
        static let BucketId = "bucketId"
        static let Version = "version"
        static let Platform = "platform"
        static let ProjectId = "projectId"
    }
    static let PlatformValue = "ios"
    static let DownloadApiUrl = "https://stallion-api.redhorse.tech/api/v1/bundle/download"
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
    static let DOWNLOAD_PROGRESS_EVENT = "StallionDownloadProgress";
    static let PROGRESS_EVENT_THRESHOLD: Float = 0.05;
}
