import React, { useCallback } from 'react';

import { API_BASE_URL, API_PATHS } from '@main/constants/apiConstants';
import { apiAuthMiddleware, getApiHeaders } from '@main/utils/apiUtils';
import SharedDataManager from '@main/utils/SharedDataManager';

import {
  DEFAULT_ERROR_MESSAGE,
  EMPTY_ERROR_MESSAGE_BUNDLE,
  IS_ANDROID,
} from '@main/constants/appConstants';
import { extractError } from '@main/utils/errorUtil';
import {
  IBundleAction,
  IBundleDataList,
  IBundleState,
} from '@stallionTypes/bundle.types';
import {
  setBundleData,
  setBundleError,
  setBundleLoading,
  setSelectedBucketId,
} from '../actions/bundleActions';

const useBundleActions = (
  dispatch: React.Dispatch<IBundleAction>,
  bundleState: IBundleState,
  setUserRequiresLogin: (requiresLogin: boolean) => void
) => {
  const dataManager = SharedDataManager.getInstance();
  const fetchBundles = useCallback(
    (bucketId?: string | null) => {
      const selectedBucketId = bucketId || bundleState.selectedBucketId;
      dispatch(setBundleLoading());
      fetch(API_BASE_URL + API_PATHS.FETCH_BUNDLES, {
        method: 'POST',
        body: JSON.stringify({
          projectId: dataManager?.getProjectId(),
          bucketId: selectedBucketId,
        }),
        headers: getApiHeaders(),
      })
        .then((res) => apiAuthMiddleware(res, setUserRequiresLogin))
        .then((bundleResponse) => {
          const bundlesData = IS_ANDROID
            ? bundleResponse?.data?.androidBundles
            : bundleResponse?.data?.iosBundles;
          if (bundlesData) {
            if (bundlesData.length) {
              dispatch(setBundleData(bundlesData as IBundleDataList));
            } else {
              dispatch(setBundleError(EMPTY_ERROR_MESSAGE_BUNDLE));
            }
          } else {
            dispatch(setBundleError(extractError(bundleResponse)));
          }
        })
        .catch((_) => {
          dispatch(setBundleError(DEFAULT_ERROR_MESSAGE));
        });
    },
    [dispatch, dataManager, bundleState.selectedBucketId, setUserRequiresLogin]
  );

  const selectBucket = useCallback(
    (selectedBucketId?: string | null) => {
      dispatch(setSelectedBucketId(selectedBucketId));
    },
    [dispatch]
  );

  return {
    fetchBundles,
    selectBucket,
  };
};

export default useBundleActions;
