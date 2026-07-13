/**
 * Composition Verify API — render-and-compare loop.
 *
 * POST { ast, referenceScreenIds?, viewports? }
 *   1. Screenshots the AST at each viewport via headless Playwright.
 *   2. Uploads PNGs to Convex storage.
 *   3. Asks Claude vision to score each (reference, generated) pair.
 *   4. Persists the result as a `renderedScreenshots` row + (optionally)
 *      a `compositionFeedback` row with source=visual-verification.
 *
 * This is opt-in from the playground and from eval runs — not run on every
 * generation. It closes the learning loop by grading the visual output
 * against the catalogued precedent.
 */

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createAuthedConvexClient } from '@/lib/convexServer';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { CLAUDE_VISION_MODEL } from '@oneui/shared/agent';
import {
  captureASTScreenshots,
  captureCodeScreenshots,
  DEFAULT_VIEWPORTS,
  type ViewportSpec,
} from '@/lib/playwrightRenderer';
import { computeASTHash, computeCodeHash } from '@oneui/shared/engine';

export const runtime = 'nodejs';
export const maxDuration = 180;

const JUDGE_SYSTEM_PROMPT = `You are a senior design-system reviewer comparing a generated UI screenshot against curated reference screens from the Jio design library.

Score the generated output on 5 dimensions (0–100 each):
- layoutDensity
- attentionHierarchy
- surfaceUsage
- typographyScale
- brandFeel

Output ONLY JSON (no markdown fence):
{
  "overall": <weighted avg 0–100>,
  "dimensions": {
    "layoutDensity": <0–100>,
    "attentionHierarchy": <0–100>,
    "surfaceUsage": <0–100>,
    "typographyScale": <0–100>,
    "brandFeel": <0–100>
  },
  "notes": "2–4 sentence critique: where the generated output matches the reference, where it drifts, and what specific tokens/patterns would improve alignment."
}`;

function stripFences(text: string): string {
  let s = text.trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return s;
}

interface VerifyRequestBody {
  /** Provide either `ast` (legacy AST renderer) OR `code` (sandpack TSX).
   *  Routes to the matching headless renderer; the rest of the pipeline
   *  (upload, vision-judge, persist) is shared. */
  ast?: unknown;
  code?: string;
  brandId?: string;
  context?: string;
  referenceScreenIds?: string[];
  viewports?: Array<'mobile' | 'desktop' | 'tablet'>;
  /** If true, persist a compositionFeedback row. */
  recordFeedback?: boolean;
  /** Export mode — skip vision scoring, return PNG URL(s) only. Lets the
   *  playground "Download PNG" flow reuse this route without paying for a
   *  judge call the user didn't ask for. */
  exportOnly?: boolean;
}

