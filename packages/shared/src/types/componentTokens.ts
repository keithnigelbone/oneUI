/**
 * componentTokens.ts
 *
 * Type definitions for the Component Token Editor system.
 * Enables per-brand token customization with manifest-based detection.
 */

// Import and re-export TokenCategory from tokens.ts to use consistently
import { STROKE_TOKEN_OPTIONS } from '../data/stroke-scale';
import type { TokenCategory as TokenCategoryType } from './tokens';
export type { TokenCategory } from './tokens';

// Local alias for use within this file
type TokenCategory = TokenCategoryType;

/**
 * Subcategories for more granular organization within a category
 */
export type TokenSubcategory =
  // Color subcategories
  | 'surface'
  | 'fill'
  | 'text'
  | 'border'
  | 'icon'
  | 'stroke'
  // Typography subcategories
  | 'size'
  | 'weight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'family'
  // Spacing subcategories
  | 'padding'
  | 'margin'
  | 'gap'
  // Shape subcategories
  | 'radius'
  // Layout subcategories
  | 'layout'
  // Motion subcategories
  | 'duration'
  | 'easing'
  // Other subcategories
  | 'opacity';

/**
 * State-based token variations
 */
export type TokenState =
  | 'default'
  | 'hover'
  | 'pressed'
  | 'focus'
  | 'disabled'
  | 'loading';

/** Editor tab modes for the advanced component editor */
export type EditorTabMode = 'preview' | 'design' | 'inspect' | 'parity';

/** Scope of a token override */
export type TokenOverrideScope =
  | 'global'
  | 'state'
  | 'variant'
  | 'size'
  | 'variant-state'
  | 'variant-size'
  | 'variant-state-size';

/** Definition of a component slot (icon, avatar, loading, etc.) */
export interface ComponentSlotDefinition {
  name: string;
  types: string[];
  tokens: string[];
}

/** Target for granular editing (specific variant + size combo) */
export interface GranularTarget {
  variant?: string;
  state?: TokenState;
  size?: string;
  mediaContext?: string;
}

/**
 * Available token options for selection in the editor
 */
export interface TokenOption {
  /** The CSS variable name (without var()) */
  token: string;
  /** Human-readable label */
  label: string;
  /** Optional preview value for swatches */
  previewValue?: string;
}

/**
 * Defines a single token used by a component
 */
export interface TokenDefinition {
  /** Primary category for grouping */
  category: TokenCategory;
  /** Optional subcategory for finer grouping */
  subcategory?: TokenSubcategory;
  /** The default token used (without var()) */
  defaultToken: string;
  /** Available tokens that can be selected as alternatives */
  availableTokens?: TokenOption[];
  /** Different default tokens per variant (e.g., bold/subtle/ghost) */
  variants?: Record<string, string>;
  /** Different default tokens per state (partial - not all states required) */
  states?: Partial<Record<TokenState, string | Record<string, string>>>;
  /** Different default tokens per size */
  sizes?: Record<string, string>;
  /** Human-readable description */
  description?: string;
  /** If true, this token cannot be changed (e.g., Shape-Pill for interactive) */
  locked?: boolean;
  /** Explanation for why the token is locked */
  lockReason?: string;
  /** The CSS property this token maps to */
  cssProperty?: string;
}

/**
 * Complete manifest of tokens for a component
 */
export interface ComponentTokenManifest {
  /** Component name (e.g., 'Button', 'IconButton') */
  componentName: string;
  /** Manifest version for tracking changes */
  version: string;
  /** Map of token property names to their definitions */
  tokens: Record<string, TokenDefinition>;
  /** Total number of tokens */
  totalTokens: number;
  /** Count of tokens per category */
  categories: Partial<Record<TokenCategory, number>>;
  /** Optional component description */
  description?: string;
  /** Named slots within the component (icons, spinners, etc.) */
  slots?: Record<string, ComponentSlotDefinition>;
}

/**
 * A single token override value stored in the database
 */
