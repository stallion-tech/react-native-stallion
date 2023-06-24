import React, { useContext, useMemo } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { HEADER_SLAB_HEIGHT, STD_MARGIN } from '../../constants/appConstants';
import commonStyles from '../styles/commonStyles';
import { COLORS } from '../../constants/colors';
import CardDescriptionContent from './CardDescriptionContent';
import { parseDateTime } from '../../utils/dateUtil';
import { StallionContext } from '../../state/StallionController';
import useStallionDownload from '../../utils/useStallionDownload';

interface IBundleCardInfoSection {
  name: string;
  updatedAt: string;
  description?: string;
  version?: number;
  author?: string;
  isApplied?: boolean;
}

const BundleCardInfoSection: React.FC<IBundleCardInfoSection> = ({
  version,
  description,
  updatedAt,
  author,
  isApplied,
}) => {
  const { stallionMeta } = useContext(StallionContext);
  const { selectedBucketId, handleDownloadBundle } = useStallionDownload();

  const stateColor = useMemo(() => {
    if (isApplied && !stallionMeta?.switchState) return 'orange';
    if (isApplied && stallionMeta?.switchState) return 'green';
    return 'blue';
  }, [isApplied, stallionMeta?.switchState]);

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Text style={[styles.titleText, commonStyles.bold]}>v{version}</Text>
        <Text
          onPress={() =>
            !isApplied && selectedBucketId
              ? handleDownloadBundle(selectedBucketId, version)
              : null
          }
          style={[styles.appliedText, { color: stateColor }]}
        >
          {isApplied ? 'Downloaded' : 'Download'}
        </Text>
      </View>
      {description ? (
        <>
          <Text style={styles.releaseNoteText}>Release Note:</Text>
          <Text style={styles.releaseNoteDescriptionText}>{description}</Text>
        </>
      ) : (
        <Text style={styles.releaseNoteText}>No release note provided</Text>
      )}
      <View style={styles.divider} />
      <View style={styles.rowContainer}>
        <CardDescriptionContent title={'Author'} subtitle={author ?? ''} />
        <CardDescriptionContent
          title={'Applied'}
          subtitle={isApplied && stallionMeta?.switchState ? 'True' : 'False'}
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
  releaseNoteText: { fontSize: 12, fontWeight: '500', marginTop: 10 },
  releaseNoteDescriptionText: {
    fontSize: 14,
    marginTop: 5,
    color: COLORS.black,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedText: { color: COLORS.green, fontWeight: 'bold', fontSize: 14 },
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

export default BundleCardInfoSection;
