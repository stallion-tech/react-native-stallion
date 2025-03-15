import { IUserState } from './user.types';
import { IBucketState } from './bucket.types';
import { IStallionMeta } from './meta.types';
import { IBundleState } from './bundle.types';
import { IDownloadState } from './download.types';
import { IUpdateMetaState } from '../main/state/reducers/updateMetaReducer';
import { IStallionConfigJson } from './config.types';

export interface ILoginActionPayload {
  pin: string;
}

interface IGlobalContextActions {
  setIsModalVisible: (isModalVisible: boolean) => void;
  loginUser: (loginPayload: ILoginActionPayload) => void;
  fetchBuckets: () => void;
  fetchBundles: (bucketId?: string | null, pageOffset?: string | null) => void;
  clearUserLogin: (shouldClear: boolean) => void;
  refreshMeta: () => void;
  refreshConfig: () => void;
  selectBucket: (bucketId?: string | null) => void;
  downloadBundle: (url: string, hash: string) => void;
  setProgress: (newProgress: number) => void;
  setDownloadErrorMessage: (msg: string) => void;
}

export interface IGlobalContext {
  isModalVisible: boolean;
  metaState: IStallionMeta;
  userState: IUserState;
  bucketState: IBucketState;
  bundleState: IBundleState;
  downloadState: IDownloadState;
  updateMetaState: IUpdateMetaState;
  configState: IStallionConfigJson;
  actions: IGlobalContextActions;
}
