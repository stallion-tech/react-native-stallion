import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../constants/appConstants';
import { COLORS } from '../../../constants/colors';

const PROFILE_BUTTON_EDGE = HEADER_SLAB_HEIGHT / 1.7;

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
  },
  headerProfileButton: {
    height: PROFILE_BUTTON_EDGE,
    width: PROFILE_BUTTON_EDGE,
    borderRadius: PROFILE_BUTTON_EDGE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    marginLeft: STD_MARGIN,
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
  actionButtonClickable: {
    padding: STD_MARGIN,
  },
  actionButtonText: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.black7,
    fontWeight: 'bold',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  headerLogo: {
    width: HEADER_SLAB_HEIGHT * 2,
    flex: 1,
  },
  profileInitial: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
    color: COLORS.white,
  },
});

export default styles;
