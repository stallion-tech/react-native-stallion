package com.stallion;

public class StallionConstants {
  public static final String MODULE_NAME = "Stallion";
  public static final int DOWNLOAD_BUFFER_SIZE = 1024 * 256;

  public static final String DOWNLOAD_ERROR_PREFIX = "Stallion download error: ";

  public static final String ZIP_FILE_NAME = "build.zip";
  public static final String UNZIP_FOLDER_NAME = "/build";
  public static final String ANDROID_BUNDLE_FILE_NAME = "/index.android.bundle";
  public static final String DEFAULT_JS_BUNDLE_LOCATION_BASE = "assets:/";

  public static final String STALLION_SWITCH_STATE_IDENTIFIER = "switchState";
  public static final String STALLION_APP_VERSION_IDENTIFIER = "stallionAppVersion";

  public static final String DOWNLOAD_SUCCESS_MESSAGE = "Success";

  public static final String DOWNLOAD_API_ERROR_MESSAGE = "Download API error";

  public static final String DOWNLOAD_FILESYSTEM_ERROR_MESSAGE = "Filesystem error in download";

  public static final String GENERIC_ERROR = "Something went wrong internally";

  public static final String DOWNLOAD_DELETE_ERROR = "Download operation cleanup error";


  public static final String PROD_DIRECTORY = "/StallionProd";
  public static final String STAGE_DIRECTORY = "/StallionStage";
  public static final String TEMP_FOLDER_SLOT = "/temp";
  public static final String NEW_FOLDER_SLOT = "/StallionNew";
  public static final String STABLE_FOLDER_SLOT = "/StallionStable";
  public static final String DEFAULT_FOLDER_SLOT = "/Default";

  public static final String CURRENT_PROD_SLOT_KEY = "stallionProdCurrentSlot";
  public static final String CURRENT_STAGE_SLOT_KEY = "stallionStageCurrentSlot";
  public static final String STALLION_API_BASE = "https://staging-api.redhorse.tech";
  public static final String STALLION_INFO_API_PATH = "/api/v1/promoted/get-update-meta";
  public static final String STALLION_PROJECT_ID_IDENTIFIER = "StallionProjectId";
  public static final String STALLION_APP_TOKEN_IDENTIFIER = "StallionAppToken";
  public static final String NEW_RELEASE_INSTALL_IDENTIFIER = "StallionNewRelease";
  public static final String STALLION_APP_TOKEN_KEY = "x-app-token";
  public static final String STALLION_SDK_TOKEN_KEY = "x-sdk-token";

  public static final String NEW_RELEASE_HASH_ID = "stallionNewReleaseHash";
  public static final String NEW_RELEASE_URL_ID = "stallionNewReleaseUrl";

  public static enum SwitchState {
    PROD,
    STAGE
  }
  public  static final String STALLION_NATIVE_EVENT_NAME = "STALLION_NATIVE_EVENT";
  public enum NativeEventTypesProd {
    DOWNLOAD_STARTED_PROD,
    DOWNLOAD_ERROR_PROD,
    DOWNLOAD_PROGRESS_PROD,
    DOWNLOAD_COMPLETE_PROD,
    SYNC_ERROR_PROD,
    ROLLED_BACK_PROD,
    INSTALLED_PROD,
    STABILIZED_PROD,
    EXCEPTION_PROD
  }
  public  enum NativeEventTypesStage {
    DOWNLOAD_ERROR_STAGE,
    DOWNLOAD_PROGRESS_STAGE,
    DOWNLOAD_COMPLETE_STAGE,
  }
}

