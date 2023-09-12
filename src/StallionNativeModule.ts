import { NativeModules } from 'react-native';

export const STALLION_DISABLED_ERROR =
  'Stallion is disabled or not linked correctly, falling back to noop version. See https://docs.stalliontech.io/docs/production-deployment';

const StallionNativeModule = NativeModules.Stallion;

export default StallionNativeModule;
