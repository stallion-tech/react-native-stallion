import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { GlobalContext } from '../../../../state';
import {
  getApiKeyNative,
  setApiKeyNative,
  toggleStallionSwitchNative,
} from '../../../../utils/StallionNaitveUtils';
import SharedDataManager from '../../../../utils/SharedDataManager';
import { SWITCH_STATES } from '../../../../../types/meta.types';

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
    getApiKeyNative().then((apiKey) => {
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
      toggleStallionSwitchNative(
        newSwitchStatus ? SWITCH_STATES.STAGE : SWITCH_STATES.PROD
      );
      refreshMeta();
    },
    [refreshMeta]
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
    userState,
    showProfileSection,
    closeProfileSection,
    presentProfileSection,
    performLogout,
    handleSwitch,
  };
};

export default useStallionModal;
