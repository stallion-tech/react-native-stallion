import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

import { HEADER_SLAB_HEIGHT } from '../../constants/appConstants';

interface ITextButton {
  title: string;
  onPress: () => void;
}

const TextButton: React.FC<ITextButton> = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
    color: 'blue',
  },
});

export default TextButton;
