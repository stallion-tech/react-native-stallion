import React, { useContext, useMemo } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { HEADER_SLAB_HEIGHT, STD_MARGIN } from '../../constants/appConstants';
import commonStyles from '../styles/commonStyles';
import CardDescriptionContent from './CardDescriptionContent';
import { parseDateTime } from '../../utils/dateUtil';
import { StallionContext } from '../../state/StallionController';

interface IBucketCardInfoSection {
  name: string;
  updatedAt: string;
  bundleCount?: string;
  isApplied?: boolean;
}

const BucketCardInfoSection: React.FC<IBucketCardInfoSection> = ({
  name,
  updatedAt,
  bundleCount,
  isApplied,
}) => {
  const { stallionMeta } = useContext(StallionContext);

  const renderStateText = useMemo(() => {
    if (isApplied && !stallionMeta?.switchState)
      return { text: 'Downloaded', color: 'orange' };

    if (isApplied && stallionMeta?.switchState)
      return { text: 'Applied', color: 'green' };

    return null;
  }, [isApplied, stallionMeta?.switchState]);

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Text style={[styles.titleText, commonStyles.bold]}>{name}</Text>
        <Text style={[styles.appliedText, { color: renderStateText?.color }]}>
          {renderStateText?.text}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.rowContainer}>
        <CardDescriptionContent
          title={'Version'}
          subtitle={bundleCount && +bundleCount ? `v${bundleCount}.0` : 'N/A'}
        />
        <CardDescriptionContent
          title={'Bundles'}
          subtitle={bundleCount && +bundleCount ? bundleCount : 0}
        />
        <CardDescriptionContent
          title={'Updated'}
          subtitle={parseDateTime(updatedAt)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedText: { color: 'green', fontWeight: 'bold', fontSize: 14 },
  container: {
    margin: 15,
  },
  divider: {
    borderBottomWidth: 0.5,
    opacity: 0.2,
    marginVertical: 10,
  },
  subText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
    marginBottom: STD_MARGIN / 2,
  },
  titleText: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default BucketCardInfoSection;
