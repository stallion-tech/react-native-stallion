import { useCallback, useContext, useMemo } from 'react';

import { GlobalContext } from '../../../../state';
import { toggleStallionSwitchNative } from '../../../../utils/StallionNativeUtils';
import { SWITCH_STATES } from '../../../../../types/meta.types';

const useStallionModal = () => {
  const {
    isModalVisible,
    configState,
    metaState,
    bundleState,
    downloadState,
    showBucketListing,
    actions: {
      setIsModalVisible,
      selectBucket,
      refreshMeta,
      setDownloadErrorMessage,
      setShowBucketListing,
    },
  } = useContext(GlobalContext);

  const onBackPress = useCallback(() => {
    if (showBucketListing && bundleState?.selectedBucketId) {
      requestAnimationFrame(() => selectBucket());
    } else {
      requestAnimationFrame(() => setShowBucketListing(false));
    }
  }, [
    selectBucket,
    showBucketListing,
    bundleState?.selectedBucketId,
    setShowBucketListing,
  ]);
  const onClosePress = useCallback(() => {
    requestAnimationFrame(() => setIsModalVisible(false));
  }, [setIsModalVisible]);

  const loginRequired = configState?.sdkToken ? false : true;

  const isBackEnabled = useMemo<boolean>(
    () => showBucketListing,
    [showBucketListing]
  );

  const isDownloading = useMemo<boolean>(() => {
    return downloadState.isLoading;
  }, [downloadState.isLoading]);

  const downloadProgress = useMemo<number>(
    () => downloadState.data?.currentProgress || 0,
    [downloadState.data?.currentProgress]
  );
  const downloadError = useMemo<string | undefined | null>(
    () => downloadState.error,
    [downloadState.error]
  );

  const handleSwitch = useCallback(
    (newSwitchStatus) => {
      setDownloadErrorMessage('');
      toggleStallionSwitchNative(
        newSwitchStatus ? SWITCH_STATES.STAGE : SWITCH_STATES.PROD
      );
      refreshMeta();
      if (!newSwitchStatus) {
        selectBucket();
      }
    },
    [refreshMeta, selectBucket, setDownloadErrorMessage]
  );

  return {
    isModalVisible,
    onBackPress,
    onClosePress,
    loginRequired,
    metaState,
    isBackEnabled,
    isDownloading,
    downloadProgress,
    downloadError,
    handleSwitch,
    showBucketListing,
  };
};

export default useStallionModal;
