/**
 * motion.ts
 *
 * Jio motion foundation system — 37 computed tokens from a single base duration.
 * Moderate/Subtle variants, 4 easing types (entrance/exit/transition/bounce),
 * plus interaction and transition pattern specs stored per brand in Convex.
 */

/**
 * Parse cubic-bezier string to control points.
 * Supports negative values for bounce curves.
 */
export function parseCubicBezier(
  value: string
): [number, number, number, number] | null {
  const match = value.match(
    /cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/
  );
  if (!match) return null;

  return [
    parseFloat(match[1]),
    parseFloat(match[2]),
    parseFloat(match[3]),
    parseFloat(match[4]),
  ];
}

// ============================================================================
// Jio motion specification (Moderate/Subtle × t-shirt sizes)
// ============================================================================

/** Jio canonical base duration for the Moderate L step (ms). */
export const JIO_MOTION_BASE_DURATION = 300;

/** Scale ratio between adjacent duration steps (~3:2). */
export const MOTION_SCALE_RATIO = 1.5;

/** Jio canonical easing values. */
export const JIO_MOTION_EASINGS = {
  entrance: {
    moderate: 'cubic-bezier(0.25, 0.8, 0.5, 1)',
    subtle: 'cubic-bezier(0.2, 0.3, 0.5, 0.9)',
  },
  exit: {
    moderate: 'cubic-bezier(0.7, 0.1, 0.9, 0.7)',
    subtle: 'cubic-bezier(0.5, 0.1, 1, 1)',
  },
  transition: {
    moderate: 'cubic-bezier(0.5, 0, 0.3, 1)',
    subtle: 'cubic-bezier(0.4, 0, 0.5, 1)',
  },
  bounce: {
    moderate: 'cubic-bezier(0.2, 1.4, 0.3, 1)',
    subtle: 'cubic-bezier(0.4, 0, 0.5, 1)',
  },
  linear: 'linear',
} as const;

export type MotionEasingType = 'entrance' | 'exit' | 'transition' | 'bounce';

export interface MotionEasings {
  entrance: { moderate: string; subtle: string };
  exit: { moderate: string; subtle: string };
  transition: { moderate: string; subtle: string };
  bounce: { moderate: string; subtle: string };
  linear: string;
}

/** Duration step reference into the computed motion scale. */
export type MotionDurationStep = '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl';

/** Offset step reference into the computed offset scale. */
export type MotionOffsetStep = 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl';

/** Transition direction type for screen transition patterns. */
export type TransitionDirection = 'stack' | 'X' | 'toplevel' | 'X-sequential' | 'stagger' | 'scale';

/** A single transition pattern spec — stored per brand in Convex. */
export interface TransitionPatternConfig {
  name: string;
  description: string;
  direction: TransitionDirection;
  duration: MotionDurationStep;
  easing: MotionEasingType;
  exitDuration?: MotionDurationStep;
  exitEasing?: MotionEasingType;
  /** For lateral: per-choreography timing */
  lateral?: {
    fadeOutDuration: MotionDurationStep;
    fadeInDuration: MotionDurationStep;
    offset: MotionOffsetStep;
  };
  /** For top-level: offset before screen B fades in */
  offset?: MotionOffsetStep;
  /** For skeleton: stagger delay between elements */
  stagger?: MotionOffsetStep;
}

/** Interaction pattern type. */
export type InteractionPatternType = 'tap' | 'hover' | 'longPress' | 'disable' | 'focus' | 'loading';

/** A single interaction sub-pattern (e.g. "Scale Down" within Tap). */
export interface InteractionSubPattern {
  name: string;
  description: string;
  duration: MotionDurationStep;
  easing: MotionEasingType;
  /** Scale percentage for scale-based interactions */
  scalePercent?: number;
  /** Additional duration (e.g. long press delay) */
  delayDuration?: MotionDurationStep;
  /** Property being animated (e.g. 'opacity', 'scale', 'stroke') */
  property?: string;
  /** Target value (e.g. '30%', '2px') */
  targetValue?: string;
  /** Whether the interaction is interruptible */
  interruptible?: boolean;
  /** Status: 'active' | 'deferred' | 'pending' */
  status?: 'active' | 'deferred' | 'pending';
}

