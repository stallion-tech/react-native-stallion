import { StyleSheet } from 'react-native';

import { COLORS } from '../../../constants/colors';
import { STD_MARGIN } from '../../../constants/appConstants';

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.background_grey,
  },
  mainListContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background_grey,
    paddingBottom: STD_MARGIN * 2,
  },
  initalLoaderContainer: {
    width: '100%',
    paddingTop: STD_MARGIN * 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
});

export default styles;
