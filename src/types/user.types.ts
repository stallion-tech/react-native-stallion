export interface IUserState {
  isLoading: boolean;
  error?: string | null;
  sdkToken?: string | null;
}

export enum UserActionKind {
  SET_USER_LOADING = 'SET_USER_LOADING',
  SET_USER_DATA = 'SET_USER_DATA',
  SET_USER_ERROR = 'SET_USER_ERROR',
}

interface IUserLoadingAction {
  type: UserActionKind.SET_USER_LOADING;
}

interface IUserErrorAction {
  type: UserActionKind.SET_USER_ERROR;
  payload: string;
}

export type IUserAction = IUserLoadingAction | IUserErrorAction;
