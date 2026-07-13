import { describe, expect, it } from 'vitest';

import { filterQACatalogList } from './catalog';
import type { QACatalogListItem } from './types';

const SAMPLE: QACatalogListItem[] = [
  {
    slug: 'divider',
    displayName: 'Divider',
    name: 'Divider',
    category: 'layout',
    status: 'stable',
    description: 'Visual separator with size, attention, appearance.',
    tags: [],
  },
  {
    slug: 'bottom-navigation',
    displayName: 'Bottom Navigation',
    name: 'BottomNavigation',
    category: 'navigation',
    status: 'stable',
    description:
      'App-level bottom navigation bar. Supports controlled or uncontrolled active value and an optional top hairline divider.',
    tags: [],
  },
];

describe('filterQACatalogList', () => {
  it('matches component name prefix without description false positives', () => {
    const stability = new Map<string, 'stable'>();
    const results = filterQACatalogList(SAMPLE, 'divi', 'all', 'all', stability);
    expect(results.map((r) => r.slug)).toEqual(['divider']);
  });

  it('matches slug substring', () => {
    const stability = new Map<string, 'stable'>();
    const results = filterQACatalogList(SAMPLE, 'bottom-nav', 'all', 'all', stability);
    expect(results.map((r) => r.slug)).toEqual(['bottom-navigation']);
  });
});
