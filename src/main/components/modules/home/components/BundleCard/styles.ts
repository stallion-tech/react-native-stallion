import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../../constants/colors';
import { STD_MARGIN } from '../../../../../constants/appConstants';
const styles = StyleSheet.create({
  mainContainer: {
    borderWidth: 1,
    borderColor: COLORS.dark_border_color,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary_white,
    marginBottom: 4,
  },
  infoContainer: {
    padding: STD_MARGIN,
    backgroundColor: '#262626',
    marginBottom: 12,
  },
  infoKey: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.grey_color,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.primary_white,
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
  marginBottom8: { marginBottom: 8 },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
    paddingHorizontal: 12,
  },
  bundleInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: 4,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.primary_white,
    marginBottom: 12,
  },
});

export default styles;
