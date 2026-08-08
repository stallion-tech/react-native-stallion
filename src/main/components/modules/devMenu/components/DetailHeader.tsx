import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GLYPHS } from '../../../../constants/appConstants';
import { DS_HIT_SLOP } from '../../../../constants/designTokens';

import styles from './styles';

interface IDetailHeader {
  title: string;
  subtitle?: string;
  onBackPress: () => void;
  onClosePress: () => void;
}

const DetailHeader: React.FC<IDetailHeader> = ({
  title,
  subtitle,
  onBackPress,
  onClosePress,
}) => (
  <View style={styles.detailHeader}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onBackPress}
      hitSlop={DS_HIT_SLOP}
      style={styles.backButton}
    >
      <Text style={styles.backGlyph}>{GLYPHS.BACK}</Text>
    </Pressable>
    <View style={styles.detailTitleBlock}>
      <Text style={styles.detailTitle} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.detailSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      onPress={onClosePress}
      hitSlop={DS_HIT_SLOP}
    >
      <Text style={styles.closeGlyph}>{GLYPHS.CLOSE}</Text>
    </Pressable>
  </View>
);

export default memo(DetailHeader);
