package com.stallion;

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
        if(!sdkAccessToken.isEmpty()) {
          connection.setRequestProperty("x-sdk-access-token", sdkAccessToken);
        }
        if(!appAccessToken.isEmpty()) {
          connection.setRequestProperty("x-app-token", appAccessToken);
        }

        connection.setDoInput(true);

        connection.connect();
        inputStream = new BufferedInputStream(connection.getInputStream());
        File downloadFolder = new File(downloadDirectory);
        if(downloadFolder.exists()) {
          StallionFileUtil.deleteFileOrFolderSilently(downloadFolder);
        }
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
        StallionFileUtil.unzipFile(downloadedZip.getAbsolutePath(), downloadDirectory);
        stallionDownloadCallback.onSuccess(StallionConstants.DOWNLOAD_SUCCESS_MESSAGE);
      } catch (Exception e) {
        stallionDownloadCallback.onReject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_FILESYSTEM_ERROR_MESSAGE);
      } finally {
        try {
          StallionFileUtil.deleteFileOrFolderSilently(downloadedZip);
        } catch (Exception e) {
          stallionDownloadCallback.onReject(StallionConstants.DOWNLOAD_ERROR_PREFIX, StallionConstants.DOWNLOAD_DELETE_ERROR);
        }
      }
    });
  }
}
