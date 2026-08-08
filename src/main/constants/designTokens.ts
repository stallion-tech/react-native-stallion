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
  screenBg: '#F5F5F7',
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
};

export const DS_RADII = {
  card: 16,
  button: 10,
  segmentTrack: 12,
  segment: 10,
  pill: 999,
};

/**
 * The header slab is tinted by the mode the app is currently in, so the state
 * is readable at a glance: warm sand while Testing, brand green in Production.
 */
export const DS_HEADER_TONES = {
  testing: '#FFF7E8',
  production: DS_COLORS.green,
};

/** Foreground colours that sit on top of {@link DS_HEADER_TONES}. */
export const DS_ON_HEADER = {
  testingPrimary: DS_COLORS.textPrimary,
  testingSecondary: DS_COLORS.textMuted,
  productionPrimary: DS_COLORS.white,
  productionSecondary: 'rgba(255, 255, 255, 0.75)',
};

/** Switch track colours; the green header needs a translucent white track. */
export const DS_TOGGLE_TRACK = {
  off: DS_COLORS.outlineBorder,
  on: 'rgba(255, 255, 255, 0.4)',
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
