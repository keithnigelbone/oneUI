import { QA_CATALOG_ENTRIES } from '@/catalog/registry';
import type { SemanticIconName } from '@oneui/shared';
import { resolveStorybookNavIcon } from './qaStorybookNavIcons';

/** Default component opened when entering QA Playground Storybook from the catalog. */
export const STORYBOOK_DEFAULT_SLUG = 'button';

export function storybookPlaygroundPath(slug: string = STORYBOOK_DEFAULT_SLUG): string {
  return `/storybook/${slug}`;
}

export type QaStorybookNavItem = {
  slug: string;
  label: string;
  icon: SemanticIconName;
};

export type QaStorybookNavGroup = {
  id: string;
  label: string;
  items: QaStorybookNavItem[];
};

/** Molecule-level composed components; everything else in the catalog sidebar is listed under Atoms. */
const MOLECULE_SLUGS = new Set([
  'segmented-control',
  'input-field',
  'input',
  'input-dynamic-text',
  'input-feedback',
  'checkbox-field',
  'radio-field',
  'chip-group',
  'tabs',
  'stepper',
  'slider',
  'touch-slider',
  'pagination',
  'pagination-dots',
  'selectable-button',
  'selectable-icon-button',
  'selectable-single-text-button',
  'single-text-button',
  'bottom-navigation',
  'modal',
  'tooltip',
  'radio',
]);

function buildComponentNavItems(slugs: Set<string>): QaStorybookNavItem[] {
  return QA_CATALOG_ENTRIES.filter((entry) => slugs.has(entry.slug))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((entry) => ({
      slug: entry.slug,
      label: entry.displayName,
      icon: resolveStorybookNavIcon(entry.slug),
    }));
}

const allSlugs = new Set(QA_CATALOG_ENTRIES.map((entry) => entry.slug));
const moleculeNavSlugs = new Set([...MOLECULE_SLUGS].filter((slug) => allSlugs.has(slug)));
const atomNavSlugs = new Set([...allSlugs].filter((slug) => !moleculeNavSlugs.has(slug)));

export const QA_STORYBOOK_NAV_GROUPS: QaStorybookNavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { slug: '', label: 'Dashboard', icon: resolveStorybookNavIcon('') },
      { slug: 'introduction', label: 'Introduction', icon: resolveStorybookNavIcon('introduction') },
    ],
  },
  {
    id: 'atoms',
    label: 'Atoms',
    items: buildComponentNavItems(atomNavSlugs),
  },
  {
    id: 'molecules',
    label: 'Molecules',
    items: buildComponentNavItems(moleculeNavSlugs),
  },
];

export function hasQaStorybookPlayground(slug: string): boolean {
  return allSlugs.has(slug);
}

export const STORYBOOK_EXTERNAL_BASE =
  (import.meta.env.VITE_STORYBOOK_URL as string | undefined) ?? 'http://localhost:6006';

export function storybookStoryUrl(storyId: string): string {
  return `${STORYBOOK_EXTERNAL_BASE}/?path=/story/${storyId}`;
}

export function resolveStorybookExternalUrl(meta: {
  slug: string;
  category: string;
  name: string;
}): string {
  const normalizedSlug = meta.slug.replace(/-/g, '');
  const category = meta.category === 'overlays' ? 'overlay' : meta.category;
  return storybookStoryUrl(`components-${category}-${normalizedSlug}--default`);
}

export function filterStorybookNav(query: string): QaStorybookNavGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return QA_STORYBOOK_NAV_GROUPS;

  return QA_STORYBOOK_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q),
    ),
  })).filter((group) => group.items.length > 0);
}
