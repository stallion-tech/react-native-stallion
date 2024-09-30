import StallionNativeModule from '../../StallionNativeModule';

import {
  TDownloadBundleNative,
  TSetApiKeyNative,
  TToggleStallionSwitchNative,
  TOnLaunchBundleNative,
} from 'src/types/utils.types';
import { NATIVE_CONSTANTS } from '../constants/appConstants';
import {
  IStallionMeta,
  SLOT_STATES,
  SWITCH_STATES,
} from '../../types/meta.types';

export const setApiKeyNative: TSetApiKeyNative = (apiKey: String) => {
  StallionNativeModule?.setStorage(NATIVE_CONSTANTS.SDK_TOKEN, apiKey);
};

export const getApiKeyNative = async (): Promise<string> => {
  return await getStorageNative(NATIVE_CONSTANTS.SDK_TOKEN);
};

export const getAppTokenNative = async (): Promise<string> => {
  return await getStorageNative(NATIVE_CONSTANTS.APP_TOKEN);
};

export const getStorageNative = (key: string): Promise<string> => {
  return new Promise((res) => {
    StallionNativeModule?.getStorage(key, (value: string) => {
      res(value);
    });
  });
};

export const getStallionMetaNative = async (): Promise<IStallionMeta> => {
  return {
    switchState: (await getStorageNative(
      NATIVE_CONSTANTS.SWITCH_STATE_INDENTIFIER
    )) as SWITCH_STATES,
    stageSlot: {
      currentSlot: (await getStorageNative(
        NATIVE_CONSTANTS.CURRENT_STAGE_SLOT_KEY
      )) as unknown as SLOT_STATES,
      new: await getStorageNative(
        NATIVE_CONSTANTS.STAGE_DIRECTORY + NATIVE_CONSTANTS.NEW_FOLDER_SLOT
      ),
      temp: await getStorageNative(
        NATIVE_CONSTANTS.STAGE_DIRECTORY + NATIVE_CONSTANTS.TEMP_FOLDER_SLOT
      ),
    },
    prodSlot: {
      currentSlot: (await getStorageNative(
        NATIVE_CONSTANTS.CURRENT_PROD_SLOT_KEY
      )) as unknown as SLOT_STATES,
      new: await getStorageNative(
        NATIVE_CONSTANTS.PROD_DIRECTORY + NATIVE_CONSTANTS.NEW_FOLDER_SLOT
      ),
      stable: await getStorageNative(
        NATIVE_CONSTANTS.PROD_DIRECTORY + NATIVE_CONSTANTS.STABLE_FOLDER_SLOT
      ),
      temp: await getStorageNative(
        NATIVE_CONSTANTS.PROD_DIRECTORY + NATIVE_CONSTANTS.TEMP_FOLDER_SLOT
      ),
    },
  };
};

export const toggleStallionSwitchNative: TToggleStallionSwitchNative = (
  newSwitchState
) => {
  StallionNativeModule?.setStorage(
    NATIVE_CONSTANTS.SWITCH_STATE_INDENTIFIER,
    newSwitchState
  );
};

export const downloadBundleNative: TDownloadBundleNative =
  StallionNativeModule?.downloadPackage;

export const onLaunchNative: TOnLaunchBundleNative =
  StallionNativeModule?.onLaunch;

export const getUidNative = async (): Promise<string> => {
  return new Promise((resolve) => {
    StallionNativeModule?.getUniqueId((uid: string) => {
      resolve(uid);
    });
  });
};
