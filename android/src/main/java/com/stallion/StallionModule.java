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

import android.util.Log;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
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

  public StallionModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.currentReactContext = reactContext;
    this.baseDir = reactContext.getFilesDir().getAbsolutePath() + StallionConstants.STALLION_PACKAGE_PATH;
    StallionStorage.getInstance().Initialize(reactContext);
    this.stallionStorage = StallionStorage.getInstance();
    StallionErrorBoundary.initErrorBoundary();
    String switchState = this.stallionStorage.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER);
    Boolean isStallionEnabled = switchState == null ? false : switchState.equals(StallionConstants.STALLION_SWITCH_ON);
    StallionErrorBoundary.toggleExceptionHandler(isStallionEnabled, getCurrentActivity());
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
      switchState == null ? false : switchState.equals(StallionConstants.STALLION_SWITCH_ON)
    );
    bundleMeta.putString(StallionConstants.ACTIVE_VERSION_IDENTIFIER, String.valueOf(activeVersion));
    callback.invoke(bundleMeta);
  }

  @ReactMethod
  public void toggleStallionSwitch(Boolean stallionBundleIsOn) {
    this.stallionStorage.set(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER, stallionBundleIsOn ? StallionConstants.STALLION_SWITCH_ON : StallionConstants.STALLION_SWITCH_OFF);
    StallionErrorBoundary.toggleExceptionHandler(stallionBundleIsOn, getCurrentActivity());
  }

  private DeviceEventManagerModule.RCTDeviceEventEmitter getEventEmitter() {
    if(this.eventEmitter == null) {
      this.eventEmitter = this.currentReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    }
    return this.eventEmitter;
  }

  @ReactMethod
  public void downloadPackage(ReadableMap bundleInfo, Promise promise) {
    String receivedBucketId = bundleInfo.getString("bucketId");
    String receivedDownloadUrl = bundleInfo.getString("url");
    Integer receivedVersion = bundleInfo.getInt("version");

    ExecutorService executor = Executors.newSingleThreadExecutor();

    executor.execute(() -> {
      DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter =  getEventEmitter();

      FileOutputStream fout = null;
      BufferedOutputStream bout = null;
      BufferedInputStream inputStream = null;
      HttpURLConnection connection = null;
      File downloadedZip = null;
      boolean isZip = false;

      try {
        int DOWNLOAD_BUFFER_SIZE = StallionConstants.DOWNLOAD_BUFFER_SIZE;
        URL url = new URL(receivedDownloadUrl);
        connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod( "GET" );
        connection.setRequestProperty("x-access-token", stallionStorage.get(StallionConstants.API_KEY_IDENTIFIER));
        connection.setRequestProperty("Content-Type", "application/json");

        connection.setDoInput(true);

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
        promise.reject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_API_ERROR_MESSAGE);
      } finally {
        try {
          if (bout != null) bout.close();
          if (fout != null) fout.close();
          if (inputStream != null) inputStream.close();
          if (connection != null) connection.disconnect();
        } catch (IOException e) {
          promise.reject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_API_ERROR_MESSAGE);
        }
      }

      if (!isZip) {
        promise.reject(StallionConstants.DOWNLOAD_ERROR_PREFIX, "Not a zip file");
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
        promise.resolve(StallionConstants.DOWNLOAD_SUCCESS_MESSAGE);
        getReactApplicationContext().runOnUiQueueThread(() -> getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(StallionConstants.DOWNLOAD_PROGRESS_EVENT, 1));
      } catch (Exception e) {
        promise.reject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_FILESYSTEM_ERROR_MESSAGE);
      } finally {
        try {
          StallionZip.deleteFileOrFolderSilently(downloadedZip);
        } catch (Exception e) {
          promise.reject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_DELETE_ERROR);
        }
        return;
      }
    });
  }
}
