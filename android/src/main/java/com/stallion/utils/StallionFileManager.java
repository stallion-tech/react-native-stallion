package com.stallion.utils;

import android.os.Build;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class StallionFileManager {

  // Constants
  private static final int BUFFER_SIZE = 4096;
  private static final String CHARSET_UTF_8 = "UTF-8";
  private static final String FILE_NOT_FOUND_ERROR = "File does not exist: ";
  private static final String SECURITY_EXCEPTION_MESSAGE = "Zip Path Traversal Vulnerability: ";

  /**
   * Unzips a given ZIP file to the specified destination directory.
   *
   * @param zipFilePath    The path to the ZIP file.
   * @param destDirectory  The destination directory where the contents will be extracted.
   */
  public static void unzipFile(String zipFilePath, String destDirectory) {
    validateFileExists(zipFilePath);
    createDestinationDirectory(destDirectory);

    try (ZipFile zipFile = openZipFile(zipFilePath)) {
      extractZipEntries(zipFile, destDirectory);
    } catch (IOException e) {
      throw new RuntimeException("Error unzipping file: " + e.getMessage(), e);
    }
  }

  private static void validateFileExists(String filePath) {
    File file = new File(filePath);
    if (!file.exists()) {
      throw new IllegalArgumentException(FILE_NOT_FOUND_ERROR + filePath);
    }
  }

  private static void createDestinationDirectory(String destDirectory) {
    File destDir = new File(destDirectory);

    // If the destination directory exists, delete it
    if (destDir.exists()) {
      deleteFileOrFolderSilently(destDir);
    }

    // Attempt to create the destination directory
    if (!destDir.mkdirs()) {
      throw new RuntimeException("Failed to create destination directory: " + destDirectory);
    }
  }

  private static ZipFile openZipFile(String zipFilePath) throws IOException {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      return new ZipFile(zipFilePath, Charset.forName(CHARSET_UTF_8));
    } else {
      return new ZipFile(zipFilePath);
    }
  }

  private static void extractZipEntries(ZipFile zipFile, String destDirectory) throws IOException {
    Enumeration<? extends ZipEntry> entries = zipFile.entries();
    while (entries.hasMoreElements()) {
      extractZipEntry(entries.nextElement(), destDirectory, zipFile);
    }
  }

  private static void extractZipEntry(ZipEntry entry, String destDirectory, ZipFile zipFile) throws IOException {
    if (entry.isDirectory()) return;

    File outputFile = new File(destDirectory, entry.getName());
    validateZipEntryPath(outputFile, destDirectory);
    createParentDirectory(outputFile);

    try (InputStream in = zipFile.getInputStream(entry);
         BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(outputFile))) {
      copy(in, out);
    }
  }

  private static void validateZipEntryPath(File outputFile, String destDirectory) throws IOException {
    String canonicalPath = outputFile.getCanonicalPath();
    String canonicalDestDir = new File(destDirectory).getCanonicalPath() + File.separator;
    if (!canonicalPath.startsWith(canonicalDestDir)) {
      throw new SecurityException(SECURITY_EXCEPTION_MESSAGE + canonicalPath);
    }
  }

  private static void createParentDirectory(File file) {
    File parentDir = file.getParentFile();
    if (parentDir != null && !parentDir.exists() && !parentDir.mkdirs()) {
      throw new RuntimeException("Failed to create parent directory: " + parentDir);
    }
  }

  private static long copy(InputStream from, OutputStream to) throws IOException {
    byte[] buffer = new byte[BUFFER_SIZE];
    long total = 0;
    int bytesRead;
    while ((bytesRead = from.read(buffer)) != -1) {
      to.write(buffer, 0, bytesRead);
      total += bytesRead;
    }
    return total;
  }

  /**
   * Deletes a file or directory silently. If it's a directory, all its contents are deleted recursively.
   *
   * @param file The file or directory to delete.
   */
  public static void deleteFileOrFolderSilently(File file) {
    if (file.isDirectory()) {
      File[] files = file.listFiles();
      if (files != null) {
        for (File child : files) {
          deleteFileOrFolderSilently(child);
        }
      }
    }
    if (!file.delete()) {
      throw new RuntimeException("Failed to delete file: " + file.getAbsolutePath());
    }
  }

  /**
   * Moves a file from one location to another. If the destination file exists, it is replaced.
   *
   * @param fromFile Source file.
   * @param toFile   Destination file.
   */
  public static void moveFile(File fromFile, File toFile) {
    if (toFile.exists()) {
      deleteFileOrFolderSilently(toFile);
    }
    if (!toFile.getParentFile().exists() && !toFile.getParentFile().mkdirs()) {
      throw new RuntimeException("Failed to create destination directory: " + toFile.getParent());
    }
    if (!fromFile.renameTo(toFile)) {
      copyFile(fromFile, toFile);
      deleteFileOrFolderSilently(fromFile);
    }
  }

  public static void copyFile(File source, File destination) {
    try (InputStream in = new FileInputStream(source);
         OutputStream out = new FileOutputStream(destination)) {
      copy(in, out);
    } catch (IOException e) {
      throw new RuntimeException("Failed to copy file: " + e.getMessage(), e);
    }
  }
}
