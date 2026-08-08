import React, { memo, useCallback } from 'react';
import { Switch, Text, View } from 'react-native';

import { SWITCH_TEXTS, TAB_CAPTIONS } from '../../../../constants/appConstants';
import { DS_COLORS, DS_TOGGLE_TRACK } from '../../../../constants/designTokens';

import styles from './styles';

interface IModeToggle {
  isTesting: boolean;
  onChange: (isTesting: boolean) => void;
}

/**
 * Off is Testing (the default), on is Production — the toggle reads as
 * "am I shipping to users yet?".
 */
const ModeToggle: React.FC<IModeToggle> = ({ isTesting, onChange }) => {
  const handleValueChange = useCallback(
    (isProduction: boolean) => onChange(!isProduction),
    [onChange]
  );

  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextBlock}>
        <Text
          style={[
            styles.toggleLabel,
            !isTesting && styles.toggleLabelProduction,
          ]}
        >
          {isTesting ? SWITCH_TEXTS.ON : SWITCH_TEXTS.OFF}
        </Text>
        <Text
          style={[
            styles.toggleCaption,
            !isTesting && styles.toggleCaptionProduction,
          ]}
        >
          {isTesting ? TAB_CAPTIONS.STAGE : TAB_CAPTIONS.PROD}
        </Text>
      </View>
      <Switch
        accessibilityRole="switch"
        accessibilityLabel={SWITCH_TEXTS.OFF}
        accessibilityHint={isTesting ? TAB_CAPTIONS.STAGE : TAB_CAPTIONS.PROD}
        value={!isTesting}
        onValueChange={handleValueChange}
        trackColor={{ false: DS_TOGGLE_TRACK.off, true: DS_TOGGLE_TRACK.on }}
        thumbColor={DS_COLORS.white}
        ios_backgroundColor={DS_TOGGLE_TRACK.off}
      />
    </View>
  );
};

export default memo(ModeToggle);
