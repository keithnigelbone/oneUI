/**
 * /api/composition/skills/generate-from-brief
 *
 * Brief-driven skill author. Takes a single natural-language description
 * (e.g. "product detail screen with image gallery and add-to-cart") and
 * returns a complete CompositionSkill draft — name, slug, description,
 * category, applicable contexts, archetype, vertical, attention pattern,
 * dosDonts, prompt template, and one starter example.
 *
 * The user reviews the draft field-by-field in the UI, edits anything they
 * disagree with, and can ask `/api/composition/skills/regenerate-field` to
 * redo a single field without touching the rest. Save happens client-side
 * via the existing `compositionSkills.create` Convex mutation.
 *
 * This is a *separate* agent from the runtime composition agent. It lives
 * under `composition/skills/` (skill authoring), not `composition/`
 * (composition generation). Different prompt, different output schema,
 * different concerns.
 */

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import { stripJSONFences, isCompositionContext } from '@oneui/shared/engine';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { assertSameOrigin, rateLimitRequest } from '@/lib/apiGuards';
import {
  fetchFewShotSkills,
  getConvexClient,
  renderFewShot,
  type FewShotSkill,
} from '@/lib/skillWriter';

interface BriefRequestBody {
  brandId: string;
  brandName?: string;
  vertical?: string;
  brief: string;
}

export interface SkillDraftFields {
  skillId: string;
  name: string;
  description: string;
  category: 'screen' | 'pattern' | 'flow';
  applicableContexts: string[];
  archetype?: string;
  vertical?: string;
  attentionPattern?: string;
  dosDonts: string[];
  systemPromptTemplate: string;
  examplePrompt?: string;
}

const VALID_CATEGORIES = new Set(['screen', 'pattern', 'flow']);
const RATE_LIMIT = { keyPrefix: 'skill-brief', maxRequests: 12, windowMs: 60_000 };

function isValidBody(body: unknown): body is BriefRequestBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.brandId === 'string' &&
    b.brandId.length > 0 &&
    typeof b.brief === 'string' &&
    b.brief.trim().length >= 10
  );
}

function buildSystemPrompt(fewShots: FewShotSkill[]): string {
  return [
    `You are the Skill Author for OneUI Studio's Design Composition Agent.`,
    `A skill is a reusable composition recipe — a system prompt template the agent uses to generate a specific kind of UI (e.g. login screen, product grid, hero section, multi-step checkout).`,
    ``,
    `Given a designer's natural-language brief, output a complete skill draft as a single JSON object matching this exact shape:`,
    ``,
    `{`,
    `  "skillId": string,                       // kebab-case slug, ≤ 40 chars, derived from name`,
    `  "name": string,                          // 2-6 words, Title Case (e.g. "Product Detail Screen")`,
    `  "description": string,                   // 1-2 sentences, ≤ 200 chars`,
    `  "category": "screen" | "pattern" | "flow",  // screen=full screen archetype; pattern=micro-pattern; flow=multi-step`,
    `  "applicableContexts": string[],          // subset of: mobile-app, web-app, marketing-page, social-post, print, outdoor`,
    `  "archetype": string,                     // optional — short slug (e.g. "product-detail", "checkout", "settings")`,
    `  "vertical": string,                      // optional — only set if the brief implies a specific vertical (e.g. "e-commerce", "finance")`,
    `  "attentionPattern": string,              // single sentence describing visual hierarchy (e.g. "single hero CTA pyramid")`,
    `  "dosDonts": string[],                    // 4-6 short bullets, mix of "Do:" and "Don't:" prefixes, surface/typography/attention specific`,
    `  "systemPromptTemplate": string,          // 250-1500 chars, uses {brand} placeholder, references Surface modes, quotes design tokens`,
    `  "examplePrompt": string                  // one sample user prompt this skill would handle (e.g. "show me a product detail page with reviews")`,
    `}`,
    ``,
    `Rules for systemPromptTemplate:`,
    `- ALWAYS include the {brand} placeholder so the compiler can interpolate brand context.`,
    `- ALWAYS reference Surface modes (default / ghost / minimal / subtle / moderate / bold / elevated / blend) where relevant.`,
    `- ALWAYS use design tokens via var(--Token-Name) syntax — never hex literals (#hex) or bare px values.`,
    `- Use OneUI typography roles: Display, Headline, Title, Body, Label, Code (e.g. "Headline-L", "Body-M").`,
    `- Single primary CTA per screen. Pair every <Surface mode="..."> wrapper with a clear attention story.`,
    `- Reference real OneUI components (Button, Input, Switch, Surface, Card, Badge, etc.). Do not invent components.`,
    ``,
    `Rules for skillId:`,
    `- kebab-case, lowercase letters/numbers/hyphens only.`,
    `- Derived from the name: "Product Detail Screen" → "product-detail-screen".`,
    ``,
    `Rules for category inference:`,
    `- "screen" → full-screen layouts (login, product detail, settings, dashboard).`,
    `- "pattern" → reusable micro-blocks (data row, stat tile, form field cluster).`,
    `- "flow" → multi-step or multi-screen (checkout, onboarding, KYC).`,
    ``,
    `Rules for applicableContexts:`,
    `- mobile-app and web-app are the default if the brief is generic.`,
    `- marketing-page only when the brief mentions hero, landing, conversion, campaign.`,
    `- social-post only when the brief mentions social, IG, FB, Twitter.`,
    `- print/outdoor only when the brief mentions print, billboard, OOH, signage.`,
    ``,
    `Below are ${fewShots.length} reference skills from this brand's curated catalogue. Mirror their voice, density, and structure — DO NOT copy them verbatim.`,
    ``,
    fewShots.map(renderFewShot).join('\n\n---\n\n'),
    ``,
    `Output ONLY the JSON object. No prose, no markdown fences, no commentary.`,
  ].join('\n');
}

