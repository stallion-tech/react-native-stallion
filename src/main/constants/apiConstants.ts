export const API_BASE_URL = 'https://staging-api.redhorse.tech';

export enum API_PATHS {
  LOGIN = '/api/v1/sdk/client-login',
  VERIFY_OTP = '/api/v1/auth/verify-otp',
  FETCH_BUCKETS = '/api/v1/sdk/list-buckets',
  FETCH_BUNDLES = '/api/v1/bundle/list',
  FETCH_BUNDLES_ADVANCED = '/api/v1/sdk/list-bundles',
  USER_PROFILE = '/api/v1/sdk/user-profile',
  LOG_EVENT = '/api/v1/analytics/log-published-event',
}
export const BUNDLE_API_PAGE_SIZE = 10;
