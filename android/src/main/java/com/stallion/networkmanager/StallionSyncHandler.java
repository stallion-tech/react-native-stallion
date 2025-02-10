package com.stallion.networkmanager;

import com.stallion.events.StallionEventManager;
import com.stallion.storage.StallionConfigConstants;
import com.stallion.storage.StallionMetaConstants;
import com.stallion.storage.StallionStateManager;
import com.stallion.storage.StallionConfig;
import com.stallion.utils.StallionSlotManager;
import com.stallion.events.StallionEventConstants.NativeProdEventTypes;

import org.json.JSONObject;
import java.util.concurrent.atomic.AtomicBoolean;

public class StallionSyncHandler {

  private static final AtomicBoolean isSyncInProgress = new AtomicBoolean(false);
  private static final AtomicBoolean isDownloadInProgress = new AtomicBoolean(false);

  public static void sync() {
    // Ensure only one sync job runs at a time
    if (!isSyncInProgress.compareAndSet(false, true)) {
      return; // Exit if another job is already running
    }

    new Thread(() -> {
      try {
        // Fetch StallionStateManager and StallionConfig
        StallionStateManager stateManager = StallionStateManager.getInstance();
        StallionConfig config = stateManager.getStallionConfig();

        // Use appVersion directly from StallionConfig
        String appVersion = config.getAppVersion();
        String projectId = config.getProjectId();
        String appliedBundleHash = stateManager.stallionMeta.getActiveReleaseHash();

        // Prepare payload for API call
        JSONObject requestPayload = new JSONObject();
        requestPayload.put("appVersion", appVersion);
        requestPayload.put("platform", "android");
        requestPayload.put("projectId", projectId);
        requestPayload.put("appliedBundleHash", appliedBundleHash);

        // Make API call using StallionApiManager
        JSONObject releaseMeta = StallionApiManager.post(
          StallionApiConstants.STALLION_API_BASE + StallionApiConstants.STALLION_INFO_API_PATH,
          requestPayload.toString()
        );

        // Process API response
        processReleaseMeta(releaseMeta, appVersion);

      } catch (Exception e) {
        emitSyncError(e);
      } finally {
        // Reset the flag to allow new jobs
        isSyncInProgress.set(false);
      }
    }).start();
  }
  private static void processReleaseMeta(JSONObject releaseMeta, String appVersion) {
    if (releaseMeta.optBoolean("success")) {
      JSONObject data = releaseMeta.optJSONObject("data");
      if (data == null) return;

      handleAppliedReleaseData(data.optJSONObject("appliedBundleData"), appVersion);
      handleNewReleaseData(data.optJSONObject("newBundleData"));
    }
  }

  private static void handleAppliedReleaseData(JSONObject appliedData, String appVersion) {
    if (appliedData == null) return;

    boolean isRolledBack = appliedData.optBoolean("isRolledBack");
    String targetAppVersion = appliedData.optString("targetAppVersion");
    if (isRolledBack && appVersion.equals(targetAppVersion)) {
      StallionSlotManager.rollbackProd(false, "");
    }
  }

  private static void handleNewReleaseData(JSONObject newReleaseData) {
    if (newReleaseData == null) return;

    String newReleaseUrl = newReleaseData.optString("downloadUrl");
    String newReleaseHash = newReleaseData.optString("checksum");

    StallionStateManager stateManager = StallionStateManager.getInstance();
    String lastRolledBackHash = stateManager.stallionMeta.getLastRolledBackHash();

    if (
        !newReleaseHash.isEmpty()
        && !newReleaseUrl.isEmpty()
        && !newReleaseHash.equals(lastRolledBackHash)
    ) {
      if(stateManager.getIsMounted()) {
        downloadNewRelease(newReleaseHash, newReleaseUrl);
      } else {
        stateManager.setPendingRelease(newReleaseUrl, newReleaseHash);
      }
    }
  }

  public static void downloadNewRelease(String newReleaseHash, String newReleaseUrl) {
    // Ensure only one download job runs at a time
    if (!isDownloadInProgress.compareAndSet(false, true)) {
      return; // Exit if another job is already running
    }
    try {
      StallionStateManager stateManager = StallionStateManager.getInstance();
      String downloadPath = stateManager.getStallionConfig().getFilesDirectory()
        + StallionConfigConstants.PROD_DIRECTORY
        + StallionConfigConstants.TEMP_FOLDER_SLOT;
      String projectId = stateManager.getStallionConfig().getProjectId();

      emitDownloadStarted(newReleaseHash);

      StallionFileDownloader.downloadBundle(
        newReleaseUrl + "?projectId=" + projectId,
        downloadPath,
        new StallionDownloadCallback() {
          @Override
          public void onReject(String prefix, String error) {
            isDownloadInProgress.set(false);
            emitDownloadError(newReleaseHash, prefix + error);
          }

          @Override
          public void onSuccess(String successPayload) {
            isDownloadInProgress.set(false);
            stateManager.stallionMeta.setCurrentProdSlot(StallionMetaConstants.SlotStates.NEW_SLOT);
            stateManager.stallionMeta.setProdTempHash(newReleaseHash);
            String currentProdNewHash = stateManager.stallionMeta.getProdNewHash();
            if(currentProdNewHash != null && !currentProdNewHash.isEmpty()) {
              StallionSlotManager.stabilizeProd();
            }
            stateManager.syncStallionMeta();
            emitDownloadSuccess(newReleaseHash);
          }

          @Override
          public void onProgress(double downloadFraction) {
            // Optional: Handle progress updates
          }
        }
      );
    } catch (Exception ignored) {
      isDownloadInProgress.set(false);
    }
  }

  private static void emitSyncError(Exception e) {
    JSONObject syncErrorPayload = new JSONObject();
    try {
      String syncErrorString = e.getMessage() != null ? e.getMessage() : "Unknown error";
      syncErrorPayload.put("meta", syncErrorString);
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEvent(
      NativeProdEventTypes.SYNC_ERROR_PROD.toString(),
      syncErrorPayload
    );
  }

  private static void emitDownloadError(String releaseHash, String error) {
    JSONObject errorPayload = new JSONObject();
    try {
      errorPayload.put("releaseHash", releaseHash);
      errorPayload.put("meta", error);
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEvent(
      NativeProdEventTypes.DOWNLOAD_ERROR_PROD.toString(),
      errorPayload
    );
  }

  private static void emitDownloadSuccess(String releaseHash) {
    JSONObject successPayload = new JSONObject();
    try {
      successPayload.put("releaseHash", releaseHash);
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEvent(
      NativeProdEventTypes.DOWNLOAD_COMPLETE_PROD.toString(),
      successPayload
    );
  }

  private static void emitDownloadStarted(String releaseHash) {
    JSONObject successPayload = new JSONObject();
    try {
      successPayload.put("releaseHash", releaseHash);
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEvent(
      NativeProdEventTypes.DOWNLOAD_STARTED_PROD.toString(),
      successPayload
    );
  }
}
