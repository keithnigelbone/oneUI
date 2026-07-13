#!/usr/bin/env node
/*
 * embed-composition.ts
 *
 * Backfills (and idempotently refreshes) embeddings for the Design Composition
 * Agent's hybrid RAG layer (RFC 0002). Targets three tables in Convex:
 *
 *   - compositionRules       — embed(title + content) per rule
 *   - referenceAnalyses      — embed(summary + hierarchy + composition) per
 *                              analysis, carrying denormalised archetype/
 *                              vertical/context pulled from the parent screen
 *                              and collection.
 *   - compositionSkills      — embed(name + description + attentionPattern
 *                              + dosDonts + systemPromptTemplate) per skill.
 *
 * Pattern mirrors `scripts/ingest-knowledge.ts`:
 *   - Shared embedding model: text-embedding-3-small @ 1536 dimensions.
 *   - Hash-based idempotency: djb2 over the exact embed input, compared to
 *     the `embeddingHash` already stored on the row. A no-op run hits the
 *     OpenAI API zero times.
 *   - Batch requests (64 rows per API call) to keep the backfill cheap.
 *
 * Usage:
 *   pnpm embed:composition                 # full backfill across all 3 tables
 *   pnpm embed:composition --dry-run       # report counts, skip API + writes
 *   pnpm embed:composition --only rules    # restrict to one table
 *
 * Env vars:
 *   OPENAI_API_KEY         — required (unless --dry-run)
 *   NEXT_PUBLIC_CONVEX_URL — required (unless --dry-run)
 */

import {
  buildAnalysisEmbedInput,
  buildRuleEmbedInput,
  buildSkillEmbedInput,
} from '../packages/convex/convex/compositionEmbeddings';

const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIMENSIONS = 1536;
const EMBED_BATCH_SIZE = 64;

type Table = 'rules' | 'analyses' | 'skills';

function parseArgs(): { dryRun: boolean; only: Table | null; verbose: boolean } {
  const argv = process.argv.slice(2);
  const onlyIdx = argv.indexOf('--only');
  const onlyRaw = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;
  const only: Table | null = onlyRaw === 'rules' || onlyRaw === 'analyses' || onlyRaw === 'skills' ? onlyRaw : null;
  if (onlyRaw && !only) {
    console.error(`[embed-composition] Invalid --only value: ${onlyRaw}. Use rules|analyses|skills.`);
    process.exit(1);
  }
  return {
    dryRun: argv.includes('--dry-run'),
    only,
    verbose: argv.includes('--verbose'),
  };
}

/*
 * djb2 — same hash the context-pack cache uses. Hex output, 32-bit.
 * Must match the runtime hash the auto-embed hook will compute, otherwise
 * every live edit would race-condition against the backfill.
 */
