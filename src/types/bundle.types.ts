export interface IBucketData {
  version: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  author: {
    fullName: string;
  };
  releaseNote: string;
}

export type IBundleDataList = IBucketData[];

export interface IBundleState {
  data?: IBundleDataList | null;
  selectedBucketId?: string | null;
  isLoading: boolean;
  error?: string | null;
}

export enum BundleActionKind {
  SET_BUNDLE_LOADING = 'SET_BUNDLE_LOADING',
  SET_BUNDLE_DATA = 'SET_BUNDLE_DATA',
  SET_BUNDLE_ERROR = 'SET_BUNDLE_ERROR',
  SET_SELECTED_BUCKET = 'SET_SELECTED_BUCKET',
}

interface IBundleLoadingAction {
  type: BundleActionKind.SET_BUNDLE_LOADING;
}

interface IBundleDataAction {
  type: BundleActionKind.SET_BUNDLE_DATA;
  payload: IBundleDataList;
}

interface IBundleErrorAction {
  type: BundleActionKind.SET_BUNDLE_ERROR;
  payload: string;
}

interface IBundleSelectedBucketAction {
  type: BundleActionKind.SET_SELECTED_BUCKET;
  payload?: string | null;
}

export type IBundleAction =
  | IBundleLoadingAction
  | IBundleDataAction
  | IBundleErrorAction
  | IBundleSelectedBucketAction;
