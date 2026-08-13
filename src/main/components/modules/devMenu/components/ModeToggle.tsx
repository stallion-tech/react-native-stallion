import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { SWITCH_TEXTS, TAB_CAPTIONS } from '../../../../constants/appConstants';
import { DS_TOGGLE } from '../../../../constants/designTokens';

import styles from './styles';

interface IModeToggle {
  isTesting: boolean;
  onChange: (isTesting: boolean) => void;
}

const THUMB_TRAVEL = DS_TOGGLE.width - DS_TOGGLE.thumb - DS_TOGGLE.inset * 2;

/**
 * Off is Production (the default), on is Testing — green means the
 * staging switch is engaged.
 */
const ModeToggle: React.FC<IModeToggle> = ({ isTesting, onChange }) => {
  const thumbX = useRef(
    new Animated.Value(isTesting ? THUMB_TRAVEL : 0)
  ).current;

  useEffect(() => {
    Animated.spring(thumbX, {
      toValue: isTesting ? THUMB_TRAVEL : 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 20,
    }).start();
  }, [isTesting, thumbX]);

  const handlePress = useCallback(
    () => onChange(!isTesting),
    [isTesting, onChange]
  );

  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextBlock}>
        <Text style={styles.toggleLabel}>
          {isTesting ? SWITCH_TEXTS.ON : SWITCH_TEXTS.OFF}
        </Text>
        <Text style={styles.toggleCaption}>
          {isTesting ? TAB_CAPTIONS.STAGE : TAB_CAPTIONS.PROD}
        </Text>
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={isTesting ? SWITCH_TEXTS.ON : SWITCH_TEXTS.OFF}
        accessibilityHint={isTesting ? TAB_CAPTIONS.STAGE : TAB_CAPTIONS.PROD}
        accessibilityState={{ checked: isTesting }}
        onPress={handlePress}
        hitSlop={8}
        style={[
          styles.toggleTrack,
          isTesting ? styles.toggleTrackOn : styles.toggleTrackOff,
        ]}
      >
        <Animated.View
          style={[styles.toggleThumb, { transform: [{ translateX: thumbX }] }]}
        />
      </Pressable>
    </View>
  );
};

export default memo(ModeToggle);
