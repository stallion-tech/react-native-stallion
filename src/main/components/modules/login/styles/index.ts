import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../../constants/appConstants';
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
    width: '90%',
    alignSelf: 'center',
    paddingVertical: HEADER_SLAB_HEIGHT / 2,
  },
  logoText: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.black,
    fontWeight: '500',
  },
  inputSection: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingTop: STD_MARGIN,
  },
  errorText: {
    fontSize: HEADER_SLAB_HEIGHT / 4,
    color: COLORS.red,
    padding: STD_MARGIN,
    paddingHorizontal: STD_MARGIN * 2,
    textAlign: 'center',
  },
  spinnerContainer: {
    margin: HEADER_SLAB_HEIGHT / 2,
  },
  textInp: {
    width: '90%',
    height: HEADER_SLAB_HEIGHT,
    borderWidth: 1,
    borderColor: COLORS.black2,
    borderRadius: STD_MARGIN,
    marginBottom: STD_MARGIN * 1.5,
    paddingHorizontal: STD_MARGIN * 2,
    color: COLORS.text_major,
    fontSize: HEADER_SLAB_HEIGHT / 3,
  },
  buttonContainer: {
    padding: HEADER_SLAB_HEIGHT / 2,
  },
});

export default styles;
