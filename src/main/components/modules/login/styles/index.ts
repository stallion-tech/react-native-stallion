import { StyleSheet } from 'react-native';

import { HEADER_SLAB_HEIGHT } from '../../../../constants/appConstants';
import { COLORS } from '../../../../constants/colors';

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: HEADER_SLAB_HEIGHT,
  },
  inputSection: {
    flex: 2,
    justifyContent: 'flex-start',
    paddingTop: HEADER_SLAB_HEIGHT,
  },
  errorText: {
    fontSize: HEADER_SLAB_HEIGHT / 4,
    color: COLORS.red,
    padding: HEADER_SLAB_HEIGHT / 2,
  },
  spinnerContainer: {
    margin: HEADER_SLAB_HEIGHT / 2,
  },
});

export default styles;
