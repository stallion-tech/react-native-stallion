import React, { useCallback } from 'react';

import SharedDataManager from '../../utils/SharedDataManager';
import { extractError } from '../../utils/errorUtil';
import { getApiHeaders } from '../../utils/apiUtils';
import {
  setBucketData,
  setBucketError,
  setBucketLoading,
} from '../actions/bucketActions';

import {
  DEFAULT_ERROR_MESSAGE,
  EMPTY_ERROR_MESSAGE,
} from '../../constants/appConstants';
import { API_BASE_URL, API_PATHS } from '../../constants/apiConstants';
import { IBucketAction, IBucketDataList } from '../../../types/bucket.types';

const useBucketActions = (dispatch: React.Dispatch<IBucketAction>) => {
  const dataManager = SharedDataManager.getInstance();
  const fetchBuckets = useCallback(() => {
    dispatch(setBucketLoading());
    fetch(API_BASE_URL + API_PATHS.FETCH_BUCKETS, {
      method: 'POST',
      body: JSON.stringify({
        projectId: dataManager?.getProjectId(),
      }),
      headers: getApiHeaders(),
    })
      .then((res) => res.json())
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
  }, [dispatch, dataManager]);

  return {
    fetchBuckets,
  };
};

export default useBucketActions;
