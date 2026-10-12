import React, { memo, useCallback, useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  Text,
  TextLayoutEventData,
  View,
} from 'react-native';

import {
  READ_LESS_TEXT,
  READ_MORE_TEXT,
} from '../../../../constants/appConstants';
import { DS_BUTTON_HIT_SLOP } from '../../../../constants/designTokens';

import styles from './styles';

const CLAMP_LINES = 2;

interface IReleaseNote {
  text: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
  /** Prod bundle cards sit the note 6px under the title instead of 10px. */
  tight?: boolean;
}

/**
 * Release note clamped to two lines with an in-place "Read more" toggle. An
 * invisible unclamped copy is laid out once to learn whether the note actually
 * overflows — RN cannot report that from the clamped Text itself.
 */
const ReleaseNote: React.FC<IReleaseNote> = ({
  text,
  expanded,
  onToggleExpand,
  tight,
}) => {
  const [lineCount, setLineCount] = useState<number | null>(null);

  const handleMeasure = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      setLineCount(event.nativeEvent.lines.length);
    },
    []
  );

  const isOverflowing = (lineCount ?? 0) > CLAMP_LINES;
  const canToggle = isOverflowing && !!onToggleExpand;

  return (
    <View>
      <View style={[styles.noteWrapper, tight && styles.noteTight]}>
        <Text
          style={styles.note}
          numberOfLines={expanded ? undefined : CLAMP_LINES}
        >
          {text}
        </Text>
        {lineCount === null ? (
          <Text
            style={[styles.note, styles.noteMeasure]}
            onTextLayout={handleMeasure}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden={true}
          >
            {text}
          </Text>
        ) : null}
      </View>
      {canToggle ? (
        <Pressable
          accessibilityRole="button"
          onPress={onToggleExpand}
          hitSlop={DS_BUTTON_HIT_SLOP}
        >
          <Text style={styles.readMore}>
            {expanded ? READ_LESS_TEXT : READ_MORE_TEXT}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default memo(ReleaseNote);
