import React, { memo } from 'react';
import { Text, View } from 'react-native';

import BackButton from '../../../common/BackButton';
import CrossButton from '../../../common/CrossButton';

import styles from './styles';

interface IDetailHeader {
  title: string;
  subtitle?: string;
  onBackPress: () => void;
  onClosePress: () => void;
}

const DetailHeader: React.FC<IDetailHeader> = ({
  title,
  subtitle,
  onBackPress,
  onClosePress,
}) => (
  <View style={styles.detailHeader}>
    <View style={styles.backButton}>
      <BackButton onPress={onBackPress} />
    </View>
    <View style={styles.detailTitleBlock}>
      <Text style={styles.detailTitle} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.detailSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    <CrossButton onPress={onClosePress} />
  </View>
);

export default memo(DetailHeader);
