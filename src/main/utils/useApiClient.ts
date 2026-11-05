import { useCallback } from 'react';
import { API_PATHS } from '../constants/apiConstants';
import { IStallionConfigJson } from '../../types/config.types';
import { parseTokenRegion, regionalApiBaseUrl } from './parseTokenRegion';

type IAuthHandler = (loginRequired: boolean) => void;

export const useApiClient = (
  configState: IStallionConfigJson,
  authHandler?: IAuthHandler
) => {
  const getData = useCallback(
    (apiPath: API_PATHS, apiBody: object): Promise<any> => {
      const baseUrl =
        configState.baseUrl ||
        regionalApiBaseUrl(parseTokenRegion(configState.appToken));
      const dataRequest = fetch(baseUrl + apiPath, {
        method: 'POST',
        body: JSON.stringify(apiBody),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-app-token': configState.appToken || '',
          'x-sdk-pin-access-token': configState.sdkToken || '',
        },
      });
      if (authHandler) {
        return dataRequest.then((res) => {
          if (res.status === 401) {
            authHandler(true);
          }
          return res.json();
        });
      } else return dataRequest.then((res) => res.json());
    },
    [configState, authHandler]
  );
  return {
    getData,
  };
};
