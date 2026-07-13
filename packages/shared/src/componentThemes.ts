import type {
  ComponentRecipeDefinition,
  ComponentThemeFamilyDefinition,
  ComponentThemeFamilyId,
} from './types/componentRecipes';
import {
  COMPONENT_DECORATION_STROKE_STYLE_OPTIONS,
  COMPONENT_DECORATION_STROKE_WIDTH_OPTIONS,
} from './componentDecorationCapabilities';

const SHAPE_OPTIONS = [
  { value: 'inherit', label: 'Inherit', description: 'Use each component default.' },
  { value: 'sharp', label: 'Sharp', description: 'Squared controls for utilitarian brands.' },
  { value: 'soft', label: 'Soft', description: 'Small radius with clear control edges.' },
  { value: 'rounded', label: 'Rounded', description: 'Friendly rounded controls.' },
  { value: 'pill', label: 'Pill', description: 'Fully rounded action and selection controls.' },
  { value: 'custom', label: 'Custom', description: 'Pick an exact Shape token for this family.' },
];

const SCALE_OPTIONS = [
  { value: 'compact', label: 'Compact', description: 'Tighter controls for dense interfaces.' },
  { value: 'default', label: 'Default', description: 'Use the component default scale.' },
  { value: 'roomy', label: 'Roomy', description: 'More generous controls for prominent actions.' },
  { value: 'custom', label: 'Custom', description: 'Tune per-size metrics with a ramp and pinned cells.' },
];

const CARD_SHAPE_OPTIONS = [
  { value: 'inherit', label: 'Inherit', description: 'Use the card/container default.' },
  { value: 'sharp', label: 'Sharp', description: 'Squared cards for utilitarian brands.' },
  { value: 'soft', label: 'Soft', description: 'Small card radius with crisp edges.' },
  { value: 'rounded', label: 'Rounded', description: 'Friendly rounded cards.' },
  { value: 'expressive', label: 'Expressive', description: 'Larger radius for editorial or branded cards.' },
  { value: 'custom', label: 'Custom', description: 'Pick an exact Shape token for cards and containers.' },
];

const CARD_ELEVATION_OPTIONS = [
  { value: 'inherit', label: 'Inherit', description: 'Use the card/container default elevation.' },
  { value: 'flat', label: 'Flat', description: 'No shadow; hierarchy comes from fill and stroke.' },
  { value: 'raised', label: 'Raised', description: 'Subtle foundation elevation for card separation.' },
  { value: 'floating', label: 'Floating', description: 'Stronger foundation elevation for prominent cards.' },
];

const CARD_STROKE_OPTIONS = [
  { value: 'inherit', label: 'Inherit', description: 'Use the card/container default stroke.' },
  { value: 'none', label: 'None', description: 'No visible card stroke.' },
  { value: 'subtle', label: 'Subtle', description: 'Hairline stroke for quiet card separation.' },
  { value: 'default', label: 'Default', description: 'Standard card stroke.' },
];

const CARD_SURFACE_OPTIONS = [
  { value: 'inherit', label: 'Inherit', description: 'Use the card/container default fill.' },
  { value: 'default', label: 'Default', description: 'Use the page surface fill.' },
  { value: 'subtle', label: 'Subtle', description: 'Use a subtle neutral card fill.' },
  { value: 'elevated', label: 'Elevated', description: 'Use the elevated surface fill.' },
];

const ATTENTION_STYLE_OPTIONS = [
  { value: 'solid', label: 'Solid', description: 'Filled brand surface with on-colour text.' },
  { value: 'tonal', label: 'Tonal', description: 'Tinted fill with accent text.' },
  { value: 'outline', label: 'Outline', description: 'Transparent fill with a visible stroke.' },
  { value: 'quiet', label: 'Quiet', description: 'Text colour only, with state fills on interaction.' },
];

/** Visual weight of each attention style; used to validate level ordering. */
export const ATTENTION_STYLE_WEIGHTS: Record<string, number> = {
  solid: 4,
  tonal: 3,
  outline: 2,
  quiet: 1,
};

export type AttentionLevel = 'high' | 'medium' | 'low';
export type AttentionVariant = 'bold' | 'subtle' | 'ghost';
export type AttentionStyleValue = 'solid' | 'tonal' | 'outline' | 'quiet';

/** Attention levels map 1:1 onto the existing Button variants. */
export const ATTENTION_LEVEL_VARIANTS: Record<AttentionLevel, AttentionVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

export const ATTENTION_STYLE_DECISION_IDS: Record<AttentionLevel, string> = {
  high: 'highAttentionStyle',
  medium: 'mediumAttentionStyle',
  low: 'lowAttentionStyle',
};

export const ATTENTION_ROLE_DECISION_IDS: Record<AttentionLevel, string> = {
  high: 'highAttentionRole',
  medium: 'mediumAttentionRole',
  low: 'lowAttentionRole',
};

/** Factory rendering per level — these selections emit no overrides. */
export const ATTENTION_STYLE_DEFAULTS: Record<AttentionLevel, AttentionStyleValue> = {
  high: 'solid',
  medium: 'tonal',
  low: 'quiet',
};

const DECORATION_IMPACT_OPTIONS = [
  { value: 'inherit', label: 'Inherit', description: 'Use assigned ornaments at their default impact.' },
  { value: 'subtle', label: 'Subtle', description: 'Reduce assigned Button ornaments for quieter brands.' },
  { value: 'balanced', label: 'Balanced', description: 'Use a medium ornament impact for decorated action brands.' },
  { value: 'full', label: 'Full', description: 'Render assigned ornaments at full height.' },
];

const CSS_DECORATION_OPTIONS = [
  { value: 'none', label: 'None', description: 'No CSS-only component decoration.' },
  { value: 'inset-stroke', label: 'Inset stroke', description: 'Adds an inset detail without changing layout.' },
  { value: 'underline', label: 'Underline', description: 'Adds an underline treatment to supported components.' },
  { value: 'cut-corner', label: 'Cut corner', description: 'Applies angled brand corners to supported components.' },
];

const CSS_DECORATION_STROKE_WIDTH_OPTIONS = COMPONENT_DECORATION_STROKE_WIDTH_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
    description: option.description,
  }),
);

const CSS_DECORATION_STROKE_STYLE_OPTIONS = COMPONENT_DECORATION_STROKE_STYLE_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
    description: option.description,
  }),
);

const APPEARANCE_ROLE_OPTIONS = [
  { value: 'primary', label: 'Primary', description: 'Use the brand primary role for default controls.' },
  { value: 'secondary', label: 'Secondary', description: 'Use the secondary accent role for default controls.' },
  { value: 'neutral', label: 'Neutral', description: 'Use the neutral role for default controls.' },
  { value: 'sparkle', label: 'Sparkle', description: 'Use the sparkle accent role for default controls.' },
  { value: 'brand-bg', label: 'Brand background', description: 'Use the brand background role for default controls.' },
  { value: 'positive', label: 'Positive', description: 'Use the positive status role for default controls.' },
  { value: 'negative', label: 'Negative', description: 'Use the negative status role for default controls.' },
  { value: 'warning', label: 'Warning', description: 'Use the warning status role for default controls.' },
  { value: 'informative', label: 'Informative', description: 'Use the informative status role for default controls.' },
];

const DEFAULT_APPEARANCE_OPTIONS = [
  {
    value: 'inherit',
    label: 'Inherit',
    description: 'Follow each component default role (Primary).',
  },
  ...APPEARANCE_ROLE_OPTIONS,
];

const ATTENTION_ROLE_OPTIONS = [
  {
    value: 'inherit',
    label: 'Inherit',
    description: 'Follow the default action role for this level.',
  },
  ...APPEARANCE_ROLE_OPTIONS,
];

const ROLE_PREFIXES: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  neutral: 'Neutral',
  sparkle: 'Sparkle',
  'brand-bg': 'Brand-Bg',
  positive: 'Positive',
  negative: 'Negative',
  warning: 'Warning',
  informative: 'Informative',
};

function roleToken(role: string, token: string): string {
  return `var(--${ROLE_PREFIXES[role]}-${token})`;
}

