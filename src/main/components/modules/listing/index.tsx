import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';

import useListing from './hooks/useListing';
import ErrorView from '@main/components/common/ErrorView';

import styles from './styles';
import BucketCard from './components/BucketCard';
import { CARD_TYPES } from '@main/constants/appConstants';
import BundleCard from './components/BundleCard';

const Listing: React.FC = () => {
  const {
    listingData,
    listingLoading,
    listingError,
    fetchListing,
    setBucketSelection,
  } = useListing();
  if (listingError) {
    return <ErrorView error={listingError} />;
  }
  return (
    <ScrollView
      style={styles.mainContainer}
      contentContainerStyle={styles.mainListContainer}
      refreshControl={
        <RefreshControl refreshing={listingLoading} onRefresh={fetchListing} />
      }
    >
      {listingData?.map((listItem) =>
        listItem?.type === CARD_TYPES.BUCKET ? (
          <BucketCard
            key={listItem.id}
            {...listItem}
            handlePress={() => setBucketSelection(listItem.id)}
          />
        ) : (
          <BundleCard key={listItem.id} {...listItem} />
        )
      )}
    </ScrollView>
  );
};

export default Listing;