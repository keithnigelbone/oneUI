/**
 * /api/experience-lab/run — the Experience Lab generation run route.
 *
 * This is the ONLY place the Lab invokes Mastra from the app (ORCH-04:
 * orchestration is backend, never browser). The browser posts a prompt-card
 * config; this route delegates to the plan-04 Mastra workflow
 * (`runExperienceWorkflow` in `@oneui/experience-builder-agents`) and streams
 * the resulting `ExperienceBuilderEvent`s back to the client canvas reducer.
 *
 * Runtime: Node (Mastra requires Node — NEVER Edge). `maxDuration` is set so a
 * long run is not cut off. The route carries NO auth / Convex tokens into any
 * preview surface — previews are sandboxed in P3, not here.
 *
 * Transport: the v6 stream version decision is owned by the agents package
 * (`toV6WorkflowStream` / `AI_SDK_STREAM_VERSION` in modelAdapter.ts — the sole
 * `@mastra/ai-sdk` `toAISdkStream` touchpoint). The P1 workflow runner returns
 * the ordered event array up-front (deterministic mocks, no live model), so
 * this route serialises that ordered stream as newline-delimited JSON frames —
 * the same ordered `ExperienceBuilderEvent` stream the live transport will
 * carry once a real model lands. The client decodes line-by-line.
 *
 * Frame shape (NDJSON): each line is `{ kind: 'event', event }` for the ordered
 * `ExperienceBuilderEvent` stream, followed by a terminal
 * `{ kind: 'result', outcome, ir?, validation? }` frame carrying the produced
 * IR (when valid) so the artifact card can render its structured IR summary
 * (the IR is structured JSON, never markup — IR-02 / T-01-16).
 */

import {
  runExperienceWorkflow,
  type RunExperienceInput,
  type RunExperienceResult,
  type FoundationsLoader,
  type VoiceAssetsLoader,
} from '@oneui/experience-builder-agents';
import {
  ArtifactTypeSchema,
  OutputProfileSchema,
  irToCompositionSpec,
} from '@oneui/experience-builder-core';
import { applySubBrandAccentsToFoundation } from '@oneui/shared';
import type { VoiceConfig, VoiceRule } from '@oneui/shared/engine';
import type {
  RunEventFrame,
  RunResultFrame,
} from '@/app/(platform)/(experience-lab)/_canvas/runStream';
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

// Mastra needs the Node runtime — declare it explicitly so a project-level Edge
// default can never silently run the orchestration in an incompatible runtime.
export const runtime = 'nodejs';
export const maxDuration = 120;

/** The unsaved prompt-card placeholder brand id — NOT a real `brands` doc id. */
const PLACEHOLDER_BRAND_ID = 'jio';

/**
 * The result of persisting a run: the Convex run id (when stored) plus the
 * preview seed the terminal result frame carries to the canvas card. `null`
 * when persistence was skipped/failed.
 */
interface PersistResult {
  persistedRunId: string;
  /** Signed `_storage` thumbnail URL (VER-01), when the upload succeeded. */
  thumbnailUrl?: string;
}

type StoredRunStatus =
  | 'running'
  | 'suspended'
  | 'artifact'
  | 'gap'
  | 'error';

interface StoredRunRequestMeta {
  canvasDocumentId?: string;
  conversationThreadId?: string;
}

type PersistArtifactArgs = {
  runId: Id<'experienceRuns'>;
  brandId: Id<'brands'>;
  artifactType: string;
  outputProfile: string;
  ir: unknown;
  compositionSpec?: unknown;
  validation?: unknown;
  parentVersionId?: Id<'experienceArtifactVersions'>;
  compiledBundle?: { code: string; meta?: unknown };
  variantGroupId?: string;
  orderIndex?: number;
  previewState?: unknown;
  thumbnail?: Id<'_storage'>;
  evaluation?: unknown;
  originRunId?: Id<'experienceRuns'>;
  agentTrace?: unknown;
};

