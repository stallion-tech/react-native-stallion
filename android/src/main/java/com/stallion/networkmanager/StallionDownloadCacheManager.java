package com.stallion.networkmanager;

import com.stallion.storage.StallionConfig;
import com.stallion.utils.StallionFileManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.Objects;

public class StallionDownloadCacheManager {
  private static final String metaFilePath = "/download-cache.meta";

  public static long getDownloadCache(StallionConfig config, String downloadUrl, String downloadPath) {
    String lastDownloadingUrl = config.getLastDownloadingUrl();
    long alreadyDownloaded = readMetaFile(downloadPath);
    if(!Objects.equals(lastDownloadingUrl, downloadUrl) || alreadyDownloaded <= 0) {
      config.setLastDownloadingUrl(downloadUrl);
      StallionFileManager.deleteFileOrFolderSilently(new File(downloadPath));
      return 0;
    } else {
      return alreadyDownloaded;
    }
  }

  public static void saveDownloadCache(String path, long bytes) {
    try (FileOutputStream fos = new FileOutputStream(path + metaFilePath)) {
      fos.write(Long.toString(bytes).getBytes());
    } catch (Exception ignored) {}
  }

  private static long readMetaFile(String path) {
    File meta = new File(path + metaFilePath);
    if (!meta.exists()) return 0;
    try (FileInputStream fis = new FileInputStream(meta)) {
      byte[] data = new byte[(int) meta.length()];
      fis.read(data);
      return Long.parseLong(new String(data));
    } catch (Exception e) {
      return 0;
    }
  }

  public static void deleteDownloadCache(String path) {
    File meta = new File(path + metaFilePath);
    if (meta.exists()) meta.delete();
  }
}
