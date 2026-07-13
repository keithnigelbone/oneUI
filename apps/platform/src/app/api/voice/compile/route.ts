/**
 * Voice Compile API — Pure compilation of voice rules into a system prompt.
 *
 * Accepts pre-fetched rules and config from the client, compiles them
 * into a ready-to-use LLM system prompt. No LLM call needed.
 */

import { NextResponse } from 'next/server';
import {
  compileVoiceRules,
  computeVoiceHash,
  VOICE_CONTEXTS,
} from '@oneui/shared';
import type { VoiceRule, VoiceConfig, VoiceContext } from '@oneui/shared';

interface CompileRequestBody {
  rules: VoiceRule[];
  config: VoiceConfig;
  channel?: string;
  /**
   * Surface context. Defaults to 'conversational' so existing callers
   * (playground, evaluation) keep working unchanged. New callers should pass
   * one of 'conversational' | 'copy' | 'microcopy' | 'editorial'.
   */
  context?: VoiceContext;
}

function isVoiceContext(value: unknown): value is VoiceContext {
  return typeof value === 'string' && (VOICE_CONTEXTS as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompileRequestBody;
    const { rules, config, channel } = body;
    const context: VoiceContext = isVoiceContext(body.context) ? body.context : 'conversational';

    if (!rules || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: rules and config' },
        { status: 400 }
      );
    }

    const compiled = compileVoiceRules(
      rules,
      config,
      channel ?? 'default',
      undefined,
      context,
    );
    const hash = computeVoiceHash(rules, config, channel ?? 'default', context);

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
