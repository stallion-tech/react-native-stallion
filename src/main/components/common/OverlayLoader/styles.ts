import { StyleSheet } from 'react-native';

import { STD_MARGIN } from '../../../constants/appConstants';
import { COLORS } from '../../../constants/colors';

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.black5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressOuter: {
    width: '80%',
    height: STD_MARGIN,
    borderRadius: STD_MARGIN / 2,
    backgroundColor: COLORS.black5,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    margin: STD_MARGIN,
  },
  progressInner: {
    height: STD_MARGIN,
    borderRadius: STD_MARGIN / 2,
    backgroundColor: COLORS.indigo,
  },
  downloadingText: {
    color: COLORS.white,
    fontSize: STD_MARGIN * 2,
  },
});

export default styles;
