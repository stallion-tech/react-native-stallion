import React, { memo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { DS_COLORS, DS_HIT_SLOP } from '../../../constants/designTokens';

export const BUTTON_SIZE = 18;

type CrossButtonProps = {
  onPress?: () => void;
  size?: number;
  color?: string;
};

/**
 * Close mark drawn with rotated Views so stroke weight and centering stay
 * consistent across platforms (Unicode ✕ varies by font).
 */
const CrossButton: React.FC<CrossButtonProps> = ({
  onPress,
  size = BUTTON_SIZE,
  color = DS_COLORS.textMuted,
}) => {
  const strokeStyle: ViewStyle = {
    position: 'absolute',
    width: size,
    height: 2,
    borderRadius: 1,
    backgroundColor: color,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      onPress={onPress}
      hitSlop={DS_HIT_SLOP}
      style={[styles.container, { width: size, height: size }]}
    >
      <View style={[strokeStyle, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[strokeStyle, { transform: [{ rotate: '-45deg' }] }]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(CrossButton);
