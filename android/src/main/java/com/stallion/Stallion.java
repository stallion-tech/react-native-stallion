package com.stallion;

import android.content.Context;

import com.stallion.events.StallionEventConstants;
import com.stallion.events.StallionEventManager;
import com.stallion.storage.StallionConfigConstants;
import com.stallion.storage.StallionStateManager;
import com.stallion.storage.StallionMeta;
import com.stallion.storage.StallionMetaConstants;
import com.stallion.utils.StallionFileManager;
import com.stallion.utils.StallionSlotManager;

import org.json.JSONObject;

import java.io.File;

public class Stallion {

  private static StallionStateManager stateManager;

  public static String getJSBundleFile(Context applicationContext) {
    return getJSBundleFile(applicationContext, null);
  }

  public static String getJSBundleFile(Context applicationContext, String defaultBundlePath) {
    StallionStateManager.init(applicationContext);
    stateManager = StallionStateManager.getInstance();

    validateAppVersion(stateManager.getStallionConfig().getAppVersion());

    StallionEventManager.init(stateManager);

    String baseFolderPath = stateManager.getStallionConfig().getFilesDirectory();
    StallionMeta stallionMeta = stateManager.stallionMeta;
    StallionMetaConstants.SwitchState switchState = stallionMeta.getSwitchState();

    if (switchState == StallionMetaConstants.SwitchState.PROD) {
      return getProdBundlePath(baseFolderPath, defaultBundlePath);
    } else if (switchState == StallionMetaConstants.SwitchState.STAGE) {
      return getStageBundlePath(baseFolderPath, defaultBundlePath);
    }
    return getDefaultBundle(defaultBundlePath);
  }

  private static void validateAppVersion(String currentAppVersion) {
    StallionStateManager stallionStateManager = StallionStateManager.getInstance();
    String cachedAppVersion = stallionStateManager.getString(StallionConfigConstants.STALLION_APP_VERSION_IDENTIFIER, "");;
    if (
      currentAppVersion != null
        && !currentAppVersion.isEmpty()
        && !cachedAppVersion.equals(currentAppVersion)
    ) {
      stallionStateManager.setString(StallionConfigConstants.STALLION_APP_VERSION_IDENTIFIER, currentAppVersion);
      StallionSlotManager.fallbackProd();
    }
  }

  private static void mountNewProdBundle(String baseFolderPath) {
    StallionMeta stallionMeta = stateManager.stallionMeta;
    String prodTempHash = stallionMeta.getProdTempHash();
    if(prodTempHash != null && !prodTempHash.isEmpty()) {
      try {
        StallionFileManager.moveFile(
          new File(baseFolderPath, StallionConfigConstants.PROD_DIRECTORY + StallionConfigConstants.TEMP_FOLDER_SLOT),
          new File(baseFolderPath, StallionConfigConstants.PROD_DIRECTORY + StallionConfigConstants.NEW_FOLDER_SLOT)
        );
        stallionMeta.setProdNewHash(prodTempHash);
        stallionMeta.setProdTempHash("");
        stateManager.syncStallionMeta();
        sendInstallEvent(prodTempHash);
      } catch (Exception ignored) {}
    }
  }

  private static void mountNewStageBundle(String baseFolderPath) {
    StallionMeta stallionMeta = stateManager.stallionMeta;
    String stageTempHash = stallionMeta.getStageTempHash();
    if(stageTempHash != null && !stageTempHash.isEmpty()) {
      try {
        StallionFileManager.moveFile(
          new File(baseFolderPath, StallionConfigConstants.STAGE_DIRECTORY + StallionConfigConstants.TEMP_FOLDER_SLOT),
          new File(baseFolderPath, StallionConfigConstants.STAGE_DIRECTORY + StallionConfigConstants.NEW_FOLDER_SLOT)
        );
        stallionMeta.setStageNewHash(stageTempHash);
        stallionMeta.setStageTempHash("");
        stateManager.syncStallionMeta();
      } catch (Exception ignored) {}
    }
  }

  private static String getProdBundlePath(String baseFolderPath, String defaultBundlePath) {
    StallionMeta stallionMeta = stateManager.stallionMeta;

    mountNewProdBundle(baseFolderPath);

    switch (stallionMeta.getCurrentProdSlot()) {
      case NEW_SLOT:
        return resolveBundlePath(baseFolderPath + StallionConfigConstants.PROD_DIRECTORY + StallionConfigConstants.NEW_FOLDER_SLOT, defaultBundlePath, stallionMeta.getProdNewHash(), true);
      case STABLE_SLOT:
        return resolveBundlePath(baseFolderPath + StallionConfigConstants.PROD_DIRECTORY + StallionConfigConstants.STABLE_FOLDER_SLOT, defaultBundlePath, stallionMeta.getProdStableHash(), true);
      default:
        return getDefaultBundle(defaultBundlePath);
    }
  }

  private static String getStageBundlePath(String baseFolderPath, String defaultBundlePath) {
    StallionMeta stallionMeta = stateManager.stallionMeta;

    mountNewStageBundle(baseFolderPath);

    switch (stallionMeta.getCurrentStageSlot()) {
      case NEW_SLOT:
        return resolveBundlePath(baseFolderPath + StallionConfigConstants.STAGE_DIRECTORY + StallionConfigConstants.NEW_FOLDER_SLOT, defaultBundlePath, stallionMeta.getStageNewHash(), false);
      default:
        return getDefaultBundle(defaultBundlePath);
    }
  }

  private static void sendInstallEvent(String releaseHash) {
    try {
      JSONObject eventPayload = new JSONObject();
      eventPayload.put("releaseHash", releaseHash);

      StallionEventManager.getInstance().sendEvent(
        StallionEventConstants.NativeProdEventTypes.INSTALLED_PROD.toString(),
        eventPayload
      );
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private static void sendCorruptionEvent(String releaseHash, String folderPath) {
    try {
      JSONObject eventPayload = new JSONObject();
      eventPayload.put("releaseHash", releaseHash);
      eventPayload.put("folderPath", folderPath);

      StallionEventManager.getInstance().sendEvent(
        StallionEventConstants.NativeProdEventTypes.CORRUPTED_FILE_ERROR.toString(),
        eventPayload
      );
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private static String resolveBundlePath(String folderPath, String defaultBundlePath, String releaseHash, Boolean isProd) {
    String bundlePath = folderPath + StallionConfigConstants.UNZIP_FOLDER_NAME + StallionConfigConstants.ANDROID_BUNDLE_FILE_NAME;
    if (new File(bundlePath).exists()) {
      return bundlePath;
    } else {
      if(isProd) {
        StallionSlotManager.rollbackProd(true, "Corruped file not found" + folderPath);
        sendCorruptionEvent(releaseHash, folderPath);
      } else {
        StallionSlotManager.rollbackStage();
      }
      return getDefaultBundle(defaultBundlePath);
    }
  }

  private static String getDefaultBundle(String defaultBundlePath) {
    return defaultBundlePath != null && !defaultBundlePath.isEmpty()
      ? defaultBundlePath
      : StallionConfigConstants.DEFAULT_JS_BUNDLE_LOCATION_BASE + StallionConfigConstants.ANDROID_BUNDLE_FILE_NAME;
  }
}

