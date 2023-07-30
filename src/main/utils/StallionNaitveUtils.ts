import StallionNativeModule from '../../StallionNativeModule';

import {
  TDownloadBundleNative,
  TGetApiKeyNative,
  TGetStallionMeta,
  TSetApiKeyNative,
  TToggleStallionSwitchNative,
} from 'src/types/utils.types';

export const setApiKeyNative: TSetApiKeyNative =
  StallionNativeModule?.setApiKey;

export const getApiKeyNative: TGetApiKeyNative =
  StallionNativeModule?.getApiKey;

export const getStallionMeta: TGetStallionMeta =
  StallionNativeModule?.getStallionMeta;

export const toggleStallionSwitchNative: TToggleStallionSwitchNative =
  StallionNativeModule?.toggleStallionSwitch;

export const downloadBundleNative: TDownloadBundleNative =
  StallionNativeModule?.downloadPackage;
