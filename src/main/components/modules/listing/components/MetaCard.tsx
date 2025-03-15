import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import CardDescriptionContent from './CardDescriptionContent';
import { parseDateTime } from '../../../../utils/dateUtil';

import styles from './styles';
import { IUpdateMeta } from '../../../../../types/updateMeta.types';

interface IMetaCard {
  meta: IUpdateMeta;
}

const MetaCard: React.FC<IMetaCard> = ({ meta }) => {
  const updatedAtText = useMemo(() => {
    return parseDateTime(meta.updatedAt);
  }, [meta.updatedAt]);

  return (
    <View style={styles.metaConainer}>
      <View style={styles.colContainer}>
        <Text style={[styles.titleText, styles.bold]}>
          {meta.sha256Checksum?.substring(0, 24)}
        </Text>
        <Text style={[styles.subText]}>{meta.releaseNote}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.rowContainer}>
        <CardDescriptionContent title={'Version'} subtitle={meta.version} />
        <CardDescriptionContent title={'Updated At'} subtitle={updatedAtText} />
        <CardDescriptionContent title={'Size'} subtitle={meta.size} />
      </View>
    </View>
  );
};

export default MetaCard;
