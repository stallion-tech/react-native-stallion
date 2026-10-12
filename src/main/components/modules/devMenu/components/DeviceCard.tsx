import React, { memo } from 'react';
import { Text, View } from 'react-native';

import {
  DEVICE_ROW_APP_VERSION,
  DEVICE_ROW_UID,
  NOT_APPLICABLE_TEXT,
} from '../../../../constants/appConstants';

import styles from './styles';

interface IDeviceCard {
  appVersion?: string;
  uid?: string;
}

const DeviceCard: React.FC<IDeviceCard> = ({ appVersion, uid }) => (
  <View style={styles.card}>
    <View style={styles.deviceRow}>
      <Text style={styles.deviceLabel}>{DEVICE_ROW_APP_VERSION}</Text>
      <Text style={styles.deviceValue} numberOfLines={1}>
        {appVersion || NOT_APPLICABLE_TEXT}
      </Text>
    </View>
    <View style={styles.deviceDivider} />
    <View style={styles.deviceRow}>
      <Text style={styles.deviceLabel}>{DEVICE_ROW_UID}</Text>
      <Text
        style={[styles.deviceValue, styles.deviceValueMono]}
        numberOfLines={1}
      >
        {uid || NOT_APPLICABLE_TEXT}
      </Text>
    </View>
  </View>
);

export default memo(DeviceCard);
