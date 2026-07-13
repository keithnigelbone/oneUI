/**
 * /api/skills/auto-link — agent that picks which catalogued references
 * belong in a skill's pack. Runs on demand from the Skills page's PackEditor.
 *
 * Flow:
 *   1. Load the skill (name, description, archetype, vertical, contexts, template).
 *   2. Load every approved reference screen + its latest analysis summary.
 *   3. Send a compact catalog to Claude Haiku (cheap, fast).
 *   4. Claude returns { screenIds: [...], reasoning: "..." } — the top matches.
 *   5. Write the ids to compositionSkills.linkedReferenceScreenIds.
 *
 * Intentionally uses Haiku, not Sonnet — this is a classification task on
 * short text, not a composition task on images. Keeps latency + cost low so
 * designers can re-run freely as they edit skills.
 */

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { createRequiredAuthedConvexClient } from '@/lib/convexServer';

export const runtime = 'nodejs';
export const maxDuration = 45;

const CLASSIFIER_MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are a design-system librarian. Your job is to pick
the reference screens from a catalog that best match a skill pack, so the
Design Composition Agent can use them as visual precedent when generating UI.

Rules:
- Pick ONLY screens that genuinely match the skill's archetype and context.
  A "settings page" skill should NOT pull in product grids or media players.
  A "hero section" pattern should NOT include full-screen onboarding flows.
- Prefer 2–4 screens. One can be fine. Zero is fine if nothing fits.
- Never invent ids. Only return ids present in the catalog.
- Match signals in order of weight:
    1. skill.archetype === screen.archetype (strongest)
    2. archetype words appear in the screen's name or analysis
    3. skill.applicableContexts includes screen.context
    4. skill.vertical aligns with screen.collection (entertainment/e-commerce/…)
  Don't pick a screen just because the context matches — a product grid on
  a settings skill is still wrong even though both are mobile-app.

Output ONLY valid JSON (no markdown fence):
{
  "screenIds": ["<id1>", "<id2>", ...],
  "reasoning": "<one sentence per picked screen explaining the match>",
  "rejected": [{ "id": "<id>", "reason": "<why it did not match>" }]
}`;

interface AutoLinkRequest {
  skillId: string;
  brandId?: string;
}

interface AutoLinkResponse {
  screenIds: string[];
  reasoning?: string;
  rejected?: Array<{ id: string; reason?: string }>;
}

function stripFences(text: string): string {
  let s = text.trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return s;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_CONVEX_URL not configured' }, { status: 500 });
  }

  const body = (await request.json()) as AutoLinkRequest;
  if (!body.skillId) {
    return NextResponse.json({ error: 'skillId is required' }, { status: 400 });
  }

  const convex = await createRequiredAuthedConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  if (!convex) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // 1. Find the skill by Convex id (preferred) or skillId string
  let skill: any = null;
  try {
    skill = await convex.query(api.compositionSkills.get, {
      id: body.skillId as Id<'compositionSkills'>,
    });
  } catch {
    // fall through to string lookup via getBySkillId
  }
  if (!skill && body.brandId) {
    skill = await convex.query(api.compositionSkills.getBySkillId, {
      brandId: body.brandId as Id<'brands'>,
      skillId: body.skillId,
    });
  }
  if (!skill) {
    return NextResponse.json({ error: `Skill not found: ${body.skillId}` }, { status: 404 });
  }
  try {
    await convex.mutation(api.compositionSkills.assertCanUpdate, { id: skill._id });
  } catch {
    return NextResponse.json(
      { error: 'Only brand editors can auto-link skill references.' },
      { status: 403 },
    );
  }

  // 2. Load catalog: approved screens + latest analysis + collection vertical
  const screens = await convex.query(api.references.listScreens, { status: 'approved' });
  if (!screens.length) {
    return NextResponse.json({
      screenIds: [],
      reasoning: 'Catalog is empty — approve some references first.',
      rejected: [],
      applied: true,
    });
  }

  const catalog = await Promise.all(
    screens.map(async (s: any) => {
      const collection = await convex.query(api.references.getCollection, {
        id: s.collectionId,
      });
      const analyses = await convex.query(api.referenceAnalyses.listByScreen, {
        screenId: s._id,
      });
      const latest = analyses.sort((a: any, b: any) => b.updatedAt - a.updatedAt)[0] ?? null;
      const summaryFirst = (latest?.summary ?? '').split(/\n{2,}/)[0].slice(0, 400);
      return {
        id: s._id as string,
        name: s.name,
        archetype: s.archetype,
        context: s.context,
        description: s.description ?? '',
        vertical: collection?.vertical ?? '',
        platform: collection?.platform ?? '',
        analysisFirstLine: summaryFirst,
      };
    }),
  );

  // 3. Build the user prompt
  const userPrompt = [
    `## Skill to match`,
    ``,
    `- id: ${skill.skillId}`,
    `- name: ${skill.name}`,
    `- description: ${skill.description}`,
    `- category: ${skill.category}`,
    `- archetype: ${skill.archetype ?? '(none)'}`,
    `- vertical: ${skill.vertical ?? '(none)'}`,
    `- applicableContexts: ${(skill.applicableContexts ?? []).join(', ') || '(none)'}`,
    ``,
    `## Catalog (${catalog.length} approved screens)`,
    ``,
    ...catalog.map(
      (c) =>
        `- ${c.id} — "${c.name}" · archetype=${c.archetype} · context=${c.context} · vertical=${c.vertical || '?'} · analysis: ${c.analysisFirstLine || '(no analysis)'}`,
    ),
    ``,
    `Return only the screens that truly belong in this skill's pack.`,
  ].join('\n');

  const { text } = await generateText({
    model: anthropic(CLASSIFIER_MODEL),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
  });

  let result: AutoLinkResponse;
  try {
    result = JSON.parse(stripFences(text)) as AutoLinkResponse;
  } catch (err) {
    return NextResponse.json(
      { error: 'Classifier returned non-JSON', raw: text, parseError: String(err) },
      { status: 502 },
    );
  }

  // Guardrail: only accept ids actually in the catalog
  const validIds = new Set(catalog.map((c) => c.id));
  const cleaned = (result.screenIds ?? []).filter((id) => validIds.has(id));

  // 4. Persist
  await convex.mutation(api.compositionSkills.update, {
    id: skill._id,
    linkedReferenceScreenIds: cleaned as Id<'referenceScreens'>[],
  });

  return NextResponse.json({
    skillId: skill.skillId,
    applied: true,
    screenIds: cleaned,
    reasoning: result.reasoning ?? '',
    rejected: result.rejected ?? [],
    droppedInvalidIds: (result.screenIds ?? []).filter((id) => !validIds.has(id)),
  });
}
