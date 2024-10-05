import React, { useCallback } from 'react';

import SharedDataManager from '../../utils/SharedDataManager';
import { downloadBundleNative } from '../../utils/StallionNativeUtils';
import {
  setDownloadData,
  setDownloadError,
  setDownloadLoading,
} from '../actions/downloadActions';

import { IDownloadAction } from '../../../types/download.types';

const useDownloadActions = (
  dispatch: React.Dispatch<IDownloadAction>,
  refreshStallionMeta: () => void
) => {
  const dataManager = SharedDataManager.getInstance();
  const downloadBundle = useCallback(
    (apiDownloadUrl: string, hash: string) => {
      dispatch(setDownloadLoading());
      const projectId = dataManager?.getProjectId() || '';
      const url = `${apiDownloadUrl}?projectId=${projectId}`;
      requestAnimationFrame(() => {
        downloadBundleNative({
          url,
          hash,
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

  const setProgress = useCallback(
    (newProgress: number) => {
      dispatch(
        setDownloadData({
          currentProgress: newProgress,
        })
      );
    },
    [dispatch]
  );

  return {
    downloadBundle,
    setProgress,
  };
};

export default useDownloadActions;
