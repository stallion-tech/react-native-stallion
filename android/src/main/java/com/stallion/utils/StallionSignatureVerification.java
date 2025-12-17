package com.stallion.utils;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.DigestInputStream;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Scanner;

import org.json.JSONArray;
import org.json.JSONObject;

public class StallionSignatureVerification {

  public static final String SIGNATURE_FILE_NAME = ".stallionsigned";

  public static boolean verifyReleaseSignature(String downloadedBundlePath, String publicKeyPem) {
    try {
      File folderPath = new File(downloadedBundlePath);
      File signatureFile = new File(folderPath, SIGNATURE_FILE_NAME);
      if (!signatureFile.exists()) return false;

      String jwt = readFileLegacy(signatureFile);
      String[] jwtParts = jwt.split("\\.");
      if (jwtParts.length != 3) return false;

      String header = jwtParts[0];
      String payload = jwtParts[1];
      String signature = jwtParts[2];

      byte[] signatureBytes = base64UrlDecode(signature);
      byte[] signedContent = (header + "." + payload).getBytes(StandardCharsets.UTF_8);

      String cleanedPem = publicKeyPem
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replaceAll("\\s", "");

      byte[] decodedKey = android.util.Base64.decode(cleanedPem, android.util.Base64.DEFAULT);
      X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedKey);
      KeyFactory keyFactory = KeyFactory.getInstance("RSA");
      PublicKey pubKey = keyFactory.generatePublic(keySpec);

      Signature sig = Signature.getInstance("SHA256withRSA");
      sig.initVerify(pubKey);
      sig.update(signedContent);
      if (!sig.verify(signatureBytes)) return false;

      String jsonPayload = new String(base64UrlDecode(payload), StandardCharsets.UTF_8);
      JSONObject payloadObj = new JSONObject(jsonPayload);
      String expectedHash = payloadObj.optString("packageHash", "");

      String actualHash = computeFolderHash(folderPath);
      return expectedHash.equals(actualHash);

    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  private static String computeFolderHash(File folder) throws Exception {
    ArrayList<String> manifest = new ArrayList<>();
    addFolderContentsToManifest(folder, "", manifest);
    Collections.sort(manifest);
    JSONArray jsonArray = new JSONArray();
    for (String entry : manifest) {
      jsonArray.put(entry);
    }
    String jsonString = jsonArray.toString().replace("\\/", "/");
    return computeHash(new ByteArrayInputStream(jsonString.getBytes(StandardCharsets.UTF_8)));
  }

  private static void addFolderContentsToManifest(File folder, String pathPrefix, ArrayList<String> manifest) throws Exception {
    File[] files = folder.listFiles();
    for (File file : files) {
      String fileName = file.getName();
      String relativePath = pathPrefix.isEmpty() ? fileName : pathPrefix + "/" + fileName;
      if (isIgnored(relativePath)) continue;
      if (file.isDirectory()) {
        addFolderContentsToManifest(file, relativePath, manifest);
      } else {
        manifest.add(relativePath + ":" + computeHash(new FileInputStream(file)));
      }
    }
  }

  private static boolean isIgnored(String path) {
    return path.equals(".DS_Store") || path.equals(SIGNATURE_FILE_NAME) || path.startsWith("__MACOSX/");
  }

  private static String computeHash(InputStream stream) throws Exception {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    DigestInputStream dis = new DigestInputStream(stream, digest);
    byte[] buffer = new byte[8192];
    while (dis.read(buffer) != -1);
    dis.close();
    byte[] hash = digest.digest();
    return String.format("%064x", new java.math.BigInteger(1, hash));
  }

  private static String readFileLegacy(File file) throws IOException {
    Scanner scanner = new Scanner(file, "UTF-8");
    StringBuilder sb = new StringBuilder();
    while (scanner.hasNextLine()) {
      sb.append(scanner.nextLine());
    }
    scanner.close();
    return sb.toString();
  }

  private static byte[] base64UrlDecode(String input) {
    String converted = input.replace('-', '+').replace('_', '/');
    switch (converted.length() % 4) {
      case 2: converted += "=="; break;
      case 3: converted += "="; break;
    }
    return android.util.Base64.decode(converted, android.util.Base64.NO_WRAP);
  }
}
