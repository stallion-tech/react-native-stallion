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
        static let JSFileName = "main.jsbundle"
    }
    public struct DownloadReqBodyKeys {
        static let DownloadUrl = "url"
        static let Hash = "hash"
    }
    static let PlatformValue = "ios"
    public struct DownloadPromiseResponses {
        static let Success = "Success"
        static let GenericError = "Something went wrong internally"
        static let FileSystemError = "File system error"
        static let ApiError = "Download api error"
        static let InitError = "Download initialisation error"
        static let DirectoryInitError = "Directory initialisation error"
        static let SyncApiError = "Sync api error"
    }
    public struct AuthTokens {
        static let ApiKey = "apiKey"
        static let SecretKey = "secretKey"
    }
    static let PROGRESS_EVENT_THRESHOLD: Float = 0.05;
    static let PROGRESS_THROTTLE_INTERVAL_MS: TimeInterval = 0.3; // 300ms
  
    static let PROD_DIRECTORY = "StallionProd"
    static let STAGE_DIRECTORY = "StallionStage"
    static let TEMP_FOLDER_SLOT = "temp"
    static let NEW_FOLDER_SLOT = "StallionNew"
    static let STABLE_FOLDER_SLOT = "StallionStable"
    static let DEFAULT_FOLDER_SLOT = "Default"

    static let CURRENT_PROD_SLOT_KEY = "stallionProdCurrentSlot"
    static let CURRENT_STAGE_SLOT_KEY = "stallionStageCurrentSlot"
    static let STALLION_API_BASE = "https://preprod-api.stalliontech.io"
    static let STALLION_INFO_API_PATH = "/api/v1/promoted/get-update-meta"
    static let STALLION_PROJECT_ID_IDENTIFIER = "StallionProjectId"
    static let STALLION_APP_TOKEN_IDENTIFIER = "StallionAppToken"
    static let APP_VERION_IDENTIFIER = "CFBundleShortVersionString"
    static let STALLION_APP_TOKEN_KEY = "x-app-token"
    static let STALLION_SDK_TOKEN_KEY = "x-sdk-pin-access-token"
    static let STALLION_UID_KEY = "uid"
    static let UNIQUE_ID_IDENTIFIER = "stallionDeviceId"

    static let NEW_RELEASE_HASH_ID = "stallionNewReleaseHash"
    static let NEW_RELEASE_URL_ID = "stallionNewReleaseUrl"
  
    static let STALLION_SWITCH_STATE_IDENTIFIER = "switchState";
    static let LAST_ROLLED_BACK_RELEASE_HASH_KEY = "LAST_ROLLED_BACK_RELEASE_HASH";
  
    static let APP_VERION_EVENT_KEY = "AppVersion"

    public struct SwitchState {
      static let PROD = "PROD"
      static let STAGE = "STAGE"
    }
  
    static let STALLION_NATIVE_EVENT_NAME = "STALLION_NATIVE_EVENT"
    public struct NativeEventTypesProd {
      static let DOWNLOAD_STARTED_PROD = "DOWNLOAD_STARTED_PROD"
      static let DOWNLOAD_ERROR_PROD = "DOWNLOAD_ERROR_PROD"
      static let DOWNLOAD_PROGRESS_PROD = "DOWNLOAD_PROGRESS_PROD"
      static let DOWNLOAD_COMPLETE_PROD = "DOWNLOAD_COMPLETE_PROD"
      static let SYNC_ERROR_PROD = "SYNC_ERROR_PROD"
      static let ROLLED_BACK_PROD = "ROLLED_BACK_PROD"
      static let INSTALLED_PROD = "INSTALLED_PROD"
      static let STABILIZED_PROD = "STABILIZED_PROD"
      static let EXCEPTION_PROD = "EXCEPTION_PROD"
      static let SIGNATURE_VERIFICATION_FAILED = "SIGNATURE_VERIFICATION_FAILED"
    }
    public struct NativeEventTypesStage {
      static let DOWNLOAD_STARTED_STAGE = "DOWNLOAD_STARTED_STAGE"
      static let DOWNLOAD_ERROR_STAGE = "DOWNLOAD_ERROR_STAGE"
      static let DOWNLOAD_PROGRESS_STAGE = "DOWNLOAD_PROGRESS_STAGE"
      static let DOWNLOAD_COMPLETE_STAGE = "DOWNLOAD_COMPLETE_STAGE"
      static let INSTALLED_STAGE = "INSTALLED_STAGE"
      static let EXCEPTION_STAGE = "EXCEPTION_STAGE"
    }
}
