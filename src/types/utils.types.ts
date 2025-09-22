import { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';
import { IUpdateMeta } from './updateMeta.types';
import { IStallionMeta, SWITCH_STATES } from './meta.types';
import { IStallionConfigJson } from './config.types';

interface IBundleInfo {
  url: string;
  hash: string;
}

export interface IStallionInitParams {
  autoRollbackConfig: {
    maxRetries: number;
  };
}

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

export type TSetSdkTokenNative = (sdkToken: string) => Promise<string>;

export type TGetStallionMetaNative = () => Promise<IStallionMeta>;

export type TGetStallionConfigNative = () => Promise<IStallionConfigJson>;

export type TToggleStallionSwitchNative = (
  switchState: SWITCH_STATES
) => Promise<string>;

export type TDownloadBundleNative = (
  bundleInfo: IBundleInfo
) => Promise<string>;

export type TOnLaunchBundleNative = (stallionInitParams: string) => void;

export interface IUseStallionUpdate {
  isRestartRequired: boolean;
  currentlyRunningBundle: IUpdateMeta | null;
  newReleaseBundle: IUpdateMeta | null;
}
