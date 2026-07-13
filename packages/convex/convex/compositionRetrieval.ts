/**
 * compositionRetrieval.ts
 *
 * Convex-side runtime retrieval for the Design Composition Agent's hybrid
 * RAG (RFC 0002). Mirrors the shape of `knowledge.search` — caller (Next.js
 * route) embeds the user prompt, calls `compositionRetrieval.search`, and
 * gets back three parallel top-k lists (rules, references, skills) with
 * scores and the hydrated content.
 *
 * Filters are applied at the vector index level via `filterFields` where
 * possible. Array-valued fields (`contexts` on rules) are filtered in memory
 * after hit hydration — same trade-off as knowledge.search's tag filter.
 */

import { action, internalQuery } from './_generated/server';
import type { ActionCtx } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { fetchEmbedding } from './compositionEmbeddings';

export type RuleHit = {
  kind: 'rule';
  id: Id<'compositionRules'>;
  score: number;
  sectionId: string;
  title: string;
  content: string;
  priority: number;
  scope: 'base' | 'brand';
  isActive: boolean;
  version: number;
  contexts?: string[];
  vertical?: string;
  brandId: Id<'brands'>;
};

export type ReferenceHit = {
  kind: 'reference';
  id: Id<'referenceAnalyses'>;
  screenId: Id<'referenceScreens'>;
  score: number;
  summary: string;
  archetype?: string;
  vertical?: string;
  context?: string;
};

export type SkillHit = {
  kind: 'skill';
  id: Id<'compositionSkills'>;
  score: number;
  skillId: string;
  name: string;
  description: string;
  archetype?: string;
  vertical?: string;
};

export type SearchResult = {
  rules: RuleHit[];
  references: ReferenceHit[];
  skills: SkillHit[];
};

// ---------- Internal hydrators --------------------------------------------

export const getRulesByIdsInternal = internalQuery({
  args: { ids: v.array(v.id('compositionRules')) },
  handler: async (ctx, { ids }): Promise<Array<Doc<'compositionRules'>>> => {
    const out: Array<Doc<'compositionRules'>> = [];
    for (const id of ids) {
      const row = await ctx.db.get(id);
      if (row) out.push(row);
    }
    return out;
  },
});

export const getAnalysesByIdsInternal = internalQuery({
  args: { ids: v.array(v.id('referenceAnalyses')) },
  handler: async (ctx, { ids }): Promise<Array<Doc<'referenceAnalyses'>>> => {
    const out: Array<Doc<'referenceAnalyses'>> = [];
    for (const id of ids) {
      const row = await ctx.db.get(id);
      if (row) out.push(row);
    }
    return out;
  },
});

export const getSkillsByIdsInternal = internalQuery({
  args: { ids: v.array(v.id('compositionSkills')) },
  handler: async (ctx, { ids }): Promise<Array<Doc<'compositionSkills'>>> => {
    const out: Array<Doc<'compositionSkills'>> = [];
    for (const id of ids) {
      const row = await ctx.db.get(id);
      if (row) out.push(row);
    }
    return out;
  },
});

// ---------- Search action -------------------------------------------------

interface SearchParams {
  embedding: number[];
  brandId: Id<'brands'>;
  vertical?: string;
  archetype?: string;
  context?: string;
  topK?: { rules?: number; references?: number; skills?: number };
  skipSkills?: boolean;
}

/**
 * Shared implementation of the vector fan-out, reused by both `search`
 * (pre-embedded input) and `embedAndSearch` (raw-text input). Kept as a
 * plain async function so a single code path handles hydration + filtering
 * instead of routing two actions through `ctx.runAction`.
 *
 * Takes a Convex action context (`GenericActionCtx`) so it can access
 * `vectorSearch` + `runQuery`. Not exported as its own action — callers live
 * inside this file.
 */