function buildUserPrompt(body: BriefRequestBody): string {
  const lines: string[] = [];
  lines.push(`Designer's brief:`);
  lines.push(body.brief.trim());
  lines.push('');
  if (body.brandName) lines.push(`Brand: ${body.brandName}.`);
  if (body.vertical) lines.push(`Brand vertical (use for context, do NOT override unless the brief implies a different vertical): ${body.vertical}.`);
  lines.push('');
  lines.push('Output the JSON object only.');
  return lines.join('\n');
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function normalizeDraft(raw: unknown): SkillDraftFields {
  if (!raw || typeof raw !== 'object') {
    throw new Error('LLM output is not an object.');
  }
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  const description = typeof r.description === 'string' ? r.description.trim() : '';
  const category = typeof r.category === 'string' && VALID_CATEGORIES.has(r.category) ? (r.category as 'screen' | 'pattern' | 'flow') : 'pattern';
  const applicableContexts = Array.isArray(r.applicableContexts)
    ? (r.applicableContexts as unknown[]).filter((c): c is string => isCompositionContext(c))
    : [];
  const dosDonts = Array.isArray(r.dosDonts)
    ? (r.dosDonts as unknown[]).filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : [];
  const systemPromptTemplate = typeof r.systemPromptTemplate === 'string' ? r.systemPromptTemplate.trim() : '';

  if (!name) throw new Error('LLM did not return a name.');
  if (!systemPromptTemplate) throw new Error('LLM did not return a systemPromptTemplate.');

  const skillId = typeof r.skillId === 'string' && r.skillId.trim().length > 0 ? slugify(r.skillId) : slugify(name);
  if (!skillId) throw new Error('Could not derive a skillId.');

  return {
    skillId,
    name,
    description: description || `Composition skill: ${name}.`,
    category,
    applicableContexts: applicableContexts.length > 0 ? applicableContexts : ['mobile-app', 'web-app'],
    archetype: typeof r.archetype === 'string' && r.archetype.trim().length > 0 ? slugify(r.archetype) : undefined,
    vertical: typeof r.vertical === 'string' && r.vertical.trim().length > 0 ? r.vertical.trim() : undefined,
    attentionPattern: typeof r.attentionPattern === 'string' && r.attentionPattern.trim().length > 0 ? r.attentionPattern.trim() : undefined,
    dosDonts: dosDonts.length > 0 ? dosDonts : ['Do: Use Surface mode for all non-default backgrounds.', "Don't: Add decorative borders on tinted Surfaces."],
    systemPromptTemplate,
    examplePrompt: typeof r.examplePrompt === 'string' && r.examplePrompt.trim().length > 0 ? r.examplePrompt.trim() : undefined,
  };
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const rateLimitError = rateLimitRequest(request, RATE_LIMIT);
  if (rateLimitError) return rateLimitError;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured.' },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      {
        error: 'Missing or invalid fields. Required: brandId (string), brief (string ≥ 10 chars).',
      },
      { status: 400 },
    );
  }

  const valid = body;
  let fewShots: FewShotSkill[];
  try {
    const client = getConvexClient();
    fewShots = await fetchFewShotSkills(client, valid.brandId as Id<'brands'>);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Few-shot fetch failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let raw: string;
  try {
    const result = await generateText({
      model: anthropic(CLAUDE_MODEL),
      system: buildSystemPrompt(fewShots),
      prompt: buildUserPrompt(valid),
      temperature: 0.4,
    });
    raw = stripJSONFences(result.text);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LLM call failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return NextResponse.json(
      {
        error: `LLM returned non-JSON output: ${(err as Error).message}`,
        raw: raw.slice(0, 500),
      },
      { status: 502 },
    );
  }

  let draft: SkillDraftFields;
  try {
    draft = normalizeDraft(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to normalize draft.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ draft });
}
