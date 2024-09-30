import { useContext, useCallback } from 'react';

import { GlobalContext } from '../../main/state';
import { IUseStallionModal } from '../../types/utils.types';

const useStallionModal = (): IUseStallionModal => {
  const {
    actions: { setIsModalVisible, refreshMeta },
  } = useContext(GlobalContext);
  const showModal = useCallback(() => {
    setIsModalVisible(true);
    refreshMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    showModal,
  };
};

export default useStallionModal;
