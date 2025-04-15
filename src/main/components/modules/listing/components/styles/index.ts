import { StyleSheet } from 'react-native';

import {
  HEADER_SLAB_HEIGHT,
  STD_MARGIN,
} from '../../../../../constants/appConstants';
import { COLORS } from '../../../../../constants/colors';

const styles = StyleSheet.create({
  cardContainer: {
    margin: STD_MARGIN,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.dark_border_color,
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
    padding: 12,
    flexWrap: 'wrap',
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
    borderRadius: 8,
    padding: 12,
    paddingBottom: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.dark_border_color,
  },
  divider: {
    borderBottomColor: COLORS.dark_border_color,
    borderBottomWidth: 0.5,
  },
  subText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
    marginVertical: STD_MARGIN / 2,
    color: COLORS.text_major,
  },
  titleText: {
    fontSize: 22,
    color: COLORS.primary_white,
  },
  configTitleText: {
    fontSize: 16,
    color: COLORS.primary_white,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '500',
  },
  releaseNoteText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a1a1a1',
    marginBottom: 2,
  },
  releaseNoteDescriptionText: {
    fontSize: 14,
    color: COLORS.primary_white,
  },
  descContainer: {
    padding: STD_MARGIN,
    backgroundColor: '#262626',
    marginBottom: 12,
  },
  buttonContainer: { marginBottom: 12, marginHorizontal: 12 },
  marginBottom8: { marginBottom: 8 },
  bundleInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: 4,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  flexDirectionRow: {
    flexDirection: 'row',
  },
  gap8: {
    gap: 8,
  },
});

// Label Color: - #a1a1a1

export default styles;
