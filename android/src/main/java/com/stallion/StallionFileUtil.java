package com.stallion;

import android.os.Build;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class StallionFileUtil {
    private static final int BUF_SIZE = 0x1000;

  public static void unzipFile(final String zipFilePath, final String destDirectory) {

    try {
      if (!new File(zipFilePath).exists()) {
        throw new IllegalArgumentException("File does not exist");
      }
    } catch (NullPointerException e) {
      throw new RuntimeException(e);
    }

    try {
      String charset = "UTF-8";

      File destDir = new File(destDirectory);
      if (!destDir.exists()) {
        destDir.mkdirs();
      }

      ZipFile zipFile;
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        zipFile = new ZipFile(zipFilePath, Charset.forName(charset));
      } else {
        zipFile = new ZipFile(zipFilePath);
      }

      final Enumeration<? extends ZipEntry> entries = zipFile.entries();
      while (entries.hasMoreElements()) {
        final ZipEntry entry = entries.nextElement();
        if (entry.isDirectory()) continue;

        File fout = new File(destDirectory, entry.getName());
        String canonicalPath = fout.getCanonicalPath();
        String destDirCanonicalPath = new File(destDirectory).getCanonicalPath() + File.separator;

        if (!canonicalPath.startsWith(destDirCanonicalPath)) {
          throw new SecurityException(String.format("Found Zip Path Traversal Vulnerability with %s", canonicalPath));
        }

        if (!fout.exists()) {
          (new File(fout.getParent())).mkdirs();
        }

        InputStream in = null;
        BufferedOutputStream bout = null;
        try {
          in = zipFile.getInputStream(entry);
          bout = new BufferedOutputStream(new FileOutputStream(fout));
          copy(in, bout);
          bout.close();
          in.close();
        } catch (IOException ex) {
          if (in != null) {
            try {
              in.close();
            } catch (Exception ignored) {
            }
          }
          if (bout != null) {
            try {
              bout.close();
            } catch (Exception ignored) {
            }
          }
        }
      }

      zipFile.close();
    } catch (Exception ex) {
      throw new RuntimeException(ex);
    }
  }


  private static long copy(InputStream from, OutputStream to) throws IOException {
        byte[] buf = new byte[BUF_SIZE];
        long total = 0;
        while (true) {
            int r = from.read(buf);
            if (r == -1) {
                break;
            }
            to.write(buf, 0, r);
            total += r;
        }
        return total;
    }

    public static void deleteFileOrFolderSilently(File file) {
        if (file.isDirectory()) {
            File[] files = file.listFiles();
          assert files != null;
          for (File fileEntry : files) {
                if (fileEntry.isDirectory()) {
                    deleteFileOrFolderSilently(fileEntry);
                } else {
                    fileEntry.delete();
                }
            }
        }
        if(!file.delete()) {
            throw new RuntimeException("StallionException: Error deleting file");
        }
    }
    public static void moveFile(File fromFile, File toFile) {
      if(toFile.exists()) {
        deleteFileOrFolderSilently(toFile);
      }
      toFile.getParentFile().mkdirs();
      fromFile.renameTo(toFile);
    }
}
