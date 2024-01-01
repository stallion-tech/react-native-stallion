import React, { memo } from 'react';
import { View } from 'react-native';

import Spinner from '../Spinner';

import styles from './styles';

const FooterLoader = () => {
  return (
    <View style={styles.loaderContainer}>
      <Spinner />
    </View>
  );
};

export default memo(FooterLoader);
