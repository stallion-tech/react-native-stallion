import React, { memo, useCallback } from 'react';
import { Text, View } from 'react-native';

import ActionButton, { TButtonVariant } from './ActionButton';
import Chip, { TChipTone } from './Chip';
import ReleaseNote from './ReleaseNote';

import {
  BUNDLE_META_STATES,
  BUNDLE_VERSION_PREFIX,
  CHIP_TEXTS,
  DOWNLOAD_BUTTON_TEXT,
  META_SEPARATOR,
  RESTART_BUTTON_TEXT,
} from '../../../../constants/appConstants';
import { BUNDLE_STATUS } from '../../../../../types/bundle.types';
import { parseDateTime } from '../../../../utils/dateUtil';
import { getDigitalStorageSize } from '../../../../utils/getSize';

import styles from './styles';

export interface IBundleHistoryCard {
  id: string;
  version: number;
  releaseNote?: string;
  author?: string;
  updatedAt: string;
  /** Bundle size in bytes; omitted when the API does not report it. */
  size?: number;
  isLatest: boolean;
  status: BUNDLE_STATUS;
  /** 0–1, only meaningful while status is `downloading`. */
  progress: number;
  expanded: boolean;
  onToggleExpand: (bundleId: string) => void;
  onDownload: (bundleId: string) => void;
  onRestart: () => void;
}

const META_STATE_BY_STATUS: Record<BUNDLE_STATUS, BUNDLE_META_STATES> = {
  [BUNDLE_STATUS.AVAILABLE]: BUNDLE_META_STATES.NOT_APPLIED,
  [BUNDLE_STATUS.DOWNLOADING]: BUNDLE_META_STATES.NOT_APPLIED,
  [BUNDLE_STATUS.DOWNLOADED]: BUNDLE_META_STATES.APPLIES_ON_RESTART,
  [BUNDLE_STATUS.ACTIVE]: BUNDLE_META_STATES.APPLIED,
};

const getChip = (
  status: BUNDLE_STATUS,
  isLatest: boolean
): { label: string; tone: TChipTone } | null => {
  if (status === BUNDLE_STATUS.DOWNLOADED)
    return { label: CHIP_TEXTS.DOWNLOADED, tone: 'green' };
  if (status === BUNDLE_STATUS.ACTIVE)
    return { label: CHIP_TEXTS.APPLIED, tone: 'indigo' };
  if (isLatest) return { label: CHIP_TEXTS.LATEST, tone: 'indigo' };
  return null;
};

const BundleHistoryCard: React.FC<IBundleHistoryCard> = ({
  id,
  version,
  releaseNote,
  author,
  updatedAt,
  size,
  isLatest,
  status,
  progress,
  expanded,
  onToggleExpand,
  onDownload,
  onRestart,
}) => {
  const handleToggleExpand = useCallback(
    () => onToggleExpand(id),
    [onToggleExpand, id]
  );
  const handleDownload = useCallback(() => onDownload(id), [onDownload, id]);

  const chip = getChip(status, isLatest);
  // Latest and applied bundles are the ones the design highlights in indigo;
  // a bundle waiting on a restart takes the green treatment instead.
  const isGreen = status === BUNDLE_STATUS.DOWNLOADED;
  const isIndigo = !isGreen && (isLatest || status === BUNDLE_STATUS.ACTIVE);

  const meta = [
    author,
    parseDateTime(updatedAt),
    size ? getDigitalStorageSize(size) : null,
    META_STATE_BY_STATUS[status],
  ]
    .filter(Boolean)
    .join(META_SEPARATOR);

  const buttonVariant: TButtonVariant = isLatest ? 'primary' : 'outline';

  return (
    <View
      style={[
        styles.card,
        isIndigo && styles.cardHighlightIndigo,
        isGreen && styles.cardHighlightGreen,
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.cardTitleRow}>
          <Text
            style={styles.cardTitle}
          >{`${BUNDLE_VERSION_PREFIX}${version}`}</Text>
          {chip ? <Chip label={chip.label} tone={chip.tone} /> : null}
        </View>
        {status === BUNDLE_STATUS.DOWNLOADED ? (
          <ActionButton
            label={RESTART_BUTTON_TEXT}
            variant="success"
            onPress={onRestart}
          />
        ) : status === BUNDLE_STATUS.DOWNLOADING ? (
          <ActionButton
            label={`${Math.round(progress * 100)}%`}
            // The outline track is what the fill reads against, so a
            // downloading bundle drops the primary treatment until it lands.
            variant="outline"
            disabled={true}
            progress={progress}
            style={styles.buttonProgress}
          />
        ) : status === BUNDLE_STATUS.AVAILABLE ? (
          <ActionButton
            label={DOWNLOAD_BUTTON_TEXT}
            variant={buttonVariant}
            onPress={handleDownload}
          />
        ) : null}
      </View>
      {releaseNote ? (
        <ReleaseNote
          text={releaseNote}
          expanded={expanded}
          onToggleExpand={handleToggleExpand}
        />
      ) : null}
      <Text style={styles.cardMeta}>{meta}</Text>
    </View>
  );
};

export default memo(BundleHistoryCard);
