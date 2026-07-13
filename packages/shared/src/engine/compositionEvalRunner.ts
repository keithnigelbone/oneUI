/**
 * Composition Eval Runner — Judge prompts and scoring for composition quality.
 *
 * Generates LLM judge prompts that evaluate generated compositions against
 * expected behaviors and rubric dimensions. Mirrors voiceEvalRunner.ts pattern.
 */

import type {
  CompositionEvalScenario,
  CompositionEvalRubric,
  CompositionEvalResult,
  CompositionEvalDimensionScore,
  CompositionValidationResult,
} from './compositionTypes';
import { stripJSONFences } from './llmJSON';

// ============================================
// Rubric dimension definitions
// ============================================

const DIMENSION_DESCRIPTIONS: Record<keyof CompositionEvalRubric, string> = {
  tokenCompliance: 'All style values use var(--Token-Name). Zero hard-coded colors, px, rem.',
  attentionHierarchy: 'Maximum one high-attention CTA per screen. Visual weight pyramid maintained.',
  spacingConsistency: 'Numeric spacing tokens follow the hierarchy (5/6 sections, 4 related, 3/3-5 coupled).',
  surfaceCorrectness: 'Surface modes used correctly. Bold for heroes, default for most content.',
  componentSelection: 'Appropriate component for each task. Correct slot usage.',
  brandConsistency: 'Colors, typography, and layout match the brand vertical expectations.',
  accessibility: 'Focus order, touch targets (44px), heading hierarchy, aria labels present.',
  layoutQuality: 'Clear screen structure (header/content/action). Effective use of flex patterns.',
  visualAlignment:
    'Rendered output matches the reference screens on layout density, attention hierarchy, surface usage, typography scale, and brand feel.',
};

// ============================================
// Judge prompt builder
// ============================================

/**
 * Build a judge prompt for evaluating a generated composition.
 * The LLM judge scores each dimension 0-10 and checks expected/forbidden behaviors.
 */
export function buildCompositionJudgePrompt(
  scenario: CompositionEvalScenario,
  generatedAST: string,
  validationResult: CompositionValidationResult,
): string {
  const sections: string[] = [];

  sections.push('You are a design system quality judge evaluating a generated UI composition.');
  sections.push('Score each dimension 0-10. Be strict — only give 8+ for genuinely excellent work.');
  sections.push('');

  sections.push('## Scenario');
  sections.push(`**Title:** ${scenario.title}`);
  sections.push(`**Prompt:** ${scenario.prompt}`);
  sections.push(`**Context:** ${scenario.context}`);
  if (scenario.description) sections.push(`**Description:** ${scenario.description}`);
  sections.push('');

  sections.push('## Generated AST');
  sections.push('```json');
  sections.push(generatedAST);
  sections.push('```');
  sections.push('');

  sections.push('## Automated Validation');
  sections.push(`Score: ${validationResult.score}/100`);
  sections.push(`Errors: ${validationResult.errorCount}, Warnings: ${validationResult.warningCount}`);
  for (const check of validationResult.checks) {
    const icon = check.passed ? 'PASS' : check.severity === 'warning' ? 'WARN' : 'FAIL';
    sections.push(`- [${icon}] ${check.name}${check.details ? `: ${check.details}` : ''}`);
  }
  sections.push('');

  sections.push('## Expected Behaviors');
  for (const behavior of scenario.expectedBehaviors) {
    sections.push(`- ${behavior}`);
  }
  sections.push('');

  if (scenario.forbiddenBehaviors.length > 0) {
    sections.push('## Forbidden Behaviors (must NOT appear)');
    for (const behavior of scenario.forbiddenBehaviors) {
      sections.push(`- ${behavior}`);
    }
    sections.push('');
  }

  sections.push('## Scoring Dimensions');
  const rubricEntries = Object.entries(scenario.rubric) as Array<[keyof CompositionEvalRubric, number | undefined]>;
  const activeDimensions = rubricEntries.filter(([, weight]) => weight != null && weight > 0);

  for (const [dim, weight] of activeDimensions) {
    sections.push(`- **${dim}** (weight: ${weight}): ${DIMENSION_DESCRIPTIONS[dim]}`);
  }
  sections.push('');

  sections.push('## Response Format');
  sections.push('Respond with ONLY valid JSON in this exact format:');
  sections.push('```json');
  sections.push('{');
  sections.push('  "dimensions": [');
  for (let i = 0; i < activeDimensions.length; i++) {
    const [dim] = activeDimensions[i];
    const comma = i < activeDimensions.length - 1 ? ',' : '';
    sections.push(`    { "dimension": "${dim}", "score": <0-10>, "feedback": "<brief reasoning>" }${comma}`);
  }
  sections.push('  ],');
  sections.push('  "expectedBehaviorsMet": [<true/false for each expected behavior in order>],');
  sections.push('  "forbiddenBehaviorsViolated": [<true/false for each forbidden behavior — true means it WAS found>],');
  sections.push('  "overallNotes": "<brief overall assessment>"');
  sections.push('}');
  sections.push('```');

  return sections.join('\n');
}

