/**
 * compositionEmbeddings.ts
 *
 * Embedding-maintenance layer for the Design Composition Agent's hybrid RAG
 * (RFC 0002). Provides:
 *
 *   - Single-row mutations to patch an embedding onto an existing rule,
 *     reference analysis, or skill. Called from the backfill script
 *     (`scripts/embed-composition.ts`) and from the auto-embed hook on
 *     live edits.
 *   - Pure helpers that compose the "embed text" for each row type so the
 *     backfill script and the live hook stay in sync.
 *   - `listNeedingEmbedding` queries per table, used by the backfill to
 *     skip rows whose `embeddingHash` already matches their content.
 *
 * Design constraint: the API key stays server-side (Next.js or the script
 * process). Convex receives the already-computed vector + content hash.
 * Mirrors the pattern in `knowledge.ts` (`upsertChunk`).
 */

import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { requireBrandRoleForDoc, requirePlatformOwner } from './lib/auth';

// ---------- Pure helpers (also consumed by scripts/embed-composition.ts) ----

/**
 * Text we feed to the embedding model for a composition rule. Keep this
 * deterministic — the `embeddingHash` over this string is what makes the
 * backfill idempotent.
 */
export function buildRuleEmbedInput(rule: {
  title: string;
  content: string;
  vertical?: string;
}): string {
  const header = `# ${rule.title}`;
  const verticalLine = rule.vertical ? `Vertical: ${rule.vertical}\n\n` : '';
  return `${header}\n\n${verticalLine}${rule.content}`.trim();
}

/**
 * Text we feed to the embedding model for a reference analysis.
 * Concatenates the three richest fields; the summary alone is often not
 * enough to disambiguate two visually similar screens.
 */
export function buildAnalysisEmbedInput(analysis: {
  summary: string;
  extractedHierarchy?: string;
  extractedComposition?: string;
  extractedSurfaces?: string;
  archetype?: string;
  vertical?: string;
}): string {
  const parts: string[] = [];
  if (analysis.archetype) parts.push(`Archetype: ${analysis.archetype}`);
  if (analysis.vertical) parts.push(`Vertical: ${analysis.vertical}`);
  parts.push(analysis.summary);
  if (analysis.extractedHierarchy) parts.push(`Hierarchy:\n${analysis.extractedHierarchy}`);
  if (analysis.extractedComposition) parts.push(`Composition:\n${analysis.extractedComposition}`);
  if (analysis.extractedSurfaces) parts.push(`Surfaces:\n${analysis.extractedSurfaces}`);
  return parts.join('\n\n').trim();
}

/**
 * Text we feed to the embedding model for a composition skill (pack).
 * The `systemPromptTemplate` dominates the signal but we prepend
 * identification so name/archetype/vertical queries land the right row.
 */
export function buildSkillEmbedInput(skill: {
  name: string;
  description: string;
  archetype?: string;
  vertical?: string;
  attentionPattern?: string;
  dosDonts?: string[];
  systemPromptTemplate: string;
}): string {
  const parts: string[] = [`# ${skill.name}`];
  if (skill.archetype) parts.push(`Archetype: ${skill.archetype}`);
  if (skill.vertical) parts.push(`Vertical: ${skill.vertical}`);
  parts.push(skill.description);
  if (skill.attentionPattern) parts.push(`Attention: ${skill.attentionPattern}`);
  if (skill.dosDonts?.length) parts.push(`Do / Don't:\n- ${skill.dosDonts.join('\n- ')}`);
  parts.push(skill.systemPromptTemplate);
  return parts.join('\n\n').trim();
}

// ---------- Mutations ------------------------------------------------------

/**
 * Attach / refresh an embedding on a composition rule. Idempotent: if the
 * supplied `embeddingHash` matches what's already on the row, the write is
 * skipped. The caller (script or auto-embed hook) is responsible for
 * computing the hash over the same text that was embedded.
 */
export const embedRule = mutation({
  args: {
    id: v.id('compositionRules'),
    embedding: v.array(v.float64()),
    embeddingHash: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionRules', args.id, 'editor');
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error(`compositionRules ${args.id} not found`);
    if (row.embeddingHash === args.embeddingHash) {
      return { status: 'unchanged' as const };
    }
    await ctx.db.patch(args.id, {
      embedding: args.embedding,
      embeddingHash: args.embeddingHash,
      updatedAt: Date.now(),
    });
    return { status: 'updated' as const };
  },
});

