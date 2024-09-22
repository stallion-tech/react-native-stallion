import React, { useCallback, useContext, useMemo, memo } from 'react';
import { Text, View } from 'react-native';

import { GlobalContext } from '../../../../state';

import CardDescriptionContent from './CardDescriptionContent';
import { parseDateTime } from '../../../../utils/dateUtil';

import {
  APPLIED_TEXT,
  BUCKET_CARD_TEXTS,
  BUNDLE_APPLIED_TEXT,
  BUNDLE_CARD_AUTHOR,
  BUNDLE_CARD_RELEASE_NOTE,
  DOWNLOADED_TEXT,
  DOWNLOAD_BUTTON_TEXT,
  NO_RELEASE_NOTE_TEXT,
  SWITCH_STATE_KEYS,
} from '../../../../constants/appConstants';
import { COLORS } from '../../../../constants/colors';

import styles from './styles';

interface IBundleCardInfoSection {
  id: string;
  name: string;
  updatedAt: string;
  description?: string;
  version?: number;
  author?: string;
  isDownloaded?: boolean;
  isApplied?: boolean;
  downloadUrl: string;
}

const BundleCardInfoSection: React.FC<IBundleCardInfoSection> = ({
  id,
  version,
  description,
  updatedAt,
  author,
  isApplied,
  isDownloaded,
  downloadUrl,
}) => {
  const {
    metaState,
    bundleState: { selectedBucketId },
    actions: { downloadBundle },
  } = useContext(GlobalContext);

  const stateColor = useMemo(() => {
    if ((isApplied || isDownloaded) && !metaState.switchState)
      return COLORS.orange;
    if ((isApplied || isDownloaded) && metaState.switchState)
      return COLORS.green;
    return COLORS.blue;
  }, [isApplied, metaState.switchState, isDownloaded]);

  const updatedAtText = useMemo(() => {
    return parseDateTime(updatedAt);
  }, [updatedAt]);

  const handleDownloadPress = useCallback(() => {
    if (!isApplied && selectedBucketId && version) {
      downloadBundle(downloadUrl, id);
    }
  }, [isApplied, selectedBucketId, version, downloadBundle, downloadUrl, id]);

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Text style={[styles.titleText, styles.bold]}>v{version}</Text>
        <Text
          onPress={handleDownloadPress}
          style={[styles.appliedText, { color: stateColor }]}
        >
          {isApplied
            ? APPLIED_TEXT
            : isDownloaded
            ? DOWNLOADED_TEXT
            : DOWNLOAD_BUTTON_TEXT}
        </Text>
      </View>
      {description ? (
        <>
          <Text style={styles.releaseNoteText}>{BUNDLE_CARD_RELEASE_NOTE}</Text>
          <Text style={styles.releaseNoteDescriptionText}>{description}</Text>
        </>
      ) : (
        <Text style={styles.releaseNoteText}>{NO_RELEASE_NOTE_TEXT}</Text>
      )}
      <View style={styles.divider} />
      <View style={styles.rowContainer}>
        <CardDescriptionContent
          title={BUNDLE_CARD_AUTHOR}
          subtitle={author ?? ''}
        />
        <CardDescriptionContent
          title={BUNDLE_APPLIED_TEXT}
          subtitle={
            isApplied && metaState?.switchState
              ? SWITCH_STATE_KEYS.Enabled
              : SWITCH_STATE_KEYS.Disabled
          }
        />
        <CardDescriptionContent
          title={BUCKET_CARD_TEXTS.UPDATED}
          subtitle={updatedAtText}
        />
      </View>
    </View>
  );
};

export default memo(BundleCardInfoSection);
