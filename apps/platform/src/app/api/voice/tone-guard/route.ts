/**
 * Voice Tone Guard API — Deterministic post-generation validation.
 *
 * Validates an AI response against brand voice rules using regex
 * and dictionary checks. No LLM call needed — pure deterministic.
 */

import { NextResponse } from 'next/server';
import { runToneGuard } from '@oneui/shared';
import type { VoiceConfig } from '@oneui/shared';

interface ToneGuardRequestBody {
  text: string;
  config: VoiceConfig;
  channel?: string;
}

export async function POST(request: Request) {
  try {
    const { text, config, channel } = (await request.json()) as ToneGuardRequestBody;

    if (!text || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: text and config' },
        { status: 400 }
      );
    }

    const result = runToneGuard(text, config, channel);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tone guard validation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
