/**
 * steps/carousel.ts — CAMP-03 / CAMP-04 / CAMP-05 / D-07 / D-09 / Pitfall 3.
 *
 * The carousel DRIVER. After the user picks a creative direction (plan 02's
 * resume), `runCarousel` drives N ORDERED frames through the EXISTING per-frame
 * quality loop. It is the carousel analog of `runVariants` (workflow.ts) with
 * three differences (D-07 / D-09 / Pitfall 3):
 *
 *   1. ORDER IS MEANINGFUL (D-07). Frames share one `variantGroupId` (like
 *      best-of-N siblings) but carry a sequential `orderIndex` (0..N-1) and are
 *      NEVER ranked — the render order is the generation order, left-to-right.
 *
 *   2. PER-FRAME ToV COPY (CAMP-03 — DELIVERED here). Each frame requests its own
 *      headline/body/CTA + caption via the injected ToV seam (`requestFrameCopy`),
 *      steered by the chosen direction's `copyAngle`. This is the file where
 *      CAMP-03 lands: one ToV call per frame.
 *
 *   3. CAROUSEL-LEVEL SHARED REPAIR BUDGET (Pitfall 3 / D-09). A single
 *      accumulator caps TOTAL repair attempts across ALL frames — NOT a fresh
 *      per-frame N=3. Each frame is told how much budget remains; it consumes
 *      some; the accumulator decrements. When the budget is spent, remaining
 *      frames surface repair-exhausted/not-generated rather than each getting
 *      their own cap. This bounds the carousel by construction (T-04-07).
 *
 * Each frame independently runs the full generate→compile→validate→evaluate→
 * bounded-repair pipeline (D-09) so it is provably DS-compliant ON ITS OWN; a
 * frame that cannot be made compliant within the shared budget surfaces a
 * per-frame `repair-exhausted` status WITHOUT affecting its siblings.
 *
 * A foundation gap for the canvas short-circuits to ZERO frames (CAMP-05 — no
 * invented dimensions).
 *
 * DEPENDENCY INJECTION (ORCH-04, isolation): the per-frame pipeline + the ToV
 * seam + the foundation resolution are INJECTED (mirroring `foundationsLoader` /
 * `previewExecutor` / `persistCampaignPlan`). The driver owns the ORDERING + the
 * SHARED-BUDGET loop; the model/orchestration plumbing lives behind the injected
 * functions. This keeps the driver deterministic + unit-testable (no `ai`/
 * `@ai-sdk` import, no live model) and lets `workflow.ts` wire the real pipeline.
 */

import type {
  CreativeDirectionT,
  JioExperienceIRT,
  JioValidationResultT,
} from '@oneui/experience-builder-core';

/** The per-frame copy the ToV seam returns (CAMP-03). Markup-free strings. */
export interface FrameCopy {
  headline: string;
  body: string;
  cta?: string;
  /** The social caption for this frame (CAMP-03 — carousel-specific). */
  caption?: string;
}

/** Input to the injected ToV seam for one frame's copy (CAMP-03). */
export interface FrameCopyRequest {
  /** 0-based frame position (drives "Frame n of N" + tone progression). */
  orderIndex: number;
  /** Total frame count (so the ToV can pace hook→…→CTA across the carousel). */
  frameCount: number;
  /** Tone emphasis fed to the ToV agent, from the chosen direction (D-06). */
  copyAngle: string;
  /** The direction's concept, for prompt framing. */
  concept: string;
}

/** The outcome of running ONE frame through the per-frame quality loop. */
export type FrameOutcome = 'artifact' | 'repair-exhausted' | 'gap';

/** What the injected per-frame pipeline returns for one frame. */
export interface FramePipelineResult {
  /** Echo of the frame's order index (0-based). */
  orderIndex: number;
  /** Terminal per-frame outcome (D-09). */
  outcome: FrameOutcome;
  /** True iff this frame independently passed validation (DS-compliant alone). */
  validationPassed: boolean;
  /** How many repair attempts this frame actually consumed (decrements budget). */
  repairAttemptsUsed: number;
  /** The frame's IR, when it produced one. */
  ir?: JioExperienceIRT;
  /** The frame's validation result, when validation ran. */
  validation?: JioValidationResultT;
  /** The frame's evaluation composite (informational only — NEVER used to rank). */
  composite?: number;
}

