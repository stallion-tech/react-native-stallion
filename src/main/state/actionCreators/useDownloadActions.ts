import React, { useEffect, useCallback } from 'react';
import { Alert, NativeEventEmitter } from 'react-native';

import SharedDataManager from '../../utils/SharedDataManager';
import StallionNativeModule from '../../../StallionNativeModule';
import {
  downloadBundleNative,
  getStallionMeta,
  toggleStallionSwitchNative,
} from '../../utils/StallionNaitveUtils';
import {
  setDownloadData,
  setDownloadError,
  setDownloadLoading,
} from '../actions/downloadActions';

import {
  DOWNLOAD_ALERT_BUTTON,
  DOWNLOAD_ALERT_HEADER,
  DOWNLOAD_ALERT_MESSAGE,
  DOWNLOAD_ALERT_SWITCH_MESSAGE,
  DOWNLOAD_PROGRESS_EVENT,
} from '../../constants/appConstants';

import { IDownloadAction } from '../../../types/download.types';

const useDownloadActions = (
  dispatch: React.Dispatch<IDownloadAction>,
  refreshStallionMeta: () => void
) => {
  const dataManager = SharedDataManager.getInstance();
  const downloadBundle = useCallback(
    (version: number, bucketId: string, apiDownloadUrl: string) => {
      dispatch(setDownloadLoading());
      const projectId = dataManager?.getProjectId() || '';
      const url = `${apiDownloadUrl}?projectId=${projectId}`;
      requestAnimationFrame(() => {
        downloadBundleNative({
          version,
          bucketId,
          url,
        })
          .then((_) => {
            dispatch(
              setDownloadData({
                currentProgress: 1,
              })
            );
            getStallionMeta((meta) => {
              let downloadAlertMessage = '';
              if (!meta.switchState) {
                toggleStallionSwitchNative(true);
                downloadAlertMessage += DOWNLOAD_ALERT_SWITCH_MESSAGE;
              }
              downloadAlertMessage += DOWNLOAD_ALERT_MESSAGE;
              Alert.alert(DOWNLOAD_ALERT_HEADER, downloadAlertMessage, [
                {
                  text: DOWNLOAD_ALERT_BUTTON,
                  style: 'cancel',
                },
              ]);
              refreshStallionMeta();
            });
          })
          .catch((err) => {
            dispatch(setDownloadError(err.toString()));
          });
      });
    },
    [dispatch, dataManager, refreshStallionMeta]
  );

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(StallionNativeModule);
    eventEmitter.addListener(
      DOWNLOAD_PROGRESS_EVENT,
      (downloadFraction: number) => {
        if (downloadFraction) {
          dispatch(
            setDownloadData({
              currentProgress: downloadFraction,
            })
          );
        }
      }
    );
    return () => {
      eventEmitter.removeAllListeners(DOWNLOAD_PROGRESS_EVENT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    downloadBundle,
  };
};

export default useDownloadActions;