/**
 * Best-effort: upload the first per-profile preview screenshot PNG to Convex
 * `_storage` and return its storage id (VER-01 thumbnail). Mirrors the VERIFIED
 * upload analog in `composition/verify/route.ts:163-171`
 * (`generateUploadUrl` → POST the PNG → read back `{ storageId }`). A
 * screenshot/upload failure is NON-FATAL — a missing thumbnail must never abort
 * artifact persistence, so the caller catches and continues.
 */
async function uploadThumbnail(convex: ConvexHttpClient, png: Buffer): Promise<Id<'_storage'>> {
  const uploadUrl = (await convex.mutation(
    api.renderedScreenshots.generateUploadUrl,
    {}
  )) as string;
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' },
    // Node Buffer is structurally a Uint8Array, which fetch accepts at runtime,
    // but the DOM `BodyInit` typing does not list it directly.
    body: png as unknown as BodyInit,
  });
  const { storageId } = (await uploadRes.json()) as { storageId: Id<'_storage'> };
  return storageId;
}

/**
 * Convex rejects `undefined` anywhere inside a value. Agent outputs and repaired
 * IRs are JSON-shaped but can still carry sparse arrays or optional fields from
 * model/tool output, so clean them at the route boundary before persistence.
 */
function toConvexJson<T>(value: T): T {
  return stripUndefined(value) as T;
}

function toConvexFieldName(key: string): string {
  return key.replace(/[^\x20-\x7E]/g, '-');
}

function stripUndefined(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefined(item))
      .filter((item) => item !== undefined);
  }
  if (typeof value === 'object') {
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Uint8Array) return value;
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      const cleaned = stripUndefined(child);
      if (cleaned !== undefined) out[toConvexFieldName(key)] = cleaned;
    }
    return out;
  }
  return value;
}

function deriveCompositionSpecSafely(run: RunExperienceResult): ReturnType<typeof irToCompositionSpec> | null {
  if (run.compositionSpec) return run.compositionSpec;
  if (!run.ir) return null;
  try {
    return irToCompositionSpec(run.ir);
  } catch (err) {
    console.error(
      '[experience-lab/run] compositionSpec derivation failed — persisting IR only:',
      err
    );
    return null;
  }
}

function toStoredRunStatus(run: RunExperienceResult): StoredRunStatus {
  if (run.outcome === 'suspended') return 'suspended';
  return run.outcome;
}

function buildStoredRunRequest(input: RunExperienceInput, meta: StoredRunRequestMeta = {}) {
  return {
    artifactType: input.artifactType,
    outputProfile: input.outputProfile,
    ...(input.theme ? { theme: input.theme } : {}),
    ...(input.prompt ? { prompt: input.prompt } : {}),
    ...(input.subBrandConfigId ? { subBrandConfigId: input.subBrandConfigId } : {}),
    ...(input.parentVersionId ? { parentVersionId: input.parentVersionId } : {}),
    ...(meta.canvasDocumentId ? { canvasDocumentId: meta.canvasDocumentId } : {}),
    ...(meta.conversationThreadId ? { conversationThreadId: meta.conversationThreadId } : {}),
    ...(input.requestedComponents ? { requestedComponents: input.requestedComponents } : {}),
    ...(input.strictStorybook !== undefined ? { strictStorybook: input.strictStorybook } : {}),
    ...(input.storybookMcpUrl ? { storybookMcpUrl: input.storybookMcpUrl } : {}),
  };
}

async function loadPreviewBrandCSS(
  convexUrl: string | undefined,
  brandId: string,
  theme: string | undefined,
): Promise<string> {
  if (!convexUrl || brandId === PLACEHOLDER_BRAND_ID) return '';
  try {
    const convex = await createAuthedConvexClient(convexUrl);
    const foundationData = await convex.query(api.foundations.getBrandOverviewData, {
      brandId: brandId as Id<'brands'>,
    });
    return generateInitialRenderBrandCSS(
      foundationData as Record<string, unknown> | null,
      theme === 'dark' ? 'dark' : 'light',
    );
  } catch (err) {
    console.error(
      '[experience-lab/run] preview brand CSS generation failed; Daytona will use fallback CSS:',
      err,
    );
    return '';
  }
}

