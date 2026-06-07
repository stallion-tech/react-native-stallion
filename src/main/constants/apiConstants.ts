import { DEFAULT_API_BASE_URL } from '../utils/getApiBaseUrl';

// Keep for backward compatibility, but mark as deprecated
/** @deprecated Use getApiBaseUrl() instead */
export const API_BASE_URL = DEFAULT_API_BASE_URL;

export enum API_PATHS {
  LOGIN = '/api/v1/sdk/auth/verify-pin',
  VERIFY_OTP = '/api/v1/auth/verify-otp',
  FETCH_BUCKETS = '/api/v1/sdk/list-buckets',
  FETCH_BUNDLES = '/api/v1/bundle/list',
  FETCH_BUNDLES_ADVANCED = '/api/v1/sdk/list-bundles',
  USER_PROFILE = '/api/v1/sdk/user-profile',
  LOG_EVENTS = '/api/v1/analytics/log-bulk-events',
  GET_META_FROM_HASH = '/api/v1/sdk/get-meta-from-hash',
}
export const BUNDLE_API_PAGE_SIZE = 10;
