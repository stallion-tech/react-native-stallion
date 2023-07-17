import {
  BucketActionKind,
  IBucketAction,
  IBucketDataList,
} from '@stallionTypes/bucket.types';

export const setBucketLoading = (): IBucketAction => {
  return {
    type: BucketActionKind.SET_BUCKET_LOADING,
  };
};

export const setBucketData = (bucketData: IBucketDataList): IBucketAction => {
  return {
    type: BucketActionKind.SET_BUCKET_DATA,
    payload: bucketData,
  };
};

export const setBucketError = (errorString: string): IBucketAction => {
  return {
    type: BucketActionKind.SET_BUCKET_ERROR,
    payload: errorString,
  };
};
