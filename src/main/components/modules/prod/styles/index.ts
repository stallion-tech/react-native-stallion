import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/colors';

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    color: 'black',
    borderWidth: 1,
    borderColor: 'red',
  },
});

export default styles;
