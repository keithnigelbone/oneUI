/**
 * steps/carousel.test.ts — CAMP-03 / CAMP-04 / CAMP-05 / D-07 / D-09 / Pitfall 3.
 *
 * The carousel driver (`runCarousel`) drives N ORDERED frames through the
 * existing per-frame quality loop after a direction is picked. Each frame:
 *   - shares one `variantGroupId` and carries a distinct sequential `orderIndex`
 *     (D-07 — order is meaningful, unlike interchangeable variants);
 *   - requests its own headline/body/CTA + caption copy via the ToV adapter seam
 *     (CAMP-03 — one ToV call per frame);
 *   - runs generate→compile→validate→evaluate→bounded-repair at best-of-N=1
 *     (no ranking, order preserved).
 *
 * A carousel-level SHARED budget accumulator (Pitfall 3 / D-09) caps total
 * repair attempts across ALL frames — NOT a fresh per-frame N=3. When the shared
 * budget is exhausted, remaining frames surface repair-exhausted/not-generated
 * rather than each getting their own cap.
 *
 * A foundation gap for the canvas short-circuits to ZERO frames (CAMP-05).
 *
 * These tests inject a deterministic per-frame pipeline + a mock ToV seam so the
 * driver's ORDERING + SHARED-BUDGET logic is exercised credential-free, with NO
 * `ANTHROPIC_API_KEY` and no live model.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  runCarousel,
  type FramePipelineResult,
  type FrameCopyRequest,
} from './carousel';
import type { CreativeDirectionT } from '@oneui/experience-builder-core';

const DIRECTION: CreativeDirectionT = {
  name: 'Bold Hook',
  concept: 'A punchy hook-led carousel.',
  copyAngle: 'Punchy.',
  leadRole: 'primary',
  surfaceMood: 'bold',
  layoutMotif: 'centered-hero-stack',
};

/** A trivially-resolved foundation: covered, with dimensions. */
const COVERED_RESOLVE = {
  ok: true as const,
  resolvedDimensions: { width: 1080, height: 1080, units: 'px' as const },
};

/** A foundation gap (no dimensions) — CAMP-05 short-circuit. */
const GAP_RESOLVE = { ok: false as const, reason: 'No canvas defined for this brand.' };

/** A minimal frame copy spec the ToV seam returns. */
const COPY = { headline: 'Unlimited', body: 'No caps.', cta: 'Sign up', caption: 'Get it now.' };

describe('runCarousel — ordered frames sharing a group (D-07 / CAMP-04)', () => {
  it('produces N frame results with the SAME variantGroupId and sequential orderIndex 0..N-1', async () => {
    const runFramePipeline = vi.fn(
      async ({ orderIndex }: { orderIndex: number }): Promise<FramePipelineResult> => ({
        orderIndex,
        outcome: 'artifact',
        validationPassed: true,
        repairAttemptsUsed: 0,
      }),
    );
    const requestFrameCopy = vi.fn(async () => COPY);

    const result = await runCarousel({
      frameCount: 5,
      direction: DIRECTION,
      resolveCanvas: () => COVERED_RESOLVE,
      requestFrameCopy,
      runFramePipeline,
    });

    expect(result.frames).toHaveLength(5);
    // Same group id across all frames.
    const groupIds = new Set(result.frames.map((f) => f.variantGroupId));
    expect(groupIds.size).toBe(1);
    // Sequential 0-based order index (chosen convention).
    expect(result.frames.map((f) => f.orderIndex)).toEqual([0, 1, 2, 3, 4]);
    // The per-frame pipeline ran once per frame (best-of-N=1, order preserved).
    expect(runFramePipeline).toHaveBeenCalledTimes(5);
  });

  it('preserves order and does NOT rank frames (best-of-N=1)', async () => {
    // Even when later frames "score higher", the order is the generation order.
    const runFramePipeline = vi.fn(
      async ({ orderIndex }: { orderIndex: number }): Promise<FramePipelineResult> => ({
        orderIndex,
        outcome: 'artifact',
        validationPassed: true,
        repairAttemptsUsed: 0,
        composite: orderIndex, // ascending — a ranker would re-order these.
      }),
    );

    const result = await runCarousel({
      frameCount: 3,
      direction: DIRECTION,
      resolveCanvas: () => COVERED_RESOLVE,
      requestFrameCopy: async () => COPY,
      runFramePipeline,
    });

    expect(result.frames.map((f) => f.orderIndex)).toEqual([0, 1, 2]);
  });
});

describe('runCarousel — per-frame ToV copy (CAMP-03)', () => {
  it('requests headline/body/CTA + caption via the ToV seam exactly once per frame', async () => {
    const requestFrameCopy = vi.fn(async (_req: FrameCopyRequest) => COPY);

    await runCarousel({
      frameCount: 4,
      direction: DIRECTION,
      resolveCanvas: () => COVERED_RESOLVE,
      requestFrameCopy,
      runFramePipeline: async ({ orderIndex }) => ({
        orderIndex,
        outcome: 'artifact',
        validationPassed: true,
        repairAttemptsUsed: 0,
      }),
    });

    expect(requestFrameCopy).toHaveBeenCalledTimes(4);
    // The copy request carries the direction's copy angle (CAMP-03 — tone fed to ToV).
    expect(requestFrameCopy.mock.calls[0]?.[0]).toMatchObject({ copyAngle: 'Punchy.' });
  });
});

