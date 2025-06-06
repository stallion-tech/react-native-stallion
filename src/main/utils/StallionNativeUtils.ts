import StallionNativeModule from '../../StallionNativeModule';

import {
  TDownloadBundleNative,
  TSetSdkTokenNative,
  TGetStallionMetaNative,
  TToggleStallionSwitchNative,
  TOnLaunchBundleNative,
  TGetStallionConfigNative,
} from 'src/types/utils.types';

export const setSdkTokenNative: TSetSdkTokenNative =
  StallionNativeModule?.updateSdkToken;

export const getStallionMetaNative: TGetStallionMetaNative = () => {
  return new Promise((resolve, reject) => {
    StallionNativeModule?.getStallionMeta()
      .then((metaString: string) => {
        try {
          resolve(JSON.parse(metaString));
        } catch (_) {
          reject('invalid meta string');
        }
      })
      .catch(() => {
        reject('failed to fetch meta string');
      });
  });
};

export const getStallionConfigNative: TGetStallionConfigNative = () => {
  return new Promise((resolve, reject) => {
    StallionNativeModule?.getStallionConfig()
      .then((configString: string) => {
        try {
          resolve(JSON.parse(configString));
        } catch (_) {
          reject('invalid config string');
        }
      })
      .catch(() => {
        reject('failed to fetch config string');
      });
  });
};

export const toggleStallionSwitchNative: TToggleStallionSwitchNative =
  StallionNativeModule?.toggleStallionSwitch;

export const downloadBundleNative: TDownloadBundleNative =
  StallionNativeModule?.downloadStageBundle;

export const onLaunchNative: TOnLaunchBundleNative =
  StallionNativeModule?.onLaunch;

export const sync: () => void = StallionNativeModule?.sync;

export const popEventsNative: () => Promise<string> =
  StallionNativeModule?.popEvents;

export const acknowledgeEventsNative: (eventIds: string) => Promise<string> =
  StallionNativeModule?.acknowledgeEvents;

export const restart = () => {
  StallionNativeModule?.restart?.();
};
