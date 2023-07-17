import React, { useCallback } from 'react';

import { API_BASE_URL, API_PATHS } from '@main/constants/apiConstants';
import { apiAuthMiddleware, getApiHeaders } from '@main/utils/apiUtils';
import {
  setBucketData,
  setBucketError,
  setBucketLoading,
} from '../actions/bucketActions';
import SharedDataManager from '@main/utils/SharedDataManager';

import {
  DEFAULT_ERROR_MESSAGE,
  EMPTY_ERROR_MESSAGE,
} from '@main/constants/appConstants';
import { extractError } from '@main/utils/errorUtil';
import { IBucketAction, IBucketDataList } from '@stallionTypes/bucket.types';

const useBucketActions = (
  dispatch: React.Dispatch<IBucketAction>,
  setUserRequiresLogin: (requiresLogin: boolean) => void
) => {
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
      .then((res) => apiAuthMiddleware(res, setUserRequiresLogin))
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
  }, [dispatch, dataManager, setUserRequiresLogin]);

  return {
    fetchBuckets,
  };
};

export default useBucketActions;
