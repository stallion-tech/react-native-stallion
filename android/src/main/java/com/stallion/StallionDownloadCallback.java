package com.stallion;

public interface StallionDownloadCallback {
  void onReject(String prefix, String error);
  void onSuccess(String successPayload);
  void onProgress(double downloadFraction);
}
