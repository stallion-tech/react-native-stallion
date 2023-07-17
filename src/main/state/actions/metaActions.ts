import {
  IMetaAction,
  IStallionMeta,
  MetaActionKind,
} from '@stallionTypes/meta.types';

export const setMeta = (newMeta: IStallionMeta): IMetaAction => {
  return {
    type: MetaActionKind.SET_META,
    payload: newMeta,
  };
};
