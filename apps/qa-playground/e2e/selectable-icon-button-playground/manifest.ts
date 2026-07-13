/**
 * Anchors from `SelectableIconButtonQaShowcase.tsx` — keep in sync when the showcase changes.
 * Component type: interactive (icon-only toggle, Base UI Toggle — `aria-pressed`).
 */

export const SIB_PREFIX = 'selectable-icon-button';

export const SIB_PLAYGROUND_ROUTE = '/c/selectable-icon-button';

export const SIB_COMPONENT_TYPE = 'interactive' as const;

export const SIB_SHOWCASE_AXE_SCOPE = '[data-section]';

export const SIB_FIGMA_SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL'] as const;

export const SIB_APPEARANCES = [
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

export const SIB_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const SIB_MATRIX_APPEARANCE_ROWS = ['primary', 'neutral', 'negative', 'positive'] as const;

export const SIB_APPEARANCES_DISABLED_DEMO = ['primary', 'neutral', 'negative'] as const;

export const SIB_ACCENT_ROWS = ['primary', 'secondary', 'sparkle'] as const;

export const SIB_DATA_SECTIONS = [
  'size',
  'attention',
  'shape',
  'appearance',
  'selected',
  'condensed-contained',
  'fullwidth-contained',
  'disabled',
  'loading',
  'accent',
  'content',
  'size-appearance-matrix',
  'size-selected-matrix',
  'attention-appearance-matrix',
  'combinations',
] as const;

export const SIB_SECTION_COUNT = SIB_DATA_SECTIONS.length;

export function sibSizeTestId(figma: (typeof SIB_FIGMA_SIZES)[number]): string {
  return `${SIB_PREFIX}-size-${figma}`;
}

export function sibAppearanceTestId(appearance: (typeof SIB_APPEARANCES)[number]): string {
  return `${SIB_PREFIX}-appearance-${appearance}`;
}

export function sibAppearanceOnBoldTestId(appearance: (typeof SIB_APPEARANCES)[number]): string {
  return `${SIB_PREFIX}-appearance-${appearance}-on-bold`;
}

/** Every `data-testid` mounted by the showcase (for 1.2 visibility sweep). */
export function buildSibAllTestIds(): string[] {
  const out: string[] = [];

  for (const figma of SIB_FIGMA_SIZES) {
    out.push(sibSizeTestId(figma));
  }
  for (const a of SIB_ATTENTIONS) {
    out.push(`${SIB_PREFIX}-attention-${a}`);
  }
  out.push(`${SIB_PREFIX}-shape-1-1`, `${SIB_PREFIX}-shape-2-3`);

  for (const appearance of SIB_APPEARANCES) {
    out.push(sibAppearanceTestId(appearance));
    out.push(sibAppearanceOnBoldTestId(appearance));
  }

  out.push(`${SIB_PREFIX}-selected-false`, `${SIB_PREFIX}-selected-true`);
  for (const appearance of SIB_APPEARANCES) {
    out.push(`${SIB_PREFIX}-appearance-${appearance}-selected-false`, `${SIB_PREFIX}-appearance-${appearance}-selected-true`);
  }

  for (const contained of [false, true] as const) {
    for (const condensed of [false, true] as const) {
      out.push(`${SIB_PREFIX}-contained-${contained}-condensed-${condensed}`);
    }
  }
  for (const contained of [false, true] as const) {
    for (const fullWidth of [false, true] as const) {
      out.push(`${SIB_PREFIX}-contained-${contained}-fullwidth-${fullWidth}`);
    }
  }

  out.push(`${SIB_PREFIX}-disabled-false`, `${SIB_PREFIX}-disabled-true`);
  for (const appearance of SIB_APPEARANCES_DISABLED_DEMO) {
    out.push(`${SIB_PREFIX}-disabled-false-${appearance}`, `${SIB_PREFIX}-disabled-true-${appearance}`);
  }

  out.push(`${SIB_PREFIX}-loading-false`, `${SIB_PREFIX}-loading-true`);

  for (const role of SIB_ACCENT_ROWS) {
    out.push(`${SIB_PREFIX}-accent-${role}`);
  }
  out.push(`${SIB_PREFIX}-content-icon`, `${SIB_PREFIX}-content-spinner`);

  for (const appearance of SIB_APPEARANCES) {
    for (const figma of SIB_FIGMA_SIZES) {
      out.push(`${SIB_PREFIX}-${figma}-${appearance}`);
    }
  }

  for (const sel of [false, true] as const) {
    for (const figma of SIB_FIGMA_SIZES) {
      out.push(`${SIB_PREFIX}-${figma}-selected-${sel}`);
    }
  }

  for (const appearance of SIB_MATRIX_APPEARANCE_ROWS) {
    for (const attention of SIB_ATTENTIONS) {
      out.push(`${SIB_PREFIX}-${attention}-${appearance}`);
    }
  }

  out.push(
    `${SIB_PREFIX}-selected-true-disabled-true`,
    `${SIB_PREFIX}-selected-true-loading-true`,
    `${SIB_PREFIX}-loading-true-content-icon`,
    `${SIB_PREFIX}-loading-true-content-spinner`,
    `${SIB_PREFIX}-XL-fullwidth`,
    `${SIB_PREFIX}-all-defaults`,
  );

  return out;
}

export const SIB_ALL_TESTIDS = buildSibAllTestIds();

/** Stable wait target after opening Test Scenarios. */
export const SIB_SMOKE_TESTID = sibSizeTestId('M');

/** Representative cells for scoped axe runs (full page scan covers the rest). */
export const SIB_AXE_TARGET_TESTIDS = [
  sibSizeTestId('M'),
  `${SIB_PREFIX}-attention-high`,
  `${SIB_PREFIX}-appearance-primary`,
  `${SIB_PREFIX}-appearance-primary-on-bold`,
  `${SIB_PREFIX}-selected-false`,
  `${SIB_PREFIX}-disabled-true`,
  `${SIB_PREFIX}-loading-true`,
  `${SIB_PREFIX}-content-icon`,
  `${SIB_PREFIX}-M-primary`,
  `${SIB_PREFIX}-M-selected-true`,
  `${SIB_PREFIX}-high-primary`,
  `${SIB_PREFIX}-all-defaults`,
] as const;
