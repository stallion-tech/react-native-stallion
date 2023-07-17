export interface IBucketData {
  name: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  latestAndroidBundleVersion: number;
  latestIosBundleVersion: number;
}

export type IBucketDataList = IBucketData[];

export interface IBucketState {
  data?: IBucketDataList | null;
  isLoading: boolean;
  error?: string | null;
}

export enum BucketActionKind {
  SET_BUCKET_LOADING = 'SET_BUCKET_LOADING',
  SET_BUCKET_DATA = 'SET_BUCKET_DATA',
  SET_BUCKET_ERROR = 'SET_BUCKET_ERROR',
}

interface IBucketLoadingAction {
  type: BucketActionKind.SET_BUCKET_LOADING;
}

interface IBucketDataAction {
  type: BucketActionKind.SET_BUCKET_DATA;
  payload: IBucketDataList;
}

interface IBucketErrorAction {
  type: BucketActionKind.SET_BUCKET_ERROR;
  payload: string;
}

export type IBucketAction =
  | IBucketLoadingAction
  | IBucketDataAction
  | IBucketErrorAction;
