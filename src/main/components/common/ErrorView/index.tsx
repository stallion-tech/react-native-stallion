import React, { memo } from 'react';
import { View, Text } from 'react-native';

import styles from './styles';
import { DEFAULT_ERROR_PREFIX } from '@main/constants/appConstants';

interface IErrorView {
  error?: string | null;
}

const ErrorView: React.FC<IErrorView> = ({ error }) => {
  return (
    <View style={styles.errorContainer}>
      {error ? (
        <Text style={styles.errorText}>
          <Text style={styles.boldText}>{DEFAULT_ERROR_PREFIX}</Text>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default memo(ErrorView);
