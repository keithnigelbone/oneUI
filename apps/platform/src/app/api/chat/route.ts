/**
 * /api/chat — Legacy alias for the unified /api/agent dispatcher.
 *
 * Body shape is the old Home-specific shape (no `mode` field). Forwards
 * directly to the home executor so deployed clients that still point
 * here keep working through the migration.
 */

import { handleHome, type HomeAgentBody } from '../agent/executors/home';

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HomeAgentBody;
  return handleHome(body);
}
