import React, { useContext, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

import BucketCardInfoSection from './BucketCardInfoSection';

import { STD_MARGIN, CARD_TYPES } from '../../constants/appConstants';
import { StallionContext } from '../../state/StallionController';
import { COLORS } from '../../constants/colors';

export interface IBucketCard {
  type: CARD_TYPES.BUCKET;
  id: string;
  name: string;
  updatedAt: string;
  bundleCount?: number;
  handlePress?: () => void;
}

const BucketCard: React.FC<IBucketCard> = ({
  id,
  name,
  updatedAt,
  bundleCount,
  handlePress,
}) => {
  const { stallionMeta } = useContext(StallionContext);
  const isApplied = useMemo<boolean>(() => {
    if (stallionMeta?.activeBucket === id) return true;
    return false;
  }, [stallionMeta, id]);
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handlePress}
      activeOpacity={0.5}
    >
      <View style={styles.infoSection}>
        <BucketCardInfoSection
          name={name}
          updatedAt={updatedAt}
          bundleCount={bundleCount?.toString()}
          isApplied={isApplied}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    margin: STD_MARGIN,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: COLORS.black,
    shadowOffset: { height: 4, width: 4 },
    shadowOpacity: 0.1,
    elevation: 2,
    shadowRadius: 8,
  },
  infoSection: {
    width: '100%',
  },
  actionSection: {
    flex: 1,
    alignItems: 'center',
  },
});

export default BucketCard;
