/**
 * Shared JSON-Schema fragments used by every @jds/kb-<sdk> package.
 *
 * DESIGN CALL (E.d) — push-back gently:
 *
 * The user's question was: "does the propsSchema literal live in kb-core/schemas/
 * as the shared source, OR is each SDK's propsSchema independent?" Both
 * answers are wrong on their own:
 *
 *   - "Shared whole schema in kb-core" — couples web's `type: 'submit'` to RN
 *     which has no such concept; couples RN's `onPress` to web which uses
 *     `onClick`; forces premature unification on size enums that legitimately
 *     differ (web uses {s,m,l}; RN uses numeric f-step {6,8,10,12}).
 *
 *   - "Each SDK independent" — costs DRY violations on the 60% of props that
 *     ARE platform-neutral (variant/appearance/disabled/loading/forbidden
 *     patterns). Worse, it allows the platform-neutral subset to drift across
 *     SDKs without anyone noticing.
 *
 * RIGHT ANSWER — hybrid:
 *   - kb-core/schemas/ ships reusable PROP BLOCKS (this file): forbidden-
 *     pattern fragments, role/variant/attention enums, content-slot enums.
 *     These are the BUSINESS contract.
 *   - Each kb-<sdk> composes its full propsSchema by spreading these blocks
 *     and adding its own SDK-specific props. The full schema is materialised
 *     per-SDK at JSON-emit time.
 *   - When a block changes (e.g. new attention level), every SDK picks it up
 *     by re-running its emitter. Drift is structurally impossible on the
 *     shared subset.
 *
 * This file is the source-of-truth for shared blocks. Authors edit TS;
 * generators emit JSON.
 */

import { ATTENTION_LEVELS, COLOR_ROLES, SURFACE_MODES } from '../types/roles';

// ---------------------------------------------------------------------------
// Reusable enum blocks
// ---------------------------------------------------------------------------

export const ROLE_ENUM = {
  enum: [...COLOR_ROLES, 'auto'],
  default: 'auto',
} as const;

/**
 * Canonical multi-accent appearance enum — the 9 roles + 'auto' that match
 * `@oneui/shared` ComponentAppearance (the type every RN component's `appearance`
 * prop actually uses). Use THIS, not ROLE_ENUM, for any component typed
 * ComponentAppearance: ROLE_ENUM's `tertiary` / `quaternary` are NOT accepted by
 * those components and must never be advertised (CLAUDE.md § Appearance Type).
 */
export const COMPONENT_APPEARANCE_ENUM = {
  enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
  default: 'auto',
} as const;

export const SURFACE_MODE_ENUM = {
  enum: [...SURFACE_MODES],
} as const;

export const ATTENTION_ENUM = {
  enum: [...ATTENTION_LEVELS],
} as const;

export const VARIANT_ENUM = {
  enum: ['bold', 'subtle', 'ghost'],
  default: 'bold',
} as const;

export const CONTENT_SLOT_ENUM = {
  enum: ['high', 'medium', 'low', 'tinted', 'tintedA11y'],
  default: 'high',
} as const;

// ---------------------------------------------------------------------------
// Forbidden-pattern blocks — the canonical x-jds-suggestion vocabulary.
// Every SDK's color-prop attaches one of these.
// ---------------------------------------------------------------------------

export const FORBIDDEN_COLOR_LITERAL = {
  type: 'string',
  not: {
    anyOf: [
      { pattern: '^#' },
      { pattern: '^rgba?\\(' },
      { pattern: '^hsla?\\(' },
      { pattern: '^oklch\\(' },
      { pattern: '^color-mix\\(' },
      { enum: ['transparent', 'inherit'] },
    ],
  },
  'x-jds-suggestion':
    "Don't paint directly. Use `appearance` (role) + `variant`/`mode` and wrap in <Surface mode>; the brand cascade picks the right fill.",
  'x-jds-severity': 'error',
} as const;

export const FORBIDDEN_DIMENSION_LITERAL = {
  type: 'string',
  not: {
    anyOf: [
      { pattern: '\\d+\\s*px\\b' },
      { pattern: '\\d+\\s*em\\b' },
      { pattern: '\\d+\\s*rem\\b' },
    ],
  },
  'x-jds-suggestion': 'Use `--Spacing-{Size}` / `--Shape-{Size}` tokens, not raw px / em / rem.',
  'x-jds-severity': 'error',
} as const;

export const FORBIDDEN_FONT_SIZE = {
  not: {},
  'x-jds-suggestion': 'Use `role` + `size` (e.g. role="body" size="M") instead of fontSize.',
  'x-jds-severity': 'error',
} as const;

export const FORBIDDEN_FONT_WEIGHT = {
  not: {},
  'x-jds-suggestion': 'Use `emphasis` (high/medium/low) on body / label / code roles.',
  'x-jds-severity': 'error',
} as const;

// ---------------------------------------------------------------------------
// Common prop blocks. SDKs spread these into their full propsSchema.
// ---------------------------------------------------------------------------

