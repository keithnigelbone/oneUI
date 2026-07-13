/**
 * Category ordering and section blurbs for the Components QA catalog.
 */

import type { ComponentCategory } from '@oneui/shared';

import type { QACatalogListItem } from '@/lib/qa/types';

/** Visual section order (matches common design-system hubs: nav → input → display …). */
export const CATEGORY_SECTION_ORDER: ComponentCategory[] = [
  'navigation',
  'inputs',
  'display',
  'feedback',
  'actions',
  'layout',
  'overlays',
];

export const CATEGORY_SECTION_BLURB: Record<ComponentCategory, string> = {
  navigation: 'Help users move through the app',
  inputs: 'Collect user data and input',
  display: 'Present information and content',
  feedback: 'Communicate status and system messages',
  actions: 'Trigger operations and tasks',
  layout: 'Structure and arrange interface regions',
  overlays: 'Layered surfaces above the page',
};

export function groupQACatalogByCategory<T extends QACatalogListItem>(
  rows: T[]
): { category: ComponentCategory; items: T[] }[] {
  const byCat = new Map<ComponentCategory, T[]>();
  for (const c of CATEGORY_SECTION_ORDER) {
    byCat.set(c, []);
  }
  for (const row of rows) {
    byCat.get(row.category)?.push(row);
  }
  return CATEGORY_SECTION_ORDER.filter((c) => (byCat.get(c)?.length ?? 0) > 0).map((c) => ({
    category: c,
    items: byCat.get(c) as T[],
  }));
}
