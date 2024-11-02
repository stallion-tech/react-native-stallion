package com.stallion;

import android.content.Context;
import android.provider.Settings;

import java.util.UUID;

public class StallionCommonUtil {
  public static String getUniqueId() {
    StallionStorage stallionStorage = StallionStorage.getInstance();
    String cachedUniqueId = stallionStorage.get(StallionConstants.UNIQUE_ID_IDENTIFIER);
    if(!cachedUniqueId.isEmpty()) {
      return  cachedUniqueId;
    }
    String uniqueId;
    try {
      Context currContext = StallionStorage.getInstance().mContext;
      uniqueId = Settings.Secure.getString(currContext.getContentResolver(), Settings.Secure.ANDROID_ID);
    } catch (Exception e) {
      uniqueId = UUID.randomUUID().toString();
    }
    stallionStorage.set(StallionConstants.UNIQUE_ID_IDENTIFIER, uniqueId);
    return  uniqueId;
  }
}