export interface TokenOverrideValue {
  /** The token property name (e.g., 'backgroundColor') */
  tokenName: string;
  /** The selected token to use instead of default */
  selectedToken: string;
  /** Which variant this override applies to (optional) */
  variant?: string;
  /** Which state this override applies to (optional) */
  state?: TokenState;
  /** Which size this override applies to (optional) */
  size?: string;
  /** Scope used when saving/restoring granular component overrides */
  scope?: TokenOverrideScope;
  /** Optional media/surface context for future state-scoped component themes */
  mediaContext?: string;
  /** Optional channel metadata (fill, stroke, text, underline) */
  channel?: string;
  /** Optional structured value kind metadata (token, material, transparent, none) */
  valueKind?: string;
  /** @deprecated Mode is no longer used - overrides apply to all themes */
  mode?: 'light' | 'dark';
}

/**
 * Resolved token value with source information
 */
export interface ResolvedTokenValue {
  /** The actual token name resolved */
  value: string;
  /** Where the value came from */
  source: 'override' | 'base' | 'default';
  /** If from override or base, which brand ID */
  brandId?: string;
  /** Original description from manifest */
  description?: string;
}

/**
 * Complete state for the Component Token Editor
 */
export interface ComponentTokenEditorState {
  /** Whether the editor panel is open */
  isOpen: boolean;
  /** Currently selected brand ID */
  selectedBrandId: string | null;
  /** Currently selected token category filter */
  selectedCategory: TokenCategory | 'all';
  /** Currently selected theme mode (V4: light/dark only) */
  selectedMode: 'light' | 'dark';
  /** Current preview state for the component */
  previewState: TokenState;
  /** Draft overrides not yet saved */
  draftOverrides: Map<string, TokenOverrideValue>;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Last save error if any */
  lastSaveError: string | null;
}

/**
 * Appearance roles whose token families are emitted by the surface engine and
 * consumed by component CSS appearance classes.
 */
export const EDITOR_APPEARANCE_ROLES = [
  'Primary',
  'Neutral',
  'Secondary',
  'Sparkle',
  'Brand-Bg',
  'Positive',
  'Negative',
  'Warning',
  'Informative',
] as const;
export type AppearanceRoleLabel = typeof EDITOR_APPEARANCE_ROLES[number];

/** Normalize runtime appearance values to emitted token role labels. */
export function normalizeAppearanceRoleLabel(role?: string | null): AppearanceRoleLabel {
  switch ((role ?? 'primary').toLowerCase()) {
    case 'neutral':
      return 'Neutral';
    case 'secondary':
      return 'Secondary';
    case 'sparkle':
      return 'Sparkle';
    case 'brand-bg':
    case 'brandbg':
    case 'brand bg':
      return 'Brand-Bg';
    case 'positive':
      return 'Positive';
    case 'negative':
      return 'Negative';
    case 'warning':
      return 'Warning';
    case 'informative':
      return 'Informative';
    case 'primary':
    default:
      return 'Primary';
  }
}

/** Surface tokens — the 8 unified fill levels emitted per role. */
export const SURFACE_TOKENS = [
  'Default', 'Ghost', 'Minimal', 'Subtle', 'Moderate', 'Bold', 'Elevated', 'Blend',
] as const;

/** On-parent content tokens — read on the page/default surface. */
export const CONTENT_TOKENS = [
  'High', 'Medium-Text', 'Low', 'Tinted', 'TintedA11y',
  'Stroke-Medium', 'Stroke-Low',
] as const;

/** On-bold content tokens — read on the role's bold fill. */
export const ON_BOLD_TOKENS = [
  'Bold-High', 'Bold-Medium', 'Bold-Low', 'Bold-TintedA11y',
] as const;

/**
 * Surface token options for a given role
 * (e.g. `Primary-Bold`, `Neutral-Subtle`).
 */
export function getSurfaceTokensForRole(role: AppearanceRoleLabel): TokenOption[] {
  return SURFACE_TOKENS.map((mode) => ({
    token: `${role}-${mode}`,
    label: mode,
  }));
}

/** State layer tokens (hover/pressed) for a given role. */
export function getStateLayerTokensForRole(role: AppearanceRoleLabel): TokenOption[] {
  return [
    { token: `${role}-Hover`, label: 'Hover' },
    { token: `${role}-Pressed`, label: 'Pressed' },
    { token: `${role}-Bold-Hover`, label: 'Bold Hover' },
    { token: `${role}-Bold-Pressed`, label: 'Bold Pressed' },
    { token: `${role}-Subtle-Hover`, label: 'Subtle Hover' },
    { token: `${role}-Subtle-Pressed`, label: 'Subtle Pressed' },
  ];
}

