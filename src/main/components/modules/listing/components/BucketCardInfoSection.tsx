import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import CardDescriptionContent from './CardDescriptionContent';
import { parseDateTime } from '../../../../utils/dateUtil';

import { COLORS } from '../../../../constants/colors';
import {
  BUCKET_CARD_TEXTS,
  NOT_APPLICABLE_TEXT,
  VERSION_PREFIX,
} from '../../../../constants/appConstants';

import styles from './styles';

interface IBucketCardInfoSection {
  name: string;
  updatedAt: string;
  switchState: boolean;
  bundleCount?: string;
  isApplied?: boolean;
}

const BucketCardInfoSection: React.FC<IBucketCardInfoSection> = ({
  name,
  updatedAt,
  bundleCount,
  isApplied,
  switchState,
}) => {
  const renderStateText = useMemo(() => {
    if (isApplied && !switchState)
      return { text: BUCKET_CARD_TEXTS.DOWNLOADED, color: COLORS.orange };

    if (isApplied && switchState)
      return { text: BUCKET_CARD_TEXTS.APPLIED, color: COLORS.green };

    return null;
  }, [isApplied, switchState]);

  const updatedAtText = useMemo(() => {
    return parseDateTime(updatedAt);
  }, [updatedAt]);

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Text style={[styles.titleText, styles.bold]}>{name}</Text>
        <Text style={[styles.appliedText, { color: renderStateText?.color }]}>
          {renderStateText?.text}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.rowContainer}>
        <CardDescriptionContent
          title={BUCKET_CARD_TEXTS.VERSION}
          subtitle={
            bundleCount && +bundleCount
              ? `${VERSION_PREFIX}${bundleCount}`
              : NOT_APPLICABLE_TEXT
          }
        />
        <CardDescriptionContent
          title={BUCKET_CARD_TEXTS.BUNDLES}
          subtitle={bundleCount && +bundleCount ? bundleCount : 0}
        />
        <CardDescriptionContent
          title={BUCKET_CARD_TEXTS.UPDATED}
          subtitle={updatedAtText}
        />
      </View>
    </View>
  );
};

export default BucketCardInfoSection;
