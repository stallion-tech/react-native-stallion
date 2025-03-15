package com.stallion.networkmanager;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import com.stallion.storage.StallionConfig;
import com.stallion.storage.StallionStateManager;

public class StallionApiManager {

  public static JSONObject post(String urlString, String requestBodyString) {
    HttpURLConnection urlConnection = null;
    try {
      StallionStateManager stallionStateManager = StallionStateManager.getInstance();
      StallionConfig stallionConfig = stallionStateManager.getStallionConfig();

      // Set up the connection
      URL url = new URL(urlString);
      urlConnection = (HttpURLConnection) url.openConnection();
      urlConnection.setRequestMethod("POST");
      urlConnection.setRequestProperty("Content-Type", "application/json");

      String appToken = stallionConfig.getAppToken();
      String sdkToken = stallionConfig.getSdkToken();
      String uid = stallionConfig.getUid();

      if(appToken != null && !appToken.isEmpty()) {
        urlConnection.setRequestProperty(StallionApiConstants.STALLION_APP_TOKEN_KEY, appToken);
      }

      if (sdkToken != null && !sdkToken.isEmpty()) {
        urlConnection.setRequestProperty(StallionApiConstants.STALLION_SDK_TOKEN_KEY, sdkToken);
      }

      if (uid != null && !uid.isEmpty()) {
        urlConnection.setRequestProperty(StallionApiConstants.STALLION_DEVICE_ID_KEY, uid);
      }

      urlConnection.setDoOutput(true);

      // Write the request body
      try (OutputStream os = urlConnection.getOutputStream();
           OutputStreamWriter osw = new OutputStreamWriter(os, StandardCharsets.UTF_8)) {
        osw.write(requestBodyString);
        osw.flush();
      }

      // Connect and check response code
      int responseCode = urlConnection.getResponseCode();
      if (responseCode != HttpURLConnection.HTTP_OK) {
        throw new IOException("HTTP error code: " + responseCode);
      }

      // Read the response
      StringBuilder result = new StringBuilder();
      try (InputStream in = urlConnection.getInputStream();
           BufferedReader reader = new BufferedReader(new InputStreamReader(in))) {
        String line;
        while ((line = reader.readLine()) != null) {
          result.append(line);
        }
      }

      // Parse and return JSON
      return new JSONObject(result.toString());

    } catch (Exception e) {
      e.printStackTrace();

      // Return an error JSON object
      JSONObject error = new JSONObject();
      try {
        error.put("error", e.getMessage());
      } catch (JSONException jsonException) {
        jsonException.printStackTrace();
      }
      return error;

    } finally {
      if (urlConnection != null) {
        urlConnection.disconnect();
      }
    }
  }
}

