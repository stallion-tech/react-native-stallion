import React, { useEffect, useCallback } from 'react';
import { NativeEventEmitter } from 'react-native';

import SharedDataManager from '../../utils/SharedDataManager';
import StallionNativeModule from '../../../StallionNativeModule';
import { downloadBundleNative } from '../../utils/StallionNaitveUtils';
import {
  setDownloadData,
  setDownloadError,
  setDownloadLoading,
} from '../actions/downloadActions';

import { DOWNLOAD_PROGRESS_EVENT } from '../../constants/appConstants';
import { IDownloadAction } from '../../../types/download.types';

const useDownloadActions = (
  dispatch: React.Dispatch<IDownloadAction>,
  refreshStallionMeta: () => void
) => {
  const dataManager = SharedDataManager.getInstance();
  const downloadBundle = useCallback(
    (version: number, bucketId: string) => {
      dispatch(setDownloadLoading());
      const projectId = dataManager?.getProjectId() || '';
      requestAnimationFrame(() => {
        downloadBundleNative({
          projectId,
          bucketId,
          version,
        })
          .then((_) => {
            dispatch(
              setDownloadData({
                currentProgress: 1,
              })
            );
            refreshStallionMeta();
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
