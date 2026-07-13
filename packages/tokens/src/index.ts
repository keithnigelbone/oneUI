/**
 * Token Exports for React Native
 * All design tokens available as JavaScript objects
 * This allows React Native components to access tokens: tokens.shape.Pill
 *
 * The dimension scale is the source of truth for spacing values.
 * Dimension tokens use the f-scale (f-8 to f16) based on DIN 1450.
 */

/**
 * Dimension scale (f-scale) — internal modular scale (DIN 1450).
 *
 * Keys are f-steps (`f-8` … `f16`, `f0`, `f2-5`). This is the **engine layer**:
 * typography line-heights, spacing math, and brand dimension configs all resolve
 * through these steps. Figma/CSS expose the numeric **spacing** vocabulary
 * (`0`, `0.5`, `1`, … `40`) via `spacing` below — not f-step names.
 */
export const dimension = {
  'f-8': 0,
  'f-7': 2,
  'f-6': 4,
  'f-5': 6,
  'f-4': 8,
  'f-3': 10,
  'f-2': 12,
  'f-1': 14,
  f0: 16,
  f1: 18,
  f2: 20,
  'f2-5': 22,
  f3: 24,
  f4: 28,
  f5: 32,
  f6: 36,
  f7: 40,
  f8: 48,
  f9: 56,
  f10: 64,
  f11: 72,
  f12: 80,
  f13: 96,
  f14: 112,
  f15: 128,
  f16: 160,
} as const;

/**
 * Desktop dimension values (for reference)
 * Use these when calculating responsive layouts
 */
export const dimensionDesktop = {
  'f-8': 0,
  'f-7': 2.5,
  'f-6': 5,
  'f-5': 7.5,
  'f-4': 10,
  'f-3': 12.5,
  'f-2': 15,
  'f-1': 17.5,
  f0: 20,
  f1: 22.5,
  f2: 25,
  'f2-5': 27.5,
  f3: 30,
  f4: 35,
  f5: 40,
  f6: 45,
  f7: 50,
  f8: 60,
  f9: 70,
  f10: 80,
  f11: 90,
  f12: 100,
  f13: 120,
  f14: 140,
  f15: 160,
  f16: 200,
} as const;

/**
 * Spacing tokens — Figma-aligned numeric names (`Spacing-4`, `Spacing-1-5`, …).
 * Each value aliases an f-step in `dimension` (e.g. `spacing['4'] === dimension.f0`).
 * Prefer `tokens.spacing['N']` in component code over `tokens.dimension['f-*']`.
 */
export const spacing = {
  '0': dimension['f-8'],
  '0-5': dimension['f-7'],
  '1': dimension['f-6'],
  '1-5': dimension['f-5'],
  '2': dimension['f-4'],
  '2-5': dimension['f-3'],
  '3': dimension['f-2'],
  '3-5': dimension['f-1'],
  '4': dimension.f0,
  '4-5': dimension.f1,
  '5': dimension.f2,
  '5-5': dimension['f2-5'],
  '6': dimension.f3,
  '7': dimension.f4,
  '8': dimension.f5,
  '9': dimension.f6,
  '10': dimension.f7,
  '12': dimension.f8,
  '14': dimension.f9,
  '16': dimension.f10,
  '18': dimension.f11,
  '20': dimension.f12,
  '24': dimension.f13,
  '28': dimension.f14,
  '32': dimension.f15,
  '40': dimension.f16,
  Margin: 16,
  Gutter: 8,
} as const;

const spacingMidpoint = (lower: number, upper: number) => (lower + upper) / 2;

