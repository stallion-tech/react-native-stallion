package com.stallion;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import java.io.File;

public class Stallion {

  public static String getJSBundleFile(Context applicationContext) {
    return getJSBundleFile(applicationContext, null);
  }

  private static String getDefaultBundle(String defaultBundlePath) {
    if(defaultBundlePath != null && !defaultBundlePath.isEmpty()) {
      return defaultBundlePath;
    } else {
      return StallionConstants.DEFAULT_JS_BUNDLE_LOCATION_BASE + StallionConstants.ANDROID_BUNDLE_FILE_NAME;
    }
  }

  private static String getAppVersion() throws PackageManager.NameNotFoundException {
    Context appContext = StallionStorage.getInstance().mContext;
    String parentPackageName= appContext.getPackageName();
    PackageInfo pInfo = appContext.getPackageManager().getPackageInfo(parentPackageName, 0);
    return pInfo.versionName;
  }

  private static void sendInstallEvent(String installedReleaseHash) {
    WritableMap successEventPayload = Arguments.createMap();
    successEventPayload.putString("releaseHash", installedReleaseHash);
    StallionEventEmitter.sendEvent(
      StallionEventEmitter.getEventPayload(
        StallionConstants.NativeEventTypesProd.INSTALLED_PROD.toString(),
        successEventPayload
      )
    );
  }

  public static String getJSBundleFile(Context applicationContext, String defaultBundlePath) {
    StallionStorage.getInstance().Initialize(applicationContext);
    StallionStorage stallionStorageInstance = StallionStorage.getInstance();
    String baseFolderPath = applicationContext.getFilesDir().getAbsolutePath();
    String switchState = stallionStorageInstance.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER);
    String currentAppVersion = "";
    try {
      String stallionAppVersionCache = stallionStorageInstance.get(StallionConstants.STALLION_APP_VERSION_IDENTIFIER);
        currentAppVersion = getAppVersion();
        if(!stallionAppVersionCache.equals(currentAppVersion)) {
          stallionStorageInstance.set(StallionConstants.STALLION_APP_VERSION_IDENTIFIER, currentAppVersion);
          StallionRollbackManager.fallbackProd();
        }

    } catch (PackageManager.NameNotFoundException e) {}

    if(switchState.isEmpty()) {
      stallionStorageInstance.set(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER, StallionConstants.SwitchState.PROD.toString());
      switchState = StallionConstants.SwitchState.PROD.toString();
    }
    if(switchState.equals(StallionConstants.SwitchState.PROD.toString())) {
      String currentProdSlot = stallionStorageInstance.get(StallionConstants.CURRENT_PROD_SLOT_KEY);
      switch (currentProdSlot) {
        case StallionConstants.TEMP_FOLDER_SLOT:
          StallionFileUtil.moveFile(
            new File(baseFolderPath, StallionConstants.PROD_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT),
            new File(baseFolderPath, StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT)
          );
          String tempReleaseHash = stallionStorageInstance.get(StallionConstants.PROD_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT);
          stallionStorageInstance.set(StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT, tempReleaseHash);
          stallionStorageInstance.set(StallionConstants.CURRENT_PROD_SLOT_KEY, StallionConstants.NEW_FOLDER_SLOT);
          stallionStorageInstance.set(StallionConstants.PROD_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT, "");
          sendInstallEvent(tempReleaseHash);
          return baseFolderPath + StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT + StallionConstants.UNZIP_FOLDER_NAME + StallionConstants.ANDROID_BUNDLE_FILE_NAME;
        case StallionConstants.NEW_FOLDER_SLOT:
          return baseFolderPath + StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT + StallionConstants.UNZIP_FOLDER_NAME + StallionConstants.ANDROID_BUNDLE_FILE_NAME;
        case StallionConstants.STABLE_FOLDER_SLOT:
          return baseFolderPath + StallionConstants.PROD_DIRECTORY + StallionConstants.STABLE_FOLDER_SLOT + StallionConstants.UNZIP_FOLDER_NAME + StallionConstants.ANDROID_BUNDLE_FILE_NAME;
        default:
          return getDefaultBundle(defaultBundlePath);
      }
    }
    if(switchState.equals(StallionConstants.SwitchState.STAGE.toString())) {
      String currentStageSlot = stallionStorageInstance.get(StallionConstants.CURRENT_STAGE_SLOT_KEY);
      switch (currentStageSlot) {
        case StallionConstants.TEMP_FOLDER_SLOT:
          StallionFileUtil.moveFile(
            new File(baseFolderPath, StallionConstants.STAGE_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT),
            new File(baseFolderPath, StallionConstants.STAGE_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT)
          );
          String tempReleaseHash = stallionStorageInstance.get(StallionConstants.STAGE_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT);
          stallionStorageInstance.set(StallionConstants.STAGE_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT, tempReleaseHash);
          stallionStorageInstance.set(StallionConstants.STAGE_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT, "");
          stallionStorageInstance.set(StallionConstants.CURRENT_STAGE_SLOT_KEY, StallionConstants.NEW_FOLDER_SLOT);
          return baseFolderPath + StallionConstants.STAGE_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT + StallionConstants.UNZIP_FOLDER_NAME + StallionConstants.ANDROID_BUNDLE_FILE_NAME;
        case StallionConstants.NEW_FOLDER_SLOT:
          return baseFolderPath + StallionConstants.STAGE_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT + StallionConstants.UNZIP_FOLDER_NAME + StallionConstants.ANDROID_BUNDLE_FILE_NAME;
        default:
          return getDefaultBundle(defaultBundlePath);
      }
    }
    return getDefaultBundle(defaultBundlePath);
  }
}
