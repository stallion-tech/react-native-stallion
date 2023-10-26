import {
  BundleActionKind,
  IBundleAction,
  IBundleState,
} from '../../../types/bundle.types';

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
        pageOffset: null,
        isNextPageLoading: false,
      };

    case BundleActionKind.SET_SELECTED_BUCKET:
      const { payload: selectedBucketId } = action;
      return {
        ...state,
        selectedBucketId: selectedBucketId,
        data: null,
        pageOffset: null,
      };

    case BundleActionKind.SET_PAGINATION_OFFSET:
      const { payload: paginationOffset } = action;
      return {
        ...state,
        isNextPageLoading: false,
        pageOffset: paginationOffset,
      };

    case BundleActionKind.SET_PAGINATED_BUNDLE_DATA:
      const { payload: paginatedBundleData } = action;
      return {
        ...state,
        data: state.data?.slice()?.concat(paginatedBundleData),
        isNextPageLoading: false,
        error: null,
      };

    case BundleActionKind.SET_NEXT_PAGE_LOADING:
      return {
        ...state,
        isNextPageLoading: true,
        error: null,
      };
    default:
      return state;
  }
};

export default bundleReducer;
