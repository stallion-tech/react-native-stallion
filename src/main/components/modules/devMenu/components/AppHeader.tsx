import React, { memo } from 'react';
import { View } from 'react-native';

import CrossButton from '../../../common/CrossButton';
import Wordmark from './Wordmark';

import styles from './styles';

interface IAppHeader {
  onClosePress: () => void;
}

const AppHeader: React.FC<IAppHeader> = ({ onClosePress }) => (
  <View style={styles.appHeader}>
    <Wordmark />
    <CrossButton onPress={onClosePress} />
  </View>
);

export default memo(AppHeader);
