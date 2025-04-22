import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { HEADER_SLAB_HEIGHT } from '../../../constants/appConstants';

export const BUTTON_SIZE = HEADER_SLAB_HEIGHT / 2.5; // Change this to scale button

type CrossButtonProps = {
  onPress?: () => void;
  size?: number;
};

const CrossButton: React.FC<CrossButtonProps> = ({
  onPress,
  size = BUTTON_SIZE,
}) => {
  const strokeStyle: ViewStyle = {
    position: 'absolute',
    width: size,
    height: 3,
    backgroundColor: COLORS.black7,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { width: size, height: size }]}
    >
      <View style={[strokeStyle, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[strokeStyle, { transform: [{ rotate: '-45deg' }] }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CrossButton;
