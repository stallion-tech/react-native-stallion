import React, { useCallback, memo } from 'react';
import { View, Text, Switch } from 'react-native';

import {
  FOOTER_INFO_SUBTITLE,
  FOOTER_INFO_TITLE,
  SWITCH_TITLE,
  SWITCH_TEXTS,
  EMPTY_DOWNLOAD_MESSAGE,
} from '../../../constants/appConstants';

import styles from './styles';

interface IFooter {
  switchIsOn?: boolean;
  onSwitchToggle?: (newSwitchStatus: boolean) => void;
  activeBundle?: {
    bucketName: string;
    version: string;
  };
  errorMessage?: string | null;
}

const Footer: React.FC<IFooter> = ({
  switchIsOn,
  onSwitchToggle,
  activeBundle,
  errorMessage,
}) => {
  const handleToggle = useCallback(() => {
    onSwitchToggle?.(!switchIsOn);
  }, [switchIsOn, onSwitchToggle]);
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
        {activeBundle?.bucketName ? (
          <>
            <View style={styles.dividerSection}>
              <Text style={styles.infoTitle} numberOfLines={1}>
                <Text style={styles.bold}>{FOOTER_INFO_TITLE}</Text>
                {activeBundle?.bucketName}
              </Text>
              <Text style={styles.infoSubTitle} numberOfLines={1}>
                <Text style={styles.bold}>{FOOTER_INFO_SUBTITLE}</Text>
                {activeBundle?.version}
              </Text>
            </View>
            <View style={[styles.dividerSection2, styles.alignCenter]}>
              <Text
                style={[
                  styles.infoTitle,
                  switchIsOn ? styles.greenColor : styles.redColor,
                  styles.bold,
                ]}
              >
                {SWITCH_TITLE}
                {switchIsOn ? SWITCH_TEXTS.ON : SWITCH_TEXTS.OFF}
              </Text>
              <Switch
                style={styles.switchButton}
                onValueChange={handleToggle}
                value={switchIsOn}
              />
            </View>
          </>
        ) : (
          <View style={[styles.noDownloadContainer]}>
            <Text style={styles.noDownloadText}>{EMPTY_DOWNLOAD_MESSAGE}</Text>
          </View>
        )}
      </View>
    </>
  );
};

export default memo(Footer);
