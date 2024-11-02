import StallionNativeModule, {
  STALLION_DISABLED_ERROR,
} from './StallionNativeModule';

// noop imports
import withStallionNoop from './noop/withStallion';
import useStallionModalNoop from './noop/useStallionModal';

// main imports
import withStallionMain from './main/utils/withStallion';
import useStallionModalMain from './main/utils/useStallionModal';

import { IUseStallionModal, IWithStallion } from './types/utils.types';
import { stallionEventEmitter } from './main/utils/StallionEventEmitter';

export let withStallion: IWithStallion;
export let useStallionModal: () => IUseStallionModal;

if (StallionNativeModule?.getUniqueId) {
  withStallion = withStallionMain;
  useStallionModal = useStallionModalMain;
} else {
  console.warn(STALLION_DISABLED_ERROR);
  withStallion = withStallionNoop;
  useStallionModal = useStallionModalNoop;
}

export { sync } from './main/utils/StallionNativeUtils';
export { useStallionUpdate } from './main/utils/useStallionUpdate';
export const addEventListener =
  stallionEventEmitter.addEventListener.bind(stallionEventEmitter);
