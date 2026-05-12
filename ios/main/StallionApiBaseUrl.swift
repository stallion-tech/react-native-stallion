//
//  StallionApiBaseUrl.swift
//  react-native-stallion
//
//  Created for centralized base URL management
//

import Foundation

class StallionApiBaseUrl {
    /**
     * Gets the API base URL from config or returns default
     * @returns String - The base URL to use
     */
    static func get() -> String {
        guard let stateManager = StallionStateManager.sharedInstance() else {
            return StallionConstants.DEFAULT_STALLION_API_BASE
        }
        
        let customBaseUrl = stateManager.stallionConfig.baseUrl
        return customBaseUrl?.isEmpty == false ? customBaseUrl! : StallionConstants.DEFAULT_STALLION_API_BASE
    }
    
    /**
     * Sets a custom base URL
     * @param baseUrl - The custom base URL to set
     */
    static func set(_ baseUrl: String) {
        guard let stateManager = StallionStateManager.sharedInstance() else {
            return
        }
        stateManager.stallionConfig.updateBaseUrl(baseUrl)
    }
}

