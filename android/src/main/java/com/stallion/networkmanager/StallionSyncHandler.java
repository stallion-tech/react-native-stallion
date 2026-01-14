package com.stallion.networkmanager;

import com.stallion.events.StallionEventConstants;
import com.stallion.events.StallionEventManager;
import com.stallion.storage.StallionConfigConstants;
import com.stallion.storage.StallionMetaConstants;
import com.stallion.storage.StallionStateManager;
import com.stallion.storage.StallionConfig;
import com.stallion.utils.StallionDeviceInfo;
import com.stallion.utils.StallionFileManager;
import com.stallion.utils.StallionSignatureVerification;
import com.stallion.utils.StallionSlotManager;
import com.stallion.events.StallionEventConstants.NativeProdEventTypes;

import org.json.JSONObject;

import java.io.File;
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
        // Attach device metadata for analytics
        requestPayload.put("deviceMeta", StallionDeviceInfo.getDeviceMetaJson(config));

        // Make API call using StallionApiManager
        JSONObject releaseMeta = StallionApiManager.post(
          StallionApiConstants.STALLION_API_BASE + StallionApiConstants.STALLION_INFO_API_PATH,
          requestPayload.toString()
        );

        // Process API response
        processReleaseMeta(releaseMeta, appVersion);
        stateManager.setIsSyncSuccessful(true);
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

    // Extract diffData if it exists
    JSONObject diffData = newReleaseData.optJSONObject("bundleDiff");
    String diffUrl = null;
    boolean isBundlePatched = false;
    String bundleDiffId = null;
    if (diffData != null) {
      diffUrl = diffData.optString("url");
      if (diffUrl != null && diffUrl.isEmpty()) {
        diffUrl = null;
      }
      isBundlePatched = diffData.optBoolean("isBundlePatched", false);
      bundleDiffId = diffData.optString("id");
      if (bundleDiffId != null && bundleDiffId.isEmpty()) {
        bundleDiffId = null;
      }
    }

    StallionStateManager stateManager = StallionStateManager.getInstance();
    String lastRolledBackHash = stateManager.stallionMeta.getLastRolledBackHash();
    String lastUnverifiedHash = stateManager.getStallionConfig().getLastUnverifiedHash();

    if (
          !newReleaseHash.isEmpty()
          && !newReleaseUrl.isEmpty()
          && !newReleaseHash.equals(lastRolledBackHash)
          && !newReleaseHash.equals(lastUnverifiedHash)
    ) {
      if(stateManager.getIsMounted()) {
        downloadNewRelease(newReleaseHash, newReleaseUrl, diffUrl, isBundlePatched, bundleDiffId);
      } else {
        stateManager.setPendingRelease(newReleaseUrl, newReleaseHash, diffUrl, isBundlePatched, bundleDiffId);
      }
    }
  }

  // Overloaded method for backward compatibility
  public static void downloadNewRelease(String newReleaseHash, String newReleaseUrl) {
    downloadNewRelease(newReleaseHash, newReleaseUrl, null, false);
  }

  // Overloaded method for backward compatibility
  public static void downloadNewRelease(String newReleaseHash, String newReleaseUrl, String diffUrl) {
    downloadNewRelease(newReleaseHash, newReleaseUrl, diffUrl, false, null);
  }

  // Overloaded method for backward compatibility
  public static void downloadNewRelease(String newReleaseHash, String newReleaseUrl, String diffUrl, boolean isBundlePatched) {
    downloadNewRelease(newReleaseHash, newReleaseUrl, diffUrl, isBundlePatched, null);
  }

  public static void downloadNewRelease(String newReleaseHash, String newReleaseUrl, String diffUrl, boolean isBundlePatched, String bundleDiffId) {
    // Ensure only one download job runs at a time
    if (!isDownloadInProgress.compareAndSet(false, true)) {
      return; // Exit if another job is already running
    }
    try {
      StallionStateManager stateManager = StallionStateManager.getInstance();
      StallionConfig config = stateManager.getStallionConfig();
      String downloadPath = config.getFilesDirectory()
        + StallionConfigConstants.PROD_DIRECTORY
        + StallionConfigConstants.TEMP_FOLDER_SLOT;
      String projectId = config.getProjectId();

      // Use diffUrl if it exists, otherwise use newReleaseUrl
      String urlToDownload = (diffUrl != null && !diffUrl.isEmpty()) ? diffUrl : newReleaseUrl;
      String downloadUrl = urlToDownload + "?projectId=" + projectId;
      String publicSigningKey = config.getPublicSigningKey();

      // Track if this is a diff download
      final boolean isDiffDownload = (diffUrl != null && !diffUrl.isEmpty());
      // Store original newReleaseUrl for potential retry
      final String originalNewReleaseUrl = newReleaseUrl;
      // Store isBundlePatched flag for patch handler
      final boolean isBundlePatchedFlag = isBundlePatched;
      // Store bundleDiffId for events
      final String bundleDiffIdForEvents = bundleDiffId;

      long alreadyDownloaded = StallionDownloadCacheManager.getDownloadCache(config, downloadUrl, downloadPath);

      emitDownloadStarted(newReleaseHash, alreadyDownloaded > 0, bundleDiffIdForEvents);

      StallionFileDownloader.downloadBundle(
        downloadUrl,
        downloadPath,
        alreadyDownloaded,
        new StallionDownloadCallback() {
          @Override
          public void onReject(String prefix, String error) {
            isDownloadInProgress.set(false);
            emitDownloadError(newReleaseHash, prefix + error);
          }

          @Override
          public void onSuccess(String successPayload) {
            isDownloadInProgress.set(false);
            StallionDownloadCacheManager.deleteDownloadCache(downloadPath);

            // If this was a diff download, handle patch
            if (isDiffDownload) {
              try {
                // Get base bundle path from current slot
                String slotPath = stateManager.stallionMeta.getCurrentProdSlotPath();
                String baseBundlePath = config.getFilesDirectory()
                  + StallionConfigConstants.PROD_DIRECTORY
                  + slotPath;

                // Invoke patch handler with isBundlePatched flag
                StallionPatchHandler.applyPatch(baseBundlePath, downloadPath, isBundlePatchedFlag);
              } catch (Exception e) {
                // Patch application failed, retry with full bundle download
                // Clean up the failed diff download
                StallionFileManager.deleteFileOrFolderSilently(new File(downloadPath));
                isDownloadInProgress.set(false);
                // Retry download with full bundle (no diffUrl)
                downloadNewRelease(newReleaseHash, originalNewReleaseUrl, null, false, null);
                return;
              }
            }

            if(publicSigningKey != null && !publicSigningKey.isEmpty()) {
              if(
                !StallionSignatureVerification.verifyReleaseSignature(
                downloadPath + StallionConfigConstants.UNZIP_FOLDER_NAME,
                publicSigningKey)
              ) {
                // discard the downloaded release
                config.setLastUnverifiedHash(newReleaseHash);
                emitSignatureVerificationFailed(newReleaseHash);
                StallionFileManager.deleteFileOrFolderSilently(new File(downloadPath));
                return;
              }
            }

          stateManager.stallionMeta.setCurrentProdSlot(StallionMetaConstants.SlotStates.NEW_SLOT);
          stateManager.stallionMeta.setProdTempHash(newReleaseHash);
          String currentProdNewHash = stateManager.stallionMeta.getProdNewHash();
          if(currentProdNewHash != null && !currentProdNewHash.isEmpty()) {
            StallionSlotManager.stabilizeProd();
          }
          stateManager.syncStallionMeta();
          emitDownloadSuccess(newReleaseHash, bundleDiffIdForEvents);
          }

          @Override
          public void onProgress(double downloadFraction) {
            // Optional: Handle progress updates
            emitDownloadProgressProd(newReleaseHash, downloadFraction);
          }
        }
      );
    } catch (Exception ignored) {
      isDownloadInProgress.set(false);
    }
  }

  private static void emitDownloadProgressProd(String releaseHash, double newProgress) {
    JSONObject successPayload = new JSONObject();
    try {
      successPayload.put("releaseHash", releaseHash);
      successPayload.put("progress", String.valueOf(newProgress));
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEventWithoutCaching(
      StallionEventConstants.NativeProdEventTypes.DOWNLOAD_PROGRESS_PROD.toString(),
      successPayload
    );
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

  private static void emitDownloadSuccess(String releaseHash, String bundleDiffId) {
    JSONObject successPayload = new JSONObject();
    try {
      successPayload.put("releaseHash", releaseHash);
      if (bundleDiffId != null && !bundleDiffId.isEmpty()) {
        successPayload.put("diffId", bundleDiffId);
      }
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEvent(
      NativeProdEventTypes.DOWNLOAD_COMPLETE_PROD.toString(),
      successPayload
    );
  }

  private static void emitDownloadStarted(String releaseHash, Boolean isResume, String bundleDiffId) {
    JSONObject successPayload = new JSONObject();
    try {
      successPayload.put("releaseHash", releaseHash);
      if (bundleDiffId != null && !bundleDiffId.isEmpty()) {
        successPayload.put("diffId", bundleDiffId);
      }
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEvent(
      isResume ? NativeProdEventTypes.DOWNLOAD_RESUME_PROD.toString(): NativeProdEventTypes.DOWNLOAD_STARTED_PROD.toString(),
      successPayload
    );
  }
  private static void emitSignatureVerificationFailed(String releaseHash) {
    JSONObject successPayload = new JSONObject();
    try {
      successPayload.put("releaseHash", releaseHash);
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEvent(
      NativeProdEventTypes.SIGNATURE_VERIFICATION_FAILED.toString(),
      successPayload
    );
  }
}
