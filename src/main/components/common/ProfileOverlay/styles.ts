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
    color: COLORS.white,
  },
  profileInfoText: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  profileSubInfoText: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.black7,
    marginTop: STD_MARGIN / 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  uidTitle: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.black,
    marginTop: STD_MARGIN * 1.5,
    textAlign: 'center',
  },
  uidText: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.black,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginBottom: STD_MARGIN,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    width: HEADER_SLAB_HEIGHT * 3,
    height: HEADER_SLAB_HEIGHT * 3,
    borderRadius: HEADER_SLAB_HEIGHT * 1.5,
    marginVertical: STD_MARGIN,
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: COLORS.black2,
    borderRadius: STD_MARGIN,
    paddingVertical: HEADER_SLAB_HEIGHT / 1.5,
    marginBottom: STD_MARGIN * 2,
  },
  detailContainer: {
    marginVertical: STD_MARGIN,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
