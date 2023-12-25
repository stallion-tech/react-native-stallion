import Foundation

@objc(Stallion)
class Stallion: RCTEventEmitter {
    public static var shared: RCTEventEmitter?
    
    override init() {
        super.init()
        Stallion.shared = self
        StallionErrorBoundary.initErrorBoundary()
        let stallionIsOn = StallionUtil.getLs(key: StallionUtil.LSKeys.switchStateKey) == StallionUtil.SwitchStates.ON;
        StallionErrorBoundary.toggleExceptionHandler(stallionIsOn)
    }
    
    override func supportedEvents() -> [String]! {
        return [StallionConstants.DOWNLOAD_PROGRESS_EVENT]
    }
    
    @objc(downloadPackage:withResolver:withRejecter:)
    func downloadPackage(bundleInfo: NSDictionary, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard let receivedBucketId = bundleInfo.value(forKey: StallionConstants.DownloadReqBodyKeys.BucketId) else {return}
        guard var receiveDownloadUrl = bundleInfo.value(forKey: StallionConstants.DownloadReqBodyKeys.DownloadUrl) else {return}
        let receivedVersion = bundleInfo.value(forKey: StallionConstants.DownloadReqBodyKeys.Version) as? Int ?? nil
        var reqJson: [String: Any] = [
            StallionConstants.DownloadReqBodyKeys.BucketId: receivedBucketId,
            StallionConstants.DownloadReqBodyKeys.Platform: StallionConstants.PlatformValue,
        ]
        if (receivedVersion != nil) {
            reqJson[StallionConstants.DownloadReqBodyKeys.Version] = receivedVersion
        }
        guard let fromUrl = URL(string: receiveDownloadUrl as? String ?? "") else { return }
        
        do {
                try StallionDownloader().load(
                    url: fromUrl,
                    reqBody: reqJson,
                    resolve: resolve,
                    reject: reject
                )
        } catch {
            let errorString = StallionConstants.DownloadPromiseResponses.GenericError
            reject("500", errorString, NSError(domain: errorString, code: 500))
        }
    }
    
    @objc(setApiKey:)
    func setApiKey(apiKey: String) {
        StallionUtil.setLs(key: StallionUtil.LSKeys.apiKey, value: apiKey)
    }
    
    @objc(getApiKey:)
    func getApiKey(_ callback: RCTResponseSenderBlock) {
        let apiKey = StallionUtil.getLs(key: StallionUtil.LSKeys.apiKey)
        callback([apiKey ?? ""])
    }
    
    @objc(toggleStallionSwitch:)
    func toggleStallionSwitch(isOn: Bool) {
        StallionUtil.setLs(key: StallionUtil.LSKeys.switchStateKey, value: isOn ? StallionUtil.SwitchStates.ON : StallionUtil.SwitchStates.OFF)
        StallionErrorBoundary.toggleExceptionHandler(isOn)
    }
    
    @objc(getStallionMeta:)
    func getStallionMeta(_ callback: RCTResponseSenderBlock) {
        var metaDictionary = [String:Any]()
        metaDictionary[StallionUtil.LSKeys.bucketKey] = StallionUtil.getLs(key: StallionUtil.LSKeys.bucketKey)
        metaDictionary[StallionUtil.LSKeys.versionKey] = StallionUtil.getLs(key: StallionUtil.LSKeys.versionKey)
        metaDictionary[StallionUtil.LSKeys.switchStateKey] = StallionUtil.getLs(key: StallionUtil.LSKeys.switchStateKey) == StallionUtil.SwitchStates.ON
        let stallionMeta = NSDictionary(dictionary: metaDictionary)
        callback([stallionMeta])
    }
}
