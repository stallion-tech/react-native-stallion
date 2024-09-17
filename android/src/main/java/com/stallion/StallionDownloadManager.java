package com.stallion;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.res.Resources;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class StallionDownloadManager {
  private static StallionStorage stallionStorage = StallionStorage.getInstance();
  public static void sync() {
    try {
      Context appContext = stallionStorage.mContext;
      PackageInfo pInfo = appContext.getPackageManager().getPackageInfo(appContext.getPackageName(), 0);
//      String appVersion = pInfo.versionName; // TODO: Uncomment
      String appVersion = "4.0.5";

      Resources res = appContext.getResources();
      String parentPackageName= appContext.getPackageName();
      int stallionProjectIdRes = res.getIdentifier(StallionConstants.STALLION_PROJECT_ID_IDENTIFIER, "string", parentPackageName);
      int stallionTokenRes = res.getIdentifier(StallionConstants.STALLION_APP_TOKEN_IDENTIFIER, "string", parentPackageName);
      String projectId = appContext.getString(stallionProjectIdRes);
      String appToken = appContext.getString(stallionTokenRes);
      String platform = "ios"; // TODO: change
      JSONObject releaseMeta = StallionApiUtil.post(
        StallionConstants.STALLION_API_BASE + StallionConstants.STALLION_INFO_API_PATH,
        String.format(String.format("{\"appVersion\": \"%s\", \"platform\": \"%s\", \"projectId\": \"%s\" }", appVersion, platform, projectId)),
        appToken
      );
      if(releaseMeta.optBoolean("success")) {
        JSONObject data = releaseMeta.optJSONObject("data");
        JSONObject newReleaseData = data.optJSONObject("newBundleData");
        String newReleaseUrl = newReleaseData.optString("downloadUrl");
        String newReleaseHash = newReleaseData.optString("sha256Checksum");
        if(newReleaseUrl != null && newReleaseHash != null) {
          downloadBundle(
            newReleaseUrl + "?projectId=" + projectId,
            appContext.getFilesDir().getAbsolutePath() + StallionConstants.STALLION_PACKAGE_PATH,
            "",
            appToken,
            new StallionDownloadCallback() {
              @Override
              public void onReject(String prefix, String error) {
                Log.d(prefix, error);
              }

              @Override
              public void onSuccess(String successPayload) {
                Log.d("STALLION SUCCESS:", successPayload);
              }

              @Override
              public void onProgress(double downloadFraction) {
                Log.d("STALLION PROGRESS:", String.valueOf(downloadFraction));
              }
            }
          );
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public static void downloadBundle(
    String downloadUrl,
    String downloadDirectory,
    String sdkAccessToken,
    String appAccessToken,
    StallionDownloadCallback stallionDownloadCallback
  ) {
    ExecutorService executor = Executors.newSingleThreadExecutor();

    executor.execute(() -> {

      FileOutputStream fout = null;
      BufferedOutputStream bout = null;
      BufferedInputStream inputStream = null;
      HttpURLConnection connection = null;
      File downloadedZip = null;
      boolean isZip = false;

      try {
        int DOWNLOAD_BUFFER_SIZE = StallionConstants.DOWNLOAD_BUFFER_SIZE;
        URL url = new URL(downloadUrl);
        connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod( "GET" );
        connection.setRequestProperty("x-sdk-access-token", sdkAccessToken);
        connection.setRequestProperty("x-app-token", appAccessToken);
        connection.setRequestProperty("Content-Type", "application/json");

        connection.setDoInput(true);

        connection.connect();
        inputStream = new BufferedInputStream(connection.getInputStream());
        File downloadFolder = new File(downloadDirectory + StallionConstants.TEMP_DOWNLOAD_FOLDER);
        downloadFolder.getParentFile().mkdirs();

        downloadedZip = new File(downloadFolder, StallionConstants.ZIP_FILE_NAME);
        downloadedZip.getParentFile().mkdirs();

        fout = new FileOutputStream(downloadedZip, false);
        bout = new BufferedOutputStream(fout, DOWNLOAD_BUFFER_SIZE);
        byte[] data = new byte[DOWNLOAD_BUFFER_SIZE];
        byte[] header = new byte[4];

        long totalBytes = connection.getContentLength();
        long receivedBytes = 0;
        int numBytesRead;
        double prevDownloadFraction = 0;
        double progressEventThreshold = 0.1;
        while ((numBytesRead = inputStream.read(data, 0, DOWNLOAD_BUFFER_SIZE)) >= 0) {
          if (receivedBytes < 4) {
            for (int i = 0; i < numBytesRead; i++) {
              int headerOffset = (int) (receivedBytes) + i;
              if (headerOffset >= 4) {
                break;
              }
              header[headerOffset] = data[i];
            }
          }

          receivedBytes += numBytesRead;
          bout.write(data, 0, numBytesRead);
          double currentDownloadFraction = (double) receivedBytes / (double) totalBytes;
          if(currentDownloadFraction - prevDownloadFraction > progressEventThreshold) {
            prevDownloadFraction = currentDownloadFraction;
            stallionDownloadCallback.onProgress(currentDownloadFraction);
          }
        }

        isZip = ByteBuffer.wrap(header).getInt() == 0x504b0304;
      } catch (Exception e) {
        stallionDownloadCallback.onReject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_API_ERROR_MESSAGE);
      } finally {
        try {
          if (bout != null) bout.close();
          if (fout != null) fout.close();
          if (inputStream != null) inputStream.close();
          if (connection != null) connection.disconnect();
        } catch (IOException e) {
          stallionDownloadCallback.onReject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_API_ERROR_MESSAGE);
        }
      }

      if (!isZip) {
        stallionDownloadCallback.onReject(StallionConstants.DOWNLOAD_ERROR_PREFIX, "Not a zip file");
        return;
      }

      try {
        StallionFileUtil.unzipFile(downloadedZip.getAbsolutePath(), downloadDirectory + StallionConstants.TEMP_DOWNLOAD_FOLDER);
        stallionDownloadCallback.onSuccess(StallionConstants.DOWNLOAD_SUCCESS_MESSAGE);
      } catch (Exception e) {
        stallionDownloadCallback.onReject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_FILESYSTEM_ERROR_MESSAGE);
      } finally {
        try {
          StallionFileUtil.deleteFileOrFolderSilently(downloadedZip);
        } catch (Exception e) {
          stallionDownloadCallback.onReject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_DELETE_ERROR);
        }
        return;
      }
    });
  }
}
