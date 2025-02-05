import React from 'react';
import { Text, View } from 'react-native';

import styles from './styles';
import { IStallionConfigJson } from '../../../../../types/config.types';

interface IConfigView {
  config: IStallionConfigJson;
}

const ConfigView: React.FC<IConfigView> = ({ config }) => {
  return (
    <View style={styles.metaConainer}>
      <View style={styles.colContainer}>
        <Text style={[styles.titleText, styles.bold]}>
          App Version: {config.appVersion}
        </Text>
        <Text style={[styles.titleText, styles.bold]}>UID: {config.uid}</Text>
      </View>
    </View>
  );
};

export default ConfigView;
