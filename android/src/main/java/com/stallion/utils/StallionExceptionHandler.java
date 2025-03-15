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
  }

  private static void emitException(String stackTraceString, String releaseHash, boolean isAutoRollback, boolean isProd) {
    JSONObject syncErrorPayload = new JSONObject();
    try {
      syncErrorPayload.put("meta", stackTraceString);
      syncErrorPayload.put("releaseHash", releaseHash);
      syncErrorPayload.put("isAutoRollback", Boolean.toString(isAutoRollback));
    } catch (Exception ignored) { }
    StallionEventManager.getInstance().sendEvent(
      isProd ?
        StallionEventConstants.NativeProdEventTypes.EXCEPTION_PROD.toString()
        : StallionEventConstants.NativeStageEventTypes.EXCEPTION_STAGE.toString(),
      syncErrorPayload
    );
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

    StallionSlotManager.rollbackStage();

    continueExceptionFlow();
  }

  public static void continueExceptionFlow() {
    if (_androidUncaughtExceptionHandler != null) {
      _androidUncaughtExceptionHandler.uncaughtException(_exceptionThread, _exceptionThrowable);
    }
  }
}
