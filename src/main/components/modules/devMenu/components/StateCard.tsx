import React, { memo } from 'react';
import { Text, View } from 'react-native';

import ActionButton from './ActionButton';
import { RETRY_BUTTON_TEXT } from '../../../../constants/appConstants';

import styles from './styles';

interface IStateCard {
  title: string;
  subtitle?: string;
  onRetry?: () => void;
}

/**
 * Dashed placeholder card — the Production empty state from the handoff,
 * reused for empty and error states elsewhere in the menu.
 */
const StateCard: React.FC<IStateCard> = ({ title, subtitle, onRetry }) => (
  <View style={styles.stateCard}>
    <Text style={styles.stateTitle}>{title}</Text>
    {subtitle ? <Text style={styles.stateSubtitle}>{subtitle}</Text> : null}
    {onRetry ? (
      <ActionButton
        label={RETRY_BUTTON_TEXT}
        variant="outline"
        onPress={onRetry}
        style={styles.stateAction}
      />
    ) : null}
  </View>
);

export default memo(StateCard);
