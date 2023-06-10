import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

import { StallionContext } from '../../state/StallionController';
import {
  BACK_BUTTON_TEXT,
  CLOSE_BUTTON_TEXT,
  HEADER_SLAB_HEIGHT,
  HEADER_TITLE,
} from '../../constants/appConstants';
import { COLORS } from '../../constants/colors';

interface IHeader {
  onBackPress: () => void;
}

const Header: React.FC<IHeader> = ({ onBackPress }) => {
  const { selectedBucketId, setSelectedBucketId } = useContext(StallionContext);
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={[styles.headerSideSection, styles.alignStart]}
        onPress={() => setSelectedBucketId(undefined)}
      >
        {selectedBucketId ? (
          <Text style={styles.actionButtonText}>{BACK_BUTTON_TEXT}</Text>
        ) : null}
      </TouchableOpacity>
      <View style={styles.headerCenterSection}>
        <Text style={styles.headerText}>{HEADER_TITLE}</Text>
      </View>
      <TouchableOpacity style={styles.headerSideSection} onPress={onBackPress}>
        <Text style={styles.actionButtonText}>{CLOSE_BUTTON_TEXT}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: HEADER_SLAB_HEIGHT,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: HEADER_SLAB_HEIGHT / 5,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowOffset: { height: 10, width: 10 },
    shadowRadius: 10,
    backgroundColor: COLORS.white,
    elevation: 5,
  },
  headerSideSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerCenterSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  actionButtonText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
  },
  alignStart: {
    alignItems: 'flex-start',
  },
});

export default Header;