/** Input to the injected per-frame pipeline (one frame). */
export interface FramePipelineInput {
  /** 0-based frame position (persisted as `orderIndex`). */
  orderIndex: number;
  /** Total frame count (for per-frame framing). */
  frameCount: number;
  /** The chosen creative direction (shared by every frame). */
  direction: CreativeDirectionT;
  /** This frame's ToV copy (CAMP-03). */
  copy: FrameCopy;
  /**
   * The SHARED repair budget remaining at the start of this frame (Pitfall 3).
   * The frame's bounded-repair loop MUST NOT consume more than this. A frame
   * given 0 budget makes ZERO repair attempts (no fresh N=3).
   */
  repairBudgetRemaining: number;
}

/** The canvas-resolution result the driver consumes (CAMP-05). */
export type CanvasResolveResult =
  | { ok: true; resolvedDimensions?: { width: number; height: number; units: 'px' | 'mm' } }
  | { ok: false; reason: string };

/** One ordered, grouped frame result the carousel produces. */
export interface CarouselFrameResult {
  /** Shared across every frame in this carousel (D-07). */
  variantGroupId: string;
  /** Sequential 0-based position; render order = ascending order index (D-07). */
  orderIndex: number;
  /** Terminal per-frame outcome (D-09 — sibling-isolated). */
  outcome: FrameOutcome;
  /** True iff this frame independently passed validation. */
  validationPassed: boolean;
  /** Repair attempts this frame consumed from the shared budget. */
  repairAttemptsUsed: number;
  /** This frame's ToV copy (CAMP-03). */
  copy: FrameCopy;
  /** The frame's IR, when it produced one. */
  ir?: JioExperienceIRT;
  /** The frame's validation result, when validation ran. */
  validation?: JioValidationResultT;
}

/** The full carousel result: ordered grouped frames + the shared-budget tally. */
export interface CarouselResult {
  /** Shared id for the whole carousel group (D-07). */
  variantGroupId: string;
  /** Ordered frames (ascending `orderIndex`); empty on a foundation gap. */
  frames: CarouselFrameResult[];
  /** Total repair attempts consumed across ALL frames (≤ the carousel cap). */
  totalRepairAttemptsUsed: number;
  /** Present iff the canvas resolved to a gap (CAMP-05 — zero frames). */
  gap?: { reason: string };
}

/** Input to `runCarousel`. */
export interface RunCarouselInput {
  /** How many ordered frames to drive (already clamped 1..10 upstream, D-08). */
  frameCount: number;
  /** The chosen creative direction (shared by every frame, D-06/D-07). */
  direction: CreativeDirectionT;
  /**
   * Resolve the carousel canvas's foundation-backed dimensions (CAMP-05). A gap
   * short-circuits to ZERO frames — no invented dimensions. Injected so the
   * driver stays decoupled from the resolver (and unit-testable).
   */
  resolveCanvas: () => CanvasResolveResult;
  /** The injected ToV seam — one call per frame (CAMP-03). */
  requestFrameCopy: (req: FrameCopyRequest) => Promise<FrameCopy>;
  /**
   * The injected per-frame quality loop (generate→compile→validate→evaluate→
   * bounded-repair). Runs once per frame at best-of-N=1; the driver bounds its
   * repair attempts via `repairBudgetRemaining` (Pitfall 3).
   */
  runFramePipeline: (input: FramePipelineInput) => Promise<FramePipelineResult>;
  /**
   * The carousel-level SHARED repair budget (total repair attempts across ALL
   * frames, Pitfall 3 / D-09 / T-04-07). Defaults to the per-frame hard cap
   * times the frame count is NOT used — the whole point is a SHARED cap that is
   * smaller than the naive sum. Defaults to `frameCount × MAX_PER_FRAME_REPAIRS`
   * only when unset, but a campaign run passes a tighter shared cap.
   */
  repairBudget?: number;
  /** Optional explicit group id (defaults to a generated one). */
  variantGroupId?: string;
}

/** The per-frame hard repair cap (D-11). Mirrors workflow.ts `MAX_REPAIR_ATTEMPTS`. */
export const MAX_PER_FRAME_REPAIRS = 3;

