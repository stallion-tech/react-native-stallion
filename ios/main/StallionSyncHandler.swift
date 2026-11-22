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

    private static func debug(_ message: String) {
        NSLog("StallionDebug: %@", message)
    }

    static func sync() {
        var shouldProceed = false

        syncQueue.sync {
            if !isSyncInProgress {
                isSyncInProgress = true
                shouldProceed = true
            }
        }

        guard shouldProceed else {
            debug("sync skipped, already in progress")
            return
        }
        debug("sync started")

          DispatchQueue.global().async {
              do {
                  // Fetch StallionStateManager and StallionConfig
                  let stateManager = StallionStateManager.sharedInstance()
                  guard let config = stateManager?.stallionConfig else {
                      debug("sync aborted, config missing")
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
                  debug("sync failed: \(error.localizedDescription)")
                  completeSync()
                  emitSyncError(error)
              }
          }
      }

      private static func makeApiCall(payload: [String: Any], appVersion: String) {
          guard let url = URL(string: StallionConstants.STALLION_API_BASE + StallionConstants.STALLION_INFO_API_PATH) else {
              debug("sync failed: invalid url")
              emitSyncError(NSError(domain: "Invalid URL", code: -1))
              return
          }

          var request = URLRequest(url: url)
          request.httpMethod = "POST"
          request.timeoutInterval = StallionConstants.READ_TIMEOUT_MS / 1000
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
              debug("sync failed: \(error.localizedDescription)")
              completeSync()
              emitSyncError(error)
              return
          }

          let task = URLSession.shared.dataTask(with: request) { data, response, error in
              if let error = error {
                  debug("sync failed: \(error.localizedDescription)")
                  completeSync()
                  emitSyncError(error)
                  return
              }
            
              guard let data = data, let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                  let status = (response as? HTTPURLResponse)?.statusCode ?? -1
                  debug("sync failed: invalid response status=\(status)")
                  completeSync()
                  let responseError = NSError(domain: "Invalid response from server", code: -2)
                  emitSyncError(responseError)
                  return
              }

              // Parse the JSON response
              do {
                  if let releaseMeta = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                      let mounted = StallionStateManager.sharedInstance()?.isMounted == true
                      debug("sync response received mounted=\(mounted) success=\(releaseMeta["success"] ?? "nil")")
                      completeSync()
                      processReleaseMeta(releaseMeta, appVersion: appVersion)
                  } else {
                      debug("sync failed: invalid json")
                      completeSync()
                      let parsingError = NSError(domain: "Invalid JSON format", code: -3)
                      emitSyncError(parsingError)
                  }
              } catch {
                  debug("sync failed: \(error.localizedDescription)")
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
        debug("sync lock released")
    }
  
    private static func processReleaseMeta(_ releaseMeta: [String: Any], appVersion: String) {
        guard let success = releaseMeta["success"] as? Bool, success else {
            debug("sync payload not successful")
            return
        }
        guard let data = releaseMeta["data"] as? [String: Any] else {
            debug("sync payload missing data")
            return
        }

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
              !newReleaseHash.isEmpty else {
            debug("new bundle data missing download url or checksum")
            return
        }

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

        let hasDiff = diffUrl?.isEmpty == false
        debug("new release hash=\(newReleaseHash) hasDiff=\(hasDiff) diffId=\(bundleDiffId ?? "nil") isBundlePatched=\(isBundlePatched) mounted=\(stateManager?.isMounted == true) lastRolledBack=\(lastRolledBackHash) lastUnverified=\(lastUnverifiedHash)")
        if newReleaseHash != lastRolledBackHash && newReleaseHash != lastUnverifiedHash {
            if stateManager?.isMounted == true {
                debug("starting download from sync")
                downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: newReleaseUrl, diffUrl: diffUrl, isBundlePatched: isBundlePatched, bundleDiffId: bundleDiffId)
            } else {
              debug("storing pending release")
              stateManager?.pendingReleaseUrl = newReleaseUrl
              stateManager?.pendingReleaseHash = newReleaseHash
              stateManager?.pendingReleaseDiffUrl = diffUrl
              stateManager?.pendingReleaseIsBundlePatched = isBundlePatched
              stateManager?.pendingReleaseBundleDiffId = bundleDiffId
            }
        } else {
            debug("skipping release")
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
        guard shouldDownload else {
            debug("download skipped, already in progress hash=\(newReleaseHash)")
            return
        }

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
      
      guard let fromUrl = URL(string: urlToDownload + "?projectId=" + projectId) else {
          debug("download setup failed, invalid url hash=\(newReleaseHash)")
          completeDownload()
          return
      }

      let hasSigningKey = !publicSigningKey.isEmpty
      debug("download accepted hash=\(newReleaseHash) isDiff=\(isDiffDownload) diffId=\(bundleDiffIdForEvents ?? "nil") hasSigningKey=\(hasSigningKey)")
      emitDownloadStarted(releaseHash: newReleaseHash, bundleDiffId: bundleDiffIdForEvents)
      let downloadStartMs = Int(Date().timeIntervalSince1970 * 1000)

      StallionFileDownloader().downloadBundle(
        url: fromUrl,
        downloadDirectory: downloadPath,
        onProgress: { progress in
          emitDownloadProgress(releaseHash: newReleaseHash, progress: progress)
        },
        resolve: { _ in
          let downloadTimeMs = Int(Date().timeIntervalSince1970 * 1000) - downloadStartMs
          debug("download finished hash=\(newReleaseHash) isDiff=\(isDiffDownload) elapsedMs=\(downloadTimeMs)")
          
          // If this was a diff download, handle patch
          if isDiffDownload {
              // Get base bundle path from current slot
              guard let slotPath = stateManager.stallionMeta?.getCurrentProdSlotPath() else {
                  // No valid slot path (e.g., default slot), skip patch and retry with full bundle
                  debug("no base slot, retrying full bundle hash=\(newReleaseHash)")
                  StallionFileManager.deleteFileOrFolderSilently(downloadPath)
                  completeDownload()
                  downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: originalNewReleaseUrl, diffUrl: nil, isBundlePatched: false, bundleDiffId: nil)
                  return
              }
              
              do {
                  let baseBundlePath = config.filesDirectory + "/" + StallionConstants.PROD_DIRECTORY + "/" + slotPath
                  
                  // Invoke patch handler with isBundlePatched flag
                  try StallionPatchHandler.applyPatch(baseBundlePath: baseBundlePath, diffPath: downloadPath, isBundlePatched: isBundlePatchedFlag)
              } catch {
                  // Patch application failed, retry with full bundle download
                  debug("patch failed, retrying full bundle hash=\(newReleaseHash) error=\(error.localizedDescription)")
                  StallionFileManager.deleteFileOrFolderSilently(downloadPath)
                  completeDownload()
                  downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: originalNewReleaseUrl, diffUrl: nil, isBundlePatched: false, bundleDiffId: nil)
                  return
              }
          }

          if(publicSigningKey != nil && !publicSigningKey.isEmpty) {
            let verifyPath = downloadPath + "/" + StallionConstants.FilePaths.ZipFolderName
            debug("verifying signature hash=\(newReleaseHash) path=\(verifyPath)")
            if(
              !StallionSignatureVerification.verifyReleaseSignature(
                downloadedBundlePath: verifyPath,
                publicKeyPem: publicSigningKey
              )
            ) {
              // discard downloaded release
              debug("signature verification failed hash=\(newReleaseHash)")
              config.updateLastUnverifiedHash(newReleaseHash)
              emitSignatureVerificationFailed(releaseHash: newReleaseHash)
              StallionFileManager.deleteFileOrFolderSilently(downloadPath)
              completeDownload()
              return;
            }
            debug("signature verification passed hash=\(newReleaseHash)")
          } else {
            debug("signature verification skipped, no public key hash=\(newReleaseHash)")
          }
          stateManager.stallionMeta?.currentProdSlot =  SlotStates.newSlot
          stateManager.stallionMeta?.prodTempHash =  newReleaseHash
          if let currentProdNewHash = stateManager.stallionMeta?.prodNewHash,
             !currentProdNewHash.isEmpty {
              StallionSlotManager.stabilizeProd()
          }
          stateManager.syncStallionMeta()
          debug("emitting download complete hash=\(newReleaseHash)")
          emitDownloadSuccess(releaseHash: newReleaseHash, bundleDiffId: bundleDiffIdForEvents, downloadTimeMs: downloadTimeMs)
          completeDownload()
        },
        reject: { code, prefix, error  in
          debug("download rejected hash=\(newReleaseHash) error=\(String(describing: prefix))\(String(describing: error))")
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
        debug("download lock released")
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

    private static func emitDownloadSuccess(releaseHash: String, bundleDiffId: String?, downloadTimeMs: Int) {
      var successPayload: [String: Any] = ["releaseHash": releaseHash]
      if let metaData = try? JSONSerialization.data(withJSONObject: ["downloadTime": downloadTimeMs]),
         let metaString = String(data: metaData, encoding: .utf8) {
          successPayload["meta"] = metaString
      }
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

