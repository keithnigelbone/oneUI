/**
 * Anchors from `WebHeaderQaShowcase.tsx` — keep in sync when the showcase changes.
 * Component type: navigation (responsive web header — banner + primary nav).
 */

export const WEB_HEADER_COMPONENT_TYPE = 'navigation' as const;

export const WEB_HEADER_PLAYGROUND_ROUTE = '/c/web-header';

export const WEB_HEADER_SHOWCASE_AXE_SCOPE = '[data-section^="web-header-qa-"]';

export const FIGMA_VALIDATION_TAB = 'Figma Validation';

export const FIGMA_PROPERTY_GRID_TESTID = 'figma-web-header-property-grid';

export const FIGMA_COMBO_GRID_TESTID = 'figma-web-header-combo-grid';

/** Figma platform widths shown in the Responsive story and QA band. */
export const WEB_HEADER_FIGMA_PLATFORMS = [360, 768, 1024, 1440, 1920] as const;

/** `data-section` values from `QaStoryBand` `id` props (exact). */
export const WEB_HEADER_DATA_SECTIONS = [
  'web-header-qa-default',
  'web-header-qa-home-bar',
  'web-header-qa-context-bar',
  'web-header-qa-search-bar',
  'web-header-qa-api-start',
  'web-header-qa-api-middle',
  'web-header-qa-api-primary-nav',
  'web-header-qa-api-end',
  'web-header-qa-api-avatar',
  'web-header-qa-end-actions',
  'web-header-qa-header-item',
  'web-header-qa-negative',
  'web-header-qa-responsive',
] as const;

export const WEB_HEADER_SECTION_COUNT = WEB_HEADER_DATA_SECTIONS.length;

export const WEB_HEADER_ROOT_TESTIDS = {
  default: 'web-header-default',
  homeFluidSearchEnd: 'web-header-home-fluid-search-end',
  homeFluidSearchMiddle: 'web-header-home-fluid-search-middle',
  homeCentredNoSearch: 'web-header-home-centred-no-search',
  homeNoHamburger: 'web-header-home-no-hamburger',
  contextNoNav: 'web-header-context-no-nav',
  contextWithNav: 'web-header-context-with-nav',
  searchMiddle: 'web-header-search-middle',
  searchEnd: 'web-header-search-end',
  startTrue: 'web-header-start-true',
  startFalse: 'web-header-start-false',
  middleFluid: 'web-header-middle-fluid',
  middleCentred: 'web-header-middle-centred',
  primaryNavTrue: 'web-header-primary-nav-true',
  primaryNavFalse: 'web-header-primary-nav-false',
  endTrue: 'web-header-end-true',
  endFalse: 'web-header-end-false',
  avatarTrue: 'web-header-avatar-true',
  avatarFalse: 'web-header-avatar-false',
  endIconButtons: 'web-header-end-icon-buttons',
  endButton: 'web-header-end-button',
  headerItemSlot: 'web-header-header-item-slot',
  negativeEmptyNav: 'web-header-negative-empty-nav',
  negativeNoEndNoAvatar: 'web-header-negative-no-end-no-avatar',
  negativeSearchbarNoSearch: 'web-header-negative-searchbar-no-search',
} as const;

export function webHeaderPlatformTestId(width: (typeof WEB_HEADER_FIGMA_PLATFORMS)[number]): string {
  return `web-header-platform-${width}-inner`;
}

export function buildWebHeaderAllTestIds(): string[] {
  const out: string[] = Object.values(WEB_HEADER_ROOT_TESTIDS);

  for (const width of WEB_HEADER_FIGMA_PLATFORMS) {
    out.push(webHeaderPlatformTestId(width));
  }

  return out;
}

export const WEB_HEADER_ALL_TESTIDS = buildWebHeaderAllTestIds();

export const WEB_HEADER_SMOKE_TESTID = WEB_HEADER_ROOT_TESTIDS.default;

export const WEB_HEADER_AXE_TARGET_TESTIDS = [
  WEB_HEADER_ROOT_TESTIDS.default,
  WEB_HEADER_ROOT_TESTIDS.homeFluidSearchEnd,
  WEB_HEADER_ROOT_TESTIDS.startFalse,
  WEB_HEADER_ROOT_TESTIDS.primaryNavFalse,
  WEB_HEADER_ROOT_TESTIDS.endButton,
  WEB_HEADER_ROOT_TESTIDS.contextNoNav,
  WEB_HEADER_ROOT_TESTIDS.searchMiddle,
  WEB_HEADER_ROOT_TESTIDS.negativeEmptyNav,
  webHeaderPlatformTestId(360),
  webHeaderPlatformTestId(768),
  webHeaderPlatformTestId(1024),
] as const;

/** Mobile / tablet / desktop representative widths for responsive group tests. */
export const WEB_HEADER_RESPONSIVE_WIDTHS = {
  mobile: 360,
  tablet: 768,
  desktop: 1024,
} as const;
