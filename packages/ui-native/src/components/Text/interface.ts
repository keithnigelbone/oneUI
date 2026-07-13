/**
 * Text interface (native)
 *
 * Single source for the native Text prop contract and state resolver.
 * Mirrors web `packages/ui/src/components/text/Text.shared.ts` (no
 * `@oneui/ui` import) and cross-checks against Layers
 * `jdstext-4/generated/interface.ts` (React V4) and
 * `jdstext/generated/interface.ts` (React Native).
 *
 * `resolveTextSize` clamps legacy or invalid (variant, size) pairs to the
 * nearest valid token step and warns in development — same behaviour as web.
 */

import { isValidElement, type ReactNode } from 'react';
import type { TextStyle } from 'react-native';
import {
  COMPONENT_APPEARANCE_ROLES,
  getScriptIdsFromLang,
  type ComponentAppearance,
  type TypographyScriptId,
  type TypographyScriptLineHeightMode,
} from '@oneui/shared';
import { useOptionalTypographyLanguage } from '../../theme/TypographyLanguageContext';

// ---------------------------------------------------------------------------
// Typography role + per-variant size scales
// ---------------------------------------------------------------------------

export type TextVariant = 'body' | 'label' | 'title' | 'headline' | 'display' | 'code';

export type TextSizeDisplay = 'L' | 'M' | 'S';
export type TextSizeTitle = TextSizeDisplay;
export type TextSizeHeadline = TextSizeDisplay;

/** Body: 2XL → 2XS (no 3XS — maps to 2XS). */
export type TextSizeBody = 'L' | 'M' | 'S' | 'XS' | '2XS';

/** Ordered body sizes for clamp math and showcase (excludes 3XS — invalid on body). */
export const BODY_VALID_ORDER: readonly TextSizeBody[] = ['2XS', 'XS', 'S', 'M', 'L'];

/** Label: full scale including 3XS. */
export type TextSizeLabel = 'L' | 'M' | 'S' | 'XS' | '2XS' | '3XS';

export type TextSizeCode = 'M' | 'S' | 'XS';

/** Union of all concrete sizes. */
export type TextSize = TextSizeDisplay | TextSizeBody | TextSizeLabel | TextSizeCode;

/** Monotonic t-shirt order for clamp / nearest-size math. */
export const TEXT_SIZE_ORDER = ['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'] as const;

export type TextSizeStep = (typeof TEXT_SIZE_ORDER)[number];

export const TEXT_VARIANTS: readonly TextVariant[] = [
  'body',
  'label',
  'title',
  'headline',
  'display',
  'code',
];

export const TEXT_SIZE_OPTIONS: readonly TextSizeStep[] = [...TEXT_SIZE_ORDER];

const LABEL_VALID_ORDER: readonly TextSizeLabel[] = ['3XS', '2XS', 'XS', 'S', 'M', 'L'];

function devTextWarn(message: string): void {
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
      if (c === 'M' || c === 'S' || c === 'XS') return c;
      devTextWarn(
        `Invalid size "${raw}" for variant "code". Valid: M, S, XS. Using a safe fallback.`
      );
      const idx = indexOfStep(raw);
      if (idx < 0) return 'M';
      if (idx <= indexOfStep('XS')) return 'XS';
      return 'M';
    }
    default:
      return 'M';
  }
}

// ---------------------------------------------------------------------------

export type TextWeight = 'high' | 'medium' | 'low';

/**
 * Text attention (content-colour emphasis). The four Figma visual levels.
 * Defaults to `'medium'` when unset.
 */
export type TextAttention = 'high' | 'medium' | 'low' | 'tintedA11y';

/** Canonical multi-accent appearance (9 roles + auto). */
export type TextAppearance = ComponentAppearance;

export type TextAlign = 'left' | 'center' | 'right';

export type TextLanguage = 'latin' | 'others';
export type TextScript = TypographyScriptId | (string & {});
export type TextScriptMode = Extract<TypographyScriptLineHeightMode, 'ui' | 'reading'>;

/** All concrete appearance roles (for iteration in showcase). */
export const TEXT_APPEARANCES: readonly Exclude<TextAppearance, 'auto'>[] = [
  ...COMPONENT_APPEARANCE_ROLES,
];

export const TEXT_WEIGHTS: readonly TextWeight[] = ['high', 'medium', 'low'];

