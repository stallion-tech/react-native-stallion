import { StyleSheet } from 'react-native';

import { STD_MARGIN } from '../../../constants/appConstants';
import { COLORS } from '../../../constants/colors';

const styles = StyleSheet.create({
  shadowContainer: {
    elevation: 5,
    zIndex: 5,
    shadowOpacity: 0.3,
    shadowOffset: { height: -10, width: 0 },
    shadowRadius: 5,
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
  errTxt: {
    fontSize: STD_MARGIN * 1.2,
    color: COLORS.white,
    marginHorizontal: STD_MARGIN / 2,
  },
  footerContainer: {
    paddingHorizontal: STD_MARGIN,
    paddingVertical: STD_MARGIN / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  infoTitle: {
    fontSize: STD_MARGIN * 1.2,
  },
  infoSubTitle: {
    fontSize: STD_MARGIN * 1.2,
  },
  alignCenter: {
    alignItems: 'center',
  },
  dividerSection: {
    flex: 1,
  },
  dividerSection2: {
    flex: 0.7,
  },
  bold: {
    fontWeight: 'bold',
  },
  selfCenter: {
    alignSelf: 'center',
  },
  greenColor: {
    color: COLORS.green,
  },
  redColor: {
    color: COLORS.red,
  },
  switchButton: {
    marginTop: STD_MARGIN / 2,
  },
});

export default styles;
