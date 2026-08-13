import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../constants/appConstants';
import { COLORS } from '../../../constants/colors';

const styles = StyleSheet.create({
  headerContainer: {
    height: HEADER_SLAB_HEIGHT,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: { height: 20, width: 0 },
    shadowRadius: 10,
    backgroundColor: COLORS.white,
  },
  headerSideSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: STD_MARGIN * 1.2,
  },
  headerCenterSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  headerLogo: {
    width: HEADER_SLAB_HEIGHT * 2,
    flex: 1,
  },
});

export default styles;
