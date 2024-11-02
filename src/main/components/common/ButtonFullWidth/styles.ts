import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../constants/appConstants';
import { COLORS } from '../../../constants/colors';

const styles = StyleSheet.create({
  buttonContainer: {
    height: HEADER_SLAB_HEIGHT,
    borderRadius: STD_MARGIN,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.black,
    elevation: 5,
    zIndex: 5,
    shadowColor: COLORS.black7,
    shadowOpacity: 0.2,
    shadowOffset: { height: 10, width: 10 },
    shadowRadius: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  transparentButton: {
    borderWidth: 1,
    borderColor: COLORS.black7,
  },
  buttonText: {
    fontSize: HEADER_SLAB_HEIGHT / 3.5,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.black,
  },
});

export default styles;
