import { StyleSheet } from 'react-native';

import {
  DS_COLORS,
  DS_HEADER_TONES,
  DS_SPACING,
} from '../../../constants/designTokens';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_COLORS.screenBg,
  },
  headerSafeArea: {
    backgroundColor: DS_COLORS.cardBg,
  },
  // The header slab is tinted by the current mode.
  headerTesting: {
    backgroundColor: DS_HEADER_TONES.testing,
  },
  headerProduction: {
    backgroundColor: DS_HEADER_TONES.production,
  },
  // The wordmark header and the mode toggle share one slab; only the slab's
  // bottom edge carries the hairline.
  toggleArea: {
    paddingHorizontal: DS_SPACING.screen,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.headerHairline,
  },
  content: {
    flex: 1,
  },
  screenPadding: {
    padding: DS_SPACING.screen,
  },
  cardSeparator: {
    height: DS_SPACING.cardGap,
  },
  section: {
    marginBottom: DS_SPACING.section,
  },
  sectionLast: {
    marginBottom: 0,
  },
  bannerWrapper: {
    paddingHorizontal: DS_SPACING.screen,
    paddingTop: DS_SPACING.cardGap,
  },
  centeredFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listFooter: {
    paddingVertical: DS_SPACING.cardGap,
  },
  loginArea: {
    flex: 1,
    backgroundColor: DS_COLORS.cardBg,
  },
});

export default styles;
