import { Platform } from 'react-native';
import { IStallionInitParams } from '../../types/utils.types';

export const HEADER_TITLE = 'Stallion';
export const Login_TITLE = 'Login to continue';
export const PROFILE_TITLE = 'Profile';
export const HEADER_SLAB_HEIGHT = 50;
export const STD_MARGIN = HEADER_SLAB_HEIGHT / 5;
export const END_REACH_THRESHOLD = 0;

export const DOWNLOAD_BUTTON_TEXT = 'Download';
export const DOWNLOADED_TEXT = 'Downloaded';
export const APPLIED_TEXT = 'Applied';
export const LOGOUT_BUTTON_TEXT = 'Logout';

export const FOOTER_INFO_TITLE = 'Active Bucket: ';
export const FOOTER_INFO_SUBTITLE = 'Version: ';
export enum SWITCH_TEXTS {
  ON = 'Testing',
  OFF = 'Production',
}

export enum FOOTER_SUB_TEXTS {
  PROD = 'User facing version',
  STAGE = 'Internal sharing version',
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

export const PIN_LENGTH = 6;

export const SUBMIT_BUTTON_TEXT = 'Continue';
export const PIN_BACK_BUTTON_TEXT = 'BACK';
export const PIN_INPUT_KEY = 'Enter PIN';

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
  SDK_TOKEN = 'x-sdk-access-token',
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

export enum NativeEventTypesProd {
  DOWNLOAD_STARTED_PROD = 'DOWNLOAD_STARTED_PROD',
  DOWNLOAD_ERROR_PROD = 'DOWNLOAD_ERROR_PROD',
  DOWNLOAD_PROGRESS_PROD = 'DOWNLOAD_PROGRESS_PROD',
  DOWNLOAD_COMPLETE_PROD = 'DOWNLOAD_COMPLETE_PROD',
  SYNC_ERROR_PROD = 'SYNC_ERROR_PROD',
  ROLLED_BACK_PROD = 'ROLLED_BACK_PROD',
  INSTALLED_PROD = 'INSTALLED_PROD',
  STABILIZED_PROD = 'STABILIZED_PROD',
  EXCEPTION_PROD = 'EXCEPTION_PROD',
  AUTO_ROLLED_BACK_PROD = 'AUTO_ROLLED_BACK_PROD',
}
export enum NativeEventTypesStage {
  DOWNLOAD_ERROR_STAGE = 'DOWNLOAD_ERROR_STAGE',
  DOWNLOAD_PROGRESS_STAGE = 'DOWNLOAD_PROGRESS_STAGE',
  DOWNLOAD_COMPLETE_STAGE = 'DOWNLOAD_COMPLETE_STAGE',
  INSTALLED_STAGE = 'INSTALLED_STAGE',
}

export const STALLION_NATIVE_EVENT = 'STALLION_NATIVE_EVENT';

export const RESTART_REQUIRED_MESSAGE =
  'Bundle change detected. Click to restart app.';

export const DEFAULT_STALLION_PARAMS: IStallionInitParams = {};

/* ------------------------------------------------------------------ *
 * Dev menu copy
 * ------------------------------------------------------------------ */

export const WORDMARK_TEXT = 'STALLION';

export const GLYPHS = {
  CLOSE: '✕',
  BACK: '‹',
  FORWARD: '›',
};

/**
 * Captions name the mode the switch would move to, not the one it is in — the
 * label above already states that. Flipping the switch only records the choice;
 * the app keeps running its current bundle until it is restarted.
 */
export enum TAB_CAPTIONS {
  STAGE = 'Switch on to run Production — what your customers run. Applies on restart.',
  PROD = 'Switch off to run Testing — bundles shared with your team. Applies on restart.',
}

export enum SECTION_LABELS {
  BUCKETS = 'BUCKETS',
  THIS_DEVICE = 'THIS DEVICE',
  NEW_BUNDLE = 'NEW BUNDLE',
  ACTIVE_BUNDLE = 'ACTIVE BUNDLE',
}

export enum CHIP_TEXTS {
  LATEST = 'Latest',
  DOWNLOADED = 'Downloaded',
  APPLIED = 'Applied',
}

export const RESTART_BUTTON_TEXT = 'Restart';
export const READ_MORE_TEXT = 'Read more';
export const READ_LESS_TEXT = 'Read less';

export enum BUNDLE_META_STATES {
  NOT_APPLIED = 'Not applied',
  APPLIES_ON_RESTART = 'Applies on restart',
  APPLIED = 'Applied',
}

export const META_SEPARATOR = ' · ';
/** Bundle cards title versions lowercase ("v3"); bucket meta uses "V3". */
export const BUNDLE_VERSION_PREFIX = 'v';
export const BUCKET_UPDATED_PREFIX = 'Updated ';
export const BUNDLE_COUNT_SUFFIX = ' bundles';
export const BUNDLE_COUNT_SUFFIX_SINGULAR = ' bundle';

export const DEVICE_ROW_APP_VERSION = 'App Version';
export const DEVICE_ROW_UID = 'UID';

export const PROD_EMPTY_TITLE = 'No bundles in Production';
export const PROD_EMPTY_SUBTITLE =
  'Promote a bundle from Testing and it will appear here.';

export const EMPTY_BUCKETS_TITLE = 'No buckets yet';
export const EMPTY_BUCKETS_SUBTITLE =
  'Create a bucket from the Stallion dashboard and it will appear here.';
export const EMPTY_BUNDLES_TITLE = 'No bundles in this bucket';
export const EMPTY_BUNDLES_SUBTITLE =
  'Upload a bundle from the Stallion CLI and it will appear here.';
export const GENERIC_ERROR_TITLE = 'Something went wrong';