describe('runCarousel — shared repair budget halts the carousel (Pitfall 3 / D-09)', () => {
  it('caps TOTAL repair attempts below the sum of per-frame caps and surfaces remaining frames as repair-exhausted', async () => {
    // Carousel cap = 4 total repair attempts. Each frame "needs" 2 attempts.
    // Frame 0: uses 2 (budget 4→2). Frame 1: uses 2 (budget 2→0). Frame 2+:
    // no budget left → repair-exhausted WITHOUT a fresh N=3.
    const runFramePipeline = vi.fn(
      async ({
        orderIndex,
        repairBudgetRemaining,
      }: {
        orderIndex: number;
        repairBudgetRemaining: number;
      }): Promise<FramePipelineResult> => {
        const needed = 2;
        const used = Math.min(needed, repairBudgetRemaining);
        const passed = used >= needed; // only "passes" if it got all the repairs it needed
        return {
          orderIndex,
          outcome: passed ? 'artifact' : 'repair-exhausted',
          validationPassed: passed,
          repairAttemptsUsed: used,
        };
      },
    );

    const result = await runCarousel({
      frameCount: 5,
      direction: DIRECTION,
      resolveCanvas: () => COVERED_RESOLVE,
      requestFrameCopy: async () => COPY,
      runFramePipeline,
      repairBudget: 4,
    });

    // The accumulator never exceeds the carousel cap.
    expect(result.totalRepairAttemptsUsed).toBeLessThanOrEqual(4);
    // ...and is strictly below the sum of per-frame caps (5 frames × N=3 = 15).
    expect(result.totalRepairAttemptsUsed).toBeLessThan(5 * 3);
    // First two frames converged; the rest surface repair-exhausted (budget spent).
    const exhausted = result.frames.filter((f) => f.outcome === 'repair-exhausted');
    expect(exhausted.length).toBeGreaterThan(0);
    // A spent-budget frame did NOT get a fresh N=3 — it used 0 (or partial) repairs.
    const lastFrame = result.frames[result.frames.length - 1];
    expect(lastFrame?.repairAttemptsUsed).toBe(0);
  });

  it('once the shared budget is exhausted, later frames are NOT given fresh repair attempts', async () => {
    const seenBudgets: number[] = [];
    const runFramePipeline = vi.fn(
      async ({
        orderIndex,
        repairBudgetRemaining,
      }: {
        orderIndex: number;
        repairBudgetRemaining: number;
      }): Promise<FramePipelineResult> => {
        seenBudgets.push(repairBudgetRemaining);
        // Each frame consumes its entire remaining budget but never converges.
        const used = repairBudgetRemaining;
        return {
          orderIndex,
          outcome: 'repair-exhausted',
          validationPassed: false,
          repairAttemptsUsed: used,
        };
      },
    );

    const result = await runCarousel({
      frameCount: 4,
      direction: DIRECTION,
      resolveCanvas: () => COVERED_RESOLVE,
      requestFrameCopy: async () => COPY,
      runFramePipeline,
      repairBudget: 3,
    });

    // The first frame saw the full budget; the rest saw 0 (it was spent).
    expect(seenBudgets[0]).toBe(3);
    expect(seenBudgets.slice(1)).toEqual([0, 0, 0]);
    expect(result.totalRepairAttemptsUsed).toBe(3);
  });
});

describe('runCarousel — foundation gap short-circuit (CAMP-05)', () => {
  it('produces ZERO frames when the canvas resolves to a gap (no invented dimensions)', async () => {
    const runFramePipeline = vi.fn();
    const requestFrameCopy = vi.fn();

    const result = await runCarousel({
      frameCount: 5,
      direction: DIRECTION,
      resolveCanvas: () => GAP_RESOLVE,
      requestFrameCopy,
      runFramePipeline,
    });

    expect(result.frames).toHaveLength(0);
    expect(result.gap).toBeDefined();
    // No copy requested + no pipeline run on a gap (no fabricated canvas).
    expect(runFramePipeline).not.toHaveBeenCalled();
    expect(requestFrameCopy).not.toHaveBeenCalled();
  });
});

describe('runCarousel — sibling isolation (D-09)', () => {
  it('a repair-exhausted frame does not change a sibling frame mapping', async () => {
    const runFramePipeline = vi.fn(
      async ({ orderIndex }: { orderIndex: number }): Promise<FramePipelineResult> => {
        // Frame 1 fails; the others pass.
        const failed = orderIndex === 1;
        return {
          orderIndex,
          outcome: failed ? 'repair-exhausted' : 'artifact',
          validationPassed: !failed,
          repairAttemptsUsed: failed ? 3 : 0,
        };
      },
    );

    const result = await runCarousel({
      frameCount: 3,
      direction: DIRECTION,
      resolveCanvas: () => COVERED_RESOLVE,
      requestFrameCopy: async () => COPY,
      runFramePipeline,
      repairBudget: 10,
    });

    expect(result.frames).toHaveLength(3);
    expect(result.frames[0]?.outcome).toBe('artifact');
    expect(result.frames[1]?.outcome).toBe('repair-exhausted');
    expect(result.frames[2]?.outcome).toBe('artifact');
  });
});
