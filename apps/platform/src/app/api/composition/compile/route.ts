/**
 * Composition Compile API — Pure compilation of composition rules into a system prompt.
 *
 * Accepts pre-fetched rules and config from the client, compiles them
 * into a ready-to-use LLM system prompt. No LLM call needed.
 *
 * Mirrors /api/voice/compile pattern.
 */

import { NextResponse } from 'next/server';
import {
  compileCompositionRules,
  computeCompositionHash,
} from '@oneui/shared/engine';
import type { CompositionRule, CompositionConfig, CompositionContext, CompositionSkill } from '@oneui/shared/engine';

const VALID_CONTEXTS = new Set(['mobile-app', 'web-app', 'marketing-page', 'social-post', 'print', 'outdoor']);

interface CompileRequestBody {
  rules: CompositionRule[];
  config: CompositionConfig;
  componentRef?: string;
  brandSummary?: string;
  skills?: CompositionSkill[];
  context?: CompositionContext;
}

function isCompositionContext(value: unknown): value is CompositionContext {
  return typeof value === 'string' && VALID_CONTEXTS.has(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompileRequestBody;
    const { rules, config, componentRef, brandSummary, skills } = body;
    const context: CompositionContext = isCompositionContext(body.context) ? body.context : 'mobile-app';

    if (!rules || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: rules and config' },
        { status: 400 }
      );
    }

    const compiled = compileCompositionRules(
      rules,
      config,
      componentRef ?? '',
      brandSummary ?? '',
      skills,
      context,
    );
    const hash = computeCompositionHash(rules, config, context);

    return NextResponse.json({
      prompt: compiled.prompt,
      size: compiled.size,
      hash,
      includedSections: compiled.includedSections,
      context,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Compilation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
