import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NativeEventEmitter } from 'react-native';

import { GlobalContext } from '../../../../state';
import {
  getApiKeyNative,
  getAppTokenNative,
  getProjectIdNative,
  getUidNative,
  onLaunchNative,
  setApiKeyNative,
  toggleStallionSwitchNative,
} from '../../../../utils/StallionNativeUtils';
import SharedDataManager from '../../../../utils/SharedDataManager';
import { SWITCH_STATES } from '../../../../../types/meta.types';
import StallionNativeModule from '../../../../../StallionNativeModule';
import {
  NativeEventTypesProd,
  NativeEventTypesStage,
  STALLION_NATIVE_EVENT,
} from '../../../../constants/appConstants';
import { fireEvent } from '../../../../utils/EventUtil';
import { stallionEventEmitter } from '../../../../utils/StallionEventEmitter';
import { SLOT_STATES } from '../../../../../types/meta.types';

const REFRESH_META_EVENTS: {
  [key: string]: boolean;
} = {
  [NativeEventTypesProd.DOWNLOAD_COMPLETE_PROD]: true,
  [NativeEventTypesProd.ROLLED_BACK_PROD]: true,
  [NativeEventTypesProd.AUTO_ROLLED_BACK_PROD]: true,
  [NativeEventTypesProd.STABILIZED_PROD]: true,
};

const useStallionModal = () => {
  const {
    isModalVisible,
    userState,
    metaState,
    bundleState,
    downloadState,
    updateMetaState,
    actions: {
      setIsModalVisible,
      setUserRequiresLogin,
      selectBucket,
      refreshMeta,
      setProgress,
      setDownloadErrorMessage,
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
    getApiKeyNative().then((apiKey) => {
      if (apiKey) {
        SharedDataManager.getInstance()?.setAccessToken(apiKey);
      } else {
        setUserRequiresLogin(true);
      }
    });
    getAppTokenNative().then((appToken) => {
      SharedDataManager.getInstance()?.setAppToken(appToken);
    });
    getUidNative().then((uid) => {
      SharedDataManager.getInstance()?.setUid(uid);
    });

    getProjectIdNative().then((projectId) => {
      SharedDataManager.getInstance()?.setProjectId(projectId);
    });

    const eventEmitter = new NativeEventEmitter(StallionNativeModule);
    eventEmitter.addListener(STALLION_NATIVE_EVENT, (data: any) => {
      const eventType = data?.type as string;
      if (REFRESH_META_EVENTS[eventType]) {
        refreshMeta();
      }
      switch (eventType) {
        case NativeEventTypesProd.DOWNLOAD_STARTED_PROD:
        case NativeEventTypesProd.DOWNLOAD_COMPLETE_PROD:
        case NativeEventTypesProd.DOWNLOAD_ERROR_PROD:
        case NativeEventTypesProd.INSTALLED_PROD:
        case NativeEventTypesProd.SYNC_ERROR_PROD:
        case NativeEventTypesProd.ROLLED_BACK_PROD:
        case NativeEventTypesProd.STABILIZED_PROD:
        case NativeEventTypesProd.EXCEPTION_PROD:
        case NativeEventTypesProd.AUTO_ROLLED_BACK_PROD:
          stallionEventEmitter.emit(data);
          fireEvent(data);
          break;
        case NativeEventTypesStage.DOWNLOAD_PROGRESS_STAGE:
          const progress = data?.payload?.progress as number;
          if (progress) {
            setProgress(progress);
          }
          break;
      }
    });
    requestAnimationFrame(() => {
      onLaunchNative('Success');
    });
    return () => {
      eventEmitter.removeAllListeners(STALLION_NATIVE_EVENT);
    };
  }, [refreshMeta, setProgress, setUserRequiresLogin]);

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

  const [showProfileSection, setShowProfileSection] = useState(false);
  const closeProfileSection = useCallback(() => {
    setShowProfileSection(false);
  }, []);

  const presentProfileSection = useCallback(() => {
    setShowProfileSection(true);
  }, []);

  const performLogout = useCallback(() => {
    closeProfileSection();
    setApiKeyNative('');
    SharedDataManager.getInstance()?.setAccessToken('');
    setUserRequiresLogin(true);
  }, [setUserRequiresLogin, closeProfileSection]);

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

  const [initialProdSlot, setInitialProdSlot] = useState<SLOT_STATES>();
  useEffect(() => {
    if (metaState?.prodSlot?.currentSlot && !initialProdSlot) {
      setInitialProdSlot(metaState?.prodSlot?.currentSlot);
    }
  }, [
    metaState?.prodSlot?.currentSlot,
    initialProdSlot,
    metaState.switchState,
  ]);

  const isRestartRequired = useMemo<boolean>(() => {
    return updateMetaState.slotHasChanged ? true : false;
  }, [updateMetaState.slotHasChanged]);

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
    userState,
    showProfileSection,
    closeProfileSection,
    presentProfileSection,
    performLogout,
    handleSwitch,
    isRestartRequired,
  };
};

export default useStallionModal;