/**
 * Persist the completed run + its IR + the FULL VER-01 version object to Convex
 * (VER-01 / VER-03 / D-08). Best-effort: the run already completed in-memory, so
 * persistence NEVER blocks or breaks the event stream. Skips when Convex is
 * unconfigured or the brand is still the unsaved `'jio'` placeholder (not a real
 * `brands` doc id). Returns the persisted Convex run id (+ thumbnail URL) when
 * stored, else null.
 *
 * VER-01 END-TO-END: the `persistArtifact` call now passes the D-13 version
 * object — `previewState`, `evaluation`, `variantGroupId`, `originRunId`, and a
 * `_storage` `thumbnail` uploaded from the first preview screenshot — so a
 * persisted `experienceArtifactVersions` row carries non-null render/evaluation
 * data and the VER-02 timeline renders real values, not blanks.
 */
async function persistRun(
  input: RunExperienceInput,
  run: RunExperienceResult,
  existingRunId?: Id<'experienceRuns'>,
  requestMeta: StoredRunRequestMeta = {},
): Promise<PersistResult | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl || input.brandId === PLACEHOLDER_BRAND_ID) return null;

  try {
    const convex = await createAuthedConvexClient(convexUrl);
    const brandId = input.brandId as Id<'brands'>;

    const persistedRunId =
      existingRunId ??
      ((await convex.mutation(api.experienceRuns.createRun, {
        brandId,
        request: buildStoredRunRequest(input, requestMeta),
        status: 'running',
      })) as Id<'experienceRuns'>);

    // Replace the run's stored log with the authoritative ordered stream + the
    // durable status. A HITL pause records as `suspended` in Convex even though
    // the existing NDJSON wire contract still maps it to a gap-like canvas card.
    const recordStatus = toStoredRunStatus(run);
    await convex.mutation(api.experienceRuns.recordRunEvents, {
      runId: persistedRunId,
      events: run.events,
      status: recordStatus,
      ...(run.validation ? { validation: toConvexJson(run.validation) } : {}),
      ...(run.previewState?.url ? { previewUrl: run.previewState.url } : {}),
      ...(run.previewError ? { error: run.previewError.message } : {}),
    });

    let thumbnailUrl: string | undefined;

    // CAMP-04 / D-07: a carousel run persists each ORDERED frame as a grouped
    // artifact — shared `variantGroupId` + sequential `orderIndex`. Each frame
    // independently passed (or surfaced repair-exhausted); only frames carrying
    // a real IR are persisted (a repair-exhausted/gap frame has no shippable IR,
    // so no fabricated artifact — FND-03 honesty). Mirrors how `variantGroupId`
    // is persisted on the single-artifact path below.
    if (run.carouselFrames && run.carouselFrames.length > 0) {
      for (const frame of run.carouselFrames) {
        if (!frame.ir || frame.outcome !== 'artifact') continue;
      await convex.mutation(api.experienceRuns.persistArtifact, {
        runId: persistedRunId,
        brandId,
        artifactType: input.artifactType,
        outputProfile: input.outputProfile,
        ir: toConvexJson(frame.ir),
        compositionSpec: toConvexJson(irToCompositionSpec(frame.ir)),
        ...(frame.validation ? { validation: toConvexJson(frame.validation) } : {}),
        variantGroupId: frame.variantGroupId,
        orderIndex: frame.orderIndex,
        originRunId: persistedRunId,
        });
      }
      return {
        persistedRunId: persistedRunId as unknown as string,
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      };
    }

    // A valid-IR run produces an artifact. A preview-INFRA failure
    // (`run.previewError`) ALSO produced a real IR — generation succeeded, only
    // the preview/screenshot step threw — so the IR/version that DID generate is
    // still persisted (it is NOT a gap; T-031-06). A true gap/error run with no
    // IR persists the run log alone (no fabricated artifact — FND-03 / Pitfall 6).
    if ((run.outcome === 'artifact' || run.previewError) && run.ir) {
      // VER-01 thumbnail: upload the first preview screenshot to `_storage`.
      // Guarded so an upload failure is non-fatal (a missing thumbnail must NOT
      // abort persistence) — the artifact still persists without a thumbnail.
      let thumbnailStorageId: Id<'_storage'> | undefined;
      const firstShot = run.screenshots?.[0]?.png;
      if (firstShot) {
        try {
          thumbnailStorageId = await uploadThumbnail(convex, firstShot);
          // Resolve a signed URL so the card can render it immediately (PREV-03).
          // Uses the VERIFIED `references.getStorageUrl` analog (verify route).
          thumbnailUrl =
            (await convex.query(api.references.getStorageUrl, {
              storageId: thumbnailStorageId,
            })) ?? undefined;
        } catch (uploadErr) {
          console.error('[experience-lab/run] thumbnail upload failed (non-fatal):', uploadErr);
        }
      }

      const compositionSpec = deriveCompositionSpecSafely(run);
      const artifactArgs: PersistArtifactArgs = {
        runId: persistedRunId,
        brandId,
        artifactType: input.artifactType,
        outputProfile: input.outputProfile,
        ir: toConvexJson(run.ir),
        ...(compositionSpec ? { compositionSpec: toConvexJson(compositionSpec) } : {}),
        ...(run.validation ? { validation: toConvexJson(run.validation) } : {}),
        // Persist the GEN-06 canonical compiled bundle alongside the IR (D-07,
        // append-only). `run.bundle` is the React + Jio CSS codegen string; the
        // IR above stays canonical, this is the durable compiled output.
        ...(run.bundle ? { compiledBundle: { code: run.bundle } } : {}),
        // INPUT-05 lineage: chain this version onto its parent when iterating.
        ...(input.parentVersionId
          ? { parentVersionId: input.parentVersionId as Id<'experienceArtifactVersions'> }
          : {}),
        // VER-01 D-13 version object — all additive. `originRunId` roots the
        // version-chain lineage at the run that produced THIS version.
        ...(run.previewState ? { previewState: toConvexJson(run.previewState) } : {}),
        ...(run.evaluation ? { evaluation: toConvexJson(run.evaluation) } : {}),
        ...(run.variantGroupId ? { variantGroupId: run.variantGroupId } : {}),
        ...(thumbnailStorageId ? { thumbnail: thumbnailStorageId } : {}),
        // AGENT-01 / D-06a: persist the multi-agent transparency trace additively
        // alongside the IR (append-only, no migration). Structured agent outputs
        // only — finalizeRun never assembles a secret/token into it (T-04.2-11).
        ...(run.agentTrace ? { agentTrace: toConvexJson(run.agentTrace) } : {}),
        originRunId: persistedRunId,
      };
      await persistArtifactCompat(convex, artifactArgs);
    }

    return {
      persistedRunId: persistedRunId as unknown as string,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
    };
  } catch (err) {
    // Non-fatal: a persistence failure must not break the run stream.
    console.error('[experience-lab/run] run persistence failed (non-fatal):', err);
    return null;
  }
}

