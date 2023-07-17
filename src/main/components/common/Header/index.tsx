import React, { memo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

import {
  BACK_BUTTON_TEXT,
  CLOSE_BUTTON_TEXT,
  HEADER_TITLE,
} from '../../../constants/appConstants';

import styles from './styles';

interface IHeader {
  onBackPress?: (() => void) | null;
  onClosePress: () => void;
}

const Header: React.FC<IHeader> = ({ onBackPress, onClosePress }) => {
  return (
    <View style={styles.headerContainer}>
      {onBackPress ? (
        <TouchableOpacity
          style={[styles.headerSideSection, styles.alignStart]}
          onPress={onBackPress}
        >
          <Text style={styles.actionButtonText}>{BACK_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSideSection} />
      )}
      <View style={styles.headerCenterSection}>
        <Text style={styles.headerText}>{HEADER_TITLE}</Text>
      </View>
      <TouchableOpacity style={styles.headerSideSection} onPress={onClosePress}>
        <Text style={styles.actionButtonText}>{CLOSE_BUTTON_TEXT}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(Header);
