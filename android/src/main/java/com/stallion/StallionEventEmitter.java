package com.stallion;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.Objects;

public class StallionEventEmitter {
  private static ArrayList<WritableMap> pendingEvents = new ArrayList<WritableMap>();
  private static final String CACHE_EVENTS_KEY = "cached_pending_events";

  public static void triggerPendingEvents() {
    loadCachedEvents();
    for(WritableMap pendingEvent : pendingEvents) {
      triggerEvent(pendingEvent);
    }
    pendingEvents.clear();
    clearCachedEvents();
  }

  public static void sendEvent(WritableMap payload) {
    if(StallionStorage.getInstance().getIsMounted()) {
      triggerEvent(payload);
    } else {
      pendingEvents.add(payload);
    }
  }

  private static void triggerEvent(WritableMap payload) {
    ReactApplicationContext reactContext = (ReactApplicationContext) StallionStorage.getInstance().mContext;
    DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    eventEmitter.emit(StallionConstants.STALLION_NATIVE_EVENT_NAME, payload);
  }

  public static WritableMap getEventPayload(String eventName, WritableMap eventValue) {
    StallionStorage stallionStorageInstance = StallionStorage.getInstance();
    String stallionAppVersionCache = stallionStorageInstance.get(StallionConstants.STALLION_APP_VERSION_IDENTIFIER);
    WritableMap params = Arguments.createMap();
    eventValue.putString("AppVersion", stallionAppVersionCache);
    params.putString("type", eventName);
    params.putMap("payload", eventValue);
    return  params;
  }

  public static void cacheEvent(WritableMap payload) {
    try {
      StallionStorage stallionStorage = StallionStorage.getInstance();
      String cachedEventsJson = stallionStorage.get(CACHE_EVENTS_KEY);
      String newEvent = readableMapToString(payload);

      // Concatenate the new event with existing ones, separated by a delimiter
      String updatedEvents = cachedEventsJson.isEmpty() ? newEvent : cachedEventsJson + "|" + newEvent;
      stallionStorage.set(CACHE_EVENTS_KEY, updatedEvents);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  private static void loadCachedEvents() {
    try {
      StallionStorage stallionStorage = StallionStorage.getInstance();
      String cachedEvents = stallionStorage.get(CACHE_EVENTS_KEY);

      if (!cachedEvents.isEmpty()) {
        String[] eventArray = cachedEvents.split("\\|");
        for (String eventString : eventArray) {
          WritableMap eventMap = stringToWritableMap(eventString);
          pendingEvents.add(eventMap);
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  private static void clearCachedEvents() {
    StallionStorage stallionStorage = StallionStorage.getInstance();
    stallionStorage.set(CACHE_EVENTS_KEY, "");
  }

  // Convert WritableMap to String (JSON)
  public static String readableMapToString(ReadableMap map) throws JSONException {
    JSONObject jsonObject = new JSONObject();
    ReadableMapKeySetIterator iterator = map.keySetIterator();

    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      switch (map.getType(key)) {
        case String:
          jsonObject.put(key, map.getString(key));
          break;
        case Map:
          jsonObject.put(key, new JSONObject(readableMapToString(Objects.requireNonNull(map.getMap(key)))));
          break;
        case Boolean:
          jsonObject.put(key, map.getBoolean(key));
          break;
        case Number:
          jsonObject.put(key, map.getDouble(key));
          break;
        case Null:
          jsonObject.put(key, JSONObject.NULL);
          break;
      }
    }
    return jsonObject.toString();
  }

  // Convert String (JSON) back to WritableMap
  public static WritableMap stringToWritableMap(String jsonString) throws JSONException {
    JSONObject jsonObject = new JSONObject(jsonString);
    WritableMap map = new WritableNativeMap();

    Iterator<String> keys = jsonObject.keys();
    while (keys.hasNext()) {
      String key = keys.next();
      Object value = jsonObject.get(key);

      if (value instanceof JSONObject) {
        map.putMap(key, stringToWritableMap(value.toString()));
      } else if (value instanceof Boolean) {
        map.putBoolean(key, (Boolean) value);
      } else if (value instanceof Number) {
        map.putDouble(key, ((Number) value).doubleValue());
      } else if (value instanceof String) {
        map.putString(key, (String) value);
      } else if (value == JSONObject.NULL) {
        map.putNull(key);
      }
    }
    return map;
  }

}
