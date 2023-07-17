//
//  StallionUtil.swift
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//

import Foundation

class StallionUtil {
    public struct LSKeys {
        static let bucketKey = "activeBucket"
        static let versionKey = "activeVersion"
        static let switchStateKey = "switchState"
        static let apiKey = "apiKey"
    }
    public struct SwitchStates {
        static let ON = "STALLION_ON"
        static let OFF = "DEFAULT"
    }
    static func setLs(key: String, value: String) {
        let defaults = UserDefaults.standard
        defaults.set(value, forKey: key)
    }
    static func getLs(key: String) -> String? {
        let defaults = UserDefaults.standard
        return defaults.string(forKey: key)
    }
}
