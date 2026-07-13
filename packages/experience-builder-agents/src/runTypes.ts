/**
 * runTypes.ts
 *
 * The public run input/result types + the `FoundationsLoader` injection
 * contract. Extracted from `workflow.ts` so `runContext.ts` and the per-step
 * modules can reference them without importing `workflow.ts` (which imports the
 * steps — extracting these types breaks the cycle).
 *
 * Pure types + the opaque loader function signature only — no orchestration,
 * no `ai`/`@ai-sdk/*` (ORCH-04).
 */

import type {
  CampaignPlanT,
  CompositionSpecT,
  ExperienceBuilderEventT,
  FoundationResolveInputT,
  JioExperienceIRT,
  JioValidationResultT,
  PageCompositionT,
} from '@oneui/experience-builder-core';
import type { PlatformsFoundationConfig } from '@oneui/shared';
import type {
  PreviewExecutor,
  PreviewState,
  PreviewVerification,
} from '@oneui/experience-builder-preview';
import type { VoiceConfig, VoiceRule } from '@oneui/shared/engine';
import type { BrandFoundations } from './foundationResolver';
import type { RunEvaluation, CarouselFrameResultT } from './runContext';
import type { StorybookMcpStatus } from './storybookMcp';
import type {
  GeneratedImageAsset,
  ImageGenerationConfig,
  ResolvedImageProvider,
} from './imageGeneration';

/**
 * A durable persist callback the route injects so the agents package can write
 * the campaign plan to Convex BEFORE the workflow suspends — WITHOUT importing
 * Convex into the backend-free agents package (mirrors how `foundationsLoader`
 * is injected). The route supplies the Convex-aware implementation; the agents
 * package treats it as an opaque async function. Keyed by `runId` so the resume
 * route reads the exact same plan back (Pitfall 4 / A5 / T-04-14).
 */
export type CampaignPlanPersister = (input: {
  runId: string;
  campaignPlan: CampaignPlanT;
}) => Promise<void>;

// ---------------------------------------------------------------------------
// FoundationsLoader injection contract (D-05 isolation / FND-01 / FND-04)
// ---------------------------------------------------------------------------

/** Input to a {@link FoundationsLoader}: which brand (+ optional sub-brand) to resolve. */
export interface FoundationsLoaderInput {
  /** The brand to resolve foundations for. */
  brandId: string;
  /** Optional sub-brand config to merge over the parent brand (D-02). */
  subBrandConfigId?: string;
}

/**
 * A per-run, Convex-aware loader injected by the route (D-05). Resolves a brand
 * (and optional sub-brand) to `BrandFoundations`, or `null` when nothing
 * resolves (the resolver then falls back to engine system defaults, D-08). The
 * agents package never sees Convex credentials or shapes — only this function.
 */
export type FoundationsLoader = (input: FoundationsLoaderInput) => Promise<BrandFoundations | null>;

export interface VoiceAssets {
  config?: VoiceConfig;
  rules?: VoiceRule[];
  channel?: string;
  versionKey?: string;
}

export type VoiceAssetsLoader = (input: FoundationsLoaderInput) => Promise<VoiceAssets | null>;

