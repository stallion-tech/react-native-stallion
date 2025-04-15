import React, { useCallback, useContext, useMemo, memo } from 'react';
import { Text, View } from 'react-native';

import { GlobalContext } from '../../../../state';

import CardDescriptionContent from './CardDescriptionContent';
import { parseDateTime } from '../../../../utils/dateUtil';

import {
  APPLIED_TEXT,
  BUCKET_CARD_AUTHOR_TEXT,
  BUNDLE_CARD_LATEST,
  BUNDLE_CARD_PUBLISHED_ON,
  BUNDLE_CARD_RELEASE_NOTE,
  BUNDLE_CARD_SIZE,
  BUNDLE_TEXT,
  DOWNLOAD_BUTTON_TEXT,
  NO_RELEASE_NOTE_TEXT,
} from '../../../../constants/appConstants';

import styles from './styles';
import Chip, { ChipVariant } from '../../../../components/common/Chip';
import ButtonFullWidth from '../../../../components/common/ButtonFullWidth';
import { getDigitalStorageSize } from '../../../../utils/digitalStorageSizeUtil';

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
  size: number;
  index: number;
}

const BundleCardInfoSection: React.FC<IBundleCardInfoSection> = ({
  id,
  version,
  description,
  updatedAt,
  author,
  isApplied,
  downloadUrl,
  size,
  index,
}) => {
  const {
    bundleState: { selectedBucketId },
    actions: { downloadBundle },
  } = useContext(GlobalContext);

  const updatedAtText = useMemo(() => {
    return parseDateTime(updatedAt);
  }, [updatedAt]);

  const handleDownloadPress = useCallback(() => {
    if (!isApplied && selectedBucketId && version) {
      downloadBundle(downloadUrl, id);
    }
  }, [isApplied, selectedBucketId, version, downloadBundle, downloadUrl, id]);

  const bundleSize: string = useMemo(() => {
    return getDigitalStorageSize(size);
  }, [size]);

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Text style={[styles.titleText, styles.bold]}>
          {BUNDLE_TEXT} v{version}
        </Text>
        <View style={[styles.flexDirectionRow, styles.gap8]}>
          {index === 0 && (
            <Chip label={BUNDLE_CARD_LATEST} variant={ChipVariant.INFO} />
          )}
          {isApplied && (
            <Chip label={APPLIED_TEXT} variant={ChipVariant.SUCCESS} />
          )}
        </View>
      </View>
      <View style={styles.descContainer}>
        <Text style={styles.releaseNoteText}>{BUCKET_CARD_AUTHOR_TEXT}</Text>
        <Text
          numberOfLines={2}
          style={[styles.releaseNoteDescriptionText, styles.marginBottom8]}
        >
          {author}
        </Text>
        <Text style={styles.releaseNoteText}>{BUNDLE_CARD_RELEASE_NOTE}</Text>
        {description ? (
          <Text numberOfLines={2} style={styles.releaseNoteDescriptionText}>
            {description}
          </Text>
        ) : (
          <Text style={styles.releaseNoteDescriptionText}>
            {NO_RELEASE_NOTE_TEXT}
          </Text>
        )}
      </View>
      <View style={styles.bundleInfoContainer}>
        <CardDescriptionContent
          title={BUNDLE_CARD_PUBLISHED_ON}
          subtitle={updatedAtText}
        />
        <CardDescriptionContent
          title={BUNDLE_CARD_SIZE}
          subtitle={bundleSize}
        />
      </View>
      <View style={styles.buttonContainer}>
        <ButtonFullWidth
          buttonText={DOWNLOAD_BUTTON_TEXT}
          onPress={handleDownloadPress}
        />
      </View>
    </View>
  );
};

export default memo(BundleCardInfoSection);
