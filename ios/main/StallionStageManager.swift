//
//  StallionStageManager.swift
//  react-native-stallion
//
//  Created by Jasbir Singh Shergill on 29/01/25.
//

import Foundation

@objc(StallionStageManager)
class StallionStageManager: NSObject {
    
  @objc static func downloadStageBundle(bundleInfo: NSDictionary, promise: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        guard
            let receivedDownloadUrl = bundleInfo["url"] as? String,
            !receivedDownloadUrl.isEmpty,
            let receivedHash = bundleInfo["hash"] as? String,
            !receivedHash.isEmpty
        else {
            rejecter("INVALID_INPUT", "Invalid or missing download URL or hash.", nil)
            return
        }
        
        guard let stallionStateManager = StallionStateManager.sharedInstance() else {
            rejecter("STATE_MANAGER_ERROR", "Unable to fetch StallionStateManager instance.", nil)
            return
        }
        
      let downloadPath = "\(String(describing: stallionStateManager.stallionConfig.filesDirectory))\(StallionConstants.STAGE_DIRECTORY)\(StallionConstants.TEMP_FOLDER_SLOT)"
        
        StallionFileDownloader().downloadBundle(
            url: URL(string: receivedDownloadUrl)!,
            downloadDirectory: downloadPath,
            onProgress: { progress in
                emitDownloadProgressStage(releaseHash: receivedHash, progress: progress)
            },
            resolve: { successPayload in
                stallionStateManager.stallionMeta.currentStageSlot = SlotStates.newSlot
                stallionStateManager.stallionMeta.stageTempHash = receivedHash
                stallionStateManager.syncStallionMeta()
                emitDownloadSuccessStage(releaseHash: receivedHash)
                promise(successPayload)
            },
            reject: { code, prefix, error in
                let errorMessage = "\(prefix ?? "") \(error?.localizedDescription ?? "Unknown error")"
                rejecter(code, errorMessage, error)
            }
        )
    }
    
    private static func emitDownloadSuccessStage(releaseHash: String) {
        let successPayload: [String: Any] = [
            "releaseHash": releaseHash
        ]
        StallionEventHandler.sharedInstance().sendEventWithoutCaching(
          StallionConstants.NativeEventTypesStage.DOWNLOAD_COMPLETE_STAGE,
            eventPayload: successPayload
        )
    }
    
    private static func emitDownloadProgressStage(releaseHash: String, progress: Float) {
        let progressPayload: [String: Any] = [
            "releaseHash": releaseHash,
            "progress": "\(progress)"
        ]
        StallionEventHandler.sharedInstance().sendEventWithoutCaching(
          StallionConstants.NativeEventTypesStage.DOWNLOAD_PROGRESS_STAGE,
            eventPayload: progressPayload
        )
    }
}
