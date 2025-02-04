package com.stallion.utils;

import com.stallion.events.StallionEventManager;
import com.stallion.storage.StallionConfigConstants;
import com.stallion.storage.StallionMetaConstants;
import com.stallion.storage.StallionStateManager;
import com.stallion.events.StallionEventConstants.NativeProdEventTypes;

import org.json.JSONObject;

import java.io.File;

public class StallionSlotManager {

  private static final StallionStateManager stateManager = StallionStateManager.getInstance();
  private static final String baseFolderPath = stateManager.getStallionConfig().getFilesDirectory();

  public static void rollbackProd(boolean isAutoRollback, String errorString) {
    StallionMetaConstants.SlotStates currentProdSlot = stateManager.stallionMeta.getCurrentProdSlot();
    String stableReleaseHash = stateManager.stallionMeta.getProdStableHash();
    String newReleaseHash = stateManager.stallionMeta.getProdNewHash();

    switch (currentProdSlot) {
      case NEW_SLOT:
        stateManager.stallionMeta.setProdNewHash("");
        if (stableReleaseHash.isEmpty()) {
          stateManager.stallionMeta.setCurrentProdSlot(StallionMetaConstants.SlotStates.DEFAULT_SLOT);
        } else {
          stateManager.stallionMeta.setCurrentProdSlot(StallionMetaConstants.SlotStates.STABLE_SLOT);
        }
        emitRollbackEvent(isAutoRollback, newReleaseHash, errorString);
        stateManager.syncStallionMeta();
        break;

      case STABLE_SLOT:
        stateManager.stallionMeta.setProdStableHash("");
        stateManager.stallionMeta.setCurrentProdSlot(StallionMetaConstants.SlotStates.DEFAULT_SLOT);
        emitRollbackEvent(isAutoRollback, stableReleaseHash, errorString);
        stateManager.syncStallionMeta();
        break;

      default:
        // Default slot, no rollback needed
        break;
    }
  }

  public static void fallbackProd() {
    StallionFileManager.deleteFileOrFolderSilently(new File(baseFolderPath + StallionConfigConstants.PROD_DIRECTORY + StallionConfigConstants.NEW_FOLDER_SLOT));
    StallionFileManager.deleteFileOrFolderSilently(new File(baseFolderPath + StallionConfigConstants.PROD_DIRECTORY + StallionConfigConstants.STABLE_FOLDER_SLOT));
    StallionFileManager.deleteFileOrFolderSilently(new File(baseFolderPath + StallionConfigConstants.PROD_DIRECTORY + StallionConfigConstants.TEMP_FOLDER_SLOT));
    stateManager.clearStallionMeta();
  }

  public static void rollbackStage() {
    stateManager.stallionMeta.setCurrentStageSlot(StallionMetaConstants.SlotStates.DEFAULT_SLOT);
    stateManager.stallionMeta.setStageNewHash("");
    stateManager.syncStallionMeta();
  }

  public static void stabilizeProd() {
    try {
      File newSlot = new File(baseFolderPath, StallionConfigConstants.PROD_DIRECTORY + StallionConfigConstants.NEW_FOLDER_SLOT);
      File stableSlot = new File(baseFolderPath, StallionConfigConstants.PROD_DIRECTORY + StallionConfigConstants.STABLE_FOLDER_SLOT);

      StallionFileManager.copyDirectory(newSlot, stableSlot);

      String newReleaseHash = stateManager.stallionMeta.getProdNewHash();
      stateManager.stallionMeta.setProdStableHash(newReleaseHash);
      stateManager.syncStallionMeta();
      emitStabilizeEvent(newReleaseHash);
    } catch (Exception ignored) {}
  }

  private static void emitRollbackEvent(boolean isAutoRollback, String rolledBackReleaseHash, String errorString) {
    try {
      JSONObject eventPayload = new JSONObject();
      eventPayload.put("releaseHash", rolledBackReleaseHash);
      eventPayload.put("meta", errorString);

      String eventName = isAutoRollback
        ? NativeProdEventTypes.AUTO_ROLLED_BACK_PROD.toString()
        : NativeProdEventTypes.ROLLED_BACK_PROD.toString();

      if (isAutoRollback) {
        stateManager.stallionMeta.setLastRolledBackHash(rolledBackReleaseHash);
        stateManager.syncStallionMeta();
      }

      StallionEventManager.getInstance().sendEvent(eventName, eventPayload);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private static void emitStabilizeEvent(String newReleaseHash) {
    try {
      JSONObject eventPayload = new JSONObject();
      eventPayload.put("releaseHash", newReleaseHash);

      StallionEventManager.getInstance().sendEvent(
        NativeProdEventTypes.STABILIZED_PROD.toString(),
        eventPayload
      );
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}

