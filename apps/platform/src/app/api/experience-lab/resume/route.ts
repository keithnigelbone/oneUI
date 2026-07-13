/**
 * /api/experience-lab/resume — resume a SUSPENDED campaign run (CAMP-01/D-05).
 *
 * The run route (`/api/experience-lab/run`) suspends a social-post /
 * instagram-carousel run at the campaign-plan checkpoint, persisting the
 * `CampaignPlan` to Convex (append-only, keyed by `runId`) the instant the run
 * becomes resumable. This route accepts the user's HITL selection
 * (`{ runId, brandId, directionIndex, frameCount }`), reads the persisted plan
 * back from Convex via `getCampaignPlan({ runId })` — NOT from process-memory
 * cache, which does NOT survive across HTTP requests in serverless/multi-process
 * (Pitfall 4 / A5 / T-04-14) — and re-enters the Mastra workflow with the
 * selection applied (`campaignSelection`). Branching lives in the workflow
 * (ORCH-04), never a model callback.
 *
 * Runtime: Node (Mastra requires Node — NEVER Edge). The selection is clamped at
 * runtime (V5 / T-04-04: directionIndex bounded to the plan's directions,
 * frameCount 1..10) and the body is `.strict()` so unknown keys are rejected.
 *
 * NOTE: frame generation itself is plan 04-03 — this route re-enters the
 * workflow with the selection captured; the carousel driver lands later.
 */

import {
  runExperienceWorkflow,
  type RunExperienceInput,
  type RunExperienceResult,
  type FoundationsLoader,
} from '@oneui/experience-builder-agents';
import type {
  RunEventFrame,
  RunResultFrame,
} from '@/app/(platform)/(experience-lab)/_canvas/runStream';
import { irToCompositionSpec } from '@oneui/experience-builder-core';
import { applySubBrandAccentsToFoundation } from '@oneui/shared';
import { ConvexHttpClient } from 'convex/browser';
import { createAuthedConvexClient } from '@/lib/convexServer';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  createExperienceLabPreviewExecutor,
  EXPERIENCE_LAB_PREVIEW_EXECUTOR_NAME,
} from '../preview-executor';
import { generateInitialRenderBrandCSS } from '../../../internal/render-ast/brandCss';
import { z } from 'zod';

// Mastra needs the Node runtime — declare it explicitly.
export const runtime = 'nodejs';
export const maxDuration = 120;

/** The unsaved prompt-card placeholder brand id — NOT a real `brands` doc id. */
const PLACEHOLDER_BRAND_ID = 'jio';

/** Resume body: the run + brand identity + the user's clamped HITL selection. */
const ResumeRequestBody = z
  .object({
    runId: z.string().min(1),
    brandId: z.string().min(1),
    // Plain numbers (Anthropic-safe; the selection rides the structured stack).
    // Clamped at runtime (V5) — directionIndex bounded to the plan, frameCount 1..10.
    directionIndex: z.number(),
    frameCount: z.number(),
    /** Optional sub-brand selection forwarded to the foundations loader (D-02). */
    subBrandConfigId: z.string().optional(),
  })
  .strict();

