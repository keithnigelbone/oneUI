/**
 * /api/voice/generate — Legacy alias for the unified /api/agent
 * dispatcher.
 *
 * Forwards to the Voice executor (server-side two-pass tone-guard).
 * See /api/agent/route.ts for the unified contract.
 */

import { handleVoice, type VoiceAgentBody } from '../../agent/executors/voice';

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as VoiceAgentBody;
  return handleVoice(body);
}
