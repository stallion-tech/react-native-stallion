//
//  StallionEventEmitter.swift
//  Pods
//
//  Created by Thor963 on 26/09/24.
//

import Foundation
import ZIPFoundation

@objc class StallionEventEmitter: NSObject {
  internal class func sendEvent(eventType: String, data: Dictionary<String, Any>) {
    var eventData = data
    eventData[StallionConstants.APP_VERION_EVENT_KEY] = StallionSyncManager.getAppVersion()
    Stallion.shared?.sendEvent(withName: StallionConstants.STALLION_NATIVE_EVENT_NAME, body: [
      "type": eventType,
      "payload": eventData
    ])
  }
}
