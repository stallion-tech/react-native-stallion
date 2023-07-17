import React, { memo } from 'react';
import { TouchableOpacity, Text } from 'react-native';

import styles from './styles';

interface IButtonFullWidth {
  buttonText: string;
  primary?: boolean;
  enabled?: boolean;
  onPress: () => void;
}

const ButtonFullWidth: React.FC<IButtonFullWidth> = ({
  buttonText,
  primary = true,
  onPress,
  enabled = true,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.buttonContainer,
        primary ? styles.primaryButton : styles.transparentButton,
        enabled ? null : styles.disabled,
      ]}
      onPress={onPress}
      disabled={!enabled}
    >
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
