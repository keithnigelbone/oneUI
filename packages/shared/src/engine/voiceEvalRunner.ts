/**
 * Voice Evaluation Runner — Pure Engine
 *
 * Framework-agnostic functions for building LLM judge prompts,
 * scoring eval results, and aggregating run statistics.
 *
 * No external dependencies. No side effects.
 * API routes and CLI scripts wrap these with actual LLM calls.
 */

import type { EvalScenario, EvalRubric, EvalScenarioResult, EvalDimensionScore, ToneGuardResult } from './voiceTypes';

// ============================================
// Judge Response Types
// ============================================

export interface JudgeDimensionResult {
  dimension: string;
  score: number; // 0-10
  passed: boolean;
  feedback: string;
}

export interface JudgeBehaviorResult {
  behavior: string;
  present: boolean;
  evidence: string;
}

export interface JudgeForbiddenResult {
  behavior: string;
  absent: boolean; // true = correctly absent
  evidence: string;
}

export interface JudgeResponse {
  dimensions: JudgeDimensionResult[];
  expectedBehaviorResults: JudgeBehaviorResult[];
  forbiddenBehaviorResults: JudgeForbiddenResult[];
  overallScore: number; // 0-100
  overallPassed: boolean;
  systemicIssues: string[];
}

// ============================================
// Run Summary
// ============================================

export interface RunSummary {
  totalScenarios: number;
  passCount: number;
  failCount: number;
  averageScore: number;
  scoreBreakdown: Record<string, number>;
  systemicIssues: string[];
}

// ============================================
// Judge Prompt Builder
// ============================================

const RUBRIC_DIMENSIONS: Array<{ key: keyof EvalRubric; label: string; description: string }> = [
  { key: 'emotionDetection', label: 'Emotion Detection', description: 'Did the response correctly identify and match the user\'s emotional state (Navarasa)? Was the right mode activated?' },
  { key: 'forbiddenWords', label: 'Forbidden Words & Phrases', description: 'Did the response avoid all forbidden words, corporate language, scripted sympathy, and call-centre closings?' },
  { key: 'formatting', label: 'Formatting & Structure', description: 'Is the response prose-only? No bullets, numbered lists, markdown headers, or bold text? Correct product name quoting?' },
  { key: 'warmth', label: 'Warmth & Loveliness', description: 'Does the response leave the person lighter? Gentle word choices ("sort out" not "resolve", "check" not "verify"). Does it end with a warm closing that lifts weight? Is the person acknowledged before advice?' },
  { key: 'forwardMomentum', label: 'Forward Momentum', description: 'Does the response solve the urgent problem first? Does it give direct guidance instead of deflecting to 198 when the answer is available? Does it present 2-3 options when relevant?' },
  { key: 'apologyCorrectness', label: 'Apology Correctness', description: 'Is there exactly 1 apology only when Jio caused the failure? Is the apology followed by a concrete action? No apology for things outside Jio\'s control?' },
  { key: 'responseLength', label: 'Response Length', description: 'Is the response appropriately concise for the channel? Does brevity sacrifice clarity or warmth?' },
  { key: 'benefitFraming', label: 'Benefit Framing', description: 'Are Jio services presented with genuine value propositions? Are options presented neutrally without steering?' },
  { key: 'ecosystemBalance', label: 'Ecosystem Balance', description: 'Does the response stay within the Jio ecosystem? No recommending competitors? Multiple Jio services mentioned when relevant?' },
  { key: 'inclusivity', label: 'Inclusivity & Sensitivity', description: 'Does the response handle sensitive topics (bereavement, financial hardship, health) with appropriate care? Does it remove fault from the user?' },
  { key: 'readability', label: 'Readability & Clarity', description: 'Is the language clear, simple, and accessible? No corporate jargon? Easy to follow?' },
];

/**
 * Build the system + user prompt for the LLM judge.
 */
