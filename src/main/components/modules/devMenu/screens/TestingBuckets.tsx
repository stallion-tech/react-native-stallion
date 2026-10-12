import React, { useCallback, useContext, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';

import BucketRow from '../components/BucketRow';
import SectionLabel from '../components/SectionLabel';
import StateCard from '../components/StateCard';

import {
  EMPTY_BUCKETS_SUBTITLE,
  EMPTY_BUCKETS_TITLE,
  EMPTY_ERROR_MESSAGE,
  GENERIC_ERROR_TITLE,
  IS_ANDROID,
  SECTION_LABELS,
} from '../../../../constants/appConstants';
import { DS_COLORS } from '../../../../constants/designTokens';
import { GlobalContext } from '../../../../state';
import { IBucketData } from '../../../../../types/bucket.types';

import styles from '../styles';

const Separator: React.FC = () => <View style={styles.cardSeparator} />;

const TestingBuckets: React.FC = () => {
  const {
    bucketState,
    actions: { fetchBuckets, selectBucket },
  } = useContext(GlobalContext);

  useEffect(() => {
    if (!bucketState.data) {
      fetchBuckets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBucketPress = useCallback(
    (bucketId: string) => {
      requestAnimationFrame(() => selectBucket(bucketId));
    },
    [selectBucket]
  );

  const renderItem = useCallback(
    ({ item }: { item: IBucketData }) => (
      <BucketRow
        id={item.id}
        name={item.name}
        updatedAt={item.updatedAt}
        latestVersion={
          (IS_ANDROID
            ? item.latestAndroidBundleVersion
            : item.latestIosBundleVersion) || 0
        }
        onPress={handleBucketPress}
      />
    ),
    [handleBucketPress]
  );

  const buckets = bucketState.data || [];

  if (bucketState.isLoading && !buckets.length) {
    return (
      <View style={styles.centeredFill}>
        <ActivityIndicator color={DS_COLORS.indigo} />
      </View>
    );
  }

  if (!buckets.length) {
    const isEmpty = bucketState.error === EMPTY_ERROR_MESSAGE;
    return (
      <View style={styles.screenPadding}>
        <SectionLabel label={SECTION_LABELS.BUCKETS} />
        <StateCard
          title={isEmpty ? EMPTY_BUCKETS_TITLE : GENERIC_ERROR_TITLE}
          subtitle={
            isEmpty ? EMPTY_BUCKETS_SUBTITLE : bucketState.error || undefined
          }
          onRetry={fetchBuckets}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.content}
      contentContainerStyle={styles.screenPadding}
      data={buckets}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={<SectionLabel label={SECTION_LABELS.BUCKETS} />}
      refreshControl={
        <RefreshControl
          refreshing={bucketState.isLoading}
          onRefresh={fetchBuckets}
          tintColor={DS_COLORS.indigo}
          colors={[DS_COLORS.indigo]}
        />
      }
    />
  );
};

export default TestingBuckets;
