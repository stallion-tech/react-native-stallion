import Foundation

@objc(Stallion)
class Stallion: RCTEventEmitter {
    public static var shared: RCTEventEmitter?
    
    override init() {
        super.init()
        Stallion.shared = self
        StallionSyncManager.sync()
    }
  
    override func supportedEvents() -> [String]! {
      return [StallionConstants.STALLION_NATIVE_EVENT_NAME]
    }
    
  @objc(downloadPackage:withResolver:withRejecter:)
    func downloadPackage(bundleInfo: NSDictionary, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        let receivedDownloadUrl = (bundleInfo.value(forKey: StallionConstants.DownloadReqBodyKeys.DownloadUrl) as? String) ?? ""
        let receivedReleaseHash = (bundleInfo.value(forKey: StallionConstants.DownloadReqBodyKeys.Hash) as? String) ?? ""
        let stageDownloadEventBody = ["releaseHash": receivedReleaseHash]
      
        guard let fromUrl = URL(string: receivedDownloadUrl) else { return }
        
        do {
            try StallionDownloader().load(
                url: fromUrl,
                downloadPaths: [StallionConstants.STAGE_DIRECTORY, StallionConstants.TEMP_FOLDER_SLOT],
                onProgress: {progress in
                  StallionEventEmitter.sendEvent(eventType: StallionConstants.NativeEventTypesStage.DOWNLOAD_PROGRESS_STAGE, data: ["releaseHash": receivedReleaseHash, "progress": progress]
                  )
                },
                resolve: {resOp in
                  StallionUtil.setLs(key: StallionConstants.CURRENT_STAGE_SLOT_KEY, value: "/" + StallionConstants.TEMP_FOLDER_SLOT)
                  StallionUtil.setLs(key: "/" + StallionConstants.STAGE_DIRECTORY + "/" + StallionConstants.TEMP_FOLDER_SLOT, value: receivedReleaseHash)
                  StallionEventEmitter.sendEvent(eventType: StallionConstants.NativeEventTypesStage.DOWNLOAD_COMPLETE_STAGE, data: stageDownloadEventBody
                  )
                  resolve(resOp)
                },
                reject: {code, message, error in
                  StallionEventEmitter.sendEvent(eventType: StallionConstants.NativeEventTypesStage.DOWNLOAD_ERROR_STAGE, data: stageDownloadEventBody
                  )
                  reject(code, message, error)
                }
            )
        } catch {
            let errorString = StallionConstants.DownloadPromiseResponses.GenericError
            StallionEventEmitter.sendEvent(eventType: StallionConstants.NativeEventTypesStage.DOWNLOAD_ERROR_STAGE, data: stageDownloadEventBody
            )
            reject("500", errorString, NSError(domain: errorString, code: 500))
        }
    }
  
    @objc
    func getStorage(_ storageKey: String, callback: RCTResponseSenderBlock) {
        let value = StallionUtil.getLs(key: storageKey)
        callback([value])
    }
    
    @objc
    func setStorage(_ storageKey: String, value: String) {
      StallionUtil.setLs(key: storageKey, value: value)
    }
    
    @objc
    func onLaunch(_ launchData: String) {
      //TODO: Do launch stuff here
      StallionObjUtil.isMounted = true
      emitPendingEvents()
    }
  
    @objc
    func getUniqueId(_ callback: RCTResponseSenderBlock) {
      callback([StallionSyncManager.getUniqueId()])
    }
  
    func emitPendingEvents() {
      let flushedEvents = StallionEventManager.sharedInstance().flushAllEvents() as NSArray
      for event in flushedEvents {
          if let eventDict = event as? [String: Any] {
            Stallion.shared?.sendEvent(withName: StallionConstants.STALLION_NATIVE_EVENT_NAME, body: eventDict)
          }
      }
    }
}