function actionRoleOverrides(role: string) {
  return [
    { tokenName: 'roleBold', value: roleToken(role, 'Bold') },
    { tokenName: 'roleBoldHigh', value: roleToken(role, 'Bold-High') },
    { tokenName: 'roleBoldHover', value: roleToken(role, 'Bold-Hover') },
    { tokenName: 'roleBoldPressed', value: roleToken(role, 'Bold-Pressed') },
    { tokenName: 'roleSubtle', value: roleToken(role, 'Subtle') },
    { tokenName: 'roleSubtleHover', value: roleToken(role, 'Subtle-Hover') },
    { tokenName: 'roleSubtlePressed', value: roleToken(role, 'Subtle-Pressed') },
    { tokenName: 'roleHigh', value: roleToken(role, 'High') },
    { tokenName: 'roleMediumText', value: roleToken(role, 'Medium-Text') },
    { tokenName: 'roleTinted', value: roleToken(role, 'Tinted') },
    { tokenName: 'roleTintedA11y', value: roleToken(role, 'TintedA11y') },
    { tokenName: 'roleStrokeLow', value: roleToken(role, 'Stroke-Low') },
    { tokenName: 'roleStrokeMedium', value: roleToken(role, 'Stroke-Medium') },
    { tokenName: 'roleHover', value: roleToken(role, 'Hover') },
    { tokenName: 'rolePressed', value: roleToken(role, 'Pressed') },
  ];
}

function controlRoleOverrides(prefix: 'Input' | 'Checkbox' | 'Radio' | 'Switch', role: string) {
  const map: Record<string, string> = {
    roleBold: roleToken(role, 'Bold'),
    roleBoldHigh: roleToken(role, 'Bold-High'),
    roleBoldHover: roleToken(role, 'Bold-Hover'),
    roleBoldPressed: roleToken(role, 'Bold-Pressed'),
    roleHigh: roleToken(role, 'High'),
    roleHover: roleToken(role, 'Hover'),
    rolePressed: roleToken(role, 'Pressed'),
    roleStrokeMedium: roleToken(role, 'Stroke-Medium'),
  };

  if (prefix === 'Input') {
    return [
      ...Object.entries(map).map(([tokenName, value]) => ({ tokenName, value })),
      { tokenName: 'roleLow', value: roleToken(role, 'Low') },
      { tokenName: 'roleMediumText', value: roleToken(role, 'Medium-Text') },
      { tokenName: 'roleStrokeLow', value: roleToken(role, 'Stroke-Low') },
      { tokenName: 'roleTintedA11y', value: roleToken(role, 'TintedA11y') },
      { tokenName: 'roleSubtle', value: roleToken(role, 'Minimal') },
    ];
  }

  return Object.entries(map).map(([tokenName, value]) => ({ tokenName, value }));
}

const actionRole = Object.fromEntries(
  APPEARANCE_ROLE_OPTIONS.map((option) => [option.value, actionRoleOverrides(option.value)])
);

const inputRole = Object.fromEntries(
  APPEARANCE_ROLE_OPTIONS.map((option) => [option.value, controlRoleOverrides('Input', option.value)])
);

const checkboxRole = Object.fromEntries(
  APPEARANCE_ROLE_OPTIONS.map((option) => [option.value, controlRoleOverrides('Checkbox', option.value)])
);

const radioRole = Object.fromEntries(
  APPEARANCE_ROLE_OPTIONS.map((option) => [option.value, controlRoleOverrides('Radio', option.value)])
);

const switchRole = Object.fromEntries(
  APPEARANCE_ROLE_OPTIONS.map((option) => [option.value, controlRoleOverrides('Switch', option.value)])
);

const actionShape = {
  inherit: [],
  sharp: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'borderRadius', value: 'Shape-3' }],
  rounded: [{ tokenName: 'borderRadius', value: 'Shape-4' }],
  pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
};

const navigationTabShape = {
  inherit: [],
  sharp: [{ tokenName: 'itemRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'itemRadius', value: 'Shape-2' }],
  rounded: [{ tokenName: 'itemRadius', value: 'Shape-4' }],
  pill: [{ tokenName: 'itemRadius', value: 'Shape-Pill' }],
};

const webHeaderShape = {
  inherit: [],
  sharp: [
    { tokenName: 'itemBorderRadius', value: 'Shape-0' },
    { tokenName: 'searchBorderRadius', value: 'Shape-0' },
  ],
  soft: [
    { tokenName: 'itemBorderRadius', value: 'Shape-2' },
    { tokenName: 'searchBorderRadius', value: 'Shape-2' },
  ],
  rounded: [
    { tokenName: 'itemBorderRadius', value: 'Shape-4' },
    { tokenName: 'searchBorderRadius', value: 'Shape-4' },
  ],
  pill: [
    { tokenName: 'itemBorderRadius', value: 'Shape-Pill' },
    { tokenName: 'searchBorderRadius', value: 'Shape-Pill' },
  ],
};

const bottomNavigationShape = {
  inherit: [],
  sharp: [{ tokenName: 'itemBorderRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'itemBorderRadius', value: 'Shape-2' }],
  rounded: [{ tokenName: 'itemBorderRadius', value: 'Shape-4' }],
  pill: [{ tokenName: 'itemBorderRadius', value: 'Shape-Pill' }],
};

const displayBadgeShape = {
  inherit: [],
  sharp: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'borderRadius', value: 'Shape-1' }],
  rounded: [{ tokenName: 'borderRadius', value: 'Shape-2' }],
  pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
};

const sliderShape = {
  inherit: [],
  sharp: [
    { tokenName: 'trackBorderRadius', value: 'Shape-0' },
    { tokenName: 'knobBorderRadius', value: 'Shape-0' },
  ],
  soft: [
    { tokenName: 'trackBorderRadius', value: 'Shape-1' },
    { tokenName: 'knobBorderRadius', value: 'Shape-2' },
  ],
  rounded: [
    { tokenName: 'trackBorderRadius', value: 'Shape-2' },
    { tokenName: 'knobBorderRadius', value: 'Shape-Pill' },
  ],
  pill: [
    { tokenName: 'trackBorderRadius', value: 'Shape-Pill' },
    { tokenName: 'knobBorderRadius', value: 'Shape-Pill' },
  ],
};

const touchSliderShape = {
  inherit: [],
  sharp: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'borderRadius', value: 'Shape-2' }],
  rounded: [{ tokenName: 'borderRadius', value: 'Shape-3' }],
  pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
};

const paginationDotsShape = {
  inherit: [],
  sharp: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'borderRadius', value: 'Shape-1' }],
  rounded: [{ tokenName: 'borderRadius', value: 'Shape-1-5' }],
  pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
};

const segmentedControlShape = {
  inherit: [],
  sharp: [
    { tokenName: 'trackRadiusRectangular', value: 'Shape-0' },
    { tokenName: 'itemRadiusRectangular', value: 'Shape-0' },
  ],
  soft: [
    { tokenName: 'trackRadiusRectangular', value: 'Shape-1-5' },
    { tokenName: 'itemRadiusRectangular', value: 'Shape-1' },
  ],
  rounded: [
    { tokenName: 'trackRadiusRectangular', value: 'Shape-2-5' },
    { tokenName: 'itemRadiusRectangular', value: 'Shape-2' },
  ],
  pill: [
    { tokenName: 'trackRadiusRectangular', value: 'Shape-Pill' },
    { tokenName: 'itemRadiusRectangular', value: 'Shape-Pill' },
  ],
};

const avatarShape = {
  inherit: [],
  sharp: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'borderRadius', value: 'Shape-2' }],
  rounded: [{ tokenName: 'borderRadius', value: 'Shape-4' }],
  pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
};

const listItemShape = {
  inherit: [],
  sharp: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'borderRadius', value: 'Shape-1-5' }],
  rounded: [{ tokenName: 'borderRadius', value: 'Shape-2-5' }],
  expressive: [{ tokenName: 'borderRadius', value: 'Shape-4' }],
};

const cardShape = {
  inherit: [],
  sharp: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'borderRadius', value: 'Shape-3-5' }],
  rounded: [{ tokenName: 'borderRadius', value: 'Shape-4-5' }],
  expressive: [{ tokenName: 'borderRadius', value: 'Shape-7' }],
};

