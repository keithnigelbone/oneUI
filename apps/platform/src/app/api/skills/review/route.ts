/**
 * /api/skills/review
 *
 * Asks Claude to review an existing skill draft and return structured
 * feedback: a flat issues list plus a short suggestions list. The deterministic
 * `validateSkill` is run client-side on every keystroke; this route is the
 * on-demand AI layer for tone, voice, and quality concerns the validator
 * can't catch.
 *
 * Phase F — Skill Writer (Review mode).
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

interface ReviewRequestBody {
  brandId: string;
  brandName?: string;
  skillName?: string;
  category?: 'screen' | 'pattern' | 'flow';
  draft: string;
}

interface ReviewIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
}

interface ReviewResponseBody {
  feedback: string;
  issues: ReviewIssue[];
  suggestions: string[];
}

function isValidBody(body: unknown): body is ReviewRequestBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.brandId === 'string' &&
    b.brandId.length > 0 &&
    typeof b.draft === 'string' &&
    b.draft.trim().length > 0
  );
}

function buildSystemPrompt(fewShots: FewShotSkill[]): string {
  return [
    `You are the Skill Reviewer for OneUI Studio's Design Composition Agent.`,
    `A skill is a system prompt template that drives UI composition.`,
    ``,
    `Your job: read the draft below and assess (a) tone and voice match against the catalogue, (b) coverage of OneUI conventions (Surface modes, attention pyramid, design tokens), (c) clarity and concreteness, (d) completeness for its stated category.`,
    ``,
    `Output a single JSON object matching this exact shape:`,
    `{`,
    `  "feedback": string,                                     // 2–4 sentence overall assessment`,
    `  "issues": [{ "level": "error"|"warning"|"info", "message": string }],  // 0–6 specific concerns`,
    `  "suggestions": string[]                                 // 0–5 concrete edits, each ≤ 120 chars`,
    `}`,
    ``,
    `Levels:`,
    `- error: blocks shipping (missing {brand}, hardcoded colours, invented components)`,
    `- warning: degrades quality but isn't fatal (vague attention story, duplicated guidance)`,
    `- info: nice-to-have polish (could mention secondary CTA, could be more concise)`,
    ``,
    `Below are ${fewShots.length} reference skills from the brand's curated catalogue. Use them to calibrate voice and density expectations.`,
    ``,
    fewShots.map(renderFewShot).join('\n\n---\n\n'),
    ``,
    `Output ONLY the JSON object. No prose, no markdown fences.`,
  ].join('\n');
}

function buildUserPrompt(body: ReviewRequestBody): string {
  const lines: string[] = [];
  lines.push('Review this skill draft.');
  if (body.skillName) lines.push(`Name: ${body.skillName}`);
  if (body.category) lines.push(`Category: ${body.category}`);
  if (body.brandName) lines.push(`Brand: ${body.brandName}`);
  lines.push('');
  lines.push('Draft:');
  lines.push(body.draft);
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
      { error: 'Missing or invalid fields. Required: brandId (string), draft (non-empty string).' },
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

  let review: ReviewResponseBody;
  try {
    review = JSON.parse(raw) as ReviewResponseBody;
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
    typeof review.feedback !== 'string' ||
    !Array.isArray(review.issues) ||
    !Array.isArray(review.suggestions)
  ) {
    return NextResponse.json(
      { error: 'LLM output missing required fields (feedback, issues, suggestions).' },
      { status: 502 },
    );
  }

  return NextResponse.json(review);
}
