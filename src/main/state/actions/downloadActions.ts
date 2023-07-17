import {
  DownloadActionKind,
  IDownloadAction,
  IDownloadData,
} from '@stallionTypes/download.types';

export const setDownloadLoading = (): IDownloadAction => {
  return {
    type: DownloadActionKind.SET_DOWNLOAD_LOADING,
  };
};

export const setDownloadData = (
  downloadData: IDownloadData
): IDownloadAction => {
  return {
    type: DownloadActionKind.SET_DOWNLOAD_DATA,
    payload: downloadData,
  };
};

export const setDownloadError = (errorString: string): IDownloadAction => {
  return {
    type: DownloadActionKind.SET_DOWNLOAD_ERROR,
    payload: errorString,
  };
};
