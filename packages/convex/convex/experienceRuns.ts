/**
 * experienceRuns.ts
 *
 * Convex queries + mutations for the AI Experience Builder Lab's run + IR
 * persistence layer (VER-03 / D-08). A generation run and its produced Jio
 * Experience IR persist durably across three append-only tables:
 *
 *   - experienceRuns               — run state + ExperienceBuilderEvent log
 *   - experienceArtifacts          — artifact identity + current-version pointer
 *   - experienceArtifactVersions   — the IR (structured JSON) + validation result
 *
 * The IR is persisted as STRUCTURED JSON (markup-free by contract), never an
 * HTML/string-markup blob (D-08). Canvas layout is intentionally NOT persisted.
 *
 * Follows the brands.ts query/mutation + args-validator conventions. Existing
 * tables are untouched (isolation — Pitfall 3 / T-01-14).
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a new generation run with its originating request. Routes call this
 * before invoking Mastra so the Lab has a durable status row from the beginning
 * of the run, not only after generation completes.
 */
export const createRun = mutation({
  args: {
    brandId: v.id('brands'),
    request: v.object({
      artifactType: v.string(),
      outputProfile: v.string(),
      theme: v.optional(v.string()),
      prompt: v.optional(v.string()),
      subBrandConfigId: v.optional(v.string()),
      parentVersionId: v.optional(v.string()),
      canvasDocumentId: v.optional(v.string()),
      conversationThreadId: v.optional(v.string()),
      requestedComponents: v.optional(v.array(v.string())),
      strictStorybook: v.optional(v.boolean()),
      storybookMcpUrl: v.optional(v.string()),
    }),
    status: v.optional(
      v.union(
        v.literal('queued'),
        v.literal('running'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    const runId = await ctx.db.insert('experienceRuns', {
      brandId: args.brandId,
      request: args.request,
      events: [],
      status: args.status ?? 'running',
      createdAt: now,
      updatedAt: now,
    });
    return runId;
  },
});

/**
 * Append the emitted ExperienceBuilderEvent stream to a run and update its
 * terminal status. Replaces the stored event log with the authoritative
 * ordered stream from the completed run.
 */
export const recordRunEvents = mutation({
  args: {
    runId: v.id('experienceRuns'),
    events: v.array(v.any()),
    status: v.union(
      v.literal('queued'),
      v.literal('running'),
      v.literal('suspended'),
      v.literal('artifact'),
      v.literal('gap'),
      v.literal('error'),
      v.literal('cancelled'),
    ),
    validation: v.optional(v.any()),
    previewUrl: v.optional(v.string()),
    modelUsage: v.optional(v.array(v.any())),
    toolCalls: v.optional(v.array(v.any())),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'experienceRuns', args.runId, 'editor');
    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error('Experience run not found');
    const completedAt =
      args.status === 'artifact' ||
      args.status === 'gap' ||
      args.status === 'error' ||
      args.status === 'cancelled'
        ? Date.now()
        : undefined;

    await ctx.db.patch(args.runId, {
      events: args.events,
      status: args.status,
      ...(args.validation ? { validation: args.validation } : {}),
      ...(args.previewUrl ? { previewUrl: args.previewUrl } : {}),
      ...(args.modelUsage ? { modelUsage: args.modelUsage } : {}),
      ...(args.toolCalls ? { toolCalls: args.toolCalls } : {}),
      ...(args.error ? { error: args.error } : {}),
      ...(completedAt ? { completedAt } : {}),
      updatedAt: Date.now(),
    });
    return args.runId;
  },
});

/** Append incremental workflow events while a run is still executing. */
export const appendRunEvents = mutation({
  args: {
    runId: v.id('experienceRuns'),
    events: v.array(v.any()),
    status: v.optional(
      v.union(
        v.literal('queued'),
        v.literal('running'),
        v.literal('suspended'),
        v.literal('artifact'),
        v.literal('gap'),
        v.literal('error'),
        v.literal('cancelled'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'experienceRuns', args.runId, 'editor');
    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error('Experience run not found');
    await ctx.db.patch(args.runId, {
      events: [...run.events, ...args.events],
      ...(args.status ? { status: args.status } : {}),
      updatedAt: Date.now(),
    });
    return args.runId;
  },
});

/**
 * CAMP-02 / T-04-14: persist the campaign plan a suspended campaign run carries
 * on its HITL checkpoint. Append-only — patches the `campaignPlan` field on the
 * existing run row, keyed by `runId`. Called IMMEDIATELY BEFORE the workflow
 * suspends so the durable record exists the instant the run becomes resumable;
 * the resume route reads it back via {@link getCampaignPlan} rather than from
 * process-memory cache (which does not survive across HTTP requests in
 * serverless/multi-process — Pitfall 4 / A5). The plan is structured JSON
 * (CampaignPlanT), markup-free by contract.
 */
export const setCampaignPlan = mutation({
  args: {
    runId: v.id('experienceRuns'),
    campaignPlan: v.any(),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'experienceRuns', args.runId, 'editor');
    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error('Experience run not found');

    await ctx.db.patch(args.runId, {
      campaignPlan: args.campaignPlan,
      updatedAt: Date.now(),
    });
    return args.runId;
  },
});

/**
 * CAMP-02 / T-04-14: read the persisted campaign plan back by `runId`. The
 * resume route calls this to re-hydrate the plan durably (NOT from process
 * memory). Returns the structured plan JSON, or `null` when the run row exists
 * but has no plan / the run is unknown — the caller must error on a null plan
 * rather than fabricating one (FND-03 honesty rule).
 */
export const getCampaignPlan = query({
  args: { runId: v.id('experienceRuns') },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, run.brandId))) return null;
    return run.campaignPlan ?? null;
  },
});