const cardElevation = {
  inherit: [],
  flat: [{ tokenName: 'boxShadow', value: 'Elevation-0' }],
  raised: [{ tokenName: 'boxShadow', value: 'Elevation-1' }],
  floating: [{ tokenName: 'boxShadow', value: 'Elevation-2' }],
};

const cardStroke = {
  inherit: [],
  none: [
    { tokenName: 'borderWidth', value: 'Stroke-None' },
    { tokenName: 'borderColor', value: 'transparent' },
  ],
  subtle: [
    { tokenName: 'borderWidth', value: 'Stroke-S' },
    { tokenName: 'borderColor', value: 'Neutral-Stroke-Low' },
  ],
  default: [
    { tokenName: 'borderWidth', value: 'Stroke-M' },
    { tokenName: 'borderColor', value: 'Neutral-Stroke-Low' },
  ],
};

const cardSurface = {
  inherit: [],
  default: [{ tokenName: 'backgroundColor', value: 'Surface-Main' }],
  subtle: [{ tokenName: 'backgroundColor', value: 'Neutral-Subtle' }],
  elevated: [{ tokenName: 'backgroundColor', value: 'Surface-Elevated' }],
};

const cardScale = {
  compact: [
    { tokenName: 'padding', value: 'Spacing-4' },
    { tokenName: 'gap', value: 'Spacing-3' },
  ],
  default: [],
  roomy: [
    { tokenName: 'padding', value: 'Spacing-5' },
    { tokenName: 'gap', value: 'Spacing-4' },
  ],
};

const TEXT_CASE_OPTIONS = [
  { value: 'none', label: 'Sentence', description: 'Render labels exactly as authored.' },
  { value: 'uppercase', label: 'Uppercase', description: 'Force display labels to capital letters.' },
];

const displayTextCase = {
  none: [],
  uppercase: [
    { tokenName: 'textTransform', value: 'uppercase' },
    { tokenName: 'letterSpacing', value: '0.05em' },
  ],
};

const compactButtonScale = [
  { tokenName: 'minHeight.6', value: 'Spacing-5' },
  { tokenName: 'minHeight.8', value: 'Spacing-7' },
  { tokenName: 'minHeight.10', value: 'Spacing-9' },
  { tokenName: 'minHeight.12', value: 'Spacing-10' },
  { tokenName: 'paddingHorizontal.8', value: 'Spacing-3' },
  { tokenName: 'paddingHorizontal.10', value: 'Spacing-3-5' },
  { tokenName: 'paddingHorizontal.12', value: 'Spacing-4' },
  { tokenName: 'paddingHorizontalStart.8', value: 'Spacing-3' },
  { tokenName: 'paddingHorizontalStart.10', value: 'Spacing-3-5' },
  { tokenName: 'paddingHorizontalStart.12', value: 'Spacing-4' },
  { tokenName: 'paddingHorizontalEnd.8', value: 'Spacing-3' },
  { tokenName: 'paddingHorizontalEnd.10', value: 'Spacing-3-5' },
  { tokenName: 'paddingHorizontalEnd.12', value: 'Spacing-4' },
];

const roomyButtonScale = [
  { tokenName: 'minHeight.6', value: 'Spacing-7' },
  { tokenName: 'minHeight.8', value: 'Spacing-9' },
  { tokenName: 'minHeight.10', value: 'Spacing-12' },
  { tokenName: 'minHeight.12', value: 'Spacing-14' },
  { tokenName: 'paddingVertical.6', value: 'Spacing-1' },
  { tokenName: 'paddingVertical.8', value: 'Spacing-1' },
  { tokenName: 'paddingVertical.10', value: 'Spacing-2' },
  { tokenName: 'paddingVertical.12', value: 'Spacing-2-5' },
  { tokenName: 'paddingHorizontal.6', value: 'Spacing-4' },
  { tokenName: 'paddingHorizontal.8', value: 'Spacing-5' },
  { tokenName: 'paddingHorizontal.10', value: 'Spacing-6' },
  { tokenName: 'paddingHorizontal.12', value: 'Spacing-7' },
  { tokenName: 'paddingHorizontalStart.6', value: 'Spacing-4' },
  { tokenName: 'paddingHorizontalStart.8', value: 'Spacing-5' },
  { tokenName: 'paddingHorizontalStart.10', value: 'Spacing-6' },
  { tokenName: 'paddingHorizontalStart.12', value: 'Spacing-7' },
  { tokenName: 'paddingHorizontalEnd.6', value: 'Spacing-4' },
  { tokenName: 'paddingHorizontalEnd.8', value: 'Spacing-5' },
  { tokenName: 'paddingHorizontalEnd.10', value: 'Spacing-6' },
  { tokenName: 'paddingHorizontalEnd.12', value: 'Spacing-7' },
];

const simpleHorizontalScale = {
  compact: [{ tokenName: 'paddingHorizontal', value: 'Spacing-2-5' }],
  default: [],
  roomy: [{ tokenName: 'paddingHorizontal', value: 'Spacing-4' }],
};

const buttonDecorationImpact = {
  inherit: [],
  subtle: [{ tokenName: 'ornamentHeightScale', value: '0.5' }],
  balanced: [{ tokenName: 'ornamentHeightScale', value: '0.75' }],
  full: [{ tokenName: 'ornamentHeightScale', value: '1' }],
};

// Button colour theme overrides are scoped onto the Button element by
// buildAllComponentCSS. That lets them consume the component-local --_btn-*
// variables after appearance classes and [data-surface] remapping have resolved.
const BUTTON_CSS_DECORATION_STROKE = 'var(--Button-cssDecorationStrokeWidth, var(--Stroke-L))';
const BUTTON_CSS_DECORATION_STYLE = 'var(--Button-cssDecorationStrokeStyle, solid)';
const ICON_BUTTON_CSS_DECORATION_STROKE =
  'var(--IconButton-cssDecorationStrokeWidth, var(--Stroke-L))';
const ICON_BUTTON_CSS_DECORATION_STYLE = 'var(--IconButton-cssDecorationStrokeStyle, solid)';

// ── Attention-level style generators ─────────────────────────────────────────
// High/Medium/Low map onto the bold/subtle/ghost variants. Every emitted value
// routes through a per-variant role slot (--{Comp}-role{Slot}-{variant}) before
// falling back to the appearance-level intermediates, so the per-level role
// decisions compose with per-level styles without extra CSS branches.

/** Per-variant role slot with an appearance-intermediate fallback (Button). */
function buttonSlot(slot: string, variant: AttentionVariant, fallbackVar: string): string {
  return `var(--Button-${slot}-${variant}, var(${fallbackVar}))`;
}

/** Per-variant role slot with the component-slot + Primary fallback (IconButton). */
function iconButtonSlot(slot: string, variant: AttentionVariant, roleTokenName: string): string {
  return `var(--IconButton-${slot}-${variant}, var(--IconButton-${slot}, var(--Primary-${roleTokenName})))`;
}

