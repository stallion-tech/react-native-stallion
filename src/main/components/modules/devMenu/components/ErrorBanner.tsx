import React, { memo } from 'react';
import { Text, View } from 'react-native';

import { DEFAULT_ERROR_PREFIX } from '../../../../constants/appConstants';

import styles from './styles';

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.errorBanner}>
    <Text style={styles.errorBannerText} numberOfLines={2}>
      {DEFAULT_ERROR_PREFIX}
      {message}
    </Text>
  </View>
);

export default memo(ErrorBanner);
