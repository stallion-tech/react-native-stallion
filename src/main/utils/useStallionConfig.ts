import { useContext } from 'react';
import { GlobalContext } from '../state';

const useStallionConfig = () => {
  const {
    actions: { refreshConfig },
  } = useContext(GlobalContext);
  return {
    updateStallionConfig: refreshConfig,
  };
};

export default useStallionConfig;
