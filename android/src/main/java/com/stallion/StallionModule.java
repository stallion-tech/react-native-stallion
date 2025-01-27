package com.stallion;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.stallion.events.StallionEventConstants;
import com.stallion.events.StallionEventManager;
import com.stallion.networkmanager.StallionFileDownloader;
import com.stallion.networkmanager.StallionDownloadCallback;
import com.stallion.networkmanager.StallionStageManager;
import com.stallion.networkmanager.StallionSyncHandler;
import com.stallion.storage.StallionConfigConstants;

import com.stallion.storage.StallionMetaConstants;
import com.stallion.storage.StallionStateManager;
import com.stallion.utils.StallionExceptionHandler;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;


@ReactModule(name = StallionConfigConstants.MODULE_NAME)
public class StallionModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private final ReactApplicationContext currentReactContext;
  private final StallionStateManager stallionStateManager;

  public StallionModule(ReactApplicationContext reactContext) {
    super(reactContext);
    StallionStateManager.init(reactContext);
    this.stallionStateManager = StallionStateManager.getInstance();
    this.currentReactContext = reactContext;
    StallionExceptionHandler.initErrorBoundary(reactContext);
    reactContext.addLifecycleEventListener(this);
  }

  @Override
  public void onHostResume() {
    StallionSyncHandler.sync();
  }

  @Override
  public void onHostPause() {}

  @Override
  public void onHostDestroy() {}

  @Override
  public void onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy();
    this.currentReactContext.removeLifecycleEventListener(this);
  }

  @Override
  @NonNull
  public String getName() {
    return StallionConfigConstants.MODULE_NAME;
  }

  @ReactMethod
  public void onLaunch(String launchData) {
    stallionStateManager.setIsMounted(true);

    DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = this.currentReactContext.getJSModule(
      DeviceEventManagerModule.RCTDeviceEventEmitter.class
    );
    StallionEventManager.getInstance().setEmitter(eventEmitter);

    checkPendingDownloads();
  }

  private void checkPendingDownloads() {
    String pendingReleaseUrl = stallionStateManager.getPendingReleaseUrl();
    String pendingReleaseHash = stallionStateManager.getPendingReleaseHash();
    if(!pendingReleaseUrl.isEmpty() && !pendingReleaseHash.isEmpty()) {
      StallionSyncHandler.downloadNewRelease(pendingReleaseHash, pendingReleaseUrl);
      stallionStateManager.setPendingRelease("", "");
    }
  }

  @ReactMethod
  public void getStallionConfig(Promise promise) {
    try {
      String stallionConfigJsonString = stallionStateManager.getStallionConfig().toJSON().toString();
      promise.resolve(stallionConfigJsonString);
    } catch (Exception e) {
      promise.reject("getStallionConfig error:", e.toString());
    }
  }

  @ReactMethod
  public void getStallionMeta(Promise promise) {
    try {
      String stallionMetaJsonString = stallionStateManager.stallionMeta.toJSON().toString();
      promise.resolve(stallionMetaJsonString);
    } catch (Exception e) {
      promise.reject("getStallionMeta error:", e.toString());
    }
  }

  @ReactMethod
  public void toggleStallionSwitch(String switchState, Promise promise) {
    try {
      stallionStateManager.stallionMeta.setSwitchState(StallionMetaConstants.SwitchState.fromString(switchState));
      promise.resolve("Success");
    } catch (Exception e) {
      promise.reject("toggleStallionSwitch error:", e.toString());
    }
  }

  @ReactMethod
  public void updateSdkToken(String newSdkToken, Promise promise) {
    try {
      stallionStateManager.getStallionConfig().updateSdkToken(newSdkToken);
      promise.resolve("updateSdkToken success");
    } catch (Exception e) {
      promise.reject("updateSdkToken error:", e.toString());
    }
  }

  @ReactMethod
  public  void  sync() {
    StallionSyncHandler.sync();
  }

  @ReactMethod
  public void downloadStageBundle(ReadableMap bundleInfo, Promise promise) {
    StallionStageManager.downloadStageBundle(bundleInfo, promise);
  }

  @ReactMethod
  public void popEvents(Promise promise) {
    try {
      promise.resolve(StallionEventManager.getInstance().popEvents());
    } catch (Exception e) {
      promise.reject("popEvents error: ", e.toString());
    }
  }

  @ReactMethod
  public void acknowledgeEvents(String eventIdsJson, Promise promise) {
    try {
      // Parse the stringified JSON array into a Java List
      JSONArray jsonArray = new JSONArray(eventIdsJson);
      List<String> eventIds = new ArrayList<>();

      for (int i = 0; i < jsonArray.length(); i++) {
        eventIds.add(jsonArray.getString(i));
      }

      // Use StallionEventManager to acknowledge the events
      StallionEventManager eventManager = StallionEventManager.getInstance();
      eventManager.acknowledgeEvents(eventIds);

      // Resolve the promise indicating success
      promise.resolve("Events acknowledged successfully.");
    } catch (JSONException e) {
      // Reject the promise if JSON parsing fails
      promise.reject("ACKNOWLEDGE_EVENTS_JSON_ERROR", "Invalid JSON format for event IDs: " + e.getMessage(), e);
    } catch (Exception e) {
      // Reject the promise for other errors
      promise.reject("ACKNOWLEDGE_EVENTS_ERROR", "Failed to acknowledge events: " + e.getMessage(), e);
    }
  }
}
