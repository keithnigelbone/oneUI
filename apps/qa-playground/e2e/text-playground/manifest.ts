/**
 * Text QA playground manifest — section IDs, testids, and constants
 * aligned to `TextQaShowcase.tsx`.
 */

export const TEXT_PLAYGROUND_ROUTE = '/c/text';

/** CSS selector scoping all Text showcase bands for axe scans. */
export const TEXT_SHOWCASE_AXE_SCOPE = '[data-section^="text-qa-"]';

/** All `data-section` IDs emitted by `TextQaShowcase`. */
export const TEXT_DATA_SECTIONS = [
  'text-qa-default',
  'text-qa-variants',
  'text-qa-body-sizes',
  'text-qa-label-sizes',
  'text-qa-display-sizes',
  'text-qa-code-sizes',
  'text-qa-attention-weight',
  'text-qa-appearances',
  'text-qa-decorations',
  'text-qa-alignment',
  'text-qa-truncation',
  'text-qa-semantic',
  'text-qa-anchor',
  'text-qa-link-slot',
  'text-qa-surface',
  'text-qa-realworld',
  'text-qa-edge-cases',
  'text-qa-a11y',
  'text-qa-combos',
] as const;

export type TextSection = (typeof TEXT_DATA_SECTIONS)[number];

/** Total number of story bands. */
export const TEXT_SECTION_COUNT = TEXT_DATA_SECTIONS.length;

/** Total number of combination matrix rows. */
export const TEXT_COMBO_COUNT = 8;

/** Typography variants covered by the showcase. */
export const TEXT_VARIANTS = [
  'body',
  'label',
  'title',
  'headline',
  'display',
  'code',
] as const;

/** Body sizes (smallest to largest). */
export const TEXT_BODY_SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'] as const;

/** Label sizes (includes 3XS). */
export const TEXT_LABEL_SIZES = ['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'] as const;

/** Shared sizes for display / headline / title. */
export const TEXT_DISPLAY_SIZES = ['S', 'M', 'L'] as const;

/** Code sizes. */
export const TEXT_CODE_SIZES = ['XS', 'S', 'M'] as const;

/** Appearance values shown in showcase. */
export const TEXT_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
  'brand-bg',
] as const;

/** `data-testid` values on wrapping `<span>` elements in TextQaShowcase. */
export const TEXT_TESTIDS = {
  default: 'text-default',
  italic: 'text-italic',
  underline: 'text-underline',
  strikethrough: 'text-strikethrough',
  allDecorations: 'text-all-decorations',
  alignLeft: 'text-align-left',
  alignCenter: 'text-align-center',
  alignRight: 'text-align-right',
  maxlines1: 'text-maxlines-1',
  maxlines3: 'text-maxlines-3',
  maxlinesNone: 'text-maxlines-none',
  asH1: 'text-as-h1',
  asH2: 'text-as-h2',
  asP: 'text-as-p',
  asCode: 'text-as-code',
  asSpan: 'text-as-span',
  anchorBasic: 'text-anchor-basic',
  anchorTargetBlank: 'text-anchor-target-blank',
  anchorHash: 'text-anchor-hash',
  linkSlot: 'text-link-slot',
  linkSlotNull: 'text-link-slot-null',
  a11yH1: 'text-a11y-heading-h1',
  a11yH2: 'text-a11y-heading-h2',
  a11yAnchorName: 'text-a11y-anchor-name',
  a11yAriaLabel: 'text-a11y-aria-label',
  a11yAriaHidden: 'text-a11y-aria-hidden',
  a11yLang: 'text-a11y-lang',
  edgeEmpty: 'text-edge-empty',
  edgeLongWord: 'text-edge-long-word',
  edgeEmoji: 'text-edge-emoji',
  edgeMaxlinesZero: 'text-edge-maxlines-zero',
  edgeSizeFallback: 'text-edge-size-fallback',
  edgeTextProp: 'text-edge-text-prop',
  realworldArticle: 'text-realworld-article',
  realworldError: 'text-realworld-error',
  realworldPricing: 'text-realworld-pricing',
  realworldSuccess: 'text-realworld-success',
  realworldMetadata: 'text-realworld-metadata',
} as const;
