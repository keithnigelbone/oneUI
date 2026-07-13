/**
 * Voice agent executor — server-side two-pass tone-guard flow.
 *
 * Extracted verbatim from the original /api/voice/generate route. The
 * legacy route is now a thin alias that forwards to this function.
 */

import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type UIMessage,
} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { runToneGuard } from '@oneui/shared/engine';
import type { VoiceConfig } from '@oneui/shared/engine';

const ALLOWED_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5'] as const;
type AllowedModel = (typeof ALLOWED_MODELS)[number];
const DEFAULT_MODEL: AllowedModel = 'claude-sonnet-4-6';

/** Checks we don't retry on — either advisory (oxford-comma) or
 *  metric-only (response-length can't be fixed by reprompt). */
const NON_FIXABLE_CHECK_IDS = new Set(['oxford-comma', 'response-length']);

export interface VoiceAgentBody {
  messages: UIMessage[];
  voicePrompt: string;
  channel?: string;
  config?: VoiceConfig;
  showToneGuard?: boolean;
  model?: string;
}

function resolveModel(requested?: string): AllowedModel {
  return ALLOWED_MODELS.includes(requested as AllowedModel)
    ? (requested as AllowedModel)
    : DEFAULT_MODEL;
}

function appendChannelContext(systemPrompt: string, channel?: string): string {
  if (!channel || channel === 'default') return systemPrompt;
  return `${systemPrompt}\n\nCurrent channel: ${channel}. Apply channel-specific constraints.`;
}

function buildCorrectionInstructions(
  violations: ReadonlyArray<{ name: string; details?: string }>,
): string {
  return [
    'IMPORTANT — CORRECTION REQUIRED: Your previous response violated these brand voice rules.',
    'Rewrite your response fixing only these violations. Keep the same intent and helpfulness.',
    '',
    ...violations.map((c) => `- ${c.name}${c.details ? `: ${c.details}` : ''}`),
  ].join('\n');
}

/** Emit a buffered text block as the standard text-start / text-delta /
 *  text-end triplet so UIMessage reconstruction lands in a normal
 *  TextUIPart and `extractText()` picks it up cleanly. */
function emitText(
  writer: Parameters<Parameters<typeof createUIMessageStream>[0]['execute']>[0]['writer'],
  text: string,
): void {
  const id = 'voice-text';
  writer.write({ type: 'text-start', id });
  writer.write({ type: 'text-delta', id, delta: text });
  writer.write({ type: 'text-end', id });
}

export async function handleVoice(body: VoiceAgentBody): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('ANTHROPIC_API_KEY is not configured.', { status: 500 });
  }

  const { messages, voicePrompt, channel, config, model: requestedModel } = body;
  const showToneGuard = body.showToneGuard ?? true;
  const model = resolveModel(requestedModel);

  if (!voicePrompt || voicePrompt.trim().length === 0) {
    return new Response(
      'Voice prompt is empty. Open Tone of Voice → Configuration and run "Create voice config and seed rules" before chatting.',
      { status: 400 },
    );
  }

  const systemPrompt = appendChannelContext(voicePrompt, channel);

  const modelMessages = await convertToModelMessages(messages);

  // Fast path: tone guard off → stream directly.
  if (!showToneGuard || !config) {
    const result = streamText({
      model: anthropic(model),
      system: systemPrompt,
      messages: modelMessages,
    });
    return result.toUIMessageStreamResponse();
  }

  // Two-pass path.
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({
        type: 'data-tone-guard',
        id: 'tone-guard',
        data: { phase: 'checking' },
      });

      const firstPass = await generateText({
        model: anthropic(model),
        system: systemPrompt,
        messages: modelMessages,
      });

      let content = firstPass.text;

      let guard = runToneGuard(content, config, channel);
      if (guard.correctedText) {
        content = guard.correctedText;
        guard = runToneGuard(content, config, channel);
      }

      const fixableViolations = guard.checks.filter(
        (c) => !c.passed && !NON_FIXABLE_CHECK_IDS.has(c.id),
      );

      if (fixableViolations.length === 0) {
        writer.write({
          type: 'data-tone-guard',
          id: 'tone-guard',
          data: { phase: 'passed', result: guard },
        });
        emitText(writer, content);
        return;
      }

      const correction = buildCorrectionInstructions(fixableViolations);
      const secondPass = await generateText({
        model: anthropic(model),
        system: `${systemPrompt}\n\n${correction}`,
        messages: modelMessages,
      });

      let correctedContent = secondPass.text;
      let correctedGuard = runToneGuard(correctedContent, config, channel);
      if (correctedGuard.correctedText) {
        correctedContent = correctedGuard.correctedText;
        correctedGuard = runToneGuard(correctedContent, config, channel);
      }

      writer.write({
        type: 'data-tone-guard',
        id: 'tone-guard',
        data: { phase: 'corrected', result: correctedGuard },
      });
      emitText(writer, correctedContent);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[agent/voice] stream error:', message);
      return `Generation failed: ${message}`;
    },
  });

  return createUIMessageStreamResponse({ stream });
}
