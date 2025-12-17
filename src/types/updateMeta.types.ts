import { SLOT_STATES } from './meta.types';

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
  isMandatory: boolean;
}

export enum UpdateMetaActionKind {
  SET_CURRENTLY_RUNNING_META = 'SET_CURRENTLY_RUNNING_META',
  SET_NEW_BUNDLE_META = 'SET_NEW_BUNDLE_META',
  SET_INIT_PROD_SLOT = 'SET_INIT_PROD_SLOT',
  SET_PENDING_RELEASE_HASH = 'SET_PENDING_RELEASE_HASH',
}

interface ISetRunningUpdateMeta {
  type: UpdateMetaActionKind.SET_CURRENTLY_RUNNING_META;
  payload: IUpdateMeta | null;
}

interface ISetNewUpdateMeta {
  type: UpdateMetaActionKind.SET_NEW_BUNDLE_META;
  payload: IUpdateMeta | null;
}

export interface ISetInitProdSlot {
  type: UpdateMetaActionKind.SET_INIT_PROD_SLOT;
  payload: SLOT_STATES;
}

export interface ISetPendingReleaseHash {
  type: UpdateMetaActionKind.SET_PENDING_RELEASE_HASH;
  payload: string;
}

export type IUpdateMetaAction =
  | ISetRunningUpdateMeta
  | ISetNewUpdateMeta
  | ISetInitProdSlot
  | ISetPendingReleaseHash;
