export interface IBundleData {
  version: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  author: {
    fullName: string;
  };
  releaseNote: string;
  downloadUrl: string;
  size: number;
}

export type IBundleDataList = IBundleData[];

export interface IBundleState {
  data?: IBundleDataList | null;
  selectedBucketId?: string | null;
  isLoading: boolean;
  error?: string | null;
  pageOffset?: string | null;
  isNextPageLoading?: boolean;
}

export enum BundleActionKind {
  SET_BUNDLE_LOADING = 'SET_BUNDLE_LOADING',
  SET_BUNDLE_DATA = 'SET_BUNDLE_DATA',
  SET_BUNDLE_ERROR = 'SET_BUNDLE_ERROR',
  SET_SELECTED_BUCKET = 'SET_SELECTED_BUCKET',
  SET_PAGINATION_OFFSET = 'SET_PAGINATION_OFFSET',
  SET_PAGINATED_BUNDLE_DATA = 'SET_PAGINATED_BUNDLE_DATA',
  SET_NEXT_PAGE_LOADING = 'SET_NEXT_PAGE_LOADING',
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

interface IBundlePaginationOffsetAction {
  type: BundleActionKind.SET_PAGINATION_OFFSET;
  payload?: string | null;
}

interface IBundlePaginatedBundleDataAction {
  type: BundleActionKind.SET_PAGINATED_BUNDLE_DATA;
  payload: IBundleDataList;
}

interface IBundleNextPageLoadingAction {
  type: BundleActionKind.SET_NEXT_PAGE_LOADING;
  payload: boolean;
}

export type IBundleAction =
  | IBundleLoadingAction
  | IBundleDataAction
  | IBundleErrorAction
  | IBundleSelectedBucketAction
  | IBundlePaginationOffsetAction
  | IBundlePaginatedBundleDataAction
  | IBundleNextPageLoadingAction;
