import { STD_MARGIN } from '@main/constants/appConstants';
import { COLORS } from '@main/constants/colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.black7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressOuter: {
    width: '80%',
    height: STD_MARGIN,
    borderRadius: STD_MARGIN / 2,
    backgroundColor: COLORS.black7,
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
