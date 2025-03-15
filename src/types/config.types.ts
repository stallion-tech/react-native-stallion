export interface IStallionConfigJson {
  uid: string;
  projectId: string;
  appToken: string;
  sdkToken: string;
  appVersion: string;
}

export enum ConfigActionKind {
  SET_CONFIG = 'SET_CONFIG',
}

export interface ISetConfig {
  type: ConfigActionKind.SET_CONFIG;
  payload: IStallionConfigJson;
}

export type IConfigAction = ISetConfig;
