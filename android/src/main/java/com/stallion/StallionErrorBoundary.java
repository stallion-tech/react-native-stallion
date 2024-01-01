package com.stallion;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;

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
        if(stallionStorage.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER).equals(StallionConstants.STALLION_SWITCH_ON)) {
          stallionStorage.set(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER, StallionConstants.STALLION_SWITCH_OFF);
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
