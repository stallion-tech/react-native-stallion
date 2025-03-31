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
        isLoading: true,
        error: null,
      };

    case UserActionKind.SET_USER_ERROR:
      const { payload: errorPayload } = action;
      return {
        ...state,
        isLoading: false,
        error: errorPayload,
      };
    default:
      return state;
  }
};

export default userReducer;
