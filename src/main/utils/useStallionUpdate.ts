import { useContext, useMemo, useState, useEffect } from 'react';

import { GlobalContext } from '../state';
import { IUseStallionUpdate } from '../../types/utils.types';
import { SLOT_STATES } from '../../types/meta.types';

export const useStallionUpdate = (): IUseStallionUpdate => {
  const { metaState } = useContext(GlobalContext);
  const [initialProdSlot, setInitialProdSlot] = useState<SLOT_STATES>();
  useEffect(() => {
    if (metaState?.prodSlot?.currentSlot && !initialProdSlot) {
      setInitialProdSlot(metaState?.prodSlot?.currentSlot);
    }
  }, [metaState?.prodSlot?.currentSlot, initialProdSlot]);

  const isRestartRequired = useMemo<boolean>(() => {
    const newReleaseInTemp = metaState?.prodSlot?.temp ? true : false;
    const slotHasChanged =
      Boolean(initialProdSlot) &&
      metaState?.prodSlot?.currentSlot !== initialProdSlot;
    return newReleaseInTemp || slotHasChanged;
  }, [metaState.prodSlot, initialProdSlot]);

  const currentlyRunning = useMemo<string>(() => {
    switch (initialProdSlot) {
      case SLOT_STATES.DEFAULT:
        return 'default';
      case SLOT_STATES.NEW:
        return metaState?.prodSlot?.new || '';
      case SLOT_STATES.STABLE:
        return metaState?.prodSlot?.stable || '';
      case SLOT_STATES.TEMP:
        return metaState?.prodSlot?.temp || '';
      default:
        return '';
    }
  }, [metaState.prodSlot, initialProdSlot]);

  return {
    isRestartRequired,
    currentlyRunning,
  };
};
