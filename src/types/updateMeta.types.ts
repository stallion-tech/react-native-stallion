export interface IUpdateMeta {
  version: number;
  author: string;
  bucketId: string;
  sha256Checksum: string;
  releaseNote: string;
  size: number;
  platform: string;
  isCIUploaded: boolean;
  isPromoted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export enum UpdateMetaActionKind {
  SET_CURRENTLY_RUNNING_META = 'SET_CURRENTLY_RUNNING_META',
  SET_NEW_BUNDLE_META = 'SET_NEW_BUNDLE_META',
  SET_SLOT_CHANGED = 'SET_SLOT_CHANGED',
}

interface ISetRunningUpdateMeta {
  type: UpdateMetaActionKind.SET_CURRENTLY_RUNNING_META;
  payload: IUpdateMeta | null;
}

interface ISetNewUpdateMeta {
  type: UpdateMetaActionKind.SET_NEW_BUNDLE_META;
  payload: IUpdateMeta | null;
}

export interface ISetSlotChanged {
  type: UpdateMetaActionKind.SET_SLOT_CHANGED;
  payload: boolean | null;
}

export type IUpdateMetaAction =
  | ISetRunningUpdateMeta
  | ISetNewUpdateMeta
  | ISetSlotChanged;
