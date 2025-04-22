import { StyleSheet } from 'react-native';
import { HEADER_SLAB_HEIGHT } from '../../../../constants/appConstants';
import { COLORS } from '../../../../constants/colors';
import { STD_MARGIN } from '../../../../constants/appConstants';

const styles = StyleSheet.create({
  pageContainer: {
    flexDirection: 'column',
    backgroundColor: COLORS.background_grey,
    paddingBottom: HEADER_SLAB_HEIGHT,
  },
  cardTitle: {
    marginTop: 3 * STD_MARGIN,
    margin: STD_MARGIN,
    color: COLORS.black,
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.background_grey,
    flexDirection: 'column',
  },
});

export default styles;
