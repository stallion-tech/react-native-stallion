package com.stallion;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.res.Resources;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONObject;

public class StallionSynManager {
  public static void sync() {
    try {
      StallionStorage stallionStorage = StallionStorage.getInstance();
      Context appContext = stallionStorage.mContext;
      String parentPackageName= appContext.getPackageName();
      PackageInfo pInfo = appContext.getPackageManager().getPackageInfo(parentPackageName, 0);
      String appVersion = pInfo.versionName;
      Resources res = appContext.getResources();
      int stallionProjectIdRes = res.getIdentifier(StallionConstants.STALLION_PROJECT_ID_IDENTIFIER, "string", parentPackageName);
      int stallionTokenRes = res.getIdentifier(StallionConstants.STALLION_APP_TOKEN_IDENTIFIER, "string", parentPackageName);
      String projectId = appContext.getString(stallionProjectIdRes);
      String appToken = appContext.getString(stallionTokenRes);
      String platform = "android";

      StallionStorage stallionStorageInstance = StallionStorage.getInstance();
      String currentProdSlot = stallionStorageInstance.get(StallionConstants.CURRENT_PROD_SLOT_KEY);
      String appliedBundleHash = stallionStorageInstance.get(StallionConstants.PROD_DIRECTORY + currentProdSlot);
      JSONObject releaseMeta = StallionApiUtil.post(
        StallionConstants.STALLION_API_BASE + StallionConstants.STALLION_INFO_API_PATH,
        String.format(String.format("{\"appVersion\": \"%s\", \"platform\": \"%s\", \"projectId\": \"%s\", \"appliedBundleHash\": \"%s\" }", appVersion, platform, projectId, appliedBundleHash)),
        appToken
      );
      if(releaseMeta.optBoolean("success")) {
        JSONObject data = releaseMeta.optJSONObject("data");
        if(data == null) return;
        JSONObject newReleaseData = data.optJSONObject("newBundleData");
        JSONObject appliedReleaseData = data.optJSONObject("appliedBundleData");
        if(appliedReleaseData != null) {
          boolean isRolledBack = appliedReleaseData.optBoolean("isRolledBack");
          String targetAppVersion = appliedReleaseData.optString("targetAppVersion");
          if(isRolledBack && targetAppVersion.equals(appVersion)) {
            StallionRollbackManager.rollbackProd();
          }
        }
        if(newReleaseData == null) return;
        String newReleaseUrl = newReleaseData.optString("downloadUrl");
        String newReleaseHash = newReleaseData.optString("checksum");
        stallionStorage.set(StallionConstants.NEW_RELEASE_HASH_ID, newReleaseHash);
        stallionStorage.set(StallionConstants.NEW_RELEASE_URL_ID, newReleaseUrl);
      }
    } catch (Exception e) {
      WritableMap syncErrorPayload = Arguments.createMap();
      syncErrorPayload.putString("error", e.toString().substring(0,100));
      StallionEventEmitter.sendEvent(
        StallionEventEmitter.getEventPayload(
          StallionConstants.NativeEventTypesProd.SYNC_ERROR_PROD.toString(),
          syncErrorPayload
        )
      );
    }
  }

  public static void checkAndDownload () {
    StallionStorage stallionStorage = StallionStorage.getInstance();
    Context appContext = stallionStorage.mContext;
    String parentPackageName= appContext.getPackageName();
    String newReleaseHash = stallionStorage.get(StallionConstants.NEW_RELEASE_HASH_ID);
    String newReleaseUrl = stallionStorage.get(StallionConstants.NEW_RELEASE_URL_ID);
    if(!newReleaseUrl.isEmpty() && !newReleaseHash.isEmpty()) {
      Resources res = appContext.getResources();
      int stallionProjectIdRes = res.getIdentifier(StallionConstants.STALLION_PROJECT_ID_IDENTIFIER, "string", parentPackageName);
      int stallionTokenRes = res.getIdentifier(StallionConstants.STALLION_APP_TOKEN_IDENTIFIER, "string", parentPackageName);
      String projectId = appContext.getString(stallionProjectIdRes);
      String appToken = appContext.getString(stallionTokenRes);
      stallionStorage.set(StallionConstants.NEW_RELEASE_HASH_ID, "");
      stallionStorage.set(StallionConstants.NEW_RELEASE_URL_ID, "");
      WritableMap newReleasePayload = Arguments.createMap();
      newReleasePayload.putString("releaseHash", newReleaseHash);
      StallionEventEmitter.sendEvent(
        StallionEventEmitter.getEventPayload(
          StallionConstants.NativeEventTypesProd.DOWNLOAD_STARTED_PROD.toString(),
          newReleasePayload
        )
      );
      StallionDownloadManager.downloadBundle(
        newReleaseUrl + "?projectId=" + projectId,
        appContext.getFilesDir().getAbsolutePath() + StallionConstants.PROD_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT,
        "",
        appToken,
        new StallionDownloadCallback() {
          @Override
          public void onReject(String prefix, String error) {
            WritableMap errorEventPayload = Arguments.createMap();
            errorEventPayload.putString("releaseHash", newReleaseHash);
            StallionEventEmitter.sendEvent(
              StallionEventEmitter.getEventPayload(
                StallionConstants.NativeEventTypesProd.DOWNLOAD_ERROR_PROD.toString(),
                errorEventPayload
              )
            );
          }

          @Override
          public void onSuccess(String successPayload) {
            stallionStorage.set(StallionConstants.CURRENT_PROD_SLOT_KEY, StallionConstants.TEMP_FOLDER_SLOT);
            stallionStorage.set(StallionConstants.PROD_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT, newReleaseHash);
            WritableMap successEventPayload = Arguments.createMap();
            successEventPayload.putString("releaseHash", newReleaseHash);
            StallionEventEmitter.sendEvent(
              StallionEventEmitter.getEventPayload(
                StallionConstants.NativeEventTypesProd.DOWNLOAD_COMPLETE_PROD.toString(),
                successEventPayload
              )
            );
          }

          @Override
          public void onProgress(double downloadFraction) {
            WritableMap progressEventPayload = Arguments.createMap();
            progressEventPayload.putString("releaseHash", newReleaseHash);
            progressEventPayload.putDouble("progress", downloadFraction);
            StallionEventEmitter.sendEvent(
              StallionEventEmitter.getEventPayload(
                StallionConstants.NativeEventTypesProd.DOWNLOAD_PROGRESS_PROD.toString(),
                progressEventPayload
              )
            );
          }
        }
      );
    }
  }
}
