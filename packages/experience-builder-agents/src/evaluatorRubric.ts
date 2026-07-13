/**
 * evaluatorRubric.ts — EVAL-01 / D-07: the Visual Evaluator's rubric + scoring config.
 *
 * Two pieces live here:
 *   1. `VisualRubric` — the Zod structured-output schema the multimodal judge
 *      fills from the preview screenshot (subjective track, D-06). It scores
 *      the expanded Lab-quality criteria 0–5 plus free-text notes.
 *   2. `EVALUATOR_CONFIG` + `composite()` — the config-tunable weighted-composite
 *      formula and the pass `threshold` / convergence `epsilon` (D-07). Every
 *      tunable is a literal constant at the top of this file so the scoring policy
 *      is auditable in one place.
 *
 * Zod-4 ↔ Anthropic structured-output gotcha (RESEARCH Pitfall 2, copied verbatim
 * from `irGenerator.ts` `SectionFillSchema`):
 *   - Scores use PLAIN `z.number()` — never an integer or range constraint. Zod
 *     4 emits JSON-schema integer/range constraints that Anthropic's structured
 *     output rejects (400). The 0–5 range is stated in the prompt AND clamped
 *     after parse (see `clampRubric`), never enforced in the schema.
 *   - Any arbitrary-key bag would use `z.object({}).catchall(...)`, never a keyed
 *     record schema (which emits `propertyNames`, also a 400).
 */

import { z } from 'zod';

/**
 * The multimodal judge's analytic rubric (subjective track, D-06). Expanded 0–5
 * scores + notes. Plain `z.number()` keeps the JSON schema Anthropic-safe; the
 * range is enforced by `clampRubric` after parse, not by the schema. The legacy
 * four fields remain required for backward-compatible mocks and persisted traces.
 */
export const VisualRubric = z.object({
  /** Theme/token compliance: does the preview resolve real OneUI theme tokens? 0–5. */
  themeCompliance: z.number(),
  /** Layout/grid: are sections arranged by a real grid/recipe, not a flat stack? 0–5. */
  layoutGrid: z.number(),
  /** Spacing rhythm: section and component rhythm are on-system. 0–5. */
  spacingRhythm: z.number(),
  /** Visual hierarchy: is the message priority legible? 0–5. */
  visualHierarchy: z.number(),
  /** Component correctness: real OneUI components used in appropriate roles. 0–5. */
  componentCorrectness: z.number(),
  /** Page composition: coherent page-level section pattern and flow. 0–5. */
  pageComposition: z.number(),
  /** Preview experience: preview card/render is inspectable and polished. 0–5. */
  previewExperience: z.number(),
  /** Agent UX: generation state/critique/actionability is clear. 0–5. */
  agentUX: z.number(),
  /** Visual hierarchy: is the message priority legible? 0–5. */
  hierarchy: z.number(),
  /** Spacing rhythm: consistent, on-system spacing? 0–5. */
  spacing: z.number(),
  /** Density: appropriate information density for the profile? 0–5. */
  density: z.number(),
  /** Brand fit: does it read as the target Jio brand? 0–5. */
  brandFit: z.number(),
  /** Free-text analytic justification (markup-free). */
  notes: z.string(),
});

export type VisualRubricT = z.infer<typeof VisualRubric>;

/** The expanded analytic rubric criteria, in composite-weight order. */
export const RUBRIC_CRITERIA = [
  'themeCompliance',
  'layoutGrid',
  'spacingRhythm',
  'visualHierarchy',
  'componentCorrectness',
  'pageComposition',
  'previewExperience',
  'agentUX',
] as const;
export type RubricCriterion = (typeof RUBRIC_CRITERIA)[number];

/** The inclusive score range each rubric criterion is clamped to after parse. */
export const SCORE_MIN = 0;
export const SCORE_MAX = 5;

/**
 * Config-tunable scoring policy (D-07 — start simple, all values are constants).
 * `weights` sum to 1 so the composite stays on the same 0–5 scale as the inputs;
 * `threshold` is the pass cutoff; `epsilon` is the no-improvement convergence
 * bound the repair loop uses (D-10).
 */
