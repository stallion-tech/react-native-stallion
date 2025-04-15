import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, View } from 'react-native';

import styles from './styles';

interface IButtonFullWidth {
  buttonText: string;
  primary?: boolean;
  enabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  progress?: number;
  isLoading?: boolean;
}

const ButtonFullWidth: React.FC<IButtonFullWidth> = ({
  buttonText,
  primary = true,
  onPress,
  enabled = true,
  style,
  progress,
  isLoading = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.buttonContainer,
        primary ? styles.primaryButton : styles.transparentButton,
        enabled ? null : styles.disabled,
        style,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          width: isLoading ? `${progress * 100}%` : '100%',
        },
      ]}
      onPress={onPress}
      disabled={!enabled}
    >
      <View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            zIndex: 1,
            opacity: 0.3, // Add some transparency to the fill
          },
          {
            width: `${progress * 100}%`,
            backgroundColor: 'red'
          },
        ]}
      />
      <Text
        style={[
          styles.buttonText,
          primary ? styles.primaryText : styles.secondaryText,
        ]}
      >
        {buttonText}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(ButtonFullWidth);
