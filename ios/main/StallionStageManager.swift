//
//  StallionStageManager.swift
//  react-native-stallion
//
//  Created by Thor963 on 29/01/25.
//

import Foundation

@objc(StallionStageManager)
class StallionStageManager: NSObject {
    
    @objc static func downloadStageBundle(bundleInfo: NSDictionary, promise: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        // Validate input parameters
        guard let receivedDownloadUrl = bundleInfo["url"] as? String,
              !receivedDownloadUrl.isEmpty,
              let receivedHash = bundleInfo["hash"] as? String,
              !receivedHash.isEmpty else {
            rejecter("INVALID_INPUT", "Invalid or missing download URL or hash.", nil)
            return
        }
        
        // Ensure StallionStateManager instance exists
        guard let stallionStateManager = StallionStateManager.sharedInstance() else {
            rejecter("STATE_MANAGER_ERROR", "Unable to fetch StallionStateManager instance.", nil)
            return
        }
        
        // Construct the download path
        let downloadPath = (stallionStateManager.stallionConfig.filesDirectory ?? "") + "/" + StallionConstants.STAGE_DIRECTORY + "/" + (StallionConstants.TEMP_FOLDER_SLOT);
        
        // Capture resolve/reject methods to avoid escaping issues
        let resolveClosure: (Any?) -> Void = { result in
            DispatchQueue.main.async {
                promise(result)
            }
        }
        
        let rejectClosure: (String?, String, Error?) -> Void = { code, message, error in
            DispatchQueue.main.async {
                rejecter(code, message, error)
            }
        }
        
        emitDownloadStartedStage(releaseHash: receivedHash)
        let downloadStartMs = Int(Date().timeIntervalSince1970 * 1000)
      
        // Start bundle download
        StallionFileDownloader().downloadBundle(
            url: URL(string: receivedDownloadUrl)!,
            downloadDirectory: downloadPath,
            onProgress: { progress in
                emitDownloadProgressStage(releaseHash: receivedHash, progress: progress)
            },
            resolve: { _ in
                let downloadTimeMs = Int(Date().timeIntervalSince1970 * 1000) - downloadStartMs
                stallionStateManager.stallionMeta.currentStageSlot = SlotStates.newSlot
                stallionStateManager.stallionMeta.stageTempHash = receivedHash
                stallionStateManager.syncStallionMeta()
                emitDownloadSuccessStage(releaseHash: receivedHash, downloadTimeMs: downloadTimeMs)
                resolveClosure("Stage download success")
            },
            reject: { code, prefix, error in
                let errorMessage = "\(prefix ?? "") \(error?.localizedDescription ?? "Unknown error")"
                emitDownloadErrorStage(releaseHash: receivedHash, error: errorMessage)
                rejectClosure(code, errorMessage, error)
            }
        )
    }
    
    // MARK: - Event Emitters
  
  private static func emitDownloadErrorStage(releaseHash: String, error: String) {
      let errorPayload: NSDictionary = [
          "releaseHash": releaseHash,
          "meta": error
      ]
    Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesStage.DOWNLOAD_ERROR_STAGE,
                           eventBody: errorPayload,
                           shouldCache: true
    )
  }
    
    private static func emitDownloadSuccessStage(releaseHash: String, downloadTimeMs: Int) {
      var successPayload: [String: Any] = ["releaseHash": releaseHash]
      if let metaData = try? JSONSerialization.data(withJSONObject: ["downloadTime": downloadTimeMs]),
         let metaString = String(data: metaData, encoding: .utf8) {
          successPayload["meta"] = metaString
      }
      Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesStage.DOWNLOAD_COMPLETE_STAGE,eventBody: successPayload as NSDictionary,
                             shouldCache: true
      )
    }
    
    private static func emitDownloadProgressStage(releaseHash: String, progress: Float) {
        let progressPayload: NSDictionary = [
            "releaseHash": releaseHash,
            "progress": "\(progress)"
        ]
      Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesStage.DOWNLOAD_PROGRESS_STAGE, eventBody: progressPayload,
                             shouldCache: false
      )
    }
  private static func emitDownloadStartedStage(releaseHash: String) {
      let startedPayload: NSDictionary = ["releaseHash": releaseHash]
    Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesStage.DOWNLOAD_STARTED_STAGE,
                           eventBody: startedPayload,
                           shouldCache: true
    )
  }
}