// ============================================
// Scoring
// ============================================

export interface JudgeResponse {
  dimensions: Array<{ dimension: string; score: number; feedback: string }>;
  expectedBehaviorsMet: boolean[];
  forbiddenBehaviorsViolated: boolean[];
  overallNotes: string;
}

/**
 * Compute a weighted score from judge response + rubric weights.
 * Returns 0-100.
 */
export function computeCompositionWeightedScore(
  judgeResponse: JudgeResponse,
  rubric: CompositionEvalRubric,
): { score: number; dimensionScores: CompositionEvalDimensionScore[] } {
  const rubricEntries = Object.entries(rubric) as Array<[keyof CompositionEvalRubric, number | undefined]>;
  const activeDimensions = rubricEntries.filter(([, weight]) => weight != null && weight > 0);

  const totalWeight = activeDimensions.reduce((sum, [, w]) => sum + (w ?? 0), 0);
  if (totalWeight === 0) return { score: 0, dimensionScores: [] };

  let weightedSum = 0;
  const dimensionScores: CompositionEvalDimensionScore[] = [];

  for (const [dim, weight] of activeDimensions) {
    const judged = judgeResponse.dimensions.find((d) => d.dimension === dim);
    const rawScore = judged?.score ?? 0;
    const normalizedScore = (rawScore / 10) * 100; // 0-10 → 0-100
    const w = weight ?? 0;

    weightedSum += normalizedScore * w;
    dimensionScores.push({
      dimension: dim,
      score: normalizedScore,
      weight: w,
      passed: rawScore >= 6,
      feedback: judged?.feedback ?? '',
    });
  }

  // Penalty for forbidden behavior violations
  const forbiddenPenalty = judgeResponse.forbiddenBehaviorsViolated.filter(Boolean).length * 10;

  // Penalty for missing expected behaviors
  const expectedMissed = judgeResponse.expectedBehaviorsMet.filter((met) => !met).length;
  const expectedPenalty = expectedMissed * 5;

  const rawScore = weightedSum / totalWeight;
  const finalScore = Math.max(0, Math.round(rawScore - forbiddenPenalty - expectedPenalty));

  return { score: finalScore, dimensionScores };
}

/**
 * Build a complete eval result from judge response + validation.
 *
 * If `visualAlignmentScore` is provided (0–100 from the visual-verification
 * route), it is mixed into the judge response as the `visualAlignment`
 * dimension before weighted scoring. Scenarios that don't weight
 * visualAlignment in their rubric are unaffected.
 */
