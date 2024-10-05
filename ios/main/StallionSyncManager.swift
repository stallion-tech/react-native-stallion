//
//  StallionSyncManager.swift
//  Pods
//
//  Created by Thor963 on 25/09/24.
//


import Foundation
import UIKit

class StallionSyncManager: NSObject {
  
  internal class func getAppVersion() -> String {
    return Bundle.main.infoDictionary?[StallionConstants.APP_VERION_IDENTIFIER] as? String ?? ""
  }
  internal class func getProjectId() -> String {
    return Bundle.main.infoDictionary?[StallionConstants.STALLION_PROJECT_ID_IDENTIFIER] as? String ?? ""
  }
  internal class func getAppToken() -> String {
    return Bundle.main.infoDictionary?[StallionConstants.STALLION_APP_TOKEN_IDENTIFIER] as? String ?? ""
  }
  internal class func getSdkToken() -> String {
    return StallionUtil.getLs(key: StallionConstants.STALLION_SDK_TOKEN_KEY)
  }
  
  internal class func getUniqueId() -> String {
    let cachedUid = StallionUtil.getLs(key: StallionConstants.UNIQUE_ID_IDENTIFIER)
    if(!cachedUid.isEmpty) {
      return cachedUid
    } else {
      var newUid = ""
      if let deviceId = UIDevice.current.identifierForVendor?.uuidString {
        newUid = deviceId
      } else {
        newUid = UUID().uuidString
      }
      StallionUtil.setLs(key: StallionConstants.UNIQUE_ID_IDENTIFIER, value: newUid)
      return newUid
    }
  }
  
  internal class func sync() -> Void {
    let appVersion = getAppVersion()
    let currentProdSlot = StallionUtil.getLs(key: StallionConstants.CURRENT_PROD_SLOT_KEY)
    
    let appliedBundleHash = StallionUtil.getLs(key: "/" + StallionConstants.PROD_DIRECTORY + currentProdSlot)
    
    let projectId = getProjectId()
    let appToken = getAppToken()
    let sdkToken = getSdkToken()
      
    let params = [
        "appVersion": appVersion,
        "platform": StallionConstants.PlatformValue,
        "projectId": projectId,
        "appliedBundleHash": appliedBundleHash
    ] as Dictionary<String, String>
      
    var request = URLRequest(url: URL(string: StallionConstants.STALLION_API_BASE + StallionConstants.STALLION_INFO_API_PATH)!);
    request.httpMethod = "POST"
    request.httpBody = try? JSONSerialization.data(withJSONObject: params, options: [])
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.addValue(appToken, forHTTPHeaderField: StallionConstants.STALLION_APP_TOKEN_KEY)
    request.addValue(sdkToken, forHTTPHeaderField: StallionConstants.STALLION_SDK_TOKEN_KEY)
    request.addValue(getUniqueId(), forHTTPHeaderField: StallionConstants.STALLION_UID_KEY)
    
    let session = URLSession.shared
      let task = session.dataTask(with: request, completionHandler: { data, response, error -> Void in
          do {
              if let httpResponse = response as? HTTPURLResponse, let apiData = data {
                  if(httpResponse.statusCode == 200) {
                      let json = try JSONSerialization.jsonObject(with: apiData) as? Dictionary<String, AnyObject>
                          let successField = json?["success"] as? Bool
                      if(successField == true) {
                        let jsonData = json?["data"]
                        if(jsonData == nil) { return }
                        let newReleaseData = jsonData?["newBundleData"] as? Dictionary<String, Any>;
                        let appliedReleaseData = jsonData?["appliedBundleData"] as? Dictionary<String, Any>;
                        if(appliedReleaseData != nil) {
                          let isRolledBack = (appliedReleaseData?["isRolledBack"] as? Bool) ?? false
                          let targetAppVersion = (appliedReleaseData?["targetAppVersion"] as? String) ?? ""
                          if(isRolledBack && targetAppVersion == appVersion) {
                            StallionRollbackHandler.rollbackProd(false)
                          }
                        }
                        if(newReleaseData != nil) {
                          let newReleaseUrl = (newReleaseData?["downloadUrl"] as? String) ?? ""
                          let newReleaseHash = (newReleaseData?["checksum"] as? String) ?? ""
                          let lastRolledBackHash = StallionUtil.getLs(key: StallionConstants.LAST_ROLLED_BACK_RELEASE_HASH_KEY)
                          if(newReleaseHash != lastRolledBackHash) {
                            StallionUtil.setLs(key: StallionConstants.NEW_RELEASE_HASH_ID, value: newReleaseHash)
                            StallionUtil.setLs(key: StallionConstants.NEW_RELEASE_URL_ID, value: newReleaseUrl)
                            checkAndDownload()
                          }
                        }
                      }
                  }
              }
          } catch {
            StallionEventEmitter.sendEvent(eventType: StallionConstants.NativeEventTypesProd.SYNC_ERROR_PROD,
                data: ["error": StallionConstants.DownloadPromiseResponses.SyncApiError]
            )
          }
      })
      task.resume()
  }
  
  internal class func checkAndDownload() -> Void {
    let newReleaseHash = StallionUtil.getLs(key: StallionConstants.NEW_RELEASE_HASH_ID)
    let newReleaseUrl = StallionUtil.getLs(key: StallionConstants.NEW_RELEASE_URL_ID)
    guard let fromUrl = URL(string: newReleaseUrl + "?projectId=" + getProjectId()) else { return }
    if(!newReleaseUrl.isEmpty && !newReleaseUrl.isEmpty) {
      StallionUtil.setLs(key: StallionConstants.NEW_RELEASE_HASH_ID, value: "")
      StallionUtil.setLs(key: StallionConstants.NEW_RELEASE_URL_ID, value: "")
      let downloadEventPaylod = ["releaseHash": newReleaseHash]
      StallionEventEmitter.sendEvent(eventType: StallionConstants.NativeEventTypesProd.DOWNLOAD_STARTED_PROD,
          data: downloadEventPaylod
      )
      do {
        try StallionDownloader().load(
            url: fromUrl,
            downloadPaths: [StallionConstants.PROD_DIRECTORY, StallionConstants.TEMP_FOLDER_SLOT],
            onProgress: {progress in
              StallionEventEmitter.sendEvent(
                eventType: StallionConstants.NativeEventTypesProd.DOWNLOAD_PROGRESS_PROD,
                data: ["releaseHash": newReleaseHash, "progress": progress]
              )
            },
            resolve: {resOp in
              StallionUtil.setLs(key: StallionConstants.CURRENT_PROD_SLOT_KEY, value: "/" + StallionConstants.TEMP_FOLDER_SLOT)
              StallionUtil.setLs(key: "/" + StallionConstants.PROD_DIRECTORY + "/" + StallionConstants.TEMP_FOLDER_SLOT, value: newReleaseHash)
              StallionEventEmitter.sendEvent(eventType: StallionConstants.NativeEventTypesProd.DOWNLOAD_COMPLETE_PROD, data: downloadEventPaylod
              )
            },
            reject: {code, message, error in
              StallionEventEmitter.sendEvent(eventType: StallionConstants.NativeEventTypesProd.DOWNLOAD_ERROR_PROD, data: downloadEventPaylod
              )
            }
        )
      } catch {
        StallionEventEmitter.sendEvent(eventType: StallionConstants.NativeEventTypesProd.DOWNLOAD_ERROR_PROD, data: downloadEventPaylod
        )
      }
    }
  }
}
