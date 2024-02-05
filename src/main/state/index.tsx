import React, { createContext, useReducer, useState } from 'react';

import metaReducer from './reducers/metaReducer';
import bucketReducer from './reducers/bucketReducer';
import bundleReducer from './reducers/bundleReducer';
import downloadReducer from './reducers/downloadReducer';

import useBucketActions from './actionCreators/useBucketActions';
import useMetaActions from './actionCreators/useMetaActions';
import useBundleActions from './actionCreators/useBundleActions';

import { EMPTY_STATE } from '../constants/appConstants';
import { IStallionMeta } from '../../types/meta.types';
import { IGlobalContext } from '../../types/globalProvider.types';
import { IDownloadState } from '../../types/download.types';
import useDownloadActions from './actionCreators/useDownloadActions';

export const GlobalContext = createContext({} as IGlobalContext);

const GlobalProvider: React.FC = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [metaState, metaDispatch] = useReducer(
    metaReducer,
    {} as IStallionMeta
  );
  const [bucketState, bucketDispatch] = useReducer(bucketReducer, EMPTY_STATE);
  const [bundleState, bundleDispatch] = useReducer(bundleReducer, EMPTY_STATE);
  const [downloadState, downloadDispatch] = useReducer(
    downloadReducer,
    {} as IDownloadState
  );

  const { refreshMeta } = useMetaActions(metaDispatch);
  const { fetchBuckets } = useBucketActions(bucketDispatch);
  const { fetchBundles, selectBucket } = useBundleActions(
    bundleDispatch,
    bundleState
  );
  const { downloadBundle } = useDownloadActions(downloadDispatch, refreshMeta);

  const value = {
    isModalVisible,
    metaState,
    bucketState,
    bundleState,
    downloadState,
    actions: {
      setIsModalVisible,
      fetchBuckets,
      refreshMeta,
      fetchBundles,
      selectBucket,
      downloadBundle,
    },
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalProvider;
