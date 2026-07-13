/**
 * /api/composition/skills/regenerate-field
 *
 * Regenerate a single field of a skill draft without touching the rest.
 * Companion to `/api/composition/skills/generate-from-brief`. Used by the
 * field-by-field UI when the designer wants to redo just one card.
 *
 * The model receives the full draft as context so its replacement stays
 * coherent with everything else the user has kept or edited.
 */

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import { isCompositionContext, stripJSONFences } from '@oneui/shared/engine';
import { assertSameOrigin, rateLimitRequest } from '@/lib/apiGuards';

type RegenerableField =
  | 'name'
  | 'description'
  | 'category'
  | 'applicableContexts'
  | 'archetype'
  | 'attentionPattern'
  | 'dosDonts'
  | 'systemPromptTemplate'
  | 'examplePrompt';

const REGENERABLE_FIELDS = new Set<RegenerableField>([
  'name',
  'description',
  'category',
  'applicableContexts',
  'archetype',
  'attentionPattern',
  'dosDonts',
  'systemPromptTemplate',
  'examplePrompt',
]);
const VALID_CATEGORIES = new Set(['screen', 'pattern', 'flow']);
const RATE_LIMIT = { keyPrefix: 'skill-field-regenerate', maxRequests: 24, windowMs: 60_000 };

interface RegenerateRequestBody {
  brief: string;
  field: RegenerableField;
  draft: Record<string, unknown>;
  brandName?: string;
  vertical?: string;
}

function isValidBody(body: unknown): body is RegenerateRequestBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.brief === 'string' &&
    b.brief.trim().length > 0 &&
    typeof b.field === 'string' &&
    REGENERABLE_FIELDS.has(b.field as RegenerableField) &&
    Boolean(b.draft) &&
    typeof b.draft === 'object'
  );
}

const FIELD_INSTRUCTIONS: Record<RegenerableField, string> = {
  name: `Return ONLY a JSON object: {"name": "..."} where name is 2-6 words, Title Case (e.g. "Product Detail Screen"). No prose, no fences.`,
  description: `Return ONLY {"description": "..."} — 1-2 sentences, ≤ 200 characters, summarising what this skill produces.`,
  category: `Return ONLY {"category": "screen"|"pattern"|"flow"}. screen = full-screen archetypes; pattern = micro-blocks; flow = multi-step.`,
  applicableContexts: `Return ONLY {"applicableContexts": ["..."]}. Subset of: mobile-app, web-app, marketing-page, social-post, print, outdoor.`,
  archetype: `Return ONLY {"archetype": "..."}. Short kebab-case slug (e.g. "product-detail", "checkout").`,
  attentionPattern: `Return ONLY {"attentionPattern": "..."}. One sentence describing visual hierarchy.`,
  dosDonts: `Return ONLY {"dosDonts": ["...", "..."]}. 4-6 short bullets, mix of "Do:" and "Don't:" prefixes, surface/typography/attention specific.`,
  systemPromptTemplate: `Return ONLY {"systemPromptTemplate": "..."}. 250-1500 chars. ALWAYS include the {brand} placeholder. ALWAYS reference Surface modes. ALWAYS use design tokens via var(--Token-Name). Reference real OneUI components (Button, Input, Surface, Card, etc.). Single primary CTA per screen.`,
  examplePrompt: `Return ONLY {"examplePrompt": "..."}. One sample user prompt this skill would handle.`,
};

function buildSystemPrompt(field: RegenerableField): string {
  return [
    `You are the Skill Author for OneUI Studio's Design Composition Agent.`,
    `You are regenerating a SINGLE field of an existing skill draft. The other fields stay as-is and provide context. Your replacement MUST stay coherent with them.`,
    ``,
    FIELD_INSTRUCTIONS[field],
    ``,
    `Output the JSON object only — no markdown fences, no prose.`,
  ].join('\n');
}

function buildUserPrompt(body: RegenerateRequestBody): string {
  const lines: string[] = [];
  lines.push(`Original brief:`);
  lines.push(body.brief.trim());
  lines.push('');
  if (body.brandName) lines.push(`Brand: ${body.brandName}.`);
  if (body.vertical) lines.push(`Brand vertical: ${body.vertical}.`);
  lines.push('');
  lines.push(`Current draft (preserve these — only regenerate "${body.field}"):`);
  lines.push('```json');
  lines.push(JSON.stringify(body.draft));
  lines.push('```');
  lines.push('');
  lines.push(`Regenerate field: "${body.field}". Output the single-field JSON object only.`);
  return lines.join('\n');
}

function normalizeFieldValue(field: RegenerableField, value: unknown): unknown {
  if (field === 'category') {
    if (typeof value === 'string' && VALID_CATEGORIES.has(value)) return value;
    throw new Error('Regenerated category must be one of: screen, pattern, flow.');
  }

  if (field === 'applicableContexts') {
    if (!Array.isArray(value)) throw new Error('Regenerated applicableContexts must be an array.');
    const contexts = value.filter((item): item is string => isCompositionContext(item));
    if (contexts.length === 0) {
      throw new Error('Regenerated applicableContexts must include at least one valid context.');
    }
    return contexts;
  }

  if (field === 'dosDonts') {
    if (!Array.isArray(value)) throw new Error('Regenerated dosDonts must be an array.');
    const bullets = value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
    if (bullets.length === 0) throw new Error('Regenerated dosDonts must include at least one bullet.');
    return bullets;
  }

  if (typeof value !== 'string') {
    throw new Error(`Regenerated ${field} must be a string.`);
  }

  const trimmed = value.trim();
  if (field === 'archetype' || field === 'attentionPattern' || field === 'examplePrompt') {
    return trimmed || undefined;
  }
  if (!trimmed) throw new Error(`Regenerated ${field} cannot be empty.`);
  return trimmed;
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
      { error: 'Missing or invalid fields. Required: brief, field (one of the regenerable field names), draft (object).' },
      { status: 400 },
    );
  }

  let raw: string;
  try {
    const result = await generateText({
      model: anthropic(CLAUDE_MODEL),
      system: buildSystemPrompt(body.field),
      prompt: buildUserPrompt(body),
      temperature: 0.5,
    });
    raw = stripJSONFences(result.text);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LLM call failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    return NextResponse.json(
      {
        error: `LLM returned non-JSON output: ${(err as Error).message}`,
        raw: raw.slice(0, 500),
      },
      { status: 502 },
    );
  }

  if (!(body.field in parsed)) {
    return NextResponse.json(
      { error: `LLM did not return the requested field "${body.field}".`, raw },
      { status: 502 },
    );
  }

  let value: unknown;
  try {
    value = normalizeFieldValue(body.field, parsed[body.field]);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid regenerated field value.', raw },
      { status: 502 },
    );
  }

  return NextResponse.json({ field: body.field, value });
}
