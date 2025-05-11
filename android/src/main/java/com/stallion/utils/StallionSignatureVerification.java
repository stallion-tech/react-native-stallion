package com.stallion.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.security.KeyFactory;
import java.util.Scanner;

import org.json.JSONObject;

public class StallionSignatureVerification {

  public static final String SIGNATURE_FILE_NAME = "bundle.stallionsign";

  public static boolean verifyReleaseSignature(String downloadedBundlePath, String publicKeyPem) {
    try {
      // Load the signature file
      File signatureFile = new File(downloadedBundlePath, SIGNATURE_FILE_NAME);
      if (!signatureFile.exists()) return false;

      String jwt = readFileLegacy(signatureFile);
      String[] jwtParts = jwt.split("\\.");
      if (jwtParts.length != 3) return false;

      String header = jwtParts[0];
      String payload = jwtParts[1];
      String signature = jwtParts[2];

      byte[] signatureBytes = base64UrlDecode(signature);
      byte[] signedContent = (header + "." + payload).getBytes(StandardCharsets.UTF_8);

      // Convert PEM public key to Java PublicKey
      String cleanedPem = publicKeyPem
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replaceAll("\\s", "");

      byte[] decodedKey = android.util.Base64.decode(cleanedPem, android.util.Base64.DEFAULT);
      X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedKey);
      KeyFactory keyFactory = KeyFactory.getInstance("RSA");
      PublicKey pubKey = keyFactory.generatePublic(keySpec);

      // Verify the JWT signature
      Signature sig = Signature.getInstance("SHA256withRSA");
      sig.initVerify(pubKey);
      sig.update(signedContent);
      if (!sig.verify(signatureBytes)) return false;

      // Decode payload and get the hash
      String jsonPayload = new String(base64UrlDecode(payload), StandardCharsets.UTF_8);
      JSONObject payloadObj = new JSONObject(jsonPayload);
      String expectedHash = payloadObj.getString("hash");

      // Compute hash of folder contents
      String actualHash = computeHashOfFolder(downloadedBundlePath);
      return expectedHash.equals(actualHash);

    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  private static String computeHashOfFolder(String folderPath) throws Exception {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    File folder = new File(folderPath);

    for (File file : folder.listFiles()) {
      if (file.isFile() && !file.getName().equals(SIGNATURE_FILE_NAME)) {
        byte[] fileBytes = readFileBytesLegacy(file);
        digest.update(fileBytes);
      }
    }

    byte[] hashBytes = digest.digest();
    return android.util.Base64.encodeToString(hashBytes, android.util.Base64.NO_WRAP);
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

  private static byte[] readFileBytesLegacy(File file) throws IOException {
    FileInputStream fis = new FileInputStream(file);
    byte[] data = new byte[(int) file.length()];
    int bytesRead = fis.read(data);
    fis.close();
    if (bytesRead != file.length()) throw new IOException("Incomplete read of file: " + file.getName());
    return data;
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
