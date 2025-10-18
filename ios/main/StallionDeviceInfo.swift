//
//  StallionDeviceInfo.swift
//  react-native-stallion
//
//  Created by Thor963 on 29/01/25.
//

import Foundation
import UIKit

class StallionDeviceInfo {
    
    /**
     * Sample JSON contract for deviceMeta
     * {
     *   "osName": "iOS",
     *   "osVersion": "17.2",
     *   "sdkInt": 17,
     *   "manufacturer": "Apple",
     *   "brand": "Apple",
     *   "model": "iPhone 15 Pro",
     *   "device": "iPhone16,1",
     *   "product": "iPhone16,1",
     *   "hardware": "iPhone16,1",
     *   "locale": "en-US",
     *   "localeLanguage": "en",
     *   "localeCountry": "US",
     *   "timezone": "America/Los_Angeles",
     *   "timezoneOffsetMinutes": -420,
     *   "isEmulator": false,
     *   "projectId": "<project-id>",
     *   "uid": "<device-uid>",
     *   "appVersion": "1.2.3"
     * }
     */
    static func getDeviceMetaJson(_ config: StallionConfig?) -> [String: Any] {
        var json: [String: Any] = [:]
        
        // OS Information
        json["osName"] = "iOS"
        json["osVersion"] = UIDevice.current.systemVersion
        json["sdkInt"] = Int(UIDevice.current.systemVersion.components(separatedBy: ".").first ?? "0") ?? 0
        
        // Device Information
        json["manufacturer"] = "Apple"
        json["brand"] = "Apple"
        json["model"] = getDeviceModel()
        json["device"] = getDeviceIdentifier()
        json["product"] = getDeviceIdentifier()
        json["hardware"] = getDeviceIdentifier()
        
        // Locale Information
        let locale = Locale.current
        json["locale"] = locale.identifier
        json["localeLanguage"] = locale.languageCode ?? ""
        json["localeCountry"] = locale.regionCode ?? ""
        
        // Timezone Information
        let timezone = TimeZone.current
        json["timezone"] = timezone.identifier
        json["timezoneOffsetMinutes"] = timezone.secondsFromGMT() / 60
        
        // Emulator Detection
        json["isEmulator"] = isProbablyEmulator()
        
        // Config Information
        if let config = config {
            json["projectId"] = config.projectId ?? ""
            json["uid"] = config.uid ?? ""
            json["appVersion"] = config.appVersion ?? ""
        }
        
        return json
    }
    
    private static func getDeviceModel() -> String {
        var systemInfo = utsname()
        uname(&systemInfo)
        let modelCode = withUnsafePointer(to: &systemInfo.machine) {
            $0.withMemoryRebound(to: CChar.self, capacity: 1) {
                ptr in String.init(validatingUTF8: ptr)
            }
        }
        return modelCode ?? "Unknown"
    }
    
    private static func getDeviceIdentifier() -> String {
        var systemInfo = utsname()
        uname(&systemInfo)
        let identifier = withUnsafePointer(to: &systemInfo.machine) {
            $0.withMemoryRebound(to: CChar.self, capacity: 1) {
                ptr in String.init(validatingUTF8: ptr)
            }
        }
        return identifier ?? "Unknown"
    }
    
    private static func isProbablyEmulator() -> Bool {
        #if targetEnvironment(simulator)
        return true
        #else
        return false
        #endif
    }
}
