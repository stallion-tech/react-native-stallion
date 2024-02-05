import { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';
import { IStallionMeta } from './meta.types';

interface IBundleInfo {
  bucketId: string;
  version: number;
  url: string;
}
type TCallback = (apiKey: string) => void;
type TMetaCallback = (newMeta: IStallionMeta) => void;

export type IWithStallion = (
  BaseComponent: React.ComponentType
) => React.ComponentType;

export interface IStallionConfig {
  stallionEnabled: boolean;
  projectId: string;
  accessToken: string;
}

export interface IUseStallionModal {
  showModal: () => void;
}

export type TextChangeEventType =
  NativeSyntheticEvent<TextInputChangeEventData>;

export type TSetApiKeyNative = (apiKey: string) => void;

export type TGetApiKeyNative = (cb: TCallback) => void;

export type TGetStallionMeta = (cb: TMetaCallback) => void;

export type TToggleStallionSwitchNative = (switchState: boolean) => void;

export type TDownloadBundleNative = (bundleInfo: IBundleInfo) => Promise<any>;
