/**
 * Anchors from `SingleTextButtonQaShowcase.tsx` — keep in sync when the showcase changes.
 * Component type: interactive (action button, Base UI Button — not a toggle).
 */

export const STB_COMPONENT_TYPE = 'interactive' as const;

/** Test Scenarios story bands only (excludes page chrome). */
export const STB_SHOWCASE_AXE_SCOPE =
  '[data-section^="single-text-button-qa-"]:not([data-section="single-text-button-qa-bug-repro"])';

export const STB_PREFIX = 'single-text-button';

export const STB_PLAYGROUND_ROUTE = '/c/single-text-button';

export const STB_FIGMA_SIZES = ['s', 'm', 'l'] as const;

export const STB_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const STB_ATTENTION_VARIANT_MAP = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
} as const;

/** `data-section` values from `QaStoryBand` `id` props (exact). */
export const STB_DATA_SECTIONS = [
  'single-text-button-qa-default',
  'single-text-button-qa-size',
  'single-text-button-qa-attention',
  'single-text-button-qa-condensed',
  'single-text-button-qa-states',
  'single-text-button-qa-interaction',
  'single-text-button-qa-bug-repro',
  'single-text-button-qa-edge',
] as const;

export const STB_SECTION_COUNT = STB_DATA_SECTIONS.length;

export function stbSizeTestId(size: (typeof STB_FIGMA_SIZES)[number]): string {
  return `${STB_PREFIX}-size-${size}`;
}

export function stbAttentionTestId(attention: (typeof STB_ATTENTIONS)[number]): string {
  return `${STB_PREFIX}-attention-${attention}`;
}

export function stbCondensedTestId(size: (typeof STB_FIGMA_SIZES)[number]): string {
  return `${STB_PREFIX}-condensed-${size}`;
}

/** Every `data-testid` mounted by the Test Scenarios showcase. */
export function buildStbAllTestIds(): string[] {
  const out: string[] = [
    `${STB_PREFIX}-default`,
    `${STB_PREFIX}-disabled`,
    `${STB_PREFIX}-loading`,
    `${STB_PREFIX}-interactive`,
    `${STB_PREFIX}-press-count`,
    `${STB_PREFIX}-bug-loading-no-label`,
    `${STB_PREFIX}-edge-long`,
  ];

  for (const size of STB_FIGMA_SIZES) {
    out.push(stbSizeTestId(size), stbCondensedTestId(size));
  }
  for (const attention of STB_ATTENTIONS) {
    out.push(stbAttentionTestId(attention));
  }

  return out;
}

export const STB_ALL_TESTIDS = buildStbAllTestIds();

export const STB_SMOKE_TESTID = `${STB_PREFIX}-default`;

/** Representative cells for scoped axe runs (exclude bug repro). */
export const STB_AXE_TARGET_TESTIDS = [
  `${STB_PREFIX}-default`,
  stbSizeTestId('m'),
  stbAttentionTestId('high'),
  stbCondensedTestId('m'),
  `${STB_PREFIX}-disabled`,
  `${STB_PREFIX}-loading`,
  `${STB_PREFIX}-interactive`,
  `${STB_PREFIX}-edge-long`,
] as const;
