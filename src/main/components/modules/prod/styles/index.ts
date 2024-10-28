import { StyleSheet } from 'react-native';
import { HEADER_SLAB_HEIGHT } from '../../../../constants/appConstants';
import { COLORS } from '../../../../constants/colors';
import { STD_MARGIN } from '../../../../constants/appConstants';

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  uidText: {
    marginTop: HEADER_SLAB_HEIGHT / 2,
    color: COLORS.black,
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    fontWeight: 'bold',
  },
  uidValue: {
    fontSize: HEADER_SLAB_HEIGHT / 2,
    textAlign: 'center',
    marginTop: STD_MARGIN,
  },
});

export default styles;
