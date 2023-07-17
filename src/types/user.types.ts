export interface IUserData {
  fullName: string;
  email: string;
}

export interface IUserState {
  data?: IUserData | null;
  isLoading: boolean;
  error?: string | null;
  tempOtpToken?: string | null;
  loginRequired?: boolean;
}

export enum UserActionKind {
  SET_USER_LOADING = 'SET_USER_LOADING',
  SET_USER_DATA = 'SET_USER_DATA',
  SET_USER_ERROR = 'SET_USER_ERROR',
  SET_TEMP_OTP = 'SET_TEMP_OTP',
  SET_LOGIN_REQUIRED = 'SET_LOGIN_REQUIRED',
}

interface IUserLoadingAction {
  type: UserActionKind.SET_USER_LOADING;
}

interface IUserDataAction {
  type: UserActionKind.SET_USER_DATA;
  payload: IUserData;
}

interface IUserErrorAction {
  type: UserActionKind.SET_USER_ERROR;
  payload: string;
}

interface ITempOtpAction {
  type: UserActionKind.SET_TEMP_OTP;
  payload: string | null;
}

interface ISetLoginRequiredAction {
  type: UserActionKind.SET_LOGIN_REQUIRED;
  payload: boolean;
}

export type IUserAction =
  | IUserLoadingAction
  | IUserDataAction
  | IUserErrorAction
  | ITempOtpAction
  | ISetLoginRequiredAction;
