import { StyleSheet } from 'react-native';

import {
  DS_COLORS,
  DS_HEADER_TONES,
  DS_MONO_FONT,
  DS_ON_HEADER,
  DS_RADII,
  DS_SPACING,
} from '../../../../../constants/designTokens';

const styles = StyleSheet.create({
  /* ---------------------------------------------------------------- *
   * Chip — 11 / 700, pill, tinted
   * ---------------------------------------------------------------- */
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: DS_RADII.pill,
  },
  chipIndigo: {
    backgroundColor: DS_COLORS.indigoTint,
  },
  chipGreen: {
    backgroundColor: DS_COLORS.greenTint,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextIndigo: {
    color: DS_COLORS.indigo,
  },
  chipTextGreen: {
    color: DS_COLORS.green,
  },

  /* ---------------------------------------------------------------- *
   * ActionButton — 13 / 700
   * ---------------------------------------------------------------- */
  button: {
    borderRadius: DS_RADII.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFilled: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonOutline: {
    // 1px border + 7px padding keeps the same outer box as the filled button.
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: DS_COLORS.outlineBorder,
    backgroundColor: DS_COLORS.cardBg,
  },
  buttonPrimary: {
    backgroundColor: DS_COLORS.indigo,
  },
  buttonPrimaryPressed: {
    backgroundColor: DS_COLORS.indigoPressed,
  },
  buttonSuccess: {
    backgroundColor: DS_COLORS.green,
  },
  buttonSuccessPressed: {
    backgroundColor: DS_COLORS.greenPressed,
  },
  buttonOutlinePressed: {
    backgroundColor: DS_COLORS.segmentTrack,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  buttonTextFilled: {
    color: DS_COLORS.white,
  },
  buttonTextOutline: {
    color: DS_COLORS.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  // Holds the "Download" footprint so the button does not jump as the
  // percentage counts up.
  buttonProgress: {
    minWidth: 92,
  },
  // Clips the fill to the button's rounded corners.
  buttonProgressTrack: {
    overflow: 'hidden',
  },
  // Sits behind the label and grows left to right as the download advances.
  buttonProgressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: DS_COLORS.indigoTint,
  },

  /* ---------------------------------------------------------------- *
   * SectionLabel — 12 / 700 / ls 1.2 / uppercase
   * ---------------------------------------------------------------- */
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: DS_COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: DS_SPACING.labelGap,
  },

  /* ---------------------------------------------------------------- *
   * ModeToggle — off is Testing, on is Production
   * ---------------------------------------------------------------- */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextBlock: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: DS_ON_HEADER.testingPrimary,
  },
  toggleLabelProduction: {
    color: DS_ON_HEADER.productionPrimary,
  },
  toggleCaption: {
    fontSize: 12,
    lineHeight: 17, // The caption wraps to two lines on narrow screens.
    color: DS_ON_HEADER.testingSecondary,
    marginTop: 3,
  },
  toggleCaptionProduction: {
    color: DS_ON_HEADER.productionSecondary,
  },

  /* ---------------------------------------------------------------- *
   * Headers
   * ---------------------------------------------------------------- */
  appHeader: {
    paddingTop: 18,
    paddingHorizontal: DS_SPACING.screen,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Full horse + wordmark lockup, scaled so its letterforms optically match
  // the 17/800 wordmark in the design.
  wordmarkLogo: {
    width: 82,
    height: 26,
  },
  wordmarkDiamond: {
    width: 12,
    height: 12,
    backgroundColor: DS_COLORS.indigo,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    marginRight: 8,
  },
  wordmarkText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: DS_COLORS.textPrimary,
  },
  closeGlyph: {
    fontSize: 18,
    color: DS_ON_HEADER.testingSecondary,
  },
  closeGlyphProduction: {
    color: DS_ON_HEADER.productionPrimary,
  },

  // Bundle history is reachable from Testing only, so its header always wears
  // the testing tone.
  detailHeader: {
    backgroundColor: DS_HEADER_TONES.testing,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.headerHairline,
    paddingVertical: 18,
    paddingHorizontal: DS_SPACING.screen,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    marginLeft: -8,
    marginRight: 12,
    borderRadius: DS_RADII.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 3,
  },
  backGlyph: {
    fontSize: 28,
    lineHeight: 28,
    color: DS_COLORS.textPrimary,
  },
  detailTitleBlock: {
    flex: 1,
    marginRight: 12,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: DS_COLORS.textPrimary,
  },
  detailSubtitle: {
    fontSize: 12,
    color: DS_COLORS.textFaint,
  },

  /* ---------------------------------------------------------------- *
   * Cards
   * ---------------------------------------------------------------- */
  card: {
    backgroundColor: DS_COLORS.cardBg,
    borderWidth: 1,
    borderColor: DS_COLORS.cardBorder,
    borderRadius: DS_RADII.card,
    paddingVertical: DS_SPACING.cardVertical,
    paddingHorizontal: DS_SPACING.cardHorizontal,
  },
  // The Production bundle card pads evenly on all four sides.
  cardPaddedEven: {
    paddingVertical: DS_SPACING.cardHorizontal,
  },
  cardHighlightIndigo: {
    borderWidth: 1.5,
    borderColor: DS_COLORS.indigo,
  },
  cardHighlightGreen: {
    borderWidth: 1.5,
    borderColor: DS_COLORS.green,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: DS_COLORS.textPrimary,
    marginRight: 8,
  },
  cardTitleLarge: {
    fontSize: 20,
  },
  cardMeta: {
    fontSize: 12,
    color: DS_COLORS.textFaint,
    marginTop: 10,
  },

  /* ---------------------------------------------------------------- *
   * Release note + Read more
   * ---------------------------------------------------------------- */
  noteWrapper: {
    marginTop: 10,
  },
  note: {
    fontSize: 13,
    lineHeight: 19, // 13 × 1.45
    color: DS_COLORS.textBody,
  },
  noteTight: {
    marginTop: 6,
  },
  // Off-screen copy used purely to count the unclamped line count.
  noteMeasure: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -1,
  },
  readMore: {
    fontSize: 12,
    fontWeight: '700',
    color: DS_COLORS.indigo,
    marginTop: 4,
  },

  /* ---------------------------------------------------------------- *
   * Bucket row
   * ---------------------------------------------------------------- */
  bucketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bucketTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  bucketName: {
    fontSize: 17,
    fontWeight: '700',
    color: DS_COLORS.textPrimary,
    marginBottom: 3,
  },
  bucketMeta: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
  },
  bucketChevron: {
    fontSize: 20,
    color: DS_COLORS.chevron,
  },

  /* ---------------------------------------------------------------- *
   * This device card
   * ---------------------------------------------------------------- */
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceLabel: {
    fontSize: 14,
    color: DS_COLORS.textMuted,
    marginRight: 12,
  },
  deviceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: DS_COLORS.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  deviceValueMono: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: DS_MONO_FONT,
    color: DS_COLORS.textPrimary,
  },
  deviceDivider: {
    height: 1,
    backgroundColor: DS_COLORS.divider,
    marginVertical: 12,
  },

  /* ---------------------------------------------------------------- *
   * Dashed state card (empty / error)
   * ---------------------------------------------------------------- */
  stateCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: DS_COLORS.outlineBorder,
    borderRadius: DS_RADII.card,
    paddingVertical: 28,
    paddingHorizontal: DS_SPACING.screen,
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: DS_COLORS.textSecondary,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 13,
    lineHeight: 20, // 13 × 1.5
    color: DS_COLORS.textFaint,
    textAlign: 'center',
    marginTop: 6,
  },
  stateAction: {
    marginTop: 16,
  },

  /* ---------------------------------------------------------------- *
   * Error banner
   * ---------------------------------------------------------------- */
  errorBanner: {
    backgroundColor: DS_COLORS.errorTint,
    borderWidth: 1,
    borderColor: DS_COLORS.errorBorder,
    borderRadius: DS_RADII.button,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  errorBannerText: {
    fontSize: 12,
    color: DS_COLORS.errorText,
  },
});

export default styles;