async function runSearch(ctx: ActionCtx, args: SearchParams): Promise<SearchResult> {
  const topK = {
    rules: args.topK?.rules ?? 5,
    references: args.topK?.references ?? 3,
    skills: args.topK?.skills ?? 1,
  };

    // ---- Rules ---------------------------------------------------------
    // Convex vector filters only support a single `q.eq` (or `q.or`) at the
    // index level — no `q.and`. We filter on the most selective field
    // (brandId) here and push `isActive` / `vertical` / `context` filters
    // into the in-memory pass below, at the cost of an over-fetch factor.
    const ruleHits = await ctx.vectorSearch('compositionRules', 'by_embedding', {
      vector: args.embedding,
      limit: topK.rules * 4, // over-fetch to survive isActive + context filters
      filter: (q) => q.eq('brandId', args.brandId),
    });
    const ruleDocs = await ctx.runQuery(internal.compositionRetrieval.getRulesByIdsInternal, {
      ids: ruleHits.map((h) => h._id),
    });
    const ruleById = new Map(ruleDocs.map((d) => [d._id, d]));
    const rules: RuleHit[] = [];
    for (const hit of ruleHits) {
      if (rules.length >= topK.rules) break;
      const doc = ruleById.get(hit._id);
      if (!doc) continue;
      // In-memory filters (vector filter only supports single-field eq).
      if (!doc.isActive) continue;
      if (args.vertical && doc.vertical && doc.vertical !== args.vertical) continue;
      if (
        args.context &&
        doc.contexts?.length &&
        !doc.contexts.includes('all') &&
        !doc.contexts.includes(args.context)
      ) {
        continue;
      }
      rules.push({
        kind: 'rule',
        id: doc._id,
        score: hit._score,
        sectionId: doc.sectionId,
        title: doc.title,
        content: doc.content,
        priority: doc.priority,
        scope: doc.scope,
        isActive: doc.isActive,
        version: doc.version,
        contexts: doc.contexts,
        vertical: doc.vertical,
        brandId: doc.brandId,
      });
    }

    // ---- References ----------------------------------------------------
    // Filter priority: archetype > vertical. Running both matching terms
    // under a single `q.and` is a hard constraint — if the archetype is
    // provided and doesn't match, it would exclude otherwise-relevant rows.
    // So we fan out to two partial queries only when needed.
    const refsLimit = topK.references * 2;
    let refHits: Array<{ _id: Id<'referenceAnalyses'>; _score: number }> = [];
    if (args.archetype && args.vertical) {
      const [byArch, byVert] = await Promise.all([
        ctx.vectorSearch('referenceAnalyses', 'by_embedding', {
          vector: args.embedding,
          limit: refsLimit,
          filter: (q) => q.eq('archetype', args.archetype!),
        }),
        ctx.vectorSearch('referenceAnalyses', 'by_embedding', {
          vector: args.embedding,
          limit: refsLimit,
          filter: (q) => q.eq('vertical', args.vertical!),
        }),
      ]);
      // Merge + de-dupe by id, keep best score.
      const bestScore = new Map<Id<'referenceAnalyses'>, number>();
      for (const h of [...byArch, ...byVert]) {
        bestScore.set(h._id, Math.max(bestScore.get(h._id) ?? 0, h._score));
      }
      refHits = [...bestScore.entries()]
        .map(([id, score]) => ({ _id: id, _score: score }))
        .sort((a, b) => b._score - a._score)
        .slice(0, refsLimit);
    } else if (args.archetype) {
      refHits = await ctx.vectorSearch('referenceAnalyses', 'by_embedding', {
        vector: args.embedding,
        limit: refsLimit,
        filter: (q) => q.eq('archetype', args.archetype!),
      });
    } else if (args.vertical) {
      refHits = await ctx.vectorSearch('referenceAnalyses', 'by_embedding', {
        vector: args.embedding,
        limit: refsLimit,
        filter: (q) => q.eq('vertical', args.vertical!),
      });
    } else {
      refHits = await ctx.vectorSearch('referenceAnalyses', 'by_embedding', {
        vector: args.embedding,
        limit: refsLimit,
      });
    }

    const refDocs = await ctx.runQuery(internal.compositionRetrieval.getAnalysesByIdsInternal, {
      ids: refHits.map((h) => h._id),
    });
    const refById = new Map(refDocs.map((d) => [d._id, d]));
    const references: ReferenceHit[] = [];
    for (const hit of refHits) {
      if (references.length >= topK.references) break;
      const doc = refById.get(hit._id);
      if (!doc) continue;
      if (args.context && doc.context && doc.context !== args.context) continue;
      references.push({
        kind: 'reference',
        id: doc._id,
        screenId: doc.screenId,
        score: hit._score,
        summary: doc.summary,
        archetype: doc.archetype,
        vertical: doc.vertical,
        context: doc.context,
      });
    }

    // ---- Skills --------------------------------------------------------
    const skills: SkillHit[] = [];
    if (!args.skipSkills) {
      const skillHits = await ctx.vectorSearch('compositionSkills', 'by_embedding', {
        vector: args.embedding,
        limit: topK.skills * 4,
        filter: (q) => q.eq('brandId', args.brandId),
      });
      const skillDocs = await ctx.runQuery(
        internal.compositionRetrieval.getSkillsByIdsInternal,
        { ids: skillHits.map((h) => h._id) },
      );
      const skillById = new Map(skillDocs.map((d) => [d._id, d]));
      for (const hit of skillHits) {
        if (skills.length >= topK.skills) break;
        const doc = skillById.get(hit._id);
        if (!doc) continue;
        if (!doc.isActive) continue;
        if (args.vertical && doc.vertical && doc.vertical !== args.vertical) continue;
        skills.push({
          kind: 'skill',
          id: doc._id,
          score: hit._score,
          skillId: doc.skillId,
          name: doc.name,
          description: doc.description,
          archetype: doc.archetype,
          vertical: doc.vertical,
        });
      }
    }

  return { rules, references, skills };
}

/**
 * Fan-out top-k vector search across the three indexed tables with a
 * pre-embedded query vector. Thin wrapper around `runSearch`; use this when
 * the caller already has an embedding (e.g. eval harness replaying stored
 * embeddings, debug tools).
 */
export const search = action({
  args: {
    embedding: v.array(v.float64()),
    brandId: v.id('brands'),
    vertical: v.optional(v.string()),
    archetype: v.optional(v.string()),
    context: v.optional(v.string()),
    topK: v.optional(
      v.object({
        rules: v.optional(v.number()),
        references: v.optional(v.number()),
        skills: v.optional(v.number()),
      }),
    ),
    skipSkills: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<SearchResult> => runSearch(ctx, args),
});

/**
 * Convenience wrapper: take a user prompt string, embed it via OpenAI, then
 * fan-out through `runSearch`. Used by the Next.js routes so the embedding
 * API key stays in the Convex env (not exposed to the web layer). Prefer
 * this over `search` whenever you have raw text.
 */
export const embedAndSearch = action({
  args: {
    query: v.string(),
    brandId: v.id('brands'),
    vertical: v.optional(v.string()),
    archetype: v.optional(v.string()),
    context: v.optional(v.string()),
    topK: v.optional(
      v.object({
        rules: v.optional(v.number()),
        references: v.optional(v.number()),
        skills: v.optional(v.number()),
      }),
    ),
    skipSkills: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<SearchResult> => {
    const text = args.query.trim();
    if (!text) return { rules: [], references: [], skills: [] };
    const embedding = await fetchEmbedding(text);
    return runSearch(ctx, { ...args, embedding });
  },
});