export const embedAnalysis = mutation({
  args: {
    id: v.id('referenceAnalyses'),
    embedding: v.array(v.float64()),
    embeddingHash: v.string(),
    // Denormalised fields used as vector-index filter keys. Callers resolve
    // these from the parent screen + collection.
    archetype: v.optional(v.string()),
    vertical: v.optional(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error(`referenceAnalyses ${args.id} not found`);

    const unchanged =
      row.embeddingHash === args.embeddingHash &&
      row.archetype === args.archetype &&
      row.vertical === args.vertical &&
      row.context === args.context;
    if (unchanged) return { status: 'unchanged' as const };

    await ctx.db.patch(args.id, {
      embedding: args.embedding,
      embeddingHash: args.embeddingHash,
      archetype: args.archetype,
      vertical: args.vertical,
      context: args.context,
      updatedAt: Date.now(),
    });
    return { status: 'updated' as const };
  },
});

export const embedSkill = mutation({
  args: {
    id: v.id('compositionSkills'),
    embedding: v.array(v.float64()),
    embeddingHash: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionSkills', args.id, 'editor');
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error(`compositionSkills ${args.id} not found`);
    if (row.embeddingHash === args.embeddingHash) {
      return { status: 'unchanged' as const };
    }
    await ctx.db.patch(args.id, {
      embedding: args.embedding,
      embeddingHash: args.embeddingHash,
      updatedAt: Date.now(),
    });
    return { status: 'updated' as const };
  },
});

// ---------- Backfill queries ----------------------------------------------

/**
 * Return every active composition rule. The backfill script filters locally
 * by comparing `embeddingHash` against `djb2(buildRuleEmbedInput(row))` —
 * it's simpler to hash in one place than to fan-out Convex queries.
 */
export const listAllRules = query({
  args: {},
  handler: async (ctx): Promise<Doc<'compositionRules'>[]> => {
    return await ctx.db.query('compositionRules').collect();
  },
});

export const listAllSkills = query({
  args: {},
  handler: async (ctx): Promise<Doc<'compositionSkills'>[]> => {
    return await ctx.db.query('compositionSkills').collect();
  },
});

/**
 * Reference analyses joined with the denormalised archetype/vertical/context
 * from their parent screen + collection, so the backfill script can pass
 * the filter keys directly into `embedAnalysis`.
 */
export const listAllAnalysesWithContext = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<
    Array<
      Doc<'referenceAnalyses'> & {
        resolvedArchetype?: string;
        resolvedVertical?: string;
        resolvedContext?: string;
      }
    >
  > => {
    const analyses = await ctx.db.query('referenceAnalyses').collect();
    const out: Array<
      Doc<'referenceAnalyses'> & {
        resolvedArchetype?: string;
        resolvedVertical?: string;
        resolvedContext?: string;
      }
    > = [];
    for (const a of analyses) {
      const screen = await ctx.db.get(a.screenId);
      if (!screen) {
        out.push(a);
        continue;
      }
      const collection = await ctx.db.get(screen.collectionId);
      out.push({
        ...a,
        resolvedArchetype: screen.archetype,
        resolvedVertical: collection?.vertical,
        resolvedContext: screen.context,
      });
    }
    return out;
  },
});

// ---------- Introspection -------------------------------------------------

/**
 * Quick stats for the embed-composition script to print before/after.
 */
export const embeddingStats = query({
  args: {},
  handler: async (ctx) => {
    const [rules, analyses, skills] = await Promise.all([
      ctx.db.query('compositionRules').collect(),
      ctx.db.query('referenceAnalyses').collect(),
      ctx.db.query('compositionSkills').collect(),
    ]);
    const count = <T extends { embedding?: unknown }>(rows: T[]) => ({
      total: rows.length,
      embedded: rows.filter((r) => Array.isArray(r.embedding) && r.embedding.length > 0).length,
    });
    return {
      rules: count(rules),
      analyses: count(analyses),
      skills: count(skills),
    };
  },
});

