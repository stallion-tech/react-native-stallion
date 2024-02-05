import StallionNativeModule, {
  STALLION_DISABLED_ERROR,
} from './StallionNativeModule';
import withStallionNoop from './noop/withStallion';
import useStallionModalNoop from './noop/useStallionModal';

import {
  IStallionConfig,
  IUseStallionModal,
  IWithStallion,
} from './types/utils.types';

let isEnabled: boolean = false;
let projectId: string = '';
let accessToken: string = '';

export let withStallion: IWithStallion;
export let useStallionModal: () => IUseStallionModal;

try {
  // TODO: revert below line
  const stallionConfigObj: IStallionConfig = require('../example/stallion.config.js'); // testing import
  // const stallionConfigObj: IStallionConfig = require('../../../stallion.config.js'); // prod import
  isEnabled = stallionConfigObj?.stallionEnabled || false;
  projectId = stallionConfigObj?.projectId || '';
  accessToken = stallionConfigObj?.accessToken || '';
} catch (_) {
  console.error(`
    Error in reading stallion.config.js file, falling back to noop version.
  `);
}
if (isEnabled && StallionNativeModule?.getApiKey) {
  withStallion = require('./main')?.default?.withStallion;
  useStallionModal = require('./main')?.default?.useStallionModal;
  const SharedDataManager =
    require('./main/utils/SharedDataManager')?.default?.getInstance();
  SharedDataManager?.setProjectId(projectId);
  SharedDataManager?.setAccessToken(accessToken);
} else {
  console.warn(STALLION_DISABLED_ERROR);
  withStallion = withStallionNoop;
  useStallionModal = useStallionModalNoop;
}
