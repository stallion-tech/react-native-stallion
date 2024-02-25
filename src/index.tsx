import StallionNativeModule, {
  STALLION_DISABLED_ERROR,
} from './StallionNativeModule';
import withStallionNoop from './noop/withStallion';
import useStallionModalNoop from './noop/useStallionModal';
import InitializeNoop from './noop/Initialize';

import {
  IStallionConfig,
  IUseStallionModal,
  IWithStallion,
  TInitialize,
} from './types/utils.types';

let isEnabled: boolean = true;
let projectId: string = '';

export let withStallion: IWithStallion;
export let useStallionModal: () => IUseStallionModal;
export let Initialize: TInitialize;

try {
  // const stallionConfigObj: IStallionConfig = require('../example/stallion.config.js'); // testing import
  const stallionConfigObj: IStallionConfig = require('../../../stallion.config.js'); // prod import
  isEnabled = stallionConfigObj?.stallionEnabled || false;
  if (stallionConfigObj?.stallionEnabled === false) {
    isEnabled = false;
  }
  projectId = stallionConfigObj?.projectId || '';
} catch (_) {
  console.error(`
    Error in reading stallion.config.js file, falling back to noop version.
  `);
}
if (isEnabled && StallionNativeModule?.getApiKey) {
  withStallion = require('./main')?.default?.withStallion;
  useStallionModal = require('./main')?.default?.useStallionModal;
  Initialize = require('./main')?.default?.Initialize;
  const SharedDataManager =
    require('./main/utils/SharedDataManager')?.default?.getInstance();
  SharedDataManager?.setConfigProjectId(projectId);
} else {
  console.warn(STALLION_DISABLED_ERROR);
  withStallion = withStallionNoop;
  useStallionModal = useStallionModalNoop;
  Initialize = InitializeNoop;
}
