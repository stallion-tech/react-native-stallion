//
//  StallionUtil.swift
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//

import Foundation

class StallionUtil {
    static func setLs(key: String, value: String) {
        let defaults = UserDefaults.standard
        defaults.set(value, forKey: key)
    }
    static func getLs(key: String) -> String {
        let defaults = UserDefaults.standard
        return defaults.string(forKey: key) ?? ""
    }
}