export function buildCompositionEvalResult(
  scenario: CompositionEvalScenario,
  generatedAST: string,
  validation: CompositionValidationResult,
  judgeResponse: JudgeResponse,
  visualAlignmentScore?: number,
): CompositionEvalResult {
  const effectiveJudge: JudgeResponse =
    typeof visualAlignmentScore === 'number'
      ? {
          ...judgeResponse,
          dimensions: [
            ...judgeResponse.dimensions.filter((d) => d.dimension !== 'visualAlignment'),
            {
              dimension: 'visualAlignment',
              // Judge scores are 0–10; visualAlignmentScore is 0–100 → divide.
              score: Math.max(0, Math.min(10, Math.round(visualAlignmentScore / 10))),
              feedback: 'Scored by the render-and-compare loop against reference screens.',
            },
          ],
        }
      : judgeResponse;

  const { score, dimensionScores } = computeCompositionWeightedScore(
    effectiveJudge,
    scenario.rubric,
  );

  return {
    scenarioId: scenario.scenarioId,
    score,
    passed: score >= 60 && validation.valid,
    generatedAST,
    validation,
    dimensionScores,
    notes: judgeResponse.overallNotes,
  };
}

// ============================================
// Critique mode (on-demand AST review)
// ============================================
//
// Critique is the user-facing counterpart to scenario-based evaluation. The
// playground "Review" button calls `/api/composition/critique` which runs
// `buildCritiquePrompt` against any composition (no scenario, no rubric) and
// surfaces a structured Keep / Fix / Quick Wins panel back to the designer.
//
// Five fixed dimensions, deliberately collapsed from the 9-dimension judge
// rubric so the on-demand review stays terse:
//
//   1. Token Coherence       — unified vs legacy tokens, no literals
//   2. Surface Correctness   — Surface used wherever non-default bg appears
//   3. Hierarchy             — typography roles, one clear hero, attention pyramid
//   4. Brand Fidelity        — vertical / personality dials respected
//   5. Composition Density   — signal-density vs whitespace right for context

export type CritiqueDimensionId =
  | 'tokenCoherence'
  | 'surfaceCorrectness'
  | 'hierarchy'
  | 'brandFidelity'
  | 'compositionDensity';

export type CritiqueFixSeverity = 'critical' | 'important' | 'nice';

export interface CritiqueDimensionScore {
  dimension: CritiqueDimensionId;
  /** 0-10 raw score from the judge. */
  score: number;
  /** One-sentence evidence pulled from the AST. */
  evidence: string;
}

export interface CritiqueKeepItem {
  title: string;
  evidence: string;
}

export interface CritiqueFixItem {
  severity: CritiqueFixSeverity;
  issue: string;
  suggestion: string;
  /** Best-effort path / id pointing at the offending node. */
  location?: string;
}

export interface CritiqueQuickWin {
  change: string;
  where: string;
  estMinutes: number;
}

export interface CritiqueResponse {
  dimensions: CritiqueDimensionScore[];
  keep: CritiqueKeepItem[];
  fix: CritiqueFixItem[];
  quickWins: CritiqueQuickWin[];
  /** Two-sentence overall assessment. */
  summary: string;
}

const CRITIQUE_DIMENSIONS: Array<{ id: CritiqueDimensionId; label: string; rubric: string }> = [
  {
    id: 'tokenCoherence',
    label: 'Token Coherence',
    rubric:
      'Unified role-explicit tokens (--Primary-Bold, --Body-M-FontSize). No legacy aliases (--Surface-Bold, --Typography-Size-M), no hard-coded hex / px.',
  },
  {
    id: 'surfaceCorrectness',
    label: 'Surface Correctness',
    rubric:
      '<Surface mode="..."> wraps any non-default background. data-surface attribute correctly remaps tokens. No raw style={{ background }} on containers. No decorative strokes inside tinted surfaces.',
  },
  {
    id: 'hierarchy',
    label: 'Hierarchy',
    rubric:
      'Typography roles applied correctly (Display/Headline for heroes, Body for content, Label for UI). One clear hero per region. Attention pyramid (5 high / 10 medium / 25 low / 60 none) honoured for action-first screens.',
  },
  {
    id: 'brandFidelity',
    label: 'Brand Fidelity',
    rubric:
      'Brand vertical conventions respected. Layout personality dials (density, expressiveness) reflected. No off-brand aesthetics (purple-tech gradients, GitHub dark, generic Inter Display when brand has custom font).',
  },
  {
    id: 'compositionDensity',
    label: 'Composition Density',
    rubric:
      'Signal-density appropriate for context. Marketing/heroes lean spacious; dashboards/data screens lean dense (≥3 differentiation points per region). Decorative icons NOT used to fake density.',
  },
];