export const TEXT_ATTENTIONS: readonly TextAttention[] = ['high', 'medium', 'low', 'tintedA11y'];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TextCommonProps {
  weight?: TextWeight;
  /**
   * Content-colour emphasis — `high | medium | low | tintedA11y`.
   * @default 'medium'
   */
  attention?: TextAttention;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  /** @deprecated Use `lang` or `script` for script-aware typography. */
  language?: TextLanguage;
  /** BCP 47 language tag. Drives script inference for typography slot selection. */
  lang?: string;
  /** Explicit script override when language inference is insufficient. */
  script?: TextScript;
  /** `ui` uses compact UI fonts; `reading` switches to reading fonts + roomier line-height. */
  scriptMode?: TextScriptMode;
  appearance?: TextAppearance;
  /** Convenience: string-only content. `children` still wins when both are set. */
  text?: string;
  textAlign?: TextAlign;
  /** Maximum visible lines before truncation. Maps to RN `numberOfLines`. */
  maxLines?: number;
  /**
   * Link slot — accepts two shapes:
   *  - `string` → substring of the rendered text (`children`/`text`) that
   *    should be styled and made tappable inline. The surrounding copy is
   *    kept as plain text so callers can write
   *    `<Text link="docs">Read the docs before continuing</Text>` and the
   *    component splits the copy for them.
   *  - `ReactNode` → trailing node appended after the content (Layers
   *    `_linkText-slot`).
   */
  link?: string | ReactNode;
  /** Press handler invoked when the inline `link` substring is tapped. */
  onLinkPress?: () => void;
  /** Optional press handler — Text is non-interactive by default. */
  onPress?: () => void;
  style?: TextStyle;
  children?: ReactNode;
  /** Accessible name; required when there is no visible text content. */
  'aria-label'?: string;
  /** Hide from the accessibility tree. */
  'aria-hidden'?: boolean;
  /** Describes the result of activating an interactive Text (React Native). */
  accessibilityHint?: string;
  /** React Native test identifier. */
  testID?: string;
}

/**
 * Discriminated union — `size` narrows with `variant` so consumers cannot
 * combine an invalid pair at the type level. Runtime `resolveTextSize` still
 * clamps gracefully for dynamic (non-typed) callers.
 */
export type TextProps = TextCommonProps &
  (
    | { variant?: 'body'; size?: TextSizeBody }
    | { variant: 'label'; size?: TextSizeLabel }
    | { variant: 'title'; size?: TextSizeTitle }
    | { variant: 'headline'; size?: TextSizeHeadline }
    | { variant: 'display'; size?: TextSizeDisplay }
    | { variant: 'code'; size?: TextSizeCode }
  );

/** @deprecated Prefer `TextProps`. */
export type TextNativeProps = TextProps;

// ---------------------------------------------------------------------------
// State resolver
// ---------------------------------------------------------------------------

/**
 * Resolve Text state from props: appearance, attention, weight, and clamped
 * size. Mirrors web `resolveTextState`. Pure — safe to call outside React.
 */
export function useTextState(props: TextProps): {
  resolvedVariant: TextVariant;
  resolvedSize: TextSize;
  resolvedWeight: TextWeight;
  resolvedAttention: TextAttention;
  resolvedAppearance: Exclude<TextAppearance, 'auto'>;
  resolvedLang: string | undefined;
  resolvedScript: TextScript | null;
  resolvedScriptMode: TextScriptMode;
  dataAttrs: Record<string, string | number | undefined>;
} {
  const {
    variant = 'body',
    size,
    weight = 'medium',
    attention = 'medium',
    italic = false,
    underline = false,
    strikethrough = false,
    language = 'latin',
    lang,
    script,
    scriptMode: scriptModeProp,
    appearance = 'auto',
    textAlign,
  } = props;

  const langCtx = useOptionalTypographyLanguage();
  const scriptMode = scriptModeProp ?? langCtx?.scriptMode ?? 'ui';

  const resolvedSize = resolveTextSize(variant, size);

  const resolvedAppearance: Exclude<TextAppearance, 'auto'> =
    appearance === 'auto' ? 'neutral' : appearance;

  const resolvedAttention: TextAttention = attention;

  const resolvedLang = lang ?? (langCtx?.locale !== 'en' ? langCtx?.locale : undefined);

  let inferredScript = (script ?? getScriptIdsFromLang(resolvedLang ?? lang)) as TextScript | null;
  if (language === 'others' && !inferredScript) {
    inferredScript = (langCtx?.scriptId ?? null) as TextScript | null;
  }
  if (!inferredScript && langCtx?.scriptId && !script && !lang) {
    inferredScript = langCtx.scriptId as TextScript;
  }

  const dataAttrs: Record<string, string | number | undefined> = {
    'data-variant': variant,
    'data-size': resolvedSize,
    'data-weight': variant === 'code' ? 'medium' : weight,
    'data-attention': resolvedAttention,
    'data-appearance': resolvedAppearance,
    'data-language': language,
  };
  if (resolvedLang) dataAttrs['data-lang'] = resolvedLang;
  if (inferredScript) dataAttrs['data-script'] = String(inferredScript);
  if (inferredScript && scriptMode !== 'ui') dataAttrs['data-script-mode'] = scriptMode;
  if (italic) dataAttrs['data-italic'] = 'true';
  if (underline) dataAttrs['data-underline'] = 'true';
  if (strikethrough) dataAttrs['data-strikethrough'] = 'true';
  if (textAlign) dataAttrs['data-align'] = textAlign;

  return {
    resolvedVariant: variant,
    resolvedSize,
    resolvedWeight: variant === 'code' ? 'medium' : weight,
    resolvedAttention,
    resolvedAppearance,
    resolvedLang,
    resolvedScript: inferredScript ?? null,
    resolvedScriptMode: scriptMode,
    dataAttrs,
  };
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

/**
 * Recursively collect the visible text leaves of a React node tree. Walks
 * arrays and element `children` so rich content like
 * `<Text><Bold>Read</Bold> the docs</Text>` still yields a label
 * (`"Read the docs"`). Custom components that render their text internally
 * (no `children` prop) cannot be introspected statically and contribute
 * nothing — callers should pass `aria-label` for those.
 */
function extractNodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractNodeText).join('');
  if (isValidElement(node)) {
    return extractNodeText((node.props as { children?: ReactNode }).children);
  }
  return '';
}

