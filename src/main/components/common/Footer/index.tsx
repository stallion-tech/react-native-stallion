import React, { useCallback, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import {
  SWITCH_TEXTS,
  RESTART_REQUIRED_MESSAGE,
  FOOTER_SUB_TEXTS,
} from '../../../constants/appConstants';

import styles from './styles';
import { restart } from '../../../utils/StallionNativeUtils';

interface IFooter {
  switchIsOn?: boolean;
  onSwitchToggle?: (newSwitchStatus: boolean) => void;
  errorMessage?: string | null;
  isRestartRequired?: boolean;
}

const Footer: React.FC<IFooter> = ({
  switchIsOn,
  onSwitchToggle,
  errorMessage,
  isRestartRequired,
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
          <Text style={styles.ribbonMessage} numberOfLines={1}>
            {errorMessage}
          </Text>
        </View>
      ) : null}
      {isRestartRequired ? (
        <TouchableOpacity
          style={[styles.restartInfoSection]}
          onPress={() => {
            restart?.();
          }}
        >
          <Text style={styles.ribbonMessage} numberOfLines={1}>
            {RESTART_REQUIRED_MESSAGE}
          </Text>
        </TouchableOpacity>
      ) : null}
      <View style={[styles.footerContainer, styles.shadowContainer]}>
        <View style={styles.switchContainer}>
          <TouchableOpacity
            onPress={() => handleToggle(true)}
            style={[styles.tabContainer, switchIsOn ? styles.tabSelected : {}]}
          >
            <Text
              style={[
                styles.titleBasic,
                switchIsOn ? styles.titleSelected : {},
              ]}
            >
              {SWITCH_TEXTS.ON}
            </Text>
            {switchIsOn ? (
              <Text
                style={[
                  styles.subTitleBasic,
                  switchIsOn ? styles.subTitleSelected : {},
                ]}
              >
                {FOOTER_SUB_TEXTS.STAGE}
              </Text>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleToggle(false)}
            style={[styles.tabContainer, !switchIsOn ? styles.tabSelected : {}]}
          >
            <Text
              style={[
                styles.titleBasic,
                !switchIsOn ? styles.titleSelected : {},
              ]}
            >
              {SWITCH_TEXTS.OFF}
            </Text>
            {!switchIsOn ? (
              <Text
                style={[
                  styles.subTitleBasic,
                  !switchIsOn ? styles.subTitleSelected : {},
                ]}
              >
                {FOOTER_SUB_TEXTS.PROD}
              </Text>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default memo(Footer);
