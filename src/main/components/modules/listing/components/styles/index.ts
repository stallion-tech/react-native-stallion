import { StyleSheet } from 'react-native';

import { HEADER_SLAB_HEIGHT, STD_MARGIN } from '@main/constants/appConstants';
import { COLORS } from '@main/constants/colors';

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
  },
  appliedText: { color: COLORS.green, fontWeight: 'bold', fontSize: 14 },
  container: {
    margin: 15,
  },
  divider: {
    borderBottomWidth: 0.5,
    opacity: 0.2,
    marginVertical: 10,
  },
  subText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
    marginBottom: STD_MARGIN / 2,
  },
  titleText: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  releaseNoteText: { fontSize: 12, fontWeight: '500', marginTop: 10 },
  releaseNoteDescriptionText: {
    fontSize: 14,
    marginTop: 5,
    color: COLORS.black,
  },
});

export default styles;
