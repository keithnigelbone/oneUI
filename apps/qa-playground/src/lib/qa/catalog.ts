import type { ComponentCategory, ComponentMeta } from '@oneui/shared';
import type {
  ComponentLifecycleStatus,
  QACatalogListItem,
  QACatalogListItemWithMeta,
  UIComponentCatalogEntry,
} from './types';
import {
  type ComponentTestStability,
  type ComponentTestStabilityFilter,
  resolveCatalogEntryStability,
} from './componentTestStability';
import { buildScenariosForMeta } from './buildScenarios';
import { getCatalogThumbDefaults } from './catalogThumbDefaults';
import { applyMetaDefaultProps, mapMatrixToProps } from './scenarioProps';

const BETA_NAMES = new Set<string>([]);

export function getComponentStatus(meta: ComponentMeta): ComponentLifecycleStatus {
  if (meta.tags?.includes('beta')) return 'beta';
  if (BETA_NAMES.has(meta.name)) return 'beta';
  return 'stable';
}

export function toCatalogEntry(meta: ComponentMeta): UIComponentCatalogEntry {
  return { meta, status: getComponentStatus(meta) };
}

/** Fields users expect when typing a component name in catalog search (not long descriptions). */
function catalogSearchHaystack(row: {
  displayName: string;
  name: string;
  slug: string;
  tags?: readonly string[];
}): string {
  return [row.displayName, row.name, row.slug, ...(row.tags ?? [])].join(' ').toLowerCase();
}

export function filterCatalog(
  entries: UIComponentCatalogEntry[],
  query: string,
  category: ComponentCategory | 'all',
  status: ComponentLifecycleStatus | 'all'
): UIComponentCatalogEntry[] {
  const q = query.trim().toLowerCase();
  return entries.filter(({ meta, status: st }) => {
    if (category !== 'all' && meta.category !== category) return false;
    if (status !== 'all' && st !== status) return false;
    if (!q) return true;
    return catalogSearchHaystack(meta).includes(q);
  });
}

export function buildQACatalogList(metas: ComponentMeta[]): QACatalogListItem[] {
  return metas.map((meta) => ({
    slug: meta.slug,
    displayName: meta.displayName,
    name: meta.name,
    category: meta.category,
    status: getComponentStatus(meta),
    description: meta.description,
    tags: meta.tags ?? [],
  }));
}

export function buildQACatalogListWithMeta(metas: ComponentMeta[]): QACatalogListItemWithMeta[] {
  return metas.map((meta) => ({
    slug: meta.slug,
    displayName: meta.displayName,
    name: meta.name,
    category: meta.category,
    status: getComponentStatus(meta),
    description: meta.description,
    tags: meta.tags ?? [],
    meta,
  }));
}

/** First scenario props — used for catalog card thumbnails. */
export function getCatalogThumbnailPreviewProps(meta: ComponentMeta): Record<string, unknown> {
  const catalogThumb = getCatalogThumbDefaults(meta);
  if (catalogThumb) {
    return catalogThumb;
  }

  if (meta.slug === 'icon') {
    return {
      icon: 'heart',
      size: '8',
      appearance: 'primary',
      emphasis: 'high',
      'aria-label': 'Icon',
    };
  }

  if (meta.slug === 'image') {
    return applyMetaDefaultProps(meta, {
      src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23E8E4F4"/%3E%3C/svg%3E',
      alt: meta.displayName,
      aspectRatio: '1:1',
    });
  }

  const scenarios = buildScenariosForMeta(meta);
  if (scenarios.length > 0) {
    return applyMetaDefaultProps(meta, scenarios[0].props);
  }
  const matrix = meta.previewMatrix;
  const v0 = matrix.variants[0] ?? '';
  const sizes = matrix.sizes;
  const s0 = sizes && sizes.length > 0 ? sizes[0] : undefined;
  return applyMetaDefaultProps(meta, mapMatrixToProps(meta, v0, s0));
}

export function filterQACatalogList<T extends QACatalogListItem>(
  entries: T[],
  query: string,
  category: ComponentCategory | 'all',
  testStability: ComponentTestStabilityFilter,
  stabilityBySlug: Map<string, ComponentTestStability>,
): T[] {
  const q = query.trim().toLowerCase();
  return entries.filter((row) => {
    if (category !== 'all' && row.category !== category) return false;
    const stability = resolveCatalogEntryStability(row.slug, stabilityBySlug);
    if (testStability !== 'all' && stability !== testStability) return false;
    if (!q) return true;
    return catalogSearchHaystack(row).includes(q);
  });
}
