import {
  IUserAction,
  IUserState,
  UserActionKind,
} from '../../../types/user.types';

const userReducer = (state: IUserState, action: IUserAction): IUserState => {
  const { type } = action;
  switch (type) {
    case UserActionKind.SET_USER_LOADING:
      return {
        ...state,
        data: null,
        isLoading: true,
        error: null,
      };

    case UserActionKind.SET_USER_DATA:
      const { payload: dataPayload } = action;
      return {
        ...state,
        data: dataPayload,
        isLoading: false,
        error: null,
      };

    case UserActionKind.SET_USER_ERROR:
      const { payload: errorPayload } = action;
      return {
        ...state,
        data: null,
        isLoading: false,
        error: errorPayload,
      };

    case UserActionKind.SET_TEMP_OTP:
      const { payload: tempOtpPayload } = action;
      return {
        ...state,
        tempOtpToken: tempOtpPayload,
        isLoading: false,
        error: null,
      };

    case UserActionKind.SET_LOGIN_REQUIRED:
      const { payload: loginRequired } = action;
      if (loginRequired) {
        return {
          data: null,
          tempOtpToken: null,
          loginRequired,
          isLoading: false,
          error: null,
        };
      } else {
        return {
          ...state,
          loginRequired: false,
          isLoading: false,
          error: null,
          tempOtpToken: null,
        };
      }
    default:
      return state;
  }
};

export default userReducer;
