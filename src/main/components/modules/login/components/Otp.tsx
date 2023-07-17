import React, { memo, useCallback } from 'react';
import {
  TextInput,
  View,
  Text,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from 'react-native';

import ButtonFullWidth from '@main/components/common/ButtonFullWidth';
import {
  OTP_BACK_BUTTON_TEXT,
  OTP_INPUT_KEY,
  OTP_LENGTH,
  SUBMIT_BUTTON_TEXT,
} from '@main/constants/appConstants';

import styles from './styles';

interface IOtp {
  email?: string;
  otp?: string;
  isEditable: boolean;
  handleOtpChange: (newOtp: string) => void;
  handleSubmitClick: () => void;
  handleBack: () => void;
}

const Otp: React.FC<IOtp> = ({
  email,
  otp,
  isEditable,
  handleOtpChange,
  handleSubmitClick,
  handleBack,
}) => {
  const handleNumberFormating = useCallback(
    (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      const text = e.nativeEvent.text;
      handleOtpChange(text.replace(/[^0-9]/g, ''));
    },
    [handleOtpChange]
  );
  return (
    <>
      <Text>Otp is sent to {email}</Text>
      <TextInput
        style={styles.textInp}
        placeholder={OTP_INPUT_KEY}
        value={otp}
        onChange={handleNumberFormating}
        maxLength={OTP_LENGTH}
        keyboardType={'numeric'}
      />
      <View style={styles.buttonContainer}>
        <ButtonFullWidth
          onPress={handleSubmitClick}
          buttonText={SUBMIT_BUTTON_TEXT}
          enabled={isEditable && otp?.length === OTP_LENGTH}
        />
      </View>
      <View style={styles.buttonContainer}>
        <ButtonFullWidth
          primary={false}
          onPress={handleBack}
          buttonText={OTP_BACK_BUTTON_TEXT}
        />
      </View>
    </>
  );
};

export default memo(Otp);
