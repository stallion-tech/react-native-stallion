import { SLOT_STATES } from '../../../types/meta.types';
import {
  IUpdateMeta,
  IUpdateMetaAction,
  UpdateMetaActionKind,
} from '../../../types/updateMeta.types';

export interface IUpdateMetaState {
  currentlyRunningBundle: IUpdateMeta | null;
  newBundle: IUpdateMeta | null;
  initialProdSlot: SLOT_STATES | null;
}

const updateMetaReducer = (
  state: IUpdateMetaState,
  action: IUpdateMetaAction
): IUpdateMetaState => {
  const { type } = action;
  switch (type) {
    case UpdateMetaActionKind.SET_CURRENTLY_RUNNING_META:
      const { payload: currentlyRunningPayload } = action;
      return {
        ...state,
        currentlyRunningBundle: currentlyRunningPayload,
      };

    case UpdateMetaActionKind.SET_NEW_BUNDLE_META:
      const { payload: newBundlePayload } = action;
      return {
        ...state,
        newBundle: newBundlePayload,
      };

    case UpdateMetaActionKind.SET_INIT_PROD_SLOT:
      const { payload: initProdSlot } = action;
      return {
        ...state,
        initialProdSlot: initProdSlot,
      };
    default:
      return state;
  }
};

export default updateMetaReducer;
