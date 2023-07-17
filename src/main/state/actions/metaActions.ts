import {
  IMetaAction,
  IStallionMeta,
  MetaActionKind,
} from '../../../types/meta.types';

export const setMeta = (newMeta: IStallionMeta): IMetaAction => {
  return {
    type: MetaActionKind.SET_META,
    payload: newMeta,
  };
};
