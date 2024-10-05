import { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';

interface IBundleInfo {
  url: string;
  hash: string;
}
type TCallback = (apiKey: string) => void;

export interface IStallionInitParams {}

export type IWithStallion = (
  BaseComponent: React.ComponentType,
  initPrams?: IStallionInitParams
) => React.ComponentType;

export interface IStallionConfig {
  stallionEnabled: boolean;
  projectId: string;
}

export interface IUseStallionModal {
  showModal: () => void;
}

export type TextChangeEventType =
  NativeSyntheticEvent<TextInputChangeEventData>;

export type TSetApiKeyNative = (apiKey: string) => void;

export type TGetApiKeyNative = (cb: TCallback) => void;

export type TToggleStallionSwitchNative = (switchState: string) => void;

export type TDownloadBundleNative = (bundleInfo: IBundleInfo) => Promise<any>;

export type TOnLaunchBundleNative = (launchMessage: string) => void;