export interface RunExperienceInput extends FoundationResolveInputT {
  /** Component ids to request; defaults to a registry-approved set. */
  requestedComponents?: string[];
  /** The brand's real Convex foundations (PrecomputeInput-shaped); FND-04. */
  brandFoundations?: BrandFoundations;
  /** The raw user prompt the planner/Design/ToV advisors plan from (D-01). */
  prompt?: string;
  /**
   * Optional campaign brief fields (D-04), revealed by the prompt card only for
   * `social-post` / `instagram-carousel` artifact types. They steer the campaign
   * planner; they are ignored by the web branch.
   */
  audience?: string;
  objective?: string;
  channel?: string;
  /**
   * The brand's Platforms foundation, forwarded to the non-web resolver so a
   * campaign run can resolve REAL foundation-backed canvas dimensions (FND-02 /
   * CAMP-05) or an honest FND-03 gap. Absent → non-web profiles gap (D-02).
   */
  brandPlatforms?: PlatformsFoundationConfig | null;
  /**
   * Durable campaign-plan persister injected by the route (T-04-14). When
   * present, the campaign branch calls it with `{ runId, campaignPlan }`
   * IMMEDIATELY BEFORE suspending so the resume route re-hydrates the plan from
   * Convex — never from process-memory cache (Pitfall 4 / A5).
   */
  persistCampaignPlan?: CampaignPlanPersister;
  /**
   * The HITL selection the resume route supplies to re-enter a suspended
   * campaign run: which creative direction + how many carousel frames (D-05 /
   * D-08). Branching on this lives in the workflow (ORCH-04), never a model
   * callback. Clamped at runtime (index 0..2, frameCount 1..10).
   */
  campaignSelection?: { directionIndex: number; frameCount: number };
  /**
   * Per-run, Convex-aware foundations loader injected by the route (D-05). When
   * present and `brandFoundations` is unset, `resolveStep` calls it and writes
   * the result into `brandFoundations` (FND-01/FND-04).
   */
  foundationsLoader?: FoundationsLoader;
  /**
   * Per-run, Convex-aware voice loader injected by the route. It resolves the
   * brand's ToV config + resolved modular rules and keeps Convex out of the
   * agents package. When absent/null, the voice adapter uses its lab default.
   */
  voiceAssetsLoader?: VoiceAssetsLoader;
  /** Optional sub-brand config id forwarded to the loader (D-02). */
  subBrandConfigId?: string;
  /**
   * Enforce Storybook-derived component recipes for compound components.
   * Experience Lab web UI defaults this to true; strict WebHeader/navigation
   * runs prefer live MCP docs and fall back to checked-in Storybook source when
   * the local MCP server is offline.
   */
  strictStorybook?: boolean;
  /** Optional Storybook MCP endpoint. Defaults to STORYBOOK_MCP_URL or http://localhost:6006/mcp. */
  storybookMcpUrl?: string;
  /**
   * Optional topic-image generation. The platform UI opts this in when the
   * image-source selector is enabled; direct/backend callers omit it to keep
   * runs vendor-free unless explicitly requested.
   */
  imageGeneration?: ImageGenerationConfig;
  /**
   * INPUT-05 iterate-on-artifact: the prior version's IR this run is seeded
   * from. When present, the run is a re-iteration of an existing artifact
   * (patch-based re-run) rather than a fresh generation; the planner/IR
   * generator may use it as a starting point. The new version's lineage is
   * linked to {@link parentVersionId}. Structured JSON, never markup (IR-02).
   */
  parentIr?: JioExperienceIRT;
  /**
   * INPUT-05 lineage: the version id this iterate run descends from. Persisted
   * as the new `experienceArtifactVersions.parentVersionId` so the VER-02
   * timeline chains the iteration onto its parent.
   */
  parentVersionId?: string;
  /**
   * Per-run preview executor (D-02). Injected like `foundationsLoader` — an
   * opaque interface kept off the agents package's vendor surface. Defaults to
   * `getPreviewExecutor()` when unset; tests inject a credential-free mock.
   */
  previewExecutor?: PreviewExecutor;
  /**
   * Enable the ORCH-02 human-in-the-loop checkpoint. When true AND the bounded
   * repair loop hits a non-convergence terminal (cap / sameValidationError /
   * scoreDelta<epsilon) but NOT a gap, the run SUSPENDS for a human decision
   * instead of auto-finalizing. Default false keeps the deterministic runner
   * unchanged.
   */
  hitl?: boolean;
}