/** Text/content tokens for a given role (on-parent + on-bold sets). */
export function getTextTokensForRole(role: AppearanceRoleLabel): TokenOption[] {
  return [
    { token: `${role}-High`, label: 'High' },
    { token: `${role}-Medium-Text`, label: 'Medium' },
    { token: `${role}-Low`, label: 'Low' },
    { token: `${role}-Tinted`, label: 'Tinted' },
    { token: `${role}-TintedA11y`, label: 'Tinted A11y' },
    { token: `${role}-Bold-High`, label: 'On Bold — High' },
    { token: `${role}-Bold-Medium`, label: 'On Bold — Medium' },
    { token: `${role}-Bold-Low`, label: 'On Bold — Low' },
    { token: `${role}-Bold-TintedA11y`, label: 'On Bold — Tinted A11y' },
  ];
}

/** Border/stroke tokens for a given role.
 *  Mirrors the Figma plugin model: the dedicated stroke tokens are translucent
 *  low/medium presets; higher-intensity strokes paint the border with the
 *  role's content tokens (Tinted / Tinted A11y / High). */
export function getBorderTokensForRole(role: AppearanceRoleLabel): TokenOption[] {
  return [
    { token: `${role}-Stroke-Low`, label: 'Stroke Low' },
    { token: `${role}-Stroke-Medium`, label: 'Stroke Medium' },
    { token: `${role}-Tinted`, label: 'Stroke Tinted' },
    { token: `${role}-TintedA11y`, label: 'Stroke Tinted A11y' },
    { token: `${role}-High`, label: 'Stroke High' },
    { token: 'transparent', label: 'Transparent' },
  ];
}

/** On-bold border/stroke tokens for a given role.
 *  Companion to {@link getBorderTokensForRole} for components whose stroke sits
 *  on a *bold* (dark) fill — e.g. a Button's `bold` variant. On-default stroke
 *  colours (High/Stroke-Low/…) render dark-on-dark there and disappear, so the
 *  bold surface needs the role's on-bold content tokens (which flip to the
 *  contrasting/light extreme). Mirrors the on-bold set in getTextTokensForRole. */
export function getOnBoldBorderTokensForRole(role: AppearanceRoleLabel): TokenOption[] {
  return [
    { token: `${role}-Bold-High`, label: 'On Bold — High' },
    { token: `${role}-Bold-Medium`, label: 'On Bold — Medium' },
    { token: `${role}-Bold-TintedA11y`, label: 'On Bold — Tinted A11y' },
    { token: 'transparent', label: 'Transparent' },
  ];
}

/**
 * Available tokens grouped by category for the token selector.
 * V4-only for color tokens; organized by surface system.
 */
