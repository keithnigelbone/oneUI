/**
 * Text.shared.ts
 *
 * Shared types and pure state resolver for the design-system Text component.
 *
 * Resolves through OneUI's V2 role-explicit typography tokens and the
 * role-agnostic intermediate-variable colour pattern used by Icon, Button, etc.
 *
 * `resolveTextSize` clamps legacy or invalid (variant, size) pairs to the
 * nearest valid token step and warns in development.
 */

import type { CSSProperties, ElementType, ReactNode } from 'react';
import type {
  ComponentAppearance,
  TypographyScriptId,
  TypographyScriptLineHeightMode,
} from '@oneui/shared';
import { COMPONENT_APPEARANCE_ROLES, getScriptIdsFromLang } from '@oneui/shared';

// ---------------------------------------------------------------------------
// Typography role + per-variant size scales
// ---------------------------------------------------------------------------

export type TextVariant = 'body' | 'label' | 'title' | 'headline' | 'display' | 'code';

export type TextSizeDisplay = 'L' | 'M' | 'S';
export type TextSizeTitle = TextSizeDisplay;
export type TextSizeHeadline = TextSizeDisplay;

/** Body: L → 2XS (no 3XS — maps to 2XS). Matches Figma's 5 body sizes. */
export type TextSizeBody = 'L' | 'M' | 'S' | 'XS' | '2XS';

/** Ordered body sizes for clamp math and showcase (excludes 3XS — invalid on body). */
export const BODY_VALID_ORDER: readonly TextSizeBody[] = ['2XS', 'XS', 'S', 'M', 'L'];

/** Label: L → 3XS (6 sizes). Matches Figma's label scale. */
export type TextSizeLabel = 'L' | 'M' | 'S' | 'XS' | '2XS' | '3XS';

/** Code: M → 3XS (5 sizes). Matches Figma's code scale. */
export type TextSizeCode = 'M' | 'S' | 'XS' | '2XS' | '3XS';

/** Union of all concrete sizes (for manifests, Storybook controls, runtime input). */
export type TextSize = TextSizeDisplay | TextSizeBody | TextSizeLabel | TextSizeCode;

/**
 * Monotonic t-shirt order for clamp / nearest-size math.
 * (Indices: 3XS=0 … L=5.) No variant exposes XL/2XL after the Figma alignment.
 */
export const TEXT_SIZE_ORDER = ['3XS', '2XS', 'XS', 'S', 'M', 'L'] as const;

export type TextSizeStep = (typeof TEXT_SIZE_ORDER)[number];

export const TEXT_VARIANTS: readonly TextVariant[] = [
  'body',
  'label',
  'title',
  'headline',
  'display',
  'code',
];

/** All step labels (Storybook / meta controls). */
export const TEXT_SIZE_OPTIONS: readonly TextSizeStep[] = [...TEXT_SIZE_ORDER];

const LABEL_VALID_ORDER: readonly TextSizeLabel[] = [
  '3XS',
  '2XS',
  'XS',
  'S',
  'M',
  'L',
];

const CODE_VALID_ORDER: readonly TextSizeCode[] = ['3XS', '2XS', 'XS', 'S', 'M'];

