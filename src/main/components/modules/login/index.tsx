import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from 'react-native';

import {
  KEYBOARD_AVOIDING_BEHAVIOUR,
  Login_TITLE,
  PIN_LENGTH,
  PIN_INPUT_KEY,
  SUBMIT_BUTTON_TEXT,
} from '../../../constants/appConstants';
import styles from './styles';
import Spinner from '../../common/Spinner';
import { COLORS } from '../../../constants/colors';
import ButtonFullWidth from '../../common/ButtonFullWidth';
import { GlobalContext } from '../../../../main/state';

const Login: React.FC = () => {
  const {
    userState,
    actions: { loginUser },
  } = useContext(GlobalContext);

  const [pin, setPin] = useState<string>('');
  const handleNumberFormating = useCallback(
    (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      try {
        const text = e.nativeEvent.text;
        setPin(text.replace(/[^0-9]/g, ''));
      } catch (_) {}
    },
    [setPin]
  );

  const handleSubmitClick = useCallback(() => {
    if (pin.length === PIN_LENGTH) {
      loginUser({
        pin,
      });
    }
  }, [loginUser, pin]);
  return (
    <View style={styles.pageContainer}>
      <View style={[styles.logoContainer]}>
        <Text style={styles.logoText}>{Login_TITLE}</Text>
      </View>
      <KeyboardAvoidingView
        behavior={KEYBOARD_AVOIDING_BEHAVIOUR}
        style={[styles.center, styles.inputSection]}
      >
        <TextInput
          style={styles.textInp}
          placeholder={PIN_INPUT_KEY}
          placeholderTextColor={COLORS.black5}
          value={pin}
          onChange={handleNumberFormating}
          maxLength={PIN_LENGTH}
          keyboardType={'numeric'}
        />
      </KeyboardAvoidingView>
      <View style={styles.buttonContainer}>
        <ButtonFullWidth
          onPress={handleSubmitClick}
          buttonText={SUBMIT_BUTTON_TEXT}
          enabled={!userState.isLoading && pin?.length === PIN_LENGTH}
        />
      </View>
      {userState.isLoading ? <Spinner /> : null}
      {userState.error ? (
        <Text style={styles.errorText}>{userState.error}</Text>
      ) : null}
    </View>
  );
};

export default Login;
