import { useContext } from 'react';
import StallionNativeModule from '../StallionNaitveModule';
import { IStallionMeta, StallionContext } from '../state/StallionController';

export interface IAuthTokens {
  apiKey: string;
  secretKey: string;
}

export const getAuthTokens = (): Promise<any> => {
  return new Promise((res) => {
    StallionNativeModule?.getAuthTokens((authTokens: IAuthTokens) => {
      res(authTokens as IAuthTokens);
    });
  });
};

interface IBundleInfo {
  bucketId: string;
  version?: number;
}

export const getStallionMeta = (): Promise<any> => {
  return new Promise((res) => {
    StallionNativeModule?.getStallionMeta((bundleMeta: any) => {
      res(bundleMeta as IStallionMeta);
    });
  });
};

export const downloadBundle: (bundleInfo: IBundleInfo) => Promise<any> =
  StallionNativeModule?.downloadPackage;

export const toggleStallionSwitch = (stallionBundleIsOn: boolean): void => {
  StallionNativeModule?.toggleStallionSwitch(stallionBundleIsOn);
};

interface IUseStallionModal {
  setShowModal: (showModal: boolean) => void;
}

export const useStallionModal = (): IUseStallionModal => {
  const { setShowModal } = useContext(StallionContext);
  return {
    setShowModal,
  };
};
