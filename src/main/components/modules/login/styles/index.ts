import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../../constants/appConstants';
import { COLORS } from '../../../../constants/colors';

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: '90%',
    alignSelf: 'center',
    paddingVertical: HEADER_SLAB_HEIGHT / 2,
  },
  logoText: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.primary_white,
    fontWeight: '500',
  },
  inputSection: {
    justifyContent: 'flex-start',
  },
  errorText: {
    fontSize: HEADER_SLAB_HEIGHT / 4,
    color: COLORS.red,
    padding: HEADER_SLAB_HEIGHT / 2,
  },
  spinnerContainer: {
    margin: HEADER_SLAB_HEIGHT / 2,
  },
  textInp: {
    width: '90%',
    height: HEADER_SLAB_HEIGHT,
    borderWidth: 1,
    borderColor: COLORS.dark_border_color,
    borderRadius: STD_MARGIN,
    marginBottom: STD_MARGIN,
    paddingHorizontal: STD_MARGIN * 2,
    color: COLORS.text_major,
  },
  buttonContainer: {
    padding: 16,
  },
});

export default styles;
