package com.stallion.utils;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public final class StallionTokenRegion {

  private static final Set<String> VALID_REGIONS = new HashSet<>(Arrays.asList("ap", "us"));

  private StallionTokenRegion() {}

  /**
   * Parses the region prefix from a Stallion token.
   * Returns "ap", "us", or null. Null means legacy unprefixed token; caller should default to "ap".
   */
  public static String parseTokenRegion(String token) {
    if (token == null) {
      return null;
    }
    token = token.trim();
    if (token.isEmpty()) {
      return null;
    }

    // App token: spb_<region>_<44-char nanoid> → 49 chars
    if (token.startsWith("spb_") && token.length() == 49 && token.charAt(6) == '_') {
      return extractRegion(token);
    }

    // CI token: stl_<region>_<36-char nanoid> → 43 chars
    if (token.startsWith("stl_") && token.length() == 43 && token.charAt(6) == '_') {
      return extractRegion(token);
    }

    return null;
  }

  public static String defaultRegion() {
    return "ap";
  }

  private static String extractRegion(String token) {
    String code = token.substring(4, 6).toLowerCase(Locale.ROOT);
    if (!code.matches("[a-z]{2}")) {
      return null;
    }
    return VALID_REGIONS.contains(code) ? code : null;
  }
}
