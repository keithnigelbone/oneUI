/**
 * Reference Analyze API — Claude vision extraction for a catalogued screen.
 *
 * POST { screenId } → fetches the image from Convex storage, asks Claude
 * (vision-capable Sonnet 4.6) for a structured readout of surface modes,
 * attention hierarchy, typography, spacing rhythm, and component archetypes,
 * then caches the result in `referenceAnalyses` keyed by (storageId + model +
 * promptVersion). Subsequent calls hit the cache — vision analysis is
 * pay-once-per-screen per model upgrade.
 *
 * This is the "LLM studies the catalog" step. The resolver later injects
 * `summary` alongside the raw image into generation prompts so the composer
 * has both the picture and a pre-digested description.
 */

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { CLAUDE_VISION_MODEL } from '@oneui/shared/agent';
import { createRequiredAuthedConvexClient } from '@/lib/convexServer';

export const maxDuration = 90;

const PROMPT_VERSION = 'v2-2026-04-19';

const EXTRACTION_SYSTEM_PROMPT = `You are a senior OneUI design-systems analyst studying a reference screen.
Your job is to describe what you see using OneUI's vocabulary, not generic design words.
This readout will be injected into the Design Composition Agent's prompt at generation time,
so every sentence should read like a design-system instruction, not a visual critique.

## Language rules (important)

Always prefer OneUI terms over generic descriptions:

| Don't write | Write instead |
|---|---|
| white background / light background | default surface |
| dark background / black section | bold surface (fg-bold) or bg-bold |
| slightly grey card | subtle surface (bg-subtle) or fg-subtle |
| big headline | Display-L (f7) or Headline-L, whichever fits |
| button in brand colour | high-attention CTA on Primary-Bold |
| outlined button | low-attention ghost variant |
| tinted button | medium-attention subtle variant |
| tight spacing | compact density / small f-step spacing tokens |
| generous whitespace | spacious density / Spacing-5–7 rhythm |

Attention levels are **low / medium / high** — never "primary/secondary", never "faded".
Typography roles are **Display, Headline, Title, Body, Label, Code** + size (L/M/S/XS…).
Surface modes are exactly: default, bg-minimal, bg-subtle, bg-bold, elevated, fg-minimal, fg-subtle, fg-bold.
Spacing is always referenced as numeric tokens (Spacing-0, Spacing-0-5, Spacing-4, Spacing-6…), never pixels.

## Output

Output ONLY valid JSON (no markdown fence) matching this shape:
{
  "summary": "2–4 short paragraphs of markdown describing the screen: its purpose, composition style, and a designer's recipe for reproducing it. Write in OneUI terms. Treat this as the canonical 'how to build one of these' note for the agent.",
  "extractedPalette": ["#rrggbb", ...],
  "extractedHierarchy": "One paragraph on the attention pyramid: which element is the single high-attention focal point, what sits at medium attention, and what recedes to low attention. Tie each level to a role (Primary/Secondary/Neutral/Sparkle) when evident.",
  "extractedComposition": "One paragraph on layout structure, spacing rhythm (name the token steps), density, and grid. Call out the dominant flex/grid pattern.",
  "extractedTypography": "One paragraph naming the typography roles and sizes used (e.g. 'Display-M for the hero headline, Title-S for section headings, Body-M for copy, Label-S for CTAs'). Mention weight emphasis (High/Medium/Low).",
  "extractedSurfaces": "One paragraph identifying surface modes by name and where each is applied. Example: 'Page is default; hero section uses fg-bold with brand-tinted fill; product cards sit on bg-subtle; CTA row inverts to bold.'",
  "extractedComponents": ["component archetype slugs only: hero, product-grid, bottom-nav, tab-bar, player-controls, settings-row, kpi-card, ..."]
}

Rules:
- Be specific and prescriptive. "Hero uses fg-bold with Display-L headline and a high-attention CTA" beats "has a big hero".
- Don't invent tokens or behaviours you can't see. If unsure, omit.
- Keep palette to the 4–8 most dominant colours.
- Never describe interactions — this is a still image.`;