async function persistArtifactCompat(
  convex: ConvexHttpClient,
  args: PersistArtifactArgs,
): Promise<unknown> {
  try {
    return await convex.mutation(api.experienceRuns.persistArtifact, args);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('extra field `compositionSpec`') || !('compositionSpec' in args)) {
      throw err;
    }
    const { compositionSpec: _compositionSpec, ...withoutCompositionSpec } = args;
    console.error(
      '[experience-lab/run] Convex persistArtifact validator lacks compositionSpec; retrying without it.'
    );
    return await convex.mutation(api.experienceRuns.persistArtifact, withoutCompositionSpec);
  }
}

/**
 * Build the Convex-backed `FoundationsLoader` the workflow consumes (FND-01 /
 * FND-04). This is the route/Convex half of the foundation-wiring slice: it
 * fetches a real brand overview (and optionally merges a sub-brand) and maps it
 * into the `BrandFoundations` shape the agents resolver expects.
 *
 * ALL Convex-shape coupling stays here (D-05) — the agents package treats the
 * loader as an opaque async function and never sees `@oneui/convex`.
 *
 * Resolution rules:
 *  - `brandId === PLACEHOLDER_BRAND_ID` ('jio') → `null` → engine system
 *    defaults (D-08), never a crash or a fabricated foundation.
 *  - No overview record → `null` → system defaults (D-08).
 *  - When `subBrandConfigId` is present, fetch the sub-brand and merge its 4
 *    accent fields via `applySubBrandAccentsToFoundation` BEFORE the 3-field map
 *    (D-03 / D-06).
 *  - Map `color?.config` VERBATIM (Pitfall 1) — `overview.color` is a foundation
 *    record; the resolver wants its `.config` sub-object. Mapping the record
 *    yields empty scales → a spurious gap for a valid brand.
 *
 * Uses the PUBLIC `getBrandOverviewData` (NOT `…Internal`): a backend HTTP
 * client cannot invoke an `internalQuery` (A1, pinned in 02.1-01-SUMMARY.md).
 */