interface VisualAlignment {
  overall: number;
  dimensions: Record<string, number>;
  notes?: string;
}

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_CONVEX_URL not configured' }, { status: 500 });
  }

  const body = (await request.json()) as VerifyRequestBody;
  const hasCode = typeof body.code === 'string' && body.code.trim().length > 0;
  if (!body.ast && !hasCode) {
    return NextResponse.json({ error: 'Either `ast` or `code` is required' }, { status: 400 });
  }

  // Anthropic key only required when scoring — export mode skips judging.
  if (!body.exportOnly && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const convex = await createAuthedConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  const viewports: ViewportSpec[] = (body.viewports?.length ? body.viewports : ['mobile']).map(
    (v) => DEFAULT_VIEWPORTS[v] ?? DEFAULT_VIEWPORTS.mobile,
  );

  // 1. Capture screenshots headlessly. The astHash field on
  //    renderedScreenshots is reused for code-mode versions — the value
  //    holds either the AST JSON hash or the code string hash, namespaced
  //    by a `code:` prefix so the two never collide.
  let captures;
  let astHash: string;
  try {
    if (hasCode) {
      captures = await captureCodeScreenshots({ code: body.code as string, viewports });
      astHash = `code:${computeCodeHash(body.code as string)}`;
    } else {
      captures = await captureASTScreenshots({ ast: body.ast, viewports });
      astHash = computeASTHash(body.ast);
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Playwright capture failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }

  // 2. Load reference images (if the caller picked any).
  const referenceImages: Array<{ screenId: string; dataUri: string }> = [];
  if (body.referenceScreenIds?.length) {
    for (const id of body.referenceScreenIds) {
      const screen = await convex.query(api.references.getScreen, {
        id: id as Id<'referenceScreens'>,
      });
      if (!screen) continue;
      const url = await convex.query(api.references.getStorageUrl, {
        storageId: screen.storageId,
      });
      if (!url) continue;
      const r = await fetch(url);
      if (!r.ok) continue;
      const bytes = Buffer.from(await r.arrayBuffer()).toString('base64');
      referenceImages.push({
        screenId: id,
        dataUri: `data:${screen.mimeType};base64,${bytes}`,
      });
    }
  }

  // 3. For each capture: upload + score against refs.
  const results: Array<{
    viewport: string;
    screenshotId: string;
    storageId?: string;
    url?: string;
    visualAlignment?: VisualAlignment;
    raw?: string;
  }> = [];

  for (const capture of captures) {
    // Upload screenshot to Convex storage.
    const uploadUrl = (await convex.mutation(api.renderedScreenshots.generateUploadUrl, {})) as string;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      // Node Buffer is structurally a Uint8Array, which fetch accepts at
      // runtime, but the DOM `BodyInit` typing doesn't list it directly.
      body: capture.png as unknown as BodyInit,
    });
    const { storageId } = (await uploadRes.json()) as { storageId: Id<'_storage'> };

    const screenshotId = (await convex.mutation(api.renderedScreenshots.create, {
      brandId: body.brandId ? (body.brandId as Id<'brands'>) : undefined,
      astHash,
      storageId,
      viewport: capture.viewport,
      context: body.context ?? 'mobile-app',
      referenceScreenIds: body.referenceScreenIds?.length
        ? (body.referenceScreenIds as Id<'referenceScreens'>[])
        : undefined,
    })) as Id<'renderedScreenshots'>;

    // Resolve a signed URL — clients need this for download or for side-by-side
    // review in the UI. Cheap (indexed storage lookup).
    const screenshotUrl = (await convex.query(api.references.getStorageUrl, {
      storageId,
    })) as string | null;

    // Export mode short-circuits here — no judging, just surface the PNG URL.
    if (body.exportOnly) {
      results.push({
        viewport: capture.viewport,
        screenshotId,
        storageId,
        url: screenshotUrl ?? undefined,
      });
      continue;
    }

    // If there are references, ask Claude vision to score.
    let visualAlignment: VisualAlignment | undefined;
    let raw: string | undefined;
    if (referenceImages.length > 0) {
      const generatedDataUri = `data:image/png;base64,${capture.png.toString('base64')}`;
      try {
        const { text } = await generateText({
          model: anthropic(CLAUDE_VISION_MODEL),
          system: JUDGE_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Reference screen(s):' },
                ...referenceImages.map((r) => ({
                  type: 'image' as const,
                  image: r.dataUri,
                })),
                { type: 'text', text: `Generated screen at viewport ${capture.viewport}:` },
                { type: 'image', image: generatedDataUri },
                {
                  type: 'text',
                  text: 'Score the generated screen against the reference(s) and return the JSON rubric.',
                },
              ],
            },
          ],
        });
        raw = text;
        const parsed = JSON.parse(stripFences(text)) as VisualAlignment;
        if (typeof parsed.overall === 'number') {
          visualAlignment = parsed;
          await convex.mutation(api.renderedScreenshots.attachVisualAlignment, {
            id: screenshotId,
            visualAlignment,
          });
        }
      } catch (err) {
        console.warn('[composition/verify] judge failed:', err);
      }
    }

    results.push({
      viewport: capture.viewport,
      screenshotId,
      storageId,
      url: screenshotUrl ?? undefined,
      visualAlignment,
      raw,
    });

    // Optional: persist feedback row for review queue.
    if (body.recordFeedback && body.brandId && visualAlignment) {
      await convex.mutation(api.compositionFeedback.create, {
        brandId: body.brandId as Id<'brands'>,
        source: 'visual-verification',
        prompt: '(visual verification run)',
        generatedAST: JSON.stringify(body.ast),
        context: body.context ?? 'mobile-app',
        rating: visualAlignment.overall >= 70 ? 'positive' : 'negative',
        annotation: visualAlignment.notes,
        renderedScreenshotId: screenshotId,
        visualAlignmentScore: visualAlignment.overall,
      });
    }
  }

  return NextResponse.json({ astHash, results });
}
