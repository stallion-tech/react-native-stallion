package com.stallion;

import android.content.Context;

public class Stallion {

  public static String getJSBundleFile(Context applicationContext) {
    return getJSBundleFile(applicationContext, null);
  }

  public static String getJSBundleFile (Context applicationContext, String defaultBundlePath) {
    StallionStorage.getInstance().Initialize(applicationContext);
    StallionStorage stallionStorageInstance =  StallionStorage.getInstance();
    if(
      stallionStorageInstance.get(StallionConstants.ACTIVE_BUCKET_IDENTIFIER) != null &&
        stallionStorageInstance.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER) != null &&
        stallionStorageInstance.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER).equals(StallionConstants.STALLION_SWITCH_ON)
    ) {
      return applicationContext.getFilesDir().getAbsolutePath() + StallionConstants.STALLION_PACKAGE_PATH + StallionConstants.BUNDLE_DEST_FOLDER_DIR + "/" + StallionConstants.UNZIP_FOLDER_NAME + "/" + StallionConstants.ANDROID_BUNDLE_FILE_NAME;
    } else {
      if(defaultBundlePath != null) return defaultBundlePath;
      return StallionConstants.DEFAULT_JS_BUNDLE_LOCATION_BASE + StallionConstants.ANDROID_BUNDLE_FILE_NAME;
    }
  }
}
