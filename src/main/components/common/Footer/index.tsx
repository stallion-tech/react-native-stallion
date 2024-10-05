import React, { useCallback, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { SWITCH_TEXTS } from '../../../constants/appConstants';

import styles from './styles';

interface IFooter {
  switchIsOn?: boolean;
  onSwitchToggle?: (newSwitchStatus: boolean) => void;
  errorMessage?: string | null;
}

const Footer: React.FC<IFooter> = ({
  switchIsOn,
  onSwitchToggle,
  errorMessage,
}) => {
  const handleToggle = useCallback(
    (newSwitchStatus: boolean) => {
      onSwitchToggle?.(newSwitchStatus);
    },
    [onSwitchToggle]
  );
  return (
    <>
      {errorMessage ? (
        <View style={[styles.errorInfoSection]}>
          <Text style={styles.errTxt} numberOfLines={1}>
            {errorMessage}
          </Text>
        </View>
      ) : null}
      <View style={[styles.footerContainer, styles.shadowContainer]}>
        <TouchableOpacity
          onPress={() => handleToggle(true)}
          style={[styles.tabContainer, switchIsOn ? styles.tabSelected : {}]}
        >
          <Text
            style={[styles.titleBasic, switchIsOn ? styles.titleSelected : {}]}
          >
            {SWITCH_TEXTS.ON}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleToggle(false)}
          style={[styles.tabContainer, !switchIsOn ? styles.tabSelected : {}]}
        >
          <Text
            style={[styles.titleBasic, !switchIsOn ? styles.titleSelected : {}]}
          >
            {SWITCH_TEXTS.OFF}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default memo(Footer);
