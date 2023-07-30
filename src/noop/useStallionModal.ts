import { useCallback } from 'react';

import { STALLION_DISABLED_ERROR } from '../StallionNativeModule';
import { IUseStallionModal } from '../types/utils.types';

const useStallionModal = (): IUseStallionModal => {
  const showModal = useCallback(() => {
    console.error(STALLION_DISABLED_ERROR);
  }, []);
  return {
    showModal,
  };
};

export default useStallionModal;
