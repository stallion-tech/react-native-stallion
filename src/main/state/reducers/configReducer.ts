import {
  IStallionConfigJson,
  IConfigAction,
  ConfigActionKind,
} from '../../../types/config.types';

const configReducer = (
  state: IStallionConfigJson,
  action: IConfigAction
): IStallionConfigJson => {
  const { type } = action;
  switch (type) {
    case ConfigActionKind.SET_CONFIG:
      const { payload: setConfigPayload } = action;
      return { ...setConfigPayload };
    default:
      return state;
  }
};

export default configReducer;
