import StallionNativeModule, {
  STALLION_DISABLED_ERROR,
} from './StallionNativeModule';

// noop imports
import withStallionNoop from './noop/withStallion';
import useStallionModalNoop from './noop/useStallionModal';

// main imports
import withStallionMain from './main/utils/withStallion';
import useStallionModalMain from './main/utils/useStallionModal';
import SharedDataManager from './main/utils/SharedDataManager';

import {
  IStallionConfig,
  IUseStallionModal,
  IWithStallion,
} from './types/utils.types';

let isEnabled: boolean = true;
let projectId: string = '';

export let withStallion: IWithStallion;
export let useStallionModal: () => IUseStallionModal;

try {
  // const stallionConfigObj: IStallionConfig = require('../example/stallion.config.js'); // testing import
  const stallionConfigObj: IStallionConfig = require('../../../stallion.config.js'); // prod import
  isEnabled = stallionConfigObj?.stallionEnabled || true;
  if (stallionConfigObj?.stallionEnabled === false) {
    isEnabled = false;
  }
  projectId = stallionConfigObj?.projectId || '';
} catch (_) {}
if (isEnabled && StallionNativeModule?.getUniqueId) {
  withStallion = withStallionMain;
  useStallionModal = useStallionModalMain;
  SharedDataManager.getInstance()?.setConfigProjectId(projectId);
} else {
  console.warn(STALLION_DISABLED_ERROR);
  withStallion = withStallionNoop;
  useStallionModal = useStallionModalNoop;
}
