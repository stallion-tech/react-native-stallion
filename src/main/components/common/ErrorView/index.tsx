import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import styles from './styles';
import {
  DEFAULT_ERROR_PREFIX,
  RETRY_BUTTON_TEXT,
} from '../../../constants/appConstants';

interface IErrorView {
  error?: string | null;
  onRetry?: () => void;
}

const ErrorView: React.FC<IErrorView> = ({ error, onRetry }) => {
  return (
    <View style={styles.errorContainer}>
      {error ? (
        <Text style={styles.errorText}>
          <Text style={styles.boldText}>{DEFAULT_ERROR_PREFIX}</Text>
          {error}
        </Text>
      ) : null}
      {onRetry ? (
        <TouchableOpacity style={styles.retryButtonContainer} onPress={onRetry}>
          <Text style={[styles.retryText]}>{RETRY_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default memo(ErrorView);