export interface RunExperienceResult {
  runId: string;
  /** The ordered ExperienceBuilderEvent stream emitted by the run. */
  events: ExperienceBuilderEventT[];
  /** The valid IR, when the run produced an artifact. */
  ir?: JioExperienceIRT;
  /** The canonical component-only live-canvas spec, additive beside IR. */
  compositionSpec?: CompositionSpecT;
  /** The validation result, when validation ran. */
  validation?: JioValidationResultT;
  /**
   * The canonical compiled React + Jio CSS code string (GEN-06 / D-07), when
   * the run compiled an IR. Plan 04 persists this on `experienceArtifactVersions`.
   */
  bundle?: string;
  /** Immutable live preview state for the canvas card (PREV-02). */
  previewState?: PreviewState;
  /** Runtime preview verification for theme/token/screenshot readiness. */
  previewVerification?: PreviewVerification;
  /**
   * Set when the preview executor THREW (Daytona/preview INFRA failure) AFTER
   * generation + validation succeeded (PREV-04 / RESEARCH Pitfall 5 / T-031-06).
   * The route reads this to render a "preview failed" card instead of the
   * misleading "gap — generation refused" copy. Additive flag only — the frozen
   * `outcome` union ('artifact'|'gap'|'error'|'suspended') is unchanged.
   */
  previewError?: { message: string };
  /**
   * Per-profile preview screenshots (PREV-04). Surfaced so the run route can
   * upload the first capture to Convex `_storage` as the artifact thumbnail
   * (VER-01). PNG bytes only — no auth/session token (PREV-01).
   */
  screenshots?: Array<{ profile: string; png: Buffer }>;
  /** The evaluation surfaced by the evaluate step (EVAL-01). */
  evaluation?: RunEvaluation;
  /** Storybook MCP retrieval status for strict compound component recipes. */
  storybookMcpStatus?: StorybookMcpStatus;
  /** Storybook documentation/story sources used to lock compound recipes. */
  storybookDocsUsed?: string[];
  /** Topic images generated for this run, when image generation was enabled. */
  generatedImageAssets?: GeneratedImageAsset[];
  /**
   * The best-of-N variant group id (CANVAS-05 / D-12), present only when this
   * run was produced as part of a `runVariants` group. Persisted on the
   * artifact so siblings cluster on the canvas.
   */
  variantGroupId?: string;
  /**
   * The HITL suspend payload (ORCH-02), present only when `outcome === 'suspended'`.
   * Two suspend reasons (the union is extended ADDITIVELY):
   *   - `'non-converging-repair'` (Plan 03): carries the failing validation, last
   *     composite, and candidate IR so the route/canvas can surface the prompt.
   *   - `'campaign-plan'` (Plan 04): carries the `CampaignPlan` so the canvas can
   *     render the plan card and the user can pick a direction + frame count.
   */
  suspendPayload?: {
    runId: string;
    validation?: JioValidationResultT;
    composite?: number;
    ir?: JioExperienceIRT;
    /** Present for a campaign-plan suspend — the plan the HITL card renders. */
    plan?: CampaignPlanT;
    reason: 'non-converging-repair' | 'campaign-plan';
  };
  /**
   * The ordered carousel frames produced after a direction is picked (CAMP-04 /
   * D-07), present only for a resumed campaign run that drove the carousel.
   * Shared `variantGroupId` + sequential `orderIndex`; each frame ran the full
   * per-frame quality loop under the carousel-level shared budget. The run/resume
   * route persists each as a grouped, ordered `experienceArtifacts` row.
   */
  carouselFrames?: CarouselFrameResultT[];
  /**
   * The D-06a multi-agent transparency trace (AGENT-01). A structured,
   * human-legible record of what each agent step produced — planner output,
   * design recommendations, ToV recommendations, registry matches, the
   * validation result, the evaluation composite, and the GAP-01 backfill
   * provenance flags. Assembled by `finalizeRun` from the run context. The run
   * route persists it on `experienceArtifactVersions.agentTrace` and the canvas
   * artifact card surfaces it in the "How this was built" disclosure. STRUCTURED
   * AGENT OUTPUTS ONLY — NO auth/session/Convex token (T-04.2-11).
   */
  agentTrace?: AgentTraceT;
  /** Terminal outcome. */
  outcome: 'artifact' | 'gap' | 'error' | 'suspended';
}

/**
 * The D-06a multi-agent transparency trace (AGENT-01). Structured agent outputs
 * ONLY — markup-free strings + numbers; NO auth/session/Convex token. Every
 * field is optional so a partial run (e.g. a gap before evaluation) still
 * assembles a legible trace of what DID run.
 */
export interface AgentTraceT {
  /** Planner output: ordered section names, the message hierarchy, primary CTA. */
  planner?: {
    sections: string[];
    messageHierarchy: string[];
    primaryCTA: string;
  };
  /** First-class page/section composition recipes selected for this run. */
  compositionPlan?: PageCompositionT;
  /** Design recommendations per section (surface mode + chosen components). */
  designRecs?: Array<{ sectionId: string; surfaceMode: string; components: string[] }>;
  /** ToV recommendations per section (headline + tone score; markup-free copy). */
  toneRecs?: Array<{ sectionId: string; headline: string; toneScore: number }>;
  /** The distinct registry component ids the artifact composed. */
  registryMatches?: string[];
  /** The validation pass/block summary (the result reference, not secrets). */
  validation?: { passed: boolean; blockingCodes: string[] };
  /** Storybook recipe provenance for compound component composition. */
  storybook?: { status: StorybookMcpStatus; docsUsed: string[] };
  /** Image-generation provenance, without embedding binary/base64 asset data. */
  imageGeneration?: {
    provider?: ResolvedImageProvider;
    model?: string;
    assetCount: number;
    skippedReason?: string;
  };
  /** Deterministic CompositionSpec quality recipe/audit summary. */
  compositionQuality?: {
    passed: boolean;
    issues: string[];
    sectionCount: number;
    textNodeCount: number;
    emptySurfaceCount: number;
    maxRepeatedTextCount: number;
  };
  /** The evaluation composite (the secondary multimodal score, when it ran). */
  evaluation?: { composite: number };
  /** GAP-01 backfill provenance flags ({instanceId, propName, isContent}). */
  backfilled?: Array<{ instanceId: string; propName: string; isContent: boolean }>;
}
