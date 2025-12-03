//
//  StallionSyncHandler.swift
//  react-native-stallion
//
//  Created by Thor963 on 29/01/25.
//

import Foundation

class StallionSyncHandler {

    private static var isSyncInProgress = false
    private static var isDownloadInProgress = false
    private static let syncQueue = DispatchQueue(label: "com.stallion.syncQueue")

    static func sync() {
        var shouldProceed = false

        syncQueue.sync {
            if !isSyncInProgress {
                isSyncInProgress = true
                shouldProceed = true
            }
        }

        guard shouldProceed else { return }

          DispatchQueue.global().async {
              do {
                  // Fetch StallionStateManager and StallionConfig
                  let stateManager = StallionStateManager.sharedInstance()
                  guard let config = stateManager?.stallionConfig else {
                      completeSync()
                      return
                  }

                  // Use appVersion directly from StallionConfig
                  let appVersion = config.appVersion ?? ""
                  let projectId = config.projectId ?? ""
                  let uid = config.uid ?? ""
                  let appliedBundleHash = stateManager?.stallionMeta?.getActiveReleaseHash() ?? ""

                  // Prepare payload for API call
                  let requestPayload: [String: Any] = [
                      "appVersion": appVersion,
                      "platform": StallionConstants.PlatformValue,
                      "projectId": projectId,
                      "appliedBundleHash": appliedBundleHash,
                      "deviceMeta": StallionDeviceInfo.getDeviceMetaJson(config)
                  ]

                  // Make API call using URLSession
                  makeApiCall(payload: requestPayload, appVersion: appVersion)

              } catch {
                  completeSync()
                  emitSyncError(error)
              }
          }
      }