export const AVAILABLE_TOKENS: Record<TokenCategory, TokenOption[]> = {
  color: [
    // Surface tokens (Primary role — default)
    ...getSurfaceTokensForRole('Primary'),
    // State layers
    ...getStateLayerTokensForRole('Primary'),
    // On-colour / text tokens
    ...getTextTokensForRole('Primary'),
    // Border / stroke colour tokens
    ...getBorderTokensForRole('Primary'),
    // Special
    { token: 'transparent', label: 'Transparent' },
    // Legacy backward compat (grouped at end)
    { token: 'Surface-Bold', label: 'Legacy: Bold' },
    { token: 'Surface-Subtle', label: 'Legacy: Subtle' },
    { token: 'Surface-Main', label: 'Legacy: Main' },
    { token: 'Text-High', label: 'Legacy: Text High' },
    { token: 'Text-OnBold-High', label: 'Legacy: Text OnBold' },
  ],
  typography: [
    // V2 Font Size tokens: {Role}-{Size}-FontSize (all 25 sizes across 6 roles)
    // Label role (button default)
    { token: 'Label-L-FontSize', label: 'Label L' },
    { token: 'Label-M-FontSize', label: 'Label M' },
    { token: 'Label-S-FontSize', label: 'Label S' },
    { token: 'Label-XS-FontSize', label: 'Label XS' },
    { token: 'Label-2XS-FontSize', label: 'Label 2XS' },
    { token: 'Label-3XS-FontSize', label: 'Label 3XS' },
    // Body role
    { token: 'Body-L-FontSize', label: 'Body L' },
    { token: 'Body-M-FontSize', label: 'Body M' },
    { token: 'Body-S-FontSize', label: 'Body S' },
    { token: 'Body-XS-FontSize', label: 'Body XS' },
    { token: 'Body-2XS-FontSize', label: 'Body 2XS' },
    // Title role
    { token: 'Title-L-FontSize', label: 'Title L' },
    { token: 'Title-M-FontSize', label: 'Title M' },
    { token: 'Title-S-FontSize', label: 'Title S' },
    // Headline role
    { token: 'Headline-L-FontSize', label: 'Headline L' },
    { token: 'Headline-M-FontSize', label: 'Headline M' },
    { token: 'Headline-S-FontSize', label: 'Headline S' },
    // Display role
    { token: 'Display-L-FontSize', label: 'Display L' },
    { token: 'Display-M-FontSize', label: 'Display M' },
    { token: 'Display-S-FontSize', label: 'Display S' },
    // Code role
    { token: 'Code-M-FontSize', label: 'Code M' },
    { token: 'Code-S-FontSize', label: 'Code S' },
    { token: 'Code-XS-FontSize', label: 'Code XS' },
    { token: 'Code-2XS-FontSize', label: 'Code 2XS' },
    { token: 'Code-3XS-FontSize', label: 'Code 3XS' },
    // V2 Font Weight tokens: emphasis-based {Role}-FontWeight-{Level}
    { token: 'Label-FontWeight-High', label: 'Label High (700)' },
    { token: 'Label-FontWeight-Medium', label: 'Label Medium (500)' },
    { token: 'Label-FontWeight-Low', label: 'Label Low (400)' },
    { token: 'Body-FontWeight-High', label: 'Body High (700)' },
    { token: 'Body-FontWeight-Medium', label: 'Body Medium (500)' },
    { token: 'Body-FontWeight-Low', label: 'Body Low (400)' },
    { token: 'Code-FontWeight-High', label: 'Code High (700)' },
    { token: 'Code-FontWeight-Medium', label: 'Code Medium (500)' },
    { token: 'Code-FontWeight-Low', label: 'Code Low (400)' },
    // Fixed-weight roles: {Role}-{Size}-FontWeight
    { token: 'Display-L-FontWeight', label: 'Display L (900)' },
    { token: 'Display-M-FontWeight', label: 'Display M (900)' },
    { token: 'Display-S-FontWeight', label: 'Display S (900)' },
    { token: 'Headline-L-FontWeight', label: 'Headline L (900)' },
    { token: 'Headline-M-FontWeight', label: 'Headline M (900)' },
    { token: 'Headline-S-FontWeight', label: 'Headline S (850)' },
    { token: 'Title-L-FontWeight', label: 'Title L (800)' },
    { token: 'Title-M-FontWeight', label: 'Title M (800)' },
    { token: 'Title-S-FontWeight', label: 'Title S (750)' },
    // V2 Line Height tokens: {Role}-{Size}-LineHeight
    { token: 'Label-L-LineHeight', label: 'Label L' },
    { token: 'Label-M-LineHeight', label: 'Label M' },
    { token: 'Label-S-LineHeight', label: 'Label S' },
    { token: 'Label-XS-LineHeight', label: 'Label XS' },
    { token: 'Label-2XS-LineHeight', label: 'Label 2XS' },
    { token: 'Label-3XS-LineHeight', label: 'Label 3XS' },
    { token: 'Body-L-LineHeight', label: 'Body L' },
    { token: 'Body-M-LineHeight', label: 'Body M' },
    { token: 'Body-S-LineHeight', label: 'Body S' },
    { token: 'Body-XS-LineHeight', label: 'Body XS' },
    { token: 'Body-2XS-LineHeight', label: 'Body 2XS' },
    { token: 'Title-L-LineHeight', label: 'Title L' },
    { token: 'Title-M-LineHeight', label: 'Title M' },
    { token: 'Title-S-LineHeight', label: 'Title S' },
    { token: 'Headline-L-LineHeight', label: 'Headline L' },
    { token: 'Headline-M-LineHeight', label: 'Headline M' },
    { token: 'Headline-S-LineHeight', label: 'Headline S' },
    { token: 'Display-L-LineHeight', label: 'Display L' },
    { token: 'Display-M-LineHeight', label: 'Display M' },
    { token: 'Display-S-LineHeight', label: 'Display S' },
    { token: 'Code-M-LineHeight', label: 'Code M' },
    { token: 'Code-S-LineHeight', label: 'Code S' },
    { token: 'Code-XS-LineHeight', label: 'Code XS' },
    { token: 'Code-2XS-LineHeight', label: 'Code 2XS' },
    { token: 'Code-3XS-LineHeight', label: 'Code 3XS' },
  ],
  spacing: [
    { token: 'Spacing-0', label: '0 (0px)' },
    { token: 'Spacing-0-5', label: '0.5' },
    { token: 'Spacing-1', label: '1' },
    { token: 'Spacing-1-5', label: '1.5' },
    { token: 'Spacing-2', label: '2' },
    { token: 'Spacing-2-5', label: '2.5' },
    { token: 'Spacing-3', label: '3' },
    { token: 'Spacing-3-5', label: '3.5' },
    { token: 'Spacing-4', label: '4' },
    { token: 'Spacing-4-5', label: '4.5' },
    { token: 'Spacing-5', label: '5' },
    { token: 'Spacing-5-5', label: '5.5' },
    { token: 'Spacing-6', label: '6' },
    { token: 'Spacing-7', label: '7' },
    { token: 'Spacing-8', label: '8' },
    { token: 'Spacing-9', label: '9' },
    { token: 'Spacing-10', label: '10' },
    { token: 'Spacing-12', label: '12' },
    { token: 'Spacing-14', label: '14' },
    { token: 'Spacing-16', label: '16' },
    { token: 'Spacing-18', label: '18' },
    { token: 'Spacing-20', label: '20' },
    { token: 'Spacing-24', label: '24' },
    { token: 'Spacing-28', label: '28' },
    { token: 'Spacing-32', label: '32' },
    { token: 'Spacing-40', label: '40' },
    { token: 'Spacing-Margin', label: 'Margin (Grid)' },
    { token: 'Spacing-Gutter', label: 'Gutter (Grid)' },
  ],
  // Pixel values are the nominal default-density base (each step aliases a
  // dimension f-step); the live value shifts with platform/density.
  shape: [
    { token: 'Shape-0', label: 'Shape 0 · None (0px)' },
    { token: 'Shape-0-5', label: 'Shape 0.5 · 2px' },
    { token: 'Shape-1', label: 'Shape 1 · 4px' },
    { token: 'Shape-1-5', label: 'Shape 1.5 · 6px' },
    { token: 'Shape-2', label: 'Shape 2 · 8px' },
    { token: 'Shape-2-5', label: 'Shape 2.5 · 10px' },
    { token: 'Shape-3', label: 'Shape 3 · 12px' },
    { token: 'Shape-3-5', label: 'Shape 3.5 · 14px' },
    { token: 'Shape-4', label: 'Shape 4 · 16px' },
    { token: 'Shape-4-5', label: 'Shape 4.5 · 18px' },
    { token: 'Shape-5', label: 'Shape 5 · 20px' },
    { token: 'Shape-5-5', label: 'Shape 5.5 · 22px' },
    { token: 'Shape-6', label: 'Shape 6 · 24px' },
    { token: 'Shape-7', label: 'Shape 7 · 28px' },
    { token: 'Shape-8', label: 'Shape 8 · 32px' },
    { token: 'Shape-9', label: 'Shape 9 · 36px' },
    { token: 'Shape-10', label: 'Shape 10 · 40px' },
    { token: 'Shape-Pill', label: 'Pill · fully rounded' },
  ],
  stroke: STROKE_TOKEN_OPTIONS,
  elevation: [
    { token: 'Elevation-0', label: 'Level 0 (None)' },
    { token: 'Elevation-1', label: 'Level 1' },
    { token: 'Elevation-2', label: 'Level 2' },
    { token: 'Elevation-3', label: 'Level 3' },
    { token: 'Elevation-4', label: 'Level 4' },
    { token: 'Elevation-5', label: 'Level 5' },
  ],
  motion: [
    // Duration tokens
    { token: 'Motion-Duration-Discreet-Micro', label: 'Discreet Micro' },
    { token: 'Motion-Duration-Discreet-Short', label: 'Discreet Short' },
    { token: 'Motion-Duration-Discreet-Medium', label: 'Discreet Medium' },
    { token: 'Motion-Duration-Expressive-Short', label: 'Expressive Short' },
    { token: 'Motion-Duration-Expressive-Medium', label: 'Expressive Medium' },
    { token: 'Motion-Duration-Expressive-Long', label: 'Expressive Long' },
    // Easing tokens
    { token: 'Motion-Easing-Standard', label: 'Standard' },
    { token: 'Motion-Easing-Enter', label: 'Enter' },
    { token: 'Motion-Easing-Exit', label: 'Exit' },
  ],
  accessibility: [
    { token: 'Focus-Outline', label: 'Focus Outline Color' },
    { token: 'Focus-Outline-Width', label: 'Focus Outline Width' },
    { token: 'Touch-Target-Min', label: 'Min Touch Target' },
    { token: 'Disabled-Opacity', label: 'Disabled Opacity' },
  ],
  decoration: [
    // Shape tokens for ornament border radius
    { token: '0px', label: 'Sharp (0)' },
    { token: 'Shape-3', label: 'Shape 3 · 12px' },
    { token: 'Shape-3-5', label: 'Shape 3.5 · 14px' },
    { token: 'Shape-4', label: 'Shape 4 · 16px' },
    { token: 'Shape-Pill', label: 'Shape Pill' },
    // Spacing tokens for ornament padding
    { token: 'Spacing-0', label: 'Spacing 0' },
    { token: 'Spacing-0-5', label: 'Spacing 0.5' },
    { token: 'Spacing-1', label: 'Spacing 1' },
    { token: 'Spacing-3', label: 'Spacing 3' },
    { token: 'Spacing-3-5', label: 'Spacing 3.5' },
    { token: 'Spacing-4', label: 'Spacing 4' },
  ],
  other: [
    // Opacity / miscellaneous tokens
    { token: '0.25', label: 'Opacity 25%' },
    { token: '0.5', label: 'Opacity 50%' },
    { token: '0.95', label: 'Opacity 95%' },
    { token: '1', label: 'Opacity 100%' },
  ],
};

