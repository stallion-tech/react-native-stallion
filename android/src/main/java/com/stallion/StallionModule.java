package com.stallion;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.Activity;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@ReactModule(name = StallionConstants.MODULE_NAME)
public class StallionModule extends ReactContextBaseJavaModule {
  private ReactApplicationContext currentReactContext;
  private String baseDir;
  private StallionStorage stallionStorage;
  private DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter;
  public static Thread.UncaughtExceptionHandler _androidUncaughtExceptionHandler;
  public static Thread _exceptionThread;
  public static Throwable _exceptionThrowable;

  public StallionModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.currentReactContext = reactContext;
    this.baseDir = reactContext.getFilesDir().getAbsolutePath() + StallionConstants.STALLION_PACKAGE_PATH;
    StallionStorage.getInstance().Initialize(reactContext);
    this.stallionStorage = StallionStorage.getInstance();
    _androidUncaughtExceptionHandler = Thread.getDefaultUncaughtExceptionHandler();
    Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
      @Override
      public void uncaughtException(Thread thread, Throwable throwable) {
        _exceptionThread = thread;
        _exceptionThrowable = throwable;
        String stackTraceString = Log.getStackTraceString(throwable);
        if(stallionStorage.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER).equals(StallionConstants.STALLION_SWITCH_ON)) {
          toggleStallionSwitch(false);
          Activity currentActivity = getCurrentActivity();
          Intent myIntent = new Intent(currentActivity, StallionDefaultErrorActivity.class);
          myIntent.putExtra("stack_trace_string", stackTraceString);
          currentActivity.startActivity(myIntent);
          currentActivity.finish();
        } else {
          continueExcetionFlow();
        }
      }
    });
  }

  public static void continueExcetionFlow() {
    _androidUncaughtExceptionHandler.uncaughtException(_exceptionThread, _exceptionThrowable);
  }


  @Override
  @NonNull
  public String getName() {
    return StallionConstants.MODULE_NAME;
  }

  @ReactMethod
  public void setApiKey(String apiKey) {
    this.stallionStorage.set(StallionConstants.API_KEY_IDENTIFIER, apiKey);
  }

  @ReactMethod
  public void getApiKey(Callback callback) {
    callback.invoke(
      this.stallionStorage.get(StallionConstants.API_KEY_IDENTIFIER)
    );
  }

  @ReactMethod
  public void getStallionMeta(Callback callback) {
    WritableMap bundleMeta = Arguments.createMap();
    String activeBucket = this.stallionStorage.get(StallionConstants.ACTIVE_BUCKET_IDENTIFIER);
    String switchState = this.stallionStorage.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER);
    int activeVersion = this.stallionStorage.getInt(StallionConstants.ACTIVE_VERSION_IDENTIFIER);

    bundleMeta.putString(StallionConstants.ACTIVE_BUCKET_IDENTIFIER, activeBucket);
    bundleMeta.putBoolean(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER,
      switchState == null ? false : this.stallionStorage.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER).equals(StallionConstants.STALLION_SWITCH_ON)
    );
    bundleMeta.putString(StallionConstants.ACTIVE_VERSION_IDENTIFIER, String.valueOf(activeVersion));
    callback.invoke(bundleMeta);
  }

  @ReactMethod
  public void toggleStallionSwitch(Boolean stallionBundleIsOn) {
    this.stallionStorage.set(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER, stallionBundleIsOn ? StallionConstants.STALLION_SWITCH_ON : StallionConstants.STALLION_SWITCH_OFF);
  }

  private DeviceEventManagerModule.RCTDeviceEventEmitter getEventEmitter() {
    if(this.eventEmitter == null) {
      this.eventEmitter = this.currentReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    }
    return this.eventEmitter;
  }

  @ReactMethod
  public void downloadPackage(ReadableMap bundleInfo, Promise promise) {
    ExecutorService executor = Executors.newSingleThreadExecutor();
    Handler handler = new Handler(Looper.getMainLooper());

    executor.execute(new Runnable() {
      @Override
      public void run() {
        String receivedBucketId = bundleInfo.getString("bucketId");
        String receivedProjectId = bundleInfo.getString("projectId");
        Integer receivedVersion = bundleInfo.getInt("version");
        String platformValue = "android";
        DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter =  getEventEmitter();

        FileOutputStream fout = null;
        BufferedOutputStream bout = null;
        BufferedInputStream inputStream = null;
        HttpURLConnection connection = null;
        File downloadedZip = null;
        boolean isZip = false;

        try {
          int DOWNLOAD_BUFFER_SIZE = StallionConstants.DOWNLOAD_BUFFER_SIZE;
          URL url = new URL(StallionConstants.API_BASE + StallionConstants.DOWNLOAD_API_PATH);
          connection = (HttpURLConnection) url.openConnection();
          connection.setRequestMethod( "POST" );
          connection.setRequestProperty("x-access-token", stallionStorage.get(StallionConstants.API_KEY_IDENTIFIER));
          connection.setRequestProperty("Content-Type", "application/json");

          String jsonInputString = String.format("{\"bucketId\":\"%s\",\"projectId\":\"%s\",\"version\":%d,\"platform\":\"%s\"}", receivedBucketId, receivedProjectId, receivedVersion, platformValue);

          connection.setDoOutput(true);
          connection.setDoInput(true);
          OutputStream os = connection.getOutputStream();
          os.write(jsonInputString.getBytes("UTF-8"));
          os.close();

          connection.connect();
          inputStream = new BufferedInputStream(connection.getInputStream());
          File downloadFolder = new File(baseDir + StallionConstants.DOWNLOAD_FOLDER_DIR);
          downloadFolder.getParentFile().mkdirs();

          downloadedZip = new File(downloadFolder, StallionConstants.ZIP_FILE_NAME);
          downloadedZip.getParentFile().mkdirs();

          fout = new FileOutputStream(downloadedZip, false);
          bout = new BufferedOutputStream(fout, DOWNLOAD_BUFFER_SIZE);
          byte[] data = new byte[DOWNLOAD_BUFFER_SIZE];
          byte[] header = new byte[4];

          long totalBytes = connection.getContentLength();
          long receivedBytes = 0;
          int numBytesRead;
          double prevDownloadFraction = 0;
          double progressEventThreshold = 0.1;
          while ((numBytesRead = inputStream.read(data, 0, DOWNLOAD_BUFFER_SIZE)) >= 0) {
            if (receivedBytes < 4) {
              for (int i = 0; i < numBytesRead; i++) {
                int headerOffset = (int) (receivedBytes) + i;
                if (headerOffset >= 4) {
                  break;
                }
                header[headerOffset] = data[i];
              }
            }

            receivedBytes += numBytesRead;
            bout.write(data, 0, numBytesRead);
            double currentDownloadFraction = (double) receivedBytes / (double) totalBytes;
            if(currentDownloadFraction - prevDownloadFraction > progressEventThreshold) {
              prevDownloadFraction = currentDownloadFraction;
              getReactApplicationContext().runOnUiQueueThread(() -> getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(StallionConstants.DOWNLOAD_PROGRESS_EVENT, currentDownloadFraction));
            }
          }

          isZip = ByteBuffer.wrap(header).getInt() == 0x504b0304;
          Log.d("", String.valueOf(isZip));

        } catch (Exception e) {
          Log.d("DOWNLOAD_ERROR", e.toString());
          promise.reject(e.toString());
        } finally {
          try {
            if (bout != null) bout.close();
            if (fout != null) fout.close();
            if (inputStream != null) inputStream.close();
            if (connection != null) connection.disconnect();
          } catch (IOException e) {
            promise.reject(e.toString());
          }
        }

        if (!isZip) {
          promise.reject("Not a zip file");
          return;
        }

        try {
          int currentActiveSlot = stallionStorage.getInt(StallionConstants.ACTIVE_SLOT_IDENTIFIER);
          int targetSlot;
          if(currentActiveSlot == 1) {
            targetSlot = 2;
          } else if(currentActiveSlot == 2) {
            targetSlot = 1;
          } else {
            targetSlot = 1;
          }
          StallionZip.unzipFile(downloadedZip.getAbsolutePath(), baseDir + StallionConstants.BUNDLE_DEST_FOLDER_DIR + StallionConstants.SLOT_FOLDER_DIR + targetSlot);
          // setting active bucket ID, slot and version after downloading and all other jobs done
          stallionStorage.setInt(StallionConstants.ACTIVE_SLOT_IDENTIFIER, targetSlot);
          stallionStorage.set(StallionConstants.ACTIVE_BUCKET_IDENTIFIER, receivedBucketId);
          if (receivedVersion != null) {
            stallionStorage.setInt(StallionConstants.ACTIVE_VERSION_IDENTIFIER, receivedVersion);
          }
          promise.resolve("Success");
          getReactApplicationContext().runOnUiQueueThread(() -> getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(StallionConstants.DOWNLOAD_PROGRESS_EVENT, 1));
        } catch (Exception e) {
          promise.reject(e.toString());
        } finally {
          StallionZip.deleteFileOrFolderSilently(downloadedZip);
          return;
        }
      }
    });
  }
}