function djb2(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  return hash.toString(16);
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
      dimensions: EMBED_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI embedding request failed: ${response.status} ${errBody}`);
  }

  const payload = (await response.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
  };
  return payload.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

// ---------- Per-table processors ----------

type PendingWrite<Id> = {
  id: Id;
  embedInput: string;
  embeddingHash: string;
  extra?: Record<string, string | undefined>;
};

async function processBatch<Id>(
  convex: import('convex/browser').ConvexHttpClient,
  tableLabel: string,
  pending: PendingWrite<Id>[],
  writer: (
    client: import('convex/browser').ConvexHttpClient,
    row: PendingWrite<Id>,
    embedding: number[],
  ) => Promise<void>,
  dryRun: boolean,
): Promise<{ embedded: number; skipped: number }> {
  let embedded = 0;
  let skipped = 0;

  for (let i = 0; i < pending.length; i += EMBED_BATCH_SIZE) {
    const slice = pending.slice(i, i + EMBED_BATCH_SIZE);
    if (dryRun) {
      embedded += slice.length;
      console.log(`  [dry-run] ${tableLabel} batch ${i}-${i + slice.length}: would embed`);
      continue;
    }
    const vectors = await embedBatch(slice.map((p) => p.embedInput));
    for (let j = 0; j < slice.length; j++) {
      await writer(convex, slice[j], vectors[j]);
      embedded++;
    }
    console.log(`  ${tableLabel} ${Math.min(i + EMBED_BATCH_SIZE, pending.length)}/${pending.length}`);
  }

  return { embedded, skipped };
}

async function run() {
  const args = parseArgs();

  if (!process.env.NEXT_PUBLIC_CONVEX_URL && !args.dryRun) {
    console.error('NEXT_PUBLIC_CONVEX_URL is not set.');
    process.exit(1);
  }

  const { ConvexHttpClient } = await import('convex/browser');
  const { api } = await import('@oneui/convex');
  const convex = new ConvexHttpClient(
    process.env.NEXT_PUBLIC_CONVEX_URL ?? 'http://127.0.0.1:3210',
  );

  const statsBefore = await convex.query(api.compositionEmbeddings.embeddingStats, {});
  console.log('[embed-composition] Before:', JSON.stringify(statsBefore));

  // ------------ Rules -----------------------------------------------------
  if (!args.only || args.only === 'rules') {
    const rules = await convex.query(api.compositionEmbeddings.listAllRules, {});
    const pending: PendingWrite<typeof rules[number]['_id']>[] = [];
    let skipped = 0;
    for (const rule of rules) {
      const embedInput = buildRuleEmbedInput({
        title: rule.title,
        content: rule.content,
        vertical: rule.vertical,
      });
      const embeddingHash = djb2(embedInput);
      if (rule.embeddingHash === embeddingHash && rule.embedding && rule.embedding.length > 0) {
        skipped++;
        continue;
      }
      pending.push({ id: rule._id, embedInput, embeddingHash });
    }
    console.log(
      `[embed-composition] Rules: ${pending.length} to (re)embed, ${skipped} up-to-date.`,
    );
    if (pending.length > 0) {
      await processBatch(
        convex,
        'rules',
        pending,
        (client, row, embedding) =>
          client.mutation(api.compositionEmbeddings.embedRule, {
            id: row.id,
            embedding,
            embeddingHash: row.embeddingHash,
          }),
        args.dryRun,
      );
    }
  }

  // ------------ Analyses --------------------------------------------------
  if (!args.only || args.only === 'analyses') {
    const analyses = await convex.query(
      api.compositionEmbeddings.listAllAnalysesWithContext,
      {},
    );
    const pending: PendingWrite<typeof analyses[number]['_id']>[] = [];
    let skipped = 0;
    for (const a of analyses) {
      const embedInput = buildAnalysisEmbedInput({
        summary: a.summary,
        extractedHierarchy: a.extractedHierarchy,
        extractedComposition: a.extractedComposition,
        extractedSurfaces: a.extractedSurfaces,
        archetype: a.resolvedArchetype,
        vertical: a.resolvedVertical,
      });
      const embeddingHash = djb2(embedInput);
      const filtersUnchanged =
        a.archetype === a.resolvedArchetype &&
        a.vertical === a.resolvedVertical &&
        a.context === a.resolvedContext;
      if (
        a.embeddingHash === embeddingHash &&
        a.embedding &&
        a.embedding.length > 0 &&
        filtersUnchanged
      ) {
        skipped++;
        continue;
      }
      pending.push({
        id: a._id,
        embedInput,
        embeddingHash,
        extra: {
          archetype: a.resolvedArchetype,
          vertical: a.resolvedVertical,
          context: a.resolvedContext,
        },
      });
    }
    console.log(
      `[embed-composition] Analyses: ${pending.length} to (re)embed, ${skipped} up-to-date.`,
    );
    if (pending.length > 0) {
      await processBatch(
        convex,
        'analyses',
        pending,
        (client, row, embedding) =>
          client.mutation(api.compositionEmbeddings.embedAnalysis, {
            id: row.id,
            embedding,
            embeddingHash: row.embeddingHash,
            archetype: row.extra?.archetype,
            vertical: row.extra?.vertical,
            context: row.extra?.context,
          }),
        args.dryRun,
      );
    }
  }

  // ------------ Skills ----------------------------------------------------
  if (!args.only || args.only === 'skills') {
    const skills = await convex.query(api.compositionEmbeddings.listAllSkills, {});
    const pending: PendingWrite<typeof skills[number]['_id']>[] = [];
    let skipped = 0;
    for (const s of skills) {
      const embedInput = buildSkillEmbedInput({
        name: s.name,
        description: s.description,
        archetype: s.archetype,
        vertical: s.vertical,
        attentionPattern: s.attentionPattern,
        dosDonts: s.dosDonts,
        systemPromptTemplate: s.systemPromptTemplate,
      });
      const embeddingHash = djb2(embedInput);
      if (s.embeddingHash === embeddingHash && s.embedding && s.embedding.length > 0) {
        skipped++;
        continue;
      }
      pending.push({ id: s._id, embedInput, embeddingHash });
    }
    console.log(
      `[embed-composition] Skills: ${pending.length} to (re)embed, ${skipped} up-to-date.`,
    );
    if (pending.length > 0) {
      await processBatch(
        convex,
        'skills',
        pending,
        (client, row, embedding) =>
          client.mutation(api.compositionEmbeddings.embedSkill, {
            id: row.id,
            embedding,
            embeddingHash: row.embeddingHash,
          }),
        args.dryRun,
      );
    }
  }

  const statsAfter = await convex.query(api.compositionEmbeddings.embeddingStats, {});
  console.log('[embed-composition] After:', JSON.stringify(statsAfter));
}

run().catch((err) => {
  console.error('[embed-composition] Failed:', err);
  process.exit(1);
});