      private static func makeApiCall(payload: [String: Any], appVersion: String) {
          guard let url = URL(string: StallionConstants.STALLION_API_BASE + StallionConstants.STALLION_INFO_API_PATH) else {
              emitSyncError(NSError(domain: "Invalid URL", code: -1))
              return
          }

          var request = URLRequest(url: url)
          request.httpMethod = "POST"
          request.setValue("application/json", forHTTPHeaderField: "Content-Type")

          // Add tokens
          request.setValue(StallionStateManager.sharedInstance()?.stallionConfig?.appToken, forHTTPHeaderField: StallionConstants.STALLION_APP_TOKEN_KEY)
          request.setValue(StallionStateManager.sharedInstance()?.stallionConfig?.sdkToken, forHTTPHeaderField: StallionConstants.STALLION_SDK_TOKEN_KEY)
          request.setValue(StallionStateManager.sharedInstance()?.stallionConfig?.uid, forHTTPHeaderField: StallionConstants.STALLION_UID_KEY)

          // Convert payload to JSON
          do {
              let jsonData = try JSONSerialization.data(withJSONObject: payload, options: [])
              request.httpBody = jsonData
          } catch {
              completeSync()
              emitSyncError(error)
              return
          }

          let task = URLSession.shared.dataTask(with: request) { data, response, error in
              if let error = error {
                  completeSync()
                  emitSyncError(error)
                  return
              }
            
              guard let data = data, let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                  completeSync()
                  let responseError = NSError(domain: "Invalid response from server", code: -2)
                  emitSyncError(responseError)
                  return
              }

              // Parse the JSON response
              do {
                  if let releaseMeta = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                      completeSync()
                      processReleaseMeta(releaseMeta, appVersion: appVersion)
                  } else {
                      completeSync()
                      let parsingError = NSError(domain: "Invalid JSON format", code: -3)
                      emitSyncError(parsingError)
                  }
              } catch {
                  completeSync()
                  emitSyncError(error)
              }
          }

          task.resume()
      }
    
    private static func completeSync() {
        syncQueue.sync {
            isSyncInProgress = false
        }
    }
  
    private static func processReleaseMeta(_ releaseMeta: [String: Any], appVersion: String) {
        guard let success = releaseMeta["success"] as? Bool, success else { return }
        guard let data = releaseMeta["data"] as? [String: Any] else { return }

        if let appliedBundleData = data["appliedBundleData"] as? [String: Any] {
            handleAppliedReleaseData(appliedBundleData, appVersion: appVersion)
        }

        if let newBundleData = data["newBundleData"] as? [String: Any] {
            handleNewReleaseData(newBundleData)
        }
    }

    private static func handleAppliedReleaseData(_ appliedData: [String: Any], appVersion: String) {
        guard let isRolledBack = appliedData["isRolledBack"] as? Bool,
              let targetAppVersion = appliedData["targetAppVersion"] as? String else { return }

        if isRolledBack && appVersion == targetAppVersion {
          StallionSlotManager.rollbackProd(withAutoRollback: false, errorString: "")
        }
    }

    private static func handleNewReleaseData(_ newReleaseData: [String: Any]) {
        guard let newReleaseUrl = newReleaseData["downloadUrl"] as? String,
              let newReleaseHash = newReleaseData["checksum"] as? String,
              !newReleaseUrl.isEmpty,
              !newReleaseHash.isEmpty else { return }

        // Extract diffData if it exists
        var diffUrl: String? = nil
        var isBundlePatched: Bool = false
        var bundleDiffId: String? = nil
        if let diffData = newReleaseData["bundleDiff"] as? [String: Any] {
            if let extractedDiffUrl = diffData["url"] as? String,
               !extractedDiffUrl.isEmpty {
                diffUrl = extractedDiffUrl
            }
            isBundlePatched = diffData["isBundlePatched"] as? Bool ?? false
            if let extractedId = diffData["id"] as? String,
               !extractedId.isEmpty {
                bundleDiffId = extractedId
            }
        }

        let stateManager = StallionStateManager.sharedInstance()
        let lastRolledBackHash = stateManager?.stallionMeta?.getLastRolledBackHash() ?? ""
        let lastUnverifiedHash = stateManager?.stallionConfig?.lastUnverifiedHash ?? ""

        if newReleaseHash != lastRolledBackHash && newReleaseHash != lastUnverifiedHash {
            if stateManager?.isMounted == true {
                downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: newReleaseUrl, diffUrl: diffUrl, isBundlePatched: isBundlePatched, bundleDiffId: bundleDiffId)
            } else {
              stateManager?.pendingReleaseUrl = newReleaseUrl
              stateManager?.pendingReleaseHash = newReleaseHash
              stateManager?.pendingReleaseDiffUrl = diffUrl
              stateManager?.pendingReleaseIsBundlePatched = isBundlePatched
              stateManager?.pendingReleaseBundleDiffId = bundleDiffId
            }
        }
    }

    // Overloaded method for backward compatibility
    static func downloadNewRelease(newReleaseHash: String, newReleaseUrl: String) {
        downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: newReleaseUrl, diffUrl: nil, isBundlePatched: false, bundleDiffId: nil)
    }

    // Overloaded method for backward compatibility
    static func downloadNewRelease(newReleaseHash: String, newReleaseUrl: String, diffUrl: String?) {
        downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: newReleaseUrl, diffUrl: diffUrl, isBundlePatched: false, bundleDiffId: nil)
    }

    // Overloaded method for backward compatibility
    static func downloadNewRelease(newReleaseHash: String, newReleaseUrl: String, diffUrl: String?, isBundlePatched: Bool) {
        downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: newReleaseUrl, diffUrl: diffUrl, isBundlePatched: isBundlePatched, bundleDiffId: nil)
    }

    static func downloadNewRelease(newReleaseHash: String, newReleaseUrl: String, diffUrl: String?, isBundlePatched: Bool, bundleDiffId: String?) {
        guard let stateManager = StallionStateManager.sharedInstance(),
              let config = stateManager.stallionConfig else { return }
      
        var shouldDownload = false
        syncQueue.sync {
            if !isDownloadInProgress {
                isDownloadInProgress = true
                shouldDownload = true
            }
        }
        guard shouldDownload else { return }

      let downloadPath = config.filesDirectory + "/" + StallionConstants.PROD_DIRECTORY + "/" + StallionConstants.TEMP_FOLDER_SLOT
      let projectId = config.projectId ?? ""
      
      // Use diffUrl if it exists, otherwise use newReleaseUrl
      let urlToDownload = (diffUrl != nil && !diffUrl!.isEmpty) ? diffUrl! : newReleaseUrl
      let publicSigningKey = config.publicSigningKey ?? ""
      
      // Track if this is a diff download
      let isDiffDownload = (diffUrl != nil && !diffUrl!.isEmpty)
      // Store original newReleaseUrl for potential retry
      let originalNewReleaseUrl = newReleaseUrl
      // Store isBundlePatched flag for patch handler
      let isBundlePatchedFlag = isBundlePatched
      // Store bundleDiffId for events
      let bundleDiffIdForEvents = bundleDiffId
      
      guard let fromUrl = URL(string: urlToDownload + "?projectId=" + projectId) else { return }

      emitDownloadStarted(releaseHash: newReleaseHash, bundleDiffId: bundleDiffIdForEvents)

      StallionFileDownloader().downloadBundle(
        url: fromUrl,
        downloadDirectory: downloadPath,
        onProgress: { progress in
          emitDownloadProgress(releaseHash: newReleaseHash, progress: progress)
        },
        resolve: { _ in
          completeDownload()
          
          // If this was a diff download, handle patch
          if isDiffDownload {
              // Get base bundle path from current slot
              guard let slotPath = stateManager.stallionMeta?.getCurrentProdSlotPath() else {
                  // No valid slot path (e.g., default slot), skip patch and retry with full bundle
                  StallionFileManager.deleteFileOrFolderSilently(downloadPath)
                  downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: originalNewReleaseUrl, diffUrl: nil, isBundlePatched: false, bundleDiffId: nil)
                  return
              }
              
              do {
                  let baseBundlePath = config.filesDirectory + "/" + StallionConstants.PROD_DIRECTORY + "/" + slotPath
                  
                  // Invoke patch handler with isBundlePatched flag
                  try StallionPatchHandler.applyPatch(baseBundlePath: baseBundlePath, diffPath: downloadPath, isBundlePatched: isBundlePatchedFlag)
              } catch {
                  // Patch application failed, retry with full bundle download
                  // Clean up the failed diff download
                  StallionFileManager.deleteFileOrFolderSilently(downloadPath)
                  // Retry download with full bundle (no diffUrl)
                  downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: originalNewReleaseUrl, diffUrl: nil, isBundlePatched: false, bundleDiffId: nil)
                  return
              }
          }
          
          if(publicSigningKey != nil && !publicSigningKey.isEmpty) {
            if(
              !StallionSignatureVerification.verifyReleaseSignature(
                downloadedBundlePath: downloadPath + "/" + StallionConstants.FilePaths.ZipFolderName,
                publicKeyPem: publicSigningKey
              )
            ) {
              // discard downloaded release
             config.updateLastUnverifiedHash(newReleaseHash)
              emitSignatureVerificationFailed(releaseHash: newReleaseHash)
              StallionFileManager.deleteFileOrFolderSilently(downloadPath)
              return;
            }
          }
          stateManager.stallionMeta?.currentProdSlot =  SlotStates.newSlot
          stateManager.stallionMeta?.prodTempHash =  newReleaseHash
          if let currentProdNewHash = stateManager.stallionMeta?.prodNewHash,
             !currentProdNewHash.isEmpty {
              StallionSlotManager.stabilizeProd()
          }
          stateManager.syncStallionMeta()
          emitDownloadSuccess(releaseHash: newReleaseHash, bundleDiffId: bundleDiffIdForEvents)
        },
        reject: { code, prefix, error  in
          completeDownload()
          emitDownloadError(
            releaseHash: newReleaseHash,
            error: "\(String(describing: prefix))\(String(describing: error))"
          )
        }
      )
  }
    
    private static func completeDownload() {
        syncQueue.sync {
            isDownloadInProgress = false
        }
    }

    // MARK: - Event Emission

    private static func emitSyncError(_ error: Error) {
      let syncErrorPayload: NSDictionary = ["meta": error.localizedDescription]
      Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesProd.SYNC_ERROR_PROD,
                             eventBody: syncErrorPayload,
                             shouldCache: true
      )
    }

    private static func emitDownloadError(releaseHash: String, error: String) {
        let errorPayload: NSDictionary = [
            "releaseHash": releaseHash,
            "meta": error
        ]
      Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesProd.DOWNLOAD_ERROR_PROD,
                             eventBody: errorPayload,
                             shouldCache: true
      )
    }

    private static func emitDownloadSuccess(releaseHash: String, bundleDiffId: String?) {
      var successPayload: [String: Any] = ["releaseHash": releaseHash]
      if let bundleDiffId = bundleDiffId, !bundleDiffId.isEmpty {
          successPayload["diffId"] = bundleDiffId
      }
      Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesProd.DOWNLOAD_COMPLETE_PROD,
                             eventBody: successPayload as NSDictionary,
                             shouldCache: true
      )
    }

    private static func emitDownloadStarted(releaseHash: String, bundleDiffId: String?) {
        var startedPayload: [String: Any] = ["releaseHash": releaseHash]
        if let bundleDiffId = bundleDiffId, !bundleDiffId.isEmpty {
            startedPayload["diffId"] = bundleDiffId
        }
        Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesProd.DOWNLOAD_STARTED_PROD,
                             eventBody: startedPayload as NSDictionary,
                             shouldCache: true
      )
    }
  
    private static func emitSignatureVerificationFailed(releaseHash: String) {
      let verificationFailurePayload: NSDictionary = ["releaseHash": releaseHash]
      Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesProd.SIGNATURE_VERIFICATION_FAILED,
                             eventBody: verificationFailurePayload,
                             shouldCache: true
      )
    }

    private static func emitDownloadProgress(releaseHash: String, progress: Float) {
        let progressPayload: NSDictionary = [
            "releaseHash": releaseHash,
            "progress": "\(progress)"
        ]
        Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesProd.DOWNLOAD_PROGRESS_PROD,
                               eventBody: progressPayload,
                               shouldCache: false
        )
    }
}