function devTextWarn(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[Text] ${message}`);
  }
}

function isTextSizeStep(value: string): value is TextSizeStep {
  return (TEXT_SIZE_ORDER as readonly string[]).includes(value);
}

function indexOfStep(value: string): number {
  if (!isTextSizeStep(value)) return -1;
  return TEXT_SIZE_ORDER.indexOf(value);
}

function nearestInOrderedSubset(requestedIdx: number, subset: readonly string[]): string {
  let best = subset[0];
  let bestDist = Infinity;
  for (const v of subset) {
    const idx = indexOfStep(v);
    if (idx < 0) continue;
    const d = Math.abs(idx - requestedIdx);
    if (d < bestDist) {
      bestDist = d;
      best = v;
    }
  }
  return best;
}

/**
 * Maps a requested size string to the nearest valid size for the variant.
 * Emits a dev warning when the input was invalid or legacy.
 */
export function resolveTextSize(variant: TextVariant, requested: string | undefined): TextSize {
  const raw = requested ?? 'M';

  switch (variant) {
    case 'display':
    case 'headline':
    case 'title': {
      const v = raw as TextSizeDisplay;
      if (v === 'L' || v === 'M' || v === 'S') return v;
      devTextWarn(
        `Invalid size "${raw}" for variant "${variant}". Valid sizes: L, M, S. Using a safe fallback.`
      );
      const idx = indexOfStep(raw);
      const sIdx = indexOfStep('S');
      const lIdx = indexOfStep('L');
      if (idx < 0) return 'M';
      if (idx < sIdx) return 'S';
      if (idx > lIdx) return 'L';
      return 'M';
    }
    case 'body': {
      const b = raw as TextSizeBody;
      if ((BODY_VALID_ORDER as readonly string[]).includes(b)) return b;
      if (raw === '3XS') {
        devTextWarn(
          `Invalid size "3XS" for variant "body" (body has no 3XS). Falling back to "2XS".`
        );
        return '2XS';
      }
      devTextWarn(
        `Invalid size "${raw}" for variant "body". Valid: ${BODY_VALID_ORDER.join(', ')}. Using nearest match.`
      );
      const idx = indexOfStep(raw);
      if (idx < 0) return 'M';
      return nearestInOrderedSubset(idx, BODY_VALID_ORDER) as TextSizeBody;
    }
    case 'label': {
      const lab = raw as TextSizeLabel;
      if ((LABEL_VALID_ORDER as readonly string[]).includes(lab)) return lab;
      devTextWarn(
        `Invalid size "${raw}" for variant "label". Valid: ${LABEL_VALID_ORDER.join(', ')}. Using nearest match.`
      );
      const idx = indexOfStep(raw);
      if (idx < 0) return 'M';
      return nearestInOrderedSubset(idx, LABEL_VALID_ORDER) as TextSizeLabel;
    }
    case 'code': {
      const c = raw as TextSizeCode;
      if ((CODE_VALID_ORDER as readonly string[]).includes(c)) return c;
      devTextWarn(
        `Invalid size "${raw}" for variant "code". Valid: ${CODE_VALID_ORDER.join(', ')}. Using nearest match.`
      );
      const idx = indexOfStep(raw);
      if (idx < 0) return 'M';
      return nearestInOrderedSubset(idx, CODE_VALID_ORDER) as TextSizeCode;
    }
    default:
      return 'M';
  }
}

// ---------------------------------------------------------------------------

export type TextWeight = 'high' | 'medium' | 'low';

export type TextAttention = 'none' | 'high' | 'medium' | 'low' | 'tintedA11y';

/** Canonical multi-accent appearance (9 roles + auto). */
export type TextAppearance = ComponentAppearance;

export type TextAlign = 'left' | 'center' | 'right';

export type TextLanguage = 'latin' | 'others';
export type TextScript = TypographyScriptId | (string & {});
export type TextScriptMode = Extract<TypographyScriptLineHeightMode, 'ui' | 'reading'>;

/** All concrete appearance roles (for iteration in Storybook / showcase). */
export const TEXT_APPEARANCES: readonly Exclude<TextAppearance, 'auto'>[] = [
  ...COMPONENT_APPEARANCE_ROLES,
];

export const TEXT_WEIGHTS: readonly TextWeight[] = ['high', 'medium', 'low'];

export const TEXT_ATTENTIONS: readonly TextAttention[] = [
  'none',
  'high',
  'medium',
  'low',
  'tintedA11y',
];

// ---------------------------------------------------------------------------
// Props — discriminated union: `size` narrows with `variant`
// ---------------------------------------------------------------------------

interface TextCommonProps {
  weight?: TextWeight;
  attention?: TextAttention;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  /** @deprecated Use `lang` or `script` for script-aware typography. */
  language?: TextLanguage;
  /** BCP 47 language tag. Also enables matching `:lang(...)` script context. */
  lang?: string;
  /** Explicit script override when language inference is insufficient. */
  script?: TextScript;
  /** `ui` uses compact UI fonts; `reading` switches to reading fonts + roomier line-height. */
  scriptMode?: TextScriptMode;
  appearance?: TextAppearance;
  text?: string;
  textAlign?: TextAlign;
  maxLines?: number;
  link?: ReactNode;
  as?: ElementType;
  /** When `as="a"`, passed through to the anchor element. */
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Stable document id — for `aria-labelledby` / skip-link targets on headings. */
  id?: string;
  /** Native tab order override when the text node must participate in focus management. */
  tabIndex?: number;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

/**
 * Variant and size live in the discriminated TextProps type alias below. Keep
 * this small interface so metadata drift tooling, which unions local Props
 * interfaces, can see those public props without flattening the union.
 */
interface TextVariantSizeProps {
  variant?: TextVariant;
  size?: TextSize;
}

export type TextProps = TextCommonProps &
  (
    | { variant?: 'body'; size?: TextSizeBody }
    | { variant: 'label'; size?: TextSizeLabel }
    | { variant: 'title'; size?: TextSizeTitle }
    | { variant: 'headline'; size?: TextSizeHeadline }
    | { variant: 'display'; size?: TextSizeDisplay }
    | { variant: 'code'; size?: TextSizeCode }
  );

// ---------------------------------------------------------------------------
// State resolver (pure — not a React hook)
// ---------------------------------------------------------------------------

/**
 * Resolve Text state from props: appearance, attention, data attributes,
 * and **resolved** size (after `resolveTextSize` clamping).
 */
export function resolveTextState(props: TextProps) {
  const {
    variant = 'body',
    size,
    weight = 'high',
    attention = 'none',
    italic = false,
    underline = false,
    strikethrough = false,
    language = 'latin',
    lang,
    script,
    scriptMode = 'ui',
    appearance = 'auto',
    textAlign,
  } = props;

  const resolvedSize = resolveTextSize(variant, size);

  const resolvedAppearance: Exclude<TextAppearance, 'auto'> =
    appearance === 'auto' ? 'neutral' : appearance;

  const resolvedAttention: Exclude<TextAttention, 'none'> =
    attention === 'none' ? 'high' : attention;

  const inferredScript = script ?? getScriptIdsFromLang(lang);

  const dataAttrs: Record<string, string | number | undefined> = {
    'data-variant': variant,
    'data-size': resolvedSize,
    'data-weight': weight,
    'data-attention': resolvedAttention,
    'data-appearance': resolvedAppearance,
    'data-language': language,
  };
  if (inferredScript) dataAttrs['data-script'] = inferredScript;
  if (inferredScript && scriptMode !== 'ui') dataAttrs['data-script-mode'] = scriptMode;
  if (italic) dataAttrs['data-italic'] = 'true';
  if (underline) dataAttrs['data-underline'] = 'true';
  if (strikethrough) dataAttrs['data-strikethrough'] = 'true';
  if (textAlign) dataAttrs['data-align'] = textAlign;

  return {
    resolvedVariant: variant,
    resolvedSize,
    resolvedWeight: weight,
    resolvedAttention,
    resolvedAppearance,
    resolvedLanguage: language,
    dataAttrs,
  };
}
