package com.stallion.events;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.stallion.BuildConfig;
import com.stallion.storage.StallionConfig;
import com.stallion.storage.StallionConfigConstants;
import com.stallion.storage.StallionStateManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

public class StallionEventManager {
  public  static final String STALLION_NATIVE_EVENT_NAME = "STALLION_NATIVE_EVENT";
  private static final String EVENTS_KEY = "stored_events";
  private static final int MAX_BATCH_COUNT_SIZE = 9;
  private static final int MAX_EVENT_STORAGE_LIMIT = 20;

  private static StallionEventManager instance;
  private final StallionStateManager stallionStateManager;
  private final AtomicReference<DeviceEventManagerModule.RCTDeviceEventEmitter> eventEmitterRef = new AtomicReference<>();

  // Private constructor for Singleton
  private StallionEventManager(StallionStateManager stateManager) {
    this.stallionStateManager = stateManager;
  }

  // Singleton initialization method
  public static synchronized void init(StallionStateManager stateManager) {
    if (instance == null) {
      instance = new StallionEventManager(stateManager);
    }
  }

  public void setEmitter(DeviceEventManagerModule.RCTDeviceEventEmitter deviceEmitter) {
    eventEmitterRef.set(deviceEmitter);
  }

  public DeviceEventManagerModule.RCTDeviceEventEmitter getEmitter() {
    return eventEmitterRef.get();
  }

  // Get instance method
  public static synchronized StallionEventManager getInstance() {
    if (instance == null) {
      throw new IllegalStateException("StallionEventManager is not initialized. Call init() first.");
    }
    return instance;
  }

  public void sendEventWithoutCaching(String eventName, JSONObject eventPayload) {
    try {
      eventPayload.put("type", eventName);
      DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = eventEmitterRef.get();
      // Emit the event to React Native
      if (eventEmitter != null && stallionStateManager.getIsMounted()) {
        eventEmitter.emit(STALLION_NATIVE_EVENT_NAME, eventPayload.toString());
      }

    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  // Method to send an event
  public void sendEvent(String eventName, JSONObject eventPayload) {
    try {
      StallionConfig stallionConfig = this.stallionStateManager.getStallionConfig();
      // Generate a unique ID for the event
      String uniqueId = UUID.randomUUID().toString();

      eventPayload.put("type", eventName);

      DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = eventEmitterRef.get();
      // Emit the event to React Native
      if (eventEmitter != null && stallionStateManager.getIsMounted()) {
        eventEmitter.emit(STALLION_NATIVE_EVENT_NAME, eventPayload.toString());
      }

      // change type for sending to server
      eventPayload.remove("type");
      eventPayload.put("eventType", eventName);

      // Add unique ID and timestamp to the event payload
      eventPayload.put("eventId", uniqueId);
      eventPayload.put("eventTimestamp", System.currentTimeMillis());
      eventPayload.put("projectId", stallionConfig.getProjectId());
      eventPayload.put("platform", StallionConfigConstants.PLATFORM);
      eventPayload.put("appVersion", stallionConfig.getAppVersion());
      eventPayload.put("uid", stallionConfig.getUid());
      eventPayload.put("sdkVersion", BuildConfig.STALLION_SDK_VERSION);

      // Store the event locally
      storeEventLocally(uniqueId, eventPayload);

    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  // Store the event locally in SharedPreferences
  private void storeEventLocally(String uniqueId, JSONObject eventPayload) {
    try {
      String eventsString = stallionStateManager.getString(EVENTS_KEY, "{}");
      JSONObject eventsObject = new JSONObject(eventsString);

      // Flush all if limit reached
      if (eventsObject.length() >= MAX_EVENT_STORAGE_LIMIT) {
        eventsObject = new JSONObject(); // reset
      }

      eventsObject.put(uniqueId, eventPayload.toString());
      stallionStateManager.setString(EVENTS_KEY, eventsObject.toString());
    } catch (JSONException e) {
      cleanupEventStorage();
      e.printStackTrace();
    }
  }

  private void cleanupEventStorage() {
    stallionStateManager.setString(EVENTS_KEY, "{}");
  }

  // Method to pop events as a batch
  public String popEvents() {
    try {
      String eventsString = stallionStateManager.getString(EVENTS_KEY, "{}");
      JSONObject eventsObject = new JSONObject(eventsString);

      JSONArray batch = new JSONArray();
      Iterator<String> keys = eventsObject.keys();

      int count = 0;
      while (keys.hasNext() && count < MAX_BATCH_COUNT_SIZE) {
        String key = keys.next();
        batch.put(new JSONObject(eventsObject.getString(key)));
        count++;
      }

      return batch.toString();

    } catch (JSONException e) {
      cleanupEventStorage();
      e.printStackTrace();
    }

    return "[]"; // Return an empty array if there are no events
  }

  // Acknowledge events by deleting them from local storage
  public void acknowledgeEvents(List<String> eventIds) {
    try {
      String eventsString = stallionStateManager.getString(EVENTS_KEY, "{}");
      JSONObject eventsObject = new JSONObject(eventsString);

      // Remove each event by its unique ID
      for (String eventId : eventIds) {
        if (eventsObject.has(eventId)) {
          eventsObject.remove(eventId);
        }
      }

      // Update the SharedPreferences with the modified events
      stallionStateManager.setString(EVENTS_KEY, eventsObject.toString());

    } catch (JSONException e) {
      e.printStackTrace();
    }
  }
}
