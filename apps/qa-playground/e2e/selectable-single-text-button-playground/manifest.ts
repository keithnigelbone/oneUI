/**
 * Anchors from `SelectableSingleTextButtonQaShowcase.tsx` — keep in sync when the showcase changes.
 * Component type: interactive (Base UI Toggle, `aria-pressed`, max 2 char label).
 */

export const SSTB_COMPONENT_TYPE = 'interactive' as const;

/** Scoped axe include — Test Scenarios bands only (excludes Brand / Theme chrome). */
export const SSTB_SHOWCASE_AXE_SCOPE = '[data-section]';

export const SSTB_PREFIX = 'selectable-single-text-button';

export const SSTB_PLAYGROUND_ROUTE = '/c/selectable-single-text-button';

export const SSTB_FIGMA_SIZES = ['S', 'M', 'L'] as const;

export const SSTB_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

export const SSTB_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const SSTB_APPEARANCES_DISABLED_DEMO = ['primary', 'negative', 'neutral'] as const;

export const SSTB_MATRIX_ATTENTION_APPEARANCE_ROWS = [
  'primary',
  'neutral',
  'negative',
  'positive',
  'sparkle',
] as const;

export const SSTB_DATA_SECTIONS = [
  'default',
  'size',
  'attention',
  'appearance',
  'condensed',
  'disabled',
  'loading',
  'accent',
  'content',
  'size-appearance-matrix',
  'size-attention-matrix',
  'attention-appearance-matrix',
  'condensed-size',
  'combinations',
  'accent-appearance-matrix',
  'content-loading',
] as const;

export const SSTB_SECTION_COUNT = SSTB_DATA_SECTIONS.length;

export function sstbSizeTestId(figma: (typeof SSTB_FIGMA_SIZES)[number]): string {
  return `${SSTB_PREFIX}-size-${figma}`;
}

export function sstbAppearanceTestId(appearance: (typeof SSTB_APPEARANCES)[number]): string {
  return `${SSTB_PREFIX}-appearance-${appearance}`;
}

export function sstbAppearanceOnBoldTestId(appearance: (typeof SSTB_APPEARANCES)[number]): string {
  return `${SSTB_PREFIX}-appearance-${appearance}-on-bold`;
}

/** Every `data-testid` mounted by the showcase (for visibility sweep). */
export function buildSstbAllTestIds(): string[] {
  const out: string[] = [];

  out.push(`${SSTB_PREFIX}-default`);

  for (const figma of SSTB_FIGMA_SIZES) {
    out.push(sstbSizeTestId(figma));
  }
  for (const a of SSTB_ATTENTIONS) {
    out.push(`${SSTB_PREFIX}-attention-${a}`);
  }

  for (const appearance of SSTB_APPEARANCES) {
    out.push(sstbAppearanceTestId(appearance));
    out.push(sstbAppearanceOnBoldTestId(appearance));
  }

  out.push(`${SSTB_PREFIX}-condensed-false`, `${SSTB_PREFIX}-condensed-true`);
  out.push(`${SSTB_PREFIX}-disabled-false`, `${SSTB_PREFIX}-disabled-true`);

  for (const appearance of SSTB_APPEARANCES_DISABLED_DEMO) {
    out.push(`${SSTB_PREFIX}-${appearance}-disabled-false`, `${SSTB_PREFIX}-${appearance}-disabled-true`);
  }

  out.push(`${SSTB_PREFIX}-loading-false`, `${SSTB_PREFIX}-loading-true`);
  for (const figma of SSTB_FIGMA_SIZES) {
    out.push(`${SSTB_PREFIX}-loading-true-size-${figma}`);
  }

  out.push(`${SSTB_PREFIX}-content-text`, `${SSTB_PREFIX}-content-spinner`);

  for (const appearance of SSTB_APPEARANCES) {
    for (const figma of SSTB_FIGMA_SIZES) {
      out.push(`${SSTB_PREFIX}-${figma}-${appearance}`);
    }
  }

  for (const attention of SSTB_ATTENTIONS) {
    for (const figma of SSTB_FIGMA_SIZES) {
      out.push(`${SSTB_PREFIX}-${figma}-${attention}`);
    }
  }

  for (const appearance of SSTB_MATRIX_ATTENTION_APPEARANCE_ROWS) {
    for (const attention of SSTB_ATTENTIONS) {
      out.push(`${SSTB_PREFIX}-${attention}-${appearance}`);
    }
  }

  for (const condensed of [false, true] as const) {
    for (const figma of SSTB_FIGMA_SIZES) {
      out.push(`${SSTB_PREFIX}-condensed-${condensed}-size-${figma}`);
    }
  }

  out.push(
    `${SSTB_PREFIX}-disabled-primary`,
    `${SSTB_PREFIX}-disabled-negative`,
    `${SSTB_PREFIX}-disabled-neutral`,
  );
  for (const figma of SSTB_FIGMA_SIZES) {
    out.push(`${SSTB_PREFIX}-loading-size-${figma}`);
  }
  out.push(
    `${SSTB_PREFIX}-loading-primary`,
    `${SSTB_PREFIX}-loading-negative`,
    `${SSTB_PREFIX}-condensed-disabled-false`,
    `${SSTB_PREFIX}-condensed-disabled-true`,
    `${SSTB_PREFIX}-condensed-loading`,
    `${SSTB_PREFIX}-all-defaults-explicit`,
    `${SSTB_PREFIX}-minimised`,
    `${SSTB_PREFIX}-stress-test`,
  );

  out.push(
    `${SSTB_PREFIX}-content-text-loading-false`,
    `${SSTB_PREFIX}-content-text-loading-true`,
    `${SSTB_PREFIX}-content-spinner-loading-false`,
    `${SSTB_PREFIX}-content-spinner-loading-true`,
  );

  return out;
}

export const SSTB_ALL_TESTIDS = buildSstbAllTestIds();

/** Stable wait target after opening Test Scenarios. */
export const SSTB_SMOKE_TESTID = `${SSTB_PREFIX}-default`;

/** Representative cells for scoped axe runs. */
export const SSTB_AXE_TARGET_TESTIDS = [
  `${SSTB_PREFIX}-default`,
  sstbSizeTestId('M'),
  `${SSTB_PREFIX}-attention-high`,
  sstbAppearanceTestId('primary'),
  sstbAppearanceOnBoldTestId('primary'),
  `${SSTB_PREFIX}-disabled-true`,
  `${SSTB_PREFIX}-loading-true`,
  `${SSTB_PREFIX}-content-text`,
  `${SSTB_PREFIX}-M-primary`,
  `${SSTB_PREFIX}-M-high`,
  `${SSTB_PREFIX}-high-primary`,
  `${SSTB_PREFIX}-all-defaults-explicit`,
] as const;
