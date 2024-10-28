import React, { createContext, useReducer, useState } from 'react';

import metaReducer from './reducers/metaReducer';
import userReducer from './reducers/userReducer';
import bucketReducer from './reducers/bucketReducer';
import bundleReducer from './reducers/bundleReducer';
import downloadReducer from './reducers/downloadReducer';

import useBucketActions from './actionCreators/useBucketActions';
import useMetaActions from './actionCreators/useMetaActions';
import useBundleActions from './actionCreators/useBundleActions';
import useUserActions from './actionCreators/useUserActions';

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
  const [userState, userDispatch] = useReducer(userReducer, EMPTY_STATE);
  const [bucketState, bucketDispatch] = useReducer(bucketReducer, EMPTY_STATE);
  const [bundleState, bundleDispatch] = useReducer(bundleReducer, EMPTY_STATE);
  const [downloadState, downloadDispatch] = useReducer(
    downloadReducer,
    {} as IDownloadState
  );

  const { refreshMeta } = useMetaActions(metaDispatch);
  const {
    loginUser,
    verifyOtp,
    retryLogin,
    setUserRequiresLogin,
    getUserProfile,
  } = useUserActions(userDispatch, userState);
  const { fetchBuckets } = useBucketActions(
    bucketDispatch,
    setUserRequiresLogin
  );
  const { fetchBundles, selectBucket } = useBundleActions(
    bundleDispatch,
    bundleState,
    setUserRequiresLogin
  );
  const { downloadBundle, setProgress, setDownloadErrorMessage } =
    useDownloadActions(downloadDispatch, refreshMeta);
  const value = {
    isModalVisible,
    metaState,
    userState,
    bucketState,
    bundleState,
    downloadState,
    actions: {
      loginUser,
      setIsModalVisible,
      verifyOtp,
      retryLogin,
      fetchBuckets,
      setUserRequiresLogin,
      refreshMeta,
      fetchBundles,
      selectBucket,
      downloadBundle,
      getUserProfile,
      setProgress,
      setDownloadErrorMessage,
    },
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalProvider;
