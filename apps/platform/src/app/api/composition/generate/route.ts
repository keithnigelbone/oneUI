/**
 * /api/composition/generate — Legacy alias for the unified /api/agent
 * dispatcher.
 *
 * Forwards to the Design Composition Agent executor. See
 * /api/agent/route.ts for the unified contract.
 */

import { handleDesign, type DesignAgentBody } from '../../agent/executors/design';

export const maxDuration = 120;

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as DesignAgentBody;
  return handleDesign(body);
}
