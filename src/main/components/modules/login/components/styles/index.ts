import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../../../constants/appConstants';
import { COLORS } from '../../../../../constants/colors';

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInp: {
    width: '80%',
    height: HEADER_SLAB_HEIGHT,
    borderWidth: 1,
    borderColor: COLORS.black2,
    borderRadius: HEADER_SLAB_HEIGHT / 2,
    margin: STD_MARGIN,
    paddingHorizontal: STD_MARGIN * 2,
  },
  buttonContainer: {
    width: '80%',
    margin: STD_MARGIN,
  },
});

export default styles;
