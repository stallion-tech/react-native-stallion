import { useContext, useCallback } from 'react';

import { GlobalContext } from '../../main/state';
import { IUseStallionModal } from '../../types/utils.types';

const useStallionModal = (): IUseStallionModal => {
  const {
    actions: { setIsModalVisible },
  } = useContext(GlobalContext);
  const showModal = useCallback(() => {
    setIsModalVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    showModal,
  };
};

export default useStallionModal;
