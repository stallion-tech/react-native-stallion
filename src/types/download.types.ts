export interface IDownloadData {
  currentProgress: number;
}

export interface IDownloadState {
  data?: IDownloadData;
  isLoading: boolean;
  error?: string | null;
}

export enum DownloadActionKind {
  SET_DOWNLOAD_LOADING = 'SET_DOWNLOAD_LOADING',
  SET_DOWNLOAD_DATA = 'SET_DOWNLOAD_DATA',
  SET_DOWNLOAD_ERROR = 'SET_DOWNLOAD_ERROR',
}

interface IDownloadLoadingAction {
  type: DownloadActionKind.SET_DOWNLOAD_LOADING;
}

interface IDownloadDataAction {
  type: DownloadActionKind.SET_DOWNLOAD_DATA;
  payload: IDownloadData;
}

interface IDownloadErrorAction {
  type: DownloadActionKind.SET_DOWNLOAD_ERROR;
  payload: string;
}

export type IDownloadAction =
  | IDownloadLoadingAction
  | IDownloadDataAction
  | IDownloadErrorAction;