/**
 * Build a self-contained critique prompt. Unlike `buildCompositionJudgePrompt`,
 * this does not require a scenario — it produces a structured Keep / Fix /
 * Quick Wins review of the supplied AST against a fixed 5-dimension rubric.
 *
 * The prompt is deliberately strict: instructs the judge to ground every
 * fix in a concrete AST node path so the UI can offer "jump to" affordances
 * later without parsing free text.
 */
export function buildCritiquePrompt(args: {
  /** AST shape — provide this OR `generatedCode`. */
  generatedAST?: string;
  /** TSX shape — provide this OR `generatedAST`. When set, the judge is
   *  instructed to reference JSX element names + line numbers instead
   *  of AST node paths. */
  generatedCode?: string;
  context: string;
  validation: CompositionValidationResult;
  /** Optional brand summary so the judge can score brand fidelity better. */
  brandSummary?: string;
  /** Optional original user prompt — helps judge "did this satisfy the ask". */
  userPrompt?: string;
}): string {
  const { generatedAST, generatedCode, context, validation, brandSummary, userPrompt } = args;
  const isCode = Boolean(generatedCode);
  const lines: string[] = [];

  lines.push(
    'You are a senior design-system reviewer giving a focused critique of a generated UI composition.',
    isCode
      ? 'Be strict and specific — prefer pointing at concrete JSX elements (component name + line number) over generic praise.'
      : 'Be strict and specific — prefer pointing at concrete AST nodes over generic praise.',
    '',
  );

  if (userPrompt) {
    lines.push('## Original brief');
    lines.push(userPrompt.trim());
    lines.push('');
  }

  lines.push('## Composition context');
  lines.push(`Surface: ${context}`);
  if (brandSummary) lines.push(brandSummary.trim());
  lines.push('');

  if (isCode) {
    lines.push('## Generated TSX');
    lines.push('```tsx');
    lines.push(generatedCode ?? '');
    lines.push('```');
  } else {
    lines.push('## Generated AST');
    lines.push('```json');
    lines.push(generatedAST ?? '');
    lines.push('```');
  }
  lines.push('');

  lines.push('## Automated validator output (already run, do not re-derive)');
  lines.push(`Score: ${validation.score}/100  ·  Errors: ${validation.errorCount}  ·  Warnings: ${validation.warningCount}`);
  for (const check of validation.checks) {
    if (check.passed) continue;
    const tag = check.severity === 'error' ? 'FAIL' : check.severity === 'warning' ? 'WARN' : 'INFO';
    lines.push(`- [${tag}] ${check.name}${check.details ? ` — ${check.details}` : ''}`);
  }
  lines.push('');

  lines.push('## Five-dimension rubric');
  for (const dim of CRITIQUE_DIMENSIONS) {
    lines.push(`- **${dim.id}** (${dim.label}): ${dim.rubric}`);
  }
  lines.push('');

  lines.push('## Output rules');
  lines.push('- Score each dimension 0–10. Be honest — anything ≥8 must reflect genuinely excellent work.');
  lines.push('- "keep": 1–4 items the composition does *well*, each with one-sentence evidence pointing at an AST node.');
  lines.push('- "fix": ordered list of issues. Severity = "critical" (breaks correctness or accessibility), "important" (significantly off the rubric), or "nice" (minor polish). Include a node path or id in `location` when possible.');
  lines.push('- "quickWins": exactly 1–3 items the designer can apply in under 5 minutes each. `where` should reference an AST node or section.');
  lines.push('- Empty arrays are valid where there is nothing to say.');
  lines.push('- "summary": 2 sentences max — one assessment, one direction.');
  lines.push('');

  lines.push('## Response format');
  lines.push('Respond with ONLY a single JSON object — no markdown fence, no commentary.');
  lines.push('```');
  lines.push('{');
  lines.push('  "dimensions": [');
  for (let i = 0; i < CRITIQUE_DIMENSIONS.length; i++) {
    const last = i === CRITIQUE_DIMENSIONS.length - 1 ? '' : ',';
    lines.push(`    { "dimension": "${CRITIQUE_DIMENSIONS[i].id}", "score": <0-10>, "evidence": "<one sentence>" }${last}`);
  }
  lines.push('  ],');
  lines.push('  "keep": [{ "title": "<short>", "evidence": "<one sentence>" }],');
  lines.push('  "fix": [{ "severity": "critical|important|nice", "issue": "<short>", "suggestion": "<short>", "location": "<node path or id>" }],');
  lines.push('  "quickWins": [{ "change": "<short>", "where": "<node>", "estMinutes": <1-5> }],');
  lines.push('  "summary": "<2 sentences>"');
  lines.push('}');
  lines.push('```');

  return lines.join('\n');
}

