import React, { useCallback, useEffect } from 'react';

import { getStallionMeta } from '../../utils/StallionNaitveUtils';
import { setMeta } from '../actions/metaActions';

import { IMetaAction } from '../../../types/meta.types';

const useMetaActions = (dispatch: React.Dispatch<IMetaAction>) => {
  const refreshMeta = useCallback(() => {
    getStallionMeta((meta) => {
      dispatch(setMeta(meta));
    });
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
