import React, { useCallback } from 'react';

import { downloadBundleNative } from '../../utils/StallionNativeUtils';
import {
  setDownloadData,
  setDownloadError,
  setDownloadLoading,
} from '../actions/downloadActions';

import { IDownloadAction } from '../../../types/download.types';
import { IStallionConfigJson } from '../../../types/config.types';

const useDownloadActions = (
  dispatch: React.Dispatch<IDownloadAction>,
  refreshStallionMeta: () => void,
  configState: IStallionConfigJson
) => {
  const downloadBundle = useCallback(
    (apiDownloadUrl: string, hash: string) => {
      dispatch(setDownloadLoading());
      const projectId = configState.projectId;
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
    [dispatch, refreshStallionMeta, configState]
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

  const setDownloadErrorMessage = (message: string) => {
    dispatch(setDownloadError(message));
  };

  return {
    downloadBundle,
    setProgress,
    setDownloadErrorMessage,
  };
};

export default useDownloadActions;
