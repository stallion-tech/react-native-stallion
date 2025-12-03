import Foundation

import Foundation
import React

@objc(Stallion)
class Stallion: RCTEventEmitter {
  
  static weak var sharedInstance: Stallion?
  private var stallionStateManager: StallionStateManager;

    override init() {
      StallionStateManager.initializeInstance()
      self.stallionStateManager = StallionStateManager.sharedInstance()
      
      super.init()
      Stallion.sharedInstance = self
      StallionSyncHandler.sync()
      NotificationCenter.default.addObserver(self, selector: #selector(appDidBecomeActive), name: UIApplication.didBecomeActiveNotification, object: nil)
    }
  
    override func supportedEvents() -> [String]! {
      return [StallionConstants.STALLION_NATIVE_EVENT_NAME]
    }

    @objc func appDidBecomeActive() {
        StallionSyncHandler.sync()
    }

    @objc func onLaunch(_ launchData: String) {
        stallionStateManager.isMounted = true
        checkPendingDownloads()
        let currentReleaseHash = stallionStateManager.stallionMeta.getHashAtCurrentProdSlot()
        if let currentReleaseHash = currentReleaseHash {
            if !currentReleaseHash.isEmpty && stallionStateManager.stallionMeta.getSuccessfulLaunchCount(currentReleaseHash) == 0 {
                emitInstallEvent(currentReleaseHash)
            }
            stallionStateManager.stallionMeta.markSuccessfulLaunch(currentReleaseHash)
            stallionStateManager.syncStallionMeta()
        }
    }

    private func checkPendingDownloads() {
        guard let pendingReleaseUrl = stallionStateManager.pendingReleaseUrl,
              let pendingReleaseHash = stallionStateManager.pendingReleaseHash,
              !pendingReleaseUrl.isEmpty,
              !pendingReleaseHash.isEmpty else { return }

        let pendingReleaseDiffUrl = stallionStateManager.pendingReleaseDiffUrl
        let pendingReleaseIsBundlePatched = stallionStateManager.pendingReleaseIsBundlePatched
        let pendingReleaseBundleDiffId = stallionStateManager.pendingReleaseBundleDiffId
        
        StallionSyncHandler.downloadNewRelease(newReleaseHash: pendingReleaseHash, newReleaseUrl: pendingReleaseUrl, diffUrl: pendingReleaseDiffUrl, isBundlePatched: pendingReleaseIsBundlePatched, bundleDiffId: pendingReleaseBundleDiffId)
        stallionStateManager.pendingReleaseUrl = ""
        stallionStateManager.pendingReleaseHash = ""
        stallionStateManager.pendingReleaseDiffUrl = nil
        stallionStateManager.pendingReleaseIsBundlePatched = false
        stallionStateManager.pendingReleaseBundleDiffId = nil
    }

  @objc func getStallionConfig(_ promise: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
      do {
          if let config = stallionStateManager.stallionConfig {
            let configJsonData = try JSONSerialization.data(withJSONObject: config.toDictionary(), options: [])
              if let configJsonString = String(data: configJsonData, encoding: .utf8) {
                  promise(configJsonString)
              } else {
                  throw NSError(domain: "StallionConfigError", code: 500, userInfo: [NSLocalizedDescriptionKey: "Unable to encode JSON to string."])
              }
          } else {
              throw NSError(domain: "StallionConfigError", code: 500, userInfo: [NSLocalizedDescriptionKey: "StallionConfig is nil."])
          }
      } catch {
          rejecter("getStallionConfig error", error.localizedDescription, error)
      }
  }

  @objc func getStallionMeta(_ promise: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
      do {
          if let meta = stallionStateManager.stallionMeta {
            let metaJsonData = try JSONSerialization.data(withJSONObject: meta.toDictionary(), options: [])
              if let metaJsonString = String(data: metaJsonData, encoding: .utf8) {
                  promise(metaJsonString)
              } else {
                  throw NSError(domain: "StallionMetaError", code: 500, userInfo: [NSLocalizedDescriptionKey: "Unable to encode JSON to string."])
              }
          } else {
              throw NSError(domain: "StallionMetaError", code: 500, userInfo: [NSLocalizedDescriptionKey: "StallionMeta is nil."])
          }
      } catch {
          rejecter("getStallionMeta error", error.localizedDescription, error)
      }
  }

    @objc func toggleStallionSwitch(_ switchState: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
          stallionStateManager.stallionMeta.switchState = StallionMetaConstants.switchState(from: switchState)
            stallionStateManager.syncStallionMeta()
            resolver("Success")
        } catch {
            rejecter("toggleStallionSwitch error", error.localizedDescription, error)
        }
    }

    @objc func updateSdkToken(_ newSdkToken: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            stallionStateManager.stallionConfig.updateSdkToken(newSdkToken)
            resolver("updateSdkToken success")
        } catch {
            rejecter("updateSdkToken error", error.localizedDescription, error)
        }
    }

    @objc func sync() {
        StallionSyncHandler.sync()
    }

    @objc func downloadStageBundle(_ bundleInfo: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
      StallionStageManager.downloadStageBundle(bundleInfo: bundleInfo, promise: resolver, rejecter: rejecter)
    }

    @objc func popEvents(_ promise: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            let events = StallionEventHandler.sharedInstance().popEvents()
            promise(events)
        } catch {
            rejecter("popEvents error", error.localizedDescription, error)
        }
    }

    @objc func acknowledgeEvents(_ eventIdsJson: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            guard let data = eventIdsJson.data(using: .utf8),
                  let eventIds = try JSONSerialization.jsonObject(with: data, options: []) as? [String] else {
                throw NSError(domain: "InvalidJSONFormat", code: 400, userInfo: nil)
            }

            StallionEventHandler.sharedInstance().acknowledgeEvents(eventIds)
            resolver("Events acknowledged successfully.")
        } catch {
            rejecter("ACKNOWLEDGE_EVENTS_ERROR", error.localizedDescription, error)
        }
    }
  
  /// ✅ Expose a function to send events externally
  @objc static func sendEventToRn(eventName: String, eventBody: NSDictionary, shouldCache: Bool) {
    if(shouldCache) {
      StallionEventHandler.sharedInstance().cacheEvent(eventName, eventPayload: eventBody as! [AnyHashable : Any])
    }
    if let mutableDict = eventBody.mutableCopy() as? NSMutableDictionary {
        mutableDict["type"] = eventName
      do {
        let eventJson = try JSONSerialization.data(withJSONObject: mutableDict, options: [])
          if let eventString = String(data: eventJson, encoding: .utf8) {
            DispatchQueue.main.async {
              Stallion.sharedInstance?.sendEvent(withName: StallionConstants.STALLION_NATIVE_EVENT_NAME, body: eventString)
            }
          } else {
              throw NSError(domain: "StallionConfigError", code: 500, userInfo: [NSLocalizedDescriptionKey: "Unable to encode JSON to string."])
          }
      } catch {};
    }
  }
  
  @objc func restart() {
      DispatchQueue.main.async {
          self.stallionStateManager.isMounted = false
          RCTTriggerReloadCommandListeners("Stallion: Restart")
      }
  }
  
  private func emitInstallEvent(_ releaseHash: String) {
      let eventPayload: [String: Any] = [
          "releaseHash": releaseHash
      ]
      
      Stallion.sendEventToRn(
          eventName: StallionConstants.NativeEventTypesProd.INSTALLED_PROD,
          eventBody: eventPayload as NSDictionary,
          shouldCache: false
      )
  }
}