/**
 * Resolve the accessibility label for Text. Falls back to the string content
 * of `children` / `text` so VoiceOver / TalkBack can read the visible copy
 * verbatim. For ReactElement / array `children` the visible text leaves are
 * extracted recursively so rich content still exposes a meaningful label
 * instead of `undefined`.
 */
export function resolveTextAccessibilityLabel(props: TextProps): string | undefined {
  if (props['aria-label']) return props['aria-label'];
  const { children, text } = props;
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (children != null) {
    const extracted = extractNodeText(children).trim();
    if (extracted.length > 0) return extracted;
  }
  if (typeof text === 'string' && text.length > 0) return text;
  return undefined;
}

export interface TextAccessibilityProps {
  accessible: boolean;
  /**
   * Only set when the element needs explicit semantics: `link` (interactive)
   * or `none` (aria-hidden). All non-interactive text — including heading
   * variants — intentionally omits the role: `Text` is a generic primitive,
   * React Native already exposes `<Text>` content to screen readers, and
   * forcing `text`/`header` would override author intent and risk flattening
   * nested interactive nodes (e.g. inline links) into the parent.
   */
  accessibilityRole?: 'link' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  'aria-hidden'?: boolean;
}

/**
 * Map Text props to React Native accessibility props.
 *
 * - `aria-hidden` hides decorative copy from screen readers (matches
 *   Layers `JDSTextProps.ariaHidden`).
 * - `Text` is a generic primitive and carries NO explicit role on its own —
 *   plain text AND heading variants (`title` / `headline` / `display`) are left
 *   role-less. RN already exposes `<Text>` content to screen readers, and
 *   imposing `text`/`header` semantics here would override author intent.
 * - An `onPress` handler promotes the role to `link` so VoiceOver announces
 *   it as interactive — the only role this component assigns.
 * - When a `link` element is rendered (`options.hasRenderedLink` — inline
 *   substring or trailing slot), that node carries the sole `link` role, so the
 *   parent is NOT promoted to `link` even if `onPress` is set. Nesting a `link`
 *   inside a `link` is invalid: it duplicates interactive semantics and makes
 *   `getByRole('link')` ambiguous. The parent then gets no role; its `onPress`
 *   handler still fires.
 * - `aria-hidden` collapses the node to `role="none"` + hidden.
 */
export function getTextAccessibilityProps(
  props: TextProps,
  _state: { resolvedVariant: TextVariant },
  options?: { hasRenderedLink?: boolean }
): TextAccessibilityProps {
  const accessibilityLabel = resolveTextAccessibilityLabel(props);
  const isInteractive = typeof props.onPress === 'function';
  const hasRenderedLink = options?.hasRenderedLink === true;

  // The only role Text assigns is `link`, and only for an interactive target
  // that is not already represented by an inner rendered link.
  const accessibilityRole: 'link' | undefined =
    isInteractive && !hasRenderedLink ? 'link' : undefined;

  if (props['aria-hidden']) {
    return {
      accessible: false,
      accessibilityRole: 'none',
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
      'aria-hidden': true,
    };
  }

  return {
    accessible: true,
    ...(accessibilityRole ? { accessibilityRole } : null),
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
  };
}
