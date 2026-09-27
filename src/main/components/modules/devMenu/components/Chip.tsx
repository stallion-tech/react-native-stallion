import React, { memo } from 'react';
import { Text, View } from 'react-native';

import styles from './styles';

export type TChipTone = 'indigo' | 'green';

interface IChip {
  label: string;
  tone: TChipTone;
}

const Chip: React.FC<IChip> = ({ label, tone }) => (
  <View
    style={[
      styles.chip,
      tone === 'green' ? styles.chipGreen : styles.chipIndigo,
    ]}
  >
    <Text
      style={[
        styles.chipText,
        tone === 'green' ? styles.chipTextGreen : styles.chipTextIndigo,
      ]}
    >
      {label}
    </Text>
  </View>
);

export default memo(Chip);
