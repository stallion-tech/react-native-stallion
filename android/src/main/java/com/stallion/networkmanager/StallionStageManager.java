package com.stallion.networkmanager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.stallion.events.StallionEventConstants;
import com.stallion.events.StallionEventManager;
import com.stallion.storage.StallionConfigConstants;
import com.stallion.storage.StallionMetaConstants;
import com.stallion.storage.StallionStateManager;

import org.json.JSONObject;

public class StallionStageManager {
  public static void downloadStageBundle(ReadableMap bundleInfo, Promise promise) {
    StallionStateManager stallionStateManager = StallionStateManager.getInstance();
    String receivedDownloadUrl = bundleInfo.getString("url");
    String receivedHash = bundleInfo.getString("hash");
    if(
      receivedDownloadUrl != null
        && !receivedDownloadUrl.isEmpty()
        && receivedHash != null
        && !receivedHash.isEmpty()
    ) {
      String downloadPath = stallionStateManager.getStallionConfig().getFilesDirectory()
        + StallionConfigConstants.STAGE_DIRECTORY
        + StallionConfigConstants.TEMP_FOLDER_SLOT;

      StallionFileDownloader.downloadBundle(
        receivedDownloadUrl,
        downloadPath,
        new StallionDownloadCallback() {
          @Override
          public void onReject(String prefix, String error) {
            promise.reject(prefix, error);
          }

          @Override
          public void onSuccess(String successPayload) {
            stallionStateManager.stallionMeta.setCurrentStageSlot(StallionMetaConstants.SlotStates.NEW_SLOT);
            stallionStateManager.stallionMeta.setStageNewHash(receivedHash);
            stallionStateManager.syncStallionMeta();
            emitDownloadSuccessStage(receivedHash);
            promise.resolve(successPayload);
          }

          @Override
          public void onProgress(double downloadFraction) {
            emitDownloadProgressStage(receivedHash, downloadFraction);
          }
        }
      );
    }
  }

  private static void emitDownloadSuccessStage(String releaseHash) {
    JSONObject successPayload = new JSONObject();
    try {
      successPayload.put("releaseHash", releaseHash);
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEventWithoutCaching(
      StallionEventConstants.NativeStageEventTypes.DOWNLOAD_COMPLETE_STAGE.toString(),
      successPayload
    );
  }

  private static void emitDownloadProgressStage(String releaseHash, double newProgress) {
    JSONObject successPayload = new JSONObject();
    try {
      successPayload.put("releaseHash", releaseHash);
      successPayload.put("progress", String.valueOf(newProgress));
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEventWithoutCaching(
      StallionEventConstants.NativeStageEventTypes.DOWNLOAD_PROGRESS_STAGE.toString(),
      successPayload
    );
  }
}
