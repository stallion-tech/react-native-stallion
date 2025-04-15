import React, { useCallback, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import {
  SWITCH_TEXTS,
  RESTART_REQUIRED_MESSAGE,
} from '../../../constants/appConstants';

import styles from './styles';
import ButtonFullWidth from '../ButtonFullWidth';

{
  /* <>
{errorMessage ? (
  <View style={[styles.errorInfoSection]}>
    <Text style={styles.ribbonMessage} numberOfLines={1}>
      {errorMessage}
    </Text>
  </View>
) : null}
{isRestartRequired ? (
  <View style={[styles.restartInfoSection]}>
    <Text style={styles.ribbonMessage} numberOfLines={1}>
      {RESTART_REQUIRED_MESSAGE}
    </Text>
  </View>
) : null} */
}

interface IFooter {
  footerButtonText: string;
  onFooterButtonPress: () => void;
}

const Footer: React.FC<IFooter> = ({
  footerButtonText,
  onFooterButtonPress,
}) => {
  return (
    <View style={[styles.footerContainer]}>
      <ButtonFullWidth
        buttonText={footerButtonText}
        onPress={onFooterButtonPress}
      />
    </View>
  );
};

export default memo(Footer);
