package com.stallion.utils;

public class StallionBSPatch {
  
  static {
    System.loadLibrary("stallion-bspatch");
  }
  
  /**
   * Applies a bsdiff patch file to oldFile, writing the result to newFile.
   * 
   * @param oldFile Path to the old/base file
   * @param newFile Path where the patched file will be written
   * @param patchFile Path to the patch file
   * @return true if patch was applied successfully, false otherwise
   */
  public static boolean applyPatch(String oldFile, String newFile, String patchFile) {
    int result = nativeApplyPatch(oldFile, newFile, patchFile);
    if (result == 0) {
      return true;
    } else {
      android.util.Log.e("StallionBSPatch", "BSPatch failed with code: " + result + 
          " (old: " + oldFile + ", patch: " + patchFile + ")");
      return false;
    }
  }
  
  private static native int nativeApplyPatch(String oldFile, String newFile, String patchFile);
}

