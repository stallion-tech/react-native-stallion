import React, { useCallback } from 'react';

import { DEFAULT_ERROR_MESSAGE } from '../../constants/appConstants';
import { extractError } from '../../utils/errorUtil';
import { setSdkToken, setUserError } from '../../state/actions/userActions';
import { setUserLoading } from '../../state/actions/userActions';
import { useApiClient } from '../../utils/useApiClient';

import { API_PATHS } from '../../constants/apiConstants';
import { IUserAction } from '../../../types/user.types';
import { ILoginActionPayload } from '../../../types/globalProvider.types';
import { setSdkTokenNative } from '../../utils/StallionNativeUtils';

import { IStallionConfigJson } from '../../../types/config.types';

const useUserActions = (
  dispatch: React.Dispatch<IUserAction>,
  refreshConfig: () => Promise<void>,
  configState: IStallionConfigJson
) => {
  const { getData } = useApiClient(configState);
  const clearUserLogin = (shouldClearLogin: boolean) => {
    if (shouldClearLogin) {
      dispatch(setSdkToken(null));
    }
  };

  const loginUser = useCallback(
    (loginPayload: ILoginActionPayload) => {
      dispatch(setUserLoading());
      getData(API_PATHS.LOGIN, {
        ...loginPayload,
        projectId: configState.projectId,
      })
        .then((loginResponse) => {
          const sdkToken = loginResponse?.data?.token as string;
          if (sdkToken) {
            setSdkTokenNative(sdkToken).then(() => {
              refreshConfig();
              dispatch(setSdkToken(sdkToken));
            });
          } else {
            dispatch(setUserError(extractError(loginResponse)));
          }
        })
        .catch((_) => {
          dispatch(setUserError(DEFAULT_ERROR_MESSAGE));
        });
    },
    [dispatch, configState, getData, refreshConfig]
  );

  return {
    loginUser,
    clearUserLogin,
  };
};

export default useUserActions;