/** Encode one NDJSON frame. */
function encodeFrame(frame: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(frame)}\n`);
}

/**
 * Build the Convex-backed `FoundationsLoader` the workflow consumes (FND-01).
 * All Convex-shape coupling stays here — the agents package treats the loader as
 * an opaque async function. Mirrors `run/route.ts`'s loader exactly.
 */
function makeConvexFoundationsLoader(convex: ConvexHttpClient): FoundationsLoader {
  return async ({ brandId, subBrandConfigId }) => {
    if (brandId === PLACEHOLDER_BRAND_ID) return null;
    try {
      const overview = await convex.query(api.foundations.getBrandOverviewData, {
        brandId: brandId as Id<'brands'>,
      });
      if (!overview) return null;
      let base: Record<string, unknown> = overview as Record<string, unknown>;
      if (subBrandConfigId) {
        const sub = await convex.query(api.subBrandConfigs.getById, {
          id: subBrandConfigId as Id<'subBrandConfigs'>,
        });
        if (sub) {
          base =
            (applySubBrandAccentsToFoundation(
              overview as Record<string, unknown>,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sub as any,
            ) as Record<string, unknown> | null) ?? (overview as Record<string, unknown>);
        }
      }
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        colorConfig: (base as any).color?.config ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        presetSelection: (base as any).presetSelection ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        appearanceConfig: (base as any).appearanceConfig ?? null,
      };
    } catch (err) {
      console.error(
        '[experience-lab/resume] foundations loader query failed — using system defaults (D-08):',
        err,
      );
      return null;
    }
  };
}

async function loadPreviewBrandCSS(
  convex: ConvexHttpClient,
  brandId: string,
): Promise<string> {
  try {
    const foundationData = await convex.query(api.foundations.getBrandOverviewData, {
      brandId: brandId as Id<'brands'>,
    });
    return generateInitialRenderBrandCSS(
      foundationData as Record<string, unknown> | null,
      'light',
    );
  } catch (err) {
    console.error(
      '[experience-lab/resume] preview brand CSS generation failed; Daytona will use fallback CSS:',
      err,
    );
    return '';
  }
}

function toStoredRunStatus(
  run: RunExperienceResult,
): 'running' | 'suspended' | 'artifact' | 'gap' | 'error' {
  if (run.outcome === 'suspended') return 'suspended';
  return run.outcome;
}

export async function POST(request: Request): Promise<Response> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const result = ResumeRequestBody.safeParse(parsed);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid resume request', issues: result.error.issues }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const { runId, brandId, directionIndex, frameCount, subBrandConfigId } = result.data;

  // Brand-scope guard (ASVS V4 / CR-02): reject the unsaved placeholder brand at
  // the HTTP edge — BEFORE any Convex read or model call — exactly as the run and
  // export routes do. Without this, a `brandId === 'jio'` resume would still hit
  // getCampaignPlan/getRun and run the campaign workflow before the loader-level
  // guard short-circuits to system defaults. The placeholder is never a real
  // `brands` doc, so a resume scoped to it is always invalid.
  if (brandId === PLACEHOLDER_BRAND_ID) {
    return new Response(
      JSON.stringify({ error: 'Cannot resume from the unsaved placeholder brand.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // The resume path REQUIRES Convex: the plan was persisted there before suspend
  // and must be read back durably (Pitfall 4 / A5). Without Convex configured we
  // cannot re-hydrate the plan — error rather than fabricate one (FND-03 honesty).
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return new Response(
      JSON.stringify({ error: 'Convex not configured; cannot re-hydrate the campaign plan.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const convex = await createAuthedConvexClient(convexUrl);

  // Re-hydrate the persisted plan + the originating run request from Convex by
  // runId — NOT from process memory (Pitfall 4 / A5). The run row's `request`
  // carries the artifactType/outputProfile so the campaign branch re-enters
  // exactly as it suspended (no hardcoded guess).
  let campaignPlan: unknown;
  let runRequest: { artifactType?: string; outputProfile?: string } | undefined;
  try {
    campaignPlan = await convex.query(api.experienceRuns.getCampaignPlan, {
      runId: runId as Id<'experienceRuns'>,
    });
    const runRow = await convex.query(api.experienceRuns.getRun, {
      runId: runId as Id<'experienceRuns'>,
    });
    runRequest = runRow?.request as { artifactType?: string; outputProfile?: string } | undefined;
  } catch (err) {
    console.error('[experience-lab/resume] getCampaignPlan/getRun failed:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to read the persisted campaign plan.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
  if (!campaignPlan) {
    // Unknown / expired runId, or a run that never suspended a plan. Never
    // fabricate a plan — return a clear error (FND-03 honesty rule / T-04-14).
    return new Response(
      JSON.stringify({
        error: `No persisted campaign plan for run "${runId}". The run may be unknown or expired.`,
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Clamp the selection at runtime (V5 / T-04-04 / T-04-05): bound the direction
  // index to the plan's directions and the frame count to 1..10. The workflow
  // also clamps, but bounding here rejects an oversized request at the edge.
  const plan = campaignPlan as { directions?: unknown[] };
  const directionCount = Array.isArray(plan.directions) ? plan.directions.length : 1;
  const clampedDirectionIndex = Math.max(
    0,
    Math.min(directionCount - 1, Math.round(directionIndex)),
  );
  const clampedFrameCount = Math.max(1, Math.min(10, Math.round(frameCount)));

  const foundationsLoader = makeConvexFoundationsLoader(convex);

  // Re-fetch the brand's Platforms foundation so the re-entered campaign branch
  // resolves the same non-web canvas it did on the original run (D-01).
  let brandPlatforms: RunExperienceInput['brandPlatforms'];
  try {
    const platformsFoundation = await convex.query(api.foundations.getByType, {
      brandId: brandId as Id<'brands'>,
      type: 'platforms',
    });
    const cfg = (platformsFoundation as { config?: unknown } | null)?.config;
    if (cfg && typeof cfg === 'object' && Array.isArray((cfg as { platforms?: unknown }).platforms)) {
      brandPlatforms = cfg as RunExperienceInput['brandPlatforms'];
    }
  } catch (err) {
    console.error('[experience-lab/resume] platforms foundation fetch failed (non-fatal):', err);
  }

  // Prefer Daytona for the zero-egress sandbox path, with a first-party AST
  // fallback so a preview-infra failure never leaves a valid generated UI blank.
  const previewExecutorName = EXPERIENCE_LAB_PREVIEW_EXECUTOR_NAME;
  const previewBrandCss = await loadPreviewBrandCSS(convex, brandId);
  const previewExecutor = createExperienceLabPreviewExecutor({
    baseUrl: new URL(request.url).origin,
    brandCss: previewBrandCss,
  });

  // Re-enter the workflow with the selection applied (campaignSelection). The
  // workflow re-runs the campaign branch deterministically — re-resolving the
  // foundation + re-planning from the same cached/canonical inputs — then
  // applies the selection past the checkpoint. Branching is in the workflow
  // (ORCH-04), never a model callback. The artifact type/profile must be
  // supplied so the campaign branch is taken again; the resume body carries the
  // selection, and the persisted plan is the source of truth for clamping.
  const input: RunExperienceInput = {
    brandId,
    // Re-enter the campaign branch with the SAME artifact type/profile the run
    // suspended on (read from the persisted run row's request). Fall back to a
    // carousel default only if the row is unexpectedly missing them.
    artifactType: (runRequest?.artifactType ??
      'instagram-carousel') as RunExperienceInput['artifactType'],
    outputProfile: (runRequest?.outputProfile ??
      'ig-carousel') as RunExperienceInput['outputProfile'],
    ...(subBrandConfigId ? { subBrandConfigId } : {}),
    ...(brandPlatforms ? { brandPlatforms } : {}),
    foundationsLoader,
    previewExecutor,
    campaignSelection: { directionIndex: clampedDirectionIndex, frameCount: clampedFrameCount },
  };

  const run = await runExperienceWorkflow(input);

  try {
    await convex.mutation(api.experienceRuns.recordRunEvents, {
      runId: runId as Id<'experienceRuns'>,
      events: run.events,
      status: toStoredRunStatus(run),
      ...(run.validation ? { validation: run.validation } : {}),
      ...(run.previewState?.url ? { previewUrl: run.previewState.url } : {}),
      ...(run.previewError ? { error: run.previewError.message } : {}),
    });
  } catch (err) {
    console.error('[experience-lab/resume] run status persistence failed (non-fatal):', err);
  }

  // Persist the ordered carousel frames (CAMP-04 / D-07): each DS-compliant frame
  // becomes a grouped, ordered `experienceArtifacts` row (shared variantGroupId +
  // sequential orderIndex) keyed by the SAME run row the plan was persisted under.
  // Best-effort — a persistence failure never breaks the stream below. A repair-
  // exhausted/gap frame carries no shippable IR, so it is not persisted (FND-03).
  if (run.carouselFrames && run.carouselFrames.length > 0 && brandId !== PLACEHOLDER_BRAND_ID) {
    try {
      for (const frame of run.carouselFrames) {
        if (!frame.ir || frame.outcome !== 'artifact') continue;
        await convex.mutation(api.experienceRuns.persistArtifact, {
          runId: runId as Id<'experienceRuns'>,
          brandId: brandId as Id<'brands'>,
          artifactType: input.artifactType,
          outputProfile: input.outputProfile,
          ir: frame.ir,
          compositionSpec: irToCompositionSpec(frame.ir),
          ...(frame.validation ? { validation: frame.validation } : {}),
          variantGroupId: frame.variantGroupId,
          orderIndex: frame.orderIndex,
          originRunId: runId as Id<'experienceRuns'>,
        });
      }
    } catch (err) {
      console.error('[experience-lab/resume] carousel frame persistence failed (non-fatal):', err);
    }
  }

  const wireOutcome: RunResultFrame['outcome'] =
    run.outcome === 'suspended' ? 'gap' : run.outcome;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of run.events) {
        controller.enqueue(encodeFrame({ kind: 'event', event } satisfies RunEventFrame));
      }
      controller.enqueue(
        encodeFrame({
          kind: 'result',
          outcome: wireOutcome,
          ...(run.ir ? { ir: run.ir } : {}),
          ...(run.compositionSpec ? { compositionSpec: run.compositionSpec } : {}),
          ...(run.validation ? { validation: run.validation } : {}),
          ...(run.storybookMcpStatus ? { storybookMcpStatus: run.storybookMcpStatus } : {}),
          ...(run.storybookDocsUsed ? { storybookDocsUsed: run.storybookDocsUsed } : {}),
          // CAMP-04: the ordered frames the canvas renders as a tldraw group.
          ...(run.carouselFrames && run.carouselFrames.length > 0
            ? {
                carouselFrames: run.carouselFrames.map((f) => ({
                  variantGroupId: f.variantGroupId,
                  orderIndex: f.orderIndex,
                  outcome: f.outcome,
                  validationPassed: f.validationPassed,
                  copy: f.copy,
                  ...(f.ir ? { ir: f.ir } : {}),
                  ...(f.validation ? { validation: f.validation } : {}),
                })),
              }
            : {}),
        } satisfies RunResultFrame),
      );
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Experience-Run-Id': run.runId,
      'X-Experience-Outcome': run.outcome,
      'X-Experience-Preview-Executor': previewExecutorName,
    },
  });
}
