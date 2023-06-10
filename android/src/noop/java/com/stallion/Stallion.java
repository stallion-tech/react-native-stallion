package com.stallion;

import android.content.Context;

public class Stallion {
  public static String getJSBundleFile (Context applicationContext) {
    return StallionConstants.DEFAULT_JS_BUNDLE_LOCATION_BASE + StallionConstants.ANDROID_BUNDLE_FILE_NAME;
  }
}
