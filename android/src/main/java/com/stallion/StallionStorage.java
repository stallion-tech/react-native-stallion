package com.stallion;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

public class StallionStorage {
  private static StallionStorage mInstance;
  public Context mContext;

  private SharedPreferences sharedPreference;

  public static StallionStorage getInstance(){
    if (mInstance == null) mInstance = new StallionStorage();
    return mInstance;
  }

  public void Initialize(Context context){
    mContext = context;
    sharedPreference = PreferenceManager.getDefaultSharedPreferences(mContext);
  }

  public String get(String key) {
    return sharedPreference.getString(key, "");
  }

  public void set(String key, String value) {
    SharedPreferences.Editor editor = sharedPreference.edit();
    editor.putString(key, value);
    editor.apply();
  }

  public void setInt(String key, Integer value) {
    SharedPreferences.Editor editor = sharedPreference.edit();
    editor.putInt(key, value);
    editor.apply();
  }

  public Integer getInt(String key) {
    return sharedPreference.getInt(key, -1);
  }

  public void delete(String key, Boolean deleteAll) {
    SharedPreferences.Editor editor = sharedPreference.edit();
    if(deleteAll){
      editor.clear();
      return;
    } else {
      editor.remove(key);
    }
    editor.apply();
  }
}