function buttonAttentionStyleOverrides(
  variant: AttentionVariant,
  style: AttentionStyleValue,
): Array<{ tokenName: string; value: string }> {
  const accent = buttonSlot('roleTintedA11y', variant, '--_btn-default-accent-a11y');
  const flatStroke = [
    { tokenName: `borderColor.${variant}`, value: 'transparent' },
    { tokenName: `borderWidth.${variant}`, value: '0px' },
  ];

  switch (style) {
    case 'solid':
      return [
        { tokenName: `backgroundColor.${variant}`, value: buttonSlot('roleBold', variant, '--_btn-bold') },
        { tokenName: `backgroundColor.${variant}-hover`, value: buttonSlot('roleBoldHover', variant, '--_btn-bold-hover') },
        { tokenName: `backgroundColor.${variant}-pressed`, value: buttonSlot('roleBoldPressed', variant, '--_btn-bold-pressed') },
        { tokenName: `textColor.${variant}`, value: buttonSlot('roleBoldHigh', variant, '--_btn-bold-high') },
        ...flatStroke,
      ];
    case 'tonal':
      return [
        { tokenName: `backgroundColor.${variant}`, value: buttonSlot('roleSubtle', variant, '--_btn-subtle') },
        { tokenName: `backgroundColor.${variant}-hover`, value: buttonSlot('roleSubtleHover', variant, '--_btn-subtle-hover') },
        { tokenName: `backgroundColor.${variant}-pressed`, value: buttonSlot('roleSubtlePressed', variant, '--_btn-subtle-pressed') },
        { tokenName: `textColor.${variant}`, value: accent },
        ...flatStroke,
      ];
    case 'outline':
      if (variant === 'ghost') {
        // .ghost zeroes the cssDecoration hooks, so ghost outline renders
        // through the inset box-shadow stroke instead.
        return [
          { tokenName: `backgroundColor.${variant}`, value: 'transparent' },
          { tokenName: `backgroundColor.${variant}-hover`, value: 'transparent' },
          { tokenName: `backgroundColor.${variant}-pressed`, value: 'transparent' },
          { tokenName: `textColor.${variant}`, value: accent },
          { tokenName: `borderWidth.${variant}`, value: BUTTON_CSS_DECORATION_STROKE },
          { tokenName: `borderColor.${variant}`, value: accent },
          { tokenName: `solidStrokeColor.${variant}`, value: accent },
        ];
      }
      return [
        { tokenName: `backgroundColor.${variant}`, value: 'transparent' },
        { tokenName: `backgroundColor.${variant}-hover`, value: 'transparent' },
        { tokenName: `backgroundColor.${variant}-pressed`, value: 'transparent' },
        { tokenName: `textColor.${variant}`, value: accent },
        ...flatStroke,
        { tokenName: `cssDecorationColor.${variant}`, value: accent },
        { tokenName: `cssDecorationInsetStrokeWidth.${variant}`, value: BUTTON_CSS_DECORATION_STROKE },
        { tokenName: `cssDecorationStrokeStyle.${variant}`, value: BUTTON_CSS_DECORATION_STYLE },
      ];
    case 'quiet':
      return [
        { tokenName: `backgroundColor.${variant}`, value: 'transparent' },
        { tokenName: `backgroundColor.${variant}-hover`, value: buttonSlot('roleHover', variant, '--_btn-default-hover') },
        { tokenName: `backgroundColor.${variant}-pressed`, value: buttonSlot('rolePressed', variant, '--_btn-default-pressed') },
        { tokenName: `textColor.${variant}`, value: accent },
        ...flatStroke,
      ];
  }
}

function iconButtonAttentionStyleOverrides(
  variant: AttentionVariant,
  style: AttentionStyleValue,
): Array<{ tokenName: string; value: string }> {
  const accent = iconButtonSlot('roleTintedA11y', variant, 'TintedA11y');
  const flatStroke = [
    { tokenName: `borderColor.${variant}`, value: 'transparent' },
    { tokenName: `borderWidth.${variant}`, value: '0px' },
  ];

  switch (style) {
    case 'solid':
      return [
        { tokenName: `backgroundColor.${variant}`, value: iconButtonSlot('roleBold', variant, 'Bold') },
        { tokenName: `backgroundColor.${variant}-hover`, value: iconButtonSlot('roleBoldHover', variant, 'Bold-Hover') },
        { tokenName: `backgroundColor.${variant}-pressed`, value: iconButtonSlot('roleBoldPressed', variant, 'Bold-Pressed') },
        { tokenName: `iconColor.${variant}`, value: iconButtonSlot('roleBoldHigh', variant, 'Bold-High') },
        ...flatStroke,
      ];
    case 'tonal':
      return [
        { tokenName: `backgroundColor.${variant}`, value: iconButtonSlot('roleSubtle', variant, 'Subtle') },
        { tokenName: `backgroundColor.${variant}-hover`, value: iconButtonSlot('roleSubtleHover', variant, 'Subtle-Hover') },
        { tokenName: `backgroundColor.${variant}-pressed`, value: iconButtonSlot('roleSubtlePressed', variant, 'Subtle-Pressed') },
        { tokenName: `iconColor.${variant}`, value: accent },
        ...flatStroke,
      ];
    case 'outline':
      if (variant === 'ghost') {
        return [
          { tokenName: `backgroundColor.${variant}`, value: 'transparent' },
          { tokenName: `backgroundColor.${variant}-hover`, value: 'transparent' },
          { tokenName: `backgroundColor.${variant}-pressed`, value: 'transparent' },
          { tokenName: `iconColor.${variant}`, value: accent },
          { tokenName: `borderWidth.${variant}`, value: ICON_BUTTON_CSS_DECORATION_STROKE },
          { tokenName: `borderColor.${variant}`, value: accent },
          { tokenName: `solidStrokeColor.${variant}`, value: accent },
        ];
      }
      return [
        { tokenName: `backgroundColor.${variant}`, value: 'transparent' },
        { tokenName: `backgroundColor.${variant}-hover`, value: 'transparent' },
        { tokenName: `backgroundColor.${variant}-pressed`, value: 'transparent' },
        { tokenName: `iconColor.${variant}`, value: accent },
        ...flatStroke,
        { tokenName: `cssDecorationColor.${variant}`, value: accent },
        { tokenName: `cssDecorationInsetStrokeWidth.${variant}`, value: ICON_BUTTON_CSS_DECORATION_STROKE },
        { tokenName: `cssDecorationStrokeStyle.${variant}`, value: ICON_BUTTON_CSS_DECORATION_STYLE },
      ];
    case 'quiet':
      return [
        { tokenName: `backgroundColor.${variant}`, value: 'transparent' },
        { tokenName: `backgroundColor.${variant}-hover`, value: iconButtonSlot('roleHover', variant, 'Hover') },
        { tokenName: `backgroundColor.${variant}-pressed`, value: iconButtonSlot('rolePressed', variant, 'Pressed') },
        { tokenName: `iconColor.${variant}`, value: accent },
        ...flatStroke,
      ];
  }
}

const ATTENTION_STYLE_VALUES: readonly AttentionStyleValue[] = ['solid', 'tonal', 'outline', 'quiet'];

/** Resolution map for one attention-style decision. The factory style is inert. */
function attentionStyleMap(component: 'Button' | 'IconButton', level: AttentionLevel) {
  const variant = ATTENTION_LEVEL_VARIANTS[level];
  const factoryStyle = ATTENTION_STYLE_DEFAULTS[level];
  const generate =
    component === 'Button' ? buttonAttentionStyleOverrides : iconButtonAttentionStyleOverrides;
  return Object.fromEntries(
    ATTENTION_STYLE_VALUES.map((style) => [style, style === factoryStyle ? [] : generate(variant, style)]),
  );
}

/**
 * Per-variant role slots for one attention level. tokenNames are component
 * agnostic (`roleBold.subtle` emits `--{Comp}-roleBold-subtle`).
 */
function attentionRoleOverrides(variant: AttentionVariant, role: string) {
  const slots: Array<[string, string]> = [
    ['roleBold', 'Bold'],
    ['roleBoldHigh', 'Bold-High'],
    ['roleBoldHover', 'Bold-Hover'],
    ['roleBoldPressed', 'Bold-Pressed'],
    ['roleSubtle', 'Subtle'],
    ['roleSubtleHover', 'Subtle-Hover'],
    ['roleSubtlePressed', 'Subtle-Pressed'],
    ['roleTintedA11y', 'TintedA11y'],
    ['roleHover', 'Hover'],
    ['rolePressed', 'Pressed'],
  ];
  return slots.map(([slot, token]) => ({
    tokenName: `${slot}.${variant}`,
    value: roleToken(role, token),
  }));
}

function attentionRoleMap(level: AttentionLevel) {
  const variant = ATTENTION_LEVEL_VARIANTS[level];
  return {
    inherit: [],
    ...Object.fromEntries(
      APPEARANCE_ROLE_OPTIONS.map((option) => [option.value, attentionRoleOverrides(variant, option.value)]),
    ),
  };
}

// Legacy aliases: native OneUIBrandProvider checks resolutionMap.emphasisStyle
// to decide whether a target consumes the (deprecated) emphasisStyle selection.
const actionEmphasis = attentionStyleMap('Button', 'high');
const iconButtonEmphasis = attentionStyleMap('IconButton', 'high');

const inputShape = {
  inherit: [],
  sharp: [{ tokenName: 'borderRadius', value: 'Shape-0' }],
  soft: [{ tokenName: 'borderRadius', value: 'Shape-2' }],
  rounded: [{ tokenName: 'borderRadius', value: 'Shape-3' }],
  pill: [{ tokenName: 'borderRadius', value: 'Shape-Pill' }],
};

