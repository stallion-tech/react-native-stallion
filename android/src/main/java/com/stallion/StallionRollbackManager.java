package com.stallion;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import java.io.File;

public class StallionRollbackManager {
  public static void rollbackProd(Boolean isAutoRollback) {
    StallionStorage stallionStorageInstance = StallionStorage.getInstance();
    String currentProdSlot = stallionStorageInstance.get(StallionConstants.CURRENT_PROD_SLOT_KEY);
    String stableReleaseHash = stallionStorageInstance.get(StallionConstants.PROD_DIRECTORY + StallionConstants.STABLE_FOLDER_SLOT);
    switch (currentProdSlot) {
      case StallionConstants.NEW_FOLDER_SLOT:
        String newReleaseHash = stallionStorageInstance.get(StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT);
        stallionStorageInstance.set(StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT, "");
        if(stableReleaseHash.isEmpty()) {
          stallionStorageInstance.set(StallionConstants.CURRENT_PROD_SLOT_KEY, StallionConstants.DEFAULT_FOLDER_SLOT);
        } else {
          stallionStorageInstance.set(StallionConstants.CURRENT_PROD_SLOT_KEY, StallionConstants.STABLE_FOLDER_SLOT);
        }
        emitRollbackEvent(isAutoRollback, newReleaseHash);
        break;
      case  StallionConstants.STABLE_FOLDER_SLOT:
        stallionStorageInstance.set(StallionConstants.PROD_DIRECTORY + StallionConstants.STABLE_FOLDER_SLOT, "");
        stallionStorageInstance.set(StallionConstants.CURRENT_PROD_SLOT_KEY, StallionConstants.DEFAULT_FOLDER_SLOT);
        emitRollbackEvent(isAutoRollback, stableReleaseHash);
        break;
    }
  }

  public static void fallbackProd() {
    StallionStorage stallionStorageInstance = StallionStorage.getInstance();
    stallionStorageInstance.set(StallionConstants.CURRENT_PROD_SLOT_KEY, StallionConstants.DEFAULT_FOLDER_SLOT);
    stallionStorageInstance.set(StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT, "");
    stallionStorageInstance.set(StallionConstants.PROD_DIRECTORY + StallionConstants.STABLE_FOLDER_SLOT, "");
    stallionStorageInstance.set(StallionConstants.PROD_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT, "");
  }

  private static void emitRollbackEvent(Boolean isAutoRollback, String rolledBackReleaseHash) {
    WritableMap rollbackEventPayload = Arguments.createMap();
    rollbackEventPayload.putString("releaseHash", rolledBackReleaseHash);
    WritableMap rollbackEventObject = StallionEventEmitter.getEventPayload(
      isAutoRollback ? StallionConstants.NativeEventTypesProd.AUTO_ROLLED_BACK_PROD.toString() : StallionConstants.NativeEventTypesProd.ROLLED_BACK_PROD.toString(),
      rollbackEventPayload
    );
    if(isAutoRollback) {
      StallionEventEmitter.cacheEvent(rollbackEventObject);
      StallionStorage stallionStorageInstance = StallionStorage.getInstance();
      stallionStorageInstance.set(StallionConstants.LAST_ROLLED_BACK_RELEASE_HASH_KEY, rolledBackReleaseHash);
    } else {
      StallionEventEmitter.sendEvent(rollbackEventObject);
    }
  }

  public static void rollbackStage() {
    StallionStorage stallionStorageInstance = StallionStorage.getInstance();
    stallionStorageInstance.set(StallionConstants.CURRENT_STAGE_SLOT_KEY, StallionConstants.DEFAULT_FOLDER_SLOT);
    stallionStorageInstance.set(StallionConstants.STAGE_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT, "");
  }

  public static void stabilizeRelease() {
    StallionStorage stallionStorageInstance = StallionStorage.getInstance();

    String baseFolderPath = stallionStorageInstance.mContext.getFilesDir().getAbsolutePath();
    StallionFileUtil.moveFile(
      new File(baseFolderPath, StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT),
      new File(baseFolderPath, StallionConstants.PROD_DIRECTORY + StallionConstants.STABLE_FOLDER_SLOT)
    );
    String newReleaseHash = stallionStorageInstance.get(StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT);
    stallionStorageInstance.set(StallionConstants.PROD_DIRECTORY + StallionConstants.STABLE_FOLDER_SLOT, newReleaseHash);
    stallionStorageInstance.set(StallionConstants.PROD_DIRECTORY + StallionConstants.NEW_FOLDER_SLOT, "");
    WritableMap stabilizeEventPayload = Arguments.createMap();
    stabilizeEventPayload.putString("releaseHash", newReleaseHash);
    StallionEventEmitter.sendEvent(
      StallionEventEmitter.getEventPayload(
        StallionConstants.NativeEventTypesProd.STABILIZED_PROD.toString(),
        stabilizeEventPayload
      )
    );
  }
}
