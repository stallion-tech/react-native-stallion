package com.stallion.networkmanager;

import android.os.StatFs;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.util.Log;

import com.stallion.storage.StallionConfig;
import com.stallion.storage.StallionStateManager;
import com.stallion.utils.StallionFileManager;

public class StallionFileDownloader {

  private static final String TAG = "StallionFileDownloader";
  private static final ExecutorService executor = Executors.newFixedThreadPool(2);

  public static void downloadBundle(
    String downloadUrl,
    String downloadDirectory,
    StallionDownloadCallback stallionDownloadCallback
  ) {
    executor.execute(() -> {
      try {
        // Prepare for download
        File downloadedZip = prepareForDownload(downloadDirectory);

        // Fetch appToken and apiKey
        StallionStateManager stateManager = StallionStateManager.getInstance();
        StallionConfig config = stateManager.getStallionConfig();
        String appToken = config.getAppToken();
        String sdkToken = config.getSdkToken();

        // Get file size
        long fileSize = getFileSize(downloadUrl, appToken, sdkToken);
        if (fileSize <= 0) {
          stallionDownloadCallback.onReject(
            StallionApiConstants.DOWNLOAD_ERROR_PREFIX,
            "File size is zero or unknown"
          );
          return;
        }

        // Check available storage
        if (!isEnoughSpaceAvailable(downloadDirectory, fileSize)) {
          stallionDownloadCallback.onReject(
            StallionApiConstants.DOWNLOAD_ERROR_PREFIX,
            "Not enough space to download the file"
          );
          return;
        }

        // Download file
        downloadFile(downloadUrl, downloadedZip, appToken, sdkToken, stallionDownloadCallback);

        // Validate and unzip the downloaded file
        validateAndUnzip(downloadedZip, downloadDirectory, stallionDownloadCallback);

      } catch (Exception e) {
        Log.e(TAG, "Error in downloadBundle: " + e.getMessage(), e);
        stallionDownloadCallback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, e.getMessage());
      }
    });
  }

  private static long getFileSize(String downloadUrl, String appToken, String apiKey) throws IOException {
    HttpURLConnection connection = null;
    try {
      connection = setupConnection(downloadUrl, appToken, apiKey);
      return connection.getContentLength();
    } finally {
      if (connection != null) {
        connection.disconnect();
      }
    }
  }

  private static boolean isEnoughSpaceAvailable(String directoryPath, long fileSize) {
    File directory = new File(directoryPath);
    if (!directory.exists()) {
      directory.mkdirs();
    }
    StatFs statFs = new StatFs(directory.getPath());
    long availableBytes = (long) statFs.getAvailableBlocksLong() * statFs.getBlockSizeLong();
    return availableBytes >= fileSize;
  }

  private static File prepareForDownload(String downloadDirectory) throws IOException {
    File downloadFolder = new File(downloadDirectory);
    if (downloadFolder.exists()) {
      StallionFileManager.deleteFileOrFolderSilently(downloadFolder);
    }
    if (!downloadFolder.mkdirs()) {
      throw new IOException("Failed to create download directory: " + downloadDirectory);
    }
    return new File(downloadFolder, StallionApiConstants.ZIP_FILE_NAME);
  }

  private static void downloadFile(
    String downloadUrl,
    File destinationFile,
    String appToken,
    String sdkToken,
    StallionDownloadCallback callback
  ) throws IOException {
    HttpURLConnection connection = null;
    try (
      BufferedInputStream inputStream = new BufferedInputStream(setupConnection(downloadUrl, appToken, sdkToken).getInputStream());
      FileOutputStream fout = new FileOutputStream(destinationFile);
      BufferedOutputStream bout = new BufferedOutputStream(fout, StallionApiConstants.DOWNLOAD_BUFFER_SIZE)
    ) {
      connection = setupConnection(downloadUrl, appToken, sdkToken);

      byte[] buffer = new byte[StallionApiConstants.DOWNLOAD_BUFFER_SIZE];
      long totalBytes = connection.getContentLength();
      long receivedBytes = 0;
      int bytesRead;
      double lastProgress = 0;

      // Ensure totalBytes is valid
      if (totalBytes <= 0) {
        callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, "Invalid content length: " + totalBytes);
        return;
      }

      while ((bytesRead = inputStream.read(buffer)) != -1) {
        bout.write(buffer, 0, bytesRead);
        receivedBytes += bytesRead;

        double progress = (double) receivedBytes / totalBytes;
        if (Double.isNaN(progress) || Double.isInfinite(progress)) {
          callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, "Invalid progress calculation");
          return;
        }

        if (progress - lastProgress >= 0.1) {
          lastProgress = progress;
          callback.onProgress(progress);
        }
      }

      // Check for incomplete download
      if (receivedBytes < totalBytes) {
        callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, "Incomplete file download");
        return;
      }
    } catch (IOException e) {
      callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, "IOException occurred: " + e.getMessage());
      throw e;
    } finally {
      if (connection != null) {
        connection.disconnect();
      }
    }
  }


  private static HttpURLConnection setupConnection(String downloadUrl, String appToken, String sdkToken) throws IOException {
    URL url = new URL(downloadUrl);
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");

    if(!appToken.isEmpty()) {
      connection.setRequestProperty("x-app-token", appToken);
    }
    if(!sdkToken.isEmpty()) {
      connection.setRequestProperty("x-sdk-access-token", sdkToken);
    }

    connection.setDoInput(true);
    connection.connect();
    return connection;
  }

  private static void validateAndUnzip(
    File downloadedZip,
    String destDirectory,
    StallionDownloadCallback callback
  ) {
    try {
      if (!isValidZip(downloadedZip)) {
        callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, "Invalid ZIP file");
        return;
      }

      StallionFileManager.unzipFile(downloadedZip.getAbsolutePath(), destDirectory);
      File otaBundle = new File(destDirectory + StallionApiConstants.UNZIP_FOLDER_NAME + StallionApiConstants.ANDROID_BUNDLE_FILE_NAME);

      if (otaBundle.exists()) {
        callback.onSuccess(StallionApiConstants.DOWNLOAD_SUCCESS_MESSAGE);
      } else {
        callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, StallionApiConstants.CORRUPTED_FILE_ERROR);
      }
    } catch (Exception e) {
      Log.e(TAG, "Error during file validation or unzipping: " + e.getMessage(), e);
      callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, StallionApiConstants.DOWNLOAD_FILESYSTEM_ERROR_MESSAGE);
    } finally {
      StallionFileManager.deleteFileOrFolderSilently(downloadedZip);
    }
  }

  private static boolean isValidZip(File file) throws IOException {
    try (FileInputStream fis = new FileInputStream(file)) {
      byte[] header = new byte[4];
      if (fis.read(header) != 4) {
        return false;
      }
      return ByteBuffer.wrap(header).getInt() == 0x504b0304;
    }
  }
}
