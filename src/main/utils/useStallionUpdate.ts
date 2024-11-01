import { useContext } from 'react';

import { GlobalContext } from '../state';
import { IUseStallionUpdate } from '../../types/utils.types';

export const useStallionUpdate = (): IUseStallionUpdate => {
  const { updateMetaState } = useContext(GlobalContext);
  return {
    isRestartRequired: updateMetaState.slotHasChanged ? true : false,
    currentlyRunningBundle: updateMetaState.currentlyRunningBundle,
    newReleaseBundle: updateMetaState.newBundle,
  };
};
