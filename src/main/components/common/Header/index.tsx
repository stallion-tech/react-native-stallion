import React, { memo, useCallback, useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';

import {
  BACK_BUTTON_TEXT,
  CLOSE_BUTTON_TEXT,
  STALLION_LOGO_URL,
} from '../../../constants/appConstants';

import styles from './styles';

interface IHeader {
  title?: string | null;
  onBackPress?: (() => void) | null;
  onClosePress?: () => void;
}

const Header: React.FC<IHeader> = ({ title, onBackPress, onClosePress }) => {
  const [errorLogoLoading, setErrorLogoLoading] = useState(false);
  const errorInLogoLoading = useCallback(() => {
    setErrorLogoLoading(true);
  }, []);
  return (
    <View style={styles.headerContainer}>
      {onBackPress ? (
        <View style={[styles.headerSideSection, styles.alignStart]}>
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.actionButtonClickable}
          >
            <Text style={styles.actionButtonText}>{BACK_BUTTON_TEXT}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.headerSideSection, styles.alignStart]} />
      )}
      <View style={styles.headerCenterSection}>
        {title ? (
          errorLogoLoading ? (
            <Text style={styles.headerText}>{title}</Text>
          ) : (
            <Image
              source={{
                uri: STALLION_LOGO_URL,
              }}
              style={styles.headerLogo}
              resizeMode="contain"
              onError={errorInLogoLoading}
            />
          )
        ) : null}
      </View>
      {onClosePress ? (
        <View style={styles.headerSideSection}>
          <TouchableOpacity
            style={styles.actionButtonClickable}
            onPress={onClosePress}
          >
            <Text style={styles.actionButtonText}>{CLOSE_BUTTON_TEXT}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerSideSection} />
      )}
    </View>
  );
};

export default memo(Header);
