package com.stallion;

public class StallionConstants {
  public static final String MODULE_NAME = "Stallion";
  public static final String STALLION_PACKAGE_PATH = "/StallionPackage";
  public static final int DOWNLOAD_BUFFER_SIZE = 1024 * 256;
  public static final String API_BASE = "https://api.di-gi.in/api/v1";
  public static final String DOWNLOAD_API_PATH = "/client/bundle/download";
  public static final String DOWNLOAD_FOLDER_DIR = "/downloads";
  public static final String BUNDLE_DEST_FOLDER_DIR = "/stallion-build";
  public static final String SLOT_FOLDER_DIR = "/slots/";
  public static final String ZIP_FILE_NAME = "build.zip";
  public static final String UNZIP_FOLDER_NAME = "build";
  public static final String ANDROID_BUNDLE_FILE_NAME = "index.android.bundle";
  public static final String DEFAULT_JS_BUNDLE_LOCATION_BASE = "assets://";
  public static final String DOWNLOAD_PROGRESS_EVENT = "StallionDownloadProgress";

  // local storage constants
  public static final String SHARED_PREFERENCE_FILE = "StallionSharedPreference";
  public static final String ACTIVE_BUCKET_IDENTIFIER = "activeBucket";
  public static final String ACTIVE_VERSION_IDENTIFIER = "activeVersion";
  public static final String ACTIVE_SLOT_IDENTIFIER = "activeSlot";
  public static final String STALLION_SWITCH_STATE_IDENTIFIER = "switchState";
  public static final String STALLION_SWITCH_ON = "STALLION_ON";
  public static final String STALLION_SWITCH_OFF = "DEFAULT";

  // api key identifiers
  public static final String API_KEY_IDENTIFIER = "StallionApiKey";
  public static final String SECRET_KEY_IDENTIFIER = "StallionSecretKey";
  public static final String API_KEY_APP_IDENTIFIER = "apiKey";
  public static final String SECRET_KEY_APP_IDENTIFIER = "secretKey";

  // api key values -> default = ""
  public static String API_KEY_VALUE = "";
  public static String SECRET_KEY_VALUE = "";
}

