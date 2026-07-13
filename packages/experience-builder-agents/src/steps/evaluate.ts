/**
 * steps/evaluate.ts — EVAL-01 / D-06 / D-07: the two-track Visual Evaluator step.
 *
 * Mirrors `validateStep`'s `createStep` + `ctxSchema` + halted-guard + emit
 * convention. The evaluate step scores the candidate artifact on two tracks:
 *
 *   OBJECTIVE track (deterministic, NO model call — D-06 short-circuit):
 *     when `ctx.validation` exists and `!passed` (blocking violations), the
 *     objective track alone fails the artifact. The composite is pinned below
 *     threshold and `callModel` is NEVER invoked — the loop routes straight to
 *     repair. This is the cheap, deterministic gate.
 *
 *   SUBJECTIVE track (multimodal rubric judge — routed ONLY via callModel,
 *   ORCH-04): when validation passes, the preview screenshot is scored 0–5 on
 *     expanded composition/theme/preview/agent-UX criteria by the vision judge.
 *     Scores are clamped after parse; the config-tunable weighted `composite()`
 *     is the pass metric.
 *
 * ORCH-04: this step imports NO `ai`/`@ai-sdk/*` — the vision call goes through
 * the single `callModel` seam. All branching lives here, never in a callback.
 */

import { createStep } from '@mastra/core/workflows';
import { callModel } from '../modelAdapter';
import {
  VisualRubric,
  EVALUATOR_CONFIG,
  composite as computeComposite,
  clampRubric,
} from '../evaluatorRubric';
import { ctxSchema, emit, now, type RunContext } from '../runContext';

/**
 * The analytic vision-judge system prompt. Bias mitigation (RESEARCH): state the
 * 0–5 range and per-criterion meaning so the judge scores analytically rather
 * than holistically.
 */
const JUDGE_SYSTEM_PROMPT = [
  'You are a Jio Design System visual evaluator. Score the rendered artifact',
  'screenshot on analytic criteria, each on an integer scale from 0 to 5',
  '(0 = unacceptable, 5 = excellent):',
  '- themeCompliance: do OneUI theme tokens resolve and respect the requested theme?',
  '- layoutGrid: does the artifact use real grid/section structure rather than a flat stack?',
  '- spacingRhythm: is section and component spacing consistent and on-system?',
  '- visualHierarchy: is message priority legible?',
  '- componentCorrectness: are the OneUI components appropriate and correctly composed?',
  '- pageComposition: does the full page flow match a coherent page recipe?',
  '- previewExperience: is the generated preview inspectable and polished?',
  '- agentUX: would the Lab state/critique/action surface make the run understandable?',
  '- hierarchy: is the message priority and visual hierarchy legible?',
  '- spacing: is the spacing rhythm consistent and on-system?',
  '- density: is the information density appropriate for the output profile?',
  '- brandFit: does it read as the intended Jio brand?',
  'Score each criterion independently. Provide a brief markup-free justification',
  'in `notes`. Return ONLY the structured rubric.',
].join(' ');

/**
 * Pin the composite below threshold and record an objective-fail evaluation
 * WITHOUT any model call (D-06). Shared by the explicit objective-fail branch.
 */
function recordObjectiveFail(ctx: RunContext): void {
  const composite = computeComposite(null, false);
  ctx.evaluation = { composite, objectivePass: false };
  ctx.composite = composite;
  ctx.threshold = EVALUATOR_CONFIG.threshold;
  ctx.epsilon = EVALUATOR_CONFIG.epsilon;
}

export const evaluateStep = createStep({
  id: 'evaluate',
  inputSchema: ctxSchema,
  outputSchema: ctxSchema,
  execute: async ({ inputData }) => {
    const { ctx } = inputData as { ctx: RunContext };
    if (ctx.halted || !ctx.ir) return { ctx };

    emit(ctx, { type: 'step', runId: ctx.runId, step: 'evaluate', status: 'started', at: now() });

    // Carry the convergence-policy constants onto the context (the loop reads them).
    ctx.threshold = EVALUATOR_CONFIG.threshold;
    ctx.epsilon = EVALUATOR_CONFIG.epsilon;
    // Retain the prior composite so the loop can compute scoreDelta (D-10).
    ctx.previousComposite = ctx.composite;

    // OBJECTIVE track (D-06): a blocking validation failure short-circuits with
    // NO model call. A failed render (VAL-06) is also an objective signal.
    const objectivePass = !!ctx.validation && ctx.validation.passed && ctx.rendered !== false;

    if (!objectivePass) {
      recordObjectiveFail(ctx);
      if (ctx.previousComposite !== undefined) {
        ctx.scoreDelta = Math.abs(ctx.composite! - ctx.previousComposite);
      }
      emit(ctx, {
        type: 'step',
        runId: ctx.runId,
        step: 'evaluate',
        status: 'completed',
        at: now(),
      });
      return { ctx };
    }

    // SUBJECTIVE track (D-06): the multimodal rubric judge reads the screenshot.
    const screenshots = ctx.screenshots ?? [];
    const rubric = await callModel({
      schema: VisualRubric,
      system: JUDGE_SYSTEM_PROMPT,
      prompt: `Score this rendered ${ctx.request.artifactType} artifact (profile ${ctx.request.outputProfile}).`,
      ...(screenshots.length > 0 ? { images: screenshots.map((s) => ({ png: s.png })) } : {}),
    });

    const clamped = clampRubric(rubric);
    const composite = computeComposite(clamped, true);
    ctx.evaluation = { rubric: clamped, composite, objectivePass: true };
    ctx.composite = composite;
    if (ctx.previousComposite !== undefined) {
      ctx.scoreDelta = Math.abs(composite - ctx.previousComposite);
    }

    emit(ctx, { type: 'step', runId: ctx.runId, step: 'evaluate', status: 'completed', at: now() });
    return { ctx };
  },
});
