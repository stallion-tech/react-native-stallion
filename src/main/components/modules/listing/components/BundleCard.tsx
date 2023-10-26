import React, { useContext, useMemo, memo } from 'react';
import { View } from 'react-native';

import BundleCardInfoSection from './BundleCardInfoSection';

import styles from './styles';
import { GlobalContext } from '../../../../state';
import { CARD_TYPES } from '../../../../constants/appConstants';

export interface IBundleCard {
  type: CARD_TYPES.BUNDLE;
  version: number;
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  author: string;
  downloadUrl: string;
}

const BundleCard: React.FC<IBundleCard> = ({
  version,
  name,
  description,
  updatedAt,
  author,
  downloadUrl,
}) => {
  const { metaState, bundleState } = useContext(GlobalContext);
  const isApplied = useMemo<boolean>(() => {
    if (
      metaState.activeBucket === bundleState.selectedBucketId &&
      metaState.activeVersion === `${version}`
    )
      return true;
    return false;
  }, [
    metaState.activeBucket,
    metaState.activeVersion,
    bundleState.selectedBucketId,
    version,
  ]);
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
          downloadUrl={downloadUrl}
        />
      </View>
    </View>
  );
};

export default memo(BundleCard);