/**
 * Persist an artifact + its (first) version for a completed run. Inserts the
 * artifact identity, then the artifact version carrying the canonical IR JSON
 * and the validation result, then wires the current-version pointer and the
 * run's artifact pointer. Returns both ids.
 */
export const persistArtifact = mutation({
  args: {
    runId: v.id('experienceRuns'),
    brandId: v.id('brands'),
    artifactType: v.string(),
    outputProfile: v.string(),
    // The canonical Jio Experience IR as structured JSON (markup-free).
    ir: v.any(),
    // The canonical component-only CompositionSpec, additive beside IR.
    compositionSpec: v.optional(v.any()),
    validation: v.optional(v.any()),
    parentVersionId: v.optional(v.id('experienceArtifactVersions')),
    // The GEN-06 canonical compiled bundle (D-07): the React + Jio CSS codegen
    // string + optional compile metadata. Append-only alongside the IR; the IR
    // stays canonical, this is the compiled output (never raw markup).
    compiledBundle: v.optional(
      v.object({
        code: v.string(),
        meta: v.optional(v.any()),
      }),
    ),
    // Best-of-N variant grouping (CANVAS-05 / D-12): sibling artifacts produced
    // from the same generation request share one group id. Append-only; absent
    // for non-variant (single-shot) runs.
    variantGroupId: v.optional(v.string()),
    // Ordered carousel frame position (CAMP-04 / D-07): carousel frames share one
    // `variantGroupId` AND carry a sequential `orderIndex` (Frame 1→2→3). Append-
    // only; absent for non-carousel runs (round-trips unchanged).
    orderIndex: v.optional(v.number()),
    // The D-13 fully-evaluated version object (VER-01). All additive
    // `v.optional` — the IR stays canonical; these are the durable render +
    // evaluation artifacts captured at version-freeze. NO auth/session/Convex
    // token is written into previewState/evaluation (render artifacts only).
    previewState: v.optional(v.any()),
    thumbnail: v.optional(v.id('_storage')),
    evaluation: v.optional(v.any()),
    // The run that ORIGINATED this artifact's lineage (root of the version
    // chain). `runId`/`args.runId` is the run that produced THIS version.
    originRunId: v.optional(v.id('experienceRuns')),
    // The D-06a multi-agent transparency trace (AGENT-01) — structured agent
    // outputs (planner/design/copy specs, registry matches, validation result,
    // eval composite, backfill provenance) assembled in `finalizeRun`.
    // Additive `v.optional` alongside the IR; existing rows round-trip. NO
    // auth/session/Convex token is written here (structured outputs only,
    // T-04.2-11 — mirrors the previewState/evaluation rule).
    agentTrace: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error('Experience run not found');

    const now = Date.now();

    // 1) Artifact identity. `variantGroupId` clusters best-of-N siblings
    //    (CANVAS-05 / D-12) — append-only, absent for single-shot runs.
    const artifactId = await ctx.db.insert('experienceArtifacts', {
      brandId: args.brandId,
      artifactType: args.artifactType,
      outputProfile: args.outputProfile,
      originRunId: args.runId,
      variantGroupId: args.variantGroupId,
      orderIndex: args.orderIndex,
      createdAt: now,
      updatedAt: now,
    });

    // 2) Artifact version — the IR JSON + validation result + the compiled
    //    bundle (D-07) + the D-13 version object (previewState, thumbnail,
    //    evaluation, originRunId). All append-only alongside the IR; the IR
    //    stays canonical, the rest are the compiled/rendered/evaluated output.
    const versionId = await ctx.db.insert('experienceArtifactVersions', {
      artifactId,
      runId: args.runId,
      ir: args.ir,
      compositionSpec: args.compositionSpec,
      validation: args.validation,
      parentVersionId: args.parentVersionId,
      compiledBundle: args.compiledBundle,
      previewState: args.previewState,
      thumbnail: args.thumbnail,
      evaluation: args.evaluation,
      originRunId: args.originRunId,
      agentTrace: args.agentTrace,
      createdAt: now,
    });

    // 3) Wire the current-version pointer + the run's artifact pointer.
    await ctx.db.patch(artifactId, { currentVersionId: versionId, updatedAt: now });
    await ctx.db.patch(args.runId, { artifactId, updatedAt: now });

    return { artifactId, versionId };
  },
});

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Read a single run with its event state + status. */
export const getRun = query({
  args: { runId: v.id('experienceRuns') },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, run.brandId))) return null;
    return run;
  },
});

