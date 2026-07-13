/**
 * Single import site for `@oneui/ui/registry/metaRegistry` in this app.
 * QA-only slugs (e.g. `input`) live in `./qaOnlyMetas.ts` — not in `packages/ui`.
 */

import { ALL_COMPONENT_METAS } from '@oneui/ui/registry/metaRegistry';
import { buildQACatalogListWithMeta } from '../lib/qa/catalog';
import { QA_ONLY_METAS } from './qaOnlyMetas';

const ALL_QA_METAS = [...ALL_COMPONENT_METAS, ...QA_ONLY_METAS];

export const QA_CATALOG_ENTRIES = buildQACatalogListWithMeta(ALL_QA_METAS);

export function getMetaBySlug(slug: string) {
  return ALL_QA_METAS.find((m) => m.slug === slug);
}
