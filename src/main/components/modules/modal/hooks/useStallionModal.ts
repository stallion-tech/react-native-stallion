import { useCallback, useContext, useMemo } from 'react';

import { GlobalContext } from '../../../../state';
import { toggleStallionSwitchNative } from '../../../../utils/StallionNativeUtils';
import { SWITCH_STATES } from '../../../../../types/meta.types';
import {
  BUNDLE_COUNT_SUFFIX,
  BUNDLE_COUNT_SUFFIX_SINGULAR,
  IS_ANDROID,
  META_SEPARATOR,
  SWITCH_TEXTS,
  VERSION_PREFIX,
} from '../../../../constants/appConstants';

const useStallionModal = () => {
  const {
    isModalVisible,
    configState,
    metaState,
    bucketState,
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

  const isTesting = metaState?.switchState === SWITCH_STATES.STAGE;

  /** Bundle history is a Testing-only push over the buckets list. */
  const isBundleHistory = useMemo<boolean>(
    () => isTesting && !!bundleState.selectedBucketId,
    [isTesting, bundleState.selectedBucketId]
  );

  const selectedBucket = useMemo(
    () =>
      bucketState.data?.find(
        (bucket) => bucket.id === bundleState.selectedBucketId
      ) || null,
    [bucketState.data, bundleState.selectedBucketId]
  );

  const bucketTitle = selectedBucket?.name || '';

  const bucketSubtitle = useMemo<string>(() => {
    if (!selectedBucket) return SWITCH_TEXTS.ON;
    const latestVersion =
      (IS_ANDROID
        ? selectedBucket.latestAndroidBundleVersion
        : selectedBucket.latestIosBundleVersion) || 0;
    return [
      SWITCH_TEXTS.ON,
      `${VERSION_PREFIX}${latestVersion}`,
      `${latestVersion}${
        latestVersion === 1 ? BUNDLE_COUNT_SUFFIX_SINGULAR : BUNDLE_COUNT_SUFFIX
      }`,
    ].join(META_SEPARATOR);
  }, [selectedBucket]);

  const downloadError = useMemo<string | undefined | null>(
    () => downloadState.error,
    [downloadState.error]
  );

  const handleSwitch = useCallback(
    (newSwitchStatus: boolean) => {
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
    isTesting,
    isBundleHistory,
    bucketTitle,
    bucketSubtitle,
    downloadError,
    handleSwitch,
  };
};

export default useStallionModal;