/**
 * Helper to get available tokens for a specific category and subcategory
 */
export function getAvailableTokensForDefinition(
  definition: TokenDefinition
): TokenOption[] {
  const categoryTokens = AVAILABLE_TOKENS[definition.category] || [];

  // If availableTokens is specified, use those
  if (definition.availableTokens && definition.availableTokens.length > 0) {
    return definition.availableTokens;
  }

  // Filter by subcategory if specified
  if (definition.subcategory) {
    const matcher = getSubcategoryMatcher(definition.subcategory);
    if (matcher) {
      return categoryTokens.filter((t) => matcher(t.token));
    }
  }

  return categoryTokens;
}

/**
 * Get a token matcher function for a subcategory.
 *
 * V2 typography tokens use suffix-based naming ({Role}-{Size}-FontSize),
 * so we match by suffix rather than prefix for typography subcategories.
 * Other categories still use prefix matching.
 */
function getSubcategoryMatcher(subcategory: TokenSubcategory): ((token: string) => boolean) | null {
  // Suffix matchers for V2 typography tokens
  const suffixMap: Partial<Record<TokenSubcategory, string>> = {
    size: '-FontSize',
    weight: 'FontWeight',
    lineHeight: '-LineHeight',
  };
  const suffix = suffixMap[subcategory];
  if (suffix) return (token) => token.includes(suffix);

  // Prefix matchers for other categories
  const prefixMap: Partial<Record<TokenSubcategory, string>> = {
    surface: 'Surface-',
    text: 'Text-',
    border: 'Stroke-',
    icon: 'Stroke-',
    duration: 'Motion-Duration-',
    easing: 'Motion-Easing-',
    padding: 'Spacing-',
    margin: 'Spacing-',
    gap: 'Spacing-',
  };
  const prefix = prefixMap[subcategory];
  if (prefix) return (token) => token.startsWith(prefix);

  return null;
}

/**
 * Count tokens by category from a manifest
 */
export function countTokensByCategory(
  tokens: Record<string, TokenDefinition>
): Partial<Record<TokenCategory, number>> {
  const counts: Partial<Record<TokenCategory, number>> = {};

  for (const definition of Object.values(tokens)) {
    counts[definition.category] = (counts[definition.category] || 0) + 1;
  }

  return counts;
}
