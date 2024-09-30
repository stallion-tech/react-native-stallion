import { Platform } from 'react-native';

export const HEADER_TITLE = 'Stallion';
export const Login_TITLE = 'Login';
export const PROFILE_TITLE = 'Profile';
export const HEADER_SLAB_HEIGHT = 50;
export const STD_MARGIN = HEADER_SLAB_HEIGHT / 5;
export const END_REACH_THRESHOLD = 0;

export const CLOSE_BUTTON_TEXT = 'close';
export const BACK_BUTTON_TEXT = 'back';
export const DOWNLOAD_BUTTON_TEXT = 'Download';
export const DOWNLOADED_TEXT = 'Downloaded';
export const APPLIED_TEXT = 'Applied';
export const LOGOUT_BUTTON_TEXT = 'Logout';

export const FOOTER_INFO_TITLE = 'Active Bucket: ';
export const FOOTER_INFO_SUBTITLE = 'Version: ';
export enum SWITCH_TEXTS {
  ON = 'STAGE',
  OFF = 'PROD',
}

export const SWITCH_TITLE = 'Switch ';
export const BUCKET_CARD_UPDATED_TEXT = 'Updated at: ';
export const BUCKET_CARD_BUNDLE_COUNT_TEXT = 'Bundles: ';
export const BUCKET_CARD_AUTHOR_TEXT = 'Author: ';

export const BUNDLE_CARD_RELEASE_NOTE = 'Release Note: ';
export const BUNDLE_CARD_AUTHOR = 'Author';

export const DOWNLOAD_PROGRESS_EVENT = 'StallionDownloadProgress';

export const DEFAULT_ERROR_MESSAGE =
  'Something went wrong. Check your network connection';
export const EMPTY_ERROR_MESSAGE = 'No buckets found';
export const EMPTY_ERROR_MESSAGE_BUNDLE = 'No bundles found';
export const EMPTY_DOWNLOAD_MESSAGE = 'No bundle is downloaded yet';
export const DEFAULT_ERROR_PREFIX = 'Error: ';
export const VERSION_PREFIX = 'V';
export const RETRY_BUTTON_TEXT = 'Retry';

export const CURRENT_PLATFORM = Platform.OS;
export const IS_ANDROID = CURRENT_PLATFORM === 'android';

export const KEYBOARD_AVOIDING_BEHAVIOUR = IS_ANDROID ? 'height' : 'padding';

export enum LOGIN_PAGE_KEYS {
  email = 'Email',
  password = 'Password',
}

export enum CARD_TYPES {
  BUNDLE = 'BUNDLE',
  BUCKET = 'BUCKET',
}

export const BUNDLE_APPLIED_TEXT = 'Applied';
export const DOWNLOADING_TEXT = 'Downloading';

export const EMPTY_STATE = {
  data: null,
  isLoading: false,
  error: null,
};

export const OTP_LENGTH = 6;

export const SUBMIT_BUTTON_TEXT = 'SUBMIT';
export const OTP_BACK_BUTTON_TEXT = 'BACK';
export const OTP_INPUT_KEY = 'Enter OTP';

export const NOT_APPLICABLE_TEXT = 'N/A';

export enum BUCKET_CARD_TEXTS {
  DOWNLOADED = 'Downloaded',
  APPLIED = 'Applied',
  VERSION = 'Version',
  BUNDLES = 'Bundles',
  UPDATED = 'Updated',
}

export enum SWITCH_STATE_KEYS {
  Enabled = 'True',
  Disabled = 'False',
}

export const NO_RELEASE_NOTE_TEXT = 'No release note provided';

export const STALLION_LOGO_URL =
  'https://d2shjbuzwp1rpv.cloudfront.net/stallion_logo.png';

export const STALLION_EB_INFO =
  'A crash occurred in the app. We have switched Stallion off. Check crash report below. Continue crash to invoke other exception handlers.';
export const STALLION_EB_BTN_TXT = 'Continue Crash';

export const DOWNLOAD_ALERT_HEADER = 'Download Successful';
export const DOWNLOAD_ALERT_SWITCH_MESSAGE = 'Stallion has been switched on. ';
export const DOWNLOAD_ALERT_MESSAGE =
  'Restart the app for changes to take effect.';
export const DOWNLOAD_ALERT_BUTTON = 'Ok';

export enum NATIVE_CONSTANTS {
  SDK_TOKEN = 'x-sdk-token',
  APP_TOKEN = 'x-app-token',
  SWITCH_STATE_INDENTIFIER = 'switchState',
  PROD_DIRECTORY = '/StallionProd',
  STAGE_DIRECTORY = '/StallionStage',
  TEMP_FOLDER_SLOT = '/temp',
  NEW_FOLDER_SLOT = '/StallionNew',
  STABLE_FOLDER_SLOT = '/StallionStable',
  DEFAULT_FOLDER_SLOT = '/Default',
  CURRENT_PROD_SLOT_KEY = 'stallionProdCurrentSlot',
  CURRENT_STAGE_SLOT_KEY = 'stallionStageCurrentSlot',
}

export const STALLION_NATIVE_EVENT = 'STALLION_NATIVE_EVENT';
