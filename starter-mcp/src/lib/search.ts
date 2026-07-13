/**
 * Tiny offline keyword search over the baked corpus. No embeddings, no network.
 * Scores documents by term-frequency of the query words (+ tag/title boosts)
 * and returns the best matches with a snippet around the first hit.
 */
import { getCorpus, type CorpusEntry } from './snapshot.js';

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'is',
  'are', 'how', 'do', 'i', 'my', 'use', 'using', 'build', 'create', 'make',
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export interface SearchResult {
  id: string;
  source: string;
  title: string;
  score: number;
  snippet: string;
  tags: string[];
}

function snippetAround(text: string, terms: string[], radius = 220): string {
  const lower = text.toLowerCase();
  let idx = -1;
  for (const t of terms) {
    const i = lower.indexOf(t);
    if (i !== -1 && (idx === -1 || i < idx)) idx = i;
  }
  if (idx === -1) return text.slice(0, radius).trim() + (text.length > radius ? '…' : '');
  const start = Math.max(0, idx - radius / 2);
  const end = Math.min(text.length, idx + radius);
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

export function search(
  query: string,
  opts: { tags?: string[]; limit?: number; corpus?: CorpusEntry[] } = {},
): SearchResult[] {
  const limit = opts.limit ?? 5;
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  let corpus: CorpusEntry[] = opts.corpus ?? getCorpus();
  if (opts.tags && opts.tags.length) {
    const want = new Set(opts.tags.map((t) => t.toLowerCase()));
    corpus = corpus.filter((d) => d.tags.some((t) => want.has(t.toLowerCase())));
  }

  const results: SearchResult[] = [];
  for (const doc of corpus) {
    const haystack = (doc.title + ' ' + doc.text + ' ' + doc.tags.join(' ')).toLowerCase();
    const titleLower = doc.title.toLowerCase();
    const tagLower = doc.tags.map((t) => t.toLowerCase());
    let score = 0;
    for (const term of terms) {
      const occurrences = haystack.split(term).length - 1;
      if (occurrences > 0) score += occurrences;
      if (titleLower.includes(term)) score += 8; // title hits are strong
      if (tagLower.some((t) => t.includes(term))) score += 4; // tag hits matter
    }
    if (score > 0) {
      results.push({
        id: doc.id,
        source: doc.source,
        title: doc.title,
        score,
        snippet: snippetAround(doc.text, terms),
        tags: doc.tags,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
