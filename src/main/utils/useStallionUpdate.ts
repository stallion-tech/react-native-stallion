import { useContext, useMemo, useRef, useEffect } from 'react';

import { GlobalContext } from '../state';
import { IUseStallionUpdate } from '../../types/utils.types';
import { SLOT_STATES } from 'src/types/meta.types';

export const useStallionUpdate = (): IUseStallionUpdate => {
  const { metaState } = useContext(GlobalContext);
  const initialProdSlot = useRef<SLOT_STATES>();
  useEffect(() => {
    if (metaState.prodSlot.currentSlot && !initialProdSlot.current) {
      initialProdSlot.current = metaState.prodSlot.currentSlot;
    }
  }, [metaState.prodSlot.currentSlot]);

  const isRestartRequired = useMemo<boolean>(() => {
    const newReleaseInTemp = metaState.prodSlot.temp ? true : false;
    const slotHasChanged =
      metaState.prodSlot.currentSlot !== initialProdSlot.current;
    return newReleaseInTemp || slotHasChanged;
  }, [metaState.prodSlot]);

  const currentlyRunning = useMemo<string>(() => {
    switch (initialProdSlot.current) {
      case SLOT_STATES.DEFAULT:
        return 'default';
      case SLOT_STATES.NEW:
        return metaState.prodSlot.new || '';
      case SLOT_STATES.STABLE:
        return metaState.prodSlot.stable || '';
      case SLOT_STATES.TEMP:
        return metaState.prodSlot.temp || '';
      default:
        return '';
    }
  }, [metaState.prodSlot]);

  return {
    isRestartRequired,
    currentlyRunning,
  };
};