/**
 * Parse a raw judge response into a CritiqueResponse. Tolerant to markdown
 * fences and minor formatting drift; throws on hard JSON failure so the
 * caller can surface a useful error to the playground.
 */
export function parseCritiqueResponse(raw: string): CritiqueResponse {
  const parsed: unknown = JSON.parse(stripJSONFences(raw));
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Critique response is not a JSON object');
  }
  const obj = parsed as Record<string, unknown>;

  const dims = Array.isArray(obj.dimensions) ? obj.dimensions : [];
  const dimensions: CritiqueDimensionScore[] = dims
    .filter((d): d is Record<string, unknown> => !!d && typeof d === 'object')
    .map((d) => ({
      dimension: String(d.dimension ?? '') as CritiqueDimensionId,
      score: typeof d.score === 'number' ? Math.max(0, Math.min(10, d.score)) : 0,
      evidence: typeof d.evidence === 'string' ? d.evidence : '',
    }))
    .filter((d) => CRITIQUE_DIMENSIONS.some((cd) => cd.id === d.dimension));

  const keep: CritiqueKeepItem[] = (Array.isArray(obj.keep) ? obj.keep : [])
    .filter((k): k is Record<string, unknown> => !!k && typeof k === 'object')
    .map((k) => ({
      title: typeof k.title === 'string' ? k.title : '',
      evidence: typeof k.evidence === 'string' ? k.evidence : '',
    }))
    .filter((k) => k.title.length > 0);

  const fix: CritiqueFixItem[] = (Array.isArray(obj.fix) ? obj.fix : [])
    .filter((f): f is Record<string, unknown> => !!f && typeof f === 'object')
    .map((f) => {
      const sev = String(f.severity ?? 'nice').toLowerCase();
      const severity: CritiqueFixSeverity =
        sev === 'critical' ? 'critical' : sev === 'important' ? 'important' : 'nice';
      return {
        severity,
        issue: typeof f.issue === 'string' ? f.issue : '',
        suggestion: typeof f.suggestion === 'string' ? f.suggestion : '',
        location: typeof f.location === 'string' && f.location.length > 0 ? f.location : undefined,
      };
    })
    .filter((f) => f.issue.length > 0);

  const quickWins: CritiqueQuickWin[] = (Array.isArray(obj.quickWins) ? obj.quickWins : [])
    .filter((q): q is Record<string, unknown> => !!q && typeof q === 'object')
    .slice(0, 3)
    .map((q) => ({
      change: typeof q.change === 'string' ? q.change : '',
      where: typeof q.where === 'string' ? q.where : '',
      estMinutes: typeof q.estMinutes === 'number' ? Math.max(1, Math.min(60, q.estMinutes)) : 5,
    }))
    .filter((q) => q.change.length > 0);

  const summary = typeof obj.summary === 'string' ? obj.summary : '';

  return { dimensions, keep, fix, quickWins, summary };
}

/** Public registry so the UI can render dimension labels without re-defining them. */
export const CRITIQUE_DIMENSION_LABELS: Record<CritiqueDimensionId, string> = Object.fromEntries(
  CRITIQUE_DIMENSIONS.map((d) => [d.id, d.label]),
) as Record<CritiqueDimensionId, string>;
