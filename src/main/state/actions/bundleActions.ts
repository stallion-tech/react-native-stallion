import {
  BundleActionKind,
  IBundleAction,
  IBundleDataList,
} from '../../../types/bundle.types';

export const setBundleLoading = (): IBundleAction => {
  return {
    type: BundleActionKind.SET_BUNDLE_LOADING,
  };
};

export const setBundleNextPageLoading = (
  isNextPageLoading: boolean
): IBundleAction => {
  return {
    type: BundleActionKind.SET_NEXT_PAGE_LOADING,
    payload: isNextPageLoading,
  };
};

export const setBundleData = (bundleData: IBundleDataList): IBundleAction => {
  return {
    type: BundleActionKind.SET_BUNDLE_DATA,
    payload: bundleData,
  };
};

export const setBundleError = (errorString: string): IBundleAction => {
  return {
    type: BundleActionKind.SET_BUNDLE_ERROR,
    payload: errorString,
  };
};

export const setSelectedBucketId = (
  bucketId?: string | null
): IBundleAction => {
  return {
    type: BundleActionKind.SET_SELECTED_BUCKET,
    payload: bucketId,
  };
};

export const setBundlePaginationOffset = (
  paginationOffset?: string | null
): IBundleAction => {
  return {
    type: BundleActionKind.SET_PAGINATION_OFFSET,
    payload: paginationOffset,
  };
};

export const setPaginatedBundleData = (
  bundleData: IBundleDataList
): IBundleAction => {
  return {
    type: BundleActionKind.SET_PAGINATED_BUNDLE_DATA,
    payload: bundleData,
  };
};
