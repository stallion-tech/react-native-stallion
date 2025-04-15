import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../constants/appConstants';
import { COLORS } from '../../../constants/colors';

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.primary_white,
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
    borderColor: COLORS.dark_border_color,
  },
  buttonText: {
    fontSize: 16,
  },
  primaryText: {
    color: COLORS.dark_bg,
    fontWeight: '500',
  },
  secondaryText: {
    color: COLORS.primary_white,
  },
});

export default styles;
