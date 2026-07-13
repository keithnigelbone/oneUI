/**
 * /api/experience-lab/status — durable Experience Lab run status.
 *
 * This is the read side of the submit/stream/status contract. The streaming
 * `/run` and `/resume` routes write the same Convex run row as generation
 * progresses; this route lets the Lab reload or poll that row without invoking
 * Mastra again.
 */

import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { z } from 'zod';
import { createRequiredAuthedConvexClient } from '@/lib/convexServer';

export const runtime = 'nodejs';

const StatusQuery = z
  .object({
    runId: z.string().min(1),
  })
  .strict();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const parsed = StatusQuery.safeParse({
    runId: new URL(request.url).searchParams.get('runId') ?? '',
  });
  if (!parsed.success) {
    return json({ error: 'Invalid status request', issues: parsed.error.issues }, 400);
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return json({ error: 'Convex not configured; durable run status is unavailable.' }, 503);
  }

  try {
    const convex = await createRequiredAuthedConvexClient(convexUrl);
    if (!convex) return json({ error: 'Authentication required' }, 401);
    const run = await convex.query(api.experienceRuns.getRun, {
      runId: parsed.data.runId as Id<'experienceRuns'>,
    });
    if (!run) return json({ error: 'Experience run not found' }, 404);

    return json({
      runId: run._id,
      brandId: run.brandId,
      status: run.status,
      request: run.request,
      events: run.events,
      artifactId: run.artifactId,
      validation: run.validation,
      previewUrl: run.previewUrl,
      error: run.error,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      completedAt: run.completedAt,
    });
  } catch (err) {
    console.error('[experience-lab/status] getRun failed:', err);
    return json({ error: 'Failed to read durable run status.' }, 500);
  }
}
