import { StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../constants/appConstants';

const styles = StyleSheet.create({
  profileContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTitle: {
    fontSize: HEADER_SLAB_HEIGHT,
    marginVertical: STD_MARGIN,
    color: COLORS.text_major,
  },
  profileInfoText: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    marginVertical: STD_MARGIN,
    color: COLORS.text_major,
  },
  buttonContainer: {
    width: '80%',
    margin: STD_MARGIN,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  infoContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default styles;
