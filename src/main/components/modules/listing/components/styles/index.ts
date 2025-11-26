import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../../../constants/appConstants';
import { COLORS } from '../../../../../constants/colors';

const styles = StyleSheet.create({
  cardContainer: {
    margin: STD_MARGIN,
    marginBottom: STD_MARGIN * 1.5,
    backgroundColor: COLORS.white,
    borderRadius: STD_MARGIN,
    shadowColor: COLORS.black,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    elevation: 3,
    shadowRadius: 6,
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
  justifyCenter: {
    justifyContent: 'center',
  },
  rowFlex: {
    flexDirection: 'row',
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
  configCardContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: STD_MARGIN,
    marginVertical: STD_MARGIN / 2,
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
    borderColor: COLORS.black2,
    marginVertical: STD_MARGIN,
    marginHorizontal: STD_MARGIN,
  },
  subText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
    marginVertical: STD_MARGIN / 2,
    color: COLORS.text_major,
  },
  titleText: {
    flex: 1,
    fontSize: HEADER_SLAB_HEIGHT / 2.5,
    color: COLORS.black,
  },
  subTitleText: {
    textAlign: 'right',
    fontSize: HEADER_SLAB_HEIGHT / 3,
    color: COLORS.black7,
  },
  bold: {
    fontWeight: 'bold',
  },
  releaseNoteText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black7,
  },
  releaseNoteDescriptionText: {
    fontSize: 14,
    width: '70%',
    color: COLORS.black,
    marginLeft: STD_MARGIN / 2,
  },
  descContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: STD_MARGIN,
    marginHorizontal: STD_MARGIN,
    marginBottom: STD_MARGIN / 2,
    backgroundColor: COLORS.black1,
    borderRadius: STD_MARGIN / 2,
  },
  rightBorder: {
    borderRightWidth: 1,
    borderColor: COLORS.black2,
  },
  flex: {
    flex: 1,
  },
});

export default styles;
