import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import CardDescriptionContent from './CardDescriptionContent';
import { parseDateTime } from '../../../../utils/dateUtil';

import styles from './styles';
import { IUpdateMeta } from '../../../../../types/updateMeta.types';
import { getDigitalStorageSize } from '../../../../utils/getSize';

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
          {`v${meta.version}`}
        </Text>
        <Text style={[styles.subText]}>{meta.releaseNote}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.rowContainer}>
        <CardDescriptionContent
          title={'ID'}
          subtitle={meta.sha256Checksum?.substring(0, 12)}
        />
        <CardDescriptionContent title={'Updated At'} subtitle={updatedAtText} />
        <CardDescriptionContent
          title={'Size'}
          subtitle={getDigitalStorageSize(meta.size || 0)}
        />
      </View>
    </View>
  );
};

export default MetaCard;
