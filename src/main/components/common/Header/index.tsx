import React, { memo, useCallback, useState } from 'react';
import { View, Text, Image } from 'react-native';

import { STALLION_LOGO_URL } from '../../../constants/appConstants';

import styles from './styles';

interface IHeader {
  title?: string | null;
}

const Header: React.FC<IHeader> = ({ title }) => {
  const [errorLogoLoading, setErrorLogoLoading] = useState(false);
  const errorInLogoLoading = useCallback(() => {
    setErrorLogoLoading(true);
  }, []);
  return (
    <View style={styles.headerContainer}>
      <View style={[styles.headerSideSection, styles.alignStart]} />
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
      <View style={styles.headerSideSection} />
    </View>
  );
};

export default memo(Header);
