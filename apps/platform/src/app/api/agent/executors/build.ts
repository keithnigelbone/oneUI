/**
 * Build (Experience Builder) agent executor.
 *
 * Extracted from the original /api/create/chat route. The legacy
 * route is now a thin alias that forwards to this function.
 */

import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import { createTools } from '@/app/(platform)/(builder)/create/lib/tools';
import { buildCreateSystemPrompt } from '@/app/(platform)/(builder)/create/lib/prompt-system';
import type {
  BrandContext,
  SocialPlatform,
} from '@/app/(platform)/(builder)/create/lib/types';

interface ProjectContextPayload {
  name: string;
  description?: string;
  platforms: SocialPlatform[];
  audience?: string;
  tone?: string;
  brief?: string;
  assetType?: 'social-post' | 'ad-banner' | 'story-reel';
  projectType?: 'single' | 'campaign';
}

interface ExistingAsset {
  id: string;
  name: string;
  dimension: string;
  platform: string;
  status: string;
  hasImage: boolean;
}

export interface BuildAgentBody {
  messages: UIMessage[];
  brandContext: BrandContext;
  tokenCSS?: string;
  projectContext?: ProjectContextPayload;
  existingAssets?: ExistingAsset[];
}

function extractPlatformsFromMessages(messages: UIMessage[]): SocialPlatform[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === 'assistant' && msg.parts) {
      for (const part of msg.parts) {
        if (
          typeof part.type === 'string' &&
          part.type === 'tool-set_project_metadata' &&
          'state' in part &&
          (part as { state: string }).state === 'output-available' &&
          'input' in part
        ) {
          const input = (part as { input: Record<string, unknown> }).input;
          if (input && 'platforms' in input) {
            return input.platforms as SocialPlatform[];
          }
        }
      }
    }
  }
  return [];
}

export async function handleBuild(body: BuildAgentBody): Promise<Response> {
  const { messages, brandContext, tokenCSS, projectContext, existingAssets } = body;

  const platforms = projectContext?.platforms?.length
    ? projectContext.platforms
    : extractPlatformsFromMessages(messages);

  const systemPrompt = buildCreateSystemPrompt(
    brandContext,
    platforms,
    tokenCSS,
    projectContext,
    existingAssets,
  );

  const result = streamText({
    model: anthropic(CLAUDE_MODEL),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: createTools,
    stopWhen: stepCountIs(16),
  });

  return result.toUIMessageStreamResponse();
}
