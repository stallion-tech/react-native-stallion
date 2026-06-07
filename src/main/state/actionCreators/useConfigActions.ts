import React, { useCallback, useEffect } from 'react';

import { getStallionConfigNative } from '../../utils/StallionNativeUtils';
import { clearApiBaseUrlCache } from '../../utils/getApiBaseUrl';

import { IConfigAction } from '../../../types/config.types';
import { setConfig } from '../actions/configActions';

const useConfigActions = (dispatch: React.Dispatch<IConfigAction>) => {
  const refreshConfig = useCallback(async () => {
    try {
      const stallionConfig = await getStallionConfigNative();
      dispatch(setConfig(stallionConfig));
      // Clear base URL cache when config is refreshed to pick up any baseUrl changes
      clearApiBaseUrlCache();
    } catch (_) {}
  }, [dispatch]);

  useEffect(() => {
    refreshConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    refreshConfig,
  };
};

export default useConfigActions;