export const EVALUATOR_CONFIG = {
  weights: {
    themeCompliance: 0.15,
    layoutGrid: 0.15,
    spacingRhythm: 0.12,
    visualHierarchy: 0.14,
    componentCorrectness: 0.14,
    pageComposition: 0.14,
    previewExperience: 0.08,
    agentUX: 0.08,
  } as Record<RubricCriterion, number>,
  /**
   * composite >= threshold is the pass decision (the SECONDARY, multimodal gate).
   *
   * EMPIRICALLY TUNED to 3.2 — the single place this value lives (QUAL-05 /
   * Open Question 2). It sits in the research-recommended 3.0–3.5 calibration
   * band. The PRIMARY gate is the deterministic structural quality check
   * (flat-layout / placeholder-content / empty-section-copy in astValidator.ts):
   * those checks NEVER false-refuse a genuinely-good artifact, so they lead. D-10
   * flags a high subjective bar (the old 4.0) as repair-churn / false-refusal
   * risk; demoting the vision score to a meaningful-but-not-over-rejecting 3.2
   * backstop resolves that. Retune HERE if calibration shifts.
   */
  threshold: 3.2,
  /** scoreDelta < epsilon between attempts = converged / no-improvement (D-10). */
  epsilon: 0.1,
  /**
   * The composite written when the OBJECTIVE track fails (blocking validation
   * violations). It is below `threshold` so the loop routes to repair with NO
   * model call (D-06 short-circuit).
   */
  objectiveFailComposite: 0,
} as const;

/** Clamp a single score into [SCORE_MIN, SCORE_MAX]. */
function clampScore(n: number): number {
  if (Number.isNaN(n)) return SCORE_MIN;
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, n));
}

/**
 * Clamp every rubric criterion into the 0–5 range AFTER parse (the schema can't
 * enforce it Anthropic-safely). Returns a new rubric; `notes` passes through.
 */
export function clampRubric(rubric: VisualRubricT): VisualRubricT {
  const source = rubric as Partial<Record<string, unknown>>;
  const read = (primary: string, fallback: string, defaultValue = 0): number => {
    const value = source[primary] ?? source[fallback] ?? defaultValue;
    return typeof value === 'number' ? value : defaultValue;
  };
  const themeCompliance = clampScore(read('themeCompliance', 'brandFit'));
  const layoutGrid = clampScore(read('layoutGrid', 'hierarchy'));
  const spacingRhythm = clampScore(read('spacingRhythm', 'spacing'));
  const visualHierarchy = clampScore(read('visualHierarchy', 'hierarchy'));
  const componentCorrectness = clampScore(read('componentCorrectness', 'brandFit'));
  const pageComposition = clampScore(read('pageComposition', 'hierarchy'));
  const previewExperience = clampScore(read('previewExperience', 'density'));
  const agentUX = clampScore(read('agentUX', 'density'));

  return {
    themeCompliance,
    layoutGrid,
    spacingRhythm,
    visualHierarchy,
    componentCorrectness,
    pageComposition,
    previewExperience,
    agentUX,
    hierarchy: clampScore(read('hierarchy', 'visualHierarchy')),
    spacing: clampScore(read('spacing', 'spacingRhythm')),
    density: clampScore(read('density', 'previewExperience')),
    brandFit: clampScore(read('brandFit', 'themeCompliance')),
    notes: rubric.notes,
  };
}

/**
 * The weighted-composite formula (D-07). When `objectivePass` is false the
 * subjective rubric is irrelevant — the composite is pinned below threshold so
 * the loop routes to repair. Otherwise it is the weighted sum of the clamped
 * 0–5 criteria, staying on the 0–5 scale (weights sum to 1).
 */
export function composite(rubric: VisualRubricT | null, objectivePass: boolean): number {
  if (!objectivePass) return EVALUATOR_CONFIG.objectiveFailComposite;
  if (!rubric) return EVALUATOR_CONFIG.objectiveFailComposite;
  const clamped = clampRubric(rubric);
  let sum = 0;
  for (const criterion of RUBRIC_CRITERIA) {
    sum += clamped[criterion] * EVALUATOR_CONFIG.weights[criterion];
  }
  return sum;
}
