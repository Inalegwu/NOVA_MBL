import { createTheme } from '@shopify/restyle';
import { StyleSheet } from 'react-native';

const hairlineWidth = StyleSheet.hairlineWidth + 0.5;

const ACCENT_DARK = '#ff4d1c'; // recording-light red
const ACCENT_LIGHT = '#d9420f'; // deepened for AA contrast on white

// ---- palette ----
const palette = {
  // dark neutrals
  black: '#000000',
  // NOTE: card intentionally equals background in both themes. The
  // instrument-panel look depends on panels being separated only by
  // hairlines (see cardVariants below), not by an elevated fill —
  // giving `card` its own surface tone would undercut that.
  surfaceDark: '#000000',
  textPrimaryDark: 'rgba(255,255,255,0.92)',
  textSecondaryDark: 'rgba(255,255,255,0.54)',
  textTertiaryDark: 'rgba(255,255,255,0.29)',
  hairlineDark: 'rgba(255,255,255,0.14)',

  // light neutrals
  white: '#FFFFFF',
  surfaceLight: '#FFFFFF',
  textPrimaryLight: 'rgba(0,0,0,0.92)',
  textSecondaryLight: 'rgba(0,0,0,0.54)',
  textTertiaryLight: 'rgba(0,0,0,0.29)',
  hairlineLight: 'rgba(0,0,0,0.14)',

  // accents
  accentDark: ACCENT_DARK,
  accentLight: ACCENT_LIGHT,
  accentMutedDark: `${ACCENT_DARK}1A`, // 10% alpha
  accentMutedLight: `${ACCENT_LIGHT}1A`, // 10% alpha

  overlayBackdrop: `#0000001A`,

  transparent: 'transparent',
};

const light = createTheme({
  colors: {
    background: palette.white,
    card: palette.surfaceLight,
    text: palette.textPrimaryLight,
    textMuted: palette.textSecondaryLight,
    textFaint: palette.textTertiaryLight,
    border: palette.hairlineLight,
    accent: palette.accentLight,
    accentMuted: palette.accentMutedLight,
    accentText: palette.white, // text placed on top of a solid accent fill
    navigation: palette.textPrimaryLight,
    textAlt: palette.textPrimaryDark,
    transparent: palette.transparent,
    overlayBackdrop: palette.overlayBackdrop,
  },
  spacing: {
    '-1': -1,
    none: 0,
    px: 1,
    '0.5': 2,
    xxxs: 2,
    '1': 4,
    xxs: 4,
    '1.5': 6,
    '2': 8,
    xs: 8,
    '2.5': 10,
    '3': 12,
    s: 12,
    '3.5': 14,
    '4': 16,
    m: 16,
    '5': 20,
    ml: 20,
    '6': 24,
    l: 24,
    '7': 28,
    '8': 32,
    xl: 32,
    '9': 36,
    '10': 40,
    xxl: 40,
    '11': 44,
    '12': 48,
    xxxl: 48,
    '14': 56,
    '16': 64,
    huge: 64,
    '20': 80,
    '24': 96,
    massive: 96,
    '28': 112,
    '32': 128,
    '36': 144,
    '40': 160,
    '44': 176,
    '48': 192,
    '52': 208,
    '56': 224,
    '60': 240,
    '64': 256,
    '72': 288,
    '80': 320,
    '96': 384,
  },
  borderRadii: {
    none: 0,
    sm: 3,
    full: 999,
  },
  zIndices: {
    behind: -1,
    base: 0,
    card: 1,
    stickyHeader: 10,
    floatingNav: 20,
    overlay: 30,
    modal: 40,
    toast: 50,
    tooltip: 60,
  },
  textVariants: {
    defaults: {
      fontFamily: 'SatoshiBold',
      fontSize: 15,
      color: 'text',
    },
    titleLg: {
      fontFamily: 'RajdhaniSemiBold',
      fontSize: 36,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      color: 'text',
    },
    titleMd: {
      fontFamily: 'RajdhaniSemiBold',
      fontSize: 22,
      color: 'text',
    },
    body: {
      fontFamily: 'SatoshiBold',
      fontSize: 15,
      color: 'text',
    },
    bodyMuted: {
      fontFamily: 'SatoshiBold',
      fontSize: 15,
      color: 'textMuted',
    },
    label: {
      fontFamily: 'GeistMonoMedium',
      fontSize: 9,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: 'textMuted',
    },
    monoSm: {
      fontFamily: 'GeistMonoRegular',
      fontSize: 12,
      letterSpacing: 0.5,
      color: 'text',
      fontVariant: ['tabular-nums'],
    },
    monoLg: {
      fontFamily: 'GeistMonoMedium',
      fontSize: 22,
      color: 'text',
      fontVariant: ['tabular-nums'],
    },
  },
  cardVariants: {
    defaults: {},
    hairlineBottom: {
      borderBottomWidth: hairlineWidth,
      borderBottomColor: 'border',
    },
    hairlineTop: {
      borderTopWidth: hairlineWidth,
      borderTopColor: 'border',
    },
    hairlineRight: {
      borderRightWidth: hairlineWidth,
      borderRightColor: 'border',
    },
    hairlineLeft: {
      borderLeftWidth: hairlineWidth,
      borderLeftColor: 'border',
    },
    hairlineHorizontal: {
      borderLeftWidth: hairlineWidth,
      borderLeftColor: 'border',
      borderRightWidth: hairlineWidth,
      borderRightColor: 'border',
    },
    hairlineVertical: {
      borderTopWidth: hairlineWidth,
      borderTopColor: 'border',
      borderBottomWidth: hairlineWidth,
      borderBottomColor: 'border',
    },
    hairlineAll: {
      borderWidth: hairlineWidth,
      borderColor: 'border',
    },
    hairlineNone: {
      borderWidth: 0,
      borderColor: 'transparent',
    },
  },
});

type Theme = typeof light;

const dark: Theme = createTheme({
  ...light,
  colors: {
    ...light.colors,
    background: palette.black,
    card: palette.surfaceDark,
    text: palette.textPrimaryDark,
    textMuted: palette.textSecondaryDark,
    textFaint: palette.textTertiaryDark,
    border: palette.hairlineDark,
    accent: palette.accentDark,
    accentMuted: palette.accentMutedDark,
    accentText: palette.black,
    navigation: palette.black,
    textAlt: palette.textPrimaryLight,
  },
});

export { dark, light, type Theme };
