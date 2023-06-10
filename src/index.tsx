type IWithStallion = (
  BaseComponent: React.ComponentType
) => React.ComponentType;
interface IUseStallionModal {
  setShowModal: (showModal: boolean) => void;
}

interface IStallionConfig {
  isEnabled: boolean;
}

const STALLION_CONFIG_PATH = '../example/stallion.config.json'; // DEV MODE
// const STALLION_CONFIG_PATH = '../../../../stallion.config.json'; // PROD MODE
let withStallion: IWithStallion;
let useStallionModal: () => IUseStallionModal;
let StallionConfig: IStallionConfig;
let isEnabled: boolean = false;

try {
  StallionConfig = require(STALLION_CONFIG_PATH);
  console.log(StallionConfig, ': StallionConfig file read');
  if (StallionConfig?.isEnabled) {
    isEnabled = true;
  }
} catch (_) {
  console.log(_);
  console.error('Error in loading StallionConfig file');
  isEnabled = false;
}

if (isEnabled) {
  withStallion = require('./core/withStallion')?.default;
  useStallionModal = require('./core/utils/nativeUtil')?.useStallionModal;
} else {
  withStallion = require('./noop/withStallion')?.default;
  useStallionModal = require('./noop/useStallionModal')?.default;
}

export { withStallion, useStallionModal };
