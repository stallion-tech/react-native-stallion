import React from 'react';
import { View, Text, KeyboardAvoidingView } from 'react-native';

import Otp from './components/Otp';
import Email from './components/Email';

import {
  DEFAULT_ERROR_PREFIX,
  KEYBOARD_AVOIDING_BEHAVIOUR,
  Login_TITLE,
} from '../../../constants/appConstants';
import useLoginFlow from './hooks/useLoginFlow';
import styles from './styles';
import Spinner from '../../common/Spinner';

const Login: React.FC = () => {
  const {
    email,
    password,
    otp,
    handleEmailChange,
    handlePasswordChange,
    handleOtpChange,
    handleEmailSubmit,
    handleOtpSubmit,
    isOtpRequested,
    userApiError,
    userApiIsLoading,
    handleBack,
  } = useLoginFlow();
  return (
    <View style={styles.pageContainer}>
      <View style={[styles.logoContainer, styles.center]}>
        <Text style={styles.logoText}>{Login_TITLE}</Text>
      </View>
      <KeyboardAvoidingView
        behavior={KEYBOARD_AVOIDING_BEHAVIOUR}
        style={[styles.center, styles.inputSection]}
      >
        {isOtpRequested ? (
          <Otp
            otp={otp}
            email={email}
            handleOtpChange={handleOtpChange}
            handleSubmitClick={handleOtpSubmit}
            handleBack={handleBack}
            isEditable={!userApiIsLoading}
          />
        ) : (
          <Email
            email={email}
            password={password}
            isEditable={!userApiIsLoading}
            handleEmailChange={handleEmailChange}
            handlePasswordChange={handlePasswordChange}
            handleSubmitClick={handleEmailSubmit}
          />
        )}
        {userApiIsLoading ? (
          <View style={styles.spinnerContainer}>
            <Spinner />
          </View>
        ) : null}
        {userApiError ? (
          <Text style={styles.errorText}>
            {DEFAULT_ERROR_PREFIX}
            {userApiError}
          </Text>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
