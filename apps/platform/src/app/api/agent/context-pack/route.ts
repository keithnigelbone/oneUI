/**
 * /api/agent/context-pack — the single public surface for external LLMs
 * (Claude Code via MCP, Cursor rules, code-gen bots) that need to ground
 * their UI generation in OneUI's design system.
 *
 * Contract (single request → single response):
 *
 *   POST /api/agent/context-pack
 *   {
 *     brand: string,                   // brand slug or id
 *     vertical?: BrandVertical,        // "e-commerce", "entertainment", …
 *     archetype?: string,              // "product-grid", "hero", "login", …
 *     context: CompositionContext,     // "mobile-app", "web-app", …
 *     skillId?: string,                // optional pin to a specific pack
 *     includeComponentRef?: boolean,   // default false — saves budget
 *   }
 *
 *   → {
 *     systemPrompt: string,            // markdown, OneUI-worded, budgeted
 *     images: Array<{ url, name, archetype, mimeType }>,
 *     citedSkillIds, citedRuleSectionIds, citedReferenceScreenIds,
 *     citedTokens: string[],
 *     hash: string, size: number, cached: boolean, warnings: string[],
 *   }
 *
 * Caching: we key by (brandId, vertical, archetype, context, rulesHash,
 * refsHash) in the `contextPackCache` Convex table. A cache hit returns the
 * exact markdown and refreshed signed URLs in a single round-trip.
 *
 * This route is what the MCP server wraps. Keep it simple — no streaming,
 * no SSE. External agents call it synchronously.
 */

import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { isCompositionRAGEnabled, logCompositionRetrieval } from '@/lib/compositionRAG';
import {
  assembleContextPack,
  buildSeedRules,
  compileVoiceRules,
  getDefaultCompositionConfig,
  PLAYGROUND_COMPONENT_ALLOWLIST,
  PLAYGROUND_ICON_NAMES,
  resolveReferences,
  retrieveRelevantContext,
  type BrandVertical,
  type CompositionConfig,
  type CompositionContext,
  type CompositionRule,
  type ContextPackImage,
  type ReferenceScreen,
  type ReferenceSearchHit,
  type RuleSearchHit,
  type SkillPack,
  type SkillSearchHit,
  type VoiceConfig,
  type VoiceRule,
} from '@oneui/shared/engine';

export const runtime = 'nodejs';
export const maxDuration = 30;

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface ContextPackRequestBody {
  brand: string;
  vertical?: BrandVertical;
  archetype?: string;
  context: CompositionContext;
  skillId?: string;
  includeComponentRef?: boolean;
  /** Override the default 12KB char budget (clients with smaller windows). */
  charBudget?: number;
  /**
   * When present, triggers the hybrid RAG retrieval path (RFC 0002) — the
   * prompt is embedded against the Convex vector indices and the retrieved
   * rules / references / skills replace the deterministic compile set.
   *
   * Gated further by the COMPOSITION_RAG_ENABLED server flag so we can dark-
   * launch retrieval per environment without touching this API shape.
   */
  userPrompt?: string;
}

function djb2(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  return hash.toString(16);
}

