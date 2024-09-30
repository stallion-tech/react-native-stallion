import SharedDataManager from './SharedDataManager';

export const getApiHeaders = () => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-sdk-access-token':
      SharedDataManager.getInstance()?.getAccessToken() || '',
  };
};

export const getAppHeaders = () => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-app-token': SharedDataManager.getInstance()?.getAppToken() || '',
  };
};

export const apiAuthMiddleware = (
  res: Response,
  setUserRequiresLogin: (requiresLogin: boolean) => void
) => {
  if (res.status === 401) {
    setUserRequiresLogin(true);
  }
  return res.json();
};
