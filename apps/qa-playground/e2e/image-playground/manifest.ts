/**
 * Anchors from `ImageQaShowcase.tsx` (Test Scenarios tab).
 * `testID` prop → `data-testid` on the Image root (`<div role="img">` or `<button>`).
 *
 * Component type: **display** by default; **interactive** when `interactive` (without `disabled`).
 */

export const IMAGE_PLAYGROUND_ROUTE = '/c/image';

export const IMAGE_COMPONENT_TYPE = 'display-interactive' as const;

export const IMAGE_SHOWCASE_AXE_SCOPE = '[data-section^="image-qa-"]';

export const IMAGE_FIGMA_VALIDATION_TAB = 'Figma Validation';

export const IMAGE_DATA_SECTIONS = [
  'image-qa-default',
  'image-qa-aspect',
  'image-qa-fit',
  'image-qa-interactive',
  'image-qa-fallback',
  'image-qa-loading',
  'image-qa-a11y',
  'image-qa-bug-repro',
  'image-qa-radius',
] as const;

export const IMAGE_SECTION_COUNT = IMAGE_DATA_SECTIONS.length;

export const IMAGE_FIGMA_ASPECTS = [
  { testId: 'image-aspect-auto', ratio: null as string | null },
  { testId: 'image-aspect-1-1', ratio: '1:1' },
  { testId: 'image-aspect-3-2', ratio: '3:2' },
  { testId: 'image-aspect-4-3', ratio: '4:3' },
  { testId: 'image-aspect-16-9', ratio: '16:9' },
  { testId: 'image-aspect-2-3', ratio: '2:3' },
  { testId: 'image-aspect-3-4', ratio: '3:4' },
  { testId: 'image-aspect-9-16', ratio: '9:16' },
] as const;

export const IMAGE_FIT_MODES = ['cover', 'contain', 'fill', 'none', 'scale-down'] as const;

export const IMAGE_LOADING_MODES = ['lazy', 'eager'] as const;

export const IMAGE_ROOT_TESTIDS = {
  default: 'image-default',
  interactive: 'image-interactive',
  clickCount: 'image-click-count',
  fallbackDefault: 'image-fallback-default',
  fallbackNode: 'image-fallback-node',
  loadingLazy: 'image-loading-lazy',
  loadingEager: 'image-loading-eager',
  a11yLabelled: 'image-a11y-labelled',
  bugInteractiveDisabled: 'image-bug-interactive-disabled',
  radiusToken: 'image-radius-token',
} as const;

export function imageAspectTestId(ratio: string): string {
  return ratio === 'auto' ? 'image-aspect-auto' : `image-aspect-${ratio.replace(':', '-')}`;
}

export function imageFitTestId(fit: (typeof IMAGE_FIT_MODES)[number]): string {
  return `image-fit-${fit}`;
}

export function imageLoadingTestId(mode: (typeof IMAGE_LOADING_MODES)[number]): string {
  return `image-loading-${mode}`;
}

/** Image root `data-testid` values (excludes click counter caption). */
export function allImageRootTestIds(): string[] {
  const ids: string[] = [IMAGE_ROOT_TESTIDS.default];

  for (const { testId } of IMAGE_FIGMA_ASPECTS) {
    ids.push(testId);
  }

  for (const fit of IMAGE_FIT_MODES) {
    ids.push(imageFitTestId(fit));
  }

  ids.push(
    IMAGE_ROOT_TESTIDS.interactive,
    IMAGE_ROOT_TESTIDS.fallbackDefault,
    IMAGE_ROOT_TESTIDS.fallbackNode,
    IMAGE_ROOT_TESTIDS.loadingLazy,
    IMAGE_ROOT_TESTIDS.loadingEager,
    IMAGE_ROOT_TESTIDS.a11yLabelled,
    IMAGE_ROOT_TESTIDS.bugInteractiveDisabled,
    IMAGE_ROOT_TESTIDS.radiusToken,
  );

  return ids;
}

/** Every `data-testid` in Test Scenarios tab (image roots + click counter). */
export function allImagePlaygroundTestIds(): string[] {
  return [...allImageRootTestIds(), IMAGE_ROOT_TESTIDS.clickCount];
}

export const IMAGE_ALL_ROOT_TESTIDS = allImageRootTestIds();

export const IMAGE_ALL_TESTIDS = allImagePlaygroundTestIds();

export const IMAGE_BUG_BAND = 'image-qa-bug-repro' as const;

export const IMAGE_BUG_ID = 'BUG-IMAGE-001' as const;

export const IMAGE_BUG_EXCLUDE = `[data-section="${IMAGE_BUG_BAND}"], [data-testid="${IMAGE_ROOT_TESTIDS.bugInteractiveDisabled}"]`;
