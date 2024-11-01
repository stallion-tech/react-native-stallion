import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../../../constants/appConstants';
import { COLORS } from '../../../../../constants/colors';

const styles = StyleSheet.create({
  cardContainer: {
    margin: STD_MARGIN,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: COLORS.black,
    shadowOffset: { height: 4, width: 4 },
    shadowOpacity: 0.1,
    elevation: 2,
    shadowRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.black2,
  },
  infoSection: {
    width: '100%',
  },
  actionSection: {
    flex: 1,
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: STD_MARGIN,
  },
  colContainer: {
    flexDirection: 'column',
  },
  downloadButton: {
    backgroundColor: COLORS.black,
    padding: STD_MARGIN,
    borderRadius: STD_MARGIN,
  },
  appliedText: { color: COLORS.green, fontWeight: 'bold', fontSize: 14 },
  container: {},
  metaConainer: {
    backgroundColor: COLORS.white,
    margin: STD_MARGIN,
    borderRadius: STD_MARGIN,
    padding: STD_MARGIN,
  },
  divider: {
    borderBottomWidth: 0.5,
    opacity: 0.2,
    marginBottom: STD_MARGIN,
  },
  subText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
    marginVertical: STD_MARGIN / 2,
    color: COLORS.text_major,
  },
  titleText: {
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.black,
  },
  bold: {
    fontWeight: 'bold',
  },
  releaseNoteText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text_major,
  },
  releaseNoteDescriptionText: {
    fontSize: 14,
    color: COLORS.black,
  },
  descContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: STD_MARGIN,
    backgroundColor: COLORS.black1,
  },
});

export default styles;
