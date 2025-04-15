import { StyleSheet } from 'react-native';

import { COLORS } from '../../../constants/colors';
import { STD_MARGIN } from '../../../constants/appConstants';

const styles = StyleSheet.create({
  mainContainer: {
    // backgroundColor: COLORS.background_grey,
  },
  mainListContainer: {
    flexGrow: 1,
  },
  initalLoaderContainer: {
    width: '100%',
    paddingTop: STD_MARGIN * 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary_white,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary_white,
    paddingHorizontal: 12,
  },
  sectionSubTitle: {
    fontSize: 12,
    color: COLORS.grey_color,
    paddingHorizontal: 12,
  },
  sectionTitleContainer: {
    paddingTop: 12,
  },
});

export default styles;