/** A top-level interaction pattern with its sub-patterns. */
export interface InteractionPatternConfig {
  type: InteractionPatternType;
  name: string;
  variantCount?: number;
  subPatterns: InteractionSubPattern[];
}

/** Config stored in Convex per brand. */
export interface MotionFoundationConfig {
  baseDuration: number;
  easings: MotionEasings;
  /** Interaction pattern specs — optional for backwards compatibility. */
  interactionPatterns?: InteractionPatternConfig[];
  /** Transition pattern specs — optional for backwards compatibility. */
  transitionPatterns?: TransitionPatternConfig[];
}

/** All 37 computed motion token values derived from a brand config. */
export interface MotionScale {
  // Moderate durations (ms)
  duration: {
    moderate: { '2xs': number; xs: number; s: number; m: number; l: number; xl: number; '2xl': number; '3xl': number };
    subtle: { '2xs': number; xs: number; s: number; m: number; l: number; xl: number; '2xl': number; '3xl': number };
  };
  // Offset / stagger delays (ms)
  offset: {
    moderate: { s: number; m: number; l: number; xl: number; '2xl': number; '3xl': number };
    subtle: { s: number; m: number; l: number; xl: number; '2xl': number; '3xl': number };
  };
  easings: MotionEasings;
}

/**
 * Derive all motion token values from a single base duration.
 * Uses a fixed 1.5x ratio between adjacent t-shirt-size steps.
 * Subtle base = Moderate M (base / 1.5).
 */
export function computeMotionScale(baseDuration: number, easings: MotionEasings = JIO_MOTION_EASINGS): MotionScale {
  const r = MOTION_SCALE_RATIO;
  const round = (v: number) => Math.round(v / 5) * 5;

  // Moderate durations — 8 steps centred on L = base
  const modL = baseDuration;
  const modM = round(modL / r);
  const modS = round(modM / r);
  const modXS = round(modS / r);
  const mod2XS = round(modXS / r);
  const modXL = round(modL * r);
  const mod2XL = round(modXL * r);
  const mod3XL = round(mod2XL * r);

  // Subtle base = Moderate M
  const subL = modM;
  const subM = round(subL / r);
  const subS = round(subM / r);
  const subXS = round(subS / r);
  const sub2XS = round(subXS / r);
  const subXL = round(subL * r);
  const sub2XL = round(subXL * r);
  const sub3XL = round(sub2XL * r);

  // Moderate offsets — derived from the duration scale (shifted down ~3 steps)
  const offModL = modXS;           // = base / r^3
  const offModXL = modM;           // = base / r
  const offMod2XL = modXL;         // = base * r
  const offMod3XL = mod3XL;        // = base * r^3
  const offModM = round(mod2XS / r); // below 2XS in the scale
  const offModS = round(offModM / r);

  // Subtle offsets — same derivation from subtle base
  const offSubL = subXS;
  const offSubXL = subM;
  const offSub2XL = subXL;
  const offSub3XL = sub3XL;
  const offSubM = round(sub2XS / r);
  const offSubS = round(offSubM / r);

  return {
    duration: {
      moderate: { '2xs': mod2XS, xs: modXS, s: modS, m: modM, l: modL, xl: modXL, '2xl': mod2XL, '3xl': mod3XL },
      subtle: { '2xs': sub2XS, xs: subXS, s: subS, m: subM, l: subL, xl: subXL, '2xl': sub2XL, '3xl': sub3XL },
    },
    offset: {
      moderate: { s: offModS, m: offModM, l: offModL, xl: offModXL, '2xl': offMod2XL, '3xl': offMod3XL },
      subtle: { s: offSubS, m: offSubM, l: offSubL, xl: offSubXL, '2xl': offSub2XL, '3xl': offSub3XL },
    },
    easings,
  };
}