const radioDotRadius = {
  base: 'max(var(--Spacing-0), calc(var(--Radio-borderRadius, var(--Shape-Pill)) - ((var(--Radio-boxSize-m, var(--Spacing-5)) - var(--Radio-dotSize-m, var(--Spacing-2-5))) / 2)))',
  s: 'max(var(--Spacing-0), calc(var(--Radio-borderRadius-s, var(--Radio-borderRadius, var(--Shape-Pill))) - ((var(--Radio-boxSize-s, var(--Spacing-4)) - var(--Radio-dotSize-s, var(--Spacing-2))) / 2)))',
  m: 'max(var(--Spacing-0), calc(var(--Radio-borderRadius-m, var(--Radio-borderRadius, var(--Shape-Pill))) - ((var(--Radio-boxSize-m, var(--Spacing-5)) - var(--Radio-dotSize-m, var(--Spacing-2-5))) / 2)))',
  l: 'max(var(--Spacing-0), calc(var(--Radio-borderRadius-l, var(--Radio-borderRadius, var(--Shape-Pill))) - ((var(--Radio-boxSize-l, var(--Spacing-6)) - var(--Radio-dotSize-l, var(--Spacing-3))) / 2)))',
};

const checkboxScale = {
  compact: [
    { tokenName: 'boxSize-s', value: 'Spacing-3' },
    { tokenName: 'boxSize-m', value: 'Spacing-4' },
    { tokenName: 'boxSize-l', value: 'Spacing-5' },
    { tokenName: 'iconSize-s', value: 'Spacing-2-5' },
    { tokenName: 'iconSize-m', value: 'Spacing-3' },
    { tokenName: 'iconSize-l', value: 'Spacing-4' },
  ],
  default: [],
  roomy: [
    { tokenName: 'boxSize-s', value: 'Spacing-5' },
    { tokenName: 'boxSize-m', value: 'Spacing-6' },
    { tokenName: 'boxSize-l', value: 'Spacing-7' },
    { tokenName: 'iconSize-s', value: 'Spacing-4' },
    { tokenName: 'iconSize-m', value: 'Spacing-4-5' },
    { tokenName: 'iconSize-l', value: 'Spacing-5' },
  ],
};

const radioScale = {
  compact: [
    { tokenName: 'boxSize-s', value: 'Spacing-3' },
    { tokenName: 'boxSize-m', value: 'Spacing-4' },
    { tokenName: 'boxSize-l', value: 'Spacing-5' },
    { tokenName: 'dotSize-s', value: 'Spacing-1-5' },
    { tokenName: 'dotSize-m', value: 'Spacing-2' },
    { tokenName: 'dotSize-l', value: 'Spacing-2-5' },
  ],
  default: [],
  roomy: [
    { tokenName: 'boxSize-s', value: 'Spacing-5' },
    { tokenName: 'boxSize-m', value: 'Spacing-6' },
    { tokenName: 'boxSize-l', value: 'Spacing-7' },
    { tokenName: 'dotSize-s', value: 'Spacing-2-5' },
    { tokenName: 'dotSize-m', value: 'Spacing-3' },
    { tokenName: 'dotSize-l', value: 'Spacing-4' },
  ],
};

const radioOuterShape = {
  inherit: [],
  sharp: [
    { tokenName: 'borderRadius', value: 'Shape-0' },
    { tokenName: 'borderRadius-s', value: 'Shape-0' },
    { tokenName: 'borderRadius-m', value: 'Shape-0' },
    { tokenName: 'borderRadius-l', value: 'Shape-0' },
    { tokenName: 'dotBorderRadius', value: radioDotRadius.base },
    { tokenName: 'dotBorderRadius-s', value: radioDotRadius.s },
    { tokenName: 'dotBorderRadius-m', value: radioDotRadius.m },
    { tokenName: 'dotBorderRadius-l', value: radioDotRadius.l },
  ],
  soft: [
    { tokenName: 'borderRadius', value: 'Shape-1' },
    { tokenName: 'borderRadius-s', value: 'Shape-0-5' },
    { tokenName: 'borderRadius-m', value: 'Shape-1' },
    { tokenName: 'borderRadius-l', value: 'Shape-1-5' },
    { tokenName: 'dotBorderRadius', value: radioDotRadius.base },
    { tokenName: 'dotBorderRadius-s', value: radioDotRadius.s },
    { tokenName: 'dotBorderRadius-m', value: radioDotRadius.m },
    { tokenName: 'dotBorderRadius-l', value: radioDotRadius.l },
  ],
  rounded: [
    { tokenName: 'borderRadius', value: 'Shape-2' },
    { tokenName: 'borderRadius-s', value: 'Shape-1-5' },
    { tokenName: 'borderRadius-m', value: 'Shape-2' },
    { tokenName: 'borderRadius-l', value: 'Shape-2-5' },
    { tokenName: 'dotBorderRadius', value: radioDotRadius.base },
    { tokenName: 'dotBorderRadius-s', value: radioDotRadius.s },
    { tokenName: 'dotBorderRadius-m', value: radioDotRadius.m },
    { tokenName: 'dotBorderRadius-l', value: radioDotRadius.l },
  ],
  pill: [
    { tokenName: 'borderRadius', value: 'Shape-Pill' },
    { tokenName: 'borderRadius-s', value: 'Shape-Pill' },
    { tokenName: 'borderRadius-m', value: 'Shape-Pill' },
    { tokenName: 'borderRadius-l', value: 'Shape-Pill' },
    { tokenName: 'dotBorderRadius', value: radioDotRadius.base },
    { tokenName: 'dotBorderRadius-s', value: radioDotRadius.s },
    { tokenName: 'dotBorderRadius-m', value: radioDotRadius.m },
    { tokenName: 'dotBorderRadius-l', value: radioDotRadius.l },
  ],
};

const checkboxShape = {
  inherit: [],
  sharp: [
    { tokenName: 'borderRadius', value: 'Shape-0' },
    { tokenName: 'borderRadius-s', value: 'Shape-0' },
    { tokenName: 'borderRadius-m', value: 'Shape-0' },
    { tokenName: 'borderRadius-l', value: 'Shape-0' },
  ],
  soft: [
    { tokenName: 'borderRadius', value: 'Shape-1' },
    { tokenName: 'borderRadius-s', value: 'Shape-0-5' },
    { tokenName: 'borderRadius-m', value: 'Shape-1' },
    { tokenName: 'borderRadius-l', value: 'Shape-1-5' },
  ],
  rounded: [
    { tokenName: 'borderRadius', value: 'Shape-1-5' },
    { tokenName: 'borderRadius-s', value: 'Shape-1' },
    { tokenName: 'borderRadius-m', value: 'Shape-1-5' },
    { tokenName: 'borderRadius-l', value: 'Shape-2' },
  ],
  pill: [
    { tokenName: 'borderRadius', value: 'Shape-2' },
    { tokenName: 'borderRadius-s', value: 'Shape-1-5' },
    { tokenName: 'borderRadius-m', value: 'Shape-2' },
    { tokenName: 'borderRadius-l', value: 'Shape-2-5' },
  ],
};

const switchShape = {
  inherit: [],
  sharp: [
    { tokenName: 'borderRadius', value: 'Shape-0' },
    { tokenName: 'thumbBorderRadius', value: 'Shape-0' },
  ],
  soft: [
    { tokenName: 'borderRadius', value: 'Shape-2' },
    { tokenName: 'thumbBorderRadius', value: 'Shape-2' },
  ],
  rounded: [
    { tokenName: 'borderRadius', value: 'Shape-3' },
    { tokenName: 'thumbBorderRadius', value: 'Shape-3' },
  ],
  pill: [
    { tokenName: 'borderRadius', value: 'Shape-Pill' },
    { tokenName: 'thumbBorderRadius', value: 'Shape-Pill' },
  ],
};

