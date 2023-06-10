package com.stallion;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.content.res.Resources;
import android.util.Log;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;

@ReactModule(name = StallionConstants.MODULE_NAME)
public class StallionModule extends ReactContextBaseJavaModule {
  private ReactApplicationContext currentReactContext;
  private String baseDir;
  private StallionStorage stallionStorage;
  private DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter;

  public StallionModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.currentReactContext = reactContext;
    this.baseDir = reactContext.getFilesDir().getAbsolutePath() + StallionConstants.STALLION_PACKAGE_PATH;
    StallionStorage.getInstance().Initialize(reactContext);
    this.stallionStorage = StallionStorage.getInstance();
    this.initAuthKeys();
  }

  private void initAuthKeys () {
    Resources res = this.currentReactContext.getResources();
    String parentPackageName = this.currentReactContext.getPackageName();
    int StallionApiKeyId = res.getIdentifier(StallionConstants.API_KEY_IDENTIFIER, "string", parentPackageName);
    int StallionSecretKeyId = res.getIdentifier(StallionConstants.SECRET_KEY_IDENTIFIER, "string", parentPackageName);
    if (StallionApiKeyId > 0 && StallionSecretKeyId > 0) {
      StallionConstants.API_KEY_VALUE = this.currentReactContext.getString(StallionApiKeyId);
      StallionConstants.SECRET_KEY_VALUE = this.currentReactContext.getString(StallionSecretKeyId);
    }
  }

  @Override
  @NonNull
  public String getName() {
    return StallionConstants.MODULE_NAME;
  }

  @ReactMethod
  public void getStallionMeta(Callback callback) {
    WritableMap bundleMeta = Arguments.createMap();
    String activeBucket = this.stallionStorage.get(StallionConstants.ACTIVE_BUCKET_IDENTIFIER);
    String switchState = this.stallionStorage.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER);
    int activeVersion = this.stallionStorage.getInt(StallionConstants.ACTIVE_VERSION_IDENTIFIER);

    bundleMeta.putString(StallionConstants.ACTIVE_BUCKET_IDENTIFIER, activeBucket);
    bundleMeta.putBoolean(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER,
      switchState == null ? false : this.stallionStorage.get(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER).equals(StallionConstants.STALLION_SWITCH_ON)
    );
    bundleMeta.putString(StallionConstants.ACTIVE_VERSION_IDENTIFIER, String.valueOf(activeVersion));
    callback.invoke(bundleMeta);
  }

  @ReactMethod
  public void getAuthTokens(Callback callback) {
    WritableMap authKeys = Arguments.createMap();
    authKeys.putString(StallionConstants.API_KEY_APP_IDENTIFIER, StallionConstants.API_KEY_VALUE);
    authKeys.putString(StallionConstants.SECRET_KEY_APP_IDENTIFIER, StallionConstants.SECRET_KEY_VALUE);
    callback.invoke(authKeys);
  }

  @ReactMethod
  public void toggleStallionSwitch(Boolean stallionBundleIsOn) {
    this.stallionStorage.set(StallionConstants.STALLION_SWITCH_STATE_IDENTIFIER, stallionBundleIsOn ? StallionConstants.STALLION_SWITCH_ON : StallionConstants.STALLION_SWITCH_OFF);
  }

  private DeviceEventManagerModule.RCTDeviceEventEmitter getEventEmitter() {
    if(this.eventEmitter == null) {
      this.eventEmitter = this.currentReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    }
    return this.eventEmitter;
  }

  private void sendDownloadEvent(Double downloadFraction) {
    this.getEventEmitter().emit(StallionConstants.DOWNLOAD_PROGRESS_EVENT, downloadFraction);
  }

  @ReactMethod
  public void downloadPackage(ReadableMap bundleInfo, Promise promise) {
    String receivedBucketId = bundleInfo.getString("bucketId");
    Integer receivedVersion = bundleInfo.getInt("version");
    String platformValue = "android";


    FileOutputStream fout = null;
    BufferedOutputStream bout = null;
    BufferedInputStream inputStream = null;
    HttpURLConnection connection = null;
    File downloadedZip = null;
    boolean isZip = false;

    try {
      int DOWNLOAD_BUFFER_SIZE = StallionConstants.DOWNLOAD_BUFFER_SIZE;
      URL url = new URL(StallionConstants.API_BASE + StallionConstants.DOWNLOAD_API_PATH);
      connection = (HttpURLConnection) url.openConnection();
      connection.setRequestMethod( "POST" );
      connection.setRequestProperty("api-key", StallionConstants.API_KEY_VALUE);
      connection.setRequestProperty("secret-key", StallionConstants.SECRET_KEY_VALUE);
      connection.setRequestProperty("Content-Type", "application/json");

      String jsonInputString = String.format("{\"bucketId\":\"%s\",\"version\":%d,\"platform\":\"%s\"}", receivedBucketId , receivedVersion, platformValue);

      connection.setDoOutput(true);
      connection.setDoInput(true);
      OutputStream os = connection.getOutputStream();
      os.write(jsonInputString.getBytes("UTF-8"));
      os.close();

      connection.connect();
      inputStream = new BufferedInputStream(connection.getInputStream());
      File downloadFolder = new File(baseDir + StallionConstants.DOWNLOAD_FOLDER_DIR);
      downloadFolder.getParentFile().mkdirs();

      downloadedZip = new File(downloadFolder, StallionConstants.ZIP_FILE_NAME);
      downloadedZip.getParentFile().mkdirs();

      fout = new FileOutputStream(downloadedZip, false);
      bout = new BufferedOutputStream(fout, DOWNLOAD_BUFFER_SIZE);
      byte[] data = new byte[DOWNLOAD_BUFFER_SIZE];
      byte[] header = new byte[4];

      long totalBytes = connection.getContentLength();
      long receivedBytes = 0;
      int numBytesRead;
      while ((numBytesRead = inputStream.read(data, 0, DOWNLOAD_BUFFER_SIZE)) >= 0) {
        if (receivedBytes < 4) {
          for (int i = 0; i < numBytesRead; i++) {
            int headerOffset = (int) (receivedBytes) + i;
            if (headerOffset >= 4) {
              break;
            }

            header[headerOffset] = data[i];
          }
        }

        receivedBytes += numBytesRead;
        bout.write(data, 0, numBytesRead);
        this.sendDownloadEvent((double) receivedBytes / (double) totalBytes);
        Log.d("", "RECEIVED " + receivedBytes + " TOTAL " + totalBytes);
      }

      isZip = ByteBuffer.wrap(header).getInt() == 0x504b0304;
      Log.d("", String.valueOf(isZip));

    } catch (Exception e) {
      Log.d("DOWNLOAD_ERROR", e.toString());
      promise.reject(e.toString());
    } finally {
      try {
        if (bout != null) bout.close();
        if (fout != null) fout.close();
        if (inputStream != null) inputStream.close();
        if (connection != null) connection.disconnect();
      } catch (IOException e) {
        Log.d("IO Exception", e.toString());
        promise.reject(e.toString());
      }
    }

    if (!isZip) {
      promise.reject("Not a zip file");
      return;
    }

    try {
      StallionZip.unzipFile(downloadedZip.getAbsolutePath(), baseDir + StallionConstants.BUNDLE_DEST_FOLDER_DIR);
      // setting active bucket ID after downloading and all other jobs done
      this.stallionStorage.set(StallionConstants.ACTIVE_BUCKET_IDENTIFIER, receivedBucketId);
      if (receivedVersion != null) {
        this.stallionStorage.setInt(StallionConstants.ACTIVE_VERSION_IDENTIFIER, receivedVersion);
      }
      promise.resolve("Success");
    } catch (Exception e) {
      promise.reject(e.toString());
    } finally {
      StallionZip.deleteFileOrFolderSilently(downloadedZip);
    }
  }
}
