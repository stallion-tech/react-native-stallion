import {
  BundleActionKind,
  IBundleAction,
  IBundleState,
} from '@stallionTypes/bundle.types';

const bundleReducer = (
  state: IBundleState,
  action: IBundleAction
): IBundleState => {
  const { type } = action;
  switch (type) {
    case BundleActionKind.SET_BUNDLE_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case BundleActionKind.SET_BUNDLE_DATA:
      const { payload: bundleDataPayload } = action;
      return {
        ...state,
        data: bundleDataPayload,
        isLoading: false,
        error: null,
      };

    case BundleActionKind.SET_BUNDLE_ERROR:
      const { payload: bundleError } = action;
      return {
        ...state,
        data: null,
        isLoading: false,
        error: bundleError,
      };

    case BundleActionKind.SET_SELECTED_BUCKET:
      const { payload: selectedBucketId } = action;
      return {
        ...state,
        selectedBucketId: selectedBucketId,
        data: null,
      };
    default:
      return state;
  }
};

export default bundleReducer;
