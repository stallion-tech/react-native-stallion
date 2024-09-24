package com.stallion;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;

public class StallionEventEmitter {
  private static ArrayList<WritableMap> pendingEvents = new ArrayList<WritableMap>();

  public static void triggerPendingEvents() {
    for(WritableMap pendingEvent : pendingEvents) {
      triggerEvent(pendingEvent);
    }
    pendingEvents.clear();
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
    WritableMap params = Arguments.createMap();
    params.putString("type", eventName);
    params.putMap("payload", eventValue);
    return  params;
  }
}
