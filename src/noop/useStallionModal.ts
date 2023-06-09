import { useCallback } from 'react';

interface IUseRStallionModal {
  setShowModal: (showModal: boolean) => void;
}

const useStallionModal = (): IUseRStallionModal => {
  const setShowModal = useCallback(() => {
    console.error('Error: Stallion is disabled');
  }, []);
  return {
    setShowModal,
  };
};

export default useStallionModal;
