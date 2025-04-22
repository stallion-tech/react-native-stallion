import { useContext } from 'react';

import { GlobalContext } from '../state';
import { IUseStallionUpdate } from '../../types/utils.types';
import { SWITCH_STATES } from '../../types/meta.types';

export const useStallionUpdate = (): IUseStallionUpdate => {
  const { updateMetaState, metaState } = useContext(GlobalContext);
  return {
    isRestartRequired:
      metaState.switchState === SWITCH_STATES.PROD &&
      updateMetaState?.newBundle?.id
        ? true
        : false,
    currentlyRunningBundle: updateMetaState?.currentlyRunningBundle,
    newReleaseBundle: updateMetaState?.newBundle,
  };
};
