import { Platform } from 'react-native';

/**
 * Design tokens for the Stallion dev menu.
 */
export const DS_COLORS = {
  indigo: '#4638E4',
  indigoPressed: '#372BC4',
  indigoTint: '#EEEDFD',
  green: '#177A4C',
  greenPressed: '#12603C',
  greenTint: '#E4F4EB',
  screenBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E5E5EC',
  divider: '#F1F1F4',
  headerHairline: '#ECECF0',
  segmentTrack: '#F3F3F6',
  outlineBorder: '#D9D9E0',
  chevron: '#C4C4CC',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textBody: '#374151',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  white: '#FFFFFF',
  // Not part of the handoff palette — used only for the download error banner.
  errorText: '#B42318',
  errorTint: '#FEF3F2',
  errorBorder: '#FECDCA',
  contentBg: '#F5F5F7',
};

export const DS_RADII = {
  card: 16,
  button: 10,
  segmentTrack: 12,
  segment: 10,
  pill: 999,
};

/**
 * Compact toggle (46×28). On (Testing) uses brand green against the
 * white header; off (Production) keeps a neutral outline track.
 */
export const DS_TOGGLE = {
  width: 46,
  height: 28,
  thumb: 24,
  inset: 2,
  trackOff: DS_COLORS.outlineBorder,
  trackOn: DS_COLORS.green,
};

export const DS_SPACING = {
  screen: 20,
  cardVertical: 16,
  cardHorizontal: 18,
  section: 24,
  labelGap: 10,
  cardGap: 12,
};

/** Monospace family for the UID value. */
export const DS_MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

/** Pads small glyph controls out to the 44px minimum touch target. */
export const DS_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

/** Pads buttons (≈32px tall) out to the 44px minimum touch target. */
export const DS_BUTTON_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
