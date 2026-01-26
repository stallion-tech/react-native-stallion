import { SLOT_STATES } from '../../types/meta.types';
import {getStallionMetaNative} from './StallionNativeUtils';

const getCurrentBundle = async (): Promise<string | null> => {
    const stallionMeta = await getStallionMetaNative();
    switch(stallionMeta.prodSlot.currentSlot) {
      case SLOT_STATES.NEW:
        return stallionMeta.prodSlot.newHash || null;
      case SLOT_STATES.STABLE:
        return stallionMeta.prodSlot.stableHash || null;
      default:
        return null;
    }
};

export default getCurrentBundle;