import React, { memo, useContext, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';

import { GlobalContext } from '../../../../state';
import BucketCardInfoSection from './BucketCardInfoSection';

import { CARD_TYPES } from '../../../../constants/appConstants';
import styles from './styles';
import { SWITCH_STATES } from '../../../../../types/meta.types';

export interface IBucketCard {
  type: CARD_TYPES.BUCKET;
  id: string;
  name: string;
  updatedAt: string;
  bundleCount?: number;
  handlePress?: () => void;
}

const BucketCard: React.FC<IBucketCard> = ({
  name,
  updatedAt,
  bundleCount,
  handlePress,
}) => {
  const { metaState } = useContext(GlobalContext);
  const isApplied = useMemo<boolean>(() => false, []);
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
          switchState={metaState?.switchState === SWITCH_STATES.STAGE}
        />
      </View>
    </TouchableOpacity>
  );
};

export default memo(BucketCard);
