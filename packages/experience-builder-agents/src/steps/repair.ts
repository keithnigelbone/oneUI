/**
 * steps/repair.ts — EVAL-02 / D-09 / D-11: the IR-patch repair step.
 *
 * Repair patches the IR through the FROZEN `applyPatch` contract from
 * `@oneui/experience-builder-core` (never JSX, never a whole-IR regen, D-09).
 * It emits a TARGETED `IrPatch` (add/remove/replace ops on failing node paths)
 * via the single `callModel` seam, applies it to produce a NEW IR (pure), and
 * exposes convergence signals (`sameValidationError`, `attempt`) the bounded
 * loop's termination predicate reads (D-10).
 *
 * GAP SHORT-CIRCUIT (D-11): a missing component/foundation is unsatisfiable by
 * repair — patching can't conjure a registry member. So when the current
 * failure is a component/foundation gap, the step sets `ctx.halted`, emits a
 * `gap` event, and makes ZERO model/patch attempts (mirrors `generateStep`'s
 * gap branch).
 *
 * ORCH-04: this step imports NO `ai`/`@ai-sdk/*`; the patch is produced through
 * `callModel`. All branching/sequencing lives here, never in a model callback.
 */

import { z } from 'zod';
import { createStep } from '@mastra/core/workflows';
import {
  applyPatch,
  type IrPatch,
  type JioExperienceIRT,
  type JioValidationResultT,
} from '@oneui/experience-builder-core';
import { callModel } from '../modelAdapter';
import { ctxSchema, emit, now, type RunContext } from '../runContext';

/**
 * The model-emitted patch-op schema. Anthropic-safe gotcha rules (same as
 * `irGenerator.ts` `SectionFillSchema`): `op` is a plain enum, `path` a plain
 * string, `value` an arbitrary JSON bag via `z.object({}).catchall(...)` (NEVER
 * a keyed record). No integer/range constraints anywhere. The structural gate
 * is `applyPatch` + the downstream re-validate, not this schema.
 */
const RepairPatchSchema = z.object({
  ops: z.array(
    z.object({
      op: z.enum(['add', 'remove', 'replace']),
      path: z.string(),
      // Arbitrary JSON value for add/replace; absent/ignored for remove.
      value: z.object({}).catchall(z.unknown()).optional(),
    }),
  ),
});

/** The blocking-violation code set for a validation result (order-independent). */
function blockingCodeSet(validation: JioValidationResultT | undefined): string[] {
  if (!validation) return [];
  return [...new Set(validation.blocking.map((v) => v.code))].sort();
}

/** True iff two code sets are equal (D-10 sameValidationError). */
function sameCodeSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((code, i) => code === b[i]);
}

/**
 * Detect an unsatisfiable component/foundation gap on the current failure
 * (D-11). A gap means a missing registry component or uncovered foundation —
 * patching the IR cannot create one, so repair must NOT loop on it.
 */
function isUnsatisfiableGap(ctx: RunContext): boolean {
  const v = ctx.validation;
  if (!v) return false;
  return v.componentGaps.length > 0 || v.foundationGaps.length > 0;
}

