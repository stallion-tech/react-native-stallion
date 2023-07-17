import { IUseStallionModal } from '../types/utils.types';
import { useCallback } from 'react';

const useStallionModal = (): IUseStallionModal => {
  const showModal = useCallback(() => {
    console.error('Error: Stallion is disabled');
  }, []);
  return {
    showModal,
  };
};

export default useStallionModal;
