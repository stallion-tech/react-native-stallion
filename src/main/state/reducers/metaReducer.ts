import {
  IMetaAction,
  IStallionMeta,
  MetaActionKind,
} from '../../../types/meta.types';

const metaReducer = (
  state: IStallionMeta,
  action: IMetaAction
): IStallionMeta => {
  const { type } = action;
  switch (type) {
    case MetaActionKind.SET_META:
      const { payload: setMetaPayload } = action;
      return setMetaPayload;

    default:
      return state;
  }
};

export default metaReducer;
