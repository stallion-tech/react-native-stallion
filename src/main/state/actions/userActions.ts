import { IUserAction, UserActionKind } from '../../../types/user.types';

export const setUserLoading = (): IUserAction => {
  return {
    type: UserActionKind.SET_USER_LOADING,
  };
};

export const setUserError = (userErrorString: string): IUserAction => {
  return {
    type: UserActionKind.SET_USER_ERROR,
    payload: userErrorString,
  };
};

export const setSdkToken = (sdkToken?: string | null): IUserAction => {
  return {
    type: UserActionKind.SET_SDK_TOKEN,
    payload: sdkToken,
  };
};
