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

import android.content.res.Resources;
import android.provider.Settings;
import java.util.UUID;

@ReactModule(name = StallionConstants.MODULE_NAME)
public class StallionModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext currentReactContext;
  private final StallionStorage stallionStorage;
  private DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter;

  public StallionModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.currentReactContext = reactContext;
    StallionStorage.getInstance().Initialize(reactContext);
    this.stallionStorage = StallionStorage.getInstance();
    StallionErrorBoundary.initErrorBoundary(reactContext);
    StallionErrorBoundary.toggleExceptionHandler(true);
    StallionSynManager.sync();
  }

  @Override
  @NonNull
  public String getName() {
    return StallionConstants.MODULE_NAME;
  }

  @ReactMethod
  public void setStorage(String key, String value) {
    this.stallionStorage.set(key, value);
  }


  @ReactMethod
  public void getStorage(String key, Callback callback) {
    callback.invoke(this.stallionStorage.get(key));
  }

  @ReactMethod
  public void onLaunch(String launchData) {
    StallionRollbackManager.stabilizeRelease();
    StallionStorage.getInstance().setIsMounted();
    StallionEventEmitter.triggerPendingEvents();
  }

  @ReactMethod
  public  void  getUniqueId(Callback callback) {
    callback.invoke(StallionCommonUtil.getUniqueId());
  }

  @ReactMethod
  public void downloadPackage(ReadableMap bundleInfo, Promise promise) {
    String receivedDownloadUrl = bundleInfo.getString("url");
    String receivedHash = bundleInfo.getString("hash");
    String sdkToken = stallionStorage.get(StallionConstants.STALLION_SDK_TOKEN_KEY);
    StallionDownloadManager.downloadBundle(
      receivedDownloadUrl,
      this.currentReactContext.getFilesDir().getAbsolutePath() + StallionConstants.STAGE_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT,
      sdkToken,
      "",
      new StallionDownloadCallback() {
        @Override
        public void onReject(String prefix, String error) {
          WritableMap errorEventPayload = Arguments.createMap();
          errorEventPayload.putString("releaseHash", receivedHash);
          StallionEventEmitter.sendEvent(
            StallionEventEmitter.getEventPayload(
              StallionConstants.NativeEventTypesStage.DOWNLOAD_ERROR_STAGE.toString(),
              errorEventPayload
            )
          );
          promise.reject(prefix, error);
        }

        @Override
        public void onSuccess(String successPayload) {
          stallionStorage.set(StallionConstants.CURRENT_STAGE_SLOT_KEY, StallionConstants.TEMP_FOLDER_SLOT);
          stallionStorage.set(StallionConstants.STAGE_DIRECTORY + StallionConstants.TEMP_FOLDER_SLOT, receivedHash);
          WritableMap successEventPayload = Arguments.createMap();
          successEventPayload.putString("releaseHash", receivedHash);
          StallionEventEmitter.sendEvent(
            StallionEventEmitter.getEventPayload(
              StallionConstants.NativeEventTypesStage.DOWNLOAD_COMPLETE_STAGE.toString(),
              successEventPayload
            )
          );
          promise.resolve(StallionConstants.DOWNLOAD_SUCCESS_MESSAGE);
        }

        @Override
        public void onProgress(double downloadFraction) {
          WritableMap progressEventPayload = Arguments.createMap();
          progressEventPayload.putString("releaseHash", receivedHash);
          progressEventPayload.putDouble("progress", downloadFraction);
          StallionEventEmitter.sendEvent(
            StallionEventEmitter.getEventPayload(
              StallionConstants.NativeEventTypesStage.DOWNLOAD_PROGRESS_STAGE.toString(),
              progressEventPayload
            )
          );
        }
      }
    );
  }
}