function makeConvexFoundationsLoader(convex: ConvexHttpClient): FoundationsLoader {
  return async ({ brandId, subBrandConfigId }) => {
    if (brandId === PLACEHOLDER_BRAND_ID) return null; // → system defaults (D-08)

    // CR-01 / D-08: a transient Convex failure (network, malformed id, outage)
    // must degrade to system defaults, never abort the run. Returning null here
    // keeps the failure local to the loader; the workflow's resolve-foundation
    // step also guards the throw path as a universal safety net.
    try {
      const overview = await convex.query(api.foundations.getBrandOverviewData, {
        brandId: brandId as Id<'brands'>,
      });
      if (!overview) return null; // → system defaults (D-08)

      let base: Record<string, unknown> = overview as Record<string, unknown>;
      if (subBrandConfigId) {
        const sub = await convex.query(api.subBrandConfigs.getById, {
          id: subBrandConfigId as Id<'subBrandConfigs'>,
        });
        // D-03/D-06: merge the sub-brand's 4 accents onto the parent overview
        // BEFORE the 3-field map. `applySubBrandAccentsToFoundation` returns
        // baseData unchanged if either arg is null, so a miss "just works".
        if (sub) {
          base =
            (applySubBrandAccentsToFoundation(
              overview as Record<string, unknown>,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sub as any
            ) as Record<string, unknown> | null) ?? (overview as Record<string, unknown>);
        }
      }

      // VERBATIM brandCSSPrecompute.ts map (Pitfall 1): `.config`, NOT the record.
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
        '[experience-lab/run] foundations loader query failed — using system defaults (D-08):',
        err
      );
      return null; // → system defaults (D-08)
    }
  };
}

function toVoiceConfig(value: unknown): VoiceConfig | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as VoiceConfig;
  if (
    !raw.agentName ||
    !raw.toneProfile ||
    !raw.language ||
    !raw.communicationStyle ||
    !raw.emotionalIntelligence
  ) {
    return undefined;
  }
  return {
    agentName: raw.agentName,
    ...(raw.personality ? { personality: raw.personality } : {}),
    toneProfile: raw.toneProfile,
    language: raw.language,
    communicationStyle: raw.communicationStyle,
    emotionalIntelligence: raw.emotionalIntelligence,
    ...(raw.channelDefaults ? { channelDefaults: raw.channelDefaults } : {}),
    ...(raw.verbosity !== undefined ? { verbosity: raw.verbosity } : {}),
    isActive: raw.isActive ?? true,
    version: raw.version ?? 1,
  };
}

function toVoiceRule(value: unknown): VoiceRule | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<VoiceRule>;
  if (!raw.sectionId || !raw.title || !raw.content || !raw.isActive) return null;
  return {
    sectionId: raw.sectionId,
    title: raw.title,
    content: raw.content,
    priority: raw.priority ?? 0,
    scope: raw.scope === 'brand' ? 'brand' : 'base',
    isActive: true,
    version: raw.version ?? 1,
    ...(Array.isArray(raw.contexts)
      ? { contexts: raw.contexts.filter((context): context is string => typeof context === 'string') }
      : {}),
  };
}

function voiceVersionKey(config: VoiceConfig | undefined, rules: VoiceRule[]): string {
  const configVersion = config ? `${config.agentName}:${config.version}` : 'default-config';
  const rulesVersion = rules
    .map((rule) => `${rule.sectionId}:${rule.scope}:${rule.version}`)
    .join('|');
  return `${configVersion}:${rulesVersion}`;
}

