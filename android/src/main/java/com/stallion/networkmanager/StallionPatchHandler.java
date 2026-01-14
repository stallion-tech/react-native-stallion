package com.stallion.networkmanager;

import com.stallion.storage.StallionConfigConstants;
import com.stallion.utils.StallionFileManager;
import com.stallion.utils.StallionBSPatch;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.Charset;

public class StallionPatchHandler {

  /**
   * Applies a patch to the base bundle using the diff file.
   *
   * @param baseBundlePath The path to the base bundle folder
   * @param diffPath The path to the downloaded diff folder
   * @param isBundlePatched Whether the bundle file uses bspatch (true) or file-based patching (false)
   * @throws Exception if patch application fails at any point
   */
  public static void applyPatch(String baseBundlePath, String diffPath, boolean isBundlePatched) throws Exception {
    File baseBundleDir = new File(baseBundlePath);
    File diffDir = new File(diffPath);

    // Validate inputs
    if (!baseBundleDir.exists() || !baseBundleDir.isDirectory()) {
      throw new IllegalArgumentException("Base bundle path does not exist or is not a directory: " + baseBundlePath);
    }

    if (!diffDir.exists() || !diffDir.isDirectory()) {
      throw new IllegalArgumentException("Diff path does not exist or is not a directory: " + diffPath);
    }

    // Path to the unzipped diff folder
    File diffUnzipDir = new File(diffDir, StallionConfigConstants.UNZIP_FOLDER_NAME);
    if (!diffUnzipDir.exists() || !diffUnzipDir.isDirectory()) {
      throw new IllegalArgumentException("Diff unzip folder does not exist: " + diffUnzipDir.getAbsolutePath());
    }

    // Path to manifest.json
    File manifestFile = new File(diffDir, "manifest.json");
    if (!manifestFile.exists() || !manifestFile.isFile()) {
      throw new IllegalArgumentException("Manifest file does not exist: " + manifestFile.getAbsolutePath());
    }

    // Create a temporary directory for the patched bundle
    File tempPatchedDir = new File(diffDir.getParent(), diffDir.getName() + "_patched_temp");
    try {
      // Copy base bundle to temporary location
      StallionFileManager.copyDirectory(baseBundleDir, tempPatchedDir);

      // Read and parse manifest.json
      JSONObject manifest = readManifest(manifestFile);

      // Apply manifest changes
      applyManifestChanges(manifest, diffDir, tempPatchedDir, isBundlePatched);

      // Replace diffPath contents with patched result
      // First, clear the diffPath
      File[] diffDirFiles = diffDir.listFiles();
      if (diffDirFiles != null) {
        for (File file : diffDirFiles) {
          StallionFileManager.deleteFileOrFolderSilently(file);
        }
      }

      // Copy patched result to diffPath
      File[] tempPatchedFiles = tempPatchedDir.listFiles();
      if (tempPatchedFiles != null) {
        for (File file : tempPatchedFiles) {
          File destFile = new File(diffDir, file.getName());
          if (file.isDirectory()) {
            StallionFileManager.copyDirectory(file, destFile);
          } else {
            StallionFileManager.copyFile(file, destFile);
          }
        }
      }

    } finally {
      // Clean up temporary directory
      if (tempPatchedDir.exists()) {
        StallionFileManager.deleteFileOrFolderSilently(tempPatchedDir);
      }
    }
  }

  /**
   * Reads and parses the manifest.json file.
   */
  private static JSONObject readManifest(File manifestFile) throws Exception {
    try (FileInputStream fis = new FileInputStream(manifestFile)) {
      byte[] data = new byte[(int) manifestFile.length()];
      int bytesRead = 0;
      int totalBytesRead = 0;
      while (totalBytesRead < data.length && (bytesRead = fis.read(data, totalBytesRead, data.length - totalBytesRead)) != -1) {
        totalBytesRead += bytesRead;
      }
      if (totalBytesRead != data.length) {
        throw new IOException("Failed to read all bytes from manifest file");
      }
      String manifestJson = new String(data, Charset.forName("UTF-8"));
      return new JSONObject(manifestJson);
    } catch (IOException e) {
      throw new Exception("Failed to read manifest file: " + e.getMessage(), e);
    } catch (org.json.JSONException e) {
      throw new Exception("Failed to parse manifest JSON: " + e.getMessage(), e);
    }
  }

