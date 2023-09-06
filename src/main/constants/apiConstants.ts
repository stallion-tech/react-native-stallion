export const API_BASE_URL = 'https://stallion-api.redhorse.tech';

export enum API_PATHS {
  LOGIN = '/api/v1/auth/client/login',
  VERIFY_OTP = '/api/v1/auth/verify-otp',
  FETCH_BUCKETS = '/api/v1/bucket/list',
  FETCH_BUNDLES = '/api/v1/bundle/list',
  USER_PROFILE = '/api/v1/auth/user-profile',
}
