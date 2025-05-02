package com.stallion.networkmanager;

import android.os.StatFs;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.util.Log;

import com.stallion.storage.StallionConfig;
import com.stallion.storage.StallionStateManager;
import com.stallion.utils.StallionFileManager;

public class StallionFileDownloader {

  private static final String TAG = "StallionFileDownloader";
  private static final ExecutorService executor = Executors.newSingleThreadExecutor();

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
        String lastDownloadingUrl = config.getLastDownloadingUrl();
        long alreadyDownloaded = readMetaFile(downloadedZip.getAbsolutePath());

        if(!Objects.equals(lastDownloadingUrl, downloadUrl) || alreadyDownloaded <= 0) {
          downloadedZip = cleanupDownloadDirectory(downloadDirectory);
        }

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

        config.setLastDownloadingUrl(downloadUrl);
        // Download file
        downloadFile(downloadUrl, downloadedZip, appToken, sdkToken, stallionDownloadCallback, alreadyDownloaded);

        // Validate and unzip the downloaded file
        validateAndUnzip(downloadedZip, downloadDirectory, stallionDownloadCallback);

        config.setLastDownloadingUrl("");
      } catch (Exception e) {
        Log.e(TAG, "Error in downloadBundle: " + e.getMessage(), e);
      }
    });
  }

  private static File cleanupDownloadDirectory(String downloadDirectory) throws IOException {
    StallionFileManager.deleteFileOrFolderSilently(new File(downloadDirectory));
    return prepareForDownload(downloadDirectory);
  }

  private static long getFileSize(String downloadUrl, String appToken, String apiKey) throws IOException {
    HttpURLConnection connection = null;
    try {
      connection = setupConnection(downloadUrl, appToken, apiKey, 0);
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
    if (!downloadFolder.exists()) {
      if (!downloadFolder.mkdirs()) {
        throw new IOException("Failed to create download directory: " + downloadDirectory);
      }
    }
    return new File(downloadFolder, StallionApiConstants.ZIP_FILE_NAME);
  }

  private static void downloadFile(
    String downloadUrl,
    File destinationFile,
    String appToken,
    String sdkToken,
    StallionDownloadCallback callback,
    long alreadyDownloaded
  ) throws IOException {
    HttpURLConnection connection = setupConnection(downloadUrl, appToken, sdkToken, alreadyDownloaded);
    Log.d("Download", "HTTP response code: " + connection.getResponseCode());
    Log.d("Download", "Content-Range: " + connection.getHeaderField("Content-Range"));

    try (
      BufferedInputStream inputStream = new BufferedInputStream(connection.getInputStream());
      RandomAccessFile raf = new RandomAccessFile(destinationFile, "rw")
    ) {
      raf.seek(alreadyDownloaded);
      byte[] buffer = new byte[StallionApiConstants.DOWNLOAD_BUFFER_SIZE];
      long totalBytes = connection.getContentLength() + alreadyDownloaded;
      long receivedBytes = alreadyDownloaded;
      int bytesRead;
      double lastProgress = (double) receivedBytes / totalBytes;

      if (totalBytes <= 0) {
        callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, "Invalid content length: ");
        return;
      }

      while ((bytesRead = inputStream.read(buffer)) != -1) {
        raf.write(buffer, 0, bytesRead);
        receivedBytes += bytesRead;

        saveMetaFile(destinationFile.getAbsolutePath(), receivedBytes);

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

      if (receivedBytes < totalBytes) {
        callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, "Incomplete file download");
        return;
      }

      deleteMetaFile(destinationFile.getAbsolutePath());

    } catch (IOException e) {
      saveMetaFile(destinationFile.getAbsolutePath(), alreadyDownloaded);
      callback.onReject(StallionApiConstants.DOWNLOAD_ERROR_PREFIX, "IOException occurred: ");
      throw e;
    } finally {
      if (connection != null) {
        connection.disconnect();
      }
    }
  }

  private static HttpURLConnection setupConnection(String downloadUrl, String appToken, String sdkToken, long offset) throws IOException {
    URL url = new URL(downloadUrl);
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");

    if (offset > 0) {
      connection.setRequestProperty("Range", "bytes=" + offset + "-");
    }

    if(!appToken.isEmpty()) {
      connection.setRequestProperty(StallionApiConstants.STALLION_APP_TOKEN_KEY, appToken);
    }
    if(!sdkToken.isEmpty()) {
      connection.setRequestProperty(StallionApiConstants.STALLION_SDK_TOKEN_KEY, sdkToken);
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
      String filesystemError = e.getMessage() != null ? e.getMessage() : "Unknown filesystem error";
      callback.onReject(
        StallionApiConstants.DOWNLOAD_ERROR_PREFIX,
        StallionApiConstants.DOWNLOAD_FILESYSTEM_ERROR_MESSAGE + filesystemError
      );
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

  private static void saveMetaFile(String path, long bytes) {
    try (FileOutputStream fos = new FileOutputStream(path + ".meta")) {
      fos.write(Long.toString(bytes).getBytes());
    } catch (IOException ignored) {}
  }

  private static long readMetaFile(String path) {
    File meta = new File(path + ".meta");
    if (!meta.exists()) return 0;
    try (FileInputStream fis = new FileInputStream(meta)) {
      byte[] data = new byte[(int) meta.length()];
      fis.read(data);
      return Long.parseLong(new String(data));
    } catch (Exception e) {
      return 0;
    }
  }

  private static void deleteMetaFile(String path) {
    File meta = new File(path + ".meta");
    if (meta.exists()) meta.delete();
  }
}
