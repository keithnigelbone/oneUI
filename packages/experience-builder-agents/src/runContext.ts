/**
 * runContext.ts
 *
 * The mutable run context threaded through the Mastra steps + the small shared
 * helpers (`emit`, `now`, `ctxSchema`). Extracted from `workflow.ts` so the
 * per-step modules in `steps/` can share the exact same context shape WITHOUT a
 * circular import back into `workflow.ts` (which imports the steps).
 *
 * ORCH-04: this module carries NO sequencing/branching and imports no
 * `ai`/`@ai-sdk/*` — it is the typed state container only.
 */

import { z } from 'zod';
import type {
  CampaignPlanT,
  CompositionQualityAudit,
  CompositionSpecT,
  ExperienceBuilderEventT,
  JioExperienceIRT,
  JioValidationResultT,
  PageCompositionT,
} from '@oneui/experience-builder-core';
import type { PreviewState, PreviewVerification } from '@oneui/experience-builder-preview';
import type { RunExperienceInput } from './runTypes';
import type { PlanT } from './agents/plannerAgent';
import type { DesignAdapterOutputT } from './adapters/designAdapter';
import type { VoiceAdapterOutputT } from './adapters/voiceAdapter';
import type { VisualRubricT } from './evaluatorRubric';
import type { StorybookMcpStatus, StorybookRecipeContext } from './storybookMcp';
import type {
  GeneratedImageAsset,
  ResolvedImageProvider,
} from './imageGeneration';

/** A captured preview screenshot threaded on the context (PREV-04). */
export interface RunScreenshot {
  profile: string;
  png: Buffer;
}

/** The evaluation surfaced by the evaluate step (EVAL-01). */
export interface RunEvaluation {
  /** The subjective rubric, when the vision judge ran (objective-pass path). */
  rubric?: VisualRubricT;
  /** Weighted composite score (D-07). */
  composite: number;
  /** True iff the objective (deterministic-validator) track passed. */
  objectivePass: boolean;
}

/** Mutable run context threaded through the Mastra steps. */
export interface RunContext {
  runId: string;
  request: RunExperienceInput;
  events: ExperienceBuilderEventT[];
  ir?: JioExperienceIRT;
  /** Canonical component-only spec derived from the latest IR. */
  compositionSpec?: CompositionSpecT;
  /** Deterministic recipe/audit signal for the canonical CompositionSpec. */
  compositionQuality?: CompositionQualityAudit;
  /** Storybook MCP docs/recipe provenance for strict compound components. */
  storybookMcpStatus?: StorybookMcpStatus;
  storybookDocsUsed?: string[];
  storybookRecipeContext?: StorybookRecipeContext;
  validation?: JioValidationResultT;
  /** The compiled bundle string (set by the compile step). */
  bundle?: string;
  /**
   * Advisory fragments (assembler-last, D-01). The plan/design/copy steps write
   * these; the IR Generator READS them and is the only step that commits IR.
   * None of these is IR.
   */
  plan?: PlanT;
  /** First-class composition plan selected before IR assembly. */
  compositionPlan?: PageCompositionT;
  designSpec?: DesignAdapterOutputT;
  copySpec?: VoiceAdapterOutputT;
  /** Topic imagery generated for this run and available to the IR generator. */
  generatedImageAssets?: GeneratedImageAsset[];
  /** Provider/model status for the agent trace. Does not include image bytes. */
  imageGenerationStatus?: {
    provider?: ResolvedImageProvider;
    model?: string;
    assetCount: number;
    skippedReason?: string;
  };
  /**
   * GAP-01/D-08 backfill provenance from the IR Generator: every required prop
   * the deterministic backfill filled, as `{ instanceId, propName, isContent }`.
   * Carries NO secrets (T-04.2-07). Persisted to run metadata so Plan 04's
   * quality gate can flag a backfilled CONTENT prop (which real ToV copy should
   * make rare).
   */
  backfilled?: Array<{ instanceId: string; propName: string; isContent: boolean }>;
  outcome: 'artifact' | 'gap' | 'error' | 'suspended';
  /** Set once a gap short-circuits the pipeline. */
  halted: boolean;

