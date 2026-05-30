//
//  StallionApiBaseUrl.swift
//  react-native-stallion
//
//  Created for centralized base URL management
//

import Foundation

class StallionApiBaseUrl {
    /**
     * Gets the API base URL: custom baseUrl if set, else regional URL from app token.
     */
    static func get() -> String {
        guard let stateManager = StallionStateManager.sharedInstance() else {
            return StallionConstants.REGIONAL_API_BASE_AP
        }

        return resolve(config: stateManager.stallionConfig)
    }

    static func resolve(config: StallionConfig) -> String {
        let stored = config.baseUrl ?? ""
        if !stored.isEmpty {
            return stored
        }

        var region = StallionTokenRegion.parseTokenRegion(config.appToken)
        if region == nil {
            region = StallionTokenRegion.defaultRegion()
        }
        return regionalBaseUrl(region!)
    }

    static func regionalBaseUrl(_ region: String) -> String {
        if region == "us" {
            return StallionConstants.REGIONAL_API_BASE_US
        }
        return StallionConstants.REGIONAL_API_BASE_AP
    }

    /**
     * Sets a custom base URL, or clears it when empty.
     */
    static func set(_ baseUrl: String) {
        guard let stateManager = StallionStateManager.sharedInstance() else {
            return
        }
        stateManager.stallionConfig.updateBaseUrl(baseUrl)
    }
}