const switchScale = {
  compact: [
    { tokenName: 'trackWidth-s', value: 'Spacing-6' },
    { tokenName: 'trackWidth-m', value: 'Spacing-8' },
    { tokenName: 'trackWidth-l', value: 'Spacing-9' },
    { tokenName: 'knobSize-s', value: 'Spacing-2-5' },
    { tokenName: 'knobSize-m', value: 'Spacing-3' },
    { tokenName: 'knobSize-l', value: 'Spacing-4' },
    { tokenName: 'travel-s', value: 'Spacing-3' },
    { tokenName: 'travel-m', value: 'Spacing-4' },
    { tokenName: 'travel-l', value: 'Spacing-4' },
  ],
  default: [],
  roomy: [
    { tokenName: 'trackWidth-s', value: 'Spacing-8' },
    { tokenName: 'trackWidth-m', value: 'Spacing-10' },
    { tokenName: 'trackWidth-l', value: 'Spacing-12' },
    { tokenName: 'knobSize-s', value: 'Spacing-4' },
    { tokenName: 'knobSize-m', value: 'Spacing-5' },
    { tokenName: 'knobSize-l', value: 'Spacing-6' },
    { tokenName: 'travel-s', value: 'Spacing-4' },
    { tokenName: 'travel-m', value: 'Spacing-4' },
    { tokenName: 'travel-l', value: 'Spacing-5' },
  ],
};

const stepperScale = {
  compact: [
    { tokenName: 'height-s', value: 'Spacing-6' },
    { tokenName: 'height-m', value: 'Spacing-7' },
    { tokenName: 'height-l', value: 'Spacing-9' },
    { tokenName: 'buttonSize-s', value: 'Spacing-6' },
    { tokenName: 'buttonSize-m', value: 'Spacing-7' },
    { tokenName: 'buttonSize-l', value: 'Spacing-9' },
    { tokenName: 'iconSize-s', value: 'Spacing-3' },
    { tokenName: 'iconSize-m', value: 'Spacing-4' },
    { tokenName: 'iconSize-l', value: 'Spacing-5' },
  ],
  default: [],
  roomy: [
    { tokenName: 'height-s', value: 'Spacing-8' },
    { tokenName: 'height-m', value: 'Spacing-10' },
    { tokenName: 'height-l', value: 'Spacing-12' },
    { tokenName: 'buttonSize-s', value: 'Spacing-8' },
    { tokenName: 'buttonSize-m', value: 'Spacing-10' },
    { tokenName: 'buttonSize-l', value: 'Spacing-12' },
    { tokenName: 'iconSize-s', value: 'Spacing-5' },
    { tokenName: 'iconSize-m', value: 'Spacing-6' },
    { tokenName: 'iconSize-l', value: 'Spacing-7' },
  ],
};

const inputScale = {
  compact: [
    { tokenName: 'height.6', value: 'Spacing-5' },
    { tokenName: 'height.8', value: 'Spacing-7' },
    { tokenName: 'height.10', value: 'Spacing-9' },
    { tokenName: 'height.12', value: 'Spacing-10' },
    { tokenName: 'paddingHorizontal.6', value: 'Spacing-1' },
    { tokenName: 'paddingHorizontal.8', value: 'Spacing-2' },
    { tokenName: 'paddingHorizontal.10', value: 'Spacing-2-5' },
    { tokenName: 'paddingHorizontal.12', value: 'Spacing-3' },
    { tokenName: 'paddingVertical.6', value: 'Spacing-0' },
    { tokenName: 'paddingVertical.8', value: 'Spacing-0' },
    { tokenName: 'paddingVertical.10', value: 'Spacing-1' },
    { tokenName: 'paddingVertical.12', value: 'Spacing-1-5' },
  ],
  default: [],
  roomy: [
    { tokenName: 'height.6', value: 'Spacing-8' },
    { tokenName: 'height.8', value: 'Spacing-9' },
    { tokenName: 'height.10', value: 'Spacing-12' },
    { tokenName: 'height.12', value: 'Spacing-14' },
    { tokenName: 'paddingHorizontal.6', value: 'Spacing-3' },
    { tokenName: 'paddingHorizontal.8', value: 'Spacing-4' },
    { tokenName: 'paddingHorizontal.10', value: 'Spacing-4-5' },
    { tokenName: 'paddingHorizontal.12', value: 'Spacing-5' },
    { tokenName: 'paddingVertical.6', value: 'Spacing-1' },
    { tokenName: 'paddingVertical.8', value: 'Spacing-1' },
    { tokenName: 'paddingVertical.10', value: 'Spacing-2-5' },
    { tokenName: 'paddingVertical.12', value: 'Spacing-3' },
  ],
};