export const BUTTON_SHARED_PROPS = {
  children: { type: 'string', description: 'Visible label. Serves as accessible name.' },
  variant: VARIANT_ENUM,
  attention: ATTENTION_ENUM,
  // ButtonAppearance = ComponentAppearance (9 roles + auto). No tertiary / quaternary.
  appearance: COMPONENT_APPEARANCE_ENUM,
  disabled: { type: 'boolean', default: false },
  loading: { type: 'boolean', default: false },
  fullWidth: { type: 'boolean', default: false },
} as const;

export const BUTTON_REQUIRED_ONE_OF = [
  { required: ['variant'] },
  { required: ['attention'] },
] as const;

export const TEXT_SHARED_PROPS = {
  // Implementation prop names: `variant` / `weight` / `attention`
  // (NOT role / emphasis / contentSlot — those were never accepted by the component).
  variant: { enum: ['display', 'headline', 'title', 'body', 'label', 'code'] },
  size: { description: 'Variant-scoped size. Validator enforces the per-variant subset.' },
  weight: {
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    description: 'Only valid for variant ∈ {body, label, code}. Ignored otherwise.',
  },
  appearance: {
    enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    default: 'auto',
  },
  attention: { enum: ['high', 'medium', 'low', 'tintedA11y'], default: 'medium' },
  fontSize: FORBIDDEN_FONT_SIZE,
  fontWeight: FORBIDDEN_FONT_WEIGHT,
  color: FORBIDDEN_COLOR_LITERAL,
} as const;

export const ICON_SHARED_PROPS = {
  name: { type: 'string', description: 'Semantic icon name from the IconRegistry.' },
  // Sizes are spacing-index tokens (DesignIconSize), not raw pixels.
  size: {
    enum: ['2', '2.5', '3', '3.5', '4', '4.5', '5', '6', '7', '8', '9', '10', '12', '14', '16', '18', '20', '24', '32', '40'],
    default: '5',
  },
  appearance: { enum: [...COLOR_ROLES], default: 'neutral' },
  // Implementation prop is `emphasis` (maps 1:1 to web IconEmphasis).
  emphasis: CONTENT_SLOT_ENUM,
  'aria-label': { type: 'string', description: 'Required when icon conveys meaning standalone.' },
  color: FORBIDDEN_COLOR_LITERAL,
} as const;

export const SURFACE_SHARED_PROPS = {
  mode: SURFACE_MODE_ENUM,
  appearance: { enum: [...COLOR_ROLES], default: 'neutral' },
} as const;

export const CARD_SHARED_PROPS = {
  mode: { enum: ['minimal', 'subtle', 'moderate', 'bold', 'elevated'], default: 'subtle' },
  appearance: {
    enum: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'brand-bg'],
    default: 'neutral',
  },
  interactive: { type: 'boolean', default: false },
} as const;

export const INPUT_SHARED_PROPS = {
  value: { type: 'string' },
  defaultValue: { type: 'string' },
  placeholder: { type: 'string' },
  disabled: { type: 'boolean', default: false },
  readOnly: { type: 'boolean', default: false },
  invalid: { type: 'boolean', default: false },
  required: { type: 'boolean', default: false },
  // Input mirrors web InputAppearance: 8 roles + 'auto' — NO brand-bg / tertiary / quaternary.
  appearance: {
    enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
    default: 'auto',
  },
  // Input's public size prop uses t-shirt aliases (mapped to numeric f-steps
  // 6/8/10/12 internally via resolveInputSize). The numeric values are NOT a
  // valid public API and were rejected by the component.
  size: { enum: ['xs', 's', 'm', 'l'], default: 'm' },
  label: { type: 'string' },
  helperText: { type: 'string' },
  errorText: { type: 'string' },
} as const;

export const SEARCH_BAR_SHARED_PROPS = {
  value: { type: 'string' },
  defaultValue: { type: 'string' },
  placeholder: { type: 'string', default: 'Search…' },
  appearance: { enum: ['neutral', 'primary'], default: 'neutral' },
  size: { enum: [8, 10, 12], default: 10 },
  clearable: { type: 'boolean', default: true },
  disabled: { type: 'boolean', default: false },
  loading: { type: 'boolean', default: false },
} as const;

export const BOTTOM_NAV_SHARED_PROPS = {
  activeId: { type: 'string', description: 'id of the active TabBarItem.' },
  appearance: { enum: ['neutral', 'primary', 'brand-bg'], default: 'neutral' },
  elevated: { type: 'boolean', default: true },
} as const;

export const TAB_BAR_ITEM_SHARED_PROPS = {
  id: { type: 'string' },
  label: { type: 'string' },
  active: { type: 'boolean', default: false },
  badge: { type: 'string', description: 'Optional badge content (count or text).' },
  disabled: { type: 'boolean', default: false },
} as const;

export const BANNER_SHARED_PROPS = {
  tone: { enum: ['informative', 'positive', 'warning', 'negative'], default: 'informative' },
  title: { type: 'string' },
  body: { type: 'string' },
  dismissible: { type: 'boolean', default: true },
  inline: { type: 'boolean', default: false },
} as const;
