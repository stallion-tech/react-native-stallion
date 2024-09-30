//
//  StallionEventEmitter.swift
//  Pods
//
//  Created by Thor963 on 26/09/24.
//

import Foundation
import ZIPFoundation

@objc class StallionExceptionHandler: NSObject {
  @objc internal var _defaultExceptionHandler = nil
  @objc internal class func initExceptionHandler() {
    _defaultExceptionHandler = NSGetUncaughtExceptionHandler()
    NSSetUncaughtExceptionHandler(handleException)
  }
  @objc internal class func handleException(exception: NSException) {
    
  }
}