export const COMPONENT_THEME_FAMILIES: ComponentThemeFamilyDefinition[] = [
  {
    id: 'actions',
    label: 'Actions',
    description: 'Buttons, chips, and pressable controls that trigger or select actions.',
    decisions: [
      {
        id: 'shapeLanguage',
        label: 'Shape language',
        rationale: 'Controls the shared action silhouette without editing each component.',
        category: 'shape',
        options: SHAPE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'controlScale',
        label: 'Control scale',
        rationale: 'Adjusts how compact or prominent action controls feel across brands.',
        category: 'spacing',
        options: SCALE_OPTIONS,
        defaultOption: 'default',
      },
      {
        id: 'highAttentionStyle',
        label: 'High attention style',
        rationale: 'How High attention (bold) actions express emphasis.',
        category: 'color',
        options: ATTENTION_STYLE_OPTIONS,
        defaultOption: 'solid',
      },
      {
        id: 'mediumAttentionStyle',
        label: 'Medium attention style',
        rationale: 'How Medium attention (subtle) actions express emphasis.',
        category: 'color',
        options: ATTENTION_STYLE_OPTIONS,
        defaultOption: 'tonal',
      },
      {
        id: 'lowAttentionStyle',
        label: 'Low attention style',
        rationale: 'How Low attention (ghost) actions express emphasis.',
        category: 'color',
        options: ATTENTION_STYLE_OPTIONS,
        defaultOption: 'quiet',
      },
      {
        id: 'highAttentionRole',
        label: 'High attention role',
        rationale: 'Colour role painted by High attention actions.',
        category: 'color',
        options: ATTENTION_ROLE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'mediumAttentionRole',
        label: 'Medium attention role',
        rationale: 'Colour role painted by Medium attention actions.',
        category: 'color',
        options: ATTENTION_ROLE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'lowAttentionRole',
        label: 'Low attention role',
        rationale: 'Colour role painted by Low attention actions.',
        category: 'color',
        options: ATTENTION_ROLE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'defaultAppearance',
        label: 'Default action role',
        rationale: 'Controls which appearance role unqualified action controls use by default.',
        category: 'color',
        options: DEFAULT_APPEARANCE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'decorationImpact',
        label: 'Decoration impact',
        rationale: 'Controls the visual strength of assigned ornaments without changing the ornament asset.',
        category: 'layout',
        options: DECORATION_IMPACT_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'cssDecoration',
        label: 'CSS decoration',
        rationale: 'Adds a token-driven CSS decoration for supported components.',
        category: 'layout',
        options: CSS_DECORATION_OPTIONS,
        defaultOption: 'none',
      },
      {
        id: 'cssDecorationStrokeWidth',
        label: 'Decoration stroke width',
        rationale: 'Uses foundation stroke tokens for CSS-only decoration thickness.',
        category: 'stroke',
        options: CSS_DECORATION_STROKE_WIDTH_OPTIONS,
        defaultOption: 'Stroke-L',
      },
      {
        id: 'cssDecorationStrokeStyle',
        label: 'Decoration stroke style',
        rationale: 'Controls the CSS border style used by token-driven decorations.',
        category: 'stroke',
        options: CSS_DECORATION_STROKE_STYLE_OPTIONS,
        defaultOption: 'solid',
      },
    ],
    targets: [
      {
        componentName: 'Button',
        shapeTokens: ['borderRadius'],
        metricBaselines: {
          minHeight: { '6': 'Spacing-6', '8': 'Spacing-8', '10': 'Spacing-10', '12': 'Spacing-12' },
          paddingHorizontal: { '6': 'Spacing-3', '8': 'Spacing-4', '10': 'Spacing-5', '12': 'Spacing-6' },
          paddingVertical: { '6': 'Spacing-0-5', '8': 'Spacing-0-5', '10': 'Spacing-1', '12': 'Spacing-2' },
        },
        metricMirrors: {
          paddingHorizontal: ['paddingHorizontalStart', 'paddingHorizontalEnd'],
        },
        resolutionMap: {
          shapeLanguage: actionShape,
          controlScale: { compact: compactButtonScale, default: [], roomy: roomyButtonScale },
          highAttentionStyle: attentionStyleMap('Button', 'high'),
          mediumAttentionStyle: attentionStyleMap('Button', 'medium'),
          lowAttentionStyle: attentionStyleMap('Button', 'low'),
          highAttentionRole: attentionRoleMap('high'),
          mediumAttentionRole: attentionRoleMap('medium'),
          lowAttentionRole: attentionRoleMap('low'),
          emphasisStyle: actionEmphasis,
          defaultAppearance: actionRole,
          decorationImpact: buttonDecorationImpact,
        },
      },
      {
        componentName: 'IconButton',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: actionShape,
          highAttentionStyle: attentionStyleMap('IconButton', 'high'),
          mediumAttentionStyle: attentionStyleMap('IconButton', 'medium'),
          lowAttentionStyle: attentionStyleMap('IconButton', 'low'),
          highAttentionRole: attentionRoleMap('high'),
          mediumAttentionRole: attentionRoleMap('medium'),
          lowAttentionRole: attentionRoleMap('low'),
          emphasisStyle: iconButtonEmphasis,
          defaultAppearance: actionRole,
        },
      },
      {
        componentName: 'FAB',
        shapeTokens: ['borderRadius'],
        metricBaselines: {
          paddingHorizontal: { '': 'Spacing-4-5' },
        },
        resolutionMap: {
          shapeLanguage: actionShape,
          controlScale: simpleHorizontalScale,
          defaultAppearance: actionRole,
        },
      },
      {
        componentName: 'SingleTextButton',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: actionShape,
          defaultAppearance: actionRole,
        },
      },
    ],
  },
  {
    id: 'selection',
    label: 'Selection',
    description: 'Chips, selectable buttons, and toggle controls that capture on/off or choice state.',
    decisions: [
      {
        id: 'shapeLanguage',
        label: 'Shape language',
        rationale: 'Controls the shared selection-control silhouette without editing each component.',
        category: 'shape',
        options: SHAPE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'controlScale',
        label: 'Control scale',
        rationale: 'Adjusts how compact or prominent selection controls feel across brands.',
        category: 'spacing',
        options: SCALE_OPTIONS,
        defaultOption: 'default',
      },
      {
        id: 'defaultAppearance',
        label: 'Default selection role',
        rationale: 'Controls which appearance role selection controls use by default.',
        category: 'color',
        options: DEFAULT_APPEARANCE_OPTIONS,
        defaultOption: 'inherit',
      },
    ],
    targets: [
      {
        componentName: 'Chip',
        shapeTokens: ['borderRadius'],
        metricBaselines: {
          paddingHorizontal: { s: 'Spacing-2-5', m: 'Spacing-2-5', l: 'Spacing-3' },
        },
        resolutionMap: {
          shapeLanguage: actionShape,
          controlScale: simpleHorizontalScale,
          defaultAppearance: actionRole,
        },
      },
      {
        componentName: 'SelectableButton',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: actionShape,
          controlScale: simpleHorizontalScale,
          defaultAppearance: actionRole,
        },
      },
      {
        componentName: 'SelectableIconButton',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: actionShape,
          defaultAppearance: actionRole,
        },
      },
      {
        componentName: 'SelectableSingleTextButton',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: actionShape,
          controlScale: simpleHorizontalScale,
          defaultAppearance: actionRole,
        },
      },
      {
        componentName: 'Checkbox',
        shapeTokens: ['borderRadius', 'borderRadius-s', 'borderRadius-m', 'borderRadius-l'],
        resolutionMap: {
          shapeLanguage: checkboxShape,
          controlScale: checkboxScale,
          defaultAppearance: checkboxRole,
        },
      },
      {
        componentName: 'Radio',
        shapeTokens: ['borderRadius', 'borderRadius-s', 'borderRadius-m', 'borderRadius-l'],
        derivedShapeOverrides: [
          { tokenName: 'dotBorderRadius', value: radioDotRadius.base },
          { tokenName: 'dotBorderRadius-s', value: radioDotRadius.s },
          { tokenName: 'dotBorderRadius-m', value: radioDotRadius.m },
          { tokenName: 'dotBorderRadius-l', value: radioDotRadius.l },
        ],
        resolutionMap: {
          shapeLanguage: radioOuterShape,
          controlScale: radioScale,
          defaultAppearance: radioRole,
        },
      },
      {
        componentName: 'Switch',
        shapeTokens: ['borderRadius', 'thumbBorderRadius'],
        resolutionMap: {
          shapeLanguage: switchShape,
          controlScale: switchScale,
          defaultAppearance: switchRole,
        },
      },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    description: 'Tabs, headers, bottom bars, and segmented controls that move users between places.',
    decisions: [
      {
        id: 'shapeLanguage',
        label: 'Shape language',
        rationale: 'Sets the corner-radius family for navigation items and containers.',
        category: 'shape',
        options: SHAPE_OPTIONS,
        defaultOption: 'inherit',
      },
    ],
    targets: [
      {
        componentName: 'Tabs',
        shapeTokens: ['itemRadius'],
        resolutionMap: {
          shapeLanguage: navigationTabShape,
        },
      },
      {
        componentName: 'WebHeader',
        shapeTokens: ['itemBorderRadius', 'searchBorderRadius'],
        resolutionMap: {
          shapeLanguage: webHeaderShape,
        },
      },
      {
        componentName: 'BottomNavigation',
        shapeTokens: ['itemBorderRadius'],
        resolutionMap: {
          shapeLanguage: bottomNavigationShape,
        },
      },
      {
        componentName: 'SegmentedControl',
        shapeTokens: ['trackRadiusRectangular', 'itemRadiusRectangular'],
        resolutionMap: {
          shapeLanguage: segmentedControlShape,
        },
      },
    ],
  },
  {
    id: 'inputs',
    label: 'Inputs',
    description: 'Fields and value controls used for forms, filtering, and settings.',
    decisions: [
      {
        id: 'shapeLanguage',
        label: 'Shape language',
        rationale: 'Keeps form controls visually related while respecting each component type.',
        category: 'shape',
        options: SHAPE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'controlScale',
        label: 'Field scale',
        rationale: 'Adjusts field density without forcing checkboxes, radios, or switches to resize unexpectedly.',
        category: 'spacing',
        options: SCALE_OPTIONS,
        defaultOption: 'default',
      },
      {
        id: 'defaultAppearance',
        label: 'Default input role',
        rationale: 'Controls which appearance role fields use by default.',
        category: 'color',
        options: DEFAULT_APPEARANCE_OPTIONS,
        defaultOption: 'inherit',
      },
    ],
    targets: [
      {
        componentName: 'InputField',
        shapeTokens: ['borderRadius'],
        metricBaselines: {
          height: { '6': 'Spacing-6', '8': 'Spacing-8', '10': 'Spacing-10', '12': 'Spacing-12' },
          paddingHorizontal: { '6': 'Spacing-1-5', '8': 'Spacing-3', '10': 'Spacing-3', '12': 'Spacing-3-5' },
          paddingVertical: { '6': 'Spacing-0', '8': 'Spacing-1-5', '10': 'Spacing-1-5', '12': 'Spacing-2' },
        },
        resolutionMap: {
          shapeLanguage: inputShape,
          controlScale: inputScale,
          defaultAppearance: inputRole,
        },
      },
      {
        componentName: 'Select',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: inputShape,
        },
      },
      {
        componentName: 'Stepper',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: inputShape,
          controlScale: stepperScale,
          defaultAppearance: actionRole,
        },
      },
    ],
  },
  {
    id: 'display',
    label: 'Display',
    description:
      'Non-interactive elements like badges, counters, indicators, and sliders that present status or values.',
    decisions: [
      {
        id: 'shapeLanguage',
        label: 'Shape language',
        rationale:
          'Sets the corner-radius family for badges, counters, indicators, and slider track/knob.',
        category: 'shape',
        options: SHAPE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'textCase',
        label: 'Label text case',
        rationale: 'Controls casing for badge labels and counter digits.',
        category: 'typography',
        options: TEXT_CASE_OPTIONS,
        defaultOption: 'none',
      },
    ],
    targets: [
      {
        componentName: 'Badge',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: displayBadgeShape,
          textCase: displayTextCase,
        },
      },
      {
        componentName: 'CounterBadge',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: displayBadgeShape,
          textCase: displayTextCase,
        },
      },
      {
        componentName: 'IndicatorBadge',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: displayBadgeShape,
        },
      },
      {
        componentName: 'Slider',
        shapeTokens: ['trackBorderRadius', 'knobBorderRadius'],
        resolutionMap: {
          shapeLanguage: sliderShape,
        },
      },
      {
        componentName: 'PaginationDots',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: paginationDotsShape,
        },
      },
      {
        componentName: 'TouchSlider',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: touchSliderShape,
        },
      },
      {
        componentName: 'Avatar',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: avatarShape,
        },
      },
      {
        componentName: 'IconContained',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: avatarShape,
        },
      },
    ],
  },
  {
    id: 'cards',
    label: 'Containers',
    description:
      'Reusable card, panel, and list containers used for grouped content, previews, and platform hubs.',
    decisions: [
      {
        id: 'shapeLanguage',
        label: 'Container shape',
        rationale: 'Controls card and panel corner radius independently from action controls.',
        category: 'shape',
        options: CARD_SHAPE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'elevationLevel',
        label: 'Elevation',
        rationale: 'Uses foundation elevation tokens to define whether cards read as flat, raised, or floating.',
        category: 'elevation',
        options: CARD_ELEVATION_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'strokeEmphasis',
        label: 'Stroke',
        rationale: 'Controls the foundation stroke width used by outlined cards.',
        category: 'stroke',
        options: CARD_STROKE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'surfaceTone',
        label: 'Surface tone',
        rationale: 'Controls whether cards use the page fill, a subtle role fill, or the elevated surface token.',
        category: 'color',
        options: CARD_SURFACE_OPTIONS,
        defaultOption: 'inherit',
      },
      {
        id: 'density',
        label: 'Card density',
        rationale: 'Adjusts internal padding and vertical rhythm for cards and panels.',
        category: 'spacing',
        options: SCALE_OPTIONS,
        defaultOption: 'default',
      },
    ],
    targets: [
      {
        componentName: 'Card',
        shapeTokens: ['borderRadius'],
        metricBaselines: {
          padding: { '': 'Spacing-4-5' },
          gap: { '': 'Spacing-3-5' },
        },
        resolutionMap: {
          shapeLanguage: cardShape,
          elevationLevel: cardElevation,
          strokeEmphasis: cardStroke,
          surfaceTone: cardSurface,
          density: cardScale,
        },
      },
      {
        componentName: 'ListItem',
        shapeTokens: ['borderRadius'],
        resolutionMap: {
          shapeLanguage: listItemShape,
        },
      },
    ],
  },
];

