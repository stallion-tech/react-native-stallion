import { getStallionConfigNative } from './StallionNativeUtils';
import {
  AP_ORIGIN,
  parseTokenRegion,
  regionalApiBaseUrl,
} from './parseTokenRegion';

export const DEFAULT_API_BASE_URL = AP_ORIGIN;
export const LEGACY_API_BASE_URL = 'https://api.stalliontech.io';

// Cache for base URL
let cachedBaseUrl: string | null = null;

/**
 * Gets the API base URL from native config or returns regional default
 * @returns Promise<string> - The base URL to use
 */
export const getApiBaseUrl = async (): Promise<string> => {
  if (cachedBaseUrl) {
    return cachedBaseUrl;
  }

  try {
    const config = await getStallionConfigNative();
    if (config.baseUrl) {
      cachedBaseUrl = config.baseUrl;
      return cachedBaseUrl;
    }
    const region = parseTokenRegion(config.appToken);
    cachedBaseUrl = regionalApiBaseUrl(region);
    return cachedBaseUrl;
  } catch {
    return DEFAULT_API_BASE_URL;
  }
};

/**
 * Gets the API base URL synchronously (returns default if not cached)
 * Use this when you need immediate access and can't await
 * @returns string - The base URL (default if not loaded yet)
 */
export const getApiBaseUrlSync = (): string => {
  return cachedBaseUrl || DEFAULT_API_BASE_URL;
};

/**
 * Clears the cached base URL (useful for testing or config changes)
 */
export const clearApiBaseUrlCache = (): void => {
  cachedBaseUrl = null;
};
