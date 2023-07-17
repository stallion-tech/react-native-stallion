import React, { useCallback } from 'react';

import SharedDataManager from '@main/utils/SharedDataManager';

import { DEFAULT_ERROR_MESSAGE } from '@main/constants/appConstants';
import { extractError } from '@main/utils/errorUtil';
import {
  setRequiresLogin,
  setTempOtp,
  setUserData,
  setUserError,
} from '@main/state/actions/userActions';
import { getApiHeaders } from '@main/utils/apiUtils';
import { setUserLoading } from '@main/state/actions/userActions';

import { API_BASE_URL, API_PATHS } from '@main/constants/apiConstants';
import { IUserAction, IUserData, IUserState } from '@stallionTypes/user.types';
import {
  ILoginActionPayload,
  IVerifyOtpPayload,
} from '@stallionTypes/globalProvider.types';
import { setApiKeyNative } from '@main/utils/StallionNaitveModule';

const useUserActions = (
  dispatch: React.Dispatch<IUserAction>,
  userState: IUserState
) => {
  const dataManager = SharedDataManager.getInstance();
  const loginUser = useCallback(
    (loginPayload: ILoginActionPayload) => {
      dispatch(setUserLoading());
      fetch(API_BASE_URL + API_PATHS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          ...loginPayload,
          projectId: dataManager?.getProjectId(),
        }),
        headers: getApiHeaders(),
      })
        .then((res) => res.json())
        .then((loginResponse) => {
          const otpToken = loginResponse?.data?.otpToken as string;
          if (otpToken) {
            dispatch(setTempOtp(otpToken));
          } else {
            dispatch(setUserError(extractError(loginResponse)));
          }
        })
        .catch((_) => {
          dispatch(setUserError(DEFAULT_ERROR_MESSAGE));
        });
    },
    [dispatch, dataManager]
  );

  const verifyOtp = useCallback(
    (verifyOtpPayload: IVerifyOtpPayload) => {
      dispatch(setUserLoading());
      fetch(API_BASE_URL + API_PATHS.VERIFY_OTP, {
        method: 'POST',
        body: JSON.stringify({
          ...verifyOtpPayload,
          otpToken: userState.tempOtpToken,
        }),
        headers: getApiHeaders(),
      })
        .then((res) => res.json())
        .then((otpResponse) => {
          const accessToken: string = otpResponse?.data?.accessToken;
          if (accessToken) {
            dataManager?.setAccessToken(accessToken);
            setApiKeyNative(accessToken);
            dispatch(
              setUserData({
                fullName: otpResponse?.data?.user?.fullName,
                email: otpResponse?.data?.user?.email,
              })
            );
            dispatch(setRequiresLogin(false));
          } else {
            dispatch(setUserError(extractError(otpResponse)));
          }
        })
        .catch((_) => {
          dispatch(setUserError(DEFAULT_ERROR_MESSAGE));
        });
    },
    [dispatch, userState.tempOtpToken, dataManager]
  );

  const retryLogin = useCallback(() => {
    dispatch(setTempOtp(null));
  }, [dispatch]);

  const setUserRequiresLogin = useCallback(
    (requiresLogin: boolean) => {
      dispatch(setUserData({} as IUserData));
      dispatch(setRequiresLogin(requiresLogin));
    },
    [dispatch]
  );

  return {
    loginUser,
    verifyOtp,
    retryLogin,
    setUserRequiresLogin,
  };
};

export default useUserActions;
