import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import styles from './styles';
import ButtonFullWidth from '../../../../common/ButtonFullWidth';
import Chip from '../../../../common/Chip';
import {
  BUCKET_CARD_TEXTS,
  BUNDLE_CARD_PUBLISHED_ON,
  BUNDLE_CARD_RELEASE_NOTE,
  BUNDLE_CARD_SIZE,
  NOT_APPLICABLE_TEXT,
  NO_RELEASE_NOTE_TEXT,
} from '../../../../../constants/appConstants';
import CardDescriptionContent from '../../../listing/components/CardDescriptionContent';
import { parseDateTime } from '../../../../../utils/dateUtil';
import { getDigitalStorageSize } from '../../../../../utils/digitalStorageSizeUtil';

interface IBundleCard {
  title?: string;
  isApplied?: boolean;
  description?: string;
  version?: number | string;
  author?: string;
  updatedAt?: string;
  size?: number;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryButtonPress?: () => void;
  onSecondaryButtonPress?: () => void;
  isLoading?: boolean;
  progress?: number;
  showEmptyState?: boolean;
}

const BundleCard: React.FC<IBundleCard> = ({
  description,
  updatedAt,
  title,
  size,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryButtonPress,
  onSecondaryButtonPress,
  isLoading = false,
  progress = 0,
  showEmptyState = false,
  version,
}) => {
  console.log('primaryButtonText', primaryButtonText, onPrimaryButtonPress);
  const updatedAtText = useMemo(() => {
    if (updatedAt) {
      return parseDateTime(updatedAt);
    }
    return NOT_APPLICABLE_TEXT;
  }, [updatedAt]);

  const sizeText = useMemo(() => {
    if (size) {
      return getDigitalStorageSize(size);
    }
    return NOT_APPLICABLE_TEXT;
  }, [size]);

  return (
    <View style={styles.mainContainer}>
      {showEmptyState ? (
        <EmptyState
          primaryButtonText={primaryButtonText}
          onPrimaryButtonPress={onPrimaryButtonPress}
        />
      ) : null}
      {!showEmptyState && (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
            {/* <Chip label="Applied" variant="info" /> */}
            <Chip label="Downloaded" variant="success" />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.releaseNoteText}>
              {BUCKET_CARD_TEXTS.VERSION}
            </Text>
            {version && (
              <Text
                numberOfLines={2}
                style={[
                  styles.releaseNoteDescriptionText,
                  styles.marginBottom8,
                ]}
              >
                v{version}
              </Text>
            )}
            <Text style={styles.releaseNoteText}>
              {BUNDLE_CARD_RELEASE_NOTE}
            </Text>
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
          {updatedAt || size ? (
            <View style={styles.bundleInfoContainer}>
              {updatedAt && (
                <CardDescriptionContent
                  title={BUNDLE_CARD_PUBLISHED_ON}
                  subtitle={updatedAtText}
                />
              )}
              {size && (
                <CardDescriptionContent
                  title={BUNDLE_CARD_SIZE}
                  subtitle={sizeText}
                />
              )}
            </View>
          ) : null}
          {secondaryButtonText || primaryButtonText ? (
            <View style={styles.buttonContainer}>
              {secondaryButtonText && onSecondaryButtonPress && (
                <ButtonFullWidth
                  buttonText={secondaryButtonText}
                  onPress={onSecondaryButtonPress}
                  primary={false}
                  enabled={true}
                />
              )}
              {primaryButtonText && onPrimaryButtonPress && (
                <ButtonFullWidth
                  buttonText={primaryButtonText}
                  onPress={onPrimaryButtonPress}
                  primary={true}
                  enabled={true}
                  isLoading={isLoading}
                  progress={progress}
                />
              )}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

const EmptyState = ({
  primaryButtonText,
  onPrimaryButtonPress,
}: {
  primaryButtonText: string;
  onPrimaryButtonPress: () => void;
}) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>No Bundle Available</Text>
      <ButtonFullWidth
        buttonText={primaryButtonText}
        onPress={onPrimaryButtonPress}
        enabled={true}
      />
    </View>
  );
};

export default BundleCard;