export const tokens = {
  /**
   * Shape tokens — Figma-aligned numeric names (`Shape-4`, `Shape-0-5`, …),
   * mirroring the web `--Shape-*` scale in `src/css/primitives.css` and the
   * `spacing` map above. Each value aliases an f-step in `dimension`.
   * `Pill` (9999) is a standalone constant, not part of the numeric scale.
   *
   * ⚠️ The deprecated lowercase keys below are NOT a case-fold of the numeric
   * ones. This table was hand-written and had drifted from the dimension scale:
   * `m` is 8px (f-4 → `'2'`), whereas the *uppercase* `M` on `NativeShape` in
   * `@oneui/shared` is 16px (f0 → `'4'`). They migrate **by value**.
   * Never case-fold when migrating shape tokens.
   *
   * ⚠️ `pill` is the single exception to value-preservation: it is 999, while
   * `Pill` is 9999. As a border-radius both clamp to the same stadium, so no
   * current consumer re-renders — but the NUMBER changes 10×. Before migrating a
   * `tokens.shape.pill` call site, check it is not consumed as a raw number
   * (animation output range, size comparison). Every other key below is
   * byte-for-byte what it was before the numeric scale landed.
   */
  shape: {
    '0': dimension['f-8'],     //  0
    '0-5': dimension['f-7'],   //  2
    '1': dimension['f-6'],     //  4
    '1-5': dimension['f-5'],   //  6
    '2': dimension['f-4'],     //  8
    '2-5': dimension['f-3'],   // 10
    '3': dimension['f-2'],     // 12
    '3-5': dimension['f-1'],   // 14
    '4': dimension.f0,         // 16
    '4-5': dimension.f1,       // 18
    '5': dimension.f2,         // 20
    '5-5': dimension['f2-5'],  // 22
    '6': dimension.f3,         // 24
    '7': dimension.f4,         // 28
    '8': dimension.f5,         // 32
    '9': dimension.f6,         // 36
    '10': dimension.f7,        // 40
    Pill: 9999,

    /** @deprecated 999 → use `tokens.shape.Pill` (9999). Both render identically. */
    pill: 999,
    /** @deprecated 2px → use `tokens.shape['0-5']` */
    xs: 2,
    /** @deprecated 4px → use `tokens.shape['1']` */
    s: 4,
    /** @deprecated 8px → use `tokens.shape['2']` (NOT `'4'` — see note above) */
    m: 8,
    /** @deprecated 12px → use `tokens.shape['3']` */
    l: 12,
    /** @deprecated 16px → use `tokens.shape['4']` */
    xl: 16,
    /** @deprecated 20px → use `tokens.shape['5']` */
    '2xl': 20,
    /** @deprecated 24px → use `tokens.shape['6']` */
    '3xl': 24,
    /** @deprecated 32px → use `tokens.shape['8']` (skips 28px) */
    '4xl': 32,
    /** @deprecated 40px → use `tokens.shape['10']` (skips 36px) */
    '5xl': 40,
  },

  // Dimension scale (f-steps) - single source of truth
  dimension: dimension,

  // Spacing tokens (numeric aliases to dimension f-steps)
  spacing,

  // Surface colors (light mode defaults - override in theme)
  // Matches CSS primitives.css Rang De naming convention
  surface: {
    default: 'oklch(100% 0 0)',
    minimal: 'oklch(97% 0 0)',
    subtle: 'oklch(94% 0 0)',
    bold: 'oklch(25% 0 0)',
    elevated: 'oklch(100% 0 0)',
    // Interaction states (Rang De stacking)
    boldHover: 'oklch(22% 0 0)',
    boldPressed: 'oklch(19% 0 0)',
    subtleHover: 'oklch(91% 0 0)',
    subtlePressed: 'oklch(88% 0 0)',
    minimalHover: 'oklch(94% 0 0)',
    minimalPressed: 'oklch(91% 0 0)',
    // Legacy aliases
    main: 'oklch(100% 0 0)',
    ghost: 'oklch(97% 0 0)',
  },

  // Text colors (light mode defaults)
  text: {
    high: 'oklch(15% 0 0)',
    medium: 'oklch(45% 0 0)',
    low: 'oklch(65% 0 0)',
    onBoldHigh: 'oklch(98% 0 0)',
  },

  // Motion tokens (in milliseconds)
  motion: {
    duration: {
      discreet: {
        micro: 50,
        short: 100,
        medium: 150,
        long: 200,
      },
      expressive: {
        short: 250,
        medium: 350,
        long: 500,
        xlong: 700,
      },
    },
  },

  // Material tokens for surfaces with visual treatments
  material: {
    // Translucent materials - opacity-based overlays
    translucent: {
      light: {
        minimal: 'rgba(255, 255, 255, 0.10)',
        subtle: 'rgba(255, 255, 255, 0.25)',
        moderate: 'rgba(255, 255, 255, 0.50)',
        heavy: 'rgba(255, 255, 255, 0.75)',
      },
      dark: {
        minimal: 'rgba(0, 0, 0, 0.10)',
        subtle: 'rgba(0, 0, 0, 0.25)',
        moderate: 'rgba(0, 0, 0, 0.50)',
        heavy: 'rgba(0, 0, 0, 0.75)',
      },
    },

    // Frosted materials - blur values and expo-blur intensity mappings
    frosted: {
      // Blur radius in pixels
      blur: {
        ultraThin: 4,
        thin: 8,
        regular: 16,
        thick: 24,
        ultraThick: 32,
      },
      // expo-blur intensity mappings (0-100)
      intensity: {
        ultraThin: 20,
        thin: 40,
        regular: 60,
        thick: 80,
        ultraThick: 95,
      },
      // Background overlays (light mode defaults)
      background: {
        ultraThin: 'rgba(255, 255, 255, 0.30)',
        thin: 'rgba(255, 255, 255, 0.50)',
        regular: 'rgba(255, 255, 255, 0.65)',
        thick: 'rgba(255, 255, 255, 0.75)',
        ultraThick: 'rgba(255, 255, 255, 0.85)',
      },
      // Edge definition
      border: 'rgba(255, 255, 255, 0.20)',
      // Fallback when backdrop-filter unsupported
      fallback: {
        ultraThin: 'rgba(255, 255, 255, 0.80)',
        thin: 'rgba(255, 255, 255, 0.85)',
        regular: 'rgba(255, 255, 255, 0.92)',
        thick: 'rgba(255, 255, 255, 0.95)',
        ultraThick: 'rgba(255, 255, 255, 0.97)',
      },
    },

    // Glass materials - advanced blur with saturation
    glass: {
      blur: {
        regular: 20,
        clear: 12,
      },
      intensity: {
        regular: 70,
        clear: 50,
      },
      saturation: {
        regular: 180,
        clear: 150,
      },
      highlight: {
        minimal: 0.12,
        moderate: 0.25,
        strong: 0.40,
      },
      tint: {
        light: 'rgba(255, 255, 255, 0.45)',
        dark: 'rgba(0, 0, 0, 0.45)',
      },
      border: {
        light: 'rgba(255, 255, 255, 0.25)',
        dark: 'rgba(255, 255, 255, 0.10)',
      },
    },

    // Metallic materials - gradient colors for expo-linear-gradient
    metallic: {
      gold: {
        colors: [
          '#462523',
          '#cb9b51',
          '#f6e27a',
          '#f6f2c0',
          '#f6e27a',
          '#cb9b51',
          '#462523',
        ] as const,
        locations: [0, 0.15, 0.3, 0.45, 0.55, 0.7, 1] as const,
        text: '#462523',
      },
      silver: {
        colors: [
          '#3d3d3d',
          '#8c8c8c',
          '#c0c0c0',
          '#f0f0f0',
          '#c0c0c0',
          '#8c8c8c',
          '#3d3d3d',
        ] as const,
        locations: [0, 0.15, 0.3, 0.45, 0.55, 0.7, 1] as const,
        text: '#2a2a2a',
      },
      bronze: {
        colors: [
          '#3d2314',
          '#a97142',
          '#cd9355',
          '#e8c896',
          '#cd9355',
          '#a97142',
          '#3d2314',
        ] as const,
        locations: [0, 0.15, 0.3, 0.45, 0.55, 0.7, 1] as const,
        text: '#3d2314',
      },
      custom: {
        colors: [
          '#1f2933',
          '#7b8794',
          '#cbd2d9',
          '#f5f7fa',
          '#cbd2d9',
          '#7b8794',
          '#1f2933',
        ] as const,
        locations: [0, 0.15, 0.3, 0.45, 0.55, 0.7, 1] as const,
        text: '#1f2933',
        gradientType: 'radial',
        gradientAngle: 45,
      },
      platinum: {
        colors: [
          '#2a2a2a',
          '#a0a0a0',
          '#d0d0d0',
          '#ffffff',
          '#d0d0d0',
          '#a0a0a0',
          '#2a2a2a',
        ] as const,
        locations: [0, 0.15, 0.3, 0.45, 0.55, 0.7, 1] as const,
        text: '#2a2a2a',
      },
      roseGold: {
        colors: [
          '#4a2020',
          '#e8a39e',
          '#f4c4bf',
          '#fff0ed',
          '#f4c4bf',
          '#e8a39e',
          '#4a2020',
        ] as const,
        locations: [0, 0.15, 0.3, 0.45, 0.55, 0.7, 1] as const,
        text: '#4a2020',
      },
    },
  },

  // Border widths
  borderWidth: {
    hairline: 1,
    thin: 2,
  },

  // Z-Index scale
  zIndex: {
    base: 0,
    sticky: 100,
    dropdown: 200,
    menu: 300,
    popover: 400,
    tooltip: 500,
    toast: 600,
    modal: 700,
    overlay: 800,
  },
} as const;

