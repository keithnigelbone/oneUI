/**
 * /api/agent — Unified agent dispatcher.
 *
 * Single entry point for every chat surface in the platform. The body
 * carries a `mode` discriminator plus mode-specific payload; this route
 * validates the mode and delegates to the matching executor module.
 *
 * The four legacy routes (/api/chat, /api/create/chat,
 * /api/composition/generate, /api/voice/generate) remain as thin
 * aliases that call the same executor functions — so a mid-migration
 * rollback only has to revert the client `ENDPOINT_BY_MODE` map.
 */

import { isAgentRouteMode, type AgentRouteMode } from '@/lib/agentRoutes';
import { handleBuild, type BuildAgentBody } from './executors/build';
import { handleDesign, type DesignAgentBody } from './executors/design';
import { handleHome, type HomeAgentBody } from './executors/home';
import { handleVoice, type VoiceAgentBody } from './executors/voice';

export const maxDuration = 120;

interface BaseAgentBody {
  mode: AgentRouteMode;
}

type AgentRequestBody =
  | (BaseAgentBody & { mode: 'home' } & HomeAgentBody)
  | (BaseAgentBody & { mode: 'build' } & BuildAgentBody)
  | (BaseAgentBody & { mode: 'design' } & DesignAgentBody)
  | (BaseAgentBody & { mode: 'voice' } & VoiceAgentBody);

export async function POST(request: Request): Promise<Response> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  if (!parsed || typeof parsed !== 'object') {
    return new Response('Body must be an object', { status: 400 });
  }

  const { mode } = parsed as Record<string, unknown>;
  if (!isAgentRouteMode(mode)) {
    return new Response(
      `Unknown or missing mode: ${JSON.stringify(mode)}. Expected one of home | build | design | voice.`,
      { status: 400 },
    );
  }

  const body = parsed as AgentRequestBody;

  switch (body.mode) {
    case 'home':
      return handleHome(body);
    case 'build':
      return handleBuild(body);
    case 'design':
      return handleDesign(body);
    case 'voice':
      return handleVoice(body);
  }
}
