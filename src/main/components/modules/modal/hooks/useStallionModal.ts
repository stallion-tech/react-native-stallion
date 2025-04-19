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
    actions: {
      setIsModalVisible,
      selectBucket,
      refreshMeta,
      setDownloadErrorMessage,
    },
  } = useContext(GlobalContext);
  const onBackPress = useCallback(() => {
    requestAnimationFrame(() => selectBucket());
  }, [selectBucket]);
  const onClosePress = useCallback(() => {
    requestAnimationFrame(() => setIsModalVisible(false));
  }, [setIsModalVisible]);

  const loginRequired = configState?.sdkToken ? false : true;

  const isBackEnabled = useMemo<boolean>(
    () => (bundleState.selectedBucketId ? true : false),
    [bundleState.selectedBucketId]
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

  const internalIsRestartRequired = useMemo<boolean>(() => {
    return (metaState.switchState === SWITCH_STATES.PROD &&
      metaState.prodSlot?.tempHash) ||
      (metaState.switchState === SWITCH_STATES.STAGE &&
        metaState.stageSlot?.tempHash)
      ? true
      : false;
  }, [metaState]);

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
    internalIsRestartRequired,
  };
};

export default useStallionModal;
