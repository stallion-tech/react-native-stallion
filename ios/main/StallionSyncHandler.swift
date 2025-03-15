//
//  StallionSyncHandler.swift
//  react-native-stallion
//
//  Created by Jasbir Singh Shergill on 29/01/25.
//

import Foundation

class StallionSyncHandler {

    private static var isSyncInProgress = false
    private static var isDownloadInProgress = false
    private static let syncQueue = DispatchQueue(label: "com.stallion.syncQueue")

    static func sync() {
          syncQueue.async {
              guard !isSyncInProgress else { return }
              isSyncInProgress = true
          }

          DispatchQueue.global().async {
              do {
                  // Fetch StallionStateManager and StallionConfig
                  let stateManager = StallionStateManager.sharedInstance()
                  guard let config = stateManager?.stallionConfig else { return }

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
                  ]

                  // Make API call using URLSession
                  makeApiCall(payload: requestPayload, appVersion: appVersion)

              } catch {
                  defer { isSyncInProgress = false }
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
              defer { isSyncInProgress = false }
              emitSyncError(error)
              return
          }

          let task = URLSession.shared.dataTask(with: request) { data, response, error in
              if let error = error {
                  defer { isSyncInProgress = false }
                  emitSyncError(error)
                  return
              }
            
              guard let data = data, let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                  defer { isSyncInProgress = false }
                  let responseError = NSError(domain: "Invalid response from server", code: -2)
                  emitSyncError(responseError)
                  return
              }

              // Parse the JSON response
              do {
                  if let releaseMeta = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                      defer { isSyncInProgress = false }
                      processReleaseMeta(releaseMeta, appVersion: appVersion)
                  } else {
                      defer { isSyncInProgress = false }
                      let parsingError = NSError(domain: "Invalid JSON format", code: -3)
                      emitSyncError(parsingError)
                  }
              } catch {
                  defer { isSyncInProgress = false }
                  emitSyncError(error)
              }
          }

          task.resume()
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

        let stateManager = StallionStateManager.sharedInstance()
        let lastRolledBackHash = stateManager?.stallionMeta?.lastRolledBackHash ?? ""

        if newReleaseHash != lastRolledBackHash {
            if stateManager?.isMounted == true {
                downloadNewRelease(newReleaseHash: newReleaseHash, newReleaseUrl: newReleaseUrl)
            } else {
              stateManager?.pendingReleaseUrl = newReleaseUrl
              stateManager?.pendingReleaseHash = newReleaseHash
            }
        }
    }

    static func downloadNewRelease(newReleaseHash: String, newReleaseUrl: String) {
        guard let stateManager = StallionStateManager.sharedInstance(),
              let config = stateManager.stallionConfig else { return }
      
      syncQueue.async {
          guard !isDownloadInProgress else { return }
          isDownloadInProgress = true
      }

      let downloadPath = config.filesDirectory + "/" + StallionConstants.PROD_DIRECTORY + "/" + StallionConstants.TEMP_FOLDER_SLOT
      let projectId = config.projectId ?? ""
      
      guard let fromUrl = URL(string: newReleaseUrl + "?projectId=" + projectId) else { return }

      emitDownloadStarted(releaseHash: newReleaseHash)

      StallionFileDownloader().downloadBundle(url: fromUrl, downloadDirectory: downloadPath, onProgress: { progress in
        // Handle progress updates if necessary
    }, resolve: { _ in
      defer { isDownloadInProgress = false }
      stateManager.stallionMeta?.currentProdSlot =  SlotStates.newSlot
      stateManager.stallionMeta?.prodTempHash =  newReleaseHash
      if let currentProdNewHash = stateManager.stallionMeta?.prodNewHash,
         !currentProdNewHash.isEmpty {
          StallionSlotManager.stabilizeProd()
      }
      stateManager.syncStallionMeta()
      emitDownloadSuccess(releaseHash: newReleaseHash)
    }, reject: { code, prefix, error  in
      defer { isDownloadInProgress = false }
      emitDownloadError(
        releaseHash: newReleaseHash,
        error: "\(String(describing: prefix))\(String(describing: error))"
      )
    })
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

    private static func emitDownloadSuccess(releaseHash: String) {
      let successPayload: NSDictionary = ["releaseHash": releaseHash]
      Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesProd.DOWNLOAD_COMPLETE_PROD,
                             eventBody: successPayload,
                             shouldCache: true
      )
    }

    private static func emitDownloadStarted(releaseHash: String) {
        let startedPayload: NSDictionary = ["releaseHash": releaseHash]
        Stallion.sendEventToRn(eventName: StallionConstants.NativeEventTypesProd.DOWNLOAD_STARTED_PROD,
                             eventBody: startedPayload,
                             shouldCache: true
      )
    }
}