export function buildJudgePrompt(
  scenario: EvalScenario,
  actualResponse: string,
  toneGuardResult: ToneGuardResult,
): { system: string; user: string } {
  const activeDimensions = RUBRIC_DIMENSIONS.filter(
    (d) => scenario.rubric[d.key] !== undefined && scenario.rubric[d.key]! > 0
  );

  const system = `You are an expert voice and tone evaluator for a customer service AI assistant (Jio, India's largest telecom). You evaluate AI responses against a reference answer and rubric criteria.

## Evaluation Rules

### Warmth & Loveliness
- The goal is not a correct answer. It is a correct answer that leaves the person a little lighter.
- Word choice matters: "sort out" not "resolve", "check" not "verify", "fix" not "rectify".
- End every resolved response with one line whose only job is to lift weight. Not information. Not a next step. Just relief or ease.
- When something went wrong and the user might feel at fault, remove it quietly: "without you realising", "this happens sometimes".

### Deflection
- Guide directly when you can. Redirect to 198 or a store only when you genuinely cannot help.
- Redirecting when the answer is available is a failure of forward momentum.
- "I would not want to guide you incorrectly" when guidance is possible is avoidance.

### Sequence
- Solve the urgent problem first. Always. The underlying problem comes second.
- In Bhayanaka moments (fear, fraud), the safety statement is the FIRST sentence.
- In fraud/security situations, block the SIM before changing passwords.

### Sympathy vs Speed
- Show care through speed and accuracy, not through sympathy statements.
- Leading with sympathy before a safety statement is always wrong.
- Banned sympathy phrases: "I understand how frustrating that must be", "I can see why that is confusing", "I understand how stressful this is."

### Apology Behaviour
- Apologise exactly once when Jio caused the failure. Not when the user caused it.
- Three-part test: (1) Is this Jio's fault? (2) Is there exactly 1 apology? (3) Is it followed by a concrete action?

### Options & Choices
- Present 2-3 genuine options when a Jio service is relevant.
- Present options neutrally. No ranking. No steering.
- Name specific plans with specific details when possible.

### Factual Accuracy
- Positioning a competitor as a better option than a Jio service is not permitted.
- Do not hedge on capabilities that are known.
- An incoming call does NOT reset inactivity on Jio prepaid plans. Only a recharge does.

### Refusals
- Every refusal must include a genuine alternative that addresses what the user actually wanted.
- "Let me know if there is anything Jio-related I can help with" is not an alternative.

### Emotional Dependency
- Do not respond to over-reliance in a way that reinforces it.
- "It is always good to have you here" and "whenever you need anything, this chat is ready" must not appear.

### Language Matching
- Match the user's language exactly. Hindi question = Hindi answer. English = English. Hinglish = Hinglish.

## Your Task

Evaluate the ACTUAL response against the REFERENCE answer across the specified dimensions. For each dimension, provide:
- A score from 0-10 (0 = completely fails, 10 = matches or exceeds reference)
- Whether it passed (score >= 7)
- Brief feedback explaining why

Also check each expected and forbidden behavior.

Respond with valid JSON only. No markdown code blocks.`;

  const toneGuardSummary = toneGuardResult.checks
    .filter((c) => !c.passed)
    .map((c) => `- ${c.name}: ${c.details || 'failed'}`)
    .join('\n');

  const user = `## Scenario
**Category:** ${scenario.category}
**Title:** ${scenario.title}
**User Message:** "${scenario.userMessage}"

## Reference Answer (Gold Standard)
${scenario.referenceAnswer || '(no reference answer provided)'}

## Actual Response (To Evaluate)
${actualResponse}

## Tone Guard Results
Score: ${toneGuardResult.score}/100
${toneGuardSummary ? `Failures:\n${toneGuardSummary}` : 'All checks passed.'}

## Dimensions to Evaluate
${activeDimensions.map((d) => `- **${d.label}** (weight: ${scenario.rubric[d.key]}/10): ${d.description}`).join('\n')}

## Expected Behaviors (must be present)
${scenario.expectedBehaviors.map((b) => `- ${b}`).join('\n')}

## Forbidden Behaviors (must be absent)
${scenario.forbiddenBehaviors.length > 0 ? scenario.forbiddenBehaviors.map((b) => `- ${b}`).join('\n') : '(none)'}

Respond with a JSON object matching this structure:
{
  "dimensions": [{ "dimension": "string", "score": 0-10, "passed": true/false, "feedback": "string" }],
  "expectedBehaviorResults": [{ "behavior": "string", "present": true/false, "evidence": "string" }],
  "forbiddenBehaviorResults": [{ "behavior": "string", "absent": true/false, "evidence": "string" }],
  "overallScore": 0-100,
  "overallPassed": true/false,
  "systemicIssues": ["string"]
}`;

  return { system, user };
}

