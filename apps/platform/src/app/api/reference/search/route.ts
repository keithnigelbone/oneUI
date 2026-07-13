/**
 * Reference Search API — resolve top-k reference screens for a composition.
 *
 * POST { vertical?, context, archetype?, limit? } → returns ranked references
 * with their analysis summaries. Used by:
 *   - The playground UI ("show me which references will be sent")
 *   - Server-side generation routes that want a JSON envelope of references
 *     before fetching image blobs
 *
 * Pure delegation to the shared `resolveReferences` engine helper. Resolution
 * logic stays in one place — this route just loads candidates from Convex.
 */

import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';
import { resolveReferences } from '@oneui/shared/engine';
import type {
  BrandVertical,
  CompositionContext,
  ReferenceScreen,
  ResolveReferencesInput,
} from '@oneui/shared/engine';

export const maxDuration = 30;

interface SearchRequestBody {
  context: CompositionContext;
  vertical?: BrandVertical;
  archetype?: string;
  limit?: number;
  includeDrafts?: boolean;
}

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_CONVEX_URL not configured' }, { status: 500 });
  }

  let body: SearchRequestBody;
  try {
    body = (await request.json()) as SearchRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.context) {
    return NextResponse.json({ error: 'context is required' }, { status: 400 });
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  // Load candidate pool: approved screens whose context matches the request.
  // We over-fetch a little (no vertical filter) and let the resolver score.
  const screens = await convex.query(api.references.listScreens, {
    status: body.includeDrafts ? undefined : 'approved',
  });

  // Enrich with collection vertical/platform + latest analysis summary.
  const collectionsById = new Map<string, Awaited<ReturnType<typeof convex.query>>>();
  const uniqueCollectionIds = Array.from(
    new Set(screens.map((s: { collectionId: string }) => s.collectionId)),
  );
  await Promise.all(
    uniqueCollectionIds.map(async (cid) => {
      const c = await convex.query(api.references.getCollection, {
        id: cid as never,
      });
      if (c) collectionsById.set(cid as string, c as never);
    }),
  );

  const enriched: ReferenceScreen[] = await Promise.all(
    screens.map(async (s) => {
      const collection = collectionsById.get(s.collectionId as string) as
        | { vertical?: BrandVertical; platform?: string }
        | undefined;
      const analysis = await convex.query(api.referenceAnalyses.latestForScreen, {
        screenId: s._id as never,
      });
      return {
        id: s._id as string,
        name: s.name,
        archetype: s.archetype,
        context: s.context as CompositionContext,
        description: s.description,
        tokensObserved: s.tokensObserved,
        attentionNotes: s.attentionNotes,
        dosDonts: s.dosDonts,
        status: s.status,
        tags: s.tags,
        storageId: s.storageId as string,
        collectionVertical: collection?.vertical,
        collectionPlatform: collection?.platform,
        analysisSummary: analysis?.summary,
      };
    }),
  );

  const input: ResolveReferencesInput = {
    context: body.context,
    vertical: body.vertical,
    archetype: body.archetype,
    limit: body.limit ?? 3,
    includeDrafts: body.includeDrafts,
  };

  const results = resolveReferences(enriched, input);
  return NextResponse.json({ references: results });
}
