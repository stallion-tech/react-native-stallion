import React, { useCallback, useEffect } from 'react';

import { getStallionMetaNative } from '../../utils/StallionNativeUtils';
import { setMeta } from '../actions/metaActions';

import { IMetaAction } from '../../../types/meta.types';

const useMetaActions = (dispatch: React.Dispatch<IMetaAction>) => {
  const refreshMeta = useCallback(async () => {
    try {
      const stallionMeta = await getStallionMetaNative();
      console.log(stallionMeta, 'stallionMeta');
      dispatch(setMeta(stallionMeta));
    } catch (_) {}
  }, [dispatch]);

  useEffect(() => {
    refreshMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    refreshMeta,
  };
};

export default useMetaActions;
