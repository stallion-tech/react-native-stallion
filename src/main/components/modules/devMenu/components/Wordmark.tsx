import React, { memo, useCallback, useState } from 'react';
import { Image, Text, View } from 'react-native';

import {
  STALLION_LOGO_URL,
  WORDMARK_TEXT,
} from '../../../../constants/appConstants';

import styles from './styles';

/**
 * The shipped Stallion asset is a horse + wordmark lockup, so it stands in for
 * both the diamond placeholder and the "STALLION" text from the design. If the
 * remote asset fails to load we fall back to the diamond + wordmark spec.
 */
const Wordmark: React.FC = () => {
  const [logoFailed, setLogoFailed] = useState(false);
  const handleLogoError = useCallback(() => setLogoFailed(true), []);

  if (logoFailed) {
    return (
      <View style={styles.wordmarkRow}>
        <View style={styles.wordmarkDiamond} />
        <Text style={styles.wordmarkText}>{WORDMARK_TEXT}</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityRole="image"
      accessibilityLabel={WORDMARK_TEXT}
      source={{ uri: STALLION_LOGO_URL }}
      style={styles.wordmarkLogo}
      resizeMode="contain"
      onError={handleLogoError}
    />
  );
};

export default memo(Wordmark);
