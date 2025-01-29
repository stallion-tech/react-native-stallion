import React, { useCallback, useEffect } from 'react';

import { getStallionConfigNative } from '../../utils/StallionNativeUtils';

import { IConfigAction } from '../../../types/config.types';
import { setConfig } from '../actions/configActions';

const useConfigActions = (dispatch: React.Dispatch<IConfigAction>) => {
  const refreshConfig = useCallback(async () => {
    try {
      const stallionConfig = await getStallionConfigNative();
      console.log('stallionConfig', stallionConfig);
      dispatch(setConfig(stallionConfig));
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
