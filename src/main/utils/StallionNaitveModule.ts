import { NativeModules, Platform } from 'react-native';

import { IStallionMeta } from '../../types/meta.types';

const LINKING_ERROR =
  `The package 'react-native-stallion' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const StallionNativeModule = NativeModules.Stallion
  ? NativeModules.Stallion
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export default StallionNativeModule;

export const setApiKeyNative: (apiKey: string) => void =
  StallionNativeModule?.setApiKey;

type ICallback = (apiKey: string) => void;
export const getApiKeyNative: (cb: ICallback) => void =
  StallionNativeModule?.getApiKey;

type IMetaCallback = (newMeta: IStallionMeta) => void;
export const getStallionMeta: (cb: IMetaCallback) => void =
  StallionNativeModule?.getStallionMeta;

export const toggleStallionSwitchNative: (switchState: boolean) => void =
  StallionNativeModule?.toggleStallionSwitch;

interface IBundleInfo {
  bucketId: string;
  projectId: string;
  version: number;
}

export const downloadBundleNative: (bundleInfo: IBundleInfo) => Promise<any> =
  StallionNativeModule?.downloadPackage;
