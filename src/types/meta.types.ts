export interface IStallionMeta {
  activeBucket?: string;
  activeVersion?: string;
  switchState?: boolean;
}

export enum MetaActionKind {
  SET_META = 'SET_META',
  GET_META = 'GET_META',
}

export interface ISetMeta {
  type: MetaActionKind.SET_META;
  payload: IStallionMeta;
}

export type IMetaAction = ISetMeta;
