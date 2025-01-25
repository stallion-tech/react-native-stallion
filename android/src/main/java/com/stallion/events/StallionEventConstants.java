package com.stallion.events;

public class StallionEventConstants {
  public enum NativeProdEventTypes {
    DOWNLOAD_STARTED_PROD,
    DOWNLOAD_ERROR_PROD,
    DOWNLOAD_COMPLETE_PROD,
    SYNC_ERROR_PROD,
    ROLLED_BACK_PROD,
    INSTALLED_PROD,
    STABILIZED_PROD,
    EXCEPTION_PROD,
    AUTO_ROLLED_BACK_PROD,
    CORRUPTED_FILE_ERROR
  }

  public enum NativeStageEventTypes {
    DOWNLOAD_PROGRESS_STAGE,
    DOWNLOAD_COMPLETE_STAGE,
    EXCEPTION_STAGE
  }
}