/**
 * Validation of the High ≥ Medium ≥ Low attention ordering.
 * Shared so the editor panel, agents, and codegen apply the same guard.
 */
export interface AttentionHierarchyResult {
  level: 'ok' | 'warn' | 'error';
  messages: string[];
}

export function resolveAttentionStyleSelections(
  selections: Record<string, string>,
): Record<AttentionLevel, string> {
  return {
    // Legacy rows may still carry emphasisStyle; it aliases the High level.
    high: selections.highAttentionStyle || selections.emphasisStyle || ATTENTION_STYLE_DEFAULTS.high,
    medium: selections.mediumAttentionStyle || ATTENTION_STYLE_DEFAULTS.medium,
    low: selections.lowAttentionStyle || ATTENTION_STYLE_DEFAULTS.low,
  };
}

export function validateAttentionHierarchy(
  selections: Record<string, string>,
): AttentionHierarchyResult {
  const styles = resolveAttentionStyleSelections(selections);
  const weight = (style: string) => ATTENTION_STYLE_WEIGHTS[style] ?? 0;
  const messages: string[] = [];
  let level: AttentionHierarchyResult['level'] = 'ok';

  if (weight(styles.medium) > weight(styles.high)) {
    level = 'error';
    messages.push('Medium attention cannot outweigh High attention.');
  }
  if (weight(styles.low) > weight(styles.medium)) {
    level = 'error';
    messages.push('Low attention cannot outweigh Medium attention.');
  }
  if (level !== 'error') {
    if (weight(styles.high) === weight(styles.medium)) {
      level = 'warn';
      messages.push('High and Medium attention will look identical at rest.');
    }
    if (weight(styles.medium) === weight(styles.low)) {
      level = 'warn';
      messages.push('Medium and Low attention will look identical at rest.');
    }
  }

  return { level, messages };
}

export function getComponentThemeFamily(
  familyId: ComponentThemeFamilyId
): ComponentThemeFamilyDefinition | undefined {
  return COMPONENT_THEME_FAMILIES.find((family) => family.id === familyId);
}

export function getComponentThemeFamiliesForComponent(
  componentName: string
): ComponentThemeFamilyDefinition[] {
  const aliases = componentName === 'Input' ? ['InputField'] : [];
  return COMPONENT_THEME_FAMILIES.filter((family) =>
    family.targets.some((target) =>
      target.componentName === componentName || aliases.includes(target.componentName)
    )
  );
}

const FAMILY_OWNED_RECIPE_DECISIONS_BY_THEME_DECISION: Record<string, readonly string[]> = {
  shapeLanguage: ['cornerRadius', 'itemCornerRadius', 'itemShape', 'dotShape'],
  controlScale: ['horizontalDensity'],
};

/**
 * Recipe decisions authored from the Global Component Theme for this component
 * family. Component editors hide these decisions so users do not see two
 * controls for the same brand-level intent.
 */
export function getFamilyOwnedRecipeDecisionIds(componentName: string): Set<string> {
  const out = new Set<string>();
  for (const family of getComponentThemeFamiliesForComponent(componentName)) {
    for (const decision of family.decisions) {
      const ownedIds = FAMILY_OWNED_RECIPE_DECISIONS_BY_THEME_DECISION[decision.id];
      if (!ownedIds) continue;
      for (const id of ownedIds) out.add(id);
    }
  }
  return out;
}

/**
 * Family-owned recipe decisions ignored at runtime when the matching Global
 * Component Theme decision is actively selected. Persisted recipe selections
 * remain a fallback when the global decision is reset to its default.
 */
export function getActiveFamilyOwnedRecipeDecisionIds(
  componentName: string,
  componentThemeSelections: Record<string, Record<string, string>>
): Set<string> {
  const out = new Set<string>();
  for (const family of getComponentThemeFamiliesForComponent(componentName)) {
    const familySelections = componentThemeSelections[family.id] ?? {};
    for (const decision of family.decisions) {
      const ownedIds = FAMILY_OWNED_RECIPE_DECISIONS_BY_THEME_DECISION[decision.id];
      if (!ownedIds) continue;
      const selectedValue = familySelections[decision.id];
      if (selectedValue === undefined || selectedValue === decision.defaultOption) continue;
      for (const id of ownedIds) out.add(id);
    }
  }
  return out;
}

export function getActiveFamilyOwnedRecipeDecisionIdsFromSelections(
  componentName: string,
  componentThemeSelections: Array<{ familyId: string; selections: Record<string, string> }> = []
): Set<string> {
  const byFamily: Record<string, Record<string, string>> = {};
  for (const item of componentThemeSelections) {
    byFamily[item.familyId] = item.selections;
  }
  return getActiveFamilyOwnedRecipeDecisionIds(componentName, byFamily);
}

export function getRecipeOwnedTokenNames(
  definition: ComponentRecipeDefinition,
  selections: Record<string, string>,
  ignoredDecisionIds: ReadonlySet<string> = new Set()
): Set<string> {
  const out = new Set<string>();
  for (const decision of definition.decisions) {
    if (ignoredDecisionIds.has(decision.id)) continue;
    const selectedValue = selections[decision.id] || decision.defaultOption;
    const optionOverrides = definition.resolutionMap[decision.id]?.[selectedValue];
    if (!optionOverrides) continue;
    for (const override of optionOverrides) out.add(override.tokenName);
  }
  return out;
}
