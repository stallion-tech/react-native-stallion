package com.stallion.networkmanager;

public interface StallionDownloadCallback {
  void onReject(String prefix, String error);
  void onSuccess(String successPayload);
  void onProgress(double downloadFraction);
}