interface AnalyzeRequestBody {
  screenId: string;
  /** If true, ignore cache and re-run the vision call. */
  force?: boolean;
}

interface ExtractionPayload {
  summary: string;
  extractedPalette?: string[];
  extractedHierarchy?: string;
  extractedComposition?: string;
  extractedTypography?: string;
  extractedSurfaces?: string;
  extractedComponents?: string[];
}

function stripFences(text: string): string {
  let s = text.trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return s;
}

/** Deterministic djb2 hash used as the cache key for a screen's analysis. */
function djb2(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_CONVEX_URL not configured' }, { status: 500 });
  }

  let body: AnalyzeRequestBody;
  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.screenId) {
    return NextResponse.json({ error: 'screenId is required' }, { status: 400 });
  }

  const convex = await createRequiredAuthedConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  if (!convex) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const currentUser = await convex.query(api.users.getCurrentUserRecord, {});
  if (currentUser?.platformRole !== 'owner') {
    return NextResponse.json(
      { error: 'Only platform owners can analyze reference screens.' },
      { status: 403 },
    );
  }

  const screen = await convex.query(api.references.getScreen, {
    id: body.screenId as Id<'referenceScreens'>,
  });
  if (!screen) {
    return NextResponse.json({ error: 'Reference screen not found' }, { status: 404 });
  }

  const inputHash = djb2(`${screen.storageId}|${CLAUDE_VISION_MODEL}|${PROMPT_VERSION}`);

  if (!body.force) {
    const cached = await convex.query(api.referenceAnalyses.getByHash, { inputHash });
    if (cached) {
      return NextResponse.json({ analysis: cached, cached: true });
    }
  }

  const url = await convex.query(api.references.getStorageUrl, {
    storageId: screen.storageId as Id<'_storage'>,
  });
  if (!url) {
    return NextResponse.json({ error: 'Could not resolve storage URL' }, { status: 500 });
  }

  const imageRes = await fetch(url);
  if (!imageRes.ok) {
    return NextResponse.json(
      { error: `Failed to fetch image from storage (${imageRes.status})` },
      { status: 502 },
    );
  }
  const arrayBuffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUri = `data:${screen.mimeType};base64,${base64}`;

  const { text } = await generateText({
    model: anthropic(CLAUDE_VISION_MODEL),
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image: dataUri },
          {
            type: 'text',
            text: `Analyse this "${screen.archetype}" screen (context: ${screen.context}).${
              screen.description ? `\nDesigner note: ${screen.description}` : ''
            }\n\nReturn the structured JSON readout.`,
          },
        ],
      },
    ],
  });

  let payload: ExtractionPayload;
  try {
    payload = JSON.parse(stripFences(text)) as ExtractionPayload;
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Claude returned non-JSON output',
        raw: text,
        parseError: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
  if (!payload.summary) {
    return NextResponse.json({ error: 'Analysis missing required `summary` field' }, { status: 502 });
  }

  const analysisId = await convex.mutation(api.referenceAnalyses.upsert, {
    screenId: body.screenId as Id<'referenceScreens'>,
    inputHash,
    modelVersion: CLAUDE_VISION_MODEL,
    promptVersion: PROMPT_VERSION,
    summary: payload.summary,
    extractedPalette: payload.extractedPalette,
    extractedHierarchy: payload.extractedHierarchy,
    extractedComposition: payload.extractedComposition,
    extractedTypography: payload.extractedTypography,
    extractedSurfaces: payload.extractedSurfaces,
    extractedComponents: payload.extractedComponents,
  });

  // Auto-approve: once Claude has a structural readout the screen is ready
  // for the resolver. Designers can still demote back to draft manually.
  let autoApproved = false;
  if (screen.status !== 'approved') {
    try {
      await convex.mutation(api.references.updateScreen, {
        id: body.screenId as Id<'referenceScreens'>,
        status: 'approved',
      });
      autoApproved = true;
    } catch (err) {
      console.warn('[reference/analyze] auto-approve failed:', err);
    }
  }

  return NextResponse.json({ analysisId, cached: false, autoApproved, payload });
}
