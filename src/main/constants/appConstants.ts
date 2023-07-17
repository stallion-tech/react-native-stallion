import { Platform } from 'react-native';

export const HEADER_TITLE = 'Stallion';
export const Login_TITLE = 'Login';
export const HEADER_SLAB_HEIGHT = 50;
export const STD_MARGIN = HEADER_SLAB_HEIGHT / 5;

export const CLOSE_BUTTON_TEXT = 'close';
export const BACK_BUTTON_TEXT = 'back';
export const DOWNLOAD_BUTTON_TEXT = 'Download';
export const DOWNLOADED_TEXT = 'Downloaded';

export const FOOTER_INFO_TITLE = 'Active Bucket: ';
export const FOOTER_INFO_SUBTITLE = 'Version: ';
export enum SWITCH_TEXTS {
  ON = 'Enabled',
  OFF = 'Disabled',
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

export const IS_ANDROID = Platform.OS === 'android';

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
