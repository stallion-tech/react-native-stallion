import React, { useCallback } from 'react';

import { API_PATHS } from '../../constants/apiConstants';

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
import { useApiClient } from '../../utils/useApiClient';
import { IStallionConfigJson } from '../../../types/config.types';

const useBundleActions = (
  dispatch: React.Dispatch<IBundleAction>,
  bundleState: IBundleState,
  clearUserLogin: (shouldClear: boolean) => void,
  configState: IStallionConfigJson
) => {
  const { getData } = useApiClient(configState, clearUserLogin);
  const fetchBundles = useCallback(
    (bucketId?: string | null, pageOffset?: string | null) => {
      const selectedBucketId = bucketId || bundleState.selectedBucketId;
      const pageOffsetReceivedValue = pageOffset || '';
      if (pageOffsetReceivedValue === '') {
        dispatch(setBundleLoading());
      } else {
        dispatch(setBundleNextPageLoading(true));
      }
      getData(API_PATHS.FETCH_BUNDLES_ADVANCED, {
        projectId: configState.projectId,
        bucketId: selectedBucketId,
        platform: CURRENT_PLATFORM,
        pageSize: BUNDLE_API_PAGE_SIZE,
        paginationOffset: pageOffsetReceivedValue,
      })
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
    [dispatch, bundleState.selectedBucketId, configState, getData]
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