async function resolveBrand(
  convex: ConvexHttpClient,
  identifier: string,
): Promise<{ id: Id<'brands'>; name: string } | null> {
  // Try as id first; fall back to slug/name lookup.
  try {
    const byId = await convex.query(api.brands.get, { id: identifier as Id<'brands'> });
    if (byId) return { id: byId._id, name: byId.name };
  } catch {
    // fall through
  }
  const all = await convex.query(api.brands.list, {});
  const match = all.find(
    (b: { _id: string; name: string; slug?: string }) =>
      b.slug === identifier || b.name.toLowerCase() === identifier.toLowerCase(),
  );
  return match ? { id: match._id as Id<'brands'>, name: match.name } : null;
}

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_CONVEX_URL not configured' },
      { status: 500 },
    );
  }

  let body: ContextPackRequestBody;
  try {
    body = (await request.json()) as ContextPackRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.brand || !body.context) {
    return NextResponse.json(
      { error: 'brand and context are required' },
      { status: 400 },
    );
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  const brand = await resolveBrand(convex, body.brand);
  if (!brand) {
    return NextResponse.json({ error: `Unknown brand: ${body.brand}` }, { status: 404 });
  }

  // -- Load brand rules + config + pack (if pinned) -----------------------
  const [brandRules, brandConfig] = await Promise.all([
    convex
      .query(api.compositionRules.getByBrand, { brandId: brand.id })
      .catch(() => []) as Promise<CompositionRule[]>,
    convex.query(api.compositionConfigs.get, { brandId: brand.id }).catch(() => null) as Promise<
      CompositionConfig | null
    >,
  ]);
  const rules = brandRules?.length ? brandRules : buildSeedRules();
  const config = brandConfig ?? getDefaultCompositionConfig();

  // Optional tone-of-voice layer. This keeps the external/system pack
  // aligned with the same brand voice the in-app agent uses for labels,
  // microcopy, empty states, and assistant framing.
  let voicePrompt = '';
  try {
    const [voiceConfigRow, brandVoiceRules, baseVoiceRules] = await Promise.all([
      convex.query(api.voiceConfigs.get, { brandId: brand.id }).catch(() => null),
      convex.query(api.voiceRules.getByBrand, { brandId: brand.id }).catch(() => []),
      convex.query(api.voiceRules.getSystemBrandBaseRules, {}).catch(() => []),
    ]);
    if (voiceConfigRow && Array.isArray(baseVoiceRules)) {
      const resolvedVoiceRules = (baseVoiceRules as VoiceRule[]).map((base) => {
        const override = (brandVoiceRules as VoiceRule[]).find(
          (rule) => rule.sectionId === base.sectionId && rule.scope === 'brand' && rule.isActive,
        );
        return override ?? base;
      });
      const voiceConfig: VoiceConfig = {
        agentName: voiceConfigRow.agentName,
        personality: voiceConfigRow.personality ?? undefined,
        toneProfile: voiceConfigRow.toneProfile,
        language: voiceConfigRow.language,
        communicationStyle: voiceConfigRow.communicationStyle,
        emotionalIntelligence: voiceConfigRow.emotionalIntelligence,
        channelDefaults: voiceConfigRow.channelDefaults ?? undefined,
        verbosity: voiceConfigRow.verbosity ?? undefined,
        isActive: voiceConfigRow.isActive,
        version: voiceConfigRow.version,
      };
      voicePrompt = compileVoiceRules(
        resolvedVoiceRules,
        voiceConfig,
        'default',
        undefined,
        'conversational',
      ).prompt;
    }
  } catch (err) {
    console.warn('[context-pack] voice compile failed; continuing without voice layer:', err);
  }

  // Resolve the skill pack: explicit skillId wins; otherwise pick the first
  // active pack matching (vertical, archetype).
  let pack: SkillPack | undefined;
  let packScreenIds: string[] = [];
  if (body.skillId) {
    const resolved = await convex.query(api.compositionSkills.getPack, {
      brandId: brand.id,
      skillId: body.skillId,
    });
    if (resolved) {
      pack = buildSkillPack(resolved);
      packScreenIds = (pack.curatedReferences ?? []).map((r) => r.screen.id);
    }
  } else if (body.vertical || body.archetype) {
    const skills = await convex.query(api.compositionSkills.list, { brandId: brand.id });
    const match = skills.find(
      (s: { isActive: boolean; vertical?: string; archetype?: string }) =>
        s.isActive &&
        (body.vertical ? s.vertical === body.vertical : true) &&
        (body.archetype ? s.archetype === body.archetype : true),
    );
    if (match) {
      const resolved = await convex.query(api.compositionSkills.getPack, {
        brandId: brand.id,
        skillId: match.skillId,
      });
      if (resolved) {
        pack = buildSkillPack(resolved);
        packScreenIds = (pack.curatedReferences ?? []).map((r) => r.screen.id);
      }
    }
  }

  // -- Load fallback references outside the pack --------------------------
  const allScreens = await convex.query(api.references.listScreens, { status: 'approved' });
  const enriched: ReferenceScreen[] = await Promise.all(
    allScreens.map(async (s: any) => {
      const collection = await convex.query(api.references.getCollection, {
        id: s.collectionId,
      });
      const analyses = await convex.query(api.referenceAnalyses.listByScreen, {
        screenId: s._id,
      });
      const latest = analyses.sort((a: any, b: any) => b.updatedAt - a.updatedAt)[0] ?? null;
      return {
        id: s._id,
        name: s.name,
        archetype: s.archetype,
        context: s.context,
        description: s.description,
        tokensObserved: s.tokensObserved,
        attentionNotes: s.attentionNotes,
        dosDonts: s.dosDonts,
        status: s.status,
        tags: s.tags,
        storageId: s.storageId,
        collectionVertical: collection?.vertical as BrandVertical | undefined,
        collectionPlatform: collection?.platform,
        analysisSummary: latest?.summary,
      } satisfies ReferenceScreen;
    }),
  );

  const fallbackPool = enriched.filter((s) => !packScreenIds.includes(s.id));
  const fallbackReferences = resolveReferences(fallbackPool, {
    context: body.context,
    vertical: body.vertical ?? config.vertical,
    archetype: body.archetype ?? pack?.skill.archetype,
    limit: pack ? 1 : 3, // packs already cover their own refs
  });

  // -- Hybrid RAG retrieval (flag-gated) -----------------------------------
  // When the caller supplies a userPrompt AND retrieval is enabled, we embed
  // the prompt against Convex vector indices, merge hits with invariants +
  // pack rows via `retrieveRelevantContext`, and hand the result to
  // `assembleContextPack`. The deterministic compile path still runs when
  // retrieval is off or when no prompt is supplied.
  const ragEnabled = isCompositionRAGEnabled() && Boolean(body.userPrompt?.trim());
  let retrieval: ReturnType<typeof retrieveRelevantContext> | undefined;
  let retrievalLatencyMs: number | undefined;
  let rulesForPack = rules;
  let fallbackForPack = fallbackReferences;
  if (ragEnabled && body.userPrompt) {
    const startedAt = Date.now();
    try {
      const hits = await convex.action(api.compositionRetrieval.embedAndSearch, {
        query: body.userPrompt,
        brandId: brand.id,
        vertical: body.vertical ?? config.vertical,
        archetype: body.archetype ?? pack?.skill.archetype,
        context: body.context,
        skipSkills: Boolean(pack),
      });

      const referenceScreens = new Map<string, ReferenceScreen>();
      for (const s of enriched) referenceScreens.set(s.id, s);

      retrieval = retrieveRelevantContext({
        search: {
          rules: hits.rules as unknown as RuleSearchHit[],
          references: hits.references as unknown as ReferenceSearchHit[],
          skills: hits.skills as unknown as SkillSearchHit[],
        },
        allBrandRules: rules,
        packRules: pack?.linkedRules,
        packReferences: pack?.curatedReferences,
        fallbackReferences,
        referenceScreens,
        hasPinnedSkill: Boolean(pack),
        context: body.context,
        vertical: body.vertical ?? config.vertical,
        archetype: body.archetype ?? pack?.skill.archetype,
      });
      rulesForPack = retrieval.rules;
      fallbackForPack = retrieval.references;
      retrievalLatencyMs = Date.now() - startedAt;
    } catch (err) {
      // Retrieval is optional — log and fall back to deterministic compile.
      console.warn('[context-pack] retrieval failed; falling back to compile:', err);
    }
  }

  // -- Cache key -----------------------------------------------------------
  // Note: when retrieval is active we key by the rules that actually ship
  // in the prompt (`rulesForPack`), not the full brand set, so two prompts
  // that retrieve different subsets yield distinct caches.
  const rulesHash = djb2(
    rulesForPack.map((r) => `${r.sectionId}:${r.version}:${r.isActive}`).join('|'),
  );
  const allRefIds = [
    ...packScreenIds,
    ...fallbackForPack.map((r) => r.screen.id),
  ].sort();
  const refsHash = djb2(allRefIds.join('|'));
  const userPromptHash = body.userPrompt ? djb2(body.userPrompt.trim()) : '';
  const voiceHash = voicePrompt ? djb2(voicePrompt.trim()) : '';
  const cacheKey = djb2(
    [
      brand.id,
      body.vertical ?? '',
      body.archetype ?? pack?.skill.archetype ?? '',
      body.context,
      body.skillId ?? pack?.skill.skillId ?? '',
      rulesHash,
      refsHash,
      userPromptHash,
      voiceHash,
    ].join('#'),
  );

  const cached = await convex
    .query(api.contextPacks.getByKey, { key: cacheKey })
    .catch(() => null);

  // Always mint fresh signed URLs — they're short-lived.
  const images = await mintImages(convex, [
    ...packScreenIds,
    ...fallbackForPack.map((r) => r.screen.id),
  ]);

  if (cached && Date.now() - cached.builtAt < CACHE_TTL_MS) {
    return NextResponse.json({
      systemPrompt: cached.compiledPrompt,
      images,
      citedSkillIds: cached.skillIds,
      citedRuleSectionIds: [],
      citedReferenceScreenIds: cached.referenceScreenIds,
      citedTokens: cached.citedTokens ?? [],
      size: cached.promptSize,
      hash: cached.key,
      playgroundContract: resultContract(),
      cached: true,
      warnings: [],
      brand: { id: brand.id, name: brand.name },
    });
  }

  // -- Assemble ------------------------------------------------------------
  const packImages = images.filter((img) => packScreenIds.includes(img.screenId));
  const fallbackImages = images.filter((img) =>
    fallbackForPack.some((r) => r.screen.id === img.screenId),
  );

  const result = assembleContextPack({
    brandName: brand.name,
    vertical: body.vertical ?? config.vertical,
    archetype: body.archetype ?? pack?.skill.archetype,
    context: body.context,
    rules: rulesForPack,
    config,
    componentRef: body.includeComponentRef ? '' : '', // component ref injection deferred
    brandSummary: `Brand: ${brand.name}`,
    voicePrompt,
    pack,
    fallbackReferences: fallbackForPack,
    images: [...packImages, ...fallbackImages],
    charBudget: body.charBudget,
    userPrompt: body.userPrompt,
    retrievalTrace: retrieval?.trace,
  });

  if (retrieval) {
    logCompositionRetrieval({
      caller: 'context-pack',
      brandId: brand.id,
      vertical: body.vertical ?? config.vertical,
      archetype: body.archetype ?? pack?.skill.archetype,
      context: body.context,
      promptLength: body.userPrompt?.length,
      systemPromptSize: result.size,
      trace: retrieval.trace,
      latencyMs: retrievalLatencyMs,
    });
  }

  // Write cache (fire-and-forget shouldn't block response, but the mutation
  // is cheap and gives us deterministic behaviour in tests).
  await convex
    .mutation(api.contextPacks.upsert, {
      key: cacheKey,
      brandId: brand.id,
      vertical: body.vertical ?? config.vertical,
      archetype: body.archetype ?? pack?.skill.archetype,
      context: body.context,
      compiledPrompt: result.systemPrompt,
      referenceScreenIds: result.citedReferenceScreenIds as Id<'referenceScreens'>[],
      skillIds: result.citedSkillIds,
      citedTokens: result.citedTokens,
      promptSize: result.size,
      rulesHash,
      refsHash,
    })
    .catch((err) => console.warn('[context-pack] cache write failed:', err));

  return NextResponse.json({
    systemPrompt: result.systemPrompt,
    images: result.images,
    citedSkillIds: result.citedSkillIds,
    citedRuleSectionIds: result.citedRuleSectionIds,
    citedReferenceScreenIds: result.citedReferenceScreenIds,
    citedTokens: result.citedTokens,
    size: result.size,
    hash: result.hash,
    playgroundContract: result.playgroundContract,
    cached: false,
    warnings: result.warnings,
    retrievalTrace: result.retrievalTrace,
    brand: { id: brand.id, name: brand.name },
  });
}

