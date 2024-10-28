import React, { memo, useEffect, useState } from 'react';
import { RefreshControl, FlatList } from 'react-native';

import useListing from './hooks/useListing';

import ErrorView from '../../../components/common/ErrorView';
import BucketCard, { IBucketCard } from './components/BucketCard';
import {
  CARD_TYPES,
  END_REACH_THRESHOLD,
  IS_ANDROID,
} from '../../../constants/appConstants';
import BundleCard, { IBundleCard } from './components/BundleCard';
import FooterLoader from '../../common/FooterLoader';

import styles from './styles';
import SlotView from './components/SlotView';

const Listing: React.FC = () => {
  const {
    listingData,
    listingLoading,
    listingError,
    fetchListing,
    setBucketSelection,
    fetchNextPage,
    nextPageLoading,
    metaState,
    isBackEnabled,
  } = useListing();
  const [isMounted, setIsMounted] = useState(false);
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
      {isBackEnabled ? null : <SlotView {...metaState.stageSlot} />}
      <FlatList
        style={styles.mainContainer}
        contentContainerStyle={styles.mainListContainer}
        refreshControl={
          <RefreshControl
            refreshing={listingLoading}
            onRefresh={fetchListing}
          />
        }
        data={listingData}
        renderItem={({ item }) => (
          <BucketOrBundle
            key={item.id}
            data={item}
            setBucketSelection={setBucketSelection}
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
}

const BucketOrBundle: React.FC<IBucketOrBundle> = memo(
  ({ data, setBucketSelection }) => {
    return data?.type === CARD_TYPES.BUCKET ? (
      <BucketCard
        key={data.id}
        {...data}
        handlePress={() => setBucketSelection(data.id)}
      />
    ) : (
      (data?.type === CARD_TYPES.BUNDLE && (
        <BundleCard key={data.id} {...data} />
      )) ||
        null
    );
  }
);
