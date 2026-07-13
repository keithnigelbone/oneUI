/**
 * /api/skills/draft
 *
 * AI-generates a complete `systemPromptTemplate` (plus description, attention
 * pattern, do/don't bullets) from a skill name + category + applicableContexts.
 * Designer fills the metadata, the model fills the prose. Output is a single
 * JSON object the client merges into the skill editor.
 *
 * Strict guard: name + category + ≥1 applicable context required (Phase F Q1).
 *
 * Phase F — Skill Writer (Draft mode).
 */

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  fetchFewShotSkills,
  getConvexClient,
  renderFewShot,
  stripJSONFences,
  type FewShotSkill,
} from '@/lib/skillWriter';

interface DraftRequestBody {
  brandId: string;
  brandName?: string;
  skillName: string;
  category: 'screen' | 'pattern' | 'flow';
  applicableContexts: string[];
  vertical?: string;
  archetype?: string;
}

interface DraftResponseBody {
  systemPromptTemplate: string;
  description: string;
  attentionPattern?: string;
  dosDonts: string[];
}

const VALID_CATEGORIES = new Set(['screen', 'pattern', 'flow']);

function isValidBody(body: unknown): body is DraftRequestBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.brandId === 'string' &&
    b.brandId.length > 0 &&
    typeof b.skillName === 'string' &&
    b.skillName.trim().length > 0 &&
    typeof b.category === 'string' &&
    VALID_CATEGORIES.has(b.category) &&
    Array.isArray(b.applicableContexts) &&
    b.applicableContexts.length > 0 &&
    b.applicableContexts.every((c) => typeof c === 'string')
  );
}

function buildSystemPrompt(fewShots: FewShotSkill[]): string {
  return [
    `You are the Skill Writer for OneUI Studio's Design Composition Agent.`,
    `A skill is a reusable composition recipe — a system prompt template the agent uses to generate a specific kind of UI (e.g. login screen, product grid, hero).`,
    ``,
    `Output a single JSON object matching this exact shape:`,
    `{`,
    `  "systemPromptTemplate": string,  // 200–1500 chars; uses {brand} placeholder; references Surface modes; quotes design tokens via var(--Token-Name)`,
    `  "description": string,            // 1–2 sentence summary, ≤ 200 chars`,
    `  "attentionPattern": string,       // single sentence describing the visual hierarchy`,
    `  "dosDonts": string[]              // 3–5 short bullets, mix of "Do:" and "Don't:" prefixes`,
    `}`,
    ``,
    `Rules for systemPromptTemplate:`,
    `- ALWAYS include the {brand} placeholder so the compiler can interpolate brand context.`,
    `- ALWAYS reference Surface modes (default / ghost / minimal / subtle / moderate / bold / elevated / blend) where relevant.`,
    `- ALWAYS use design tokens via var(--Token-Name) syntax — never hex literals (#hex) or bare px values.`,
    `- Use OneUI typography roles: Display, Headline, Title, Body, Label, Code (e.g. "Headline-L", "Body-M").`,
    `- Single primary CTA per screen. Pair every <Surface mode="..."> wrapper with a clear attention story.`,
    `- Reference real OneUI components (Button, Input, Switch, Surface, etc.). Do not invent components.`,
    ``,
    `Below are ${fewShots.length} reference skills from this brand's curated catalogue. Mirror their voice, density, and structure — do not copy them verbatim.`,
    ``,
    fewShots.map(renderFewShot).join('\n\n---\n\n'),
    ``,
    `Output ONLY the JSON object. No prose, no markdown fences.`,
  ].join('\n');
}

function buildUserPrompt(body: DraftRequestBody): string {
  const lines: string[] = [];
  lines.push(`Draft a skill named "${body.skillName}".`);
  lines.push(`Category: ${body.category}.`);
  lines.push(`Applicable contexts: ${body.applicableContexts.join(', ')}.`);
  if (body.vertical) lines.push(`Vertical: ${body.vertical}.`);
  if (body.archetype) lines.push(`Archetype: ${body.archetype}.`);
  if (body.brandName) lines.push(`Brand: ${body.brandName}.`);
  lines.push('');
  lines.push('Output the JSON object only.');
  return lines.join('\n');
}

export async function POST(request: Request) {
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
        error:
          'Missing or invalid fields. Required: brandId, skillName (non-empty), category (screen|pattern|flow), applicableContexts (non-empty array of strings).',
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
    });
    raw = stripJSONFences(result.text);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LLM call failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let draft: DraftResponseBody;
  try {
    draft = JSON.parse(raw) as DraftResponseBody;
  } catch (err) {
    return NextResponse.json(
      {
        error: `LLM returned non-JSON output: ${(err as Error).message}`,
        raw: raw.slice(0, 500),
      },
      { status: 502 },
    );
  }

  if (
    typeof draft.systemPromptTemplate !== 'string' ||
    typeof draft.description !== 'string' ||
    !Array.isArray(draft.dosDonts)
  ) {
    return NextResponse.json(
      { error: 'LLM output missing required fields (systemPromptTemplate, description, dosDonts).' },
      { status: 502 },
    );
  }

  return NextResponse.json(draft);
}
