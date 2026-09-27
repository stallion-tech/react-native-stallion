import React, { memo } from 'react';
import { Text } from 'react-native';

import styles from './styles';

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

export default memo(SectionLabel);
