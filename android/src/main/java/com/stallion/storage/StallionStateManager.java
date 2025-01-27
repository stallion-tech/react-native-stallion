package com.stallion.storage;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONException;
import org.json.JSONObject;

public class StallionStateManager {

  private static final String PREF_NAME = "stallion_state_manager";
  private static final String STALLION_META_KEY = "stallion_meta";

  private static StallionStateManager instance;
  private final SharedPreferences sharedPreferences;
  private final StallionConfig stallionConfig;
  public StallionMeta stallionMeta;
  private boolean isMounted;
  private String pendingReleaseUrl;
  private String pendingReleaseHash;


  private StallionStateManager(Context context) {
    this.sharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    this.stallionConfig = new StallionConfig(context, this.sharedPreferences);
    this.stallionMeta = this.fetchStallionMeta();
    this.isMounted = false;
    this.pendingReleaseUrl = "";
    this.pendingReleaseHash = "";
  }

  public static synchronized void init(Context context) {
    if (instance == null) {
      instance = new StallionStateManager(context);
    }
  }

  public static StallionStateManager getInstance() {
    if (instance == null) {
      throw new IllegalStateException("StallionStateManager is not initialized. Call init() first.");
    }
    return instance;
  }

  public void updateStallionMeta(StallionMeta newStallionMeta) {
    this.stallionMeta = newStallionMeta;
    this.syncStallionMeta();
  }

  public void syncStallionMeta() {
    try {
      SharedPreferences.Editor editor = sharedPreferences.edit();
      editor.putString(STALLION_META_KEY, stallionMeta.toJSON().toString());
      editor.apply();
    } catch (Exception ignored) {}
  }

  public StallionMeta fetchStallionMeta() {
    String jsonString = sharedPreferences.getString(STALLION_META_KEY, null);
    if (jsonString != null) {
      try {
        JSONObject jsonObject = new JSONObject(jsonString);
        return StallionMeta.fromJSON(jsonObject);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return new StallionMeta();
  }

  public void clearStallionMeta() {
    stallionMeta.reset();
    syncStallionMeta();
  }

  public void setIsMounted(Boolean isMounted) {
    this.isMounted = isMounted;
  }

  public boolean getIsMounted() {
    return this.isMounted;
  }

  public String getString(String key, String defaultString) {
    return sharedPreferences.getString(key, defaultString != null ? defaultString : "");
  }

  public void setString(String key, String value) {
    SharedPreferences.Editor editor = sharedPreferences.edit();
    editor.putString(key, value);
    editor.apply();
  }

  public StallionConfig getStallionConfig() {
    return this.stallionConfig;
  }

  public void setPendingRelease(String pendingReleaseUrl, String pendingReleaseHash) {
    this.pendingReleaseUrl = pendingReleaseUrl;
    this.pendingReleaseHash = pendingReleaseHash;
  }

  public String getPendingReleaseUrl() {
    return this.pendingReleaseUrl;
  }

  public String getPendingReleaseHash() {
    return this.pendingReleaseHash;
  }
}
