/*
 * knowledge.ts
 *
 * RAG layer for the Experience Builder chat. Stores chunked design-system
 * documentation (docs/*, CLAUDE.md, .claude/skills/*) with vector embeddings,
 * and serves retrieval via the `search_design_system` tool at runtime.
 *
 * Ingestion runs via `scripts/ingest-knowledge.ts` — that script chunks source
 * files, embeds them, and calls `upsertChunk` + `pruneStale` to keep the index
 * in sync with the repo.
 */

import { action, query, mutation, internalQuery, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { requirePlatformOwner } from './lib/auth';

type SearchResult = {
  source: string;
  heading: string;
  headingPath: string[];
  content: string;
  tags: string[];
  score: number;
};

/*
 * Runtime retrieval. Given a pre-computed query embedding (caller embeds so
 * the API key stays server-side in the Next.js route), runs a vector search,
 * hydrates the hits to full documents, logs the query for observability, and
 * returns the top results.
 *
 * Tag filtering is applied post-search (client-side to the action) rather
 * than via the vector index filter, because matching against array-typed
 * fields in vectorSearch filters needs a flat-value shape we don't maintain.
 * The extra cost is small: we fetch `limit * 2` hits and filter in memory.
 */
export const search = action({
  args: {
    embedding: v.array(v.float64()),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
    query: v.optional(v.string()),
  },
  handler: async (ctx, { embedding, tags, limit = 5, query: queryText }): Promise<SearchResult[]> => {
    const fetchCount = tags && tags.length > 0 ? limit * 3 : limit;
    const hits = await ctx.vectorSearch('knowledgeDocs', 'by_embedding', {
      vector: embedding,
      limit: fetchCount,
    });

    const out: SearchResult[] = [];
    for (const hit of hits) {
      if (out.length >= limit) break;
      const doc: Doc<'knowledgeDocs'> | null = await ctx.runQuery(internal.knowledge.getByIdInternal, {
        id: hit._id,
      });
      if (!doc) continue;
      if (tags && tags.length > 0 && !tags.some((t) => doc.tags.includes(t))) continue;
      out.push({
        source: doc.source,
        heading: doc.heading,
        headingPath: doc.headingPath,
        content: doc.content,
        tags: doc.tags,
        score: hit._score,
      });
    }

    await ctx.runMutation(internal.knowledge.logQueryInternal, {
      query: queryText ?? '',
      tags,
      resultIds: out.map((_r, i) => hits[i]._id),
    });

    return out;
  },
});

/* Internal hydration helper — called by the search action. */
export const getByIdInternal = internalQuery({
  args: { id: v.id('knowledgeDocs') },
  handler: async (ctx, { id }): Promise<Doc<'knowledgeDocs'> | null> => {
    return await ctx.db.get(id);
  },
});

/* Public fetch by id, for dashboards / debugging. */
export const getById = query({
  args: { id: v.id('knowledgeDocs') },
  handler: async (ctx, { id }): Promise<Doc<'knowledgeDocs'> | null> => {
    return await ctx.db.get(id);
  },
});

/*
 * Upsert a single chunk. Matches on (source, contentHash) so re-ingesting
 * an unchanged file is a no-op. Called from the ingestion script once per
 * chunk after embedding.
 */
export const upsertChunk = mutation({
  args: {
    source: v.string(),
    heading: v.string(),
    headingPath: v.array(v.string()),
    content: v.string(),
    contentHash: v.string(),
    embedding: v.array(v.float64()),
    tokens: v.number(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const existing = await ctx.db
      .query('knowledgeDocs')
      .withIndex('by_source_hash', (q) =>
        q.eq('source', args.source).eq('contentHash', args.contentHash),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, ingestedAt: Date.now() });
      return { status: 'updated' as const, id: existing._id };
    }
    const id = await ctx.db.insert('knowledgeDocs', { ...args, ingestedAt: Date.now() });
    return { status: 'inserted' as const, id };
  },
});

/*
 * Delete any chunks for a source whose contentHash is not in the provided
 * valid set. Call this after upserting all chunks for a file so stale
 * sections (renamed/deleted headings) are removed.
 */
export const pruneStale = mutation({
  args: {
    source: v.string(),
    validHashes: v.array(v.string()),
  },
  handler: async (ctx, { source, validHashes }) => {
    await requirePlatformOwner(ctx);
    const keep = new Set(validHashes);
    const rows = await ctx.db
      .query('knowledgeDocs')
      .withIndex('by_source', (q) => q.eq('source', source))
      .collect();
    let deleted = 0;
    for (const row of rows) {
      if (!keep.has(row.contentHash)) {
        await ctx.db.delete(row._id);
        deleted++;
      }
    }
    return { deleted };
  },
});

/* Observability: internal log call used by the search action. */
export const logQueryInternal = internalMutation({
  args: {
    query: v.string(),
    tags: v.optional(v.array(v.string())),
    resultIds: v.array(v.id('knowledgeDocs')),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('knowledgeQueries', {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/* Stats query for the ingestion script and a future admin dashboard. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('knowledgeDocs').collect();
    const bySource = new Map<string, number>();
    for (const row of all) {
      bySource.set(row.source, (bySource.get(row.source) ?? 0) + 1);
    }
    return {
      total: all.length,
      sources: Array.from(bySource.entries()).map(([source, count]) => ({ source, count })),
    };
  },
});
