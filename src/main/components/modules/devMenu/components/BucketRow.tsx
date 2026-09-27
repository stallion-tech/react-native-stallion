import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import Chevron from '../../../common/Chevron';
import {
  BUCKET_UPDATED_PREFIX,
  BUNDLE_COUNT_SUFFIX,
  BUNDLE_COUNT_SUFFIX_SINGULAR,
  META_SEPARATOR,
  VERSION_PREFIX,
} from '../../../../constants/appConstants';
import { parseDateTime } from '../../../../utils/dateUtil';

import styles from './styles';

export interface IBucketRow {
  id: string;
  name: string;
  updatedAt: string;
  latestVersion: number;
  onPress: (bucketId: string) => void;
}

const BucketRow: React.FC<IBucketRow> = ({
  id,
  name,
  updatedAt,
  latestVersion,
  onPress,
}) => {
  const meta = [
    `${VERSION_PREFIX}${latestVersion}`,
    `${latestVersion}${
      latestVersion === 1 ? BUNDLE_COUNT_SUFFIX_SINGULAR : BUNDLE_COUNT_SUFFIX
    }`,
    `${BUCKET_UPDATED_PREFIX}${parseDateTime(updatedAt)}`,
  ].join(META_SEPARATOR);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={() => onPress(id)}
      style={[styles.card, styles.bucketRow]}
    >
      <View style={styles.bucketTextBlock}>
        <Text style={styles.bucketName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.bucketMeta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      <Chevron direction="right" />
    </Pressable>
  );
};

export default memo(BucketRow);
