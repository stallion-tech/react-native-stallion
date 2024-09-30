package com.stallion;

import org.json.JSONObject;
import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

public class StallionApiUtil {
  public static JSONObject post(String urlString, String requestBodyString, String token) {
    StringBuilder result = new StringBuilder();
    HttpURLConnection urlConnection = null;
    try {
      URL url = new URL(urlString);
      urlConnection = (HttpURLConnection) url.openConnection();
      urlConnection.setRequestMethod("POST");
      urlConnection.setRequestProperty("Content-Type", "application/json");
      urlConnection.setRequestProperty(StallionConstants.STALLION_APP_TOKEN_KEY, token);
      urlConnection.setRequestProperty(StallionConstants.STALLION_DEVICE_ID_KEY, StallionCommonUtil.getUniqueId());

      urlConnection.setDoOutput(true);

      OutputStream os = urlConnection.getOutputStream();
      OutputStreamWriter osw = new OutputStreamWriter(os, "UTF-8");
      osw.write(requestBodyString);
      osw.flush();
      osw.close();
      os.close();

      urlConnection.connect();

      InputStream in = new BufferedInputStream(urlConnection.getInputStream());
      BufferedReader reader = new BufferedReader(new InputStreamReader(in));
      String line;
      while ((line = reader.readLine()) != null) {
        result.append(line);
      }
    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      if (urlConnection != null) {
        urlConnection.disconnect();
      }
    }
    try {
      return new JSONObject(result.toString());
    } catch (Exception e) {
      return new JSONObject();
    }
  }
}
