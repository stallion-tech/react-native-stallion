import {
  IConfigAction,
  IStallionConfigJson,
  ConfigActionKind,
} from '../../../types/config.types';

export const setConfig = (newConfig: IStallionConfigJson): IConfigAction => {
  return {
    type: ConfigActionKind.SET_CONFIG,
    payload: newConfig,
  };
};
