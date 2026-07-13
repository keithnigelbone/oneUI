/**
 * Shared Figma validation constants for Web Header QA + Playwright manifest sync.
 */

import type { PrimaryNavMiddle, PrimaryNavType, SearchInputPosition } from '@oneui/ui/components/WebHeader';

export const WEB_HEADER_FIGMA_PLATFORMS = [360, 768, 1024, 1440, 1920] as const;

export type WebHeaderFigmaPlatform = (typeof WEB_HEADER_FIGMA_PLATFORMS)[number];

export const FIGMA_VALIDATION_TAB = 'Figma Validation';

export const FIGMA_PROPERTY_GRID_TESTID = 'figma-web-header-property-grid';

export const FIGMA_COMBO_GRID_TESTID = 'figma-web-header-combo-grid';

export const FIGMA_PROPERTY_ROWS = [
  { group: 'type', values: ['homeBar', 'contextBar', 'searchBar'] as const },
  { group: 'start', values: [true, false] as const },
  { group: 'middle', values: ['fluid', 'centred'] as const },
  { group: 'primaryNavItems', values: [true, false] as const },
  { group: 'end', values: [true, false] as const },
  { group: 'avatar', values: [true, false] as const },
] as const;

export type WebHeaderFigmaPropertyGroup = (typeof FIGMA_PROPERTY_ROWS)[number]['group'];

/** Figma type × middle × searchInput matrix (13 cells). */
export const FIGMA_TYPE_MIDDLE_SEARCH_COMBOS: ReadonlyArray<{
  type: PrimaryNavType;
  middle: PrimaryNavMiddle;
  searchInput: SearchInputPosition;
}> = [
  { type: 'homeBar', middle: 'fluid', searchInput: 'none' },
  { type: 'homeBar', middle: 'fluid', searchInput: 'middle' },
  { type: 'homeBar', middle: 'fluid', searchInput: 'end' },
  { type: 'homeBar', middle: 'centred', searchInput: 'none' },
  { type: 'homeBar', middle: 'centred', searchInput: 'middle' },
  { type: 'homeBar', middle: 'centred', searchInput: 'end' },
  { type: 'contextBar', middle: 'fluid', searchInput: 'none' },
  { type: 'contextBar', middle: 'fluid', searchInput: 'middle' },
  { type: 'contextBar', middle: 'fluid', searchInput: 'end' },
  { type: 'contextBar', middle: 'centred', searchInput: 'none' },
  { type: 'contextBar', middle: 'centred', searchInput: 'middle' },
  { type: 'contextBar', middle: 'centred', searchInput: 'end' },
  { type: 'searchBar', middle: 'fluid', searchInput: 'middle' },
];

export function figmaPropertyCellTestId(
  group: string,
  value: string | boolean,
  platform: WebHeaderFigmaPlatform,
): string {
  const normalized = String(value).replace(/:/g, '');
  return `wh-figma-${group}-${normalized}-platform-${platform}`;
}

export function figmaComboCellTestId(
  type: PrimaryNavType,
  middle: PrimaryNavMiddle,
  searchInput: SearchInputPosition,
  platform: WebHeaderFigmaPlatform,
): string {
  return `wh-figma-combo-${type}-${middle}-search-${searchInput}-platform-${platform}`;
}
