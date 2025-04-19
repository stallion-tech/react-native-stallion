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
    paddingHorizontal: STD_MARGIN,
    paddingVertical: STD_MARGIN / 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  switchContainer: {
    borderWidth: 0.5,
    borderColor: COLORS.black5,
    padding: STD_MARGIN / 2,
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
    padding: STD_MARGIN,
    borderRadius: STD_MARGIN,
    opacity: 0.5,
  },
  tabSelected: {
    backgroundColor: COLORS.black,
    opacity: 1,
  },
  titleSelected: {
    color: COLORS.white,
  },
  subTitleSelected: {
    color: COLORS.white7,
  },
  titleBasic: {
    textAlign: 'center',
    fontSize: STD_MARGIN * 1.5,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  subTitleBasic: {
    textAlign: 'center',
    fontSize: STD_MARGIN * 1.1,
    marginTop: STD_MARGIN / 4,
    color: COLORS.black7,
    fontWeight: 'bold',
  },
});

export default styles;