function makeConvexVoiceAssetsLoader(convex: ConvexHttpClient): VoiceAssetsLoader {
  return async (input) => {
    const { brandId } = input;
    try {
      const systemBrand = (await convex.query(api.brands.getBySlug, {
        slug: 'oneui-system',
      })) as { _id: Id<'brands'> } | null;

      const configRaw =
        brandId !== PLACEHOLDER_BRAND_ID
          ? await convex.query(api.voiceConfigs.get, { brandId: brandId as Id<'brands'> })
          : null;

      const rulesRaw =
        brandId !== PLACEHOLDER_BRAND_ID && systemBrand
          ? await convex.query(api.voiceRules.getResolved, {
              brandId: brandId as Id<'brands'>,
              systemBrandId: systemBrand._id,
            })
          : await convex.query(api.voiceRules.getSystemBrandBaseRules, {});

      const config = toVoiceConfig(configRaw);
      const rules = (Array.isArray(rulesRaw) ? rulesRaw : [])
        .map(toVoiceRule)
        .filter((rule): rule is VoiceRule => rule !== null);

      return {
        ...(config ? { config } : {}),
        rules,
        channel: 'copy',
        versionKey: voiceVersionKey(config, rules),
      };
    } catch (err) {
      console.error(
        '[experience-lab/run] voice assets loader failed — using lab ToV defaults:',
        err
      );
      return null;
    }
  };
}

/** Request body: the prompt-card run-origin config (D-04) + INPUT-05 iterate. */
const RunRequestBody = z
  .object({
    brandId: z.string().min(1),
    artifactType: ArtifactTypeSchema,
    outputProfile: OutputProfileSchema,
    theme: z.enum(['light', 'dark', 'dim']).optional(),
    requestedComponents: z.array(z.string()).optional(),
    strictStorybook: z.boolean().optional(),
    storybookMcpUrl: z.string().min(1).optional(),
    imageGeneration: z
      .object({
        enabled: z.boolean().optional(),
        provider: z
          .enum(['auto', 'google-nano-banana', 'openai-gpt-image', 'none'])
          .optional(),
        count: z.number().optional(),
        model: z.string().optional(),
        size: z.string().optional(),
      })
      .optional(),
    /** The prompt text from the card — recorded but not consumed by the P1 mock. */
    prompt: z.string().optional(),
    /**
     * Campaign brief fields (D-04), revealed by the prompt card only for
     * social-post / instagram-carousel artifact types. Optional — the web
     * branch ignores them; the campaign planner consumes them.
     */
    audience: z.string().optional(),
    objective: z.string().optional(),
    channel: z.string().optional(),
    /** Optional sub-brand selection (D-02). Absent → parent brand only. */
    subBrandConfigId: z.string().optional(),
    /**
     * INPUT-05 iterate-on-artifact: the prior version to seed this run from. When
     * present the route re-runs the workflow from `parentIr` (patch-based re-run,
     * reusing the run→workflow seam) and links the new version's lineage to this
     * `parentVersionId`. Absent → a fresh single-shot run.
     */
    parentVersionId: z.string().optional(),
    canvasDocumentId: z.string().optional(),
    conversationThreadId: z.string().optional(),
    /**
     * The prior version's IR to seed the iterate re-run. Structured JSON, never
     * markup (IR-02). Validated as a passthrough object so the workflow's IR
     * generator re-plans from it; absent → a fresh run.
     */
    parentIr: z.unknown().optional(),
  })
  .strict();