export const repairStep = createStep({
  id: 'repair',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData as { ctx: RunContext };
    if (ctx.halted || !ctx.ir) return { ctx };

    // Nothing to repair — the artifact already passed. The loop predicate stops
    // it; this guard keeps the step idempotent if invoked on a passing artifact.
    if (ctx.composite !== undefined && ctx.threshold !== undefined && ctx.composite >= ctx.threshold) {
      return { ctx };
    }

    emit(ctx, { type: 'step', runId: ctx.runId, step: 'repair', status: 'started', at: now() });

    // GAP SHORT-CIRCUIT (D-11): an unsatisfiable component/foundation gap halts
    // with a gap event and ZERO attempts — never loop on it.
    if (isUnsatisfiableGap(ctx)) {
      const v = ctx.validation!;
      emit(ctx, {
        type: 'gap',
        runId: ctx.runId,
        ...(v.componentGaps[0]
          ? {
              componentGap: {
                componentType: v.componentGaps[0].componentType,
                reason: v.componentGaps[0].reason,
              },
            }
          : {}),
        at: now(),
      });
      emit(ctx, { type: 'step', runId: ctx.runId, step: 'repair', status: 'completed', at: now() });
      ctx.outcome = 'gap';
      ctx.halted = true;
      return { ctx };
    }

    // Record the pre-repair blocking set so we can detect convergence (D-10).
    const priorBlocking = blockingCodeSet(ctx.validation);

    // Build the repair prompt (mirrors composition/repair/route.ts): the failing
    // IR + the validator's blocking violations + repairSuggestions as feedback.
    // The model returns a TARGETED IrPatch (add/remove/replace), never JSX.
    const failingIr = ctx.ir;
    const blockingFeedback = (ctx.validation?.blocking ?? [])
      .map((b) => `- [${b.code}] ${b.message}${b.nodeId ? ` (node ${b.nodeId})` : ''}`)
      .join('\n');
    const suggestions = (ctx.validation?.repairSuggestions ?? []).map((s) => `- ${s}`).join('\n');

    const { ops } = await callModel({
      schema: RepairPatchSchema,
      system: [
        'You repair a Jio Experience IR by emitting a MINIMAL JSON-Patch (RFC-6902',
        'style) of add/remove/replace operations targeting ONLY the failing nodes.',
        'Each path is a JSON Pointer into the IR (e.g. "/sections/0/instances/2/props/appearance").',
        'NEVER rewrite the whole IR; NEVER emit JSX or markup. Return only the patch ops.',
      ].join(' '),
      prompt: [
        'Failing IR:',
        JSON.stringify(failingIr),
        '',
        'Blocking violations:',
        blockingFeedback || '(none reported)',
        '',
        'Repair suggestions:',
        suggestions || '(none)',
      ].join('\n'),
    });

    // Apply the targeted patch via the FROZEN contract → a NEW IR (pure; the
    // original `failingIr` object is unchanged). D-09: IR patch, never JSX.
    //
    // DEFENSIVE APPLICATION: the repair model routinely emits an op whose path
    // does not resolve against the current IR (e.g. an out-of-range
    // `/componentInstances/66/...` index, or a prop path on a node that was
    // dropped). `applyPatch` throws `Path not found` on such an op. Applying the
    // whole patch atomically therefore let ONE bad op abort the ENTIRE run
    // (an uncaught throw out of `driveRepairLoop`) — the run died instead of
    // continuing the bounded loop. Apply ops ONE AT A TIME and skip any that
    // throw, so a malformed op degrades to a partial (or no-op) repair. If
    // nothing applies, the IR is unchanged → the re-validate step sees the same
    // blocking set → the loop's convergence/cap predicate terminates cleanly
    // with a quality gap, never a crash.
    let repaired: JioExperienceIRT = failingIr;
    let appliedOps = 0;
    for (const o of ops) {
      const singleOp: IrPatch = [
        {
          op: o.op,
          path: o.path,
          ...(o.value !== undefined ? { value: o.value as never } : {}),
        },
      ];
      try {
        repaired = applyPatch(repaired, singleOp);
        appliedOps += 1;
      } catch {
        // Unresolvable op path — skip it. A single bad op must NEVER crash the
        // whole generation run.
      }
    }
    if (appliedOps === 0) {
      // No op applied: the repair model produced an entirely unapplicable patch.
      // Leave the IR unchanged so the bounded loop converges and emits a graceful
      // quality gap rather than spinning or crashing.
      emit(ctx, {
        type: 'step',
        runId: ctx.runId,
        step: 'repair',
        status: 'completed',
        at: now(),
      });
      ctx.attempt = (ctx.attempt ?? 0) + 1;
      ctx.previousBlockingCodes = priorBlocking;
      ctx.sameValidationError = false;
      return { ctx };
    }
    ctx.ir = repaired;

    // Convergence bookkeeping for the loop (D-10/D-11).
    ctx.attempt = (ctx.attempt ?? 0) + 1;
    ctx.previousBlockingCodes = priorBlocking;
    // The post-repair blocking set is recomputed by the re-entered validate step;
    // here we compare the (yet-to-be-revalidated) prior set against itself only
    // when the loop re-validates. The workflow sets sameValidationError after
    // re-validate; we seed it false so a fresh patch isn't treated as converged.
    ctx.sameValidationError = false;

    emit(ctx, { type: 'step', runId: ctx.runId, step: 'repair', status: 'completed', at: now() });
    return { ctx };
  },
});

/**
 * Compute `sameValidationError` after a repaired IR has been re-validated. The
 * workflow loop calls this between the post-repair validate and the next
 * evaluate so the termination predicate (D-10) can stop on a repeated error.
 * Lives here (next to the convergence bookkeeping) but is invoked by the loop,
 * never by a model callback (ORCH-04).
 */
export function updateSameValidationError(ctx: RunContext): void {
  if (!ctx.previousBlockingCodes) return;
  const current = blockingCodeSet(ctx.validation);
  ctx.sameValidationError = sameCodeSet(ctx.previousBlockingCodes, current);
}
