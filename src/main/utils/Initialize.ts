import SharedDataManager from './SharedDataManager';
import { TInitialize } from '../../types/utils.types';

const Initialize: TInitialize = ({ projectId }) => {
  SharedDataManager.getInstance()?.setInitProjectId(projectId);
};

export default Initialize;
