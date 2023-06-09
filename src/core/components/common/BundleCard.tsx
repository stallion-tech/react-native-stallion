import React, { useContext, useMemo, memo } from 'react';
import { StyleSheet, View } from 'react-native';

import BundleCardInfoSection from './BundleCardInfoSection';

import { STD_MARGIN, CARD_TYPES } from '../../constants/appConstants';
import useStallionDownload from '../../utils/useStallionDownload';
import { StallionContext } from '../../state/StallionController';
import { COLORS } from '../../constants/colors';

export interface IBundleCard {
  type: CARD_TYPES.BUNDLE;
  version: number;
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  author: string;
}

const BundleCard: React.FC<IBundleCard> = ({
  version,
  name,
  description,
  updatedAt,
  author,
}) => {
  const { selectedBucketId } = useStallionDownload();
  const { stallionMeta } = useContext(StallionContext);
  const isApplied = useMemo<boolean>(() => {
    if (
      stallionMeta?.activeBucket === selectedBucketId &&
      stallionMeta?.activeVersion === `${version}`
    )
      return true;
    return false;
  }, [stallionMeta, selectedBucketId, version]);
  return (
    <View style={styles.cardContainer}>
      <View style={styles.infoSection}>
        <BundleCardInfoSection
          name={name}
          version={version}
          description={description}
          author={author}
          updatedAt={updatedAt}
          isApplied={isApplied}
        />
      </View>
    </View>
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
    flex: 2,
  },
  actionSection: {
    flex: 1,
    marginTop: STD_MARGIN * 2,
    alignItems: 'center',
  },
});

export default memo(BundleCard);