function resultContract() {
  return {
    components: PLAYGROUND_COMPONENT_ALLOWLIST,
    icons: PLAYGROUND_ICON_NAMES,
  };
}

// ---------- helpers ---------------------------------------------------------

async function mintImages(
  convex: ConvexHttpClient,
  screenIds: string[],
): Promise<ContextPackImage[]> {
  const out: ContextPackImage[] = [];
  for (const id of screenIds) {
    const screen = await convex.query(api.references.getScreen, {
      id: id as Id<'referenceScreens'>,
    });
    if (!screen) continue;
    const url = await convex.query(api.references.getStorageUrl, {
      storageId: screen.storageId,
    });
    if (!url) continue;
    out.push({
      screenId: id,
      name: screen.name,
      archetype: screen.archetype,
      url,
      mimeType: screen.mimeType,
    });
  }
  return out;
}

function buildSkillPack(resolved: {
  skill: any;
  linkedRules: CompositionRule[];
  references: Array<{ screen: any; analysis: { summary?: string } | null }>;
}): SkillPack {
  return {
    skill: {
      skillId: resolved.skill.skillId,
      name: resolved.skill.name,
      description: resolved.skill.description,
      category: resolved.skill.category,
      systemPromptTemplate: resolved.skill.systemPromptTemplate,
      applicableContexts: resolved.skill.applicableContexts,
      archetype: resolved.skill.archetype,
      vertical: resolved.skill.vertical,
      dosDonts: resolved.skill.dosDonts,
      attentionPattern: resolved.skill.attentionPattern,
    },
    linkedRules: resolved.linkedRules,
    curatedReferences: resolved.references.map(({ screen, analysis }) => ({
      screen: {
        id: screen._id,
        name: screen.name,
        archetype: screen.archetype,
        context: screen.context,
        description: screen.description,
        tokensObserved: screen.tokensObserved,
        attentionNotes: screen.attentionNotes,
        dosDonts: screen.dosDonts,
        status: screen.status,
        tags: screen.tags,
        storageId: screen.storageId,
        analysisSummary: analysis?.summary,
      },
      score: Number.POSITIVE_INFINITY,
      reasons: ['curated in skill pack'],
    })),
  };
}
