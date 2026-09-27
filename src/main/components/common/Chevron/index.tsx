import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { DS_COLORS } from '../../../constants/designTokens';

export const CHEVRON_SIZE = 20;

type ChevronProps = {
  /** Defaults to a right-pointing chevron (list disclosure). */
  direction?: 'left' | 'right';
  size?: number;
  color?: string;
};

/**
 * Chevron drawn with rotated Views so weight and alignment stay identical on
 * iOS and Android (Unicode ‹ › shift with font metrics).
 */
const Chevron: React.FC<ChevronProps> = ({
  direction = 'right',
  size = CHEVRON_SIZE,
  color = DS_COLORS.chevron,
}) => {
  const arrowLength = size * 0.55;
  // Nudge the V toward the open side of the box so it reads as a chevron,
  // not a centered X fragment.
  const offset = size * 0.22;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        direction === 'left' ? styles.alignStart : styles.alignEnd,
      ]}
    >
      <View
        style={[
          styles.line,
          {
            width: arrowLength,
            backgroundColor: color,
            transform: [
              { rotate: '-45deg' },
              { translateX: direction === 'left' ? offset : -offset },
            ],
          },
        ]}
      />
      <View
        style={[
          styles.line,
          {
            width: arrowLength,
            backgroundColor: color,
            transform: [
              { rotate: '45deg' },
              { translateX: direction === 'left' ? offset : -offset },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  line: {
    position: 'absolute',
    height: 2.5,
    borderRadius: 1,
  },
});

export default memo(Chevron);
