import {
  IUserAction,
  IUserData,
  UserActionKind,
} from '../../../types/user.types';

export const setUserLoading = (): IUserAction => {
  return {
    type: UserActionKind.SET_USER_LOADING,
  };
};

export const setUserData = (userData: IUserData): IUserAction => {
  return {
    type: UserActionKind.SET_USER_DATA,
    payload: userData,
  };
};

export const setUserError = (userErrorString: string): IUserAction => {
  return {
    type: UserActionKind.SET_USER_ERROR,
    payload: userErrorString,
  };
};

export const setTempOtp = (tempOtp: string | null): IUserAction => {
  return {
    type: UserActionKind.SET_TEMP_OTP,
    payload: tempOtp,
  };
};

export const setRequiresLogin = (requiresLogin: boolean): IUserAction => {
  return {
    type: UserActionKind.SET_LOGIN_REQUIRED,
    payload: requiresLogin,
  };
};
