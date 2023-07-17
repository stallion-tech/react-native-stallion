import {
  BucketActionKind,
  IBucketAction,
  IBucketState,
} from '@stallionTypes/bucket.types';

const bucketReducer = (
  state: IBucketState,
  action: IBucketAction
): IBucketState => {
  const { type } = action;
  switch (type) {
    case BucketActionKind.SET_BUCKET_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case BucketActionKind.SET_BUCKET_DATA:
      const { payload: bucketDataPayload } = action;
      return {
        data: bucketDataPayload,
        isLoading: false,
        error: null,
      };

    case BucketActionKind.SET_BUCKET_ERROR:
      const { payload: bucketError } = action;
      return {
        data: null,
        isLoading: false,
        error: bucketError,
      };
    default:
      return state;
  }
};

export default bucketReducer;
