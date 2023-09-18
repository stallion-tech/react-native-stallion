import React, { memo, useCallback, useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';

import {
  BACK_BUTTON_TEXT,
  CLOSE_BUTTON_TEXT,
  STALLION_LOGO_URL,
} from '../../../constants/appConstants';

import styles from './styles';

interface IHeader {
  userName?: string | null;
  title?: string | null;
  onBackPress?: (() => void) | null;
  onClosePress?: () => void;
  onProfilePress?: () => void;
}

const Header: React.FC<IHeader> = ({
  userName,
  title,
  onBackPress,
  onClosePress,
  onProfilePress,
}) => {
  const [errorLogoLoading, setErrorLogoLoading] = useState(false);
  const errorInLogoLoading = useCallback(() => {
    setErrorLogoLoading(true);
  }, []);
  return (
    <View style={styles.headerContainer}>
      {onBackPress ? (
        <TouchableOpacity
          style={[styles.headerSideSection, styles.alignStart]}
          onPress={onBackPress}
        >
          <Text style={styles.actionButtonText}>{BACK_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.headerSideSection, styles.alignStart]}>
          {userName && onProfilePress ? (
            <TouchableOpacity
              style={styles.headerProfileButton}
              onPress={onProfilePress}
            >
              <Text style={styles.profileInitial}>{userName?.[0] || ''}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
      <View style={styles.headerCenterSection}>
        {errorLogoLoading ? (
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
        )}
      </View>
      {onClosePress ? (
        <TouchableOpacity
          style={styles.headerSideSection}
          onPress={onClosePress}
        >
          <Text style={styles.actionButtonText}>{CLOSE_BUTTON_TEXT}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSideSection} />
      )}
    </View>
  );
};

export default memo(Header);
