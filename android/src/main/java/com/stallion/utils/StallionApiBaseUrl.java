package com.stallion.utils;

import com.stallion.storage.StallionConfig;
import com.stallion.storage.StallionStateManager;
import com.stallion.networkmanager.StallionApiConstants;

public class StallionApiBaseUrl {

    /**
     * Gets the API base URL: custom baseUrl if set, else regional URL from app token.
     * @return String - The base URL to use
     */
    public static String get() {
        try {
            StallionStateManager stateManager = StallionStateManager.getInstance();
            if (stateManager != null && stateManager.getStallionConfig() != null) {
                return resolve(stateManager.getStallionConfig());
            }
        } catch (Exception e) {
            // Fallback to regional default on any error
        }
        return StallionApiConstants.REGIONAL_API_BASE_AP;
    }

    static String resolve(StallionConfig config) {
        String stored = config.getBaseUrl();
        if (stored != null && !stored.isEmpty()) {
            return stored;
        }

        String region = StallionTokenRegion.parseTokenRegion(config.getAppToken());
        if (region == null) {
            region = StallionTokenRegion.defaultRegion();
        }
        return regionalBaseUrl(region);
    }

    static String regionalBaseUrl(String region) {
        if ("us".equals(region)) {
            return StallionApiConstants.REGIONAL_API_BASE_US;
        }
        return StallionApiConstants.REGIONAL_API_BASE_AP;
    }

    /**
     * Sets a custom base URL, or clears it when null/empty.
     * @param baseUrl - The custom base URL to set, or null/empty to clear
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
