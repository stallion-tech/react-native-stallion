import { StyleSheet } from 'react-native';
import { HEADER_SLAB_HEIGHT } from '../../../../constants/appConstants';
import { COLORS } from '../../../../constants/colors';
import { STD_MARGIN } from '../../../../constants/appConstants';

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: COLORS.background_grey,
  },
  cardTitle: {
    marginTop: 3 * STD_MARGIN,
    margin: STD_MARGIN,
    color: COLORS.black,
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    fontWeight: 'bold',
  },
});

export default styles;
