import { SLOT_STATES } from '../../types/meta.types';
import { getStallionMetaNative } from './StallionNativeUtils';

// Cache the initial slot state
let cachedInitialSlot: SLOT_STATES | null = null;

const getCurrentBundle = async (): Promise<string | null> => {
  const stallionMeta = await getStallionMetaNative();

  // Cache the initial slot state on first call
  if (cachedInitialSlot === null) {
    cachedInitialSlot = stallionMeta.prodSlot.currentSlot;
  }

  // Use the cached initial slot instead of the current one
  switch (cachedInitialSlot) {
    case SLOT_STATES.NEW:
      return stallionMeta.prodSlot.newHash || null;
    case SLOT_STATES.STABLE:
      return stallionMeta.prodSlot.stableHash || null;
    default:
      return null;
  }
};

export default getCurrentBundle;
