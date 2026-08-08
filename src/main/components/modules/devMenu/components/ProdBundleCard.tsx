import React, { memo } from 'react';
import { Text, View } from 'react-native';

import ActionButton from './ActionButton';
import Chip from './Chip';
import ReleaseNote from './ReleaseNote';

import {
  BUNDLE_META_STATES,
  BUNDLE_VERSION_PREFIX,
  CHIP_TEXTS,
  META_SEPARATOR,
  RESTART_BUTTON_TEXT,
} from '../../../../constants/appConstants';
import { IUpdateMeta } from '../../../../../types/updateMeta.types';
import { parseDateTime } from '../../../../utils/dateUtil';
import { getDigitalStorageSize } from '../../../../utils/getSize';

import styles from './styles';

const CHECKSUM_DISPLAY_LENGTH = 12;

interface IProdBundleCard {
  meta: IUpdateMeta;
  /** `pending` is downloaded and waiting on a restart; `active` is running. */
  variant: 'pending' | 'active';
  expanded: boolean;
  onToggleExpand: () => void;
  onRestart?: () => void;
}

const ProdBundleCard: React.FC<IProdBundleCard> = ({
  meta,
  variant,
  expanded,
  onToggleExpand,
  onRestart,
}) => {
  const isPending = variant === 'pending';

  const metaLine = [
    meta.sha256Checksum?.substring(0, CHECKSUM_DISPLAY_LENGTH),
    parseDateTime(meta.updatedAt),
    meta.size ? getDigitalStorageSize(meta.size) : null,
    isPending
      ? BUNDLE_META_STATES.APPLIES_ON_RESTART
      : BUNDLE_META_STATES.APPLIED,
  ]
    .filter(Boolean)
    .join(META_SEPARATOR);

  return (
    <View
      style={[
        styles.card,
        styles.cardPaddedEven,
        isPending && styles.cardHighlightGreen,
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, styles.cardTitleLarge]}>
            {`${BUNDLE_VERSION_PREFIX}${meta.version}`}
          </Text>
          <Chip
            label={isPending ? CHIP_TEXTS.DOWNLOADED : CHIP_TEXTS.APPLIED}
            tone={isPending ? 'green' : 'indigo'}
          />
        </View>
        {isPending ? (
          <ActionButton
            label={RESTART_BUTTON_TEXT}
            variant="success"
            onPress={onRestart}
          />
        ) : null}
      </View>
      {meta.releaseNote ? (
        <ReleaseNote
          text={meta.releaseNote}
          expanded={expanded}
          onToggleExpand={onToggleExpand}
          tight={true}
        />
      ) : null}
      <Text style={styles.cardMeta}>{metaLine}</Text>
    </View>
  );
};

export default memo(ProdBundleCard);
