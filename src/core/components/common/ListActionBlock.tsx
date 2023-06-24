import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  DEFAULT_ERROR_PREFIX,
  HEADER_SLAB_HEIGHT,
} from '../../../core/constants/appConstants';
import { COLORS } from '../../constants/colors';

interface IListActionBlock {
  error?: string | null;
}

const ListActionBlock: React.FC<IListActionBlock> = ({ error }) => {
  return (
    <View style={styles.loaderContainer}>
      {error ? (
        <Text style={styles.errorText}>
          <Text style={styles.boldText}>{DEFAULT_ERROR_PREFIX}</Text>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HEADER_SLAB_HEIGHT / 2,
    backgroundColor: COLORS.background_grey,
  },
  errorText: {
    color: COLORS.error,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default ListActionBlock;
