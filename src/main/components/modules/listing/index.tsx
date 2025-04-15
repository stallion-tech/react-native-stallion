import React, { memo, useEffect, useMemo, useState } from 'react';
import { RefreshControl, FlatList, Text, View } from 'react-native';

import useListing from './hooks/useListing';

import ErrorView from '../../../components/common/ErrorView';
import BucketCard, { IBucketCard } from './components/BucketCard';
import {
  BUCKETS_SECTION_SUB_TITLE,
  BUCKETS_SECTION_TITLE,
  BUNDLES_SECTION_SUB_TITLE,
  BUNDLES_SECTION_TITLE,
  CARD_TYPES,
  END_REACH_THRESHOLD,
  IS_ANDROID,
} from '../../../constants/appConstants';
import BundleCard, { IBundleCard } from './components/BundleCard';
import FooterLoader from '../../common/FooterLoader';

import styles from './styles';

const Listing: React.FC = () => {
  const {
    listingData,
    listingLoading,
    listingError,
    fetchListing,
    setBucketSelection,
    fetchNextPage,
    nextPageLoading,
    bundlesListingEnabled,
  } = useListing();

  const [isMounted, setIsMounted] = useState(false);

  const ListHeaderComponent = useMemo(() => {
    return <SectionTitle bundlesListingEnabled={bundlesListingEnabled} />;
  }, [bundlesListingEnabled]);

  useEffect(() => {
    setIsMounted(true);
  }, [setIsMounted]);
  if (listingError) {
    return <ErrorView error={listingError} onRetry={fetchListing} />;
  }
  if (listingLoading && !listingData.length && !IS_ANDROID) {
    return <FooterLoader />;
  }
  if (!isMounted) return null;

  return (
    <>
      <FlatList
        ListHeaderComponent={ListHeaderComponent}
        style={styles.mainContainer}
        contentContainerStyle={styles.mainListContainer}
        refreshControl={
          <RefreshControl
            refreshing={listingLoading}
            onRefresh={fetchListing}
          />
        }
        data={listingData}
        renderItem={({ item, index }) => (
          <BucketOrBundle
            key={item.id}
            data={item}
            setBucketSelection={setBucketSelection}
            index={index}
          />
        )}
        keyExtractor={(item) => item.id}
        ListFooterComponent={nextPageLoading ? <FooterLoader /> : null}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={END_REACH_THRESHOLD}
      />
    </>
  );
};

export default memo(Listing);

interface IBucketOrBundle {
  data: IBucketCard | IBundleCard;
  setBucketSelection: (bucketId?: string | null | undefined) => void;
  index: number;
}

const BucketOrBundle: React.FC<IBucketOrBundle> = memo(
  ({ data, setBucketSelection, index }) => {
    return data?.type === CARD_TYPES.BUCKET ? (
      <BucketCard
        key={data.id}
        {...data}
        handlePress={() => {
          setBucketSelection(data.id);
        }}
      />
    ) : (
      (data?.type === CARD_TYPES.BUNDLE && (
        <BundleCard key={data.id} {...data} index={index} />
      )) ||
        null
    );
  }
);

const SectionTitle: React.FC<{
  bundlesListingEnabled: boolean;
}> = memo(({ bundlesListingEnabled }) => {
  return (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>
        {bundlesListingEnabled ? BUNDLES_SECTION_TITLE : BUCKETS_SECTION_TITLE}
      </Text>
      <Text style={styles.sectionSubTitle}>
        {bundlesListingEnabled
          ? BUNDLES_SECTION_SUB_TITLE
          : BUCKETS_SECTION_SUB_TITLE}
      </Text>
    </View>
  );
});
