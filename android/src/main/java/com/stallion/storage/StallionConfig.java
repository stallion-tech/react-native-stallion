package com.stallion.storage;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.res.Resources;
import android.provider.Settings;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.UUID;

public class StallionConfig {
  private String uid;
  private final String projectId;
  private final String appToken;
  private String sdkToken;
  private final String appVersion;
  private final SharedPreferences sharedPreferences;
  private final String filesDirectory;
  private String lastDownloadingUrl;
  private String publicSigningKey;

  public StallionConfig(Context context, SharedPreferences sharedPreferences) {
    this.sharedPreferences = sharedPreferences;
    Resources res = context.getResources();
    String parentPackageName= context.getPackageName();

    int stallionProjectIdRes = res.getIdentifier(
      StallionConfigConstants.STALLION_PROJECT_ID_IDENTIFIER,
      "string",
      parentPackageName
    );
    this.projectId = stallionProjectIdRes != 0 ?context.getString(stallionProjectIdRes) : "";

    int stallionAppTokenRes = res.getIdentifier(
      StallionConfigConstants.STALLION_APP_TOKEN_IDENTIFIER,
      "string",
      parentPackageName
    );
    this.appToken = stallionAppTokenRes != 0 ? context.getString(stallionAppTokenRes) : "";

    int stallionPublicKeyRes = res.getIdentifier(
      StallionConfigConstants.STALLION_PUBLIC_SIGNING_KEY_IDENTIFIER,
      "string",
      parentPackageName
    );
    this.publicSigningKey = stallionPublicKeyRes != 0 ? context.getString(stallionPublicKeyRes) : "";

    // get or generate UID
    String cachedUniqueId = sharedPreferences.getString(
      StallionConfigConstants.UNIQUE_ID_IDENTIFIER,
      ""
    );
    if(!cachedUniqueId.isEmpty()) {
      this.uid = cachedUniqueId;
    } else {
      try {
        this.uid = Settings.Secure.getString(
          context.getContentResolver(),
          Settings.Secure.ANDROID_ID
        );
      } catch (Exception ignored) {
        this.uid = UUID.randomUUID().toString();
      }
      SharedPreferences.Editor editor = sharedPreferences.edit();
      editor.putString(StallionConfigConstants.UNIQUE_ID_IDENTIFIER, this.uid);
      editor.apply();
    }

    this.sdkToken = sharedPreferences.getString(StallionConfigConstants.API_KEY_IDENTIFIER, "");

    this.appVersion = fetchAppVersion(context);
    this.filesDirectory = context.getFilesDir().getAbsolutePath();
    this.lastDownloadingUrl = sharedPreferences.getString(StallionConfigConstants.LAST_DOWNLOADING_URL_IDENTIFIER, "");
  }

  public String getLastDownloadingUrl() {
    return this.lastDownloadingUrl;
  }

  public void setLastDownloadingUrl(String newUrl) {
    this.lastDownloadingUrl = newUrl;
    SharedPreferences.Editor editor = sharedPreferences.edit();
    editor.putString(StallionConfigConstants.LAST_DOWNLOADING_URL_IDENTIFIER, newUrl);
    editor.apply();
  }

  private String fetchAppVersion(Context context) {
    try {
      PackageInfo pInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
      return pInfo.versionName;
    } catch (Exception ignored) {
      return "";
    }
  }

  public String getAppVersion() {
    return this.appVersion;
  }

  public String getProjectId() {
    return this.projectId;
  }

  public void updateSdkToken(String newApiKey) {
    if(!newApiKey.isEmpty()) {
      this.sdkToken = newApiKey;
      SharedPreferences.Editor editor = sharedPreferences.edit();
      editor.putString(StallionConfigConstants.API_KEY_IDENTIFIER, this.sdkToken);
      editor.apply();
    }
  }

  public String getAppToken() {
    return this.appToken;
  }

  public String getSdkToken() {
    return this.sdkToken;
  }

  public String getUid() {
    return this.uid;
  }

  public String getFilesDirectory() { return this.filesDirectory; }

  public String getPublicSigningKey() {
    return this.publicSigningKey;
  }

  public JSONObject toJSON() {
    JSONObject configJson = new JSONObject();
    try {
      configJson.put("uid", this.uid);
      configJson.put("projectId", this.projectId);
      configJson.put("appToken", this.appToken);
      configJson.put("sdkToken", this.sdkToken);
      configJson.put("appVersion", this.appVersion);
      return configJson;
    } catch (JSONException ignored) {
      return new JSONObject();
    }
  }
}
