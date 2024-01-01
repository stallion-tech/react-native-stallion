import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../constants/appConstants';
import { COLORS } from '../../../constants/colors';

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
    fontSize: STD_MARGIN * 2,
  },
  boldText: {
    fontWeight: 'bold',
  },
  retryButtonContainer: {
    alignSelf: 'center',
    marginVertical: STD_MARGIN * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    fontSize: STD_MARGIN * 1.5,
  },
});

export default styles;