/** List runs for a brand (most recent first by creation order via index scan). */
export const listRunsByBrand = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('experienceRuns')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

/**
 * Read the sibling artifacts that share a best-of-N variant group (CANVAS-05 /
 * D-12). Scans `experienceArtifacts` via the `by_variant_group` index (mirrors
 * `listRunsByBrand`'s `withIndex` scan) and returns the full sibling set so the
 * canvas can cluster them into a variant group.
 */
export const listVariantGroup = query({
  args: { variantGroupId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('experienceArtifacts')
      .withIndex('by_variant_group', (q) =>
        q.eq('variantGroupId', args.variantGroupId),
      )
      .collect();
  },
});

/**
 * Read an artifact's version history (shapes VER-01/VER-02 for P3; P1 only
 * needs run + IR persisted). Returns the artifact plus its ordered versions.
 */
export const getArtifactHistory = query({
  args: { artifactId: v.id('experienceArtifacts') },
  handler: async (ctx, args) => {
    const artifact = await ctx.db.get(args.artifactId);
    if (!artifact) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, artifact.brandId))) return null;
    const versions = await ctx.db
      .query('experienceArtifactVersions')
      .withIndex('by_artifact', (q) => q.eq('artifactId', args.artifactId))
      .collect();
    return { artifact, versions };
  },
});

/**
 * Read a single artifact version + its parent artifact (EXP-01/02/03 / D-13).
 * The export route reads the PERSISTED `compiledBundle.code` (no re-generation —
 * D-12) and the artifact's `artifactType`/`outputProfile` (so the route can
 * re-resolve the foundation dimensions for the raster/PDF path).
 */
export const getArtifactVersion = query({
  args: { versionId: v.id('experienceArtifactVersions') },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.versionId);
    if (!version) return null;
    const artifact = await ctx.db.get(version.artifactId);
    if (!artifact) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, artifact.brandId))) return null;
    return { version, artifact };
  },
});

/**
 * Read the ordered carousel sibling versions for a PDF export (EXP-03 / D-11).
 * Given one version's artifact group (`variantGroupId`), returns every
 * DS-compliant sibling artifact's current version + its `orderIndex`, so the
 * route composes the PDF in carousel order. Append-only read; no mutation.
 */
export const getCarouselVersions = query({
  args: { variantGroupId: v.string() },
  handler: async (ctx, args) => {
    const artifacts = await ctx.db
      .query('experienceArtifacts')
      .withIndex('by_variant_group', (q) =>
        q.eq('variantGroupId', args.variantGroupId),
      )
      .collect();
    const out: Array<{ orderIndex: number; version: unknown }> = [];
    for (const artifact of artifacts) {
      // Read-scoped: authenticated non-members skip (anonymous tooling passes).
      if (!(await canReadBrand(ctx, artifact.brandId))) continue;
      if (!artifact.currentVersionId) continue;
      const version = await ctx.db.get(artifact.currentVersionId);
      if (!version) continue;
      out.push({ orderIndex: artifact.orderIndex ?? 0, version });
    }
    // Ascending carousel order (D-11) — never reordered downstream.
    out.sort((a, b) => a.orderIndex - b.orderIndex);
    return out;
  },
});

/**
 * Persist an export of an artifact version (EXP-01/02/03 / D-13). APPEND-ONLY: a
 * NEW `experienceExports` row referencing the `_storage` id where the bytes live.
 * NO auth/session/Convex token is written — render artifacts only (PREV-01 /
 * T-04-12). The Lab NEVER writes the legacy `campaignAssets` table (LAB-03).
 */
export const persistExport = mutation({
  args: {
    versionId: v.id('experienceArtifactVersions'),
    brandId: v.id('brands'),
    kind: v.string(),
    storageId: v.id('_storage'),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.versionId);
    if (!version) throw new Error('Artifact version not found');
    const artifact = await ctx.db.get(version.artifactId);
    if (!artifact) throw new Error('Artifact not found');
    if (artifact.brandId !== args.brandId) {
      throw new Error('Export brand does not match artifact brand');
    }
    await requireBrandRole(ctx, artifact.brandId, 'editor');
    const now = Date.now();
    const exportId = await ctx.db.insert('experienceExports', {
      versionId: args.versionId,
      brandId: artifact.brandId,
      kind: args.kind,
      storageId: args.storageId,
      contentType: args.contentType,
      createdAt: now,
    });
    return { exportId };
  },
});
