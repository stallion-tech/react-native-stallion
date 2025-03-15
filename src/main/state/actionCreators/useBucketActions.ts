import React, { useCallback } from 'react';

import { extractError } from '../../utils/errorUtil';
import {
  setBucketData,
  setBucketError,
  setBucketLoading,
} from '../actions/bucketActions';

import {
  DEFAULT_ERROR_MESSAGE,
  EMPTY_ERROR_MESSAGE,
} from '../../constants/appConstants';
import { API_PATHS } from '../../constants/apiConstants';
import { IBucketAction, IBucketDataList } from '../../../types/bucket.types';
import { useApiClient } from '../../utils/useApiClient';
import { IStallionConfigJson } from '../../../types/config.types';

const useBucketActions = (
  dispatch: React.Dispatch<IBucketAction>,
  clearUserLogin: (shouldClear: boolean) => void,
  configState: IStallionConfigJson
) => {
  const { getData } = useApiClient(configState, clearUserLogin);
  const fetchBuckets = useCallback(() => {
    dispatch(setBucketLoading());
    getData(API_PATHS.FETCH_BUCKETS, {
      projectId: configState.projectId,
    })
      .then((bucketResponse) => {
        if (bucketResponse?.data) {
          if (bucketResponse.data.length) {
            dispatch(setBucketData(bucketResponse.data as IBucketDataList));
          } else {
            dispatch(setBucketError(EMPTY_ERROR_MESSAGE));
          }
        } else {
          dispatch(setBucketError(extractError(bucketResponse)));
        }
      })
      .catch((_) => {
        dispatch(setBucketError(DEFAULT_ERROR_MESSAGE));
      });
  }, [dispatch, configState, getData]);

  return {
    fetchBuckets,
  };
};

export default useBucketActions;
