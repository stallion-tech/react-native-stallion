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
  otpInfoText: {
    color: COLORS.text_major,
  },
  textInp: {
    width: '80%',
    height: HEADER_SLAB_HEIGHT,
    borderWidth: 1,
    borderColor: COLORS.black2,
    borderRadius: STD_MARGIN,
    margin: STD_MARGIN,
    paddingHorizontal: STD_MARGIN * 2,
    color: COLORS.text_major,
  },
  buttonContainer: {
    width: '80%',
    margin: STD_MARGIN,
  },
});

export default styles;
