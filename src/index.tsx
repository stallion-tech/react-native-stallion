import {
  IStallionConfig,
  IUseStallionModal,
  IWithStallion,
} from '@stallionTypes/utils.types';
class Stallion {
  withStallion: IWithStallion;
  useStallionModal: () => IUseStallionModal;
  constructor(stallionConfig: IStallionConfig) {
    if (stallionConfig.isEnabled === true) {
      this.withStallion = require('./main')?.default?.withStallion;
      this.useStallionModal = require('./main')?.default?.useStallionModal;
      const SharedDataManager =
        require('./main/utils/SharedDataManager')?.default?.getInstance();
      SharedDataManager?.setProjectId(stallionConfig.projectId);
    } else {
      console.warn('Stallion is disabled, falling back to noop versions');
      this.withStallion = require('./noop/withStallion')?.default;
      this.useStallionModal = require('./noop/useStallionModal')?.default;
    }
  }
}

export default Stallion;
