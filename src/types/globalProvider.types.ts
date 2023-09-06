import { IUserState } from './user.types';
import { IBucketState } from './bucket.types';
import { IStallionMeta } from './meta.types';
import { IBundleState } from './bundle.types';
import { IDownloadState } from './download.types';

export interface ILoginActionPayload {
  email: string;
  password: string;
}

export interface IVerifyOtpPayload {
  otp: string;
}

interface IGlobalContextActions {
  setIsModalVisible: (isModalVisible: boolean) => void;
  loginUser: (loginPayload: ILoginActionPayload) => void;
  verifyOtp: (verifyOtpPayload: IVerifyOtpPayload) => void;
  retryLogin: () => void;
  fetchBuckets: () => void;
  fetchBundles: (bucketId?: string | null) => void;
  setUserRequiresLogin: (requiresLogin: boolean) => void;
  refreshMeta: () => void;
  selectBucket: (bucketId?: string | null) => void;
  downloadBundle: (version: number, bucketId: string) => void;
  getUserProfile: () => void;
}

export interface IGlobalContext {
  isModalVisible: boolean;
  metaState: IStallionMeta;
  userState: IUserState;
  bucketState: IBucketState;
  bundleState: IBundleState;
  downloadState: IDownloadState;
  actions: IGlobalContextActions;
}
