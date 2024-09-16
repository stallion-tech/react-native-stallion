package com.stallion;

public class StallionConstants {
  public static final String MODULE_NAME = "Stallion";
  public static final String STALLION_PACKAGE_PATH = "/StallionPackage";
  public static final int DOWNLOAD_BUFFER_SIZE = 1024 * 256;

  public static final String DOWNLOAD_ERROR_PREFIX = "Stallion download error: ";
  public static final String DOWNLOAD_FOLDER_DIR = "/downloads";
  public static final String BUNDLE_DEST_FOLDER_DIR = "/stallion-build";
  public static final String SLOT_FOLDER_DIR = "/slots/";
  public static final String ZIP_FILE_NAME = "build.zip";
  public static final String UNZIP_FOLDER_NAME = "build";
  public static final String ANDROID_BUNDLE_FILE_NAME = "index.android.bundle";
  public static final String DEFAULT_JS_BUNDLE_LOCATION_BASE = "assets://";
  public static final String DOWNLOAD_PROGRESS_EVENT = "StallionDownloadProgress";

  public static final String ACTIVE_BUCKET_IDENTIFIER = "activeBucket";
  public static final String ACTIVE_VERSION_IDENTIFIER = "activeVersion";
  public static final String ACTIVE_SLOT_IDENTIFIER = "activeSlot";
  public static final String STALLION_SWITCH_STATE_IDENTIFIER = "switchState";
  public static final String API_KEY_IDENTIFIER = "apiKey";
  public static final String STALLION_SWITCH_ON = "STALLION_ON";
  public static final String STALLION_SWITCH_OFF = "DEFAULT";

  public static final String DOWNLOAD_SUCCESS_MESSAGE = "Success";

  public static final String DOWNLOAD_API_ERROR_MESSAGE = "Download API error";

  public static final String DOWNLOAD_FILESYSTEM_ERROR_MESSAGE = "Filesystem error in download";

  public static final String GENERIC_ERROR = "Something went wrong internally";

  public static final String DOWNLOAD_DELETE_ERROR = "Download operation cleanup error";


  public static final String PROD_DIRECTORY = "/StallionProd";
  public static final String STAGE_DIRECTORY = "/StallionStage";
  public static final String TEMP_DOWNLOAD_FOLDER = "/temp";
  public static final String NEW_FOLDER_SLOT = "/StallionNew";
  public static final String STABLE_FOLDER_SLOT = "/StallionStable";
  public static final String DEFAULT_FOLDER_SLOT = "/Default";

  public static final String CURRENT_SLOT_KEY = "stallionCurrentSlot";
  public static final String STALLION_API_BASE = "https://staging-api.redhorse.tech";
  public static final String STALLION_INFO_API_PATH = "/api/v1/prod-bundles/get-update-meta";
  public static final String STALLION_PROJECT_ID_IDENTIFIER = "StallionProjectId";
  public static final String STALLION_APP_TOKEN_IDENTIFIER = "StallionAppToken";
  public static final String STALLION_APP_TOKEN_KEY = "x-app-token";
}

