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