let _carouselGroupSeq = 0;
function nextCarouselGroupId(): string {
  _carouselGroupSeq += 1;
  return `carousel-${Date.now()}-${_carouselGroupSeq}`;
}

/**
 * Drive N ordered, grouped, individually-DS-compliant carousel frames under a
 * SHARED repair/token budget with per-frame ToV copy.
 *
 * Algorithm:
 *   1. Resolve the canvas (CAMP-05). A gap → zero frames, no copy, no pipeline.
 *   2. For each frame i in 0..N-1 (ORDER PRESERVED, no ranking — D-07):
 *      a. Request the frame's ToV copy (CAMP-03 — one call per frame).
 *      b. Run the per-frame pipeline, passing the SHARED budget remaining.
 *      c. Decrement the shared accumulator by the frame's actual repair attempts.
 *   3. The per-frame hard cap (N=3) still applies WITHIN a frame, but the
 *      carousel-level cap is the binding constraint ACROSS frames (Pitfall 3) —
 *      `min(remaining, MAX_PER_FRAME_REPAIRS)` is the budget any frame receives.
 *
 * Sibling isolation (D-09): a frame's `repair-exhausted` outcome does NOT abort
 * the loop or alter another frame's result — every frame is run and recorded
 * independently. (The shared BUDGET is global, but each frame's STATUS is its
 * own.)
 */
export async function runCarousel(input: RunCarouselInput): Promise<CarouselResult> {
  const variantGroupId = input.variantGroupId ?? nextCarouselGroupId();
  const frameCount = Math.max(1, Math.floor(input.frameCount));

  // (1) Foundation gate (CAMP-05): a gap short-circuits to ZERO frames. No copy
  // requested, no pipeline run — never fabricate a canvas.
  const resolved = input.resolveCanvas();
  if (!resolved.ok) {
    return {
      variantGroupId,
      frames: [],
      totalRepairAttemptsUsed: 0,
      gap: { reason: resolved.reason },
    };
  }

  // The shared repair budget (Pitfall 3). Default to the naive sum only when
  // unset; a real campaign run passes a tighter carousel-level cap.
  let repairBudgetRemaining =
    input.repairBudget ?? frameCount * MAX_PER_FRAME_REPAIRS;
  let totalRepairAttemptsUsed = 0;

  const frames: CarouselFrameResult[] = [];

  // (2) Ordered per-frame loop — order is meaningful, no ranking (D-07).
  for (let orderIndex = 0; orderIndex < frameCount; orderIndex++) {
    // (2a) Per-frame ToV copy (CAMP-03) — one call per frame, steered by the
    // chosen direction's copy angle + concept.
    const copy = await input.requestFrameCopy({
      orderIndex,
      frameCount,
      copyAngle: input.direction.copyAngle,
      concept: input.direction.concept,
    });

    // (2b) The per-frame budget is the SHARED remaining, capped at the per-frame
    // hard cap (N=3). A spent shared budget means 0 — NO fresh N=3 (Pitfall 3).
    const frameBudget = Math.max(0, Math.min(repairBudgetRemaining, MAX_PER_FRAME_REPAIRS));

    const frameResult = await input.runFramePipeline({
      orderIndex,
      frameCount,
      direction: input.direction,
      copy,
      repairBudgetRemaining: frameBudget,
    });

    // (2c) Decrement the shared accumulator by the frame's ACTUAL repair usage,
    // clamped so a misbehaving pipeline cannot drive the budget negative or
    // exceed the budget it was given (defence in depth — T-04-07).
    const used = Math.max(0, Math.min(frameBudget, frameResult.repairAttemptsUsed));
    repairBudgetRemaining -= used;
    totalRepairAttemptsUsed += used;

    frames.push({
      variantGroupId,
      orderIndex,
      outcome: frameResult.outcome,
      validationPassed: frameResult.validationPassed,
      repairAttemptsUsed: used,
      copy,
      ...(frameResult.ir ? { ir: frameResult.ir } : {}),
      ...(frameResult.validation ? { validation: frameResult.validation } : {}),
    });
  }

  return { variantGroupId, frames, totalRepairAttemptsUsed };
}
