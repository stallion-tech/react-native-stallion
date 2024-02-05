import SharedDataManager from './SharedDataManager';

export const getApiHeaders = () => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-project-access-token':
      SharedDataManager.getInstance()?.getAccessToken() || '',
  };
};
