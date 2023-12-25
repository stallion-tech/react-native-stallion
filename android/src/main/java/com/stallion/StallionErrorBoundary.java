package com.stallion;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

public class StallionErrorBoundary {
  public static Thread.UncaughtExceptionHandler _androidUncaughtExceptionHandler;
  public static Thread _exceptionThread;
  public static Throwable _exceptionThrowable;
  public static void initErrorBoundary() {
    _androidUncaughtExceptionHandler = Thread.getDefaultUncaughtExceptionHandler();
  }
  public static void toggleExceptionHandler(Boolean shouldEnableErrorHandler, Activity currentActivity) {
    if(shouldEnableErrorHandler) {
      Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
        _exceptionThread = thread;
        _exceptionThrowable = throwable;
        String stackTraceString = Log.getStackTraceString(throwable);
        StallionStorage stallionStorage = StallionStorage.getInstance();
        if(stallionStorage.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER).equals(StallionConstants.STALLION_SWITCH_ON)) {
          stallionStorage.set(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER, StallionConstants.STALLION_SWITCH_OFF);
          Intent myIntent = new Intent(currentActivity, StallionDefaultErrorActivity.class);
          myIntent.putExtra("stack_trace_string", stackTraceString);
          currentActivity.startActivity(myIntent);
          currentActivity.finish();
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
