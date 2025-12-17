package com.stallion.utils;

import android.os.Build;

import com.stallion.storage.StallionConfig;

import org.json.JSONObject;

import java.util.Locale;
import java.util.TimeZone;

public class StallionDeviceInfo {

  /**
   * Sample JSON contract for deviceMeta
   * {
   *   "osName": "Android",
   *   "osVersion": "14",
   *   "sdkInt": 34,
   *   "manufacturer": "Google",
   *   "brand": "google",
   *   "model": "Pixel 7",
   *   "device": "panther",
   *   "product": "panther",
   *   "hardware": "panther",
   *   "locale": "en-US",
   *   "localeLanguage": "en",
   *   "localeCountry": "US",
   *   "timezone": "America/Los_Angeles",
   *   "timezoneOffsetMinutes": -420,
   *   "isEmulator": false,
   *   "projectId": "<project-id>",
   *   "uid": "<device-uid>",
   *   "appVersion": "1.2.3"
   * }
   */
  public static JSONObject getDeviceMetaJson(StallionConfig config) {
    JSONObject json = new JSONObject();
    try {
      json.put("osName", "Android");
      json.put("osVersion", Build.VERSION.RELEASE != null ? Build.VERSION.RELEASE : "");
      json.put("sdkInt", Build.VERSION.SDK_INT);
      json.put("manufacturer", Build.MANUFACTURER != null ? Build.MANUFACTURER : "");
      json.put("brand", Build.BRAND != null ? Build.BRAND : "");
      json.put("model", Build.MODEL != null ? Build.MODEL : "");
      json.put("device", Build.DEVICE != null ? Build.DEVICE : "");
      json.put("product", Build.PRODUCT != null ? Build.PRODUCT : "");
      json.put("hardware", Build.HARDWARE != null ? Build.HARDWARE : "");
      Locale defaultLocale = Locale.getDefault();
      json.put("locale", defaultLocale != null ? defaultLocale.toLanguageTag() : "");
      json.put("localeLanguage", defaultLocale != null ? defaultLocale.getLanguage() : "");
      json.put("localeCountry", defaultLocale != null ? defaultLocale.getCountry() : "");
      TimeZone tz = TimeZone.getDefault();
      json.put("timezone", tz != null ? tz.getID() : "");
      json.put("timezoneOffsetMinutes", tz != null ? (tz.getOffset(System.currentTimeMillis()) / 60000) : 0);
      json.put("isEmulator", isProbablyEmulator());
      if (config != null) {
        json.put("projectId", config.getProjectId());
        json.put("uid", config.getUid());
        json.put("appVersion", config.getAppVersion());
      }
    } catch (Exception ignored) { }
    return json;
  }

  private static boolean isProbablyEmulator() {
    String fingerprint = Build.FINGERPRINT;
    String model = Build.MODEL;
    String manufacturer = Build.MANUFACTURER;
    String brand = Build.BRAND;
    String device = Build.DEVICE;
    String product = Build.PRODUCT;

    if (fingerprint != null && (fingerprint.startsWith("generic") || fingerprint.startsWith("unknown"))) return true;
    if (model != null && (model.contains("google_sdk") || model.contains("Emulator") || model.contains("Android SDK built for x86"))) return true;
    if (manufacturer != null && manufacturer.contains("Genymotion")) return true;
    if (brand != null && brand.startsWith("generic") && device != null && device.startsWith("generic")) return true;
    if (product != null && product.equals("google_sdk")) return true;
    return false;
  }
}


