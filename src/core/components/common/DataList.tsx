import React from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';

import BucketCard from './BucketCard';
import BundleCard from './BundleCard';

import type { IBundleCard } from './BundleCard';
import type { IBucketCard } from './BucketCard';

import { CARD_TYPES } from '../../constants/appConstants';
import { COLORS } from '../../../core/constants/colors';

interface IDataList {
  listData?: (IBucketCard | IBundleCard)[] | null;
  handleBucketPress?: (bucketId?: string | null) => void;
  isLoading?: boolean;
  handleRefresh?: () => void;
}

const DataList: React.FC<IDataList> = ({
  listData,
  handleBucketPress,
  isLoading,
  handleRefresh,
}) => {
  return (
    <ScrollView
      style={styles.mainContainer}
      contentContainerStyle={styles.mainListContainer}
      refreshControl={
        <RefreshControl
          refreshing={isLoading || false}
          onRefresh={handleRefresh}
        />
      }
    >
      {listData?.map((bundleOrBucketData) =>
        bundleOrBucketData.type === CARD_TYPES.BUCKET ? (
          <BucketCard
            key={bundleOrBucketData.id}
            handlePress={() => handleBucketPress?.(bundleOrBucketData.id)}
            {...bundleOrBucketData}
          />
        ) : (
          <BundleCard key={bundleOrBucketData.id} {...bundleOrBucketData} />
        )
      ) || null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.background_grey,
  },
  mainListContainer: {
    flexGrow: 1,
  },
});

export default DataList;
