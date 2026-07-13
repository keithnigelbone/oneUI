/**
 * Server-side helper that resolves reference screens for a composition request
 * and loads their images from Convex storage as base64 data URIs ready to
 * inject as Claude vision content blocks.
 *
 * Two phases:
 *   1. Score candidates via the shared pure `resolveReferences` engine.
 *   2. Fetch storage URLs + bytes for the top-k, encode as data URIs.
 *
 * Both `/api/canvas/generate` and `/api/agent/executors/design` call this.
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { resolveReferences } from '@oneui/shared/engine';
import type {
  BrandVertical,
  CompositionContext,
  ReferenceScreen,
  ScoredReference,
} from '@oneui/shared/engine';

export interface ResolvedReferenceImage {
  screenId: string;
  name: string;
  archetype: string;
  mimeType: string;
  /** data:mime;base64,... — ready for `{ type: 'image', image }` */
  dataUri: string;
  score: number;
  reasons: string[];
}

export interface ResolveReferenceImagesInput {
  context: CompositionContext;
  vertical?: BrandVertical;
  archetype?: string;
  limit?: number;
  /** If provided, skip resolver and just load these screens in order. */
  pinnedScreenIds?: string[];
}

export interface ResolveReferenceImagesResult {
  references: ScoredReference[];
  images: ResolvedReferenceImage[];
}

/**
 * Load candidate screens + their latest analysis + collection metadata, then
 * call the shared resolver. Returns both the scored-reference list (for prompt
 * injection + UI display) and the loaded image data URIs (for vision blocks).
 */
export async function resolveReferenceImages(
  input: ResolveReferenceImagesInput,
): Promise<ResolveReferenceImagesResult> {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return { references: [], images: [] };
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  // 1. Build the candidate pool.
  let candidates: ReferenceScreen[];

  if (input.pinnedScreenIds && input.pinnedScreenIds.length > 0) {
    // Explicit pin — fetch exactly these screens.
    const rows = await Promise.all(
      input.pinnedScreenIds.map((id) =>
        convex.query(api.references.getScreen, {
          id: id as Id<'referenceScreens'>,
        }),
      ),
    );
    candidates = await enrichScreens(
      convex,
      rows.filter((r): r is NonNullable<typeof r> => Boolean(r)),
    );
  } else {
    const rows = await convex.query(api.references.listScreens, {
      status: 'approved',
    });
    candidates = await enrichScreens(convex, rows);
  }

  // 2. Score (pinned bypass score gating: include them all at score Infinity).
  let scored: ScoredReference[];
  if (input.pinnedScreenIds && input.pinnedScreenIds.length > 0) {
    scored = candidates.map((screen) => ({
      screen,
      score: Number.POSITIVE_INFINITY,
      reasons: ['pinned by caller'],
    }));
  } else {
    scored = resolveReferences(candidates, {
      context: input.context,
      vertical: input.vertical,
      archetype: input.archetype,
      limit: input.limit ?? 3,
    });
  }

  // 3. Load image blobs for the selected references.
  const images = await Promise.all(
    scored.map(async (ref) => {
      if (!ref.screen.storageId) return null;
      const url = await convex.query(api.references.getStorageUrl, {
        storageId: ref.screen.storageId as Id<'_storage'>,
      });
      if (!url) return null;
      const imageRes = await fetch(url);
      if (!imageRes.ok) return null;
      const arrayBuffer = await imageRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      // The Convex storage row doesn't store MIME on the reference; screens table has it.
      // Fallback to image/png if the MIME lookup upstream failed.
      return {
        screenId: ref.screen.id,
        name: ref.screen.name,
        archetype: ref.screen.archetype,
        mimeType: 'image/png',
        dataUri: `data:image/png;base64,${base64}`,
        score: ref.score,
        reasons: ref.reasons,
      } as ResolvedReferenceImage;
    }),
  );

  return {
    references: scored,
    images: images.filter((i): i is ResolvedReferenceImage => Boolean(i)),
  };
}

async function enrichScreens(
  convex: ConvexHttpClient,
  rows: ReadonlyArray<{
    _id: string;
    collectionId: string;
    storageId: string;
    name: string;
    archetype: string;
    context: string;
    description?: string;
    tokensObserved?: string[];
    attentionNotes?: string;
    dosDonts?: string[];
    tags?: string[];
    status: 'draft' | 'approved' | 'archived';
    mimeType: string;
  }>,
): Promise<ReferenceScreen[]> {
  const uniqueCollectionIds = Array.from(new Set(rows.map((r) => r.collectionId)));
  const collections = await Promise.all(
    uniqueCollectionIds.map((cid) =>
      convex.query(api.references.getCollection, {
        id: cid as Id<'referenceCollections'>,
      }),
    ),
  );
  const collectionById = new Map<string, (typeof collections)[number]>();
  collections.forEach((c, i) => {
    if (c) collectionById.set(uniqueCollectionIds[i], c);
  });

  return Promise.all(
    rows.map(async (r) => {
      const collection = collectionById.get(r.collectionId);
      const analysis = await convex.query(api.referenceAnalyses.latestForScreen, {
        screenId: r._id as Id<'referenceScreens'>,
      });
      return {
        id: r._id,
        name: r.name,
        archetype: r.archetype,
        context: r.context as CompositionContext,
        description: r.description,
        tokensObserved: r.tokensObserved,
        attentionNotes: r.attentionNotes,
        dosDonts: r.dosDonts,
        status: r.status,
        tags: r.tags,
        storageId: r.storageId,
        collectionVertical: collection?.vertical as BrandVertical | undefined,
        collectionPlatform: collection?.platform,
        analysisSummary: analysis?.summary,
      } satisfies ReferenceScreen;
    }),
  );
}

/**
 * Bare-bones screen hydration used by the hybrid-RAG retrieval path
 * (RFC 0002). Unlike `enrichScreens`, this skips collection metadata
 * and analysis lookups — `retrieveRelevantContext` only needs `id`,
 * `name`, `archetype`, `context` plus whatever optional fields the
 * row already carries. The retrieved analysis summary is supplied by
 * the vector hit itself, not refetched here.
 *
 * Returns a Map keyed by screen id for direct use as
 * `retrieveRelevantContext`'s `referenceScreens` input.
 */
export async function hydrateScreensByIds(
  convex: ConvexHttpClient,
  ids: ReadonlyArray<string>,
): Promise<Map<string, ReferenceScreen>> {
  const out = new Map<string, ReferenceScreen>();
  if (ids.length === 0) return out;
  const unique = Array.from(new Set(ids));
  const rows = await Promise.all(
    unique.map((id) =>
      convex.query(api.references.getScreen, { id: id as Id<'referenceScreens'> }),
    ),
  );
  for (const row of rows) {
    if (!row) continue;
    out.set(row._id, {
      id: row._id,
      name: row.name,
      archetype: row.archetype,
      context: row.context as CompositionContext,
      description: row.description,
      tokensObserved: row.tokensObserved,
      attentionNotes: row.attentionNotes,
      dosDonts: row.dosDonts,
      status: row.status,
      tags: row.tags,
      storageId: row.storageId,
    } satisfies ReferenceScreen);
  }
  return out;
}