/** Default Jio interaction pattern specs. */
export const JIO_INTERACTION_PATTERNS: InteractionPatternConfig[] = [
  {
    type: 'tap',
    name: 'Tap',
    variantCount: 3,
    subPatterns: [
      { name: 'Surface Colour', description: 'Background tint on press — FG-Bold → FG-Bold-Pressed', duration: 'm', easing: 'transition', property: 'background-color', status: 'active' },
      { name: 'Scale Down', description: 'Press shrinks component', duration: 'm', easing: 'transition', scalePercent: 3, interruptible: true },
      { name: 'Scale Up', description: 'Press enlarges small controls', duration: 'm', easing: 'transition', scalePercent: 7, interruptible: true },
    ],
  },
  {
    type: 'hover',
    name: 'Hover',
    variantCount: 3,
    subPatterns: [
      { name: 'Surface Colour', description: 'Background tint on hover — FG-Bold → FG-Bold-Hover', duration: 'm', easing: 'transition', property: 'background-color', status: 'active' },
      { name: 'Scale Up', description: 'Card grows on hover — small uses L, large uses XL', duration: 'l', easing: 'transition', scalePercent: 5 },
      { name: 'Transform', description: 'Hovered card contracts, neighbours shift closer', duration: 'xl', easing: 'transition' },
    ],
  },
  {
    type: 'longPress',
    name: 'Long Press',
    variantCount: 2,
    subPatterns: [
      { name: 'Surface Colour', description: 'Background tint on hold — FG-Bold → FG-Bold-Pressed', duration: 'm', easing: 'transition', property: 'background-color', status: 'active' },
      { name: 'Scale Down', description: 'Two-phase: surface change then scale after delay', duration: 'm', easing: 'transition', scalePercent: 3, delayDuration: 'xl' },
    ],
  },
  {
    type: 'disable',
    name: 'Disable',
    subPatterns: [
      { name: 'Opacity', description: 'Fade to disabled state', duration: 'm', easing: 'transition', property: 'opacity', targetValue: '30%' },
    ],
  },
  {
    type: 'focus',
    name: 'Focus',
    subPatterns: [
      { name: 'Focus Ring', description: 'Stroke appears + slight scale', duration: 'l', easing: 'transition', property: 'box-shadow', targetValue: '2px' },
    ],
  },
  {
    type: 'loading',
    name: 'Loading',
    subPatterns: [
      { name: 'Loading', description: 'Loading state animation', duration: 'm', easing: 'transition', status: 'pending' },
    ],
  },
];

/** Default Jio transition pattern specs. */
export const JIO_TRANSITION_PATTERNS: TransitionPatternConfig[] = [
  {
    name: 'Stack',
    description: 'New screen stacks from right with scrim over current screen.',
    direction: 'stack',
    duration: 'xl',
    easing: 'entrance',
    exitDuration: 'l',
    exitEasing: 'exit',
  },
  {
    name: 'Forward',
    description: 'Screen A slides left by 30%, Screen B slides in completely from right.',
    direction: 'X',
    duration: 'xl',
    easing: 'transition',
  },
  {
    name: 'Top Level',
    description: 'Screen A fades out, then Screen B fades in after offset.',
    direction: 'toplevel',
    duration: 's',
    easing: 'transition',
    offset: 'l',
  },
  {
    name: 'Lateral',
    description: 'Tab content choreography: slide + staggered fade.',
    direction: 'X-sequential',
    duration: 'xl',
    easing: 'transition',
    lateral: {
      fadeOutDuration: 's',
      fadeInDuration: 'm',
      offset: 'l',
    },
  },
  {
    name: 'Skeleton',
    description: 'Skeleton pulse — neutral 2100 → 2400 → 2100, staggered per element.',
    direction: 'stagger',
    duration: '3xl',
    easing: 'transition',
    stagger: 's',
  },
  {
    name: 'Transform',
    description: 'Card morphs into modal — position, size, and radius animate together.',
    direction: 'scale',
    duration: 'xl',
    easing: 'transition',
    exitDuration: 'l',
    exitEasing: 'exit',
  },
];

/** Returns the default Jio motion foundation config. */
export function getDefaultMotionFoundationConfig(): MotionFoundationConfig {
  return {
    baseDuration: JIO_MOTION_BASE_DURATION,
    easings: {
      entrance: { ...JIO_MOTION_EASINGS.entrance },
      exit: { ...JIO_MOTION_EASINGS.exit },
      transition: { ...JIO_MOTION_EASINGS.transition },
      bounce: { ...JIO_MOTION_EASINGS.bounce },
      linear: JIO_MOTION_EASINGS.linear,
    },
    interactionPatterns: JIO_INTERACTION_PATTERNS.map(p => ({ ...p, subPatterns: p.subPatterns.map(s => ({ ...s })) })),
    transitionPatterns: JIO_TRANSITION_PATTERNS.map(p => ({ ...p })),
  };
}
