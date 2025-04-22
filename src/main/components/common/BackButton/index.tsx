import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { HEADER_SLAB_HEIGHT } from '../../../constants/appConstants';

export const BUTTON_SIZE = HEADER_SLAB_HEIGHT / 2.5; // Shared size reference

type BackButtonProps = {
  onPress?: () => void;
  size?: number;
};

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  size = BUTTON_SIZE,
}) => {
  const arrowLength = size * 0.6;
  const offset = size * 0.28;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { width: size, height: size }]}
    >
      <View
        style={[
          styles.line,
          {
            width: arrowLength,
            transform: [{ rotate: '-45deg' }, { translateX: offset }],
          },
        ]}
      />
      <View
        style={[
          styles.line,
          {
            width: arrowLength,
            transform: [{ rotate: '45deg' }, { translateX: offset }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    height: 3,
    borderRadius: 1,
    backgroundColor: COLORS.black7,
  },
});

export default BackButton;