/** Encode one NDJSON frame (one JSON object per line). */
function encodeFrame(frame: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(frame)}\n`);
}

export async function POST(request: Request): Promise<Response> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const result = RunRequestBody.safeParse(parsed);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid run request', issues: result.error.issues }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Build the run input. INPUT-05 iterate: when `parentIr` is present this run
  // is seeded from a prior version (patch-based re-run reusing the run→workflow
  // seam) and the new version's lineage links to `parentVersionId`. `parentIr`
  // is parsed as `unknown` (markup-free structured JSON) — coerce to the IR type
  // the workflow expects; the IR generator re-plans from it.
  const { parentIr, canvasDocumentId, conversationThreadId, ...rest } = result.data;
  const requestMeta: StoredRunRequestMeta = {
    ...(canvasDocumentId ? { canvasDocumentId } : {}),
    ...(conversationThreadId ? { conversationThreadId } : {}),
  };
  const input: RunExperienceInput = {
    ...rest,
    ...(parentIr ? { parentIr: parentIr as RunExperienceInput['parentIr'] } : {}),
  };

  // Build the Convex-backed foundations loader and inject it into the workflow
  // (FND-01 / FND-04). Only when Convex is configured — otherwise the resolver
  // falls back to engine system defaults (D-08). `subBrandConfigId` already
  // arrives on `input` from the parsed body and flows into RunExperienceInput.
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const foundationsLoader = convexUrl
    ? makeConvexFoundationsLoader(await createAuthedConvexClient(convexUrl))
    : undefined;
  const voiceAssetsLoader = convexUrl
    ? makeConvexVoiceAssetsLoader(await createAuthedConvexClient(convexUrl))
    : undefined;

  // Campaign-plan persister (T-04-14): a durable Convex write the campaign
  // branch calls IMMEDIATELY BEFORE it suspends, so the resume route re-hydrates
  // the plan from Convex (never process memory — Pitfall 4 / A5). The agents
  // package stays backend-free — it only sees this opaque async callback. We
  // pre-create the run row so the plan is keyed by a real `experienceRuns` id.
  // Skipped when Convex is unconfigured or the brand is the unsaved placeholder.
  const isCampaign =
    input.artifactType === 'social-post' || input.artifactType === 'instagram-carousel';
  let persistCampaignPlan:
    | ((args: { runId: string; campaignPlan: unknown }) => Promise<void>)
    | undefined;
  let preCreatedRunId: Id<'experienceRuns'> | undefined;
  // The brand's Platforms foundation — required so the campaign branch resolves
  // REAL non-web canvas dimensions (FND-02/CAMP-05) or an honest FND-03 gap.
  let brandPlatforms: RunExperienceInput['brandPlatforms'];
  if (convexUrl && input.brandId !== PLACEHOLDER_BRAND_ID) {
    const convex = await createAuthedConvexClient(convexUrl);
    try {
      if (isCampaign) {
        // Fetch the brand's Platforms foundation (D-01). A brand that has not
        // seeded the requested canvas resolves to an honest gap (D-02).
        const platformsFoundation = await convex.query(api.foundations.getByType, {
          brandId: input.brandId as Id<'brands'>,
          type: 'platforms',
        });
        const cfg = (platformsFoundation as { config?: unknown } | null)?.config;
        if (
          cfg &&
          typeof cfg === 'object' &&
          Array.isArray((cfg as { platforms?: unknown }).platforms)
        ) {
          brandPlatforms = cfg as RunExperienceInput['brandPlatforms'];
        }
      }

      preCreatedRunId = (await convex.mutation(api.experienceRuns.createRun, {
        brandId: input.brandId as Id<'brands'>,
        request: buildStoredRunRequest(input, requestMeta),
        status: 'running',
      })) as Id<'experienceRuns'>;
      const convexRunId = preCreatedRunId;
      persistCampaignPlan = isCampaign ? async ({ campaignPlan }) => {
        // Best-effort durable write — keyed by the pre-created run row id so the
        // resume route reads the EXACT same plan back by runId.
        await convex.mutation(api.experienceRuns.setCampaignPlan, {
          runId: convexRunId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          campaignPlan: campaignPlan as any,
        });
      } : undefined;
    } catch (err) {
      console.error('[experience-lab/run] durable run pre-create failed (non-fatal):', err);
    }
  }

  // Prefer Daytona for the zero-egress sandbox path, with a first-party AST
  // fallback so a preview-infra failure never leaves a valid generated UI blank.
  const previewExecutorName = EXPERIENCE_LAB_PREVIEW_EXECUTOR_NAME;
  const previewBrandCss = await loadPreviewBrandCSS(convexUrl, input.brandId, input.theme);
  const previewExecutor = createExperienceLabPreviewExecutor({
    baseUrl: new URL(request.url).origin,
    brandCss: previewBrandCss,
  });

  // Delegate to the Mastra workflow (orchestration brain). The runner owns the
  // step sequence + the gap/campaign branch; the route only forwards the event
  // stream. Conditional-spread injected deps — never pass `undefined`.
  const run = await runExperienceWorkflow({
    ...input,
    ...(foundationsLoader ? { foundationsLoader } : {}),
    ...(voiceAssetsLoader ? { voiceAssetsLoader } : {}),
    ...(persistCampaignPlan ? { persistCampaignPlan } : {}),
    ...(brandPlatforms ? { brandPlatforms } : {}),
    previewExecutor,
  });

  // Persist the completed run + the FULL VER-01 version object to Convex.
  // Best-effort — the run is already complete, so this never blocks or breaks
  // the stream below. Returns the persisted run id + the signed thumbnail URL.
  const persist = await persistRun(input, run, preCreatedRunId, requestMeta);

  // Map the result outcome onto the wire union (a 'suspended' run carries no
  // artifact, so it surfaces as 'gap' to the canvas — same as the event union).
  const wireOutcome: RunResultFrame['outcome'] = run.outcome === 'suspended' ? 'gap' : run.outcome;

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
          // Preview-INFRA failure (Plan 03): branch FIRST on `previewError` so the
          // card reads "preview failed" — generation SUCCEEDED (IR carried above),
          // only the preview/screenshot step threw. Distinct from a gap/"generation
          // refused" card (T-031-06 attribution fix). The IR/version that DID
          // generate is still persisted by `persistRun` below.
          ...(run.previewError ? { previewError: run.previewError } : {}),
          // CANVAS-06 live preview seed: the immutable separate-origin URL the
          // artifact card embeds in its sandboxed iframe (PREV-02).
          ...(run.previewState?.url ? { previewUrl: run.previewState.url } : {}),
          // Legacy sameOrigin marker is intentionally no longer forwarded. Every
          // lab artifact iframe stays strict: allow-scripts only, no same-origin.
          ...(run.previewVerification ? { previewVerification: run.previewVerification } : {}),
          ...(run.evaluation ? { evaluation: run.evaluation } : {}),
          ...(run.storybookMcpStatus ? { storybookMcpStatus: run.storybookMcpStatus } : {}),
          ...(run.storybookDocsUsed ? { storybookDocsUsed: run.storybookDocsUsed } : {}),
          // VER-01 thumbnail (signed `_storage` URL) for the card's lifecycle.
          ...(persist?.thumbnailUrl ? { thumbnailUrl: persist.thumbnailUrl } : {}),
          // CANVAS-05 variant clustering, when this was a best-of-N variant.
          ...(run.variantGroupId ? { variantGroupId: run.variantGroupId } : {}),
          // CAMP-01/CAMP-02: a suspended campaign run carries the plan on its
          // suspendPayload — surface it so the canvas renders the plan card and
          // the durable Convex run id so the client can POST to /resume.
          ...(run.suspendPayload?.reason === 'campaign-plan' && run.suspendPayload.plan
            ? { campaignPlan: run.suspendPayload.plan }
            : {}),
          ...(isCampaign && preCreatedRunId ? { campaignRunId: preCreatedRunId as unknown as string } : {}),
          // AGENT-01/03 / D-06a/d: carry the multi-agent transparency trace to the
          // canvas so the artifact card's "How this was built" disclosure can
          // surface it. Structured agent outputs only — never a secret (T-04.2-11).
          ...(run.agentTrace ? { agentTrace: run.agentTrace } : {}),
        } satisfies RunResultFrame)
      );
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      // NDJSON — one ExperienceBuilderEvent per line.
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Experience-Run-Id': run.runId,
      'X-Experience-Outcome': run.outcome,
      'X-Experience-Preview-Executor': previewExecutorName,
      // Present only when the run was durably persisted to Convex.
      ...(persist ? { 'X-Experience-Persisted-Run-Id': persist.persistedRunId } : {}),
    },
  });
}
