import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import Wordmark from './Wordmark';
import { GLYPHS } from '../../../../constants/appConstants';
import { DS_HIT_SLOP } from '../../../../constants/designTokens';

import styles from './styles';

interface IAppHeader {
  /**
   * Set on the dark Production slab, which needs a white close glyph. Light
   * slabs — Testing, and the untinted login screen — keep the muted glyph.
   */
  isDarkTone?: boolean;
  onClosePress: () => void;
}

const AppHeader: React.FC<IAppHeader> = ({ isDarkTone, onClosePress }) => (
  <View style={styles.appHeader}>
    <Wordmark />
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      onPress={onClosePress}
      hitSlop={DS_HIT_SLOP}
    >
      <Text
        style={[styles.closeGlyph, isDarkTone && styles.closeGlyphProduction]}
      >
        {GLYPHS.CLOSE}
      </Text>
    </Pressable>
  </View>
);

export default memo(AppHeader);
