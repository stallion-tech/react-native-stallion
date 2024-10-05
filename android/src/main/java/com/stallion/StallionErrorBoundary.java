package com.stallion;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;

public class StallionErrorBoundary {
  public static Thread.UncaughtExceptionHandler _androidUncaughtExceptionHandler;
  public static Thread _exceptionThread;
  public static Throwable _exceptionThrowable;
  public static ReactApplicationContext _currentContext;

  public static void initErrorBoundary(ReactApplicationContext currentContext) {
    _androidUncaughtExceptionHandler = Thread.getDefaultUncaughtExceptionHandler();
    _currentContext = currentContext;
  }

  public static void toggleExceptionHandler(Boolean shouldEnableErrorHandler) {
    if(shouldEnableErrorHandler) {
      Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
        _exceptionThread = thread;
        _exceptionThrowable = throwable;
        String stackTraceString = Log.getStackTraceString(throwable);
        StallionStorage stallionStorage = StallionStorage.getInstance();
        String switchState = stallionStorage.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER);

        if(switchState.equals(StallionConstants.SwitchState.PROD.toString())) {
          if(!StallionStorage.getInstance().getIsMounted()) {
            StallionRollbackManager.rollbackProd(true);
          }
          String currentProdSlot = stallionStorage.get(StallionConstants.CURRENT_PROD_SLOT_KEY);
          if(!currentProdSlot.equals(StallionConstants.DEFAULT_FOLDER_SLOT)) {
            WritableMap exceptionErrorPayload = Arguments.createMap();
            exceptionErrorPayload.putString("error", stackTraceString);
            StallionEventEmitter.sendEvent(
              StallionEventEmitter.getEventPayload(
                StallionConstants.NativeEventTypesProd.EXCEPTION_PROD.toString(),
                exceptionErrorPayload
              )
            );
          }
          continueExceptionFlow();
        } else if(switchState.equals(StallionConstants.SwitchState.STAGE.toString())) {
          StallionRollbackManager.rollbackStage();
          Activity currentActivity = _currentContext.getCurrentActivity();
          if(currentActivity != null) {
            Intent myIntent = new Intent(currentActivity, StallionDefaultErrorActivity.class);
            myIntent.putExtra("stack_trace_string", stackTraceString);
            currentActivity.startActivity(myIntent);
            currentActivity.finish();
          } else {
            continueExceptionFlow();
          }
        } else {
          continueExceptionFlow();
        }
      });
    } else {
      Thread.setDefaultUncaughtExceptionHandler(_androidUncaughtExceptionHandler);
    }
  }
  public static void continueExceptionFlow() {
    _androidUncaughtExceptionHandler.uncaughtException(_exceptionThread, _exceptionThrowable);
  }
}
