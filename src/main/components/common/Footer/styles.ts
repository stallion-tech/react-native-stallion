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
  errTxt: {
    fontSize: STD_MARGIN * 1.2,
    color: COLORS.white,
    marginHorizontal: STD_MARGIN / 2,
  },
  footerContainer: {
    paddingHorizontal: STD_MARGIN,
    paddingVertical: STD_MARGIN / 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    padding: STD_MARGIN,
    borderRadius: STD_MARGIN,
  },
  tabSelected: {
    backgroundColor: COLORS.blue,
  },
  titleSelected: {
    fontSize: STD_MARGIN * 1.2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  titleBasic: {
    textAlign: 'center',
    fontSize: STD_MARGIN * 1.1,
    color: COLORS.text_major,
  },
});

export default styles;
