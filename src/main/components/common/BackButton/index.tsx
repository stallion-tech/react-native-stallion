import React, { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import Chevron, { CHEVRON_SIZE } from '../Chevron';
import { DS_COLORS, DS_HIT_SLOP } from '../../../constants/designTokens';

export const BUTTON_SIZE = CHEVRON_SIZE;

type BackButtonProps = {
  onPress?: () => void;
  size?: number;
  color?: string;
};

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  size = BUTTON_SIZE,
  color = DS_COLORS.textMuted,
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Back"
    onPress={onPress}
    hitSlop={DS_HIT_SLOP}
    style={styles.hitTarget}
  >
    <Chevron direction="left" size={size} color={color} />
  </Pressable>
);

const styles = StyleSheet.create({
  hitTarget: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(BackButton);
