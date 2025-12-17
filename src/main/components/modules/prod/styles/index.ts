import { StyleSheet } from 'react-native';
import { HEADER_SLAB_HEIGHT } from '../../../../constants/appConstants';
import { COLORS } from '../../../../constants/colors';
import { STD_MARGIN } from '../../../../constants/appConstants';

const styles = StyleSheet.create({
  pageContainer: {
    flexDirection: 'column',
    backgroundColor: COLORS.background_grey,
    paddingBottom: HEADER_SLAB_HEIGHT,
    paddingTop: STD_MARGIN,
  },
  cardTitle: {
    marginTop: STD_MARGIN * 2,
    marginBottom: STD_MARGIN,
    marginHorizontal: STD_MARGIN,
    color: COLORS.black,
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.background_grey,
    flexDirection: 'column',
  },
});

export default styles;