  // --- Preview → evaluate → bounded-repair loop state (Plan 04) -------------
  /**
   * Set when the preview executor THROWS (Daytona/preview INFRA failure) AFTER
   * generation + validation succeeded (PREV-04 / RESEARCH Pitfall 5 / T-031-06).
   * Its presence tells `finalizeRun` to skip the ir-but-no-url → 'gap' demotion
   * so the run surfaces a preview-error (not a false "generation refused" gap).
   * Additive flag only — the frozen `outcome` wire union is unchanged.
   */
  previewError?: { message: string };
  /** True iff the artifact actually rendered (VAL-06 render-success). */
  rendered?: boolean;
  /** Immutable live preview state for the canvas card (PREV-02). */
  previewState?: PreviewState;
  /** Runtime preview verification for theme/token/screenshot readiness. */
  previewVerification?: PreviewVerification;
  /** Per-profile preview screenshots for the judge (PREV-04). */
  screenshots?: RunScreenshot[];
  /** The latest evaluation (rubric + composite + objective-pass, EVAL-01). */
  evaluation?: RunEvaluation;
  /** Latest composite score (mirror of evaluation.composite for the predicate). */
  composite?: number;
  /** Pass cutoff (from EVALUATOR_CONFIG.threshold). */
  threshold?: number;
  /** No-improvement convergence bound (from EVALUATOR_CONFIG.epsilon, D-10). */
  epsilon?: number;
  /** |composite - previousComposite| between repair attempts (D-10). */
  scoreDelta?: number;
  /** Bounded-repair attempt counter (D-11 cap N=3). */
  attempt?: number;
  /** True when the post-repair blocking-error set equals the pre-repair set (D-10). */
  sameValidationError?: boolean;
  /** Previous composite, retained across attempts to compute scoreDelta. */
  previousComposite?: number;
  /** Previous blocking-error code set, retained to detect sameValidationError. */
  previousBlockingCodes?: string[];

  /**
   * Terminal QUALITY GAP (QUAL-06 / D-11). Set when the bounded repair loop
   * exhausts the N=3 cap AND the deterministic/secondary gates still fail — the
   * run reports an honest quality gap instead of freezing a low-quality artifact
   * (T-04.2-08). Carries the failing composite/threshold/attempts + the still-
   * blocking validation codes for the route/canvas to surface. NO secrets.
   */
  qualityGap?: {
    runId: string;
    reason: 'quality-gate';
    composite: number;
    threshold: number;
    attempts: number;
    blockingCodes: string[];
  };

  // --- HITL suspend/resume (ORCH-02, Task 4) --------------------------------
  /** Set when the bounded loop hits a non-convergence terminal under HITL. */
  suspended?: boolean;
  /** The payload surfaced to the HITL prompt when suspended. */
  suspendPayload?: {
    runId: string;
    validation?: JioValidationResultT;
    composite?: number;
    ir?: JioExperienceIRT;
    /** Present for a campaign-plan suspend (Plan 04) — the plan the card renders. */
    plan?: CampaignPlanT;
    reason: 'non-converging-repair' | 'campaign-plan';
  };

  // --- Campaign branch (CAMP-01/CAMP-02, Plan 04) ---------------------------
  /** The DS-grounded plan the campaign planner produced (carried to the card). */
  campaignPlan?: CampaignPlanT;
  /**
   * The HITL selection applied on resume (which direction + frame count). Set in
   * the workflow's resume branch (ORCH-04), never a model callback. Clamped.
   */
  campaignSelection?: { directionIndex: number; frameCount: number };
  /**
   * The ordered carousel frames produced after a direction is picked (Plan 03,
   * CAMP-04). Shared `variantGroupId` + sequential `orderIndex`; each frame ran
   * the full per-frame quality loop under the carousel-level shared budget.
   */
  carouselFrames?: CarouselFrameResultT[];
}

/**
 * One ordered, grouped carousel frame on the run context/result (CAMP-04 / D-07).
 * Mirrors `CarouselFrameResult` from `steps/carousel.ts` but is declared here so
 * `runContext`/`runTypes` carry it without importing the driver module.
 */
export interface CarouselFrameResultT {
  /** Shared across every frame in this carousel (D-07). */
  variantGroupId: string;
  /** Sequential 0-based position; render order = ascending order index (D-07). */
  orderIndex: number;
  /** Terminal per-frame outcome (D-09 — sibling-isolated). */
  outcome: 'artifact' | 'repair-exhausted' | 'gap';
  /** True iff this frame independently passed validation. */
  validationPassed: boolean;
  /** Repair attempts this frame consumed from the shared budget. */
  repairAttemptsUsed: number;
  /** This frame's ToV copy (CAMP-03). */
  copy: { headline: string; body: string; cta?: string; caption?: string };
  /** The frame's IR, when it produced one. */
  ir?: JioExperienceIRT;
  /** The frame's validation result, when validation ran. */
  validation?: JioValidationResultT;
}

/** The single-key context envelope every Mastra step passes through. */
export const ctxSchema = z.object({ ctx: z.custom<RunContext>() });

export function emit(ctx: RunContext, event: ExperienceBuilderEventT): void {
  ctx.events.push(event);
}

export function now(): number {
  return Date.now();
}