/**
 * Component dimensions
 */
export const component = {
  height: {
    topBar: 52,
  },
  width: {
    leftNav: 240,
    leftNavCollapsed: 60,
  },
  maxHeight: {
    dialog: 300,
  },
} as const;

/**
 * Touch targets (WCAG AA compliance)
 */
export const touchTarget = {
  min: 44, // Matches CSS --Touch-Target-Min
  minCompact: 40, // For compact density mode
  minOpen: 48, // For open density mode
} as const;

/**
 * Typography size tokens (matches CSS --Typography-Size-* scale)
 */
export const typography = {
  size: {
    '3xs': 9,
    '2xs': 10,
    xs: 11,
    s: 12,
    m: 13,
    l: 14,
    xl: 16,
    '2xl': 18,
    '3xl': 20,
    '4xl': 24,
    '5xl': 28,
  },
  /**
   * Numeric font-weight tokens. Mirrors web's `--{Role}-FontWeight-*` scale —
   * RN's `Text.style.fontWeight` accepts the same numeric weight strings.
   */
  weight: {
    low: '400',
    medium: '500',
    high: '700',
    display: '900',
  },
} as const;

/**
 * Density configuration for React Native
 * Each mode shifts spacing + typography tokens by 1 f-step
 */
export const densityConfig = {
  compact: {
    spacing: {
      '0': dimension['f-8'],
      '0-5': dimension['f-8'],
      '1': dimension['f-7'],
      '1-5': dimension['f-6'],
      '2': dimension['f-5'],
      '2-5': dimension['f-4'],
      '3': dimension['f-3'],
      '3-5': dimension['f-2'],
      '4': dimension['f-1'],
      '4-5': dimension.f0,
      '5': dimension.f1,
      '5-5': spacingMidpoint(dimension.f1, dimension.f2),
      '6': dimension.f2,
      '7': dimension.f3,
      '8': dimension.f4,
      '9': dimension.f5,
      '10': dimension.f6,
      '12': dimension.f7,
      '14': dimension.f8,
      '16': dimension.f9,
      '18': dimension.f10,
      '20': dimension.f11,
      '24': dimension.f12,
      '28': dimension.f13,
      '32': dimension.f14,
      '40': dimension.f15,
      Margin: 16,
      Gutter: 8,
    },
    typography: {
      size: {
        '3xs': 8,
        '2xs': 9,
        xs: 10,
        s: 11,
        m: 12,
        l: 13,
        xl: 14,
        '2xl': 16,
        '3xl': 18,
        '4xl': 20,
        '5xl': 24,
      },
    },
    touchTarget: { min: 40 },
    componentHeight: { topBar: 52 },
  },
  default: {
    spacing: tokens.spacing,
    typography,
    touchTarget: { min: 44 },
    componentHeight: { topBar: 64 },
  },
  open: {
    spacing: {
      '0': dimension['f-8'],
      '0-5': dimension['f-6'],
      '1': dimension['f-5'],
      '1-5': dimension['f-4'],
      '2': dimension['f-3'],
      '2-5': dimension['f-2'],
      '3': dimension['f-1'],
      '3-5': dimension.f0,
      '4': dimension.f1,
      '4-5': dimension.f2,
      '5': dimension.f3,
      '5-5': spacingMidpoint(dimension.f3, dimension.f4),
      '6': dimension.f4,
      '7': dimension.f5,
      '8': dimension.f6,
      '9': dimension.f7,
      '10': dimension.f8,
      '12': dimension.f9,
      '14': dimension.f10,
      '16': dimension.f11,
      '18': dimension.f12,
      '20': dimension.f13,
      '24': dimension.f14,
      '28': dimension.f15,
      '32': dimension.f16,
      '40': dimension.f16,
      Margin: 16,
      Gutter: 8,
    },
    typography: {
      size: {
        '3xs': 10,
        '2xs': 11,
        xs: 12,
        s: 13,
        m: 14,
        l: 16,
        xl: 18,
        '2xl': 20,
        '3xl': 22,
        '4xl': 26,
        '5xl': 30,
      },
    },
    touchTarget: { min: 48 },
    componentHeight: { topBar: 72 },
  },
} as const;

export type TokensType = typeof tokens;
export type DimensionScale = typeof dimension;
export type DimensionDesktopScale = typeof dimensionDesktop;
export type ComponentDimensions = typeof component;
export type TouchTargetSizes = typeof touchTarget;
export type TypographyTokens = typeof typography;
export type DensityConfig = typeof densityConfig;
