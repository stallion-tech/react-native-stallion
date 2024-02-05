import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';

import { GlobalContext } from '../../../../state';
import { toggleStallionSwitchNative } from '../../../../utils/StallionNaitveUtils';
import {
  DOWNLOAD_ALERT_BUTTON,
  DOWNLOAD_ALERT_HEADER,
  DOWNLOAD_ALERT_MESSAGE,
  DOWNLOAD_ALERT_SWITCH_MESSAGE,
} from '../../../../constants/appConstants';

const useStallionModal = () => {
  const {
    isModalVisible,
    metaState,
    bucketState,
    bundleState,
    downloadState,
    actions: { setIsModalVisible, selectBucket, refreshMeta },
  } = useContext(GlobalContext);
  const onBackPress = useCallback(() => {
    requestAnimationFrame(() => selectBucket());
  }, [selectBucket]);
  const onClosePress = useCallback(() => {
    requestAnimationFrame(() => setIsModalVisible(false));
  }, [setIsModalVisible]);

  const isBackEnabled = useMemo<boolean>(
    () => (bundleState.selectedBucketId ? true : false),
    [bundleState.selectedBucketId]
  );

  const activeBucketMeta = useMemo(() => {
    const bucketName =
      bucketState.data?.filter(
        (bucketData) => bucketData.id === metaState.activeBucket
      )?.[0]?.name || '';
    return {
      bucketName,
      version: metaState.activeVersion || '',
    };
  }, [metaState.activeBucket, metaState.activeVersion, bucketState.data]);

  const toggleStallionSwitch = useCallback(() => {
    toggleStallionSwitchNative(!metaState.switchState);
    refreshMeta();
  }, [metaState.switchState, refreshMeta]);

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

  const canShowDownloadAlert = useRef<boolean>(false);

  useEffect(() => {
    if (isDownloading) {
      canShowDownloadAlert.current = true;
    } else {
      if (canShowDownloadAlert.current && downloadProgress === 1) {
        canShowDownloadAlert.current = false;
        let downloadAlertMessage = '';
        if (!metaState.switchState) {
          toggleStallionSwitch();
          downloadAlertMessage += DOWNLOAD_ALERT_SWITCH_MESSAGE;
        }
        downloadAlertMessage += DOWNLOAD_ALERT_MESSAGE;
        Alert.alert(DOWNLOAD_ALERT_HEADER, downloadAlertMessage, [
          {
            text: DOWNLOAD_ALERT_BUTTON,
            style: 'cancel',
          },
        ]);
      }
    }
  }, [
    isDownloading,
    downloadProgress,
    metaState.switchState,
    toggleStallionSwitch,
  ]);

  return {
    isModalVisible,
    onBackPress,
    onClosePress,
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
