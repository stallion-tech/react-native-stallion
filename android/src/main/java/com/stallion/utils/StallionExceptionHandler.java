package com.stallion.utils;

import android.util.Log;

import com.stallion.events.StallionEventConstants;
import com.stallion.events.StallionEventManager;
import com.stallion.storage.StallionMetaConstants;
import com.stallion.storage.StallionStateManager;

import org.json.JSONObject;

public class StallionExceptionHandler {

  private static Thread.UncaughtExceptionHandler _androidUncaughtExceptionHandler;
  private static Thread _exceptionThread;
  private static Throwable _exceptionThrowable;
  private static boolean isErrorBoundaryInitialized = false;
  private static boolean isNativeSignalsInitialized = false;
  private static boolean hasProcessedNativeCrashMarker = false;

  public static void initErrorBoundary() {
    if (isErrorBoundaryInitialized) {
      return; // Prevent multiple initializations
    }
    isErrorBoundaryInitialized = true;

    _androidUncaughtExceptionHandler = Thread.getDefaultUncaughtExceptionHandler();
    Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
      _exceptionThread = thread;
      _exceptionThrowable = throwable;

      // Safely trim the stack trace string
      String stackTraceString = Log.getStackTraceString(throwable);
      stackTraceString = stackTraceString.length() > 900
        ? stackTraceString.substring(0, 900) + "..."
        : stackTraceString;

      StallionStateManager stateManager = StallionStateManager.getInstance();
      StallionMetaConstants.SwitchState switchState = stateManager.stallionMeta.getSwitchState();

      if (switchState == StallionMetaConstants.SwitchState.PROD) {
        handleProdState(stackTraceString, stateManager);
      } else if (switchState == StallionMetaConstants.SwitchState.STAGE) {
        handleStageState(stackTraceString, stateManager);
      } else {
        continueExceptionFlow();
      }
    });

    // Initialize native signal handler once and process any prior crash marker
    try {
      if (!isNativeSignalsInitialized) {
        System.loadLibrary("stallion-crash");
        String filesDir = StallionStateManager.getInstance().getStallionConfig().getFilesDirectory();
        initNativeSignalHandler(filesDir);
        isNativeSignalsInitialized = true;
      }
      processNativeCrashMarkerIfPresent();
    } catch (Throwable ignored) {}
  }

  private static void emitException(String stackTraceString, String releaseHash, boolean isAutoRollback, boolean isProd) {
    JSONObject syncErrorPayload = new JSONObject();
    try {
      syncErrorPayload.put("meta", stackTraceString);
      syncErrorPayload.put("releaseHash", releaseHash);
      syncErrorPayload.put("isAutoRollback", Boolean.toString(isAutoRollback));
      StallionEventManager.getInstance().sendEvent(
        isProd ?
          StallionEventConstants.NativeProdEventTypes.EXCEPTION_PROD.toString()
          : StallionEventConstants.NativeStageEventTypes.EXCEPTION_STAGE.toString(),
        syncErrorPayload
      );
    } catch (Exception ignored) { }
  }

  private static void handleProdState(String stackTraceString, StallionStateManager stateManager) {
    boolean isAutoRollback = !stateManager.getIsMounted();
    String currentHash = stateManager.stallionMeta.getHashAtCurrentProdSlot();

    // Emit exception event
    emitException(stackTraceString, currentHash, isAutoRollback, true);

    // Perform rollback if auto-rollback is enabled
    if (isAutoRollback) {
      StallionSlotManager.rollbackProd(true, stackTraceString);
    }

    continueExceptionFlow();
  }

  private static void handleStageState(String stackTraceString, StallionStateManager stateManager) {
    boolean isAutoRollback = !stateManager.getIsMounted();
    String currentStageHash = stateManager.stallionMeta.getStageNewHash();

    // Emit exception event
    emitException(stackTraceString, currentStageHash, isAutoRollback, false);

    if(isAutoRollback) {
      StallionSlotManager.rollbackStage();
    }

    continueExceptionFlow();
  }

  public static void continueExceptionFlow() {
    if (_androidUncaughtExceptionHandler != null) {
      _androidUncaughtExceptionHandler.uncaughtException(_exceptionThread, _exceptionThrowable);
    }
  }

  private static void processNativeCrashMarkerIfPresent() {
    try {
      if (hasProcessedNativeCrashMarker) { return; }
      String filesDir = StallionStateManager.getInstance().getStallionConfig().getFilesDirectory();
      java.io.File marker = new java.io.File(filesDir + "/stallion_crash.marker");
      if (marker.exists()) {
        StringBuilder sb = new StringBuilder();
        try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.FileReader(marker))) {
          String line;
          while ((line = br.readLine()) != null) {
            sb.append(line);
          }
        }
        
        String jsonContent = sb.toString();
        String stackTraceString = "";
        boolean isAutoRollback = false;
        
        try {
          // Parse JSON from previous crash
          JSONObject crashMarker = new JSONObject(jsonContent);
          stackTraceString = crashMarker.optString("crashLog", "");
          // Use the autoRollback flag that was determined at crash time (previous session)
          isAutoRollback = crashMarker.optBoolean("isAutoRollback", false);
        } catch (org.json.JSONException e) {
          // Fallback for old format (non-JSON)
          stackTraceString = jsonContent;
          // Default to true for old format (conservative approach)
          isAutoRollback = true;
        }
        
        if (stackTraceString.length() > 900) {
          stackTraceString = stackTraceString.substring(0, 900) + "...";
        }

        StallionStateManager stateManager = StallionStateManager.getInstance();
        StallionMetaConstants.SwitchState switchState = stateManager.stallionMeta.getSwitchState();
        if (switchState == StallionMetaConstants.SwitchState.PROD) {
          String currentHash = stateManager.stallionMeta.getHashAtCurrentProdSlot();
          // Use isAutoRollback from previous crash, not current session state
          emitException(stackTraceString, currentHash, isAutoRollback, true);
          if (isAutoRollback) {
            StallionSlotManager.rollbackProd(true, stackTraceString);
          }
        } else if (switchState == StallionMetaConstants.SwitchState.STAGE) {
          String currentStageHash = stateManager.stallionMeta.getStageNewHash();
          // Use isAutoRollback from previous crash, not current session state
          emitException(stackTraceString, currentStageHash, isAutoRollback, false);
          if (isAutoRollback) {
            StallionSlotManager.rollbackStage();
          }
        }

        // delete marker
        StallionFileManager.deleteFileOrFolderSilently(marker);
        hasProcessedNativeCrashMarker = true;
      }
    } catch (Exception ignored) {}
  }

  private static native void initNativeSignalHandler(String filesDir);
}