  /**
   * Applies the changes specified in the manifest to the patched directory.
   */
  private static void applyManifestChanges(JSONObject manifest, File diffUnzipDir, File patchedDir, boolean isBundlePatched) throws Exception {
    // Apply deletions first
    if (manifest.has("deleted")) {
      JSONArray deleted = manifest.getJSONArray("deleted");
      for (int i = 0; i < deleted.length(); i++) {
        String filePath = deleted.getString(i);
        File fileToDelete = new File(patchedDir, filePath);
        if (fileToDelete.exists()) {
          StallionFileManager.deleteFileOrFolderSilently(fileToDelete);
        }
      }
    }

    // Apply modifications (files that already exist)
    if (manifest.has("modified")) {
      JSONArray modified = manifest.getJSONArray("modified");
      for (int i = 0; i < modified.length(); i++) {
        String filePath = modified.getString(i);
        applyFileFromDiff(diffUnzipDir, patchedDir, filePath, isBundlePatched);
      }
    }

    // Apply additions (new files)
    if (manifest.has("added")) {
      JSONArray added = manifest.getJSONArray("added");
      for (int i = 0; i < added.length(); i++) {
        String filePath = added.getString(i);
        applyFileFromDiff(diffUnzipDir, patchedDir, filePath, isBundlePatched);
      }
    }
  }

  /**
   * Copies a file from the diff directory to the patched directory.
   * If the file is index.android.bundle and isBundlePatched is true, applies bspatch instead of copying.
   */
  private static void applyFileFromDiff(File diffUnzipDir, File patchedDir, String relativeFilePath, boolean isBundlePatched) throws Exception {
    File sourceFile = new File(diffUnzipDir, relativeFilePath);
    File destFile = new File(patchedDir, relativeFilePath);

    if (!sourceFile.exists()) {
      throw new Exception("Source file does not exist in diff: " + sourceFile.getAbsolutePath());
    }

    // Ensure parent directory exists
    File parentDir = destFile.getParentFile();
    if (parentDir != null && !parentDir.exists()) {
      if (!parentDir.mkdirs()) {
        throw new Exception("Failed to create parent directory: " + parentDir.getAbsolutePath());
      }
    }

    // Check if this is the index.android.bundle file
    String bundleFileName = StallionConfigConstants.ANDROID_BUNDLE_FILE_NAME;
    // Remove leading slash if present for comparison
    String normalizedBundleName = bundleFileName.startsWith("/") ? bundleFileName.substring(1) : bundleFileName;
    String normalizedPath = relativeFilePath.replace("\\", "/");
    boolean isBundleFile = normalizedPath.endsWith("/" + normalizedBundleName) || normalizedPath.equals(normalizedBundleName);
    
    if (isBundleFile && isBundlePatched) {
      // This is the bundle file and it's a binary patch - use bspatch
      // The sourceFile is the patch file, destFile is where the patched bundle should go
      // The base bundle file should already exist in the patched directory (from the initial copy)
      File baseBundleFile = destFile;

      if (!baseBundleFile.exists()) {
        throw new Exception("Base bundle file does not exist for patching: " + baseBundleFile.getAbsolutePath());
      }

      // Create a temporary file for the patched output
      File tempPatchedFile = new File(destFile.getParent(), destFile.getName() + ".tmp");
      try {
        // Apply bspatch: patch the base bundle using the diff file
        boolean success = StallionBSPatch.applyPatch(
          baseBundleFile.getAbsolutePath(),  // old file (base bundle)
          tempPatchedFile.getAbsolutePath(), // new file (temporary output)
          sourceFile.getAbsolutePath()      // patch file
        );

        if (!success) {
          throw new Exception("Failed to apply bspatch to " + relativeFilePath);
        }

        // Replace the original file with the patched one
        if (destFile.exists()) {
          StallionFileManager.deleteFileOrFolderSilently(destFile);
        }
        StallionFileManager.moveFile(tempPatchedFile, destFile);
      } catch (Exception e) {
        // Clean up temp file on error
        if (tempPatchedFile.exists()) {
          StallionFileManager.deleteFileOrFolderSilently(tempPatchedFile);
        }
        throw e;
      }
    } else {
      // Regular file - copy normally
      if (sourceFile.isDirectory()) {
        StallionFileManager.copyDirectory(sourceFile, destFile);
      } else {
        StallionFileManager.copyFile(sourceFile, destFile);
      }
    }
  }
}
