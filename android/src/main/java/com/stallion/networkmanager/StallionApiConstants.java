package com.stallion.networkmanager;

public class StallionApiConstants {
  // Buffer Size
  public static final int DOWNLOAD_BUFFER_SIZE = 1024 * 256;

  // File and Folder Names
  public static final String ZIP_FILE_NAME = "build.zip";
  public static final String UNZIP_FOLDER_NAME = "/build";
  public static final String ANDROID_BUNDLE_FILE_NAME = "/index.android.bundle";

  // Error Messages
  public static final String DOWNLOAD_ERROR_PREFIX = "Stallion download error: ";
  public static final String DOWNLOAD_FILESYSTEM_ERROR_MESSAGE = "Filesystem error in download";
  public static final String CORRUPTED_FILE_ERROR = "Corrupted file";

  // Success Messages
  public static final String DOWNLOAD_SUCCESS_MESSAGE = "Success";

  // API Tokens
  public static final String STALLION_APP_TOKEN_KEY = "x-app-token";
  public static final String STALLION_SDK_TOKEN_KEY = "x-sdk-pin-access-token";
  public static final String STALLION_DEVICE_ID_KEY = "uid";


  public static final String STALLION_API_BASE = "https://api.stalliontech.io";
  public static final String STALLION_INFO_API_PATH = "/api/v1/promoted/get-update-meta";
}
