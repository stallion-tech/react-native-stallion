import React, { memo } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

import { DS_BUTTON_HIT_SLOP } from '../../../../constants/designTokens';

import styles from './styles';

export type TButtonVariant = 'primary' | 'success' | 'outline';

interface IActionButton {
  label: string;
  variant: TButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /**
   * 0–1. When set, the button doubles as its own progress bar: a tinted fill
   * grows left to right behind the label. Designed for the `outline` variant,
   * whose pale track is what makes the fill readable.
   */
  progress?: number;
}

const ActionButton: React.FC<IActionButton> = ({
  label,
  variant,
  onPress,
  disabled,
  style,
  progress,
}) => {
  const isOutline = variant === 'outline';
  const hasProgress = progress !== undefined;
  const clampedProgress = Math.min(Math.max(progress || 0, 0), 1);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={DS_BUTTON_HIT_SLOP}
      style={({ pressed }) => [
        styles.button,
        isOutline ? styles.buttonOutline : styles.buttonFilled,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'success' && styles.buttonSuccess,
        pressed && variant === 'primary' && styles.buttonPrimaryPressed,
        pressed && variant === 'success' && styles.buttonSuccessPressed,
        pressed && isOutline && styles.buttonOutlinePressed,
        // A filling button reads as busy on its own; dimming it as well only
        // makes the fill harder to see.
        disabled && !hasProgress && styles.buttonDisabled,
        hasProgress && styles.buttonProgressTrack,
        style,
      ]}
    >
      {hasProgress ? (
        <View
          pointerEvents="none"
          style={[
            styles.buttonProgressFill,
            { width: `${clampedProgress * 100}%` },
          ]}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          isOutline ? styles.buttonTextOutline : styles.buttonTextFilled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default memo(ActionButton);
