import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';

import BundleHistoryCard from '../components/BundleHistoryCard';
import StateCard from '../components/StateCard';

import {
  EMPTY_BUNDLES_SUBTITLE,
  EMPTY_BUNDLES_TITLE,
  EMPTY_ERROR_MESSAGE_BUNDLE,
  END_REACH_THRESHOLD,
  GENERIC_ERROR_TITLE,
} from '../../../../constants/appConstants';
import { DS_COLORS } from '../../../../constants/designTokens';
import { GlobalContext } from '../../../../state';
import { BUNDLE_STATUS, IBundleData } from '../../../../../types/bundle.types';
import { restart } from '../../../../utils/StallionNativeUtils';

import styles from '../styles';

const Separator: React.FC = () => <View style={styles.cardSeparator} />;

const BundleHistory: React.FC = () => {
  const {
    bundleState,
    metaState,
    downloadState,
    actions: { fetchBundles, downloadBundle },
  } = useContext(GlobalContext);

  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {}
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const wasDownloading = useRef(false);

  const selectedBucketId = bundleState.selectedBucketId;

  useEffect(() => {
    if (selectedBucketId) {
      fetchBundles(selectedBucketId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBucketId]);

  // The download reducer is global, so pair it with the bundle we kicked off.
  useEffect(() => {
    if (wasDownloading.current && !downloadState.isLoading) {
      setDownloadingId(null);
    }
    wasDownloading.current = !!downloadState.isLoading;
  }, [downloadState.isLoading]);

  const bundles = useMemo(() => bundleState.data || [], [bundleState.data]);

  const latestBundleId = useMemo(
    () =>
      bundles.reduce<IBundleData | null>(
        (latest, bundle) =>
          !latest || bundle.version > latest.version ? bundle : latest,
        null
      )?.id,
    [bundles]
  );

  const getStatus = useCallback(
    (bundleId: string): BUNDLE_STATUS => {
      const stageSlot = metaState?.stageSlot;
      if (stageSlot?.newHash === bundleId) return BUNDLE_STATUS.ACTIVE;
      if (stageSlot?.tempHash === bundleId) return BUNDLE_STATUS.DOWNLOADED;
      if (downloadingId === bundleId && downloadState.isLoading)
        return BUNDLE_STATUS.DOWNLOADING;
      return BUNDLE_STATUS.AVAILABLE;
    },
    [metaState?.stageSlot, downloadingId, downloadState.isLoading]
  );

  const handleDownload = useCallback(
    (bundleId: string) => {
      if (downloadState.isLoading) return;
      const bundle = bundles.find((item) => item.id === bundleId);
      if (!bundle) return;
      setDownloadingId(bundleId);
      downloadBundle(bundle.downloadUrl, bundleId);
    },
    [bundles, downloadBundle, downloadState.isLoading]
  );

  const handleRestart = useCallback(() => {
    requestAnimationFrame(() => restart());
  }, []);

  const handleToggleExpand = useCallback((bundleId: string) => {
    setExpandedNotes((previous) => ({
      ...previous,
      [bundleId]: !previous[bundleId],
    }));
  }, []);

  const handleRefresh = useCallback(
    () => fetchBundles(selectedBucketId),
    [fetchBundles, selectedBucketId]
  );

  const handleEndReached = useCallback(() => {
    if (
      bundleState.pageOffset &&
      !bundleState.isLoading &&
      !bundleState.isNextPageLoading
    ) {
      fetchBundles(selectedBucketId, bundleState.pageOffset);
    }
  }, [
    fetchBundles,
    selectedBucketId,
    bundleState.pageOffset,
    bundleState.isLoading,
    bundleState.isNextPageLoading,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: IBundleData }) => (
      <BundleHistoryCard
        id={item.id}
        version={item.version}
        releaseNote={item.releaseNote}
        author={item.author?.fullName}
        updatedAt={item.updatedAt}
        size={item.size}
        isLatest={item.id === latestBundleId}
        status={getStatus(item.id)}
        progress={downloadState.data?.currentProgress || 0}
        expanded={!!expandedNotes[item.id]}
        onToggleExpand={handleToggleExpand}
        onDownload={handleDownload}
        onRestart={handleRestart}
      />
    ),
    [
      latestBundleId,
      getStatus,
      downloadState.data?.currentProgress,
      expandedNotes,
      handleToggleExpand,
      handleDownload,
      handleRestart,
    ]
  );

  if (bundleState.isLoading && !bundles.length) {
    return (
      <View style={styles.centeredFill}>
        <ActivityIndicator color={DS_COLORS.indigo} />
      </View>
    );
  }

  if (!bundles.length) {
    const isEmpty = bundleState.error === EMPTY_ERROR_MESSAGE_BUNDLE;
    return (
      <View style={styles.screenPadding}>
        <StateCard
          title={isEmpty ? EMPTY_BUNDLES_TITLE : GENERIC_ERROR_TITLE}
          subtitle={
            isEmpty ? EMPTY_BUNDLES_SUBTITLE : bundleState.error || undefined
          }
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.content}
      contentContainerStyle={styles.screenPadding}
      data={bundles}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      refreshControl={
        <RefreshControl
          refreshing={bundleState.isLoading}
          onRefresh={handleRefresh}
          tintColor={DS_COLORS.indigo}
          colors={[DS_COLORS.indigo]}
        />
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={END_REACH_THRESHOLD}
      ListFooterComponent={
        bundleState.isNextPageLoading ? (
          <View style={styles.listFooter}>
            <ActivityIndicator color={DS_COLORS.indigo} />
          </View>
        ) : null
      }
    />
  );
};

export default BundleHistory;
