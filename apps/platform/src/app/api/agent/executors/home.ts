/**
 * Home agent executor.
 *
 * Extracted from the original /api/chat route so both the unified
 * /api/agent dispatcher and the legacy /api/chat alias call the same
 * function. Request shape + streaming semantics unchanged.
 */

import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { buildAgentContext, CLAUDE_MODEL } from '@oneui/shared/agent';
import type { BrandFoundationSummary } from '@oneui/shared/agent';
import { getRegistryMetas } from '@/lib/registryMetas';
import { homeTools } from '../../chat/tools';
import { devLensTipFor, type ClientCapabilities } from './devlensTip';

export interface HomeAgentBody {
  messages: UIMessage[];
  brand: BrandFoundationSummary;
  voicePrompt?: string;
  compositionPrompt?: string;
  /**
   * Client-reported capability flags (populated by the web client from
   * package.json + Claude plugins list). Used to decide whether to append
   * the DevLens tip (Layer-2 nudge).
   */
  clientCapabilities?: ClientCapabilities;
}

export async function handleHome(body: HomeAgentBody): Promise<Response> {
  const { messages, brand, voicePrompt, compositionPrompt, clientCapabilities } = body;

  if (!brand?.brandName) {
    return new Response(
      JSON.stringify({ error: 'Missing brand.brandName in request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const context = buildAgentContext({
    componentMetas: getRegistryMetas(),
    brand,
    mode: 'home',
    voicePrompt,
    compositionPrompt,
  });

  if (context.truncated) {
    console.warn('[agent/home] system prompt truncated', { chars: context.chars });
  }

  // Append the DevLens tip when the client has @oneui/* deps but no plugin
  // installed. Suppressed otherwise (covers: plugin already on, no OneUI
  // deps, or signal absent from older clients).
  const tip = devLensTipFor(clientCapabilities);
  const system = tip ? `${context.system}\n${tip}` : context.system;

  const result = streamText({
    model: anthropic(CLAUDE_MODEL),
    system,
    messages: await convertToModelMessages(messages),
    tools: homeTools,
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse();
}
