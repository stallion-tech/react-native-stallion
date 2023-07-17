import { useContext, useState, useCallback, useMemo } from 'react';
import {
  NativeSyntheticEvent,
  TextInputChangeEventData,
  Keyboard,
} from 'react-native';

import { GlobalContext } from '../../../../state';
import { TextChangeEventType } from '../../../../../types/utils.types';

interface IUseLoginFlow {
  email?: string;
  password?: string;
  otp?: string;
  handleEmailChange: (emailChangeEvet: TextChangeEventType) => void;
  handlePasswordChange: (passwordChangeEvet: TextChangeEventType) => void;
  handleOtpChange: (newOtp: string) => void;
  isOtpRequested: boolean;
  handleEmailSubmit: () => void;
  handleOtpSubmit: () => void;
  handleBack: () => void;
  userApiError?: string | null;
  userApiIsLoading?: boolean;
}

const useLoginFlow = (): IUseLoginFlow => {
  const {
    userState,
    actions: { loginUser, verifyOtp, retryLogin },
  } = useContext(GlobalContext);
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [otp, setOtp] = useState<string>();

  const handleEmailChange = useCallback(
    (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      setEmail(e.nativeEvent.text);
    },
    [setEmail]
  );
  const handlePasswordChange = useCallback(
    (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      setPassword(e.nativeEvent.text);
    },
    [setPassword]
  );
  const handleOtpChange = useCallback(
    (newOtp: string) => {
      setOtp(newOtp);
    },
    [setOtp]
  );
  const handleEmailSubmit = useCallback(() => {
    Keyboard.dismiss();
    email &&
      password &&
      loginUser({
        email,
        password,
      });
  }, [loginUser, email, password]);
  const handleOtpSubmit = useCallback(() => {
    Keyboard.dismiss();
    otp &&
      verifyOtp({
        otp,
      });
  }, [verifyOtp, otp]);
  const handleBack = useCallback(() => {
    retryLogin();
  }, [retryLogin]);
  const isOtpRequested = useMemo<boolean>(
    () => (userState?.tempOtpToken ? true : false),
    [userState?.tempOtpToken]
  );
  const userApiError = useMemo<string | undefined | null>(
    () => userState?.error,
    [userState?.error]
  );
  const userApiIsLoading = useMemo<boolean>(
    () => userState?.isLoading,
    [userState?.isLoading]
  );
  return {
    email,
    password,
    otp,
    handleEmailChange,
    handlePasswordChange,
    handleOtpChange,
    isOtpRequested,
    handleEmailSubmit,
    userApiError,
    userApiIsLoading,
    handleOtpSubmit,
    handleBack,
  };
};

export default useLoginFlow;
