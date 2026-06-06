import { useCallback, useState, useEffect } from 'react';
import { getApiBaseUrl, DEFAULT_API_BASE_URL } from './getApiBaseUrl';
import { API_PATHS } from '../constants/apiConstants';
import { IStallionConfigJson } from '../../types/config.types';

type IAuthHandler = (loginRequired: boolean) => void;

export const useApiClient = (
  configState: IStallionConfigJson,
  authHandler?: IAuthHandler
) => {
  const [baseUrl, setBaseUrl] = useState<string>(DEFAULT_API_BASE_URL);

  // Load base URL on mount
  useEffect(() => {
    getApiBaseUrl().then(setBaseUrl);
  }, []);

  const getData = useCallback(
    (apiPath: API_PATHS, apiBody: object): Promise<any> => {
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
    [baseUrl, configState, authHandler]
  );
  return {
    getData,
  };
};
