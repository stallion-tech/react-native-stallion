package com.stallion.utils;

import com.stallion.storage.StallionStateManager;
import com.stallion.networkmanager.StallionApiConstants;

public class StallionApiBaseUrl {

    /**
     * Gets the API base URL from config or returns default
     * @return String - The base URL to use
     */
    public static String get() {
        try {
            StallionStateManager stateManager = StallionStateManager.getInstance();
            if (stateManager != null && stateManager.getStallionConfig() != null) {
                String customBaseUrl = stateManager.getStallionConfig().getBaseUrl();
                return (customBaseUrl != null && !customBaseUrl.isEmpty())
                    ? customBaseUrl
                    : StallionApiConstants.DEFAULT_STALLION_API_BASE;
            }
        } catch (Exception e) {
            // Fallback to default on any error
        }
        return StallionApiConstants.DEFAULT_STALLION_API_BASE;
    }

    /**
     * Sets a custom base URL
     * @param baseUrl - The custom base URL to set
     */
    public static void set(String baseUrl) {
        try {
            StallionStateManager stateManager = StallionStateManager.getInstance();
            if (stateManager != null && stateManager.getStallionConfig() != null) {
                stateManager.getStallionConfig().setBaseUrl(baseUrl);
            }
        } catch (Exception e) {
            // Silently fail
        }
    }
}