// ---------- ID coercion helpers (type-only re-export) ---------------------
// Re-exported so callers can import the Id type alongside the helpers above.
export type CompositionRuleId = Id<'compositionRules'>;
export type ReferenceAnalysisId = Id<'referenceAnalyses'>;
export type CompositionSkillId = Id<'compositionSkills'>;

// ===========================================================================
// Auto-embed pipeline (live edits)
// ===========================================================================
//
// Convex mutations cannot call external APIs. The live-edit auto-embed flow
// is:  mutation patches the row → `ctx.scheduler.runAfter(0, internal.
// compositionEmbeddings.autoEmbed<Rule|Analysis|Skill>, { id })` schedules an
// internal action → the action reads the row, calls OpenAI, patches the
// embedding back via the mutations above. Idempotent thanks to the
// embeddingHash check.

/* djb2 — must match scripts/embed-composition.ts exactly. */
function djb2(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  return hash.toString(16);
}

/**
 * Call OpenAI `text-embedding-3-small` at 1536 dimensions — the model used
 * across every embedding-producing code path (backfill script, auto-embed
 * hooks, runtime retrieval queries). Keeping the configuration in one place
 * is what guarantees that a query embedding is comparable to the stored ones.
 *
 * Exported so sibling Convex modules (e.g. compositionRetrieval.embedAndSearch)
 * can call it without re-implementing the API contract. Not wrapped as a
 * Convex action — callers that already sit inside actions/internalActions
 * can await it directly.
 */
