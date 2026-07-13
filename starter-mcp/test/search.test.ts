import { describe, it, expect } from 'vitest';
import { search } from '../src/lib/search.js';
import type { CorpusEntry } from '../src/lib/snapshot.js';

// Fixture corpus so ranking assertions never depend on the baked snapshot.
const CORPUS: CorpusEntry[] = [
  {
    id: 'doc-surface',
    source: 'doc',
    title: 'Surface modes',
    text: 'Surfaces resolve relative to the parent step. Bold subtle moderate minimal ghost elevated.',
    tags: ['surface', 'color'],
  },
  {
    id: 'doc-typography',
    source: 'doc',
    title: 'Typography roles',
    text: 'Body label headline display title code. Font sizes alias dimension f-steps. surface mentioned once.',
    tags: ['typography'],
  },
  {
    id: 'doc-spacing',
    source: 'doc',
    title: 'Spacing scale',
    text: 'Spacing tokens follow the modular f-scale. Margin and gutter are special keys.',
    tags: ['spacing', 'layout'],
  },
];

describe('search', () => {
  it('ranks title hits above body-only hits', () => {
    const results = search('surface', { corpus: CORPUS });
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].id).toBe('doc-surface');
  });

  it('filters by tag', () => {
    const results = search('tokens scale', { corpus: CORPUS, tags: ['spacing'] });
    expect(results.map((r) => r.id)).toEqual(['doc-spacing']);
  });

  it('returns [] for stopword-only queries', () => {
    expect(search('how do i use the', { corpus: CORPUS })).toEqual([]);
  });

  it('returns [] when nothing matches', () => {
    expect(search('quaternion', { corpus: CORPUS })).toEqual([]);
  });

  it('respects the limit option', () => {
    const results = search('surface typography spacing scale', { corpus: CORPUS, limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('produces a snippet around the first hit', () => {
    const [top] = search('gutter', { corpus: CORPUS });
    expect(top.id).toBe('doc-spacing');
    expect(top.snippet.toLowerCase()).toContain('gutter');
  });

  it('still works against the baked snapshot corpus', () => {
    // Sanity: the real corpus answers a canonical design-system question.
    const results = search('surface modes bold subtle');
    expect(results.length).toBeGreaterThan(0);
  });
});
