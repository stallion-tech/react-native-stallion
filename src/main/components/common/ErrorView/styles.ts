import { StyleSheet } from 'react-native';

import { HEADER_SLAB_HEIGHT } from '@main/constants/appConstants';
import { COLORS } from '@main/constants/colors';

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HEADER_SLAB_HEIGHT / 2,
    backgroundColor: COLORS.background_grey,
  },
  errorText: {
    color: COLORS.error,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default styles;
