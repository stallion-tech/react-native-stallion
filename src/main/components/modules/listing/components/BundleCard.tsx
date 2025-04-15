import React, { useContext, useMemo, memo } from 'react';
import { View } from 'react-native';

import BundleCardInfoSection from './BundleCardInfoSection';

import styles from './styles';
import { CARD_TYPES } from '../../../../constants/appConstants';
import { GlobalContext } from '../../../../state';

export interface IBundleCard {
  type: CARD_TYPES.BUNDLE;
  version: number;
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  author: string;
  downloadUrl: string;
  size: number;
  index: number;
}

const BundleCard: React.FC<IBundleCard> = ({
  id,
  version,
  name,
  description,
  updatedAt,
  author,
  downloadUrl,
  size,
  index,
}) => {
  const { metaState } = useContext(GlobalContext);
  const isApplied = useMemo<boolean>(() => {
    return metaState.stageSlot.newHash === id;
  }, [metaState.stageSlot.newHash, id]);
  const isDownloaded = useMemo<boolean>(() => {
    return metaState.stageSlot.tempHash === id;
  }, [metaState.stageSlot.tempHash, id]);
  return (
    <View style={styles.cardContainer}>
      <View style={styles.infoSection}>
        <BundleCardInfoSection
          name={name}
          id={id}
          version={version}
          description={description}
          author={author}
          updatedAt={updatedAt}
          isApplied={isApplied}
          isDownloaded={isDownloaded}
          downloadUrl={downloadUrl}
          size={size}
          index={index}
        />
      </View>
    </View>
  );
};

export default memo(BundleCard);
