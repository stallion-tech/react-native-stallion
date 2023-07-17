import SharedDataManager from './SharedDataManager';

export const getApiHeaders = () => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-access-token': SharedDataManager.getInstance()?.getAccessToken() || '',
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
