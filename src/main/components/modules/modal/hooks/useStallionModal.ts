import { useCallback, useContext, useEffect, useMemo } from 'react';

import { GlobalContext } from '../../../../state';
import {
  getApiKeyNative,
  toggleStallionSwitchNative,
} from '../../../../utils/StallionNaitveModule';
import SharedDataManager from '../../../../utils/SharedDataManager';

const useStallionModal = () => {
  const {
    isModalVisible,
    userState,
    metaState,
    bundleState,
    downloadState,
    actions: {
      setIsModalVisible,
      setUserRequiresLogin,
      selectBucket,
      refreshMeta,
    },
  } = useContext(GlobalContext);
  const onBackPress = useCallback(() => {
    requestAnimationFrame(() => selectBucket());
  }, [selectBucket]);
  const onClosePress = useCallback(() => {
    requestAnimationFrame(() => setIsModalVisible(false));
  }, [setIsModalVisible]);
  const loginRequired = userState?.loginRequired;

  useEffect(() => {
    getApiKeyNative((apiKey) => {
      if (apiKey) {
        SharedDataManager.getInstance()?.setAccessToken(apiKey);
      } else {
        setUserRequiresLogin(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isBackEnabled = useMemo<boolean>(
    () => (bundleState.selectedBucketId ? true : false),
    [bundleState.selectedBucketId]
  );

  const activeBucketMeta = useMemo(
    () => ({
      bucketName: metaState.activeBucket || '',
      version: metaState.activeVersion || '',
    }),
    [metaState.activeBucket, metaState.activeVersion]
  );

  const toggleStallionSwitch = useCallback(() => {
    toggleStallionSwitchNative(!metaState.switchState);
    refreshMeta();
  }, [metaState.switchState, refreshMeta]);

  const isDownloading = useMemo<boolean>(
    () => downloadState.isLoading,
    [downloadState.isLoading]
  );
  const downloadProgress = useMemo<number>(
    () => downloadState.data?.currentProgress || 0,
    [downloadState.data?.currentProgress]
  );
  const downloadError = useMemo<string | undefined | null>(
    () => downloadState.error,
    [downloadState.error]
  );

  return {
    isModalVisible,
    onBackPress,
    onClosePress,
    loginRequired,
    setUserRequiresLogin,
    metaState,
    isBackEnabled,
    activeBucketMeta,
    toggleStallionSwitch,
    isDownloading,
    downloadProgress,
    downloadError,
  };
};

export default useStallionModal;
