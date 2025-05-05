import React from 'react';
import { Text, View } from 'react-native';

import styles from './styles';
import { IStallionConfigJson } from '../../../../../types/config.types';

interface IConfigView {
  config: IStallionConfigJson;
}

const ConfigView: React.FC<IConfigView> = ({ config }) => {
  return (
    <View style={[styles.metaConainer]}>
      <View style={[styles.configCardContainer]}>
        <Text style={[styles.titleText, styles.bold]}>App Version :</Text>
        <View style={[styles.colContainer, styles.flex]}>
          <Text style={[styles.subTitleText]}>{config.appVersion}</Text>
        </View>
      </View>
      <View style={styles.configCardContainer}>
        <Text style={[styles.titleText, styles.bold]}>UID :</Text>
        <View style={[styles.colContainer, styles.flex]}>
          <Text style={[styles.subTitleText]}>{config.uid}</Text>
        </View>
      </View>
    </View>
  );
};

export default ConfigView;
