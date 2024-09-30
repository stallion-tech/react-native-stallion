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
    Stallion.shared?.sendEvent(withName: StallionConstants.STALLION_NATIVE_EVENT_NAME, body: [
      "type": eventType,
      "payload": data
    ])
  }
}
