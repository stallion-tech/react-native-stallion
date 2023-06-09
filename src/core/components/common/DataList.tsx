import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import BucketCard from './BucketCard';
import BundleCard from './BundleCard';

import type { IBundleCard } from './BundleCard';
import type { IBucketCard } from './BucketCard';

import { CARD_TYPES } from '../../constants/appConstants';

interface IDataList {
  listData?: (IBucketCard | IBundleCard)[] | null;
  handleBucketPress?: (bucketId?: string | null) => void;
}

const DataList: React.FC<IDataList> = ({ listData, handleBucketPress }) => {
  return (
    <ScrollView
      style={styles.mainContainer}
      contentContainerStyle={styles.mainListContainer}
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
    // backgroundColor: 'white',
  },
  mainListContainer: {
    flexGrow: 1,
  },
});

export default DataList;