export async function fetchEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured in Convex env');
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI embedding failed: ${response.status} ${await response.text()}`);
  const payload = (await response.json()) as { data: Array<{ embedding: number[] }> };
  return payload.data[0]!.embedding;
}

// ---- Internal readers so the actions can load a row by id ----------------

export const getRuleInternal = internalQuery({
  args: { id: v.id('compositionRules') },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getAnalysisWithContextInternal = internalQuery({
  args: { id: v.id('referenceAnalyses') },
  handler: async (ctx, { id }) => {
    const analysis = await ctx.db.get(id);
    if (!analysis) return null;
    const screen = await ctx.db.get(analysis.screenId);
    const collection = screen ? await ctx.db.get(screen.collectionId) : null;
    return {
      analysis,
      archetype: screen?.archetype,
      vertical: collection?.vertical,
      context: screen?.context,
    };
  },
});

export const getSkillInternal = internalQuery({
  args: { id: v.id('compositionSkills') },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

// ---- Internal writers (so mutations can call them without exposing the
// public actions' external-fetch semantics to the client) ------------------

export const patchRuleEmbeddingInternal = internalMutation({
  args: {
    id: v.id('compositionRules'),
    embedding: v.array(v.float64()),
    embeddingHash: v.string(),
  },
  handler: async (ctx, { id, embedding, embeddingHash }) => {
    await ctx.db.patch(id, { embedding, embeddingHash, updatedAt: Date.now() });
  },
});

export const patchAnalysisEmbeddingInternal = internalMutation({
  args: {
    id: v.id('referenceAnalyses'),
    embedding: v.array(v.float64()),
    embeddingHash: v.string(),
    archetype: v.optional(v.string()),
    vertical: v.optional(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      embedding: args.embedding,
      embeddingHash: args.embeddingHash,
      archetype: args.archetype,
      vertical: args.vertical,
      context: args.context,
      updatedAt: Date.now(),
    });
  },
});

export const patchSkillEmbeddingInternal = internalMutation({
  args: {
    id: v.id('compositionSkills'),
    embedding: v.array(v.float64()),
    embeddingHash: v.string(),
  },
  handler: async (ctx, { id, embedding, embeddingHash }) => {
    await ctx.db.patch(id, { embedding, embeddingHash, updatedAt: Date.now() });
  },
});

// ---- Internal actions (the scheduled work) -------------------------------

/**
 * Scheduled by `compositionRules.updateContent` / `upsert`. Reads the latest
 * row, rebuilds the embed input, and writes the embedding back if the hash
 * changed. Safe to call speculatively — `embeddingHash` guarantees no-op
 * behaviour if content is unchanged.
 */
export const autoEmbedRule = internalAction({
  args: { id: v.id('compositionRules') },
  handler: async (ctx, { id }) => {
    const row: Doc<'compositionRules'> | null = await ctx.runQuery(
      internal.compositionEmbeddings.getRuleInternal,
      { id },
    );
    if (!row) return;
    const embedInput = buildRuleEmbedInput({
      title: row.title,
      content: row.content,
      vertical: row.vertical,
    });
    const embeddingHash = djb2(embedInput);
    if (row.embeddingHash === embeddingHash && row.embedding && row.embedding.length > 0) return;
    const embedding = await fetchEmbedding(embedInput);
    await ctx.runMutation(internal.compositionEmbeddings.patchRuleEmbeddingInternal, {
      id,
      embedding,
      embeddingHash,
    });
  },
});

export const autoEmbedAnalysis = internalAction({
  args: { id: v.id('referenceAnalyses') },
  handler: async (ctx, { id }) => {
    const bundle = await ctx.runQuery(
      internal.compositionEmbeddings.getAnalysisWithContextInternal,
      { id },
    );
    if (!bundle) return;
    const { analysis, archetype, vertical, context } = bundle;
    const embedInput = buildAnalysisEmbedInput({
      summary: analysis.summary,
      extractedHierarchy: analysis.extractedHierarchy,
      extractedComposition: analysis.extractedComposition,
      extractedSurfaces: analysis.extractedSurfaces,
      archetype,
      vertical,
    });
    const embeddingHash = djb2(embedInput);
    const filtersUnchanged =
      analysis.archetype === archetype &&
      analysis.vertical === vertical &&
      analysis.context === context;
    if (
      analysis.embeddingHash === embeddingHash &&
      analysis.embedding &&
      analysis.embedding.length > 0 &&
      filtersUnchanged
    ) {
      return;
    }
    const embedding = await fetchEmbedding(embedInput);
    await ctx.runMutation(internal.compositionEmbeddings.patchAnalysisEmbeddingInternal, {
      id,
      embedding,
      embeddingHash,
      archetype,
      vertical,
      context,
    });
  },
});

export const autoEmbedSkill = internalAction({
  args: { id: v.id('compositionSkills') },
  handler: async (ctx, { id }) => {
    const row: Doc<'compositionSkills'> | null = await ctx.runQuery(
      internal.compositionEmbeddings.getSkillInternal,
      { id },
    );
    if (!row) return;
    const embedInput = buildSkillEmbedInput({
      name: row.name,
      description: row.description,
      archetype: row.archetype,
      vertical: row.vertical,
      attentionPattern: row.attentionPattern,
      dosDonts: row.dosDonts,
      systemPromptTemplate: row.systemPromptTemplate,
    });
    const embeddingHash = djb2(embedInput);
    if (row.embeddingHash === embeddingHash && row.embedding && row.embedding.length > 0) return;
    const embedding = await fetchEmbedding(embedInput);
    await ctx.runMutation(internal.compositionEmbeddings.patchSkillEmbeddingInternal, {
      id,
      embedding,
      embeddingHash,
    });
  },
});

/**
 * Public wrapper for the playground debug drawer: re-embed a single row on
 * demand. Rarely called — the auto-embed hook is usually enough — but
 * useful for forcing a refresh after bulk imports.
 */
export const manualRebuild = action({
  args: {
    kind: v.union(v.literal('rule'), v.literal('analysis'), v.literal('skill')),
    id: v.string(),
  },
  handler: async (ctx, { kind, id }): Promise<{ ok: boolean }> => {
    if (kind === 'rule') {
      await ctx.runAction(internal.compositionEmbeddings.autoEmbedRule, {
        id: id as Id<'compositionRules'>,
      });
    } else if (kind === 'analysis') {
      await ctx.runAction(internal.compositionEmbeddings.autoEmbedAnalysis, {
        id: id as Id<'referenceAnalyses'>,
      });
    } else {
      await ctx.runAction(internal.compositionEmbeddings.autoEmbedSkill, {
        id: id as Id<'compositionSkills'>,
      });
    }
    return { ok: true };
  },
});