// ============================================
// Scoring
// ============================================

/**
 * Compute weighted overall score from dimension scores and rubric weights.
 */
export function computeWeightedScore(
  dimensionScores: JudgeDimensionResult[],
  rubric: EvalRubric,
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const ds of dimensionScores) {
    const key = RUBRIC_DIMENSIONS.find((d) => d.label === ds.dimension)?.key;
    const weight = key ? (rubric[key] ?? 0) : 0;
    if (weight > 0) {
      totalWeight += weight;
      weightedSum += ds.score * weight;
    }
  }

  if (totalWeight === 0) return 0;

  // Scale from 0-10 to 0-100
  return Math.round((weightedSum / totalWeight) * 10);
}

/**
 * Build an EvalScenarioResult from the judge response.
 */
export function buildScenarioResult(
  scenario: EvalScenario,
  response: string,
  judgeResponse: JudgeResponse,
  toneGuardResult: ToneGuardResult,
): EvalScenarioResult {
  const dimensionScores: EvalDimensionScore[] = judgeResponse.dimensions.map((d) => {
    const rubricKey = RUBRIC_DIMENSIONS.find((rd) => rd.label === d.dimension)?.key;
    return {
      dimension: d.dimension,
      score: d.score,
      weight: rubricKey ? (scenario.rubric[rubricKey] ?? 0) : 0,
      passed: d.passed,
      feedback: d.feedback,
    };
  });

  const weightedScore = computeWeightedScore(judgeResponse.dimensions, scenario.rubric);

  // Combine LLM judge score with tone guard score (80% judge, 20% guard)
  const combinedScore = Math.round(weightedScore * 0.8 + toneGuardResult.score * 0.2);

  const notes = [
    ...judgeResponse.expectedBehaviorResults
      .filter((b) => !b.present)
      .map((b) => `Missing: ${b.behavior}`),
    ...judgeResponse.forbiddenBehaviorResults
      .filter((b) => !b.absent)
      .map((b) => `Violation: ${b.behavior}`),
    ...judgeResponse.systemicIssues,
  ].join('; ');

  return {
    scenarioId: scenario.scenarioId,
    score: combinedScore,
    passed: combinedScore >= 70 && judgeResponse.overallPassed,
    response,
    dimensionScores,
    notes: notes || undefined,
  };
}

// ============================================
// Aggregation
// ============================================

/**
 * Aggregate individual scenario results into a run summary.
 */
export function aggregateResults(results: EvalScenarioResult[]): RunSummary {
  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.length - passCount;
  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  // Per-dimension averages
  const dimTotals: Record<string, { sum: number; count: number }> = {};
  for (const result of results) {
    for (const ds of result.dimensionScores) {
      if (!dimTotals[ds.dimension]) dimTotals[ds.dimension] = { sum: 0, count: 0 };
      dimTotals[ds.dimension].sum += ds.score;
      dimTotals[ds.dimension].count += 1;
    }
  }

  const scoreBreakdown: Record<string, number> = {};
  for (const [dim, totals] of Object.entries(dimTotals)) {
    scoreBreakdown[dim] = Math.round((totals.sum / totals.count) * 10) / 10;
  }

  // Collect systemic issues from failing scenarios
  const systemicIssues = results
    .filter((r) => !r.passed && r.notes)
    .flatMap((r) => r.notes!.split('; '));

  return {
    totalScenarios: results.length,
    passCount,
    failCount,
    averageScore,
    scoreBreakdown,
    systemicIssues: [...new Set(systemicIssues)],
  };
}
