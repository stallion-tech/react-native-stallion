import React, { useCallback } from 'react';

import { API_BASE_URL, API_PATHS } from '../../constants/apiConstants';
import { apiAuthMiddleware, getApiHeaders } from '../../utils/apiUtils';
import SharedDataManager from '../../utils/SharedDataManager';

import {
  DEFAULT_ERROR_MESSAGE,
  EMPTY_ERROR_MESSAGE_BUNDLE,
  CURRENT_PLATFORM,
} from '../../constants/appConstants';
import { BUNDLE_API_PAGE_SIZE } from '../../constants/apiConstants';
import { extractError } from '../../utils/errorUtil';
import {
  IBundleAction,
  IBundleDataList,
  IBundleState,
} from '../../../types/bundle.types';
import {
  setBundleData,
  setBundleError,
  setBundleLoading,
  setBundlePaginationOffset,
  setPaginatedBundleData,
  setSelectedBucketId,
  setBundleNextPageLoading,
} from '../actions/bundleActions';

const useBundleActions = (
  dispatch: React.Dispatch<IBundleAction>,
  bundleState: IBundleState,
  setUserRequiresLogin: (requiresLogin: boolean) => void
) => {
  const dataManager = SharedDataManager.getInstance();
  const fetchBundles = useCallback(
    (bucketId?: string | null, pageOffset?: string | null) => {
      const selectedBucketId = bucketId || bundleState.selectedBucketId;
      const pageOffsetReceivedValue = pageOffset || '';
      if (pageOffsetReceivedValue === '') {
        dispatch(setBundleLoading());
      } else {
        dispatch(setBundleNextPageLoading(true));
      }
      fetch(API_BASE_URL + API_PATHS.FETCH_BUNDLES_ADVANCED, {
        method: 'POST',
        body: JSON.stringify({
          projectId: dataManager?.getProjectId(),
          bucketId: selectedBucketId,
          platform: CURRENT_PLATFORM,
          pageSize: BUNDLE_API_PAGE_SIZE,
          paginationOffset: pageOffsetReceivedValue,
        }),
        headers: getApiHeaders(),
      })
        .then((res) => apiAuthMiddleware(res, setUserRequiresLogin))
        .then((bundleResponse) => {
          const bundlesData = bundleResponse?.data?.paginatedData;
          const nextPageOffset = bundleResponse?.data?.paginationOffset;
          if (bundlesData) {
            if (bundlesData.length) {
              if (pageOffsetReceivedValue === '') {
                dispatch(setBundleData(bundlesData as IBundleDataList));
              } else {
                dispatch(
                  setPaginatedBundleData(bundlesData as IBundleDataList)
                );
              }
            } else if (pageOffsetReceivedValue === '') {
              dispatch(setBundleError(EMPTY_ERROR_MESSAGE_BUNDLE));
            }
            dispatch(setBundlePaginationOffset(nextPageOffset));
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
