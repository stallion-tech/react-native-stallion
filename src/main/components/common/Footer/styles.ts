import { StyleSheet } from 'react-native';

import { STD_MARGIN } from '../../../constants/appConstants';
import { COLORS } from '../../../constants/colors';

const styles = StyleSheet.create({
  shadowContainer: {
    elevation: 5,
    zIndex: 5,
    shadowOpacity: 0.1,
    shadowOffset: { height: -20, width: 0 },
    shadowRadius: 10,
    backgroundColor: COLORS.dark_bg,
    shadowColor: COLORS.dark_shadow_color,
  },
  noDownloadContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: STD_MARGIN,
    paddingVertical: STD_MARGIN / 2,
  },
  errorInfoSection: {
    height: STD_MARGIN * 2.5,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartInfoSection: {
    height: STD_MARGIN * 2.5,
    backgroundColor: COLORS.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonMessage: {
    fontSize: STD_MARGIN * 1.2,
    color: COLORS.white,
    marginHorizontal: STD_MARGIN / 2,
    fontWeight: 'bold',
  },
  footerContainer: {
    padding: 16,
    backgroundColor: COLORS.dark_bg,
    // borderTopWidth: 1,
    // borderColor: COLORS.dark_border_color,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: COLORS.primary_white,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  switchContainer: {
    borderColor: COLORS.dark_border_color,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: STD_MARGIN,
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    padding: STD_MARGIN * 1.3,
    backgroundColor: COLORS.dark_border_color,
  },
  borderLeftRadius: {
    borderTopLeftRadius: STD_MARGIN,
    borderBottomLeftRadius: STD_MARGIN,
  },
  borderRightRadius: {
    borderTopRightRadius: STD_MARGIN,
    borderBottomRightRadius: STD_MARGIN,
  },
  tabSelected: {
    backgroundColor: COLORS.primary_white,
  },
  titleSelected: {
    fontSize: STD_MARGIN * 1.2,
    color: COLORS.dark_bg,
  },
  titleBasic: {
    textAlign: 'center',
    fontSize: STD_MARGIN * 1.5,
    color: COLORS.dark_bg,
    fontWeight: 'bold',
  },
  borderWidthRight: {
    borderRightWidth: 0.5,
    borderColor: COLORS.dark_border_color,
  },
  borderWidthLeft: {
    borderLeftWidth: 0.5,
    borderColor: COLORS.dark_border_color,
  },
});

export default styles;
