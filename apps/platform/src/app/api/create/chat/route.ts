/**
 * /api/create/chat — Legacy alias for the unified /api/agent dispatcher.
 *
 * Forwards to the Build executor. See /api/agent/route.ts for the
 * unified contract.
 */

import { handleBuild, type BuildAgentBody } from '../../agent/executors/build';

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as BuildAgentBody;
  return handleBuild(body);
}
